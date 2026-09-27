const VIEWS = [
  { id: "home", label: "Home" },
  { id: "build", label: "Build the Bench" },
];

const STATION_LEVELS = [
  { id: "challenge", label: "Challenge", hint: "Build a full set-up" },
];

const STATION_CARDS = [
  { go: "build", title: "Build the Bench", level: "challenge", blurb: "Six set-ups in lesson order, from a few cm³ of water to filtration. Match each name and 2D diagram.", thumb: "images/notes-tripod-diagram.jpg" },
];

const state = {
  streak: 0,
  fb: null,
  cleared: {},
  best: {},
  badgePop: "",
  buildDeck: [],
  buildI: 0,
  buildDrag: null,
  buildNames: {},
  buildDraws: {},
  buildChecked: false,
  buildScore: 0,
  buildDone: {},
  buildMiss: [],
  buildPhase: "main",
  buildRecapDeck: [],
  buildRecapI: 0,
};

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function streakTier() {
  let tier = STREAK_TIERS[0];
  STREAK_TIERS.forEach((row) => {
    if (state.streak >= row.min) tier = row;
  });
  return tier;
}

function streakBox() {
  const tier = streakTier();
  return `<div class="streak vibe-${tier.vibe}" title="Correct answers in a row"><span class="streak-n">${state.streak}</span><span class="streak-label">${tier.label}</span><span class="streak-note">${tier.note}</span></div>`;
}

function praise(kind) {
  if (kind === "partial") {
    return { cls: "partial praise", title: pickOne(PARTIAL_TITLES), body: pickOne(PARTIAL_BODIES), meme: "Some matches are already correct." };
  }
  if (kind === true || kind === "ok") {
    state.streak += 1;
    burstConfetti();
    const n = state.streak;
    const title = n >= 3
      ? pickOne(STREAK_TITLES).replace("{n}", String(n))
      : pickOne(WIN_TITLES);
    return { cls: "ok praise vibe-" + streakTier().vibe, title, body: pickOne(PRAISE), meme: pickOne(WIN_MEMES) };
  }
  state.streak = 0;
  return { cls: "bad", title: pickOne(MISS_TITLES), body: pickOne(MISS_BODIES), meme: pickOne(MISS_MEMES) };
}

function setFb(kind, extra) {
  const p = praise(kind);
  state.fb = { cls: p.cls, title: p.title, body: p.body, extra: extra || "", meme: p.meme || "" };
  paintStreak();
}

function paintStreak() {
  const hud = document.getElementById("streak-hud");
  if (hud) hud.innerHTML = streakBox();
}

function stationNeed(id) {
  if (id === "build") return BUILD.length;
  return 0;
}

function stationGot(id) {
  if (id === "build") return Math.max(state.best.build || 0, state.buildScore || 0);
  return state.best[id] || 0;
}

function stationBadge(id) {
  const need = stationNeed(id);
  if (!need) return "";
  const got = stationGot(id);
  if (state.cleared[id]) return `<span class="stamp cleared" title="Station cleared">Cleared</span>`;
  if (got > 0) return `<span class="stamp progress" title="Best so far">${got}/${need}</span>`;
  return `<span class="stamp todo">${got}/${need}</span>`;
}

function badgePopHtml(id) {
  if (state.badgePop !== id) return "";
  const card = STATION_CARDS.find((row) => row.go === id);
  const name = card ? card.title : id;
  return `<div class="badge-pop">Badge unlocked — ${name}</div>`;
}

function tickClear(id) {
  const need = stationNeed(id);
  const got = stationGot(id);
  if (got > (state.best[id] || 0)) state.best[id] = got;
  if (need > 0 && got >= need && !state.cleared[id]) {
    state.cleared[id] = true;
    state.badgePop = id;
    burstConfetti();
    setTimeout(() => {
      if (state.badgePop === id) {
        state.badgePop = "";
        const pop = document.querySelector(".badge-pop");
        if (pop) pop.remove();
      }
    }, 3200);
  }
  saveProgress();
  paintNavBadges();
}

function saveProgress() {
  try {
    localStorage.setItem("chem-build-bench-progress", JSON.stringify({
      cleared: state.cleared,
      best: state.best,
    }));
  } catch (err) { /* offline file mode may block storage */ }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem("chem-build-bench-progress");
    if (!raw) return;
    const data = JSON.parse(raw);
    state.cleared = data.cleared || {};
    state.best = data.best || {};
  } catch (err) { /* ignore bad storage */ }
}

