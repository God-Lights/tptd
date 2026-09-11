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
        <td>
          <form class="inline-form" method="post" action="/admin/sessions/${s.session.id}/delete"
                onsubmit="return confirm('${s1} vs ${s2} 세션과 모든 라운드 기록을 삭제할까요?')">
            <button type="submit" class="btn btn-danger btn-small">삭제</button>
          </form>
        </td>
      </tr>`;
    })
    .join("");

  const body = `
    <section class="card">
      <h1>관리자 · 테이블 목록</h1>
      <p>이름 조합별로 진행 중인(또는 완료된) 게임 세션 목록입니다.</p>
      <div class="admin-toolbar">
        <form method="post" action="/admin/delete-all"
              onsubmit="return confirm('모든 세션과 라운드 기록을 전부 삭제할까요? 이 작업은 되돌릴 수 없습니다.')">
          <button type="submit" class="btn btn-danger">전체 기록 삭제</button>
        </form>
      </div>
      <table class="round-table">
        <thead>
          <tr><th>플레이어</th><th>라운드 수</th><th>퍼스트:라스트 승수</th><th>최근 활동</th><th></th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="5">아직 기록된 게임이 없습니다.</td></tr>'}</tbody>
      </table>
    </section>
  `;
  return layout({ title: "관리자", body, activeNav: "admin" });
}
