import GameBoard from "@/games/mentiroso/GameBoard";

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,#f8fafc_45%,#e2e8f0)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl justify-center">
        <GameBoard />
      </div>
    </main>
  );
}
