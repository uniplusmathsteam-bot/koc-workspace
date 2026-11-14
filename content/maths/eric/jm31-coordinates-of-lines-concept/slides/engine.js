/* Step player in the JM32 concept style.
   A slide draws a figure, then each number in the formula is copied
   across from the label it came from. Right arrow or click advances.
   Left arrow goes back. Space pauses; once the step has finished,
   Space advances too. */
(function () {
  var BLUE = "#4FC3F7";
  var AMBER = "#FFD54F";
  var GREEN = "#66BB6A";
  var PINK = "#F06292";
  var VIOLET = "#CE93D8";
  var INK = "#F8FAFC";
  var MUTED = "#94A3B8";
  var RED = "#E57373";

  function ease(t) { return 1 - Math.pow(1 - clamp(t), 3); }
  function clamp(t) { return Math.max(0, Math.min(1, t)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function spaceOps(tex) {
    var s = String(tex);
    var trimmed = s.trim();
    if (/^(\\times|\\div|\\cdot|[+\-=<>])$/.test(trimmed)) {
      var op = trimmed.charAt(0) === "\\" ? "\\mathord{" + trimmed + "}" : "\\mathord{" + trimmed + "}";
      return s.replace(trimmed, "\\mkern10mu" + op + "\\mkern10mu");
    }
    var held = [];
    s = s.replace(/\\(?:text|textrm|mathrm)\{[^{}]*\}/g, function (m) {
      held.push(m);
      return "\u0003" + (held.length - 1) + ";";
    });
    var stash = [];
    s = s.replace(/\\(?:times|div|cdot)/g, function (m) {
      stash.push(m);
      return "\u0000" + (stash.length - 1) + ";";
    });
    var out = "";
    var i, j, prev, rest, unary;
    for (i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch !== "-" && ch !== "+") { out += ch; continue; }
      j = i - 1;
      while (j >= 0 && s.charAt(j) === " ") j--;
      prev = j >= 0 ? s.charAt(j) : "";
      if (ch === "+") {
        out += "({^".indexOf(prev) >= 0 ? "+" : "\\mkern10mu\\mathord{+}\\mkern10mu";
        continue;
      }
      unary = !prev || "=<>,+({^".indexOf(prev) >= 0;
      if (!unary) {
        out += "\\mkern10mu\\mathord{-}\\mkern10mu";
        continue;
      }
      rest = s.slice(i + 1);
      out += (rest.charAt(0) === "\\" || rest === "") ? "-\\mkern3mu" : "-";
    }
    s = out;
    s = s.replace(/[=<>]/g, function (op) {
      return "\\mkern10mu\\mathord{" + op + "}\\mkern10mu";
    });
    s = s.replace(/\u0000(\d+);/g, function (_, i) {
      return "\\mkern10mu\\mathord{" + stash[+i] + "}\\mkern10mu";
    });
    s = s.replace(/(?:\\mkern10mu){2,}/g, "\\mkern10mu");
    return s.replace(/\u0003(\d+);/g, function (_, i) { return held[+i]; });
  }

  function kx(tex, color, formula) {
    var body = formula ? spaceOps(tex) : tex;
    body = color ? "\\color{" + color + "}{" + body + "}" : body;
    return katex.renderToString(body, { throwOnError: false });
  }

  function mount(root, deck) {
    root.innerHTML = "";
    var board = document.createElement("div");
    board.id = "board";
    board.innerHTML =
      '<div class="title"></div><div class="rule"></div>' +
      '<div class="fig"><svg xmlns="http://www.w3.org/2000/svg"></svg><div class="labs"></div></div>' +
      '<div class="side"><div class="desc"></div><div class="eq"></div><div class="note"></div></div>' +
      '<div class="count"></div>';
    root.appendChild(board);

    var titleEl = board.querySelector(".title");
    var ruleEl = board.querySelector(".rule");
    var svg = board.querySelector("svg");
    var labs = board.querySelector(".labs");
    var descEl = board.querySelector(".desc");
    var eqEl = board.querySelector(".eq");
    var noteEl = board.querySelector(".note");
    var countEl = board.querySelector(".count");

    titleEl.innerHTML = kx("\\text{" + deck.title + "}");
    requestAnimationFrame(function () {
      ruleEl.style.width = Math.min(760, titleEl.offsetWidth + 36) + "px";
    });

    function fit() {
      var s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
      board.style.transform = "translate(-50%, -50%) scale(" + s + ")";
    }
    fit();
    window.addEventListener("resize", fit);

    var index = 0;
    var beats = [];
    var bi = 0;
    var acc = 0;
    var playing = true;
    var done = false;
    var completedSteps = 0;
    var last = performance.now();
    var clones = [];
    var map = null;

    function clearClones() {
      clones.forEach(function (c) { if (c.parentNode) c.parentNode.removeChild(c); });
      clones = [];
    }

    function svgEl(name, attrs) {
      var n = document.createElementNS("http://www.w3.org/2000/svg", name);
      Object.keys(attrs || {}).forEach(function (k) {
        if (attrs[k] != null) n.setAttribute(k, attrs[k]);
      });
      return n;
    }

    function compile(slideFn) {
      var beats = [];
      var group = null;
      var registry = {};
      svg.setAttribute("viewBox", "0 0 610 570");
      svg.innerHTML = "";
      labs.innerHTML = "";
      eqEl.innerHTML = "";
      descEl.innerHTML = "";
      descEl.style.opacity = "0";
      noteEl.textContent = "";
      noteEl.style.opacity = "0";

      function add(beat) {
        if (group) group.push(beat);
        else beats.push(beat);
      }

      function X(x) { return map.ox + x * map.u; }
      function Y(y) { return map.oy - y * map.u; }
      var strokes = [];
      var dots = [];

      function placeTag(x, y, spec) {
        var div = document.createElement("div");
        div.className = "tag";
        div.dataset.ax = String(X(x));
        div.dataset.ay = String(Y(y));
        div.style.left = (X(x) + (spec.dx || 0)) + "px";
        div.style.top = (Y(y) + (spec.dy || 0)) + "px";
        if (spec.anchor === "mid") div.style.transform = "translate(-50%,-50%)";
        if (spec.anchor === "end") div.style.transform = "translate(-100%,-50%)";
        var parts = spec.parts || [{ tex: spec.tex, color: spec.color, id: spec.id }];
        parts.forEach(function (p) {
          var s = document.createElement("span");
          s.className = "part";
          s.innerHTML = kx(p.tex, p.color || INK);
          s.dataset.tex = p.tex;
          s.dataset.color = p.color || INK;
          s.style.opacity = "0";
          if (p.id) registry[p.id] = s;
          div.appendChild(s);
        });
        labs.appendChild(div);
        return div;
      }

      function fadeParts(div, t) {
        Array.prototype.forEach.call(div.children, function (ch) {
          ch.style.opacity = String(ease(t));
        });
      }

      var api = {
        together: function (fn) {
          var prev = group;
          group = [];
          fn();
          var items = group;
          group = prev;
          if (!items.length) return;
          add({
            dur: Math.max.apply(null, items.map(function (b) { return b.dur; })),
            run: function (t) { items.forEach(function (b) { b.run(t); }); },
            done: function () { items.forEach(function (b) { if (b.done) b.done(); }); }
          });
        },
        desc: function (tex) {
          descEl.innerHTML = kx(tex);
          add({
            dur: 420,
            run: function (t) { descEl.style.opacity = String(ease(t)); },
            done: function () { descEl.style.opacity = "1"; }
          });
        },
        note: function () {},
        step: function () {
          add({ dur: 0, barrier: true, run: function () {}, done: function () {} });
        },
        plane: function (opt) {
          var x0 = opt.x0, x1 = opt.x1, y0 = opt.y0, y1 = opt.y1;
          var spanX = Math.max(1, x1 - x0), spanY = Math.max(1, y1 - y0);
          var padX = spanX * 0.08, padY = spanY * 0.08;
          if (x0 >= 0) x0 = -padX;
          if (x1 <= 0) x1 = padX;
          if (y0 >= 0) y0 = -padY;
          if (y1 <= 0) y1 = padY;
          var pad = 52;
          var u = Math.min((610 - 2 * pad) / (x1 - x0), (570 - 2 * pad) / (y1 - y0));
          var gw = (x1 - x0) * u, gh = (y1 - y0) * u;
          map = {
            u: u,
            ox: (610 - gw) / 2 - x0 * u,
            oy: (570 + gh) / 2 + y0 * u
          };
          var g = svgEl("g");
          var step = opt.grid == null ? 1 : opt.grid;
          if (step) {
            var i;
            for (i = Math.ceil(x0); i <= Math.floor(x1); i += step) {
              g.appendChild(svgEl("line", {
                x1: X(i), y1: Y(y0), x2: X(i), y2: Y(y1),
                stroke: "rgba(148,163,184,0.16)", "stroke-width": i === 0 ? 0 : 1
              }));
            }
            for (i = Math.ceil(y0); i <= Math.floor(y1); i += step) {
              if (i === 0) continue;
              g.appendChild(svgEl("line", {
                x1: X(x0), y1: Y(i), x2: X(x1), y2: Y(i),
                stroke: "rgba(148,163,184,0.16)", "stroke-width": 1
              }));
            }
          }
          if (!svg.querySelector("#axis-head")) {
            var defs = svgEl("defs", {});
            var marker = svgEl("marker", {
              id: "axis-head",
              viewBox: "0 0 10 10",
              markerWidth: "7",
              markerHeight: "7",
              refX: "8",
              refY: "5",
              orient: "auto",
              markerUnits: "strokeWidth"
            });
            marker.appendChild(svgEl("path", { d: "M0,0 L10,5 L0,10 Z", fill: "#cbd5e1" }));
            defs.appendChild(marker);
            svg.appendChild(defs);
          }
          var axisAttr = {
            stroke: "#cbd5e1",
            "stroke-width": "1.7",
            "marker-end": "url(#axis-head)"
          };
          var xAxis = { x1: X(x0), y1: Y(0), x2: X(x1), y2: Y(0) };
          var yAxis = { x1: X(0), y1: Y(y0), x2: X(0), y2: Y(y1) };
          g.appendChild(svgEl("line", Object.assign({}, xAxis, axisAttr)));
          g.appendChild(svgEl("line", Object.assign({}, yAxis, axisAttr)));
          strokes.push({ x1: xAxis.x1, y1: xAxis.y1, x2: xAxis.x2, y2: xAxis.y2, w: 1.7 });
          strokes.push({ x1: yAxis.x1, y1: yAxis.y1, x2: yAxis.x2, y2: yAxis.y2, w: 1.7 });
          g.style.opacity = "0";
          svg.appendChild(g);
          var xl = placeTag(x1 - 0.15, 0, { tex: "x", color: MUTED, dx: -6, dy: 16 });
          var yl = placeTag(0, y1 - 0.05, { tex: "y", color: MUTED, dx: 8, dy: -4 });
          add({
            dur: 380,
            run: function (t) {
              var e = ease(t);
              g.style.opacity = String(e);
              fadeParts(xl, t);
              fadeParts(yl, t);
            },
            done: function () { g.style.opacity = "1"; fadeParts(xl, 1); fadeParts(yl, 1); }
          });
        },
        dot: function (x, y, spec) {
          spec = spec || {};
          var c = svgEl("circle", {
            cx: X(x), cy: Y(y), r: spec.r || 6,
            fill: spec.color || INK,
            stroke: "#0f172a", "stroke-width": 1.5
          });
          c.style.opacity = "0";
          svg.appendChild(c);
          dots.push({ x: X(x), y: Y(y), r: spec.r || 6 });
          var tag = null;
          if (spec.tex || spec.parts) {
            tag = placeTag(x, y, spec);
          }
          add({
            dur: 360,
            run: function (t) {
              c.style.opacity = String(ease(t));
              if (tag) fadeParts(tag, t);
            },
            done: function () {
              c.style.opacity = "1";
              if (tag) fadeParts(tag, 1);
            }
          });
        },
        label: function (x, y, spec) {
          var tag = placeTag(x, y, spec);
          add({
            dur: 360,
            run: function (t) { fadeParts(tag, t); },
            done: function () { fadeParts(tag, 1); }
          });
        },
        circle: function (cx, cy, r, opt) {
          opt = opt || {};
          var node = svgEl("circle", {
            cx: X(cx), cy: Y(cy), r: Math.abs(r) * map.u,
            fill: opt.fill || "rgba(102,187,106,0.10)",
            stroke: opt.color || GREEN,
            "stroke-width": opt.width || 3
          });
          node.style.opacity = "0";
          svg.appendChild(node);
          add({
            dur: 700,
            run: function (t) { node.style.opacity = String(ease(t)); },
            done: function () { node.style.opacity = "1"; }
          });
        },
        line: function (x1, y1, x2, y2, opt) {
          opt = opt || {};
          var node = svgEl("line", {
            x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2),
            stroke: opt.color || INK,
            "stroke-width": opt.width || 4,
            "stroke-linecap": "round"
          });
          node.style.opacity = "0";
          svg.appendChild(node);
          strokes.push({
            x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2), w: opt.width || 4
          });
          add({
            dur: opt.dash ? 420 : 640,
            run: function (t) {
              var e = ease(t);
              var xA = +node.getAttribute("x1"), yA = +node.getAttribute("y1");
              var xB = +node.getAttribute("x2"), yB = +node.getAttribute("y2");
              var L = Math.hypot(xB - xA, yB - yA) || 1;
              node.style.opacity = "1";
              if (opt.dash) {
                node.setAttribute("stroke-dasharray", "7 6");
                node.style.opacity = String(e);
              } else {
                node.setAttribute("stroke-dasharray", String(L));
                node.setAttribute("stroke-dashoffset", String(L * (1 - e)));
              }
            },
            done: function () {
              node.style.opacity = "1";
              if (!opt.dash) {
                node.style.strokeDasharray = "none";
                node.setAttribute("stroke-dasharray", "none");
                node.setAttribute("stroke-dashoffset", "0");
              }
            }
          });
          return node;
        },
        poly: function (pts, opt) {
          opt = opt || {};
          var node = svgEl("polygon", {
            points: pts.map(function (p) { return X(p[0]) + "," + Y(p[1]); }).join(" "),
            fill: opt.fill || "rgba(79,195,247,0.16)",
            stroke: "none"
          });
          node.style.opacity = "0";
          svg.insertBefore(node, svg.firstChild);
          add({
            dur: 380,
            run: function (t) { node.style.opacity = String(ease(t)); },
            done: function () { node.style.opacity = "1"; }
          });
        },
        right: function (x, y, ux, uy, vx, vy, opt) {
          opt = opt || {};
          var s = opt.s || 0.28;
          var ul = Math.hypot(ux, uy) || 1;
          var vl = Math.hypot(vx, vy) || 1;
          ux /= ul; uy /= ul; vx /= vl; vy /= vl;
          var p0 = [x + ux * s, y + uy * s];
          var p1 = [p0[0] + vx * s, p0[1] + vy * s];
          var p2 = [x + vx * s, y + vy * s];
          strokes.push({ x1: X(p0[0]), y1: Y(p0[1]), x2: X(p1[0]), y2: Y(p1[1]), w: 2 });
          strokes.push({ x1: X(p1[0]), y1: Y(p1[1]), x2: X(p2[0]), y2: Y(p2[1]), w: 2 });
          var node = svgEl("polyline", {
            points: [p0, p1, p2].map(function (p) { return X(p[0]) + "," + Y(p[1]); }).join(" "),
            fill: "none",
            stroke: opt.color || INK,
            "stroke-width": 2
          });
          node.style.opacity = "0";
          svg.appendChild(node);
          add({
            dur: 280,
            run: function (t) { node.style.opacity = String(ease(t)); },
            done: function () { node.style.opacity = "1"; }
          });
        },
        formula: function (parts) {
          var wrap = document.createElement("div");
          wrap.className = "row-wrap";
          var row = document.createElement("div");
          row.className = "row";
          wrap.appendChild(row);
          eqEl.appendChild(wrap);
          function atom(p) {
            var s = document.createElement("span");
            s.className = "part";
            if (p.eq) {
              s.className = "part eqsign";
              s.innerHTML = kx("=", p.color || INK, true);
              s.dataset.tex = "=";
              s.dataset.color = p.color || INK;
            } else if (p.fly) {
              var src = registry[p.fly];
              var tex = (src && src.dataset.tex) || p.tex || "?";
              var color = (src && src.dataset.color) || p.color || INK;
              s.innerHTML = kx(tex, color, true);
              s.dataset.tex = tex;
              s.dataset.color = color;
            } else {
              s.innerHTML = kx(p.w || p.tex || "", p.color || INK, true);
              s.dataset.tex = p.w || p.tex || "";
              s.dataset.color = p.color || INK;
            }
            s.style.opacity = "0";
            if (p.id) registry[p.id] = s;
            return { el: s, fly: p.fly || null, bar: null };
          }
          var slots = [];
          parts.forEach(function (p) {
            if (p.frac) {
              var box = document.createElement("span");
              box.className = "frac";
              var bar = document.createElement("span");
              bar.className = "fbar";
              bar.style.opacity = "0";
              var numHost = document.createElement("span");
              numHost.className = "frac-side";
              var denHost = document.createElement("span");
              denHost.className = "frac-side";
              function take(spec, host) {
                var list = Array.isArray(spec) ? spec : [spec || {}];
                list.forEach(function (item) {
                  var made = atom(item);
                  made.bar = bar;
                  host.appendChild(made.el);
                  slots.push(made);
                });
              }
              take(p.frac.num, numHost);
              take(p.frac.den, denHost);
              box.appendChild(numHost);
              box.appendChild(bar);
              box.appendChild(denHost);
              row.appendChild(box);
            } else {
              var one = atom(p);
              row.appendChild(one.el);
              slots.push(one);
            }
          });
          var opened = 0;
          var gap = 0.42;
          row.querySelectorAll(".mfrac").forEach(function (mf) {
            if (mf.querySelector(".mfrac")) return;
            var v = mf.querySelector(":scope > .vlist, .vlist");
            if (!v || v.children.length < 3) return;
            var den = v.children[0];
            var num = v.children[v.children.length - 1];
            var dt = parseFloat(den.style.top);
            var nt = parseFloat(num.style.top);
            if (!isNaN(dt)) den.style.top = (dt + gap) + "em";
            if (!isNaN(nt)) num.style.top = (nt - gap) + "em";
            var h = parseFloat(v.style.height);
            if (!isNaN(h)) v.style.height = (h + gap * 2) + "em";
            opened++;
          });
          if (opened) {
            var pad = Math.ceil(gap * 32);
            row.style.paddingTop = pad + "px";
            row.style.paddingBottom = (pad + 10) + "px";
          }
          var naturalH = Math.max(row.querySelector(".frac") ? 92 : 48, row.offsetHeight || 48);
          var naturalW = row.scrollWidth || 1;
          if (naturalW > 570) {
            var sc = 570 / naturalW;
            row.style.transform = "scale(" + sc + ")";
            row.style.transformOrigin = "left center";
            wrap.style.height = Math.ceil(naturalH * sc) + "px";
          } else {
            wrap.style.height = naturalH + "px";
          }
          if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
          var placed = false;
          function place() {
            if (placed) return;
            placed = true;
            eqEl.appendChild(wrap);
          }
          var bucket = [];
          function flush() {
            if (!bucket.length) return;
            var items = bucket.slice();
            bucket = [];
            add({
              dur: 880,
              run: function (t) { place(); flyGroup(items, t); },
              done: function () { place(); flyGroup(items, 1, true); }
            });
          }
          slots.forEach(function (slot) {
            if (slot.fly) bucket.push(slot);
            else {
              flush();
              add({
                dur: 340,
                run: function (t) {
                  place();
                  var e = ease(t);
                  slot.el.style.opacity = String(e);
                  if (slot.bar) slot.bar.style.opacity = String(Math.max(e, parseFloat(slot.bar.style.opacity) || 0));
                },
                done: function () {
                  place();
                  slot.el.style.opacity = "1";
                  if (slot.bar) slot.bar.style.opacity = "1";
                }
              });
            }
          });
          flush();
        },
        clearFormula: function () {
          add({
            dur: 180,
            run: function (t) { eqEl.style.opacity = String(1 - ease(t)); },
            done: function () { eqEl.innerHTML = ""; eqEl.style.opacity = "1"; }
          });
        }
      };

      function flyGroup(items, t, finish) {
        var e = ease(t);
        items.forEach(function (slot) {
          if (!slot.ghost) {
            var src = registry[slot.fly];
            if (!src) { slot.el.style.opacity = "1"; return; }
            var ghost = document.createElement("div");
            ghost.className = "fly";
            ghost.innerHTML = src.innerHTML;
            document.body.appendChild(ghost);
            var w = ghost.offsetWidth || 1, h = ghost.offsetHeight || 1;
            var sr = src.getBoundingClientRect();
            var tr = slot.el.getBoundingClientRect();
            slot.ghost = ghost;
            slot.s0 = Math.min(1, (sr.height || h) / h);
            slot.s1 = Math.min(1, (tr.height || h) / h);
            slot.x0 = sr.left + sr.width / 2 - w / 2;
            slot.y0 = sr.top + sr.height / 2 - h / 2;
            slot.x1 = tr.left + tr.width / 2 - w / 2;
            slot.y1 = tr.top + tr.height / 2 - h / 2;
            clones.push(ghost);
          }
          var g = slot.ghost;
          var sc = lerp(slot.s0 || 1, slot.s1 || 1, e);
          g.style.transformOrigin = "center center";
          g.style.transform = "scale(" + sc + ")";
          g.style.left = lerp(slot.x0, slot.x1, e) + "px";
          g.style.top = lerp(slot.y0, slot.y1, e) + "px";
          if (slot.bar) slot.bar.style.opacity = String(Math.max(e, parseFloat(slot.bar.style.opacity) || 0));
          if (finish || t >= 1) {
            slot.el.style.opacity = "1";
            if (slot.bar) slot.bar.style.opacity = "1";
            if (g.parentNode) g.parentNode.removeChild(g);
            slot.ghost = null;
          } else {
            slot.el.style.opacity = "0";
          }
        });
      }

      slideFn(api);

      function tagBox(div) {
        var left = parseFloat(div.style.left) || 0;
        var top = parseFloat(div.style.top) || 0;
        var w = div.offsetWidth || 0;
        var h = div.offsetHeight || 0;
        var tf = div.style.transform || "";
        var ox = 0, oy = 0;
        if (tf.indexOf("-100%") >= 0) ox = -w;
        else if (tf.indexOf("-50%") >= 0) ox = -w / 2;
        if (tf.indexOf("-50%") >= 0) oy = -h / 2;
        return {
          div: div, w: w, h: h,
          L: left + ox, T: top + oy, R: left + ox + w, B: top + oy + h,
          cx: left + ox + w / 2, cy: top + oy + h / 2
        };
      }
      function shiftTag(box, dx, dy) {
        if (!dx && !dy) return;
        var home = box.home;
        var left = (parseFloat(box.div.style.left) || 0) + dx;
        var top = (parseFloat(box.div.style.top) || 0) + dy;
        var ox = left - home.left, oy = top - home.top;
        var od = Math.hypot(ox, oy);
        if (od > 26) {
          left = home.left + ox / od * 26;
          top = home.top + oy / od * 26;
          dx = left - (parseFloat(box.div.style.left) || 0);
          dy = top - (parseFloat(box.div.style.top) || 0);
        }
        box.div.style.left = left + "px";
        box.div.style.top = top + "px";
        box.L += dx; box.R += dx; box.T += dy; box.B += dy;
        box.cx += dx; box.cy += dy;
      }
      function fromSegment(b, s) {
        var dx = s.x2 - s.x1, dy = s.y2 - s.y1;
        var sl = Math.hypot(dx, dy) || 1;
        var tx = dx / sl, ty = dy / sl;
        var nx = -ty, ny = tx;
        var signed = (b.cx - s.x1) * nx + (b.cy - s.y1) * ny;
        var halfN = b.w / 2 * Math.abs(nx) + b.h / 2 * Math.abs(ny);
        var need = halfN + s.w / 2 + 3;
        if (Math.abs(signed) >= need) return null;
        var b0 = Infinity, b1 = -Infinity;
        [[b.L, b.T], [b.R, b.T], [b.L, b.B], [b.R, b.B]].forEach(function (c) {
          var p = (c[0] - s.x1) * tx + (c[1] - s.y1) * ty;
          if (p < b0) b0 = p;
          if (p > b1) b1 = p;
        });
        if (b1 < -2 || b0 > sl + 2) return null;
        var dir = signed >= 0 ? 1 : -1;
        if (Math.abs(signed) < 2) {
          var side = (b.cx - parseFloat(b.div.dataset.ax)) * nx + (b.cy - parseFloat(b.div.dataset.ay)) * ny;
          if (Math.abs(side) > 0.4) dir = side > 0 ? 1 : -1;
        }
        var push = Math.min(18, need - Math.abs(signed));
        return { x: nx * dir * push, y: ny * dir * push, len: push };
      }
      function fromDot(b, d) {
        var cx = Math.max(b.L, Math.min(d.x, b.R));
        var cy = Math.max(b.T, Math.min(d.y, b.B));
        var dist = Math.hypot(d.x - cx, d.y - cy);
        var need = d.r + 5;
        if (dist >= need) return null;
        var vx = b.cx - d.x, vy = b.cy - d.y;
        var len = Math.hypot(vx, vy);
        if (len < 0.5) {
          vx = b.cx - parseFloat(b.div.dataset.ax);
          vy = b.cy - parseFloat(b.div.dataset.ay);
          len = Math.hypot(vx, vy);
          if (len < 0.5) { vx = 0; vy = 1; len = 1; }
        }
        var push = Math.min(28, need - dist + 2);
        return { x: vx / len * push, y: vy / len * push, len: push };
      }
      var boxes = [];
      Array.prototype.forEach.call(labs.children, function (div) {
        var box = tagBox(div);
        box.home = { left: parseFloat(div.style.left) || 0, top: parseFloat(div.style.top) || 0 };
        boxes.push(box);
      });
      var pass;
      for (pass = 0; pass < 8; pass++) {
        var moved = false;
        boxes.forEach(function (b) {
          if (b.w < 1 || b.h < 1) return;
          var px = 0, py = 0, best = null;
          strokes.forEach(function (s) {
            var esc = fromSegment(b, s);
            if (!esc) return;
            px += esc.x; py += esc.y;
            if (!best || esc.len > best.len) best = esc;
          });
          dots.forEach(function (d) {
            var esc = fromDot(b, d);
            if (!esc) return;
            px += esc.x; py += esc.y;
            if (!best || esc.len > best.len) best = esc;
          });
          if (best && Math.hypot(px, py) < 1.5) { px = best.x; py = best.y; }
          if (px || py) { shiftTag(b, px, py); moved = true; }
        });
        var i, j;
        for (i = 0; i < boxes.length; i++) {
          for (j = i + 1; j < boxes.length; j++) {
            var a = boxes[i], c = boxes[j];
            var pad = 2;
            var overlapX = Math.min(a.R, c.R) - Math.max(a.L, c.L) + pad;
            var overlapY = Math.min(a.B, c.B) - Math.max(a.T, c.T) + pad;
            if (overlapX <= 0 || overlapY <= 0) continue;
            var move = Math.min(8, Math.min(overlapX, overlapY) / 2 + 1);
            if (overlapX < overlapY) {
              var dirx = c.cx >= a.cx ? 1 : -1;
              shiftTag(a, -dirx * move, 0);
              shiftTag(c, dirx * move, 0);
            } else {
              var diry = c.cy >= a.cy ? 1 : -1;
              shiftTag(a, 0, -diry * move);
              shiftTag(c, 0, diry * move);
            }
            moved = true;
          }
        }
        if (!moved) break;
      }
      for (pass = 0; pass < 4; pass++) {
        var again = false;
        boxes.forEach(function (b) {
          if (b.w < 1 || b.h < 1) return;
          var px = 0, py = 0, best = null;
          strokes.forEach(function (s) {
            var esc = fromSegment(b, s);
            if (!esc) return;
            px += esc.x; py += esc.y;
            if (!best || esc.len > best.len) best = esc;
          });
          dots.forEach(function (d) {
            var esc = fromDot(b, d);
            if (!esc) return;
            px += esc.x; py += esc.y;
            if (!best || esc.len > best.len) best = esc;
          });
          if (best && Math.hypot(px, py) < 1.5) { px = best.x; py = best.y; }
          if (px || py) { shiftTag(b, px, py); again = true; }
        });
        if (!again) break;
      }
      boxes.forEach(function (b) {
        var fresh = tagBox(b.div);
        var dx = 0, dy = 0;
        if (fresh.L < 2) dx = 2 - fresh.L;
        else if (fresh.R > 606) dx = 606 - fresh.R;
        if (fresh.T < 2) dy = 2 - fresh.T;
        else if (fresh.B > 566) dy = 566 - fresh.B;
        if (dx || dy) {
          b.div.style.left = ((parseFloat(b.div.style.left) || 0) + dx) + "px";
          b.div.style.top = ((parseFloat(b.div.style.top) || 0) + dy) + "px";
        }
      });
      return beats;
    }

    function show(i) {
      clearClones();
      index = i;
      beats = compile(deck.slides[i]);
      bi = 0;
      acc = 0;
      completedSteps = 0;
      done = beats.length === 0;
      playing = true;
      countEl.textContent = (i + 1) + "  /  " + deck.slides.length;
      last = performance.now();
    }

    function finishBeat(b) { if (b.done) b.done(); else if (b.run) b.run(1); }

    function endStep() {
      completedSteps++;
      done = true;
      acc = 0;
      playing = true;
      clearClones();
    }

    function fastForward(stepsToFinish) {
      clearClones();
      beats = compile(deck.slides[index]);
      bi = 0;
      var finished = 0;
      while (bi < beats.length && finished < stepsToFinish) {
        if (beats[bi].barrier) {
          bi++;
          finished++;
          continue;
        }
        finishBeat(beats[bi]);
        bi++;
        if (bi >= beats.length || beats[bi].barrier) {
          if (bi < beats.length && beats[bi].barrier) bi++;
          finished++;
        }
      }
      completedSteps = finished;
      done = true;
      acc = 0;
      playing = true;
      clearClones();
    }

    function tick(dt) {
      if (!playing || done) return;
      acc += dt;
      while (!done && beats[bi] && acc >= beats[bi].dur) {
        acc -= beats[bi].dur;
        if (beats[bi].barrier) {
          bi++;
          endStep();
          return;
        }
        finishBeat(beats[bi]);
        bi++;
        if (bi >= beats.length) {
          endStep();
          return;
        }
        if (beats[bi] && beats[bi].barrier) {
          bi++;
          endStep();
          return;
        }
      }
      if (!done && beats[bi]) {
        if (beats[bi].barrier) {
          bi++;
          endStep();
          return;
        }
        var b = beats[bi];
        b.run(b.dur ? acc / b.dur : 1);
      }
    }

    function finishCurrentStep() {
      while (bi < beats.length && !beats[bi].barrier) {
        finishBeat(beats[bi]);
        bi++;
      }
      if (bi < beats.length && beats[bi].barrier) bi++;
      endStep();
    }

    function next() {
      if (!done) {
        finishCurrentStep();
        return;
      }
      if (bi < beats.length) {
        done = false;
        playing = true;
        acc = 0;
        last = performance.now();
        return;
      }
      if (index >= deck.slides.length - 1) return;
      show(index + 1);
    }
    function back() {
      var started = completedSteps > 0 || bi > 0 || !done;
      var showCount = done ? completedSteps - 1 : completedSteps;
      if (started && showCount >= 1) {
        fastForward(showCount);
        return;
      }
      if (started) {
        fastForward(0);
        return;
      }
      if (index <= 0) return;
      index -= 1;
      countEl.textContent = (index + 1) + "  /  " + deck.slides.length;
      fastForward(99);
    }
    function onSpace() {
      if (done) next();
      else playing = !playing;
    }

    function loop(now) {
      var dt = Math.min(48, now - last);
      last = now;
      tick(dt);
      requestAnimationFrame(loop);
    }

    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
      else if (e.key === " ") { e.preventDefault(); onSpace(); }
    });
    board.addEventListener("click", function () { next(); });

    function finishNow() {
      while (bi < beats.length) {
        if (!beats[bi].barrier) finishBeat(beats[bi]);
        bi++;
      }
      done = true;
      clearClones();
    }

    window.KOC = {
      api: {
        advance: next,
        back: back,
        toggle: onSpace,
        finish: finishNow
      }
    };

    show(0);
    requestAnimationFrame(loop);
  }

  window.JM33 = {
    BLUE: BLUE, AMBER: AMBER, GREEN: GREEN, PINK: PINK, VIOLET: VIOLET,
    INK: INK, MUTED: MUTED, RED: RED,
    start: function (deck) { mount(document.getElementById("app"), deck); }
  };
})();
