export function getNextPlayerId<TPlayer extends { id: string }>(
  players: TPlayer[],
  currentPlayerId: string,
): string {
  const currentIndex = players.findIndex((player) => player.id === currentPlayerId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % players.length;
  return players[nextIndex]?.id ?? currentPlayerId;
}
