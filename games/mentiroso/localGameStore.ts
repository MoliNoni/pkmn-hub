import type { GameState } from "@/types/types";

const localGames = new Map<string, GameState>();

export function saveGame(gameState: GameState): void {
  localGames.set(gameState.gameId, gameState);
}

export function getGameOrThrow(gameId: string): GameState {
  const game = localGames.get(gameId);

  if (!game) {
    throw new Error("No se encontro la partida local.");
  }

  return game;
}
