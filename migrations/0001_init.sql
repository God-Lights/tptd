-- Two-Player-Three-Dice: sessions (a first/last player pair) and rounds (each dice roll)

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  pair_key TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  round_no INTEGER NOT NULL,
  alpha INTEGER NOT NULL,
  base INTEGER NOT NULL,
  beta INTEGER NOT NULL,
  winner TEXT NOT NULL CHECK (winner IN ('first', 'last')),
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rounds_session ON rounds(session_id);
