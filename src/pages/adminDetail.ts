import type { RoundRow, SessionSummary } from "../db";
import { escapeHtml } from "./escape";
import { layout } from "./layout";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("ko-KR");
}

export function adminDetailPage(summary: SessionSummary, rounds: RoundRow[]): string {
  const first = escapeHtml(summary.session.first_name);
  const last = escapeHtml(summary.session.last_name);

  const rows = rounds
    .slice()
    .reverse()
    .map((r) => {
      const winnerName = r.winner === "first" ? first : last;
      return `<tr>
        <td>${r.round_no}</td>
        <td>${r.alpha}</td>
        <td>${r.base}</td>
        <td>${r.beta}</td>
        <td>${winnerName}</td>
        <td>${formatDate(r.created_at)}</td>
      </tr>`;
    })
    .join("");

  const body = `
    <section class="card">
      <p><a href="/admin">&larr; 목록으로</a></p>
      <h1>${first} vs ${last}</h1>
      <div class="scoreboard">
        <div class="score-box">
          <span class="score-label">${first}</span>
          <span class="score-value">${summary.firstWins}</span>
        </div>
        <div class="score-box">
          <span class="score-label">라운드</span>
          <span class="score-value">${summary.roundCount}</span>
        </div>
        <div class="score-box">
          <span class="score-label">${last}</span>
          <span class="score-value">${summary.lastWins}</span>
        </div>
      </div>

      <h2>라운드 기록</h2>
      <table class="round-table">
        <thead>
          <tr><th>#</th><th>알파</th><th>B</th><th>베타</th><th>승자</th><th>시각</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6">아직 라운드 기록이 없습니다.</td></tr>'}</tbody>
      </table>
    </section>
  `;
  return layout({ title: `${first} vs ${last}`, body, activeNav: "admin" });
}
