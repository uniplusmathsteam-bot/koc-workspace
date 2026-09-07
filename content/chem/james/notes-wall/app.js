const ZOOM_DEFAULT = 1;
const ZOOM_MIN = 1;
const ZOOM_STEP = 0.25;
const ZOOM_MAX = 2.5;

const state = {
  view: "wall",
  lang: "en",
  tab: "all",
  seen: {},
  cleared: false,
  cover: false,
  lbId: "",
  lbZoom: ZOOM_DEFAULT,
  lbPiece: "",
  lbRevealed: true,
  fromCheck: false,
  gate: "",
  deck: [],
  i: 0,
  pick: "",
  checked: false,
  firstTry: {},
  missCounts: {},
  missQueue: [],
  phase: "main",
  recapQueue: [],
  fb: null,
};

function t(key, vars) {
  const pack = COPY[state.lang] || COPY.en;
  let text = pack[key] || COPY.en[key] || key;
  const n = vars && vars.n;
  text = text.replace("{es}", n === 1 ? "" : "es");
  text = text.replace("{s}", n === 1 ? "" : "s");
  if (vars) {
    Object.keys(vars).forEach((name) => {
      text = text.replace(new RegExp("\\{" + name + "\\}", "g"), String(vars[name]));
    });
  }
  return text;
}

function langText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[state.lang] || value.en || "";
}

function langList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(langText);
  if (value.en || value.zh) return value[state.lang] || value.en || [];
  return [];
}

function displayTitle(item) {
  if (!item) return "";
  return state.lang === "zh" ? `${item.zh} · ${item.title}` : item.title;
}

function displayPiece(piece) {
  if (!piece) return "";
  return state.lang === "zh" ? `${piece.zh} · ${piece.title}` : piece.title;
}

function itemsForTab(tab) {
  const id = tab || state.tab;
  if (id === "all") return WALL_ITEMS;
  return WALL_ITEMS.filter((row) => row.tag === id);
}

function seenCount() {
  return WALL_ITEMS.filter((row) => state.seen[row.id]).length;
}

function checkInProgress() {
  return Boolean(state.deck.length && state.phase !== "done" && (state.i > 0 || Object.keys(state.firstTry).length > 0));
}

function wallStamp() {
  const need = WALL_ITEMS.length;
  const got = seenCount();
  if (state.cleared) return `<span class="stamp cleared">${t("allOpened")}</span>`;
  if (got > 0) return `<span class="stamp progress">${got}/${need} ${t("opened")}</span>`;
  return `<span class="stamp todo">0/${need}</span>`;
}

function firstTryCorrect() {
  return Object.values(state.firstTry).filter((ok) => ok === true).length;
}

function checkStamp() {
  if (!state.deck.length) return "";
  if (state.phase === "done" && firstTryCorrect() >= state.deck.length) return `<span class="stamp cleared">${t("cleanRun")}</span>`;
  if (state.phase === "done") return `<span class="stamp revised">${t("revised")}</span>`;
  if (firstTryCorrect() || Object.keys(state.firstTry).length) {
    return `<span class="stamp progress">${firstTryCorrect()}/${state.deck.length} ${t("firstTry")}</span>`;
  }
  return "";
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lang: state.lang,
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
      tab: state.tab,
      seen: state.seen,
      cleared: state.cleared,
      cover: state.cover,
      deck: state.deck,
      i: state.i,
      firstTry: state.firstTry,
      missCounts: state.missCounts,
      missQueue: state.missQueue,
      phase: state.phase,
      recapQueue: state.recapQueue,
    }));
  } catch (err) { /* file:// may block */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.lang = data.lang === "zh" ? "zh" : "en";
    state.tab = data.tab || "all";
    state.seen = data.seen || {};
    state.cleared = Boolean(data.cleared);
    state.cover = Boolean(data.cover);
    state.deck = Array.isArray(data.deck) ? data.deck : [];
    state.i = data.i || 0;
    state.firstTry = data.firstTry || {};
    state.missCounts = data.missCounts || {};
    state.missQueue = data.missQueue || [];
    state.phase = data.phase || "main";
    state.recapQueue = Array.isArray(data.recapQueue) ? data.recapQueue : [];
    if (data.theme === "dark" || data.theme === "light") applyTheme(data.theme === "dark", true);
  } catch (err) { /* ignore */ }
}

