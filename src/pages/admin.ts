import type { SessionSummary } from "../db";
import { escapeHtml } from "./escape";
import { layout } from "./layout";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("ko-KR");
}

export function adminListPage(summaries: SessionSummary[]): string {
  const rows = summaries
    .map((s) => {
      const s1 = escapeHtml(s.session.first_name);
      const s2 = escapeHtml(s.session.last_name);
      return `<tr>
        <td><a href="/admin/sessions/${s.session.id}">${s1} vs ${s2}</a></td>
        <td>${s.roundCount}</td>
        <td>${s.firstWins} : ${s.lastWins}</td>
        <td>${formatDate(s.session.updated_at)}</td>
      </tr>`;
    })
    .join("");

  const body = `
    <section class="card">
      <h1>관리자 · 테이블 목록</h1>
      <p>이름 조합별로 진행 중인(또는 완료된) 게임 세션 목록입니다.</p>
      <table class="round-table">
        <thead>
          <tr><th>플레이어</th><th>라운드 수</th><th>퍼스트:라스트 승수</th><th>최근 활동</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="4">아직 기록된 게임이 없습니다.</td></tr>'}</tbody>
      </table>
    </section>
  `;
  return layout({ title: "관리자", body, activeNav: "admin" });
}
