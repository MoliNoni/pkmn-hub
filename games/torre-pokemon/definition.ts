import type { GameDefinition } from "@/games/shared/gameDefinition";
import { createTorrePokemonGame } from "@/games/torre-pokemon/service";
import type { TorrePokemonGameState, TorrePokemonTurnRequest } from "@/games/torre-pokemon/types";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isTorrePokemonTurnRequest(value: unknown): value is TorrePokemonTurnRequest {
  return (
    isObject(value) &&
    value.gameType === "torre-pokemon-local" &&
    value.action === "init"
  );
}

export const torrepokemonGameDefinition: GameDefinition<TorrePokemonTurnRequest, TorrePokemonGameState> = {
  gameType: "torre-pokemon-local",
  isRequest: isTorrePokemonTurnRequest,
  handleAction: async () => createTorrePokemonGame(),
  metadata: {
    id: "torre-pokemon",
    title: "Torre Pokemon",
    shortTitle: "Torre",
    description:
      "Modo de progresion por pisos para responder desafios Pokemon cada vez mas exigentes.",
    availability: "coming-soon",
    sharedMechanics: ["pokemon-answer-validation"],
  },
};
