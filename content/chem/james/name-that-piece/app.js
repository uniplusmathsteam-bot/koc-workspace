const PREVIEW_DEFAULT = 1.8;
const PREVIEW_MIN = 1;
const PREVIEW_STEP = 0.3;
const PREVIEW_MAX = 3;

const state = {
  view: "home",
  lang: "en",
  streak: 0,
  learnId: "beaker",
  learnSeen: {},
  mode: "name",
  deck: [],
  i: 0,
  pick: "",
  checked: false,
  firstTry: {},
  missCounts: {},
  missQueue: [],
  phase: "main",
  recapQueue: [],
  previewSize: PREVIEW_DEFAULT,
  cleared: {},
  bestFirst: 0,
  fb: null,
  hideDescriptions: false,
};

function displayName(item) {
  if (!item) return "";
  if (state.lang === "zh") return `${item.zh} · ${item.name}`;
  return item.name;
}

function optionLabel(nameOrId, isId) {
  const item = isId ? byId(nameOrId) : APPARATUS.find((row) => row.name === nameOrId);
  return displayName(item) || nameOrId;
}

function currentQ() {
  if (state.phase === "recap") return state.recapQueue[0] || null;
  return state.deck[state.i] || null;
}

function firstTryCorrect() {
  return Object.values(state.firstTry).filter((ok) => ok === true).length;
}

function firstTryTotal() {
  return Object.keys(state.firstTry).length;
}

function stationNeed() {
  return state.deck.length || 0;
}

function isCleanCleared() {
  return Boolean(state.cleared.drill);
}

function drillStamp() {
  const need = stationNeed();
  if (isCleanCleared()) return `<span class="stamp cleared">Cleared</span>`;
  if (state.phase === "done" && need) return `<span class="stamp revised">Revised</span>`;
  if (need && firstTryTotal()) return `<span class="stamp progress">${firstTryCorrect()}/${need} first try</span>`;
  return "";
}

function learnStamp() {
  const need = APPARATUS.length;
  const got = Object.keys(state.learnSeen).length;
  if (got >= need) return `<span class="stamp cleared">Seen</span>`;
  if (got > 0) return `<span class="stamp progress">${got}/${need}</span>`;
  return `<span class="stamp todo">0/${need}</span>`;
}

function streakTier() {
  let tier = STREAK_TIERS[0];
  STREAK_TIERS.forEach((row) => {
    if (state.streak >= row.min) tier = row;
  });
  return tier;
}

function paintStreak() {
  const hud = document.getElementById("streak-hud");
  if (!hud) return;
  const tier = streakTier();
  hud.innerHTML = `<div class="streak" title="Correct first tries in a row"><span class="streak-n">${state.streak}</span><span class="streak-label">${tier.label}</span><span class="streak-note">${tier.note}</span></div>`;
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

let confettiFrame = 0;
function burstConfetti() {
  if (prefersReducedMotion()) return;
  const canvas = document.getElementById("confetti");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (confettiFrame) cancelAnimationFrame(confettiFrame);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add("show");
  const colors = ["#0ea5e9", "#1d4ed8", "#38bdf8", "#fbbf24", "#34d399", "#fff"];
  const pieces = Array.from({ length: 48 }, () => ({
    x: Math.random() * canvas.width,
    y: -24 - Math.random() * 80,
    w: 6 + Math.random() * 7,
    h: 8 + Math.random() * 10,
    vx: -3 + Math.random() * 6,
    vy: 3.5 + Math.random() * 5,
    rot: Math.random() * 360,
    vr: -8 + Math.random() * 16,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  let t = 0;
  const tick = () => {
    t += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.14;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (t < 55) confettiFrame = requestAnimationFrame(tick);
    else {
      confettiFrame = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.remove("show");
    }
  };
  confettiFrame = requestAnimationFrame(tick);
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lang: state.lang,
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
      previewSize: state.previewSize,
      streak: state.streak,
      learnId: state.learnId,
      learnSeen: state.learnSeen,
      mode: state.mode,
      deck: state.deck,
      i: state.i,
      firstTry: state.firstTry,
      missCounts: state.missCounts,
      missQueue: state.missQueue,
      phase: state.phase,
      recapQueue: state.recapQueue,
      cleared: state.cleared,
      bestFirst: state.bestFirst,
      view: state.view === "home" ? "home" : state.view,
    }));
  } catch (err) { /* file:// may block storage */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.lang = data.lang === "zh" ? "zh" : "en";
    state.previewSize = clampPreviewSize(data.previewSize);
    state.streak = data.streak || 0;
    state.learnId = data.learnId || "beaker";
    state.learnSeen = data.learnSeen || {};
    state.mode = data.mode || "name";
    state.deck = Array.isArray(data.deck) ? data.deck : [];
    state.i = data.i || 0;
    state.firstTry = data.firstTry || {};
    state.missCounts = data.missCounts || {};
    state.missQueue = data.missQueue || [];
    state.phase = data.phase || "main";
    state.recapQueue = Array.isArray(data.recapQueue) ? data.recapQueue : [];
    state.cleared = data.cleared || {};
    state.bestFirst = data.bestFirst || 0;
    if (data.theme === "dark" || data.theme === "light") applyTheme(data.theme === "dark", true);
  } catch (err) { /* ignore */ }
}

