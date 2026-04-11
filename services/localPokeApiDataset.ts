import dataset from "@/data/pokeapi-runtime.json";
import type {
  DexEntryByKind,
  DexEntryKind,
  PokeApiRuntimeDataset,
} from "@/types/pokeApiDataset";

const runtimeDataset = dataset as PokeApiRuntimeDataset;

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function normalizeDatasetEntryName(name: string): string {
  return normalizeName(name);
}

export function getDatasetMetadata() {
  return {
    generatedAt: runtimeDataset.generatedAt,
    source: runtimeDataset.source,
  };
}

export function getDexEntryFromDataset<K extends DexEntryKind>(
  kind: K,
  name: string,
): DexEntryByKind[K] | null {
  const normalized = normalizeName(name);

  if (!normalized) {
    return null;
  }

  return runtimeDataset.entries[kind][normalized] as DexEntryByKind[K] | null;
}

export function getAbilityNamesFromDataset(): string[] {
  return runtimeDataset.abilityNames;
}

export function getPokemonNamesFromDataset(): string[] {
  return runtimeDataset.pokemonNames;
}

export function getPokemonNamesByTypeFromDataset(type: string): string[] {
  const normalizedType = normalizeName(type);
  return runtimeDataset.pokemonTypeIndex[normalizedType] ?? [];
}
