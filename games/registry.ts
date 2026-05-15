import { firstonetosayGameDefinition } from "@/games/first-one-to-say/definition";
import { mentirosoGameDefinition } from "@/games/mentiroso/definition";
import { quienesquienGameDefinition } from "@/games/quien-es-quien/definition";
import type { GameDefinition } from "@/games/shared/gameDefinition";
import { torrepokemonGameDefinition } from "@/games/torre-pokemon/definition";

const gameDefinitions = [
  mentirosoGameDefinition,
  firstonetosayGameDefinition,
  torrepokemonGameDefinition,
  quienesquienGameDefinition,
] as const;

const gameDefinitionMap = new Map<string, GameDefinition>(
  gameDefinitions.map((definition) => [definition.gameType, definition]),
);

export function getGameDefinition(gameType: string): GameDefinition | null {
  return gameDefinitionMap.get(gameType) ?? null;
}

export function getRegisteredGameTypes(): string[] {
  return [...gameDefinitionMap.keys()];
}

export function getGameDefinitions(): GameDefinition[] {
  return [...gameDefinitionMap.values()];
}