function paintNavBadges() {
  document.querySelectorAll(".nav button").forEach((btn) => {
    const id = btn.dataset.view;
    btn.classList.toggle("cleared", Boolean(state.cleared[id]));
    let stamp = btn.querySelector(".nav-stamp");
    if (state.cleared[id]) {
      if (!stamp) {
        stamp = document.createElement("span");
        stamp.className = "nav-stamp";
        stamp.textContent = "✓";
        btn.appendChild(stamp);
      }
    } else if (stamp) {
      stamp.remove();
    }
  });
}

let confettiRun = 0;

function burstConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.getElementById("confetti");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const run = ++confettiRun;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  canvas.classList.add("show");
  const colors = ["#0ea5e9", "#1d4ed8", "#38bdf8", "#fbbf24", "#34d399", "#0369a1"];
  const pieces = Array.from({ length: 42 }, () => ({
    x: Math.random() * width,
    y: -24 - Math.random() * 80,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    vx: -3 + Math.random() * 6,
    vy: 3 + Math.random() * 4,
    rot: Math.random() * 6.28,
    vr: -0.2 + Math.random() * 0.4,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  let t = 0;
  const tick = () => {
    if (run !== confettiRun) return;
    t += 1;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < pieces.length; i += 1) {
      const p = pieces[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.14;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t < 70) requestAnimationFrame(tick);
    else {
      ctx.clearRect(0, 0, width, height);
      canvas.classList.remove("show");
    }
  };
  requestAnimationFrame(tick);
}

function drawingSrc(id) {
  const fromNotes = ["beaker", "test-tube", "measuring-cylinder", "filter-funnel", "conical-flask", "round-bottomed-flask", "evaporating-dish", "watch-glass", "wire-gauze", "bunsen-burner", "tripod", "dropper", "glass-rod", "thermometer", "crucible"];
  if (fromNotes.includes(id)) return notesDiagramSrc(id);
  return diagramSrc(id);
}

function remix(id) {
  state.fb = null;
  if (id === "build") {
    state.buildDeck = BUILD.slice();
    state.buildI = 0;
    state.buildNames = {};
    state.buildDraws = {};
    state.buildDrag = null;
    state.buildChecked = false;
    state.buildScore = 0;
    state.buildDone = {};
    state._buildFor = null;
    state.buildMiss = [];
    state.buildPhase = "main";
    state.buildRecapDeck = [];
    state.buildRecapI = 0;
  }
}

function hasRun(id) {
  if (id === "build") return state.buildDeck.length > 0;
  return false;
}

function resumeHint(id) {
  if (!hasRun(id)) return "";
  if (id === "learn") return "Continue";
  if (id === "scramble") {
    if (state.scramblePhase === "done" || state.scrambleOver) return "Finished";
    const n = state.scrambleDeck.length;
    const i = state.scrambleI || 0;
    return n ? `Continue · ${i + 1}/${n} · ${formatClock(state.scrambleElapsed)}` : "Continue";
  }
  const phase = state[id + "Phase"];
  if (phase === "done") return "Finished";
  if (phase === "recap") {
    const n = (state[id + "RecapDeck"] || []).length;
    const i = state[id + "RecapI"] || 0;
    return n ? `Continue recap · ${i + 1}/${n}` : "Continue recap";
  }
  const n = (state[id + "Deck"] || []).length;
  const i = state[id + "I"] || 0;
  return n ? `Continue · ${i + 1}/${n}` : "Continue";
}

function quizKey(id, q) {
  if (id === "name") return nameKey(q);
  if (id === "find") return q.key;
  if (id === "job") return q.n;
  return q.id;
}

function cloneForRecap(id, q) {
  if (id === "name" || id === "job" || id === "tree") return { ...q, options: shuffle(q.options.slice()) };
  if (id === "find") return { ...q, ids: shuffle(q.ids.slice()) };
  return { ...q };
}

function noteMiss(id, key) {
  if (state[id + "Phase"] === "recap") return;
  const bag = state[id + "Miss"];
  if (!bag) return;
  if (!bag.includes(key)) bag.push(key);
}

function currentQuiz(id) {
  const recap = state[id + "Phase"] === "recap";
  const deck = recap ? state[id + "RecapDeck"] : state[id + "Deck"];
  const iKey = recap ? id + "RecapI" : id + "I";
  const i = state[iKey] || 0;
  return { recap, deck, i, iKey, last: Boolean(deck.length) && i === deck.length - 1, q: deck[i] };
}

function startRecap(id) {
  const keys = state[id + "Miss"] || [];
  const list = (state[id + "Deck"] || []).filter((q) => keys.includes(quizKey(id, q))).map((q) => cloneForRecap(id, q));
  if (!list.length) {
    state[id + "Phase"] = "done";
    return;
  }
  state[id + "RecapDeck"] = list;
  state[id + "RecapI"] = 0;
  state[id + "Phase"] = "recap";
  state.fb = null;
  if (id === "name") { state.namePick = ""; state.nameChecked = false; }
  if (id === "find") { state.findPick = ""; state.findChecked = false; state._findFor = null; }
  if (id === "job") { state.jobPick = ""; state.jobChecked = false; }
  if (id === "tree") { state.treeFail = null; state.treeRecapDone = {}; }
  if (id === "build") { state._buildFor = null; }
}

function finishOrRecap(id) {
  if (state[id + "Phase"] === "recap") state[id + "Phase"] = "done";
  else startRecap(id);
}

function nextLabel(id, last, locked) {
  if (!locked) return "Next";
  if (!last) return "Next";
  if (state[id + "Phase"] === "recap") return "Finish";
  const n = (state[id + "Miss"] || []).length;
  return n ? `Recap ${n} miss${n === 1 ? "" : "es"}` : "Finish";
}

function renderStationDone(root, id, title) {
  const n = (state[id + "Miss"] || []).length;
  root.innerHTML = `
    <div class="done-card">
      ${stationBadge(id)}
      <h2>${title}</h2>
      <p class="exam-line">${n ? `Recap done. You retried ${n} question${n === 1 ? "" : "s"} you missed.` : "Clean run — no misses to recap."}</p>
      <div class="toolbar">
        <button class="btn btn-primary" data-go-home="1">Home</button>
        <button class="btn btn-ghost" data-fresh="${id}">Start again</button>
      </div>
    </div>
  `;
  root.querySelector("[data-go-home]").addEventListener("click", () => show("home"));
  root.querySelector("[data-fresh]").addEventListener("click", () => show(id, true));
}

function show(id, fresh) {
  state.view = id;
  document.querySelectorAll(".view").forEach((node) => node.classList.toggle("active", node.id === id));
  document.querySelectorAll(".nav button").forEach((btn) => {
    btn.setAttribute("aria-current", btn.dataset.view === id ? "page" : "false");
  });
  paintStreak();
  if (id === "home") renderHome();
  const quiz = id === "build";
  if (quiz && (fresh || !hasRun(id))) remix(id);
  if (id === "build") renderBuild();
  paintNavBadges();
}

function buildNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  const homeWrap = document.createElement("div");
  homeWrap.className = "nav-home";
  const restWrap = document.createElement("div");
  restWrap.className = "nav-stations";
  VIEWS.forEach((view) => {
    const btn = document.createElement("button");
    btn.textContent = view.label;
    btn.dataset.view = view.id;
    btn.addEventListener("click", () => show(view.id));
    (view.id === "home" ? homeWrap : restWrap).appendChild(btn);
  });
  nav.appendChild(homeWrap);
  nav.appendChild(restWrap);
  paintNavBadges();
  renderHome();
}

function stationCardHtml(card) {
  const hint = resumeHint(card.go);
  const level = STATION_LEVELS.find((row) => row.id === card.level);
  return `<button class="game-card${state.cleared[card.go] ? " is-cleared" : ""}" data-go="${card.go}">
    ${stationBadge(card.go)}
    <img class="card-thumb" src="${card.thumb}" alt="" decoding="async" />
    <span class="level-pill level-${card.level}">${level ? level.label : ""}</span>
    <h3>${card.title}</h3>
    <p>${card.blurb}</p>
    ${hint ? `<span class="resume-tag">${hint}</span>` : ""}
    ${hasRun(card.go) ? `<span class="fresh-link" data-fresh="${card.go}">Start again</span>` : ""}
  </button>`;
}

function renderHome() {
  const games = document.getElementById("home-games");
  if (!games) return;
  games.innerHTML = STATION_LEVELS.map((level) => {
    const cards = STATION_CARDS.filter((card) => card.level === level.id);
    return `<div class="level-block">
      <h3 class="level-heading"><span class="level-pill level-${level.id}">${level.label}</span> ${level.hint}</h3>
      <div class="grid games-row">${cards.map(stationCardHtml).join("")}</div>
    </div>`;
  }).join("");
  games.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => show(btn.dataset.go));
  });
  games.querySelectorAll("[data-fresh]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      show(btn.dataset.fresh, true);
    });
  });
}

