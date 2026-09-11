import { describe, expect, it } from "vitest";
import { resolveRound } from "./rules";

describe("resolveRound", () => {
  it("never throws and always returns first or last, for all 216 combinations", () => {
    for (let alpha = 1; alpha <= 6; alpha++) {
      for (let base = 1; base <= 6; base++) {
        for (let beta = 1; beta <= 6; beta++) {
          const winner = resolveRound({ alpha, base, beta });
          expect(["first", "last"]).toContain(winner);
        }
      }
    }
  });

  it("matches the base rule example: alpha=1, beta=6, base=4 -> last wins", () => {
    expect(resolveRound({ alpha: 1, base: 4, beta: 6 })).toBe("last");
  });

  it("matches the equidistant split example: alpha=1, base=3, beta=5 -> first wins (base in 1-3)", () => {
    expect(resolveRound({ alpha: 1, base: 3, beta: 5 })).toBe("first");
    expect(resolveRound({ alpha: 5, base: 3, beta: 1 })).toBe("last");
  });

  it("matches the equidistant split example with base in 4-6", () => {
    expect(resolveRound({ alpha: 2, base: 4, beta: 6 })).toBe("last");
    expect(resolveRound({ alpha: 6, base: 4, beta: 2 })).toBe("first");
  });

  it("1-2-3 always gives the win to whoever rolled 1", () => {
    expect(resolveRound({ alpha: 1, base: 2, beta: 3 })).toBe("first");
    expect(resolveRound({ alpha: 3, base: 2, beta: 1 })).toBe("last");
  });

  it("4-5-6 always gives the win to whoever rolled 6", () => {
    expect(resolveRound({ alpha: 6, base: 5, beta: 4 })).toBe("first");
    expect(resolveRound({ alpha: 4, base: 5, beta: 6 })).toBe("last");
  });

  it("alpha === beta: base's half (1-3 vs 4-6) decides", () => {
    expect(resolveRound({ alpha: 5, base: 1, beta: 5 })).toBe("first");
    expect(resolveRound({ alpha: 5, base: 4, beta: 5 })).toBe("last");
    expect(resolveRound({ alpha: 3, base: 3, beta: 3 })).toBe("first");
  });

  it("rejects out-of-range dice values", () => {
    expect(() => resolveRound({ alpha: 0, base: 3, beta: 5 })).toThrow(RangeError);
    expect(() => resolveRound({ alpha: 1, base: 7, beta: 5 })).toThrow(RangeError);
    expect(() => resolveRound({ alpha: 1.5, base: 3, beta: 5 })).toThrow(RangeError);
  });
});
