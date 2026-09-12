(() => {
  const STORAGE_KEY = "metal-extraction-arcade-v2";

  const PATHS = [
    {
      id: "ores",
      title: "Ore Hunt",
      blurb: "Drag ores to their metal, then through the correct extraction process. Faster answers score more.",
      accentA: "#2563eb",
      accentB: "#0ea5e9",
      mode: "ore-hunt",
    },
    {
      id: "iron",
      title: "Blast Furnace Run",
      blurb: "Charge the furnace, blast hot air, and pick the right reaction equations to make iron.",
      accentA: "#dc2626",
      accentB: "#f59e0b",
      mode: "blast-furnace",
    },
    {
      id: "aluminium",
      title: "Electrolysis Sprint",
      blurb: "Build the cell, switch on the current, and answer half-equation MCQs to tap aluminium.",
      accentA: "#7c3aed",
      accentB: "#ec4899",
      mode: "electrolysis",
    },
  ];

  const el = {
    hub: document.getElementById("screen-hub"),
    game: document.getElementById("screen-game"),
    results: document.getElementById("screen-results"),
    pathGrid: document.getElementById("path-grid"),
    totalXp: document.getElementById("total-xp-chip"),
    btnQuit: document.getElementById("btn-quit"),
    hudScore: document.getElementById("hud-score"),
    hudStreak: document.getElementById("hud-streak"),
    hudCombo: document.getElementById("hud-combo"),
    hudProgress: document.getElementById("hud-progress"),
    hudProgressLabel: document.getElementById("hud-progress-label"),
    hudTimeWrap: document.getElementById("hud-time-wrap"),
    hudTime: document.getElementById("hud-time"),
    stage: document.getElementById("game-stage"),
    resultsPath: document.getElementById("results-path"),
    resultsTitle: document.getElementById("results-title"),
    resultsStars: document.getElementById("results-stars"),
    resultsScore: document.getElementById("results-score"),
    resultsAccuracy: document.getElementById("results-accuracy"),
    resultsStreak: document.getElementById("results-streak"),
    resultsXp: document.getElementById("results-xp"),
    resultsNote: document.getElementById("results-note"),
    btnAgain: document.getElementById("btn-again"),
    btnHub: document.getElementById("btn-hub"),
  };

  let progress = loadProgress();
  let activePath = null;
  let activeMode = null;

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { totalXp: 0, paths: {} };
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function pathProgress(id) {
    if (!progress.paths[id]) progress.paths[id] = { bestScore: 0, bestStars: 0, plays: 0 };
    return progress.paths[id];
  }

  function starString(n) {
    return "★".repeat(n) + "☆".repeat(Math.max(0, 3 - n));
  }

  function starsFromAccuracy(pct) {
    if (pct >= 100) return 3;
    if (pct >= 75) return 2;
    if (pct >= 50) return 1;
    return 0;
  }

  function showScreen(name) {
    el.hub.classList.toggle("hidden", name !== "hub");
    el.game.classList.toggle("hidden", name !== "game");
    el.results.classList.toggle("hidden", name !== "results");
  }

  function stopActiveGame() {
    window.OreHuntGame?.stop();
    window.BlastFurnaceGame?.stop();
    window.ElectrolysisGame?.stop();
    el.stage.innerHTML = "";
  }

  function renderHub() {
    el.totalXp.textContent = `XP ${progress.totalXp || 0}`;
    el.pathGrid.innerHTML = PATHS.map((path) => {
      const stats = pathProgress(path.id);
      return `
        <button type="button" class="path-card" data-path="${path.id}"
          style="--accent-a:${path.accentA};--accent-b:${path.accentB}">
          <div>
            <h2>${path.title}</h2>
            <p>${path.blurb}</p>
          </div>
          <div class="path-stats">
            <span>${starString(stats.bestStars || 0)}</span>
            <span>Best ${stats.bestScore || 0}</span>
            <span>Plays ${stats.plays || 0}</span>
          </div>
        </button>`;
    }).join("");

    el.pathGrid.querySelectorAll(".path-card").forEach((btn) => {
      btn.addEventListener("click", () => startPath(btn.dataset.path));
    });
  }

  function onHud(data) {
    el.hudScore.textContent = String(data.score ?? 0);
    el.hudStreak.textContent = String(data.streak ?? 0);
    el.hudCombo.textContent = `×${data.combo ?? 1}`;
    el.hudProgress.textContent = data.progress ?? "—";
    el.hudProgressLabel.textContent = data.label || "Step";
    if (typeof data.timeElapsed === "number") {
      el.hudTimeWrap.classList.remove("hidden");
      el.hudTime.textContent = String(data.timeElapsed);
    } else if (typeof data.timeLeft === "number") {
      el.hudTimeWrap.classList.remove("hidden");
      el.hudTime.textContent = String(data.timeLeft);
    } else {
      el.hudTimeWrap.classList.add("hidden");
    }
  }

  function startPath(pathId) {
    const path = PATHS.find((p) => p.id === pathId);
    if (!path) return;
    activePath = path;
    activeMode = path.mode;
    stopActiveGame();
    showScreen("game");
    el.game.dataset.theme = path.id;

    const shared = {
      onHud,
      onComplete: (result) => finishPath(result),
    };

    if (path.mode === "ore-hunt") {
      window.OreHuntGame.start(el.stage, {
        ...shared,
        target: 8,
      });
    } else if (path.mode === "blast-furnace") {
      window.BlastFurnaceGame.start(el.stage, shared);
    } else if (path.mode === "electrolysis") {
      window.ElectrolysisGame.start(el.stage, shared);
    }
  }

  function finishPath(result) {
    const stats = pathProgress(activePath.id);
    const stars = starsFromAccuracy(result.accuracy ?? 0);
    const prevBest = stats.bestScore || 0;
    const prevStars = stats.bestStars || 0;
    const isBest =
      result.score > prevBest || (result.score === prevBest && stars > prevStars);

    stats.plays += 1;
    stats.bestScore = Math.max(prevBest, result.score);
    stats.bestStars = Math.max(prevStars, stars);
    progress.totalXp = (progress.totalXp || 0) + (result.xpGained || 0);
    saveProgress();

    el.resultsPath.textContent = activePath.title;
    el.resultsTitle.textContent =
      stars === 3 ? "Perfect run!" : stars >= 1 ? "Path cleared!" : "Keep grinding!";
    el.resultsStars.textContent = starString(stars);
    el.resultsScore.textContent = String(result.score);
    el.resultsAccuracy.textContent = `${result.accuracy ?? 0}%`;
    el.resultsStreak.textContent = String(result.streak ?? 0);
    el.resultsXp.textContent = `+${result.xpGained || 0}`;
    el.resultsNote.textContent = isBest
      ? "New personal best saved on this path."
      : `Best on this path: ${stats.bestScore} · ${starString(stats.bestStars)}`;

    stopActiveGame();
    showScreen("results");
    renderHub();
  }

  el.btnQuit.addEventListener("click", () => {
    if (confirm("Quit this run and return to paths?")) {
      stopActiveGame();
      activePath = null;
      showScreen("hub");
      renderHub();
    }
  });
  el.btnAgain.addEventListener("click", () => {
    if (activePath) startPath(activePath.id);
  });
  el.btnHub.addEventListener("click", () => {
    activePath = null;
    showScreen("hub");
    renderHub();
  });

  renderHub();
  showScreen("hub");
})();