function applyTheme(dark, skipSave) {
  document.documentElement.classList.toggle("dark", dark);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.textContent = dark ? t("lightMode") : t("darkMode");
  }
  if (!skipSave) saveProgress();
}

function loadThemeFallback() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  applyTheme(Boolean(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches), true);
}

function paintChrome() {
  document.getElementById("header-kicker").textContent = t("headerKicker");
  document.getElementById("header-title").textContent = t("headerTitle");
  document.getElementById("header-lead").textContent = t("headerLead");
  document.getElementById("lb-close").textContent = t("close");
  document.getElementById("lb-close").setAttribute("aria-label", t("close"));
  const zh = state.lang === "zh";
  document.documentElement.lang = zh ? "zh-Hant" : "en";
  const langBtn = document.getElementById("lang-toggle");
  if (langBtn) {
    langBtn.setAttribute("aria-pressed", zh ? "true" : "false");
    langBtn.textContent = zh ? "EN" : "中";
  }
  applyTheme(document.documentElement.classList.contains("dark"), true);
  buildNav();
  fillPrintCrib();
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
  const pieces = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 80,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    vx: -3 + Math.random() * 6,
    vy: 3 + Math.random() * 5,
    rot: Math.random() * 360,
    vr: -8 + Math.random() * 16,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  let ticked = 0;
  const tick = () => {
    ticked += 1;
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
    if (ticked < 50) confettiFrame = requestAnimationFrame(tick);
    else {
      confettiFrame = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.remove("show");
    }
  };
  confettiFrame = requestAnimationFrame(tick);
}

function markSeen(id) {
  const was = state.cleared;
  state.seen[id] = true;
  if (seenCount() >= WALL_ITEMS.length && !state.cleared) {
    state.cleared = true;
    if (!was) burstConfetti();
  }
  saveProgress();
}

function show(id, opts) {
  const options = opts || {};
  state.view = id;
  if (id === "check") {
    if (options.fresh || !state.deck.length) remixCheck();
    if (options.force) state.gate = "";
    else if (seenCount() === 0 && !checkInProgress()) state.gate = "empty";
    else state.gate = "";
  }
  document.querySelectorAll(".view").forEach((node) => node.classList.toggle("active", node.id === id));
  document.querySelectorAll(".nav button").forEach((btn) => {
    btn.setAttribute("aria-current", btn.dataset.view === id ? "page" : "false");
  });
  if (id === "wall") renderWall();
  if (id === "check") renderCheck();
  saveProgress();
}

function buildNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  [
    { id: "wall", label: t("wall") },
    { id: "check", label: t("check") },
  ].forEach((view) => {
    const btn = document.createElement("button");
    btn.textContent = view.label;
    btn.dataset.view = view.id;
    btn.addEventListener("click", () => show(view.id, view.id === "check" ? {} : undefined));
    nav.appendChild(btn);
  });
}

function fillPrintCrib() {
  const root = document.getElementById("print-crib");
  if (!root) return;
  const setups = WALL_ITEMS.filter((row) => row.tag === "setup");
  root.innerHTML = `
    <h1>${t("printTitle")}</h1>
    <h2>${t("printPieces")}</h2>
    <table>
      ${PIECES.map((piece) => `<tr><th>${displayPiece(piece)}</th><td>${langText(piece.job)}</td></tr>`).join("")}
    </table>
    <h2>${t("printSetups")}</h2>
    <table>
      ${setups.map((item) => `<tr><th>${displayTitle(item)}</th><td>${langText(item.exam)}</td></tr>`).join("")}
    </table>
  `;
}

