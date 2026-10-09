/**
 * Filter Paper · Part 2 — Observation
 * Selectable DSE coloured ions, adjustable d.c. voltage (no animation-speed slider),
 * blurry migration trail toward the attracting electrode.
 */
(function () {
  'use strict';

  /** Shared colour specs for building single / dual compounds */
  const COL = {
    mno4: { ion: 'MnO₄⁻', name: 'permanganate', colourWord: 'purple', color: [120, 30, 150] },
    cr2o7: { ion: 'Cr₂O₇²⁻', name: 'dichromate', colourWord: 'orange', color: [220, 110, 30] },
    cro4: { ion: 'CrO₄²⁻', name: 'chromate', colourWord: 'yellow', color: [230, 200, 40] },
    cu2: { ion: 'Cu²⁺', name: 'copper(II)', colourWord: 'blue', color: [40, 110, 200] },
    ni2: { ion: 'Ni²⁺', name: 'nickel(II)', colourWord: 'green', color: [50, 150, 90] },
    co2: { ion: 'Co²⁺', name: 'cobalt(II)', colourWord: 'pink', color: [210, 90, 140] },
    fe3: { ion: 'Fe³⁺', name: 'iron(III)', colourWord: 'yellow-brown', color: [190, 130, 40] },
  };

  function single(id, label, charge, crystal, key) {
    const c = COL[key];
    return {
      id,
      group: 'one',
      label,
      dual: false,
      ion: c.ion,
      name: c.name,
      colourWord: c.colourWord,
      charge,
      color: c.color,
      crystal,
    };
  }

  function dual(id, label, crystal, catKey, anKey) {
    const cat = COL[catKey];
    const an = COL[anKey];
    return {
      id,
      group: 'both',
      label,
      dual: true,
      crystal,
      cation: { ...cat, charge: +1 },
      anion: { ...an, charge: -1 },
      // mixed seed colour for the central spot
      color: [
        Math.round(cat.color[0] * 0.45 + an.color[0] * 0.55),
        Math.round(cat.color[1] * 0.45 + an.color[1] * 0.55),
        Math.round(cat.color[2] * 0.45 + an.color[2] * 0.55),
      ],
    };
  }

  /** HKDSE-range crystals: one coloured ion, or both cation + anion coloured */
  const IONS = {
    mno4: single('mno4', 'KMnO₄ — MnO₄⁻ (purple)', -1, [40, 0, 50], 'mno4'),
    cr2o7: single('cr2o7', 'K₂Cr₂O₇ — Cr₂O₇²⁻ (orange)', -1, [90, 40, 10], 'cr2o7'),
    cro4: single('cro4', 'K₂CrO₄ — CrO₄²⁻ (yellow)', -1, [160, 130, 10], 'cro4'),
    cu2: single('cu2', 'CuSO₄ — Cu²⁺ (blue)', +1, [20, 50, 110], 'cu2'),
    ni2: single('ni2', 'NiSO₄ — Ni²⁺ (green)', +1, [20, 70, 40], 'ni2'),
    co2: single('co2', 'CoCl₂ — Co²⁺ (pink)', +1, [120, 40, 70], 'co2'),
    fe3: single('fe3', 'FeCl₃ — Fe³⁺ (yellow-brown)', +1, [100, 60, 15], 'fe3'),
    // Both coloured (classic filter-paper / gel demos)
    cucr2o7: dual('cucr2o7', 'CuCr₂O₇ — Cu²⁺ (blue) + Cr₂O₇²⁻ (orange)', [60, 40, 50], 'cu2', 'cr2o7'),
    cucro4: dual('cucro4', 'CuCrO₄ — Cu²⁺ (blue) + CrO₄²⁻ (yellow)', [70, 80, 40], 'cu2', 'cro4'),
    cocr2o7: dual('cocr2o7', 'CoCr₂O₇ — Co²⁺ (pink) + Cr₂O₇²⁻ (orange)', [140, 50, 40], 'co2', 'cr2o7'),
    nicr2o7: dual('nicr2o7', 'NiCr₂O₇ — Ni²⁺ (green) + Cr₂O₇²⁻ (orange)', [50, 80, 30], 'ni2', 'cr2o7'),
    fecro4: dual('fecro4', 'Fe₂(CrO₄)₃ — Fe³⁺ (yellow-brown) + CrO₄²⁻ (yellow)', [150, 100, 25], 'fe3', 'cro4'),
    cumno4: dual('cumno4', 'Cu(MnO₄)₂ — Cu²⁺ (blue) + MnO₄⁻ (purple)', [50, 20, 90], 'cu2', 'mno4'),
  };

  const state = {
    ionId: 'mno4',
    voltage: 20,
    powerOn: false,
    /** true → left end is anode (+); false → right end is anode (+) */
    posOnLeft: true,
    progress: 0, // 0 → 1 directional migration (supply ON)
    diffuse: 0, // 0 → 1 isotropic diffusion (supply OFF)
    lastTs: 0,
    raf: 0,
    ready: false,
  };

  const $ = (sel) => document.querySelector(sel);

  function ion() {
    return IONS[state.ionId] || IONS.mno4;
  }

  /** Screen X sign toward the anode (+) */
  function signTowardAnode() {
    return state.posOnLeft ? -1 : 1;
  }

  /** Screen X sign toward the cathode (−) */
  function signTowardCathode() {
    return -signTowardAnode();
  }

  /** Anions → anode (+); cations → cathode (−). For dual, unused. */
  function migrateSignSingle() {
    const sp = ion();
    if (sp.dual) return signTowardAnode();
    return sp.charge < 0 ? signTowardAnode() : signTowardCathode();
  }

  function populateSelect() {
    const sel = $('#fp2-ion-select');
    if (!sel) return;
    const one = Object.values(IONS).filter((i) => !i.dual);
    const both = Object.values(IONS).filter((i) => i.dual);
    sel.innerHTML =
      `<optgroup label="One coloured ion">${one.map((i) => `<option value="${i.id}">${i.label}</option>`).join('')}</optgroup>` +
      `<optgroup label="Both cation & anion coloured">${both.map((i) => `<option value="${i.id}">${i.label}</option>`).join('')}</optgroup>`;
    sel.value = state.ionId;
  }

  function updateChrome() {
    const vRead = $('#fp2-voltage-readout');
    if (vRead) vRead.textContent = `${state.voltage} V`;
    const volt = $('#fp2-voltage');
    if (volt && String(volt.value) !== String(state.voltage)) volt.value = String(state.voltage);

    const powerLbl = $('#fp2-power-label');
    const powerBtn = $('#fp2-btn-power');
    const status = $('#fp2-status');
    const live = $('#fp2-live-dot');
    if (powerLbl) powerLbl.textContent = state.powerOn ? 'Switch off' : 'Switch on';
    if (powerBtn) {
      powerBtn.classList.toggle('bg-emerald-600', !state.powerOn);
      powerBtn.classList.toggle('hover:bg-emerald-700', !state.powerOn);
      powerBtn.classList.toggle('bg-rose-600', state.powerOn);
      powerBtn.classList.toggle('hover:bg-rose-700', state.powerOn);
    }
    if (status) {
      status.textContent = state.powerOn ? 'Migrating' : 'Diffusing';
      status.className = state.powerOn
        ? 'text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase'
        : 'text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase';
    }
    if (live) {
      live.className = state.powerOn
        ? 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'
        : 'w-2 h-2 rounded-full bg-slate-600';
    }

    const badgePos = $('#fp2-badge-pos');
    const badgeNeg = $('#fp2-badge-neg');
    if (badgePos) {
      badgePos.textContent = state.posOnLeft ? '+ anode (left)' : '+ anode (right)';
    }
    if (badgeNeg) {
      badgeNeg.textContent = state.posOnLeft ? '− cathode (right)' : '− cathode (left)';
    }

    const sp = ion();
    const anodeSide = state.posOnLeft ? 'left' : 'right';
    const cathodeSide = state.posOnLeft ? 'right' : 'left';
    const speedWord = state.voltage >= 22 ? 'quickly' : state.voltage <= 10 ? 'slowly' : 'steadily';
    const obs = $('#fp2-obs');
    if (obs) {
      if (!state.powerOn) {
        // Supply OFF — keep any migration route; add isotropic diffusion
        const kept =
          state.progress > 0.01
            ? ' The directed migration route remains visible.'
            : '';
        if (sp.dual) {
          obs.innerHTML =
            `With the d.c. supply <strong>off</strong>, there is no electric field.${kept} The coloured patch ` +
            `(${sp.cation.colourWord} ${sp.cation.ion} / ${sp.anion.colourWord} ${sp.anion.ion}) ` +
            `slowly <strong>diffuses in all directions</strong> on the moist paper.`;
        } else {
          obs.innerHTML =
            `With the d.c. supply <strong>off</strong>, there is no electric field.${kept} The ` +
            `<strong>${sp.colourWord}</strong> patch (${sp.ion}) slowly <strong>diffuses in all directions</strong> on the moist paper.`;
        }
      } else if (sp.dual) {
        const { cation: cat, anion: an } = sp;
        obs.innerHTML =
          `Two blurry trails form: <strong>${an.colourWord}</strong> ${an.ion} toward the <strong>${anodeSide} anode (+)</strong>, ` +
          `and <strong>${cat.colourWord}</strong> ${cat.ion} toward the <strong>${cathodeSide} cathode (−)</strong>. ` +
          `At <strong>${state.voltage}&nbsp;V</strong> they advance ${speedWord}.`;
      } else {
        const toward = sp.charge < 0 ? 'anode (+)' : 'cathode (−)';
        const side = migrateSignSingle() < 0 ? 'left' : 'right';
        obs.innerHTML =
          `A <strong>${sp.colourWord}</strong> blurry streak of ${sp.name} ions (${sp.ion}) spreads toward the <strong>${side}</strong> ` +
          `(${toward}). At <strong>${state.voltage}&nbsp;V</strong> the trail advances ${speedWord}.`;
      }
    }

    const key = $('#fp2-key');
    if (key) {
      if (!state.powerOn) {
        key.innerHTML =
          `Without an applied voltage, ions spread by <strong>diffusion</strong> in every direction. ` +
          `Any migration trail already formed is <strong>not reset</strong>. Switch the supply <strong>on</strong> to resume directed migration.`;
      } else if (sp.dual) {
        key.innerHTML =
          `When <strong>both</strong> ions are coloured, you see two streaks: the anion (${sp.anion.ion}) to the <strong>anode (+)</strong> ` +
          `and the cation (${sp.cation.ion}) to the <strong>cathode (−)</strong>. Higher voltage → faster migration.`;
      } else {
        key.innerHTML =
          sp.charge < 0
            ? `<strong>${sp.ion}</strong> is an anion — attracted to the <strong>anode (+)</strong>. Higher voltage → faster migration.`
            : `<strong>${sp.ion}</strong> is a cation — attracted to the <strong>cathode (−)</strong>. Higher voltage → faster migration.`;
      }
    }
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  /**
   * Simple horizontal wedge clip (matches sketch): flat base outside,
   tip pointing inward, overlapping both slide and filter paper.
   */
  function drawClip(ctx, side, slide, paper, isPositive) {
    const midY = paper.y + paper.h / 2;
    const halfH = Math.max(22, slide.h * 0.38);
    const isLeft = side === 'left';

    // Span: starts outside the slide, tip lands well onto the paper
    const baseX = isLeft ? slide.x - 18 : slide.x + slide.w + 18;
    const tipX = isLeft ? paper.x + 42 : paper.x + paper.w - 42;

    ctx.save();

    // Light-blue wedge
    ctx.fillStyle = '#7dd3fc';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (isLeft) {
      ctx.moveTo(baseX, midY - halfH);
      ctx.lineTo(tipX, midY);
      ctx.lineTo(baseX, midY + halfH);
    } else {
      ctx.moveTo(baseX, midY - halfH);
      ctx.lineTo(tipX, midY);
      ctx.lineTo(baseX, midY + halfH);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // "clip" label above the wedge (as in the sketch)
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 13px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const labelX = (baseX + tipX) / 2;
    ctx.fillText('clip', labelX, midY - halfH - 6);

    // Polarity badge
    const bx = isLeft ? baseX - 4 : baseX + 4;
    const by = midY - halfH - 28;
    ctx.beginPath();
    ctx.arc(bx, by, 13, 0, Math.PI * 2);
    ctx.fillStyle = isPositive ? '#ef4444' : '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px ui-sans-serif, system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(isPositive ? '+' : '−', bx, by + (isPositive ? 1 : -1));
    ctx.restore();
  }

  /**
   * One blurry streak (image-1 style): soft ellipses from crystal toward an electrode.
   * sign: -1 left, +1 right. yBias shifts dual trails slightly apart vertically.
   */
  function drawOneTrail(ctx, cx, cy, paperLeft, paperRight, paperH, color, sign, yBias = 0) {
    const p = state.progress;
    if (p < 0.01) return;
    const maxReach = (paperRight - paperLeft) * 0.42;
    const tipX = cx + sign * p * maxReach;
    const [r, g, b] = color;
    const yy = cy + yBias;

    ctx.save();
    const steps = 26;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = cx + (tipX - cx) * t;
      const alpha = (0.52 * (1 - t * 0.75) + 0.07) * Math.min(1, p * 1.4);
      const radX = 10 + t * 36 * p + (1 - t) * 6;
      const radY = paperH * (0.18 + t * 0.24);
      const grad = ctx.createRadialGradient(x, yy, 0, x, yy, radX);
      grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.45, `rgba(${r},${g},${b},${alpha * 0.45})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, yy, radX, radY, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.filter = 'blur(6px)';
    const wash = ctx.createLinearGradient(cx, yy, tipX, yy);
    wash.addColorStop(0, `rgba(${r},${g},${b},${0.32 * p})`);
    wash.addColorStop(0.55, `rgba(${r},${g},${b},${0.16 * p})`);
    wash.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = wash;
    ctx.beginPath();
    ctx.ellipse((cx + tipX) / 2, yy, Math.abs(tipX - cx) / 2 + 14, paperH * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();
  }

  /** Accumulated isotropic spread — drawn whenever diffuse > 0 (stays after supply ON again). */
  function drawDiffusePatch(ctx, cx, cy, paperW, paperH) {
    const sp = ion();
    const d = state.diffuse;
    if (d < 0.008) return;
    const maxR = Math.min(paperW, paperH) * 0.52 * d;
    const colors = sp.dual ? [sp.anion.color, sp.cation.color] : [sp.color];

    ctx.save();
    colors.forEach((col, idx) => {
      const [r, g, b] = col;
      // Slight mix offset for dual so both hues show in the blob, still same centre
      const ring = Math.max(6, maxR * (0.55 + idx * 0.2));
      ctx.filter = 'blur(8px)';
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ring);
      grad.addColorStop(0, `rgba(${r},${g},${b},${0.5 * Math.min(1, d * 1.15)})`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},${0.26 * d})`);
      grad.addColorStop(0.75, `rgba(${r},${g},${b},${0.1 * d})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, ring, 0, Math.PI * 2);
      ctx.fill();
      ctx.filter = 'none';
    });

    // Soft outer wash (all directions)
    ctx.filter = 'blur(10px)';
    const [r0, g0, b0] = sp.color;
    const outer = ctx.createRadialGradient(cx, cy, maxR * 0.15, cx, cy, Math.max(8, maxR));
    outer.addColorStop(0, `rgba(${r0},${g0},${b0},${0.18 * d})`);
    outer.addColorStop(1, `rgba(${r0},${g0},${b0},0)`);
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(8, maxR), 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
    ctx.restore();
  }

  function drawCrystalCore(ctx, cx, cy) {
    const sp = ion();
    const [cr, cg, cb] = sp.crystal;
    const [r, g, b] = sp.color;
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 9);
    core.addColorStop(0, `rgba(${cr},${cg},${cb},0.95)`);
    core.addColorStop(0.55, `rgba(${r},${g},${b},0.75)`);
    core.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Directed blurry migration toward attracting electrode(s). Crystal core drawn separately. */
  function drawBlurryTrail(ctx, cx, cy, paperLeft, paperRight, paperH) {
    const sp = ion();
    if (state.progress < 0.01) return;

    if (sp.dual) {
      drawOneTrail(ctx, cx, cy, paperLeft, paperRight, paperH, sp.anion.color, signTowardAnode(), 0);
      drawOneTrail(ctx, cx, cy, paperLeft, paperRight, paperH, sp.cation.color, signTowardCathode(), 0);
    } else {
      drawOneTrail(ctx, cx, cy, paperLeft, paperRight, paperH, sp.color, migrateSignSingle(), 0);
    }
  }

  function drawFrame() {
    const canvas = $('#fp2-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 960;
    const H = 540;

    // Logical coords — resizeCanvas() sets the HiDPI transform
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // Subtle bench hint
    const floor = ctx.createLinearGradient(0, H * 0.7, 0, H);
    floor.addColorStop(0, 'rgba(15,23,42,0)');
    floor.addColorStop(1, 'rgba(30,41,59,0.5)');
    ctx.fillStyle = floor;
    ctx.fillRect(0, H * 0.65, W, H * 0.35);

    // Slide (slightly larger translucent plate)
    const slideX = W * 0.14;
    const slideY = H * 0.32;
    const slideW = W * 0.72;
    const slideH = H * 0.30;
    ctx.fillStyle = 'rgba(226,232,240,0.18)';
    ctx.strokeStyle = 'rgba(148,163,184,0.45)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, slideX, slideY, slideW, slideH, 8);
    ctx.fill();
    ctx.stroke();

    // Filter paper
    const paperX = slideX + slideW * 0.06;
    const paperY = slideY + slideH * 0.18;
    const paperW = slideW * 0.88;
    const paperH = slideH * 0.64;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, paperX, paperY, paperW, paperH, 6);
    ctx.fill();
    ctx.stroke();

    // Label under paper
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('filter paper moistened with Na₂SO₄(aq)', W / 2, slideY + slideH + 28);

    const cx = paperX + paperW / 2;
    const cy = paperY + paperH / 2;
    const slide = { x: slideX, y: slideY, w: slideW, h: slideH };
    const paper = { x: paperX, y: paperY, w: paperW, h: paperH };

    // Trail + accumulated diffuse both persist across ON/OFF; core on top
    if (state.progress > 0.01) {
      drawBlurryTrail(ctx, cx, cy, paperX, paperX + paperW, paperH);
    }
    if (state.diffuse > 0.008) {
      drawDiffusePatch(ctx, cx, cy, paperW, paperH);
    }
    drawCrystalCore(ctx, cx, cy);

    // Clamps on top — grip slide + paper together
    drawClip(ctx, 'left', slide, paper, state.posOnLeft);
    drawClip(ctx, 'right', slide, paper, !state.posOnLeft);

    // Arrow hints only when supply is ON (directed migration)
    if (state.powerOn && state.progress > 0.05) {
      const sp = ion();
      ctx.fillStyle = 'rgba(248,250,252,0.55)';
      ctx.font = 'bold 13px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      if (sp.dual) {
        const aSign = signTowardAnode();
        const cSign = signTowardCathode();
        ctx.fillText(aSign < 0 ? `← ${sp.anion.colourWord}` : `${sp.anion.colourWord} →`, cx + aSign * (50 + state.progress * 70), paperY - 18);
        ctx.fillText(cSign < 0 ? `← ${sp.cation.colourWord}` : `${sp.cation.colourWord} →`, cx + cSign * (50 + state.progress * 70), paperY + paperH + 18);
      } else {
        const sign = migrateSignSingle();
        ctx.fillText(sign < 0 ? '← migrates' : 'migrates →', cx + sign * (40 + state.progress * 80), paperY - 16);
      }
    }

    // Voltage callout
    ctx.fillStyle = state.powerOn ? '#34d399' : '#64748b';
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      state.powerOn ? `${state.voltage} V d.c. ON` : `${state.voltage} V d.c. OFF`,
      W - 24,
      28
    );
  }

  function tick(ts) {
    if (!state.lastTs) state.lastTs = ts;
    const dt = Math.min(0.05, (ts - state.lastTs) / 1000);
    state.lastTs = ts;

    if (state.powerOn) {
      // Voltage-linked directed migration; freeze diffuse (do not shrink / wipe)
      const rate = 0.0028 * (state.voltage / 20);
      state.progress = Math.min(1, state.progress + rate * dt * 60);
    } else if (state.progress > 0.01 || state.diffuse > 0) {
      // No field — slow isotropic diffusion from current value (no sudden jump)
      const rate = 0.0007;
      state.diffuse = Math.min(1, state.diffuse + rate * dt * 60);
    }
    updateChrome();

    drawFrame();
    state.raf = requestAnimationFrame(tick);
  }

  function resizeCanvas() {
    const canvas = $('#fp2-canvas');
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent || parent.clientWidth < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = parent.clientWidth;
    const cssH = parent.clientHeight;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr * (cssW / 960), 0, 0, dpr * (cssH / 540), 0, 0);
    drawFrame();
  }

  function reset() {
    state.progress = 0;
    state.diffuse = 0;
    state.powerOn = false;
    state.lastTs = 0;
    updateChrome();
    drawFrame();
  }

  function bind() {
    populateSelect();
    $('#fp2-ion-select')?.addEventListener('change', (e) => {
      state.ionId = e.target.value;
      state.progress = 0;
      state.diffuse = 0;
      updateChrome();
      drawFrame();
    });
    $('#fp2-voltage')?.addEventListener('input', (e) => {
      state.voltage = parseInt(e.target.value, 10) || 20;
      updateChrome();
    });
    $('#fp2-btn-power')?.addEventListener('click', () => {
      state.powerOn = !state.powerOn;
      // ON: resume migration; keep accumulated diffuse. OFF: diffuse grows gradually (no jump).
      updateChrome();
    });
    $('#fp2-btn-reset')?.addEventListener('click', reset);
    $('#fp2-btn-swap')?.addEventListener('click', () => {
      state.posOnLeft = !state.posOnLeft;
      state.progress = 0;
      if (!state.powerOn) state.diffuse = 0;
      updateChrome();
      drawFrame();
    });

    // Part tabs
    $('#fp-tab-part1')?.addEventListener('click', () => showPart(1));
    $('#fp-tab-part2')?.addEventListener('click', () => showPart(2));

    window.addEventListener('resize', () => {
      if (!$('#fp-part2')?.classList.contains('hidden')) resizeCanvas();
    });
  }

  function showPart(n) {
    const p1 = $('#fp-part1');
    const p2 = $('#fp-part2');
    const t1 = $('#fp-tab-part1');
    const t2 = $('#fp-tab-part2');
    const is1 = n === 1;
    p1?.classList.toggle('hidden', !is1);
    p2?.classList.toggle('hidden', is1);
    if (t1) {
      t1.className = is1
        ? 'fp-part-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-chemistry-700 shadow-sm border border-slate-200'
        : 'fp-part-tab px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700';
    }
    if (t2) {
      t2.className = !is1
        ? 'fp-part-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-chemistry-700 shadow-sm border border-slate-200'
        : 'fp-part-tab px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700';
    }
    if (is1) {
      window.FilterPaperLab?.show?.();
    } else {
      requestAnimationFrame(() => {
        resizeCanvas();
        updateChrome();
        drawFrame();
      });
    }
  }

  function init() {
    if (state.ready) return;
    bind();
    updateChrome();
    if (!state.raf) state.raf = requestAnimationFrame(tick);
    state.ready = true;
  }

  window.FilterPaperObs = {
    init,
    show() {
      init();
      showPart(2);
    },
    showPart,
    resize: resizeCanvas,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
