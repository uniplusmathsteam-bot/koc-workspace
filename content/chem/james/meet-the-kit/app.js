const ZOOM_DEFAULT = 1;
const ZOOM_MIN = 1;
const ZOOM_STEP = 0.25;
const ZOOM_MAX = 2.5;

const state = {
  view: "learn",
  lang: "en",
  learnId: "beaker",
  revealed: false,
  seen: {},
  cleared: false,
  zoom: ZOOM_DEFAULT,
  core: [],
  extra: [],
  hideDescriptions: false,
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

function kitOrder() {
  return state.core.concat(state.extra);
}

function displayName(item) {
  if (!item) return "";
  return state.lang === "zh" ? `${item.zh} · ${item.name}` : item.name;
}

function chipLabel(item, indexInGroup, extra) {
  if (item.letter) return item.letter;
  return extra ? "E" + (indexInGroup + 1) : String(indexInGroup + 1);
}

function seenCount() {
  return APPARATUS.filter((row) => state.seen[row.id]).length;
}

function trayStamp() {
  const need = APPARATUS.length;
  const got = seenCount();
  if (state.cleared) return `<span class="stamp cleared">Cleared</span>`;
  if (got > 0) return `<span class="stamp progress">${got}/${need} opened</span>`;
  return `<span class="stamp todo">0/${need}</span>`;
}

function firstTryCorrect() {
  return Object.values(state.firstTry).filter((ok) => ok === true).length;
}

function checkStamp() {
  if (!state.deck.length) return "";
  if (state.phase === "done" && firstTryCorrect() >= state.deck.length) return `<span class="stamp cleared">Cleared</span>`;
  if (state.phase === "done") return `<span class="stamp revised">Revised</span>`;
  if (Object.keys(state.firstTry).length) {
    return `<span class="stamp progress">${firstTryCorrect()}/${state.deck.length} first try</span>`;
  }
  return "";
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lang: state.lang,
      theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
      learnId: state.learnId,
      revealed: state.revealed,
      seen: state.seen,
      cleared: state.cleared,
      zoom: state.zoom,
      core: state.core.map((row) => row.id),
      extra: state.extra.map((row) => row.id),
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

function remixTray() {
  const core = APPARATUS.filter((row) => row.letter);
  const extra = APPARATUS.filter((row) => !row.letter);
  state.core = shuffle(core);
  state.extra = shuffle(extra);
  state.learnId = (state.core[0] || extra[0]).id;
  state.revealed = false;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.lang = data.lang === "zh" ? "zh" : "en";
    state.learnId = data.learnId || "beaker";
    state.revealed = Boolean(data.revealed);
    state.seen = data.seen || {};
    state.cleared = Boolean(data.cleared);
    state.zoom = Number(data.zoom) || ZOOM_DEFAULT;
    if (Array.isArray(data.core) && data.core.length) {
      state.core = data.core.map(byId).filter(Boolean);
      state.extra = (data.extra || []).map(byId).filter(Boolean);
    }
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
    btn.textContent = dark ? "Light mode" : "Dark mode";
  }
  if (!skipSave) saveProgress();
}

function loadThemeFallback() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  applyTheme(Boolean(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches), true);
}

function applyLang() {
  const zh = state.lang === "zh";
  document.documentElement.lang = zh ? "zh-Hant" : "en";
  const btn = document.getElementById("lang-toggle");
  if (btn) {
    btn.setAttribute("aria-pressed", zh ? "true" : "false");
    btn.textContent = zh ? "EN" : "中";
  }
  syncDescToggle();
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
    y: -20 - Math.random() * 60,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    vx: -3 + Math.random() * 6,
    vy: 3 + Math.random() * 5,
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
    if (t < 50) confettiFrame = requestAnimationFrame(tick);
    else {
      confettiFrame = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.remove("show");
    }
  };
  confettiFrame = requestAnimationFrame(tick);
}

function markOpened(id) {
  const was = state.cleared;
  state.seen[id] = true;
  if (seenCount() >= APPARATUS.length && !state.cleared) {
    state.cleared = true;
    if (!was) burstConfetti();
  }
}

function show(id, opts) {
  const options = opts || {};
  state.view = id;
  if (id === "check" && (options.fresh || !state.deck.length)) remixCheck();
  document.querySelectorAll(".view").forEach((node) => node.classList.toggle("active", node.id === id));
  document.querySelectorAll(".nav button").forEach((btn) => {
    btn.setAttribute("aria-current", btn.dataset.view === id ? "page" : "false");
  });
  if (id === "learn") renderLearn();
  if (id === "check") renderCheck();
  saveProgress();
}

function buildNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  [
    { id: "learn", label: "Tray" },
    { id: "check", label: "Check yourself" },
  ].forEach((view) => {
    const btn = document.createElement("button");
    btn.textContent = view.label;
    btn.dataset.view = view.id;
    btn.addEventListener("click", () => show(view.id));
    nav.appendChild(btn);
  });
}

function applyZoom() {
  document.documentElement.style.setProperty("--kit-zoom", String(state.zoom));
}

function bumpZoom(delta) {
  state.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round((state.zoom + delta) * 100) / 100));
  applyZoom();
  const label = document.getElementById("zoom-label");
  if (label) label.textContent = Math.round(state.zoom * 100) + "%";
  const smaller = document.getElementById("zoom-smaller");
  const bigger = document.getElementById("zoom-bigger");
  if (smaller) smaller.disabled = state.zoom <= ZOOM_MIN;
  if (bigger) bigger.disabled = state.zoom >= ZOOM_MAX;
  saveProgress();
}

function lookalikeHtml(item) {
  const otherId = (item.similar || []).find((id) => byId(id));
  if (!otherId) return "";
  const other = byId(otherId);
  const trap = trapLine(item.name, other.name) || `Compare the shape of ${displayName(item)} and ${displayName(other)}.`;
  return `<div class="lookalike">
    <p class="exam-kicker">Do not mix with</p>
    <div class="lookalike-row">
      <figure>
        <img src="${photoSrc(item.id)}" alt="${item.name}" />
        <figcaption>${displayName(item)}</figcaption>
      </figure>
      <figure>
        <img src="${photoSrc(other.id)}" alt="${other.name}" />
        <figcaption>${displayName(other)}</figcaption>
      </figure>
    </div>
    <p class="trap">${trap}</p>
  </div>`;
}

function stepPiece(dir) {
  const list = kitOrder();
  const i = list.findIndex((row) => row.id === state.learnId);
  if (i < 0) return;
  const next = list[(i + dir + list.length) % list.length];
  state.learnId = next.id;
  state.revealed = false;
  markOpened(next.id);
  saveProgress();
  renderLearn();
}

function renderLearn() {
  if (!state.core.length) remixTray();
  const item = byId(state.learnId) || APPARATUS[0];
  markOpened(item.id);
  applyZoom();
  const root = document.getElementById("learn");
  const diagram = item.diagram
    ? `<div class="photo-frame"><img src="${drawingSrc(item.id)}" alt="${state.revealed ? "2D diagram of " + item.name : "2D diagram of unnamed apparatus"}" /></div>`
    : `<div class="photo-frame"><span class="tiny">No 2D diagram in the notes. Use the photograph.</span></div>`;
  const photo = `<div class="photo-frame"><img src="${photoSrc(item.id)}" alt="${state.revealed ? "Photograph of " + item.name : "Photograph of unnamed apparatus"}" /></div>`;
  root.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Meet the Kit</h2>
        <p class="lead">Names are hidden on the chips. Look at both pictures, then reveal.</p>
      </div>
      <div class="score-wrap">
        ${trayStamp()}
        <button class="btn btn-primary" data-go="check">Check yourself</button>
      </div>
    </div>
    <div class="learn-layout">
      <aside class="learn-options">
        <p class="caption">In the notes as (a)–(j)</p>
        <div class="chips" id="learn-core"></div>
        <p class="caption">More of the kit</p>
        <div class="chips quiet" id="learn-extra"></div>
      </aside>
      <div class="learn-stage">
        <div class="specimen-zoom">
          <button type="button" class="btn btn-ghost" id="zoom-smaller" ${state.zoom <= ZOOM_MIN ? "disabled" : ""} aria-label="Smaller">−</button>
          <span id="zoom-label">${Math.round(state.zoom * 100)}%</span>
          <button type="button" class="btn btn-ghost" id="zoom-bigger" ${state.zoom >= ZOOM_MAX ? "disabled" : ""} aria-label="Bigger">+</button>
          ${state.revealed ? "" : `<p class="tiny kit-hint">Name this piece in your head, then reveal.</p>`}
        </div>
        <div class="detail">
          <div>
            <p class="caption">2D diagram</p>
            ${diagram}
          </div>
          <div>
            <p class="caption">Photograph</p>
            ${photo}
          </div>
        </div>
        <div class="learn-answer">
          ${state.revealed
            ? `<div class="word-desc">
               <p class="exam-kicker">In class</p>
               <p>${item.easy}</p>
               <p class="exam-kicker">Model answer</p>
               <p class="exam-line"><strong>${displayName(item)}</strong> — ${item.exam}</p>
               ${lookalikeHtml(item)}
               </div>`
            : ""}
          <div class="toolbar learn-actions">
            <div>
              <button class="btn btn-ghost" id="learn-back">Back</button>
              ${state.revealed
                ? `<button class="btn btn-ghost" id="hide-name">Hide name</button>`
                : `<button class="btn btn-primary" id="reveal-name">Reveal model answer</button>`}
              <button class="btn btn-primary" id="learn-next">Next</button>
            </div>
            <button class="btn btn-ghost" id="learn-fresh">New mix</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const fill = (nodeId, list, extra) => {
    const node = document.getElementById(nodeId);
    list.forEach((row, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = row.id === item.id ? "on" : "";
      if (state.seen[row.id]) btn.classList.add("seen");
      btn.innerHTML = `<img src="${photoSrc(row.id)}" alt="" /><span>${chipLabel(row, index, extra)}</span>`;
      btn.addEventListener("click", () => {
        state.learnId = row.id;
        state.revealed = false;
        markOpened(row.id);
        saveProgress();
        renderLearn();
      });
      node.appendChild(btn);
    });
  };
  fill("learn-core", state.core, false);
  fill("learn-extra", state.extra, true);
  document.getElementById("learn-back").addEventListener("click", () => stepPiece(-1));
  document.getElementById("learn-next").addEventListener("click", () => stepPiece(1));
  const reveal = document.getElementById("reveal-name");
  if (reveal) {
    reveal.addEventListener("click", () => {
      state.revealed = true;
      markOpened(item.id);
      saveProgress();
      renderLearn();
    });
  }
  const hide = document.getElementById("hide-name");
  if (hide) {
    hide.addEventListener("click", () => {
      state.revealed = false;
      saveProgress();
      renderLearn();
    });
  }
  document.getElementById("learn-fresh").addEventListener("click", () => {
    remixTray();
    saveProgress();
    renderLearn();
  });
  document.getElementById("zoom-smaller").addEventListener("click", () => bumpZoom(-ZOOM_STEP));
  document.getElementById("zoom-bigger").addEventListener("click", () => bumpZoom(ZOOM_STEP));
  root.querySelector("[data-go=check]").addEventListener("click", () => show("check"));
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
}

