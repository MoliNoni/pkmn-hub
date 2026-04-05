"use client";

import { useMemo, useState } from "react";

import type {
  CoinSide,
  GameState,
  ThemeEntityKind,
  ThemeInputDefinition,
  ThemeNode,
  ThemeParams,
} from "@/types/types";

type SetupPlayer = {
  name: string;
  coinChoice: CoinSide;
};

type ThemeMenuLevelProps = {
  allNodes: ThemeNode[];
  level: number;
  nodes: ThemeNode[];
  onNodeClick: (node: ThemeNode, level: number) => void;
  openPath: string[];
  selectedThemeId: string | null;
};

const initialPlayers: [SetupPlayer, SetupPlayer] = [
  { name: "Ash", coinChoice: "cara" },
  { name: "Misty", coinChoice: "sello" },
];

async function sendTurnRequest(body: unknown): Promise<GameState> {
  const response = await fetch("/api/games/turn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as GameState | { error: string };

  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "Request failed.");
  }

  return data;
}

function findFirstSelectableThemeNode(nodes: ThemeNode[]): ThemeNode | null {
  for (const node of nodes) {
    if (node.themeTemplateId) {
      return node;
    }

    const nestedNode = findFirstSelectableThemeNode(node.children);

    if (nestedNode) {
      return nestedNode;
    }
  }

  return null;
}

function findThemeNodeByNodeId(nodes: ThemeNode[], nodeId: string): ThemeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    const nestedNode = findThemeNodeByNodeId(node.children, nodeId);

    if (nestedNode) {
      return nestedNode;
    }
  }

  return null;
}

function findThemeNodeById(nodes: ThemeNode[], themeId: string): ThemeNode | null {
  for (const node of nodes) {
    if (node.themeTemplateId === themeId) {
      return node;
    }

    const nestedNode = findThemeNodeById(node.children, themeId);

    if (nestedNode) {
      return nestedNode;
    }
  }

  return null;
}

function findThemeNodePath(
  nodes: ThemeNode[],
  themeId: string,
  trail: string[] = [],
): string[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node.label];

    if (node.themeTemplateId === themeId) {
      return nextTrail;
    }

    const nestedMatch = findThemeNodePath(node.children, themeId, nextTrail);

    if (nestedMatch) {
      return nestedMatch;
    }
  }

  return null;
}

function getNodeChildrenAtPath(nodes: ThemeNode[], path: string[]): ThemeNode[] {
  if (!path.length) {
    return [];
  }

  const currentNode = findThemeNodeByNodeId(nodes, path[0]);

  if (!currentNode) {
    return [];
  }

  if (path.length === 1) {
    return currentNode.children;
  }

  return getNodeChildrenAtPath(currentNode.children, path.slice(1));
}

function getDefaultThemeParams(node: ThemeNode | null): ThemeParams {
  const definitions = node?.inputDefinitions ?? [];

  return definitions.reduce<ThemeParams>((params, definition) => {
    params[definition.key] = "";
    return params;
  }, {});
}

function getEntityCopy(entityKind: ThemeEntityKind): {
  plural: string;
  singular: string;
} {
  if (entityKind === "item") {
    return { singular: "item", plural: "items" };
  }

  if (entityKind === "move") {
    return { singular: "movimiento", plural: "movimientos" };
  }

  return { singular: "Pokemon", plural: "Pokemon" };
}

