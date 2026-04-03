import { getNextPlayerId, resolveLiarChallenge } from "@/core/gameEngine";
import {
  getDynamicPokemonFrequencyScore,
  getPokemonByName,
  sanitizePokemonNames,
} from "@/services/pokemonService";
import type { GameState } from "@/types/types";

import { createHistoryEntry } from "@/games/mentiroso/localGameHelpers";
import { getGameOrThrow, saveGame } from "@/games/mentiroso/localGameStore";

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

  saveGame(nextState);
  return nextState;
}

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

    saveGame(failedState);
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

    saveGame(partialState);
    return partialState;
  }

  const actualCount = combinedPokemons.length;
  const roundResult = resolveLiarChallenge({
    challengerId: game.challenge.challengerPlayerId,
    lastBid,
    actualCount,
    selectedThemeType: game.challenge.requiredType,
    submittedPokemons: combinedPokemons,
    invalidPokemons: [],
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

  saveGame(nextState);
  return nextState;
}

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

  saveGame(nextState);
  return nextState;
}
