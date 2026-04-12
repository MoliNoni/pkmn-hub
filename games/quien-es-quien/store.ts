import { createInMemoryGameStore } from "@/games/shared/gameSessionStore";
import type { QuienEsQuienGameState } from "@/games/quien-es-quien/types";

const store = createInMemoryGameStore<QuienEsQuienGameState>();

export const saveGame = store.save;
export const getGameOrThrow = (gameId: string) =>
  store.getOrThrow(gameId, "No se encontro la partida.");
