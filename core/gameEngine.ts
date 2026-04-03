import { validateClaim } from "@/games/mentiroso/gameLogic";
import type {
  Bid,
  Claim,
  CoinSide,
  GameResult,
  Player,
  PokemonType,
  RoundResult,
  Turn,
} from "@/types/types";

type GameValidator = (payload: Claim) => Promise<GameResult>;

const gameValidators: Record<string, GameValidator> = {
  mentiroso: async (payload) => {
    const result = await validateClaim(payload.items, payload.typeClaim ?? "");
    const invalidPokemons = result.invalidPokemons ?? [];

    return {
      game: payload.game,
      playerId: payload.playerId,
      valid: result.valid,
      checkedAt: new Date().toISOString(),
      items: payload.items,
      typeClaim: payload.typeClaim,
      invalidPokemons,
      details: result.valid
        ? `Todos los Pokemon coinciden con el tipo "${payload.typeClaim ?? ""}".`
        : `Se encontraron ${invalidPokemons.length} Pokemon fuera del tipo "${payload.typeClaim ?? ""}".`,
    };
  },
};

export async function validateGameMove(
  game: string,
  payload: Claim,
): Promise<GameResult> {
  const normalizedGame = game.trim().toLowerCase();
  const validator = gameValidators[normalizedGame];

  if (!validator) {
    throw new Error(`Unsupported game: ${game}`);
  }

  return validator({
    ...payload,
    game: normalizedGame,
  });
}

// Initializes players and randomly decides who starts the round.
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

// Resolves the coin flip based on the selected sides and random outcome.
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

// Picks theme options and the selected theme for the current round.
export function assignTypeTheme(
  availableTypes: PokemonType[],
  selectedThemeType?: PokemonType,
): {
  themeOptions: PokemonType[];
  selectedThemeType: PokemonType;
} {
  const themeOptions = [...availableTypes];
  const fallbackTheme = themeOptions[0] ?? "normal";
  const resolvedTheme =
    selectedThemeType && themeOptions.includes(selectedThemeType)
      ? selectedThemeType
      : fallbackTheme;

  return {
    themeOptions,
    selectedThemeType: resolvedTheme,
  };
}

// Builds the initial turn object shared by local round logic.
export function createInitialTurn(startingPlayerId: string): Turn {
  return {
    roundNumber: 1,
    phase: "theme-selection",
    currentPlayerId: startingPlayerId,
    startingPlayerId,
  };
}

// Alternates the turn to the next player in the list.
export function getNextPlayerId(
  players: Player[],
  currentPlayerId: string,
): string {
  const currentIndex = players.findIndex((player) => player.id === currentPlayerId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % players.length;
  return players[nextIndex]?.id ?? currentPlayerId;
}

// Validates that each new bid is strictly greater than the previous highest bid.
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

// Creates the next turn state after a successful bid.
export function advanceSubastaTurn(players: Player[], currentTurn: Turn): Turn {
  const nextPlayerId = getNextPlayerId(players, currentTurn.currentPlayerId);

  return {
    ...currentTurn,
    phase: "bidding",
    currentPlayerId: nextPlayerId,
  };
}

// Determines the round winner after a Liar! challenge.
export function resolveLiarChallenge(params: {
  challengerId: string;
  lastBid: Bid;
  actualCount: number;
  selectedThemeType: PokemonType;
  submittedPokemons?: string[];
  invalidPokemons?: string[];
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
    selectedThemeType: params.selectedThemeType,
    submittedPokemons: params.submittedPokemons,
    invalidPokemons: params.invalidPokemons,
    resolution: params.resolution ?? "liar-resolved",
  };
}
