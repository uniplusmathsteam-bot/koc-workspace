(function () {
  const HOWTO_KEY = "dadataogu-howto-v1";
  const FLASH_MS = 180;
  const hubEl = document.getElementById("hub");
  const studyEl = document.getElementById("study");
  const playEl = document.getElementById("play");
  const recapEl = document.getElementById("recap");
  const hudEl = document.getElementById("hud");
  const homeBtn = document.getElementById("btn-home");
  const pauseBtn = document.getElementById("btn-pause");
  const muteBtn = document.getElementById("btn-mute");
  const confettiEl = document.getElementById("confetti");
  const leaveOverlay = document.getElementById("leave-overlay");
  const leaveStay = document.getElementById("leave-stay");
  const leaveHome = document.getElementById("leave-home");
  const pauseOverlay = document.getElementById("pause-overlay");
  const pauseResume = document.getElementById("pause-resume");
  const pauseHome = document.getElementById("pause-home");
  const howtoOverlay = document.getElementById("howto-overlay");
  const howtoList = document.getElementById("howto-list");
  const howtoClose = document.getElementById("howto-close");
  const headerKicker = document.getElementById("header-kicker");
  const headerTitle = document.getElementById("header-title");
  const headerLead = document.getElementById("header-lead");
  const leaveTitle = document.getElementById("leave-title");
  const pauseTitle = document.getElementById("pause-title");
  const howtoTitle = document.getElementById("howto-title");

  const CATS = [];
  TECHNIQUES.forEach(function (tech) {
    if (CATS.indexOf(tech.cat) === -1) CATS.push(tech.cat);
  });

  const DRUM_NAME = { don: COPY.don, ka: COPY.ka, big: COPY.big };
  const NOTE_SPRITES = {};
  let playUi = null;
  let resizeRaf = 0;

  const state = {
    view: "hub",
    mode: null,
    stage: COPY.stageAll,
    cat: COPY.catAll,
    speed: COPY.speedPractice,
    chart: [],
    weak: [],
    timer: null,
    raf: null,
    audio: null,
    playStart: 0,
    pauseAt: 0,
    pauseTotal: 0,
    finished: false,
    combo: 0,
    maxCombo: 0,
    score: 0,
    good: 0,
    ok: 0,
    late: 0,
    wrong: 0,
    miss: 0,
    gauge: 0,
    diff: null,
    lane: null,
    laneCtx: null,
    laneW: 0,
    laneH: 0,
    dpr: 1,
    judgeX: 120,
    lastCount: -1,
    flash: null,
    gogo: false,
    muted: false,
    userPaused: false,
    freeze: false,
    legendHold: false,
    legendTimer: null,
    studyList: [],
    studyIndex: 0,
    pausedDrawn: false,
  };

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function blockingOverlay() {
    return !leaveOverlay.hidden || !pauseOverlay.hidden || !howtoOverlay.hidden;
  }

  function playBlocked() {
    return blockingOverlay() || state.freeze || state.userPaused || document.hidden;
  }

  function roundRunning() {
    return state.view === "play" && state.mode === "taiko" && !state.finished;
  }

  function hideLeaveOverlay() {
    leaveOverlay.hidden = true;
    if (!playBlocked()) endPause();
  }

  function showLeaveOverlay() {
    leaveOverlay.hidden = false;
    if (roundRunning()) beginPause();
  }

  function show(view) {
    if (view !== "play") {
      clearFreeze(true);
      state.userPaused = false;
      pauseOverlay.hidden = true;
      hideLeaveOverlay();
    }
    state.view = view;
    hubEl.classList.toggle("active", view === "hub");
    studyEl.classList.toggle("active", view === "study");
    playEl.classList.toggle("active", view === "play");
    recapEl.classList.toggle("active", view === "recap");
    hudEl.hidden = view !== "play";
    homeBtn.hidden = view === "hub";
    pauseBtn.hidden = view !== "play";
    muteBtn.hidden = view !== "play";
    updateMuteBtn();
    updatePauseBtn();
  }

  function applyHeader() {
    if (headerKicker) headerKicker.textContent = COPY.kicker;
    if (headerTitle) headerTitle.textContent = COPY.title;
    if (headerLead) headerLead.textContent = COPY.lead;
    if (leaveTitle) leaveTitle.textContent = COPY.leaveTitle;
    if (leaveStay) leaveStay.textContent = COPY.leaveStay;
    if (leaveHome) leaveHome.textContent = COPY.leaveHome;
    if (pauseTitle) pauseTitle.textContent = COPY.pausedTitle;
    if (pauseResume) pauseResume.textContent = COPY.resume;
    if (pauseHome) pauseHome.textContent = COPY.home;
    if (howtoTitle) howtoTitle.textContent = COPY.howtoTitle;
    if (howtoClose) howtoClose.textContent = COPY.howtoClose;
  }

  function judgedCount() {
    return state.good + state.ok + state.late + state.wrong + state.miss;
  }

  function conceptCount() {
    return state.good + state.ok + state.late;
  }

  function updateHud() {
    if (state.view !== "play" || !state.chart.length) {
      hudEl.hidden = true;
      hudEl.innerHTML = "";
      return;
    }
    hudEl.hidden = false;
    const done = judgedCount();
    hudEl.innerHTML =
      `<span>${COPY.score} ${state.score}</span>` +
      `<span>${COPY.combo} ${state.combo}</span>` +
      `<span>${COPY.good} ${state.good}</span>` +
      `<span>${COPY.ok} ${state.ok}</span>` +
      `<span>${COPY.round}${Math.min(done + 1, state.chart.length)}${COPY.of}${state.chart.length}</span>`;
  }

  function updateMuteBtn() {
    if (!muteBtn) return;
    muteBtn.textContent = state.muted ? COPY.unmute : COPY.mute;
  }

  function updatePauseBtn() {
    if (!pauseBtn) return;
    pauseBtn.textContent = state.userPaused ? COPY.resume : COPY.pause;
    pauseBtn.disabled = state.freeze;
  }

  function chipButtons(values, attr, current) {
    return values
      .map(function (value) {
        const on = value === current ? " active" : "";
        return `<button type="button" class="chip${on}" ${attr}="${value}">${value}</button>`;
      })
      .join("");
  }

  function renderHub() {
    const n = poolForRound(false).length;
    const empty = n === 0;
    const stageChips = chipButtons(
      [COPY.stageAll, COPY.stagePrimary, COPY.stageSecondary],
      "data-stage",
      state.stage
    );
    const catChips = chipButtons([COPY.catAll].concat(CATS), "data-cat", state.cat);
    const speedChips = chipButtons(
      [COPY.speedPractice, COPY.speedStandard, COPY.speedExpert],
      "data-speed",
      state.speed
    );
    const emptyMsg = empty ? `<p class="empty-pool">${COPY.emptyPool}</p>` : "";
    hubEl.innerHTML = `
      <p class="track">${COPY.trackLearn}</p>
      <p class="pick-cat">${COPY.pickHint}</p>
      <p class="chip-label">${COPY.pickStage}</p>
      <div class="chip-row">${stageChips}</div>
      <p class="chip-label">${COPY.pickCat}</p>
      <div class="chip-row">${catChips}</div>
      <p class="chip-label">${COPY.pickSpeed}</p>
      <div class="chip-row">${speedChips}</div>
      <p class="pool-count">${COPY.poolCount} ${n} ${COPY.poolUnit}</p>
      ${emptyMsg}
      <div class="cards cards-one">
        <button type="button" class="mode-card" data-start="taiko"${empty ? " disabled" : ""}>
          <div class="icon">🥁</div>
          <h2>${COPY.taikoName}</h2>
          <p>${COPY.taikoLead}</p>
        </button>
      </div>
      <div class="hub-actions">
        <button type="button" class="btn" data-study="1"${empty ? " disabled" : ""}>${COPY.study}</button>
        <button type="button" class="btn btn-ghost" data-howto="1">${COPY.howto}</button>
      </div>
    `;
  }

  function collectDecoys(tech, correct) {
    const out = [];
    tech.decoys.forEach(function (text) {
      if (text !== correct && tech.hits.indexOf(text) === -1 && out.indexOf(text) === -1) {
        out.push(text);
      }
    });
    TECHNIQUES.forEach(function (other) {
      if (out.length >= 2) return;
      if (other.id === tech.id) return;
      other.hits.forEach(function (text) {
        if (out.length >= 2) return;
        if (text !== correct && tech.hits.indexOf(text) === -1 && out.indexOf(text) === -1) {
          out.push(text);
        }
      });
    });
    return out.slice(0, 2);
  }

  function makeTaikoDeck(pool) {
    const size = Math.min(12, pool.length);
    return shuffle(pool).slice(0, size).map(function (tech) {
      const correct = tech.hits[Math.floor(Math.random() * tech.hits.length)];
      const decoys = collectDecoys(tech, correct);
      const options = shuffle(
        [{ text: correct, ok: true }].concat(
          decoys.map(function (text) {
            return { text: text, ok: tech.hits.indexOf(text) !== -1 };
          })
        )
      );
      return {
        id: tech.id,
        cat: tech.cat,
        name: tech.name,
        example: tech.example,
        hits: tech.hits.slice(),
        correct: correct,
        options: options,
        missed: [],
      };
    });
  }

  function matchesStage(tech) {
    if (state.stage === COPY.stageAll) return true;
    if (state.stage === COPY.stagePrimary) {
      return tech.stage === "primary" || tech.stage === "both";
    }
    return tech.stage === "secondary" || tech.stage === "both";
  }

  function poolForRound(weakOnly) {
    if (weakOnly) {
      const names = state.weak.map(function (w) {
        return w.name;
      });
      return TECHNIQUES.filter(function (tech) {
        return names.indexOf(tech.name) !== -1;
      });
    }
    return TECHNIQUES.filter(function (tech) {
      if (!matchesStage(tech)) return false;
      if (state.cat !== COPY.catAll && tech.cat !== state.cat) return false;
      return true;
    });
  }

  function difficultyFor() {
    if (state.speed === COPY.speedPractice) {
      return { bpm: 28, scrollMs: 5500, good: 200, ok: 400, miss: 600, drain: 0.25 };
    }
    if (state.speed === COPY.speedExpert) {
      return { bpm: 52, scrollMs: 3200, good: 80, ok: 160, miss: 240, drain: 1.25 };
    }
    return { bpm: 42, scrollMs: 4000, good: 120, ok: 250, miss: 380, drain: 1 };
  }

  function showPracticeExample() {
    return state.speed === COPY.speedPractice;
  }

  function makeChart(deck) {
    const diff = state.diff;
    const beat = 60000 / diff.bpm;
    const startAt = beat * 4;
    return deck.map(function (item, i) {
      const types = shuffle(["don", "ka", "big"]);
      const labels = {};
      item.options.forEach(function (opt, idx) {
        labels[types[idx]] = opt;
      });
      let correctType = types[0];
      item.options.forEach(function (opt, idx) {
        if (opt.ok) correctType = types[idx];
      });
      return {
        item: item,
        time: startAt + i * beat * 4,
        correctType: correctType,
        labels: labels,
        judged: false,
        judge: null,
        hitType: null,
      };
    });
  }

  function stopLoop() {
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = null;
    }
    clearTimeout(state.timer);
    state.timer = null;
    clearTimeout(state.legendTimer);
    state.legendTimer = null;
  }

  function startTaiko(weakOnly) {
    const pool = poolForRound(weakOnly);
    if (!pool.length) {
      renderHub();
      show("hub");
      return;
    }
    audioCtx();
    resetRound("taiko", makeTaikoDeck(pool));
    renderPlay();
  }

  function resetRound(mode, deck) {
    stopLoop();
    state.mode = mode;
    state.diff = difficultyFor();
    state.chart = makeChart(deck);
    state.weak = [];
    state.finished = false;
    state.combo = 0;
    state.maxCombo = 0;
    state.score = 0;
    state.good = 0;
    state.ok = 0;
    state.late = 0;
    state.wrong = 0;
    state.miss = 0;
    state.gauge = 0;
    state.pauseAt = 0;
    state.pauseTotal = 0;
    state.lastCount = -1;
    state.flash = null;
    state.gogo = false;
    state.userPaused = false;
    state.freeze = false;
    state.legendHold = false;
    state.pausedDrawn = false;
    hideLeaveOverlay();
    pauseOverlay.hidden = true;
    show("play");
  }

  function audioCtx() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!state.audio) state.audio = new AC();
    if (state.audio.state === "suspended") state.audio.resume();
    return state.audio;
  }

  function playTone(freq, dur, type, vol) {
    if (state.muted) return;
    const ac = audioCtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    try {
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    } catch (err) {
      gain.gain.setValueAtTime(0, ac.currentTime + dur);
    }
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  function playHit(type) {
    if (type === "ka") {
      playTone(720, 0.07, "triangle", 0.12);
      playTone(980, 0.04, "square", 0.04);
    } else {
      playTone(160, 0.12, "sine", 0.16);
      playTone(90, 0.1, "sine", 0.08);
    }
  }

  function playCount(finalBeat) {
    if (finalBeat) playHit("don");
    else playTone(880, 0.05, "square", 0.06);
  }

  function gameNow() {
    const t = performance.now();
    if (state.pauseAt) return state.pauseAt - state.playStart - state.pauseTotal;
    return t - state.playStart - state.pauseTotal;
  }

  function beginPause() {
    if (!state.pauseAt) state.pauseAt = performance.now();
  }

  function endPause() {
    if (state.pauseAt) {
      state.pauseTotal += performance.now() - state.pauseAt;
      state.pauseAt = 0;
    }
  }

  function nextNote() {
    for (let i = 0; i < state.chart.length; i++) {
      if (!state.chart[i].judged) return state.chart[i];
    }
    return state.chart[state.chart.length - 1] || null;
  }

  function gogoIndex() {
    return Math.floor(state.chart.length * 0.75);
  }

  function cachePlayUi() {
    playUi = {
      stage: document.getElementById("taiko-stage"),
      gogoFlag: document.getElementById("gogo-flag"),
      judgeFx: document.getElementById("judge-fx"),
      countFx: document.getElementById("count-fx"),
      comboStack: document.getElementById("combo-stack"),
      comboCount: document.getElementById("combo-count"),
      soulFill: document.getElementById("soul-fill"),
      soulGauge: document.getElementById("soul-gauge"),
      soulLabel: document.getElementById("soul-label"),
      nowName: document.getElementById("now-name"),
      nowCat: document.getElementById("now-cat"),
      nowExample: document.getElementById("now-example"),
      teachBanner: document.getElementById("teach-banner"),
      teachKind: document.getElementById("teach-kind"),
      teachCorrect: document.getElementById("teach-correct"),
      teachEx: document.getElementById("teach-ex"),
      teachContinue: document.getElementById("teach-continue"),
      pads: {
        don: playEl.querySelector('[data-hit="don"]'),
        ka: playEl.querySelector('[data-hit="ka"]'),
        big: playEl.querySelector('[data-hit="big"]'),
      },
      padAns: {
        don: document.getElementById("pad-don"),
        ka: document.getElementById("pad-ka"),
        big: document.getElementById("pad-big"),
      },
    };
  }

  function renderPlay() {
    playEl.innerHTML = `
      <div class="stage taiko-stage" id="taiko-stage">
        <div class="soul-row">
          <div class="soul-gauge" id="soul-gauge">
            <div class="soul-bar">
              <div class="soul-fill" id="soul-fill"></div>
              <div class="soul-clear" title="${COPY.clearMark}"></div>
            </div>
            <span class="soul-label" id="soul-label">${COPY.soul}</span>
          </div>
          <span class="gogo-flag" id="gogo-flag" hidden>GOGO!!</span>
        </div>
        <div class="now-playing">
          <span class="cat-pill" id="now-cat"></span>
          <strong id="now-name"></strong>
        </div>
        <p class="now-example" id="now-example" hidden></p>
        <div class="lane-wrap">
          <div class="combo-stack idle" id="combo-stack">
            <span id="combo-count">0</span>
            <small>${COPY.combo}</small>
          </div>
          <div class="judge-fx" id="judge-fx"></div>
          <div class="count-fx" id="count-fx"></div>
          <canvas id="taiko-lane"></canvas>
        </div>
        <div class="taiko-pad-wrap">
          <button type="button" class="hit-pad don" data-hit="don" tabindex="-1" aria-label="1 ${COPY.don}">
            <span class="pad-num">1</span>
            <span class="pad-kind">${COPY.don}</span>
            <span class="pad-ans" id="pad-don"></span>
          </button>
          <button type="button" class="hit-pad ka" data-hit="ka" tabindex="-1" aria-label="2 ${COPY.ka}">
            <span class="pad-num">2</span>
            <span class="pad-kind">${COPY.ka}</span>
            <span class="pad-ans" id="pad-ka"></span>
          </button>
          <button type="button" class="hit-pad big" data-hit="big" tabindex="-1" aria-label="3 ${COPY.big}">
            <span class="pad-num">3</span>
            <span class="pad-kind">${COPY.big}</span>
            <span class="pad-ans" id="pad-big"></span>
          </button>
        </div>
        <p class="key-hint">${COPY.keys}</p>
        <div class="teach-banner" id="teach-banner" hidden>
          <p class="teach-kind" id="teach-kind"></p>
          <p class="teach-correct" id="teach-correct"></p>
          <p class="teach-ex" id="teach-ex"></p>
          <button type="button" class="btn" id="teach-continue">${COPY.continue}</button>
        </div>
      </div>
    `;
    state.lane = document.getElementById("taiko-lane");
    cachePlayUi();
    ensureNoteSprites();
    resizeLane();
    bindPads();
    const cont = document.getElementById("teach-continue");
    if (cont) {
      cont.addEventListener("click", function () {
        endFreeze();
      });
    }
    updateLegend();
    updateSoul();
    updateHud();
    updateComboDom();
    state.playStart = performance.now();
    state.raf = requestAnimationFrame(loop);
  }

  function bindPads() {
    playEl.querySelectorAll("[data-hit]").forEach(function (el) {
      let fromPointer = false;
      el.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        fromPointer = true;
        hit(el.getAttribute("data-hit"));
      });
      el.addEventListener("click", function (e) {
        e.preventDefault();
        if (fromPointer) {
          fromPointer = false;
          return;
        }
        hit(el.getAttribute("data-hit"));
      });
    });
  }

  function resizeLane() {
    const canvas = state.lane;
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const w = Math.max(280, wrap.clientWidth);
    const h = 148;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    state.laneW = w;
    state.laneH = h;
    state.dpr = dpr;
    state.judgeX = Math.max(96, Math.min(128, w * 0.2));
    state.laneCtx = canvas.getContext("2d");
    if (playUi && playUi.judgeFx) playUi.judgeFx.style.left = state.judgeX + "px";
    state.pausedDrawn = false;
  }

  function flashPad(type) {
    const el = playUi && playUi.pads ? playUi.pads[type] : null;
    if (!el) return;
    if (el._flashTimer) clearTimeout(el._flashTimer);
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
    function done() {
      el.classList.remove("flash");
      el.removeEventListener("animationend", done);
      if (el._flashTimer) {
        clearTimeout(el._flashTimer);
        el._flashTimer = null;
      }
    }
    el.addEventListener("animationend", done);
    el._flashTimer = setTimeout(done, 140);
  }

  function showJudgeFx(text, kind) {
    const el = playUi && playUi.judgeFx;
    if (!el) return;
    el.textContent = text;
    el.className = "judge-fx";
    void el.offsetWidth;
    el.className = "judge-fx " + kind + " pop";
  }

  function optionIsCorrect(note, type) {
    const opt = note.labels[type];
    if (!opt) return false;
    if (opt.ok) return true;
    if (note.item.hits && note.item.hits.indexOf(opt.text) !== -1) return true;
    return false;
  }

  function hit(type) {
    if (state.view !== "play" || state.mode !== "taiko" || state.finished) return;
    if (playBlocked()) return;
    const now = gameNow();
    playHit(type);
    flashPad(type);
    let best = null;
    let bestAbs = Infinity;
    state.chart.forEach(function (note) {
      if (note.judged) return;
      const abs = Math.abs(note.time - now);
      if (abs <= state.diff.miss && abs < bestAbs) {
        best = note;
        bestAbs = abs;
      }
    });
    if (!best) {
      showJudgeFx(COPY.ghost, "ghost");
      return;
    }
    const dt = Math.abs(best.time - now);
    let result = "wrong";
    if (!optionIsCorrect(best, type)) result = "wrong";
    else if (dt <= state.diff.good) result = "good";
    else if (dt <= state.diff.ok) result = "ok";
    else result = "late";
    applyJudge(best, result, type);
  }

  function markWeak(note, picked) {
    note.item.missed.push(picked);
    if (
      !state.weak.filter(function (w) {
        return w.name === note.item.name;
      }).length
    ) {
      state.weak.push(note.item);
    }
  }

  function applyJudge(note, result, hitType) {
    if (note.judged) return;
    note.judged = true;
    note.judge = result;
    note.hitType = hitType;
    const n = state.chart.length || 1;
    const goodPts = Math.floor(1000000 / n);
    const goodFill = 100 / n;
    if (result === "good") {
      state.good += 1;
      state.combo += 1;
      state.score += goodPts;
      state.gauge = Math.min(100, state.gauge + goodFill);
      showJudgeFx(COPY.good, "good");
      holdLegend(500);
    } else if (result === "ok") {
      state.ok += 1;
      state.combo += 1;
      state.score += Math.floor(goodPts / 2);
      state.gauge = Math.min(100, state.gauge + goodFill / 2);
      showJudgeFx(COPY.ok, "ok");
      holdLegend(500);
    } else if (result === "late") {
      state.late += 1;
      state.combo = 0;
      state.score += Math.floor(goodPts / 4);
      state.gauge = Math.max(0, state.gauge - goodFill * state.diff.drain * 0.35);
      showJudgeFx(COPY.late, "late");
      holdLegend(500);
    } else if (result === "wrong") {
      state.wrong += 1;
      state.combo = 0;
      state.gauge = Math.max(0, state.gauge - goodFill * state.diff.drain);
      showJudgeFx(COPY.wrong, "wrong");
      let picked = COPY.wrong;
      if (hitType && note.labels[hitType]) picked = note.labels[hitType].text;
      markWeak(note, picked);
      startFreeze(note, COPY.wrong);
    } else {
      state.miss += 1;
      state.combo = 0;
      state.gauge = Math.max(0, state.gauge - goodFill * state.diff.drain);
      showJudgeFx(COPY.missedNote, "miss");
      markWeak(note, COPY.missedNote);
      startFreeze(note, COPY.missedNote);
    }
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    state.flash = { at: performance.now(), kind: result };
    state.pausedDrawn = false;
    updateSoul();
    updateHud();
    updateComboDom();
  }

  function holdLegend(ms) {
    state.legendHold = true;
    clearTimeout(state.legendTimer);
    state.legendTimer = setTimeout(function () {
      state.legendHold = false;
      state.legendTimer = null;
      updateLegend();
    }, ms);
  }

  function startFreeze(note, kindLabel) {
    state.freeze = true;
    state.legendHold = true;
    state.pausedDrawn = false;
    beginPause();
    updatePauseBtn();
    const banner = playUi && playUi.teachBanner;
    if (banner) banner.hidden = false;
    if (playUi && playUi.teachKind) playUi.teachKind.textContent = kindLabel;
    const drum = DRUM_NAME[note.correctType] || "";
    const ans = note.labels[note.correctType] ? note.labels[note.correctType].text : note.item.correct;
    if (playUi && playUi.teachCorrect) {
      playUi.teachCorrect.textContent = COPY.correct + "：" + drum + "＝" + ans;
    }
    if (playUi && playUi.teachEx) {
      playUi.teachEx.textContent = note.item.example ? COPY.example + "：" + note.item.example : "";
    }
    ["don", "ka", "big"].forEach(function (type) {
      const el = playUi && playUi.pads ? playUi.pads[type] : null;
      if (el) el.classList.toggle("correct-glow", type === note.correctType);
    });
    if (playUi && playUi.teachContinue) playUi.teachContinue.focus();
  }

  function clearFreeze(silent) {
    const was = state.freeze;
    state.freeze = false;
    if (playUi && playUi.teachBanner) playUi.teachBanner.hidden = true;
    ["don", "ka", "big"].forEach(function (type) {
      const el = playUi && playUi.pads ? playUi.pads[type] : null;
      if (el) el.classList.remove("correct-glow");
    });
    if (was && !silent) {
      state.legendHold = false;
      updateLegend();
      if (!state.userPaused && leaveOverlay.hidden && pauseOverlay.hidden && !document.hidden) {
        endPause();
      }
    } else if (silent) {
      state.legendHold = false;
    }
    state.pausedDrawn = false;
    updatePauseBtn();
  }

  function endFreeze() {
    if (!state.freeze) return;
    clearFreeze(false);
  }

  function missPassed(now) {
    if (playBlocked()) return;
    state.chart.forEach(function (note) {
      if (note.judged) return;
      if (now - note.time > state.diff.miss) applyJudge(note, "miss", null);
    });
  }

  function updateLegend() {
    if (state.legendHold || state.freeze) return;
    const note = nextNote();
    if (!note || !playUi || !playUi.nowName) return;
    playUi.nowName.textContent = note.item.name;
    playUi.nowCat.textContent = note.item.cat;
    setPadLabel("don", note.labels.don);
    setPadLabel("ka", note.labels.ka);
    setPadLabel("big", note.labels.big);
    const ex = playUi.nowExample;
    if (ex) {
      if (showPracticeExample() && note.item.example) {
        ex.hidden = false;
        ex.textContent = "";
        const lab = document.createElement("span");
        lab.textContent = COPY.example;
        ex.appendChild(lab);
        ex.appendChild(document.createTextNode(note.item.example));
      } else {
        ex.hidden = true;
        ex.textContent = "";
      }
    }
  }

  function setPadLabel(type, opt) {
    const text = opt ? opt.text : "";
    const ans = playUi && playUi.padAns ? playUi.padAns[type] : null;
    if (ans) ans.textContent = text;
    const pad = playUi && playUi.pads ? playUi.pads[type] : null;
    if (pad) pad.setAttribute("aria-label", DRUM_NAME[type] + " " + text);
  }

  function updateSoul() {
    if (!playUi || !playUi.soulFill) return;
    playUi.soulFill.style.width = state.gauge + "%";
    playUi.soulGauge.classList.toggle("reached", state.gauge >= 80);
    playUi.soulGauge.classList.toggle("soul-max", state.gauge >= 99.5);
    if (playUi.soulLabel) playUi.soulLabel.textContent = COPY.soul;
  }

  function updateComboDom() {
    if (!playUi || !playUi.comboCount) return;
    playUi.comboCount.textContent = String(state.combo);
    playUi.comboStack.classList.toggle("idle", state.combo <= 0);
    playUi.comboStack.classList.toggle("hot", state.combo >= 10);
    playUi.comboStack.classList.toggle("gold", state.combo >= 50);
  }

  function updateGogo(now) {
    const idx = gogoIndex();
    const note = state.chart[idx];
    const on = !!(note && now >= note.time - 400);
    if (on === state.gogo) return;
    state.gogo = on;
    if (playUi && playUi.stage) playUi.stage.classList.toggle("gogo", on);
    if (playUi && playUi.gogoFlag) playUi.gogoFlag.hidden = !on;
  }

  function updateCountFx(now) {
    const el = playUi && playUi.countFx;
    if (!el) return;
    const beat = 60000 / state.diff.bpm;
    if (now >= beat * 4) {
      if (state.lastCount !== -2) {
        el.textContent = "";
        el.className = "count-fx";
        state.lastCount = -2;
      }
      return;
    }
    const i = Math.max(0, Math.min(3, Math.floor(now / beat)));
    if (i === state.lastCount) return;
    state.lastCount = i;
    const labels = ["3", "2", "1", COPY.go];
    el.textContent = labels[i];
    el.className = "count-fx";
    void el.offsetWidth;
    el.className = "count-fx show";
    playCount(i === 3);
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function drawNoteFace(c, x, y, r, fill, rim, alpha) {
    c.save();
    c.globalAlpha = alpha;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = fill;
    c.fill();
    c.lineWidth = Math.max(4, r * 0.14);
    c.strokeStyle = rim;
    c.stroke();
    c.fillStyle = "#3a2010";
    c.beginPath();
    c.arc(x - r * 0.28, y - r * 0.12, r * 0.1, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(x + r * 0.28, y - r * 0.12, r * 0.1, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.strokeStyle = "#3a2010";
    c.lineWidth = 2;
    c.arc(x, y + r * 0.12, r * 0.28, 0.15 * Math.PI, 0.85 * Math.PI);
    c.stroke();
    c.restore();
  }

  function makeFaceSprite(r, fill, rim) {
    const pad = Math.ceil(r * 0.22) + 6;
    const dpr = 2;
    const size = (r + pad) * 2;
    const cv = document.createElement("canvas");
    cv.width = Math.ceil(size * dpr);
    cv.height = Math.ceil(size * dpr);
    const c = cv.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawNoteFace(c, r + pad, r + pad, r, fill, rim, 1);
    return { canvas: cv, size: size };
  }

  function ensureNoteSprites() {
    if (NOTE_SPRITES.cream) return;
    NOTE_SPRITES.cream = makeFaceSprite(28, "#fff4d6", "#c4a15a");
    NOTE_SPRITES.don = makeFaceSprite(28, "#e4453a", "#8e1010");
    NOTE_SPRITES.ka = makeFaceSprite(28, "#5eb6e6", "#1d6fa3");
    NOTE_SPRITES.big = makeFaceSprite(36, "#f5c542", "#c48a12");
  }

  function blitNote(c, sprite, x, y, alpha) {
    const dest = sprite.size;
    c.save();
    c.globalAlpha = alpha;
    c.drawImage(sprite.canvas, x - dest / 2, y - dest / 2, dest, dest);
    c.restore();
  }

  function noteSprite(note) {
    if (!note.judged) return { sprite: NOTE_SPRITES.cream, alpha: 1 };
    const fail = note.judge === "wrong" || note.judge === "miss";
    const alpha = fail ? 0.4 : 1;
    if (note.correctType === "ka") return { sprite: NOTE_SPRITES.ka, alpha: alpha };
    if (note.correctType === "big") return { sprite: NOTE_SPRITES.big, alpha: alpha };
    return { sprite: NOTE_SPRITES.don, alpha: alpha };
  }

  function flashActive() {
    return !!(state.flash && performance.now() - state.flash.at < FLASH_MS);
  }

  function drawLane(now) {
    const c = state.laneCtx;
    if (!c || !state.lane) return;
    ensureNoteSprites();
    const dpr = state.dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = state.laneW;
    const h = state.laneH;
    c.clearRect(0, 0, w, h);

    const trackY = 42;
    const trackH = 66;
    c.save();
    roundRect(c, 8, trackY, w - 16, trackH, 18);
    c.fillStyle = state.gogo
      ? "rgba(120, 36, 48, 0.95)"
      : "rgba(22, 12, 28, 0.92)";
    c.fill();
    if (state.gogo) {
      c.fillStyle = "rgba(255, 120, 70, 0.12)";
      c.fill();
    }
    c.restore();

    const jx = state.judgeX;
    const jy = trackY + trackH / 2;

    c.beginPath();
    c.arc(jx, jy, 34, 0, Math.PI * 2);
    c.strokeStyle = "rgba(245, 197, 66, 0.35)";
    c.lineWidth = 8;
    c.stroke();
    c.beginPath();
    c.arc(jx, jy, 26, 0, Math.PI * 2);
    c.strokeStyle = "#f5c542";
    c.lineWidth = 3;
    c.stroke();

    if (flashActive()) {
      const t = (performance.now() - state.flash.at) / FLASH_MS;
      let col = "rgba(160, 170, 190, " + (1 - t) + ")";
      if (state.flash.kind === "good") col = "rgba(255, 160, 40, " + (1 - t) + ")";
      else if (state.flash.kind === "ok") col = "rgba(255, 255, 255, " + (1 - t) + ")";
      else if (state.flash.kind === "late") col = "rgba(255, 210, 122, " + (1 - t) + ")";
      else if (state.flash.kind === "wrong") col = "rgba(255, 120, 100, " + (1 - t) + ")";
      c.beginPath();
      c.arc(jx, jy, 28 + t * 22, 0, Math.PI * 2);
      c.strokeStyle = col;
      c.lineWidth = 6;
      c.stroke();
    }

    for (let i = state.chart.length - 1; i >= 0; i--) {
      const note = state.chart[i];
      const x = jx + ((note.time - now) / state.diff.scrollMs) * (w - jx - 28);
      if (x < -48 || x > w + 48) continue;
      const look = noteSprite(note);
      blitNote(c, look.sprite, x, jy, look.alpha);
      if (note.judged && (note.judge === "wrong" || note.judge === "miss")) {
        c.save();
        c.globalAlpha = 0.8;
        c.strokeStyle = "#d92d20";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(x - 10, jy - 10);
        c.lineTo(x + 10, jy + 10);
        c.moveTo(x + 10, jy - 10);
        c.lineTo(x - 10, jy + 10);
        c.stroke();
        c.restore();
      }
    }
  }

  function loop() {
    if (state.view !== "play" || state.mode !== "taiko" || state.finished) {
      state.raf = null;
      return;
    }
    state.raf = requestAnimationFrame(loop);
    if (playBlocked()) {
      beginPause();
      if (flashActive() || !state.pausedDrawn) {
        drawLane(gameNow());
        state.pausedDrawn = !flashActive();
      }
      return;
    }
    state.pausedDrawn = false;
    endPause();
    const now = gameNow();
    missPassed(now);
    updateGogo(now);
    updateCountFx(now);
    drawLane(now);
    maybeFinish(now);
  }

  function maybeFinish(now) {
    if (state.finished || !state.chart.length || state.freeze) return;
    const last = state.chart[state.chart.length - 1];
    const allDone = state.chart.every(function (n) {
      return n.judged;
    });
    if (allDone && now > last.time + 700) {
      state.finished = true;
      stopLoop();
      state.timer = setTimeout(renderRecap, 380);
    }
  }

  function burstConfetti() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    confettiEl.width = Math.floor(w * dpr);
    confettiEl.height = Math.floor(h * dpr);
    confettiEl.style.width = w + "px";
    confettiEl.style.height = h + "px";
    const c = confettiEl.getContext("2d");
    const bits = [];
    for (let i = 0; i < 80; i++) {
      bits.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 80,
        r: 3 + Math.random() * 4,
        vy: 180 + Math.random() * 240,
        vx: -120 + Math.random() * 240,
        color: ["#c81e1e", "#f5c542", "#178a57", "#fff"][i % 4],
      });
    }
    const start = performance.now();
    const dur = 1200;
    function tick(now) {
      const t = (now - start) / 1000;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      bits.forEach(function (b) {
        const x = b.x + b.vx * t;
        const y = b.y + b.vy * t;
        c.fillStyle = b.color;
        c.fillRect(x, y, b.r, b.r * 1.4);
      });
      if (now - start < dur) requestAnimationFrame(tick);
      else {
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, w, h);
      }
    }
    requestAnimationFrame(tick);
  }

  function resultCrown() {
    if (
      state.wrong === 0 &&
      state.miss === 0 &&
      state.late === 0 &&
      state.ok === 0 &&
      state.good > 0
    ) {
      return { id: "dfc", label: COPY.dondaful, cls: "crown-dfc" };
    }
    if (state.wrong === 0 && state.miss === 0 && state.late === 0 && state.good + state.ok > 0) {
      return { id: "fc", label: COPY.fullCombo, cls: "crown-fc" };
    }
    if (state.gauge >= 80) {
      return { id: "clear", label: COPY.cleared, cls: "crown-clear" };
    }
    return { id: "fail", label: COPY.failed, cls: "crown-fail" };
  }

  function renderRecap() {
    show("recap");
    hudEl.hidden = true;
    playUi = null;
    const crown = resultCrown();
    const total = state.chart.length || 1;
    const weak = state.weak.length
      ? `<p>${COPY.keep}</p><ul class="weak-list">${state.weak
          .map(function (w) {
            const picked = w.missed.length
              ? `<div class="picked">${COPY.youPicked}：${w.missed.join("、")}</div>`
              : "";
            const ex = w.example
              ? `<div class="picked">${COPY.example}：${w.example}</div>`
              : "";
            return `<li class="recap-pair"><div class="pair">${w.name} → ${w.correct}</div>${picked}${ex}</li>`;
          })
          .join("")}</ul>`
      : `<p>${COPY.clean}。</p>`;
    const retry = state.weak.length
      ? `<button type="button" class="btn" data-retry-weak="1">${COPY.retryWeak}</button>`
      : "";
    recapEl.innerHTML = `
      <div class="recap-card">
        <div class="crown ${crown.cls}">${crown.label}</div>
        <h2>${COPY.recapTitle}</h2>
        <div class="result-score">
          <span>${COPY.score}</span>
          <b>${state.score}</b>
        </div>
        <p class="concept-line">${COPY.concept} ${conceptCount()}${COPY.of}${total}</p>
        <div class="score-row">
          <div><span>${COPY.good}</span><b>${state.good}</b></div>
          <div><span>${COPY.ok}</span><b>${state.ok}</b></div>
          <div><span>${COPY.late}</span><b>${state.late}</b></div>
        </div>
        <div class="score-row">
          <div><span>${COPY.wrong}</span><b>${state.wrong}</b></div>
          <div><span>${COPY.missedNote}</span><b>${state.miss}</b></div>
        </div>
        <div class="score-row">
          <div><span>${COPY.maxCombo}</span><b>${state.maxCombo}</b></div>
          <div><span>${COPY.gauge}</span><b>${Math.round(state.gauge)}%</b></div>
        </div>
        ${weak}
        <div class="recap-actions">
          <button type="button" class="btn" data-replay="taiko">${COPY.again}</button>
          ${retry}
          <button type="button" class="btn btn-ghost" data-home="1">${COPY.home}</button>
        </div>
      </div>
    `;
    if (crown.id === "dfc" || crown.id === "fc") burstConfetti();
  }

  function renderStudy() {
    const pool = state.studyList;
    if (!pool.length) {
      goHome();
      return;
    }
    if (state.studyIndex < 0) state.studyIndex = 0;
    if (state.studyIndex >= pool.length) state.studyIndex = pool.length - 1;
    const tech = pool[state.studyIndex];
    const n = state.studyIndex + 1;
    show("study");
    studyEl.innerHTML = `
      <div class="study-card">
        <p class="track">${COPY.studyTitle}</p>
        <p class="study-meta">${COPY.studyLead} ${n}${COPY.of}${pool.length}</p>
        <span class="cat-pill">${tech.cat}</span>
        <h2>${tech.name}</h2>
        <p class="study-hits">${COPY.hitsLabel}：${tech.hits.join("、")}</p>
        <p class="example"><span>${COPY.example}</span>${tech.example || ""}</p>
        <div class="study-actions">
          <button type="button" class="btn btn-ghost" data-study-prev="1">${COPY.prev}</button>
          <button type="button" class="btn btn-ghost" data-study-next="1">${COPY.next}</button>
          <button type="button" class="btn" data-start="taiko">${COPY.start}</button>
        </div>
      </div>
    `;
  }

  function openStudy() {
    const pool = poolForRound(false);
    if (!pool.length) {
      renderHub();
      show("hub");
      return;
    }
    state.studyList = pool.slice();
    state.studyIndex = 0;
    renderStudy();
  }

  function fillHowto() {
    howtoList.innerHTML =
      `<li>${COPY.howto1}</li>` +
      `<li>${COPY.howto2}</li>` +
      `<li>${COPY.howto3}</li>` +
      `<li>${COPY.howto4}</li>` +
      `<li>${COPY.howto5}</li>`;
  }

  function showHowto() {
    fillHowto();
    howtoOverlay.hidden = false;
  }

  function hideHowto(save) {
    howtoOverlay.hidden = true;
    if (save) {
      try {
        localStorage.setItem(HOWTO_KEY, "1");
      } catch (err) {}
    }
  }

  function maybeShowHowto() {
    try {
      if (localStorage.getItem(HOWTO_KEY)) return;
    } catch (err) {
      return;
    }
    showHowto();
  }

  function pausePlay() {
    if (state.view !== "play" || state.finished || state.freeze) return;
    state.userPaused = true;
    state.pausedDrawn = false;
    pauseOverlay.hidden = false;
    beginPause();
    updatePauseBtn();
  }

  function resumePlay() {
    pauseOverlay.hidden = true;
    state.userPaused = false;
    state.pausedDrawn = false;
    if (!state.freeze && leaveOverlay.hidden && !document.hidden) endPause();
    updatePauseBtn();
  }

  function togglePause() {
    if (state.view !== "play" || state.finished) return;
    if (state.freeze) return;
    if (state.userPaused) resumePlay();
    else pausePlay();
  }

  function toggleMute() {
    state.muted = !state.muted;
    updateMuteBtn();
  }

  function requestLeave() {
    if (state.view !== "play") {
      goHome();
      return;
    }
    if (state.finished) {
      goHome();
      return;
    }
    showLeaveOverlay();
  }

  function goHome() {
    stopLoop();
    clearFreeze(true);
    state.userPaused = false;
    pauseOverlay.hidden = true;
    hideLeaveOverlay();
    state.mode = null;
    state.chart = [];
    state.finished = true;
    state.studyList = [];
    playUi = null;
    show("hub");
    renderHub();
    updateHud();
  }

  hubEl.addEventListener("click", function (e) {
    const stageChip = e.target.closest("[data-stage]");
    if (stageChip) {
      state.stage = stageChip.getAttribute("data-stage");
      renderHub();
      return;
    }
    const speedChip = e.target.closest("[data-speed]");
    if (speedChip) {
      state.speed = speedChip.getAttribute("data-speed");
      renderHub();
      return;
    }
    const chip = e.target.closest("[data-cat]");
    if (chip) {
      state.cat = chip.getAttribute("data-cat");
      renderHub();
      return;
    }
    if (e.target.closest("[data-howto]")) {
      showHowto();
      return;
    }
    if (e.target.closest("[data-study]")) {
      if (e.target.closest("[data-study]").disabled) return;
      openStudy();
      return;
    }
    const start = e.target.closest("[data-start]");
    if (!start || start.disabled) return;
    if (start.getAttribute("data-start") === "taiko") startTaiko(false);
  });

  studyEl.addEventListener("click", function (e) {
    if (e.target.closest("[data-study-prev]")) {
      state.studyIndex = (state.studyIndex - 1 + state.studyList.length) % state.studyList.length;
      renderStudy();
      return;
    }
    if (e.target.closest("[data-study-next]")) {
      state.studyIndex = (state.studyIndex + 1) % state.studyList.length;
      renderStudy();
      return;
    }
    const start = e.target.closest("[data-start]");
    if (start && start.getAttribute("data-start") === "taiko") startTaiko(false);
  });

  recapEl.addEventListener("click", function (e) {
    if (e.target.closest("[data-retry-weak]")) {
      startTaiko(true);
      return;
    }
    const replay = e.target.closest("[data-replay]");
    if (replay) {
      startTaiko(false);
      return;
    }
    if (e.target.closest("[data-home]")) goHome();
  });

  homeBtn.addEventListener("click", requestLeave);
  leaveStay.addEventListener("click", hideLeaveOverlay);
  leaveHome.addEventListener("click", goHome);
  pauseBtn.addEventListener("click", togglePause);
  muteBtn.addEventListener("click", toggleMute);
  pauseResume.addEventListener("click", resumePlay);
  pauseHome.addEventListener("click", goHome);
  howtoClose.addEventListener("click", function () {
    hideHowto(true);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (!howtoOverlay.hidden) {
        hideHowto(true);
        return;
      }
      if (!leaveOverlay.hidden) {
        hideLeaveOverlay();
        return;
      }
      if (!pauseOverlay.hidden) {
        requestLeave();
        return;
      }
      if (state.view === "play") {
        requestLeave();
        return;
      }
      if (state.view === "recap" || state.view === "study") goHome();
      return;
    }
    if (!howtoOverlay.hidden) return;
    if (state.freeze) {
      if (e.code === "Space") e.preventDefault();
      return;
    }
    if (state.userPaused && (e.code === "Space" || e.key === "Enter")) {
      e.preventDefault();
      resumePlay();
      return;
    }
    if (playBlocked()) return;
    if (state.view !== "play" || state.mode !== "taiko" || state.finished) return;
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (key === "1") {
      e.preventDefault();
      hit("don");
      return;
    }
    if (key === "2") {
      e.preventDefault();
      hit("ka");
      return;
    }
    if (e.code === "Space" || key === "3") {
      e.preventDefault();
      hit("big");
    }
  });

  window.addEventListener("resize", function () {
    if (state.view !== "play" || !state.lane) return;
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = 0;
      resizeLane();
      drawLane(gameNow());
    });
  });

  document.addEventListener("visibilitychange", function () {
    if (!roundRunning()) return;
    if (document.hidden) beginPause();
    else if (!playBlocked()) endPause();
  });

  window.addEventListener("pagehide", function () {
    if (roundRunning()) beginPause();
  });

  applyHeader();
  fillHowto();
  renderHub();
  show("hub");
  maybeShowHowto();
})();
