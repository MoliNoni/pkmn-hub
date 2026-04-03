"use client";

import { useId, useState } from "react";

import type { GameResult } from "@/types/types";

const defaultPlayerId = `trainer-${Math.random().toString(36).slice(2, 10)}`;

function parsePokemonInput(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function GameBoard() {
  const claimId = useId();
  const itemsId = useId();
  const [playerId] = useState(defaultPlayerId);
  const [itemsInput, setItemsInput] = useState("pikachu, charizard, squirtle");
  const [typeClaim, setTypeClaim] = useState("electric");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submittedItems = parsePokemonInput(itemsInput);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/games/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game: "mentiroso",
          playerId,
          items: submittedItems,
          typeClaim,
        }),
      });

      const data = (await response.json()) as GameResult | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Request failed.");
      }

      setResult(data);
    } catch (submitError) {
      setResult(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo validar la jugada.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-4xl rounded-4xl border border-slate-200 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
          Mentiroso Pokemon
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Valida si una jugada dice la verdad
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Escribe varios Pokemon y declara un tipo. El motor revisa cada nombre
          y marca los que no cumplen la afirmacion.
        </p>
      </div>

      <form className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor={itemsId}
            className="text-sm font-medium text-slate-700"
          >
            Pokemon separados por comas
          </label>
          <textarea
            id={itemsId}
            value={itemsInput}
            onChange={(event) => setItemsInput(event.target.value)}
            placeholder="pikachu, jolteon, magnemite"
            rows={6}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <label
              htmlFor={claimId}
              className="text-sm font-medium text-slate-700"
            >
              Tipo declarado
            </label>
            <input
              id={claimId}
              type="text"
              value={typeClaim}
              onChange={(event) => setTypeClaim(event.target.value)}
              placeholder="electric"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div className="rounded-2xl bg-slate-900 px-4 py-4 text-sm text-slate-100">
            <p className="font-semibold">Jugador actual</p>
            <p className="mt-1 break-all text-slate-300">{playerId}</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isSubmitting ? "Validando..." : "Validar jugada"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4">
        <div
          className={`rounded-2xl border px-5 py-4 ${
            result?.valid
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Resultado
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {result ? (result.valid ? "Verdad" : "Mentira") : "Sin validar"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {result?.details ??
              "Haz una jugada para comprobar si todos los Pokemon coinciden con el tipo declarado."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Revision Pokemon
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {submittedItems.length ? (
              submittedItems.map((pokemonName) => {
                const isInvalid =
                  result?.invalidPokemons.some(
                    (invalidPokemon) =>
                      invalidPokemon.toLowerCase() === pokemonName.toLowerCase(),
                  ) ?? false;

                return (
                  <span
                    key={pokemonName}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      isInvalid
                        ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {pokemonName}
                  </span>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">
                Agrega al menos un Pokemon para jugar.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
