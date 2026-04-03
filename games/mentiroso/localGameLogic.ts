import {
  advanceSubastaTurn,
  assignTypeTheme,
  createInitialTurn,
  getNextPlayerId,
  initializePlayers,
  isBidGreaterThanPrevious,
  resolveCoinFlip,
  resolveLiarChallenge,
} from "@/core/gameEngine";
import {
  getDynamicPokemonFrequencyScore,
  getPokemonByName,
  sanitizePokemonNames,
} from "@/services/pokemonService";
import {
  POKEMON_TYPES,
  type Bid,
  type GameState,
  type HistoryEntry,
  type LocalPlayerInput,
  type Player,
  type PokemonType,
} from "@/types/types";

const localGames = new Map<string, GameState>();

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// Builds a history entry so UI and future persistence share the same shape.
function createHistoryEntry(message: string): HistoryEntry {
  return {
    id: createId("history"),
    message,
    createdAt: new Date().toISOString(),
  };
}

// Returns the current game state or throws a clear error if the game is missing.
function getGameOrThrow(gameId: string): GameState {
  const game = localGames.get(gameId);

  if (!game) {
    throw new Error("No se encontro la partida local.");
  }

  return game;
}

// Returns all available Pokemon types for the theme-selection step.
function getThemeCandidates(): PokemonType[] {
  return [...POKEMON_TYPES];
}

// Creates typed local players and delegates start selection to the core engine.
function buildPlayers(playerInputs: [LocalPlayerInput, LocalPlayerInput]): {
  players: Player[];
  startingPlayerId: string;
} {
  const normalizedPlayers = playerInputs.map((player, index) => ({
    id: `player-${index + 1}`,
    name: player.name.trim() || `Jugador ${index + 1}`,
    coinChoice: player.coinChoice,
  }));

  return initializePlayers(normalizedPlayers);
}

// Initializes a new local multiplayer match and resolves the opening coin flip.
export function createLocalMentirosoGame(
  playerInputs: [LocalPlayerInput, LocalPlayerInput],
): GameState {
  if (playerInputs[0].coinChoice === playerInputs[1].coinChoice) {
    throw new Error("Cada jugador debe elegir una cara distinta en la moneda.");
  }

  const gameId = createId("game");
  const { players, startingPlayerId } = buildPlayers(playerInputs);
  const { coinFlipResult, winnerPlayerId } = resolveCoinFlip(players);
  const turn = createInitialTurn(startingPlayerId);
  const themeOptions = getThemeCandidates();
  const coinFlipWinner = players.find((player) => player.id === winnerPlayerId);

  const gameState: GameState = {
    gameId,
    game: "mentiroso-local",
    status: "waiting-theme",
    players,
    turn: {
      ...turn,
      currentPlayerId: winnerPlayerId,
    },
    bids: [],
    history: [
      createHistoryEntry(
        `${players[0].name} y ${players[1].name} entraron a la partida.`,
      ),
      createHistoryEntry(
        `La moneda cayo en ${coinFlipResult}. ${coinFlipWinner?.name ?? "Jugador 1"} elige el tema.`,
      ),
    ],
    coinFlipResult,
    coinFlipWinnerPlayerId: winnerPlayerId,
    themeOptions,
  };

  localGames.set(gameId, gameState);
  return gameState;
}

// Lets the coin-flip winner pick the round theme before bidding begins.
export function selectRoundTheme(
  gameId: string,
  playerId: string,
  selectedThemeType: PokemonType,
): GameState {
  const game = getGameOrThrow(gameId);

  if (game.status !== "waiting-theme") {
    throw new Error("La ronda ya tiene tema asignado.");
  }

  if (game.coinFlipWinnerPlayerId !== playerId) {
    throw new Error("Solo quien gano la moneda puede elegir el tema.");
  }

  const { selectedThemeType: resolvedTheme } = assignTypeTheme(
    game.themeOptions,
    selectedThemeType,
  );
  const themePicker = game.players.find((player) => player.id === playerId);

  const nextState: GameState = {
    ...game,
    status: "in-progress",
    selectedThemeType: resolvedTheme,
    turn: {
      ...game.turn,
      phase: "bidding",
      currentPlayerId: game.turn.startingPlayerId,
    },
    history: [
      ...game.history,
      createHistoryEntry(
        `${themePicker?.name ?? "Jugador"} eligio el tema ${resolvedTheme}.`,
      ),
    ],
  };

  localGames.set(gameId, nextState);
  return nextState;
}

