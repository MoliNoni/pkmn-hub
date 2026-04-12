import { NextResponse } from "next/server";

import { getGameDefinition, getRegisteredGameTypes } from "@/games/registry";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isObject(body) || typeof body.gameType !== "string") {
      return NextResponse.json(
        {
          error:
            "Invalid turn payload. Expected a gameType field in the request body.",
        },
        { status: 400 },
      );
    }

    const gameDefinition = getGameDefinition(body.gameType);

    if (!gameDefinition) {
      return NextResponse.json(
        {
          error: `Unsupported gameType: ${body.gameType}. Registered modes: ${getRegisteredGameTypes().join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!gameDefinition.isRequest(body)) {
      return NextResponse.json({ error: "Invalid turn payload." }, { status: 400 });
    }

    const gameState = await gameDefinition.handleAction(body);
    return NextResponse.json(gameState);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected turn error.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
