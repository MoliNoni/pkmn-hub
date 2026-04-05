/**
 * Responsibilities:
 * - Compose the local Mentiroso experience from smaller UI modules.
 * - Own the board layout and connect the local game hook to presentational
 *   panels.
 *
 * Move to another module if needed:
 * - When the online mode arrives, extract a shared `MentirosoBoardLayout`
 *   component and keep this file as a local-only composition wrapper.
 * - If the center board, history sidebar, or player chrome get reused,
 *   split them into their own presentational components.
 */

"use client";

import { BidPanel } from "@/games/mentiroso/components/BidPanel";
import { ChallengePanel } from "@/games/mentiroso/components/ChallengePanel";
import { LocalSetupPanel } from "@/games/mentiroso/components/LocalSetupPanel";
import { RoundResultPanel } from "@/games/mentiroso/components/RoundResultPanel";
import { ThemeSelector } from "@/games/mentiroso/components/ThemeSelector";
import { useLocalMentirosoGame } from "@/games/mentiroso/useLocalMentirosoGame";
import type { ThemeEntityKind } from "@/types/types";

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

export default function LocalMentirosoBoard() {
  const {
    bidCount,
    challengeInput,
    currentPlayer,
    error,
    gameState,
    handleBid,
    handleChallengeResponse,
    handleConcede,
    handleCreateGame,
    handleLiar,
    handleThemeMenuClick,
    handleThemeSelection,
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
  } = useLocalMentirosoGame();

  if (!gameState) {
    return (
      <LocalSetupPanel
        error={error}
        isSubmitting={isSubmitting}
        onCreateGame={handleCreateGame}
        onUpdatePlayer={updatePlayer}
        setupPlayers={setupPlayers}
      />
    );
  }

  const leftPlayer = gameState.players[0] ?? null;
  const rightPlayer = gameState.players[1] ?? null;
  const lastBid = gameState.bids.at(-1);
  const canBid = gameState.status === "in-progress";
  const canCallLiar = Boolean(canBid && lastBid);
  const isThemeSelection = gameState.status === "waiting-theme";
  const isChallengeResponse = gameState.status === "challenge-response";
  const isRoundEnded = gameState.status === "round-ended";
  const activeTheme = gameState.selectedTheme ?? null;
  const activeThemeCopy = getEntityCopy(
    gameState.challenge?.theme.entityKind ?? activeTheme?.entityKind ?? "pokemon",
  );
  const turnLabel = currentPlayer ? `Turno de ${currentPlayer.name}` : "Tu turno";
  const centerMessage = lastBid
    ? `${lastBid.playerName} puede decir ${lastBid.count}`
    : `${currentPlayer?.name ?? "Jugador"} puede decir ${bidCount}`;

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
              <BidPanel
                bidCount={bidCount}
                canBid={canBid}
                canCallLiar={canCallLiar}
                isSubmitting={isSubmitting}
                onBidCountChange={setBidCount}
                onCallLiar={handleLiar}
                onSubmitBid={handleBid}
              />

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

                  <ThemeSelector
                    onMenuClick={handleThemeMenuClick}
                    onParamChange={updateThemeParam}
                    openPath={openThemePath}
                    selectedThemeId={themeChoice}
                    selectedThemeNode={selectedThemeNode}
                    selectedThemePath={selectedThemePath}
                    themeNodes={gameState.themeOptions}
                    themeParams={themeParams}
                  />

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

              <ChallengePanel
                challengeInput={challengeInput}
                isChallengeResponse={isChallengeResponse}
                isSubmitting={isSubmitting}
                requiredCount={gameState.challenge?.requiredCount ?? 0}
                submittedCount={gameState.challenge?.submittedEntries.length ?? 0}
                themeLabel={gameState.challenge?.theme.label ?? ""}
                themePluralLabel={activeThemeCopy.plural}
                onChallengeInputChange={setChallengeInput}
                onConcede={handleConcede}
                onSubmit={handleChallengeResponse}
              />

              <RoundResultPanel
                gameState={gameState}
                isRoundEnded={isRoundEnded}
              />
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