function applyTheme(dark, skipSave) {
  document.documentElement.classList.toggle("dark", dark);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.textContent = dark ? "Light mode" : "Dark mode";
  }
  if (!skipSave) saveProgress();
}

function loadThemeFallback() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  const dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(dark, true);
}

function applyLang() {
  const zh = state.lang === "zh";
  document.documentElement.lang = zh ? "zh-Hant" : "en";
  document.querySelectorAll(".language-switch [data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === state.lang);
  });
  syncDescToggle();
}

function easyOf(item) {
  return state.lang === "zh" && item.easyZh ? item.easyZh : item.easy;
}

function examOf(item) {
  return state.lang === "zh" && item.examZh ? item.examZh : item.exam;
}

function modeTitle(mode) {
  return state.lang === "zh" ? mode.titleZh || mode.title : mode.title;
}

function modeBlurb(mode) {
  return state.lang === "zh" ? mode.blurbZh || mode.blurb : mode.blurb;
}

function syncDescToggle() {
  document.documentElement.classList.toggle("hide-descriptions", state.hideDescriptions);
  const btn = document.getElementById("desc-toggle");
  if (!btn) return;
  btn.setAttribute("aria-pressed", state.hideDescriptions ? "true" : "false");
  btn.textContent = state.hideDescriptions
    ? (state.lang === "zh" ? "顯示描述" : "Show description")
    : (state.lang === "zh" ? "隱藏描述" : "Hide description");
}

function clampPreviewSize(n) {
  let size = Number(n);
  if (!Number.isFinite(size)) return PREVIEW_DEFAULT;
  return Math.max(PREVIEW_MIN, Math.min(PREVIEW_MAX, Math.round(size * 10) / 10));
}

function previewSizeLabel() {
  return Math.round((state.previewSize / PREVIEW_DEFAULT) * 100) + "%";
}

function applyPreviewSize() {
  document.documentElement.style.setProperty("--specimen-zoom", String(state.previewSize));
}

function bumpPreviewSize(delta) {
  state.previewSize = clampPreviewSize(state.previewSize + delta);
  applyPreviewSize();
  saveProgress();
  const label = document.getElementById("specimen-zoom-label");
  if (label) label.textContent = previewSizeLabel();
  const smaller = document.getElementById("specimen-smaller");
  const bigger = document.getElementById("specimen-bigger");
  if (smaller) smaller.disabled = state.previewSize <= PREVIEW_MIN;
  if (bigger) bigger.disabled = state.previewSize >= PREVIEW_MAX;
}

function hasRun() {
  return state.deck.length > 0 && state.phase !== "done";
}

