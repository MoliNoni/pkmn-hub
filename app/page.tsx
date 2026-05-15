import Link from "next/link";

import { getGameDefinitions } from "@/games/registry";

export default function Page() {
  const gameDefinitions = getGameDefinitions();

  return (
    <main className="min-h-screen px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-200">
            Pokemon Game Hub
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Coleccion de juegos Pokemon
          </h1>
          <p className="mt-4 text-base leading-7 text-white/75">
            Un punto de entrada comun para modos locales y futuros modos
            conectados. Cada juego declara su contrato, estado y mecanicas
            compartidas desde el registro central.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {gameDefinitions.map((definition) => {
            const { metadata } = definition;
            const isAvailable = metadata.availability === "available";

            return (
              <article
                key={definition.gameType}
                className="flex min-h-[18rem] flex-col rounded-[1.4rem] border border-white/15 bg-black/35 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.32)] backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                      {definition.gameType}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold">
                      {metadata.shortTitle}
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
                    {isAvailable ? "Disponible" : "Pronto"}
                  </span>
                </div>

                <p className="mt-4 flex-1 text-sm leading-6 text-white/72">
                  {metadata.description}
                </p>

                {metadata.sharedMechanics?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {metadata.sharedMechanics.map((mechanic) => (
                      <span
                        key={`${definition.gameType}-${mechanic}`}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65"
                      >
                        {mechanic}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6">
                  {isAvailable && metadata.playPath ? (
                    <Link
                      href={metadata.playPath}
                      className="inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-400"
                    >
                      Jugar
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white/45"
                    >
                      En desarrollo
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