function feedbackBox() {
  const fb = state.fb;
  if (!fb) return "";
  return `<div class="feedback ${fb.cls}">${fb.meme ? `<div class="fb-note">${fb.meme}</div>` : ""}<strong>${fb.title}</strong><p>${fb.body}</p>${fb.extra ? `<div class="explain">${fb.extra}</div>` : ""}</div>`;
}

function award(done, key, ok, scoreKey) {
  const station = scoreKey.replace("Score", "");
  if (!ok) noteMiss(station, key);
  if (done[key] === true) return;
  if (ok) {
    done[key] = true;
    state[scoreKey] += 1;
    tickClear(station);
  } else {
    done[key] = false;
  }
}

function buildStats(q) {
  const nameNeed = q.slots.length;
  const diagNeed = q.slots.filter((slot) => trayHasDiagram(slot.answer)).length;
  const nameGot = q.slots.filter((slot) => state.buildNames[slot.id] === slot.answer).length;
  const diagGot = q.slots.filter((slot) => trayHasDiagram(slot.answer) && state.buildDraws[slot.id] === slot.answer).length;
  const filledNames = q.slots.every((slot) => state.buildNames[slot.id]);
  const filledDraws = q.slots.every((slot) => !trayHasDiagram(slot.answer) || state.buildDraws[slot.id]);
  return {
    nameNeed,
    diagNeed,
    nameGot,
    diagGot,
    total: nameNeed + diagNeed,
    got: nameGot + diagGot,
    filled: filledNames && filledDraws,
    allRight: nameGot === nameNeed && diagGot === diagNeed,
  };
}

