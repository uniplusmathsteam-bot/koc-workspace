const VIEWS = [
  { id: "home", label: "Home" },
  { id: "scramble", label: "Scramble" },
];

const STATION_LEVELS = [
  { id: "timed", label: "Timed test", hint: "10 mixed questions against the clock" },
];

const STATION_CARDS = [
  { go: "scramble", title: "Scramble", level: "timed", blurb: "Ten mixed questions from What's It For?, Pick Your Tool, Build the Bench, and Lab Safety. A new set each time. 15 minutes. The clock counts up.", thumb: "images/notes-crucible-diagram.jpg" },
];

const state = {
  streak: 0,
  fb: null,
  cleared: {},
  best: {},
  badgePop: "",
  scrambleDeck: [],
  scrambleI: 0,
  scramblePick: "",
  scrambleChecked: false,
  scrambleScore: 0,
  scrambleDone: {},
  scramblePicks: {},
  scrambleLeft: 900,
  scrambleElapsed: 0,
  scrambleUsed: 0,
  scrambleOver: false,
  scramblePhase: "main",
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
  if (id === "scramble") return 10;
  return 0;
}

function stationGot(id) {
  if (id === "scramble") return Math.max(state.best.scramble || 0, state.scrambleScore || 0);
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
    localStorage.setItem("chem-scramble-progress", JSON.stringify({
      cleared: state.cleared,
      best: state.best,
    }));
  } catch (err) { /* offline file mode may block storage */ }
}

function applyTheme(dark) {
  document.documentElement.classList.toggle("dark", dark);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.textContent = dark ? "Light mode" : "Dark mode";
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  try {
    localStorage.setItem("chem-scramble-theme", dark ? "dark" : "light");
  } catch (err) { /* offline file mode may block storage */ }
}

function loadTheme() {
  let dark = false;
  try {
    const saved = localStorage.getItem("chem-scramble-theme");
    if (saved === "dark") dark = true;
    else if (saved === "light") dark = false;
    else dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (err) { /* ignore */ }
  applyTheme(dark);
}

function loadProgress() {
  try {
    const raw = localStorage.getItem("chem-scramble-progress");
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

function trapHtml(text) {
  if (!text) return "";
  return `<div class="trap">${text}</div>`;
}

function keyHint(n) {
  const keys = ["1", "2", "3", "4"].slice(0, n);
  return `<p class="tiny keys">Press ${keys.map((k) => `<span class="keycap">${k}</span>`).join(" ")} to choose</p>`;
}

function armFlip(root) {
  const card = (root || document).querySelector(".flip-card");
  if (!card) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => card.classList.add("is-flipped"));
  });
}

function flipPanel(ok, front, back) {
  return `<div class="flip-stage"><div class="flip-card ${ok ? "win" : "miss"}"><div class="flip-face flip-front">${front}</div><div class="flip-face flip-back">${back}</div></div></div>`;
}

function diagBlock(src, alt) {
  if (!src) return "";
  return `<div class="photo-frame slim"><img class="diag-in" src="${src}" alt="${alt || ""}" /></div>`;
}

function drawingSrc(id) {
  const fromNotes = ["beaker", "test-tube", "measuring-cylinder", "filter-funnel", "conical-flask", "round-bottomed-flask", "evaporating-dish", "watch-glass", "wire-gauze", "bunsen-burner", "tripod", "dropper", "glass-rod", "thermometer", "crucible"];
  if (fromNotes.includes(id)) return notesDiagramSrc(id);
  return diagramSrc(id);
}

function usesDiagram(id) {
  if (!id) return false;
  const item = byId(id);
  if (item) return Boolean(item.diagram);
  return trayHasDiagram(id);
}

function itemSrc(id) {
  if (!id) return "";
  if (usesDiagram(id)) return drawingSrc(id);
  const item = byId(id);
  if (item && item.photo) return photoSrc(id);
  if (trayHasPhoto(id)) return photoSrc(id);
  return "";
}

