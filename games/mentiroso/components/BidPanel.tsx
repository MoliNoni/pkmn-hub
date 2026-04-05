/**
 * Responsibilities:
 * - Render bidding controls for the active round.
 * - Keep the liar action and count submission UI isolated from the broader
 *   board layout.
 *
 * Move to another module if needed:
 * - If different game modes use different bidding rules, split visual controls
 *   from bid-policy messages and validation copy.
 * - If accessibility or keyboard shortcuts become important, create a shared
 *   action-bar primitive used by both local and online modes.
 */

type BidPanelProps = {
  bidCount: string;
  canBid: boolean;
  canCallLiar: boolean;
  isSubmitting: boolean;
  onBidCountChange: (value: string) => void;
  onCallLiar: () => void;
  onSubmitBid: () => void;
};

export function BidPanel({
  bidCount,
  canBid,
  canCallLiar,
  isSubmitting,
  onBidCountChange,
  onCallLiar,
  onSubmitBid,
}: BidPanelProps) {
  if (!canBid) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={onCallLiar}
        disabled={!canCallLiar || isSubmitting}
        className="min-w-[16rem] rounded-full border-[5px] border-white bg-[#8d0016] px-8 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition hover:bg-[#a9001b] disabled:cursor-not-allowed disabled:bg-[#8d0016]/60"
      >
        !Mentiroso!
      </button>

      <div className="flex w-full max-w-[34rem] items-center justify-center rounded-full border-[5px] border-white bg-[#8d0016] px-4 py-4 text-center shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-center gap-3 text-white">
          <span className="text-sm font-medium sm:text-base">Yo puedo decir</span>
          <input
            type="number"
            min={1}
            value={bidCount}
            onChange={(event) => onBidCountChange(event.target.value)}
            disabled={!canBid || isSubmitting}
            className="w-24 rounded-full border border-white/20 bg-white px-4 py-2 text-center text-base font-semibold text-slate-900 outline-none disabled:bg-white/70"
          />
          <button
            type="button"
            onClick={onSubmitBid}
            disabled={!canBid || isSubmitting}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8d0016] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/60"
          >
            Aceptar
          </button>
        </div>
      </div>
    </>
  );
}
