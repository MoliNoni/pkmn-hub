export type Trainer = {
  id: string;
  name?: string;
};

export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];
export type CoinSide = "cara" | "sello";
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

export type Pokemon = {
  id: number;
  name: string;
  types: string[];
  spriteUrl?: string;
};

export type Claim = {
  game: string;
  playerId: string;
  items: string[];
  typeClaim?: string;
};

export type GameResult = {
  game: string;
  playerId: string;
  valid: boolean;
  checkedAt: string;
  items: string[];
  typeClaim?: string;
  invalidPokemons: string[];
  details: string;
};

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
  pokemonType: PokemonType;
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
  selectedThemeType: PokemonType;
  submittedPokemons?: string[];
  invalidPokemons?: string[];
  resolution: "liar-resolved" | "conceded";
};

export type ChallengeState = {
  challengerPlayerId: string;
  responderPlayerId: string;
  requiredCount: number;
  requiredType: PokemonType;
  submittedPokemons: string[];
  invalidPokemons?: string[];
};

export type GameState = {
  gameId: string;
  game: "mentiroso-local";
  status: GameStatus;
  players: Player[];
  turn: Turn;
  bids: Bid[];
  history: HistoryEntry[];
  coinFlipResult: CoinSide;
  coinFlipWinnerPlayerId: string;
  themeOptions: PokemonType[];
  selectedThemeType?: PokemonType;
  challenge?: ChallengeState;
  roundResult?: RoundResult;
};

export type LocalPlayerInput = {
  name: string;
  coinChoice: CoinSide;
};

export type InitLocalGamePayload = {
  action: "init";
  players: [LocalPlayerInput, LocalPlayerInput];
};

export type SelectThemePayload = {
  action: "select_theme";
  gameId: string;
  playerId: string;
  selectedThemeType: PokemonType;
};

export type SubmitBidPayload = {
  action: "bid";
  gameId: string;
  playerId: string;
  count: number;
  pokemonType: PokemonType;
};

export type CallLiarPayload = {
  action: "liar";
  gameId: string;
  playerId: string;
};

export type SubmitChallengeResponsePayload = {
  action: "submit_challenge_response";
  gameId: string;
  playerId: string;
  pokemons: string[];
};

export type ConcedeVictoryPayload = {
  action: "concede";
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
