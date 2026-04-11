import type { ThemeEntityKind } from "@/types/types";

export type PokemonDexEntry = {
  kind: "pokemon";
  id: number;
  name: string;
  displayName: string;
  spriteUrl?: string;
  types: string[];
  abilities: string[];
  hiddenAbilities: string[];
  generation: string;
  evolution: {
    chainId: number;
    speciesName: string;
    speciesInChain: string[];
    changesType: boolean;
    spansDifferentGenerations: boolean;
    hasAbilityVariation: boolean;
    hasMegaEvolution: boolean;
    hasBranchingEvolution: boolean;
    methods: {
      stone: boolean;
      trade: boolean;
      happiness: boolean;
      weather: boolean;
    };
  };
};

export type ItemDexEntry = {
  kind: "item";
  id: number;
  name: string;
  displayName: string;
  category: string;
  attributes: string[];
  effectText: string;
  heldByPokemonCount: number;
  isHpHealingItem: boolean;
  isPokeball: boolean;
  isEvolutionItem: boolean;
  machineMoveType: string | null;
};

export type MoveDexEntry = {
  kind: "move";
  id: number;
  name: string;
  displayName: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  learnedByPokemon: string[];
};

export type DexEntryByKind = {
  item: ItemDexEntry;
  move: MoveDexEntry;
  pokemon: PokemonDexEntry;
};

export type PokeApiRuntimeDataset = {
  generatedAt: string;
  source: string;
  abilityNames: string[];
  pokemonNames: string[];
  pokemonTypeIndex: Record<string, string[]>;
  entries: {
    item: Record<string, ItemDexEntry>;
    move: Record<string, MoveDexEntry>;
    pokemon: Record<string, PokemonDexEntry>;
  };
};

export type DexEntryKind = ThemeEntityKind;
