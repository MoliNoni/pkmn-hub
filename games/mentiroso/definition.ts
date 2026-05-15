import {
  callLiar,
  concedeVictory,
  createLocalMentirosoGame,
  selectRoundTheme,
  submitChallengeResponse,
  submitBid,
} from "@/games/mentiroso/localGameLogic";
import type { GameDefinition } from "@/games/shared/gameDefinition";
import type { GameState, LocalTurnRequest } from "@/games/mentiroso/types";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isLocalTurnRequest(body: unknown): body is LocalTurnRequest {
  if (
    !isObject(body) ||
    body.gameType !== "mentiroso-local" ||
    typeof body.action !== "string"
  ) {
    return false;
  }

  if (body.action === "init") {
    return (
      Array.isArray(body.players) &&
      body.players.length === 2 &&
      body.players.every(
        (player) =>
          isObject(player) &&
          typeof player.name === "string" &&
          (player.coinChoice === "cara" || player.coinChoice === "sello"),
      )
    );
  }

  if (body.action === "select_theme") {
    return (
      typeof body.gameId === "string" &&
      typeof body.playerId === "string" &&
      typeof body.selectedThemeId === "string" &&
      (body.selectedThemeParams === undefined || isObject(body.selectedThemeParams))
    );
  }

  if (body.action === "bid") {
    return (
      typeof body.gameId === "string" &&
      typeof body.playerId === "string" &&
      typeof body.count === "number"
    );
  }

  if (body.action === "liar") {
    return typeof body.gameId === "string" && typeof body.playerId === "string";
  }

  if (body.action === "submit_challenge_response") {
    return (
      typeof body.gameId === "string" &&
      typeof body.playerId === "string" &&
      Array.isArray(body.entries) &&
      body.entries.every((entry) => typeof entry === "string")
    );
  }

  if (body.action === "concede") {
    return typeof body.gameId === "string" && typeof body.playerId === "string";
  }

  return false;
}

async function handleLocalTurnRequest(body: LocalTurnRequest): Promise<GameState> {
  if (body.action === "init") {
    return createLocalMentirosoGame(body.players);
  }

  if (body.action === "select_theme") {
    return selectRoundTheme(
      body.gameId,
      body.playerId,
      body.selectedThemeId,
      body.selectedThemeParams,
    );
  }

  if (body.action === "bid") {
    return submitBid({
      gameId: body.gameId,
      playerId: body.playerId,
      count: body.count,
    });
  }

  if (body.action === "submit_challenge_response") {
    return submitChallengeResponse({
      gameId: body.gameId,
      playerId: body.playerId,
      entries: body.entries,
    });
  }

  if (body.action === "concede") {
    return Promise.resolve(
      concedeVictory({
        gameId: body.gameId,
        playerId: body.playerId,
      }),
    );
  }

  return callLiar(body.gameId, body.playerId);
}

export const mentirosoGameDefinition: GameDefinition<LocalTurnRequest, GameState> = {
  gameType: "mentiroso-local",
  handleAction: handleLocalTurnRequest,
  isRequest: isLocalTurnRequest,
  metadata: {
    id: "mentiroso",
    title: "Mentiroso Pokemon",
    shortTitle: "Mentiroso",
    description:
      "Juego local de bluff donde cada jugador sube la apuesta sobre cuantos Pokemon, items o movimientos cumplen un criterio.",
    availability: "available",
    playPath: "/games/mentiroso",
    sharedMechanics: ["theme-criteria", "pokemon-answer-validation"],
  },
};
