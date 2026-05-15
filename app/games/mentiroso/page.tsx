import LocalMentirosoBoard from "@/games/mentiroso/components/LocalMentirosoBoard";

export default function MentirosoPage() {
  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-[85vw] max-w-none justify-center">
        <LocalMentirosoBoard />
      </div>
    </main>
  );
}