function currentQ() {
  if (state.phase === "recap") return state.recapQueue[0] || null;
  return state.deck[state.i] || null;
}

function pickIsCorrect(q, pick) {
  const item = byId(q.id);
  if (q.type === "spot") return pick === item.id;
  return pick === item.name;
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
  const item = byId(q.id);
  const chosen = q.type === "spot" ? displayName(byId(pick)) : pick;
  state.fb = { ok, title: ok ? "Correct — that matches the kit" : "Not this time — compare the shape", item, chosen };
}

function nextLabel(q) {
  const locked = state.checked && pickIsCorrect(q, state.pick);
  if (!locked) return "Next";
  if (state.phase === "recap") {
    const more = state.recapQueue.length > 1 || state.missQueue.length > 0;
    return more ? "Next recap" : "Finish";
  }
  if (state.i < state.deck.length - 1) return "Next";
  const n = state.missQueue.length;
  return n ? `Recap ${n} miss${n === 1 ? "" : "es"}` : "Finish";
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

function optionLabel(q, opt) {
  if (q.type === "spot") return displayName(byId(opt));
  const item = APPARATUS.find((row) => row.name === opt);
  return item ? displayName(item) : opt;
}

function renderCheckDone() {
  const root = document.getElementById("check");
  const need = state.deck.length;
  const got = firstTryCorrect();
  const clean = got >= need && need > 0;
  const weak = Object.keys(state.missCounts).map((key) => {
    const q = state.deck.find((row) => row.key === key);
    const item = q ? byId(q.id) : null;
    return item ? { name: displayName(item), n: state.missCounts[key] } : null;
  }).filter(Boolean).sort((a, b) => b.n - a.n);
  root.innerHTML = `
    <div class="done-card">
      ${clean ? `<span class="stamp cleared">Cleared</span>` : `<span class="stamp revised">Revised</span>`}
      <h2>${clean ? "Clean first-try run" : "Recap finished"}</h2>
      <p class="exam-line">First try ${got} / ${need}${clean ? " — Cleared." : ". Recap is done; this is not a clean run."}</p>
      ${weak.length ? `<ul class="weak-list">${weak.map((row) => `<li><strong>${row.name}</strong> — missed ${row.n} time${row.n === 1 ? "" : "s"}</li>`).join("")}</ul>` : "<p>Clean run — no misses to recap.</p>"}
      <div class="toolbar">
        <button class="btn btn-primary" data-go="learn">Back to the tray</button>
        <button class="btn btn-ghost" data-fresh="1">New mix</button>
      </div>
    </div>
  `;
  root.querySelector("[data-go=learn]").addEventListener("click", () => show("learn"));
  root.querySelector("[data-fresh]").addEventListener("click", () => show("check", { fresh: true }));
}

function renderCheck() {
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
  const progress = state.phase === "recap"
    ? `<p class="recap-banner">Recap · ${state.recapQueue.length} still to get right</p>`
    : `<p class="tiny">${state.i + 1} / ${state.deck.length} · first try ${firstTryCorrect()} / ${Object.keys(state.firstTry).length}</p>`;
  const prompt = q.type === "spot"
    ? `Tap the picture of <strong>${displayName(item)}</strong>.`
    : q.prompt;
  const choices = q.options.map((opt, i) => {
    const selected = String(state.pick) === String(opt) ? " selected" : "";
    const right = q.type === "spot" ? opt === q.id : opt === item.name;
    const mark = state.checked && right ? " is-right" : (state.checked && String(state.pick) === String(opt) ? " is-wrong" : "");
    if (q.type === "spot") {
      const choice = byId(opt);
      return `<button class="choice spot${selected}${mark}" data-opt="${opt}">
        <span class="keycap">${i + 1}</span>
        <img src="${photoSrc(choice.id)}" alt="${state.checked ? choice.name : "Apparatus option " + (i + 1)}" />
        ${state.checked ? `<span>${displayName(choice)}</span>` : ""}
      </button>`;
    }
    return `<button class="choice${selected}${mark}" data-opt="${opt}"><span class="keycap">${i + 1}</span><span>${optionLabel(q, opt)}</span></button>`;
  }).join("");
  const fb = state.fb
    ? `<div class="feedback ${state.fb.ok ? "ok" : "bad"}"><strong>${state.fb.title}</strong>
        <p><strong>${displayName(item)}</strong> — ${item.exam}</p>
        ${state.fb.ok ? "" : `<p>You chose <strong>${state.fb.chosen}</strong>.</p>`}</div>`
    : `<p class="tiny keys">Press ${[1, 2, 3, 4].map((k) => `<span class="keycap">${k}</span>`).join(" ")} to choose</p>`;
  root.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Check yourself</h2>
        <p class="check-prompt">${prompt}</p>
      </div>
      <div class="score-wrap">${checkStamp()}<div class="score">${firstTryCorrect()} / ${state.deck.length}</div></div>
    </div>
    ${progress}
    <div class="drill-stage${q.type === "spot" ? " is-spot" : ""}">
      ${q.type === "name" ? `<div class="photo-frame specimen"><img src="${item.diagram ? drawingSrc(item.id) : photoSrc(item.id)}" alt="${state.checked ? item.name : "Unnamed apparatus"}" /></div>` : ""}
      <div class="fb-col">
        ${fb}
        <div class="choices${q.type === "spot" ? " spots" : ""}">${choices}</div>
        <div class="toolbar drill-actions">
          <div>
            ${state.checked && !locked ? `<button class="btn btn-primary" id="check-again">Try again</button>` : ""}
            <button class="btn btn-primary" id="check-next" ${!locked ? "disabled" : ""}>${nextLabel(q)}</button>
          </div>
          <button class="btn btn-ghost" id="check-reset">New mix</button>
        </div>
      </div>
    </div>
  `;
  root.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (locked) return;
      const pick = btn.dataset.opt;
      const ok = pickIsCorrect(q, pick);
      state.pick = pick;
      recordAnswer(q, ok);
      setFb(ok, q, pick);
      state.checked = true;
      if (ok) burstConfetti();
      saveProgress();
      renderCheck();
    });
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
}

loadProgress();
loadThemeFallback();
if (!state.core.length) remixTray();
applyLang();
applyZoom();
buildNav();
show("learn");

document.getElementById("theme-toggle").addEventListener("click", () => {
  applyTheme(!document.documentElement.classList.contains("dark"));
});
document.getElementById("lang-toggle").addEventListener("click", () => {
  state.lang = state.lang === "zh" ? "en" : "zh";
  applyLang();
  saveProgress();
  if (state.view === "learn") renderLearn();
  if (state.view === "check") renderCheck();
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
    show("learn");
    return;
  }
  if (state.view === "learn" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    event.preventDefault();
    stepPiece(event.key === "ArrowLeft" ? -1 : 1);
    return;
  }
  if (event.key === "Enter") {
    if (state.view === "learn" && !state.revealed) {
      const reveal = document.getElementById("reveal-name");
      if (reveal) {
        event.preventDefault();
        reveal.click();
        return;
      }
    }
    const next = document.getElementById("check-next") || document.getElementById("learn-next");
    if (next && !next.disabled) {
      event.preventDefault();
      next.click();
    }
    return;
  }
  const n = Number(event.key);
  if (n < 1 || n > 4) return;
  const choices = document.querySelectorAll(".view.active .choice");
  if (!choices.length || !choices[n - 1]) return;
  event.preventDefault();
  choices[n - 1].click();
});
