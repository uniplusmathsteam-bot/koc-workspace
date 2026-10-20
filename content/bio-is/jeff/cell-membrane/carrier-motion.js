/* Approved carrier shape-change. Draws the protein and the mineral only. */
function mountCarrier(canvas) {
  const ctx = canvas.getContext("2d");
    const CYCLE = 12000;
    const CX = 350;
    const CY = 468;
    const HW = 168;
    const HH = 248;
    const HEAD_OUT = CY - 18;
    const HEAD_IN = CY + 92;

    // Upright silhouette taken from the generated carrier. y = -1 top, +1 bottom.
    const OUTER = [
      [-1.00, 0.55],
      [-0.94, 0.74],
      [-0.86, 0.90],
      [-0.76, 0.98],
      [-0.64, 1.00],
      [-0.50, 0.99],
      [-0.36, 0.93],
      [-0.22, 0.84],
      [-0.08, 0.75],
      [0.06, 0.68],
      [0.20, 0.65],
      [0.34, 0.64],
      [0.48, 0.64],
      [0.62, 0.60],
      [0.74, 0.56],
      [0.86, 0.52],
      [1.00, 0.50]
    ];
    const GROOVE = [
      [-0.92, 0.00],
      [-0.86, 0.22],
      [-0.78, 0.42],
      [-0.68, 0.54],
      [-0.56, 0.50],
      [-0.44, 0.34],
      [-0.32, 0.18],
      [-0.22, 0.07],
      [-0.14, 0.00],
      [1.00, 0.00]
    ];

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(t) { return Math.max(0, Math.min(1, t)); }
    function smoother(t) {
      t = clamp(t);
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    function sample(table, y) {
      if (y <= table[0][0]) return table[0][1];
      const last = table[table.length - 1];
      if (y >= last[0]) return last[1];
      for (let i = 1; i < table.length; i++) {
        if (y <= table[i][0]) {
          const span = table[i][0] - table[i - 1][0];
          const t = (y - table[i - 1][0]) / span;
          const s = t * t * (3 - 2 * t);
          return lerp(table[i - 1][1], table[i][1], s);
        }
      }
      return last[1];
    }
    function smax(a, b, k) {
      const m = Math.max(a, b);
      if (m <= 0.001) return 0;
      const h = Math.max(k - Math.abs(a - b), 0) / k;
      return m + h * h * k * 0.25;
    }
    function outerXn(yn, open) {
      const up = sample(OUTER, yn);
      const down = sample(OUTER, -yn);
      const mixed = lerp(up, down, open);
      const full = smax(smax(up, down, 0.1), 0.72, 0.1);
      return lerp(mixed, full, 0.7 * Math.sin(Math.PI * open));
    }
    function bodyTop(open) {
      const cap = 0.7;
      const rx = Math.max(8, outerXn(-(cap - 0.1), open) * HW);
      const yJoin = CY - cap * HH;
      const ry = Math.max(16, rx * 0.34);
      const amount = clamp(1 - open / 0.75);
      const M = rx * 0.5 * smoother(amount);
      let lipY = yJoin - ry;
      if (M > 0.5 && M < rx - 1) lipY = yJoin - ry * Math.sqrt(1 - (M / rx) * (M / rx));
      return { yJoin, rx, ry, M, lipY, peak: yJoin - ry };
    }
    function bodyBottom(open) {
      const cap = 0.7;
      const R = Math.max(8, outerXn(cap - 0.1, open) * HW);
      const yb = CY + cap * HH;
      const amount = clamp((open - 0.12) / 0.88);
      const M = R * 0.5 * smoother(amount);
      if (M < 0.5 || M >= R) return { yb, R, M: 0, mouthY: yb + R };
      return { yb, R, M, mouthY: yb + Math.sqrt(R * R - M * M) };
    }
    function bellWidth(y, mouthY, tipY, mouthW) {
      const len = tipY - mouthY;
      if (Math.abs(len) < 1 || mouthW < 2) return 0;
      const t = (y - mouthY) / len;
      if (t < -0.02 || t > 1) return 0;
      const u = clamp(t);
      const shape = [
        [0.00, 1.00],
        [0.10, 1.14],
        [0.22, 1.22],
        [0.38, 1.05],
        [0.54, 0.72],
        [0.70, 0.40],
        [0.84, 0.16],
        [0.94, 0.05],
        [1.00, 0.00]
      ];
      let k = shape[0][1];
      for (let i = 1; i < shape.length; i++) {
        if (u <= shape[i][0]) {
          const span = shape[i][0] - shape[i - 1][0];
          const s = (u - shape[i - 1][0]) / span;
          const e = s * s * (3 - 2 * s);
          k = lerp(shape[i - 1][1], shape[i][1], e);
          break;
        }
      }
      return mouthW * k;
    }

    function pose(u) {
      const seat0 = bodyTop(0).lipY + 78;
      const exit = bodyBottom(1);
      const seat1 = exit.mouthY - 72;
      const leaveY = exit.mouthY + 40;
      const open = shapeOpen(u);
      if (u < 0.16) {
        const t = smoother(u / 0.16);
        return { phase: "Mineral enters the passageway", open, ionY: lerp(CY - HH - 90, seat0, t), showIon: true };
      }
      if (u < 0.74) {
        const t = smoother((u - 0.16) / 0.58);
        return { phase: "Carrier changes shape", open, ionY: lerp(seat0, seat1, t), showIon: true };
      }
      if (u < 0.9) {
        const t = smoother((u - 0.74) / 0.16);
        return { phase: "Mineral leaves into the cell", open, ionY: lerp(seat1, leaveY, t), showIon: true };
      }
      return { phase: "Carrier returns", open, ionY: 0, showIon: false };
    }
    function shapeOpen(u) {
      if (u < 0.16) return 0;
      if (u < 0.74) return smoother((u - 0.16) / 0.58);
      if (u < 0.9) return 1;
      return 1 - smoother((u - 0.9) / 0.1);
    }
    function tangent(rx, ry, angle) {
      const vx = rx * Math.sin(angle);
      const vy = -ry * Math.cos(angle);
      const len = Math.hypot(vx, vy) || 1;
      return [vx / len, vy / len];
    }
    function lerpColor(a, b, t) {
      const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
      const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
      const c = pa.map((v, i) => Math.round(lerp(v, pb[i], t)));
      return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    }
    function curveThrough(pts) {
      const n = pts.length;
      if (n < 3) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const p3 = pts[(i + 2) % n];
        ctx.bezierCurveTo(
          p1[0] + (p2[0] - p0[0]) / 6,
          p1[1] + (p2[1] - p0[1]) / 6,
          p2[0] - (p3[0] - p1[0]) / 6,
          p2[1] - (p3[1] - p1[1]) / 6,
          p2[0], p2[1]
        );
      }
      ctx.closePath();
    }

    function heads(y) {
      for (let i = 0; i < 16; i++) {
        const x = 36 + i * 42;
        if (Math.abs(x - CX) < HW + 28) continue;
        const g = ctx.createRadialGradient(x - 5, y - 6, 2, x, y, 16);
        g.addColorStop(0, "#fff6c4");
        g.addColorStop(0.45, "#ffd23a");
        g.addColorStop(1, "#e0a400");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c89200";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    function tails() {
      ctx.strokeStyle = "#8ea0b4";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      for (let i = 0; i < 15; i++) {
        const x = 48 + i * 42;
        if (Math.abs(x - CX) < HW + 8) continue;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(x, HEAD_OUT + 16);
        ctx.bezierCurveTo(x + 8, (HEAD_OUT + HEAD_IN) / 2, x - 8, (HEAD_OUT + HEAD_IN) / 2, x + 4, HEAD_IN - 16);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function traceBody(open) {
      const cap = 0.7;
      const N = 28;
      const side = [];
      for (let i = 0; i <= N; i++) {
        const yn = -cap + (2 * cap * i) / N;
        let sampleY = yn;
        if (sampleY > cap - 0.12) sampleY = cap - 0.12;
        if (sampleY < -cap + 0.12) sampleY = -cap + 0.12;
        side.push([outerXn(sampleY, open) * HW, CY + yn * HH]);
      }
      const dome = bodyTop(open);
      const info = bodyBottom(open);
      const ry = Math.max(16, side[0][0] * 0.34);
      const yJoin = CY + (-cap) * HH;
      ctx.beginPath();
      ctx.moveTo(CX + side[0][0], yJoin);
      if (dome.M < 0.8) {
        ctx.ellipse(CX, yJoin, side[0][0], ry, 0, 0, Math.PI, true);
      } else {
        const theta = Math.acos(clamp(dome.M / side[0][0]));
        ctx.ellipse(CX, yJoin, side[0][0], ry, 0, 0, -theta, true);
        const lipY = yJoin - ry * Math.sin(theta);
        const t1 = tangent(side[0][0], ry, -theta);
        const t2 = tangent(side[0][0], ry, -Math.PI + theta);
        const k = dome.M * 0.55;
        ctx.bezierCurveTo(
          CX + dome.M + t1[0] * k, lipY + t1[1] * k,
          CX - dome.M - t2[0] * k, lipY - t2[1] * k,
          CX - dome.M, lipY
        );
        ctx.ellipse(CX, yJoin, side[0][0], ry, 0, -Math.PI + theta, -Math.PI, true);
      }
      for (let i = 1; i < side.length - 1; i++) {
        const p0 = i === 1 ? [side[0][0], yJoin] : [side[i - 1][0], side[i - 1][1]];
        const p1 = [side[i][0], side[i][1]];
        const p2 = [side[i + 1][0], side[i + 1][1]];
        const p3 = side[Math.min(side.length - 1, i + 2)];
        ctx.bezierCurveTo(
          CX - (p1[0] + (p2[0] - p0[0]) / 6), p1[1] + (p2[1] - p0[1]) / 6,
          CX - (p2[0] - (p3[0] - p1[0]) / 6), p2[1] - (p3[1] - p1[1]) / 6,
          CX - p2[0], p2[1]
        );
      }
      if (info.M < 0.8) {
        ctx.ellipse(CX, CY + cap * HH, side[side.length - 1][0], side[side.length - 1][0], 0, Math.PI, 0, true);
      } else {
        const dy = info.mouthY - info.yb;
        const leftAng = Math.atan2(dy, -info.M);
        const rightAng = Math.atan2(dy, info.M);
        ctx.ellipse(CX, info.yb, info.R, info.R, 0, Math.PI, leftAng, true);
        const t1 = tangent(info.R, info.R, leftAng);
        const t2 = tangent(info.R, info.R, rightAng);
        const k = info.M * 0.55;
        ctx.bezierCurveTo(
          CX - info.M + t1[0] * k, info.mouthY + t1[1] * k,
          CX + info.M - t2[0] * k, info.mouthY - t2[1] * k,
          CX + info.M, info.mouthY
        );
        ctx.ellipse(CX, info.yb, info.R, info.R, 0, rightAng, 0, true);
      }
      for (let i = side.length - 2; i >= 1; i--) {
        const p0 = [side[Math.min(side.length - 1, i + 2)][0], side[Math.min(side.length - 1, i + 2)][1]];
        const p1 = [side[i + 1][0], side[i + 1][1]];
        const p2 = [side[i][0], side[i][1]];
        const p3 = i === 1 ? [side[0][0], yJoin] : [side[i - 1][0], side[i - 1][1]];
        ctx.bezierCurveTo(
          CX + (p1[0] + (p2[0] - p0[0]) / 6), p1[1] + (p2[1] - p0[1]) / 6,
          CX + (p2[0] - (p3[0] - p1[0]) / 6), p2[1] - (p3[1] - p1[1]) / 6,
          CX + p2[0], p2[1]
        );
      }
      ctx.closePath();
    }

    function traceCavity(open) {
      const top = bodyTop(open);
      const bot = bodyBottom(open);
      const bells = [];
      if (top.M > 1.5) bells.push({ mouthY: top.lipY, tipY: top.lipY + top.M * 2.35, mouthW: top.M });
      if (bot.M > 1.5) bells.push({ mouthY: bot.mouthY, tipY: bot.mouthY - bot.M * 2.35, mouthW: bot.M });
      const seat0 = bodyTop(0).lipY + 78;
      const seat1 = bodyBottom(1).mouthY - 72;
      const pocket = lerp(seat0, seat1, smoother(open));
      const bridge = Math.sin(Math.PI * clamp(open));
      let y0 = pocket - 150;
      let y1 = pocket + 150;
      for (const b of bells) {
        y0 = Math.min(y0, b.mouthY, b.tipY);
        y1 = Math.max(y1, b.mouthY, b.tipY);
      }
      const N = 64;
      const right = [];
      for (let i = 0; i <= N; i++) {
        const y = y0 + (y1 - y0) * (i / N);
        let w = 0;
        for (const b of bells) w = smax(w, bellWidth(y, b.mouthY, b.tipY, b.mouthW), 28);
        const throat = 32 * bridge * Math.exp(-((y - pocket) * (y - pocket)) / 22000);
        w = smax(w, throat, 24);
        if (w > 1.2) right.push([CX + w, y]);
      }
      if (right.length < 4) return false;
      const loop = right.slice();
      for (let i = right.length - 2; i >= 1; i--) loop.push([CX - (right[i][0] - CX), right[i][1]]);
      curveThrough(loop);
      return true;
    }

    function drawProtein(open) {
      ctx.save();
      ctx.shadowColor = "rgba(120, 20, 60, 0.28)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      const body = ctx.createLinearGradient(CX - HW * 0.2, CY - HH, CX + HW * 0.3, CY + HH);
      body.addColorStop(0, "#ff8ebf");
      body.addColorStop(0.22, "#f04890");
      body.addColorStop(0.58, "#dc1878");
      body.addColorStop(1, "#c01068");
      ctx.fillStyle = body;
      traceBody(open);
      ctx.fill();
      ctx.restore();

      ctx.save();
      traceBody(open);
      ctx.clip();

      const wide = lerp(-0.72, 0.72, open);
      for (const sign of [-1, 1]) {
        const gx = CX + sign * outerXn(wide, open) * HW * 0.58;
        const gy = CY + wide * HH;
        const rg = ctx.createRadialGradient(gx - sign * 18, gy - 24, 2, gx, gy + 20, 90);
        rg.addColorStop(0, "rgba(255,255,255,0.9)");
        rg.addColorStop(0.22, "rgba(255,255,255,0.35)");
        rg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.ellipse(gx, gy, 32, 92, sign * -0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      const bulbYn = lerp(0.38, -0.38, open);
      const hg = ctx.createRadialGradient(CX - 36, CY + bulbYn * HH, 4, CX - 10, CY + bulbYn * HH, 150);
      hg.addColorStop(0, "rgba(255, 196, 220, 0.32)");
      hg.addColorStop(0.55, "rgba(255, 170, 205, 0.18)");
      hg.addColorStop(1, "rgba(255, 170, 205, 0)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(110, 8, 48, 0.16)";
      ctx.beginPath();
      ctx.ellipse(CX + HW * 0.62, CY + 10, 28, HH * 0.72, 0.08, 0, Math.PI * 2);
      ctx.fill();

      if (traceCavity(open)) {
        const g = ctx.createLinearGradient(CX, CY - HH, CX, CY + HH);
        const t = smoother(open);
        g.addColorStop(0, lerpColor("#c83a78", "#4c0c30", t));
        g.addColorStop(0.5, "#7a1448");
        g.addColorStop(1, lerpColor("#4c0c30", "#5c1036", t));
        ctx.fillStyle = g;
        ctx.shadowColor = "rgba(90, 16, 48, 0.35)";
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#a01460";
      const info = bodyBottom(open);
      const dome = bodyTop(open);
      if (info.M > 1.5 || dome.M > 1.5) {
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        if (info.M > 1.5) ctx.rect(CX - info.M + 1, info.mouthY - 4, info.M * 2 - 2, 14);
        if (dome.M > 1.5) ctx.rect(CX - dome.M + 1, dome.lipY - 10, dome.M * 2 - 2, 16);
        ctx.clip("evenodd");
      }
      traceBody(open);
      ctx.stroke();
      ctx.restore();
    }

    function ion(y) {
      const r = 57;
      const g = ctx.createRadialGradient(CX - r * 0.36, y - r * 0.4, 4, CX, y, r * 1.25);
      g.addColorStop(0, "#fff6e4");
      g.addColorStop(0.42, "#ff8c1a");
      g.addColorStop(1, "#d4530a");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(CX, y, r, 0, Math.PI * 2);
      ctx.fill();
    }


  let guests = true;
  function paint(u, forceIon) {
    const p = pose(u);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawProtein(p.open);
    const show = guests && (forceIon == null ? p.showIon : forceIon);
    if (show) ion(p.ionY);
  }
  let mode = "";
  let raf = 0;
  let started = 0;
  function tick(now) {
    if (mode === "off") return;
    if (mode === "still") {
      paint(0, false);
      return;
    }
    if (mode === "enter") {
      const t = Math.min(1, (now - started) / 1600);
      paint(0.16 * t, true);
      if (t < 1) raf = requestAnimationFrame(tick);
      return;
    }
    paint(((now - started) % CYCLE) / CYCLE, null);
    raf = requestAnimationFrame(tick);
  }
  return {
    canvas,
    setGuests(on) { guests = !!on; },
    progress() {
      if (mode !== "cycle") return 0;
      return ((performance.now() - started) % CYCLE) / CYCLE;
    },
    ionState(u) {
      const p = pose(u);
      if (!p.showIon) return null;
      return { y: p.ionY, t: Math.min(1, u / 0.9) };
    },
    setMode(next) {
      if (next === mode) return;
      mode = next;
      cancelAnimationFrame(raf);
      started = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
}
