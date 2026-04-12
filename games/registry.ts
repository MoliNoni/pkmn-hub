import { mentirosoGameDefinition } from "@/games/mentiroso/definition";
import type { GameDefinition } from "@/games/shared/gameDefinition";

const gameDefinitions = [mentirosoGameDefinition] as const;

const gameDefinitionMap = new Map<string, GameDefinition>(
  gameDefinitions.map((definition) => [definition.gameType, definition]),
);

export function getGameDefinition(gameType: string): GameDefinition | null {
  return gameDefinitionMap.get(gameType) ?? null;
}

export function getRegisteredGameTypes(): string[] {
  return [...gameDefinitionMap.keys()];
}
