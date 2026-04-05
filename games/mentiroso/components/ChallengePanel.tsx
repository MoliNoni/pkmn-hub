/**
 * Responsibilities:
 * - Render the challenge-response UI for the current round.
 * - Keep challenge copy, textarea input, and concede/submit actions grouped.
 *
 * Move to another module if needed:
 * - If online mode adds timers, live validation, or teammate spectators,
 *   split submission form logic from challenge status presentation.
 * - If entry parsing becomes more complex, move input normalization and helper
 *   messaging into a dedicated challenge-form helper module.
 */

type ChallengePanelProps = {
  challengeInput: string;
  isChallengeResponse: boolean;
  isSubmitting: boolean;
  requiredCount: number;
  submittedCount: number;
  themeLabel: string;
  themePluralLabel: string;
  onChallengeInputChange: (value: string) => void;
  onConcede: () => void;
  onSubmit: () => void;
};

export function ChallengePanel({
  challengeInput,
  isChallengeResponse,
  isSubmitting,
  requiredCount,
  submittedCount,
  themeLabel,
  themePluralLabel,
  onChallengeInputChange,
  onConcede,
  onSubmit,
}: ChallengePanelProps) {
  if (!isChallengeResponse) {
    return null;
  }

  return (
    <div className="w-full max-w-[34rem] rounded-[1.6rem] border border-amber-200/40 bg-black/35 p-5 text-center">
      <div className="flex items-center justify-between gap-4 text-left">
        <div>
          <p className="text-sm text-white/80">
            Debes escribir {requiredCount} {themePluralLabel} que cumplan:
          </p>
          <p className="mt-2 font-semibold text-white">{themeLabel}</p>
        </div>
        <p className="shrink-0 text-xl font-semibold text-amber-200">
          {submittedCount}/{requiredCount}
        </p>
      </div>
      <textarea
        value={challengeInput}
        onChange={(event) => onChallengeInputChange(event.target.value)}
        disabled={!isChallengeResponse || isSubmitting}
        rows={4}
        className="mt-4 w-full rounded-[1.3rem] border border-white/15 bg-white/92 px-4 py-3 text-sm text-slate-900 outline-none disabled:bg-white/70"
        placeholder="Puedes escribir los pokémon separados por comas,. Ejemplo: Pichu, Pikachu, Raichu"
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isChallengeResponse || isSubmitting}
          className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:bg-amber-300"
        >
          Agregar respuesta
        </button>
        <button
          type="button"
          onClick={onConcede}
          disabled={!isChallengeResponse || isSubmitting}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90 disabled:bg-white/60"
        >
          Conceder victoria
        </button>
      </div>
    </div>
  );
}
