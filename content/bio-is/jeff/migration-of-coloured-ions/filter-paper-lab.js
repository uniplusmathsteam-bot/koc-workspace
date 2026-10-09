/**
 * Filter Paper · Part 1 — photorealistic asset stage
 * Interaction chrome inspired by S3-Bio Virtual Light Microscope (not a clone).
 */
(function () {
  'use strict';

  /** Any visible scoop is enough — smaller crystals are preferred; no min/max fail. */
  const CRYSTAL_VISIBLE = 0.04;
  /** Required d.c. voltage for this experiment (students must dial this in). */
  const TARGET_VOLTAGE = 20;

  const state = {
    step: 0, // 0 intro, 1 moisten (place dry + dropper), 2 crystal, 3 connect
    papersLeft: 3,
    paper: null,
    drag: null,
    dryPlaced: false,
    soakedPlaced: false,
    crystalOk: false,
    onSlide: false,
    clipPos: false,
    clipNeg: false,
    /** Which paper end holds each clip: 'left' | 'right' | null (either polarity allowed). */
    clipPosEnd: null,
    clipNegEnd: null,
    powerOn: false,
    /** Current dial reading on the d.c. supply (V). Starts at 0 — student sets 20 V. */
    voltage: 0,
    migrate: 0,
    /** Isotropic diffusion when supply is OFF (keeps migrate trail; does not reset it). */
    diffuse: 0,
    spatulaLoad: 0,
    dropperFill: 0,
    last: { x: 0, y: 0, t: 0 },
    raf: 0,
    stage: null,
  };

  function voltageOk() {
    return state.voltage === TARGET_VOLTAGE;
  }

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function showWarning(msg, ms = 3400) {
    const el = $('#fp-warning');
    const text = $('#fp-warning-text');
    if (!el || !text) return;
    text.textContent = msg;
    el.classList.add('fp-warning--visible');
    clearTimeout(showWarning._t);
    showWarning._t = setTimeout(() => el.classList.remove('fp-warning--visible'), ms);
  }

  function setInstruction(html) {
    const el = $('#fp-instruction');
    if (el) el.innerHTML = html;
  }

  function updateStepPills() {
    $$('.fp-step-pill').forEach((btn, i) => {
      btn.classList.toggle('fp-step-pill--done', i < state.step);
      btn.classList.toggle('fp-step-pill--active', i === state.step);
    });
  }

  function updateUI() {
    updateStepPills();
    const stock = $('#fp-paper-stock');
    if (stock) stock.textContent = `Filter papers left: ${state.papersLeft}`;

    const beginBtn = $('#fp-btn-begin');
    if (beginBtn) beginBtn.classList.toggle('hidden', state.step > 0);

    const soakMeter = $('#fp-soak-meter');
    const soakFill = $('#fp-soak-fill');
    const showSoak =
      state.step === 1 &&
      state.dryPlaced &&
      state.paper &&
      !state.paper.wet;
    if (soakMeter) soakMeter.classList.toggle('hidden', !showSoak);
    if (soakFill && state.paper) {
      soakFill.style.width = `${Math.round((state.paper.soak || 0) * 100)}%`;
    }

    updateSpatulaCrystals();
    updateDropperVisual();
    updatePaperSoakVisual();

    // Centre guide removed — crystals may be placed anywhere on the moist paper
    state.paper?.el?.querySelector('.fp-center-target')?.classList.add('hidden');

    // Spot / migration trail / diffusion (OFF keeps the trail — does not reset)
    const spot = state.paper?.el?.querySelector('.fp-spot');
    const trail = state.paper?.el?.querySelector('.fp-spot-trail');
    const halo = state.paper?.el?.querySelector('.fp-spot-diffuse');
    // Remove legacy dual-side tip node if an older paper element is still on stage
    state.paper?.el?.querySelector('.fp-spot-front')?.remove();
    if (spot && state.paper) {
      const hasSpot = state.paper.spot > 0;
      spot.classList.toggle('hidden', !hasSpot);

      const m = state.migrate;
      const d = state.diffuse;
      const pW = state.paper.el.offsetWidth || 64;
      // Direction only once the (+) clip end is known — never both sides
      const posEnd = state.clipPosEnd;
      const towardRight = posEnd === 'right';
      const towardLeft = posEnd === 'left';
      // Trail stays for as long as migrate > 0 — power ON/OFF does not erase it
      const hasTrail = (towardRight || towardLeft) && m > 0.01;

      // Origin stain keeps any prior diffusion when supply toggles ON again (never snaps back)
      const sx = 0.85 + state.paper.spot * 0.25 + d * 0.9;
      const sy = 0.85 + state.paper.spot * 0.12 + d * 1.05;
      spot.style.transform = `translate(-50%, -50%) scale(${sx}, ${sy})`;
      spot.style.opacity = String(0.7 + state.paper.spot * 0.28 - d * 0.18);
      spot.style.filter = d > 0.01 ? `blur(${0.2 + d * 1.4}px)` : 'blur(0.2px)';

      if (trail) {
        const maxLen = pW * 0.42;
        const len = hasTrail ? Math.max(0, m * maxLen) : 0;
        // Soften / widen trail a little while diffusing, but keep the route
        const trailH = 46 + d * 36;
        trail.classList.toggle('hidden', !hasSpot || !hasTrail);
        trail.classList.toggle('fp-spot-trail--left', towardLeft);
        if (towardRight) {
          trail.style.left = '50%';
          trail.style.right = 'auto';
        } else if (towardLeft) {
          trail.style.right = '50%';
          trail.style.left = 'auto';
        } else {
          trail.style.left = '50%';
          trail.style.right = 'auto';
        }
        trail.style.width = `${len}px`;
        trail.style.height = `${trailH}%`;
        trail.style.filter = d > 0.01 ? `blur(${0.55 + d * 2.2}px)` : 'blur(0.55px)';
        trail.style.opacity = hasTrail ? String(Math.max(0.16, 0.4 + m * 0.55 - d * 0.28)) : '0';
      }

      if (halo) {
        // Always show accumulated diffusion (ON or OFF) — grows only while OFF in loop()
        const showHalo = hasSpot && d > 0.008;
        halo.classList.toggle('hidden', !showHalo);
        const hs = 0.35 + d * 2.8;
        halo.style.transform = `translate(-50%, -50%) scale(${hs}, ${Math.min(hs * 0.9, 2.6)})`;
        halo.style.opacity = showHalo ? String(Math.min(0.72, 0.08 + d * 0.55)) : '0';
      }
    }

    const supply = $('#fp-supply');
    if (supply) supply.classList.toggle('fp-supply--on', state.powerOn);
    const sw = $('#fp-power-switch');
    if (sw) {
      sw.classList.toggle('fp-switch--on', state.powerOn);
      sw.setAttribute('aria-pressed', state.powerOn ? 'true' : 'false');
      sw.setAttribute('aria-label', state.powerOn ? 'Power switch (on)' : 'Power switch (off)');
      // Never inject ON/OFF text into the rocker hit-target
      if (sw.childElementCount === 0) sw.textContent = '';
      else Array.from(sw.childNodes).forEach((n) => { if (n.nodeType === 3) n.textContent = ''; });
    }
    syncSupplyLeads();

    if (state.step === 0) {
      setInstruction('Study the real apparatus on the bench, then press <strong>Begin experiment</strong>.');
    } else if (state.step === 1 && !state.dryPlaced) {
      setInstruction('Drag the <strong>forceps</strong> to pick up a <strong>dry</strong> filter paper strip and place it on the bench mat. Do <strong>not</strong> dip the paper into the beaker.');
    } else if (state.step === 1) {
      setInstruction('Use the <strong>dropper</strong>: draw colourless <strong>Na₂SO₄(aq)</strong> from the beaker, then drop thoroughly onto the paper until it is soaked.');
    } else if (state.step === 2) {
      setInstruction('Scoop a <strong>small</strong> amount of <strong>KMnO₄</strong> with the spatula (smaller crystals are better), then drop them onto the <strong>moist filter paper</strong>.');
    } else if (!state.onSlide) {
      setInstruction('Use forceps to transfer the moist paper onto the <strong>glass microscope slide</strong>.');
    } else if (!state.clipPos || !state.clipNeg) {
      setInstruction('Clamp <strong>red (+)</strong> and <strong>black (−)</strong> onto <strong>opposite</strong> ends of the paper — either way round is fine.');
    } else if (!voltageOk()) {
      setInstruction(
        `Adjust the <strong>d.c. supply voltage</strong> to the appropriate value: <strong>${TARGET_VOLTAGE}&nbsp;V</strong> ` +
          `(now ${state.voltage}&nbsp;V). Then switch on the POWER rocker.`
      );
    } else if (!state.powerOn && state.migrate > 0.01) {
      setInstruction(
        'Supply <strong>OFF</strong>: the migration route stays. Purple colour slowly <strong>diffuses in all directions</strong> on the moist paper.'
      );
    } else if (!state.powerOn) {
      setInstruction(
        `Voltage set to <strong>${TARGET_VOLTAGE}&nbsp;V</strong> — switch on the <strong>POWER</strong> rocker on the d.c. supply, or use the <strong>Switch on</strong> button.`
      );
    } else {
      const side = state.clipPosEnd === 'right' ? 'right' : 'left';
      setInstruction(
        `Observe at <strong>${TARGET_VOLTAGE}&nbsp;V</strong>: a purple trail spreads from the <strong>centre</strong> toward the <strong>${side} / red (+)</strong> pole because MnO₄⁻ is an anion.`
      );
    }

    // Tool availability / visibility cues
    const dropperReady = state.step === 1 && state.dryPlaced && !!state.paper && !state.paper.wet;
    const forcepsBusy =
      state.step === 2 || (state.step === 1 && dropperReady);
    $('#fp-forceps')?.classList.toggle('fp-dim', forcepsBusy);
    $('#fp-spatula')?.classList.toggle('fp-dim', state.step !== 2);
    $('#fp-dropper')?.classList.toggle('fp-dim', !dropperReady);
    const clipsReady = state.step === 3 && state.onSlide;
    $('#fp-clip-red')?.classList.toggle('fp-dim', !clipsReady || state.clipPos);
    $('#fp-clip-black')?.classList.toggle('fp-dim', !clipsReady || state.clipNeg);
    $('#fp-drop-zone')?.classList.toggle(
      'hidden',
      !(state.step === 1 && state.paper && !state.dryPlaced)
    );

    // Voltage dial + power once both clips are on
    const canPower = state.step === 3 && state.clipPos && state.clipNeg;
    syncVoltageUI(canPower);

    const powerBtn = $('#fp-btn-power');
    const powerLbl = $('#fp-btn-power-label');
    powerBtn?.classList.toggle('hidden', !canPower);
    if (powerLbl) {
      powerLbl.textContent = state.powerOn
        ? 'Switch off'
        : voltageOk()
          ? `Switch on ${TARGET_VOLTAGE} V`
          : 'Switch on';
    }
    powerBtn?.classList.toggle('bg-emerald-600', !state.powerOn && voltageOk());
    powerBtn?.classList.toggle('hover:bg-emerald-700', !state.powerOn && voltageOk());
    powerBtn?.classList.toggle('bg-amber-600', !state.powerOn && !voltageOk());
    powerBtn?.classList.toggle('hover:bg-amber-700', !state.powerOn && !voltageOk());
    powerBtn?.classList.toggle('bg-slate-600', state.powerOn);
    powerBtn?.classList.toggle('hover:bg-slate-700', state.powerOn);
    layoutPowerHit();
  }

  function syncVoltageUI(canPower) {
    const panel = $('#fp-voltage-panel');
    const slider = $('#fp-voltage');
    const panelVal = $('#fp-voltage-panel-value');
    const hint = $('#fp-voltage-panel-hint');
    const meter = $('#fp-voltage-readout');
    const ok = voltageOk();

    panel?.classList.toggle('hidden', !canPower);
    if (slider && String(slider.value) !== String(state.voltage)) {
      slider.value = String(state.voltage);
    }
    if (slider) {
      slider.setAttribute('aria-valuenow', String(state.voltage));
      slider.disabled = false;
    }
    if (panelVal) {
      panelVal.textContent = `${state.voltage} V`;
      panelVal.classList.toggle('fp-voltage-panel-value--ok', ok);
    }
    if (hint) {
      if (state.powerOn && ok) {
        hint.textContent = `${TARGET_VOLTAGE} V applied — observe ion migration.`;
        hint.classList.add('fp-voltage-panel-hint--ok');
      } else if (ok) {
        hint.innerHTML = `Correct — <strong>${TARGET_VOLTAGE} V</strong>. Now switch on the POWER rocker.`;
        hint.classList.add('fp-voltage-panel-hint--ok');
      } else {
        hint.innerHTML = `Adjust to the appropriate voltage: <strong>${TARGET_VOLTAGE} V</strong>`;
        hint.classList.remove('fp-voltage-panel-hint--ok');
      }
    }
    if (meter) {
      const num = $('#fp-voltage-readout-num');
      if (num) num.textContent = `${state.voltage.toFixed(1)}`;
      const amp = $('#fp-current-readout-num');
      if (amp) {
        // Output ON at the set voltage → show a sensible lab current; OFF → 0.00 A
        amp.textContent = state.powerOn && state.voltage > 0 ? '5.00' : '0.00';
      }
      meter.classList.toggle('fp-voltage-readout--visible', canPower);
      meter.classList.toggle('fp-voltage-readout--ok', ok && !state.powerOn);
      meter.classList.toggle('fp-voltage-readout--on', state.powerOn);
      meter.setAttribute('aria-hidden', canPower ? 'false' : 'true');
    }
  }

  function setVoltage(v) {
    const next = Math.max(0, Math.min(30, Math.round(Number(v) || 0)));
    const prev = state.voltage;
    state.voltage = next;
    if (state.powerOn && next !== TARGET_VOLTAGE) {
      // Keep output on but stop “correct” run messaging; student must return to 20 V
      showWarning(`Set the voltage back to ${TARGET_VOLTAGE} V for this experiment.`, 2200);
    } else if (!state.powerOn && next === TARGET_VOLTAGE && prev !== TARGET_VOLTAGE) {
      showWarning(`Voltage set to ${TARGET_VOLTAGE} V — now switch on the d.c. supply.`, 2200);
    }
    updateUI();
  }

  function updateSpatulaCrystals() {
    const pile = $('#fp-spatula-crystals');
    if (!pile) return;
    const load = Math.max(0, Math.min(1, state.spatulaLoad));
    pile.style.setProperty('--load', String(load));
    pile.style.setProperty('--load-opacity', String(load < CRYSTAL_VISIBLE ? 0 : 0.55 + load * 0.45));
    pile.classList.toggle('hidden', load < CRYSTAL_VISIBLE);
  }

  function updateDropperVisual() {
    const el = $('#fp-dropper');
    if (!el) return;
    const fill = Math.max(0, Math.min(1, state.dropperFill));
    el.style.setProperty('--fill', String(fill));
    el.classList.toggle('fp-dropper--filled', fill > 0.05);
  }

  /** Progressive wet look while dropper moistens the strip. */
  function updatePaperSoakVisual() {
    if (!state.paper?.el) return;
    const wetImg = state.paper.el.querySelector('.fp-paper-img--wet');
    const dryImg = state.paper.el.querySelector('.fp-paper-img--dry');
    if (!wetImg || !dryImg) return;
    if (state.paper.wet) {
      wetImg.classList.remove('hidden');
      dryImg.classList.add('hidden');
      wetImg.style.opacity = '1';
      dryImg.style.opacity = '';
      return;
    }
    const soak = state.paper.soak || 0;
    if (soak > 0.02) {
      wetImg.classList.remove('hidden');
      wetImg.style.opacity = String(Math.min(1, soak * 1.05));
      dryImg.style.opacity = String(Math.max(0.15, 1 - soak * 0.85));
    } else {
      wetImg.classList.add('hidden');
      wetImg.style.opacity = '';
      dryImg.style.opacity = '';
    }
  }

  function spawnDropSplash(x, y) {
    if (!state.stage) return;
    const d = document.createElement('div');
    d.className = 'fp-drop-splash';
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    d.style.transform = 'translate(-50%, -50%)';
    state.stage.appendChild(d);
    setTimeout(() => d.remove(), 480);
  }

  function newPaperEl() {
    const el = document.createElement('div');
    el.className = 'fp-prop fp-paper';
    el.dataset.kind = 'paper';
    el.innerHTML = `
      <img class="fp-paper-img fp-paper-img--dry" src="./assets/fp-filter-paper.png?v=8" alt="Filter paper" draggable="false" />
      <img class="fp-paper-img fp-paper-img--wet hidden" src="./assets/fp-filter-paper-wet.png?v=8" alt="Wet filter paper" draggable="false" />
      <div class="fp-center-target hidden" title="Place crystals here"></div>
      <div class="fp-spot-diffuse hidden" aria-hidden="true"></div>
      <div class="fp-spot-trail hidden" aria-hidden="true"></div>
      <div class="fp-spot hidden"></div>
    `;
    return el;
  }

  /**
   * World position of the forceps tips (serrated left end of the asset).
   * Grab / dip hit-tests MUST use this — not the tool centre.
   */
  function forcepsTip(cx, cy, rotDeg = 0, el) {
    const fW = el?.offsetWidth || 120;
    const fH = el?.offsetHeight || 36;
    // Tips sit at the far left of the PNG, slightly below the mid-line
    const localX = -fW * 0.48;
    const localY = fH * 0.06;
    const rad = (rotDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: cx + localX * cos - localY * sin,
      y: cy + localX * sin + localY * cos,
    };
  }

  function forcepsDragRot() {
    return state.drag?.id === 'forceps' ? -20 : 0;
  }

  function spatulaDragRot() {
    return state.drag?.id === 'spatula' ? 10 : 0;
  }

  function dropperDragRot() {
    return state.drag?.id === 'dropper' ? 28 : 12;
  }

  /**
   * World position of the transfer-pipette tip (lower-right of the asset).
   * Fill / dispense hit-tests MUST use this — not the bulb centre.
   */
  function dropperTip(cx, cy, rotDeg = 0, el) {
    const fW = el?.offsetWidth || 150;
    const fH = el?.offsetHeight || 95;
    // Tip sits toward the lower-right corner of the PNG
    const localX = fW * 0.46;
    const localY = fH * 0.40;
    const rad = (rotDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: cx + localX * cos - localY * sin,
      y: cy + localX * sin + localY * cos,
    };
  }

  /**
   * World position of the spatula scooping blade tip (left paddle of the asset).
   * Crystal pile CSS sits on this end — scoop / drop must use the tip, not the shaft.
   */
  function spatulaTip(cx, cy, rotDeg = 0, el) {
    const fW = el?.offsetWidth || 140;
    const fH = el?.offsetHeight || 28;
    // Left blade tip (matches .fp-spatula-crystals near left: 18%)
    const localX = -fW * 0.44;
    const localY = fH * 0.12;
    const rad = (rotDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: cx + localX * cos - localY * sin,
      y: cy + localX * sin + localY * cos,
    };
  }

  /** True when the tip (not the middle) overlaps a paper element. */
  function tipTouchesEl(tip, el, pad = 8) {
    return inZone(tip.x, tip.y, el, pad);
  }

  /** Grip filter paper by a short end at the forceps tips (not the middle). */
  function placePaperInForceps(forcepsX, forcepsY, swingDeg = 0) {
    if (!state.paper?.el || !state.drag?.el) return;
    const pW = state.paper.el.offsetWidth || 64;
    const tip = forcepsTip(forcepsX, forcepsY, forcepsDragRot(), state.drag.el);
    // Paper's RIGHT short edge sits in the tips; strip extends leftward
    const paperCx = tip.x - pW * 0.42;
    const paperCy = tip.y + (state.paper.wet ? 4 : 2);
    placeEl(state.paper.el, paperCx, paperCy, swingDeg * 0.35);
  }

  function placeEl(el, x, y, rot = 0) {
    if (!el) return;
    el.classList.remove('fp-tool-parked');
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transformOrigin = '';
    el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
    el.dataset.rot = String(rot);
    el.dataset.cx = String(x);
    el.dataset.cy = String(y);
    el.dataset.parked = '0';
  }

  /**
   * Parked: one photoreal wired supply (chassis + curled leads + crocs).
   * In use: plain / plain-on chassis + draggable clip sprites + live SVG cables.
   */
  function syncSupplyLeads() {
    const supply = $('#fp-supply');
    const img = $('#fp-supply-img');
    const leads = $('#fp-supply-leads');
    const red = $('#fp-clip-red');
    const black = $('#fp-clip-black');
    if (!supply || !img) return;

    const draggingClip =
      state.drag && (state.drag.id === 'clip-red' || state.drag.id === 'clip-black');
    const clipsAway = !!(state.clipPos || state.clipNeg || draggingClip);
    const wired = !clipsAway;

    supply.classList.toggle('fp-supply--wired', wired);
    // Leads are baked into the wired photo — keep the old overlay hidden
    if (leads) leads.classList.add('hidden');

    let next;
    if (wired) {
      next = './assets/fp-dc-supply-wired.png?v=12';
    } else if (state.powerOn) {
      next = './assets/fp-dc-supply-plain-on.png?v=8';
    } else {
      next = './assets/fp-dc-supply-plain.png?v=8';
    }
    if (img.getAttribute('src') !== next) {
      img.src = next;
      img.onload = () => {
        layoutPowerHit();
        layoutCables();
      };
    }
    layoutPowerHit();

    const clipsReady = state.step === 3 && state.onSlide;
    // Wired photo shows crocs; when ready to drag, reveal sprites on those ends
    if (red) {
      red.classList.remove('hidden');
      if (state.clipPos) {
        red.style.opacity = '';
        red.style.pointerEvents = '';
      } else if (wired && clipsReady) {
        red.style.opacity = '1';
        red.style.pointerEvents = 'auto';
      } else if (wired) {
        red.style.opacity = '0';
        red.style.pointerEvents = 'none';
      } else {
        red.style.opacity = '';
        red.style.pointerEvents = clipsReady ? 'auto' : 'none';
      }
    }
    if (black) {
      black.classList.remove('hidden');
      if (state.clipNeg) {
        black.style.opacity = '';
        black.style.pointerEvents = '';
      } else if (wired && clipsReady) {
        black.style.opacity = '1';
        black.style.pointerEvents = 'auto';
      } else if (wired) {
        black.style.opacity = '0';
        black.style.pointerEvents = 'none';
      } else {
        black.style.opacity = '';
        black.style.pointerEvents = clipsReady ? 'auto' : 'none';
      }
    }
    layoutCables();
  }

  /** Binding-post centres on the plain three-quarter supply photo (fractions of the element). */
  const SUPPLY_TERM = {
    red: { fx: 0.565, fy: 0.779 },
    black: { fx: 0.652, fy: 0.772 },
  };

  function supplyTerminalPoint(side) {
    const supply = $('#fp-supply');
    if (!supply || !state.stage) return null;
    const s = supply.getBoundingClientRect();
    const st = state.stage.getBoundingClientRect();
    if (!s.width || !s.height) return null;
    const t = SUPPLY_TERM[side] || SUPPLY_TERM.red;
    const sx = ((s.left - st.left) / st.width) * state.stage.clientWidth;
    const sy = ((s.top - st.top) / st.height) * state.stage.clientHeight;
    const sw = (s.width / st.width) * state.stage.clientWidth;
    const sh = (s.height / st.height) * state.stage.clientHeight;
    return { x: sx + t.fx * sw, y: sy + t.fy * sh };
  }

  /**
   * Cable leaves the clip at the stub (+X local); jaws face −X.
   * Use dataset centre (not AABB) so rotation does not skew the stub.
   */
  function clipCablePoint(el) {
    if (!el || !state.stage) return null;
    const cx = parseFloat(el.dataset.cx);
    const cy = parseFloat(el.dataset.cy);
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
    const rot = ((parseFloat(el.dataset.rot || '0') || 0) * Math.PI) / 180;
    const stub = (el.offsetWidth || 90) * 0.40;
    return {
      x: cx + Math.cos(rot) * stub,
      y: cy + Math.sin(rot) * stub,
    };
  }

  /**
   * Slack cable terminal → clip stub.
   * Always sags DOWN onto the bench (no floating arches over the apparatus).
   */
  function cablePath(from, to, side) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    // Leave the banana plug almost straight out of the post for the first ~12%
    const leave = side === 'red' ? -18 : -10; // slightly left/down out of the hole
    const p0x = from.x + leave * 0.15;
    const p0y = from.y + 6;
    // Hang on the countertop below both endpoints
    const sag = Math.min(85, Math.max(32, len * 0.28));
    const baseY = Math.max(from.y, to.y) + sag;
    const c1x = from.x + dx * 0.22;
    const c1y = baseY;
    const c2x = from.x + dx * 0.68;
    const c2y = baseY - sag * 0.15;
    // Ease into the clip stub from below/behind so red (stub faces away) still looks continuous
    return (
      `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} ` +
      `L ${p0x.toFixed(1)} ${p0y.toFixed(1)} ` +
      `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
    );
  }

  function layoutCables() {
    const svg = $('#fp-cables');
    const redP = $('#fp-cable-red');
    const blkP = $('#fp-cable-black');
    const redPlug = $('#fp-plug-red');
    const blkPlug = $('#fp-plug-black');
    if (!svg || !redP || !blkP) return;

    const draggingRed = state.drag?.id === 'clip-red';
    const draggingBlack = state.drag?.id === 'clip-black';
    // Parked photoreal wired photo — do not overlay anything
    const parked = !state.clipPos && !state.clipNeg && !draggingRed && !draggingBlack;
    svg.classList.toggle('fp-cables--hidden', parked);
    svg.style.display = parked ? 'none' : 'block';

    if (parked) {
      redP.setAttribute('d', '');
      blkP.setAttribute('d', '');
      if (redPlug) redPlug.setAttribute('visibility', 'hidden');
      if (blkPlug) blkPlug.setAttribute('visibility', 'hidden');
      return;
    }

    const W = state.stage?.clientWidth || 0;
    const H = state.stage?.clientHeight || 0;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));

    const placePlug = (el, pt) => {
      if (!el) return;
      if (!pt) {
        el.setAttribute('visibility', 'hidden');
        return;
      }
      el.setAttribute('visibility', 'visible');
      el.setAttribute('cx', pt.x.toFixed(1));
      el.setAttribute('cy', pt.y.toFixed(1));
    };

    // Both clip sprites are visible once the parked photo swaps away — cable each one
    const redTerm = supplyTerminalPoint('red');
    const blkTerm = supplyTerminalPoint('black');
    const redEnd = clipCablePoint($('#fp-clip-red'));
    const blkEnd = clipCablePoint($('#fp-clip-black'));

    redP.setAttribute('d', redTerm && redEnd ? cablePath(redTerm, redEnd, 'red') : '');
    blkP.setAttribute('d', blkTerm && blkEnd ? cablePath(blkTerm, blkEnd, 'black') : '');
    placePlug(redPlug, redTerm);
    placePlug(blkPlug, blkTerm);
  }

  /** Match filter paper to the diagonal glass-slide photo (PCA of asset ≈ 13.4°). */
  const SLIDE_PAPER_ROT = 13.4;

  function paperRotDeg() {
    if (!state.paper?.el) return 0;
    return parseFloat(state.paper.el.dataset.rot || '0') || 0;
  }

  /** Point along the paper’s long axis (local X), accounting for rotation. */
  function paperAxisPoint(localX, localY = 0) {
    const pc = elCenter(state.paper.el);
    const rad = (paperRotDeg() * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: pc.x + localX * cos - localY * sin,
      y: pc.y + localX * sin + localY * cos,
    };
  }

  function endOccupiedBy(end) {
    if (state.clipPos && state.clipPosEnd === end) return 'red';
    if (state.clipNeg && state.clipNegEnd === end) return 'black';
    return null;
  }

  /**
   * Clamp a croco onto a paper end (follows paper rotation on the slide).
   * Clip art: metal jaws on −X, cable stub on +X.
   * end: 'left' | 'right' — polarity is independent of which end.
   */
  function clampClipOnPaper(el, end) {
    if (!el || !state.paper?.el) return;
    const pW = state.paper.el.offsetWidth || 64;
    const cW = el.offsetWidth || 90;
    const jaw = cW * 0.46;
    const bite = Math.max(5, Math.min(10, pW * 0.14));
    const rot = paperRotDeg();
    const rad = (rot * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const pc = elCenter(state.paper.el);
    el.classList.add('fp-clip--attached');
    if (end === 'left') {
      // Jaws face along +paper axis into the left end
      const tipLocalX = -pW / 2 + bite;
      placeEl(el, pc.x + (tipLocalX - jaw) * cos, pc.y + (tipLocalX - jaw) * sin, rot + 180);
    } else {
      // Jaws face along −paper axis into the right end
      const tipLocalX = pW / 2 - bite;
      placeEl(el, pc.x + (tipLocalX + jaw) * cos, pc.y + (tipLocalX + jaw) * sin, rot);
    }
  }

  /** Drop a clip onto the nearer free paper end. polarity: 'pos' | 'neg'. */
  function tryClampClipAtDrop(el, polarity, drop) {
    if (!el || !state.paper?.el) return false;
    const pW = state.paper.el.offsetWidth || 64;
    const leftEnd = paperAxisPoint(-pW * 0.45);
    const rightEnd = paperAxisPoint(pW * 0.45);
    const thresh = Math.max(48, pW * 0.85);
    const dL = dist(drop, leftEnd);
    const dR = dist(drop, rightEnd);
    if (dL >= thresh && dR >= thresh) return false;

    const end = dL <= dR ? 'left' : 'right';
    const self = polarity === 'pos' ? 'red' : 'black';
    const occ = endOccupiedBy(end);
    if (occ && occ !== self) {
      showWarning('That end already has a clip — clamp this one on the opposite end.', 2200);
      return false;
    }

    if (polarity === 'pos') {
      state.clipPos = true;
      state.clipPosEnd = end;
    } else {
      state.clipNeg = true;
      state.clipNegEnd = end;
    }
    clampClipOnPaper(el, end);
    const label = polarity === 'pos' ? 'Positive (red)' : 'Negative (black)';
    if (state.clipPos && state.clipNeg) {
      showWarning(
        `Both clips connected. Adjust the d.c. voltage to ${TARGET_VOLTAGE} V, then switch on.`,
        3200
      );
    } else {
      showWarning(`${label} clip clamped on the ${end} end.`, 1600);
    }
    return true;
  }

  /**
   * Park a tool so its working tip rests on the black benchtop (not mid-air / wall).
   * tipLocal: offset of tip from element centre at rot=0 (same space as tip helpers).
   */
  function parkToolTipOnBench(el, tipX, tipY, rotDeg, tipLocal) {
    if (!el) return;
    const rad = (rotDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const ox = tipLocal.x * cos - tipLocal.y * sin;
    const oy = tipLocal.x * sin + tipLocal.y * cos;
    placeEl(el, tipX - ox, tipY - oy, rotDeg);
  }

  function homeTools() {
    if (!state.stage) return;
    const W = state.stage.clientWidth || 900;
    const H = state.stage.clientHeight || 500;

    /*
      Park pose (no 3D distort): normal 2D rotate only.
      Left → right on the black benchtop: spatula | forceps | dropper | gap | beaker
      Long axes parallel to the left wall (front → back of bench).
    */
    const midBenchY = H * 0.585;
    placeEl($('#fp-spatula'), W * 0.070, midBenchY, -63);
    placeEl($('#fp-forceps'), W * 0.118, midBenchY, 90);
    placeEl($('#fp-dropper'), W * 0.166, midBenchY, 58);

    // Align grab sprites with crocs in the wired supply photo (lower-left)
    if (!state.clipPos) {
      $('#fp-clip-red')?.classList.remove('fp-clip--attached');
      placeEl($('#fp-clip-red'), W * 0.58, H * 0.68, -6);
    }
    if (!state.clipNeg) {
      $('#fp-clip-black')?.classList.remove('fp-clip--attached');
      placeEl($('#fp-clip-black'), W * 0.64, H * 0.70, 4);
    }
    syncSupplyLeads();
  }

  function stagePoint(e) {
    const rect = state.stage.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * state.stage.clientWidth,
      y: ((e.clientY - rect.top) / rect.height) * state.stage.clientHeight,
    };
  }

  function inZone(x, y, zoneEl, pad = 0) {
    if (!zoneEl || zoneEl.classList.contains('hidden')) return false;
    const r = zoneEl.getBoundingClientRect();
    const s = state.stage.getBoundingClientRect();
    const left = (r.left - s.left) / s.width * state.stage.clientWidth - pad;
    const right = (r.right - s.left) / s.width * state.stage.clientWidth + pad;
    const top = (r.top - s.top) / s.height * state.stage.clientHeight - pad;
    const bottom = (r.bottom - s.top) / s.height * state.stage.clientHeight + pad;
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function elCenter(el) {
    const r = el.getBoundingClientRect();
    const s = state.stage.getBoundingClientRect();
    return {
      x: ((r.left + r.width / 2) - s.left) / s.width * state.stage.clientWidth,
      y: ((r.top + r.height / 2) - s.top) / s.height * state.stage.clientHeight,
    };
  }

  function resetLab(keepCount) {
    if (!keepCount) state.papersLeft = 3;
    if (state.paper?.el) state.paper.el.remove();
    state.paper = null;
    state.drag = null;
    state.dryPlaced = false;
    state.soakedPlaced = false;
    state.crystalOk = false;
    state.onSlide = false;
    state.clipPos = false;
    state.clipNeg = false;
    state.clipPosEnd = null;
    state.clipNegEnd = null;
    state.powerOn = false;
    state.voltage = 0;
    state.migrate = 0;
    state.diffuse = 0;
    state.spatulaLoad = 0;
    state.dropperFill = 0;

    homeTools();
    $('#fp-clip-red')?.classList.remove('hidden');
    $('#fp-clip-black')?.classList.remove('hidden');
    $('#fp-beaker-zone')?.classList.remove('fp-zone--active');
    updatePaperStack();
    updateUI();
  }

  function updatePaperStack() {
    const stack = $('#fp-paper-stack');
    if (!stack) return;
    stack.innerHTML = '';
    const n = Math.min(state.papersLeft, 3);
    for (let i = 0; i < n; i++) {
      const img = document.createElement('img');
      img.src = './assets/fp-filter-paper.png?v=8';
      img.alt = '';
      img.draggable = false;
      img.className = 'fp-stack-sheet';
      img.style.transform = `translate(${i * 1.5}px, ${-i * 1.5}px) rotate(${-1 + i * 0.5}deg)`;
      stack.appendChild(img);
    }
  }

  function losePaper(msg) {
    if (state.paper?.el) {
      state.paper.el.classList.add('fp-paper--fly');
      const el = state.paper.el;
      setTimeout(() => el.remove(), 700);
    }
    // Drop any in-progress drag (forceps may still have .fp-dragging)
    if (state.drag?.el) state.drag.el.classList.remove('fp-dragging');
    $$('.fp-dragging').forEach((el) => el.classList.remove('fp-dragging'));
    state.paper = null;
    state.drag = null;
    state.dryPlaced = false;
    state.soakedPlaced = false;
    state.crystalOk = false;
    state.onSlide = false;
    state.clipPos = false;
    state.clipNeg = false;
    state.clipPosEnd = null;
    state.clipNegEnd = null;
    state.powerOn = false;
    state.voltage = 0;
    state.migrate = 0;
    state.diffuse = 0;
    state.spatulaLoad = 0;
    state.dropperFill = 0;
    // Stack pickup / forceps grab only work in step 1 — rewind so a new strip can be taken
    if (state.papersLeft > 0) {
      state.step = 1;
    }
    homeTools();
    updateSpatulaCrystals();
    updateDropperVisual();
    updatePaperStack();
    updateUI();
    if (state.papersLeft <= 0) {
      showWarning('No filter papers left. Press Restart.', 4000);
    } else {
      showWarning(`${msg} Use the forceps to take another dry strip from the stack and moisten it with the dropper.`, 3800);
    }
  }

  function spawnPaperAt(x, y) {
    const el = newPaperEl();
    state.stage.appendChild(el);
    state.paper = {
      el,
      wet: false,
      soak: 0,
      spot: 0,
      held: true,
      swing: 0,
      swingV: 0,
    };
    state.dryPlaced = false;
    placeEl(el, x, y, 0);
    state.papersLeft--;
    updatePaperStack();
    updateUI();
  }

  function setPaperWet(wet) {
    if (!state.paper) return;
    state.paper.wet = wet;
    state.paper.el.classList.toggle('fp-paper--wet', wet);
    state.paper.el.querySelector('.fp-paper-img--dry')?.classList.toggle('hidden', wet);
    state.paper.el.querySelector('.fp-paper-img--wet')?.classList.toggle('hidden', !wet);
  }

  /* ---------- Pointer ---------- */

  let lastPowerToggleAt = 0;

  function supplyClickFrac(clientX, clientY, supply) {
    const r = supply.getBoundingClientRect();
    if (!r.width || !r.height) return { fx: -1, fy: -1, inBox: false };
    const fx = (clientX - r.left) / r.width;
    const fy = (clientY - r.top) / r.height;
    return { fx, fy, inBox: fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1 };
  }

  /** Force POWER hit-target onto the rocker (inline styles beat any stale CSS cache). */
  function layoutPowerHit() {
    const supply = $('#fp-supply');
    const btn = $('#fp-power-switch');
    if (!supply || !btn) return;
    const armed = state.step === 3 && state.clipPos && state.clipNeg;
    const wired = supply.classList.contains('fp-supply--wired');
    // Wired greenscreen photo: rocker ≈ 43–47% × 58–65%. Plain: ≈ 27.5–36.5% × 79.5–92%
    const box = wired
      ? { left: '43%', top: '58%', width: '7%', height: '10%' }
      : { left: '27.5%', top: '79.5%', width: '9.5%', height: '12.5%' };
    btn.style.setProperty('left', box.left, 'important');
    btn.style.setProperty('top', box.top, 'important');
    btn.style.setProperty('width', box.width, 'important');
    btn.style.setProperty('height', box.height, 'important');
    btn.style.setProperty('right', 'auto', 'important');
    btn.style.setProperty('bottom', 'auto', 'important');
    btn.classList.toggle('fp-power-switch--armed', armed && !state.powerOn);
    supply.classList.toggle('fp-supply--armed', armed);
    btn.style.pointerEvents = 'auto';
  }

  /** Coordinate hit-test for the POWER rocker. */
  function isPowerRockerAt(clientX, clientY) {
    const supply = $('#fp-supply');
    if (!supply) return false;
    const { fx, fy, inBox } = supplyClickFrac(clientX, clientY, supply);
    if (!inBox) return false;
    const wired = supply.classList.contains('fp-supply--wired');
    if (state.step === 3 && state.clipPos && state.clipNeg) {
      if (wired) return fx >= 0.40 && fx <= 0.52 && fy >= 0.54 && fy <= 0.70;
      return fx >= 0.24 && fx <= 0.40 && fy >= 0.76 && fy <= 0.94;
    }
    if (wired) return fx >= 0.42 && fx <= 0.50 && fy >= 0.56 && fy <= 0.68;
    return fx >= 0.26 && fx <= 0.38 && fy >= 0.78 && fy <= 0.92;
  }

  function applyPowerToggle() {
    const now = performance.now();
    if (now - lastPowerToggleAt < 350) return;
    lastPowerToggleAt = now;
    if (state.step === 3 && state.clipPos && state.clipNeg) {
      if (!state.powerOn && !voltageOk()) {
        showWarning(
          `Set the d.c. supply to ${TARGET_VOLTAGE} V first (now ${state.voltage} V), then switch on.`,
          2800
        );
        updateUI();
        return;
      }
      state.powerOn = !state.powerOn;
      if (state.powerOn) {
        // Resume directed migration; keep any diffusion already accumulated (do not shrink back)
        showWarning(`d.c. supply on — ${TARGET_VOLTAGE} V applied across the paper.`, 2000);
      } else {
        // Keep migrate route; diffusion grows gradually from current value (no jump)
        showWarning('d.c. supply off — ions diffuse slowly in all directions (trail remains).', 2600);
      }
      updateUI();
    } else if (state.step === 3) {
      showWarning('Connect both crocodile clips before switching on.');
    } else {
      showWarning('Finish the paper setup and connect both clips before switching on.');
    }
  }

  function tryTogglePower(e) {
    // Never steal pointer from voltage dial / tools / clips
    if (e.target?.closest?.('#fp-voltage-panel, .fp-clip, .fp-forceps, .fp-spatula, .fp-dropper, .fp-paper')) {
      return false;
    }
    const onBtn = e.target?.id === 'fp-power-switch' || e.target?.closest?.('#fp-power-switch');
    const onUiBtn = e.target?.id === 'fp-btn-power' || e.target?.closest?.('#fp-btn-power');
    if (!onBtn && !onUiBtn && !isPowerRockerAt(e.clientX, e.clientY)) return false;
    e.preventDefault?.();
    e.stopPropagation?.();
    applyPowerToggle();
    return true;
  }

  function onDown(e) {
    if (!state.stage) return;

    // Power rocker first — coordinate test works even if the click fell through to the stage
    if (tryTogglePower(e)) return;

    const t = e.target.closest('.fp-prop, .fp-stack, #fp-power-switch, #fp-supply');
    if (!t) return;

    // Stack → need forceps in hand first (or pick forceps then stack)
    if (t.classList.contains('fp-stack') || t.closest('.fp-stack')) {
      if (state.step === 1 && state.drag && state.drag.id === 'forceps' && !state.paper && state.papersLeft > 0) {
        const p = stagePoint(e);
        const tip = forcepsTip(p.x, p.y, forcepsDragRot(), state.drag.el);
        spawnPaperAt(tip.x, tip.y);
        state.drag.holdingPaper = true;
        placePaperInForceps(p.x, p.y, 0);
      } else if (state.step === 1) {
        showWarning('Pick up the forceps first, then grab a filter paper from the stack.');
      }
      return;
    }

    const prop = t.closest('.fp-prop');
    if (!prop) return;

    if (prop.dataset.kind === 'paper' && state.drag && state.drag.id === 'forceps') {
      state.drag.holdingPaper = true;
      state.paper.held = true;
      return;
    }

    if (prop.id === 'fp-forceps' && (state.step === 1 || state.step === 3)) {
      if (state.step === 1 && state.dryPlaced && state.paper && !state.paper.wet) {
        showWarning('Paper is on the mat — use the dropper to moisten it with Na₂SO₄(aq).');
        return;
      }
      state.drag = { id: 'forceps', el: prop, holdingPaper: false };
      prop.classList.add('fp-dragging');
    } else if (prop.id === 'fp-dropper' && state.step === 1) {
      if (!state.dryPlaced || !state.paper) {
        showWarning('Place a dry filter paper on the bench mat first, then use the dropper.');
        return;
      }
      if (state.paper.wet) {
        showWarning('Paper is already soaked — scoop KMnO₄ next.');
        return;
      }
      state.drag = { id: 'dropper', el: prop };
      prop.classList.add('fp-dragging');
    } else if (prop.id === 'fp-spatula' && state.step === 2) {
      state.drag = { id: 'spatula', el: prop };
      prop.classList.add('fp-dragging');
      // Keep load if already scooped; only clear when empty re-pick after spill
      if (state.spatulaLoad < CRYSTAL_VISIBLE) state.spatulaLoad = 0;
      updateSpatulaCrystals();
    } else if (prop.id === 'fp-clip-red') {
      if (state.step === 3 && state.onSlide && !state.clipPos) {
        state.drag = { id: 'clip-red', el: prop };
        prop.classList.add('fp-dragging');
        prop.style.opacity = '';
        syncSupplyLeads();
      } else if (state.step < 3 || !state.onSlide) {
        showWarning('Place the moist paper on the slide first, then connect the crocodile clips.');
      }
    } else if (prop.id === 'fp-clip-black') {
      if (state.step === 3 && state.onSlide && !state.clipNeg) {
        state.drag = { id: 'clip-black', el: prop };
        prop.classList.add('fp-dragging');
        prop.style.opacity = '';
        syncSupplyLeads();
      } else if (state.step < 3 || !state.onSlide) {
        showWarning('Place the moist paper on the slide first, then connect the crocodile clips.');
      }
    } else if (prop.dataset.kind === 'paper' && state.step === 1 && state.paper && !state.paper.held) {
      // pick loose paper only with forceps
      showWarning('Use the forceps to handle the filter paper.');
    }

    const p = stagePoint(e);
    state.last = { x: p.x, y: p.y, t: performance.now() };
    e.preventDefault();
  }

  function onMove(e) {
    if (!state.drag) return;
    const p = stagePoint(e);
    const now = performance.now();
    const dt = Math.max(0.008, (now - state.last.t) / 1000);
    const vx = (p.x - state.last.x) / dt;
    const vy = (p.y - state.last.y) / dt;
    const speed = Math.hypot(vx, vy);

    const dragRot =
      state.drag.id === 'forceps'
        ? -20
        : state.drag.id === 'spatula'
          ? 10
          : state.drag.id === 'dropper'
            ? dropperDragRot()
            : 0;
    placeEl(state.drag.el, p.x, p.y, dragRot);

    // Tip position (not tool centre) for forceps / dropper contact checks
    const tip =
      state.drag.id === 'forceps'
        ? forcepsTip(p.x, p.y, dragRot, state.drag.el)
        : state.drag.id === 'dropper'
          ? dropperTip(p.x, p.y, dragRot, state.drag.el)
          : p;

    // Auto-grab from stack when TIPS touch the stack
    if (state.drag.id === 'forceps' && state.step === 1 && !state.drag.holdingPaper && !state.paper && state.papersLeft > 0) {
      if (tipTouchesEl(tip, $('#fp-paper-stack'), 12)) {
        spawnPaperAt(tip.x, tip.y);
        state.drag.holdingPaper = true;
        placePaperInForceps(p.x, p.y, 0);
      }
    }

    // Re-grab loose / bench paper when TIPS touch the strip
    if (state.drag.id === 'forceps' && state.paper && !state.drag.holdingPaper) {
      if (tipTouchesEl(tip, state.paper.el, 10)) {
        state.drag.holdingPaper = true;
        state.paper.held = true;
      }
    }

    if (state.drag.id === 'forceps' && state.drag.holdingPaper && state.paper) {
      state.paper.swingV += (-vx * 0.00012 - state.paper.swing * 10) * dt;
      state.paper.swingV *= 0.9;
      state.paper.swing = Math.max(-1.1, Math.min(1.1, state.paper.swing + state.paper.swingV));
      const droop = state.paper.wet ? 12 + Math.abs(state.paper.swing) * 10 : 4;
      // Hold by the short end at the tips (see placePaperInForceps)
      placePaperInForceps(p.x, p.y, state.paper.swing * 8);
      state.paper.el.style.setProperty('--droop', `${droop}px`);

      // Only fail on extreme swing — allow normal handling
      if (Math.abs(state.paper.swing) > 1.05 || speed > 2200) {
        losePaper('You moved too violently — the filter paper flew off and is unusable. Take a new one.');
        state.last = { x: p.x, y: p.y, t: now };
        return;
      }

      // Soft cue if student tries to dip the strip (wrong technique)
      const zone = $('#fp-beaker-zone');
      const nearBeaker =
        state.step === 1 &&
        !state.paper.wet &&
        (tipTouchesEl(tip, zone, 8) || tipTouchesEl(tip, $('#fp-beaker'), 6));
      zone?.classList.toggle('fp-zone--active', false);
      if (nearBeaker && (!onMove._dipWarn || now - onMove._dipWarn > 2200)) {
        showWarning('Do not dip the filter paper into the beaker — place it dry on the mat, then use the dropper.', 2600);
        onMove._dipWarn = now;
      }
    }

    // Dropper: tip into beaker → fill; tip over dry paper → dispense until soaked
    if (state.drag.id === 'dropper' && state.step === 1 && state.dryPlaced && state.paper && !state.paper.wet) {
      const dTip = tip;
      const zone = $('#fp-beaker-zone');
      const inBeaker =
        tipTouchesEl(dTip, zone, 6) || tipTouchesEl(dTip, $('#fp-beaker'), 4);
      zone?.classList.toggle('fp-zone--active', inBeaker && state.dropperFill < 0.95);
      if (inBeaker) {
        const prev = state.dropperFill;
        state.dropperFill = Math.min(1, state.dropperFill + dt * 0.85);
        if (state.dropperFill > 0.2 && prev <= 0.2) {
          showWarning('Dropper filled with Na₂SO₄(aq) — drip thoroughly onto the filter paper.', 2200);
        }
        updateDropperVisual();
      } else if (state.dropperFill > 0.04 && tipTouchesEl(dTip, state.paper.el, 10)) {
        const prevSoak = state.paper.soak || 0;
        const dispense = Math.min(state.dropperFill, dt * 0.55);
        state.dropperFill = Math.max(0, state.dropperFill - dispense * 1.1);
        state.paper.soak = Math.min(1, prevSoak + dispense * 1.35);
        if (!onMove._splash || now - onMove._splash > 140) {
          spawnDropSplash(dTip.x, dTip.y);
          onMove._splash = now;
        }
        updateDropperVisual();
        updatePaperSoakVisual();
        const fillBar = $('#fp-soak-fill');
        if (fillBar) fillBar.style.width = `${Math.round(state.paper.soak * 100)}%`;
        $('#fp-soak-meter')?.classList.remove('hidden');

        if (state.paper.soak >= 0.98 && !state.paper.wet) {
          setPaperWet(true);
          state.paper.soak = 1;
          state.soakedPlaced = true;
          state.step = 2;
          zone?.classList.remove('fp-zone--active');
          showWarning('Filter paper thoroughly moistened. Scoop a small amount of KMnO₄ next.', 2600);
          homeTools();
          state.drag.el.classList.remove('fp-dragging');
          state.drag = null;
          updateUI();
          return;
        } else if (state.paper.soak > 0.15 && (!onMove._soakTip || now - onMove._soakTip > 2000)) {
          showWarning('Keep dripping until the whole strip looks soaked…', 1800);
          onMove._soakTip = now;
        }
      } else if (state.dropperFill <= 0.04 && tipTouchesEl(dTip, state.paper.el, 10) && (!onMove._empty || now - onMove._empty > 2000)) {
        showWarning('Dropper is empty — draw more Na₂SO₄(aq) from the beaker.', 2000);
        onMove._empty = now;
      }
    }

    if (state.drag.id === 'spatula' && state.step === 2) {
      const sTip = spatulaTip(p.x, p.y, dragRot, state.drag.el);
      const scooping =
        tipTouchesEl(sTip, $('#fp-crystal-zone'), 4) ||
        tipTouchesEl(sTip, $('#fp-watch'), 4);
      if (scooping) {
        const prev = state.spatulaLoad;
        state.spatulaLoad = Math.min(1, state.spatulaLoad + dt * 0.55);
        if (state.spatulaLoad > CRYSTAL_VISIBLE && prev <= CRYSTAL_VISIBLE) {
          showWarning('A small crystal load is ideal — drop onto the moist paper when ready.', 2200);
        }
        updateSpatulaCrystals();
        updateUI();
      }
      if (state.spatulaLoad > 0.12 && speed > 1300) {
        state.spatulaLoad *= 0.4;
        showWarning('Too fast — crystals spilled onto the bench. Scoop carefully.');
        updateSpatulaCrystals();
        updateUI();
      }
    }

    if (state.drag.id === 'clip-red' || state.drag.id === 'clip-black') {
      layoutCables();
    }

    state.last = { x: p.x, y: p.y, t: now };
  }

  /** Where the paper actually is (forceps tips offset), for drop checks. */
  function paperDropPoint(forcepsPos) {
    if (state.paper?.el) {
      return elCenter(state.paper.el);
    }
    return forcepsPos;
  }

  function paperOnBenchMat(forcepsPos) {
    const drop = $('#fp-drop-zone');
    // Temporarily ignore hidden for hit-test if zone was toggled mid-frame
    const wasHidden = drop?.classList.contains('hidden');
    if (wasHidden) drop.classList.remove('hidden');
    const pc = paperDropPoint(forcepsPos);
    const pW = state.paper?.el?.offsetWidth || 64;
    const ok =
      inZone(pc.x, pc.y, drop, 40) ||
      inZone(pc.x + pW * 0.35, pc.y, drop, 40) ||
      inZone(pc.x - pW * 0.35, pc.y, drop, 40) ||
      inZone(forcepsPos.x, forcepsPos.y, drop, 48) ||
      // Anywhere on the black countertop band after soaking
      (pc.y > state.stage.clientHeight * 0.48 &&
        pc.y < state.stage.clientHeight * 0.78 &&
        pc.x > state.stage.clientWidth * 0.28 &&
        pc.x < state.stage.clientWidth * 0.75);
    if (wasHidden) drop.classList.add('hidden');
    return ok;
  }

  function onUp(e) {
    if (!state.drag) return;
    const p = stagePoint(e);
    const drag = state.drag;
    drag.el.classList.remove('fp-dragging');

    if (drag.id === 'forceps' && drag.holdingPaper && state.paper) {
      const pc = paperDropPoint(p);
      if (state.step === 1) {
        // Place DRY paper on the mat first — moistening is done with the dropper
        if (paperOnBenchMat(p)) {
          state.paper.held = false;
          const dz = $('#fp-drop-zone');
          const target = dz && !dz.classList.contains('hidden') ? elCenter(dz) : pc;
          placeEl(state.paper.el, target.x, target.y, -2);
          state.dryPlaced = true;
          showWarning('Dry paper placed. Draw Na₂SO₄(aq) with the dropper and drip until soaked.', 2800);
          homeTools();
          state.drag = null;
          updateUI();
          return;
        }
        state.paper.held = false;
        placeEl(state.paper.el, pc.x, pc.y, 0);
        showWarning('Place the dry strip on the highlighted bench mat.');
      } else if (state.step === 3 && !state.onSlide) {
        const slide = $('#fp-slide');
        const slideOk =
          inZone(pc.x, pc.y, $('#fp-slide-zone'), 20) ||
          inZone(pc.x, pc.y, slide, 12) ||
          inZone(p.x, p.y, slide, 16);
        if (slideOk) {
          const sc = elCenter(slide);
          state.paper.held = false;
          // Sit flush on the glass — same angle as the slide photo
          placeEl(state.paper.el, sc.x, sc.y - 2, SLIDE_PAPER_ROT);
          state.onSlide = true;
          homeTools();
          state.drag = null;
          updateUI();
          return;
        }
        state.paper.held = false;
        placeEl(state.paper.el, pc.x, pc.y, 0);
        showWarning('Place the moist paper onto the glass slide.');
      }
      homeTools();
      state.drag = null;
      updateUI();
      return;
    }

    if (drag.id === 'dropper') {
      homeTools();
      state.drag = null;
      $('#fp-beaker-zone')?.classList.remove('fp-zone--active');
      updateUI();
      return;
    }

    if (drag.id === 'spatula') {
      if (state.paper && state.paper.wet) {
        const tip = spatulaTip(p.x, p.y, spatulaDragRot(), drag.el);
        // Drop when the BLADE TIP touches the moist paper (not the shaft centre)
        const onPaper = tipTouchesEl(tip, state.paper.el, 6);
        if (!onPaper) {
          if (state.spatulaLoad >= CRYSTAL_VISIBLE) {
            showWarning('Drop the crystals onto the moist filter paper.');
          }
        } else if (state.spatulaLoad < CRYSTAL_VISIBLE) {
          showWarning('Scoop a little KMnO₄ from the watch glass first (you should see purple on the spatula).');
        } else {
          // Any visible load is accepted — smaller crystals are preferred in real labs
          state.paper.spot = 0.2;
          state.crystalOk = true;
          state.spatulaLoad = 0;
          updateSpatulaCrystals();
          state.paper.el.querySelector('.fp-center-target')?.classList.add('hidden');
          let t0 = performance.now();
          const tick = (t) => {
            const k = Math.min(1, (t - t0) / 850);
            state.paper.spot = 0.2 + k * 0.75;
            updateUI();
            if (k < 1) requestAnimationFrame(tick);
            else {
              state.step = 3;
              showWarning('Purple spot formed. Transfer the paper onto the slide.', 2500);
              updateUI();
            }
          };
          requestAnimationFrame(tick);
        }
      }
      homeTools();
      state.drag = null;
      updateUI();
      return;
    }

    if (drag.id === 'clip-red' && state.paper && state.onSlide) {
      const W = state.stage.clientWidth;
      const H = state.stage.clientHeight;
      if (!tryClampClipAtDrop(drag.el, 'pos', p)) {
        state.clipPos = false;
        state.clipPosEnd = null;
        drag.el.classList.remove('fp-clip--attached');
        placeEl(drag.el, W * 0.62, H * 0.64, -8);
      }
      state.drag = null;
      updateUI();
      layoutCables();
      return;
    }

    if (drag.id === 'clip-black' && state.paper && state.onSlide) {
      const W = state.stage.clientWidth;
      const H = state.stage.clientHeight;
      if (!tryClampClipAtDrop(drag.el, 'neg', p)) {
        state.clipNeg = false;
        state.clipNegEnd = null;
        drag.el.classList.remove('fp-clip--attached');
        placeEl(drag.el, W * 0.66, H * 0.70, 6);
      }
      state.drag = null;
      updateUI();
      layoutCables();
      return;
    }

    if (drag.id === 'forceps' || drag.id === 'spatula' || drag.id === 'dropper') homeTools();
    state.drag = null;
    updateUI();
  }

  function loop() {
    if (state.crystalOk) {
      if (state.powerOn && voltageOk()) {
        // Directed migration toward red (+) — trail grows; diffusion amount stays frozen
        state.migrate = Math.min(1, state.migrate + 0.0028);
        updateUI();
      } else if (!state.powerOn && state.migrate > 0.01) {
        // Supply OFF: keep migrate trail; slowly diffuse from 0 (no sudden jump)
        state.diffuse = Math.min(1, state.diffuse + 0.00072);
        updateUI();
      }
    }
    state.raf = requestAnimationFrame(loop);
  }

  function begin() {
    state.step = 1;
    resetLab(true);
    updateUI();
  }

  function restart() {
    state.step = 0;
    resetLab(false);
  }

  function init() {
    state.stage = $('#fp-stage');
    if (!state.stage) return;

    state.stage.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    $('#fp-btn-begin')?.addEventListener('click', begin);
    $('#fp-btn-restart')?.addEventListener('click', restart);
    $('#fp-btn-power')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      applyPowerToggle();
    });
    $('#fp-voltage')?.addEventListener('input', (e) => {
      setVoltage(e.target.value);
    });
    $('#fp-voltage')?.addEventListener('pointerdown', (e) => e.stopPropagation());
    $('#fp-voltage-panel')?.addEventListener('pointerdown', (e) => e.stopPropagation());
    $('#fp-power-switch')?.addEventListener('click', (e) => { tryTogglePower(e); });
    $('#fp-supply')?.addEventListener('click', (e) => { tryTogglePower(e); });

    resetLab(false);
    window.addEventListener('resize', () => {
      if (!state.drag) homeTools();
      layoutPowerHit();
      layoutCables();
    });
    if (!state.raf) state.raf = requestAnimationFrame(loop);
  }

  window.FilterPaperLab = {
    init,
    show() {
      if (!state.stage) init();
      homeTools();
      updateUI();
    },
    restart,
    resize() {
      homeTools();
    },
    /** Debug helper */
    getState: () => ({ ...state, paper: !!state.paper }),
    togglePower: applyPowerToggle,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
