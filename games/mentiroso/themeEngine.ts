import { POKEMON_TYPES } from "@/types/types";
import type {
  ActiveRoundTheme,
  ThemeEntityKind,
  ThemeInputDefinition,
  ThemeNode,
  ThemeParams,
} from "@/types/types";

import {
  getAbilityNames,
  getDexEntryByName,
  getPokemonNames,
} from "@/services/pokeApiDex";

type ThemeTemplate = {
  id: string;
  inputDefinitions?: ThemeInputDefinition[];
  label: string;
  entityKind: ThemeEntityKind;
  path: string[];
  instantiate: (params: ThemeParams) => Promise<{
    description: string;
    label: string;
    params: ThemeParams;
  }>;
  matches: (theme: ActiveRoundTheme, entryName: string) => Promise<boolean>;
};

type ThemeCatalogInputNode = {
  children?: ThemeCatalogInputNode[];
  id: string;
  inputDefinitions?: ThemeInputDefinition[];
  label: string;
  themeTemplateId?: string;
};

const GENERATIONS = [
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
const GENERATION_OPTIONS: ThemeInputDefinition["options"] = GENERATIONS.map(
  (generation) => ({
    label: formatDisplayName(generation),
    value: generation,
  }),
);
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const MOVE_POWER_THRESHOLDS = [40, 60, 80, 100];
const MOVE_ACCURACY_THRESHOLDS = [70, 85, 100];
const EVOLUTION_COUNTS = [1, 2, 3];

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function formatDisplayName(value: string): string {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function normalizeThemeId(themeId: string): string {
  return themeId.trim().toLowerCase();
}

function getNodeLabel(path: string[], label: string): string {
  return [...path, label].join(" > ");
}

function buildSimpleThemeTree(input: ThemeCatalogInputNode[]): ThemeNode[] {
  return input.map((node) => ({
    id: node.id,
    inputDefinitions: node.inputDefinitions,
    label: node.label,
    themeTemplateId: node.themeTemplateId,
    children: buildSimpleThemeTree(node.children ?? []),
  }));
}

const themeCatalog: ThemeNode[] = buildSimpleThemeTree([
  {
    id: "pokemon",
    label: "Pokemon",
    children: [
      {
        id: "pokemon-evolution",
        label: "Evolucion",
        children: [
          {
            id: "pokemon-evolution-type-change",
            label: "Cambia de tipo",
            themeTemplateId: "pokemon-evolution-type-change",
          },
          {
            id: "pokemon-evolution-cross-generation",
            label: "Generaciones diferentes",
            themeTemplateId: "pokemon-evolution-cross-generation",
          },
          {
            id: "pokemon-evolution-ability",
            label: "Habilidad",
            themeTemplateId: "pokemon-evolution-ability",
          },
          {
            id: "pokemon-evolution-mega",
            label: "Puede megaevolucionar",
            themeTemplateId: "pokemon-evolution-mega",
          },
          {
            id: "pokemon-evolution-exact-count",
            label: "Tiene exactamente X evoluciones",
            themeTemplateId: "pokemon-evolution-exact-count",
          },
          {
            id: "pokemon-evolution-convergent",
            label: "Tiene evoluciones convergentes",
            themeTemplateId: "pokemon-evolution-convergent",
          },
          {
            id: "pokemon-evolution-method",
            label: "Metodo evolucion",
            children: [
              {
                id: "pokemon-evolution-stone",
                label: "Evoluciona por piedra",
                themeTemplateId: "pokemon-evolution-stone",
              },
              {
                id: "pokemon-evolution-trade",
                label: "Evoluciona por intercambio",
                themeTemplateId: "pokemon-evolution-trade",
              },
              {
                id: "pokemon-evolution-happiness",
                label: "Evoluciona por felicidad",
                themeTemplateId: "pokemon-evolution-happiness",
              },
              {
                id: "pokemon-evolution-weather",
                label: "Clima",
                themeTemplateId: "pokemon-evolution-weather",
              },
            ],
          },
        ],
      },
      {
        id: "pokemon-ability",
        label: "Habilidad",
        themeTemplateId: "pokemon-ability",
        children: [],
      },
      {
        id: "pokemon-generation",
        label: "Generacion",
        children: [
          {
            id: "pokemon-generation-type",
            inputDefinitions: [
              {
                key: "generation",
                label: "Generacion",
                options: GENERATION_OPTIONS,
                placeholder: "Selecciona una generacion",
                type: "select",
              },
            ],
            label: "Tipo",
            themeTemplateId: "pokemon-generation-type",
          },
        ],
      },
      {
        id: "pokemon-type",
        label: "Tipo",
        children: [
          {
            id: "pokemon-type-generation",
            inputDefinitions: [
              {
                key: "generation",
                label: "Generacion",
                options: GENERATION_OPTIONS,
                placeholder: "Selecciona una generacion",
                type: "select",
              },
            ],
            label: "Generacion",
            themeTemplateId: "pokemon-type-generation",
          },
          {
            id: "pokemon-second-type",
            label: "Segundo Tipo",
            themeTemplateId: "pokemon-second-type",
          },
        ],
      },
      {
        id: "pokemon-name",
        label: "Nombre",
        children: [
          {
            id: "pokemon-name-contains-letter",
            inputDefinitions: [
              {
                key: "letter",
                label: "Letra",
                max: 1,
                placeholder: "Ejemplo: p",
                type: "text",
              },
            ],
            label: "Tiene X letra",
            themeTemplateId: "pokemon-name-contains-letter",
          },
          {
            id: "pokemon-name-starts-letter",
            inputDefinitions: [
              {
                key: "letter",
                label: "Letra",
                max: 1,
                placeholder: "Ejemplo: p",
                type: "text",
              },
            ],
            label: "Empieza por X letra",
            themeTemplateId: "pokemon-name-starts-letter",
          },
          {
            id: "pokemon-name-ends-letter",
            inputDefinitions: [
              {
                key: "letter",
                label: "Letra",
                max: 1,
                placeholder: "Ejemplo: u",
                type: "text",
              },
            ],
            label: "Termina por X letra",
            themeTemplateId: "pokemon-name-ends-letter",
          },
          {
            id: "pokemon-name-exact-length",
            label: "Tiene exactamente X letras",
            themeTemplateId: "pokemon-name-exact-length",
          },
        ],
      },
    ],
  },
  {
    id: "item",
    label: "Item",
    children: [
      {
        id: "item-hp-healing",
        label: "Objeto de curacion de PS",
        themeTemplateId: "item-hp-healing",
      },
      {
        id: "item-wild-held",
        label: "Lo tienen pokemon salvajes",
        themeTemplateId: "item-wild-held",
      },
      {
        id: "item-name",
        label: "Nombre",
        themeTemplateId: "item-name",
      },
      {
        id: "item-pokeball",
        label: "Pokeball",
        themeTemplateId: "item-pokeball",
      },
      {
        id: "item-evolution",
        label: "Item evolutivo",
        themeTemplateId: "item-evolution",
      },
      {
        id: "item-tm",
        label: "MT",
        children: [
          {
            id: "item-tm-type",
            label: "Tipo",
            themeTemplateId: "item-tm-type",
          },
        ],
      },
    ],
  },
  {
    id: "move",
    label: "Movimiento",
    children: [
      {
        id: "move-power",
        label: "Potencia",
        themeTemplateId: "move-power",
      },
      {
        id: "move-accuracy",
        label: "Precision",
        themeTemplateId: "move-accuracy",
      },
      {
        id: "move-pokemon",
        label: "Pokemon",
        themeTemplateId: "move-pokemon",
      },
    ],
  },
]);

const templates: ThemeTemplate[] = [
  {
    id: "pokemon-evolution-type-change",
    label: "Cambia de tipo",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion"],
    instantiate: async () => ({
      label: "Pokemon cuya linea evolutiva cambia de tipo",
      description: "Pokemon cuya linea evolutiva incluye un cambio de tipo.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution.changesType ?? false,
  },
  {
    id: "pokemon-evolution-cross-generation",
    label: "Generaciones diferentes",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion"],
    instantiate: async () => ({
      label: "Pokemon con linea evolutiva entre generaciones",
      description:
        "Pokemon cuya linea evolutiva reparte especies entre generaciones distintas.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution
        .spansDifferentGenerations ?? false,
  },
  {
    id: "pokemon-evolution-ability",
    label: "Habilidad",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion"],
    instantiate: async () => ({
      label: "Pokemon con linea evolutiva que cambia habilidades",
      description:
        "Pokemon cuya linea evolutiva presenta variacion de habilidades entre especies.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution
        .hasAbilityVariation ?? false,
  },
  {
    id: "pokemon-evolution-mega",
    label: "Puede megaevolucionar",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion"],
    instantiate: async () => ({
      label: "Pokemon con megaevolucion",
      description: "Pokemon cuya especie o linea evolutiva tiene una megaevolucion.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution.hasMegaEvolution ??
      false,
  },
  {
    id: "pokemon-evolution-exact-count",
    label: "Tiene exactamente X evoluciones",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion"],
    instantiate: async () => {
      const count = pickRandom(EVOLUTION_COUNTS);

      return {
        label: `Pokemon con exactamente ${count} evolucion(es) restante(s)`,
        description: `Pokemon cuya especie puede alcanzar exactamente ${count} evolucion(es) desde su punto actual.`,
        params: { count },
      };
    },
    matches: async (theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution.evolvesToCount ===
      Number(theme.params.count),
  },
  {
    id: "pokemon-evolution-convergent",
    label: "Tiene evoluciones convergentes",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion"],
    instantiate: async () => ({
      label: "Pokemon con linea evolutiva ramificada",
      description:
        "Pokemon cuya linea evolutiva contiene una rama con varias posibles evoluciones.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution
        .hasBranchingEvolution ?? false,
  },
  {
    id: "pokemon-evolution-stone",
    label: "Evoluciona por piedra",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion", "Metodo evolucion"],
    instantiate: async () => ({
      label: "Pokemon con evolucion por piedra",
      description: "Pokemon cuya linea evolutiva utiliza una piedra evolutiva.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution.methods.stone ??
      false,
  },
  {
    id: "pokemon-evolution-trade",
    label: "Evoluciona por intercambio",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion", "Metodo evolucion"],
    instantiate: async () => ({
      label: "Pokemon con evolucion por intercambio",
      description: "Pokemon cuya linea evolutiva requiere intercambio.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution.methods.trade ??
      false,
  },
  {
    id: "pokemon-evolution-happiness",
    label: "Evoluciona por felicidad",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion", "Metodo evolucion"],
    instantiate: async () => ({
      label: "Pokemon con evolucion por felicidad",
      description: "Pokemon cuya linea evolutiva usa amistad o felicidad.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution.methods
        .happiness ?? false,
  },
  {
    id: "pokemon-evolution-weather",
    label: "Clima",
    entityKind: "pokemon",
    path: ["Pokemon", "Evolucion", "Metodo evolucion"],
    instantiate: async () => ({
      label: "Pokemon con evolucion por clima",
      description: "Pokemon cuya linea evolutiva depende del clima.",
      params: {},
    }),
    matches: async (_theme, entryName) =>
      (await getDexEntryByName("pokemon", entryName))?.evolution.methods.weather ??
      false,
  },
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
      Boolean((await getDexEntryByName("pokemon", entryName))?.name.includes(String(theme.params.letter))),
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
      Boolean((await getDexEntryByName("pokemon", entryName))?.name.startsWith(String(theme.params.letter))),
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
      Boolean((await getDexEntryByName("pokemon", entryName))?.name.endsWith(String(theme.params.letter))),
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
      description: "Items que aparecen como held items de Pokemon salvajes en PokéAPI.",
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
      Boolean((await getDexEntryByName("item", entryName))?.name.includes(String(theme.params.letter))),
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
        description: `MT o HM que enseña un movimiento de tipo ${formatDisplayName(type)}.`,
        params: { type },
      };
    },
    matches: async (theme, entryName) =>
      (await getDexEntryByName("item", entryName))?.machineMoveType === theme.params.type,
  },
  {
    id: "move-power",
    label: "Potencia",
    entityKind: "move",
    path: ["Movimiento"],
    instantiate: async () => {
      const minimumPower = pickRandom(MOVE_POWER_THRESHOLDS);

      return {
        label: `Movimientos con potencia base >= ${minimumPower}`,
        description: `Movimientos cuya potencia base es mayor o igual a ${minimumPower}.`,
        params: { minimumPower },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("move", entryName))?.power ?? -1) >=
      Number(theme.params.minimumPower),
  },
  {
    id: "move-accuracy",
    label: "Precision",
    entityKind: "move",
    path: ["Movimiento"],
    instantiate: async () => {
      const minimumAccuracy = pickRandom(MOVE_ACCURACY_THRESHOLDS);

      return {
        label: `Movimientos con precision >= ${minimumAccuracy}`,
        description: `Movimientos cuya precision base es mayor o igual a ${minimumAccuracy}.`,
        params: { minimumAccuracy },
      };
    },
    matches: async (theme, entryName) =>
      ((await getDexEntryByName("move", entryName))?.accuracy ?? -1) >=
      Number(theme.params.minimumAccuracy),
  },
  {
    id: "move-pokemon",
    label: "Pokemon",
    entityKind: "move",
    path: ["Movimiento"],
    instantiate: async () => {
      const pokemon = pickRandom(await getPokemonNames());

      return {
        label: `Movimientos aprendidos por ${formatDisplayName(pokemon)}`,
        description: `Movimientos que ${formatDisplayName(pokemon)} puede aprender.`,
        params: { pokemon },
      };
    },
    matches: async (theme, entryName) =>
      Boolean(
        (await getDexEntryByName("move", entryName))?.learnedByPokemon.includes(
          String(theme.params.pokemon),
        ),
      ),
  },
];

const templateMap = new Map(templates.map((template) => [template.id, template]));

function cloneThemeNodes(nodes: ThemeNode[]): ThemeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    inputDefinitions: node.inputDefinitions,
    label: node.label,
    themeTemplateId: node.themeTemplateId,
    children: cloneThemeNodes(node.children),
  }));
}

export function getThemeCatalog(): ThemeNode[] {
  return cloneThemeNodes(themeCatalog);
}

export function findThemeTemplateById(themeId: string): ThemeTemplate | null {
  return templateMap.get(normalizeThemeId(themeId)) ?? null;
}

export async function createRoundTheme(
  themeId: string,
  params: ThemeParams = {},
): Promise<ActiveRoundTheme> {
  const template = findThemeTemplateById(themeId);

  if (!template) {
    throw new Error("El tema seleccionado no existe.");
  }

  const instance = await template.instantiate(params);

  return {
    id: `${template.id}-${Math.random().toString(36).slice(2, 10)}`,
    templateId: template.id,
    entityKind: template.entityKind,
    categoryPath: [...template.path, template.label],
    label: instance.label,
    description: instance.description,
    params: instance.params,
  };
}

export async function validateThemeEntry(
  theme: ActiveRoundTheme,
  entryName: string,
): Promise<boolean> {
  const template = findThemeTemplateById(theme.templateId);

  if (!template) {
    throw new Error(`No existe logica para el tema ${theme.templateId}.`);
  }

  return template.matches(theme, entryName);
}

export function getThemeSelectionLabel(theme: ActiveRoundTheme): string {
  return getNodeLabel(theme.categoryPath.slice(0, -1), theme.label);
}