function renderWall() {
  const root = document.getElementById("wall");
  const list = itemsForTab(state.tab);
  const tabs = WALL_TABS.map((row) => {
    const n = itemsForTab(row.id).filter((item) => state.seen[item.id]).length;
    const need = itemsForTab(row.id).length;
    return `<button type="button" class="wall-tab${row.id === state.tab ? " on" : ""}" data-tab="${row.id}">${langText(row.label)}<span class="tab-count">${n}/${need}</span></button>`;
  }).join("");
  const resume = checkInProgress()
    ? `<button class="btn btn-ghost" data-resume="1">${t("resume")}</button>`
    : "";
  root.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>${t("notesWall")}</h2>
        <p class="path-line">${t("path")}</p>
        <p class="lead">${t("wallLead")}</p>
      </div>
      <div class="score-wrap">
        ${wallStamp()}
        ${resume}
        <button class="btn btn-ghost${state.cover ? " is-on" : ""}" data-cover="1" aria-pressed="${state.cover ? "true" : "false"}">${t("coverNames")}</button>
        <button class="btn btn-ghost" data-print="1">${t("printCrib")}</button>
        <button class="btn btn-primary" data-go="check">${t("check")}</button>
      </div>
    </div>
    ${checkInProgress() ? `<p class="tiny resume-hint">${t("resumeHint")}</p>` : ""}
    <div class="wall-tabs">${tabs}</div>
    <div class="wall-grid">
      ${list.map((item) => `
        <button type="button" class="wall-card${state.seen[item.id] ? " is-seen" : ""}${state.cover ? " is-cover" : ""}" data-id="${item.id}">
          ${state.seen[item.id] ? `<span class="stamp progress">${t("opened")}</span>` : `<span class="stamp todo">${t("open")}</span>`}
          <img src="${item.src}" alt="${state.cover ? t("tapToName") : item.title}" />
          <h3>${state.cover ? t("tapToName") : displayTitle(item)}</h3>
          <p>${state.cover ? "" : langText(item.exam)}</p>
        </button>
      `).join("")}
    </div>
    <p class="export-note">${t("exportNote")}</p>
  `;
  root.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.tab = btn.dataset.tab;
      saveProgress();
      renderWall();
    });
  });
  root.querySelectorAll("[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(btn.dataset.id));
  });
  root.querySelector("[data-go=check]").addEventListener("click", () => show("check"));
  const resumeBtn = root.querySelector("[data-resume]");
  if (resumeBtn) resumeBtn.addEventListener("click", () => show("check"));
  root.querySelector("[data-cover]").addEventListener("click", () => {
    state.cover = !state.cover;
    if (state.lbId) state.lbRevealed = !state.cover;
    saveProgress();
    renderWall();
    if (state.lbId) paintLightbox();
  });
  root.querySelector("[data-print]").addEventListener("click", () => {
    fillPrintCrib();
    window.print();
  });
}

function openLightbox(id, opts) {
  const options = opts || {};
  const item = byId(id);
  if (!item) return;
  state.lbId = id;
  state.lbZoom = ZOOM_DEFAULT;
  state.lbPiece = options.piece || "";
  state.lbRevealed = !state.cover || Boolean(options.fromCheck);
  if (options.fromCheck) state.fromCheck = true;
  markSeen(id);
  paintLightbox();
  const box = document.getElementById("lightbox");
  box.hidden = false;
  box.classList.add("show");
  if (state.view === "wall") renderWall();
}

function closeLightbox() {
  const box = document.getElementById("lightbox");
  box.hidden = true;
  box.classList.remove("show");
  state.lbId = "";
  state.lbPiece = "";
  const back = state.fromCheck;
  state.fromCheck = false;
  if (back) renderCheck();
}

function stepLightbox(dir) {
  const list = itemsForTab(state.tab);
  const i = list.findIndex((row) => row.id === state.lbId);
  if (i < 0) return;
  const next = list[(i + dir + list.length) % list.length];
  openLightbox(next.id, { fromCheck: state.fromCheck });
}

function paintLightbox() {
  const item = byId(state.lbId);
  if (!item) return;
  const img = document.getElementById("lb-img");
  const crop = document.getElementById("lb-crop");
  const zoomInner = document.getElementById("lb-zoom-inner");
  const piece = state.lbPiece ? byPiece(state.lbPiece) : null;
  const usePiece = piece && piece.parent === item.id;
  img.src = item.src;
  img.alt = state.lbRevealed ? item.title : t("notesPage");
  if (usePiece) {
    crop.classList.add("is-piece");
    crop.style.setProperty("--cols", String(piece.cols));
    crop.style.setProperty("--col", String(piece.col));
  } else {
    crop.classList.remove("is-piece");
    crop.style.removeProperty("--cols");
    crop.style.removeProperty("--col");
  }
  zoomInner.style.transform = `scale(${state.lbZoom})`;
  document.getElementById("lb-zoom-label").textContent = Math.round(state.lbZoom * 100) + "%";
  document.getElementById("lb-smaller").disabled = state.lbZoom <= ZOOM_MIN;
  document.getElementById("lb-bigger").disabled = state.lbZoom >= ZOOM_MAX;

  const pieces = piecesFor(item.id);
  const revealed = state.lbRevealed;
  const tab = WALL_TABS.find((row) => row.id === item.tag);
  const steps = langList(item.steps);
  const terms = item.terms || [];
  const same = item.sameAs ? byId(item.sameAs) : null;
  const pieceChips = pieces.length ? `
    <p class="exam-kicker">${t("pieces")}</p>
    <div class="piece-chips">
      <button type="button" class="piece-chip${!usePiece ? " on" : ""}" data-piece="">${t("showFullPage")}</button>
      ${pieces.map((row, idx) => `
        <button type="button" class="piece-chip${usePiece && row.id === piece.id ? " on" : ""}" data-piece="${row.id}">
          ${revealed ? displayPiece(row) : idx + 1}
        </button>
      `).join("")}
    </div>
  ` : "";

  let body = "";
  if (!revealed) {
    body = `
      <p class="exam-kicker">${tab ? langText(tab.label) : ""}</p>
      <p class="exam-line"><strong>${t("tapToName")}</strong></p>
      <button type="button" class="btn btn-primary" id="lb-reveal">${t("reveal")}</button>
      ${pieceChips}
    `;
  } else {
    const jobBlock = usePiece ? `
      <p class="exam-kicker">${t("job")}</p>
      <p>${langText(piece.job)}</p>
      ${piece.trap ? `<p class="exam-kicker">${t("trap")}</p><p class="trap-line">${langText(piece.trap)}</p>` : ""}
    ` : `
      <p>${langText(item.exam)}</p>
      ${item.trap ? `<p class="exam-kicker">${t("trap")}</p><p class="trap-line">${langText(item.trap)}</p>` : ""}
    `;
    body = `
      <p class="exam-kicker">${tab ? langText(tab.label) : ""}</p>
      <p class="exam-line"><strong>${usePiece ? displayPiece(piece) : displayTitle(item)}</strong></p>
      ${jobBlock}
      ${item.scanNote ? `<p class="exam-kicker">${t("scanNote")}</p><p class="scan-note">${langText(item.scanNote)}</p>` : ""}
      ${item.safety ? `<div class="safety-banner"><strong>${t("safety")}</strong><p>${langText(item.safety)}</p></div>` : ""}
      ${steps.length ? `<p class="exam-kicker">${t("steps")}</p><ol class="steps">${steps.map((line) => `<li>${line}</li>`).join("")}</ol>` : ""}
      ${terms.length ? `<p class="exam-kicker">${t("glossary")}</p><dl class="glossary">${terms.map((row) => `<dt>${langText(row.word)}</dt><dd>${langText(row.def)}</dd>`).join("")}</dl>` : ""}
      ${same ? `<p class="exam-kicker">${t("sameAs")}</p><button type="button" class="btn btn-ghost" id="lb-same">${displayTitle(same)} — ${t("sameAs")}</button>` : ""}
      ${pieceChips}
    `;
  }

  const copy = document.getElementById("lb-copy");
  copy.innerHTML = body;
  copy.querySelectorAll("[data-piece]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      state.lbPiece = btn.dataset.piece || "";
      paintLightbox();
    });
  });
  const reveal = document.getElementById("lb-reveal");
  if (reveal) {
    reveal.addEventListener("click", (event) => {
      event.stopPropagation();
      state.lbRevealed = true;
      paintLightbox();
    });
  }
  const sameBtn = document.getElementById("lb-same");
  if (sameBtn) {
    sameBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openLightbox(item.sameAs, { fromCheck: state.fromCheck });
    });
  }
}

function bumpZoom(delta) {
  state.lbZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round((state.lbZoom + delta) * 100) / 100));
  paintLightbox();
}

function currentQ() {
  if (state.phase === "recap") return state.recapQueue[0] || null;
  return state.deck[state.i] || null;
}

function remixCheck() {
  state.deck = buildCheckDeck();
  state.i = 0;
  state.pick = "";
  state.checked = false;
  state.firstTry = {};
  state.missCounts = {};
  state.missQueue = [];
  state.phase = "main";
  state.recapQueue = [];
  state.fb = null;
  state.gate = "";
}

function pickIsCorrect(q, pick) {
  return String(pick) === String(q.answer);
}

function recordAnswer(q, ok) {
  const first = !(q.key in state.firstTry);
  if (first) state.firstTry[q.key] = ok;
  if (!ok) {
    state.missCounts[q.key] = (state.missCounts[q.key] || 0) + 1;
    if (!state.missQueue.includes(q.key)) state.missQueue.push(q.key);
  } else if (state.phase === "recap") {
    state.missQueue = state.missQueue.filter((key) => key !== q.key);
  }
}

function setFb(ok, q, pick) {
  state.fb = { ok, pick };
}

function chosenLabel(q, pick) {
  if (q.type === "order") {
    return String(pick).split(",").filter(Boolean).map((opt) => optionLabel(q, opt)).join(" → ");
  }
  return optionLabel(q, pick);
}

function optionLabel(q, opt) {
  if (q.labels && q.labels[opt]) return langText(q.labels[opt]);
  const item = byId(opt);
  if (item) return displayTitle(item);
  const piece = byPiece(opt);
  if (piece) return displayPiece(piece);
  return String(opt);
}

function nextLabel(q) {
  const locked = state.checked && pickIsCorrect(q, state.pick);
  if (!locked) return t("next");
  if (state.phase === "recap") {
    const more = state.recapQueue.length > 1 || state.missQueue.length > 0;
    return more ? t("nextRecap") : t("finish");
  }
  const last = state.i === state.deck.length - 1;
  if (!last) return t("next");
  const n = state.missQueue.length;
  return n ? t("recapMisses", { n }) : t("finish");
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
  if (!q || !(state.checked && pickIsCorrect(q, state.pick))) return;
  if (state.phase === "recap") {
    state.recapQueue.shift();
    if (!state.recapQueue.length) {
      if (state.missQueue.length) startRecap();
      else state.phase = "done";
    }
    state.pick = "";
    state.checked = false;
    state.fb = null;
    saveProgress();
    renderCheck();
    return;
  }
  if (state.i < state.deck.length - 1) {
    state.i += 1;
    state.pick = "";
    state.checked = false;
    state.fb = null;
  } else {
    startRecap();
  }
  saveProgress();
  renderCheck();
}

function bindOpenPage(root) {
  root.querySelectorAll("[data-open-page]").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(btn.dataset.openPage, { fromCheck: true }));
  });
}

function renderEmptyWarn() {
  const root = document.getElementById("check");
  root.innerHTML = `
    <div class="done-card">
      <h2>${t("emptyWarnTitle")}</h2>
      <p class="exam-line">${t("emptyWarnBody")}</p>
      <div class="toolbar">
        <button class="btn btn-primary" data-force="1">${t("startAnyway")}</button>
        <button class="btn btn-ghost" data-go="wall">${t("backWall")}</button>
      </div>
    </div>
  `;
  root.querySelector("[data-force]").addEventListener("click", () => show("check", { force: true }));
  root.querySelector("[data-go=wall]").addEventListener("click", () => show("wall"));
}

function renderCheckDone() {
  const root = document.getElementById("check");
  const need = state.deck.length;
  const got = firstTryCorrect();
  const clean = got >= need && need > 0;
  const weak = Object.keys(state.missCounts).map((key) => {
    const q = state.deck.find((row) => row.key === key);
    const item = q ? byId(q.id) : null;
    return item ? { id: item.id, name: displayTitle(item), n: state.missCounts[key] } : null;
  }).filter(Boolean).sort((a, b) => b.n - a.n);
  root.innerHTML = `
    <div class="done-card">
      ${clean ? `<span class="stamp cleared">${t("cleanRun")}</span>` : `<span class="stamp revised">${t("revised")}</span>`}
      <h2>${clean ? t("cleanRunTitle") : t("recapFinished")}</h2>
      <p class="exam-line">${t("firstTry")} ${got} / ${need}${clean ? " — " + t("cleanRun") + "." : ". " + t("recapFinished") + "."}</p>
      <p class="exam-kicker">${t("weakPages")}</p>
      ${weak.length ? `<ul class="weak-list">${weak.map((row) => `<li><button type="button" class="weak-link" data-open-page="${row.id}"><strong>${row.name}</strong> — ${t("missedTimes", { n: row.n })}</button></li>`).join("")}</ul>` : `<p>${t("noMisses")}</p>`}
      <div class="toolbar">
        <button class="btn btn-primary" data-go="wall">${t("backWall")}</button>
        <button class="btn btn-ghost" data-fresh="1">${t("newMix")}</button>
      </div>
    </div>
  `;
  root.querySelector("[data-go=wall]").addEventListener("click", () => show("wall"));
  root.querySelector("[data-fresh]").addEventListener("click", () => show("check", { fresh: true }));
  bindOpenPage(root);
}

function orderSeq() {
  return String(state.pick || "").split(",").filter(Boolean);
}

function handleChoice(q, opt) {
  const locked = state.checked && pickIsCorrect(q, state.pick);
  if (locked) return;
  if (q.type === "order") {
    if (state.checked) return;
    const seq = orderSeq();
    if (seq.includes(String(opt))) return;
    seq.push(String(opt));
    state.pick = seq.join(",");
    if (seq.length < q.options.length) {
      saveProgress();
      renderCheck();
      return;
    }
  } else {
    state.pick = String(opt);
  }
  const ok = pickIsCorrect(q, state.pick);
  recordAnswer(q, ok);
  setFb(ok, q, state.pick);
  state.checked = true;
  saveProgress();
  renderCheck();
}

function renderCheck() {
  if (state.gate === "empty") {
    renderEmptyWarn();
    return;
  }
  if (!state.deck.length) remixCheck();
  if (state.phase === "done") {
    renderCheckDone();
    return;
  }
  const q = currentQ();
  if (!q) {
    state.phase = "done";
    renderCheckDone();
    return;
  }
  const item = byId(q.id);
  const locked = state.checked && pickIsCorrect(q, state.pick);
  const root = document.getElementById("check");
  const seq = orderSeq();
  const progress = state.phase === "recap"
    ? `<p class="recap-banner">${t("recapBanner", { n: state.recapQueue.length })}</p>`
    : `<p class="tiny">${state.i + 1} / ${state.deck.length} · ${t("firstTry")} ${firstTryCorrect()} / ${Object.keys(state.firstTry).length}</p>`;
  const showPhoto = q.showSrc && q.type !== "spot";
  const choices = q.options.map((opt, i) => {
    const selected = q.type === "order" ? seq.includes(String(opt)) : String(state.pick) === String(opt);
    const right = state.checked && String(opt) === String(q.answer) && q.type !== "order";
    const orderRight = state.checked && q.type === "order" && pickIsCorrect(q, state.pick);
    const wrong = state.checked && selected && !pickIsCorrect(q, state.pick) && (q.type === "order" || String(opt) !== String(q.answer));
    const mark = (right || orderRight) ? " is-right" : (wrong ? " is-wrong" : "");
    const sel = selected ? " selected" : "";
    const orderNum = q.type === "order" && selected ? `<span class="order-num">${seq.indexOf(String(opt)) + 1}</span>` : "";
    if (q.type === "spot") {
      const choice = byId(opt);
      return `<button class="choice spot${sel}${mark}" data-opt="${opt}">
        <span class="keycap">${i + 1}</span>
        <img src="${choice.src}" alt="${state.checked ? choice.title : t("optionPage", { n: i + 1 })}" />
        ${state.checked ? `<span>${displayTitle(choice)}</span>` : ""}
      </button>`;
    }
    return `<button class="choice${sel}${mark}" data-opt="${opt}"><span class="keycap">${i + 1}</span>${orderNum}<span>${optionLabel(q, opt)}</span></button>`;
  }).join("");
  const keysHint = `<p class="tiny keys">${q.type === "order" ? t("orderHint") : t("pressKeys", { keys: [1, 2, 3, 4].slice(0, q.options.length).map((k) => `<span class="keycap">${k}</span>`).join(" ") })}</p>`;
  const explain = q.explain ? langText(q.explain) : langText(item && item.exam);
  const fb = state.fb ? `<div class="feedback ${state.fb.ok ? "ok" : "bad"}">
    <strong>${state.fb.ok ? t("correct") : t("incorrect")}</strong>
    <p class="exam-kicker">${t("modelAnswer")}</p>
    <p><strong>${displayTitle(item)}</strong> — ${explain}</p>
    ${state.fb.ok ? "" : `<p>${t("youChose")} <strong>${chosenLabel(q, state.pick)}</strong>.</p>`}
    ${state.fb.ok ? "" : `<button type="button" class="btn btn-ghost" data-open-page="${item.id}">${t("openThisPage")}</button>`}
  </div>` : keysHint;
  root.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>${t("check")}</h2>
        <p class="lead">${langText(q.prompt)}</p>
      </div>
      <div class="score-wrap">${checkStamp()}<div class="score">${firstTryCorrect()} / ${state.deck.length}</div></div>
    </div>
    ${progress}
    <div class="drill-stage${showPhoto ? "" : " is-spot"}">
      ${showPhoto ? `<div class="photo-frame specimen"><img src="${item.src}" alt="${state.checked ? item.title : t("notesPage")}" /></div>` : ""}
      <div class="fb-col">
        ${fb}
        <div class="choices${q.type === "spot" ? " spots" : ""}">${choices}</div>
        <div class="toolbar drill-actions">
          <div>
            ${state.checked && !locked ? `<button class="btn btn-primary" id="check-again">${t("tryAgain")}</button>` : ""}
            <button class="btn btn-primary" id="check-next" ${!locked ? "disabled" : ""}>${nextLabel(q)}</button>
          </div>
          <button class="btn btn-ghost" id="check-reset">${t("newMix")}</button>
        </div>
      </div>
    </div>
  `;
  root.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => handleChoice(q, btn.dataset.opt));
  });
  const again = document.getElementById("check-again");
  if (again) {
    again.addEventListener("click", () => {
      state.pick = "";
      state.checked = false;
      state.fb = null;
      renderCheck();
    });
  }
  document.getElementById("check-next").addEventListener("click", () => goNext());
  document.getElementById("check-reset").addEventListener("click", () => show("check", { fresh: true }));
  bindOpenPage(root);
}

