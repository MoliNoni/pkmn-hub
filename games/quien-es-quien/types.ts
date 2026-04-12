export type QuienEsQuienGameState = {
  gameId: string;
  game: "quien-es-quien-local";
};

export type QuienEsQuienTurnRequest = {
  gameType: "quien-es-quien-local";
  action: "init";
};
