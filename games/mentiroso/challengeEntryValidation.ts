/**
 * Responsibilities:
 * - Validate incoming challenge entries before theme-rule matching runs.
 * - Enforce cross-theme constraints such as duplicate answers and, for
 *   Pokémon themes, repeated evolution lines.
 * - Centralize response-validation rules so challenge flow remains readable.
 *
 * Move to another module if needed:
 * - If online mode adds server-authoritative validation, this module can
 *   become a shared domain validator used by both local and online handlers.
 * - If different games introduce distinct answer constraints, split the
 *   generic duplicate checks from Pokémon-specific validators.
 */

import { getDexEntryByName, normalizeDexEntryName } from "@/services/pokeApiDex";
import type { ActiveRoundTheme } from "@/types/types";

function formatEntryName(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export async function validateChallengeEntries(params: {
  existingEntries: string[];
  incomingEntries: string[];
  theme: ActiveRoundTheme;
}): Promise<string[]> {
  const normalizedIncomingEntries = params.incomingEntries
    .map(normalizeDexEntryName)
    .filter(Boolean);

  if (!normalizedIncomingEntries.length) {
    return [];
  }

  const seenEntries = new Set(params.existingEntries.map(normalizeDexEntryName));

  for (const entryName of normalizedIncomingEntries) {
    if (seenEntries.has(entryName)) {
      throw new Error(`Ya has dicho ${formatEntryName(entryName)}.`);
    }

    seenEntries.add(entryName);
  }

  if (params.theme.entityKind !== "pokemon") {
    return normalizedIncomingEntries;
  }

  const seenEvolutionLines = new Map<number, string>();

  for (const existingEntry of params.existingEntries) {
    const pokemon = await getDexEntryByName("pokemon", existingEntry);

    if (pokemon) {
      seenEvolutionLines.set(pokemon.evolution.chainId, pokemon.displayName);
    }
  }

  for (const entryName of normalizedIncomingEntries) {
    const pokemon = await getDexEntryByName("pokemon", entryName);

    if (!pokemon) {
      continue;
    }

    const repeatedLineReference = seenEvolutionLines.get(pokemon.evolution.chainId);

    if (repeatedLineReference) {
      throw new Error(
        `Ya has mencionado un pokémon de la línea evolutiva de ${repeatedLineReference}.`,
      );
    }

    seenEvolutionLines.set(pokemon.evolution.chainId, pokemon.displayName);
  }

  return normalizedIncomingEntries;
}
