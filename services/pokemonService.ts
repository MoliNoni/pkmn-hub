import type { Pokemon } from "@/types/types";

type PokeApiTypeEntry = {
  type: {
    name: string;
  };
};

type PokeApiPokemonResponse = {
  id: number;
  name: string;
  sprites?: {
    front_default?: string | null;
  };
  types: PokeApiTypeEntry[];
};

const pokemonCache = new Map<string, Pokemon | null>();

const normalizePokemonName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, "-");

export async function getPokemonByName(
  name: string,
): Promise<Pokemon | null> {
  const normalizedName = normalizePokemonName(name);

  if (!normalizedName) {
    return null;
  }

  if (pokemonCache.has(normalizedName)) {
    return pokemonCache.get(normalizedName) ?? null;
  }

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${normalizedName}`,
      {
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!response.ok) {
      pokemonCache.set(normalizedName, null);
      return null;
    }

    const data = (await response.json()) as PokeApiPokemonResponse;
    const pokemon: Pokemon = {
      id: data.id,
      name: data.name,
      types: data.types.map((entry) => entry.type.name),
      spriteUrl: data.sprites?.front_default ?? undefined,
    };

    pokemonCache.set(normalizedName, pokemon);
    return pokemon;
  } catch {
    pokemonCache.set(normalizedName, null);
    return null;
  }
}

export async function getPokemonsByName(names: string[]): Promise<Pokemon[]> {
  const uniqueNames = [...new Set(names.map(normalizePokemonName))].filter(
    Boolean,
  );

  const pokemons = await Promise.all(uniqueNames.map(getPokemonByName));

  return pokemons.filter((pokemon): pokemon is Pokemon => pokemon !== null);
}

export function sanitizePokemonNames(names: string[]): string[] {
  return names
    .map((name) => name.trim())
    .filter((name, index, array) => Boolean(name) && array.indexOf(name) === index);
}
