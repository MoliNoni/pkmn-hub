import LocalGameBoard from "@/games/mentiroso/LocalGameBoard";

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl justify-center">
        <LocalGameBoard />
      </div>
    </main>
  );
}
