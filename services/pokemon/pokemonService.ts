import {
  getDexEntryFromDataset,
  getPokemonNamesByTypeFromDataset,
} from "@/services/pokemon/localPokeApiDataset";
import type { Pokemon, PokemonType } from "@/types/types";

const normalizePokemonName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, "-");

export async function getPokemonByName(
  name: string,
): Promise<Pokemon | null> {
  const pokemon = getDexEntryFromDataset("pokemon", name);

  if (!pokemon) {
    return null;
  }

  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types,
    spriteUrl: pokemon.spriteUrl,
  };
}

export async function getPokemonsByType(type: PokemonType): Promise<string[]> {
  return getPokemonNamesByTypeFromDataset(type);
}

export async function getPokemonCountByType(type: PokemonType): Promise<number> {
  return (await getPokemonsByType(type)).length;
}

export async function getPokemonsByName(names: string[]): Promise<Pokemon[]> {
  const uniqueNames = [...new Set(names.map(normalizePokemonName))].filter(
    Boolean,
  );

  return uniqueNames
    .map((name) => getDexEntryFromDataset("pokemon", name))
    .filter((pokemon): pokemon is NonNullable<typeof pokemon> => pokemon !== null)
    .map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types,
      spriteUrl: pokemon.spriteUrl,
    }));
}

export function getDynamicPokemonFrequencyScore(pokemonName: string): number {
  void pokemonName;
  return 1;
}

export function sanitizePokemonNames(names: string[]): string[] {
  return names
    .map((name) => name.trim())
    .filter(
      (name, index, array) => Boolean(name) && array.indexOf(name) === index,
    );
}
