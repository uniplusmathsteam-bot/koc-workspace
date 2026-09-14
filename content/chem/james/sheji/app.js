(function () {
  const hubEl = document.getElementById("hub");
  const setupViewport = document.getElementById("setup-viewport");
  const playEl = document.getElementById("play");
  const recapEl = document.getElementById("recap");
  const hudEl = document.getElementById("hud");
  const homeBtn = document.getElementById("btn-home");
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const leaveOverlay = document.getElementById("leave-overlay");
  const leaveStay = document.getElementById("leave-stay");
  const leaveHome = document.getElementById("leave-home");
  const leaveTitle = document.getElementById("leave-title");
  let setupBusy = false;
  let setupTimer = 0;
  let lastTick = 0;
  let confettiRaf = 0;
  let countTimer = 0;
  const reduceMotionMq = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  const CATS = [];
  TECHNIQUES.forEach(function (tech) {
    if (CATS.indexOf(tech.cat) === -1) CATS.push(tech.cat);
  });

  const DIFF = {};
  DIFF[COPY.speedSlow] = { mul: 0.45, tokens: 6, hearts: 5, missHeart: false, sameCat: false, enemyFire: false };
  DIFF[COPY.speedNormal] = {
    mul: 1,
    tokens: 8,
    hearts: 5,
    missHeart: true,
    sameCat: false,
    enemyFire: true,
    enemyBullet: 3,
    enemyFireMs: 5200,
    enemyFireJitter: 1800,
    enemyGrace: 7000,
    enemyArmJitter: 4000,
    wander: true,
    chaseShare: 0.25,
  };
  DIFF[COPY.speedFast] = {
    mul: 2.3,
    tokens: 11,
    hearts: 3,
    missHeart: true,
    sameCat: true,
    wander: true,
    enemyFire: true,
    enemyBullet: 8,
    enemyFireMs: 2000,
    enemyFireJitter: 800,
    enemyGrace: 5000,
    enemyArmJitter: 2200,
    chaseShare: 0.35,
  };

  const PLAYER_SPEED = 5.5;
  const PLAYER_PAD = 20;
  const BULLET_SPEED = 12;
  const BULLET_OFFSET = 30;
  const BULLET_RADIUS = 10;
  const FIRE_COOLDOWN = 200;
  const FIRE_LOCK_MS = 1200;
  const BULLET_LIFE = 10000;
  const ENEMY_BULLET_OFFSET = 35;
  const ENEMY_HIT_R = 15;
  const COUNT_MS = 3000;
  const COUNT_GO_MS = 350;
  const TANK_HALF = 18;
  const TANK_COLORS = ["#2bbbdf", "#f5c542", "#7c3aed", "#178a57", "#d97706", "#db2777"];
  const WEAK_KEY = "sheji-weak";
  const SETUP_KEY = "sheji-setup";
  const WEAK_KEY_OLD = "sheji-v2-weak";
  const SETUP_KEY_OLD = "sheji-v2-setup";
  const SEPARATE = 72;
  const CONTACT = 40;
  const IMMUNE_MS = 3000;
  const FRAME = 16.67;
  const KNOCKBACK = 70;
  const TIP_HITS = 5;
  const TIP_HALF = 16;

  const state = {
    view: "hub",
    mode: null,
    cat: COPY.catAll,
    qtype: COPY.qtypeHit,
    speed: COPY.speedNormal,
    deck: [],
    index: 0,
    firstHits: 0,
    misses: 0,
    weak: [],
    locked: false,
    remaining: [],
    paused: false,
    moveRaf: null,
    keys: { left: false, right: false, up: false, down: false },
    mouse: { x: 0, y: 0 },
    player: null,
    bullets: [],
    lastFire: 0,
    fireLockUntil: 0,
    movers: [],
    field: null,
    fieldW: 0,
    fieldH: 0,
    fieldLeft: 0,
    fieldTop: 0,
    tankHits: 0,
    okHits: 0,
    playMs: 0,
    playTick: 0,
    hearts: 5,
    immuneUntil: 0,
    healOnHit: false,
    died: false,
    setupStep: 0,
    tipHunt: false,
    tip: null,
    countEnd: 0,
    goUntil: 0,
    liveAt: 0,
    fireArmed: false,
  };

  function diff() {
    return DIFF[state.speed] || DIFF[COPY.speedNormal];
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function uniqueHitText(tokens) {
    const seen = [];
    tokens.forEach(function (t) {
      if (!t.ok) return;
      if (seen.indexOf(t.text) === -1) seen.push(t.text);
    });
    return seen.join("、");
  }

  function isPairType() {
    return state.qtype === COPY.qtypePair;
  }

  function isPassType() {
    return state.qtype === COPY.qtypePass;
  }

  function isHitType() {
    return state.qtype === COPY.qtypeHit;
  }

  function pairTitle(pair) {
    const a = TECH_BY_ID[pair.aId];
    const b = TECH_BY_ID[pair.bId];
    return (a ? a.name : pair.aId) + "／" + (b ? b.name : pair.bId);
  }

  function pairMatchesCat(pair, cat) {
    if (cat === COPY.catAll) return true;
    if (pair.cat === cat) return true;
    const a = TECH_BY_ID[pair.aId];
    const b = TECH_BY_ID[pair.bId];
    return (a && a.cat === cat) || (b && b.cat === cat);
  }

  function migrateStoreKey(oldKey, newKey) {
    try {
      if (localStorage.getItem(newKey)) return;
      const raw = localStorage.getItem(oldKey);
      if (!raw) return;
      localStorage.setItem(newKey, raw);
      localStorage.removeItem(oldKey);
    } catch (err) {}
  }

  function migrateStores() {
    migrateStoreKey(WEAK_KEY_OLD, WEAK_KEY);
    migrateStoreKey(SETUP_KEY_OLD, SETUP_KEY);
  }

  function loadWeakStore() {
    try {
      const raw = localStorage.getItem(WEAK_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const ids = data.qtype === COPY.qtypePair ? data.pairIds : data.techIds;
      if (!data.qtype || !ids || !ids.length) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function saveWeakStore() {
    const ids = state.weak.map(function (w) {
      return w.id;
    });
    try {
      localStorage.setItem(
        WEAK_KEY,
        JSON.stringify({
          qtype: state.qtype,
          cat: state.cat,
          techIds: isPairType() ? [] : ids,
          pairIds: isPairType() ? ids : [],
        })
      );
    } catch (err) {}
  }

  function loadSetupStore() {
    try {
      const raw = localStorage.getItem(SETUP_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.cat === COPY.catAll || CATS.indexOf(data.cat) !== -1) state.cat = data.cat;
      if (
        data.qtype === COPY.qtypeHit ||
        data.qtype === COPY.qtypePass ||
        data.qtype === COPY.qtypePair
      ) {
        state.qtype = data.qtype;
      }
      if (data.speed && DIFF[data.speed]) state.speed = data.speed;
      if (typeof data.tipHunt === "boolean") state.tipHunt = data.tipHunt;
      if (typeof data.healOnHit === "boolean") state.healOnHit = data.healOnHit;
    } catch (err) {}
  }

  function saveSetupStore() {
    try {
      localStorage.setItem(
        SETUP_KEY,
        JSON.stringify({
          cat: state.cat,
          qtype: state.qtype,
          speed: state.speed,
          tipHunt: state.tipHunt,
          healOnHit: state.healOnHit,
        })
      );
    } catch (err) {}
  }

  function extraDecoyPool(tech) {
    const skip = {};
    tech.hits.forEach(function (text) {
      skip[text] = true;
    });
    tech.decoys.forEach(function (text) {
      skip[text] = true;
    });
    const same = [];
    const rest = [];
    TECHNIQUES.forEach(function (other) {
      if (other.id === tech.id) return;
      other.hits.forEach(function (text) {
        if (skip[text]) return;
        const bucket = other.cat === tech.cat ? same : rest;
        if (bucket.indexOf(text) === -1) bucket.push(text);
      });
    });
    if (diff().sameCat) return shuffle(same).concat(shuffle(rest));
    return shuffle(same.concat(rest));
  }

  function playIsFullscreen() {
    return document.fullscreenElement === playEl || document.webkitFullscreenElement === playEl;
  }

  function syncFsBtn() {
    const btn = document.getElementById("btn-fs");
    if (!btn) return;
    btn.textContent = playIsFullscreen() ? COPY.fullscreenExit : COPY.fullscreen;
  }

  function exitPlayFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit && (document.fullscreenElement || document.webkitFullscreenElement)) {
      exit.call(document);
    }
  }

  function togglePlayFullscreen() {
    if (playIsFullscreen()) {
      exitPlayFullscreen();
      return;
    }
    const req = playEl.requestFullscreen || playEl.webkitRequestFullscreen;
    if (!req) return;
    const result = req.call(playEl);
    if (result && result.catch) {
      result.catch(function () {
        syncFsBtn();
      });
    }
  }

  function overlayOpen() {
    return !leaveOverlay.hidden;
  }

  function hideOverlay() {
    leaveOverlay.hidden = true;
    resumePlayClock();
    startMoveLoop();
  }

  function showOverlay() {
    freezePlayClock();
    leaveOverlay.hidden = false;
    clearKeys();
    cancelMoveLoop();
  }

  function counting() {
    return state.goUntil > 0 && performance.now() < state.goUntil;
  }

  function updateCountBanner(now) {
    const banner = document.getElementById("count-banner");
    if (!banner) return;
    banner.hidden = false;
    if (now >= state.countEnd) {
      banner.textContent = COPY.countGo;
    } else {
      banner.textContent = String(Math.max(1, Math.ceil((state.countEnd - now) / 1000)));
    }
  }

  function finishCount() {
    state.goUntil = 0;
    state.countEnd = 0;
    if (countTimer) {
      clearTimeout(countTimer);
      countTimer = 0;
    }
    const banner = document.getElementById("count-banner");
    if (banner) banner.hidden = true;
    state.liveAt = performance.now();
    resumePlayClock();
    startMoveLoop();
  }

  function scheduleCount() {
    if (countTimer) {
      clearTimeout(countTimer);
      countTimer = 0;
    }
    function pulse() {
      countTimer = 0;
      const now = performance.now();
      if (now < state.goUntil) {
        updateCountBanner(now);
        countTimer = setTimeout(pulse, 80);
      } else {
        finishCount();
      }
    }
    pulse();
  }

  function freezePlayClock() {
    if (state.playTick) {
      state.playMs += performance.now() - state.playTick;
      state.playTick = 0;
    }
  }

  function resumePlayClock() {
    if (state.locked || state.paused || overlayOpen() || counting() || state.view !== "play") return;
    if (!state.playTick) state.playTick = performance.now();
  }

  function playElapsed() {
    let ms = state.playMs;
    if (state.playTick) ms += performance.now() - state.playTick;
    return ms;
  }

  function formatPlayTime(ms) {
    const s = ms / 1000;
    if (s < 60) return s.toFixed(1) + "秒";
    const m = Math.floor(s / 60);
    const rem = Math.floor(s % 60);
    return m + ":" + (rem < 10 ? "0" : "") + rem;
  }

  function clearKeys() {
    state.keys.left = false;
    state.keys.right = false;
    state.keys.up = false;
    state.keys.down = false;
  }

  function keyDir(e) {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") return "left";
    if (k === "ArrowRight" || k === "d" || k === "D") return "right";
    if (k === "ArrowUp" || k === "w" || k === "W") return "up";
    if (k === "ArrowDown" || k === "s" || k === "S") return "down";
    return "";
  }

  function show(view) {
    state.view = view;
    hubEl.classList.toggle("active", view === "hub");
    playEl.classList.toggle("active", view === "play");
    recapEl.classList.toggle("active", view === "recap");
    hudEl.hidden = view !== "play";
    homeBtn.hidden = view === "hub";
    if (view !== "play") {
      hideOverlay();
      exitPlayFullscreen();
    }
  }

  function updateHud() {
    if (state.view !== "play" || !state.deck.length) {
      hudEl.hidden = true;
      hudEl.innerHTML = "";
      return;
    }
    hudEl.hidden = false;
    if (!document.getElementById("hud-round")) {
      hudEl.innerHTML =
        '<span id="hud-round"></span><span id="hud-hits"></span><span id="hud-misses"></span>';
    }
    const roundEl = document.getElementById("hud-round");
    const hitsEl = document.getElementById("hud-hits");
    const missesEl = document.getElementById("hud-misses");
    if (roundEl) roundEl.textContent = COPY.round + (state.index + 1) + COPY.of + state.deck.length;
    if (hitsEl) hitsEl.textContent = COPY.firstHits + " " + state.firstHits;
    if (missesEl) missesEl.textContent = COPY.misses + " " + state.misses;
    const playHearts = document.getElementById("play-hearts");
    if (!playHearts) return;
    playHearts.setAttribute("aria-label", COPY.hearts + " " + state.hearts);
    const max = diff().hearts;
    if (playHearts.children.length !== max) {
      let hearts = "";
      for (let i = 0; i < max; i++) {
        hearts += '<i class="heart' + (i < state.hearts ? " on" : "") + '"></i>';
      }
      playHearts.innerHTML = hearts;
      return;
    }
    for (let i = 0; i < max; i++) {
      playHearts.children[i].classList.toggle("on", i < state.hearts);
    }
  }

  function preferReducedMotion() {
    return !!reduceMotionMq.matches;
  }

  function chipButtons(values, attr, current, disabledSet) {
    return values
      .map(function (value) {
        const on = value === current;
        const disabled = disabledSet && disabledSet[value] ? " disabled" : "";
        return (
          `<button type="button" class="chip${on ? " active" : ""}" ${attr}="${value}" aria-pressed="${
            on ? "true" : "false"
          }"${disabled}>${value}</button>`
        );
      })
      .join("");
  }

  function setupBackHtml() {
    return `<div class="hub-actions"><button type="button" class="btn btn-ghost" data-setup-back="1">${COPY.setupBack}</button></div>`;
  }

  function countTechPool(cat) {
    return TECHNIQUES.filter(function (tech) {
      if (cat !== COPY.catAll && tech.cat !== cat) return false;
      return tech.hits.length + tech.decoys.length >= 2;
    }).length;
  }

  function countPool(cat) {
    if (state.setupStep >= 2 && isPairType()) {
      return PAIRS.filter(function (pair) {
        return pairMatchesCat(pair, cat);
      }).length;
    }
    return countTechPool(cat);
  }

  function poolCountHtml() {
    const n = poolForRound(false).length;
    const emptyMsg = n === 0 ? `<p class="empty-pool">${COPY.emptyPool}</p>` : "";
    return `<p class="pool-count">${COPY.poolCount} ${n} ${COPY.poolUnit}</p>${emptyMsg}`;
  }

  function chipRowHtml(label, buttons, labelId) {
    const id = labelId || "chip-label";
    return (
      `<p class="chip-label" id="${id}">${label}</p>` +
      `<div class="chip-row" role="group" aria-labelledby="${id}">${buttons}</div>`
    );
  }

  function speedNoteHtml() {
    let note = COPY.speedNoteNormal;
    if (state.speed === COPY.speedSlow) note = COPY.speedNoteSlow;
    else if (state.speed === COPY.speedFast) note = COPY.speedNoteFast;
    return `<p class="pick-cat">${note}</p>`;
  }

  function hubPageHtml() {
    if (state.setupStep === 0) {
      return `
          <p class="track">${COPY.howtoTitle}</p>
          <p class="pick-cat">${COPY.pickHint}</p>
          <p class="learn-goal">${COPY.learnGoal}</p>
          <ol class="howto-list">
            <li>${COPY.howto1}</li>
            <li>${COPY.howto2}</li>
            <li>${COPY.howto4}</li>
            <li>${COPY.howto5}</li>
          </ol>
          <div class="hub-actions">
            <button type="button" class="btn" data-setup-next="1">${COPY.setupNext}</button>
            ${
              loadWeakStore()
                ? `<button type="button" class="btn btn-ghost" data-resume-weak="1">${COPY.resumeWeak}</button>`
                : ""
            }
          </div>
      `;
    }
    if (state.setupStep === 1) {
      const catDisabled = {};
      CATS.forEach(function (cat) {
        if (!countPool(cat)) catDisabled[cat] = true;
      });
      return `
          <p class="track">${COPY.trackLearn}</p>
          ${chipRowHtml(COPY.pickCat, chipButtons([COPY.catAll].concat(CATS), "data-cat", state.cat, catDisabled), "chip-cat")}
          ${poolCountHtml()}
          ${setupBackHtml()}
      `;
    }
    if (state.setupStep === 2) {
      const savedQ = state.qtype;
      const qDisabled = {};
      [COPY.qtypeHit, COPY.qtypePass, COPY.qtypePair].forEach(function (q) {
        state.qtype = q;
        if (!countPool(state.cat)) qDisabled[q] = true;
      });
      state.qtype = savedQ;
      return `
          <p class="track">${COPY.trackLearn}</p>
          ${chipRowHtml(
            COPY.pickQtype,
            chipButtons(
              [COPY.qtypeHit, COPY.qtypePass, COPY.qtypePair],
              "data-qtype",
              state.qtype,
              qDisabled
            ),
            "chip-qtype"
          )}
          ${poolCountHtml()}
          ${setupBackHtml()}
      `;
    }
    if (state.setupStep === 3) {
      const empty = poolForRound(false).length === 0;
      let extra = "";
      if (tipAllowed()) {
        extra += `<div class="setup-options">`;
        if (isHitType()) {
          extra +=
            chipRowHtml(
              COPY.pickTip,
              chipButtons([COPY.tipOff, COPY.tipOn], "data-tip", state.tipHunt ? COPY.tipOn : COPY.tipOff),
              "chip-tip"
            ) + `<p class="pick-cat">${COPY.tipLead}</p>`;
        }
        extra +=
          chipRowHtml(
            COPY.healLabel,
            chipButtons([COPY.healOff, COPY.healOn], "data-heal", state.healOnHit ? COPY.healOn : COPY.healOff),
            "chip-heal"
          ) + `</div>`;
      }
      return `
          <p class="track">${COPY.trackLearn}</p>
          ${chipRowHtml(
            COPY.pickSpeed,
            chipButtons([COPY.speedSlow, COPY.speedNormal, COPY.speedFast], "data-speed", state.speed),
            "chip-speed"
          )}
          ${speedNoteHtml()}
          ${poolCountHtml()}
          ${extra}
          <div class="hub-actions">
            <button type="button" class="btn" data-setup-start="1"${empty ? " disabled" : ""}>${COPY.setupStart}</button>
            <button type="button" class="btn btn-ghost" data-setup-back="1">${COPY.setupBack}</button>
          </div>
      `;
    }
    return "";
  }

  function tipAllowed() {
    return state.speed !== COPY.speedFast;
  }

  function markChipActive(chip) {
    const row = chip.parentElement;
    if (!row) return;
    const chips = row.querySelectorAll(".chip");
    for (let i = 0; i < chips.length; i++) {
      const on = chips[i] === chip;
      chips[i].classList.toggle("active", on);
      chips[i].setAttribute("aria-pressed", on ? "true" : "false");
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

  function setupBack() {
    if (state.setupStep <= 0 || setupBusy) return;
    goSetupStep(state.setupStep - 1, -1);
  }

  function poolForRound(weakOnly) {
    const ids = state.weak.map(function (w) {
      return w.id;
    });
    if (isPairType()) {
      if (weakOnly) {
        return PAIRS.filter(function (pair) {
          return ids.indexOf(pair.id) !== -1;
        });
      }
      return PAIRS.filter(function (pair) {
        return pairMatchesCat(pair, state.cat);
      });
    }
    if (weakOnly) {
      return TECHNIQUES.filter(function (tech) {
        return ids.indexOf(tech.id) !== -1;
      });
    }
    return TECHNIQUES.filter(function (tech) {
      if (state.cat !== COPY.catAll && tech.cat !== state.cat) return false;
      return tech.hits.length + tech.decoys.length >= 2;
    });
  }

  function fillDecoys(raw, extras, skip) {
    let ei = 0;
    while (raw.length < diff().tokens && ei < extras.length) {
      const text = extras[ei];
      ei += 1;
      if (skip[text]) continue;
      skip[text] = true;
      raw.push({ text: text, ok: false });
    }
  }

  function tokensFromRaw(raw, prefix) {
    return shuffle(raw).map(function (token, i) {
      return {
        text: token.text,
        ok: token.ok,
        id: prefix + "-" + i,
      };
    });
  }

  function teachFields(tech) {
    return {
      id: tech.id,
      cat: tech.cat,
      name: tech.name,
      hits: tech.hits,
      plain: tech.plain,
      vs: tech.vs,
      example: tech.example,
      mark: tech.mark,
      passage: tech.passage,
      writeStem: tech.writeStem,
      writeModel: tech.writeModel,
      twins: tech.twins || [],
    };
  }

  function nameDecoyPool(tech) {
    const twins = [];
    const same = [];
    const rest = [];
    const twinSet = {};
    (tech.twins || []).forEach(function (id) {
      twinSet[id] = true;
    });
    TECHNIQUES.forEach(function (other) {
      if (other.id === tech.id) return;
      if (twinSet[other.id]) twins.push(other.name);
      else if (other.cat === tech.cat) same.push(other.name);
      else rest.push(other.name);
    });
    return shuffle(twins).concat(shuffle(same)).concat(shuffle(rest));
  }

  function extraPairLabels(pair, skip) {
    const labels = [];
    PAIRS.forEach(function (other) {
      if (other.id === pair.id) return;
      if (!skip[other.ok]) labels.push(other.ok);
      (other.decoys || []).forEach(function (text) {
        if (!skip[text]) labels.push(text);
      });
    });
    return shuffle(labels);
  }

  function makeHitDeck(pool) {
    const size = Math.min(10, pool.length);
    return shuffle(pool)
      .slice(0, size)
      .map(function (tech) {
        const raw = [];
        const skip = {};
        tech.hits.forEach(function (text) {
          raw.push({ text: text, ok: true });
          skip[text] = true;
        });
        tech.decoys.forEach(function (text) {
          if (skip[text]) return;
          skip[text] = true;
          raw.push({ text: text, ok: false });
        });
        fillDecoys(raw, extraDecoyPool(tech), skip);
        return Object.assign(teachFields(tech), {
          tokens: tokensFromRaw(raw, tech.id),
          missed: [],
          usedTip: false,
        });
      });
  }

  function makePassDeck(pool) {
    const size = Math.min(10, pool.length);
    return shuffle(pool)
      .slice(0, size)
      .map(function (tech) {
        const raw = [{ text: tech.name, ok: true }];
        const skip = {};
        skip[tech.name] = true;
        fillDecoys(raw, nameDecoyPool(tech), skip);
        return Object.assign(teachFields(tech), {
          tokens: tokensFromRaw(raw, tech.id),
          missed: [],
          usedTip: false,
        });
      });
  }

  function makePairDeck(pool) {
    const size = Math.min(10, pool.length);
    return shuffle(pool)
      .slice(0, size)
      .map(function (pair) {
        const raw = [{ text: pair.ok, ok: true }];
        const skip = {};
        skip[pair.ok] = true;
        (pair.decoys || []).forEach(function (text) {
          if (skip[text]) return;
          skip[text] = true;
          raw.push({ text: text, ok: false });
        });
        fillDecoys(raw, extraPairLabels(pair, skip), skip);
        return {
          id: pair.id,
          pair: true,
          cat: pair.cat,
          name: pairTitle(pair),
          ok: pair.ok,
          question: pair.question,
          jia: pair.jia,
          yi: pair.yi,
          hinge: pair.hinge,
          plain: pair.hinge,
          vs: pair.hinge,
          example: pair.jia,
          mark: pair.hinge,
          writeStem: pair.writeStem,
          writeModel: pair.writeModel,
          tokens: tokensFromRaw(raw, pair.id),
          missed: [],
          usedTip: false,
        };
      });
  }

  function makeDeck(pool) {
    if (isPairType()) return makePairDeck(pool);
    if (isPassType()) return makePassDeck(pool);
    return makeHitDeck(pool);
  }

  function startShoot(weakOnly) {
    if (!tipAllowed()) {
      state.tipHunt = false;
      state.healOnHit = false;
    }
    if (!isHitType()) state.tipHunt = false;
    const pool = poolForRound(weakOnly);
    if (!pool.length) {
      renderHub(0);
      show("hub");
      return;
    }
    resetRound("shoot", makeDeck(pool));
    renderShoot();
  }

  function startResumeWeak() {
    const data = loadWeakStore();
    if (!data) return;
    state.qtype = data.qtype;
    state.cat = data.cat || COPY.catAll;
    const ids = data.qtype === COPY.qtypePair ? data.pairIds : data.techIds;
    state.weak = (ids || []).map(function (id) {
      return { id: id, name: id };
    });
    saveSetupStore();
    startShoot(true);
  }

  function cacheFieldMetrics() {
    const field = state.field || playEl.querySelector(".playfield");
    if (!field) return;
    state.field = field;
    state.fieldW = field.clientWidth;
    state.fieldH = field.clientHeight;
    const rect = field.getBoundingClientRect();
    state.fieldLeft = rect.left;
    state.fieldTop = rect.top;
  }

  function cancelMoveLoop() {
    if (state.moveRaf) {
      cancelAnimationFrame(state.moveRaf);
      state.moveRaf = null;
    }
  }

  function arenaShouldRun() {
    return (
      state.view === "play" &&
      !!state.player &&
      !state.locked &&
      !state.paused &&
      !overlayOpen() &&
      !counting()
    );
  }

  function startMoveLoop() {
    if (state.moveRaf || !arenaShouldRun()) return;
    lastTick = 0;
    state.moveRaf = requestAnimationFrame(tickArena);
  }

  function tickArena(now) {
    if (!arenaShouldRun()) {
      state.moveRaf = null;
      return;
    }
    if (!lastTick) lastTick = now;
    const step = Math.min(32, now - lastTick) / FRAME;
    lastTick = now;
    movePlayer(state.fieldW, state.fieldH, step);
    moveWordTanks(state.fieldW, state.fieldH, step);
    moveTip(state.fieldW, state.fieldH, step);
    moveBullets(state.field, state.fieldW, state.fieldH, step);
    state.moveRaf = requestAnimationFrame(tickArena);
  }

  function stopArenaLoop() {
    cancelMoveLoop();
    if (countTimer) {
      clearTimeout(countTimer);
      countTimer = 0;
    }
    const flying = playEl.querySelectorAll(".bullet");
    for (let i = 0; i < flying.length; i++) flying[i].remove();
    state.bullets = [];
    state.movers = [];
    state.player = null;
    state.tip = null;
    state.field = null;
  }

  function speedMul() {
    return diff().mul;
  }

  function tankMarkup(label, color) {
    return (
      '<span class="tank-cannon"></span>' +
      '<span class="tank-body" style="background:' + color + '"></span>' +
      '<span class="tank-name">' + label + "</span>"
    );
  }

  function setTankLabel(el, text) {
    const name = el.querySelector(".tank-name");
    if (name) name.textContent = text;
    else el.textContent = text;
  }

  function placeEl(el, x, y) {
    el.style.transform = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
  }

  function setMouseFromEvent(e) {
    if (!state.field) return;
    state.mouse.x = e.clientX - state.fieldLeft;
    state.mouse.y = e.clientY - state.fieldTop;
  }

  function aimPlayerCannon() {
    const p = state.player;
    if (!p) return;
    p.cannonTheta = Math.atan2(state.mouse.y - p.y, state.mouse.x - p.x);
    if (p.cannon) p.cannon.style.transform = "rotate(" + p.cannonTheta + "rad)";
  }

  function movePlayer(fieldW, fieldH, step) {
    const p = state.player;
    if (!p) return;
    let dx = 0;
    let dy = 0;
    if (state.keys.left) dx -= PLAYER_SPEED;
    if (state.keys.right) dx += PLAYER_SPEED;
    if (state.keys.up) dy -= PLAYER_SPEED;
    if (state.keys.down) dy += PLAYER_SPEED;
    p.x += dx * step;
    p.y += dy * step;
    const maxX = Math.max(PLAYER_PAD, fieldW - PLAYER_PAD);
    const maxY = Math.max(PLAYER_PAD, fieldH - PLAYER_PAD);
    if (p.x < PLAYER_PAD) p.x = PLAYER_PAD;
    else if (p.x > maxX) p.x = maxX;
    if (p.y < PLAYER_PAD) p.y = PLAYER_PAD;
    else if (p.y > maxY) p.y = maxY;
    placeEl(p.el, p.x, p.y);
    aimPlayerCannon();
  }

  function clampArenaToField() {
    if (!state.field || state.view !== "play" || !state.player) return;
    const w = state.fieldW;
    const h = state.fieldH;
    const p = state.player;
    const maxX = Math.max(PLAYER_PAD, w - PLAYER_PAD);
    const maxY = Math.max(PLAYER_PAD, h - PLAYER_PAD);
    if (p.x < PLAYER_PAD) p.x = PLAYER_PAD;
    else if (p.x > maxX) p.x = maxX;
    if (p.y < PLAYER_PAD) p.y = PLAYER_PAD;
    else if (p.y > maxY) p.y = maxY;
    placeEl(p.el, p.x, p.y);
    const pad = 10;
    state.movers.forEach(function (m) {
      const minX = m.halfW + pad;
      const maxXm = Math.max(minX, w - m.halfW - pad);
      const minY = m.halfH + pad;
      const maxYm = Math.max(minY, h - m.halfH - pad);
      if (m.x < minX) m.x = minX;
      else if (m.x > maxXm) m.x = maxXm;
      if (m.y < minY) m.y = minY;
      else if (m.y > maxYm) m.y = maxYm;
      placeEl(m.el, m.x, m.y);
    });
    if (state.tip && state.tip.el) {
      const tpad = TIP_HALF + 8;
      const tminX = tpad;
      const tmaxX = Math.max(tminX, w - tpad);
      const tminY = tpad;
      const tmaxY = Math.max(tminY, h - tpad);
      if (state.tip.x < tminX) state.tip.x = tminX;
      else if (state.tip.x > tmaxX) state.tip.x = tmaxX;
      if (state.tip.y < tminY) state.tip.y = tminY;
      else if (state.tip.y > tmaxY) state.tip.y = tmaxY;
      placeEl(state.tip.el, state.tip.x, state.tip.y);
    }
  }

  function onPlayfieldResize() {
    syncFsBtn();
    cacheFieldMetrics();
    clampArenaToField();
    requestAnimationFrame(function () {
      cacheFieldMetrics();
      clampArenaToField();
    });
  }

  function tankSettled(m) {
    return m.el.classList.contains("hit") || m.el.classList.contains("miss");
  }

  function setWanderHeading(m, now) {
    const ang = Math.random() * Math.PI * 2;
    m.vx = Math.cos(ang) * m.speed;
    m.vy = Math.sin(ang) * m.speed;
    m.nextTurn = now + 400 + Math.random() * 800;
  }

  function steerChase(m, player, step) {
    if (!player) return;
    const dx = player.x - m.x;
    const dy = player.y - m.y;
    const dist = Math.hypot(dx, dy) || 1;
    m.vx += (dx / dist) * 0.06 * step;
    m.vy += (dy / dist) * 0.06 * step;
    const mag = Math.hypot(m.vx, m.vy) || 1;
    if (mag > m.speed) {
      m.vx = (m.vx / mag) * m.speed;
      m.vy = (m.vy / mag) * m.speed;
    }
  }

  function aimAtPlayer(m, player) {
    if (!player) return;
    const dx = player.x - m.x;
    const dy = player.y - m.y;
    const d = Math.hypot(dx, dy) || 1;
    m.vx = (dx / d) * m.speed;
    m.vy = (dy / d) * m.speed;
  }

  function markChasers() {
    state.movers.forEach(function (m) {
      m.chase = false;
    });
    const share = diff().chaseShare || 0;
    if (share <= 0 || !state.movers.length) return;
    const n = Math.max(1, Math.round(state.movers.length * share));
    shuffle(state.movers)
      .slice(0, n)
      .forEach(function (m) {
        m.chase = true;
      });
  }

  function separateWordTanks() {
    const live = [];
    state.movers.forEach(function (m) {
      if (!tankSettled(m)) live.push(m);
    });
    for (let i = 0; i < live.length; i++) {
      for (let j = i + 1; j < live.length; j++) {
        const a = live[i];
        const b = live[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 0.001) {
          dx = 1;
          dy = 0;
          dist = 1;
        }
        if (dist >= SEPARATE) continue;
        const push = (SEPARATE - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
      }
    }
  }

  function moveWordTanks(fieldW, fieldH, step) {
    const pad = 10;
    const player = state.player;
    const wander = diff().wander;
    const nowTurn = wander ? performance.now() : 0;
    state.movers.forEach(function (m) {
      if (tankSettled(m)) return;
      if (m.chase || !wander) {
        steerChase(m, player, step);
      } else if (!m.nextTurn || nowTurn >= m.nextTurn) {
        setWanderHeading(m, nowTurn);
      }
      m.x += m.vx * step;
      m.y += m.vy * step;
    });
    separateWordTanks();
    const d = diff();
    const enemyFire = d.enemyFire;
    const nowFire = enemyFire ? performance.now() : 0;
    if (
      enemyFire &&
      player &&
      state.liveAt &&
      !state.fireArmed &&
      nowFire >= state.liveAt + (d.enemyGrace || 5000)
    ) {
      state.movers.forEach(function (tank) {
        tank.nextFire = nowFire + 200 + Math.random() * (d.enemyArmJitter || 2200);
      });
      state.fireArmed = true;
    }
    state.movers.forEach(function (m) {
      if (tankSettled(m)) return;
      const minX = m.halfW + pad;
      const maxX = Math.max(minX, fieldW - m.halfW - pad);
      const minY = m.halfH + pad;
      const maxY = Math.max(minY, fieldH - m.halfH - pad);
      if (m.x <= minX) {
        m.x = minX;
        m.vx = Math.abs(m.vx);
      } else if (m.x >= maxX) {
        m.x = maxX;
        m.vx = -Math.abs(m.vx);
      }
      if (m.y <= minY) {
        m.y = minY;
        m.vy = Math.abs(m.vy);
      } else if (m.y >= maxY) {
        m.y = maxY;
        m.vy = -Math.abs(m.vy);
      }
      placeEl(m.el, m.x, m.y);
      if (m.cannon) {
        if (enemyFire && player) {
          m.cannon.style.transform =
            "rotate(" + Math.atan2(player.y - m.y, player.x - m.x) + "rad)";
        } else {
          m.cannon.style.transform = "rotate(" + Math.atan2(m.vy, m.vx) + "rad)";
        }
      }
      if (enemyFire && player && state.fireArmed && nowFire >= m.nextFire) {
        fireEnemyShot(m, nowFire);
        m.nextFire = nowFire + (d.enemyFireMs || 2000) + Math.random() * (d.enemyFireJitter || 800);
      }
    });
    checkContact();
  }

  function moveTip(fieldW, fieldH, step) {
    const t = state.tip;
    if (!t || !t.el) return;
    const pad = TIP_HALF + 8;
    const minX = pad;
    const maxX = Math.max(minX, fieldW - pad);
    const minY = pad;
    const maxY = Math.max(minY, fieldH - pad);
    t.x += t.vx * step;
    t.y += t.vy * step;
    if (t.x <= minX) {
      t.x = minX;
      t.vx = Math.abs(t.vx);
    } else if (t.x >= maxX) {
      t.x = maxX;
      t.vx = -Math.abs(t.vx);
    }
    if (t.y <= minY) {
      t.y = minY;
      t.vy = Math.abs(t.vy);
    } else if (t.y >= maxY) {
      t.y = maxY;
      t.vy = -Math.abs(t.vy);
    }
    placeEl(t.el, t.x, t.y);
  }

  function hitTip() {
    const t = state.tip;
    if (!t || state.locked) return;
    t.hitsLeft -= 1;
    if (t.hitsLeft > 0) {
      t.el.textContent = String(t.hitsLeft);
      return;
    }
    const item = current();
    let text = "";
    if (state.remaining.length) {
      const id = state.remaining[Math.floor(Math.random() * state.remaining.length)];
      const token = item.tokens.find(function (tok) {
        return tok.id === id;
      });
      if (token) text = token.text;
    }
    if (text) {
      const line = document.getElementById("tip-line");
      if (line) {
        line.hidden = false;
        line.textContent = COPY.tipReveal + text;
      }
      const fb = document.getElementById("feedback");
      if (fb) fb.textContent = COPY.tipReveal + text;
      item.usedTip = true;
      syncPauseFeedback();
    }
    t.el.remove();
    state.tip = null;
  }

  function setImmune(on) {
    const player = state.player;
    if (!player || player.immune === on) return;
    player.immune = on;
    player.el.classList.toggle("immune", on);
  }

  function checkContact() {
    const player = state.player;
    if (!player || state.locked || state.paused || overlayOpen()) return;
    const now = performance.now();
    if (now < state.immuneUntil) {
      setImmune(true);
      return;
    }
    setImmune(false);
    for (let i = 0; i < state.movers.length; i++) {
      const m = state.movers[i];
      if (tankSettled(m)) continue;
      if (Math.hypot(m.x - player.x, m.y - player.y) > CONTACT) continue;
      state.hearts -= 1;
      state.immuneUntil = now + IMMUNE_MS;
      setImmune(true);
      const kx = m.x - player.x;
      const ky = m.y - player.y;
      const kd = Math.hypot(kx, ky) || 1;
      m.x = player.x + (kx / kd) * KNOCKBACK;
      m.y = player.y + (ky / kd) * KNOCKBACK;
      m.vx = (kx / kd) * m.speed;
      m.vy = (ky / kd) * m.speed;
      if (endIfNoHearts()) return;
      return;
    }
  }

  function endIfNoHearts() {
    updateHud();
    if (state.hearts > 0) return false;
    state.died = true;
    state.locked = true;
    freezePlayClock();
    stopArenaLoop();
    renderRecap();
    return true;
  }

  function segmentHitsCircle(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;
    const a = dx * dx + dy * dy;
    const c = fx * fx + fy * fy - r * r;
    if (a < 1e-8) return c <= 0;
    const b = 2 * (fx * dx + fy * dy);
    let disc = b * b - 4 * a * c;
    if (disc < 0) return false;
    disc = Math.sqrt(disc);
    const inv = 0.5 / a;
    const t1 = (-b - disc) * inv;
    const t2 = (-b + disc) * inv;
    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
  }

  function moverHitAlongPath(x1, y1, x2, y2, radius) {
    const r = TANK_HALF + radius + 10;
    let best = null;
    let bestD = Infinity;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    for (let i = 0; i < state.movers.length; i++) {
      const m = state.movers[i];
      if (tankSettled(m)) continue;
      if (!segmentHitsCircle(x1, y1, x2, y2, m.x, m.y, r)) continue;
      const d = (m.x - midX) * (m.x - midX) + (m.y - midY) * (m.y - midY);
      if (d < bestD) {
        bestD = d;
        best = m.el;
      }
    }
    return best;
  }

  function moveBullets(field, fieldW, fieldH, step) {
    const now = performance.now();
    const keep = [];
    for (let i = 0; i < state.bullets.length; i++) {
      const b = state.bullets[i];
      const prevX = b.x;
      const prevY = b.y;
      b.x += b.vx * step;
      b.y += b.vy * step;
      placeEl(b.el, b.x, b.y);
      if (b.enemy) {
        const player = state.player;
        if (
          player &&
          segmentHitsCircle(prevX, prevY, b.x, b.y, player.x, player.y, ENEMY_HIT_R)
        ) {
          b.el.remove();
          if (state.locked) continue;
          if (now >= state.immuneUntil) {
            state.hearts -= 1;
            state.immuneUntil = now + IMMUNE_MS;
            setImmune(true);
            if (endIfNoHearts()) return;
          }
          continue;
        }
        if (b.x < -8 || b.y < -8 || b.x > fieldW + 8 || b.y > fieldH + 8 || now - b.born > BULLET_LIFE) {
          showSpark(field, Math.max(0, Math.min(fieldW, b.x)), Math.max(0, Math.min(fieldH, b.y)));
          b.el.remove();
          continue;
        }
        keep.push(b);
        continue;
      }
      const hit = moverHitAlongPath(prevX, prevY, b.x, b.y, BULLET_RADIUS);
      if (hit) {
        b.el.remove();
        shootToken(hit.getAttribute("data-token"));
        if (state.locked) return;
        continue;
      }
      if (state.tip && segmentHitsCircle(prevX, prevY, b.x, b.y, state.tip.x, state.tip.y, TIP_HALF + BULLET_RADIUS)) {
        b.el.remove();
        hitTip();
        continue;
      }
      if (b.x < -8 || b.y < -8 || b.x > fieldW + 8 || b.y > fieldH + 8 || now - b.born > BULLET_LIFE) {
        showSpark(field, Math.max(0, Math.min(fieldW, b.x)), Math.max(0, Math.min(fieldH, b.y)));
        b.el.remove();
        continue;
      }
      keep.push(b);
    }
    state.bullets = keep;
  }

  function clampPlayerSpawn(x, y, w, h) {
    const maxX = Math.max(PLAYER_PAD, w - PLAYER_PAD);
    const maxY = Math.max(PLAYER_PAD, h - PLAYER_PAD);
    if (x < PLAYER_PAD) x = PLAYER_PAD;
    if (x > maxX) x = maxX;
    if (y < PLAYER_PAD) y = PLAYER_PAD;
    if (y > maxY) y = maxY;
    return { x: x, y: y };
  }

  function spawnBlocked(x, y) {
    for (let i = 0; i < state.movers.length; i++) {
      const m = state.movers[i];
      if (Math.hypot(m.x - x, m.y - y) < SEPARATE) return true;
    }
    if (state.tip && Math.hypot(state.tip.x - x, state.tip.y - y) < SEPARATE) return true;
    return false;
  }

  function placePlayerClearOfTargets(w, h) {
    const mid = clampPlayerSpawn(w / 2, h / 2, w, h);
    const tries = [mid];
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      tries.push(
        clampPlayerSpawn(mid.x + Math.cos(ang) * SEPARATE, mid.y + Math.sin(ang) * SEPARATE, w, h)
      );
    }
    for (let i = 0; i < tries.length; i++) {
      if (!spawnBlocked(tries[i].x, tries[i].y)) {
        state.player.x = tries[i].x;
        state.player.y = tries[i].y;
        return;
      }
    }
    state.player.x = mid.x;
    state.player.y = mid.y;
  }

  function startArenaLoop() {
    stopArenaLoop();
    const field = playEl.querySelector(".playfield");
    const tankEl = playEl.querySelector(".player-tank");
    if (!field || !tankEl) return;
    state.field = field;
    const w = field.clientWidth;
    const h = field.clientHeight;
    const mul = speedMul();
    state.mouse.x = w / 2;
    state.mouse.y = 0;
    state.lastFire = 0;
    const mid = clampPlayerSpawn(w / 2, h / 2, w, h);
    state.player = {
      el: tankEl,
      cannon: tankEl.querySelector(".tank-cannon"),
      x: mid.x,
      y: mid.y,
      cannonTheta: -Math.PI / 2,
      immune: false,
    };

    const pad = 10;
    const minX = TANK_HALF + pad;
    const maxX = Math.max(minX, w - TANK_HALF - pad);
    const minY = TANK_HALF + pad;
    const maxY = Math.max(minY, h - TANK_HALF - pad);
    const floaters = Array.from(playEl.querySelectorAll(".floater"));
    const sideCounts = [0, 0, 0, 0];
    floaters.forEach(function (_el, i) {
      sideCounts[i % 4] += 1;
    });
    const sideSlot = [0, 0, 0, 0];
    state.movers = floaters.map(function (el, i) {
      const side = i % 4;
      const slot = sideSlot[side];
      sideSlot[side] += 1;
      const count = sideCounts[side];
      const t = count <= 1 ? 0.5 : (slot + 0.5) / count;
      const jitter = (Math.random() - 0.5) * 12;
      let x;
      let y;
      if (side === 0) {
        x = minX + t * (maxX - minX) + jitter;
        y = minY;
      } else if (side === 1) {
        x = maxX;
        y = minY + t * (maxY - minY) + jitter;
      } else if (side === 2) {
        x = minX + t * (maxX - minX) + jitter;
        y = maxY;
      } else {
        x = minX;
        y = minY + t * (maxY - minY) + jitter;
      }
      if (x < minX) x = minX;
      if (x > maxX) x = maxX;
      if (y < minY) y = minY;
      if (y > maxY) y = maxY;
      const speed = (0.32 + Math.random() * 0.36) * mul;
      placeEl(el, x, y);
      return {
        el: el,
        cannon: el.querySelector(".tank-cannon"),
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        speed: speed,
        halfW: TANK_HALF,
        halfH: TANK_HALF,
        nextFire: 0,
        nextTurn: 0,
        chase: false,
      };
    });

    const tipEl = document.getElementById("tip-target");
    if (tipEl && state.tipHunt && tipAllowed() && isHitType()) {
      const ang = Math.random() * Math.PI * 2;
      const tipSpeed = (0.45 + Math.random() * 0.25) * mul;
      const tx = w * (0.3 + Math.random() * 0.4);
      const ty = h * (0.25 + Math.random() * 0.45);
      state.tip = {
        el: tipEl,
        x: tx,
        y: ty,
        vx: Math.cos(ang) * tipSpeed,
        vy: Math.sin(ang) * tipSpeed,
        hitsLeft: TIP_HITS,
      };
      tipEl.textContent = String(TIP_HITS);
      placeEl(tipEl, tx, ty);
    } else {
      state.tip = null;
    }

    placePlayerClearOfTargets(w, h);
    placeEl(tankEl, state.player.x, state.player.y);
    aimPlayerCannon();
    const spawnNow = performance.now();
    markChasers();
    state.movers.forEach(function (m) {
      if (m.chase || !diff().wander) {
        aimAtPlayer(m, state.player);
        return;
      }
      setWanderHeading(m, spawnNow);
    });

    const startNow = performance.now();
    state.countEnd = startNow + COUNT_MS;
    state.goUntil = state.countEnd + COUNT_GO_MS;
    state.liveAt = 0;
    state.fireArmed = false;
    cacheFieldMetrics();
    scheduleCount();
    requestAnimationFrame(function () {
      cacheFieldMetrics();
      clampArenaToField();
      syncFsBtn();
    });
  }

  function resetRound(mode, deck) {
    stopArenaLoop();
    clearKeys();
    state.mode = mode;
    state.deck = deck;
    state.index = 0;
    state.firstHits = 0;
    state.misses = 0;
    state.weak = [];
    state.locked = false;
    state.paused = false;
    state.hearts = diff().hearts;
    state.immuneUntil = 0;
    state.fireLockUntil = 0;
    state.died = false;
    state.countEnd = 0;
    state.goUntil = 0;
    state.liveAt = 0;
    state.fireArmed = false;
    hideOverlay();
    show("play");
  }

  function current() {
    return state.deck[state.index];
  }

  function missExplain(wrongText, item) {
    if (item.pair) {
      return "✗ 「" + wrongText + "」不對。" + (item.hinge || "");
    }
    if (isPassType()) {
      const extra = item.vs ? " " + item.vs : item.plain ? " " + item.plain : "";
      return "✗ 這段不是「" + wrongText + "」。" + extra;
    }
    const owner = HIT_OWNER[wrongText];
    if (owner && owner !== item.name) {
      return "✗ " + wrongText + "是「" + owner + "」的作用，不是「" + item.name + "」。";
    }
    return "✗ 這不是「" + item.name + "」的作用。";
  }

  function playKeys() {
    if (isPairType()) return COPY.keysPair;
    if (isPassType()) return COPY.keysPass;
    return COPY.keys;
  }

  function promptHtml(item) {
    if (item.pair) {
      return (
        `<p class="pair-q">${item.question}</p>` +
        `<div class="pair-cols">` +
        `<div class="pair-card"><span>${COPY.jia}</span><p>${item.jia}</p></div>` +
        `<div class="pair-card"><span>${COPY.yi}</span><p>${item.yi}</p></div>` +
        `</div>`
      );
    }
    if (isPassType()) {
      return `<div class="passage-box">${item.passage}</div>`;
    }
    return `<div class="prompt-box">${COPY.prompt}：${item.name}</div>`;
  }

  function syncPauseFeedback() {
    const pf = document.getElementById("pause-fb");
    const fb = document.getElementById("feedback");
    if (pf && fb) pf.textContent = fb.textContent || "";
  }

  function setFeedback(text) {
    const fb = document.getElementById("feedback");
    if (fb) fb.textContent = text;
    syncPauseFeedback();
  }

  function revealOneRemaining() {
    const item = current();
    if (!item || item.usedTip || !state.remaining.length) return;
    const id = state.remaining[Math.floor(Math.random() * state.remaining.length)];
    const token = item.tokens.find(function (tok) {
      return tok.id === id;
    });
    if (!token) return;
    item.usedTip = true;
    const line = document.getElementById("tip-line");
    if (line) {
      line.hidden = false;
      line.textContent = COPY.tipReveal + token.text;
    }
    setFeedback(COPY.tipReveal + token.text);
  }

  function setPaused(on) {
    state.paused = on;
    const field = state.field || playEl.querySelector(".playfield");
    if (field) field.classList.toggle("paused", on);
    if (on) {
      syncPauseFeedback();
      freezePlayClock();
      cancelMoveLoop();
    } else {
      resumePlayClock();
      startMoveLoop();
    }
  }

  function togglePause() {
    if (state.view !== "play" || state.locked || overlayOpen() || counting()) return;
    setPaused(!state.paused);
  }

  function renderShoot() {
    const item = current();
    state.remaining = item.tokens.filter(function (t) {
      return t.ok;
    }).map(function (t) {
      return t.id;
    });
    state.paused = false;
    state.tankHits = 0;
    state.okHits = 0;
    state.playMs = 0;
    state.playTick = 0;
    stopArenaLoop();
    clearKeys();
    const floaters = item.tokens
      .map(function (token, i) {
        const color = TANK_COLORS[i % TANK_COLORS.length];
        return (
          '<div class="floater" data-token="' +
          token.id +
          '">' +
          tankMarkup(token.text, color) +
          "</div>"
        );
      })
      .join("");
    playEl.innerHTML = `
      <div class="stage">
        <div class="meta-row">
          <span class="cat-pill">${item.cat}</span>
          <span class="hearts" id="play-hearts"></span>
          <span id="remain-count">${COPY.remaining} ${state.remaining.length}</span>
          <button type="button" class="fs-btn" id="btn-fs" data-fullscreen="1">${COPY.fullscreen}</button>
        </div>
        <p class="prompt-arrow">${playKeys()}</p>
        <div class="prompt-top">
          ${promptHtml(item)}
        </div>
        <p class="tip-line" id="tip-line" hidden></p>
        <div class="playfield">
          ${floaters}
          ${
            state.tipHunt && tipAllowed() && isHitType()
              ? '<div class="tip-target" id="tip-target">' + TIP_HITS + "</div>"
              : ""
          }
          <div class="player-tank" aria-hidden="true">${tankMarkup("我", "#00b2e1")}</div>
          <div class="count-banner" id="count-banner" hidden></div>
          <div class="pause-banner"><div>${COPY.paused} · ${COPY.pauseHint}</div><p class="pause-fb" id="pause-fb"></p></div>
          <div id="teach" class="clear-card" hidden></div>
        </div>
        <p class="key-hint">${COPY.keysHint}</p>
        <p class="feedback" id="feedback"></p>
      </div>
    `;
    updateHud();
    syncFsBtn();
    startArenaLoop();
  }

  function showSpark(field, x, y) {
    const spark = document.createElement("div");
    spark.className = "spark";
    spark.style.left = x + "px";
    spark.style.top = y + "px";
    field.appendChild(spark);
    setTimeout(function () {
      spark.remove();
    }, 300);
  }

  function fireEnemyShot(m, now) {
    const field = state.field;
    const player = state.player;
    if (!field || !player) return;
    const theta = Math.atan2(player.y - m.y, player.x - m.x);
    const startX = m.x + Math.cos(theta) * ENEMY_BULLET_OFFSET;
    const startY = m.y + Math.sin(theta) * ENEMY_BULLET_OFFSET;
    const speed = diff().enemyBullet || 8;
    const bullet = document.createElement("div");
    bullet.className = "bullet enemy";
    placeEl(bullet, startX, startY);
    field.appendChild(bullet);
    state.bullets.push({
      el: bullet,
      x: startX,
      y: startY,
      vx: Math.cos(theta) * speed,
      vy: Math.sin(theta) * speed,
      born: now,
      enemy: true,
    });
  }

  function fireShot() {
    if (state.mode !== "shoot" || state.locked || state.paused || overlayOpen() || counting()) return;
    const field = state.field;
    const player = state.player;
    if (!field || !player) return;
    const now = performance.now();
    if (now < state.fireLockUntil) return;
    if (now - state.lastFire < FIRE_COOLDOWN) return;
    state.lastFire = now;
    const theta = player.cannonTheta;
    const startX = player.x + Math.cos(theta) * BULLET_OFFSET;
    const startY = player.y + Math.sin(theta) * BULLET_OFFSET;
    const bullet = document.createElement("div");
    bullet.className = "bullet";
    placeEl(bullet, startX, startY);
    field.appendChild(bullet);
    state.bullets.push({
      el: bullet,
      x: startX,
      y: startY,
      vx: Math.cos(theta) * BULLET_SPEED,
      vy: Math.sin(theta) * BULLET_SPEED,
      born: now,
    });
  }

  function showTeach(item) {
    freezePlayClock();
    stopArenaLoop();
    setPaused(false);
    const hitsText = item.hits ? item.hits.join("、") : uniqueHitText(item.tokens);
    const acc = state.tankHits ? Math.min(100, Math.round((state.okHits / state.tankHits) * 100)) : 0;
    const what = item.pair ? item.hinge : item.plain || "";
    const effect = item.pair
      ? "正確是「" + (item.ok || "") + "」。"
      : (item.plain || "") + (hitsText ? "（" + hitsText + "）" : "");
    const exampleBody = item.pair
      ? `<div class="pair-cols teach-pair">` +
        `<div class="pair-card"><span>${COPY.jia}</span><p>${item.jia}</p></div>` +
        `<div class="pair-card"><span>${COPY.yi}</span><p>${item.yi}</p></div>` +
        `</div>`
      : `<p>${item.example || ""}</p>`;
    const mark = item.mark || "";
    const vs = item.vs || "";
    const teach = document.getElementById("teach");
    teach.hidden = false;
    teach.innerHTML =
      `<div class="clear-inner">` +
      `<p class="clear-title">${item.name}</p>` +
      `<div class="teach-block"><span>${COPY.teachWhat}</span><p>${what}</p></div>` +
      `<div class="teach-block"><span>${COPY.teachEffect}</span><p>${effect}</p></div>` +
      `<div class="teach-block"><span>${COPY.teachExample}</span>${exampleBody}<p class="teach-mark">${mark}</p></div>` +
      `<div class="teach-block"><span>${COPY.teachVs}</span><p>${vs}</p></div>` +
      `<div class="teach-block teach-write"><span>${COPY.teachWrite}</span><p>${item.writeStem || ""}</p><p class="write-model">${item.writeModel || ""}</p></div>` +
      `<div class="clear-stats">` +
      `<div><span>${COPY.timeUsed}</span><b>${formatPlayTime(playElapsed())}</b></div>` +
      `<div><span>${COPY.accuracy}</span><b>${acc}%</b></div>` +
      `</div>` +
      `<button type="button" class="btn" data-next="1">${COPY.next}</button>` +
      `</div>`;
  }

  function shootToken(id) {
    if (state.locked) return;
    const item = current();
    const token = item.tokens.find(function (t) {
      return t.id === id;
    });
    const btn = playEl.querySelector('[data-token="' + id + '"]');
    if (!token || !btn || btn.classList.contains("hit") || btn.classList.contains("miss")) return;
    state.tankHits += 1;
    if (token.ok) {
      btn.classList.add("hit");
      state.okHits += 1;
      if (state.healOnHit) state.hearts = Math.min(diff().hearts, state.hearts + 1);
      setTankLabel(btn, "✓ " + token.text);
      state.remaining = state.remaining.filter(function (x) {
        return x !== id;
      });
      if (isHitType()) {
        setFeedback("✓ 「" + item.name + "」的作用是「" + token.text + "」。");
      } else if (isPassType()) {
        setFeedback("✓ 這段用了「" + item.name + "」。");
      } else {
        setFeedback("✓ " + token.text);
      }
      playEl.querySelector("#remain-count").textContent =
        COPY.remaining + " " + state.remaining.length;
      if (state.remaining.length === 0) {
        state.locked = true;
        if (!item.missed.length && !item.usedTip) state.firstHits += 1;
        updateHud();
        showTeach(item);
      } else {
        updateHud();
      }
    } else {
      btn.classList.add("miss");
      setTankLabel(btn, "✗ " + token.text);
      state.misses += 1;
      if (item.missed.indexOf(token.text) === -1) item.missed.push(token.text);
      if (
        !state.weak.filter(function (w) {
          return w.id === item.id;
        }).length
      ) {
        state.weak.push(item);
      }
      setFeedback(missExplain(token.text, item));
      if (item.missed.length === 2) revealOneRemaining();
      state.fireLockUntil = performance.now() + FIRE_LOCK_MS;
      if (diff().missHeart) {
        state.hearts -= 1;
        if (endIfNoHearts()) return;
      }
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
    renderShoot();
  }

  function burstConfetti() {
    stopConfetti();
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
      if (frame < 70) confettiRaf = requestAnimationFrame(tick);
      else {
        confettiRaf = 0;
        ctx.clearRect(0, 0, w, h);
      }
    }
    confettiRaf = requestAnimationFrame(tick);
  }

  function stopConfetti() {
    if (confettiRaf) {
      cancelAnimationFrame(confettiRaf);
      confettiRaf = 0;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function mixLines(item) {
    const want = item.pair ? item.ok : item.name;
    const lines = [];
    (item.missed || []).forEach(function (wrong) {
      const owner = HIT_OWNER[wrong];
      if (item.pair || isPassType()) {
        lines.push("你射了「" + wrong + "」，題目要的是「" + want + "」");
        return;
      }
      if (owner && owner !== item.name) {
        lines.push("你射了「" + wrong + "」（" + owner + "），題目要的是「" + item.name + "」");
      }
    });
    return lines;
  }

  function catStatsHtml() {
    const by = {};
    state.deck.forEach(function (item) {
      if (!by[item.cat]) by[item.cat] = { ok: 0, n: 0 };
      by[item.cat].n += 1;
      if (!item.missed.length && !item.usedTip) by[item.cat].ok += 1;
    });
    const cats = Object.keys(by);
    if (!cats.length) return "";
    return (
      `<p class="recap-label">${COPY.recapCat}</p><ul class="cat-stats">` +
      cats
        .map(function (cat) {
          return `<li>${cat} ${by[cat].ok}/${by[cat].n}</li>`;
        })
        .join("") +
      `</ul>`
    );
  }

  function renderRecap() {
    show("recap");
    hudEl.hidden = true;
    if (state.weak.length) saveWeakStore();
    const clean = state.misses === 0 && !state.died;
    const mix = [];
    state.weak.forEach(function (w) {
      mixLines(w).forEach(function (line) {
        if (mix.indexOf(line) === -1) mix.push(line);
      });
    });
    const mixHtml = mix.length
      ? `<p class="recap-label">${COPY.recapMix}</p><ul class="mix-list">${mix
          .map(function (line) {
            return `<li>${line}</li>`;
          })
          .join("")}</ul>`
      : "";
    const weak = state.weak.length
      ? `<p>${COPY.keep}</p><ul class="weak-list">${state.weak
          .map(function (w) {
            const hitsText = w.hits ? w.hits.join("、") : uniqueHitText(w.tokens || []);
            const picked = w.missed.length
              ? `<div class="picked">誤中：${w.missed.join("、")}</div>`
              : "";
            return `<li class="recap-pair"><div class="pair">${w.name} → ${hitsText}</div>${picked}</li>`;
          })
          .join("")}</ul>`
      : `<p>${COPY.clean}。</p>`;
    const homeItem = state.weak[0];
    const homeHtml =
      homeItem && (homeItem.writeStem || homeItem.writeModel)
        ? `<div class="home-work"><p class="recap-label">${COPY.recapHome}</p><p>${homeItem.writeStem || ""}</p><p class="write-model">${homeItem.writeModel || ""}</p></div>`
        : "";
    const retry = state.weak.length
      ? `<button type="button" class="btn" data-retry-weak="1">${COPY.retryWeak}</button>`
      : "";
    const dead = state.died ? `<p class="out-of-hearts">${COPY.outOfHearts}</p>` : "";
    recapEl.innerHTML = `
      <div class="recap-card">
        <h2>${COPY.recapTitle}</h2>
        ${dead}
        <div class="score-row">
          <div><span>${COPY.firstHits}</span><b>${state.firstHits}</b></div>
          <div><span>${COPY.misses}</span><b>${state.misses}</b></div>
        </div>
        ${catStatsHtml()}
        ${mixHtml}
        ${weak}
        ${homeHtml}
        <div class="recap-actions">
          <button type="button" class="btn" data-replay="shoot">${COPY.again}</button>
          ${retry}
          <button type="button" class="btn btn-ghost" data-home="1">${COPY.home}</button>
        </div>
      </div>
    `;
    if (clean && !state.died) burstConfetti();
  }

  function requestLeave() {
    if (state.view !== "play") {
      goHome();
      return;
    }
    showOverlay();
  }

  function goHome() {
    stopConfetti();
    stopArenaLoop();
    clearKeys();
    hideOverlay();
    state.mode = null;
    state.deck = [];
    state.locked = false;
    state.paused = false;
    state.setupStep = 0;
    setupBusy = false;
    if (setupTimer) {
      clearTimeout(setupTimer);
      setupTimer = 0;
    }
    loadSetupStore();
    show("hub");
    renderHub(0);
    updateHud();
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
    if (e.target.closest("[data-setup-start]")) {
      if (e.target.closest("[data-setup-start]").disabled) return;
      startShoot(false);
      return;
    }
    if (e.target.closest("[data-resume-weak]")) {
      startResumeWeak();
      return;
    }
    const catChip = e.target.closest("[data-cat]");
    if (catChip) {
      if (catChip.disabled) return;
      state.cat = catChip.getAttribute("data-cat");
      saveSetupStore();
      goSetupStep(2, 1, catChip);
      return;
    }
    const qtypeChip = e.target.closest("[data-qtype]");
    if (qtypeChip) {
      if (qtypeChip.disabled) return;
      state.qtype = qtypeChip.getAttribute("data-qtype");
      saveSetupStore();
      goSetupStep(3, 1, qtypeChip);
      return;
    }
    const speedChip = e.target.closest("[data-speed]");
    if (speedChip) {
      if (speedChip.disabled) return;
      const next = speedChip.getAttribute("data-speed");
      if (next === COPY.speedSlow && state.speed !== COPY.speedSlow) {
        state.tipHunt = true;
        state.healOnHit = true;
      }
      state.speed = next;
      saveSetupStore();
      renderHub(0);
      return;
    }
    const tipChip = e.target.closest("[data-tip]");
    if (tipChip) {
      if (tipChip.disabled) return;
      state.tipHunt = tipChip.getAttribute("data-tip") === COPY.tipOn;
      saveSetupStore();
      markChipActive(tipChip);
      return;
    }
    const healChip = e.target.closest("[data-heal]");
    if (healChip) {
      if (healChip.disabled) return;
      state.healOnHit = healChip.getAttribute("data-heal") === COPY.healOn;
      saveSetupStore();
      markChipActive(healChip);
    }
  });

  playEl.addEventListener("mousemove", function (e) {
    if (state.mode !== "shoot" || !e.target.closest(".playfield")) return;
    if (overlayOpen()) return;
    setMouseFromEvent(e);
    if (!state.paused && !state.locked) aimPlayerCannon();
  });

  playEl.addEventListener("click", function (e) {
    if (e.target.closest("[data-fullscreen]")) {
      togglePlayFullscreen();
      return;
    }
    if (overlayOpen()) return;
    if (e.target.closest("[data-next]")) {
      advance();
      return;
    }
    if (state.mode === "shoot" && e.target.closest(".playfield")) {
      setMouseFromEvent(e);
      aimPlayerCannon();
      fireShot();
    }
  });

  recapEl.addEventListener("click", function (e) {
    if (e.target.closest("[data-retry-weak]")) {
      startShoot(true);
      return;
    }
    const replay = e.target.closest("[data-replay]");
    if (replay) {
      startShoot(false);
      return;
    }
    if (e.target.closest("[data-home]")) goHome();
  });

  document.addEventListener("fullscreenchange", onPlayfieldResize);
  document.addEventListener("webkitfullscreenchange", onPlayfieldResize);
  window.addEventListener("resize", onPlayfieldResize);

  homeBtn.addEventListener("click", requestLeave);
  leaveStay.addEventListener("click", hideOverlay);
  leaveHome.addEventListener("click", goHome);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        e.preventDefault();
        exitPlayFullscreen();
        return;
      }
      e.preventDefault();
      if (overlayOpen()) {
        hideOverlay();
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
      if (state.view === "recap") goHome();
      return;
    }
    if (overlayOpen()) return;
    if ((e.key === "f" || e.key === "F") && state.view === "play") {
      e.preventDefault();
      togglePlayFullscreen();
      return;
    }
    if (e.code === "Space" || e.key === " ") {
      if (state.view === "play") {
        e.preventDefault();
        togglePause();
      }
      return;
    }
    const dir = keyDir(e);
    if (dir && state.view === "play" && state.mode === "shoot") {
      e.preventDefault();
      state.keys[dir] = true;
    }
  });

  document.addEventListener("keyup", function (e) {
    const dir = keyDir(e);
    if (dir) state.keys[dir] = false;
  });

  if (leaveTitle) leaveTitle.textContent = COPY.leaveTitle;
  if (leaveStay) leaveStay.textContent = COPY.leaveStay;
  if (leaveHome) leaveHome.textContent = COPY.leaveHome;
  migrateStores();
  loadSetupStore();
  renderHub();
  show("hub");
})();
