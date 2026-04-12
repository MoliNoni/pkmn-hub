import type { TorrePokemonGameState } from "@/games/torre-pokemon/types";

export async function createTorrePokemonGame(): Promise<TorrePokemonGameState> {
  return {
    gameId: crypto.randomUUID(),
    game: "torre-pokemon-local",
  };
}
