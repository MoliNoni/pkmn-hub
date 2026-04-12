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
export type ThemeEntityKind = "pokemon" | "item" | "move";
export type CoinSide = "cara" | "sello";
export type GameType = "mentiroso-local";

export type Pokemon = {
  id: number;
  name: string;
  types: string[];
  spriteUrl?: string;
};

export type ThemeNode = {
  id: string;
  inputDefinitions?: ThemeInputDefinition[];
  label: string;
  themeTemplateId?: string;
  children: ThemeNode[];
};

export type ThemeParams = Record<string, boolean | number | string>;

export type ThemeInputOption = {
  label: string;
  value: string;
};

export type ThemeInputDefinition = {
  key: string;
  label: string;
  max?: number;
  min?: number;
  options?: ThemeInputOption[];
  placeholder?: string;
  type: "number" | "select" | "text";
};

export type ActiveRoundTheme = {
  id: string;
  templateId: string;
  entityKind: ThemeEntityKind;
  categoryPath: string[];
  label: string;
  description: string;
  params: ThemeParams;
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
