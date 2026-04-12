import { initializePlayers, resolveCoinFlip } from "@/games/mentiroso/engine";
import { getThemeCatalog } from "@/games/mentiroso/themeEngine";
import type {
  LocalPlayerInput,
  Player,
  HistoryEntry,
} from "@/games/mentiroso/types";
import type {
  ThemeNode,
} from "@/types/types";

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createHistoryEntry(message: string): HistoryEntry {
  return {
    id: createId("history"),
    message,
    createdAt: new Date().toISOString(),
  };
}

export function getThemeCandidates(): ThemeNode[] {
  return getThemeCatalog();
}

export function buildPlayers(playerInputs: [LocalPlayerInput, LocalPlayerInput]): {
  players: Player[];
  startingPlayerId: string;
} {
  const normalizedPlayers = playerInputs.map((player, index) => ({
    id: `player-${index + 1}`,
    name: player.name.trim() || `Jugador ${index + 1}`,
    coinChoice: player.coinChoice,
  }));

  return initializePlayers(normalizedPlayers);
}

export function resolveOpeningState(players: Player[]) {
  return resolveCoinFlip(players);
}
