export function createInMemoryGameStore<TState extends { gameId: string }>() {
  const games = new Map<string, TState>();

  return {
    get(gameId: string): TState | undefined {
      return games.get(gameId);
    },
    getOrThrow(gameId: string, notFoundMessage: string): TState {
      const game = games.get(gameId);

      if (!game) {
        throw new Error(notFoundMessage);
      }

      return game;
    },
    list(): TState[] {
      return [...games.values()];
    },
    save(gameState: TState): void {
      games.set(gameState.gameId, gameState);
    },
  };
}
