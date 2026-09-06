const PROCESS_RANK = {
  mechanical: 1,
  "heat-alone": 2,
  "heat-carbon": 3,
  electrolysis: 4,
};

const PROCESSES = [
  {
    id: "mechanical",
    title: "Mechanical separation",
    aria: "Mechanical separation (e.g. panning)",
    icon: "pan",
  },
  {
    id: "heat-alone",
    title: "Heating alone",
    aria: "Heating the metal ore alone",
    icon: "flame",
  },
  {
    id: "heat-carbon",
    title: "Heating with carbon",
    aria: "Heating the metal ore with carbon",
    icon: "carbon",
  },
  {
    id: "electrolysis",
    title: "Electrolysis of molten metal ore",
    aria: "Electrolysis of molten metal ore",
    icon: "bolt",
  },
];

const LINES = {
  mechanical: [
    "Gold can be extracted by panning",
    "This method involves physical change as no new substances are produced.",
  ],
  "heat-alone": [
    "Silver and mercury (unreactive metals) can be extracted by heating their ores",
    "Word equation: Silver oxide → Silver + oxygen",
    "This method involves chemical change as new substances (silver and oxygen) are produced",
  ],
  "heat-carbon": [
    "Zinc, iron, lead and copper (more reactive metals) can be extracted by heating their ores with carbon",
    "Word equation: Lead(II) oxide + Carbon → Lead + Carbon dioxide",
    "This method involves chemical change as new substances (lead and carbon dioxide) are produced",
  ],
  electrolysis: [
    "Potassium, sodium, calcium, magnesium and aluminium (most reactive metals) can be extracted by electrolysis of their molten ores.",
    "Word equation: Aluminium oxide → Aluminium + Oxygen",
    "This method involves chemical change as new substances (aluminium and oxygen) are produced",
  ],
};

const ORES = [
  {
    id: "gold-ore",
    name: "Gold ore",
    compound: "Gold (Au)",
    metal: "Gold (Au)",
    process: "mechanical",
    swatch: "linear-gradient(90deg, #fef08a, #ca8a04)",
  },
  {
    id: "silver-ore",
    name: "Silver ore",
    compound: "Silver oxide (Ag₂O)",
    metal: "Silver (Ag)",
    process: "heat-alone",
    swatch: "linear-gradient(90deg, #f8fafc, #94a3b8)",
  },
  {
    id: "mercury-ore",
    name: "Mercury ore",
    compound: "Mercury(II) oxide (HgO)",
    metal: "Mercury (Hg)",
    process: "heat-alone",
    swatch: "linear-gradient(90deg, #e7e5e4, #78716c)",
  },
  {
    id: "zinc-ore",
    name: "Zinc ore",
    compound: "Zinc oxide (ZnO)",
    metal: "Zinc (Zn)",
    process: "heat-carbon",
    swatch: "linear-gradient(90deg, #e2e8f0, #64748b)",
  },
  {
    id: "copper-pyrite",
    name: "Copper pyrite",
    compound: "Copper iron sulphide (CuFeS₂)",
    metal: "Copper (Cu)",
    process: "heat-carbon",
    swatch: "linear-gradient(90deg, #f0c14a, #b87333)",
  },
  {
    id: "haematite",
    name: "Haematite",
    compound: "Iron(III) oxide (Fe₂O₃)",
    metal: "Iron (Fe)",
    process: "heat-carbon",
    swatch: "linear-gradient(90deg, #fecaca, #b91c1c)",
  },
  {
    id: "galena",
    name: "Galena",
    compound: "Lead(II) sulphide (PbS)",
    metal: "Lead (Pb)",
    process: "heat-carbon",
    swatch: "linear-gradient(90deg, #cbd5e1, #475569)",
  },
  {
    id: "bauxite",
    name: "Bauxite",
    compound: "Aluminium oxide (Al₂O₃)",
    metal: "Aluminium (Al)",
    process: "electrolysis",
    swatch: "linear-gradient(90deg, #e7d3a8, #8b6914)",
  },
  {
    id: "rock-salt",
    name: "Rock salt",
    compound: "Sodium chloride (NaCl)",
    metal: "Sodium (Na)",
    process: "electrolysis",
    swatch: "linear-gradient(90deg, #f8fafc, #d6d3d1)",
  },
  {
    id: "potassium-ore",
    name: "Potassium ore",
    compound: "Potassium chloride (KCl)",
    metal: "Potassium (K)",
    process: "electrolysis",
    swatch: "linear-gradient(90deg, #e9d5ff, #7e22ce)",
  },
  {
    id: "magnesium-ore",
    name: "Magnesium ore",
    compound: "Magnesium chloride (MgCl₂)",
    metal: "Magnesium (Mg)",
    process: "electrolysis",
    swatch: "linear-gradient(90deg, #d1fae5, #059669)",
  },
  {
    id: "calcium-ore",
    name: "Calcium ore",
    compound: "Calcium chloride (CaCl₂)",
    metal: "Calcium (Ca)",
    process: "electrolysis",
    swatch: "linear-gradient(90deg, #fecaca, #dc2626)",
  },
];

