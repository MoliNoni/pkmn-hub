import { POKEMON_TYPES } from "@/types/types";

import {
  getDexEntryByName,
  getPokemonColors,
  getPokemonEggGroups,
} from "@/services/pokemon/pokeApiDex";
import {
  formatDisplayName,
  getPokemonBattleMultiplier,
  pickRandom,
} from "@/games/mentiroso/themes/helpers";
import type { ThemeTemplate } from "@/games/mentiroso/themes/types";

export const pokemonAdvancedTemplates: ThemeTemplate[] = [
  {
    id: "pokemon-base-stats-greater-number",
    label: "Mayor que X numero",
    entityKind: "pokemon",
    path: ["Pokemon", "Stats base"],
    inputDefinitions: [
      {
        key: "threshold",
        label: "Numero",
        min: 1,
        placeholder: "Ejemplo: 500",
        type: "number",
      },
    ],
    instantiate: async (params) => {
      const threshold = Number(params.threshold);

      if (!Number.isFinite(threshold) || threshold < 1) {
        throw new Error("Debes escribir un numero valido para este tema.");
      }

      return {
        label: `Pokemon con stats base totales mayores que ${threshold}`,
        description: `Pokemon cuya suma de stats base supera ${threshold}.`,
        params: { threshold },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.baseStats.total ?? -1) >
      Number(theme.params.threshold),
  },
  {
    id: "pokemon-base-stats-lower-number",
    label: "Menor que X numero",
    entityKind: "pokemon",
    path: ["Pokemon", "Stats base"],
    inputDefinitions: [
      {
        key: "threshold",
        label: "Numero",
        min: 1,
        placeholder: "Ejemplo: 300",
        type: "number",
      },
    ],
    instantiate: async (params) => {
      const threshold = Number(params.threshold);

      if (!Number.isFinite(threshold) || threshold < 1) {
        throw new Error("Debes escribir un numero valido para este tema.");
      }

      return {
        label: `Pokemon con stats base totales menores que ${threshold}`,
        description: `Pokemon cuya suma de stats base es inferior a ${threshold}.`,
        params: { threshold },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.baseStats.total ??
        Number.MAX_SAFE_INTEGER) < Number(theme.params.threshold),
  },
  {
    id: "pokemon-base-stats-greater-pokemon",
    label: "Mayor que X pokemon",
    entityKind: "pokemon",
    path: ["Pokemon", "Stats base"],
    inputDefinitions: [
      {
        key: "referencePokemon",
        label: "Pokemon",
        placeholder: "Ejemplo: pikachu",
        type: "text",
      },
    ],
    instantiate: async (params) => {
      const referencePokemon = String(params.referencePokemon ?? "")
        .trim()
        .toLowerCase();
      const referenceEntry = await getDexEntryByName("pokemon", referencePokemon);

      if (!referenceEntry) {
        throw new Error("Debes escribir un Pokemon valido para comparar.");
      }

      return {
        label: `Pokemon con stats base totales mayores que ${referenceEntry.displayName}`,
        description: `Pokemon cuya suma de stats base supera la de ${referenceEntry.displayName}.`,
        params: {
          referencePokemon: referenceEntry.name,
          referenceValue: referenceEntry.baseStats.total,
        },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.baseStats.total ?? -1) >
      Number(theme.params.referenceValue),
  },
  {
    id: "pokemon-base-stats-lower-pokemon",
    label: "Menor que X pokemon",
    entityKind: "pokemon",
    path: ["Pokemon", "Stats base"],
    inputDefinitions: [
      {
        key: "referencePokemon",
        label: "Pokemon",
        placeholder: "Ejemplo: charizard",
        type: "text",
      },
    ],
    instantiate: async (params) => {
      const referencePokemon = String(params.referencePokemon ?? "")
        .trim()
        .toLowerCase();
      const referenceEntry = await getDexEntryByName("pokemon", referencePokemon);

      if (!referenceEntry) {
        throw new Error("Debes escribir un Pokemon valido para comparar.");
      }

      return {
        label: `Pokemon con stats base totales menores que ${referenceEntry.displayName}`,
        description: `Pokemon cuya suma de stats base es menor que la de ${referenceEntry.displayName}.`,
        params: {
          referencePokemon: referenceEntry.name,
          referenceValue: referenceEntry.baseStats.total,
        },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.baseStats.total ??
        Number.MAX_SAFE_INTEGER) < Number(theme.params.referenceValue),
  },
  {
    id: "pokemon-base-stats-hp-lower-pokemon",
    label: "Menor que X pokemon",
    entityKind: "pokemon",
    path: ["Pokemon", "Stats base", "HP"],
    inputDefinitions: [
      {
        key: "referencePokemon",
        label: "Pokemon",
        placeholder: "Ejemplo: blissey",
        type: "text",
      },
    ],
    instantiate: async (params) => {
      const referencePokemon = String(params.referencePokemon ?? "")
        .trim()
        .toLowerCase();
      const referenceEntry = await getDexEntryByName("pokemon", referencePokemon);

      if (!referenceEntry) {
        throw new Error("Debes escribir un Pokemon valido para comparar.");
      }

      return {
        label: `Pokemon con HP base menor que ${referenceEntry.displayName}`,
        description: `Pokemon cuyo HP base es menor que el de ${referenceEntry.displayName}.`,
        params: {
          referencePokemon: referenceEntry.name,
          referenceValue: referenceEntry.baseStats.hp,
        },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.baseStats.hp ??
        Number.MAX_SAFE_INTEGER) < Number(theme.params.referenceValue),
  },
  {
    id: "pokemon-base-stats-hp-greater-pokemon",
    label: "Mayor que X pokemon",
    entityKind: "pokemon",
    path: ["Pokemon", "Stats base", "HP"],
    inputDefinitions: [
      {
        key: "referencePokemon",
        label: "Pokemon",
        placeholder: "Ejemplo: snorlax",
        type: "text",
      },
    ],
    instantiate: async (params) => {
      const referencePokemon = String(params.referencePokemon ?? "")
        .trim()
        .toLowerCase();
      const referenceEntry = await getDexEntryByName("pokemon", referencePokemon);

      if (!referenceEntry) {
        throw new Error("Debes escribir un Pokemon valido para comparar.");
      }

      return {
        label: `Pokemon con HP base mayor que ${referenceEntry.displayName}`,
        description: `Pokemon cuyo HP base supera el de ${referenceEntry.displayName}.`,
        params: {
          referencePokemon: referenceEntry.name,
          referenceValue: referenceEntry.baseStats.hp,
        },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.baseStats.hp ?? -1) >
      Number(theme.params.referenceValue),
  },
  {
    id: "pokemon-base-stats-hp-lower-number",
    label: "Menor que X numero",
    entityKind: "pokemon",
    path: ["Pokemon", "Stats base", "HP"],
    inputDefinitions: [
      {
        key: "threshold",
        label: "Numero",
        min: 1,
        placeholder: "Ejemplo: 70",
        type: "number",
      },
    ],
    instantiate: async (params) => {
      const threshold = Number(params.threshold);

      if (!Number.isFinite(threshold) || threshold < 1) {
        throw new Error("Debes escribir un numero valido para este tema.");
      }

      return {
        label: `Pokemon con HP base menor que ${threshold}`,
        description: `Pokemon cuyo HP base es menor que ${threshold}.`,
        params: { threshold },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.baseStats.hp ??
        Number.MAX_SAFE_INTEGER) < Number(theme.params.threshold),
  },
  {
    id: "pokemon-base-stats-hp-greater-number",
    label: "Mayor que X numero",
    entityKind: "pokemon",
    path: ["Pokemon", "Stats base", "HP"],
    inputDefinitions: [
      {
        key: "threshold",
        label: "Numero",
        min: 1,
        placeholder: "Ejemplo: 120",
        type: "number",
      },
    ],
    instantiate: async (params) => {
      const threshold = Number(params.threshold);

      if (!Number.isFinite(threshold) || threshold < 1) {
        throw new Error("Debes escribir un numero valido para este tema.");
      }

      return {
        label: `Pokemon con HP base mayor que ${threshold}`,
        description: `Pokemon cuyo HP base supera ${threshold}.`,
        params: { threshold },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.baseStats.hp ?? -1) >
      Number(theme.params.threshold),
  },
  {
    id: "pokemon-move-learns",
    label: "Aprende X",
    entityKind: "pokemon",
    path: ["Pokemon", "Movimiento"],
    inputDefinitions: [
      {
        key: "move",
        label: "Movimiento",
        placeholder: "Ejemplo: thunderbolt",
        type: "text",
      },
    ],
    instantiate: async (params) => {
      const moveName = String(params.move ?? "").trim().toLowerCase();
      const move = await getDexEntryByName("move", moveName);

      if (!move) {
        throw new Error("Debes escribir un movimiento valido para este tema.");
      }

      return {
        label: `Pokemon que aprende ${move.displayName}`,
        description: `Pokemon que pueden aprender el movimiento ${move.displayName}.`,
        params: { move: move.name },
      };
    },
    matches: async (theme, entryName) =>
      Boolean(
        (await getDexEntryByName("pokemon", entryName))?.learnedMoves.includes(
          String(theme.params.move),
        ),
      ),
  },
  {
    id: "pokemon-battle-x4-weakness",
    label: "Tiene debilidad X4",
    entityKind: "pokemon",
    path: ["Pokemon", "Combate"],
    inputDefinitions: [
      {
        key: "type",
        label: "Tipo atacante",
        options: POKEMON_TYPES.map((type) => ({
          label: formatDisplayName(type),
          value: type,
        })),
        placeholder: "Selecciona un tipo",
        type: "select",
      },
    ],
    instantiate: async (params) => {
      const type = String(params.type ?? "").trim().toLowerCase();

      if (!POKEMON_TYPES.includes(type as (typeof POKEMON_TYPES)[number])) {
        throw new Error("Debes elegir un tipo valido para este tema.");
      }

      return {
        label: `Pokemon con debilidad x4 al tipo ${formatDisplayName(type)}`,
        description: `Pokemon que reciben dano x4 de ataques tipo ${formatDisplayName(type)}.`,
        params: { type },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);
      return pokemon
        ? getPokemonBattleMultiplier(pokemon.types, String(theme.params.type)) === 4
        : false;
    },
  },
  {
    id: "pokemon-battle-x4-resistance",
    label: "Tiene resistencia X4",
    entityKind: "pokemon",
    path: ["Pokemon", "Combate"],
    inputDefinitions: [
      {
        key: "type",
        label: "Tipo atacante",
        options: POKEMON_TYPES.map((type) => ({
          label: formatDisplayName(type),
          value: type,
        })),
        placeholder: "Selecciona un tipo",
        type: "select",
      },
    ],
    instantiate: async (params) => {
      const type = String(params.type ?? "").trim().toLowerCase();

      if (!POKEMON_TYPES.includes(type as (typeof POKEMON_TYPES)[number])) {
        throw new Error("Debes elegir un tipo valido para este tema.");
      }

      return {
        label: `Pokemon con resistencia x4 al tipo ${formatDisplayName(type)}`,
        description: `Pokemon que reciben dano x0.25 de ataques tipo ${formatDisplayName(type)}.`,
        params: { type },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);
      return pokemon
        ? getPokemonBattleMultiplier(pokemon.types, String(theme.params.type)) ===
            0.25
        : false;
    },
  },
  {
    id: "pokemon-misc-regional-form-type",
    label: "Tipo",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc", "Tiene forma regional"],
    instantiate: async () => {
      const type = pickRandom(POKEMON_TYPES);

      return {
        label: `Pokemon con forma regional y tipo ${formatDisplayName(type)}`,
        description: `Pokemon con forma regional que tengan el tipo ${formatDisplayName(type)}.`,
        params: { type },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);
      return pokemon
        ? pokemon.isRegionalForm && pokemon.types.includes(String(theme.params.type))
        : false;
    },
  },
  {
    id: "pokemon-misc-legendary-type",
    label: "Tipo",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc", "Es legendario"],
    instantiate: async () => {
      const type = pickRandom(POKEMON_TYPES);

      return {
        label: `Pokemon legendarios de tipo ${formatDisplayName(type)}`,
        description: `Pokemon legendarios que tengan el tipo ${formatDisplayName(type)}.`,
        params: { type },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);
      return pokemon
        ? pokemon.isLegendary && pokemon.types.includes(String(theme.params.type))
        : false;
    },
  },
  {
    id: "pokemon-misc-legendary-color",
    label: "Color",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc", "Es legendario"],
    instantiate: async () => {
      const color = pickRandom(await getPokemonColors());

      return {
        label: `Pokemon legendarios de color ${formatDisplayName(color)}`,
        description: `Pokemon legendarios cuyo color en Pokedex es ${formatDisplayName(color)}.`,
        params: { color },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);
      return pokemon
        ? pokemon.isLegendary && pokemon.color === String(theme.params.color)
        : false;
    },
  },
  {
    id: "pokemon-misc-mythical-type",
    label: "Tipo",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc", "Es mitico"],
    instantiate: async () => {
      const type = pickRandom(POKEMON_TYPES);

      return {
        label: `Pokemon miticos de tipo ${formatDisplayName(type)}`,
        description: `Pokemon miticos que tengan el tipo ${formatDisplayName(type)}.`,
        params: { type },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);
      return pokemon
        ? pokemon.isMythical && pokemon.types.includes(String(theme.params.type))
        : false;
    },
  },
  {
    id: "pokemon-misc-mythical-color",
    label: "Color",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc", "Es mitico"],
    instantiate: async () => {
      const color = pickRandom(await getPokemonColors());

      return {
        label: `Pokemon miticos de color ${formatDisplayName(color)}`,
        description: `Pokemon miticos cuyo color en Pokedex es ${formatDisplayName(color)}.`,
        params: { color },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);
      return pokemon
        ? pokemon.isMythical && pokemon.color === String(theme.params.color)
        : false;
    },
  },
  {
    id: "pokemon-misc-singular-type",
    label: "Tipo",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc", "Es singular"],
    instantiate: async () => {
      const type = pickRandom(POKEMON_TYPES);

      return {
        label: `Pokemon singulares de tipo ${formatDisplayName(type)}`,
        description: `Pokemon de linea evolutiva unica que tengan el tipo ${formatDisplayName(type)}.`,
        params: { type },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);
      return pokemon
        ? pokemon.isSingular && pokemon.types.includes(String(theme.params.type))
        : false;
    },
  },
  {
    id: "pokemon-misc-singular-color",
    label: "Color",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc", "Es singular"],
    instantiate: async () => {
      const color = pickRandom(await getPokemonColors());

      return {
        label: `Pokemon singulares de color ${formatDisplayName(color)}`,
        description: `Pokemon de linea evolutiva unica cuyo color en Pokedex es ${formatDisplayName(color)}.`,
        params: { color },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);
      return pokemon
        ? pokemon.isSingular && pokemon.color === String(theme.params.color)
        : false;
    },
  },
  {
    id: "pokemon-misc-color",
    label: "Color",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc"],
    instantiate: async () => {
      const color = pickRandom(await getPokemonColors());

      return {
        label: `Pokemon de color ${formatDisplayName(color)}`,
        description: `Pokemon cuyo color en Pokedex es ${formatDisplayName(color)}.`,
        params: { color },
      };
    },
    matches: async (theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.color ===
      String(theme.params.color),
  },
  {
    id: "pokemon-misc-egg-group",
    label: "Grupo huevo",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc"],
    instantiate: async () => {
      const eggGroup = pickRandom(await getPokemonEggGroups());

      return {
        label: `Pokemon del grupo huevo ${formatDisplayName(eggGroup)}`,
        description: `Pokemon que pertenecen al grupo huevo ${formatDisplayName(eggGroup)}.`,
        params: { eggGroup },
      };
    },
    matches: async (theme, entryName) =>
      Boolean(
        (await getDexEntryByName("pokemon", entryName))?.eggGroups.includes(
          String(theme.params.eggGroup),
        ),
      ),
  },
  {
    id: "pokemon-misc-first-pokedex",
    label: "Primeros X pokemon de la pokedex",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc"],
    inputDefinitions: [
      {
        key: "count",
        label: "Cantidad",
        min: 1,
        placeholder: "Ejemplo: 151",
        type: "number",
      },
    ],
    instantiate: async (params) => {
      const count = Number(params.count);

      if (!Number.isFinite(count) || count < 1) {
        throw new Error("Debes escribir una cantidad valida para este tema.");
      }

      return {
        label: `Pokemon entre los primeros ${count} de la Pokedex`,
        description: `Pokemon cuyo numero nacional de Pokedex esta dentro de los primeros ${count}.`,
        params: { count },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.id ??
        Number.MAX_SAFE_INTEGER) <= Number(theme.params.count),
  },
  {
    id: "pokemon-misc-no-gender",
    label: "No tiene genero",
    entityKind: "pokemon",
    path: ["Pokemon", "Misc"],
    instantiate: async () => ({
      label: "Pokemon sin genero",
      description: "Pokemon que no tienen genero definido.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.isGenderless ?? false,
  },
];
