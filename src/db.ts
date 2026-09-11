import type { Player, Round } from "./rules";

export interface SessionRow {
  id: string;
  pair_key: string;
  first_name: string;
  last_name: string;
  created_at: number;
  updated_at: number;
}

export interface RoundRow {
  id: number;
  session_id: string;
  round_no: number;
  alpha: number;
  base: number;
  beta: number;
  winner: Player;
  created_at: number;
}

export interface SessionSummary {
  session: SessionRow;
  roundCount: number;
  firstWins: number;
  lastWins: number;
}

export function normalizePairKey(firstName: string, lastName: string): string {
  return `${firstName.trim().toLowerCase()}|${lastName.trim().toLowerCase()}`;
}

export async function getOrCreateSession(
  db: D1Database,
  firstName: string,
  lastName: string,
): Promise<SessionRow> {
  const pairKey = normalizePairKey(firstName, lastName);
  const now = Date.now();

  const existing = await db
    .prepare("SELECT * FROM sessions WHERE pair_key = ?")
    .bind(pairKey)
    .first<SessionRow>();
  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  await db
    .prepare(
      "INSERT INTO sessions (id, pair_key, first_name, last_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(pair_key) DO NOTHING",
    )
    .bind(id, pairKey, firstName.trim(), lastName.trim(), now, now)
    .run();

  const row = await db.prepare("SELECT * FROM sessions WHERE pair_key = ?").bind(pairKey).first<SessionRow>();
  if (!row) {
    throw new Error("Failed to create or fetch session");
  }
  return row;
}

export async function getSessionById(db: D1Database, id: string): Promise<SessionRow | null> {
  const row = await db.prepare("SELECT * FROM sessions WHERE id = ?").bind(id).first<SessionRow>();
  return row ?? null;
}

export async function getRoundsForSession(db: D1Database, sessionId: string): Promise<RoundRow[]> {
  const { results } = await db
    .prepare("SELECT * FROM rounds WHERE session_id = ? ORDER BY round_no ASC")
    .bind(sessionId)
    .all<RoundRow>();
  return results ?? [];
}

export function summarize(session: SessionRow, rounds: RoundRow[]): SessionSummary {
  let firstWins = 0;
  let lastWins = 0;
  for (const r of rounds) {
    if (r.winner === "first") firstWins++;
    else lastWins++;
  }
  return { session, roundCount: rounds.length, firstWins, lastWins };
}

export async function addRound(
  db: D1Database,
  sessionId: string,
  round: Round & { winner: Player },
): Promise<RoundRow> {
  const now = Date.now();
  const countRow = await db
    .prepare("SELECT COUNT(*) as c FROM rounds WHERE session_id = ?")
    .bind(sessionId)
    .first<{ c: number }>();
  const roundNo = (countRow?.c ?? 0) + 1;

  const result = await db
    .prepare(
      "INSERT INTO rounds (session_id, round_no, alpha, base, beta, winner, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(sessionId, roundNo, round.alpha, round.base, round.beta, round.winner, now)
    .run();

  await db.prepare("UPDATE sessions SET updated_at = ? WHERE id = ?").bind(now, sessionId).run();

  const row = await db
    .prepare("SELECT * FROM rounds WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first<RoundRow>();
  if (!row) {
    throw new Error("Failed to fetch inserted round");
  }
  return row;
}

interface SessionSummaryRow extends SessionRow {
  round_count: number;
  first_wins: number;
  last_wins: number;
}

export async function listSessionsSummary(db: D1Database): Promise<SessionSummary[]> {
  const { results } = await db
    .prepare(
      `SELECT s.*,
              COUNT(r.id) AS round_count,
              SUM(CASE WHEN r.winner = 'first' THEN 1 ELSE 0 END) AS first_wins,
              SUM(CASE WHEN r.winner = 'last' THEN 1 ELSE 0 END) AS last_wins
       FROM sessions s
       LEFT JOIN rounds r ON r.session_id = s.id
       GROUP BY s.id
       ORDER BY s.updated_at DESC`,
    )
    .all<SessionSummaryRow>();

  return (results ?? []).map((row) => ({
    session: {
      id: row.id,
      pair_key: row.pair_key,
      first_name: row.first_name,
      last_name: row.last_name,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    roundCount: row.round_count,
    firstWins: row.first_wins,
    lastWins: row.last_wins,
  }));
}