const state = {
  extracted: new Set(),
  dragOreId: null,
  pointerId: null,
  ghost: null,
  pendingCongrats: false,
  congratsShown: false,
  congratsTimer: null,
};

const oreTray = document.getElementById("ore-tray");
const stationsEl = document.getElementById("stations");
const resultsEl = document.getElementById("results");
const resultsEmpty = document.getElementById("results-empty");
const progressPill = document.getElementById("progress-pill");
const progressFill = document.getElementById("progress-fill");
const feedback = document.getElementById("feedback");
const feedbackHeader = document.getElementById("feedback-header");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackBody = document.getElementById("feedback-body");
const feedbackClose = document.getElementById("feedback-close");
const overlayKb = document.getElementById("overlay-kb");
const overlayCongrats = document.getElementById("overlay-congrats");
const congratsBurst = document.getElementById("congrats-burst");
const congratsKb = document.getElementById("congrats-kb");
const toggleKb = document.getElementById("toggle-kb");
const kbClose = document.getElementById("kb-close");
const resetLab = document.getElementById("reset-lab");

function iconSvg(kind) {
  const icons = {
    pan: `
      <svg class="station-symbol" viewBox="0 0 120 120" aria-hidden="true">
        <!-- Gold pan (panning tool) with long handle -->
        <path d="M78 58 L108 42" stroke="#78350f" stroke-width="7" stroke-linecap="round"/>
        <path d="M78 58 L108 42" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>
        <rect x="104" y="34" width="12" height="20" rx="3" transform="rotate(-28 110 44)" fill="#92400e"/>
        <ellipse cx="52" cy="72" rx="38" ry="14" fill="#d6d3d1" stroke="#78716c" stroke-width="2.5"/>
        <path d="M18 68 C22 42 36 30 52 30 C68 30 82 42 86 68" fill="#e7e5e4" stroke="#78716c" stroke-width="2.5"/>
        <ellipse cx="52" cy="68" rx="30" ry="9" fill="#93c5fd" opacity="0.55"/>
        <path d="M28 66 Q52 74 76 66" fill="none" stroke="#60a5fa" stroke-width="2" opacity="0.7"/>
        <circle cx="42" cy="66" r="4.5" fill="#eab308"/>
        <circle cx="56" cy="70" r="3.5" fill="#ca8a04"/>
        <circle cx="50" cy="62" r="2.8" fill="#facc15"/>
        <circle cx="62" cy="65" r="2.2" fill="#a16207"/>
      </svg>`,
    flame: `
      <svg class="station-symbol" viewBox="0 0 120 120" aria-hidden="true">
        <!-- Crucible / dish with ore (contents being heated) -->
        <ellipse cx="60" cy="34" rx="30" ry="8" fill="#a8a29e" stroke="#57534e" stroke-width="2"/>
        <path d="M30 34 L36 58 Q60 68 84 58 L90 34" fill="#d6d3d1" stroke="#57534e" stroke-width="2.2"/>
        <ellipse cx="60" cy="34" rx="26" ry="6" fill="#78716c"/>
        <ellipse cx="60" cy="32" rx="14" ry="5" fill="#57534e"/>
        <!-- Stand -->
        <line x1="38" y1="58" x2="30" y2="72" stroke="#78716c" stroke-width="3" stroke-linecap="round"/>
        <line x1="82" y1="58" x2="90" y2="72" stroke="#78716c" stroke-width="3" stroke-linecap="round"/>
        <line x1="60" y1="62" x2="60" y2="74" stroke="#78716c" stroke-width="3" stroke-linecap="round"/>
        <!-- Fire symbol under the contents -->
        <path d="M60 112
                 C48 100 42 90 46 78
                 C50 88 56 86 58 76
                 C60 86 68 84 70 74
                 C76 88 74 100 60 112 Z"
              fill="#ea580c"/>
        <path d="M60 108
                 C52 98 50 90 52 82
                 C54 90 58 88 60 82
                 C62 88 66 90 66 82
                 C70 92 68 100 60 108 Z"
              fill="#facc15"/>
        <path d="M60 104 C56 96 57 90 60 86 C63 90 64 96 60 104 Z" fill="#fff7ed"/>
      </svg>`,
    carbon: `
      <svg class="station-symbol" viewBox="0 0 120 120" aria-hidden="true">
        <!-- Crucible with ore + carbon -->
        <ellipse cx="60" cy="30" rx="32" ry="8" fill="#78716c" stroke="#44403c" stroke-width="2"/>
        <path d="M28 30 L34 56 Q60 66 86 56 L92 30" fill="#a8a29e" stroke="#44403c" stroke-width="2.2"/>
        <ellipse cx="60" cy="30" rx="28" ry="6" fill="#57534e"/>
        <!-- Ore lump -->
        <ellipse cx="48" cy="28" rx="10" ry="6" fill="#a8a29e"/>
        <!-- Carbon piece with C -->
        <circle cx="72" cy="28" r="9" fill="#1c1917"/>
        <text x="72" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#f8fafc">C</text>
        <!-- Stand -->
        <line x1="38" y1="56" x2="30" y2="70" stroke="#78716c" stroke-width="3" stroke-linecap="round"/>
        <line x1="82" y1="56" x2="90" y2="70" stroke="#78716c" stroke-width="3" stroke-linecap="round"/>
        <line x1="60" y1="60" x2="60" y2="72" stroke="#78716c" stroke-width="3" stroke-linecap="round"/>
        <!-- Fire symbol under the contents -->
        <path d="M60 112
                 C48 100 42 90 46 78
                 C50 88 56 86 58 76
                 C60 86 68 84 70 74
                 C76 88 74 100 60 112 Z"
              fill="#ea580c"/>
        <path d="M60 108
                 C52 98 50 90 52 82
                 C54 90 58 88 60 82
                 C62 88 66 90 66 82
                 C70 92 68 100 60 108 Z"
              fill="#facc15"/>
        <path d="M60 104 C56 96 57 90 60 86 C63 90 64 96 60 104 Z" fill="#fff7ed"/>
      </svg>`,
    bolt: `
      <svg class="station-symbol" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="24" y="34" width="72" height="58" rx="6" fill="#e2e8f0" stroke="#64748b" stroke-width="3"/>
        <rect x="34" y="22" width="10" height="18" rx="2" fill="#334155"/>
        <rect x="76" y="22" width="10" height="18" rx="2" fill="#334155"/>
        <text x="39" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">+</text>
        <text x="81" y="18" text-anchor="middle" font-size="14" font-weight="700" fill="#2563eb">−</text>
        <path d="M62 44 L48 66 h12 l-4 22 18-28 H62 l4-16z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <ellipse cx="60" cy="88" rx="18" ry="5" fill="#93c5fd" opacity="0.7"/>
      </svg>`,
  };
  return icons[kind] || "";
}

