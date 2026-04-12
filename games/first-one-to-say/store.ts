import { createInMemoryGameStore } from "@/games/shared/gameSessionStore";
import type { FirstOneToSayGameState } from "@/games/first-one-to-say/types";

const store = createInMemoryGameStore<FirstOneToSayGameState>();

export const saveGame = store.save;
export const getGameOrThrow = (gameId: string) =>
  store.getOrThrow(gameId, "No se encontro la partida.");
