"use client";

import { useMemo, useState } from "react";

import type { CoinSide, GameState, PokemonType } from "@/types/types";

type SetupPlayer = {
  name: string;
  coinChoice: CoinSide;
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

export default function LocalGameBoard() {
  const [setupPlayers, setSetupPlayers] = useState(initialPlayers);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bidCount, setBidCount] = useState("1");
  const [themeChoice, setThemeChoice] = useState<PokemonType>("fire");
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
  const lockedBidType = gameState?.selectedThemeType ?? "fire";
  const submittedChallengeCount =
    gameState?.challenge?.submittedPokemons.length ?? 0;
  const requiredChallengeCount = gameState?.challenge?.requiredCount ?? 0;
  const turnLabel = currentPlayer ? `Turno de ${currentPlayer.name}` : "Tu turno";
  const centerMessage = lastBid
    ? `${lastBid.playerName} puede decir ${lastBid.count}`
    : `${currentPlayer?.name ?? "Jugador"} puede decir ${bidCount}`;

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

  async function handleCreateGame() {
    setIsSubmitting(true);
    setError(null);

    try {
      const nextGameState = await sendTurnRequest({
        action: "init",
        players: setupPlayers,
      });

      setGameState(nextGameState);
      setThemeChoice(nextGameState.themeOptions[0] ?? "fire");
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
    if (!gameState) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const nextGameState = await sendTurnRequest({
        action: "select_theme",
        gameId: gameState.gameId,
        playerId: gameState.coinFlipWinnerPlayerId,
        selectedThemeType: themeChoice,
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
        pokemonType: lockedBidType,
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
        pokemons: challengeInput
          .split(",")
          .map((pokemon) => pokemon.trim())
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
            Define los dos jugadores y su eleccion de moneda. El resto de la
            partida se renderiza como tablero central.
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
              <span className="mt-3 text-4xl font-semibold uppercase tracking-[0.08em] text-white sm:text-5xl">
                {lockedBidType}
              </span>
              <span className="mt-3 text-sm text-white/80">
                Pokemon tipo {lockedBidType}
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
              <div className="w-full max-w-[34rem] rounded-[1.6rem] border border-amber-200/40 bg-black/35 p-5 text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">
                  Seleccion de tema
                </p>
                <p className="mt-3 text-sm text-white/80">
                  {gameState.players.find(
                    (player) => player.id === gameState.coinFlipWinnerPlayerId,
                  )?.name} gano la moneda y elige el tema de la ronda.
                </p>
                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <select
                    value={themeChoice}
                    onChange={(event) =>
                      setThemeChoice(event.target.value as PokemonType)
                    }
                    className="w-full rounded-full border border-white/15 bg-white/90 px-5 py-3 text-sm text-slate-900 outline-none sm:max-w-[18rem]"
                  >
                    {gameState.themeOptions.map((typeOption) => (
                      <option key={typeOption} value={typeOption}>
                        {typeOption}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleThemeSelection}
                    disabled={isSubmitting}
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
                  <p className="text-sm text-white/80">
                    Debes escribir {requiredChallengeCount} Pokemon del tipo{" "}
                    {gameState.challenge.requiredType}.
                  </p>
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
                  placeholder="Puedes escribirlos separados por comas. Ejemplo: Pichu, Pikachu, Raichu"
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={handleChallengeResponse}
                    disabled={!isChallengeResponse || isSubmitting}
                    className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:bg-amber-300"
                  >
                    Agregar Pokemon
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
                  Conteo real: {gameState.roundResult.actualCount}
                </p>
                {gameState.roundResult.submittedPokemons?.length ? (
                  <p className="mt-2 text-sm text-white/80">
                    Respondio con:{" "}
                    {gameState.roundResult.submittedPokemons.join(", ")}
                  </p>
                ) : null}
                {gameState.roundResult.invalidPokemons?.length ? (
                  <p className="mt-2 text-sm text-rose-200">
                    Invalidos: {gameState.roundResult.invalidPokemons.join(", ")}
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
