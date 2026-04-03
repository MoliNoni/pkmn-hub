import { initializePlayers, resolveCoinFlip } from "@/core/gameEngine";
import { POKEMON_TYPES } from "@/types/types";
import type {
  HistoryEntry,
  LocalPlayerInput,
  Player,
  PokemonType,
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

export function getThemeCandidates(): PokemonType[] {
  return [...POKEMON_TYPES];
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
