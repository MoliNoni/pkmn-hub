import { advanceSubastaTurn, isBidGreaterThanPrevious } from "@/core/gameEngine";
import type { Bid, GameState } from "@/types/types";

import { createHistoryEntry } from "@/games/mentiroso/localGameHelpers";
import { getGameOrThrow, saveGame } from "@/games/mentiroso/localGameStore";

export function submitBid(params: {
  gameId: string;
  playerId: string;
  count: number;
}): GameState {
  const game = getGameOrThrow(params.gameId);

  if (game.status !== "in-progress" || game.turn.phase !== "bidding") {
    throw new Error("La subasta no esta activa.");
  }

  if (game.turn.currentPlayerId !== params.playerId) {
    throw new Error("No es el turno de ese jugador.");
  }

  if (!Number.isInteger(params.count) || params.count <= 0) {
    throw new Error("La cantidad debe ser un entero positivo.");
  }

  if (!isBidGreaterThanPrevious(game.bids, { count: params.count })) {
    throw new Error("La nueva apuesta debe superar todas las anteriores.");
  }

  const currentPlayer = game.players.find((player) => player.id === params.playerId);

  const bid: Bid = {
    playerId: params.playerId,
    playerName: currentPlayer?.name ?? "Jugador",
    count: params.count,
    themeLabel: game.selectedTheme?.label ?? "Tema pendiente",
    createdAt: new Date().toISOString(),
  };

  const nextState: GameState = {
    ...game,
    bids: [...game.bids, bid],
    turn: {
      ...advanceSubastaTurn(game.players, game.turn),
      highestBid: bid,
    },
    history: [
      ...game.history,
      createHistoryEntry(
        `${bid.playerName} dice: puedo decir ${bid.count} elemento(s) del tema ${bid.themeLabel}.`,
      ),
    ],
  };

  saveGame(nextState);
  return nextState;
}
