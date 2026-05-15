import type { GameType } from "@/games/shared/gameTypes";

export type GameActionRequest = {
  action: string;
  gameType: GameType;
};

export type GameStateLike = {
  game: GameType;
  gameId: string;
};

export type GameAvailability = "available" | "coming-soon";

export type GameMetadata = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  availability: GameAvailability;
  playPath?: string;
  sharedMechanics?: string[];
};

export type GameDefinition<
  TRequest extends GameActionRequest = GameActionRequest,
  TState extends GameStateLike = GameStateLike,
> = {
  gameType: TState["game"];
  handleAction(request: TRequest): Promise<TState>;
  isRequest(value: unknown): value is TRequest;
  metadata: GameMetadata;
};
