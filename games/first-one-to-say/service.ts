import type { FirstOneToSayGameState } from "@/games/first-one-to-say/types";

export async function createFirstOneToSayGame(): Promise<FirstOneToSayGameState> {
  return {
    gameId: crypto.randomUUID(),
    game: "first-one-to-say-local",
  };
}
