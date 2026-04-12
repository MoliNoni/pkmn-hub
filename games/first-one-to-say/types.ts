export type FirstOneToSayGameState = {
  gameId: string;
  game: "first-one-to-say-local";
};

export type FirstOneToSayTurnRequest = {
  gameType: "first-one-to-say-local";
  action: "init";
};
