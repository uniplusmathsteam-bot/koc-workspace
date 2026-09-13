(function () {
  const hubEl = document.getElementById("hub");
  const setupViewport = document.getElementById("setup-viewport");
  const playEl = document.getElementById("play");
  const recapEl = document.getElementById("recap");
  const hudEl = document.getElementById("hud");
  const homeBtn = document.getElementById("btn-home");
  const headerLead = document.getElementById("header-lead");
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const leaveOverlay = document.getElementById("leave-overlay");
  const leaveStay = document.getElementById("leave-stay");
  const leaveHome = document.getElementById("leave-home");
  let setupBusy = false;
  let setupTimer = 0;
  const reduceMotionMq = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  const CATS = [];
  TECHNIQUES.forEach(function (tech) {
    if (CATS.indexOf(tech.cat) === -1) CATS.push(tech.cat);
  });

  const SPEED = {};
  SPEED[COPY.speedSlow] = 0.45;
  SPEED[COPY.speedNormal] = 1;
  SPEED[COPY.speedFast] = 1.55;

  const PLAYER_SPEED = 5.5;
  const PLAYER_PAD = 20;
  const BULLET_SPEED = 12;
  const BULLET_OFFSET = 30;
  const BULLET_RADIUS = 10;
  const FIRE_COOLDOWN = 200;
  const BULLET_LIFE = 10000;
  const TANK_HALF = 18;
  const TANK_COLORS = ["#2bbbdf", "#f5c542", "#7c3aed", "#178a57", "#d97706", "#db2777"];
  const MIN_OK = 4;
  const MIN_TOKENS = 8;
  const SEPARATE = 72;
  const MAX_HEARTS = 5;
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
    speed: COPY.speedNormal,
    deck: [],
    index: 0,
    firstHits: 0,
    misses: 0,
    weak: [],
    locked: false,
    remaining: [],
    paused: false,
    timer: null,
    moveRaf: null,
    keys: { left: false, right: false, up: false, down: false },
    mouse: { x: 0, y: 0 },
    player: null,
    bullets: [],
    lastFire: 0,
    movers: [],
    shots: 0,
    hitShots: 0,
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
  };

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

  function extraDecoyPool(tech) {
    const skip = {};
    tech.hits.forEach(function (text) {
      skip[text] = true;
    });
    tech.decoys.forEach(function (text) {
      skip[text] = true;
    });
    const out = [];
    TECHNIQUES.forEach(function (other) {
      if (other.id === tech.id) return;
      other.hits.forEach(function (text) {
        if (!skip[text] && out.indexOf(text) === -1) out.push(text);
      });
    });
    return out;
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
    if (req) req.call(playEl);
  }

  function overlayOpen() {
    return !leaveOverlay.hidden;
  }

  function hideOverlay() {
    leaveOverlay.hidden = true;
    resumePlayClock();
  }

  function showOverlay() {
    freezePlayClock();
    leaveOverlay.hidden = false;
    clearKeys();
  }

  function freezePlayClock() {
    if (state.playTick) {
      state.playMs += performance.now() - state.playTick;
      state.playTick = 0;
    }
  }

  function resumePlayClock() {
    if (state.locked || state.paused || overlayOpen() || state.view !== "play") return;
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
    if (headerLead) headerLead.hidden = true;
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
    let hearts = "";
    for (let i = 0; i < MAX_HEARTS; i++) {
      hearts += '<i class="heart' + (i < state.hearts ? " on" : "") + '"></i>';
    }
    const playHearts = document.getElementById("play-hearts");
    if (playHearts) {
      playHearts.setAttribute("aria-label", COPY.hearts + " " + state.hearts);
      playHearts.innerHTML = hearts;
    }
    hudEl.innerHTML =
      `<span>${COPY.round}${state.index + 1}${COPY.of}${state.deck.length}</span>` +
      `<span>${COPY.firstHits} ${state.firstHits}</span>` +
      `<span>${COPY.misses} ${state.misses}</span>`;
  }

  function preferReducedMotion() {
    return !!reduceMotionMq.matches;
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

  function countPool(cat) {
    return TECHNIQUES.filter(function (tech) {
      if (cat !== COPY.catAll && tech.cat !== cat) return false;
      return tech.hits.length + tech.decoys.length >= 2;
    }).length;
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
            <li>${COPY.howto6}</li>
          </ol>
          <div class="hub-actions">
            <button type="button" class="btn" data-setup-next="1">${COPY.setupNext}</button>
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
          <p class="chip-label">${COPY.pickCat}</p>
          <div class="chip-row">${chipButtons([COPY.catAll].concat(CATS), "data-cat", state.cat, catDisabled)}</div>
          ${poolCountHtml()}
          ${setupBackHtml()}
      `;
    }
    if (state.setupStep === 2) {
      return `
          <p class="track">${COPY.trackLearn}</p>
          <p class="chip-label">${COPY.pickSpeed}</p>
          <div class="chip-row">${chipButtons(
            [COPY.speedSlow, COPY.speedNormal, COPY.speedFast],
            "data-speed",
            state.speed
          )}</div>
          ${poolCountHtml()}
          ${setupBackHtml()}
      `;
    }
    if (state.setupStep === 3) {
      return `
          <p class="track">${COPY.trackLearn}</p>
          <p class="chip-label">${COPY.pickTip}</p>
          <p class="pick-cat">${COPY.tipLead}</p>
          <div class="chip-row">${chipButtons(
            [COPY.tipOff, COPY.tipOn],
            "data-tip",
            state.tipHunt ? COPY.tipOn : COPY.tipOff
          )}</div>
          ${setupBackHtml()}
      `;
    }
    return `
        <p class="track">${COPY.trackLearn}</p>
        <p class="chip-label">${COPY.healLabel}</p>
        <div class="chip-row">${chipButtons(
          [COPY.healOff, COPY.healOn],
          "data-heal",
          state.healOnHit ? COPY.healOn : COPY.healOff
        )}</div>
        ${setupBackHtml()}
    `;
  }

  function tipAllowed() {
    return state.speed !== COPY.speedFast;
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

  function setupBack() {
    if (state.setupStep <= 0 || setupBusy) return;
    if (state.setupStep === 4 && !tipAllowed()) {
      goSetupStep(2, -1);
      return;
    }
    goSetupStep(state.setupStep - 1, -1);
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
      if (state.cat !== COPY.catAll && tech.cat !== state.cat) return false;
      return tech.hits.length + tech.decoys.length >= 2;
    });
  }

  function makeShootDeck(pool) {
    const size = Math.min(10, pool.length);
    return shuffle(pool)
      .filter(function (tech) {
        return tech.hits.length + tech.decoys.length >= 2;
      })
      .slice(0, size)
      .map(function (tech) {
        const raw = [];
        tech.hits.forEach(function (text) {
          raw.push({ text: text, ok: true });
        });
        let hi = 0;
        while (raw.filter(function (t) { return t.ok; }).length < MIN_OK && tech.hits.length) {
          raw.push({ text: tech.hits[hi % tech.hits.length], ok: true });
          hi += 1;
        }
        tech.decoys.forEach(function (text) {
          raw.push({ text: text, ok: false });
        });
        const extras = shuffle(extraDecoyPool(tech));
        let ei = 0;
        while (raw.length < MIN_TOKENS && ei < extras.length) {
          raw.push({ text: extras[ei], ok: false });
          ei += 1;
        }
        const tokens = shuffle(raw).map(function (token, i) {
          return {
            text: token.text,
            ok: token.ok,
            id: tech.id + "-" + i,
          };
        });
        return {
          id: tech.id,
          cat: tech.cat,
          name: tech.name,
          example: tech.example,
          tokens: tokens,
          missed: [],
        };
      });
  }

  function startShoot(weakOnly) {
    const pool = poolForRound(weakOnly);
    if (!pool.length) {
      renderHub(0);
      show("hub");
      return;
    }
    resetRound("shoot", makeShootDeck(pool));
    renderShoot();
  }

  function stopArenaLoop() {
    if (state.moveRaf) {
      cancelAnimationFrame(state.moveRaf);
      state.moveRaf = null;
    }
    const flying = playEl.querySelectorAll(".bullet");
    for (let i = 0; i < flying.length; i++) flying[i].remove();
    state.bullets = [];
    state.movers = [];
    state.player = null;
    state.tip = null;
  }

  function speedMul() {
    return SPEED[state.speed] || 1;
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
    const field = playEl.querySelector(".playfield");
    if (!field) return;
    const rect = field.getBoundingClientRect();
    state.mouse.x = e.clientX - rect.left;
    state.mouse.y = e.clientY - rect.top;
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

  function tankSettled(m) {
    return m.el.classList.contains("hit") || m.el.classList.contains("miss");
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
    state.movers.forEach(function (m) {
      if (tankSettled(m)) return;
      if (player) {
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
      m.x += m.vx * step;
      m.y += m.vy * step;
    });
    separateWordTanks();
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
      if (m.cannon) m.cannon.style.transform = "rotate(" + Math.atan2(m.vy, m.vx) + "rad)";
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
    state.hitShots += 1;
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
      updateHud();
      if (state.hearts <= 0) {
        state.died = true;
        state.locked = true;
        freezePlayClock();
        stopArenaLoop();
        renderRecap();
      }
      return;
    }
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

  function startArenaLoop() {
    stopArenaLoop();
    const field = playEl.querySelector(".playfield");
    const tankEl = playEl.querySelector(".player-tank");
    if (!field || !tankEl) return;
    const w = field.clientWidth;
    const h = field.clientHeight;
    const mul = speedMul();
    state.mouse.x = w / 2;
    state.mouse.y = 0;
    state.lastFire = 0;
    state.player = {
      el: tankEl,
      cannon: tankEl.querySelector(".tank-cannon"),
      x: w / 2,
      y: Math.max(PLAYER_PAD, h - 48),
      cannonTheta: -Math.PI / 2,
      immune: false,
    };
    placeEl(tankEl, state.player.x, state.player.y);
    aimPlayerCannon();

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
      const dx = state.player.x - x;
      const dy = state.player.y - y;
      const dist = Math.hypot(dx, dy) || 1;
      placeEl(el, x, y);
      return {
        el: el,
        cannon: el.querySelector(".tank-cannon"),
        x: x,
        y: y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        speed: speed,
        halfW: TANK_HALF,
        halfH: TANK_HALF,
      };
    });

    const tipEl = document.getElementById("tip-target");
    if (tipEl && state.tipHunt && tipAllowed()) {
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

    let lastTick = 0;
    function tick(now) {
      if (!lastTick) lastTick = now;
      const step = Math.min(32, now - lastTick) / FRAME;
      lastTick = now;
      if (!state.paused && !state.locked && !overlayOpen()) {
        const fieldW = field.clientWidth;
        const fieldH = field.clientHeight;
        movePlayer(fieldW, fieldH, step);
        moveWordTanks(fieldW, fieldH, step);
        moveTip(fieldW, fieldH, step);
        moveBullets(field, fieldW, fieldH, step);
      }
      if (state.locked || state.view !== "play" || !state.player) return;
      state.moveRaf = requestAnimationFrame(tick);
    }
    state.moveRaf = requestAnimationFrame(tick);
  }

  function resetRound(mode, deck) {
    clearTimeout(state.timer);
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
    state.hearts = MAX_HEARTS;
    state.immuneUntil = 0;
    state.died = false;
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

  function setPaused(on) {
    state.paused = on;
    const field = playEl.querySelector(".playfield");
    if (field) field.classList.toggle("paused", on);
    if (on) freezePlayClock();
    else resumePlayClock();
  }

  function togglePause() {
    if (state.view !== "play" || state.locked || overlayOpen()) return;
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
    state.shots = 0;
    state.hitShots = 0;
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
          '<button type="button" class="floater" data-token="' +
          token.id +
          '">' +
          tankMarkup(token.text, color) +
          "</button>"
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
        <p class="prompt-arrow">${COPY.keys}</p>
        <div class="prompt-top">
          <div class="prompt-box">${COPY.prompt}：${item.name}</div>
        </div>
        <p class="tip-line" id="tip-line" hidden></p>
        <div class="playfield">
          <div class="arena-deco" aria-hidden="true">
            <span class="deco-sq" style="left:7%;top:16%"></span>
            <span class="deco-hex" style="left:18%;top:68%"></span>
            <span class="deco-tri" style="left:28%;top:22%"></span>
            <span class="deco-sq" style="left:41%;top:78%"></span>
            <span class="deco-hex" style="left:55%;top:12%"></span>
            <span class="deco-sq" style="left:63%;top:58%"></span>
            <span class="deco-tri" style="left:74%;top:30%"></span>
            <span class="deco-hex" style="left:84%;top:74%"></span>
            <span class="deco-sq" style="left:90%;top:20%"></span>
          </div>
          ${floaters}
          ${
            state.tipHunt && tipAllowed()
              ? '<div class="tip-target" id="tip-target">' + TIP_HITS + "</div>"
              : ""
          }
          <div class="player-tank" aria-hidden="true">${tankMarkup("我", "#00b2e1")}</div>
          <div class="pause-banner">${COPY.paused} · ${COPY.pauseHint}</div>
          <div id="teach" class="clear-card" hidden></div>
        </div>
        <p class="key-hint">WASD 開車 · 滑鼠轉炮 · 點擊開火 · ${COPY.pauseHint}</p>
        <p class="feedback" id="feedback"></p>
      </div>
    `;
    updateHud();
    syncFsBtn();
    startArenaLoop();
    state.playTick = performance.now();
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

  function fireShot() {
    if (state.mode !== "shoot" || state.locked || state.paused || overlayOpen()) return;
    const field = playEl.querySelector(".playfield");
    const player = state.player;
    if (!field || !player) return;
    const now = performance.now();
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
    state.shots += 1;
  }

  function showTeach(item) {
    freezePlayClock();
    stopArenaLoop();
    setPaused(false);
    const hitsText = uniqueHitText(item.tokens);
    const acc = state.tankHits ? Math.min(100, Math.round((state.okHits / state.tankHits) * 100)) : 0;
    const teach = document.getElementById("teach");
    teach.hidden = false;
    teach.innerHTML =
      `<div class="clear-inner">` +
      `<p class="clear-title">${COPY.cleared}</p>` +
      `<div class="clear-stats">` +
      `<div><span>${COPY.timeUsed}</span><b>${formatPlayTime(playElapsed())}</b></div>` +
      `<div><span>${COPY.accuracy}</span><b>${acc}%</b></div>` +
      `<div><span>${COPY.ammo}</span><b>${state.hitShots}</b></div>` +
      `</div>` +
      `<p class="pair-line">「${item.name}」→ ${hitsText}</p>` +
      `<p class="example"><span>${COPY.example}</span>${item.example}</p>` +
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
    state.hitShots += 1;
    state.tankHits += 1;
    if (token.ok) {
      btn.classList.add("hit");
      state.okHits += 1;
      if (state.healOnHit) state.hearts = Math.min(MAX_HEARTS, state.hearts + 1);
      setTankLabel(btn, "✓ " + token.text);
      state.remaining = state.remaining.filter(function (x) {
        return x !== id;
      });
      document.getElementById("feedback").textContent =
        "✓ 「" + item.name + "」的作用是「" + token.text + "」。";
      playEl.querySelector("#remain-count").textContent =
        COPY.remaining + " " + state.remaining.length;
      if (state.remaining.length === 0) {
        state.locked = true;
        if (!item.missed.length) state.firstHits += 1;
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
          return w.name === item.name;
        }).length
      ) {
        state.weak.push(item);
      }
      document.getElementById("feedback").textContent = missExplain(token.text, item.name);
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
            const hitsText = uniqueHitText(w.tokens);
            const picked = w.missed.length
              ? `<div class="picked">誤中：${w.missed.join("、")}</div>`
              : "";
            return `<li class="recap-pair"><div class="pair">${w.name} → ${hitsText}</div>${picked}</li>`;
          })
          .join("")}</ul>`
      : `<p>${COPY.clean}。</p>`;
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
        ${weak}
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
    clearTimeout(state.timer);
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
    const catChip = e.target.closest("[data-cat]");
    if (catChip) {
      if (catChip.disabled) return;
      state.cat = catChip.getAttribute("data-cat");
      goSetupStep(2, 1, catChip);
      return;
    }
    const speedChip = e.target.closest("[data-speed]");
    if (speedChip) {
      if (speedChip.disabled) return;
      state.speed = speedChip.getAttribute("data-speed");
      if (!tipAllowed()) {
        state.tipHunt = false;
        goSetupStep(4, 1, speedChip);
      } else {
        goSetupStep(3, 1, speedChip);
      }
      return;
    }
    const tipChip = e.target.closest("[data-tip]");
    if (tipChip) {
      if (tipChip.disabled) return;
      state.tipHunt = tipChip.getAttribute("data-tip") === COPY.tipOn;
      goSetupStep(4, 1, tipChip);
      return;
    }
    const healChip = e.target.closest("[data-heal]");
    if (healChip) {
      if (healChip.disabled) return;
      markChipActive(healChip);
      state.healOnHit = healChip.getAttribute("data-heal") === COPY.healOn;
      setupBusy = true;
      setupTimer = setTimeout(function () {
        setupTimer = 0;
        setupBusy = false;
        startShoot(false);
      }, preferReducedMotion() ? 0 : 80);
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

  document.addEventListener("fullscreenchange", syncFsBtn);
  document.addEventListener("webkitfullscreenchange", syncFsBtn);

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

  renderHub();
  show("hub");
})();
