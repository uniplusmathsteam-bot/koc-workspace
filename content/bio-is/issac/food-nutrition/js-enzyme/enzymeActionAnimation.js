/**
 * Fig 4.3 — Action of an enzyme (lock and key, catabolism).
 * 4 steps: intro → approach+dock → recolor → release (PPT slides 34–38).
 */
(function (global) {
  "use strict";

  var STEPS = [
    {
      id: "intro",
      badge: 1,
      slide: 34,
      en: "The enzyme and substrate are shown before the reaction begins.",
      zh: "酶（enzyme）同底物（substrate）喺反應開始前靜止展示。",
      duration: 2800,
    },
    {
      id: "approachDock",
      badge: 2,
      slide: 35,
      en: "The substrate moves toward the enzyme and its active site. The substrate fits exactly into the active site — enzyme–substrate complex (lock and key).",
      zh: "底物（substrate）移向酶（enzyme）的活性部位（active site）。底物形狀與活性部位完全吻合，形成酶—底物複合物（lock and key 假說）。",
      duration: 6200,
    },
    {
      id: "recolor",
      badge: 3,
      slide: 37,
      en: "The substrate slowly changes colour — purple on one side and yellow on the other.",
      zh: "底物慢慢變色：一邊變成紫色，另一邊變成黃色（產物 products 的顏色）。",
      duration: 3600,
    },
    {
      id: "release",
      badge: 4,
      slide: 38,
      en: "The substrate breaks into two products and leaves the enzyme. The enzyme is unchanged.",
      zh: "底物分成兩個產物並離開酶，酶結構不變，可再次催化新底物。",
      duration: 4000,
    },
  ];

  var SH = (typeof global !== "undefined" && global.ENZYME_SHAPES) || {};
  var COLORS = SH.colors || {
    enzyme: "#89C2EB",
    enzymeEdge: "#6AABD8",
    substrate: "#F88A8A",
    substrateEdge: "#E07070",
    productA: "#8E82BD",
    productAEdge: "#7568A8",
    productB: "#E8B84A",
    productBEdge: "#D99A20",
  };

  var ENZYME_PATH =
    SH.enzyme ||
    "M 8 72 L 132 72 C 150 72 156 44 144 24 L 108 24 L 76 24 L 76 36 A 10 10 0 0 0 56 36 L 56 24 L 36 24 L 30 36 L 24 24 L 12 24 C 0 44 -2 72 8 72 Z";

  var SUBSTRATE_PATH =
    SH.substrate ||
    "M 12 54 L 24 54 L 30 66 L 36 54 L 56 54 L 56 66 A 10 10 0 0 1 76 66 L 76 54 A 42 42 0 0 0 12 54 Z";

  var SPLIT_X = SH.splitX != null ? SH.splitX : 56;
  var CLIP = SH.productClip || { y: 0, height: 100 };

  var LBL = SH.labels || {
    enzyme: { x: 70, y: 58 },
    substrate: { x: 44, y: 30 },
    complex: { x: 70, y: 62, fontSize: 5.5 },
    productLeft: { x: 32, y: 30 },
    productRight: { x: 66, y: 30 },
  };
  var LAYOUT = SH.layout || {};
  var MODEL_SCALE = SH.modelScale != null ? SH.modelScale : 1.25;
  var SCENE = SH.scene || { w: 520, h: 300 };
  var SCENE_CX = SCENE.w / 2;
  var PIVOT = SH.pivot || { x: 204, y: 128 };
  var SCENE_ORIGIN = { x: SCENE_CX, y: 150 };
  var ANCHOR_X = LAYOUT.anchorX != null ? LAYOUT.anchorX : 128;
  var ENZ = Object.assign({ x: ANCHOR_X, y: 82 }, LAYOUT.enz, { x: ANCHOR_X });
  var SUB = Object.assign(
    { x: ANCHOR_X, introY: -26, bindY: 42, complexY: 52 },
    LAYOUT.sub,
    { x: ANCHOR_X },
  );
  var PROD_SPREAD = (LAYOUT.prod && LAYOUT.prod.spread) || 30;
  var STEP_HOLD_MS = 700;
  var APPROACH_END = 0.42;

  var MODELS_TRANSFORM =
    "translate(" +
    SCENE_ORIGIN.x +
    ", " +
    SCENE_ORIGIN.y +
    ") scale(" +
    MODEL_SCALE +
    ") translate(" +
    -PIVOT.x +
    "," +
    -PIVOT.y +
    ")";

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function lerpColor(c0, c1, t) {
    t = clamp(t, 0, 1);
    var r0 = parseInt(c0.slice(1, 3), 16);
    var g0 = parseInt(c0.slice(3, 5), 16);
    var b0 = parseInt(c0.slice(5, 7), 16);
    var r1 = parseInt(c1.slice(1, 3), 16);
    var g1 = parseInt(c1.slice(3, 5), 16);
    var b1 = parseInt(c1.slice(5, 7), 16);
    return (
      "#" +
      [Math.round(lerp(r0, r1, t)), Math.round(lerp(g0, g1, t)), Math.round(lerp(b0, b1, t))]
        .map(function (v) {
          return v.toString(16).padStart(2, "0");
        })
        .join("")
    );
  }
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function prog(stepIdx, localT) {
    return clamp(localT / STEPS[stepIdx].duration, 0, 1);
  }
  function stepSettled(anim, stepIdx, p) {
    if (anim._holdStart) return true;
    if (p >= 0.999) return true;
    if (!anim.playing && anim.localT >= STEPS[stepIdx].duration - 16) return true;
    return false;
  }

  function EnzymeActionAnimation(root, hooks) {
    if (!root) throw new Error("EnzymeActionAnimation: missing root element");
    this.root = root;
    this.hooks = hooks || {};
    this.loop = this.hooks.loop === true;
    this.stepIndex = 0;
    this.localT = 0;
    this.playing = true;
    this.lastTs = 0;
    this.raf = null;
    this._holdStart = 0;
    this._uid = "enz-" + Math.random().toString(36).slice(2, 9);

    root.innerHTML =
      '<div class="enz-scene">' +
      '<svg viewBox="0 0 ' +
      SCENE.w +
      " " +
      SCENE.h +
      '" role="img" aria-label="Enzyme catalytic cycle">' +
      "<defs>" +
      '<clipPath id="' +
      this._uid +
      '-clip-left"><rect x="0" y="' +
      CLIP.y +
      '" width="' +
      SPLIT_X +
      '" height="' +
      CLIP.height +
      '"/></clipPath>' +
      '<clipPath id="' +
      this._uid +
      '-clip-right"><rect x="' +
      SPLIT_X +
      '" y="' +
      CLIP.y +
      '" width="' +
      (88 - SPLIT_X) +
      '" height="' +
      CLIP.height +
      '"/></clipPath></defs>' +
      '<g data-id="models" transform="' +
      MODELS_TRANSFORM +
      '">' +
      '<g data-id="enzyme"></g>' +
      '<g data-id="substrate"></g>' +
      '<g data-id="products"></g>' +
      "</g>" +
      '<g data-id="badges"></g>' +
      "</svg></div>";

    this.gEnzyme = root.querySelector('[data-id="enzyme"]');
    this.gSubstrate = root.querySelector('[data-id="substrate"]');
    this.gProducts = root.querySelector('[data-id="products"]');
    this.gBadges = root.querySelector('[data-id="badges"]');

    this._drawStaticShapes();
    this._tick = this._tick.bind(this);
    this._applyFrame();
    this._emitStep();
    this.raf = requestAnimationFrame(this._tick);
  }

  EnzymeActionAnimation.prototype._drawStaticShapes = function () {
    var complexFont = LBL.complex.fontSize || 5.5;
    this.gEnzyme.innerHTML =
      '<g transform="translate(' +
      ENZ.x +
      "," +
      ENZ.y +
      ')">' +
      '<path d="' +
      ENZYME_PATH +
      '" fill="' +
      COLORS.enzyme +
      '" stroke="none"/>' +
      '<text data-id="enzyme-word" x="' +
      LBL.enzyme.x +
      '" y="' +
      LBL.enzyme.y +
      '" text-anchor="middle" fill="#4a7a9e" font-size="10" font-weight="600" opacity="0">enzyme</text>' +
      '<text data-id="complex-word" x="' +
      LBL.complex.x +
      '" y="' +
      LBL.complex.y +
      '" text-anchor="middle" fill="#4a7a9e" font-size="' +
      complexFont +
      '" font-weight="600" opacity="0">enzyme–substrate complex</text>' +
      "</g>";
    var badgeSpacing = (LAYOUT.badges && LAYOUT.badges.spacing) || 40;
    var badgeStartCx = SCENE_CX - ((STEPS.length - 1) * badgeSpacing) / 2;
    var badges = "";
    for (var n = 1; n <= STEPS.length; n++) {
      var cx = badgeStartCx + (n - 1) * badgeSpacing;
      badges +=
        '<circle cx="' +
        cx +
        '" cy="268" r="14" fill="#ddd" stroke="#999" data-badge="' +
        n +
        '"/>' +
        '<text x="' +
        cx +
        '" y="272" text-anchor="middle" fill="#666" font-size="12" font-weight="700" data-badge-t="' +
        n +
        '">' +
        n +
        "</text>";
    }
    this.gBadges.innerHTML = badges;
  };

  EnzymeActionAnimation.prototype._substrateHtml = function (y, showLabel) {
    var label = showLabel
      ? '<text x="' +
        LBL.substrate.x +
        '" y="' +
        LBL.substrate.y +
        '" text-anchor="middle" fill="#c04040" font-size="8" font-weight="600">substrate</text>'
      : "";
    return (
      '<g transform="translate(' +
      SUB.x +
      "," +
      y +
      ')">' +
      '<path d="' +
      SUBSTRATE_PATH +
      '" fill="' +
      COLORS.substrate +
      '" stroke="none"/>' +
      label +
      "</g>"
    );
  };

  /** Products = full substrate path clipped left/right (identical y-axis to red substrate) */
  EnzymeActionAnimation.prototype._productsHtml = function (releaseP, lift, colorMix, showLabels) {
    var mix = clamp(colorMix, 0, 1);
    var purpleFill = lerpColor(COLORS.substrate, COLORS.productA, mix);
    var yellowFill = lerpColor(COLORS.substrate, COLORS.productB, mix);
    var y = SUB.complexY + lift;
    var rp = easeInOut(clamp(releaseP, 0, 1));
    var dist = rp * PROD_SPREAD;
    var arc = rp * 22;

    var purTx = -dist - rp * 5;
    var purTy = -arc;
    var yelTx = dist + rp * 5;
    var yelTy = -arc;

    var leftLabel = showLabels
      ? '<text x="' +
        LBL.productLeft.x +
        '" y="' +
        LBL.productLeft.y +
        '" text-anchor="middle" fill="#5a5088" font-size="7" font-weight="600">product</text>'
      : "";
    var rightLabel = showLabels
      ? '<text x="' +
        LBL.productRight.x +
        '" y="' +
        LBL.productRight.y +
        '" text-anchor="middle" fill="#9a7010" font-size="7" font-weight="600">product</text>'
      : "";

    return (
      '<g transform="translate(' +
      SUB.x +
      "," +
      y +
      ')">' +
      '<g transform="translate(' +
      purTx +
      "," +
      purTy +
      ')">' +
      '<g clip-path="url(#' +
      this._uid +
      '-clip-left)">' +
      '<path d="' +
      SUBSTRATE_PATH +
      '" fill="' +
      purpleFill +
      '" stroke="none"/>' +
      "</g>" +
      leftLabel +
      "</g>" +
      '<g transform="translate(' +
      yelTx +
      "," +
      yelTy +
      ')">' +
      '<g clip-path="url(#' +
      this._uid +
      '-clip-right)">' +
      '<path d="' +
      SUBSTRATE_PATH +
      '" fill="' +
      yellowFill +
      '" stroke="none"/>' +
      "</g>" +
      rightLabel +
      "</g></g>"
    );
  };

  EnzymeActionAnimation.prototype._computeFrame = function (stepIndex, p) {
    var subY = SUB.introY;
    var subOp = 0;
    var prodOp = 0;
    var releaseP = 0;
    var prodLift = 0;
    var colorMix = 0;

    if (stepIndex === 0) {
      subY = SUB.introY;
      subOp = 1;
    } else if (stepIndex === 1) {
      if (p < APPROACH_END) {
        var approachT = easeInOut(p / APPROACH_END);
        subY = lerp(SUB.introY, SUB.bindY, approachT);
      } else {
        var dockT = easeInOut((p - APPROACH_END) / (1 - APPROACH_END));
        subY = lerp(SUB.bindY, SUB.complexY, dockT);
      }
      subOp = 1;
    } else if (stepIndex === 2) {
      subOp = 0;
      prodOp = 1;
      releaseP = 0;
      prodLift = 0;
      colorMix = easeInOut(p);
    } else {
      prodOp = 1;
      releaseP = p;
      prodLift = lerp(0, -28, easeOut(p));
      colorMix = 1;
    }

    return {
      subY: subY,
      subOp: subOp,
      prodOp: prodOp,
      releaseP: releaseP,
      prodLift: prodLift,
      colorMix: colorMix,
    };
  };

  EnzymeActionAnimation.prototype._applyFrame = function () {
    var i = this.stepIndex;
    var p = prog(i, this.localT);
    var step = STEPS[i];
    var frame = this._computeFrame(i, p);

    for (var n = 1; n <= STEPS.length; n++) {
      var on = step.badge === n;
      var circle = this.gBadges.querySelector('[data-badge="' + n + '"]');
      var text = this.gBadges.querySelector('[data-badge-t="' + n + '"]');
      if (circle) {
        circle.setAttribute("fill", on ? COLORS.enzyme : "#ddd");
        circle.setAttribute("stroke", on ? COLORS.enzymeEdge : "#999");
      }
      if (text) text.setAttribute("fill", on ? "#fff" : "#666");
    }

    var inStep2Approach = i === 1 && p < APPROACH_END;
    var showSubLabel = frame.subOp > 0.01 && (i === 0 || inStep2Approach);
    this.gSubstrate.innerHTML =
      frame.subOp > 0.01 ? this._substrateHtml(frame.subY, showSubLabel) : "";
    var showProductLabels = i === 3;
    this.gProducts.innerHTML =
      frame.prodOp > 0.01
        ? this._productsHtml(frame.releaseP, frame.prodLift, frame.colorMix, showProductLabels)
        : "";

    var lblEnzyme = this.gEnzyme.querySelector('[data-id="enzyme-word"]');
    var lblComplex = this.gEnzyme.querySelector('[data-id="complex-word"]');
    var showComplex = i === 1 && p >= APPROACH_END;
    var showEnzymeWord = i === 0 || inStep2Approach;

    if (lblComplex) lblComplex.setAttribute("opacity", showComplex ? "1" : "0");
    if (lblEnzyme) lblEnzyme.setAttribute("opacity", showEnzymeWord ? "1" : "0");
  };

  EnzymeActionAnimation.prototype._emitStep = function () {
    if (this.hooks.onStep) this.hooks.onStep(STEPS[this.stepIndex], this.stepIndex);
  };

  EnzymeActionAnimation.prototype._tick = function (ts) {
    if (!this.lastTs) this.lastTs = ts;
    var dt = ts - this.lastTs;
    this.lastTs = ts;

    if (this.playing) {
      var step = STEPS[this.stepIndex];
      if (this._holdStart) {
        if (ts - this._holdStart >= STEP_HOLD_MS) {
          this._holdStart = 0;
          if (this.stepIndex < STEPS.length - 1) {
            this.stepIndex += 1;
            this.localT = 0;
            this._emitStep();
          } else {
            if (this.loop) {
              this.restart();
              if (this.hooks.onLoop) this.hooks.onLoop();
            } else {
              this.localT = step.duration;
              this.playing = false;
              if (this.hooks.onComplete) this.hooks.onComplete();
            }
          }
        }
      } else {
        this.localT += dt;
        if (this.localT >= step.duration) {
          this.localT = step.duration;
          this._holdStart = ts;
        }
      }
    }

    this._applyFrame();
    this.raf = requestAnimationFrame(this._tick);
  };

  EnzymeActionAnimation.prototype._navToStep = function (index, atEnd) {
    this.stepIndex = clamp(index, 0, STEPS.length - 1);
    var step = STEPS[this.stepIndex];
    this.localT = atEnd ? step.duration : 0;
    this._holdStart = 0;
    this._applyFrame();
    this._emitStep();
  };

  EnzymeActionAnimation.prototype.play = function () {
    var last = STEPS.length - 1;
    var step = STEPS[this.stepIndex];
    if (this.stepIndex === last && this.localT >= step.duration) {
      this.restart();
      return;
    }
    if (this.localT >= step.duration - 16 && this.stepIndex < last) {
      this.stepIndex += 1;
      this.localT = 0;
      this._holdStart = 0;
      this._emitStep();
    }
    this.playing = true;
  };
  EnzymeActionAnimation.prototype.pause = function () {
    this.playing = false;
  };
  EnzymeActionAnimation.prototype.toggle = function () {
    if (this.playing) this.pause();
    else this.play();
  };
  EnzymeActionAnimation.prototype.restart = function () {
    this.stepIndex = 0;
    this.localT = 0;
    this.lastTs = 0;
    this._holdStart = 0;
    this.playing = true;
    this._applyFrame();
    this._emitStep();
  };
  EnzymeActionAnimation.prototype.next = function () {
    if (this.stepIndex < STEPS.length - 1) {
      this._navToStep(this.stepIndex + 1, true);
    } else {
      this.localT = STEPS[this.stepIndex].duration;
      this._holdStart = 0;
      this._applyFrame();
    }
  };
  EnzymeActionAnimation.prototype.prev = function () {
    if (this.stepIndex > 0) this._navToStep(this.stepIndex - 1, true);
  };
  EnzymeActionAnimation.prototype.goToStep = function (index, atEnd) {
    this._navToStep(index, atEnd !== false);
  };
  EnzymeActionAnimation.prototype.destroy = function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.root.innerHTML = "";
  };

  global.ENZYME_ANIM_STEPS = STEPS;
  global.EnzymeActionAnimation = EnzymeActionAnimation;
})(typeof window !== "undefined" ? window : globalThis);
