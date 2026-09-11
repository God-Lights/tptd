export function layout(opts: { title: string; body: string; activeNav?: "play" | "admin" | "rules" }): string {
  const nav = [
    { href: "/play", label: "플레이", key: "play" },
    { href: "/rules", label: "규칙 설명", key: "rules" },
    { href: "/admin", label: "관리자", key: "admin" },
  ]
    .map(
      (item) =>
        `<a href="${item.href}" class="nav-link${item.key === opts.activeNav ? " active" : ""}">${item.label}</a>`,
    )
    .join("");

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${opts.title} · Two-Player-Three-Dice</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <header class="site-header">
    <a href="/" class="brand">TPTD <span>Two-Player-Three-Dice</span></a>
    <nav class="site-nav">${nav}</nav>
  </header>
  <main class="site-main">
    ${opts.body}
  </main>
</body>
</html>`;
}
