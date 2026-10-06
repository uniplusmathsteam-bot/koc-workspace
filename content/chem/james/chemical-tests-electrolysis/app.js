    (function () {
      const hideBtn = document.getElementById("hide");
      const menuBtn = document.getElementById("menu-toggle");
      const playBtn = document.getElementById("play");
      const zoomBtn = document.getElementById("zoom");
      const themeBtn = document.getElementById("theme-toggle");
      const penBtn = document.getElementById("pen");
      const eraserBtn = document.getElementById("eraser");
      const clearBtn = document.getElementById("clear");
      const undoBtn = document.getElementById("undo");
      const redoBtn = document.getElementById("redo");
      const canvas = document.getElementById("draw");
      const ctx = canvas.getContext("2d");

      let tool = null;
      let drawing = false;
      let current = null;
      const strokes = [];
      const undoStack = [];
      const redoStack = [];
      let audioCtx = null;
      let canvasReady = false;
      let drawn = 0;
      let paintFrame = 0;

      function ease(t) {
        return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
      }

      function animateSplint(el, ms) {
        const keys = [
          { x: +el.dataset.x0, y: +el.dataset.y0, r: +el.dataset.r0, t: 0 },
        ];
        if (el.dataset.x2) {
          keys.push({
            x: +el.dataset.x2,
            y: +el.dataset.y2,
            r: +el.dataset.r2,
            t: el.dataset.t2 ? +el.dataset.t2 : 0.45,
          });
        }
        keys.push({ x: +el.dataset.x1, y: +el.dataset.y1, r: +el.dataset.r1, t: 1 });
        cancelAnimationFrame(el._raf || 0);
        const t0 = performance.now();
        function pose(t) {
          let i = 0;
          while (i < keys.length - 2 && t > keys[i + 1].t) i += 1;
          const a = keys[i];
          const b = keys[i + 1];
          const span = b.t - a.t || 1;
          const e = ease(Math.min(1, Math.max(0, (t - a.t) / span)));
          return {
            x: a.x + (b.x - a.x) * e,
            y: a.y + (b.y - a.y) * e,
            r: a.r + (b.r - a.r) * e,
          };
        }
        function frame(now) {
          const t = Math.min(1, (now - t0) / ms);
          const p = pose(t);
          el.setAttribute("transform", "translate(" + p.x + " " + p.y + ") rotate(" + p.r + ")");
          if (t < 1) el._raf = requestAnimationFrame(frame);
        }
        const start = keys[0];
        el.setAttribute("transform", "translate(" + start.x + " " + start.y + ") rotate(" + start.r + ")");
        el._raf = requestAnimationFrame(frame);
      }

      function popSound() {
        try {
          if (!window.AudioContext) return;
          if (!audioCtx) audioCtx = new AudioContext();
          if (audioCtx.state === "suspended") audioCtx.resume();
          const actx = audioCtx;
          const dur = 0.09;
          const n = Math.floor(actx.sampleRate * dur);
          const buf = actx.createBuffer(1, n, actx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < n; i++) {
            const t = i / n;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 4);
          }
          const src = actx.createBufferSource();
          src.buffer = buf;
          const filter = actx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 1200;
          const gain = actx.createGain();
          gain.gain.setValueAtTime(0.7, actx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + dur);
          src.connect(filter);
          filter.connect(gain);
          gain.connect(actx.destination);
          src.start();

          const osc = actx.createOscillator();
          const og = actx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(320, actx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(70, actx.currentTime + 0.07);
          og.gain.setValueAtTime(0.45, actx.currentTime);
          og.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.08);
          osc.connect(og);
          og.connect(actx.destination);
          osc.start();
          osc.stop(actx.currentTime + 0.09);
        } catch (err) {}
      }

      function playPanel(panel) {
        const splint = panel.querySelector(".splint");
        const ms = splint ? +splint.dataset.ms : 1400;
        if (splint) cancelAnimationFrame(splint._raf || 0);
        panel.style.setProperty("--move", ms + "ms");
        panel.classList.remove("played");
        void panel.offsetWidth;
        panel.classList.add("played");
        if (splint) animateSplint(splint, ms);
        playBtn.querySelector(".verb").textContent = "Replay";
        if (panel.id === "hydrogen") {
          const token = (panel._token || 0) + 1;
          panel._token = token;
          clearTimeout(panel._timer);
          panel._timer = setTimeout(function () {
            if (panel._token === token) popSound();
          }, ms);
        }
      }

      playBtn.addEventListener("click", function () {
        playPanel(page);
      });

      zoomBtn.addEventListener("click", function () {
        const on = page.classList.toggle("zoomed");
        zoomBtn.setAttribute("aria-pressed", String(on));
      });

      function applyTheme(dark) {
        document.documentElement.classList.toggle("dark", dark);
        themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
        themeBtn.textContent = dark ? "Light mode" : "Dark mode";
        themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      }

      applyTheme(document.documentElement.classList.contains("dark"));
      themeBtn.addEventListener("click", function () {
        applyTheme(!document.documentElement.classList.contains("dark"));
      });

      let page = document.getElementById("oxygen");

      if (window.matchMedia("(max-width: 700px)").matches) {
        document.querySelectorAll(".panel").forEach(function (panel) {
          panel.classList.add("hide-desc");
        });
        syncHide();
      }

      function syncHide() {
        const hidden = page.classList.contains("hide-desc");
        hideBtn.querySelector(".verb").textContent = hidden ? "Show description" : "Hide description";
        hideBtn.setAttribute("aria-pressed", String(hidden));
      }

      function showPage(id) {
        page = document.getElementById(id);
        document.querySelectorAll(".panel").forEach(function (panel) {
          panel.classList.toggle("active", panel.id === id);
        });
        document.querySelectorAll(".page").forEach(function (btn) {
          btn.setAttribute("aria-pressed", String(btn.dataset.page === id));
        });
        syncHide();
        playBtn.querySelector(".verb").textContent = page.classList.contains("played") ? "Replay" : "Play";
        zoomBtn.setAttribute("aria-pressed", String(page.classList.contains("zoomed")));
      }

      document.querySelectorAll(".page").forEach(function (btn) {
        btn.addEventListener("click", function () {
          showPage(btn.dataset.page);
        });
      });

      hideBtn.addEventListener("click", function () {
        page.classList.toggle("hide-desc");
        syncHide();
      });

      function syncMenu() {
        const hidden = document.body.classList.contains("menu-hidden");
        menuBtn.querySelector(".verb").textContent = hidden ? "Show menu" : "Hide menu";
        menuBtn.setAttribute("aria-pressed", String(hidden));
      }

      menuBtn.addEventListener("click", function () {
        document.body.classList.toggle("menu-hidden");
        syncMenu();
      });

      function setTool(next) {
        tool = tool === next ? null : next;
        penBtn.setAttribute("aria-pressed", String(tool === "pen"));
        eraserBtn.setAttribute("aria-pressed", String(tool === "eraser"));
        canvas.classList.toggle("on", tool !== null);
        canvas.classList.toggle("eraser", tool === "eraser");
        document.body.classList.toggle("drawing", tool !== null);
        if (tool && !canvasReady) resize();
        syncInk();
      }

      penBtn.addEventListener("click", function () { setTool("pen"); });
      eraserBtn.addEventListener("click", function () { setTool("eraser"); });

      function pos(e) {
        return { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      }

      function applyInk(s) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = s.tool === "eraser" ? 40 : 8;
        if (s.tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "#000";
          ctx.fillStyle = "#000";
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = "#1a1a1a";
          ctx.fillStyle = "#1a1a1a";
        }
      }

      function paint(s) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        ctx.save();
        applyInk(s);
        const pts = s.points;
        if (pts.length === 1) {
          ctx.beginPath();
          ctx.arc(pts[0].x * w, pts[0].y * h, ctx.lineWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(pts[0].x * w, pts[0].y * h);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * w, pts[i].y * h);
          ctx.stroke();
        }
        ctx.restore();
      }

      function syncInk() {
        canvas.classList.toggle("has-ink", strokes.length > 0 || current !== null);
      }

      function redraw() {
        if (!canvasReady) return;
        const dpr = canvas.width / window.innerWidth;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        strokes.forEach(paint);
        if (current) {
          paint(current);
          drawn = Math.max(0, current.points.length - 1);
        }
      }

      function paintTail() {
        paintFrame = 0;
        if (!current || drawn >= current.points.length - 1) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const pts = current.points;
        const dpr = canvas.width / w;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.save();
        applyInk(current);
        ctx.beginPath();
        ctx.moveTo(pts[drawn].x * w, pts[drawn].y * h);
        for (let i = drawn + 1; i < pts.length; i++) ctx.lineTo(pts[i].x * w, pts[i].y * h);
        ctx.stroke();
        ctx.restore();
        drawn = pts.length - 1;
      }

      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        canvasReady = true;
        redraw();
      }

      canvas.addEventListener("pointerdown", function (e) {
        if (!tool) return;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        drawing = true;
        current = { tool: tool, points: [pos(e)] };
        drawn = 0;
        syncInk();
      });

      canvas.addEventListener("pointermove", function (e) {
        if (!drawing || !current) return;
        const next = pos(e);
        const last = current.points[current.points.length - 1];
        const dx = (next.x - last.x) * window.innerWidth;
        const dy = (next.y - last.y) * window.innerHeight;
        if (dx * dx + dy * dy < 1) return;
        current.points.push(next);
        if (!paintFrame) paintFrame = requestAnimationFrame(paintTail);
      });

      function remember(action) {
        undoStack.push(action);
        redoStack.length = 0;
      }

      function undo() {
        if (drawing || !undoStack.length) return;
        const action = undoStack.pop();
        action.undo();
        redoStack.push(action);
        redraw();
        syncInk();
      }

      function redo() {
        if (drawing || !redoStack.length) return;
        const action = redoStack.pop();
        action.redo();
        undoStack.push(action);
        redraw();
        syncInk();
      }

      function endStroke() {
        if (paintFrame) cancelAnimationFrame(paintFrame);
        paintFrame = 0;
        if (!drawing || !current) return;
        const stroke = current;
        current = null;
        drawing = false;
        strokes.push(stroke);
        remember({
          undo: function () { strokes.pop(); },
          redo: function () { strokes.push(stroke); },
        });
        redraw();
        syncInk();
      }

      canvas.addEventListener("pointerup", endStroke);
      canvas.addEventListener("pointercancel", endStroke);

      function clearDrawing() {
        if (paintFrame) cancelAnimationFrame(paintFrame);
        paintFrame = 0;
        const saved = strokes.slice();
        if (current) saved.push(current);
        current = null;
        drawing = false;
        if (!saved.length) {
          redraw();
          return;
        }
        strokes.length = 0;
        remember({
          undo: function () {
            saved.forEach(function (stroke) { strokes.push(stroke); });
          },
          redo: function () { strokes.length = 0; },
        });
        redraw();
        syncInk();
      }

      clearBtn.addEventListener("click", clearDrawing);
      undoBtn.addEventListener("click", undo);
      redoBtn.addEventListener("click", redo);

      function clearZoom() {
        page.classList.remove("zoomed");
        zoomBtn.setAttribute("aria-pressed", "false");
      }

      document.addEventListener("keydown", function (e) {
        const mod = e.metaKey || e.ctrlKey;
        if (mod && !e.altKey) {
          const key = e.key.toLowerCase();
          if (key === "z" && !e.shiftKey) {
            e.preventDefault();
            undo();
            return;
          }
          if ((key === "z" && e.shiftKey) || key === "y") {
            e.preventDefault();
            redo();
            return;
          }
          return;
        }
        if (e.altKey || e.repeat) return;
        if (e.key === "1") showPage("oxygen");
        else if (e.key === "2") showPage("hydrogen");
        else if (e.key === "3") showPage("carbon");
        else if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          playPanel(page);
        }
        else if (e.key === "h" || e.key === "H") hideBtn.click();
        else if (e.key === "m" || e.key === "M") menuBtn.click();
        else if (e.key === "p" || e.key === "P") setTool("pen");
        else if (e.key === "e" || e.key === "E") setTool("eraser");
        else if (e.key === "Backspace") {
          e.preventDefault();
          clearBtn.click();
        } else if (e.key === "Escape") {
          if (tool) setTool(tool);
          clearZoom();
        }
      });

      let resizeFrame = 0;
      window.addEventListener("resize", function () {
        if (!canvasReady || resizeFrame) return;
        resizeFrame = requestAnimationFrame(function () {
          resizeFrame = 0;
          resize();
        });
      });
    })();
  