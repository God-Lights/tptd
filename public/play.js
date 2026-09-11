(() => {
  const setupForm = document.getElementById("player-form");
  const setupSection = document.getElementById("setup-form");
  const gameSection = document.getElementById("game-screen");
  const setupError = document.getElementById("setup-error");

  const firstNameLabel = document.getElementById("first-name-label");
  const lastNameLabel = document.getElementById("last-name-label");
  const firstNameScoreLabel = document.getElementById("first-name-score-label");
  const lastNameScoreLabel = document.getElementById("last-name-score-label");
  const firstWinsEl = document.getElementById("first-wins");
  const lastWinsEl = document.getElementById("last-wins");
  const roundCountEl = document.getElementById("round-count");
  const dieAlpha = document.getElementById("die-alpha");
  const dieBase = document.getElementById("die-base");
  const dieBeta = document.getElementById("die-beta");
  const rollBtn = document.getElementById("roll-btn");
  const winnerAnnouncement = document.getElementById("winner-announcement");
  const roundHistory = document.getElementById("round-history");
  const changePlayersBtn = document.getElementById("change-players");

  let currentSession = null;

  function showGame(session, summary, rounds) {
    currentSession = session;
    setupSection.hidden = true;
    gameSection.hidden = false;

    firstNameLabel.textContent = session.first_name;
    lastNameLabel.textContent = session.last_name;
    firstNameScoreLabel.textContent = session.first_name;
    lastNameScoreLabel.textContent = session.last_name;

    updateScoreboard(summary);

    roundHistory.innerHTML = "";
    for (const round of rounds) {
      appendRoundRow(round);
    }

    const url = new URL(window.location.href);
    url.searchParams.set("session", session.id);
    window.history.replaceState({}, "", url);
  }

  function updateScoreboard(summary) {
    firstWinsEl.textContent = String(summary.firstWins);
    lastWinsEl.textContent = String(summary.lastWins);
    roundCountEl.textContent = String(summary.roundCount);
  }

  function winnerLabel(winner) {
    return winner === "first" ? currentSession.first_name : currentSession.last_name;
  }

  function appendRoundRow(round) {
    const tr = document.createElement("tr");
    const cells = [round.round_no, round.alpha, round.base, round.beta, winnerLabel(round.winner)];
    for (const value of cells) {
      const td = document.createElement("td");
      td.textContent = String(value);
      tr.appendChild(td);
    }
    roundHistory.prepend(tr);
  }

  async function startSession(firstName, lastName) {
    setupError.hidden = true;
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: firstName, last_name: lastName }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setupError.textContent = body.error || "세션을 시작하지 못했습니다.";
      setupError.hidden = false;
      return;
    }
    const data = await res.json();
    showGame(data.session, data.summary, data.rounds);
  }

  async function loadSession(sessionId) {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (!res.ok) {
      return false;
    }
    const data = await res.json();
    showGame(data.session, data.summary, data.rounds);
    return true;
  }

  async function rollRound() {
    if (!currentSession) return;
    rollBtn.disabled = true;
    winnerAnnouncement.textContent = "";
    dieAlpha.classList.add("rolling");
    dieBase.classList.add("rolling");
    dieBeta.classList.add("rolling");

    try {
      const res = await fetch(`/api/sessions/${currentSession.id}/rounds`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        winnerAnnouncement.textContent = body.error || "라운드를 진행하지 못했습니다.";
        return;
      }
      const data = await res.json();

      await new Promise((resolve) => setTimeout(resolve, 500));

      dieAlpha.textContent = String(data.round.alpha);
      dieBase.textContent = String(data.round.base);
      dieBeta.textContent = String(data.round.beta);

      updateScoreboard(data.summary);
      appendRoundRow(data.round);
      winnerAnnouncement.textContent = `${winnerLabel(data.round.winner)} 승!`;
    } finally {
      dieAlpha.classList.remove("rolling");
      dieBase.classList.remove("rolling");
      dieBeta.classList.remove("rolling");
      rollBtn.disabled = false;
    }
  }

  setupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(setupForm);
    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    if (!firstName || !lastName) return;
    startSession(firstName, lastName);
  });

  rollBtn.addEventListener("click", rollRound);

  changePlayersBtn.addEventListener("click", () => {
    currentSession = null;
    gameSection.hidden = true;
    setupSection.hidden = false;
    setupForm.reset();
    const url = new URL(window.location.href);
    url.searchParams.delete("session");
    window.history.replaceState({}, "", url);
  });

  const existingSessionId = new URL(window.location.href).searchParams.get("session");
  if (existingSessionId) {
    loadSession(existingSessionId);
  }
})();
