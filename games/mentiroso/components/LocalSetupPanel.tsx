/**
 * Responsibilities:
 * - Render the pre-game local setup form for two players.
 * - Keep setup-specific inputs and CTA separate from the round board UI.
 *
 * Move to another module if needed:
 * - If local setup gains presets, validation schemas, or AI opponents,
 *   move those behaviors to a dedicated setup controller/hook.
 * - If online mode introduces lobby creation/join flows, create separate
 *   setup components instead of overloading this local-only panel.
 */

import type { CoinSide } from "@/types/types";

type SetupPlayer = {
  name: string;
  coinChoice: CoinSide;
};

type LocalSetupPanelProps = {
  error: string | null;
  isSubmitting: boolean;
  onCreateGame: () => void;
  onUpdatePlayer: (
    index: 0 | 1,
    field: keyof SetupPlayer,
    value: string,
  ) => void;
  setupPlayers: [SetupPlayer, SetupPlayer];
};

export function LocalSetupPanel({
  error,
  isSubmitting,
  onCreateGame,
  onUpdatePlayer,
  setupPlayers,
}: LocalSetupPanelProps) {
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
                  onUpdatePlayer(index as 0 | 1, "name", event.target.value)
                }
                className="mb-3 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                placeholder={`Jugador ${index + 1}`}
              />
              <select
                value={player.coinChoice}
                onChange={(event) =>
                  onUpdatePlayer(index as 0 | 1, "coinChoice", event.target.value)
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
          onClick={onCreateGame}
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
