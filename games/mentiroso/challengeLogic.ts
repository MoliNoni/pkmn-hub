import { getNextPlayerId, resolveLiarChallenge } from "@/core/gameEngine";
import { validateChallengeEntries } from "@/games/mentiroso/challengeEntryValidation";
import { validateThemeEntry } from "@/games/mentiroso/themeEngine";
import { createHistoryEntry } from "@/games/mentiroso/localGameHelpers";
import { getGameOrThrow, saveGame } from "@/games/mentiroso/localGameStore";
import { getDynamicPokemonFrequencyScore } from "@/services/pokemonService";
import type { GameState, ThemeEntityKind } from "@/types/types";

function getEntityLabel(entityKind: ThemeEntityKind): string {
  if (entityKind === "item") {
    return "item";
  }

  if (entityKind === "move") {
    return "movimiento";
  }

  return "Pokemon";
}

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

  if (!game.selectedTheme) {
    throw new Error("La ronda no tiene un tema activo.");
  }

  const entityLabel = getEntityLabel(game.selectedTheme.entityKind);
  const nextState: GameState = {
    ...game,
    status: "challenge-response",
    challenge: {
      challengerPlayerId: playerId,
      responderPlayerId: lastBid.playerId,
      requiredCount: lastBid.count,
      theme: game.selectedTheme,
      submittedEntries: [],
    },
    turn: {
      ...game.turn,
      phase: "challenge-response",
      currentPlayerId: lastBid.playerId,
    },
    history: [
      ...game.history,
      createHistoryEntry(
        `${game.players.find((player) => player.id === playerId)?.name ?? "Jugador"} canta Mentiroso. ${lastBid.playerName} debe escribir ${lastBid.count} ${entityLabel}(s) que cumplan: ${game.selectedTheme.label}.`,
      ),
    ],
  };

  saveGame(nextState);
  return nextState;
}

export async function submitChallengeResponse(params: {
  entries: string[];
  gameId: string;
  playerId: string;
}): Promise<GameState> {
  const game = getGameOrThrow(params.gameId);

  if (game.status !== "challenge-response" || !game.challenge) {
    throw new Error("No hay un desafio pendiente por resolver.");
  }

  if (game.challenge.responderPlayerId !== params.playerId) {
    throw new Error("Solo el jugador desafiado puede responder.");
  }

  const existingEntries = game.challenge.submittedEntries;
  const entityLabel = getEntityLabel(game.challenge.theme.entityKind);

  const cleanedEntries = await validateChallengeEntries({
    existingEntries,
    incomingEntries: params.entries,
    theme: game.challenge.theme,
  });

  if (!cleanedEntries.length) {
    throw new Error(`Debes escribir al menos un ${entityLabel} valido.`);
  }

  const lastBid = game.bids.at(-1);

  if (!lastBid) {
    throw new Error("No hay apuesta para resolver.");
  }

  const validationEntries = await Promise.all(
    cleanedEntries.map(async (entryName) => ({
      isValid: await validateThemeEntry(game.challenge!.theme, entryName),
      submittedName: entryName,
    })),
  );
  const invalidEntries = validationEntries
    .filter((entry) => !entry.isValid)
    .map((entry) => entry.submittedName);

  if (invalidEntries.length) {
    const roundResult = resolveLiarChallenge({
      challengerId: game.challenge.challengerPlayerId,
      lastBid,
      actualCount: existingEntries.length,
      selectedTheme: game.challenge.theme,
      submittedEntries: [...existingEntries, ...cleanedEntries],
      invalidEntries,
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
          `${game.players.find((player) => player.id === params.playerId)?.name ?? "Jugador"} ingreso ${entityLabel}(s) invalidos para el tema: ${invalidEntries.join(", ")}.`,
        ),
        createHistoryEntry(
          `${winner?.name ?? "Jugador"} gana el punto porque el reto se rompio con una respuesta invalida.`,
        ),
      ],
    };

    saveGame(failedState);
    return failedState;
  }

  const combinedEntries = [...existingEntries, ...cleanedEntries];

  if (combinedEntries.length > game.challenge.requiredCount) {
    throw new Error(
      `Te pasaste del limite. Llevas ${combinedEntries.length}/${game.challenge.requiredCount}.`,
    );
  }

  if (combinedEntries.length < game.challenge.requiredCount) {
    const pendingCount = game.challenge.requiredCount - combinedEntries.length;
    const partialState: GameState = {
      ...game,
      challenge: {
        ...game.challenge,
        submittedEntries: combinedEntries,
      },
      history: [
        ...game.history,
        createHistoryEntry(
          `${game.players.find((player) => player.id === params.playerId)?.name ?? "Jugador"} agrego ${cleanedEntries.length} ${entityLabel}(s). Va ${combinedEntries.length}/${game.challenge.requiredCount}. Faltan ${pendingCount}.`,
        ),
      ],
    };

    saveGame(partialState);
    return partialState;
  }

  const actualCount = combinedEntries.length;
  const roundResult = resolveLiarChallenge({
    challengerId: game.challenge.challengerPlayerId,
    lastBid,
    actualCount,
    selectedTheme: game.challenge.theme,
    submittedEntries: combinedEntries,
    invalidEntries: [],
  });
  const players = game.players.map((player) =>
    player.id === roundResult.pointAwardedTo
      ? { ...player, points: player.points + 1 }
      : player,
  );
  const winner = players.find((player) => player.id === roundResult.winnerPlayerId);
  const loser = players.find((player) => player.id === roundResult.loserPlayerId);
  const scoreHint = getDynamicPokemonFrequencyScore(lastBid.themeLabel);
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
    selectedTheme: game.challenge.theme,
    submittedEntries: [],
    invalidEntries: [],
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
