import { getPokemonByName, sanitizePokemonNames } from "@/services/pokemonService";

export async function validateClaim(
  items: string[],
  typeClaim: string,
): Promise<{ valid: boolean; invalidPokemons?: string[] }> {
  const cleanedItems = sanitizePokemonNames(items);
  const normalizedTypeClaim = typeClaim.trim().toLowerCase();

  if (!cleanedItems.length || !normalizedTypeClaim) {
    return {
      valid: false,
      invalidPokemons: cleanedItems,
    };
  }

  const pokemonEntries = await Promise.all(
    cleanedItems.map(async (item) => ({
      submittedName: item,
      pokemon: await getPokemonByName(item),
    })),
  );

  const invalidPokemons = pokemonEntries
    .filter(({ pokemon }) => {
      if (!pokemon) {
        return true;
      }

      return !pokemon.types.includes(normalizedTypeClaim);
    })
    .map(({ submittedName }) => submittedName);

  return {
    valid: invalidPokemons.length === 0,
    invalidPokemons: invalidPokemons.length ? invalidPokemons : undefined,
  };
}