function ThemeMenuLevel({
  allNodes,
  level,
  nodes,
  onNodeClick,
  openPath,
  selectedThemeId,
}: ThemeMenuLevelProps) {
  if (!nodes.length) {
    return null;
  }

  const wrapperClassName =
    level === 0
      ? "mt-5 flex flex-wrap items-start justify-center gap-3"
      : "flex min-w-[18rem] flex-col gap-3 rounded-[1.2rem] border border-white/10 bg-[#180814]/95 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)]";

  return (
    <div className={wrapperClassName}>
      {nodes.map((node) => {
        const isOpen = openPath[level] === node.id;
        const isSelected = node.themeTemplateId === selectedThemeId;
        const childNodes =
          isOpen && node.children.length
            ? getNodeChildrenAtPath(allNodes, [...openPath.slice(0, level), node.id])
            : [];
        const childWrapperClassName =
          level === 0
            ? "absolute bottom-full left-0 mb-3"
            : "absolute left-full top-0 ml-3";

        return (
          <div key={node.id} className="relative">
            <button
              type="button"
              onClick={() => onNodeClick(node, level)}
              className={`flex min-h-[4.25rem] min-w-[15rem] items-center justify-between gap-3 rounded-[1.2rem] border px-4 py-3 text-left text-sm transition ${
                isOpen || isSelected
                  ? "border-amber-300 bg-amber-400/20 text-amber-100"
                  : "border-white/10 bg-white/8 text-white hover:border-white/25 hover:bg-white/12"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base text-white/65">▸</span>
                <span>{node.label}</span>
              </div>
              {node.children.length ? (
                <span className="text-xs text-white/55">▸</span>
              ) : null}
            </button>

            {childNodes.length ? (
              <div className={childWrapperClassName}>
                <ThemeMenuLevel
                  allNodes={allNodes}
                  level={level + 1}
                  nodes={childNodes}
                  onNodeClick={onNodeClick}
                  openPath={openPath}
                  selectedThemeId={selectedThemeId}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ThemeParamField(props: {
  definition: ThemeInputDefinition;
  onChange: (key: string, value: string) => void;
  value: string;
}) {
  const { definition, onChange, value } = props;

  if (definition.type === "select") {
    return (
      <label className="flex flex-col gap-2 text-sm text-white/85">
        <span>{definition.label}</span>
        <select
          value={value}
          onChange={(event) => onChange(definition.key, event.target.value)}
          className="rounded-2xl border border-white/15 bg-white/92 px-4 py-3 text-sm text-slate-900 outline-none"
        >
          <option value="">{definition.placeholder ?? "Selecciona una opcion"}</option>
          {(definition.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-2 text-sm text-white/85">
      <span>{definition.label}</span>
      <input
        type={definition.type}
        min={definition.min}
        max={definition.max}
        maxLength={definition.type === "text" ? definition.max : undefined}
        value={value}
        onChange={(event) => onChange(definition.key, event.target.value)}
        placeholder={definition.placeholder}
        className="rounded-2xl border border-white/15 bg-white/92 px-4 py-3 text-sm text-slate-900 outline-none"
      />
    </label>
  );
}

export default function LocalGameBoard() {
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

  const leftPlayer = gameState?.players[0] ?? null;
  const rightPlayer = gameState?.players[1] ?? null;
  const lastBid = gameState?.bids.at(-1);
  const canBid = gameState?.status === "in-progress";
  const canCallLiar = Boolean(canBid && lastBid);
  const isThemeSelection = gameState?.status === "waiting-theme";
  const isChallengeResponse = gameState?.status === "challenge-response";
  const isRoundEnded = gameState?.status === "round-ended";
  const activeTheme = gameState?.selectedTheme ?? null;
  const challengeTheme = gameState?.challenge?.theme ?? null;
  const submittedChallengeCount =
    gameState?.challenge?.submittedEntries.length ?? 0;
  const requiredChallengeCount = gameState?.challenge?.requiredCount ?? 0;
  const turnLabel = currentPlayer ? `Turno de ${currentPlayer.name}` : "Tu turno";
  const centerMessage = lastBid
    ? `${lastBid.playerName} puede decir ${lastBid.count}`
    : `${currentPlayer?.name ?? "Jugador"} puede decir ${bidCount}`;
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
  const activeThemeCopy = getEntityCopy(
    activeTheme?.entityKind ?? challengeTheme?.entityKind ?? "pokemon",
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

  async function handleCreateGame() {
    setIsSubmitting(true);
    setError(null);

    try {
      const nextGameState = await sendTurnRequest({
        action: "init",
        players: setupPlayers,
      });
      const initialThemeNode = findFirstSelectableThemeNode(nextGameState.themeOptions);

      setGameState(nextGameState);
      setThemeChoice(initialThemeNode?.themeTemplateId ?? null);
      setThemeParams(getDefaultThemeParams(initialThemeNode));
      setOpenThemePath([]);
      setBidCount("1");
      setChallengeInput("");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No se pudo crear la partida.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleThemeSelection() {
    if (!gameState || !themeChoice) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const nextGameState = await sendTurnRequest({
        action: "select_theme",
        gameId: gameState.gameId,
        playerId: gameState.coinFlipWinnerPlayerId,
        selectedThemeId: themeChoice,
        selectedThemeParams: themeParams,
      });

      setGameState(nextGameState);
      setBidCount("1");
    } catch (selectionError) {
      setError(
        selectionError instanceof Error
          ? selectionError.message
          : "No se pudo elegir el tema.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBid() {
    if (!gameState || !currentPlayer) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const nextGameState = await sendTurnRequest({
        action: "bid",
        gameId: gameState.gameId,
        playerId: currentPlayer.id,
        count: Number(bidCount),
      });

      setGameState(nextGameState);
      setBidCount(String(Number(bidCount) + 1));
    } catch (bidError) {
      setError(
        bidError instanceof Error ? bidError.message : "No se pudo ofertar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLiar() {
    if (!gameState || !currentPlayer) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const nextGameState = await sendTurnRequest({
        action: "liar",
        gameId: gameState.gameId,
        playerId: currentPlayer.id,
      });

      setGameState(nextGameState);
      setChallengeInput("");
    } catch (liarError) {
      setError(
        liarError instanceof Error
          ? liarError.message
          : "No se pudo resolver el desafio.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChallengeResponse() {
    if (!gameState || !currentPlayer) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const nextGameState = await sendTurnRequest({
        action: "submit_challenge_response",
        gameId: gameState.gameId,
        playerId: currentPlayer.id,
        entries: challengeInput
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      });

      setGameState(nextGameState);
      setChallengeInput("");
    } catch (challengeError) {
      setError(
        challengeError instanceof Error
          ? challengeError.message
          : "No se pudo resolver la respuesta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConcede() {
    if (!gameState || !currentPlayer) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const nextGameState = await sendTurnRequest({
        action: "concede",
        gameId: gameState.gameId,
        playerId: currentPlayer.id,
      });

      setGameState(nextGameState);
      setChallengeInput("");
    } catch (concedeError) {
      setError(
        concedeError instanceof Error
          ? concedeError.message
          : "No se pudo conceder la ronda.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!gameState) {
    return (
      <section className="w-full max-w-5xl rounded-[2rem] border border-white/20 bg-black/35 p-6 text-white shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200">
            Mentiroso Pokemon
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Prepara la partida local
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
            Define los dos jugadores y su eleccion de moneda. Luego podras
            elegir un tema jerarquico para la ronda.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-4 md:grid-cols-2">
            {setupPlayers.map((player, index) => (
              <div
                key={`setup-${index}`}
                className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5"
              >
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Jugador {index + 1}
                </p>
                <input
                  value={player.name}
                  onChange={(event) =>
                    updatePlayer(index as 0 | 1, "name", event.target.value)
                  }
                  className="mb-3 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                  placeholder={`Jugador ${index + 1}`}
                />
                <select
                  value={player.coinChoice}
                  onChange={(event) =>
                    updatePlayer(
                      index as 0 | 1,
                      "coinChoice",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="cara">Cara</option>
                  <option value="sello">Sello</option>
                </select>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCreateGame}
            disabled={isSubmitting}
            className="h-fit rounded-full border-4 border-white bg-[#8d0016] px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#a9001b] disabled:cursor-not-allowed disabled:bg-[#8d0016]/60"
          >
            {isSubmitting ? "Creando..." : "Crear partida"}
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-950/35 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <div className="flex w-full max-w-[110rem] items-stretch gap-6">
      <section className="relative min-w-0 flex-1 overflow-hidden rounded-[2.2rem] border border-white/15 bg-black/20 p-4 text-white shadow-[0_28px_100px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-6 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-8%] top-[56%] h-[4px] w-[120%] rotate-[-26deg] bg-black/85 shadow-[0_0_0_2px_rgba(255,255,255,0.06)]"
        />

        <div className="relative min-h-[720px] lg:min-h-[760px]">
          <div className="absolute left-0 top-0 flex max-w-[14rem] flex-col">
            <span className="text-sm uppercase tracking-[0.3em] text-white/50">
              Jugador 1
            </span>
            <span className="mt-2 text-3xl font-semibold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:text-4xl">
              {leftPlayer?.name ?? "Jugador 1"}
            </span>
            <span className="mt-2 text-sm text-white/65">
              {leftPlayer ? `${leftPlayer.points} punto(s)` : ""}
            </span>
          </div>

          <div className="absolute bottom-0 right-0 flex max-w-[14rem] flex-col items-end text-right">
            <span className="text-sm uppercase tracking-[0.3em] text-white/50">
              Jugador 2
            </span>
            <span className="mt-2 text-3xl font-semibold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:text-4xl">
              {rightPlayer?.name ?? "Jugador 2"}
            </span>
            <span className="mt-2 text-sm text-white/65">
              {rightPlayer ? `${rightPlayer.points} punto(s)` : ""}
            </span>
          </div>

          <div className="mx-auto flex max-w-[16rem] flex-col items-center pt-2 text-center">
            <span className="text-xl font-semibold text-white sm:text-2xl">
              {turnLabel}
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center px-4 pb-44 pt-4 sm:pb-40 lg:pb-28">
            <div className="relative flex h-[22rem] w-[22rem] flex-col overflow-hidden rounded-full border-[6px] border-white/90 bg-white shadow-[0_28px_70px_rgba(0,0,0,0.5)] sm:h-[25rem] sm:w-[25rem]">
              <div className="flex flex-[1.08] flex-col items-center justify-center bg-[#d80f26] px-6 text-center">
                <span className="text-sm uppercase tracking-[0.45em] text-white/70">
                  Tema
                </span>
                <span className="mt-3 text-center text-2xl font-semibold uppercase leading-tight tracking-[0.08em] text-white sm:text-3xl">
                  {activeTheme?.label ?? "Pendiente"}
                </span>
              </div>

              <div className="relative h-[8px] bg-black">
                <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-black bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.2)] sm:h-16 sm:w-16" />
              </div>

              <div className="flex flex-1 flex-col items-center justify-center px-7 text-center text-slate-900">
                <span className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Declaracion actual
                </span>
                <p className="mt-3 max-w-[14rem] text-xl font-semibold leading-tight sm:text-2xl">
                  {centerMessage}
                </p>
              </div>
            </div>

            <div className="mt-8 flex w-full max-w-3xl flex-col items-center gap-4">
              {canBid ? (
                <>
                  <button
                    type="button"
                    onClick={handleLiar}
                    disabled={!canCallLiar || isSubmitting}
                    className="min-w-[16rem] rounded-full border-[5px] border-white bg-[#8d0016] px-8 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition hover:bg-[#a9001b] disabled:cursor-not-allowed disabled:bg-[#8d0016]/60"
                  >
                    !Mentiroso!
                  </button>

                  <div className="flex w-full max-w-[34rem] items-center justify-center rounded-full border-[5px] border-white bg-[#8d0016] px-4 py-4 text-center shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                    <div className="flex flex-wrap items-center justify-center gap-3 text-white">
                      <span className="text-sm font-medium sm:text-base">
                        Yo puedo decir
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={bidCount}
                        onChange={(event) => setBidCount(event.target.value)}
                        disabled={!canBid || isSubmitting}
                        className="w-24 rounded-full border border-white/20 bg-white px-4 py-2 text-center text-base font-semibold text-slate-900 outline-none disabled:bg-white/70"
                      />
                      <button
                        type="button"
                        onClick={handleBid}
                        disabled={!canBid || isSubmitting}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8d0016] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/60"
                      >
                        Aceptar
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              {isThemeSelection ? (
                <div className="w-full max-w-[52rem] rounded-[1.6rem] border border-amber-200/40 bg-black/35 p-5 text-center">
                  <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">
                    Seleccion de tema
                  </p>
                  <p className="mt-3 text-sm text-white/80">
                    {
                      gameState.players.find(
                        (player) => player.id === gameState.coinFlipWinnerPlayerId,
                      )?.name
                    }{" "}
                    gano la moneda y elige el tema de la ronda. Haz click en una
                    categoria principal para desplegar sus subcategorias.
                  </p>

                  <div className="relative">
                    <ThemeMenuLevel
                      allNodes={gameState.themeOptions}
                      level={0}
                      nodes={gameState.themeOptions}
                      onNodeClick={handleThemeMenuClick}
                      openPath={openThemePath}
                      selectedThemeId={themeChoice}
                    />
                  </div>

                  <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4 text-left text-sm text-white/85">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Tema seleccionado
                    </p>
                    <p className="mt-2 font-semibold text-white">
                      {selectedThemePath?.join(" > ") ?? "Ninguno"}
                    </p>

                    {selectedThemeNode?.inputDefinitions?.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {selectedThemeNode.inputDefinitions.map((definition) => (
                          <ThemeParamField
                            key={`${selectedThemeNode.id}-${definition.key}`}
                            definition={definition}
                            onChange={updateThemeParam}
                            value={String(themeParams[definition.key] ?? "")}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleThemeSelection}
                      disabled={isSubmitting || !themeChoice}
                      className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:bg-amber-300"
                    >
                      Confirmar tema
                    </button>
                  </div>
                </div>
              ) : null}

              {isChallengeResponse && gameState.challenge ? (
                <div className="w-full max-w-[34rem] rounded-[1.6rem] border border-amber-200/40 bg-black/35 p-5 text-center">
                  <div className="flex items-center justify-between gap-4 text-left">
                    <div>
                      <p className="text-sm text-white/80">
                        Debes escribir {requiredChallengeCount}{" "}
                        {activeThemeCopy.plural} que cumplan:
                      </p>
                      <p className="mt-2 font-semibold text-white">
                        {gameState.challenge.theme.label}
                      </p>
                    </div>
                    <p className="shrink-0 text-xl font-semibold text-amber-200">
                      {submittedChallengeCount}/{requiredChallengeCount}
                    </p>
                  </div>
                  <textarea
                    value={challengeInput}
                    onChange={(event) => setChallengeInput(event.target.value)}
                    disabled={!isChallengeResponse || isSubmitting}
                    rows={4}
                    className="mt-4 w-full rounded-[1.3rem] border border-white/15 bg-white/92 px-4 py-3 text-sm text-slate-900 outline-none disabled:bg-white/70"
                    placeholder="Puedes escribir los pokémon separados por comas,. Ejemplo: Pichu, Pikachu, Raichu"
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={handleChallengeResponse}
                      disabled={!isChallengeResponse || isSubmitting}
                      className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:bg-amber-300"
                    >
                      Agregar respuesta
                    </button>
                    <button
                      type="button"
                      onClick={handleConcede}
                      disabled={!isChallengeResponse || isSubmitting}
                      className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90 disabled:bg-white/60"
                    >
                      Conceder victoria
                    </button>
                  </div>
                </div>
              ) : null}

              {isRoundEnded && gameState.roundResult ? (
                <div className="w-full max-w-[34rem] rounded-[1.6rem] border border-emerald-200/40 bg-black/35 p-5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                  <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
                    Ronda terminada
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    Gana{" "}
                    {
                      gameState.players.find(
                        (player) =>
                          player.id === gameState.roundResult?.winnerPlayerId,
                      )?.name
                    }
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Tema resuelto: {gameState.roundResult.selectedTheme.label}
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Conteo real: {gameState.roundResult.actualCount}
                  </p>
                  {gameState.roundResult.submittedEntries?.length ? (
                    <p className="mt-2 text-sm text-white/80">
                      Respondio con:{" "}
                      {gameState.roundResult.submittedEntries.join(", ")}
                    </p>
                  ) : null}
                  {gameState.roundResult.invalidEntries?.length ? (
                    <p className="mt-2 text-sm text-rose-200">
                      Invalidos: {gameState.roundResult.invalidEntries.join(", ")}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-[1.4rem] border border-red-300/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </section>

      <aside className="hidden w-full max-w-[24rem] shrink-0 rounded-[2.2rem] border border-white/15 bg-black/35 p-5 text-white shadow-[0_28px_100px_rgba(0,0,0,0.35)] backdrop-blur-md xl:block">
        <p className="text-xs uppercase tracking-[0.4em] text-white/55">
          Historial
        </p>
        <div className="mt-4 max-h-[42rem] space-y-3 overflow-y-auto pr-1">
          {gameState.history.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[1.2rem] border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-white/80"
            >
              {entry.message}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