function resumeHint() {
  if (!state.deck.length) return "";
  if (state.phase === "done") return isCleanCleared() ? "Cleared — new mix?" : "Revised — new mix?";
  if (state.phase === "recap") return `Continue recap · ${state.recapQueue.length} left`;
  return `Continue ${modeMeta(state.mode).title} · ${state.i + 1}/${state.deck.length}`;
}

function remix(mode) {
  state.mode = mode;
  state.deck = buildDeck(mode);
  state.i = 0;
  state.pick = "";
  state.checked = false;
  state.firstTry = {};
  state.missCounts = {};
  state.missQueue = [];
  state.phase = "main";
  state.recapQueue = [];
  state.fb = null;
  state.cleared.drill = false;
  saveProgress();
}

function pickIsCorrect(q, pick) {
  const item = byId(q.id);
  if (q.type === "spot") return pick === item.id;
  return pick === item.name;
}

function pickedName(q, pick) {
  if (q.type === "spot") {
    const item = byId(pick);
    return item ? item.name : pick;
  }
  return pick;
}

function recordAnswer(q, ok) {
  const key = q.key;
  const first = !(key in state.firstTry);
  if (first) {
    state.firstTry[key] = ok;
    if (ok) state.streak += 1;
    else state.streak = 0;
  }
  if (!ok) {
    state.missCounts[key] = (state.missCounts[key] || 0) + 1;
    if (!state.missQueue.includes(key)) state.missQueue.push(key);
  } else if (state.phase === "recap") {
    state.missQueue = state.missQueue.filter((row) => row !== key);
  }
  const got = firstTryCorrect();
  if (got > state.bestFirst) state.bestFirst = got;
  if (first && ok && got >= state.deck.length && state.deck.length) {
    state.cleared.drill = true;
  }
}

function setFb(ok, q, pick) {
  const item = byId(q.id);
  const chosen = pickedName(q, pick);
  state.fb = {
    ok,
    title: ok ? "Correct — that would score the mark" : "Not this time — compare the pieces",
    body: ok ? "Read the model answer, then go on." : "Read the note, then try again.",
    item,
    chosen,
    trap: ok ? "" : trapLine(chosen, item.name),
  };
}

function markLearn(id) {
  state.learnSeen[id] = true;
  saveProgress();
}

function restoreCurrentQuestion() {
  const q = currentQ();
  if (!q) {
    state.pick = "";
    state.checked = false;
    state.fb = null;
    return;
  }
  if (state.firstTry[q.key] === true) {
    const item = byId(q.id);
    state.pick = q.type === "spot" ? item.id : item.name;
    state.checked = true;
    setFb(true, q, state.pick);
    return;
  }
  state.pick = "";
  state.checked = false;
  state.fb = null;
}

function show(id, opts) {
  const options = opts || {};
  state.view = id;
  if (id === "drill") {
    const mode = options.mode || state.mode || "name";
    const needFresh = Boolean(options.fresh) || !state.deck.length || (options.mode && options.mode !== state.mode);
    if (needFresh) remix(mode);
    else restoreCurrentQuestion();
  }
  document.querySelectorAll(".view").forEach((node) => node.classList.toggle("active", node.id === id));
  document.querySelectorAll(".nav button").forEach((btn) => {
    btn.setAttribute("aria-current", btn.dataset.view === id ? "page" : "false");
  });
  paintStreak();
  if (id === "home") renderHome();
  if (id === "learn") renderLearn();
  if (id === "drill") renderDrill();
  saveProgress();
}

function buildNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  const btn = document.createElement("button");
  btn.textContent = state.lang === "zh" ? "主頁" : "Home";
  btn.dataset.view = "home";
  btn.addEventListener("click", () => show("home"));
  nav.appendChild(btn);
}