// Applies a new bid and enforces the strictly increasing auction rule.
export function submitBid(params: {
  gameId: string;
  playerId: string;
  count: number;
}): GameState {
  const game = getGameOrThrow(params.gameId);

  if (game.status !== "in-progress" || game.turn.phase !== "bidding") {
    throw new Error("La subasta no esta activa.");
  }

  if (game.turn.currentPlayerId !== params.playerId) {
    throw new Error("No es el turno de ese jugador.");
  }

  if (!Number.isInteger(params.count) || params.count <= 0) {
    throw new Error("La cantidad debe ser un entero positivo.");
  }

  if (!isBidGreaterThanPrevious(game.bids, { count: params.count })) {
    throw new Error("La nueva apuesta debe superar todas las anteriores.");
  }

  const currentPlayer = game.players.find((player) => player.id === params.playerId);

  const bid: Bid = {
    playerId: params.playerId,
    playerName: currentPlayer?.name ?? "Jugador",
    count: params.count,
    pokemonType: game.selectedThemeType ?? "normal",
    createdAt: new Date().toISOString(),
  };

  const nextState: GameState = {
    ...game,
    bids: [...game.bids, bid],
    turn: {
      ...advanceSubastaTurn(game.players, game.turn),
      highestBid: bid,
    },
    history: [
      ...game.history,
      createHistoryEntry(
        `${bid.playerName} dice: puedo decir ${bid.count} Pokemon de tipo ${bid.pokemonType}.`,
      ),
    ],
  };

  localGames.set(params.gameId, nextState);
  return nextState;
}

// Resolves a Liar! challenge using cached Pokemon counts from the shared service.
export async function callLiar(
  gameId: string,
  playerId: string,
): Promise<GameState> {
  const game = getGameOrThrow(gameId);

  if (game.status !== "in-progress" || game.turn.phase !== "bidding") {
    throw new Error("No se puede cantar Mentiroso ahora.");
  }

  if (game.turn.currentPlayerId !== playerId) {
    throw new Error("Solo el jugador del turno actual puede desafiar.");
  }

  const lastBid = game.bids.at(-1);

  if (!lastBid) {
    throw new Error("Todavia no hay apuesta para desafiar.");
  }

  const nextState: GameState = {
    ...game,
    status: "challenge-response",
    challenge: {
      challengerPlayerId: playerId,
      responderPlayerId: lastBid.playerId,
      requiredCount: lastBid.count,
      requiredType: game.selectedThemeType ?? lastBid.pokemonType,
      submittedPokemons: [],
    },
    turn: {
      ...game.turn,
      phase: "challenge-response",
      currentPlayerId: lastBid.playerId,
    },
    history: [
      ...game.history,
      createHistoryEntry(
        `${game.players.find((player) => player.id === playerId)?.name ?? "Jugador"} canta Mentiroso. ${lastBid.playerName} debe escribir ${lastBid.count} Pokemon tipo ${game.selectedThemeType ?? lastBid.pokemonType}.`,
      ),
    ],
  };

  localGames.set(gameId, nextState);
  return nextState;
}

