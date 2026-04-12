import { getDexEntryByName } from "@/services/pokemon/pokeApiDex";
import type { ThemeTemplate } from "@/games/mentiroso/themes/types";

export const pokemonEvolutionTemplates: ThemeTemplate[] = [
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
      (await getDexEntryByName("pokemon", entryName))?.evolution.methods.happiness ??
      false,
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
];
