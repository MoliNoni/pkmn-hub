"use client";

import { useMemo, useState } from "react";

import type { CoinSide, GameState, Player, PokemonType } from "@/types/types";

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

  const lastBid = gameState?.bids.at(-1);
  const canBid = gameState?.status === "in-progress";
  const canCallLiar = Boolean(canBid && lastBid);
  const isThemeSelection = gameState?.status === "waiting-theme";
  const isChallengeResponse = gameState?.status === "challenge-response";
  const lockedBidType = gameState?.selectedThemeType ?? "fire";
  const submittedChallengeCount = gameState?.challenge?.submittedPokemons.length ?? 0;
  const requiredChallengeCount = gameState?.challenge?.requiredCount ?? 0;

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

  return (
    <section className="w-full max-w-6xl rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
          Local Multiplayer
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Mentiroso Pokemon por turnos
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          El tipo de la subasta queda bloqueado por el tema elegido. Cuando alguien
          canta Mentiroso, el rival debe escribir exactamente la cantidad pedida
          de Pokemon de ese mismo tipo o conceder la ronda.
        </p>
      </div>

      {!gameState ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-4 md:grid-cols-2">
            {setupPlayers.map((player, index) => (
              <div
                key={`setup-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Jugador {index + 1}
                </p>
                <input
                  value={player.name}
                  onChange={(event) =>
                    updatePlayer(index as 0 | 1, "name", event.target.value)
                  }
                  className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
            className="h-fit rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isSubmitting ? "Creando..." : "Crear partida"}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-900 p-5 text-slate-100">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Turno actual
              </p>
              <p className="mt-2 text-2xl font-bold">
                {currentPlayer?.name ?? "Sin turno"}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Estado: {gameState.status}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Moneda: {gameState.coinFlipResult}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Tema actual: {gameState.selectedThemeType ?? "pendiente"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Puntuacion
              </p>
              <div className="mt-4 grid gap-3">
                {gameState.players.map((player: Player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{player.name}</p>
                      <p className="text-xs text-slate-500">
                        Moneda: {player.coinChoice}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-sky-700">
                      {player.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isThemeSelection ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-800">
                  El ganador de la moneda elige el tema del round
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    value={themeChoice}
                    onChange={(event) =>
                      setThemeChoice(event.target.value as PokemonType)
                    }
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900"
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
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white disabled:bg-amber-300"
                  >
                    Confirmar tema
                  </button>
                </div>
              </div>
            ) : null}

            {isChallengeResponse && gameState.challenge ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
                  Reto Mentiroso
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {gameState.players.find(
                    (player) => player.id === gameState.challenge?.responderPlayerId,
                  )?.name} debe escribir {gameState.challenge.requiredCount} Pokemon
                  del tipo {gameState.challenge.requiredType}.
                </p>
              </div>
            ) : null}

            {gameState.status === "round-ended" && gameState.roundResult ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Round terminado
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  Gana{" "}
                  {
                    gameState.players.find(
                      (player) => player.id === gameState.roundResult?.winnerPlayerId,
                    )?.name
                  }
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Conteo real para {gameState.roundResult.challengedBid.pokemonType}:{" "}
                  {gameState.roundResult.actualCount}
                </p>
                {gameState.roundResult.submittedPokemons?.length ? (
                  <p className="mt-2 text-sm text-slate-700">
                    Respondio con: {gameState.roundResult.submittedPokemons.join(", ")}
                  </p>
                ) : null}
                {gameState.roundResult.invalidPokemons?.length ? (
                  <p className="mt-2 text-sm text-red-700">
                    Invalidos: {gameState.roundResult.invalidPokemons.join(", ")}
                  </p>
                ) : null}
                {gameState.roundResult.resolution === "conceded" ? (
                  <p className="mt-2 text-sm text-slate-700">
                    La ronda se resolvio por concesion.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Subasta
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-[0.55fr_0.45fr_auto]">
                <input
                  type="number"
                  min={1}
                  value={bidCount}
                  onChange={(event) => setBidCount(event.target.value)}
                  disabled={!canBid || isSubmitting}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:bg-slate-100"
                />
                <div className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                  Tipo fijo: {lockedBidType}
                </div>
                <button
                  type="button"
                  onClick={handleBid}
                  disabled={!canBid || isSubmitting}
                  className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-sky-300"
                >
                  Apostar
                </button>
              </div>

              <button
                type="button"
                onClick={handleLiar}
                disabled={!canCallLiar || isSubmitting}
                className="mt-4 w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-rose-300"
              >
                Mentiroso
              </button>

              {lastBid ? (
                <p className="mt-4 text-sm text-slate-600">
                  Ultima apuesta: {lastBid.playerName} dijo {lastBid.count} Pokemon
                  tipo {lastBid.pokemonType}.
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  Aun no hay apuestas registradas.
                </p>
              )}
            </div>

            {isChallengeResponse && gameState.challenge ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Respuesta del rival
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Escribe exactamente {gameState.challenge.requiredCount} Pokemon
                  separados por comas del tipo {gameState.challenge.requiredType}.
                </p>
                <p className="mt-2 text-sm font-semibold text-amber-800">
                  Progreso: {submittedChallengeCount}/{requiredChallengeCount}
                </p>
                <textarea
                  value={challengeInput}
                  onChange={(event) => setChallengeInput(event.target.value)}
                  disabled={!isChallengeResponse || isSubmitting}
                  rows={5}
                  className="mt-4 w-full rounded-xl border border-amber-300 bg-white px-3 py-3 text-sm text-slate-900 disabled:bg-slate-100"
                  placeholder="Puedes escribirlos separados por comas"
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleChallengeResponse}
                    disabled={!isChallengeResponse || isSubmitting}
                    className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white disabled:bg-amber-300"
                  >
                    Agregar Pokemon
                  </button>
                  <button
                    type="button"
                    onClick={handleConcede}
                    disabled={!isChallengeResponse || isSubmitting}
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
                  >
                    Conceder victoria
                  </button>
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Historial
              </p>
              <div className="mt-4 max-h-[24rem] space-y-3 overflow-y-auto">
                {gameState.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    {entry.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </section>
  );
}