function itemImg(id) {
  const src = itemSrc(id);
  return src ? `<img src="${src}" alt="" />` : "";
}

function burstConfetti() {
  const canvas = document.getElementById("confetti");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add("show");
  const colors = ["#f8faf8", "#1d4ed8", "#fde68a", "#b45309", "#0f7a5a", "#fff", "#123a56"];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -24 - Math.random() * 120,
    w: 6 + Math.random() * 7,
    h: 8 + Math.random() * 10,
    vx: -3.5 + Math.random() * 7,
    vy: 3.5 + Math.random() * 6,
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
    if (t < 100) requestAnimationFrame(tick);
    else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.remove("show");
    }
  };
  requestAnimationFrame(tick);
}

const SCRAMBLE_N = 10;
const SCRAMBLE_SECONDS = 15 * 60;
let scrambleClock = null;

function formatClock(seconds) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function stopScrambleClock() {
  if (scrambleClock) {
    clearInterval(scrambleClock);
    scrambleClock = null;
  }
}

function startScrambleClock() {
  stopScrambleClock();
  if (state.scrambleOver || state.scramblePhase === "done") return;
  paintScrambleClock();
  scrambleClock = setInterval(() => {
    if (state.scrambleElapsed >= SCRAMBLE_SECONDS) {
      finishScramble(true);
      return;
    }
    state.scrambleElapsed += 1;
    state.scrambleLeft = SCRAMBLE_SECONDS - state.scrambleElapsed;
    paintScrambleClock();
    if (state.scrambleElapsed >= SCRAMBLE_SECONDS) finishScramble(true);
  }, 1000);
}

function paintScrambleClock() {
  const el = document.getElementById("scramble-clock");
  if (!el) return;
  el.textContent = formatClock(state.scrambleElapsed);
  el.classList.toggle("is-low", state.scrambleElapsed >= SCRAMBLE_SECONDS - 60);
}

function finishScramble(timedOut) {
  if (state.scramblePhase === "done") {
    stopScrambleClock();
    return;
  }
  stopScrambleClock();
  state.scrambleOver = Boolean(timedOut);
  state.scrambleUsed = state.scrambleElapsed;
  state.scramblePhase = "done";
  state.fb = null;
  if (!timedOut) burstConfetti();
  tickClear("scramble");
  if (state.view === "scramble") renderScramble();
}

function reviewModel(q) {
  const answerOpt = q.options.find((opt) => opt.ok);
  if (answerOpt && answerOpt.why) return answerOpt.why;
  return q.model || "";
}

function reviewTrap(q, pick) {
  const picked = q.options.find((opt) => opt.label === pick);
  return (picked && picked.trap) || q.trap || "";
}

function scrambleReviewHtml() {
  const items = state.scrambleDeck.map((q, i) => {
    const pick = state.scramblePicks[q.key] || "";
    const answered = Object.prototype.hasOwnProperty.call(state.scrambleDone, q.key);
    const ok = state.scrambleDone[q.key] === true;
    const skipped = !answered;
    const status = skipped ? "is-skip" : ok ? "is-ok" : "is-miss";
    const pickLine = skipped
      ? "Your pick: skipped — no mark"
      : `Your pick: <strong>${pick}</strong>`;
    const trap = skipped || ok ? "" : trapHtml(reviewTrap(q, pick));
    const extra = reviewModel(q);
    return `<li class="review-item ${status}">
      <p class="tiny">${i + 1} / ${SCRAMBLE_N} · ${q.source}</p>
      <p class="review-prompt">${q.prompt}</p>
      <p>${pickLine}</p>
      <p class="exam-kicker">Model answer</p>
      <p><strong>${q.answer}</strong></p>
      ${extra ? `<p>${extra}</p>` : ""}
      ${trap}
    </li>`;
  }).join("");
  return `<h3 class="review-heading">Review</h3>
    <p class="lead">Read each mix-up. This is a review, not another attempt.</p>
    <ol class="review-list">${items}</ol>`;
}

