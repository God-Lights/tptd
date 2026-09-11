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
        <td>
          <form class="inline-form" method="post"
                action="/admin/sessions/${summary.session.id}/rounds/${r.id}/delete"
                onsubmit="return confirm('${r.round_no}번 라운드 기록을 삭제할까요?')">
            <button type="submit" class="btn btn-danger btn-small">삭제</button>
          </form>
        </td>
      </tr>`;
    })
    .join("");

  const body = `
    <section class="card">
      <p><a href="/admin">&larr; 목록으로</a></p>
      <div class="game-header">
        <h1>${first} vs ${last}</h1>
        <form method="post" action="/admin/sessions/${summary.session.id}/delete"
              onsubmit="return confirm('${first} vs ${last} 세션과 모든 라운드 기록을 삭제할까요?')">
          <button type="submit" class="btn btn-danger">세션 삭제</button>
        </form>
      </div>
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
          <tr><th>#</th><th>알파</th><th>B</th><th>베타</th><th>승자</th><th>시각</th><th></th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7">아직 라운드 기록이 없습니다.</td></tr>'}</tbody>
      </table>
    </section>
  `;
  return layout({ title: `${first} vs ${last}`, body, activeNav: "admin" });
}
