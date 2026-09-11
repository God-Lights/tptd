import { layout } from "./layout";

export function playPage(): string {
  const body = `
    <section id="setup-form" class="card">
      <h1>플레이어 등록</h1>
      <p>퍼스트(알파) 플레이어와 라스트(베타) 플레이어의 이름을 입력하세요. 같은 이름 조합으로 다시 시작하면 이전 기록에 이어서 플레이합니다.</p>
      <form id="player-form">
        <label>
          퍼스트 플레이어 이름
          <input type="text" name="first_name" required maxlength="40" autocomplete="off" />
        </label>
        <label>
          라스트 플레이어 이름
          <input type="text" name="last_name" required maxlength="40" autocomplete="off" />
        </label>
        <button type="submit" class="btn btn-primary">플레이 시작</button>
      </form>
      <p id="setup-error" class="error" hidden></p>
    </section>

    <section id="game-screen" class="card" hidden>
      <div class="game-header">
        <h1><span id="first-name-label"></span> <span class="vs">vs</span> <span id="last-name-label"></span></h1>
        <button id="change-players" class="btn btn-ghost">플레이어 변경</button>
      </div>

      <div class="scoreboard">
        <div class="score-box">
          <span class="score-label" id="first-name-score-label"></span>
          <span class="score-value" id="first-wins">0</span>
        </div>
        <div class="score-box">
          <span class="score-label">라운드</span>
          <span class="score-value" id="round-count">0</span>
        </div>
        <div class="score-box">
          <span class="score-label" id="last-name-score-label"></span>
          <span class="score-value" id="last-wins">0</span>
        </div>
      </div>

      <div class="dice-row">
        <div class="die-slot">
          <span class="die-role">퍼스트 (알파)</span>
          <div class="die" id="die-alpha">-</div>
        </div>
        <div class="die-slot">
          <span class="die-role">베이스 (B)</span>
          <div class="die" id="die-base">-</div>
        </div>
        <div class="die-slot">
          <span class="die-role">라스트 (베타)</span>
          <div class="die" id="die-beta">-</div>
        </div>
      </div>

      <div class="roll-area">
        <button id="roll-btn" class="btn btn-primary btn-large">주사위 굴리기</button>
        <p id="winner-announcement" class="winner-announcement"></p>
      </div>

      <h2>라운드 기록</h2>
      <table class="round-table">
        <thead>
          <tr><th>#</th><th>알파</th><th>B</th><th>베타</th><th>승자</th></tr>
        </thead>
        <tbody id="round-history"></tbody>
      </table>
    </section>
  `;
  return layout({ title: "플레이", body, activeNav: "play" });
}