function scrambleThumb(opt) {
  if (opt.diagram) return `<img src="${opt.diagram}" alt="" />`;
  return itemImg(opt.id);
}

function makeScrambleDeck() {
  const jobs = JOB_Q.map((q) => ({
    kind: "job",
    key: "job-" + q.n,
    source: "What's It For?",
    prompt: q.exam,
    model: `${q.answer} — ${q.exam}`,
    photo: "",
    answer: q.answer,
    trap: (JOB_HELP[q.n] || {}).trap || "",
    options: shuffle(q.options.map((opt) => ({
      label: opt.label,
      id: opt.id || "",
      diagram: opt.diagram || "",
      ok: opt.label === q.answer,
    }))),
  }));
  const trees = TREE_Q.map((q) => ({
    kind: "tree",
    key: "tree-" + q.id,
    source: "Pick Your Tool",
    prompt: q.scenario,
    model: q.exam,
    photo: q.scene || "",
    caption: q.sceneCaption || "",
    answer: (q.options.find((opt) => opt.ok) || {}).label,
    trap: "",
    options: shuffle(q.options.map((opt) => ({
      label: opt.label,
      id: opt.id || "",
      ok: Boolean(opt.ok),
      trap: opt.trap || "",
      fail: opt.fail || "",
      why: opt.why || "",
    }))),
  }));
  const builds = [];
  BUILD.forEach((setup) => {
    setup.slots.forEach((slot) => {
      const answer = trayName(slot.answer);
      const names = setup.tray.map(trayName);
      const wrong = shuffle(names.filter((name) => name !== answer)).slice(0, 3);
      const labels = shuffle([answer].concat(wrong));
      builds.push({
        kind: "build",
        key: "build-" + setup.id + "-" + slot.id,
        source: "Build the Bench",
        prompt: `${setup.title} — which apparatus is “${slot.label}”?`,
        model: `${slot.label} — ${answer}. ${setup.exam}`,
        photo: setup.diagram || setup.photo,
        answer,
        trap: "",
        options: labels.map((label) => {
          const id = setup.tray.find((tid) => trayName(tid) === label) || "";
          return { label, id, ok: label === answer };
        }),
      });
    });
  });
  const safeties = SAFETY_Q.map((q) => ({
    kind: "safety",
    key: "safety-" + q.id,
    source: "Lab Safety",
    prompt: q.scenario,
    model: q.exam,
    photo: q.scene || "",
    caption: q.sceneCaption || "",
    answer: (q.options.find((opt) => opt.ok) || {}).label,
    trap: "",
    options: shuffle(q.options.map((opt) => ({
      label: opt.label,
      id: opt.id || "",
      ok: Boolean(opt.ok),
      trap: opt.trap || "",
      fail: opt.fail || "",
      why: opt.why || "",
    }))),
  }));
  return shuffle(
    shuffle(jobs).slice(0, 2)
      .concat(shuffle(trees).slice(0, 2))
      .concat(shuffle(builds).slice(0, 3))
      .concat(shuffle(safeties).slice(0, 3))
  ).slice(0, SCRAMBLE_N);
}

function remix(id) {
  state.fb = null;
  if (id === "scramble") {
    stopScrambleClock();
    state.scrambleDeck = makeScrambleDeck();
    state.scrambleI = 0;
    state.scramblePick = "";
    state.scrambleChecked = false;
    state.scrambleScore = 0;
    state.scrambleDone = {};
    state.scramblePicks = {};
    state.scrambleLeft = SCRAMBLE_SECONDS;
    state.scrambleElapsed = 0;
    state.scrambleUsed = 0;
    state.scrambleOver = false;
    state.scramblePhase = "main";
  }
}

function hasRun(id) {
  if (id === "scramble") return state.scrambleDeck.length > 0;
  return false;
}

function resumeHint(id) {
  if (!hasRun(id)) return "";
  if (id === "scramble") {
    if (state.scramblePhase === "done" || state.scrambleOver) return "Finished";
    const n = state.scrambleDeck.length;
    const i = state.scrambleI || 0;
    return n ? `Continue · ${i + 1}/${n} · ${formatClock(state.scrambleElapsed)}` : "Continue";
  }
  return "Continue";
}

