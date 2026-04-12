import { POKEMON_TYPES } from "@/types/types";
import type { ThemeInputDefinition, ThemeNode } from "@/types/types";
import type { ThemeCatalogInputNode } from "@/games/mentiroso/themes/types";
export const GENERATIONS = [
  "generation-i",
  "generation-ii",
  "generation-iii",
  "generation-iv",
  "generation-v",
  "generation-vi",
  "generation-vii",
  "generation-viii",
  "generation-ix",
] as const;
export const GENERATION_OPTIONS: ThemeInputDefinition["options"] = GENERATIONS.map(
  (generation) => ({
    label: formatDisplayName(generation),
    value: generation,
  }),
);
export const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
export const MOVE_POWER_THRESHOLDS = [40, 60, 80, 100];
export const MOVE_ACCURACY_THRESHOLDS = [70, 85, 100];
export const TYPE_EFFECTIVENESS: Record<string, Partial<Record<(typeof POKEMON_TYPES)[number], number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2, steel: 0.5, ice: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};
export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}
export function formatDisplayName(value: string): string {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
export function normalizeThemeId(themeId: string): string {
  return themeId.trim().toLowerCase();
}
export function getNodeLabel(path: string[], label: string): string {
  return [...path, label].join(" > ");
}
export function getPokemonBattleMultiplier(
  defenderTypes: string[],
  attackType: string,
): number {
  const normalizedAttackType = attackType.trim().toLowerCase() as (typeof POKEMON_TYPES)[number];
  const attackChart = TYPE_EFFECTIVENESS[normalizedAttackType] ?? {};
  return defenderTypes.reduce((multiplier, defenderType) => {
    const normalizedDefenderType = defenderType as (typeof POKEMON_TYPES)[number];
    return multiplier * (attackChart[normalizedDefenderType] ?? 1);
  }, 1);
}
export function buildSimpleThemeTree(input: ThemeCatalogInputNode[]): ThemeNode[] {
  return input.map((node) => ({
    id: node.id,
    inputDefinitions: node.inputDefinitions,
    label: node.label,
    themeTemplateId: node.themeTemplateId,
    children: buildSimpleThemeTree(node.children ?? []),
  }));
}