function renderHome() {
  const root = document.getElementById("home");
  const hint = resumeHint();
  root.innerHTML = `
    <h2>${state.lang === "zh" ? "先觀察，再練習" : "Study, then drill"}</h2>
    <p class="lead">${state.lang === "zh" ? "先看實驗盤。然後說出名稱、按名稱找出圖，或配對用途。錯題會留在重溫，直到答對。只有第一次就答對的完整一輪才算過關。" : "Look at the tray first. Then name pieces, spot them from a name, or match the job. Misses stay in recap until you get them right. Only a clean first-try run is Cleared."}</p>
    <div class="grid home-grid">
      <button class="game-card" data-go="learn">
        ${learnStamp()}
        <img class="card-thumb" src="images/notes-beaker-diagram.jpg" alt="" />
        <span class="level-pill">${state.lang === "zh" ? "實驗盤" : "Tray"}</span>
        <h3>${state.lang === "zh" ? "實驗盤" : "Lab tray"}</h3>
        <p>${state.lang === "zh" ? `全部 ${APPARATUS.length} 件。相片和平面圖並排，附簡單說明和考試用語。` : `All ${APPARATUS.length} pieces. Photo and 2D diagram side by side, with the easy line and the exam wording.`}</p>
      </button>
      <button class="game-card" data-go="drill">
        ${drillStamp()}
        <img class="card-thumb" src="images/notes-conical-flask-diagram.jpg" alt="" />
        <span class="level-pill">${state.lang === "zh" ? "練習" : "Drill"}</span>
        <h3>${state.lang === "zh" ? "名稱 · 辨圖 · 用途" : "Name · Spot · Use"}</h3>
        <p>${state.lang === "zh" ? "四種模式。按 1–4。作答後圖片仍然顯示。" : "Four modes. Press 1–4. The picture stays up after you answer."}</p>
        ${hint ? `<span class="resume-tag">${hint}</span>` : ""}
        ${state.deck.length ? `<span class="fresh-link" data-fresh="1">New mix</span>` : ""}
      </button>
    </div>
    <div class="mode-row" role="group" aria-label="Drill modes">
      ${DRILL_MODES.map((mode) => `
        <button class="mode-chip${state.mode === mode.id && hasRun() ? " on" : ""}" data-mode="${mode.id}">
          <strong>${modeTitle(mode)}</strong>
          <span>${modeBlurb(mode)}</span>
        </button>
      `).join("")}
    </div>
    <p class="export-note">${state.lang === "zh" ? "這是離線網頁。雙擊 <strong>index.html</strong> 即可開啟，不用安裝。分享時請連同整個資料夾。" : "This is an offline website. Double-click <strong>index.html</strong> — no install. Keep this folder together when you share it."}</p>
  `;
  root.querySelector("[data-go=learn]").addEventListener("click", () => show("learn"));
  root.querySelector("[data-go=drill]").addEventListener("click", () => show("drill"));
  const fresh = root.querySelector("[data-fresh]");
  if (fresh) {
    fresh.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      show("drill", { fresh: true, mode: state.mode });
    });
  }
  root.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      show("drill", { fresh: true, mode: btn.dataset.mode });
    });
  });
}

