export type TorrePokemonGameState = {
  gameId: string;
  game: "torre-pokemon-local";
};

export type TorrePokemonTurnRequest = {
  gameType: "torre-pokemon-local";
  action: "init";
};
