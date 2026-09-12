(function () {
  const HOWTO_KEY = "dadataogu-howto-v2";
  const FLASH_MS = 180;
  const THINK_MS = 2000;
  const hubEl = document.getElementById("hub");
  const setupViewport = document.getElementById("setup-viewport");
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

  const DRUM_NAME = { a: COPY.letterA, b: COPY.letterB, c: COPY.letterC };
  const LETTERS = ["a", "b", "c"];
  const NOTE_SPRITES = {};
  let playUi = null;
  let hudNodes = null;
  let resizeRaf = 0;
  let setupBusy = false;
  let setupTimer = 0;
  const reduceMotionMq = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

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
    setupStep: 0,
    liveIndex: 0,
    drawIndex: 0,
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
    if (headerLead) headerLead.hidden = view === "hub";
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

  function scoredNotes() {
    return state.chart.filter(function (note) {
      return note.judge !== "skip";
    });
  }

  function conceptCount() {
    return state.good + state.ok + state.late;
  }

  function preferReducedMotion() {
    return !!reduceMotionMq.matches;
  }

  function ensureHud() {
    if (hudNodes) return;
    hudEl.innerHTML =
      `<span data-hud="score"></span>` +
      `<span data-hud="combo"></span>` +
      `<span data-hud="good"></span>` +
      `<span data-hud="ok"></span>` +
      `<span data-hud="round"></span>`;
    hudNodes = {
      score: hudEl.querySelector('[data-hud="score"]'),
      combo: hudEl.querySelector('[data-hud="combo"]'),
      good: hudEl.querySelector('[data-hud="good"]'),
      ok: hudEl.querySelector('[data-hud="ok"]'),
      round: hudEl.querySelector('[data-hud="round"]'),
    };
  }

  function updateHud() {
    if (state.view !== "play" || !state.chart.length) {
      hudEl.hidden = true;
      return;
    }
    ensureHud();
    hudEl.hidden = false;
    const done = judgedCount();
    const total = scoredNotes().length || state.chart.length;
    hudNodes.score.textContent = COPY.score + " " + state.score;
    hudNodes.combo.textContent = COPY.combo + " " + state.combo;
    hudNodes.good.textContent = COPY.good + " " + state.good;
    hudNodes.ok.textContent = COPY.ok + " " + state.ok;
    hudNodes.round.textContent =
      COPY.round + Math.min(done + 1, total) + COPY.of + total;
    if (playUi && playUi.scoreBoard) playUi.scoreBoard.textContent = String(state.score);
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

  function chipButtons(values, attr, current, disabledSet) {
    return values
      .map(function (value) {
        const on = value === current ? " active" : "";
        const disabled = disabledSet && disabledSet[value] ? " disabled" : "";
        return `<button type="button" class="chip${on}" ${attr}="${value}"${disabled}>${value}</button>`;
      })
      .join("");
  }

  function setupBackHtml() {
    return `<div class="hub-actions"><button type="button" class="btn btn-ghost" data-setup-back="1">${COPY.setupBack}</button></div>`;
  }

  function poolCountHtml() {
    const n = poolForRound(false).length;
    const emptyMsg = n === 0 ? `<p class="empty-pool">${COPY.emptyPool}</p>` : "";
    return `<p class="pool-count">${COPY.poolCount} ${n} ${COPY.poolUnit}</p>${emptyMsg}`;
  }

  function hubPageHtml() {
    if (state.setupStep === 0) {
      return `
          <p class="track">${COPY.howtoTitle}</p>
          <p class="pick-cat">${COPY.pickHint}</p>
          <ol class="howto-list">
            <li>${COPY.howto1}</li>
            <li>${COPY.howto2}</li>
            <li>${COPY.howto3}</li>
            <li>${COPY.howto4}</li>
            <li>${COPY.howto5}</li>
          </ol>
          <div class="hub-actions">
            <button type="button" class="btn btn-ghost" data-study="1">${COPY.study}</button>
            <button type="button" class="btn" data-setup-next="1">${COPY.setupNext}</button>
          </div>
      `;
    }
    if (state.setupStep === 1) {
      return `
          <p class="track">${COPY.trackLearn}</p>
          <p class="chip-label">${COPY.pickStage}</p>
          <div class="chip-row">${chipButtons(
            [COPY.stageAll, COPY.stagePrimary, COPY.stageJunior, COPY.stageSenior],
            "data-stage",
            state.stage
          )}</div>
          ${setupBackHtml()}
      `;
    }
    if (state.setupStep === 2) {
      const catDisabled = {};
      CATS.forEach(function (cat) {
        if (!countPool(state.stage, cat)) catDisabled[cat] = true;
      });
      return `
          <p class="track">${COPY.trackLearn}</p>
          <p class="chip-label">${COPY.pickCat}</p>
          <div class="chip-row">${chipButtons([COPY.catAll].concat(CATS), "data-cat", state.cat, catDisabled)}</div>
          ${poolCountHtml()}
          ${setupBackHtml()}
      `;
    }
    return `
        <p class="track">${COPY.trackLearn}</p>
        <p class="chip-label">${COPY.pickSpeed}</p>
        <div class="chip-row">${chipButtons(
          [COPY.speedPractice, COPY.speedStandard, COPY.speedExpert],
          "data-speed",
          state.speed
        )}</div>
        ${poolCountHtml()}
        ${setupBackHtml()}
    `;
  }

  function markChipActive(chip) {
    const row = chip.parentElement;
    if (!row) return;
    const chips = row.querySelectorAll(".chip");
    for (let i = 0; i < chips.length; i++) {
      chips[i].classList.toggle("active", chips[i] === chip);
    }
  }

  function finishSetupSlide(incoming, outgoing) {
    if (outgoing && outgoing.parentNode) outgoing.parentNode.removeChild(outgoing);
    incoming.style.position = "";
    incoming.style.top = "";
    incoming.style.left = "";
    incoming.style.width = "";
    incoming.classList.remove("from-right", "from-left", "to-left", "to-right");
    setupViewport.style.height = "";
    setupBusy = false;
  }

  function slideSetupPage(html, dir) {
    const incoming = document.createElement("div");
    incoming.className = "setup-page";
    incoming.innerHTML = html;
    const outgoing = setupViewport.querySelector(".setup-page");
    const animate = !!(outgoing && dir && !preferReducedMotion());
    if (!animate) {
      setupViewport.innerHTML = "";
      setupViewport.appendChild(incoming);
      setupBusy = false;
      return;
    }
    setupBusy = true;
    const fromClass = dir > 0 ? "from-right" : "from-left";
    const toClass = dir > 0 ? "to-left" : "to-right";
    incoming.classList.add(fromClass);
    outgoing.style.position = "absolute";
    outgoing.style.top = "0";
    outgoing.style.left = "0";
    outgoing.style.width = "100%";
    incoming.style.position = "absolute";
    incoming.style.top = "0";
    incoming.style.left = "0";
    incoming.style.width = "100%";
    setupViewport.style.height = outgoing.offsetHeight + "px";
    setupViewport.appendChild(incoming);
    const endH = incoming.offsetHeight;
    let done = false;
    function settle() {
      if (done) return;
      done = true;
      incoming.removeEventListener("transitionend", onEnd);
      finishSetupSlide(incoming, outgoing);
    }
    function onEnd(e) {
      if (e.target !== incoming || e.propertyName !== "transform") return;
      settle();
    }
    incoming.addEventListener("transitionend", onEnd);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        outgoing.classList.add(toClass);
        incoming.classList.remove(fromClass);
        setupViewport.style.height = endH + "px";
      });
    });
    setTimeout(settle, 420);
  }

  function renderHub(dir) {
    slideSetupPage(hubPageHtml(), dir || 0);
  }

  function goSetupStep(step, dir, highlightEl) {
    if (setupBusy) return;
    if (highlightEl) markChipActive(highlightEl);
    const delay = highlightEl && !preferReducedMotion() ? 80 : 0;
    function apply() {
      setupTimer = 0;
      state.setupStep = step;
      renderHub(dir);
    }
    if (delay) {
      setupBusy = true;
      setupTimer = setTimeout(apply, delay);
    } else {
      apply();
    }
  }

  function techById(id) {
    for (let i = 0; i < TECHNIQUES.length; i++) {
      if (TECHNIQUES[i].id === id) return TECHNIQUES[i];
    }
    return null;
  }

  function pickExample(tech) {
    const list = tech && tech.examples;
    if (!list || !list.length) return "";
    return list[Math.floor(Math.random() * list.length)];
  }

  function collectDecoyTechs(tech, pool) {
    const out = [];
    const seen = {};
    seen[tech.id] = true;
    function add(other) {
      if (!other || seen[other.id] || out.length >= 2) return;
      seen[other.id] = true;
      out.push(other);
    }
    function fromList(list) {
      list.forEach(add);
    }
    const poolIds = {};
    (pool || []).forEach(function (item) {
      poolIds[item.id] = item;
    });
    (tech.confusable || []).forEach(function (id) {
      if (poolIds[id]) add(poolIds[id]);
    });
    fromList(
      shuffle(
        (pool || []).filter(function (other) {
          return other.cat === tech.cat;
        })
      )
    );
    fromList(shuffle(pool || []));
    (tech.confusable || []).forEach(function (id) {
      add(techById(id));
    });
    fromList(
      shuffle(
        TECHNIQUES.filter(function (other) {
          return other.cat === tech.cat;
        })
      )
    );
    fromList(shuffle(TECHNIQUES));
    return out.slice(0, 2);
  }

  function makeTaikoDeck(pool) {
    const size = Math.min(12, pool.length);
    return shuffle(pool).slice(0, size).map(function (tech) {
      const decoys = collectDecoyTechs(tech, pool);
      const options = shuffle(
        [{ text: tech.name, ok: true, id: tech.id }].concat(
          decoys.map(function (other) {
            return { text: other.name, ok: false, id: other.id };
          })
        )
      );
      return {
        id: tech.id,
        cat: tech.cat,
        name: tech.name,
        example: pickExample(tech),
        hits: tech.hits.slice(),
        correct: tech.name,
        options: options,
        missed: [],
        revealed: false,
      };
    });
  }

  function matchesStageValue(tech, stage) {
    if (stage === COPY.stageAll) return true;
    if (stage === COPY.stagePrimary) {
      return tech.stage === "primary" || tech.stage === "both";
    }
    if (stage === COPY.stageJunior) {
      return tech.stage === "junior" || tech.stage === "both";
    }
    if (stage === COPY.stageSenior) {
      return tech.stage === "junior" || tech.stage === "senior" || tech.stage === "both";
    }
    return true;
  }

  function matchesStage(tech) {
    return matchesStageValue(tech, state.stage);
  }

  function countPool(stage, cat) {
    return TECHNIQUES.filter(function (tech) {
      if (!matchesStageValue(tech, stage)) return false;
      if (cat !== COPY.catAll && tech.cat !== cat) return false;
      return true;
    }).length;
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
      return { bpm: 36, scrollMs: 4200, good: 200, ok: 400, miss: 600, drain: 0.25, notes: 10 };
    }
    if (state.speed === COPY.speedExpert) {
      return { bpm: 80, scrollMs: 2000, good: 80, ok: 160, miss: 240, drain: 1.25, notes: 30 };
    }
    return { bpm: 54, scrollMs: 3000, good: 120, ok: 250, miss: 380, drain: 1, notes: 20 };
  }

  function randomNotes(count, correctLetter) {
    const pattern = [];
    for (let i = 0; i < count; i++) {
      pattern.push(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    }
    if (pattern.indexOf(correctLetter) === -1) {
      pattern[Math.floor(Math.random() * count)] = correctLetter;
    }
    return pattern;
  }

  function makeChart(deck) {
    const beat = 60000 / state.diff.bpm;
    const appear = state.diff.scrollMs;
    const notes = state.diff.notes || 20;
    const block = THINK_MS + appear + notes * beat;
    const chart = [];
    deck.forEach(function (item, q) {
      const types = shuffle(LETTERS.slice());
      const labels = {};
      item.options.forEach(function (opt, idx) {
        labels[types[idx]] = opt;
      });
      let correctLetter = types[0];
      item.options.forEach(function (opt, idx) {
        if (opt.ok) correctLetter = types[idx];
      });
      const pattern = randomNotes(notes, correctLetter);
      const appearAt = q * block + THINK_MS;
      for (let i = 0; i < notes; i++) {
        chart.push({
          item: item,
          time: appearAt + appear + i * beat,
          appearAt: appearAt,
          letter: pattern[i],
          correctLetter: correctLetter,
          labels: labels,
          judged: false,
          judge: null,
          hitType: null,
        });
      }
    });
    return chart;
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
      renderHub(0);
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
    state.liveIndex = 0;
    state.drawIndex = 0;
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
    if (type === "a" || type === "c") {
      playTone(720, 0.07, "triangle", 0.12);
      playTone(980, 0.04, "square", 0.04);
    } else {
      playTone(160, 0.12, "sine", 0.16);
      playTone(90, 0.1, "sine", 0.08);
    }
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
    if (state.liveIndex < state.chart.length) return state.chart[state.liveIndex];
    return state.chart[state.chart.length - 1] || null;
  }

  function advanceLiveIndex() {
    while (state.liveIndex < state.chart.length && state.chart[state.liveIndex].judged) {
      state.liveIndex += 1;
    }
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
      teachStats: document.getElementById("teach-stats"),
      teachCorrect: document.getElementById("teach-correct"),
      teachHit: document.getElementById("teach-hit"),
      teachEx: document.getElementById("teach-ex"),
      teachContinue: document.getElementById("teach-continue"),
      drum: document.getElementById("taiko-drum"),
      scoreBoard: document.getElementById("score-board"),
      pads: {
        a: playEl.querySelector('[data-hit="a"]'),
        b: playEl.querySelector('[data-hit="b"]'),
        c: playEl.querySelector('[data-hit="c"]'),
        skip: playEl.querySelector("[data-skip]"),
      },
      padAns: {
        a: document.getElementById("pad-a"),
        b: document.getElementById("pad-b"),
        c: document.getElementById("pad-c"),
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
          <span class="gogo-flag" id="gogo-flag" hidden>
            GOGO!!
            <small>${COPY.gogoHint}</small>
          </span>
        </div>
        <div class="now-playing">
          <span class="cat-pill" id="now-cat"></span>
          <strong id="now-name" class="name-hint" hidden></strong>
        </div>
        <p class="now-example" id="now-example"></p>
        <div class="playfield-row">
          <div class="drum-col">
            <div class="drum-score" id="score-board">0</div>
            <div class="taiko-drum" id="taiko-drum" aria-hidden="true">
              <div class="drum-face"></div>
              <div class="drum-flash blue-left"></div>
              <div class="drum-flash red"></div>
              <div class="drum-flash blue-right"></div>
            </div>
          </div>
          <div class="lane-wrap">
            <div class="combo-stack idle" id="combo-stack">
              <span id="combo-count">0</span>
              <small>${COPY.combo}</small>
            </div>
            <div class="judge-fx" id="judge-fx"></div>
            <div class="count-fx" id="count-fx"></div>
            <canvas id="taiko-lane"></canvas>
          </div>
        </div>
        <div class="taiko-pad-wrap">
          <button type="button" class="hit-pad a" data-hit="a" tabindex="-1" aria-label="1 ${COPY.letterA}">
            <span class="pad-num">1</span>
            <span class="pad-kind">${COPY.letterA}</span>
            <span class="pad-ans" id="pad-a"></span>
          </button>
          <button type="button" class="hit-pad b" data-hit="b" tabindex="-1" aria-label="2 ${COPY.letterB}">
            <span class="pad-num">2</span>
            <span class="pad-kind">${COPY.letterB}</span>
            <span class="pad-ans" id="pad-b"></span>
          </button>
          <button type="button" class="hit-pad c" data-hit="c" tabindex="-1" aria-label="3 ${COPY.letterC}">
            <span class="pad-num">3</span>
            <span class="pad-kind">${COPY.letterC}</span>
            <span class="pad-ans" id="pad-c"></span>
          </button>
          <button type="button" class="hit-pad skip" data-skip tabindex="-1" aria-label="${COPY.skip}">
            <span class="pad-kind">${COPY.skip}</span>
            <span class="pad-ans">${COPY.skipKey}</span>
          </button>
        </div>
        <p class="key-hint">${COPY.keys}</p>
        <div class="teach-banner" id="teach-banner" hidden>
          <p class="teach-kind" id="teach-kind"></p>
          <p class="teach-stats" id="teach-stats"></p>
          <p class="teach-correct" id="teach-correct"></p>
          <p class="teach-hit" id="teach-hit"></p>
          <p class="teach-ex" id="teach-ex"></p>
          <button type="button" class="btn" id="teach-continue">${COPY.continue}</button>
          <p class="teach-continue-hint">${COPY.continueHint}</p>
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
    const skipEl = playEl.querySelector("[data-skip]");
    if (skipEl) {
      let fromPointer = false;
      skipEl.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        fromPointer = true;
        skip();
      });
      skipEl.addEventListener("click", function (e) {
        e.preventDefault();
        if (fromPointer) {
          fromPointer = false;
          return;
        }
        skip();
      });
    }
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

  function flashDrum(type) {
    const el = playUi && playUi.drum;
    if (!el) return;
    el.classList.remove("flash-a", "flash-b", "flash-c");
    void el.offsetWidth;
    el.classList.add("flash-" + type);
    clearTimeout(el._flashTimer);
    el._flashTimer = setTimeout(function () {
      el.classList.remove("flash-a", "flash-b", "flash-c");
      el._flashTimer = null;
    }, 120);
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
    return type === note.letter && note.letter === note.correctLetter;
  }

  function nearestNote(now) {
    let best = null;
    let bestAbs = Infinity;
    for (let i = state.liveIndex; i < state.chart.length; i++) {
      const note = state.chart[i];
      if (note.judged) continue;
      const abs = Math.abs(note.time - now);
      if (abs > state.diff.miss) {
        if (note.time - now > state.diff.miss) break;
        continue;
      }
      if (abs < bestAbs) {
        best = note;
        bestAbs = abs;
      }
    }
    return best;
  }

  function timingResult(dt) {
    if (dt <= state.diff.good) return "good";
    if (dt <= state.diff.ok) return "ok";
    return "late";
  }

  function showReveal(item) {
    if (!playUi || !playUi.nowName || !item) return;
    playUi.nowName.hidden = false;
    playUi.nowName.textContent = item.name;
  }

  function hit(type) {
    if (state.view !== "play" || state.mode !== "taiko" || state.finished) return;
    if (playBlocked()) return;
    const now = gameNow();
    playHit(type);
    flashPad(type);
    flashDrum(type);
    const best = nearestNote(now);
    if (!best) {
      showJudgeFx(COPY.ghost, "ghost");
      return;
    }
    const dt = Math.abs(best.time - now);
    const result = optionIsCorrect(best, type) ? timingResult(dt) : "wrong";
    applyJudge(best, result, type);
  }

  function skip() {
    if (state.view !== "play" || state.mode !== "taiko" || state.finished) return;
    if (playBlocked()) return;
    const now = gameNow();
    flashPad("skip");
    const best = nearestNote(now);
    if (!best) {
      showJudgeFx(COPY.ghost, "ghost");
      return;
    }
    const dt = Math.abs(best.time - now);
    const result = best.letter !== best.correctLetter ? timingResult(dt) : "wrong";
    applyJudge(best, result, null);
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

  function questionDone(item) {
    return state.chart.every(function (n) {
      return n.item.id !== item.id || n.judged;
    });
  }

  function questionStats(item) {
    let hit = 0;
    let miss = 0;
    state.chart.forEach(function (n) {
      if (n.item.id !== item.id || !n.judged || n.judge === "skip") return;
      if (n.judge === "good" || n.judge === "ok" || n.judge === "late") hit += 1;
      else miss += 1;
    });
    const total = hit + miss || 1;
    return {
      hit: hit,
      miss: miss,
      rate: Math.round((hit / total) * 100),
    };
  }

  function applyJudge(note, result, hitType) {
    if (note.judged) return;
    note.judged = true;
    note.judge = result;
    note.hitType = hitType;
    const n = state.chart.length || 1;
    const goodFill = 100 / n;
    if (result === "good" || result === "ok" || result === "late") {
      if (note.letter === note.correctLetter) {
        note.item.revealed = true;
        showReveal(note.item);
      }
    }
    if (result === "good") {
      state.good += 1;
      state.combo += 1;
      state.score += 100;
      state.gauge = Math.min(100, state.gauge + goodFill);
      showJudgeFx(COPY.good, "good");
      holdLegend(500);
    } else if (result === "ok") {
      state.ok += 1;
      state.combo += 1;
      state.score += 50;
      state.gauge = Math.min(100, state.gauge + goodFill / 2);
      showJudgeFx(COPY.ok, "ok");
      holdLegend(500);
    } else if (result === "late") {
      state.late += 1;
      state.combo = 0;
      state.score += 50;
      if (state.speed !== COPY.speedPractice) {
        state.gauge = Math.max(0, state.gauge - goodFill * state.diff.drain * 0.35);
      }
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
    } else {
      state.miss += 1;
      state.combo = 0;
      state.gauge = Math.max(0, state.gauge - goodFill * state.diff.drain);
      showJudgeFx(COPY.missedNote, "miss");
      markWeak(note, COPY.missedNote);
    }
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    state.flash = { at: performance.now(), kind: result };
    state.pausedDrawn = false;
    advanceLiveIndex();
    updateSoul();
    updateHud();
    updateComboDom();
    if (questionDone(note.item) && !state.freeze) {
      note.item.revealed = true;
      showReveal(note.item);
      startFreeze(note, COPY.explainTitle);
    }
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
    if (playUi && playUi.teachStats) {
      const stats = questionStats(note.item);
      playUi.teachStats.textContent =
        COPY.qHit + " " + stats.hit + "　" + COPY.qMiss + " " + stats.miss + "　" + COPY.qRate + " " + stats.rate + "%";
    }
    const drum = DRUM_NAME[note.correctLetter] || "";
    const ans = note.item.name;
    if (playUi && playUi.teachCorrect) {
      playUi.teachCorrect.textContent = COPY.correct + "：" + drum + "＝" + ans;
    }
    if (playUi && playUi.teachHit) {
      playUi.teachHit.textContent = note.item.hits && note.item.hits.length
        ? COPY.hitsLabel + "：" + note.item.hits.join("、")
        : "";
    }
    if (playUi && playUi.teachEx) {
      playUi.teachEx.textContent = note.item.example ? COPY.example + "：" + note.item.example : "";
    }
    LETTERS.forEach(function (type) {
      const el = playUi && playUi.pads ? playUi.pads[type] : null;
      if (el) el.classList.toggle("correct-glow", type === note.correctLetter);
    });
    if (playUi && playUi.teachContinue) playUi.teachContinue.focus();
  }

  function clearFreeze(silent) {
    const was = state.freeze;
    state.freeze = false;
    if (playUi && playUi.teachBanner) playUi.teachBanner.hidden = true;
    LETTERS.forEach(function (type) {
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
    for (let i = state.liveIndex; i < state.chart.length; i++) {
      const note = state.chart[i];
      if (note.judged) continue;
      if (now - note.time <= state.diff.miss) break;
      applyJudge(note, "miss", null);
    }
  }

  function updateLegend() {
    if (state.legendHold || state.freeze) return;
    const note = nextNote();
    if (!note || !playUi || !playUi.nowName) return;
    if (note.item.revealed) {
      showReveal(note.item);
    } else {
      playUi.nowName.hidden = true;
      playUi.nowName.textContent = "";
    }
    playUi.nowCat.textContent = note.item.cat;
    setPadLabel("a", note.labels.a);
    setPadLabel("b", note.labels.b);
    setPadLabel("c", note.labels.c);
    const ex = playUi.nowExample;
    if (ex) {
      ex.hidden = false;
      ex.textContent = "";
      const lab = document.createElement("span");
      lab.textContent = COPY.example;
      ex.appendChild(lab);
      ex.appendChild(document.createTextNode(note.item.example || ""));
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

  function clearCountFx() {
    const el = playUi && playUi.countFx;
    if (el && el.textContent) {
      el.textContent = "";
      el.className = "count-fx";
    }
    if (state.lastCount !== -1) state.lastCount = -1;
  }

  function updateCountFx(now) {
    const el = playUi && playUi.countFx;
    if (!el) return;
    const note = nextNote();
    if (!note || note.judged) {
      clearCountFx();
      return;
    }
    const start = note.appearAt - THINK_MS;
    const end = note.appearAt;
    if (now < start || now >= end) {
      clearCountFx();
      return;
    }
    const step = Math.min(3, Math.floor((now - start) / (THINK_MS / 4)));
    if (step === state.lastCount) return;
    state.lastCount = step;
    const labels = ["3", "2", "1", COPY.countStart];
    el.textContent = labels[step];
    el.className = "count-fx";
    void el.offsetWidth;
    el.className = "count-fx show" + (step === 3 ? " go" : "");
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

  function makeNoteSprite(letter) {
    const base = makeFaceSprite(28, "#fff4d6", "#c4a15a");
    const c = base.canvas.getContext("2d");
    const dpr = 2;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = base.size / 2;
    const cy = base.size / 2;
    c.fillStyle = "#3a2010";
    c.font = "800 22px Segoe UI, PingFang TC, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(DRUM_NAME[letter] || "", cx, cy);
    return base;
  }

  function makeMissSprite() {
    const r = 28;
    const pad = Math.ceil(r * 0.22) + 6;
    const dpr = 2;
    const size = (r + pad) * 2;
    const cv = document.createElement("canvas");
    cv.width = Math.ceil(size * dpr);
    cv.height = Math.ceil(size * dpr);
    const c = cv.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const x = r + pad;
    const y = r + pad;
    c.strokeStyle = "#d92d20";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(x - 10, y - 10);
    c.lineTo(x + 10, y + 10);
    c.moveTo(x + 10, y - 10);
    c.lineTo(x - 10, y + 10);
    c.stroke();
    return { canvas: cv, size: size };
  }

  function ensureNoteSprites() {
    if (NOTE_SPRITES.a) return;
    NOTE_SPRITES.a = makeNoteSprite("a");
    NOTE_SPRITES.b = makeNoteSprite("b");
    NOTE_SPRITES.c = makeNoteSprite("c");
    NOTE_SPRITES.missX = makeMissSprite();
  }

  function blitNote(c, sprite, x, y, alpha) {
    const dest = sprite.size;
    c.globalAlpha = alpha;
    c.drawImage(sprite.canvas, x - dest / 2, y - dest / 2, dest, dest);
    c.globalAlpha = 1;
  }

  function noteSprite(note) {
    const sprite = NOTE_SPRITES[note.letter] || NOTE_SPRITES.a;
    if (note.judge === "skip") return { sprite: sprite, alpha: 0.2, miss: false };
    if (!note.judged) return { sprite: sprite, alpha: 1, miss: false };
    const fail = note.judge === "wrong" || note.judge === "miss";
    return { sprite: sprite, alpha: fail ? 0.4 : 1, miss: fail };
  }

  function ensureTrackSprite() {
    if (
      NOTE_SPRITES.track &&
      NOTE_SPRITES.trackGogo === state.gogo &&
      NOTE_SPRITES.trackW === state.laneW &&
      NOTE_SPRITES.trackH === state.laneH &&
      NOTE_SPRITES.trackDpr === state.dpr &&
      NOTE_SPRITES.trackJudgeX === state.judgeX
    ) {
      return;
    }
    const dpr = state.dpr;
    const w = state.laneW;
    const h = state.laneH;
    const cv = document.createElement("canvas");
    cv.width = Math.floor(w * dpr);
    cv.height = Math.floor(h * dpr);
    const c = cv.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    NOTE_SPRITES.track = cv;
    NOTE_SPRITES.trackGogo = state.gogo;
    NOTE_SPRITES.trackW = w;
    NOTE_SPRITES.trackH = h;
    NOTE_SPRITES.trackDpr = dpr;
    NOTE_SPRITES.trackJudgeX = jx;
  }

  function flashActive() {
    return !!(state.flash && performance.now() - state.flash.at < FLASH_MS);
  }

  function drawLane(now) {
    const c = state.laneCtx;
    if (!c || !state.lane) return;
    ensureNoteSprites();
    ensureTrackSprite();
    const dpr = state.dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = state.laneW;
    const h = state.laneH;
    c.clearRect(0, 0, w, h);
    c.drawImage(NOTE_SPRITES.track, 0, 0, w, h);

    const jx = state.judgeX;
    const jy = 42 + 66 / 2;

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

    const span = w - jx - 28;
    const missX = NOTE_SPRITES.missX;
    while (state.drawIndex < state.chart.length) {
      const early = state.chart[state.drawIndex];
      if (now < early.appearAt) break;
      const gone = jx + ((early.time - now) / state.diff.scrollMs) * span;
      if (gone >= -48) break;
      state.drawIndex += 1;
    }
    for (let i = state.drawIndex; i < state.chart.length; i++) {
      const note = state.chart[i];
      if (now < note.appearAt) break;
      const x = jx + ((note.time - now) / state.diff.scrollMs) * span;
      if (x > w + 48) break;
      const look = noteSprite(note);
      blitNote(c, look.sprite, x, jy, look.alpha);
      if (look.miss) blitNote(c, missX, x, jy, 0.8);
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
    if (state.liveIndex >= state.chart.length && now > last.time + 700) {
      state.finished = true;
      stopLoop();
      state.timer = setTimeout(renderRecap, 380);
    }
  }

  function burstConfetti() {
    if (preferReducedMotion()) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    confettiEl.width = Math.floor(w * dpr);
    confettiEl.height = Math.floor(h * dpr);
    confettiEl.style.width = w + "px";
    confettiEl.style.height = h + "px";
    const c = confettiEl.getContext("2d");
    const bits = [];
    for (let i = 0; i < 40; i++) {
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

  function conceptCleared() {
    const total = scoredNotes().length || 1;
    return conceptCount() / total >= 0.8;
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
    if (conceptCleared()) {
      return { id: "clear", label: COPY.cleared, cls: "crown-clear" };
    }
    return { id: "fail", label: COPY.failed, cls: "crown-fail" };
  }

  function renderRecap() {
    show("recap");
    hudEl.hidden = true;
    playUi = null;
    const crown = resultCrown();
    const total = scoredNotes().length || 1;
    const weak = state.weak.length
      ? `<p>${COPY.keep}</p><ul class="weak-list">${state.weak
          .map(function (w) {
            const picked = w.missed.length
              ? `<div class="picked">${COPY.youPicked}：${w.missed.join("、")}</div>`
              : "";
            const ex = w.example
              ? `<div class="picked">${COPY.example}：${w.example}</div>`
              : "";
            return `<li class="recap-pair"><div class="pair">${w.name}</div><div class="picked">${COPY.hitsLabel}：${(w.hits || []).join("、")}</div>${picked}${ex}</li>`;
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
        <p class="concept-line">${COPY.concept} ${conceptCount()}${COPY.of}${total}　${COPY.conceptNeed}</p>
        ${crown.id === "fail" ? `<p class="concept-fail">${COPY.conceptShort}</p>` : ""}
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
        <p class="example"><span>${COPY.example}</span>${pickExample(tech)}</p>
        <div class="study-actions">
          <button type="button" class="btn btn-ghost" data-study-prev="1">${COPY.prev}</button>
          <button type="button" class="btn btn-ghost" data-study-next="1">${COPY.next}</button>
          <button type="button" class="btn" data-setup-next="1">${COPY.setupNext}</button>
        </div>
      </div>
    `;
  }

  function openStudy() {
    const pool = TECHNIQUES.slice();
    if (!pool.length) {
      renderHub();
      show("hub");
      return;
    }
    state.studyList = pool;
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

  function hideHowto(save) {
    howtoOverlay.hidden = true;
    if (save) {
      try {
        localStorage.setItem(HOWTO_KEY, "1");
      } catch (err) {}
    }
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
    state.setupStep = 0;
    playUi = null;
    setupBusy = false;
    if (setupTimer) {
      clearTimeout(setupTimer);
      setupTimer = 0;
    }
    show("hub");
    renderHub(0);
    updateHud();
  }

  function setupBack() {
    if (state.setupStep <= 0 || setupBusy) return;
    goSetupStep(state.setupStep - 1, -1);
  }

  hubEl.addEventListener("click", function (e) {
    if (setupBusy) return;
    if (e.target.closest("[data-setup-back]")) {
      setupBack();
      return;
    }
    if (e.target.closest("[data-setup-next]")) {
      goSetupStep(1, 1);
      return;
    }
    const stageChip = e.target.closest("[data-stage]");
    if (stageChip) {
      if (stageChip.disabled) return;
      state.stage = stageChip.getAttribute("data-stage");
      if (!countPool(state.stage, state.cat)) state.cat = COPY.catAll;
      goSetupStep(2, 1, stageChip);
      return;
    }
    const speedChip = e.target.closest("[data-speed]");
    if (speedChip) {
      if (speedChip.disabled) return;
      markChipActive(speedChip);
      state.speed = speedChip.getAttribute("data-speed");
      setupBusy = true;
      setupTimer = setTimeout(function () {
        setupTimer = 0;
        setupBusy = false;
        startTaiko(false);
      }, preferReducedMotion() ? 0 : 80);
      return;
    }
    const chip = e.target.closest("[data-cat]");
    if (chip) {
      if (chip.disabled) return;
      state.cat = chip.getAttribute("data-cat");
      goSetupStep(3, 1, chip);
      return;
    }
    if (e.target.closest("[data-study]")) {
      openStudy();
    }
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
    if (e.target.closest("[data-setup-next]")) {
      state.setupStep = 1;
      show("hub");
      renderHub(0);
    }
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
      if (state.view === "hub" && state.setupStep > 0) {
        setupBack();
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
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        endFreeze();
      }
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
    if (key === "1" || key === "c") {
      e.preventDefault();
      hit("a");
      return;
    }
    if (key === "2" || key === "v" || key === "b") {
      e.preventDefault();
      hit("b");
      return;
    }
    if (key === "3" || key === "n") {
      e.preventDefault();
      hit("c");
      return;
    }
    if (e.code === "Space") {
      e.preventDefault();
      skip();
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
})();