function renderLearn() {
  const item = byId(state.learnId) || APPARATUS[0];
  markLearn(item.id);
  const root = document.getElementById("learn");
  const core = APPARATUS.filter((row) => row.diagram);
  const extra = APPARATUS.filter((row) => !row.diagram);
  const nameLine = displayName(item);
  root.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>${state.lang === "zh" ? "實驗盤" : "Lab tray"}</h2>
        <p class="lead">${state.lang === "zh" ? "逐件瀏覽。相片和圖一直可見。這是學習，不是測驗。" : "Browse every piece. Photo and diagram stay visible. Reveal is not required — this is study, not a test."}</p>
      </div>
      <div class="score-wrap">
        ${learnStamp()}
        <button class="btn btn-primary" data-go="drill">${state.lang === "zh" ? "開始練習" : "Start a drill"}</button>
        <button class="btn btn-ghost" data-go="home">${state.lang === "zh" ? "主頁" : "Home"}</button>
      </div>
    </div>
    <div class="learn-layout">
      <aside class="learn-options">
        <p class="caption">${state.lang === "zh" ? "筆記中的平面圖" : "In the notes as a 2D drawing"}</p>
        <div class="chips" id="learn-core"></div>
        <p class="caption">${state.lang === "zh" ? "套件中的相片" : "Photo in the kit"}</p>
        <div class="chips quiet" id="learn-extra"></div>
      </aside>
      <div class="learn-stage">
        <p class="exam-line"><strong>${nameLine}</strong></p>
        <div class="detail">
          <div>
            <p class="caption">${item.diagram ? (state.lang === "zh" ? "平面圖" : "2D diagram") : (state.lang === "zh" ? "筆記沒有平面圖" : "No 2D diagram in the notes")}</p>
            ${item.diagram
              ? `<div class="photo-frame"><img src="${drawingSrc(item.id)}" alt="2D diagram of ${item.name}" /></div>`
              : `<div class="photo-frame"><span class="tiny">This piece is a photograph only.</span></div>`}
          </div>
          <div>
            <p class="caption">${state.lang === "zh" ? "相片" : "Photograph"}</p>
            <div class="photo-frame"><img src="${photoSrc(item.id)}" alt="Photograph of ${item.name}" /></div>
          </div>
        </div>
        <div class="word-desc">
          <p class="exam-kicker">${state.lang === "zh" ? "課堂說明" : "In class"}</p>
          <p>${easyOf(item)}</p>
          <p class="exam-kicker">${state.lang === "zh" ? "參考答案" : "Model answer"}</p>
          <p class="exam-line"><strong>${displayName(item)}</strong> — ${examOf(item)}</p>
        </div>
      </div>
    </div>
  `;
  const fill = (nodeId, list) => {
    const node = document.getElementById(nodeId);
    list.forEach((row) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = displayName(row);
      btn.className = row.id === item.id ? "on" : "";
      if (state.learnSeen[row.id]) btn.classList.add("seen");
      btn.addEventListener("click", () => {
        state.learnId = row.id;
        renderLearn();
      });
      node.appendChild(btn);
    });
  };
  fill("learn-core", core);
  fill("learn-extra", extra);
  root.querySelector("[data-go=drill]").addEventListener("click", () => show("drill", { fresh: !hasRun(), mode: state.mode }));
  root.querySelector("[data-go=home]").addEventListener("click", () => show("home"));
}

function zoomBar() {
  return `<div class="specimen-zoom">
    <button type="button" class="btn btn-ghost" id="specimen-smaller" ${state.previewSize <= PREVIEW_MIN ? "disabled" : ""} aria-label="Smaller preview">−</button>
    <span class="specimen-zoom-label" id="specimen-zoom-label">${previewSizeLabel()}</span>
    <button type="button" class="btn btn-ghost" id="specimen-bigger" ${state.previewSize >= PREVIEW_MAX ? "disabled" : ""} aria-label="Bigger preview">+</button>
  </div>`;
}

function bindZoom() {
  const smaller = document.getElementById("specimen-smaller");
  const bigger = document.getElementById("specimen-bigger");
  if (smaller) smaller.addEventListener("click", () => bumpPreviewSize(-PREVIEW_STEP));
  if (bigger) bigger.addEventListener("click", () => bumpPreviewSize(PREVIEW_STEP));
}

function nextLabel(q) {
  const locked = state.checked && pickIsCorrect(q, state.pick);
  if (!locked) return "Next";
  if (state.phase === "recap") {
    const more = state.recapQueue.length > 1 || state.missQueue.length > 0;
    return more ? "Next recap" : "Finish";
  }
  const last = state.i === state.deck.length - 1;
  if (!last) return "Next";
  const n = state.missQueue.length;
  return n ? `Recap ${n} miss${n === 1 ? "" : "es"}` : "Finish";
}

function comparePair(item, chosenName) {
  const other = APPARATUS.find((row) => row.name === chosenName);
  if (!other || other.id === item.id) {
    return `<div class="photo-frame slim"><img src="${pictureSrc(item.id, "photo")}" alt="Photograph of ${item.name}" /></div>`;
  }
  return `<div class="compare">
    <figure>
      <img src="${pictureSrc(other.id, "photo")}" alt="Photograph of ${other.name}" />
      <figcaption>You chose ${displayName(other)}</figcaption>
    </figure>
    <figure>
      <img src="${pictureSrc(item.id, "photo")}" alt="Photograph of ${item.name}" />
      <figcaption>Model answer · ${displayName(item)}</figcaption>
    </figure>
  </div>`;
}

function feedbackHtml(q) {
  const fb = state.fb;
  if (!fb) return "";
  const trap = fb.trap ? `<div class="trap">${fb.trap}</div>` : "";
  const pair = fb.ok ? "" : comparePair(fb.item, fb.chosen);
  return `<div class="feedback ${fb.ok ? "ok" : "bad"}">
    <p class="fb-note">${fb.ok ? "That matches the model answer." : "A common mix-up — read the note."}</p>
    <strong>${fb.title}</strong>
    <p>${fb.body}</p>
    <p class="exam-kicker">Model answer</p>
    <p><strong>${displayName(fb.item)}</strong> — ${examOf(fb.item)}</p>
    <p class="tiny">${easyOf(fb.item)}</p>
    ${fb.ok ? "" : `<p>You chose <strong>${optionLabel(fb.chosen, false)}</strong>.</p>`}
    ${trap}
    ${pair}
  </div>`;
}

function nameChoices(q) {
  return `<div class="choices">${q.options.map((label, i) => {
    const selected = state.pick === label ? " selected" : "";
    return `<button class="choice${selected}" data-label="${label}"><span class="keycap">${i + 1}</span><span>${optionLabel(label, false)}</span></button>`;
  }).join("")}</div>`;
}

function spotChoices(q) {
  return `<div class="choices spots">${q.options.map((id, i) => {
    const item = byId(id);
    const selected = state.pick === id ? " selected" : "";
    const mark = state.checked && id === q.id ? " is-right" : (state.checked && state.pick === id ? " is-wrong" : "");
    return `<button class="choice spot${selected}${mark}" data-id="${id}">
      <span class="keycap">${i + 1}</span>
      <img src="${pictureSrc(id, q.kind)}" alt="${state.checked ? item.name : "Apparatus option " + (i + 1)}" />
      ${state.checked ? `<span>${displayName(item)}</span>` : ""}
    </button>`;
  }).join("")}</div>`;
}

function promptFor(q, item) {
  if (q.type === "name") return `${kindLabel(q.kind)} — choose the correct name.`;
  if (q.type === "spot") return `Tap the picture of <strong>${displayName(item)}</strong>.`;
  if (q.type === "use") return "Which apparatus does this job?";
}

function specimenHtml(q, item) {
  if (q.type === "spot") return "";
  const src = q.type === "use" && state.checked
    ? pictureSrc(item.id, item.diagram ? "diagram" : "photo")
    : pictureSrc(item.id, q.kind || (item.diagram ? "diagram" : "photo"));
  const kind = q.type === "use" ? (item.diagram ? "diagram" : "photo") : q.kind;
  const alt = state.checked || q.type === "use" && state.checked
    ? `${kindLabel(kind)} of ${item.name}`
    : `${kindLabel(kind)} of unnamed apparatus`;
  if (q.type === "use" && !state.checked) {
    return `<div class="use-prompt exam-line">${examOf(item)}</div>`;
  }
  return `${zoomBar()}<div class="photo-frame specimen"><img src="${src}" alt="${alt}" /></div>`;
}

function renderStationDone() {
  const root = document.getElementById("drill");
  const need = state.deck.length;
  const got = firstTryCorrect();
  const clean = got >= need && need > 0;
  const weak = Object.keys(state.missCounts)
    .map((key) => {
      const q = state.deck.find((row) => row.key === key);
      const item = q ? byId(q.id) : null;
      return item ? { name: displayName(item), n: state.missCounts[key], id: item.id } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.n - a.n);
  const weakHtml = weak.length
    ? `<ul class="weak-list">${weak.map((row) => `<li><strong>${row.name}</strong> — missed ${row.n} time${row.n === 1 ? "" : "s"}</li>`).join("")}</ul>`
    : `<p>Clean run — no misses to recap.</p>`;
  root.innerHTML = `
    <div class="done-card">
      ${clean ? `<span class="stamp cleared">Cleared</span>` : `<span class="stamp revised">Revised</span>`}
      <h2>${clean ? "Clean first-try run" : "Recap finished"}</h2>
      <p class="exam-line">First try ${got} / ${need}${clean ? " — Cleared." : ". Recap is done; this is not a clean run."}</p>
      <p class="exam-kicker">Weak pieces</p>
      ${weakHtml}
      <div class="toolbar">
        <button class="btn btn-primary" data-go-home="1">Home</button>
        <button class="btn btn-ghost" data-fresh="1">New mix</button>
      </div>
    </div>
  `;
  root.querySelector("[data-go-home]").addEventListener("click", () => show("home"));
  root.querySelector("[data-fresh]").addEventListener("click", () => show("drill", { fresh: true, mode: state.mode }));
}

function renderDrill() {
  if (!state.deck.length) remix(state.mode);
  if (state.phase === "done") {
    renderStationDone();
    return;
  }
  const q = currentQ();
  if (!q) {
    state.phase = "done";
    renderStationDone();
    return;
  }
  const item = byId(q.id);
  const locked = state.checked && pickIsCorrect(q, state.pick);
  const root = document.getElementById("drill");
  const recapN = state.phase === "recap" ? state.recapQueue.length : 0;
  const progress = state.phase === "recap"
    ? `<p class="recap-banner">Recap · ${recapN} still to get right</p>`
    : `<p class="tiny">${state.i + 1} / ${state.deck.length} · first try ${firstTryCorrect()} / ${firstTryTotal() || 0}</p>`;
  const hideNameChoices = q.type !== "spot" && locked;
  const choices = hideNameChoices ? "" : (q.type === "spot" ? spotChoices(q) : nameChoices(q));
  root.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>${modeMeta(state.mode).title}</h2>
        <p class="lead">${promptFor(q, item)}</p>
      </div>
      <div class="score-wrap">${drillStamp()}<div class="score">${firstTryCorrect()} / ${state.deck.length}</div></div>
    </div>
    <div class="mode-row compact">
      ${DRILL_MODES.map((mode) => `<button class="mode-chip${mode.id === state.mode ? " on" : ""}" data-mode="${mode.id}">${modeTitle(mode)}</button>`).join("")}
    </div>
    ${progress}
    <div class="drill-stage${q.type === "spot" ? " is-spot" : ""}">
      ${q.type === "spot" ? "" : `<div class="specimen-col">${specimenHtml(q, item)}</div>`}
      <div class="fb-col">
        ${state.checked ? feedbackHtml(q) : `<p class="tiny keys">Press ${[1, 2, 3, 4].slice(0, q.options.length).map((k) => `<span class="keycap">${k}</span>`).join(" ")} to choose</p>`}
        ${choices}
        <div class="toolbar drill-actions">
          <div>
            ${state.checked && !locked ? `<button class="btn btn-primary" id="drill-again">Try again</button>` : ""}
            <button class="btn btn-ghost" id="drill-back" ${state.phase === "recap" || state.i === 0 ? "disabled" : ""}>Back</button>
            <button class="btn btn-primary" id="drill-next" ${!locked ? "disabled" : ""}>${nextLabel(q)}</button>
          </div>
          <button class="btn btn-ghost" id="drill-reset">New mix</button>
        </div>
      </div>
    </div>
  `;
  bindZoom();
  root.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.mode === state.mode) return;
      show("drill", { fresh: true, mode: btn.dataset.mode });
    });
  });
  root.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (locked) return;
      const pick = btn.dataset.id || btn.dataset.label;
      const ok = pickIsCorrect(q, pick);
      state.pick = pick;
      recordAnswer(q, ok);
      setFb(ok, q, pick);
      state.checked = true;
      if (ok && state.cleared.drill && firstTryCorrect() >= state.deck.length && state.phase === "main") {
        burstConfetti();
      }
      paintStreak();
      saveProgress();
      renderDrill();
    });
  });
  const again = document.getElementById("drill-again");
  if (again) {
    again.addEventListener("click", () => {
      state.pick = "";
      state.checked = false;
      state.fb = null;
      renderDrill();
    });
  }
  document.getElementById("drill-back").addEventListener("click", () => {
    if (state.phase === "recap" || state.i === 0) return;
    state.i -= 1;
    const prev = state.deck[state.i];
    state.pick = "";
    state.checked = Boolean(state.firstTry[prev.key]);
    if (state.checked) {
      const prevItem = byId(prev.id);
      state.pick = prev.type === "spot" ? prevItem.id : prevItem.name;
      setFb(state.firstTry[prev.key], prev, state.pick);
    } else {
      state.fb = null;
    }
    saveProgress();
    renderDrill();
  });
  document.getElementById("drill-next").addEventListener("click", () => goNext());
  document.getElementById("drill-reset").addEventListener("click", () => show("drill", { fresh: true, mode: state.mode }));
}

