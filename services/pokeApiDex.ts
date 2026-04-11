import {
  getAbilityNamesFromDataset,
  getDexEntryFromDataset,
  getPokemonNamesFromDataset,
  normalizeDatasetEntryName,
} from "@/services/localPokeApiDataset";
import type {
  DexEntryByKind,
  ItemDexEntry,
  MoveDexEntry,
  PokemonDexEntry,
} from "@/types/pokeApiDataset";
import type { ThemeEntityKind } from "@/types/types";

export type { ItemDexEntry, MoveDexEntry, PokemonDexEntry };

export async function getDexEntryByName<K extends ThemeEntityKind>(
  kind: K,
  name: string,
): Promise<DexEntryByKind[K] | null> {
  return getDexEntryFromDataset(kind, name);
}

export async function getAbilityNames(): Promise<string[]> {
  return getAbilityNamesFromDataset();
}

export async function getPokemonNames(): Promise<string[]> {
  return getPokemonNamesFromDataset();
}

export function sanitizeDexEntryNames(names: string[]): string[] {
  return [...new Set(names.map(normalizeDatasetEntryName).filter(Boolean))];
}

export function normalizeDexEntryName(name: string): string {
  return normalizeDatasetEntryName(name);
}
