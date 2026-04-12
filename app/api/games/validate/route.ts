import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { validateGameMove } from "@/core/gameValidation";
import type { Claim, GameResult } from "@/types/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

type ValidateGameRequest = {
  game: string;
  playerId: string;
  items: string[];
  typeClaim?: string;
};

function isValidateGameRequest(value: unknown): value is ValidateGameRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.game === "string" &&
    typeof payload.playerId === "string" &&
    Array.isArray(payload.items) &&
    payload.items.every((item) => typeof item === "string") &&
    (payload.typeClaim === undefined || typeof payload.typeClaim === "string")
  );
}

async function logGameResult(payload: Claim, result: GameResult): Promise<void> {
  if (!supabaseUrl || !supabaseKey) {
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase.from("game_logs").insert({
    game: payload.game,
    player_id: payload.playerId,
    move_payload: {
      items: payload.items,
      typeClaim: payload.typeClaim,
    },
    result,
  });

  if (error) {
    console.error("Supabase log insert failed:", error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isValidateGameRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const payload: Claim = {
      game: body.game,
      playerId: body.playerId,
      items: body.items,
      typeClaim: body.typeClaim,
    };

    const result = await validateGameMove(body.game, payload);
    await logGameResult(payload, result);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