function renderStations() {
  stationsEl.innerHTML = PROCESSES.map(
    (p) => `
    <div class="station" data-process="${p.id}" role="region" aria-label="${p.aria}">
      ${iconSvg(p.icon)}
      <span class="station-label">${p.title}</span>
    </div>`
  ).join("");
}

function renderOres() {
  oreTray.innerHTML = ORES.map((ore) => {
    const done = state.extracted.has(ore.id);
    return `
      <button
        type="button"
        class="ore${done ? " extracted" : ""}"
        data-ore="${ore.id}"
        role="listitem"
        ${done ? "disabled" : ""}
      >
        <span class="ore-swatch" style="background:${ore.swatch}" aria-hidden="true"></span>
        <span class="ore-name">${ore.name}</span>
        <span class="ore-compound">${ore.compound}</span>
      </button>`;
  }).join("");
}

function updateProgress() {
  const n = state.extracted.size;
  const total = ORES.length;
  progressPill.textContent = `${n} / ${total} extracted`;
  progressFill.style.width = `${(n / total) * 100}%`;
  resultsEmpty.hidden = n > 0;

  const existing = document.querySelector(".complete-note");
  if (n === total && !existing) {
    const note = document.createElement("p");
    note.className = "complete-note";
    note.textContent = "All metals extracted.";
    resultsEmpty.parentElement.appendChild(note);
    state.pendingCongrats = true;
  }
}

