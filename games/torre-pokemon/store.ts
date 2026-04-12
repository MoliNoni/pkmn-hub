import { createInMemoryGameStore } from "@/games/shared/gameSessionStore";
import type { TorrePokemonGameState } from "@/games/torre-pokemon/types";

const store = createInMemoryGameStore<TorrePokemonGameState>();

export const saveGame = store.save;
export const getGameOrThrow = (gameId: string) =>
  store.getOrThrow(gameId, "No se encontro la partida.");
