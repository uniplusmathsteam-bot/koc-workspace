(function () {
  const hubEl = document.getElementById("hub");
  const playEl = document.getElementById("play");
  const recapEl = document.getElementById("recap");
  const hudEl = document.getElementById("hud");
  const homeBtn = document.getElementById("btn-home");
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const leaveOverlay = document.getElementById("leave-overlay");
  const leaveStay = document.getElementById("leave-stay");
  const leaveHome = document.getElementById("leave-home");

  const CATS = [];
  TECHNIQUES.forEach(function (tech) {
    if (CATS.indexOf(tech.cat) === -1) CATS.push(tech.cat);
  });

  const state = {
    view: "hub",
    mode: null,
    stage: COPY.stageAll,
    cat: COPY.catAll,
    deck: [],
    index: 0,
    firstHits: 0,
    misses: 0,
    weak: [],
    locked: false,
    timer: null,
  };

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function overlayOpen() {
    return !leaveOverlay.hidden;
  }

  function hideOverlay() {
    leaveOverlay.hidden = true;
  }

  function showOverlay() {
    leaveOverlay.hidden = false;
  }

  function show(view) {
    state.view = view;
    hubEl.classList.toggle("active", view === "hub");
    playEl.classList.toggle("active", view === "play");
    recapEl.classList.toggle("active", view === "recap");
    hudEl.hidden = view !== "play";
    homeBtn.hidden = view === "hub";
    if (view !== "play") hideOverlay();
  }

  function updateHud() {
    if (state.view !== "play" || !state.deck.length) {
      hudEl.hidden = true;
      hudEl.innerHTML = "";
      return;
    }
    hudEl.hidden = false;
    hudEl.innerHTML =
      `<span>${COPY.round}${state.index + 1}${COPY.of}${state.deck.length}</span>` +
      `<span>${COPY.firstHits} ${state.firstHits}</span>` +
      `<span>${COPY.misses} ${state.misses}</span>`;
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
    const stageChips = chipButtons(
      [COPY.stageAll, COPY.stagePrimary, COPY.stageSecondary],
      "data-stage",
      state.stage
    );
    const catChips = chipButtons([COPY.catAll].concat(CATS), "data-cat", state.cat);
    hubEl.innerHTML = `
      <p class="track">${COPY.trackLearn}</p>
      <p class="pick-cat">${COPY.pickHint}</p>
      <p class="chip-label">${COPY.pickStage}</p>
      <div class="chip-row">${stageChips}</div>
      <p class="chip-label">${COPY.pickCat}</p>
      <div class="chip-row">${catChips}</div>
      <div class="cards">
        <button type="button" class="mode-card" data-start="taiko">
          <div class="icon">🥁</div>
          <h2>${COPY.taikoName}</h2>
          <p>${COPY.taikoLead}</p>
        </button>
      </div>
    `;
  }

  function makeTaikoDeck(pool) {
    const size = Math.min(12, pool.length);
    return shuffle(pool).slice(0, size).map(function (tech) {
      const correct = tech.hits[Math.floor(Math.random() * tech.hits.length)];
      const decoys = tech.decoys
        .filter(function (text) {
          return tech.hits.indexOf(text) === -1;
        })
        .slice(0, 2);
      const options = shuffle(
        [{ text: correct, ok: true }].concat(
          decoys.map(function (text) {
            return { text: text, ok: false };
          })
        )
      );
      return {
        id: tech.id,
        cat: tech.cat,
        name: tech.name,
        example: tech.example,
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

  function startTaiko(weakOnly) {
    const pool = poolForRound(weakOnly);
    if (!pool.length) return;
    resetRound("taiko", makeTaikoDeck(pool));
    renderTaiko();
  }

  function resetRound(mode, deck) {
    clearTimeout(state.timer);
    state.mode = mode;
    state.deck = deck;
    state.index = 0;
    state.firstHits = 0;
    state.misses = 0;
    state.weak = [];
    state.locked = false;
    hideOverlay();
    show("play");
  }

  function current() {
    return state.deck[state.index];
  }

  function missExplain(wrongText, itemName) {
    const owner = HIT_OWNER[wrongText];
    if (owner && owner !== itemName) {
      return "✗ " + wrongText + "是「" + owner + "」的作用，不是「" + itemName + "」。";
    }
    return "✗ 這不是「" + itemName + "」的作用。";
  }

  function renderTaiko() {
    const item = current();
    const drums = item.options
      .map(function (opt, i) {
        return `
        <button type="button" class="drum" data-choice="${i}" aria-label="${i + 1} ${opt.text}">
          <span class="drum-num">${i + 1}</span>
          ${opt.text}
        </button>`;
      })
      .join("");
    playEl.innerHTML = `
      <div class="stage">
        <div class="meta-row">
          <span class="cat-pill">${item.cat}</span>
          <span>${COPY.round}${state.index + 1}${COPY.of}${state.deck.length}</span>
        </div>
        <p class="prompt-arrow">${COPY.prompt} →</p>
        <div class="drums">
          <div class="drum prompt">${item.name}</div>
          ${drums}
        </div>
        <p class="key-hint">${COPY.keys}</p>
        <p class="feedback" id="feedback"></p>
        <div id="teach" class="teach" hidden></div>
      </div>
    `;
    updateHud();
  }

  function pickTaiko(index) {
    if (state.locked || overlayOpen()) return;
    const item = current();
    const opt = item.options[index];
    const drums = playEl.querySelectorAll(".drum[data-choice]");
    const drum = drums[index];
    if (!drum || !opt || drum.classList.contains("ok") || drum.classList.contains("bad")) return;
    if (opt.ok) {
      state.locked = true;
      if (!item.missed.length) state.firstHits += 1;
      drum.classList.add("ok");
      drum.insertAdjacentHTML("beforeend", '<span class="mark">✓</span>');
      const feedback = document.getElementById("feedback");
      feedback.textContent = "✓ 「" + item.name + "」的作用是「" + item.correct + "」。";
      const teach = document.getElementById("teach");
      teach.hidden = false;
      teach.innerHTML =
        `<p class="example"><span>${COPY.example}</span>${item.example}</p>` +
        `<button type="button" class="btn" data-next="1">${COPY.next}</button>`;
      updateHud();
    } else {
      state.misses += 1;
      item.missed.push(opt.text);
      if (!state.weak.filter(function (w) { return w.name === item.name; }).length) {
        state.weak.push(item);
      }
      drum.classList.add("bad");
      drum.insertAdjacentHTML("beforeend", '<span class="mark">✗</span>');
      document.getElementById("feedback").textContent = missExplain(opt.text, item.name);
      updateHud();
    }
  }

  function advance() {
    if (state.view !== "play") return;
    state.locked = false;
    state.index += 1;
    if (state.index >= state.deck.length) {
      renderRecap();
      return;
    }
    renderTaiko();
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
      bits.forEach(function (b) {
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

  function renderRecap() {
    show("recap");
    hudEl.hidden = true;
    const clean = state.misses === 0;
    const weak = state.weak.length
      ? `<p>${COPY.keep}</p><ul class="weak-list">${state.weak
          .map(function (w) {
            const picked = w.missed.length
              ? `<div class="picked">${COPY.youPicked}：${w.missed.join("、")}</div>`
              : "";
            return `<li class="recap-pair"><div class="pair">${w.name} → ${w.correct}</div>${picked}</li>`;
          })
          .join("")}</ul>`
      : `<p>${COPY.clean}。</p>`;
    const retry = state.weak.length
      ? `<button type="button" class="btn" data-retry-weak="1">${COPY.retryWeak}</button>`
      : "";
    recapEl.innerHTML = `
      <div class="recap-card">
        <h2>${COPY.recapTitle}</h2>
        <div class="score-row">
          <div><span>${COPY.firstHits}</span><b>${state.firstHits}</b></div>
          <div><span>${COPY.misses}</span><b>${state.misses}</b></div>
        </div>
        ${weak}
        <div class="recap-actions">
          <button type="button" class="btn" data-replay="taiko">${COPY.again}</button>
          ${retry}
          <button type="button" class="btn btn-ghost" data-home="1">${COPY.home}</button>
        </div>
      </div>
    `;
    if (clean) burstConfetti();
  }

  function requestLeave() {
    if (state.view !== "play") {
      goHome();
      return;
    }
    showOverlay();
  }

  function goHome() {
    clearTimeout(state.timer);
    hideOverlay();
    state.mode = null;
    state.deck = [];
    state.locked = false;
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
    const chip = e.target.closest("[data-cat]");
    if (chip) {
      state.cat = chip.getAttribute("data-cat");
      renderHub();
      return;
    }
    const start = e.target.closest("[data-start]");
    if (!start) return;
    if (start.getAttribute("data-start") === "taiko") startTaiko(false);
  });

  playEl.addEventListener("click", function (e) {
    if (e.target.closest("[data-next]")) {
      advance();
      return;
    }
    const drum = e.target.closest(".drum[data-choice]");
    if (drum && state.mode === "taiko") {
      pickTaiko(Number(drum.getAttribute("data-choice")));
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
  leaveStay.addEventListener("click", hideOverlay);
  leaveHome.addEventListener("click", goHome);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (overlayOpen()) {
        hideOverlay();
        return;
      }
      if (state.view === "play") {
        requestLeave();
        return;
      }
      if (state.view === "recap") goHome();
      return;
    }
    if (overlayOpen()) return;
    if (state.view !== "play" || state.mode !== "taiko" || state.locked) return;
    if (e.key === "1" || e.key === "2" || e.key === "3") {
      pickTaiko(Number(e.key) - 1);
    }
  });

  renderHub();
  show("hub");
})();
