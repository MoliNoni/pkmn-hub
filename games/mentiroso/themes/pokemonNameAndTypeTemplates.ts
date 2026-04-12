import { POKEMON_TYPES } from "@/types/types";

import {
  getAbilityNames,
  getDexEntryByName,
} from "@/services/pokemon/pokeApiDex";
import {
  GENERATIONS,
  GENERATION_OPTIONS,
  formatDisplayName,
  pickRandom,
} from "@/games/mentiroso/themes/helpers";
import type { ThemeTemplate } from "@/games/mentiroso/themes/types";

export const pokemonNameAndTypeTemplates: ThemeTemplate[] = [
  {
    id: "pokemon-ability",
    label: "Habilidad",
    entityKind: "pokemon",
    path: ["Pokemon"],
    instantiate: async () => {
      const ability = pickRandom(await getAbilityNames());

      return {
        label: `Pokemon con habilidad ${formatDisplayName(ability)}`,
        description: `Pokemon que pueden tener la habilidad ${formatDisplayName(ability)}.`,
        params: { ability },
      };
    },
    matches: async (theme, entryName) => {
      const ability = String(theme.params.ability);
      const pokemon = await getDexEntryByName("pokemon", entryName);

      return pokemon
        ? [...pokemon.abilities, ...pokemon.hiddenAbilities].includes(ability)
        : false;
    },
  },
  {
    id: "pokemon-generation-type",
    label: "Tipo",
    entityKind: "pokemon",
    path: ["Pokemon", "Generacion"],
    inputDefinitions: [
      {
        key: "generation",
        label: "Generacion",
        options: GENERATION_OPTIONS,
        placeholder: "Selecciona una generacion",
        type: "select",
      },
    ],
    instantiate: async (params) => {
      const generation = String(params.generation ?? "").trim().toLowerCase();
      const type = pickRandom(POKEMON_TYPES);

      if (!GENERATIONS.includes(generation as (typeof GENERATIONS)[number])) {
        throw new Error("Debes elegir una generacion valida.");
      }

      return {
        label: `Pokemon de ${formatDisplayName(generation)} y tipo ${formatDisplayName(type)}`,
        description: `Pokemon introducidos en ${formatDisplayName(generation)} que tengan el tipo ${formatDisplayName(type)}.`,
        params: { generation, type },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);

      return pokemon
        ? pokemon.generation === theme.params.generation &&
            pokemon.types.includes(String(theme.params.type))
        : false;
    },
  },
  {
    id: "pokemon-type-generation",
    label: "Generacion",
    entityKind: "pokemon",
    path: ["Pokemon", "Tipo"],
    inputDefinitions: [
      {
        key: "generation",
        label: "Generacion",
        options: GENERATION_OPTIONS,
        placeholder: "Selecciona una generacion",
        type: "select",
      },
    ],
    instantiate: async (params) => {
      const generation = String(params.generation ?? "").trim().toLowerCase();
      const type = pickRandom(POKEMON_TYPES);

      if (!GENERATIONS.includes(generation as (typeof GENERATIONS)[number])) {
        throw new Error("Debes elegir una generacion valida.");
      }

      return {
        label: `Pokemon tipo ${formatDisplayName(type)} de ${formatDisplayName(generation)}`,
        description: `Pokemon del tipo ${formatDisplayName(type)} introducidos en ${formatDisplayName(generation)}.`,
        params: { generation, type },
      };
    },
    matches: async (theme, entryName) => {
      const pokemon = await getDexEntryByName("pokemon", entryName);

      return pokemon
        ? pokemon.types.includes(String(theme.params.type)) &&
            pokemon.generation === theme.params.generation
        : false;
    },
  },
  {
    id: "pokemon-second-type",
    label: "Segundo Tipo",
    entityKind: "pokemon",
    path: ["Pokemon", "Tipo"],
    instantiate: async () => {
      const secondType = pickRandom(POKEMON_TYPES);

      return {
        label: `Pokemon cuyo segundo tipo es ${formatDisplayName(secondType)}`,
        description: `Pokemon que tienen ${formatDisplayName(secondType)} especificamente como segundo tipo.`,
        params: { secondType },
      };
    },
    matches: async (theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.types[1] ===
      theme.params.secondType,
  },
  {
    id: "pokemon-name-contains-letter",
    label: "Tiene X letra",
    entityKind: "pokemon",
    path: ["Pokemon", "Nombre"],
    inputDefinitions: [
      {
        key: "letter",
        label: "Letra",
        max: 1,
        placeholder: "Ejemplo: p",
        type: "text",
      },
    ],
    instantiate: async (params) => {
      const letter = String(params.letter ?? "")
        .trim()
        .toLowerCase()
        .slice(0, 1);

      if (!letter) {
        throw new Error("Debes escribir una letra para este tema.");
      }

      return {
        label: `Pokemon cuyo nombre contiene la letra ${letter.toUpperCase()}`,
        description: `Pokemon cuyo nombre contiene la letra ${letter.toUpperCase()}.`,
        params: { letter },
      };
    },
    matches: async (theme, entryName) =>
      Boolean(
        (await getDexEntryByName("pokemon", entryName))?.name.includes(
          String(theme.params.letter),
        ),
      ),
  },
  {
    id: "pokemon-name-starts-letter",
    label: "Empieza por X letra",
    entityKind: "pokemon",
    path: ["Pokemon", "Nombre"],
    inputDefinitions: [
      {
        key: "letter",
        label: "Letra",
        max: 1,
        placeholder: "Ejemplo: p",
        type: "text",
      },
    ],
    instantiate: async (params) => {
      const letter = String(params.letter ?? "")
        .trim()
        .toLowerCase()
        .slice(0, 1);

      if (!letter) {
        throw new Error("Debes escribir una letra para este tema.");
      }

      return {
        label: `Pokemon cuyo nombre empieza por ${letter.toUpperCase()}`,
        description: `Pokemon cuyo nombre empieza por la letra ${letter.toUpperCase()}.`,
        params: { letter },
      };
    },
    matches: async (theme, entryName) =>
      Boolean(
        (await getDexEntryByName("pokemon", entryName))?.name.startsWith(
          String(theme.params.letter),
        ),
      ),
  },
  {
    id: "pokemon-name-ends-letter",
    label: "Termina por X letra",
    entityKind: "pokemon",
    path: ["Pokemon", "Nombre"],
    inputDefinitions: [
      {
        key: "letter",
        label: "Letra",
        max: 1,
        placeholder: "Ejemplo: u",
        type: "text",
      },
    ],
    instantiate: async (params) => {
      const letter = String(params.letter ?? "")
        .trim()
        .toLowerCase()
        .slice(0, 1);

      if (!letter) {
        throw new Error("Debes escribir una letra para este tema.");
      }

      return {
        label: `Pokemon cuyo nombre termina por ${letter.toUpperCase()}`,
        description: `Pokemon cuyo nombre termina por la letra ${letter.toUpperCase()}.`,
        params: { letter },
      };
    },
    matches: async (theme, entryName) =>
      Boolean(
        (await getDexEntryByName("pokemon", entryName))?.name.endsWith(
          String(theme.params.letter),
        ),
      ),
  },
  {
    id: "pokemon-name-exact-length",
    label: "Tiene exactamente X letras",
    entityKind: "pokemon",
    path: ["Pokemon", "Nombre"],
    instantiate: async () => {
      const count = pickRandom([4, 5, 6, 7, 8, 9]);

      return {
        label: `Pokemon con exactamente ${count} letras`,
        description: `Pokemon cuyo nombre, sin espacios, tiene exactamente ${count} letras.`,
        params: { count },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("pokemon", entryName))?.name.replace(/-/g, "").length ??
        -1) === Number(theme.params.count),
  },
];
