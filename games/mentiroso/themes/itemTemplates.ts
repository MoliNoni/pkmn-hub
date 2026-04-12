import { POKEMON_TYPES } from "@/types/types";

import { getDexEntryByName } from "@/services/pokemon/pokeApiDex";
import {
  LETTERS,
  formatDisplayName,
  pickRandom,
} from "@/games/mentiroso/themes/helpers";
import type { ThemeTemplate } from "@/games/mentiroso/themes/types";

export const itemTemplates: ThemeTemplate[] = [
  {
    id: "item-hp-healing",
    label: "Objeto de curacion de PS",
    entityKind: "item",
    path: ["Item"],
    instantiate: async () => ({
      label: "Items que curan PS",
      description: "Items cuyo efecto incluye recuperacion de PS.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("item", entryName))?.isHpHealingItem ?? false,
  },
  {
    id: "item-wild-held",
    label: "Lo tienen pokemon salvajes",
    entityKind: "item",
    path: ["Item"],
    instantiate: async () => ({
      label: "Items que pueden tener Pokemon salvajes",
      description: "Items que aparecen como held items de Pokemon salvajes en PokeAPI.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      ((await getDexEntryByName("item", entryName))?.heldByPokemonCount ?? 0) > 0,
  },
  {
    id: "item-name",
    label: "Nombre",
    entityKind: "item",
    path: ["Item"],
    instantiate: async () => {
      const letter = pickRandom(LETTERS);

      return {
        label: `Items cuyo nombre contiene ${letter.toUpperCase()}`,
        description: `Items cuyo nombre contiene la letra ${letter.toUpperCase()}.`,
        params: { letter },
      };
    },
    matches: async (theme, entryName) =>
      Boolean(
        (await getDexEntryByName("item", entryName))?.name.includes(
          String(theme.params.letter),
        ),
      ),
  },
  {
    id: "item-pokeball",
    label: "Pokeball",
    entityKind: "item",
    path: ["Item"],
    instantiate: async () => ({
      label: "Pokeballs",
      description: "Items que pertenecen a la categoria de poke-balls.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("item", entryName))?.isPokeball ?? false,
  },
  {
    id: "item-evolution",
    label: "Item evolutivo",
    entityKind: "item",
    path: ["Item"],
    instantiate: async () => ({
      label: "Items evolutivos",
      description: "Items relacionados directamente con una evolucion.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("item", entryName))?.isEvolutionItem ?? false,
  },
  {
    id: "item-tm-type",
    label: "Tipo",
    entityKind: "item",
    path: ["Item", "MT"],
    instantiate: async () => {
      const type = pickRandom(POKEMON_TYPES);

      return {
        label: `MT cuyo movimiento es tipo ${formatDisplayName(type)}`,
        description: `MT o HM que ensena un movimiento de tipo ${formatDisplayName(type)}.`,
        params: { type },
      };
    },
    matches: async (theme, entryName) =>
      (await getDexEntryByName("item", entryName))?.machineMoveType ===
      theme.params.type,
  },
];
