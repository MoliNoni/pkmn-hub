import { validateClaim } from "@/games/mentiroso/gameLogic";
import type { Claim, GameResult } from "@/types/types";

type GameValidator = (payload: Claim) => Promise<GameResult>;

const gameValidators: Record<string, GameValidator> = {
  mentiroso: async (payload) => {
    const result = await validateClaim(payload.items, payload.typeClaim ?? "");
    const invalidPokemons = result.invalidPokemons ?? [];

    return {
      game: payload.game,
      playerId: payload.playerId,
      valid: result.valid,
      checkedAt: new Date().toISOString(),
      items: payload.items,
      typeClaim: payload.typeClaim,
      invalidPokemons,
      details: result.valid
        ? `Todos los Pokemon coinciden con el tipo "${payload.typeClaim ?? ""}".`
        : `Se encontraron ${invalidPokemons.length} Pokemon fuera del tipo "${payload.typeClaim ?? ""}".`,
    };
  },
};

export async function validateGameMove(
  game: string,
  payload: Claim,
): Promise<GameResult> {
  const normalizedGame = game.trim().toLowerCase();
  const validator = gameValidators[normalizedGame];

  if (!validator) {
    throw new Error(`Unsupported game: ${game}`);
  }

  return validator({
    ...payload,
    game: normalizedGame,
  });
}