function bindLightbox() {
  document.getElementById("lb-close").addEventListener("click", () => closeLightbox());
  document.getElementById("lightbox").addEventListener("click", (event) => {
    if (event.target.id === "lightbox") closeLightbox();
  });
  document.getElementById("lb-prev").addEventListener("click", (event) => {
    event.stopPropagation();
    stepLightbox(-1);
  });
  document.getElementById("lb-next").addEventListener("click", (event) => {
    event.stopPropagation();
    stepLightbox(1);
  });
  document.getElementById("lb-smaller").addEventListener("click", (event) => {
    event.stopPropagation();
    bumpZoom(-ZOOM_STEP);
  });
  document.getElementById("lb-bigger").addEventListener("click", (event) => {
    event.stopPropagation();
    bumpZoom(ZOOM_STEP);
  });
}

loadProgress();
loadThemeFallback();
paintChrome();
bindLightbox();
show("wall");

document.getElementById("theme-toggle").addEventListener("click", () => {
  applyTheme(!document.documentElement.classList.contains("dark"));
});
document.getElementById("lang-toggle").addEventListener("click", () => {
  state.lang = state.lang === "zh" ? "en" : "zh";
  paintChrome();
  saveProgress();
  if (state.view === "wall") renderWall();
  if (state.view === "check") renderCheck();
  if (state.lbId) paintLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.target && /^(INPUT|TEXTAREA)$/.test(event.target.tagName)) return;
  if (event.key === "Escape") {
    event.preventDefault();
    if (state.lbId) closeLightbox();
    else show("wall");
    return;
  }
  if (state.lbId && (event.key === "+" || event.key === "=")) {
    event.preventDefault();
    bumpZoom(ZOOM_STEP);
    return;
  }
  if (state.lbId && (event.key === "-" || event.key === "_")) {
    event.preventDefault();
    bumpZoom(-ZOOM_STEP);
    return;
  }
  if (state.lbId && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    event.preventDefault();
    stepLightbox(event.key === "ArrowLeft" ? -1 : 1);
    return;
  }
  if (event.key === "Enter") {
    const next = document.getElementById("check-next");
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