function startRecap() {
  const keys = state.missQueue.slice();
  if (!keys.length) {
    state.phase = "done";
    return;
  }
  state.recapQueue = shuffle(state.deck.filter((q) => keys.includes(q.key)).map(cloneQuestion));
  state.phase = "recap";
  state.pick = "";
  state.checked = false;
  state.fb = null;
}

function goNext() {
  const q = currentQ();
  if (!q) return;
  const locked = state.checked && pickIsCorrect(q, state.pick);
  if (!locked) return;
  if (state.phase === "recap") {
    state.recapQueue.shift();
    if (state.recapQueue.length === 0) {
      if (state.missQueue.length) startRecap();
      else state.phase = "done";
    }
    state.pick = "";
    state.checked = false;
    state.fb = null;
    saveProgress();
    renderDrill();
    return;
  }
  if (state.i < state.deck.length - 1) {
    state.i += 1;
    const nxt = state.deck[state.i];
    state.pick = "";
    state.fb = null;
    state.checked = Boolean(state.firstTry[nxt.key] === true);
    if (state.checked) {
      const nxtItem = byId(nxt.id);
      state.pick = nxt.type === "spot" ? nxtItem.id : nxtItem.name;
      setFb(true, nxt, state.pick);
    }
  } else {
    startRecap();
  }
  saveProgress();
  renderDrill();
}

