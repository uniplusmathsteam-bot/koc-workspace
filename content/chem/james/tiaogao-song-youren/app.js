(function () {
  const VOICE_KEY = "jump-songyouren-voice";
  const WEAK_KEY = "jump-songyouren-weak";
  const DIFF_KEY = "jump-songyouren-snake-diff";
  const SNAKE_COLS = 16;
  const SNAKE_ROWS = 12;
  const SNAKE_MIN = 3;
  const SNAKE_MS = { normal: 320, hard: 133 };
  const SNAKE_KEYS = {
    ArrowLeft: "left",
    ArrowUp: "up",
    ArrowRight: "right",
    ArrowDown: "down",
    a: "left",
    w: "up",
    d: "right",
    s: "down",
    A: "left",
    W: "up",
    D: "right",
    S: "down",
  };
  const SNAKE_OPP = { left: "right", right: "left", up: "down", down: "up" };
  const hubEl = document.getElementById("hub");
  const playEl = document.getElementById("play");
  const recapEl = document.getElementById("recap");
  const hudEl = document.getElementById("hud");
  const homeBtn = document.getElementById("btn-home");
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const confirmEl = document.getElementById("confirm");
  const headerLead = document.getElementById("header-lead");

  const state = {
    view: "hub",
    mode: null,
    phase: "hub",
    voice: "yue",
    deck: [],
    index: 0,
    hits: 0,
    misses: 0,
    weak: [],
    locked: false,
    timer: null,
    speakHint: false,
    writeMarks: [],
    writeChecked: false,
    writePeeked: false,
    firstTry: true,
    streak: 0,
    skipCoupletCards: false,
    speakGen: 0,
    karaokeHost: null,
    snake: null,
    snakeRaf: null,
    snakeSetupWeak: false,
    difficulty: "normal",
  };

  try {
    const saved = localStorage.getItem(VOICE_KEY);
    if (saved === "yue" || saved === "cmn") state.voice = saved;
    const diff = localStorage.getItem(DIFF_KEY);
    if (diff === "normal" || diff === "hard") state.difficulty = diff;
  } catch (err) {
    /* file:// or blocked storage */
  }

  function later(fn, ms) {
    clearTimeout(state.timer);
    state.timer = setTimeout(fn, ms);
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function allBlanks() {
    return POEM.couplets.flatMap((c, coupletIndex) =>
      c.blanks.map((blank) => ({
        ...blank,
        coupletId: c.id,
        coupletIndex,
      }))
    );
  }

  function coupletOf(item) {
    if (!item || item.coupletIndex == null) return POEM.couplets[0];
    return POEM.couplets[item.coupletIndex];
  }

  function builtUpTo(item, includeCurrent) {
    if (!item) return "";
    const blanks = allBlanks();
    let out = "";
    for (let i = 0; i < blanks.length; i++) {
      const blank = blanks[i];
      if (!includeCurrent && blank.id === item.id) break;
      out += blank.add;
      if (includeCurrent && blank.id === item.id) break;
    }
    return out;
  }

  function formatBuilt(text) {
    if (!text) return "……";
    return text.replace(/。/g, "。\n").trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function splitLines(text) {
    const out = [];
    let buf = "";
    Array.from(String(text || "")).forEach((ch) => {
      buf += ch;
      if (ch === "，" || ch === "。") {
        const piece = buf.trim();
        if (piece) out.push(piece);
        buf = "";
      }
    });
    if (buf.trim()) out.push(buf.trim());
    return out;
  }

  function karaokeHtml(text, activeIndex) {
    return splitLines(text)
      .map(
        (line, i) =>
          `<span class="karaoke-line${i === activeIndex ? " on" : ""}">${line}</span>`
      )
      .join("");
  }

  function highlightKaraoke(index) {
    const host = state.karaokeHost;
    const nodes = host && host.querySelectorAll ? host.querySelectorAll(".karaoke-line") : [];
    nodes.forEach((el, i) => {
      el.classList.toggle("on", i === index);
    });
  }

  function savedWeak() {
    try {
      const data = JSON.parse(localStorage.getItem(WEAK_KEY) || "null");
      if (
        data &&
        (data.mode === "jump" || data.mode === "write" || data.mode === "snake") &&
        Array.isArray(data.ids) &&
        data.ids.length
      ) {
        return data;
      }
    } catch (err) {
      /* ignore */
    }
    return null;
  }

  function persistWeak() {
    try {
      if (!state.weak.length || (state.mode !== "jump" && state.mode !== "write" && state.mode !== "snake")) {
        localStorage.removeItem(WEAK_KEY);
        return;
      }
      localStorage.setItem(
        WEAK_KEY,
        JSON.stringify({
          mode: state.mode,
          ids: state.weak.map((w) => w.id),
        })
      );
    } catch (err) {
      /* ignore */
    }
  }

  function show(view) {
    state.view = view;
    hubEl.classList.toggle("active", view === "hub");
    playEl.classList.toggle("active", view === "play");
    recapEl.classList.toggle("active", view === "recap");
    hudEl.hidden = view !== "play";
    homeBtn.hidden = view === "hub" && state.phase !== "setup";
    document.body.classList.toggle("compact-header", view !== "hub");
    if (headerLead) {
      headerLead.hidden = view !== "hub";
      headerLead.textContent = COPY.lead;
    }
  }

  function updateHud() {
    if (state.view === "hub") {
      hudEl.hidden = true;
      hudEl.innerHTML = "";
      return;
    }
    if (state.view === "recap") {
      hudEl.hidden = true;
      hudEl.innerHTML = "";
      return;
    }
    hudEl.hidden = false;
    if (state.mode === "snake" && state.phase === "setup") {
      hudEl.hidden = true;
      hudEl.innerHTML = "";
      return;
    }
    if (state.mode === "study") {
      hudEl.innerHTML = `<span>${COPY.studyName}</span>`;
      return;
    }
    if (state.mode === "write") {
      const total = state.deck.length || POEM.couplets.length;
      hudEl.innerHTML =
        `<span>${COPY.writeName}</span>` +
        `<span>${COPY.round}${state.index + 1}${COPY.of}${total}${COPY.lian}</span>`;
      return;
    }
    if (!state.deck.length) {
      hudEl.hidden = true;
      hudEl.innerHTML = "";
      return;
    }
    const diffChip =
      state.mode === "snake" ? `<span>${difficultyLabel()}</span>` : "";
    hudEl.innerHTML =
      diffChip +
      `<span>${COPY.round}${state.index + 1}${COPY.of}${state.deck.length}</span>` +
      `<span>${COPY.hits} ${state.hits}</span>` +
      `<span>${COPY.misses} ${state.misses}</span>` +
      `<span>${COPY.streak} ${state.streak}</span>`;
  }

  function chineseVoices() {
    if (!window.speechSynthesis) return [];
    return speechSynthesis.getVoices().filter((v) => /zh|yue|cmn|Chinese|粵|國|普|香港|Taiwan|China/i.test(v.lang + " " + v.name));
  }

  function preferredVoice() {
    const voices = chineseVoices();
    if (state.voice === "yue") {
      return (
        voices.find((v) => /zh-HK|yue|Cantonese|香港|粵|Guangdong/i.test(v.lang + " " + v.name)) ||
        voices[0] ||
        null
      );
    }
    return (
      voices.find((v) => /zh-TW|Taiwan|國語|Mandarin.*TW/i.test(v.lang + " " + v.name)) ||
      voices.find((v) => /zh-CN|cmn|Chinese|普通話|國語/i.test(v.lang + " " + v.name)) ||
      voices[0] ||
      null
    );
  }

  function refreshVoiceHint() {
    if (!window.speechSynthesis) {
      state.speakHint = true;
      return;
    }
    state.speakHint = chineseVoices().length === 0 && speechSynthesis.getVoices().length > 0;
  }

  function makeUtterance(text) {
    const u = new SpeechSynthesisUtterance(text);
    const voice = preferredVoice();
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = state.voice === "yue" ? "zh-HK" : "zh-TW";
    }
    u.rate = 0.75;
    return u;
  }

  function stopSpeech() {
    state.speakGen += 1;
    highlightKaraoke(-1);
    state.karaokeHost = null;
    if (window.speechSynthesis) speechSynthesis.cancel();
  }

  function speakLines(text, host) {
    refreshVoiceHint();
    const hint = document.querySelector(".speak-hint");
    if (hint) hint.hidden = !state.speakHint;
    if (!window.speechSynthesis) {
      state.speakHint = true;
      if (hint) hint.hidden = false;
      return;
    }
    const gen = ++state.speakGen;
    highlightKaraoke(-1);
    state.karaokeHost = host || null;
    speechSynthesis.cancel();
    const lines = splitLines(text);
    if (!lines.length) return;

    function wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function speakOne(line) {
      return new Promise((resolve) => {
        if (gen !== state.speakGen) {
          resolve();
          return;
        }
        const u = makeUtterance(line);
        u.onend = () => resolve();
        u.onerror = () => resolve();
        speechSynthesis.speak(u);
      });
    }

    (async function run() {
      await wait(40);
      for (let i = 0; i < lines.length; i++) {
        if (gen !== state.speakGen) return;
        highlightKaraoke(i);
        await speakOne(lines[i]);
      }
      if (gen === state.speakGen) highlightKaraoke(-1);
    })();
  }

  function speakHintBlock() {
    return `<p class="speak-hint"${state.speakHint ? "" : " hidden"}>${COPY.noVoice}</p>`;
  }

  function renderHub() {
    refreshVoiceHint();
    const saved = savedWeak();
    const retryHtml = saved
      ? `<button type="button" class="btn" data-retry-saved="1">${COPY.retrySaved}</button>`
      : "";
    hubEl.innerHTML = `
      <div class="taiko-panel">
        <div class="setup-viewport">
          <p class="track">${COPY.trackPoem}</p>
          <p class="chip-label chip-small" id="chip-voice">${COPY.voice}</p>
          <div class="chip-row" role="group" aria-labelledby="chip-voice">
            <button type="button" class="chip${state.voice === "yue" ? " active" : ""}" data-voice="yue">${COPY.yue}</button>
            <button type="button" class="chip${state.voice === "cmn" ? " active" : ""}" data-voice="cmn">${COPY.cmn}</button>
          </div>
          <p class="chip-label" id="chip-mode">${COPY.pickMode}</p>
          <div class="chip-row" role="group" aria-labelledby="chip-mode">
            <button type="button" class="chip" data-start="study">${COPY.studyName}</button>
            <button type="button" class="chip" data-start="jump">${COPY.jumpName}</button>
            <button type="button" class="chip" data-start="write">${COPY.writeName}</button>
            <button type="button" class="chip" data-start="snake">${COPY.snakeName}</button>
          </div>
          ${speakHintBlock()}
          <div class="hub-actions">
            <button type="button" class="btn btn-ghost" data-speak="full">${COPY.listenFull}</button>
            ${retryHtml}
          </div>
        </div>
      </div>
    `;
  }

  function resetRound(mode, deck) {
    clearTimeout(state.timer);
    stopSnake();
    stopSpeech();
    state.mode = mode;
    state.deck = deck;
    state.index = 0;
    state.hits = 0;
    state.misses = 0;
    state.weak = [];
    state.locked = false;
    state.writeMarks = [];
    state.writeChecked = false;
    state.writePeeked = false;
    state.firstTry = true;
    state.streak = 0;
    state.phase = mode === "write" ? "write" : "blank";
    show("play");
  }

  function current() {
    return state.deck[state.index];
  }

  function isLastOfCouplet() {
    const item = current();
    const next = state.deck[state.index + 1];
    return !next || next.coupletIndex !== item.coupletIndex;
  }

  function startStudy() {
    clearTimeout(state.timer);
    stopSpeech();
    state.mode = "study";
    state.phase = "study";
    state.deck = [];
    state.locked = false;
    show("play");
    renderStudy();
  }

  function renderStudy() {
    const words = (POEM.words || [])
      .map((w) => `<li><strong>${w.word}</strong>　${w.gloss}</li>`)
      .join("");
    const notes = POEM.couplets
      .map(
        (c) => `
        <div class="note-block">
          <p class="poem-line">${karaokeHtml(c.line, -1)}</p>
          <p><span class="mini-label">${COPY.yiyi}</span>${c.yiyi}</p>
          <p><span class="mini-label">${COPY.duizhang}</span>${c.duizhang}</p>
          <button type="button" class="btn btn-ghost" data-speak-text="${encodeURIComponent(c.line)}">${COPY.listenCouplet}</button>
        </div>`
      )
      .join("");
    playEl.innerHTML = `
      <div class="study-shell">
        <div class="jump-title">${COPY.studyName} · ${POEM.title}　${POEM.author}</div>
        <div class="study-meta">
          <span><span class="mini-label">${COPY.ticai}</span>${POEM.form}</span>
          <span><span class="mini-label">${COPY.zhuzhi}</span>${POEM.theme}</span>
        </div>
        <p class="study-poem">${karaokeHtml(POEM.full, -1)}</p>
        <p class="rhyme-line"><span class="mini-label">${COPY.yunjiao}</span>${POEM.rhyme}</p>
        ${speakHintBlock()}
        <div class="write-toolbar">
          <button type="button" class="btn" data-speak="full">${COPY.listenFull}</button>
        </div>
        <h3 class="recap-sub">${COPY.koujue}</h3>
        ${koujueHtml()}
        <h3 class="recap-sub">${COPY.sibu}</h3>
        ${stepsHtml()}
        <h3 class="recap-sub">${COPY.fullPoem}</h3>
        ${notes}
        <h3 class="recap-sub">${COPY.nanzi}</h3>
        <ul class="word-list">${words}</ul>
        <div class="study-actions">
          <button type="button" class="btn" data-start="jump">${COPY.goJump}</button>
          <button type="button" class="btn btn-ghost" data-start="write">${COPY.goWrite}</button>
        </div>
      </div>
    `;
    updateHud();
  }

  function startJump(onlyWeak) {
    const weakIds = onlyWeak ? state.weak.map((w) => w.id) : [];
    let blanks = allBlanks();
    if (onlyWeak) {
      blanks = blanks.filter((b) => weakIds.includes(b.id));
      if (!blanks.length) blanks = allBlanks();
    }
    const skip = !!onlyWeak;
    resetRound(
      "jump",
      blanks.map((blank) => ({
        ...blank,
        choices: shuffle(blank.choices.slice()),
      }))
    );
    state.skipCoupletCards = skip;
    renderJump();
  }

  function jumperSvg() {
    const h = Math.min(state.streak, 8) * 12;
    return `<svg class="jumper" id="jumper" viewBox="0 0 72 88" aria-hidden="true" style="--streak-h:${h}px">
      <circle cx="36" cy="16" r="12" fill="#7a1d1d"/>
      <circle cx="36" cy="16" r="8" fill="#f8e7d4"/>
      <path d="M36 28 L36 52 L22 78 M36 52 L50 78 M18 44 H54" stroke="#7a1d1d" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  function mountainFillPct() {
    const item = current();
    const n = item && item.coupletIndex != null ? item.coupletIndex : 0;
    return 18 + n * 20;
  }

  function renderJump() {
    state.phase = "blank";
    state.firstTry = true;
    state.locked = false;
    const item = current();
    const couplet = coupletOf(item);
    const choices = item.choices
      .map(
        (choice, i) => `
        <button type="button" class="choice" data-choice="${i}">
          <span class="choice-key">${i + 1}</span>
          ${choice.text}
        </button>`
      )
      .join("");
    playEl.innerHTML = `
      <div class="jump-shell">
        <div class="jump-top">
          <div class="jump-title">${COPY.jumpName} · ${POEM.title}　${POEM.author}</div>
          <div class="built-line">${formatBuilt(builtUpTo(item, false))}</div>
          <p class="key-hint jump-hint">${item.hint}</p>
        </div>
        <div class="jump-board">
          <div class="mountain" aria-hidden="true">
            <div class="mountain-fill" style="height:${mountainFillPct()}%"></div>
          </div>
          <div class="scene-label">${item.scene.top || "　"}</div>
          ${jumperSvg()}
          <div class="choice-row">${choices}</div>
          <div class="miss-panel" id="miss-panel" hidden></div>
          <div class="scene-label">${item.scene.bottom || "　"}</div>
        </div>
        <div class="jump-foot">
          <div class="label">${couplet.name} · ${COPY.round}${item.coupletIndex + 1}${COPY.of}${POEM.couplets.length}${COPY.lian}</div>
          <div class="progress-strip">${COPY.keysHint} · ${COPY.streak} ${state.streak}</div>
        </div>
      </div>
    `;
    updateHud();
  }

  function setChoicesLocked(locked) {
    playEl.querySelectorAll(".choice").forEach((btn) => {
      btn.classList.toggle("locked", locked);
      btn.disabled = locked;
    });
  }

  function showJumpExplain(choice) {
    const item = current();
    const correct = item.choices.find((c) => c.ok);
    const panel = document.getElementById("miss-panel");
    if (!panel) return;
    const kind = item.kind ? `<span class="miss-kind">${escapeHtml(item.kind)}</span>` : "";
    panel.innerHTML = `
      ${kind}
      <p>${COPY.jumpPicked}「${escapeHtml(choice.text)}」，${COPY.shouldBe}「${escapeHtml(correct ? correct.text : "")}」</p>
      <p class="miss-why">${escapeHtml(item.why || "")}</p>
      <button type="button" class="btn" data-got-it="1">${COPY.gotIt}</button>
    `;
    panel.hidden = false;
  }

  function unlockJumpRetry() {
    if (state.mode !== "jump" || state.phase !== "explain") return;
    state.phase = "blank";
    state.locked = false;
    playEl.querySelectorAll(".choice").forEach((btn) => {
      btn.classList.remove("bad", "ok", "locked");
      btn.disabled = false;
    });
    const panel = document.getElementById("miss-panel");
    if (panel) {
      panel.hidden = true;
      panel.innerHTML = "";
    }
    const jumper = document.getElementById("jumper");
    if (jumper) jumper.classList.remove("shake", "up-left", "up-right");
  }

  function pickJump(index) {
    if (state.mode !== "jump" || state.phase !== "blank" || state.locked) return;
    const item = current();
    const choice = item.choices[index];
    const btn = playEl.querySelectorAll(".choice")[index];
    const jumper = document.getElementById("jumper");
    if (!choice || !btn) return;
    jumper.classList.remove("up-left", "up-right", "shake");
    void jumper.getBoundingClientRect();
    if (choice.ok) {
      state.locked = true;
      if (state.firstTry) {
        state.hits += 1;
        state.streak += 1;
      }
      btn.classList.add("ok");
      setChoicesLocked(true);
      jumper.style.setProperty("--streak-h", `${Math.min(state.streak, 8) * 12}px`);
      jumper.classList.add(index === 0 ? "up-left" : "up-right");
      const built = playEl.querySelector(".built-line");
      if (built) built.textContent = formatBuilt(builtUpTo(item, true));
      updateHud();
      later(advance, 700);
    } else {
      if (state.firstTry) {
        state.misses += 1;
        state.firstTry = false;
        if (!state.weak.some((w) => w.id === item.id)) {
          const correct = item.choices.find((c) => c.ok);
          state.weak.push({
            id: item.id,
            hint: item.hint,
            picked: choice.text,
            correct: correct ? correct.text : "",
            kind: item.kind || "",
            why: item.why || "",
          });
        }
      }
      state.streak = 0;
      state.locked = true;
      state.phase = "explain";
      jumper.style.setProperty("--streak-h", "0px");
      btn.classList.add("bad");
      jumper.classList.add("shake");
      setChoicesLocked(true);
      showJumpExplain(choice);
      updateHud();
    }
  }

  function advance() {
    if (state.view !== "play" || state.mode !== "jump") return;
    clearTimeout(state.timer);
    state.locked = false;
    if (isLastOfCouplet() && !state.skipCoupletCards) {
      renderCoupletCard();
      return;
    }
    state.index += 1;
    if (state.index >= state.deck.length) {
      renderRecap();
      return;
    }
    renderJump();
  }

  function renderCoupletCard() {
    state.phase = "couplet";
    const item = current();
    const couplet = coupletOf(item);
    const last = state.index >= state.deck.length - 1;
    playEl.innerHTML = `
      <div class="jump-shell">
        <div class="jump-top">
          <div class="jump-title">${couplet.name} · ${POEM.title}</div>
          <div class="built-line">${formatBuilt(builtUpTo(item, true))}</div>
        </div>
        <div class="couplet-card">
          <p class="poem-line">${karaokeHtml(couplet.line, -1)}</p>
          <p><span class="mini-label">${COPY.yiyi}</span>${couplet.yiyi}</p>
          <p><span class="mini-label">${COPY.duizhang}</span>${couplet.duizhang}</p>
          ${speakHintBlock()}
          <div class="couplet-actions">
            <button type="button" class="btn btn-ghost" data-speak="couplet">${COPY.listenCouplet}</button>
            <button type="button" class="btn" data-next-couplet="1">${last ? COPY.seeResult : COPY.nextCouplet}</button>
          </div>
        </div>
      </div>
    `;
    updateHud();
  }

  function continueAfterCouplet() {
    if (state.mode !== "jump" || state.phase !== "couplet") return;
    state.index += 1;
    state.locked = false;
    if (state.index >= state.deck.length) {
      renderRecap();
      return;
    }
    renderJump();
  }

  function difficultyLabel() {
    if (state.difficulty === "hard") return COPY.hard;
    return COPY.normal;
  }

  function snakeStepMs() {
    return SNAKE_MS[state.difficulty] || SNAKE_MS.normal;
  }

  function stopSnake() {
    if (state.snakeRaf) {
      cancelAnimationFrame(state.snakeRaf);
      state.snakeRaf = null;
    }
  }

  function startSnakeTick() {
    stopSnake();
    const s = state.snake;
    if (!s) return;
    s.tickAt = performance.now();
    if (!s.prevBody || !s.prevBody.length) s.prevBody = s.body.slice();
    function loop(now) {
      state.snakeRaf = requestAnimationFrame(loop);
      if (state.mode !== "snake" || state.view !== "play") {
        stopSnake();
        return;
      }
      if (state.phase === "blank" && !state.locked && now - s.tickAt >= snakeStepMs()) {
        snakeMove();
      }
      drawSnakeWorm(now);
    }
    state.snakeRaf = requestAnimationFrame(loop);
  }

  function snakeNote() {
    if (state.difficulty === "hard") return COPY.snakeNoteHard;
    return COPY.snakeNoteNormal;
  }

  function renderSnakeSetup() {
    const chips = ["normal", "hard"]
      .map(function (id) {
        const on = state.difficulty === id;
        return `<button type="button" class="chip${on ? " active" : ""}" data-diff="${id}" aria-pressed="${
          on ? "true" : "false"
        }">${COPY[id]}</button>`;
      })
      .join("");
    hubEl.innerHTML = `
      <div class="taiko-panel">
        <div class="setup-viewport">
          <p class="track">${COPY.trackPoem}</p>
          <p class="chip-label" id="chip-diff">${COPY.snakeDiff}</p>
          <p class="pick-note">${COPY.snakeSetupHint}</p>
          <div class="chip-row" role="group" aria-labelledby="chip-diff">${chips}</div>
          <p class="pick-note">${snakeNote()}</p>
          <div class="hub-actions">
            <button type="button" class="btn" data-snake-go="1">${COPY.snakeSetupStart}</button>
            <button type="button" class="btn btn-ghost" data-setup-back="1">${COPY.snakeSetupBack}</button>
          </div>
        </div>
      </div>
    `;
    updateHud();
  }

  function openSnakeSetup(onlyWeak) {
    clearTimeout(state.timer);
    stopSnake();
    stopSpeech();
    hideConfirm();
    state.mode = "snake";
    state.phase = "setup";
    state.snakeSetupWeak = !!onlyWeak;
    state.snake = null;
    show("hub");
    renderSnakeSetup();
  }

  function closeSnakeSetup() {
    state.mode = null;
    state.phase = "hub";
    state.snakeSetupWeak = false;
    show("hub");
    renderHub();
    updateHud();
  }

  function startSnake(onlyWeak) {
    const weakIds = onlyWeak ? state.weak.map((w) => w.id) : [];
    let blanks = allBlanks();
    if (onlyWeak) {
      blanks = blanks.filter((b) => weakIds.includes(b.id));
      if (!blanks.length) blanks = allBlanks();
    }
    resetRound(
      "snake",
      blanks.map((blank) => ({
        ...blank,
        choices: shuffle(blank.choices.slice()),
      }))
    );
    initSnakeGame();
    renderSnake();
    startSnakeTick();
  }

  function initSnakeGame() {
    const zone = [];
    const total = SNAKE_COLS * SNAKE_ROWS;
    for (let i = 0; i < total; i++) {
      const col = i % SNAKE_COLS;
      const row = (i / SNAKE_COLS) >> 0;
      zone.push({
        col,
        row,
        left: col > 0 ? i - 1 : -1,
        right: col < SNAKE_COLS - 1 ? i + 1 : -1,
        up: row > 0 ? i - SNAKE_COLS : -1,
        down: row < SNAKE_ROWS - 1 ? i + SNAKE_COLS : -1,
        fill: undefined,
      });
    }
    state.snake = { zone, body: [], prevBody: [], foods: [], dir: "right", queued: [], tickAt: 0 };
    snakeSpawn();
    snakeFeed();
  }

  function snakeSpawn() {
    const s = state.snake;
    s.body.forEach((i) => {
      if (s.zone[i]) s.zone[i].fill = undefined;
    });
    s.body = [];
    const row = (SNAKE_ROWS / 2) >> 0;
    const headCol = (SNAKE_COLS / 2) >> 0;
    for (let i = 0; i < SNAKE_MIN; i++) {
      const index = row * SNAKE_COLS + (headCol - i);
      s.body.push(index);
      s.zone[index].fill = "snake";
    }
    s.dir = "right";
    s.queued = [];
    s.prevBody = s.body.slice();
    s.tickAt = performance.now();
  }

  function snakeEmpty() {
    const out = [];
    const zone = state.snake.zone;
    for (let i = 0; i < zone.length; i++) {
      const cell = zone[i];
      if (cell.fill !== undefined) continue;
      if (cell.col < 1 || cell.col > SNAKE_COLS - 2) continue;
      if (cell.row < 1 || cell.row > SNAKE_ROWS - 2) continue;
      out.push(i);
    }
    return out;
  }

  function snakePickEmpty(minAway, avoidFoods) {
    let empty = snakeEmpty();
    if (minAway > 0) {
      const body = state.snake.body;
      const far = empty.filter(function (i) {
        const col = i % SNAKE_COLS;
        const row = (i / SNAKE_COLS) >> 0;
        return body.every(function (b) {
          return Math.max(Math.abs(col - (b % SNAKE_COLS)), Math.abs(row - ((b / SNAKE_COLS) >> 0))) >= minAway;
        });
      });
      if (far.length) empty = far;
    }
    if (avoidFoods && avoidFoods.length) {
      const spaced = empty.filter(function (i) {
        const col = i % SNAKE_COLS;
        const row = (i / SNAKE_COLS) >> 0;
        return avoidFoods.every(function (j) {
          const dc = Math.abs(col - (j % SNAKE_COLS));
          const dr = Math.abs(row - ((j / SNAKE_COLS) >> 0));
          if (dc === 0 || dr === 0) return false;
          return dc > 1 || dr > 1;
        });
      });
      if (spaced.length) empty = spaced;
    }
    if (!empty.length) return -1;
    return empty[(Math.random() * empty.length) >> 0];
  }

  function snakeClearFoods() {
    if (!state.snake) return;
    state.snake.foods.forEach((f) => {
      const cell = state.snake.zone[f.index];
      if (cell && cell.fill === "food") cell.fill = undefined;
    });
    state.snake.foods = [];
  }

  function snakeFeed() {
    const item = current();
    snakeClearFoods();
    if (!item) return;
    const correct = item.choices.find((c) => c.ok);
    const decoy = item.choices.find((c) => !c.ok);
    const texts = [];
    if (correct) texts.push({ text: correct.text, ok: true });
    if (decoy) texts.push({ text: decoy.text, ok: false });
    if (state.difficulty === "hard") {
      const used = new Set(texts.map((t) => t.text));
      const pool = shuffle(
        Array.from(
          new Set(
            allBlanks()
              .flatMap((b) => b.choices.map((c) => c.text))
              .filter((text) => !used.has(text))
          )
        )
      );
      if (pool[0]) texts.push({ text: pool[0], ok: false });
    }
    const foods = [];
    texts.forEach((choice) => {
      const index = snakePickEmpty(
        state.index === 0 ? 2 : 0,
        foods.map(function (f) {
          return f.index;
        })
      );
      if (index === -1) return;
      state.snake.zone[index].fill = "food";
      foods.push({ index, text: choice.text, ok: !!choice.ok });
    });
    state.snake.foods = foods;
  }

  function snakeTurn(dir) {
    const s = state.snake;
    if (!s) return;
    const last = s.queued[0] || s.dir;
    if (dir === last || SNAKE_OPP[dir] === last) return;
    if (s.queued.length < 5) s.queued.unshift(dir);
  }

  function snakeMove() {
    const s = state.snake;
    if (!s) return;
    if (s.queued.length) s.dir = s.queued.pop();
    const head = s.zone[s.body[0]];
    const next = head[s.dir];
    if (next === -1) {
      snakeMiss("bounds");
      return;
    }
    const tail = s.body[s.body.length - 1];
    const skipTail = tail === next;
    const fill = s.zone[next].fill;
    if (fill === "food") {
      snakeEat(next);
      return;
    }
    if (fill === "snake" && !skipTail) {
      snakeMiss("self");
      return;
    }
    const prev = s.body.slice();
    s.zone[tail].fill = undefined;
    s.body.pop();
    s.body.unshift(next);
    s.zone[next].fill = "snake";
    s.prevBody = prev;
    s.tickAt = performance.now();
  }

  function snakeEat(index) {
    const s = state.snake;
    const food = s.foods.find((f) => f.index === index);
    if (!food) return;
    if (!food.ok) {
      snakeMiss("decoy", food);
      return;
    }
    const prev = s.body.slice();
    s.body.unshift(index);
    s.zone[index].fill = "snake";
    s.prevBody = [prev[0]].concat(s.body.slice(1));
    s.tickAt = performance.now();
    snakeClearFoods();
    if (state.firstTry) {
      state.hits += 1;
      state.streak += 1;
    }
    state.index += 1;
    state.firstTry = true;
    if (state.index >= state.deck.length) {
      stopSnake();
      renderRecap();
      return;
    }
    snakeFeed();
    updateSnakeChrome();
    updateHud();
    paintSnake();
  }

  function snakeMiss(kind, food) {
    const item = current();
    const correct = item.choices.find((c) => c.ok);
    if (state.firstTry) {
      state.misses += 1;
      state.firstTry = false;
      if (!state.weak.some((w) => w.id === item.id)) {
        let picked = COPY.snakeWall;
        if (kind === "self") picked = COPY.snakeSelf;
        if (kind === "decoy" && food) picked = food.text;
        state.weak.push({
          id: item.id,
          hint: item.hint,
          picked,
          correct: correct ? correct.text : "",
          kind: item.kind || "",
          why: item.why || "",
        });
      }
    }
    state.streak = 0;
    state.locked = true;
    state.phase = "explain";
    updateHud();
    showSnakeExplain(kind, food, correct);
    drawSnakeWorm(performance.now());
    stopSnake();
  }

  function showSnakeExplain(kind, food, correct) {
    const panel = document.getElementById("miss-panel");
    if (!panel) return;
    const item = current();
    const kindHtml = item.kind ? `<span class="miss-kind">${escapeHtml(item.kind)}</span>` : "";
    let lead;
    if (kind === "bounds") {
      lead = `<p>${COPY.snakeWall}</p><p>${COPY.shouldBe}「${escapeHtml(correct ? correct.text : "")}」</p>`;
    } else if (kind === "self") {
      lead = `<p>${COPY.snakeSelf}</p><p>${COPY.shouldBe}「${escapeHtml(correct ? correct.text : "")}」</p>`;
    } else {
      lead = `<p>${COPY.jumpPicked}「${escapeHtml(food ? food.text : "")}」，${COPY.shouldBe}「${escapeHtml(correct ? correct.text : "")}」</p>`;
    }
    panel.innerHTML = `
      ${kindHtml}
      ${lead}
      <p class="miss-why">${escapeHtml(item.why || "")}</p>
      <button type="button" class="btn" data-got-it="1">${COPY.snakeGotIt}</button>
    `;
    panel.hidden = false;
  }

  function unlockSnakeRetry() {
    if (state.mode !== "snake" || state.phase !== "explain") return;
    state.phase = "blank";
    state.locked = false;
    const panel = document.getElementById("miss-panel");
    if (panel) {
      panel.hidden = true;
      panel.innerHTML = "";
    }
    snakeClearFoods();
    snakeSpawn();
    snakeFeed();
    paintSnake();
    drawSnakeWorm(performance.now());
    startSnakeTick();
  }

  function updateSnakeChrome() {
    const item = current();
    if (!item) return;
    const couplet = coupletOf(item);
    const built = playEl.querySelector(".built-line");
    if (built) built.textContent = formatBuilt(builtUpTo(item, false));
    const hint = playEl.querySelector(".jump-hint");
    if (hint) hint.textContent = item.hint;
    const label = playEl.querySelector(".snake-couplet");
    if (label) {
      label.textContent =
        `${couplet.name} · ${COPY.round}${item.coupletIndex + 1}${COPY.of}${POEM.couplets.length}${COPY.lian}`;
    }
    const strip = playEl.querySelector(".progress-strip");
    if (strip) strip.textContent = `${COPY.snakeKeys} · ${COPY.streak} ${state.streak}`;
  }

  function paintSnake() {
    const grid = document.getElementById("snake-grid");
    const s = state.snake;
    if (!grid || !s) return;
    const cells = grid.children;
    for (let i = 0; i < cells.length; i++) {
      cells[i].className = "snake-cell";
      cells[i].innerHTML = "";
    }
    s.foods.forEach((f) => {
      const cell = cells[f.index];
      if (!cell) return;
      cell.classList.add("is-food");
      cell.innerHTML = `<span class="snake-chip">${escapeHtml(f.text)}</span>`;
    });
  }

  function snakeCellCenter(index) {
    return {
      x: (index % SNAKE_COLS) + 0.5,
      y: ((index / SNAKE_COLS) >> 0) + 0.5,
    };
  }

  function snakeJoinPath(pts) {
    const path = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = path[path.length - 1];
      const b = pts[i];
      if (Math.abs(b.x - a.x) > 0.12 && Math.abs(b.y - a.y) > 0.12) {
        path.push({ x: a.x, y: b.y });
      }
      path.push(b);
    }
    return path;
  }

  function snakeSamplePath(path, step) {
    const out = [{ x: path[0].x, y: path[0].y }];
    let remain = step;
    for (let i = 1; i < path.length; i++) {
      let x = path[i - 1].x;
      let y = path[i - 1].y;
      const nx = path[i].x;
      const ny = path[i].y;
      let dx = nx - x;
      let dy = ny - y;
      let len = Math.hypot(dx, dy);
      if (len < 1e-6) continue;
      const ux = dx / len;
      const uy = dy / len;
      while (len >= remain) {
        x += ux * remain;
        y += uy * remain;
        out.push({ x, y });
        len -= remain;
        remain = step;
      }
      remain -= len;
    }
    const last = path[path.length - 1];
    const tip = out[out.length - 1];
    if (Math.hypot(last.x - tip.x, last.y - tip.y) > 0.02) out.push(last);
    return out;
  }

  function drawSnakeWorm(now) {
    const layer = document.getElementById("snake-worm");
    const grid = document.getElementById("snake-grid");
    const s = state.snake;
    if (!layer || !grid || !s || !s.body.length) return;
    const width = grid.clientWidth;
    const height = grid.clientHeight;
    if (!width || !height) return;
    const cellW = width / SNAKE_COLS;
    const cellH = height / SNAKE_ROWS;
    const size = Math.min(cellW, cellH) * 1.18;
    let p = s.tickAt ? (now - s.tickAt) / snakeStepMs() : 1;
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    const prev = s.prevBody && s.prevBody.length ? s.prevBody : s.body;
    const pts = [];
    for (let i = 0; i < s.body.length; i++) {
      const to = snakeCellCenter(s.body[i]);
      const from = snakeCellCenter(prev[i] == null ? prev[0] : prev[i]);
      pts.push({
        x: from.x + (to.x - from.x) * p,
        y: from.y + (to.y - from.y) * p,
      });
    }
    const filled = snakeSamplePath(snakeJoinPath(pts), 0.36);
    while (layer.children.length < filled.length) {
      const dot = document.createElement("div");
      dot.className = "snake-dot";
      layer.appendChild(dot);
    }
    while (layer.children.length > filled.length) layer.removeChild(layer.lastChild);
    for (let i = 0; i < filled.length; i++) {
      const x = filled[i].x * cellW;
      const y = filled[i].y * cellH;
      const dot = layer.children[i];
      dot.classList.toggle("is-head", i === 0);
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
    }
  }

  function renderSnake() {
    state.phase = "blank";
    state.locked = false;
    const item = current();
    const couplet = coupletOf(item);
    const cells = state.snake.zone.map(() => `<div class="snake-cell"></div>`).join("");
    playEl.innerHTML = `
      <div class="jump-shell snake-shell">
        <div class="jump-top">
          <div class="jump-title">${COPY.snakeName} · ${POEM.title}　${POEM.author}</div>
          <div class="built-line">${formatBuilt(builtUpTo(item, false))}</div>
          <p class="key-hint jump-hint">${item.hint}</p>
        </div>
        <div class="snake-board">
          <div class="snake-stage">
            <div class="snake-grid" id="snake-grid" style="--cols:${SNAKE_COLS};--rows:${SNAKE_ROWS}">${cells}</div>
            <div class="snake-worm" id="snake-worm"></div>
          </div>
          <div class="miss-panel" id="miss-panel" hidden></div>
        </div>
        <div class="jump-foot">
          <div class="label snake-couplet">${couplet.name} · ${COPY.round}${item.coupletIndex + 1}${COPY.of}${POEM.couplets.length}${COPY.lian}</div>
          <div class="progress-strip">${COPY.snakeKeys} · ${COPY.streak} ${state.streak}</div>
        </div>
      </div>
    `;
    paintSnake();
    drawSnakeWorm(performance.now());
    updateHud();
  }

  function startWrite(onlyWeak) {
    const weakIds = onlyWeak ? state.weak.map((w) => w.id) : [];
    let indices = POEM.couplets.map((_, i) => i);
    if (onlyWeak) {
      indices = indices.filter((i) => weakIds.includes(POEM.couplets[i].id));
      if (!indices.length) indices = POEM.couplets.map((_, i) => i);
    }
    resetRound(
      "write",
      indices.map((i) => ({
        id: POEM.couplets[i].id,
        coupletIndex: i,
      }))
    );
    renderWrite();
  }

  function stripPunct(text) {
    return String(text || "")
      .replace(/\s+/g, "")
      .replace(/[，。、；,.!！？?：:]/g, "");
  }

  function coupletHalves(line) {
    const lines = splitLines(line).map((piece) => stripPunct(piece));
    return {
      upper: lines[0] || "",
      lower: lines[1] || "",
    };
  }

  function paintMarks(marks) {
    if (!marks.length) return "（空白）";
    return marks
      .map((m) => `<span class="${m.ok ? "ch-ok" : "ch-bad"}">${escapeHtml(m.ch)}</span>`)
      .join("");
  }

  function alignDiff(typedArr, expectArr) {
    const n = typedArr.length;
    const m = expectArr.length;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    for (let i = 0; i <= n; i++) dp[i][0] = i;
    for (let j = 0; j <= m; j++) dp[0][j] = j;
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (typedArr[i - 1] === expectArr[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    let i = n;
    let j = m;
    const tMarks = [];
    const eMarks = [];
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && typedArr[i - 1] === expectArr[j - 1]) {
        tMarks.push({ ch: typedArr[i - 1], ok: true });
        eMarks.push({ ch: expectArr[j - 1], ok: true });
        i -= 1;
        j -= 1;
      } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
        tMarks.push({ ch: typedArr[i - 1], ok: false });
        eMarks.push({ ch: expectArr[j - 1], ok: false });
        i -= 1;
        j -= 1;
      } else if (i > 0 && (j === 0 || dp[i][j] === dp[i - 1][j] + 1)) {
        tMarks.push({ ch: typedArr[i - 1], ok: false });
        i -= 1;
      } else {
        eMarks.push({ ch: expectArr[j - 1], ok: false });
        j -= 1;
      }
    }
    tMarks.reverse();
    eMarks.reverse();
    return {
      ok: n === m && tMarks.every((mark) => mark.ok),
      typedHtml: paintMarks(tMarks),
      expectHtml: paintMarks(eMarks),
      extra: typedArr.length > 5 ? typedArr.slice(5).join("") : "",
    };
  }

  function markLine(typed, expected) {
    return alignDiff(Array.from(stripPunct(typed)), Array.from(stripPunct(expected)));
  }

  function gridCells(typed, limit) {
    const chars = Array.from(stripPunct(typed));
    const cells = [];
    for (let i = 0; i < limit; i++) {
      cells.push(`<span class="write-cell">${chars[i] ? escapeHtml(chars[i]) : "□"}</span>`);
    }
    const extra = chars.slice(limit);
    const extraHtml = extra.length
      ? `<span class="write-extra">${COPY.extraChars} ${extra.map((ch) => escapeHtml(ch)).join("")}</span>`
      : "";
    return cells.join("") + extraHtml;
  }

  function renderWrite() {
    state.phase = "write";
    const item = current();
    const couplet = coupletOf(item);
    const last = state.index >= state.deck.length - 1;
    const mark = state.writeMarks[state.index];
    let body;
    if (state.writeChecked && mark) {
      const extraUpper = mark.upperExtra
        ? `<p class="write-extra-line">${COPY.extraChars}：${escapeHtml(mark.upperExtra)}</p>`
        : "";
      const extraLower = mark.lowerExtra
        ? `<p class="write-extra-line">${COPY.extraChars}：${escapeHtml(mark.lowerExtra)}</p>`
        : "";
      body = `
        <div class="write-result${mark.ok ? " ok" : " bad"}">
          <p class="write-line-label">${COPY.upperLine}</p>
          <p>${COPY.picked}：<span class="char-diff">${mark.upperTypedHtml}</span></p>
          <p>${COPY.shouldBe}：<span class="char-diff">${mark.upperExpectHtml}</span></p>
          ${extraUpper}
          <p class="write-line-label">${COPY.lowerLine}</p>
          <p>${COPY.picked}：<span class="char-diff">${mark.lowerTypedHtml}</span></p>
          <p>${COPY.shouldBe}：<span class="char-diff">${mark.lowerExpectHtml}</span></p>
          ${extraLower}
        </div>
        <button type="button" class="btn" data-write-next="1">${last ? COPY.seeResult : COPY.nextCouplet}</button>
      `;
    } else {
      body = `
        <form id="write-form" class="write-form">
          <label class="write-row">
            <span>${COPY.upperLine}</span>
            <div class="write-grid" data-grid="upper">${gridCells("", 5)}</div>
            <input type="text" autocomplete="off" spellcheck="false" data-write="upper" aria-label="${COPY.upperLine}" />
          </label>
          <label class="write-row">
            <span>${COPY.lowerLine}</span>
            <div class="write-grid" data-grid="lower">${gridCells("", 5)}</div>
            <input type="text" autocomplete="off" spellcheck="false" data-write="lower" aria-label="${COPY.lowerLine}" />
          </label>
          <button type="submit" class="btn">${COPY.checkAnswers}</button>
        </form>
      `;
    }
    const peeked = state.writePeeked
      ? `<p class="write-yiyi"><span class="mini-label">${COPY.yiyi}</span>${couplet.yiyi}</p>`
      : `<button type="button" class="btn btn-ghost" data-peek-yiyi="1">${COPY.peekYiyi}</button>`;
    playEl.innerHTML = `
      <div class="write-shell">
        <div class="jump-title">${COPY.writeName} · ${POEM.title}　${POEM.author}</div>
        <p class="write-intro">${COPY.writeIntro}</p>
        ${speakHintBlock()}
        <div class="write-toolbar">
          <button type="button" class="btn btn-ghost" data-speak="couplet">${COPY.listenCouplet}</button>
          ${state.writeChecked ? "" : peeked}
        </div>
        ${body}
      </div>
    `;
    const input = playEl.querySelector("[data-write='upper']");
    if (input) input.focus();
    updateHud();
  }

  function peekYiyi() {
    if (state.writeChecked || state.writePeeked) return;
    state.writePeeked = true;
    const couplet = coupletOf(current());
    const toolbar = playEl.querySelector(".write-toolbar");
    const btn = playEl.querySelector("[data-peek-yiyi]");
    if (!toolbar || !btn) return;
    const note = document.createElement("p");
    note.className = "write-yiyi";
    note.innerHTML = `<span class="mini-label">${COPY.yiyi}</span>${couplet.yiyi}`;
    btn.replaceWith(note);
  }

  function markWrite(form) {
    if (state.writeChecked) return;
    const couplet = coupletOf(current());
    const halves = coupletHalves(couplet.line);
    const upperInput = form.querySelector("[data-write='upper']");
    const lowerInput = form.querySelector("[data-write='lower']");
    const upperTyped = upperInput ? upperInput.value : "";
    const lowerTyped = lowerInput ? lowerInput.value : "";
    const upperDiff = markLine(upperTyped, halves.upper);
    const lowerDiff = markLine(lowerTyped, halves.lower);
    const ok = upperDiff.ok && lowerDiff.ok;
    const mark = {
      name: couplet.name,
      line: couplet.line,
      typed: `${stripPunct(upperTyped)}，${stripPunct(lowerTyped)}`,
      ok,
      typedHtml: `${upperDiff.typedHtml}，${lowerDiff.typedHtml}`,
      expectHtml: `${upperDiff.expectHtml}，${lowerDiff.expectHtml}`,
      upperTypedHtml: upperDiff.typedHtml,
      upperExpectHtml: upperDiff.expectHtml,
      lowerTypedHtml: lowerDiff.typedHtml,
      lowerExpectHtml: lowerDiff.expectHtml,
      upperExtra: upperDiff.extra,
      lowerExtra: lowerDiff.extra,
    };
    state.writeMarks[state.index] = mark;
    if (ok) {
      state.hits += 1;
    } else {
      state.misses += 1;
      if (!state.weak.some((w) => w.id === couplet.id)) {
        state.weak.push({
          id: couplet.id,
          hint: couplet.name,
          picked: mark.typed || "（空白）",
          correct: couplet.line,
          typedHtml: mark.typedHtml,
          expectHtml: mark.expectHtml,
        });
      }
    }
    state.writeChecked = true;
    renderWrite();
  }

  function advanceWrite() {
    state.writeChecked = false;
    state.writePeeked = false;
    state.index += 1;
    if (state.index >= state.deck.length) {
      renderRecap();
      return;
    }
    renderWrite();
  }

  function burstConfetti() {
    const bits = [];
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    for (let i = 0; i < 80; i++) {
      bits.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 80,
        r: 3 + Math.random() * 4,
        vy: 3 + Math.random() * 4,
        vx: -2 + Math.random() * 4,
        color: ["#c81e1e", "#f5c542", "#178a57", "#fff"][i % 4],
      });
    }
    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, w, h);
      bits.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.r, b.r * 1.4);
      });
      frame += 1;
      if (frame < 70) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    }
    tick();
  }

  function koujueHtml() {
    return `<div class="note-block"><p><span class="mini-label">${COPY.koujue}</span>${escapeHtml(POEM.koujue)}</p></div>`;
  }

  function stepsHtml() {
    return (POEM.steps || [])
      .map(
        (s) => `
        <div class="note-block">
          <p><span class="mini-label">${escapeHtml(s.name)}</span>${escapeHtml(s.focus)}</p>
          <p class="poem-line">${escapeHtml(s.line)}</p>
        </div>`
      )
      .join("");
  }

  function recapCoachHtml() {
    const seen = [];
    const tips = [];
    state.weak.forEach((w) => {
      const kind = w.kind;
      const line = kind && COPY.coachKind && COPY.coachKind[kind];
      if (!line || seen.indexOf(kind) !== -1) return;
      seen.push(kind);
      tips.push(
        `<li><span class="miss-kind">${escapeHtml(kind)}</span>${escapeHtml(line)}</li>`
      );
    });
    const coach = tips.length
      ? `<h3 class="recap-sub">${COPY.coach}</h3><ul class="weak-list">${tips.join("")}</ul>`
      : "";
    return `${coach}<h3 class="recap-sub">${COPY.skeleton}</h3>${koujueHtml()}${stepsHtml()}`;
  }

  function poemNotesHtml() {
    return POEM.couplets
      .map(
        (c) => `
        <div class="note-block">
          <p class="poem-line">${karaokeHtml(c.line, -1)}</p>
          <p><span class="mini-label">${COPY.yiyi}</span>${c.yiyi}</p>
          <p><span class="mini-label">${COPY.duizhang}</span>${c.duizhang}</p>
        </div>`
      )
      .join("");
  }

  function recapWeakItem(w) {
    const label = state.mode === "write" ? COPY.picked : COPY.jumpPicked;
    const kind = w.kind ? `<span class="miss-kind">${escapeHtml(w.kind)}</span>` : "";
    const why = w.why
      ? `<span class="weak-hint">${escapeHtml(w.why)}</span>`
      : `<span class="weak-hint">（${escapeHtml(w.hint)}）</span>`;
    if (w.typedHtml) {
      return `<li>${kind}${label}「${w.typedHtml}」，${COPY.shouldBe}「${w.expectHtml}」${why}</li>`;
    }
    return `<li>${kind}${label}「${escapeHtml(w.picked)}」，${COPY.shouldBe}「${escapeHtml(w.correct)}」${why}</li>`;
  }

  function renderRecap() {
    stopSnake();
    show("recap");
    hudEl.hidden = true;
    persistWeak();
    const clean = state.misses === 0;
    let weakHtml;
    if (state.weak.length) {
      weakHtml =
        `<p>${COPY.keep}</p><ul class="weak-list">${state.weak.map(recapWeakItem).join("")}</ul>`;
    } else {
      weakHtml = `<p>${COPY.clean}。</p>`;
    }
    const retryBtn =
      state.weak.length && (state.mode === "jump" || state.mode === "write" || state.mode === "snake")
        ? `<button type="button" class="btn btn-ghost" data-retry-weak="1">${COPY.retryWrong}</button>`
        : "";
    const hitLabel = state.mode === "write" ? COPY.writeHits : COPY.hits;
    const missLabel = state.mode === "write" ? COPY.writeMiss : COPY.misses;
    const total = state.deck.length || 0;
    const hitValue =
      (state.mode === "jump" || state.mode === "snake") && total
        ? `${state.hits}/${total}`
        : String(state.hits);
    recapEl.innerHTML = `
      <div class="recap-card recap-wide">
        <h2>${COPY.recapTitle}</h2>
        ${state.mode === "snake" ? `<p class="recap-diff">${COPY.snakeName} · ${difficultyLabel()}</p>` : ""}
        <div class="score-row">
          <div><span>${hitLabel}</span><b>${hitValue}</b></div>
          <div><span>${missLabel}</span><b>${state.misses}</b></div>
        </div>
        ${weakHtml}
        ${recapCoachHtml()}
        <h3 class="recap-sub">${COPY.fullPoem} · ${POEM.title}</h3>
        <p class="study-poem recap-poem">${karaokeHtml(POEM.full, -1)}</p>
        ${poemNotesHtml()}
        ${speakHintBlock()}
        <div class="recap-actions">
          <button type="button" class="btn" data-replay="${state.mode}">${COPY.again}</button>
          ${retryBtn}
          <button type="button" class="btn btn-ghost" data-speak="full">${COPY.listenFull}</button>
          <button type="button" class="btn btn-ghost" data-home="1">${COPY.home}</button>
        </div>
      </div>
    `;
    if (clean) burstConfetti();
  }

  function hideConfirm() {
    confirmEl.hidden = true;
  }

  function requestGoHome() {
    if (state.view === "hub") return;
    if (state.view === "recap" || state.mode === "study" || state.phase === "setup") {
      goHome();
      return;
    }
    confirmEl.hidden = false;
  }

  function goHome() {
    clearTimeout(state.timer);
    stopSnake();
    stopSpeech();
    hideConfirm();
    state.mode = null;
    state.phase = "hub";
    state.deck = [];
    state.locked = false;
    state.writeMarks = [];
    state.writeChecked = false;
    state.writePeeked = false;
    state.skipCoupletCards = false;
    state.streak = 0;
    state.snake = null;
    state.snakeSetupWeak = false;
    show("hub");
    renderHub();
    updateHud();
  }

  function setDifficulty(next) {
    if (next !== "normal" && next !== "hard") return;
    state.difficulty = next;
    try {
      localStorage.setItem(DIFF_KEY, next);
    } catch (err) {
      /* ignore */
    }
    if (state.phase === "setup") renderSnakeSetup();
  }

  function setVoice(next) {
    state.voice = next;
    try {
      localStorage.setItem(VOICE_KEY, next);
    } catch (err) {
      /* ignore */
    }
    renderHub();
  }

  function startSavedWeak() {
    const saved = savedWeak();
    if (!saved) return;
    state.weak = saved.ids.map((id) => ({ id }));
    if (saved.mode === "write") startWrite(true);
    else if (saved.mode === "snake") openSnakeSetup(true);
    else startJump(true);
  }

  function startFromButton(mode) {
    if (mode === "jump") startJump(false);
    else if (mode === "write") startWrite(false);
    else if (mode === "snake") openSnakeSetup(false);
    else if (mode === "study") startStudy();
  }

  function speakFromButton(btn) {
    const kind = btn.getAttribute("data-speak");
    const encoded = btn.getAttribute("data-speak-text");
    if (encoded) {
      const host = btn.closest(".note-block") && btn.closest(".note-block").querySelector(".poem-line");
      speakLines(decodeURIComponent(encoded), host);
      return;
    }
    if (kind === "full") {
      speakLines(POEM.full, document.querySelector(".study-poem, .recap-poem"));
      return;
    }
    if (kind === "couplet") {
      const item = current();
      const line = item ? coupletOf(item).line : POEM.full;
      speakLines(line, document.querySelector(".couplet-card .poem-line"));
    }
  }

  hubEl.addEventListener("click", (e) => {
    const voice = e.target.closest("[data-voice]");
    if (voice) {
      setVoice(voice.getAttribute("data-voice"));
      return;
    }
    const diff = e.target.closest("[data-diff]");
    if (diff) {
      setDifficulty(diff.getAttribute("data-diff"));
      return;
    }
    if (e.target.closest("[data-snake-go]")) {
      startSnake(!!state.snakeSetupWeak);
      return;
    }
    if (e.target.closest("[data-setup-back]")) {
      closeSnakeSetup();
      return;
    }
    const speakBtn = e.target.closest("[data-speak]");
    if (speakBtn) {
      speakFromButton(speakBtn);
      return;
    }
    if (e.target.closest("[data-retry-saved]")) {
      startSavedWeak();
      return;
    }
    const start = e.target.closest("[data-start]");
    if (!start) return;
    startFromButton(start.getAttribute("data-start"));
  });

  playEl.addEventListener("click", (e) => {
    const start = e.target.closest("[data-start]");
    if (start) {
      startFromButton(start.getAttribute("data-start"));
      return;
    }
    const speakBtn = e.target.closest("[data-speak], [data-speak-text]");
    if (speakBtn) {
      speakFromButton(speakBtn);
      return;
    }
    if (e.target.closest("[data-got-it]")) {
      if (state.mode === "snake") unlockSnakeRetry();
      else unlockJumpRetry();
      return;
    }
    if (e.target.closest("[data-peek-yiyi]")) {
      peekYiyi();
      return;
    }
    const next = e.target.closest("[data-next-couplet]");
    if (next) {
      continueAfterCouplet();
      return;
    }
    const writeNext = e.target.closest("[data-write-next]");
    if (writeNext) {
      advanceWrite();
      return;
    }
    const choice = e.target.closest(".choice");
    if (choice && state.mode === "jump") {
      pickJump(Number(choice.getAttribute("data-choice")));
    }
  });

  playEl.addEventListener("input", (e) => {
    if (!e.target.matches("[data-write]")) return;
    const which = e.target.getAttribute("data-write");
    const grid = playEl.querySelector(`[data-grid="${which}"]`);
    if (grid) grid.innerHTML = gridCells(e.target.value, 5);
  });

  playEl.addEventListener("submit", (e) => {
    if (e.target.id !== "write-form") return;
    e.preventDefault();
    markWrite(e.target);
  });

  recapEl.addEventListener("click", (e) => {
    const speakBtn = e.target.closest("[data-speak]");
    if (speakBtn) {
      speakFromButton(speakBtn);
      return;
    }
    const retry = e.target.closest("[data-retry-weak]");
    if (retry) {
      if (state.mode === "write") startWrite(true);
      else if (state.mode === "snake") openSnakeSetup(true);
      else startJump(true);
      return;
    }
    const replay = e.target.closest("[data-replay]");
    if (replay) {
      const mode = replay.getAttribute("data-replay");
      if (mode === "write") startWrite(false);
      else if (mode === "snake") openSnakeSetup(false);
      else startJump(false);
      return;
    }
    if (e.target.closest("[data-home]")) goHome();
  });

  homeBtn.addEventListener("click", requestGoHome);

  confirmEl.addEventListener("click", (e) => {
    if (e.target.closest("[data-confirm='yes']")) {
      goHome();
      return;
    }
    if (e.target.closest("[data-confirm='no']") || e.target === confirmEl) {
      hideConfirm();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (!confirmEl.hidden) {
        hideConfirm();
        return;
      }
      requestGoHome();
      return;
    }
    if (state.view !== "play") return;
    if (e.key === "Enter" || e.key === " ") {
      if (state.mode === "jump" && state.phase === "explain") {
        e.preventDefault();
        unlockJumpRetry();
        return;
      }
      if (state.mode === "snake" && state.phase === "explain") {
        e.preventDefault();
        unlockSnakeRetry();
        return;
      }
      if (state.mode === "jump" && state.phase === "couplet") {
        e.preventDefault();
        continueAfterCouplet();
        return;
      }
      if (state.mode === "jump" && state.phase === "blank" && state.locked) {
        e.preventDefault();
        advance();
      }
      return;
    }
    if (state.mode === "snake" && state.phase === "blank" && !state.locked) {
      const dir = SNAKE_KEYS[e.key];
      if (!dir) return;
      e.preventDefault();
      snakeTurn(dir);
      return;
    }
    if (state.mode !== "jump" || state.phase !== "blank" || state.locked) return;
    if (e.key === "1" || e.key === "2") {
      pickJump(Number(e.key) - 1);
    }
  });

  if (window.speechSynthesis) {
    speechSynthesis.addEventListener("voiceschanged", () => {
      refreshVoiceHint();
      const hint = document.querySelector(".speak-hint");
      if (hint) hint.hidden = !state.speakHint;
    });
    speechSynthesis.getVoices();
  } else {
    state.speakHint = true;
  }

  hideConfirm();
  if (headerLead) headerLead.textContent = COPY.lead;
  renderHub();
  show("hub");
})();
