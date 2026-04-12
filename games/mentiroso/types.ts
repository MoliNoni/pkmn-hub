import type {
  ActiveRoundTheme,
  CoinSide,
  GameType,
  ThemeNode,
  ThemeParams,
} from "@/types/types";

export type TurnPhase =
  | "setup"
  | "theme-selection"
  | "bidding"
  | "challenge-response"
  | "round-ended";

export type GameStatus =
  | "waiting-theme"
  | "in-progress"
  | "challenge-response"
  | "round-ended";

export type Player = {
  id: string;
  name: string;
  points: number;
  coinChoice: CoinSide;
  isStartingPlayer: boolean;
};

export type Bid = {
  playerId: string;
  playerName: string;
  count: number;
  themeLabel: string;
  createdAt: string;
};

export type Turn = {
  roundNumber: number;
  phase: TurnPhase;
  currentPlayerId: string;
  startingPlayerId: string;
  highestBid?: Bid;
};

export type HistoryEntry = {
  id: string;
  message: string;
  createdAt: string;
};

export type RoundResult = {
  winnerPlayerId: string;
  loserPlayerId: string;
  challengedBid: Bid;
  actualCount: number;
  wasLiarCallSuccessful: boolean;
  pointAwardedTo: string;
  selectedTheme: ActiveRoundTheme;
  submittedEntries?: string[];
  invalidEntries?: string[];
  resolution: "liar-resolved" | "conceded";
};

export type ChallengeState = {
  challengerPlayerId: string;
  responderPlayerId: string;
  requiredCount: number;
  theme: ActiveRoundTheme;
  submittedEntries: string[];
  invalidEntries?: string[];
};

export type GameState = {
  gameId: string;
  game: GameType;
  status: GameStatus;
  players: Player[];
  turn: Turn;
  bids: Bid[];
  history: HistoryEntry[];
  coinFlipResult: CoinSide;
  coinFlipWinnerPlayerId: string;
  themeOptions: ThemeNode[];
  selectedTheme?: ActiveRoundTheme;
  challenge?: ChallengeState;
  roundResult?: RoundResult;
};

export type LocalPlayerInput = {
  name: string;
  coinChoice: CoinSide;
};

export type InitLocalGamePayload = {
  action: "init";
  gameType: "mentiroso-local";
  players: [LocalPlayerInput, LocalPlayerInput];
};

export type SelectThemePayload = {
  action: "select_theme";
  gameType: "mentiroso-local";
  gameId: string;
  playerId: string;
  selectedThemeId: string;
  selectedThemeParams?: ThemeParams;
};

export type SubmitBidPayload = {
  action: "bid";
  gameType: "mentiroso-local";
  gameId: string;
  playerId: string;
  count: number;
};

export type CallLiarPayload = {
  action: "liar";
  gameType: "mentiroso-local";
  gameId: string;
  playerId: string;
};

export type SubmitChallengeResponsePayload = {
  action: "submit_challenge_response";
  gameType: "mentiroso-local";
  gameId: string;
  playerId: string;
  entries: string[];
};

export type ConcedeVictoryPayload = {
  action: "concede";
  gameType: "mentiroso-local";
  gameId: string;
  playerId: string;
};

export type LocalTurnRequest =
  | InitLocalGamePayload
  | SelectThemePayload
  | SubmitBidPayload
  | CallLiarPayload
  | SubmitChallengeResponsePayload
  | ConcedeVictoryPayload;
