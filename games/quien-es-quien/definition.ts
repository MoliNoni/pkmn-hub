import type { GameDefinition } from "@/games/shared/gameDefinition";
import { createQuienEsQuienGame } from "@/games/quien-es-quien/service";
import type { QuienEsQuienGameState, QuienEsQuienTurnRequest } from "@/games/quien-es-quien/types";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isQuienEsQuienTurnRequest(value: unknown): value is QuienEsQuienTurnRequest {
  return (
    isObject(value) &&
    value.gameType === "quien-es-quien-local" &&
    value.action === "init"
  );
}

export const quienesquienGameDefinition: GameDefinition<QuienEsQuienTurnRequest, QuienEsQuienGameState> = {
  gameType: "quien-es-quien-local",
  isRequest: isQuienEsQuienTurnRequest,
  handleAction: async () => createQuienEsQuienGame(),
};
