import { createInitialTurn } from "@/games/mentiroso/engine";
import type { GameState, LocalPlayerInput } from "@/games/mentiroso/types";
import type { ThemeParams } from "@/types/types";

import {
  buildPlayers,
  createHistoryEntry,
  createId,
  getThemeCandidates,
  resolveOpeningState,
} from "@/games/mentiroso/localGameHelpers";
import { getGameOrThrow, saveGame } from "@/games/mentiroso/localGameStore";
import { createRoundTheme } from "@/games/mentiroso/themeEngine";

export function createLocalMentirosoGame(
  playerInputs: [LocalPlayerInput, LocalPlayerInput],
): GameState {
  if (playerInputs[0].coinChoice === playerInputs[1].coinChoice) {
    throw new Error("Cada jugador debe elegir una cara distinta en la moneda.");
  }

  const gameId = createId("game");
  const { players, startingPlayerId } = buildPlayers(playerInputs);
  const { coinFlipResult, winnerPlayerId } = resolveOpeningState(players);
  const turn = createInitialTurn(startingPlayerId);
  const themeOptions = getThemeCandidates();
  const coinFlipWinner = players.find((player) => player.id === winnerPlayerId);

  const gameState: GameState = {
    gameId,
    game: "mentiroso-local",
    status: "waiting-theme",
    players,
    turn: {
      ...turn,
      currentPlayerId: winnerPlayerId,
    },
    bids: [],
    history: [
      createHistoryEntry(
        `${players[0].name} y ${players[1].name} entraron a la partida.`,
      ),
      createHistoryEntry(
        `La moneda cayo en ${coinFlipResult}. ${coinFlipWinner?.name ?? "Jugador 1"} elige el tema.`,
      ),
    ],
    coinFlipResult,
    coinFlipWinnerPlayerId: winnerPlayerId,
    themeOptions,
  };

  saveGame(gameState);
  return gameState;
}

export async function selectRoundTheme(
  gameId: string,
  playerId: string,
  selectedThemeId: string,
  selectedThemeParams: ThemeParams = {},
): Promise<GameState> {
  const game = getGameOrThrow(gameId);

  if (game.status !== "waiting-theme") {
    throw new Error("La ronda ya tiene tema asignado.");
  }

  if (game.coinFlipWinnerPlayerId !== playerId) {
    throw new Error("Solo quien gano la moneda puede elegir el tema.");
  }

  const resolvedTheme = await createRoundTheme(selectedThemeId, selectedThemeParams);
  const themePicker = game.players.find((player) => player.id === playerId);

  const nextState: GameState = {
    ...game,
    status: "in-progress",
    selectedTheme: resolvedTheme,
    turn: {
      ...game.turn,
      phase: "bidding",
      currentPlayerId: game.turn.startingPlayerId,
    },
    history: [
      ...game.history,
      createHistoryEntry(
        `${themePicker?.name ?? "Jugador"} eligio el tema ${resolvedTheme.label}.`,
      ),
    ],
  };

  saveGame(nextState);
  return nextState;
}
