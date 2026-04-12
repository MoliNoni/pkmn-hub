import type { QuienEsQuienGameState } from "@/games/quien-es-quien/types";

export async function createQuienEsQuienGame(): Promise<QuienEsQuienGameState> {
  return {
    gameId: crypto.randomUUID(),
    game: "quien-es-quien-local",
  };
}