function noteMiss(id, key) {
  if (state[id + "Phase"] === "recap") return;
  const bag = state[id + "Miss"];
  if (!bag) return;
  if (!bag.includes(key)) bag.push(key);
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

function show(id, fresh) {
  if (state.view === "scramble" && id !== "scramble") stopScrambleClock();
  state.view = id;
  document.querySelectorAll(".view").forEach((node) => node.classList.toggle("active", node.id === id));
  document.querySelectorAll(".nav button").forEach((btn) => {
    btn.setAttribute("aria-current", btn.dataset.view === id ? "page" : "false");
  });
  paintStreak();
  if (id === "home") renderHome();
  const quiz = id === "scramble";
  if (quiz && (fresh || !hasRun(id))) remix(id);
  if (id === "scramble") {
    renderScramble();
    startScrambleClock();
  }
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
    <img class="card-thumb" src="${card.thumb}" alt="" />
    <span class="level-pill level-${card.level}">${level ? level.label : ""}</span>
    <h3>${card.title}</h3>
    <p>${card.blurb}</p>
    ${hint ? `<span class="resume-tag">${hint}</span>` : ""}
    ${hasRun(card.go) ? `<span class="fresh-link" data-fresh="${card.go}">New mix</span>` : ""}
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

function renderScramble() {
  const root = document.getElementById("scramble");
  if (!root) return;
  if (!state.scrambleDeck.length) remix("scramble");
  if (state.scramblePhase === "done") {
    const timedOut = state.scrambleOver;
    const used = formatClock(state.scrambleUsed || state.scrambleElapsed);
    const scoreLine = `Score: <strong>${state.scrambleScore} / ${SCRAMBLE_N}</strong>`;
    root.innerHTML = `
      <div class="done-card">
        ${stationBadge("scramble")}
        <h2>Scramble</h2>
        <p class="exam-line">${timedOut
          ? `Time is up after ${used}. ${scoreLine}`
          : `Well done — you have finished the exercise. Time used: <strong>${used}</strong>. ${scoreLine}`}</p>
        <p class="lead">${timedOut
          ? "Unanswered questions do not score. Review the paper below."
          : "Review the paper below. A new scramble mixes a different 10 questions."}</p>
        ${scrambleReviewHtml()}
        <div class="toolbar">
          <button class="btn btn-primary" data-go-home="1">Home</button>
          <button class="btn btn-ghost" data-fresh="scramble">New scramble</button>
        </div>
      </div>
    `;
    root.querySelector("[data-go-home]").addEventListener("click", () => show("home"));
    root.querySelector("[data-fresh]").addEventListener("click", () => show("scramble", true));
    return;
  }
  const q = state.scrambleDeck[state.scrambleI];
  const last = state.scrambleI === state.scrambleDeck.length - 1;
  const locked = Boolean(state.scrambleChecked);
  const flipped = locked && Boolean(state.scramblePick);
  const picked = q.options.find((opt) => opt.label === state.scramblePick);
  const answerOpt = q.options.find((opt) => opt.ok);
  const options = q.options.map((opt, i) => {
    return `<button class="choice" data-label="${opt.label}"><span class="keycap">${i + 1}</span>${scrambleThumb(opt)}<span>${opt.label}</span></button>`;
  }).join("");
  let stage = "";
  if (flipped && picked) {
    const ok = Boolean(picked.ok);
    const trap = ok ? "" : trapHtml(picked.trap || q.trap || "");
    const failLine = !ok && picked.fail ? `<p>${picked.fail}</p>` : "";
    const front = `${scrambleThumb(picked)}<strong>${picked.label}</strong>`;
    const back = `<div class="fb-note">${state.fb ? state.fb.meme : ""}</div><strong>${state.fb ? state.fb.title : ""}</strong><p>${state.fb ? state.fb.body : ""}</p>
      ${failLine}
      <p class="exam-kicker">Model answer</p>
      <p>${answerOpt && answerOpt.why ? answerOpt.why : q.model}</p>
      ${trap}
      ${ok && answerOpt ? diagBlock(answerOpt.diagram || itemSrc(answerOpt.id), q.answer) : ""}`;
    stage = flipPanel(ok, front, back);
  } else {
    stage = `${keyHint(q.options.length)}<div class="choices">${options}</div>`;
  }
  root.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Scramble</h2>
        <p class="lead">Timed test · ${q.source}. The clock counts up. One attempt per question. Press 1–4.</p>
      </div>
      <div class="score-wrap">
        <div id="scramble-clock" class="scramble-clock${state.scrambleElapsed >= SCRAMBLE_SECONDS - 60 ? " is-low" : ""}">${formatClock(state.scrambleElapsed)}</div>
        ${stationBadge("scramble")}
        <div class="score">${state.scrambleScore} / ${SCRAMBLE_N}</div>
      </div>
    </div>
    ${badgePopHtml("scramble")}
    <p class="tiny">${state.scrambleI + 1} / ${SCRAMBLE_N}</p>
    <p class="exam-kicker">Question</p>
    <p class="exam-line">${q.prompt}</p>
    ${q.photo && !flipped ? `${q.caption ? `<p class="caption">${q.caption}</p>` : ""}<div class="photo-frame slim"><img src="${q.photo}" alt="" /></div>` : ""}
    ${stage}
    <div class="toolbar" style="margin-top:16px">
      <div>
        <button class="btn btn-ghost" id="scramble-back" ${state.scrambleI === 0 ? "disabled" : ""}>Back</button>
        <button class="btn btn-primary" id="scramble-next" ${!locked ? "disabled" : ""}>${last ? "Finish" : "Next"}</button>
      </div>
      <button class="btn btn-ghost" id="scramble-reset">New scramble</button>
    </div>
  `;
  if (flipped) armFlip(root);
  root.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (locked || state.scramblePhase === "done") return;
      state.scramblePick = btn.dataset.label;
      const opt = q.options.find((row) => row.label === state.scramblePick);
      const ok = Boolean(opt && opt.ok);
      state.scramblePicks[q.key] = state.scramblePick;
      award(state.scrambleDone, q.key, ok, "scrambleScore");
      setFb(ok ? true : "wrong", "");
      state.scrambleChecked = true;
      renderScramble();
    });
  });
  document.getElementById("scramble-back").addEventListener("click", () => {
    state.scrambleI -= 1;
    const prev = state.scrambleDeck[state.scrambleI];
    state.scramblePick = state.scramblePicks[prev.key] || "";
    state.scrambleChecked = Object.prototype.hasOwnProperty.call(state.scrambleDone, prev.key);
    state.fb = null;
    renderScramble();
  });
  document.getElementById("scramble-next").addEventListener("click", () => {
    if (!last) {
      state.scrambleI += 1;
      const nxt = state.scrambleDeck[state.scrambleI];
      state.scramblePick = state.scramblePicks[nxt.key] || "";
      state.scrambleChecked = Object.prototype.hasOwnProperty.call(state.scrambleDone, nxt.key);
      state.fb = null;
      renderScramble();
    } else {
      finishScramble(false);
    }
  });
  document.getElementById("scramble-reset").addEventListener("click", () => show("scramble", true));
}

loadProgress();
loadTheme();
buildNav();
show("home");

const themeBtn = document.getElementById("theme-toggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    applyTheme(!document.documentElement.classList.contains("dark"));
  });
}

document.addEventListener("keydown", (event) => {
  if (event.target && /^(INPUT|TEXTAREA)$/.test(event.target.tagName)) return;
  const n = Number(event.key);
  if (n < 1 || n > 4) return;
  const active = document.querySelector(".view.active");
  if (!active) return;
  const choices = active.querySelectorAll(".choice");
  if (!choices.length || !choices[n - 1]) return;
  event.preventDefault();
  choices[n - 1].click();
});
