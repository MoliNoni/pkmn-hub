/**
 * Responsibilities:
 * - Encapsulate every HTTP call used by the local Mentiroso UI.
 * - Keep the request/response contract with `/api/games/turn` in one place.
 * - Expose semantic methods (`createGame`, `selectTheme`, `submitBid`, etc.)
 *   so the UI does not depend on raw payload shapes or endpoint details.
 *
 * Move to another module if needed:
 * - If local and online modes start sharing transport concerns, extract a
 *   generic game client base plus per-mode adapters.
 * - If authentication, retries, telemetry, or websocket fallbacks are added,
 *   those cross-cutting concerns should live in a shared networking layer.
 */

import type {
  GameState,
  LocalPlayerInput,
} from "@/games/mentiroso/types";
import type { ThemeParams } from "@/types/types";

async function sendLocalTurnRequest(body: unknown): Promise<GameState> {
  const response = await fetch("/api/games/turn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gameType: "mentiroso-local",
      ...((body as Record<string, unknown>) ?? {}),
    }),
  });

  const data = (await response.json()) as GameState | { error: string };

  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "Request failed.");
  }

  return data;
}

export const localTurnClient = {
  async callLiar(gameId: string, playerId: string): Promise<GameState> {
    return sendLocalTurnRequest({
      action: "liar",
      gameId,
      playerId,
    });
  },

  async concede(gameId: string, playerId: string): Promise<GameState> {
    return sendLocalTurnRequest({
      action: "concede",
      gameId,
      playerId,
    });
  },

  async createGame(
    players: [LocalPlayerInput, LocalPlayerInput],
  ): Promise<GameState> {
    return sendLocalTurnRequest({
      action: "init",
      players,
    });
  },

  async selectTheme(params: {
    gameId: string;
    playerId: string;
    selectedThemeId: string;
    selectedThemeParams: ThemeParams;
  }): Promise<GameState> {
    return sendLocalTurnRequest({
      action: "select_theme",
      ...params,
    });
  },

  async submitBid(params: {
    count: number;
    gameId: string;
    playerId: string;
  }): Promise<GameState> {
    return sendLocalTurnRequest({
      action: "bid",
      ...params,
    });
  },

  async submitChallengeResponse(params: {
    entries: string[];
    gameId: string;
    playerId: string;
  }): Promise<GameState> {
    return sendLocalTurnRequest({
      action: "submit_challenge_response",
      ...params,
    });
  },
};
