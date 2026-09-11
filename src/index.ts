import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { basicAuth } from "hono/basic-auth";
import {
  addRound,
  getOrCreateSession,
  getRoundsForSession,
  getSessionById,
  listSessionsSummary,
  summarize,
} from "./db";
import { adminDetailPage } from "./pages/adminDetail";
import { adminListPage } from "./pages/admin";
import { homePage } from "./pages/home";
import { playPage } from "./pages/play";
import { rulesPage } from "./pages/rules";
import { playRound } from "./rules";

export interface Env {
  DB: D1Database;
  ADMIN_USER: string;
  ADMIN_PASSWORD: string;
}

const app = new Hono<{ Bindings: Env }>();

const MAX_NAME_LENGTH = 40;

function validateName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_NAME_LENGTH) return null;
  return trimmed;
}

// --- Static pages ---

app.get("/", (c) => c.html(homePage()));
app.get("/play", (c) => c.html(playPage()));
app.get("/rules", (c) => c.html(rulesPage()));

// --- Admin (protected) ---

const requireAdminAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  if (!c.env.ADMIN_PASSWORD) {
    return c.text("Admin access is not configured.", 500);
  }
  return basicAuth({ username: c.env.ADMIN_USER, password: c.env.ADMIN_PASSWORD })(c, next);
};
app.use("/admin", requireAdminAuth);
app.use("/admin/*", requireAdminAuth);

app.get("/admin", async (c) => {
  const summaries = await listSessionsSummary(c.env.DB);
  return c.html(adminListPage(summaries));
});

app.get("/admin/sessions/:id", async (c) => {
  const id = c.req.param("id");
  const session = await getSessionById(c.env.DB, id);
  if (!session) {
    return c.notFound();
  }
  const rounds = await getRoundsForSession(c.env.DB, id);
  const summary = summarize(session, rounds);
  return c.html(adminDetailPage(summary, rounds));
});

// --- API ---

app.post("/api/sessions", async (c) => {
  const body = await c.req.json().catch(() => null);
  const firstName = validateName(body?.first_name);
  const lastName = validateName(body?.last_name);
  if (!firstName || !lastName) {
    return c.json({ error: "first_name과 last_name을 1~40자로 입력해 주세요." }, 400);
  }

  const session = await getOrCreateSession(c.env.DB, firstName, lastName);
  const rounds = await getRoundsForSession(c.env.DB, session.id);
  const summary = summarize(session, rounds);
  return c.json({ session, rounds, summary: { firstWins: summary.firstWins, lastWins: summary.lastWins, roundCount: summary.roundCount } });
});

app.get("/api/sessions/:id", async (c) => {
  const id = c.req.param("id");
  const session = await getSessionById(c.env.DB, id);
  if (!session) {
    return c.json({ error: "세션을 찾을 수 없습니다." }, 404);
  }
  const rounds = await getRoundsForSession(c.env.DB, id);
  const summary = summarize(session, rounds);
  return c.json({ session, rounds, summary: { firstWins: summary.firstWins, lastWins: summary.lastWins, roundCount: summary.roundCount } });
});

app.post("/api/sessions/:id/rounds", async (c) => {
  const id = c.req.param("id");
  const session = await getSessionById(c.env.DB, id);
  if (!session) {
    return c.json({ error: "세션을 찾을 수 없습니다." }, 404);
  }

  const played = playRound();
  const round = await addRound(c.env.DB, id, played);
  const rounds = await getRoundsForSession(c.env.DB, id);
  const summary = summarize(session, rounds);
  return c.json({ round, summary: { firstWins: summary.firstWins, lastWins: summary.lastWins, roundCount: summary.roundCount } });
});

export default app;
