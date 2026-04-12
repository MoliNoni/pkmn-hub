/**
 * Responsibilities:
 * - Present the result of a finished round.
 * - Keep winner/result summary UI separate from the board orchestration.
 *
 * Move to another module if needed:
 * - If rounds gain replay data, scoring breakdowns, or animations, split the
 *   summary card from richer analytics/replay sections.
 * - If multiple games share result cards, extract a generic round-result view.
 */

import type { GameState } from "@/games/mentiroso/types";

type RoundResultPanelProps = {
  gameState: GameState;
  isRoundEnded: boolean;
};

export function RoundResultPanel({
  gameState,
  isRoundEnded,
}: RoundResultPanelProps) {
  if (!isRoundEnded || !gameState.roundResult) {
    return null;
  }

  return (
    <div className="w-full max-w-[34rem] rounded-[1.6rem] border border-emerald-200/40 bg-black/35 p-5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/80">
        Ronda terminada
      </p>
      <p className="mt-3 text-lg font-semibold text-white">
        Gana{" "}
        {
          gameState.players.find(
            (player) => player.id === gameState.roundResult?.winnerPlayerId,
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
          Respondio con: {gameState.roundResult.submittedEntries.join(", ")}
        </p>
      ) : null}
      {gameState.roundResult.invalidEntries?.length ? (
        <p className="mt-2 text-sm text-rose-200">
          Invalidos: {gameState.roundResult.invalidEntries.join(", ")}
        </p>
      ) : null}
    </div>
  );
}
