/**
 * Ore Hunt — unique ores → stick to metals → drag pairs to extraction process
 */
window.OreHuntGame = (() => {
  const ORES = [
    { id: "haematite", label: "Haematite", metal: "Iron", process: "heating-reducing" },
    { id: "copper-pyrite", label: "Copper pyrite", metal: "Copper", process: "heating-reducing" },
    { id: "bauxite", label: "Bauxite", metal: "Aluminium", process: "electrolysis" },
    { id: "gold-ore", label: "Gold ore", metal: "Gold", process: "mechanical" },
    { id: "cinnabar", label: "Cinnabar", metal: "Mercury", process: "heating-alone" },
    { id: "argentite", label: "Argentite", metal: "Silver", process: "heating-alone" },
    { id: "galena", label: "Galena", metal: "Lead", process: "heating-reducing" },
    { id: "zinc-sulphide", label: "Zinc sulphide", metal: "Zinc", process: "heating-reducing" },
  ];

  const PROCESSES = [
    { id: "mechanical", label: "Mechanical separation" },
    { id: "heating-alone", label: "Heating alone" },
    { id: "heating-reducing", label: "Heating with reducing agent" },
    { id: "electrolysis", label: "Electrolysis of molten metal ore" },
  ];

  let state = null;
  let timerId = null;

  function shuffle(a) {
    const x = [...a];
    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [x[i], x[j]] = [x[j], x[i]];
    }
    return x;
  }

  function emitHud() {
    state?.onHud?.({
      score: state.score,
      streak: state.streak,
      combo: state.combo,
      progress: `${state.produced}/${state.target}`,
      timeLeft: state.timeLeft,
      label: "Produced",
    });
  }

  function addScore(base) {
    const gained = base * state.combo;
    state.score += gained;
    state.xpGained += Math.round(gained / 10);
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.combo = Math.min(3, state.combo + 1);
    state.correct += 1;
    return gained;
  }

  function miss() {
    state.streak = 0;
    state.combo = 1;
    state.mistakes += 1;
    state.timeLeft = Math.max(0, state.timeLeft - 3);
  }

  function toast(msg, bad) {
    let t = state.root.querySelector(".game-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "game-toast";
      state.root.appendChild(t);
    }
    t.textContent = msg;
    t.classList.toggle("bad", !!bad);
    t.classList.add("show");
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function flash(el, ok) {
    el.classList.add(ok ? "drop-ok" : "drop-bad");
    setTimeout(() => el.classList.remove("drop-ok", "drop-bad"), 450);
  }

  function setInstruction(html) {
    const el = state.root.querySelector("#ore-instruction");
    if (el) el.innerHTML = html;
  }

  function clearProcessHover() {
    state.root.querySelectorAll("[data-process-target]").forEach((b) => {
      b.classList.remove("drop-hover");
    });
  }

  function highlightProcessUnderPointer(clientX, clientY) {
    clearProcessHover();
    const bins = [...state.root.querySelectorAll("[data-process-target]")];
    const hit = bins.find((b) => {
      const r = b.getBoundingClientRect();
      return (
        clientX >= r.left &&
        clientX <= r.right &&
        clientY >= r.top &&
        clientY <= r.bottom
      );
    });
    if (!hit) return;
    hit.classList.add("drop-hover");
  }

  function enableDrag(el, { canDrag, onDrop, getHome, onMoveExtra }) {
    let dragging = false;
    let ox = 0;
    let oy = 0;
    let pointerId = null;

    el.addEventListener("pointerdown", (e) => {
      if (state.paused || !canDrag()) return;
      dragging = true;
      pointerId = e.pointerId;
      el.classList.add("dragging");
      state.root.classList.add("is-dragging-pair");
      const r = el.getBoundingClientRect();
      ox = e.clientX - r.left;
      oy = e.clientY - r.top;
      state.root.appendChild(el);
      el.style.position = "fixed";
      el.style.width = `${r.width}px`;
      el.style.left = `${r.left}px`;
      el.style.top = `${r.top}px`;
      el.style.zIndex = "100";
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    el.addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      el.style.left = `${e.clientX - ox}px`;
      el.style.top = `${e.clientY - oy}px`;
      onMoveExtra?.(el, e.clientX, e.clientY);
    });

    el.addEventListener("pointerup", (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      el.classList.remove("dragging");
      state.root.classList.remove("is-dragging-pair");
      clearProcessHover();
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (_) {}

      const kept = onDrop(el, e.clientX, e.clientY);
      if (el.isConnected && kept !== "attached") {
        const home = getHome();
        if (home) home.appendChild(el);
        el.style.position = "";
        el.style.left = "";
        el.style.top = "";
        el.style.width = "";
        el.style.zIndex = "";
      }
    });

    el.addEventListener("pointercancel", () => {
      if (!dragging) return;
      dragging = false;
      pointerId = null;
      el.classList.remove("dragging");
      state.root.classList.remove("is-dragging-pair");
      clearProcessHover();
      const home = getHome();
      if (home && el.isConnected) home.appendChild(el);
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.width = "";
      el.style.zIndex = "";
    });
  }

  function buildOreChip(ore) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "ore-chip";
    el.textContent = ore.label;
    el.dataset.oreId = ore.id;
    el.dataset.metal = ore.metal;
    el.dataset.process = ore.process;
    enableDrag(el, {
      canDrag: () => state.phase === "match" && !el.dataset.matched,
      getHome: () => state.root.querySelector("#ore-tray"),
      onDrop: (chip, x, y) => dropOreOnMetal(chip, x, y),
    });
    return el;
  }

  function dropOreOnMetal(chip, x, y) {
    const bins = [...state.root.querySelectorAll("[data-metal-target]")];
    const hit = bins.find((b) => {
      const r = b.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
    if (!hit) return "home";

    if (hit.dataset.occupied === "1") {
      miss();
      flash(hit, false);
      toast("That metal already has an ore!", true);
      emitHud();
      return "home";
    }

    if (hit.dataset.metalTarget !== chip.dataset.metal) {
      miss();
      flash(hit, false);
      chip.classList.add("shake");
      setTimeout(() => chip.classList.remove("shake"), 400);
      toast("Wrong metal!", true);
      emitHud();
      return "home";
    }

    const gained = addScore(100);
    chip.dataset.matched = "1";
    hit.dataset.occupied = "1";
    hit.classList.add("has-ore");
    flash(hit, true);

    const slot = hit.querySelector(".metal-ore-slot");
    chip.style.position = "";
    chip.style.left = "";
    chip.style.top = "";
    chip.style.width = "";
    chip.style.zIndex = "";
    chip.classList.add("seated");
    slot.appendChild(chip);

    state.matched += 1;
    toast(`Matched ${chip.dataset.metal}! +${gained}`);
    emitHud();

    if (state.matched >= state.target) {
      enterProcessPhase();
    }
    return "attached";
  }

  function enterProcessPhase() {
    state.phase = "process";
    setInstruction(
      "All ores matched! Drag each <strong>metal + ore</strong> pair onto the correct <strong>extraction process</strong>."
    );
    state.root.querySelector("#ore-tray-wrap")?.classList.add("done");
    state.root.querySelector(".processes-wrap")?.classList.add("active-phase");

    state.root.querySelectorAll("[data-metal-target]").forEach((bin) => {
      if (bin.dataset.occupied !== "1") return;
      bin.classList.add("draggable-pair");
      enableDrag(bin, {
        canDrag: () => state.phase === "process" && bin.dataset.extracted !== "1",
        getHome: () => state.root.querySelector(".metals"),
        onDrop: (pair, x, y) => dropPairOnProcess(pair, x, y),
        onMoveExtra: (_pair, x, y) => {
          highlightProcessUnderPointer(x, y);
        },
      });
    });

    toast("Now extract each metal!");
  }

  function dropPairOnProcess(pairEl, x, y) {
    const bins = [...state.root.querySelectorAll("[data-process-target]")];
    const hit = bins.find((b) => {
      const r = b.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
    if (!hit) return "home";

    const oreChip = pairEl.querySelector(".ore-chip");
    const processId = oreChip?.dataset.process;
    if (hit.dataset.processTarget !== processId) {
      miss();
      flash(hit, false);
      pairEl.classList.add("shake");
      setTimeout(() => pairEl.classList.remove("shake"), 400);
      toast("Wrong extraction process!", true);
      emitHud();
      return "home";
    }

    const gained = addScore(150);
    flash(hit, true);
    toast(`Extracted ${pairEl.dataset.metalTarget}! +${gained}`);
    pairEl.dataset.extracted = "1";
    pairEl.classList.add("extracted");
    pairEl.style.position = "";
    pairEl.style.left = "";
    pairEl.style.top = "";
    pairEl.style.width = "";
    pairEl.style.zIndex = "";
    // Return to metals grid visually but marked done
    state.root.querySelector(".metals").appendChild(pairEl);

    state.produced += 1;
    emitHud();
    if (state.produced >= state.target) end();
    return "attached";
  }

  function tick() {
    if (!state || state.paused) return;
    state.timeLeft -= 1;
    emitHud();
    if (state.timeLeft <= 0) end();
  }

  function end() {
    clearInterval(timerId);
    timerId = null;
    if (!state || state.finished) return;
    state.finished = true;
    const total = state.correct + state.mistakes;
    state.onComplete?.({
      score: state.score,
      streak: state.bestStreak,
      correct: state.correct,
      total: Math.max(total, 1),
      accuracy: total ? Math.round((state.correct / total) * 100) : state.produced ? 100 : 0,
      xpGained: state.xpGained,
      produced: state.produced,
    });
  }

  function start(root, { durationSec = 90, target = 6, onHud, onComplete } = {}) {
    stop();
    const count = Math.min(Math.max(1, Number(target) || 6), ORES.length);
    const selected = shuffle(ORES).slice(0, count);
    const metalsInPlay = [...new Set(selected.map((o) => o.metal))];

    state = {
      root,
      phase: "match", // match | process
      score: 0,
      streak: 0,
      bestStreak: 0,
      combo: 1,
      correct: 0,
      mistakes: 0,
      xpGained: 0,
      produced: 0,
      matched: 0,
      target: count,
      timeLeft: durationSec,
      paused: false,
      finished: false,
      onHud,
      onComplete,
    };

    root.innerHTML = `
      <div class="sim-layout ore-hunt-layout">
        <p class="sim-instruction" id="ore-instruction">
          Drag each <strong>ore</strong> onto its correct <strong>metal</strong>. Ores do not repeat.
        </p>
        <div id="ore-tray-wrap" class="ore-tray-wrap">
          <h3>Ores</h3>
          <div class="ore-tray" id="ore-tray"></div>
        </div>
        <div class="drop-row">
          <div class="drop-group">
            <h3>Metals</h3>
            <div class="drop-grid metals">
              ${metalsInPlay
                .map(
                  (m) => `
                <div class="drop-bin metal-bin" data-metal-target="${m}">
                  <span class="metal-name">${m}</span>
                  <div class="metal-ore-slot"></div>
                </div>`
                )
                .join("")}
            </div>
          </div>
          <div class="drop-group processes-wrap">
            <h3>Extraction process</h3>
            <div class="drop-grid processes">
              ${PROCESSES.map(
                (p) =>
                  `<div class="drop-bin process" data-process-target="${p.id}">${p.label}</div>`
              ).join("")}
            </div>
          </div>
        </div>
      </div>`;

    const tray = root.querySelector("#ore-tray");
    selected.forEach((ore) => tray.appendChild(buildOreChip(ore)));

    emitHud();
    timerId = setInterval(tick, 1000);
  }

  function stop() {
    clearInterval(timerId);
    timerId = null;
    state = null;
  }

  return { start, stop, ORES, PROCESSES };
})();
