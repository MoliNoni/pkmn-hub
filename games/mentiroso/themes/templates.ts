import type { ActiveRoundTheme, ThemeParams } from "@/types/types";

import { getNodeLabel, normalizeThemeId } from "@/games/mentiroso/themes/helpers";
import { itemTemplates } from "@/games/mentiroso/themes/itemTemplates";
import { moveTemplates } from "@/games/mentiroso/themes/moveTemplates";
import { pokemonAdvancedTemplates } from "@/games/mentiroso/themes/pokemonAdvancedTemplates";
import { pokemonEvolutionTemplates } from "@/games/mentiroso/themes/pokemonEvolutionTemplates";
import { pokemonNameAndTypeTemplates } from "@/games/mentiroso/themes/pokemonNameAndTypeTemplates";
import type { ThemeTemplate } from "@/games/mentiroso/themes/types";

const templates: ThemeTemplate[] = [
  ...pokemonEvolutionTemplates,
  ...pokemonNameAndTypeTemplates,
  ...pokemonAdvancedTemplates,
  ...itemTemplates,
  ...moveTemplates,
];

const templateMap = new Map(templates.map((template) => [template.id, template]));

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
    throw new Error(`No existe logica para el tema ${theme.templateId} .`);
  }

  return template.matches(theme, entryName);
}

export function getThemeSelectionLabel(theme: ActiveRoundTheme): string {
  return getNodeLabel(theme.categoryPath.slice(0, -1), theme.label);
}
