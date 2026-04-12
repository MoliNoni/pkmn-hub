import type { GameDefinition } from "@/games/shared/gameDefinition";
import { createFirstOneToSayGame } from "@/games/first-one-to-say/service";
import type { FirstOneToSayGameState, FirstOneToSayTurnRequest } from "@/games/first-one-to-say/types";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isFirstOneToSayTurnRequest(value: unknown): value is FirstOneToSayTurnRequest {
  return (
    isObject(value) &&
    value.gameType === "first-one-to-say-local" &&
    value.action === "init"
  );
}

export const firstonetosayGameDefinition: GameDefinition<FirstOneToSayTurnRequest, FirstOneToSayGameState> = {
  gameType: "first-one-to-say-local",
  isRequest: isFirstOneToSayTurnRequest,
  handleAction: async () => createFirstOneToSayGame(),
};
