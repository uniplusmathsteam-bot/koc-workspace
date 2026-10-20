/* Channel pore. Water passes through. A calcium ion is too large and bounces back. */
function mountChannel(canvas) {
  const ctx = canvas.getContext("2d");
  const CYCLE = 9000;
  const CX = 350;
  const TOP = 214;
  const BOT = 668;
  const GAP = 40;
  const WALL = 132;
  const WATER_R = 24;
  const ION_R = 52;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(t) { return Math.max(0, Math.min(1, t)); }
  function smoother(t) {
    t = clamp(t);
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function sphere(x, y, r, rx, colors) {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r * 1.15);
    g.addColorStop(0, colors[0]);
    g.addColorStop(0.42, colors[1]);
    g.addColorStop(1, colors[2]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function wall(x, side) {
    const h = BOT - TOP;
    ctx.save();
    ctx.shadowColor = "rgba(120, 20, 60, 0.28)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    const g = ctx.createLinearGradient(x, TOP, x + WALL, TOP);
    if (side < 0) {
      g.addColorStop(0, "#ff8ebf");
      g.addColorStop(0.45, "#f04890");
      g.addColorStop(1, "#a01058");
    } else {
      g.addColorStop(0, "#a01058");
      g.addColorStop(0.55, "#f04890");
      g.addColorStop(1, "#ff8ebf");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x, TOP, WALL, h, 74);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, TOP, WALL, h, 74);
    ctx.clip();
    const hx = side < 0 ? x + 34 : x + WALL - 34;
    const hg = ctx.createRadialGradient(hx, TOP + 70, 4, hx, TOP + h * 0.45, 210);
    hg.addColorStop(0, "rgba(255,255,255,0.9)");
    hg.addColorStop(0.22, "rgba(255,255,255,0.32)");
    hg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(hx, TOP + h * 0.42, 26, h * 0.42, side * -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#a01460";
    ctx.beginPath();
    ctx.roundRect(x, TOP, WALL, h, 74);
    ctx.stroke();
  }

  function pore() {
    const x = CX - GAP + 6;
    const w = GAP * 2 - 12;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "rgba(74, 8, 36, 0.22)");
    g.addColorStop(0.18, "rgba(74, 8, 36, 0)");
    g.addColorStop(0.82, "rgba(74, 8, 36, 0)");
    g.addColorStop(1, "rgba(74, 8, 36, 0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(x, TOP + 36, w, BOT - TOP - 72);
  }

  function drawProtein() {
    wall(CX - GAP - WALL, -1);
    wall(CX + GAP, 1);
    pore();
  }

  function waterY(t) {
    return lerp(78, 790, smoother(t));
  }

  function paintWater(u, start, dur) {
    const t = (u - start) / dur;
    if (t <= 0 || t >= 1) return;
    sphere(CX, waterY(t), WATER_R, WATER_R, ["#eaf4ff", "#3b86f5", "#1d4fd0"]);
  }

  function waterState(u, start, dur) {
    const t = (u - start) / dur;
    if (t <= 0 || t >= 1) return null;
    return { y: waterY(t), t };
  }

  function ionState(u) {
    if (u < 0.48) return null;
    const t = (u - 0.48) / 0.5;
    if (t >= 1) return null;
    const rest = 86;
    const hit = TOP - 4;
    let y = rest;
    let squash = 1;
    if (t < 0.42) {
      y = lerp(rest, hit, smoother(t / 0.42));
    } else if (t < 0.58) {
      const b = (t - 0.42) / 0.16;
      y = hit - Math.sin(b * Math.PI) * 8;
      squash = 1 - 0.14 * Math.sin(b * Math.PI);
    } else {
      y = lerp(hit, rest, smoother((t - 0.58) / 0.42));
    }
    return { y, squash, t };
  }

  function paintIon(u) {
    const s = ionState(u);
    if (!s) return;
    sphere(CX, s.y, ION_R * s.squash, ION_R / s.squash, ["#fff6e4", "#ff8c1a", "#d4530a"]);
  }

  let guests = true;
  function paint(u) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawProtein();
    if (!guests) return;
    paintWater(u, 0.0, 0.34);
    paintWater(u, 0.16, 0.34);
    paintIon(u);
  }

  let mode = "";
  let raf = 0;
  let started = 0;
  function tick(now) {
    if (mode === "off") return;
    if (mode === "still") {
      paint(0.12);
      return;
    }
    paint(((now - started) % CYCLE) / CYCLE);
    raf = requestAnimationFrame(tick);
  }

  return {
    canvas,
    setGuests(on) { guests = !!on; },
    progress() {
      if (mode !== "cycle") return 0;
      return ((performance.now() - started) % CYCLE) / CYCLE;
    },
    waterState,
    ionState,
    setMode(next) {
      if (next === mode) return;
      mode = next;
      cancelAnimationFrame(raf);
      started = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
}