// Resolves the challenge once the responder submits the required Pokemon list.
export async function submitChallengeResponse(params: {
  gameId: string;
  playerId: string;
  pokemons: string[];
}): Promise<GameState> {
  const game = getGameOrThrow(params.gameId);

  if (game.status !== "challenge-response" || !game.challenge) {
    throw new Error("No hay un desafio pendiente por resolver.");
  }

  if (game.challenge.responderPlayerId !== params.playerId) {
    throw new Error("Solo el jugador desafiado puede responder.");
  }

  const cleanedPokemons = sanitizePokemonNames(params.pokemons);
  const existingPokemons = game.challenge.submittedPokemons;

  if (!cleanedPokemons.length) {
    throw new Error("Debes escribir al menos un Pokemon valido.");
  }

  const incomingPokemonEntries = await Promise.all(
    cleanedPokemons.map(async (pokemonName) => ({
      submittedName: pokemonName,
      pokemon: await getPokemonByName(pokemonName),
    })),
  );
  const unrecognizedPokemons = incomingPokemonEntries
    .filter(({ pokemon }) => !pokemon)
    .map(({ submittedName }) => submittedName);
  const lastBid = game.bids.at(-1);

  if (!lastBid) {
    throw new Error("No hay apuesta para resolver.");
  }

  if (unrecognizedPokemons.length) {
    throw new Error(
      `Entrada no reconocida: ${unrecognizedPokemons.join(", ")}.`,
    );
  }

  const wrongTypePokemons = incomingPokemonEntries
    .filter(
      ({ pokemon }) =>
        pokemon !== null &&
        !pokemon.types.includes(game.challenge.requiredType),
    )
    .map(({ submittedName }) => submittedName);

  if (wrongTypePokemons.length) {
    const roundResult = resolveLiarChallenge({
      challengerId: game.challenge.challengerPlayerId,
      lastBid,
      actualCount: existingPokemons.length,
      selectedThemeType: game.challenge.requiredType,
      submittedPokemons: [...existingPokemons, ...cleanedPokemons],
      invalidPokemons: wrongTypePokemons,
    });

    const players = game.players.map((player) =>
      player.id === roundResult.pointAwardedTo
        ? { ...player, points: player.points + 1 }
        : player,
    );

    const winner = players.find(
      (player) => player.id === roundResult.winnerPlayerId,
    );

    const failedState: GameState = {
      ...game,
      status: "round-ended",
      players,
      challenge: undefined,
      roundResult,
      turn: {
        ...game.turn,
        phase: "round-ended",
      },
      history: [
        ...game.history,
        createHistoryEntry(
          `${game.players.find((player) => player.id === params.playerId)?.name ?? "Jugador"} ingreso Pokemon fuera del tipo requerido: ${wrongTypePokemons.join(", ")}.`,
        ),
        createHistoryEntry(
          `${winner?.name ?? "Jugador"} gana el punto porque el reto se rompio por un Pokemon fuera del tipo.`,
        ),
      ],
    };

    localGames.set(params.gameId, failedState);
    return failedState;
  }

  const combinedPokemons = sanitizePokemonNames([
    ...existingPokemons,
    ...cleanedPokemons,
  ]);

  if (combinedPokemons.length > game.challenge.requiredCount) {
    throw new Error(
      `Te pasaste del limite. Llevas ${combinedPokemons.length}/${game.challenge.requiredCount}.`,
    );
  }

  if (combinedPokemons.length < game.challenge.requiredCount) {
    const pendingCount = game.challenge.requiredCount - combinedPokemons.length;
    const partialState: GameState = {
      ...game,
      challenge: {
        ...game.challenge,
        submittedPokemons: combinedPokemons,
      },
      history: [
        ...game.history,
        createHistoryEntry(
          `${game.players.find((player) => player.id === params.playerId)?.name ?? "Jugador"} agrego ${cleanedPokemons.length} Pokemon. Va ${combinedPokemons.length}/${game.challenge.requiredCount}. Faltan ${pendingCount}.`,
        ),
      ],
    };

    localGames.set(params.gameId, partialState);
    return partialState;
  }

  const invalidPokemons: string[] = [];
  const actualCount = combinedPokemons.length;

  const roundResult = resolveLiarChallenge({
    challengerId: game.challenge.challengerPlayerId,
    lastBid,
    actualCount,
    selectedThemeType: game.challenge.requiredType,
    submittedPokemons: combinedPokemons,
    invalidPokemons,
  });

  const players = game.players.map((player) =>
    player.id === roundResult.pointAwardedTo
      ? { ...player, points: player.points + 1 }
      : player,
  );

  const winner = players.find((player) => player.id === roundResult.winnerPlayerId);
  const loser = players.find((player) => player.id === roundResult.loserPlayerId);
  const scoreHint = getDynamicPokemonFrequencyScore(lastBid.pokemonType);

  const nextState: GameState = {
    ...game,
    status: "round-ended",
    players,
    challenge: undefined,
    roundResult,
    turn: {
      ...game.turn,
      phase: "round-ended",
      currentPlayerId: getNextPlayerId(players, loser?.id ?? params.playerId),
    },
    history: [
      ...game.history,
      createHistoryEntry(
        `${winner?.name ?? "Jugador"} gana el punto. ${loser?.name ?? "Jugador"} pierde el desafio.`,
      ),
      createHistoryEntry(
        `Respuesta valida: ${actualCount}/${game.challenge.requiredCount}. Placeholder score: ${scoreHint}.`,
      ),
    ],
  };

  localGames.set(params.gameId, nextState);
  return nextState;
}

// Allows the challenged player to concede the round immediately.
export function concedeVictory(params: {
  gameId: string;
  playerId: string;
}): GameState {
  const game = getGameOrThrow(params.gameId);

  if (game.status !== "challenge-response" || !game.challenge) {
    throw new Error("No hay un desafio activo para conceder.");
  }

  if (game.challenge.responderPlayerId !== params.playerId) {
    throw new Error("Solo el jugador desafiado puede conceder.");
  }

  const lastBid = game.bids.at(-1);

  if (!lastBid) {
    throw new Error("No hay apuesta para resolver.");
  }

  const roundResult = resolveLiarChallenge({
    challengerId: game.challenge.challengerPlayerId,
    lastBid,
    actualCount: 0,
    selectedThemeType: game.challenge.requiredType,
    submittedPokemons: [],
    invalidPokemons: [],
    resolution: "conceded",
  });

  const players = game.players.map((player) =>
    player.id === roundResult.pointAwardedTo
      ? { ...player, points: player.points + 1 }
      : player,
  );

  const winner = players.find((player) => player.id === roundResult.winnerPlayerId);

  const nextState: GameState = {
    ...game,
    status: "round-ended",
    players,
    challenge: undefined,
    roundResult,
    turn: {
      ...game.turn,
      phase: "round-ended",
    },
    history: [
      ...game.history,
      createHistoryEntry(
        `${game.players.find((player) => player.id === params.playerId)?.name ?? "Jugador"} concede la ronda. ${winner?.name ?? "Jugador"} gana el punto.`,
      ),
    ],
  };

  localGames.set(params.gameId, nextState);
  return nextState;
}
