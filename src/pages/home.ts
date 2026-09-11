import { layout } from "./layout";

export function homePage(): string {
  const body = `
    <section class="hero">
      <h1>Two-Player-Three-Dice</h1>
      <p>주사위 세 개로 승부를 가르는 2인용 카지노 게임. 무승부 없이 매 판 승자가 결정됩니다.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="/play">플레이 시작</a>
        <a class="btn" href="/rules">규칙 보기</a>
      </div>
    </section>
  `;
  return layout({ title: "홈", body });
}
