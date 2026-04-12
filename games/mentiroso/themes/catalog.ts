import { POKEMON_TYPES } from "@/types/types";
import type { ThemeNode } from "@/types/types";
import {
  buildSimpleThemeTree,
  formatDisplayName,
  GENERATION_OPTIONS,
} from "@/games/mentiroso/themes/helpers";
export const themeCatalog: ThemeNode[] = buildSimpleThemeTree([
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
      {
        id: "pokemon-base-stats",
        label: "Stats base",
        children: [
          {
            id: "pokemon-base-stats-greater-number",
            inputDefinitions: [
              {
                key: "threshold",
                label: "Numero",
                min: 1,
                placeholder: "Ejemplo: 500",
                type: "number",
              },
            ],
            label: "Mayor que X numero",
            themeTemplateId: "pokemon-base-stats-greater-number",
          },
          {
            id: "pokemon-base-stats-lower-number",
            inputDefinitions: [
              {
                key: "threshold",
                label: "Numero",
                min: 1,
                placeholder: "Ejemplo: 300",
                type: "number",
              },
            ],
            label: "Menor que X numero",
            themeTemplateId: "pokemon-base-stats-lower-number",
          },
          {
            id: "pokemon-base-stats-greater-pokemon",
            inputDefinitions: [
              {
                key: "referencePokemon",
                label: "Pokemon",
                placeholder: "Ejemplo: pikachu",
                type: "text",
              },
            ],
            label: "Mayor que X pokemon",
            themeTemplateId: "pokemon-base-stats-greater-pokemon",
          },
          {
            id: "pokemon-base-stats-lower-pokemon",
            inputDefinitions: [
              {
                key: "referencePokemon",
                label: "Pokemon",
                placeholder: "Ejemplo: charizard",
                type: "text",
              },
            ],
            label: "Menor que X pokemon",
            themeTemplateId: "pokemon-base-stats-lower-pokemon",
          },
          {
            id: "pokemon-base-stats-hp",
            label: "HP",
            children: [
              {
                id: "pokemon-base-stats-hp-lower-pokemon",
                inputDefinitions: [
                  {
                    key: "referencePokemon",
                    label: "Pokemon",
                    placeholder: "Ejemplo: blissey",
                    type: "text",
                  },
                ],
                label: "Menor que X pokemon",
                themeTemplateId: "pokemon-base-stats-hp-lower-pokemon",
              },
              {
                id: "pokemon-base-stats-hp-greater-pokemon",
                inputDefinitions: [
                  {
                    key: "referencePokemon",
                    label: "Pokemon",
                    placeholder: "Ejemplo: snorlax",
                    type: "text",
                  },
                ],
                label: "Mayor que X pokemon",
                themeTemplateId: "pokemon-base-stats-hp-greater-pokemon",
              },
              {
                id: "pokemon-base-stats-hp-lower-number",
                inputDefinitions: [
                  {
                    key: "threshold",
                    label: "Numero",
                    min: 1,
                    placeholder: "Ejemplo: 70",
                    type: "number",
                  },
                ],
                label: "Menor que X numero",
                themeTemplateId: "pokemon-base-stats-hp-lower-number",
              },
              {
                id: "pokemon-base-stats-hp-greater-number",
                inputDefinitions: [
                  {
                    key: "threshold",
                    label: "Numero",
                    min: 1,
                    placeholder: "Ejemplo: 120",
                    type: "number",
                  },
                ],
                label: "Mayor que X numero",
                themeTemplateId: "pokemon-base-stats-hp-greater-number",
              },
            ],
          },
        ],
      },
      {
        id: "pokemon-move",
        label: "Movimiento",
        children: [
          {
            id: "pokemon-move-learns",
            inputDefinitions: [
              {
                key: "move",
                label: "Movimiento",
                placeholder: "Ejemplo: thunderbolt",
                type: "text",
              },
            ],
            label: "Aprende X",
            themeTemplateId: "pokemon-move-learns",
          },
        ],
      },
      {
        id: "pokemon-battle",
        label: "Combate",
        children: [
          {
            id: "pokemon-battle-x4-weakness",
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
            label: "Tiene debilidad X4",
            themeTemplateId: "pokemon-battle-x4-weakness",
          },
          {
            id: "pokemon-battle-x4-resistance",
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
            label: "Tiene resistencia X4",
            themeTemplateId: "pokemon-battle-x4-resistance",
          },
        ],
      },
      {
        id: "pokemon-misc",
        label: "Misc",
        children: [
          {
            id: "pokemon-misc-regional-form",
            label: "Tiene forma regional",
            children: [
              {
                id: "pokemon-misc-regional-form-type",
                label: "Tipo",
                themeTemplateId: "pokemon-misc-regional-form-type",
              },
            ],
          },
          {
            id: "pokemon-misc-legendary",
            label: "Es legendario",
            children: [
              {
                id: "pokemon-misc-legendary-type",
                label: "Tipo",
                themeTemplateId: "pokemon-misc-legendary-type",
              },
              {
                id: "pokemon-misc-legendary-color",
                label: "Color",
                themeTemplateId: "pokemon-misc-legendary-color",
              },
            ],
          },
          {
            id: "pokemon-misc-mythical",
            label: "Es mitico",
            children: [
              {
                id: "pokemon-misc-mythical-type",
                label: "Tipo",
                themeTemplateId: "pokemon-misc-mythical-type",
              },
              {
                id: "pokemon-misc-mythical-color",
                label: "Color",
                themeTemplateId: "pokemon-misc-mythical-color",
              },
            ],
          },
          {
            id: "pokemon-misc-singular",
            label: "Es singular",
            children: [
              {
                id: "pokemon-misc-singular-type",
                label: "Tipo",
                themeTemplateId: "pokemon-misc-singular-type",
              },
              {
                id: "pokemon-misc-singular-color",
                label: "Color",
                themeTemplateId: "pokemon-misc-singular-color",
              },
            ],
          },
          {
            id: "pokemon-misc-color",
            label: "Color",
            themeTemplateId: "pokemon-misc-color",
          },
          {
            id: "pokemon-misc-egg-group",
            label: "Grupo huevo",
            themeTemplateId: "pokemon-misc-egg-group",
          },
          {
            id: "pokemon-misc-first-pokedex",
            inputDefinitions: [
              {
                key: "count",
                label: "Cantidad",
                min: 1,
                placeholder: "Ejemplo: 151",
                type: "number",
              },
            ],
            label: "Primeros X pokemon de la pokedex",
            themeTemplateId: "pokemon-misc-first-pokedex",
          },
          {
            id: "pokemon-misc-no-gender",
            label: "No tiene genero",
            themeTemplateId: "pokemon-misc-no-gender",
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