function paintAll() {
  applyLang();
  applyPreviewSize();
  paintStreak();
  buildNav();
  show("home");
}

loadProgress();
loadThemeFallback();
applyPreviewSize();
paintAll();

document.getElementById("theme-toggle").addEventListener("click", () => {
  applyTheme(!document.documentElement.classList.contains("dark"));
});

document.querySelectorAll(".language-switch [data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.lang = btn.dataset.lang === "zh" ? "zh" : "en";
    applyLang();
    saveProgress();
    if (state.view === "home") renderHome();
    if (state.view === "learn") renderLearn();
    if (state.view === "drill") renderDrill();
  });
});
const descToggle = document.getElementById("desc-toggle");
if (descToggle) {
  descToggle.addEventListener("click", () => {
    state.hideDescriptions = !state.hideDescriptions;
    syncDescToggle();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.target && /^(INPUT|TEXTAREA)$/.test(event.target.tagName)) return;
  if (event.key === "Escape") {
    event.preventDefault();
    show("home");
    return;
  }
  if (event.key === "Enter") {
    const next = document.getElementById("drill-next");
    if (next && !next.disabled) {
      event.preventDefault();
      next.click();
    }
    return;
  }
  const n = Number(event.key);
  if (n < 1 || n > 4) return;
  const active = document.querySelector(".view.active");
  if (!active) return;
  const choices = active.querySelectorAll(".choice");
  if (!choices.length || !choices[n - 1]) return;
  event.preventDefault();
  choices[n - 1].click();
});
