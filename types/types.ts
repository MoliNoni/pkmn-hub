export type Trainer = {
  id: string;
  name?: string;
};

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