function placeBuild(slotId, type, id) {
  const bag = type === "name" ? state.buildNames : state.buildDraws;
  Object.keys(bag).forEach((key) => {
    if (bag[key] === id) delete bag[key];
  });
  bag[slotId] = id;
  state.buildDrag = null;
  state.buildChecked = false;
}

function dropClass(checked, placed, answer) {
  if (!checked) return placed ? " filled" : "";
  if (placed === answer) return " filled right";
  if (placed) return " filled wrong";
  return "";
}

function textHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function figureHtml(src, caption) {
  if (!src) return "";
  return `<p class="caption">${textHtml(caption)}</p><div class="photo-frame setup-hero"><img src="${textHtml(src)}" alt="" decoding="async" /></div>`;
}

function slotNeedsFix(slot) {
  if (state.buildNames[slot.id] !== slot.answer) return true;
  if (trayHasDiagram(slot.answer) && state.buildDraws[slot.id] !== slot.answer) return true;
  return false;
}

function paintBuildPick() {
  const pick = state.buildDrag;
  document.querySelectorAll("#build [data-kind][data-id]").forEach((node) => {
    const on = Boolean(pick && pick.type === node.dataset.kind && pick.id === node.dataset.id);
    node.classList.toggle("selected", on);
  });
}

function renderBuild(keepScroll) {
  const y = keepScroll ? window.scrollY : 0;
  if (!state.buildDeck.length) remix("build");
  const root = document.getElementById("build");
  if (state.buildPhase === "done") {
    renderStationDone(root, "build", "Build the Bench");
    return;
  }
  const cur = currentQuiz("build");
  const q = cur.q;
  const buildKey = (cur.recap ? "r" : "m") + "-" + cur.i;
  if (buildKey !== state._buildFor) {
    state.buildNames = {};
    state.buildDraws = {};
    state.buildDrag = null;
    state.buildChecked = false;
    state._buildFor = buildKey;
    state._nameOrder = shuffle(q.tray.slice());
    state._drawOrder = shuffle(q.tray.filter((id) => trayHasDiagram(id)));
    state._photoOrder = shuffle(q.slots.slice());
    state.fb = null;
  }
  const stats = buildStats(q);
  const locked = state.buildChecked && stats.allRight;
  let feedback = "";
  if (state.buildChecked) feedback = feedbackBox();

  const slotCards = q.slots.map((slot) => {
    const nameId = state.buildNames[slot.id];
    const drawId = state.buildDraws[slot.id];
    const hasDraw = trayHasDiagram(slot.answer);
    const nameDrop = nameId
      ? `<span class="dropped-name">${trayName(nameId)}</span>`
      : `<span class="empty">Drop the name here</span>`;
    const drawDrop = !hasDraw
      ? `<span class="tiny">Name only — this piece has no 2D diagram in the exam</span>`
      : drawId
        ? `<img src="${drawingSrc(drawId)}" alt="Exam diagram" decoding="async" />`
        : `<span class="empty">Drop the diagram here</span>`;
    const why = state.buildChecked && slotNeedsFix(slot) && slot.why
      ? `<p class="slot-why">${textHtml(slot.why)}</p>`
      : "";
    return `
      <div class="setup-slot">
        <em>${textHtml(slot.label)}</em>
        <div class="drop drop-lg name-drop${dropClass(state.buildChecked, nameId, slot.answer)}" data-slot="${slot.id}" data-kind="name">${nameDrop}</div>
        <div class="drop drop-lg diag-drop${dropClass(state.buildChecked, drawId, slot.answer)}${hasDraw ? "" : " skipped"}" data-slot="${slot.id}" data-kind="diagram">${drawDrop}</div>
        ${why}
      </div>`;
  }).join("");

  const names = state._nameOrder.map((id) => {
    const used = Object.values(state.buildNames).includes(id);
    const selected = state.buildDrag && state.buildDrag.type === "name" && state.buildDrag.id === id ? " selected" : "";
    return `<button class="drag-chip big${selected}${used ? " used" : ""}" draggable="true" data-kind="name" data-id="${id}">${trayName(id)}</button>`;
  }).join("");

  const diagrams = state._drawOrder.map((id) => {
    const used = Object.values(state.buildDraws).includes(id);
    const selected = state.buildDrag && state.buildDrag.type === "diagram" && state.buildDrag.id === id ? " selected" : "";
    return `<button class="drag-diag big${selected}${used ? " used" : ""}" draggable="true" data-kind="diagram" data-id="${id}">
      <img src="${drawingSrc(id)}" alt="Exam diagram" decoding="async" />
    </button>`;
  }).join("");

  const askFigure = q.ask
    ? figureHtml(q.ask, q.askCaption)
    : `<p class="caption">${textHtml(q.askCaption)}</p>`;
  const revealFigure = locked && q.reveal ? figureHtml(q.reveal, q.revealCaption) : "";
  const matchPanel = `
    ${askFigure}
    <div class="setup-slots">${slotCards}</div>
    ${revealFigure}`;

  root.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Build the Bench</h2>
        <p class="lead">${cur.recap ? "Recap — set-ups you missed, in lesson order." : "Match the name, and the 2D diagram where the exam has one."}</p>
      </div>
      <div class="score-wrap">${stationBadge("build")}<div class="score">${state.buildScore} / ${state.buildDeck.length}</div></div>
    </div>
    ${badgePopHtml("build")}
    ${cur.recap ? `<p class="recap-banner">Recap ${cur.i + 1} / ${cur.deck.length} · ${textHtml(q.title)}</p>` : `<p class="tiny">Set-up ${cur.i + 1} of ${cur.deck.length} · ${textHtml(q.title)}</p>`}
    <p class="exam-line">${textHtml(q.easy)}</p>
    <p class="source-note">${textHtml(q.exam)}</p>
    ${q.safety ? `<p class="safety-note">Safety: ${textHtml(q.safety)}</p>` : ""}
    ${matchPanel}
    <p class="caption">Names — click one, then click a Name slot. You can also drag.</p>
    <div class="chips drag-tray">${names}</div>
    <p class="caption">Unlabelled 2D diagrams — click one, then click a Diagram slot. You can also drag.</p>
    <div class="grid pack-grid drag-tray">${diagrams}</div>
    ${feedback}
    <div class="toolbar" style="margin-top:16px">
      <div>
        <button class="btn btn-primary" id="build-check" ${!stats.filled || locked ? "disabled" : ""}>Check the set-up</button>
        <button class="btn btn-ghost" id="build-keep" ${!state.buildChecked || locked || stats.got === 0 ? "disabled" : ""}>Keep the right ones and try again</button>
        <button class="btn btn-ghost" id="build-back" ${cur.i === 0 ? "disabled" : ""}>Back</button>
        <button class="btn btn-primary" id="build-next" ${!locked ? "disabled" : ""}>${nextLabel("build", cur.last, locked)}</button>
      </div>
      <button class="btn btn-ghost" id="build-reset">Start again</button>
    </div>
  `;
  if (keepScroll) window.scrollTo(0, y);

  const bindDrag = (node) => {
    node.addEventListener("dragstart", (event) => {
      if (locked) return;
      const type = node.dataset.kind;
      const id = node.dataset.id;
      state.buildDrag = { type, id };
      event.dataTransfer.setData("text/plain", type + ":" + id);
      event.dataTransfer.effectAllowed = "move";
      paintBuildPick();
    });
    node.addEventListener("click", () => {
      if (locked) return;
      const type = node.dataset.kind;
      const id = node.dataset.id;
      if (state.buildDrag && state.buildDrag.type === type && state.buildDrag.id === id) {
        state.buildDrag = null;
      } else {
        state.buildDrag = { type, id };
      }
      paintBuildPick();
    });
  };
  root.querySelectorAll("[data-kind][data-id]").forEach(bindDrag);

  root.querySelectorAll(".drop").forEach((zone) => {
    const type = zone.dataset.kind;
    const slot = zone.dataset.slot;
    if (zone.classList.contains("skipped")) return;
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      zone.classList.add("over");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("over"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("over");
      if (locked) return;
      const raw = event.dataTransfer.getData("text/plain") || event.dataTransfer.getData("text") || "";
      const parts = raw.split(":");
      const dropType = parts[0];
      const id = parts[1];
      if (dropType !== type || !id) return;
      placeBuild(slot, type, id);
      renderBuild(true);
    });
    zone.addEventListener("click", () => {
      if (locked) return;
      if (state.buildDrag && state.buildDrag.type === type) {
        placeBuild(slot, type, state.buildDrag.id);
        renderBuild(true);
        return;
      }
      if (!state.buildChecked) {
        if (type === "name" && state.buildNames[slot]) {
          delete state.buildNames[slot];
          renderBuild(true);
        } else if (type === "diagram" && state.buildDraws[slot]) {
          delete state.buildDraws[slot];
          renderBuild(true);
        }
      }
    });
  });

  document.getElementById("build-check").addEventListener("click", () => {
    const now = buildStats(q);
    if (now.allRight) {
      award(state.buildDone, q.id, true, "buildScore");
      setFb(true, `<p class="exam-kicker">Model answer</p><p>${textHtml(q.mark)}</p><p>${textHtml(q.follow)}</p>`);
    } else if (now.got > 0) {
      award(state.buildDone, q.id, false, "buildScore");
      setFb("partial", `Matched <strong>${now.nameGot}</strong>/${now.nameNeed} names and <strong>${now.diagGot}</strong>/${now.diagNeed} diagrams. Read the note under each red slot, then keep the green ones.`);
    } else {
      award(state.buildDone, q.id, false, "buildScore");
      setFb("wrong", "Read the note under each red slot, then try again.");
    }
    state.buildChecked = true;
    renderBuild(true);
  });
  document.getElementById("build-keep").addEventListener("click", () => {
    q.slots.forEach((slot) => {
      if (state.buildNames[slot.id] !== slot.answer) delete state.buildNames[slot.id];
      if (trayHasDiagram(slot.answer) && state.buildDraws[slot.id] !== slot.answer) delete state.buildDraws[slot.id];
    });
    state.buildChecked = false;
    state.buildDrag = null;
    state.fb = {
      cls: "partial praise",
      title: "Those green ones stay — nice work",
      body: "Now finish the empty slots. You have already shown you can do this.",
      extra: "",
    };
    renderBuild(true);
  });
  document.getElementById("build-back").addEventListener("click", () => {
    state[cur.iKey] -= 1;
    state._buildFor = null;
    renderBuild();
  });
  document.getElementById("build-next").addEventListener("click", () => {
    if (!cur.last) {
      state[cur.iKey] += 1;
      state._buildFor = null;
    } else {
      finishOrRecap("build");
    }
    renderBuild();
  });
  document.getElementById("build-reset").addEventListener("click", () => show("build", true));
}

loadProgress();
buildNav();
show("home");