function spawnConfetti() {
  congratsBurst.innerHTML = "";
  const colors = ["#2563eb", "#16a34a", "#eab308", "#dc2626", "#7c3aed", "#0ea5e9", "#f97316"];
  for (let i = 0; i < 48; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${1.4 + Math.random() * 1.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.width = `${6 + Math.random() * 6}px`;
    piece.style.height = `${8 + Math.random() * 10}px`;
    congratsBurst.appendChild(piece);
  }
}

function showCongrats() {
  if (state.congratsShown) return;
  state.congratsShown = true;
  state.pendingCongrats = false;
  hideFeedback();
  spawnConfetti();
  overlayCongrats.hidden = false;
  window.clearTimeout(state.congratsTimer);
  state.congratsTimer = window.setTimeout(() => {
    if (!overlayCongrats.hidden) openKnowledgeBase();
  }, 2200);
}

function openKnowledgeBase() {
  overlayCongrats.hidden = true;
  overlayKb.hidden = false;
}

function addResult(ore) {
  const card = document.createElement("div");
  card.className = "result-card";
  card.innerHTML = `
    <span class="result-metal">${ore.metal}</span>
    <span class="result-from">from ${ore.name}</span>`;
  resultsEl.appendChild(card);
}

function showFeedback({ ok, title, lines }) {
  feedbackHeader.classList.toggle("ok-header", !!ok);
  feedbackHeader.classList.toggle("warn-header", !ok);
  feedbackTitle.textContent = title;
  feedbackBody.className = "feedback-body";
  feedbackBody.innerHTML = lines
    .map((line) => {
      if (line.startsWith("Word equation:")) {
        return `<p class="eq">${line}</p>`;
      }
      return `<p>${line}</p>`;
    })
    .join("");
  feedback.hidden = false;
}

function hideFeedback() {
  feedback.hidden = true;
}

function closeFeedback() {
  hideFeedback();
  if (state.pendingCongrats && !state.congratsShown) {
    showCongrats();
  }
}

function getOre(id) {
  return ORES.find((o) => o.id === id);
}

function getStationFromPoint(x, y) {
  if (state.ghost) state.ghost.style.visibility = "hidden";
  const el = document.elementFromPoint(x, y);
  if (state.ghost) state.ghost.style.visibility = "visible";
  if (!el) return null;
  return el.closest(".station");
}

function createGhost(ore, x, y) {
  removeGhost();
  const ghost = document.createElement("div");
  ghost.className = "ghost-ore";
  ghost.innerHTML = `
    <span class="ore-swatch" style="background:${ore.swatch};display:block;height:8px;margin-bottom:0.35rem;border-radius:999px"></span>
    ${ore.name}`;
  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;
  document.body.appendChild(ghost);
  state.ghost = ghost;
}

function moveGhost(x, y) {
  if (!state.ghost) return;
  state.ghost.style.left = `${x}px`;
  state.ghost.style.top = `${y}px`;
}

function removeGhost() {
  if (state.ghost) {
    state.ghost.remove();
    state.ghost = null;
  }
  document.querySelectorAll(".station.drag-over").forEach((s) => s.classList.remove("drag-over"));
}

function tryDrop(oreId, processId, stationEl) {
  const ore = getOre(oreId);
  if (!ore || state.extracted.has(ore.id)) return;

  const neededRank = PROCESS_RANK[ore.process];
  const usedRank = PROCESS_RANK[processId];

  if (ore.process === processId) {
    stationEl.classList.add("success-flash");
    setTimeout(() => stationEl.classList.remove("success-flash"), 700);
    state.extracted.add(ore.id);
    renderOres();
    addResult(ore);
    updateProgress();
    bindOreEvents();
    showFeedback({
      ok: true,
      title: `${ore.metal} extracted`,
      lines: LINES[ore.process],
    });
    return;
  }

  stationEl.classList.add("fail-flash");
  setTimeout(() => stationEl.classList.remove("fail-flash"), 550);

  // Higher-degree method: works in theory, but not best / less efficient
  if (usedRank > neededRank) {
    showFeedback({
      ok: false,
      title: "Not the best method — try again",
      lines: [
        `In theory, this higher degree of extraction method can still extract the metal from ${ore.name}.`,
        "However, it is not the best way. Higher degree of extraction methods require more energy, making the process less efficient for extraction of less reactive metals.",
        "Try again with a more suitable method.",
      ],
    });
    return;
  }

  // Lower-degree method: cannot extract
  showFeedback({
    ok: false,
    title: "Not the correct process",
    lines: [
      `${ore.name} was not extracted by this method.`,
      ...LINES[processId],
    ],
  });
}

function onPointerDown(e) {
  const oreBtn = e.currentTarget;
  if (oreBtn.classList.contains("extracted")) return;
  if (e.button !== undefined && e.button !== 0) return;

  const oreId = oreBtn.dataset.ore;
  const ore = getOre(oreId);
  state.dragOreId = oreId;
  state.pointerId = e.pointerId;
  oreBtn.classList.add("dragging");
  oreBtn.setPointerCapture(e.pointerId);
  createGhost(ore, e.clientX, e.clientY);
  e.preventDefault();
}

function onPointerMove(e) {
  if (state.dragOreId == null || e.pointerId !== state.pointerId) return;
  moveGhost(e.clientX, e.clientY);

  document.querySelectorAll(".station.drag-over").forEach((s) => s.classList.remove("drag-over"));
  const station = getStationFromPoint(e.clientX, e.clientY);
  if (station) station.classList.add("drag-over");
}

function onPointerUp(e) {
  if (state.dragOreId == null || e.pointerId !== state.pointerId) return;

  const oreId = state.dragOreId;
  const station = getStationFromPoint(e.clientX, e.clientY);
  const oreBtn = document.querySelector(`.ore[data-ore="${oreId}"]`);
  if (oreBtn) {
    oreBtn.classList.remove("dragging");
    try {
      oreBtn.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }

  removeGhost();
  state.dragOreId = null;
  state.pointerId = null;

  if (station) {
    tryDrop(oreId, station.dataset.process, station);
  }
}

function onPointerCancel(e) {
  if (e.pointerId !== state.pointerId) return;
  const oreBtn = document.querySelector(`.ore[data-ore="${state.dragOreId}"]`);
  if (oreBtn) oreBtn.classList.remove("dragging");
  removeGhost();
  state.dragOreId = null;
  state.pointerId = null;
}

function bindOreEvents() {
  document.querySelectorAll(".ore:not(.extracted)").forEach((btn) => {
    btn.addEventListener("pointerdown", onPointerDown);
    btn.addEventListener("pointermove", onPointerMove);
    btn.addEventListener("pointerup", onPointerUp);
    btn.addEventListener("pointercancel", onPointerCancel);
  });
}

function reset() {
  state.extracted.clear();
  state.pendingCongrats = false;
  state.congratsShown = false;
  window.clearTimeout(state.congratsTimer);
  resultsEl.innerHTML = "";
  document.querySelector(".complete-note")?.remove();
  hideFeedback();
  overlayCongrats.hidden = true;
  overlayKb.hidden = true;
  congratsBurst.innerHTML = "";
  renderOres();
  updateProgress();
  bindOreEvents();
}

toggleKb.addEventListener("click", () => {
  overlayKb.hidden = false;
});

kbClose.addEventListener("click", () => {
  overlayKb.hidden = true;
});

overlayKb.addEventListener("click", (e) => {
  if (e.target === overlayKb) overlayKb.hidden = true;
});

feedbackClose.addEventListener("click", closeFeedback);
feedback.addEventListener("click", (e) => {
  if (e.target === feedback) closeFeedback();
});

congratsKb.addEventListener("click", () => {
  window.clearTimeout(state.congratsTimer);
  openKnowledgeBase();
});

overlayCongrats.addEventListener("click", (e) => {
  if (e.target === overlayCongrats) {
    window.clearTimeout(state.congratsTimer);
    openKnowledgeBase();
  }
});

resetLab.addEventListener("click", reset);

renderStations();
renderOres();
updateProgress();
bindOreEvents();
