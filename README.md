# Two-Player-Three-Dice (TPTD)

주사위 세 개로 승부를 가르는 2인용 카지노 게임. 무승부 없이 매 판 승자가 결정됩니다.
Cloudflare Workers + D1 위에서 동작하는 오프라인 멀티플레이(한 화면을 두 플레이어가 함께 보는) 웹앱입니다.

- `/play` — 플레이어 이름을 입력하고 주사위를 굴리는 플레이 페이지 (웹앱이 직접 가상 주사위를 굴립니다)
- `/admin` — 세션 목록/라운드 기록을 확인하는 관리자 페이지 (Basic Auth로 보호됨)
- `/rules` — 게임 규칙 설명 페이지

## 규칙 요약

세 주사위: 퍼스트(알파), 베이스(B), 라스트(베타).

1. 기본: B에 더 가까운 값을 굴린 쪽이 승리.
2. B가 두 주사위의 정확히 중간(등거리)인 경우:
   - 알파·베타가 1-3 구간, 4-6 구간에 각각 떨어지면 B가 속한 구간의 주사위가 승리.
   - 1-2-3 또는 4-5-6처럼 붙어있으면 양 끝 값(1 또는 6)이 승리.
3. 알파와 베타가 같은 값이면: 알파는 1-3, 베타는 4-6을 대표. B가 1-3이면 알파, 4-6이면 베타 승리.

이 규칙은 모든 216가지(6×6×6) 조합에서 예외 없이 승자가 정해지도록 설계되어 있습니다. 자세한 증명과
설명은 `src/rules.ts`와 `/rules` 페이지를 참고하세요.

## 개발

```bash
npm install

# D1 로컬 DB에 스키마 적용
npm run db:migrate:local

# 로컬 개발 서버 실행 (http://localhost:8787)
cp .dev.vars.example .dev.vars   # ADMIN_USER / ADMIN_PASSWORD 설정
npm run dev
```

테스트/타입체크:

```bash
npm test         # 규칙 엔진 단위 테스트 (216가지 조합 전수 검사 포함)
npm run typecheck
```

## 배포 (Cloudflare Workers + D1)

1. D1 데이터베이스 생성:

   ```bash
   npx wrangler d1 create tptd-db
   ```

   출력된 `database_id`를 `wrangler.jsonc`의 `d1_databases[0].database_id`에 채워 넣습니다.

2. 마이그레이션 적용 (원격 DB):

   ```bash
   npm run db:migrate:remote
   ```

3. 관리자 비밀번호 시크릿 등록:

   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   ```

   (`ADMIN_USER`는 `wrangler.jsonc`의 `vars`에서 기본값 `admin`으로 설정되어 있으며, 필요시 값을 바꾸거나
   `wrangler secret put ADMIN_USER`로 시크릿으로 덮어쓸 수 있습니다.)

4. 배포:

   ```bash
   npm run deploy
   ```

## 데이터 모델

- `sessions` — 플레이어 이름 쌍(`first_name`, `last_name`)마다 하나. 같은 이름 조합으로 다시 시작하면
  기존 세션에 이어서 기록됩니다.
- `rounds` — 세션에 속한 각 라운드의 주사위 값(`alpha`, `base`, `beta`)과 승자(`winner`).

## 향후 계획

이 저장소는 여러 카지노 주사위 게임 중 첫 번째(TPTD)를 담고 있습니다. 추가 게임에 대한 구조는 추후 논의 후
확장할 예정입니다.
