/**
 * Responsibilities:
 * - Own all interactive state for the local Mentiroso experience.
 * - Coordinate UI actions with the local transport client.
 * - Derive the minimal view model the board needs (`currentPlayer`,
 *   `selectedThemeNode`, `selectedThemePath`, counters, booleans).
 *
 * Move to another module if needed:
 * - If local and online modes converge, split this into a shared
 *   `useMentirosoBoardState` hook plus mode-specific data sources.
 * - If turn synchronization, subscriptions, or reconnection logic appear,
 *   move server-state orchestration to a dedicated controller/store layer.
 */

import { useMemo, useState } from "react";

import { localTurnClient } from "@/games/mentiroso/localTurnClient";
import type {
  GameState,
  LocalPlayerInput,
} from "@/games/mentiroso/types";
import {
  findFirstSelectableThemeNode,
  findThemeNodeById,
  findThemeNodePath,
} from "@/games/mentiroso/themeMenuUtils";
import type {
  CoinSide,
  ThemeNode,
  ThemeParams,
} from "@/types/types";

type SetupPlayer = {
  name: string;
  coinChoice: CoinSide;
};

const initialPlayers: [SetupPlayer, SetupPlayer] = [
  { name: "Ash", coinChoice: "cara" },
  { name: "Misty", coinChoice: "sello" },
];

function getDefaultThemeParams(node: ThemeNode | null): ThemeParams {
  const definitions = node?.inputDefinitions ?? [];

  return definitions.reduce<ThemeParams>((params, definition) => {
    params[definition.key] = "";
    return params;
  }, {});
}

export function useLocalMentirosoGame() {
  const [setupPlayers, setSetupPlayers] = useState(initialPlayers);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bidCount, setBidCount] = useState("1");
  const [themeChoice, setThemeChoice] = useState<string | null>(null);
  const [themeParams, setThemeParams] = useState<ThemeParams>({});
  const [openThemePath, setOpenThemePath] = useState<string[]>([]);
  const [challengeInput, setChallengeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlayer = useMemo(
    () =>
      gameState?.players.find(
        (player) => player.id === gameState.turn.currentPlayerId,
      ) ?? null,
    [gameState],
  );
  const selectedThemePath = useMemo(
    () =>
      gameState && themeChoice
        ? findThemeNodePath(gameState.themeOptions, themeChoice)
        : null,
    [gameState, themeChoice],
  );
  const selectedThemeNode = useMemo(
    () =>
      gameState && themeChoice
        ? findThemeNodeById(gameState.themeOptions, themeChoice)
        : null,
    [gameState, themeChoice],
  );

  function updatePlayer(
    index: 0 | 1,
    field: keyof SetupPlayer,
    value: string,
  ): void {
    setSetupPlayers((currentPlayers) => {
      const nextPlayers = [...currentPlayers] as [SetupPlayer, SetupPlayer];
      nextPlayers[index] = {
        ...nextPlayers[index],
        [field]: value,
      };

      return nextPlayers;
    });
  }

  function handleThemeNodeSelection(node: ThemeNode): void {
    if (!node.themeTemplateId) {
      return;
    }

    setThemeChoice(node.themeTemplateId);
    setThemeParams(getDefaultThemeParams(node));
  }

  function handleThemeMenuClick(node: ThemeNode, level: number): void {
    setOpenThemePath((currentPath) => {
      const isSameNode = currentPath[level] === node.id;
      const nextPath = currentPath.slice(0, level);

      if (isSameNode) {
        return nextPath;
      }

      return [...nextPath, node.id];
    });

    if (node.themeTemplateId) {
      handleThemeNodeSelection(node);
    }
  }

  function updateThemeParam(key: string, value: string): void {
    setThemeParams((currentParams) => ({
      ...currentParams,
      [key]: value,
    }));
  }

  async function runGameAction(action: () => Promise<GameState>): Promise<void> {
    setIsSubmitting(true);
    setError(null);

    try {
      const nextGameState = await action();
      setGameState(nextGameState);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo completar la accion.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateGame(): Promise<void> {
    await runGameAction(async () => {
      const nextGameState = await localTurnClient.createGame(
        setupPlayers as [LocalPlayerInput, LocalPlayerInput],
      );
      const initialThemeNode = findFirstSelectableThemeNode(
        nextGameState.themeOptions,
      );

      setThemeChoice(initialThemeNode?.themeTemplateId ?? null);
      setThemeParams(getDefaultThemeParams(initialThemeNode));
      setOpenThemePath([]);
      setBidCount("1");
      setChallengeInput("");

      return nextGameState;
    });
  }

  async function handleThemeSelection(): Promise<void> {
    if (!gameState || !themeChoice) {
      return;
    }

    await runGameAction(async () => {
      const nextGameState = await localTurnClient.selectTheme({
        gameId: gameState.gameId,
        playerId: gameState.coinFlipWinnerPlayerId,
        selectedThemeId: themeChoice,
        selectedThemeParams: themeParams,
      });

      setBidCount("1");
      return nextGameState;
    });
  }

  async function handleBid(): Promise<void> {
    if (!gameState || !currentPlayer) {
      return;
    }

    await runGameAction(async () => {
      const nextGameState = await localTurnClient.submitBid({
        count: Number(bidCount),
        gameId: gameState.gameId,
        playerId: currentPlayer.id,
      });

      setBidCount(String(Number(bidCount) + 1));
      return nextGameState;
    });
  }

  async function handleLiar(): Promise<void> {
    if (!gameState || !currentPlayer) {
      return;
    }

    await runGameAction(async () => {
      const nextGameState = await localTurnClient.callLiar(
        gameState.gameId,
        currentPlayer.id,
      );

      setChallengeInput("");
      return nextGameState;
    });
  }

  async function handleChallengeResponse(): Promise<void> {
    if (!gameState || !currentPlayer) {
      return;
    }

    await runGameAction(async () => {
      const nextGameState = await localTurnClient.submitChallengeResponse({
        entries: challengeInput
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
        gameId: gameState.gameId,
        playerId: currentPlayer.id,
      });

      setChallengeInput("");
      return nextGameState;
    });
  }

  async function handleConcede(): Promise<void> {
    if (!gameState || !currentPlayer) {
      return;
    }

    await runGameAction(async () => {
      const nextGameState = await localTurnClient.concede(
        gameState.gameId,
        currentPlayer.id,
      );

      setChallengeInput("");
      return nextGameState;
    });
  }

  return {
    bidCount,
    challengeInput,
    currentPlayer,
    error,
    gameState,
    isSubmitting,
    openThemePath,
    selectedThemeNode,
    selectedThemePath,
    setBidCount,
    setChallengeInput,
    setupPlayers,
    themeChoice,
    themeParams,
    updatePlayer,
    updateThemeParam,
    handleBid,
    handleChallengeResponse,
    handleConcede,
    handleCreateGame,
    handleLiar,
    handleThemeMenuClick,
    handleThemeSelection,
  };
}
