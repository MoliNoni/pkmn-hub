import { createInMemoryGameStore } from "@/games/shared/gameSessionStore";
import type { GameState } from "@/games/mentiroso/types";

const localGameStore = createInMemoryGameStore<GameState>();

export function saveGame(gameState: GameState): void {
  localGameStore.save(gameState);
}

export function getGameOrThrow(gameId: string): GameState {
  return localGameStore.getOrThrow(gameId, "No se encontro la partida local.");
}
