import { getNextPlayerId } from "@/core/turnOrder";
import type { CoinSide } from "@/types/types";
import type {
  ActiveRoundTheme,
  Bid,
  Player,
  RoundResult,
  Turn,
} from "@/games/mentiroso/types";

export function initializePlayers(
  players: Array<{ id: string; name: string; coinChoice: CoinSide }>,
  randomValue = Math.random(),
): { players: Player[]; startingPlayerId: string } {
  const startingIndex = Math.floor(randomValue * players.length);
  const startingPlayerId = players[startingIndex]?.id ?? players[0].id;

  return {
    startingPlayerId,
    players: players.map((player) => ({
      ...player,
      points: 0,
      isStartingPlayer: player.id === startingPlayerId,
    })),
  };
}

export function resolveCoinFlip(
  players: Player[],
  randomValue = Math.random(),
): {
  coinFlipResult: CoinSide;
  winnerPlayerId: string;
} {
  const coinFlipResult: CoinSide = randomValue >= 0.5 ? "cara" : "sello";
  const winner =
    players.find((player) => player.coinChoice === coinFlipResult) ?? players[0];

  return {
    coinFlipResult,
    winnerPlayerId: winner.id,
  };
}

export function createInitialTurn(startingPlayerId: string): Turn {
  return {
    roundNumber: 1,
    phase: "theme-selection",
    currentPlayerId: startingPlayerId,
    startingPlayerId,
  };
}

export function isBidGreaterThanPrevious(
  previousBids: Bid[],
  nextBid: Pick<Bid, "count">,
): boolean {
  const highestCount = previousBids.reduce(
    (max, bid) => Math.max(max, bid.count),
    0,
  );

  return nextBid.count > highestCount;
}

export function advanceSubastaTurn(players: Player[], currentTurn: Turn): Turn {
  const nextPlayerId = getNextPlayerId(players, currentTurn.currentPlayerId);

  return {
    ...currentTurn,
    phase: "bidding",
    currentPlayerId: nextPlayerId,
  };
}

export function resolveLiarChallenge(params: {
  challengerId: string;
  lastBid: Bid;
  actualCount: number;
  selectedTheme: ActiveRoundTheme;
  submittedEntries?: string[];
  invalidEntries?: string[];
  resolution?: "liar-resolved" | "conceded";
}): RoundResult {
  const wasLiarCallSuccessful = params.actualCount < params.lastBid.count;
  const winnerPlayerId = wasLiarCallSuccessful
    ? params.challengerId
    : params.lastBid.playerId;
  const loserPlayerId =
    winnerPlayerId === params.challengerId
      ? params.lastBid.playerId
      : params.challengerId;

  return {
    winnerPlayerId,
    loserPlayerId,
    challengedBid: params.lastBid,
    actualCount: params.actualCount,
    wasLiarCallSuccessful,
    pointAwardedTo: winnerPlayerId,
    selectedTheme: params.selectedTheme,
    submittedEntries: params.submittedEntries,
    invalidEntries: params.invalidEntries,
    resolution: params.resolution ?? "liar-resolved",
  };
}
