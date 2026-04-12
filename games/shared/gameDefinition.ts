export type GameActionRequest = {
  action: string;
  gameType: string;
};

export type GameStateLike = {
  game: string;
  gameId: string;
};

export type GameDefinition<
  TRequest extends GameActionRequest = GameActionRequest,
  TState extends GameStateLike = GameStateLike,
> = {
  gameType: TState["game"];
  handleAction: (request: TRequest) => Promise<TState>;
  isRequest: (value: unknown) => value is TRequest;
};
