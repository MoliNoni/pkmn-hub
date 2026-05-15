export const GAME_TYPES = [
  "mentiroso-local",
  "first-one-to-say-local",
  "torre-pokemon-local",
  "quien-es-quien-local",
] as const;

export type GameType = (typeof GAME_TYPES)[number];

