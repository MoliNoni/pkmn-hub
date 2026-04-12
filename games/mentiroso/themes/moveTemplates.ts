import {
  getDexEntryByName,
  getPokemonNames,
} from "@/services/pokemon/pokeApiDex";
import {
  MOVE_ACCURACY_THRESHOLDS,
  MOVE_POWER_THRESHOLDS,
  formatDisplayName,
  pickRandom,
} from "@/games/mentiroso/themes/helpers";
import type { ThemeTemplate } from "@/games/mentiroso/themes/types";

export const moveTemplates: ThemeTemplate[] = [
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
