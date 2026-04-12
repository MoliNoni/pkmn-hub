import type {
  ActiveRoundTheme,
  ThemeEntityKind,
  ThemeInputDefinition,
  ThemeParams,
} from "@/types/types";
export type ThemeTemplate = {
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
export type ThemeCatalogInputNode = {
  children?: ThemeCatalogInputNode[];
  id: string;
  inputDefinitions?: ThemeInputDefinition[];
  label: string;
  themeTemplateId?: string;
};
