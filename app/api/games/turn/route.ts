import { NextResponse } from "next/server";

import {
  callLiar,
  concedeVictory,
  createLocalMentirosoGame,
  selectRoundTheme,
  submitChallengeResponse,
  submitBid,
} from "@/games/mentiroso/localGameLogic";
import type { LocalTurnRequest } from "@/types/types";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

// Validates the shape of the turn-route payload before dispatching it.
function isLocalTurnRequest(body: unknown): body is LocalTurnRequest {
  if (!isObject(body) || typeof body.action !== "string") {
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

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isLocalTurnRequest(body)) {
      return NextResponse.json({ error: "Invalid turn payload." }, { status: 400 });
    }

    if (body.action === "init") {
      const gameState = createLocalMentirosoGame(body.players);
      return NextResponse.json(gameState);
    }

    if (body.action === "select_theme") {
      const gameState = await selectRoundTheme(
        body.gameId,
        body.playerId,
        body.selectedThemeId,
        body.selectedThemeParams,
      );
      return NextResponse.json(gameState);
    }

    if (body.action === "bid") {
      const gameState = submitBid({
        gameId: body.gameId,
        playerId: body.playerId,
        count: body.count,
      });

      return NextResponse.json(gameState);
    }

    if (body.action === "submit_challenge_response") {
      const gameState = await submitChallengeResponse({
        gameId: body.gameId,
        playerId: body.playerId,
        entries: body.entries,
      });

      return NextResponse.json(gameState);
    }

    if (body.action === "concede") {
      const gameState = concedeVictory({
        gameId: body.gameId,
        playerId: body.playerId,
      });

      return NextResponse.json(gameState);
    }

    const gameState = await callLiar(body.gameId, body.playerId);
    return NextResponse.json(gameState);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected turn error.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
