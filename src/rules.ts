// Two-Player-Three-Dice core rules.
//
// Three dice are rolled: alpha (first player's die), base (B), beta (last player's die).
// The winner is whichever of alpha/beta is "closer" to base, with two exceptions that
// make every one of the 6*6*6 combinations resolve to a winner (no draws):
//
// 1. alpha === beta: the two outer dice are always equidistant from base by construction.
//    alpha stands in for the 1-3 half, beta for the 4-6 half; base's half decides the winner.
// 2. alpha !== beta but |alpha - base| === |beta - base| (base sits exactly between them):
//    a. If the outer values are {1,3} (base=2) or {4,6} (base=5), the extreme value (1 or 6)
//       wins outright.
//    b. Otherwise the outer dice always split across the 1-3 / 4-6 halves; the one on
//       base's half wins.

export type Player = "first" | "last";

export interface Round {
  alpha: number;
  base: number;
  beta: number;
}

const MIN_DIE = 1;
const MAX_DIE = 6;

function assertValidDie(value: number, label: string): void {
  if (!Number.isInteger(value) || value < MIN_DIE || value > MAX_DIE) {
    throw new RangeError(`${label} must be an integer between ${MIN_DIE} and ${MAX_DIE}, got ${value}`);
  }
}

export function resolveRound({ alpha, base, beta }: Round): Player {
  assertValidDie(alpha, "alpha");
  assertValidDie(base, "base");
  assertValidDie(beta, "beta");

  // Exception 2: alpha and beta share the same value.
  if (alpha === beta) {
    return base <= 3 ? "first" : "last";
  }

  const distAlpha = Math.abs(alpha - base);
  const distBeta = Math.abs(beta - base);

  // Base rule: closer die wins.
  if (distAlpha !== distBeta) {
    return distAlpha < distBeta ? "first" : "last";
  }

  // Exception 1: equidistant and alpha !== beta, so base sits strictly between them.
  const lo = Math.min(alpha, beta);
  const hi = Math.max(alpha, beta);
  const loIsAlpha = alpha === lo;

  // 1-2-3 or 4-5-6: the extreme value (1 or 6) wins.
  if ((lo === 1 && hi === 3) || (lo === 4 && hi === 6)) {
    const edge = lo === 1 ? 1 : 6;
    return alpha === edge ? "first" : "last";
  }

  // Otherwise lo is always in 1-3 and hi is always in 4-6; base's half decides.
  return base <= 3 ? (loIsAlpha ? "first" : "last") : (loIsAlpha ? "last" : "first");
}

export function rollDie(): number {
  // crypto.getRandomValues avoids Math.random()'s modulo bias and is available in Workers.
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % 6) + 1;
}

export function playRound(): Round & { winner: Player } {
  const round: Round = { alpha: rollDie(), base: rollDie(), beta: rollDie() };
  return { ...round, winner: resolveRound(round) };
}
