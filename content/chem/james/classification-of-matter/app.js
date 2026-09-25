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
  let floorTimer = 0;
  let doorAnimTimer = 0;
  let bossCueTimer = 0;
  let bossTellTimer = 0;
  let bossTellHideTimer = 0;
  let buffToastTimer = 0;
  const reduceMotionMq = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  const CATS = [];
  TECHNIQUES.forEach(function (tech) {
    if (CATS.indexOf(tech.cat) === -1) CATS.push(tech.cat);
  });
  const AMMO = ["Pure element", "Pure compound", "Mixture of elements"];
  const TRIO = ["Fe", "FeS", "Fe + S"];
  const FLOOR_ANCHOR = {
    "pure-element": "Fe",
    "pure-compound": "FeS",
    "mixture-elements": "Fe + S",
  };

  const DIFF = {};
  DIFF[COPY.speedSlow] = {
    mul: 0.45,
    tokens: 6,
    needCorrect: 1,
    hearts: 5,
    missHeart: false,
    sameCat: false,
    enemyFire: false,
    bossHp: 20,
    bossFireMs: 2400,
    bossFireJitter: 400,
    bossBullet: 5,
    bossGrace: 2500,
  };
  DIFF[COPY.speedNormal] = {
    mul: 1,
    tokens: 9,
    needCorrect: 3,
    hearts: 5,
    missHeart: true,
    sameCat: false,
    enemyFire: true,
    enemyBullet: 2.5,
    enemyFireMs: 6000,
    enemyFireJitter: 1800,
    enemyGrace: 8000,
    enemyArmJitter: 4000,
    bossHp: 180,
    bossFireMs: 450,
    bossFireJitter: 400,
    bossBullet: 10,
    bossGrace: 1400,
  };
  DIFF[COPY.speedFast] = {
    mul: 2.3,
    tokens: 15,
    needCorrect: 5,
    hearts: 3,
    missHeart: true,
    sameCat: true,
    enemyFire: true,
    enemyBullet: 6,
    enemyFireMs: 2400,
    enemyFireJitter: 800,
    enemyGrace: 6000,
    enemyArmJitter: 2600,
    roomAgro: true,
    bossHp: 240,
    bossFireMs: 450,
    bossFireJitter: 150,
    bossBullet: 13,
    bossGrace: 600,
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
  const BOSS_HALF = 28;
  const TANK_COLORS = ["#2bbbdf", "#f5c542", "#7c3aed", "#178a57", "#d97706", "#db2777"];
  const MOB_KINDS = ["slime", "skull", "bat"];
  const FLOOR_TITLE_MS = 900;
  const WEAK_KEY = "matter-weak";
  const SETUP_KEY = "matter-setup";
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
    collected: [],
    fragmentTotal: 0,
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
    heartsMax: 5,
    bossDamage: 1,
    immuneUntil: 0,
    healOnHit: false,
    bossMode: false,
    bossDoorOpen: false,
    bossLockedIn: false,
    bossDead: false,
    bossCueShown: false,
    bossFightAt: 0,
    bossTellClass: "",
    room0Camp: false,
    room0LastHurt: 0,
    died: false,
    ammo: AMMO[0],
    setupStep: 0,
    tipHunt: false,
    tip: null,
    buffs: [],
    countEnd: 0,
    goUntil: 0,
    liveAt: 0,
    fireArmed: false,
    floorSwitching: false,
    floorTitleUntil: 0,
    dungeon: null,
    roomCount: 3,
    teachQueue: null,
    teachPos: 0,
  };

  function diff() {
    return DIFF[state.speed] || DIFF[COPY.speedNormal];
  }

  function bossFlavor() {
    return BOSS_BY_CAT[state.cat] || BOSS_BY_CAT[COPY.catAll];
  }

  function bossName() {
    return bossFlavor().name;
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function floorLabel(n) {
    return COPY.round + n + COPY.floorUnit;
  }

  function floorThemeClass() {
    const themes = ["floor-stone", "floor-moss", "floor-lava"];
    return themes[state.index % 3];
  }

  function uniqueHitText(tokens) {
    const seen = [];
    tokens.forEach(function (t) {
      if (!t.ok) return;
      if (seen.indexOf(t.text) === -1) seen.push(t.text);
    });
    return seen.join(", ");
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

  function isHardMix() {
    if (state.speed !== COPY.speedFast || isPairType()) return false;
    return COMBOS.some(function (combo) {
      return comboMatchesCat(combo, state.cat);
    });
  }

  function techById(id) {
    return TECHNIQUES.find(function (tech) {
      return tech.id === id;
    });
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
      state.cat = COPY.catAll;
      state.qtype = COPY.qtypeHit;
      if (data.speed && DIFF[data.speed]) state.speed = data.speed;
      if (typeof data.tipHunt === "boolean") state.tipHunt = data.tipHunt;
      if (typeof data.healOnHit === "boolean") state.healOnHit = data.healOnHit;
      if (typeof data.bossMode === "boolean") state.bossMode = data.bossMode;
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
          bossMode: state.bossMode,
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
    if (now < state.floorTitleUntil) {
      banner.textContent = floorLabel(state.index + 1);
    } else if (now >= state.countEnd) {
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
    if (s < 60) return s.toFixed(1) + " s";
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
    document.body.classList.toggle("play-fill", view === "play");
    document.documentElement.classList.toggle("play-fill", view === "play");
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
    if (roundEl) {
      roundEl.textContent =
        floorLabel(state.index + 1) + COPY.of + state.deck.length + COPY.floorUnit;
    }
    if (hitsEl) hitsEl.textContent = COPY.firstHits + " " + state.firstHits;
    if (missesEl) missesEl.textContent = COPY.misses + " " + state.misses;
    const playHearts = document.getElementById("play-hearts");
    if (!playHearts) return;
    playHearts.setAttribute("aria-label", COPY.hearts + " " + state.hearts);
    const max = state.heartsMax || diff().hearts;
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

  function withSetup(cat, qtype, speed, fn) {
    const savedCat = state.cat;
    const savedQ = state.qtype;
    const savedSpeed = state.speed;
    state.cat = cat;
    state.qtype = qtype;
    state.speed = speed;
    const out = fn();
    state.cat = savedCat;
    state.qtype = savedQ;
    state.speed = savedSpeed;
    return out;
  }

  function poolLength(cat, qtype, speed) {
    return withSetup(cat, qtype, speed, function () {
      return poolForRound(false).length;
    });
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
    else if (state.speed === COPY.speedFast) {
      note = isHardMix() || isPairType() ? COPY.speedNoteFast : COPY.speedNoteFastSolo;
    }
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
            <li>${COPY.howtoBoss}</li>
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
    if (state.setupStep === 3) {
      const speedDisabled = {};
      [COPY.speedSlow, COPY.speedNormal, COPY.speedFast].forEach(function (speed) {
        if (!poolLength(state.cat, state.qtype, speed)) speedDisabled[speed] = true;
      });
      if (speedDisabled[state.speed]) {
        const fallback = [COPY.speedNormal, COPY.speedSlow, COPY.speedFast].filter(function (speed) {
          return !speedDisabled[speed];
        })[0];
        if (fallback) {
          state.speed = fallback;
          saveSetupStore();
        }
      }
      const empty = poolForRound(false).length === 0;
      let extra = `<div class="setup-options">`;
      if (tipAllowed() && isHitType()) {
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
        ) +
        chipRowHtml(
          COPY.pickBoss,
          chipButtons([COPY.bossOff, COPY.bossOn], "data-boss", state.bossMode ? COPY.bossOn : COPY.bossOff),
          "chip-boss"
        ) +
        `</div>`;
      return `
          <p class="track">${COPY.trackLearn}</p>
          ${chipRowHtml(
            COPY.pickSpeed,
            chipButtons([COPY.speedSlow, COPY.speedNormal, COPY.speedFast], "data-speed", state.speed, speedDisabled),
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
    goSetupStep(0, -1);
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
      if (isHardMix()) {
        return COMBOS.filter(function (combo) {
          return ids.indexOf(combo.id) !== -1;
        });
      }
      return TECHNIQUES.filter(function (tech) {
        return ids.indexOf(tech.id) !== -1;
      });
    }
    if (isHardMix()) {
      return COMBOS.filter(function (combo) {
        return comboMatchesCat(combo, state.cat);
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

  function padCorrectCopies(raw) {
    const need = diff().needCorrect || 1;
    const oks = [];
    const rest = [];
    raw.forEach(function (t) {
      if (t.ok) oks.push(t);
      else rest.push(t);
    });
    if (!oks.length) return raw;
    const uniq = [];
    const seen = {};
    oks.forEach(function (t) {
      if (seen[t.text]) return;
      seen[t.text] = true;
      uniq.push({ text: t.text, ok: true });
    });
    const chosen = [];
    if (uniq.length >= need) {
      shuffle(uniq)
        .slice(0, need)
        .forEach(function (t) {
          chosen.push({ text: t.text, ok: true });
        });
    } else {
      uniq.forEach(function (t) {
        chosen.push({ text: t.text, ok: true });
      });
      let i = 0;
      while (chosen.length < need) {
        const src = uniq[i % uniq.length];
        chosen.push({ text: src.text, ok: true });
        i += 1;
      }
    }
    return chosen.concat(rest);
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

  function rollRoomCount() {
    return 3 + Math.floor(Math.random() * 3);
  }

  function assignRooms(tokens, roomCount) {
    const n = Math.max(1, roomCount || 3);
    const ok = [];
    const decoy = [];
    tokens.forEach(function (t) {
      if (t.ok) ok.push(t);
      else decoy.push(t);
    });
    shuffle(ok);
    shuffle(decoy);
    const buckets = [];
    for (let r = 0; r < n; r++) buckets.push([]);
    ok.forEach(function (t, i) {
      buckets[i % n].push(t);
    });
    decoy.forEach(function (t, i) {
      buckets[i % n].push(t);
    });
    const out = [];
    for (let r = 0; r < n; r++) {
      buckets[r] = shuffle(buckets[r]);
      buckets[r].forEach(function (t) {
        t.room = r;
        out.push(t);
      });
    }
    return out;
  }

  function groupTrio(tokens) {
    const members = tokens.filter(function (t) {
      return TRIO.indexOf(t.text) !== -1;
    });
    if (members.length < 2) return;
    const room = members[0].room;
    members.forEach(function (t) {
      t.room = room;
    });
  }

  function comboMatchesCat(combo, cat) {
    if (cat === COPY.catAll) return true;
    return (combo.ids || []).every(function (id) {
      const tech = techById(id);
      return tech && tech.cat === cat;
    });
  }

  function comboTechs(combo) {
    return (combo.ids || combo.comboIds || [])
      .map(function (id) {
        return techById(id);
      })
      .filter(Boolean);
  }

  function extraDecoyPoolCombo(techs) {
    const skip = {};
    const cat0 = techs[0] && techs[0].cat;
    techs.forEach(function (tech) {
      tech.hits.forEach(function (text) {
        skip[text] = true;
      });
      tech.decoys.forEach(function (text) {
        skip[text] = true;
      });
    });
    const same = [];
    const rest = [];
    TECHNIQUES.forEach(function (other) {
      if (
        techs.some(function (tech) {
          return tech.id === other.id;
        })
      ) {
        return;
      }
      other.hits.forEach(function (text) {
        if (skip[text]) return;
        const bucket = other.cat === cat0 ? same : rest;
        if (bucket.indexOf(text) === -1) bucket.push(text);
      });
    });
    if (diff().sameCat) return shuffle(same).concat(shuffle(rest));
    return shuffle(same.concat(rest));
  }

  function nameDecoyPoolCombo(techs) {
    const skip = {};
    const twinSet = {};
    techs.forEach(function (tech) {
      skip[tech.name] = true;
      (tech.twins || []).forEach(function (id) {
        twinSet[id] = true;
      });
    });
    const twins = [];
    const same = [];
    const rest = [];
    TECHNIQUES.forEach(function (other) {
      if (skip[other.name]) return;
      if (twinSet[other.id]) twins.push(other.name);
      else if (
        techs.some(function (tech) {
          return tech.cat === other.cat;
        })
      ) {
        same.push(other.name);
      } else rest.push(other.name);
    });
    return shuffle(twins).concat(shuffle(same)).concat(shuffle(rest));
  }

  function comboFloorFields(combo, techs) {
    return {
      id: combo.id,
      cat: COPY.mixCat,
      name: techs
        .map(function (tech) {
          return tech.name;
        })
        .join(", "),
      passage: combo.passage,
      mark: combo.mark || "",
      comboIds: combo.ids.slice(),
      missed: [],
      usedTip: false,
    };
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

  function trimToTokenCap(raw) {
    const cap = diff().tokens;
    while (raw.length > cap) {
      let idx = -1;
      for (let i = raw.length - 1; i >= 0; i--) {
        if (!raw[i].ok) {
          idx = i;
          break;
        }
      }
      if (idx < 0) break;
      raw.splice(idx, 1);
    }
  }

  function makeComboHitDeck(pool) {
    const size = Math.min(10, pool.length);
    return shuffle(pool)
      .slice(0, size)
      .map(function (combo) {
        const techs = comboTechs(combo);
        let raw = [];
        const skip = {};
        techs.forEach(function (tech) {
          tech.hits.forEach(function (text) {
            raw.push({ text: text, ok: true });
            skip[text] = true;
          });
        });
        raw = padCorrectCopies(raw);
        fillDecoys(raw, extraDecoyPoolCombo(techs), skip);
        trimToTokenCap(raw);
        return Object.assign(comboFloorFields(combo, techs), {
          tokens: tokensFromRaw(raw, combo.id),
        });
      });
  }

  function makeComboPassDeck(pool) {
    const size = Math.min(10, pool.length);
    return shuffle(pool)
      .slice(0, size)
      .map(function (combo) {
        const techs = comboTechs(combo);
        let raw = techs.map(function (tech) {
          return { text: tech.name, ok: true };
        });
        raw = padCorrectCopies(raw);
        const skip = {};
        techs.forEach(function (tech) {
          skip[tech.name] = true;
        });
        fillDecoys(raw, nameDecoyPoolCombo(techs), skip);
        trimToTokenCap(raw);
        return Object.assign(comboFloorFields(combo, techs), {
          tokens: tokensFromRaw(raw, combo.id),
        });
      });
  }

  function makeHitDeck(pool) {
    if (isHardMix()) return makeComboHitDeck(pool);
    const size = Math.min(10, pool.length);
    return shuffle(pool)
      .slice(0, size)
      .map(function (tech) {
        let raw = [];
        const skip = {};
        tech.hits.forEach(function (text) {
          raw.push({ text: text, ok: true });
          skip[text] = true;
        });
        raw = padCorrectCopies(raw);
        const anchor = FLOOR_ANCHOR[tech.id];
        if (
          anchor &&
          !raw.some(function (t) {
            return t.ok && t.text === anchor;
          })
        ) {
          const ok = raw.find(function (t) {
            return t.ok;
          });
          if (ok) ok.text = anchor;
        }
        tech.decoys.forEach(function (text) {
          if (skip[text]) return;
          skip[text] = true;
          raw.push({ text: text, ok: false });
        });
        fillDecoys(raw, extraDecoyPool(tech), skip);
        trimToTokenCap(raw);
        return Object.assign(teachFields(tech), {
          tokens: tokensFromRaw(raw, tech.id),
          missed: [],
          usedTip: false,
        });
      });
  }

  function makePassDeck(pool) {
    if (isHardMix()) return makeComboPassDeck(pool);
    const size = Math.min(10, pool.length);
    return shuffle(pool)
      .slice(0, size)
      .map(function (tech) {
        let raw = padCorrectCopies([{ text: tech.name, ok: true }]);
        const skip = {};
        skip[tech.name] = true;
        fillDecoys(raw, nameDecoyPool(tech), skip);
        trimToTokenCap(raw);
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
        let raw = padCorrectCopies([{ text: pair.ok, ok: true }]);
        const skip = {};
        skip[pair.ok] = true;
        (pair.decoys || []).forEach(function (text) {
          if (skip[text]) return;
          skip[text] = true;
          raw.push({ text: text, ok: false });
        });
        fillDecoys(raw, extraPairLabels(pair, skip), skip);
        trimToTokenCap(raw);
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
    state.cat = COPY.catAll;
    if (!tipAllowed()) state.tipHunt = false;
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
    state.cat = COPY.catAll;
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

  function dungeonCarve(blocked, cols, rows, tx, ty) {
    if (tx <= 0 || ty <= 0 || tx >= cols - 1 || ty >= rows - 1) return;
    blocked[ty][tx] = 0;
  }

  function punchDoor(blocked, cols, rows, ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, horizontal) {
    const tiles = [];
    function carve(tx, ty) {
      dungeonCarve(blocked, cols, rows, tx, ty);
      if (ty > 0 && ty < rows - 1 && tx > 0 && tx < cols - 1 && !blocked[ty][tx]) {
        tiles.push({ tx: tx, ty: ty });
      }
    }
    const want = 4;
    if (horizontal) {
      const y0 = Math.max(ay0, by0);
      const y1 = Math.min(ay1, by1);
      const span = y1 - y0;
      if (span < 1) return tiles;
      const door = Math.min(want, span);
      const ym = y0 + Math.floor(Math.random() * Math.max(1, span - door + 1));
      const left = ax0 < bx0 ? ax1 : bx1;
      const right = ax0 < bx0 ? bx0 : ax0;
      for (let ty = ym; ty < ym + door && ty < y1; ty++) {
        for (let tx = left; tx < right; tx++) carve(tx, ty);
      }
      return tiles;
    }
    const x0 = Math.max(ax0, bx0);
    const x1 = Math.min(ax1, bx1);
    const span = x1 - x0;
    if (span < 1) return tiles;
    const door = Math.min(want, span);
    const xm = x0 + Math.floor(Math.random() * Math.max(1, span - door + 1));
    const top = ay0 < by0 ? ay1 : by1;
    const bot = ay0 < by0 ? by0 : ay0;
    for (let tx = xm; tx < xm + door && tx < x1; tx++) {
      for (let ty = top; ty < bot; ty++) carve(tx, ty);
    }
    return tiles;
  }

  function randInt(lo, hi) {
    return lo + Math.floor(Math.random() * (hi - lo + 1));
  }

  function overlapLen(a0, a1, b0, b1) {
    return Math.min(a1, b1) - Math.max(a0, b0);
  }

  function roomFits(room, rooms, cols, mapH) {
    if (room.tx0 < 1 || room.ty0 < 1 || room.tx1 > cols - 1 || room.ty1 > mapH - 1) return false;
    if (room.tx1 - room.tx0 < 4 || room.ty1 - room.ty0 < 4) return false;
    for (let i = 0; i < rooms.length; i++) {
      const o = rooms[i];
      if (room.tx0 < o.tx1 && o.tx0 < room.tx1 && room.ty0 < o.ty1 && o.ty0 < room.ty1) return false;
    }
    return true;
  }

  function tryAttachRoom(prev, dir, rooms, cols, mapH, compact, size) {
    const w = size && size.w ? size.w : compact ? randInt(5, 7) : randInt(6, 12);
    const h = size && size.h ? size.h : compact ? randInt(5, 7) : randInt(6, 11);
    const jog = compact ? randInt(-2, 2) : randInt(-5, 5);
    const room = { tx0: 0, ty0: 0, tx1: 0, ty1: 0 };
    if (dir === "N") {
      room.ty1 = prev.ty0 - 1;
      room.ty0 = room.ty1 - h;
      room.tx0 = prev.tx0 + jog;
      room.tx1 = room.tx0 + w;
      if (overlapLen(room.tx0, room.tx1, prev.tx0, prev.tx1) < 2) {
        room.tx0 = prev.tx0;
        room.tx1 = room.tx0 + w;
      }
    } else if (dir === "E") {
      room.tx0 = prev.tx1 + 1;
      room.tx1 = room.tx0 + w;
      room.ty0 = prev.ty0 + jog;
      room.ty1 = room.ty0 + h;
      if (overlapLen(room.ty0, room.ty1, prev.ty0, prev.ty1) < 2) {
        room.ty0 = prev.ty0;
        room.ty1 = room.ty0 + h;
      }
    } else if (dir === "W") {
      room.tx1 = prev.tx0 - 1;
      room.tx0 = room.tx1 - w;
      room.ty0 = prev.ty0 + jog;
      room.ty1 = room.ty0 + h;
      if (overlapLen(room.ty0, room.ty1, prev.ty0, prev.ty1) < 2) {
        room.ty0 = prev.ty0;
        room.ty1 = room.ty0 + h;
      }
    } else {
      return null;
    }
    if (room.tx0 < 1) {
      const shift = 1 - room.tx0;
      room.tx0 += shift;
      room.tx1 += shift;
    }
    if (room.tx1 > cols - 1) {
      const shift = room.tx1 - (cols - 1);
      room.tx0 -= shift;
      room.tx1 -= shift;
    }
    if (room.ty0 < 1) {
      const shift = 1 - room.ty0;
      room.ty0 += shift;
      room.ty1 += shift;
    }
    if (room.ty1 > mapH - 1) {
      const shift = room.ty1 - (mapH - 1);
      room.ty0 -= shift;
      room.ty1 -= shift;
    }
    if (dir === "N" && overlapLen(room.tx0, room.tx1, prev.tx0, prev.tx1) < 2) return null;
    if ((dir === "E" || dir === "W") && overlapLen(room.ty0, room.ty1, prev.ty0, prev.ty1) < 2) return null;
    if (dir === "N" && room.ty1 !== prev.ty0 - 1) return null;
    if (dir === "E" && room.tx0 !== prev.tx1 + 1) return null;
    if (dir === "W" && room.tx1 !== prev.tx0 - 1) return null;
    if (!roomFits(room, rooms, cols, mapH)) return null;
    return room;
  }

  function eastFallbackRooms(n, cols, mapH) {
    const rooms = [];
    const usable = cols - 2 - (n - 1);
    const w = Math.max(4, Math.floor(usable / n));
    const h = Math.max(5, Math.min(12, mapH - 3));
    const ty1 = mapH - 1;
    const ty0 = Math.max(1, ty1 - h);
    let tx0 = 1;
    for (let i = 0; i < n; i++) {
      let tx1 = tx0 + w;
      if (i === n - 1) tx1 = cols - 1;
      if (tx1 > cols - 1) tx1 = cols - 1;
      rooms.push({ tx0: tx0, ty0: ty0, tx1: tx1, ty1: ty1 });
      tx0 = tx1 + 1;
    }
    return rooms;
  }

  function roomsTooClose(a, b) {
    if (a.tx0 < b.tx1 && b.tx0 < a.tx1 && a.ty0 < b.ty1 && b.ty0 < a.ty1) return true;
    const xOverlap = a.tx0 < b.tx1 && b.tx0 < a.tx1;
    const yOverlap = a.ty0 < b.ty1 && b.ty0 < a.ty1;
    if (xOverlap) {
      const gap = a.ty1 <= b.ty0 ? b.ty0 - a.ty1 : a.ty0 - b.ty1;
      if (gap < 1) return true;
    }
    if (yOverlap) {
      const gap = a.tx1 <= b.tx0 ? b.tx0 - a.tx1 : a.tx0 - b.tx1;
      if (gap < 1) return true;
    }
    return false;
  }

  function canInflateRoom(room, rooms, skip, cols, mapH) {
    if (room.tx0 < 1 || room.ty0 < 1 || room.tx1 > cols - 1 || room.ty1 > mapH - 1) return false;
    for (let i = 0; i < rooms.length; i++) {
      if (i === skip) continue;
      if (roomsTooClose(room, rooms[i])) return false;
    }
    return true;
  }

  function inflateRooms(rooms, cols, mapH) {
    const dirs = ["N", "E", "W", "S"];
    let grew = true;
    while (grew) {
      grew = false;
      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        const order = shuffle(dirs.slice());
        for (let d = 0; d < order.length; d++) {
          const next = { tx0: room.tx0, ty0: room.ty0, tx1: room.tx1, ty1: room.ty1 };
          if (order[d] === "N") next.ty0 -= 1;
          else if (order[d] === "E") next.tx1 += 1;
          else if (order[d] === "W") next.tx0 -= 1;
          else next.ty1 += 1;
          if (!canInflateRoom(next, rooms, i, cols, mapH)) continue;
          room.tx0 = next.tx0;
          room.ty0 = next.ty0;
          room.tx1 = next.tx1;
          room.ty1 = next.ty1;
          grew = true;
        }
      }
    }
  }

  function mapWalkFrac(blocked, cols, mapH) {
    let total = 0;
    let walk = 0;
    for (let y = 1; y < mapH - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        total += 1;
        if (!blocked[y][x]) walk += 1;
      }
    }
    return total ? walk / total : 0;
  }

  function bossRoomSized(rooms) {
    if (!rooms || !rooms.length) return false;
    const last = rooms[rooms.length - 1];
    const w = last.tx1 - last.tx0;
    const h = last.ty1 - last.ty0;
    if (w < 8 || h < 8) return false;
    let total = 0;
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      total += (room.tx1 - room.tx0) * (room.ty1 - room.ty0);
    }
    if (!total) return false;
    const frac = (w * h) / total;
    return frac >= 0.15 && frac < 0.45;
  }

  function tryRandomRooms(n, cols, mapH) {
    const h0 = randInt(6, 10);
    const w0 = randInt(7, 12);
    const ty1 = mapH - 1;
    const ty0 = ty1 - h0;
    if (ty0 < 1) return null;
    const tx0 = randInt(1, Math.max(1, cols - w0 - 2));
    const tx1 = tx0 + w0;
    const room0 = { tx0: tx0, ty0: ty0, tx1: tx1, ty1: ty1 };
    if (!roomFits(room0, [], cols, mapH)) return null;
    const rooms = [room0];
    const dirs = ["N", "E", "W"];
    for (let i = 1; i < n; i++) {
      let placed = null;
      const order = shuffle(dirs.slice());
      for (let d = 0; d < order.length && !placed; d++) {
        placed = tryAttachRoom(rooms[rooms.length - 1], order[d], rooms, cols, mapH, false);
      }
      if (!placed) {
        for (let d = 0; d < order.length && !placed; d++) {
          placed = tryAttachRoom(rooms[rooms.length - 1], order[d], rooms, cols, mapH, true);
        }
      }
      if (!placed) placed = tryAttachRoom(rooms[rooms.length - 1], "N", rooms, cols, mapH, true);
      if (!placed) return null;
      rooms.push(placed);
    }
    return rooms;
  }

  function dungeonCentersReachable(blocked, cols, rows, rooms, sx, sy) {
    if (!rooms.length) return false;
    const seen = {};
    const q = [];
    function walk(x, y) {
      if (x < 0 || y < 0 || x >= cols || y >= rows || blocked[y][x]) return;
      const k = x + "," + y;
      if (seen[k]) return;
      seen[k] = true;
      q.push([x, y]);
    }
    walk(sx, sy);
    for (let i = 0; i < q.length; i++) {
      const x = q[i][0];
      const y = q[i][1];
      walk(x + 1, y);
      walk(x - 1, y);
      walk(x, y + 1);
      walk(x, y - 1);
    }
    for (let r = 0; r < rooms.length; r++) {
      const room = rooms[r];
      const cx = Math.floor((room.tx0 + room.tx1 - 1) / 2);
      const cy = Math.floor((room.ty0 + room.ty1 - 1) / 2);
      if (!seen[cx + "," + cy]) return false;
    }
    return true;
  }

  function carveDungeon(blocked, cols, rows, mapH, rooms) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) blocked[y][x] = 1;
    }
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      for (let ty = room.ty0; ty < room.ty1; ty++) {
        for (let tx = room.tx0; tx < room.tx1; tx++) dungeonCarve(blocked, cols, rows, tx, ty);
      }
    }
    if (!rooms.length) return [];
    const r0 = rooms[0];
    for (let y = mapH; y < rows - 1; y++) {
      for (let x = r0.tx0; x < r0.tx1; x++) dungeonCarve(blocked, cols, rows, x, y);
    }
    const hallSpan = r0.tx1 - r0.tx0;
    const doorW = Math.min(4, Math.max(1, hallSpan));
    const xm = r0.tx0 + Math.floor(Math.random() * Math.max(1, hallSpan - doorW + 1));
    for (let tx = xm; tx < xm + doorW && tx < r0.tx1; tx++) {
      for (let ty = r0.ty1; ty < mapH; ty++) dungeonCarve(blocked, cols, rows, tx, ty);
    }
    let lastDoor = [];
    for (let i = 0; i < rooms.length - 1; i++) {
      const a = rooms[i];
      const b = rooms[i + 1];
      const sideBySide = a.tx1 <= b.tx0 || b.tx1 <= a.tx0;
      const tiles = punchDoor(blocked, cols, rows, a.tx0, a.ty0, a.tx1, a.ty1, b.tx0, b.ty0, b.tx1, b.ty1, sideBySide);
      if (i === rooms.length - 2) lastDoor = tiles;
    }
    return lastDoor;
  }

  function makeDungeon(fieldW, fieldH, roomCount) {
    const n = Math.max(3, Math.min(5, roomCount || state.roomCount || 3));
    const entranceRows = 3;
    const minCols = Math.max(28, n * 5 + 6);
    const minRows = 18 + entranceRows;
    const cols = Math.max(minCols, Math.round(fieldW / 32));
    const rows = Math.max(minRows, Math.round(fieldH / 32));
    const tileW = fieldW / cols;
    const tileH = fieldH / rows;
    const blocked = [];
    for (let y = 0; y < rows; y++) {
      blocked[y] = [];
      for (let x = 0; x < cols; x++) blocked[y][x] = 1;
    }
    const mapH = rows - entranceRows;
    let rooms = null;
    let bossDoorTiles = [];
    function tryAcceptRooms(candidate) {
      inflateRooms(candidate, cols, mapH);
      const doorTiles = carveDungeon(blocked, cols, rows, mapH, candidate);
      const mid = Math.floor((candidate[0].tx0 + candidate[0].tx1) / 2);
      let sx = mid;
      let sy = rows - 2;
      findStart: for (let y = rows - 2; y >= mapH; y--) {
        if (!blocked[y][mid]) {
          sx = mid;
          sy = y;
          break findStart;
        }
      }
      if (
        dungeonCentersReachable(blocked, cols, rows, candidate, sx, sy) &&
        mapWalkFrac(blocked, cols, mapH) >= 0.75 &&
        (!state.bossMode || bossRoomSized(candidate))
      ) {
        rooms = candidate;
        bossDoorTiles = doorTiles || [];
        return true;
      }
      return false;
    }
    const maxTries = state.bossMode ? 36 : 12;
    for (let attempt = 0; attempt < maxTries && !rooms; attempt++) {
      const candidate = tryRandomRooms(n, cols, mapH);
      if (!candidate) continue;
      tryAcceptRooms(candidate);
    }
    if (!rooms) {
      const fallback = eastFallbackRooms(n, cols, mapH);
      inflateRooms(fallback, cols, mapH);
      if (!state.bossMode || bossRoomSized(fallback)) {
        rooms = fallback;
        bossDoorTiles = carveDungeon(blocked, cols, rows, mapH, rooms) || [];
      }
    }
    if (!rooms) {
      for (let extra = 0; extra < 24 && !rooms; extra++) {
        const candidate = tryRandomRooms(n, cols, mapH);
        if (!candidate) continue;
        tryAcceptRooms(candidate);
      }
    }
    if (!rooms) {
      rooms = eastFallbackRooms(n, cols, mapH);
      inflateRooms(rooms, cols, mapH);
      bossDoorTiles = carveDungeon(blocked, cols, rows, mapH, rooms) || [];
    }
    let ex = fieldW * 0.5;
    let ey = (mapH + rows - 2) * 0.5 * tileH;
    findEntrance: for (let y = rows - 2; y >= mapH; y--) {
      const mid = rooms.length ? Math.floor((rooms[0].tx0 + rooms[0].tx1) / 2) : Math.floor(cols / 2);
      for (let dx = 0; dx < cols; dx++) {
        const xs = [mid + dx, mid - dx];
        for (let i = 0; i < xs.length; i++) {
          const x = xs[i];
          if (x > 0 && x < cols - 1 && !blocked[y][x]) {
            ex = (x + 0.5) * tileW;
            ey = (y + 0.5) * tileH;
            break findEntrance;
          }
        }
      }
    }
    state.dungeon = {
      cols: cols,
      rows: rows,
      tileW: tileW,
      tileH: tileH,
      blocked: blocked,
      rooms: rooms,
      entrance: { x: ex, y: ey },
      mapH: mapH,
      bossDoorTiles: bossDoorTiles,
    };
    if (state.bossMode) fillBossDoor(false);
  }

  function fillBossDoor(open) {
    const d = state.dungeon;
    if (!d || !d.bossDoorTiles) return;
    for (let i = 0; i < d.bossDoorTiles.length; i++) {
      const t = d.bossDoorTiles[i];
      if (t.ty > 0 && t.ty < d.rows - 1 && t.tx > 0 && t.tx < d.cols - 1) {
        d.blocked[t.ty][t.tx] = open ? 0 : 1;
      }
    }
  }

  function cancelDoorAnim() {
    if (doorAnimTimer) {
      clearTimeout(doorAnimTimer);
      doorAnimTimer = 0;
    }
  }

  function setBossDoorOpen(open) {
    cancelDoorAnim();
    fillBossDoor(open);
    renderDungeonWalls();
  }

  function animateBossDoorOpen() {
    const d = state.dungeon;
    const tiles = d && d.bossDoorTiles;
    if (!tiles || !tiles.length || preferReducedMotion()) {
      setBossDoorOpen(true);
      return;
    }
    cancelDoorAnim();
    fillBossDoor(false);
    renderDungeonWalls();
    let i = 0;
    const batch = Math.max(1, Math.ceil(tiles.length / 10));
    const stepMs = Math.max(24, Math.floor(400 / Math.max(1, Math.ceil(tiles.length / batch))));
    function step() {
      doorAnimTimer = 0;
      if (!state.dungeon || state.dungeon !== d) return;
      for (let k = 0; k < batch && i < tiles.length; k++, i++) {
        const t = tiles[i];
        if (t.ty > 0 && t.ty < d.rows - 1 && t.tx > 0 && t.tx < d.cols - 1) {
          d.blocked[t.ty][t.tx] = 0;
        }
      }
      renderDungeonWalls();
      if (i < tiles.length) doorAnimTimer = setTimeout(step, stepMs);
    }
    step();
  }

  function playerInLastRoom() {
    const d = state.dungeon;
    const p = state.player;
    if (!d || !p || !d.rooms || !d.rooms.length) return false;
    const room = d.rooms[d.rooms.length - 1];
    const tx = Math.floor(p.x / d.tileW);
    const ty = Math.floor(p.y / d.tileH);
    return tx >= room.tx0 && tx < room.tx1 && ty >= room.ty0 && ty < room.ty1;
  }

  function playerInSpawnHall() {
    const d = state.dungeon;
    const p = state.player;
    if (!d || !p) return false;
    const ty = Math.floor(p.y / d.tileH);
    return ty >= d.mapH && ty < d.rows;
  }

  function maybeRoom0Drain(now) {
    if (state.bossLockedIn) return;
    if (state.speed !== COPY.speedFast) return;
    if (!state.liveAt) return;
    if (!playerInSpawnHall()) {
      state.room0Camp = false;
      return;
    }
    if (now < state.liveAt + 20000) return;
    if (!state.room0Camp || now >= state.room0LastHurt + 5000) {
      state.room0Camp = true;
      state.room0LastHurt = now;
      state.hearts -= 1;
      state.immuneUntil = now + 250;
      setImmune(true);
      endIfNoHearts();
    }
  }

  function flattenBossInnerWalls() {
    const d = state.dungeon;
    if (!d || !d.blocked) return;
    let grew = true;
    while (grew) {
      grew = false;
      for (let y = 1; y < d.rows - 1; y++) {
        for (let x = 1; x < d.cols - 1; x++) {
          if (!d.blocked[y][x]) continue;
          const n = !d.blocked[y - 1][x];
          const s = !d.blocked[y + 1][x];
          const e = !d.blocked[y][x + 1];
          const w = !d.blocked[y][x - 1];
          if ((n && s) || (e && w)) {
            d.blocked[y][x] = 0;
            grew = true;
          }
        }
      }
    }
  }

  function clearBossFightExtras() {
    state.movers = state.movers.filter(function (m) {
      if (m.isBoss) return true;
      if (m.el && m.el.parentNode) m.el.remove();
      return false;
    });
    (state.buffs || []).forEach(function (buff) {
      if (buff.el && buff.el.parentNode) buff.el.remove();
    });
    state.buffs = [];
    const keep = [];
    for (let i = 0; i < state.bullets.length; i++) {
      const b = state.bullets[i];
      if (b.enemy && !b.fromBoss) {
        if (b.el && b.el.parentNode) b.el.remove();
        continue;
      }
      keep.push(b);
    }
    state.bullets = keep;
  }

  function maybeSealBossRoom() {
    if (!state.bossMode || state.bossDead || state.bossLockedIn || !state.bossDoorOpen) return;
    const boss = bossMover();
    if (!boss || boss.hp <= 0) return;
    if (!playerInLastRoom()) return;
    state.bossLockedIn = true;
    state.bossFightAt = performance.now();
    state.bossDoorOpen = false;
    setBossDoorOpen(false);
    flattenBossInnerWalls();
    renderDungeonWalls();
    const d = state.dungeon;
    if (d) {
      boss.homeTiles = { tx0: 1, ty0: 1, tx1: d.cols - 1, ty1: d.rows - 1 };
    }
    clearBossFightExtras();
    showBossFightBanner();
    showBossTell();
  }

  function openBossDoor() {
    if (!state.bossMode || state.bossLockedIn || state.bossDead) return;
    state.bossDoorOpen = true;
    animateBossDoorOpen();
  }

  function bossMover() {
    for (let i = 0; i < state.movers.length; i++) {
      if (state.movers[i].isBoss) return state.movers[i];
    }
    return null;
  }

  function syncBossArena() {
    const field = state.field;
    if (!field) return;
    const on = !!(state.bossMode && !state.bossDead && (state.bossLockedIn || playerInLastRoom()));
    if (field._bossArena === on) return;
    field._bossArena = on;
    field.classList.toggle("boss-arena", on);
  }

  function hideBuffToast() {
    if (buffToastTimer) {
      clearTimeout(buffToastTimer);
      buffToastTimer = 0;
    }
    const el = document.getElementById("buff-toast");
    if (el) {
      el.hidden = true;
      el.textContent = "";
      el.classList.remove("hp", "atk");
    }
  }

  function showBuffToast(kind) {
    const el = document.getElementById("buff-toast");
    if (!el) return;
    el.textContent = kind === "hp" ? COPY.buffGotHp : COPY.buffGotAtk;
    el.classList.remove("hp", "atk");
    el.classList.add(kind === "hp" ? "hp" : "atk");
    el.hidden = true;
    void el.offsetWidth;
    el.hidden = false;
    if (buffToastTimer) clearTimeout(buffToastTimer);
    buffToastTimer = setTimeout(function () {
      buffToastTimer = 0;
      if (el.parentNode) el.hidden = true;
    }, 1200);
  }

  function hideBossFightBanner() {
    if (bossCueTimer) {
      clearTimeout(bossCueTimer);
      bossCueTimer = 0;
    }
    clearBossTell();
    const banner = document.getElementById("boss-banner");
    if (banner) {
      banner.hidden = true;
      banner.textContent = "";
    }
  }

  function clearBossTell() {
    if (bossTellTimer) {
      clearTimeout(bossTellTimer);
      bossTellTimer = 0;
    }
    if (bossTellHideTimer) {
      clearTimeout(bossTellHideTimer);
      bossTellHideTimer = 0;
    }
    state.bossTellClass = "";
    const boss = bossMover();
    if (!boss || !boss.el) return;
    const pop = boss.el.querySelector(".boss-tell");
    if (pop) pop.remove();
  }

  function scheduleBossTell() {
    if (bossTellTimer) clearTimeout(bossTellTimer);
    const wait = 10000 + Math.random() * 10000;
    bossTellTimer = setTimeout(function () {
      bossTellTimer = 0;
      if (!state.bossLockedIn || state.bossDead) return;
      showBossTell();
    }, wait);
  }

  function showBossTell() {
    if (!state.bossLockedIn || state.bossDead) return;
    const keys = Object.keys(HIT_OWNER);
    if (!keys.length) return;
    const text = keys[Math.floor(Math.random() * keys.length)];
    state.bossTellClass = HIT_OWNER[text] || "";
    const boss = bossMover();
    if (boss && boss.el) {
      let pop = boss.el.querySelector(".boss-tell");
      if (!pop) {
        pop = document.createElement("span");
        pop.className = "boss-tell";
        boss.el.appendChild(pop);
      }
      pop.textContent = text;
      if (bossTellHideTimer) clearTimeout(bossTellHideTimer);
      const shown = pop;
      bossTellHideTimer = setTimeout(function () {
        bossTellHideTimer = 0;
        if (shown.parentNode) shown.remove();
      }, 2500);
    }
    scheduleBossTell();
  }

  function showBossFightBanner() {
    if (state.bossCueShown) return;
    state.bossCueShown = true;
    const banner = document.getElementById("boss-banner");
    if (!banner) return;
    banner.hidden = false;
    const flavor = bossFlavor();
    const title = document.createElement("strong");
    title.textContent = flavor.fight;
    const line = document.createElement("span");
    line.textContent = flavor.line;
    banner.replaceChildren(title, line);
    if (bossCueTimer) clearTimeout(bossCueTimer);
    bossCueTimer = setTimeout(function () {
      bossCueTimer = 0;
      if (banner.parentNode) banner.hidden = true;
    }, 2500);
  }

  function wallRects(blocked, cols, rows) {
    const used = [];
    for (let y = 0; y < rows; y++) {
      used[y] = [];
      for (let x = 0; x < cols; x++) used[y][x] = false;
    }
    const rects = [];
    for (let y = 0; y < rows; y++) {
      let x = 0;
      while (x < cols) {
        if (!blocked[y][x] || used[y][x]) {
          x += 1;
          continue;
        }
        let x2 = x;
        while (x2 < cols && blocked[y][x2] && !used[y][x2]) x2 += 1;
        let y2 = y + 1;
        while (y2 < rows) {
          let ok = true;
          for (let xx = x; xx < x2; xx++) {
            if (!blocked[y2][xx] || used[y2][xx]) {
              ok = false;
              break;
            }
          }
          if (!ok) break;
          y2 += 1;
        }
        for (let ty = y; ty < y2; ty++) {
          for (let tx = x; tx < x2; tx++) used[ty][tx] = true;
        }
        rects.push({ tx: x, ty: y, tw: x2 - x, th: y2 - y });
        x = x2;
      }
    }
    return rects;
  }

  function renderDungeonWalls() {
    const wrap = document.getElementById("dungeon-walls");
    const d = state.dungeon;
    if (!wrap || !d) return;
    const rects = wallRects(d.blocked, d.cols, d.rows);
    let html = "";
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      html +=
        '<i class="dungeon-wall" style="left:' +
        r.tx * d.tileW +
        "px;top:" +
        r.ty * d.tileH +
        "px;width:" +
        r.tw * d.tileW +
        "px;height:" +
        r.th * d.tileH +
        'px"></i>';
    }
    wrap.innerHTML = html;
  }

  function tileBlocked(tx, ty) {
    const d = state.dungeon;
    if (!d || tx < 0 || ty < 0 || tx >= d.cols || ty >= d.rows) return true;
    return !!d.blocked[ty][tx];
  }

  function circleHitsWall(x, y, r) {
    const d = state.dungeon;
    if (!d) return false;
    const x0 = Math.floor((x - r) / d.tileW);
    const y0 = Math.floor((y - r) / d.tileH);
    const x1 = Math.floor((x + r) / d.tileW);
    const y1 = Math.floor((y + r) / d.tileH);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (!tileBlocked(tx, ty)) continue;
        const left = tx * d.tileW;
        const top = ty * d.tileH;
        const nx = Math.max(left, Math.min(x, left + d.tileW));
        const ny = Math.max(top, Math.min(y, top + d.tileH));
        const dx = x - nx;
        const dy = y - ny;
        if (dx * dx + dy * dy < r * r) return true;
      }
    }
    return false;
  }

  function slideMove(ent, dx, dy, r) {
    if (dx) {
      const nx = ent.x + dx;
      if (!circleHitsWall(nx, ent.y, r)) ent.x = nx;
    }
    if (dy) {
      const ny = ent.y + dy;
      if (!circleHitsWall(ent.x, ny, r)) ent.y = ny;
    }
  }

  function wallHitOnSegment(x0, y0, x1, y1) {
    const d = state.dungeon;
    if (!d) return null;
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(dist / 3));
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      if (tileBlocked(Math.floor(x / d.tileW), Math.floor(y / d.tileH))) {
        return { x: x, y: y };
      }
    }
    return null;
  }

  function monsterHomeBox(m) {
    const d = state.dungeon;
    if (!d || !m.homeTiles) return null;
    const r = m.halfW || TANK_HALF;
    const minX = m.homeTiles.tx0 * d.tileW + r;
    const maxX = m.homeTiles.tx1 * d.tileW - r;
    const minY = m.homeTiles.ty0 * d.tileH + r;
    const maxY = m.homeTiles.ty1 * d.tileH - r;
    const cx = (m.homeTiles.tx0 + m.homeTiles.tx1) * 0.5 * d.tileW;
    const cy = (m.homeTiles.ty0 + m.homeTiles.ty1) * 0.5 * d.tileH;
    return {
      minX: maxX - minX > 2 ? minX : cx,
      maxX: maxX - minX > 2 ? maxX : cx,
      minY: maxY - minY > 2 ? minY : cy,
      maxY: maxY - minY > 2 ? maxY : cy,
    };
  }

  function clampToHome(m) {
    const b = monsterHomeBox(m);
    if (!b) return;
    if (m.x < b.minX) {
      m.x = b.minX;
      m.vx = Math.abs(m.vx);
    } else if (m.x > b.maxX) {
      m.x = b.maxX;
      m.vx = -Math.abs(m.vx);
    }
    if (m.y < b.minY) {
      m.y = b.minY;
      m.vy = Math.abs(m.vy);
    } else if (m.y > b.maxY) {
      m.y = b.maxY;
      m.vy = -Math.abs(m.vy);
    }
  }

  function playerInRoom(m) {
    const p = state.player;
    const d = state.dungeon;
    if (!p || !d || !m.homeTiles) return false;
    return (
      p.x >= m.homeTiles.tx0 * d.tileW &&
      p.x < m.homeTiles.tx1 * d.tileW &&
      p.y >= m.homeTiles.ty0 * d.tileH &&
      p.y < m.homeTiles.ty1 * d.tileH
    );
  }

  function nearestOpen(x, y, r) {
    if (!circleHitsWall(x, y, r)) return { x: x, y: y };
    const d = state.dungeon;
    if (!d) return { x: x, y: y };
    const step = Math.min(d.tileW, d.tileH) * 0.45;
    for (let k = 1; k <= 32; k++) {
      for (let i = 0; i < 12; i++) {
        const ang = (Math.PI * 2 * i) / 12;
        const nx = x + Math.cos(ang) * step * k;
        const ny = y + Math.sin(ang) * step * k;
        if (!circleHitsWall(nx, ny, r)) return { x: nx, y: ny };
      }
    }
    return { x: x, y: y };
  }

  function randomOpenInRoom(room, r) {
    const d = state.dungeon;
    if (!d || !room) return nearestOpen(d ? d.entrance.x : 0, d ? d.entrance.y : 0, r);
    const spots = [];
    for (let ty = room.ty0; ty < room.ty1; ty++) {
      for (let tx = room.tx0; tx < room.tx1; tx++) {
        if (d.blocked[ty][tx]) continue;
        const px = (tx + 0.5) * d.tileW;
        const py = (ty + 0.5) * d.tileH;
        if (circleHitsWall(px, py, r)) continue;
        let taken = false;
        for (let i = 0; i < state.movers.length; i++) {
          if (Math.hypot(state.movers[i].x - px, state.movers[i].y - py) < SEPARATE) {
            taken = true;
            break;
          }
        }
        if (taken) continue;
        spots.push({ x: px, y: py });
      }
    }
    if (!spots.length) {
      const cx = (room.tx0 + room.tx1) * 0.5 * d.tileW;
      const cy = (room.ty0 + room.ty1) * 0.5 * d.tileH;
      return nearestOpen(cx, cy, r);
    }
    return spots[Math.floor(Math.random() * spots.length)];
  }

  function randomOpenInEntrance(r, avoidX, avoidY) {
    const d = state.dungeon;
    if (!d) return null;
    const spots = [];
    for (let y = d.mapH; y < d.rows - 1; y++) {
      for (let x = 1; x < d.cols - 1; x++) {
        if (d.blocked[y][x]) continue;
        const px = (x + 0.5) * d.tileW;
        const py = (y + 0.5) * d.tileH;
        if (circleHitsWall(px, py, r)) continue;
        if (avoidX != null && Math.hypot(px - avoidX, py - avoidY) < SEPARATE) continue;
        spots.push({ x: px, y: py });
      }
    }
    if (!spots.length) return d.entrance;
    return spots[Math.floor(Math.random() * spots.length)];
  }

  function rescaleDungeon() {
    const d = state.dungeon;
    if (!d || !state.fieldW || !state.fieldH) return;
    const tw = state.fieldW / d.cols;
    const th = state.fieldH / d.rows;
    const sx = tw / d.tileW;
    const sy = th / d.tileH;
    if (Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001) return;
    d.tileW = tw;
    d.tileH = th;
    function scale(o) {
      if (!o) return;
      o.x *= sx;
      o.y *= sy;
    }
    scale(state.player);
    state.movers.forEach(scale);
    scale(state.tip);
    (state.buffs || []).forEach(scale);
    state.bullets.forEach(scale);
    renderDungeonWalls();
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
    maybeRoom0Drain(now);
    maybeSealBossRoom();
    syncBossArena();
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
    cancelDoorAnim();
    hideBossFightBanner();
    hideBuffToast();
    const flying = playEl.querySelectorAll(".bullet");
    for (let i = 0; i < flying.length; i++) flying[i].remove();
    state.bullets = [];
    state.movers = [];
    state.player = null;
    state.tip = null;
    state.buffs = [];
    state.field = null;
    state.dungeon = null;
  }

  function speedMul() {
    return diff().mul;
  }

  function heroMarkup() {
    return (
      '<span class="tank-cannon"></span>' +
      '<span class="hero-cloak"></span>' +
      '<span class="hero-body"></span>' +
      '<span class="tank-name">Me</span>'
    );
  }

  function mobMarkup(label, color, kind) {
    return (
      '<span class="tank-cannon"></span>' +
      '<span class="mob-body mob-' +
      kind +
      '" style="--mob:' +
      color +
      '"></span>' +
      '<span class="tank-name">' +
      label +
      "</span>"
    );
  }

  function setTankLabel(el, text) {
    const name = el.querySelector(".tank-name");
    if (name) name.textContent = text;
    else el.textContent = text;
  }

  function removeFloater(el) {
    if (!el) return;
    state.movers = state.movers.filter(function (m) {
      return m.el !== el;
    });
    if (el.parentNode) el.remove();
  }

  function clearLeftoverMonsters() {
    const leftover = [];
    for (let i = 0; i < state.movers.length; i++) {
      const m = state.movers[i];
      if (m.isBoss) continue;
      if (m.el && m.el.getAttribute("data-token")) leftover.push(m.el);
    }
    leftover.forEach(removeFloater);
    const keep = [];
    for (let i = 0; i < state.bullets.length; i++) {
      const b = state.bullets[i];
      if (b.enemy && !b.fromBoss) {
        if (b.el && b.el.parentNode) b.el.remove();
        continue;
      }
      keep.push(b);
    }
    state.bullets = keep;
  }

  function placeEl(el, x, y) {
    if (el._px === x && el._py === y) return;
    el._px = x;
    el._py = y;
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
    slideMove(p, dx * step, dy * step, TANK_HALF);
    const maxX = Math.max(PLAYER_PAD, fieldW - PLAYER_PAD);
    const maxY = Math.max(PLAYER_PAD, fieldH - PLAYER_PAD);
    if (p.x < PLAYER_PAD) p.x = PLAYER_PAD;
    else if (p.x > maxX) p.x = maxX;
    if (p.y < PLAYER_PAD) p.y = PLAYER_PAD;
    else if (p.y > maxY) p.y = maxY;
    if (circleHitsWall(p.x, p.y, TANK_HALF)) {
      const open = nearestOpen(p.x, p.y, TANK_HALF);
      p.x = open.x;
      p.y = open.y;
    }
    placeEl(p.el, p.x, p.y);
    aimPlayerCannon();
  }

  function clampArenaToField() {
    if (!state.field || state.view !== "play" || !state.player) return;
    rescaleDungeon();
    const w = state.fieldW;
    const h = state.fieldH;
    const p = state.player;
    const maxX = Math.max(PLAYER_PAD, w - PLAYER_PAD);
    const maxY = Math.max(PLAYER_PAD, h - PLAYER_PAD);
    if (p.x < PLAYER_PAD) p.x = PLAYER_PAD;
    else if (p.x > maxX) p.x = maxX;
    if (p.y < PLAYER_PAD) p.y = PLAYER_PAD;
    else if (p.y > maxY) p.y = maxY;
    if (circleHitsWall(p.x, p.y, TANK_HALF)) {
      const open = nearestOpen(p.x, p.y, TANK_HALF);
      p.x = open.x;
      p.y = open.y;
    }
    placeEl(p.el, p.x, p.y);
    state.movers.forEach(function (m) {
      clampToHome(m);
      if (circleHitsWall(m.x, m.y, m.halfW)) {
        const open = nearestOpen(m.x, m.y, m.halfW);
        m.x = open.x;
        m.y = open.y;
        clampToHome(m);
      }
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
      if (circleHitsWall(state.tip.x, state.tip.y, TIP_HALF)) {
        const open = nearestOpen(state.tip.x, state.tip.y, TIP_HALF);
        state.tip.x = open.x;
        state.tip.y = open.y;
      }
      placeEl(state.tip.el, state.tip.x, state.tip.y);
    }
    (state.buffs || []).forEach(function (buff) {
      if (!buff.el) return;
      if (circleHitsWall(buff.x, buff.y, TIP_HALF)) {
        const open = nearestOpen(buff.x, buff.y, TIP_HALF);
        buff.x = open.x;
        buff.y = open.y;
      }
      placeEl(buff.el, buff.x, buff.y);
    });
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
    if (m.isBoss) return m.hp <= 0;
    return m.el.classList.contains("hit") || m.el.classList.contains("miss");
  }

  function leftoversHarmless() {
    if (state.speed === COPY.speedFast) return false;
    return !state.remaining.length;
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

  function sameHome(a, b) {
    if (!a.homeTiles || !b.homeTiles) return false;
    return a.homeTiles.tx0 === b.homeTiles.tx0 && a.homeTiles.ty0 === b.homeTiles.ty0;
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
        if (!sameHome(a, b)) continue;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist2 = dx * dx + dy * dy;
        if (dist2 < 0.000001) {
          dx = 1;
          dy = 0;
          dist2 = 1;
        }
        if (dist2 >= SEPARATE * SEPARATE) continue;
        const dist = Math.sqrt(dist2);
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
    const player = state.player;
    const d = diff();
    const agro = !!d.roomAgro;
    const nowTurn = performance.now();
    state.movers.forEach(function (m) {
      if (tankSettled(m)) return;
      if (m.isBoss && !m.bossArmed) {
        m.vx = 0;
        m.vy = 0;
      } else if ((m.isBoss || agro) && playerInRoom(m)) {
        m.wasAgro = true;
        steerChase(m, player, step);
      } else {
        if (m.wasAgro) {
          m.wasAgro = false;
          setWanderHeading(m, nowTurn);
        } else if (!m.nextTurn || nowTurn >= m.nextTurn) {
          setWanderHeading(m, nowTurn);
        }
      }
      const ox = m.x;
      const oy = m.y;
      slideMove(m, m.vx * step, m.vy * step, m.halfW);
      clampToHome(m);
      if (m.x === ox) m.vx *= -1;
      if (m.y === oy) m.vy *= -1;
    });
    separateWordTanks();
    const enemyFire = d.enemyFire;
    const nowFire = nowTurn;
    if (
      enemyFire &&
      player &&
      state.liveAt &&
      !state.fireArmed &&
      nowFire >= state.liveAt + (d.enemyGrace || 5000)
    ) {
      state.movers.forEach(function (tank) {
        if (tank.isBoss) return;
        tank.nextFire = nowFire + 200 + Math.random() * (d.enemyArmJitter || 2200);
      });
      state.fireArmed = true;
    }
    if (
      player &&
      state.bossLockedIn &&
      state.bossFightAt &&
      nowFire >= state.bossFightAt + (d.bossGrace || 4000)
    ) {
      state.movers.forEach(function (tank) {
        if (!tank.isBoss || tank.bossArmed) return;
        tank.bossArmed = true;
        tank.nextFire = nowFire + 200;
      });
    }
    state.movers.forEach(function (m) {
      if (tankSettled(m)) return;
      clampToHome(m);
      placeEl(m.el, m.x, m.y);
      const aimAtPlayer = player && (m.isBoss ? m.bossArmed : enemyFire);
      if (m.cannon) {
        const ang = aimAtPlayer
          ? Math.atan2(player.y - m.y, player.x - m.x)
          : Math.atan2(m.vy, m.vx);
        if (m.cannonAng !== ang) {
          m.cannonAng = ang;
          m.cannon.style.transform = "rotate(" + ang + "rad)";
        }
      }
      const canShoot =
        player &&
        ((m.isBoss && m.bossArmed) ||
          (enemyFire && state.fireArmed && !m.isBoss && !leftoversHarmless()));
      if (canShoot && nowFire >= m.nextFire) {
        let fireMs = m.isBoss ? d.bossFireMs || d.enemyFireMs || 2800 : d.enemyFireMs || 2800;
        const jitter = m.isBoss ? d.bossFireJitter || d.enemyFireJitter || 800 : d.enemyFireJitter || 800;
        if (m.isBoss) {
          m.bossPattern = bossTellPattern();
          if (m.bossPattern > 1 && state.speed === COPY.speedFast) fireMs = 1200;
          else if (m.bossPattern > 1 && state.speed === COPY.speedNormal) fireMs = 1100;
        }
        m.nextFire = nowFire + fireMs + Math.random() * jitter;
        if (!wallHitOnSegment(m.x, m.y, player.x, player.y)) {
          fireEnemyShot(m, nowFire);
        }
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
    const ox = t.x;
    const oy = t.y;
    slideMove(t, t.vx * step, t.vy * step, TIP_HALF);
    if (t.x === ox) t.vx *= -1;
    if (t.y === oy) t.vy *= -1;
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
    if (circleHitsWall(t.x, t.y, TIP_HALF)) {
      const open = nearestOpen(t.x, t.y, TIP_HALF);
      t.x = open.x;
      t.y = open.y;
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

  function quizRooms() {
    const rooms = state.dungeon && state.dungeon.rooms;
    if (!rooms || !rooms.length) return [];
    if (state.bossMode && rooms.length > 1) return rooms.slice(0, rooms.length - 1);
    return rooms;
  }

  function spawnBuffs() {
    state.buffs = [];
    const rooms = quizRooms();
    const specs = [
      { id: "buff-hp", kind: "hp" },
      { id: "buff-atk", kind: "atk" },
    ];
    specs.forEach(function (spec) {
      const el = document.getElementById(spec.id);
      if (!el || !rooms.length) return;
      let pos = null;
      for (let t = 0; t < 12 && !pos; t++) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const tryPos = randomOpenInRoom(room, TIP_HALF);
        let far = true;
        for (let i = 0; i < state.buffs.length; i++) {
          if (Math.hypot(state.buffs[i].x - tryPos.x, state.buffs[i].y - tryPos.y) < SEPARATE) {
            far = false;
            break;
          }
        }
        if (far) pos = tryPos;
      }
      if (!pos) {
        const room = rooms[0];
        pos = randomOpenInRoom(room, TIP_HALF);
      }
      el.textContent = String(TIP_HITS);
      placeEl(el, pos.x, pos.y);
      state.buffs.push({
        el: el,
        x: pos.x,
        y: pos.y,
        hitsLeft: TIP_HITS,
        kind: spec.kind,
      });
    });
  }

  function hitBuff(buff) {
    if (state.locked || !buff) return;
    buff.hitsLeft -= 1;
    if (buff.hitsLeft > 0) {
      buff.el.textContent = String(buff.hitsLeft);
      return;
    }
    if (buff.kind === "hp") {
      state.heartsMax = diff().hearts * 2;
      state.hearts = state.heartsMax;
      updateHud();
    } else {
      state.bossDamage = 3;
    }
    showBuffToast(buff.kind);
    if (buff.el && buff.el.parentNode) buff.el.remove();
    state.buffs = state.buffs.filter(function (b) {
      return b !== buff;
    });
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
      if (m.isBoss && !state.bossLockedIn) continue;
      if (!m.isBoss && leftoversHarmless()) continue;
      const reach = CONTACT + Math.max(0, (m.halfW || TANK_HALF) - TANK_HALF);
      const cdx = m.x - player.x;
      const cdy = m.y - player.y;
      if (cdx * cdx + cdy * cdy > reach * reach) continue;
      if (wallHitOnSegment(player.x, player.y, m.x, m.y)) continue;
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
      clampToHome(m);
      if (circleHitsWall(m.x, m.y, m.halfW)) {
        const open = nearestOpen(m.x, m.y, m.halfW);
        m.x = open.x;
        m.y = open.y;
        clampToHome(m);
      }
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
    let best = null;
    let bestD = Infinity;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    for (let i = 0; i < state.movers.length; i++) {
      const m = state.movers[i];
      if (tankSettled(m)) continue;
      if (m.isBoss && !state.bossLockedIn) continue;
      const r = (m.halfW || TANK_HALF) + radius + 10;
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
      const wall = wallHitOnSegment(prevX, prevY, b.x, b.y);
      const hitX = wall ? wall.x : b.x;
      const hitY = wall ? wall.y : b.y;
      if (b.enemy) {
        const player = state.player;
        const playerHit =
          player &&
          segmentHitsCircle(prevX, prevY, b.x, b.y, player.x, player.y, ENEMY_HIT_R);
        const playerD = playerHit
          ? (player.x - prevX) * (player.x - prevX) + (player.y - prevY) * (player.y - prevY)
          : Infinity;
        const wallD = wall
          ? (wall.x - prevX) * (wall.x - prevX) + (wall.y - prevY) * (wall.y - prevY)
          : Infinity;
        if (playerHit && playerD <= wallD) {
          b.el.remove();
          if (state.locked) continue;
          if (now >= state.immuneUntil && !(leftoversHarmless() && !b.fromBoss)) {
            state.hearts -= 1;
            state.immuneUntil = now + IMMUNE_MS;
            setImmune(true);
            if (endIfNoHearts()) return;
          }
          continue;
        }
        if (wall) {
          showSpark(field, wall.x, wall.y);
          b.el.remove();
          continue;
        }
        if (b.x < -8 || b.y < -8 || b.x > fieldW + 8 || b.y > fieldH + 8 || now - b.born > BULLET_LIFE) {
          showSpark(field, Math.max(0, Math.min(fieldW, b.x)), Math.max(0, Math.min(fieldH, b.y)));
          b.el.remove();
          continue;
        }
        placeEl(b.el, b.x, b.y);
        keep.push(b);
        continue;
      }
      const hit = moverHitAlongPath(prevX, prevY, hitX, hitY, BULLET_RADIUS);
      if (hit) {
        b.el.remove();
        if (hit.getAttribute("data-boss")) hitBoss();
        else shootToken(hit.getAttribute("data-token"));
        if (state.locked) return;
        continue;
      }
      if (state.tip && segmentHitsCircle(prevX, prevY, hitX, hitY, state.tip.x, state.tip.y, TIP_HALF + BULLET_RADIUS)) {
        b.el.remove();
        hitTip();
        continue;
      }
      let buffHit = null;
      for (let bi = 0; bi < state.buffs.length; bi++) {
        const buff = state.buffs[bi];
        if (segmentHitsCircle(prevX, prevY, hitX, hitY, buff.x, buff.y, TIP_HALF + BULLET_RADIUS)) {
          buffHit = buff;
          break;
        }
      }
      if (buffHit) {
        b.el.remove();
        hitBuff(buffHit);
        continue;
      }
      if (wall) {
        showSpark(field, wall.x, wall.y);
        b.el.remove();
        continue;
      }
      if (b.x < -8 || b.y < -8 || b.x > fieldW + 8 || b.y > fieldH + 8 || now - b.born > BULLET_LIFE) {
        showSpark(field, Math.max(0, Math.min(fieldW, b.x)), Math.max(0, Math.min(fieldH, b.y)));
        b.el.remove();
        continue;
      }
      placeEl(b.el, b.x, b.y);
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
    for (let i = 0; i < state.buffs.length; i++) {
      if (Math.hypot(state.buffs[i].x - x, state.buffs[i].y - y) < SEPARATE) return true;
    }
    return false;
  }

  function placePlayerAtEntrance(w, h) {
    const d = state.dungeon;
    const mid = d
      ? nearestOpen(d.entrance.x, d.entrance.y, TANK_HALF)
      : clampPlayerSpawn(w / 2, Math.max(PLAYER_PAD, h - 110), w, h);
    const tries = [mid];
    for (let i = -2; i <= 2; i++) {
      if (!i) continue;
      tries.push(clampPlayerSpawn(mid.x + i * (SEPARATE * 0.45), mid.y, w, h));
    }
    tries.push(clampPlayerSpawn(mid.x, mid.y - SEPARATE, w, h));
    for (let i = 0; i < tries.length; i++) {
      const pos = nearestOpen(tries[i].x, tries[i].y, TANK_HALF);
      if (!spawnBlocked(pos.x, pos.y) && !circleHitsWall(pos.x, pos.y, TANK_HALF)) {
        state.player.x = pos.x;
        state.player.y = pos.y;
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
    const floaters = Array.from(playEl.querySelectorAll(".floater"));
    makeDungeon(Math.max(w, 320), Math.max(h, 240), state.roomCount);
    renderDungeonWalls();
    state.bossDoorOpen = false;
    state.bossLockedIn = false;
    state.bossDead = false;
    state.bossCueShown = false;
    state.bossFightAt = 0;
    state.bossTellClass = "";
    state.room0Camp = false;
    state.room0LastHurt = 0;
    const mid = nearestOpen(state.dungeon.entrance.x, state.dungeon.entrance.y, TANK_HALF);
    state.player = {
      el: tankEl,
      cannon: tankEl.querySelector(".tank-cannon"),
      x: mid.x,
      y: mid.y,
      cannonTheta: -Math.PI / 2,
      immune: false,
    };

    const item = current();
    state.movers = floaters.map(function (el) {
      if (el.getAttribute("data-boss") === "1") {
        const rooms = state.dungeon.rooms;
        const room = rooms[rooms.length - 1] || rooms[0];
        const cx = (room.tx0 + room.tx1) * 0.5 * state.dungeon.tileW;
        const cy = (room.ty0 + room.ty1) * 0.5 * state.dungeon.tileH;
        const pos = nearestOpen(cx, cy, BOSS_HALF);
        let speed = (0.32 + Math.random() * 0.36) * mul;
        if (state.speed === COPY.speedFast) speed *= 2.6;
        else if (state.speed === COPY.speedNormal) speed *= 2.4;
        const hp = diff().bossHp || 10;
        placeEl(el, pos.x, pos.y);
        return {
          el: el,
          cannon: el.querySelector(".tank-cannon"),
          x: pos.x,
          y: pos.y,
          vx: 0,
          vy: 0,
          speed: speed,
          halfW: BOSS_HALF,
          halfH: BOSS_HALF,
          nextFire: 0,
          nextTurn: 0,
          homeTiles: { tx0: room.tx0, ty0: room.ty0, tx1: room.tx1, ty1: room.ty1 },
          isBoss: true,
          hp: hp,
          hpMax: hp,
          bossArmed: false,
        };
      }
      const tokenId = el.getAttribute("data-token");
      const token = item
        ? item.tokens.find(function (t) {
            return t.id === tokenId;
          })
        : null;
      const rooms = state.dungeon.rooms;
      const ri = token && token.room != null ? token.room : 0;
      const room = rooms[ri] || rooms[0];
      const pos = randomOpenInRoom(room, TANK_HALF);
      const speed = (0.32 + Math.random() * 0.36) * mul;
      placeEl(el, pos.x, pos.y);
      return {
        el: el,
        cannon: el.querySelector(".tank-cannon"),
        x: pos.x,
        y: pos.y,
        vx: 0,
        vy: 0,
        speed: speed,
        halfW: TANK_HALF,
        halfH: TANK_HALF,
        nextFire: 0,
        nextTurn: 0,
        homeTiles: { tx0: room.tx0, ty0: room.ty0, tx1: room.tx1, ty1: room.ty1 },
      };
    });

    const tipEl = document.getElementById("tip-target");
    if (tipEl && state.tipHunt && tipAllowed() && isHitType()) {
      const ang = Math.random() * Math.PI * 2;
      const tipSpeed = (0.45 + Math.random() * 0.25) * mul;
      const spot = randomOpenInEntrance(TIP_HALF, state.player.x, state.player.y) || {
        x: state.dungeon.entrance.x,
        y: state.dungeon.entrance.y,
      };
      state.tip = {
        el: tipEl,
        x: spot.x,
        y: spot.y,
        vx: Math.cos(ang) * tipSpeed,
        vy: Math.sin(ang) * tipSpeed,
        hitsLeft: TIP_HITS,
      };
      tipEl.textContent = String(TIP_HITS);
      placeEl(tipEl, spot.x, spot.y);
    } else {
      state.tip = null;
    }

    spawnBuffs();

    placePlayerAtEntrance(w, h);
    placeEl(tankEl, state.player.x, state.player.y);
    aimPlayerCannon();
    const spawnNow = performance.now();
    state.movers.forEach(function (m) {
      setWanderHeading(m, spawnNow);
      clampToHome(m);
      placeEl(m.el, m.x, m.y);
    });

    const startNow = performance.now();
    state.floorTitleUntil = startNow + FLOOR_TITLE_MS;
    state.countEnd = state.floorTitleUntil + COUNT_MS;
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
    state.collected = [];
    state.fragmentTotal = 0;
    state.hearts = diff().hearts;
    state.heartsMax = diff().hearts;
    state.bossDamage = 1;
    state.immuneUntil = 0;
    state.fireLockUntil = 0;
    state.died = false;
    state.countEnd = 0;
    state.goUntil = 0;
    state.liveAt = 0;
    state.room0Camp = false;
    state.room0LastHurt = 0;
    state.fireArmed = false;
    state.floorSwitching = false;
    state.floorTitleUntil = 0;
    state.teachQueue = null;
    state.teachPos = 0;
    hideOverlay();
    show("play");
  }

  function current() {
    return state.deck[state.index];
  }

  function missExplain(wrongText, item) {
    const owner = HIT_OWNER[wrongText];
    if (owner && owner !== item.name) {
      return "✗ " + wrongText + " is " + owner + ", not " + item.name + ".";
    }
    return "✗ " + wrongText + " is not " + item.name + ".";
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
    if (item.comboIds || isPassType()) {
      return `<div class="passage-box">${item.passage}</div>`;
    }
    return "";
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

  function fragmentLabel() {
    if (state.bossMode) {
      if (!state.remaining.length) {
        const boss = bossMover();
        if (boss) return bossName() + " " + Math.max(0, boss.hp) + "/" + boss.hpMax;
        return bossName();
      }
      return COPY.fragments + " " + state.collected.length + "/" + (state.fragmentTotal || 0);
    }
    const n = state.fragmentTotal || 0;
    if (!state.collected.length) return COPY.fragments + " 0/" + n;
    return COPY.fragments + ": " + state.collected.join(", ");
  }

  function syncRemainCount() {
    const remainEl = playEl.querySelector("#remain-count");
    if (remainEl) remainEl.textContent = fragmentLabel();
  }

  function renderShoot() {
    const item = current();
    state.roomCount = rollRoomCount();
    item.tokens = assignRooms(item.tokens, state.bossMode ? Math.max(1, state.roomCount - 1) : state.roomCount);
    groupTrio(item.tokens);
    state.ammo = AMMO[0];
    state.remaining = item.tokens.filter(function (t) {
      return isHitType() || t.ok;
    }).map(function (t) {
      return t.id;
    });
    state.collected = [];
    state.fragmentTotal = state.remaining.length;
    state.heartsMax = diff().hearts;
    if (state.hearts > state.heartsMax) state.hearts = state.heartsMax;
    state.bossDamage = 1;
    state.room0Camp = false;
    state.room0LastHurt = 0;
    state.paused = false;
    state.tankHits = 0;
    state.okHits = 0;
    state.playMs = 0;
    state.playTick = 0;
    state.teachQueue = null;
    state.teachPos = 0;
    stopArenaLoop();
    clearKeys();
    const floaters =
      item.tokens
        .map(function (token, i) {
          const color = TANK_COLORS[i % TANK_COLORS.length];
          const kind = MOB_KINDS[i % MOB_KINDS.length];
          return (
            '<div class="floater" data-token="' +
            token.id +
            '">' +
            mobMarkup(token.text, color, kind) +
            "</div>"
          );
        })
        .join("") +
      (state.bossMode
        ? '<div class="floater boss" data-boss="1">' + mobMarkup(bossName(), "#8b1a1a", "skull") + "</div>"
        : "");
    playEl.innerHTML = `
      <div class="stage">
        <div class="meta-row">
          <span class="cat-pill rule-pill">1 same atom · 2 joined, no + · 3 plus sign</span>
          ${isHitType() ? `<span class="cat-pill" id="ammo-label">1 ${state.ammo}</span>` : ""}
          <span class="hearts" id="play-hearts"></span>
          <span id="remain-count">${fragmentLabel()}</span>
          <button type="button" class="fs-btn" id="btn-fs" data-fullscreen="1">${COPY.fullscreen}</button>
        </div>
        <p class="prompt-arrow">${playKeys()}</p>
        ${isHitType() ? "" : `<div class="prompt-top">${promptHtml(item)}</div>`}
        <p class="tip-line" id="tip-line" hidden></p>
        <div class="playfield ${floorThemeClass()}">
          <div class="dungeon-walls" id="dungeon-walls"></div>
          ${floaters}
          ${
            state.tipHunt && tipAllowed() && isHitType()
              ? '<div class="tip-target" id="tip-target">' + TIP_HITS + "</div>"
              : ""
          }
          <div class="buff-target buff-hp" id="buff-hp">${TIP_HITS}</div>
          <div class="buff-target buff-atk" id="buff-atk">${TIP_HITS}</div>
          <div class="player-tank" aria-hidden="true">${heroMarkup()}</div>
          <div class="count-banner" id="count-banner" hidden></div>
          <div class="boss-banner" id="boss-banner" hidden></div>
          <div class="buff-toast" id="buff-toast" hidden></div>
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

  function bossTellPattern() {
    if (state.bossTellClass === AMMO[1]) return 3;
    if (state.bossTellClass === AMMO[2]) return 2;
    return 1;
  }

  function fireEnemyShot(m, now) {
    const field = state.field;
    const player = state.player;
    if (!field || !player) return;
    const theta = Math.atan2(player.y - m.y, player.x - m.x);
    const offset = m.isBoss ? 48 : ENEMY_BULLET_OFFSET;
    let startX = m.x + Math.cos(theta) * offset;
    let startY = m.y + Math.sin(theta) * offset;
    if (circleHitsWall(startX, startY, 4)) {
      startX = m.x;
      startY = m.y;
    }
    const d = diff();
    let speed = (m.isBoss ? DIFF[COPY.speedFast].bossBullet : d.enemyBullet) || 8;
    let angs = [theta];
    if (m.isBoss) {
      const pat = m.bossPattern || 1;
      if (pat === 2) {
        angs = [theta - 0.32, theta + 0.32];
        speed = 8;
      } else if (pat === 3) {
        angs = [theta - 0.32, theta, theta + 0.32];
        speed = 8;
      }
      speed *= 1.2;
    }
    for (let i = 0; i < angs.length; i++) {
      const ang = angs[i];
      const bullet = document.createElement("div");
      bullet.className = "bullet enemy";
      placeEl(bullet, startX, startY);
      field.appendChild(bullet);
      state.bullets.push({
        el: bullet,
        x: startX,
        y: startY,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        born: now,
        enemy: true,
        fromBoss: !!m.isBoss,
      });
    }
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
    if (!state.teachQueue) {
      state.teachQueue = item.comboIds ? comboTechs(item) : [item];
      state.teachPos = 0;
    }
    const card = state.teachQueue[state.teachPos] || item;
    const hitsText = card.hits ? card.hits.join(", ") : uniqueHitText(item.tokens);
    const acc = state.tankHits ? Math.min(100, Math.round((state.okHits / state.tankHits) * 100)) : 0;
    const what = card.pair ? card.hinge : card.plain || "";
    const effect = card.pair
      ? hitsText
        ? "Correct formulas: " + hitsText + "."
        : card.plain || ""
      : "Fe → 1, FeS → 2, Fe + S → 3";
    const exampleBody = card.pair
      ? `<div class="pair-cols teach-pair">` +
        `<div class="pair-card"><span>${COPY.jia}</span><p>${card.jia}</p></div>` +
        `<div class="pair-card"><span>${COPY.yi}</span><p>${card.yi}</p></div>` +
        `</div>`
      : `<p>${card.example || item.passage || ""}</p>`;
    const mark = card.mark || item.mark || "";
    const vs = card.vs || "";
    const teach = document.getElementById("teach");
    const more = state.teachPos + 1 < state.teachQueue.length;
    const nextLabel = more
      ? COPY.nextCard
      : state.index + 1 >= state.deck.length
        ? COPY.nextLast
        : COPY.next;
    teach.hidden = false;
    teach.innerHTML =
      `<div class="clear-inner">` +
      `<p class="clear-kicker">${floorLabel(state.index + 1)}${COPY.floorClear}</p>` +
      `<p class="clear-title">${card.name}</p>` +
      `<div class="teach-block"><span>${COPY.teachWhat}</span><p>${what}</p></div>` +
      `<div class="teach-block"><span>${COPY.teachEffect}</span><p>${effect}</p></div>` +
      `<div class="teach-block"><span>${COPY.teachExample}</span>${exampleBody}<p class="teach-mark">${mark}</p></div>` +
      `<div class="teach-block"><span>${COPY.teachVs}</span><p>${vs}</p></div>` +
      `<div class="teach-block teach-write"><span>${COPY.teachWrite}</span><p>${card.writeStem || ""}</p>` +
      (card.writeModel
        ? `<p class="write-model" hidden></p><button type="button" class="btn btn-ghost" data-reveal="1" data-answer="${card.writeModel}">${COPY.showAnswer}</button>`
        : "") +
      `</div>` +
      `<div class="clear-stats">` +
      `<div><span>${COPY.timeUsed}</span><b>${formatPlayTime(playElapsed())}</b></div>` +
      `<div><span>${COPY.accuracy}</span><b>${acc}%</b></div>` +
      `</div>` +
      `<button type="button" class="btn" data-next="1">${nextLabel}</button>` +
      `</div>`;
  }

  function hitBoss() {
    if (state.locked || !state.bossLockedIn) return;
    const m = bossMover();
    if (!m || m.hp <= 0) return;
    if (!state.bossTellClass || state.ammo !== state.bossTellClass) return;
    m.hp -= state.bossDamage || 1;
    if (m.hp < 0) m.hp = 0;
    setTankLabel(m.el, bossName() + " " + m.hp + "/" + m.hpMax);
    syncRemainCount();
    if (m.hp > 0) return;
    m.el.classList.add("hit");
    setTankLabel(m.el, "✓ " + bossName());
    state.bossDead = true;
    state.locked = true;
    if (state.field) state.field.classList.remove("boss-arena");
    hideBossFightBanner();
    setBossDoorOpen(true);
    showTeach(current());
  }

  function formulaClass(text) {
    return HIT_OWNER[text] || "";
  }

  function ammoReason(cls) {
    if (cls === AMMO[0]) return "one kind of atom, even O2";
    if (cls === AMMO[1]) return "two elements joined, no plus sign";
    if (cls === AMMO[2]) return "plus sign, not yet joined";
    return "";
  }

  function setAmmo(cat) {
    state.ammo = cat;
    const el = document.getElementById("ammo-label");
    if (!el) return;
    const i = AMMO.indexOf(cat);
    el.textContent = (i >= 0 ? i + 1 + " " : "") + cat;
    el.classList.remove("ammo-flash");
    void el.offsetWidth;
    el.classList.add("ammo-flash");
  }

  function rememberWeakFloor(item) {
    if (
      state.weak.filter(function (w) {
        return w.id === item.id;
      }).length
    ) {
      return;
    }
    state.weak.push(item);
  }

  function afterFormulaKill(item) {
    const remainEl = playEl.querySelector("#remain-count");
    if (remainEl) remainEl.textContent = fragmentLabel();
    if (state.remaining.length !== 0) {
      updateHud();
      return;
    }
    if (!item.missed.length && !item.usedTip && !item.ammoWrong) state.firstHits += 1;
    updateHud();
    if (state.bossMode) {
      openBossDoor();
      return;
    }
    state.locked = true;
    showTeach(item);
  }

  function shootFormula(item, token, btn) {
    state.tankHits += 1;
    const cls = formulaClass(token.text);
    if (cls && cls === state.ammo) {
      state.okHits += 1;
      if (state.healOnHit) state.hearts = Math.min(state.heartsMax || diff().hearts, state.hearts + 1);
      state.remaining = state.remaining.filter(function (x) {
        return x !== token.id;
      });
      state.collected.push(token.text);
      removeFloater(btn);
      setFeedback("✓ " + token.text + " is " + cls + ".");
      afterFormulaKill(item);
      return;
    }
    state.misses += 1;
    item.ammoWrong = true;
    rememberWeakFloor(item);
    setFeedback(
      cls
        ? "✗ " + token.text + " is a " + cls.charAt(0).toLowerCase() + cls.slice(1) + ": " + ammoReason(cls) + "."
        : "✗ " + token.text + " is not " + state.ammo + "."
    );
    state.fireLockUntil = performance.now() + FIRE_LOCK_MS;
    state.hearts -= 1;
    if (endIfNoHearts()) return;
    updateHud();
  }

  function shootToken(id) {
    if (state.locked) return;
    const item = current();
    const token = item.tokens.find(function (t) {
      return t.id === id;
    });
    const btn = playEl.querySelector('[data-token="' + id + '"]');
    if (!token || !btn || btn.classList.contains("hit") || btn.classList.contains("miss")) return;
    if (isHitType()) {
      shootFormula(item, token, btn);
      return;
    }
    if (!token.ok && state.remaining.length === 0) {
      removeFloater(btn);
      return;
    }
    state.tankHits += 1;
    if (token.ok) {
      state.okHits += 1;
      if (state.healOnHit) state.hearts = Math.min(state.heartsMax || diff().hearts, state.hearts + 1);
      state.remaining = state.remaining.filter(function (x) {
        return x !== id;
      });
      state.collected.push(token.text);
      removeFloater(btn);
      setFeedback("✓ " + token.text + " is " + item.name + ".");
      const remainEl = playEl.querySelector("#remain-count");
      if (remainEl) remainEl.textContent = fragmentLabel();
      if (state.remaining.length === 0) {
        if (!item.missed.length && !item.usedTip) state.firstHits += 1;
        updateHud();
        clearLeftoverMonsters();
        if (state.bossMode) {
          openBossDoor();
        } else {
          state.locked = true;
          showTeach(item);
        }
      } else {
        updateHud();
      }
    } else {
      state.misses += 1;
      if (item.missed.indexOf(token.text) === -1) item.missed.push(token.text);
      rememberWeakFloor(item);
      setFeedback(missExplain(token.text, item));
      if (item.missed.length === 2) revealOneRemaining();
      state.fireLockUntil = performance.now() + FIRE_LOCK_MS;
      removeFloater(btn);
      if (diff().missHeart) {
        state.hearts -= 1;
        if (endIfNoHearts()) return;
      }
      updateHud();
    }
  }

  function advance() {
    if (state.view !== "play") return;
    if (state.floorSwitching) return;
    state.index += 1;
    if (state.index >= state.deck.length) {
      state.locked = false;
      renderRecap();
      return;
    }
    function go() {
      state.floorSwitching = false;
      if (state.view !== "play") return;
      state.locked = false;
      renderShoot();
    }
    if (preferReducedMotion()) {
      go();
      return;
    }
    state.floorSwitching = true;
    state.locked = true;
    const veil = document.createElement("div");
    veil.className = "floor-veil";
    veil.innerHTML = "<span>" + floorLabel(state.index + 1) + "</span>";
    playEl.appendChild(veil);
    if (floorTimer) {
      clearTimeout(floorTimer);
      floorTimer = 0;
    }
    floorTimer = setTimeout(function () {
      floorTimer = 0;
      go();
    }, 450);
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
      if (owner && owner !== want) {
        lines.push("You shot " + wrong + " (" + owner + "). This floor is " + want + ".");
      } else if (owner !== want) {
        lines.push("You shot " + wrong + ". This floor is " + want + ".");
      }
    });
    return lines;
  }

  function catStatsHtml() {
    const by = {};
    state.deck.forEach(function (item) {
      if (!by[item.cat]) by[item.cat] = { ok: 0, n: 0 };
      by[item.cat].n += 1;
      if (!item.missed.length && !item.usedTip && !item.ammoWrong) by[item.cat].ok += 1;
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
            const hitsText = w.hits ? w.hits.join(", ") : uniqueHitText(w.tokens || []);
            const picked = w.missed.length
              ? `<div class="picked">Missed: ${w.missed.join(", ")}</div>`
              : "";
            return `<li class="recap-pair"><div class="pair">${w.name} → ${hitsText}</div>${picked}</li>`;
          })
          .join("")}</ul>`
      : `<p>${COPY.clean}</p>`;
    const homeItem = state.weak[0];
    const homeHtml =
      homeItem && (homeItem.writeStem || homeItem.writeModel)
        ? `<div class="home-work"><p class="recap-label">${COPY.recapHome}</p><p>${homeItem.writeStem || ""}</p><p class="write-model">${homeItem.writeModel || ""}</p></div>`
        : "";
    const retry = state.weak.length
      ? `<button type="button" class="btn" data-retry-weak="1">${COPY.retryWeak}</button>`
      : "";
    const recapHeading = state.died
      ? COPY.outOfHearts + (state.index + 1) + COPY.floorUnit
      : COPY.recapTitle;
    recapEl.innerHTML = `
      <div class="recap-card">
        <h2${state.died ? ' class="out-of-hearts"' : ""}>${recapHeading}</h2>
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
    state.floorSwitching = false;
    state.setupStep = 0;
    setupBusy = false;
    if (setupTimer) {
      clearTimeout(setupTimer);
      setupTimer = 0;
    }
    if (floorTimer) {
      clearTimeout(floorTimer);
      floorTimer = 0;
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
      state.cat = COPY.catAll;
      state.qtype = COPY.qtypeHit;
      saveSetupStore();
      goSetupStep(3, 1);
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
      return;
    }
    const bossChip = e.target.closest("[data-boss]");
    if (bossChip) {
      if (bossChip.disabled) return;
      state.bossMode = bossChip.getAttribute("data-boss") === COPY.bossOn;
      saveSetupStore();
      markChipActive(bossChip);
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
    const reveal = e.target.closest("[data-reveal]");
    if (reveal) {
      const model = reveal.parentElement.querySelector(".write-model");
      if (model) {
        model.hidden = false;
        model.textContent = reveal.getAttribute("data-answer") || "";
      }
      reveal.hidden = true;
      return;
    }
    if (e.target.closest("[data-next]")) {
      if (state.teachQueue && state.teachPos + 1 < state.teachQueue.length) {
        state.teachPos += 1;
        showTeach(current());
        return;
      }
      state.teachQueue = null;
      state.teachPos = 0;
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
    if (state.view === "play" && state.mode === "shoot" && isHitType()) {
      const ammoIndex = { 1: 0, 2: 1, 3: 2 }[e.key];
      if (ammoIndex !== undefined && AMMO[ammoIndex]) {
        e.preventDefault();
        setAmmo(AMMO[ammoIndex]);
        return;
      }
    }
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
  if (homeBtn) homeBtn.textContent = COPY.home;
  loadSetupStore();
  renderHub();
  show("hub");
})();
