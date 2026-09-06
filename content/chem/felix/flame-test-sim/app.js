(() => {
  "use strict";

  const CATIONS = {
    K: {
      name: "Potassium ion",
      colourName: "lilac",
      flameFill: "#c084fc",
      idText:
        "When the clean platinum wire carrying the potassium salt was heated strongly in the non-luminous Bunsen flame, a lilac flame colour was observed. This characteristic colour identifies the presence of the potassium ion (K⁺) in the sample.",
    },
    Na: {
      name: "Sodium ion",
      colourName: "golden yellow",
      flameFill: "#facc15",
      idText:
        "When the clean platinum wire carrying the sodium salt was heated strongly in the non-luminous Bunsen flame, a golden yellow flame colour was observed. This characteristic colour identifies the presence of the sodium ion (Na⁺) in the sample.",
    },
    Ca: {
      name: "Calcium ion",
      colourName: "brick red",
      flameFill: "#ef4444",
      idText:
        "When the clean platinum wire carrying the calcium salt was heated strongly in the non-luminous Bunsen flame, a brick red flame colour was observed. This characteristic colour identifies the presence of the calcium ion (Ca²⁺) in the sample.",
    },
    Cu: {
      name: "Copper ion",
      colourName: "bluish green",
      flameFill: "#2dd4bf",
      idText:
        "When the clean platinum wire carrying the copper salt was heated strongly in the non-luminous Bunsen flame, a bluish green flame colour was observed. This characteristic colour identifies the presence of the copper ion (Cu²⁺) in the sample.",
    },
    none: {
      name: "None of the listed cations",
      colourName: "no characteristic colour",
      flameFill: null,
      idText:
        "When the clean platinum wire carrying the sample was heated strongly in the non-luminous Bunsen flame, no characteristic flame colour was observed. Therefore none of K⁺, Na⁺, Ca²⁺ or Cu²⁺ can be confirmed in the sample from this flame test.",
    },
  };

  const HOT_DURATION_MS = 4500;
  const TEST_CATIONS = ["K", "Na", "Ca", "Cu", "none"];
  const RESIDUE_IONS = ["K", "Na", "Ca", "Cu"];

  const CLEAN_STEPS = [
    "Dip the platinum wire / nichrome wire into concentrated hydrochloric acid.",
    "Heat the end of the wire strongly in a non-luminous flame.",
    "Repeat the above steps until no characteristic flame color can be observed",
  ];

  const TEST_STEPS = [
    "Dip a clean platinum wire / nichrome wire into concentrated hydrochloric acid.",
    "Dip the wire into the sample.",
    "Heat the end of the wire strongly in a non-luminous flame. Observe the flame color.",
  ];

  const els = {
    screenStart: document.getElementById("screen-start"),
    screenLab: document.getElementById("screen-lab"),
    headerActions: document.getElementById("header-actions"),
    btnGuided: document.getElementById("btn-guided"),
    btnTest: document.getElementById("btn-test"),
    btnHome: document.getElementById("btn-home"),
    btnRestart: document.getElementById("btn-restart"),
    modeBadge: document.getElementById("mode-badge"),
    phaseBadge: document.getElementById("phase-badge"),
    procedureHeading: document.getElementById("procedure-heading"),
    stepList: document.getElementById("step-list"),
    hintLine: document.getElementById("hint-line"),
    stageHint: document.getElementById("stage-hint"),
    narration: document.getElementById("narration"),
    labStage: document.getElementById("lab-stage"),
    wireVisual: document.getElementById("wire-visual"),
    heldWire: document.getElementById("held-wire"),
    zoneWire: document.getElementById("zone-wire"),
    zoneHcl: document.getElementById("zone-hcl"),
    zoneSample: document.getElementById("zone-sample"),
    zoneFlame: document.getElementById("zone-flame"),
    colorFlame: document.getElementById("color-flame"),
    colorFlamePath: document.getElementById("color-flame-path"),
    flameOuter: document.getElementById("flame-outer"),
    flameInner: document.getElementById("flame-inner"),
    hclLiquidGroup: document.getElementById("hcl-liquid-group"),
    hclLiquid: document.getElementById("hcl-liquid"),
    hclLiquidSurface: document.getElementById("hcl-liquid-surface"),
    hclBubbles: document.getElementById("hcl-bubbles"),
    btnErrorOk: document.getElementById("btn-error-ok"),
    saltPile: document.getElementById("salt-pile"),
    sampleDish: document.getElementById("sample-dish"),
    sampleLabel: document.getElementById("sample-label"),
    statusToast: document.getElementById("status-toast"),
    overlaySample: document.getElementById("overlay-sample"),
    sampleGrid: document.getElementById("sample-grid"),
    btnSampleCancel: document.getElementById("btn-sample-cancel"),
    btnSampleStart: document.getElementById("btn-sample-start"),
    overlayError: document.getElementById("overlay-error"),
    errorWhat: document.getElementById("error-what"),
    errorCorrect: document.getElementById("error-correct"),
    overlayMcq: document.getElementById("overlay-mcq"),
    mcqOptions: document.getElementById("mcq-options"),
    answerFlash: document.getElementById("answer-flash"),
    answerFlashText: document.getElementById("answer-flash-text"),
    overlayConcepts: document.getElementById("overlay-concepts"),
    conceptIdText: document.getElementById("concept-id-text"),
    colourGrid: document.getElementById("colour-grid"),
    btnConceptsClose: document.getElementById("btn-concepts-close"),
    btnConceptsHome: document.getElementById("btn-concepts-home"),
    btnConceptsRetry: document.getElementById("btn-concepts-retry"),
  };

  let state = createInitialState();
  let guidedTimer = null;
  let resultTimer = null;
  let coolTimer = null;
  let hclBoilTimer = null;
  let hclBoilToken = 0;
  let pointerId = null;
  let sessionToken = 0;
  let pendingGuidedCation = null;
  let tipZoneActive = null;

  function createInitialState() {
    return {
      mode: null,
      cation: "K",
      cleanResidue: "K",
      phase: "clean",
      holding: false,
      wireState: "dry",
      wireHot: false,
      cleanCycles: 0,
      cleanComplete: false,
      flameAcidDone: false,
      sampleDipped: false,
      paused: false,
      guidedRunning: false,
      resultShown: false,
      mustRestart: false,
      stepIndex: 0,
    };
  }

  function sleep(ms) {
    return new Promise((resolve, reject) => {
      guidedTimer = setTimeout(() => {
        if (!state.guidedRunning) reject(new Error("cancelled"));
        else resolve();
      }, ms);
    });
  }

  function clearTimers() {
    if (guidedTimer) {
      clearTimeout(guidedTimer);
      guidedTimer = null;
    }
    if (resultTimer) {
      clearTimeout(resultTimer);
      resultTimer = null;
    }
    if (coolTimer) {
      clearTimeout(coolTimer);
      coolTimer = null;
    }
    if (hclBoilTimer) {
      clearTimeout(hclBoilTimer);
      hclBoilTimer = null;
    }
  }

  function releasePointer() {
    if (pointerId !== null) {
      try {
        els.labStage.releasePointerCapture(pointerId);
      } catch (_) {
        /* ignore */
      }
      pointerId = null;
    }
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    els.headerActions.hidden = id !== "screen-lab";
  }

  function setNarration(text) {
    els.narration.textContent = text;
  }

  function showToast(text, ms = 2200) {
    els.statusToast.hidden = false;
    els.statusToast.textContent = text;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.statusToast.hidden = true;
    }, ms);
  }

  function renderSteps() {
    const steps = state.phase === "clean" ? CLEAN_STEPS : TEST_STEPS;
    els.procedureHeading.textContent =
      state.phase === "clean"
        ? "Cleaning the platinum / nichrome wire"
        : "Procedures of flame test";

    els.stepList.innerHTML = "";
    steps.forEach((text, i) => {
      const li = document.createElement("li");
      li.textContent = text;
      if (i < state.stepIndex) li.classList.add("done");
      if (i === state.stepIndex && state.phase !== "done") li.classList.add("current");
      els.stepList.appendChild(li);
    });
  }

  function updatePhaseBadge() {
    if (state.phase === "clean") els.phaseBadge.textContent = "Cleaning the wire";
    else if (state.phase === "flame") els.phaseBadge.textContent = "Flame test";
    else els.phaseBadge.textContent = "Complete";
  }

  function updateWireAppearance() {
    const loops = [
      document.querySelector("#wire-loop"),
      els.heldWire.querySelector(".wire-loop-circle"),
    ];
    const shafts = [
      document.querySelector("#wire-visual .wire-shaft-line"),
      els.heldWire.querySelector(".wire-shaft-line"),
    ];
    loops.forEach((loop) => {
      if (!loop) return;
      loop.classList.remove("wet", "sample", "hot");
      if (state.wireState === "hcl") loop.classList.add("wet");
      if (state.wireState === "sample") loop.classList.add("sample");
      if (state.wireHot) loop.classList.add("hot");
    });
    shafts.forEach((shaft) => {
      if (!shaft) return;
      shaft.classList.toggle("hot", state.wireHot);
    });
  }

  function setWireHot(hot) {
    state.wireHot = !!hot;
    updateWireAppearance();
  }

  function beginWireCoolDown() {
    setWireHot(true);
    if (coolTimer) clearTimeout(coolTimer);
    coolTimer = setTimeout(() => {
      coolTimer = null;
      if (!state.wireHot) return;
      setWireHot(false);
      if (state.mode === "test" && !state.paused && !state.resultShown) {
        showToast("Wire has cooled");
        updateTestHints();
      }
    }, HOT_DURATION_MS);
  }

  function resetHclVisual() {
    hclBoilToken += 1;
    if (hclBoilTimer) {
      clearTimeout(hclBoilTimer);
      hclBoilTimer = null;
    }
    if (els.hclLiquidGroup) {
      els.hclLiquidGroup.classList.remove("boiling-away", "gone");
    }
    if (els.hclBubbles) {
      els.hclBubbles.classList.remove("boiling");
      els.hclBubbles.setAttribute("opacity", "0");
    }
  }

  function boilAwayHcl() {
    const token = ++hclBoilToken;
    if (hclBoilTimer) {
      clearTimeout(hclBoilTimer);
      hclBoilTimer = null;
    }
    if (els.hclBubbles) {
      els.hclBubbles.setAttribute("opacity", "1");
      els.hclBubbles.classList.add("boiling");
    }
    if (els.hclLiquidGroup) {
      els.hclLiquidGroup.classList.remove("gone");
      els.hclLiquidGroup.classList.add("boiling-away");
      hclBoilTimer = setTimeout(() => {
        hclBoilTimer = null;
        if (token !== hclBoilToken) return;
        if (els.hclLiquidGroup) {
          els.hclLiquidGroup.classList.add("gone");
          els.hclLiquidGroup.classList.remove("boiling-away");
        }
        if (els.hclBubbles) {
          els.hclBubbles.classList.remove("boiling");
          els.hclBubbles.setAttribute("opacity", "0");
        }
      }, 1100);
    }
  }

  function pointHitsSvgFill(el, tip) {
    if (!el) return false;
    try {
      const svg = el.ownerSVGElement;
      if (svg && typeof el.isPointInFill === "function") {
        const ctm = el.getScreenCTM();
        if (ctm) {
          const pt = svg.createSVGPoint();
          pt.x = tip.x;
          pt.y = tip.y;
          const local = pt.matrixTransform(ctm.inverse());
          if (el.isPointInFill(local)) return true;
        }
      }
    } catch (_) {
      /* fall through */
    }
    const r = el.getBoundingClientRect();
    return (
      tip.x >= r.left &&
      tip.x <= r.right &&
      tip.y >= r.top &&
      tip.y <= r.bottom
    );
  }

  function tipTouchesHclLiquid() {
    if (!els.hclLiquid || !els.hclLiquidGroup) return false;
    if (els.hclLiquidGroup.classList.contains("gone")) return false;
    const tip = getTipClientPoint();
    return (
      pointHitsSvgFill(els.hclLiquid, tip) ||
      pointHitsSvgFill(els.hclLiquidSurface, tip)
    );
  }

  function tipTouchesFlame() {
    const tip = getTipClientPoint();
    if (pointHitsSvgFill(els.flameOuter, tip) || pointHitsSvgFill(els.flameInner, tip)) {
      return true;
    }
    if (
      els.colorFlame &&
      !els.colorFlame.hidden &&
      pointHitsSvgFill(els.colorFlamePath, tip)
    ) {
      return true;
    }
    return false;
  }

  function tipTouchesSample() {
    const tip = getTipClientPoint();
    // Salt in the dish (the actual sample), not just the dish rim/hitbox
    return pointHitsSvgFill(els.saltPile, tip);
  }

  function tipTouchesZonePart(zone) {
    if (zone === "hcl") return tipTouchesHclLiquid();
    if (zone === "flame") return tipTouchesFlame();
    if (zone === "sample") return tipTouchesSample();
    return false;
  }

  /** Mistakes only fire after tip hits the real visual part of that apparatus. */
  function gateMistakeOnVisual(zone) {
    if (tipTouchesZonePart(zone)) return true;
    tipZoneActive = null;
    return false;
  }

  function handleHotWireInHcl() {
    boilAwayHcl();
    setWireHot(false);
    if (coolTimer) {
      clearTimeout(coolTimer);
      coolTimer = null;
    }
    tipZoneActive = "hcl";
    showToast("HCl boiled away — wire was still red hot!", 2800);

    if (state.mode === "test") {
      proceduralMistake(
        "The red-hot platinum wire was dipped into concentrated HCl. The acid bubbled violently and boiled away.",
        "Always wait for the wire to cool before putting it back into concentrated hydrochloric acid."
      );
    }
  }

  function setHolding(on) {
    state.holding = on;
    els.heldWire.hidden = !on;
    if (els.wireVisual) {
      els.wireVisual.style.visibility = on ? "hidden" : "visible";
    }
    els.labStage.classList.toggle("holding", on);
    if (!on) tipZoneActive = null;
  }

  function clearTargets() {
    document.querySelectorAll(".station").forEach((s) => {
      s.classList.remove("guided-active");
    });
  }

  function updateTestHints() {
    if (state.mode !== "test" || state.paused) return;
    clearTargets();

    if (!state.holding) {
      els.hintLine.textContent = "Click and hold the platinum wire, then move its tip into each apparatus.";
      els.stageHint.textContent = "Pick up the platinum wire";
      setNarration("Click and hold the platinum wire in the test tube, then drag its tip into the apparatus.");
      return;
    }

    if (state.wireHot) {
      const needsHclNext =
        (state.phase === "clean" && state.wireState !== "hcl") ||
        (state.phase === "flame" && !state.flameAcidDone);
      if (needsHclNext) {
        els.hintLine.textContent = "Wait — the wire is still red hot. Let it cool before dipping into HCl.";
        els.stageHint.textContent = "Cool the wire";
        setNarration("The wire is red hot. Wait for it to cool before putting it into concentrated hydrochloric acid.");
        return;
      }
    }

    if (state.phase === "clean") {
      if (state.wireState !== "hcl") {
        state.stepIndex = state.cleanCycles > 0 ? 2 : 0;
        renderSteps();
        els.hintLine.textContent =
          state.cleanCycles > 0
            ? "Repeat: move the cooled wire tip into the concentrated HCl again."
            : "Move the wire tip down into the concentrated HCl.";
        els.stageHint.textContent = "Dip into Conc. HCl";
        setNarration("Hold the wire and move its tip into the concentrated HCl test tube.");
      } else {
        state.stepIndex = 1;
        renderSteps();
        els.hintLine.textContent = "Move the wire tip into the non-luminous flame (keep holding).";
        els.stageHint.textContent = "Heat in the flame";
        setNarration("Keep holding the wire and bring its tip into the non-luminous flame.");
      }
    } else if (state.phase === "flame") {
      if (!state.flameAcidDone) {
        state.stepIndex = 0;
        renderSteps();
        els.hintLine.textContent = "Move the clean, cooled wire tip into concentrated HCl.";
        els.stageHint.textContent = "Dip into Conc. HCl";
        setNarration("Hold the wire and dip its tip into concentrated HCl.");
      } else if (!state.sampleDipped) {
        state.stepIndex = 1;
        renderSteps();
        els.hintLine.textContent = "Move the wire tip into the sample.";
        els.stageHint.textContent = "Dip into the sample";
        setNarration("Hold the wire and touch the sample with its tip.");
      } else {
        state.stepIndex = 2;
        renderSteps();
        els.hintLine.textContent = "Move the wire tip into the flame and observe the colour.";
        els.stageHint.textContent = "Heat and observe";
        setNarration("Keep holding the wire and bring its tip into the non-luminous flame.");
      }
    }
  }

  function showColorFlame(show, cationKey, options = {}) {
    const faint = !!options.faint;
    const base = document.getElementById("base-flame");
    if (!show) {
      els.colorFlame.hidden = true;
      els.colorFlame.classList.remove("is-on", "is-faint");
      if (base) base.classList.remove("dimmed", "dimmed-soft");
      return;
    }
    const c = CATIONS[cationKey];
    if (!c || !c.flameFill) {
      showColorFlame(false);
      return;
    }
    if (els.colorFlamePath) {
      els.colorFlamePath.setAttribute("fill", c.flameFill);
      els.colorFlamePath.style.fill = c.flameFill;
    }
    els.colorFlame.hidden = false;
    els.colorFlame.classList.add("is-on");
    els.colorFlame.classList.toggle("is-faint", faint);
    if (base) {
      base.classList.toggle("dimmed", !faint);
      base.classList.toggle("dimmed-soft", faint);
    }
  }

  function splashAt(zoneEl) {
    const rect = zoneEl.getBoundingClientRect();
    const stageRect = els.labStage.getBoundingClientRect();
    const splash = document.createElement("div");
    splash.className = "dip-splash";
    splash.style.left = `${rect.left - stageRect.left + rect.width / 2 - 11}px`;
    splash.style.top = `${rect.top - stageRect.top + rect.height / 2 - 11}px`;
    els.labStage.appendChild(splash);
    setTimeout(() => splash.remove(), 500);
  }

  function proceduralMistake(what, correct) {
    state.mustRestart = true;
    if (els.btnErrorOk) els.btnErrorOk.textContent = "Restart experiment";
    showError(what, correct);
  }

  function showError(what, correct) {
    releasePointer();
    tipZoneActive = null;
    state.paused = true;
    clearTargets();
    els.errorWhat.textContent = what;
    els.errorCorrect.textContent = `Correct procedure: ${correct}`;
    els.overlayError.hidden = false;
    setNarration(
      state.mustRestart
        ? "Mistake — the experiment must be restarted."
        : "Paused — review the correct procedure, then try again."
    );
  }

  function hideError() {
    els.overlayError.hidden = true;
    state.paused = false;
    tipZoneActive = null;
    if (els.btnErrorOk) els.btnErrorOk.textContent = "Restart experiment";
    if (state.mustRestart && state.mode === "test") {
      state.mustRestart = false;
      startSession("test");
      return;
    }
    state.mustRestart = false;
    updateTestHints();
  }

  function moveHeldWire(clientX, clientY) {
    const rect = els.labStage.getBoundingClientRect();
    // Position so the grip sits at the cursor; tip hangs below
    els.heldWire.style.left = `${clientX - rect.left}px`;
    els.heldWire.style.top = `${clientY - rect.top}px`;
  }

  function moveHeldWireTo(stationEl) {
    const stageRect = els.labStage.getBoundingClientRect();
    const r = stationEl.getBoundingClientRect();
    const tipX = r.left - stageRect.left + r.width / 2;
    const tipY = r.top - stageRect.top + r.height * 0.5;
    const wireH = els.heldWire.offsetHeight || 150;
    els.heldWire.style.transition = "left 0.55s ease, top 0.55s ease";
    // Element top is near grip; tip ≈ top + wireH (minus transform offset ~18px)
    els.heldWire.style.left = `${tipX}px`;
    els.heldWire.style.top = `${tipY - wireH + 22}px`;
    setTimeout(() => {
      els.heldWire.style.transition = "";
    }, 600);
  }

  /** Park the held wire clear of the Bunsen flame (between rack and burner). */
  function moveHeldWireAside() {
    const stageRect = els.labStage.getBoundingClientRect();
    const hclR = els.zoneHcl.getBoundingClientRect();
    const flameR = els.zoneFlame.getBoundingClientRect();
    const tipX = (hclR.right + flameR.left) / 2 - stageRect.left;
    const tipY = Math.min(hclR.top, flameR.top) - stageRect.top + 36;
    const wireH = els.heldWire.offsetHeight || 150;
    els.heldWire.style.transition = "left 0.55s ease, top 0.55s ease";
    els.heldWire.style.left = `${tipX}px`;
    els.heldWire.style.top = `${tipY - wireH + 22}px`;
    setTimeout(() => {
      els.heldWire.style.transition = "";
    }, 600);
  }

  async function waitForWireCoolAside(alive, narration) {
    moveHeldWireAside();
    await sleep(650);
    if (!alive()) return false;
    setNarration(narration);
    await sleep(HOT_DURATION_MS);
    if (!alive()) return false;
    setWireHot(false);
    showToast("Wire has cooled");
    return true;
  }

  function getTipClientPoint() {
    const r = els.heldWire.getBoundingClientRect();
    return {
      x: r.left + r.width / 2,
      y: r.bottom - 6,
    };
  }

  function zoneFromPoint(clientX, clientY) {
    // Check flame first so the tip can reach it over neighbouring stations
    const zones = [
      { id: "flame", el: els.zoneFlame },
      { id: "hcl", el: els.zoneHcl },
      { id: "sample", el: els.zoneSample },
      { id: "wire", el: els.zoneWire },
    ];
    for (const z of zones) {
      if (!z.el) continue;
      const r = z.el.getBoundingClientRect();
      const pad = z.id === "flame" ? 28 : 10;
      if (
        clientX >= r.left - pad &&
        clientX <= r.right + pad &&
        clientY >= r.top - pad &&
        clientY <= r.bottom + pad
      ) {
        return z.id;
      }
    }
    return null;
  }

  function checkTipInteraction() {
    if (!state.holding || state.paused || state.resultShown || state.mode !== "test") return;
    const tip = getTipClientPoint();
    const zone = zoneFromPoint(tip.x, tip.y);
    if (!zone || zone === "wire") {
      tipZoneActive = null;
      return;
    }
    if (zone === tipZoneActive) return;
    tipZoneActive = zone;
    handleTestDrop(zone);
  }

  function expectedCleanAction() {
    return state.wireState !== "hcl" ? "hcl" : "flame";
  }

  function expectedFlameAction() {
    if (!state.flameAcidDone) return "hcl";
    if (!state.sampleDipped) return "sample";
    return "flame";
  }

  function handleTestDrop(zone) {
    if (state.paused || !state.holding || state.resultShown) return;
    if (zone === "wire") return;

    if (zone === "hcl" && state.wireHot) {
      // Mistake only when tip enters the acid liquid — not the glass tube / padded zone
      if (!gateMistakeOnVisual("hcl")) return;
      handleHotWireInHcl();
      return;
    }

    if (state.phase === "clean") {
      const expected = expectedCleanAction();

      // Already completed this contact — stay movable
      if (zone === "hcl" && state.wireState === "hcl") return;

      // Wrong zone: mistake + restart (only after tip hits the real visual part)
      if (zone !== expected) {
        if (zone === "sample") {
          if (!gateMistakeOnVisual("sample")) return;
          proceduralMistake(
            "The sample was touched before the platinum wire was completely clean.",
            "Finish cleaning the wire (HCl → flame, repeat until no characteristic colour) before dipping into the sample."
          );
          return;
        }
        if (expected === "hcl") {
          if (!gateMistakeOnVisual(zone)) return;
          proceduralMistake(
            "The wire was heated before dipping into concentrated hydrochloric acid.",
            "Dip the wire tip into concentrated HCl first, then heat it in the non-luminous flame."
          );
          return;
        }
        // Already moistened with HCl: allow re-touching the acid tube without penalty
        if (zone === "hcl") {
          splashAt(els.zoneHcl);
          state.wireState = "hcl";
          updateWireAppearance();
          showToast("Wire dipped in concentrated HCl");
          return;
        }
        if (!gateMistakeOnVisual(zone)) return;
        proceduralMistake(
          "The next cleaning step was skipped.",
          "After dipping in concentrated HCl, heat the end of the wire strongly in the non-luminous flame."
        );
        return;
      }

      if (zone === "hcl") {
        splashAt(els.zoneHcl);
        state.wireState = "hcl";
        updateWireAppearance();
        showToast("Wire dipped in concentrated HCl");
        state.stepIndex = 1;
        renderSteps();
        tipZoneActive = null;
        updateTestHints();
        return;
      }

      if (zone === "flame") {
        state.cleanCycles += 1;
        state.wireState = "dry";
        beginWireCoolDown();

        if (state.cleanCycles === 1) {
          showColorFlame(true, state.cleanResidue, { faint: true });
          showToast("A faint colour is still visible — keep cleaning");
          setNarration(
            "A characteristic colour is still seen. Let the wire cool, then repeat cleaning until the flame shows no colour."
          );
          state.stepIndex = 2;
          renderSteps();
          setTimeout(() => {
            showColorFlame(false);
            tipZoneActive = null;
            updateTestHints();
          }, 1800);
        } else {
          showColorFlame(false);
          state.cleanComplete = true;
          state.stepIndex = 3;
          renderSteps();
          showToast("Wire is clean — no characteristic colour");
          setNarration(
            "No characteristic flame colour. Let the wire cool, then begin the flame test."
          );
          setTimeout(() => {
            tipZoneActive = null;
            enterFlamePhase();
            updateTestHints();
          }, 1200);
        }
      }
      return;
    }

    if (state.phase === "flame") {
      const expected = expectedFlameAction();

      // Benign re-touches — keep dragging freely
      if (zone === "sample" && state.sampleDipped) return;
      if (zone === "hcl" && state.flameAcidDone && state.sampleDipped) {
        if (!gateMistakeOnVisual("hcl")) return;
        proceduralMistake(
          "The sample-coated wire was returned to concentrated HCl instead of being heated.",
          "After dipping into the sample, heat the wire in the non-luminous flame and observe the colour."
        );
        return;
      }
      if (zone === "hcl" && state.flameAcidDone && !state.sampleDipped) {
        splashAt(els.zoneHcl);
        state.wireState = "hcl";
        updateWireAppearance();
        showToast("Wire re-moistened with HCl");
        return;
      }

      if (zone !== expected) {
        if (!state.flameAcidDone && zone === "sample") {
          if (!gateMistakeOnVisual("sample")) return;
          proceduralMistake(
            "The sample was dipped before moistening the clean wire with concentrated HCl.",
            "Dip the clean wire into concentrated HCl first, then into the sample, then heat in the flame."
          );
          return;
        }
        if (!state.flameAcidDone && zone === "flame") {
          if (!gateMistakeOnVisual("flame")) return;
          proceduralMistake(
            "The wire was heated before completing the flame-test preparation steps.",
            "Dip into concentrated HCl, then into the sample, then heat in the non-luminous flame."
          );
          return;
        }
        if (state.flameAcidDone && !state.sampleDipped && zone === "flame") {
          if (!gateMistakeOnVisual("flame")) return;
          proceduralMistake(
            "The wire was heated without first dipping it into the sample.",
            "Dip the HCl-moistened wire into the sample, then heat it in the non-luminous flame."
          );
          return;
        }
        if (!gateMistakeOnVisual(zone)) return;
        proceduralMistake(
          "An incorrect step was performed during the flame test.",
          "Follow the order: concentrated HCl → sample → non-luminous flame."
        );
        return;
      }

      if (zone === "hcl") {
        splashAt(els.zoneHcl);
        state.flameAcidDone = true;
        state.wireState = "hcl";
        updateWireAppearance();
        showToast("Clean wire dipped in concentrated HCl");
        state.stepIndex = 1;
        renderSteps();
        tipZoneActive = null;
        updateTestHints();
        return;
      }

      if (zone === "sample") {
        splashAt(els.zoneSample);
        state.sampleDipped = true;
        state.wireState = "sample";
        updateWireAppearance();
        showToast("Wire dipped into the sample");
        state.stepIndex = 2;
        renderSteps();
        tipZoneActive = null;
        updateTestHints();
        return;
      }

      if (zone === "flame") {
        tipZoneActive = "flame";
        state.stepIndex = 3;
        renderSteps();
        const c = CATIONS[state.cation];
        if (state.cation === "none") {
          showColorFlame(false);
          setNarration("Observe: no characteristic flame colour appears.");
          showToast("No characteristic flame colour");
        } else {
          showColorFlame(true, state.cation);
          setNarration(`Observe: the flame is ${c.colourName}.`);
          showToast(`Flame colour: ${c.colourName}`);
        }
        state.resultShown = true;
        state.wireState = "dry";
        beginWireCoolDown();
        // Keep following until mouse up — don't freeze mid-drag
        resultTimer = setTimeout(() => {
          releasePointer();
          openMcq();
        }, 3500);
      }
    }
  }

  function enterFlamePhase() {
    state.phase = "flame";
    state.stepIndex = 0;
    state.flameAcidDone = false;
    state.sampleDipped = false;
    state.wireState = "dry";
    updateWireAppearance();
    updatePhaseBadge();
    renderSteps();
    els.hintLine.textContent = "Begin the flame test with the clean wire.";
    els.stageHint.textContent = "Flame test";
  }

  function openMcq() {
    releasePointer();
    setHolding(false);
    els.answerFlash.hidden = true;
    els.answerFlash.classList.remove("correct", "incorrect");
    els.mcqOptions.querySelectorAll(".mcq-btn").forEach((btn) => {
      btn.disabled = false;
    });
    els.overlayMcq.hidden = false;
    setNarration("Select which cation is present in the sample.");
    els.stageHint.textContent = "Answer the question";
  }

  function openConcepts() {
    releasePointer();
    const c = CATIONS[state.cation];
    els.conceptIdText.textContent = c.idText;
    els.colourGrid.querySelectorAll(".colour-swatch").forEach((sw) => {
      sw.classList.toggle("active", sw.dataset.ion === state.cation);
    });
    els.overlayMcq.hidden = true;
    els.overlayConcepts.hidden = false;
  }

  function resetLabVisuals() {
    clearTimers();
    releasePointer();
    clearTargets();
    showColorFlame(false);
    setHolding(false);
    state.wireState = "dry";
    state.wireHot = false;
    state.mustRestart = false;
    if (els.btnErrorOk) els.btnErrorOk.textContent = "Restart experiment";
    updateWireAppearance();
    resetHclVisual();
    els.statusToast.hidden = true;
    els.overlayError.hidden = true;
    els.overlayMcq.hidden = true;
    els.overlayConcepts.hidden = true;
    els.overlaySample.hidden = true;
    els.answerFlash.hidden = true;
  }

  function setupSampleDisplay() {
    const known = state.mode === "guided";
    const fills = {
      K: "#c4b5fd",
      Na: "#fde68a",
      Ca: "#fecaca",
      Cu: "#99f6e4",
      none: "#cbd5e1",
    };
    els.saltPile.classList.remove("K", "Na", "Ca", "Cu", "none");
    els.saltPile.classList.add(state.cation);
    els.saltPile.setAttribute("fill", fills[state.cation] || "#cbd5e1");
    els.sampleLabel.textContent = known
      ? `${CATIONS[state.cation].name.replace(" ion", "")} salt`
      : "Unknown sample";
  }

  function startSession(mode, cation) {
    clearTimers();
    sessionToken += 1;
    const token = sessionToken;
    state = createInitialState();
    state.mode = mode;
    if (mode === "guided") {
      state.cation = cation;
      state.cleanResidue = cation;
    } else {
      state.cation = TEST_CATIONS[Math.floor(Math.random() * TEST_CATIONS.length)];
      state.cleanResidue =
        state.cation === "none"
          ? RESIDUE_IONS[Math.floor(Math.random() * RESIDUE_IONS.length)]
          : state.cation;
    }

    resetLabVisuals();
    setupSampleDisplay();
    els.modeBadge.textContent = mode === "guided" ? "Demonstration Mode" : "Test Mode";
    els.btnRestart.hidden = false;
    updatePhaseBadge();
    renderSteps();
    showScreen("screen-lab");

    if (mode === "guided") {
      els.hintLine.textContent = "Watch each step carefully.";
      els.stageHint.textContent = "Demonstration";
      runGuided(token);
    } else {
      setHolding(false);
      updateTestHints();
    }
  }

  async function runGuided(token) {
    state.guidedRunning = true;
    const c = CATIONS[state.cation];
    const alive = () => token === sessionToken && state.guidedRunning;

    try {
      setNarration("We begin by cleaning the platinum wire.");
      await sleep(1800);
      if (!alive()) return;

      state.stepIndex = 0;
      renderSteps();
      els.zoneHcl.classList.add("guided-active");
      setNarration("Step 1: Dip the platinum wire into concentrated hydrochloric acid.");
      await sleep(900);
      if (!alive()) return;
      setHolding(true);
      moveHeldWireTo(els.zoneHcl);
      await sleep(700);
      if (!alive()) return;
      splashAt(els.zoneHcl);
      state.wireState = "hcl";
      updateWireAppearance();
      await sleep(1000);
      if (!alive()) return;
      els.zoneHcl.classList.remove("guided-active");

      state.stepIndex = 1;
      renderSteps();
      els.zoneFlame.classList.add("guided-active");
      setNarration("Step 2: Heat the end of the wire strongly in a non-luminous flame.");
      moveHeldWireTo(els.zoneFlame);
      await sleep(800);
      if (!alive()) return;
      showColorFlame(true, state.cleanResidue, { faint: true });
      beginWireCoolDown();
      setNarration("A characteristic colour is still visible — cleaning is not finished.");
      await sleep(2200);
      if (!alive()) return;
      showColorFlame(false);
      state.wireState = "dry";
      updateWireAppearance();
      els.zoneFlame.classList.remove("guided-active");

      if (
        !(await waitForWireCoolAside(
          alive,
          "Important: remove the red-hot wire from the flame and wait for it to cool before putting it back into concentrated hydrochloric acid."
        ))
      ) {
        return;
      }

      state.stepIndex = 2;
      renderSteps();
      setNarration("Step 3: Repeat until no characteristic flame colour can be observed.");
      await sleep(1500);
      if (!alive()) return;

      els.zoneHcl.classList.add("guided-active");
      setNarration("Now that the wire has cooled, dip again into concentrated hydrochloric acid.");
      moveHeldWireTo(els.zoneHcl);
      await sleep(700);
      if (!alive()) return;
      splashAt(els.zoneHcl);
      state.wireState = "hcl";
      updateWireAppearance();
      await sleep(900);
      if (!alive()) return;
      els.zoneHcl.classList.remove("guided-active");

      els.zoneFlame.classList.add("guided-active");
      setNarration("Heat again in the non-luminous flame…");
      moveHeldWireTo(els.zoneFlame);
      await sleep(800);
      if (!alive()) return;
      showColorFlame(false);
      beginWireCoolDown();
      setNarration("No characteristic colour — the wire is clean.");
      await sleep(2000);
      if (!alive()) return;
      state.wireState = "dry";
      updateWireAppearance();
      els.zoneFlame.classList.remove("guided-active");
      state.cleanComplete = true;
      state.stepIndex = 3;
      renderSteps();

      if (
        !(await waitForWireCoolAside(
          alive,
          "Again, remove the red-hot wire from the flame and wait for it to cool before using the acid."
        ))
      ) {
        return;
      }
      await sleep(800);
      if (!alive()) return;

      enterFlamePhase();
      setNarration("Now perform the flame test on the sample.");
      await sleep(1600);
      if (!alive()) return;

      state.stepIndex = 0;
      renderSteps();
      els.zoneHcl.classList.add("guided-active");
      setNarration("Step 1: Dip the clean, cooled platinum wire into concentrated hydrochloric acid.");
      moveHeldWireTo(els.zoneHcl);
      await sleep(700);
      if (!alive()) return;
      splashAt(els.zoneHcl);
      state.wireState = "hcl";
      state.flameAcidDone = true;
      updateWireAppearance();
      await sleep(1000);
      if (!alive()) return;
      els.zoneHcl.classList.remove("guided-active");

      state.stepIndex = 1;
      renderSteps();
      els.zoneSample.classList.add("guided-active");
      setNarration("Step 2: Dip the wire into the sample.");
      moveHeldWireTo(els.zoneSample);
      await sleep(700);
      if (!alive()) return;
      splashAt(els.zoneSample);
      state.wireState = "sample";
      state.sampleDipped = true;
      updateWireAppearance();
      await sleep(1000);
      if (!alive()) return;
      els.zoneSample.classList.remove("guided-active");

      state.stepIndex = 2;
      renderSteps();
      els.zoneFlame.classList.add("guided-active");
      setNarration("Step 3: Heat strongly in the non-luminous flame. Observe the flame colour.");
      moveHeldWireTo(els.zoneFlame);
      await sleep(800);
      if (!alive()) return;
      showColorFlame(true, state.cation);
      beginWireCoolDown();
      setNarration(`Result: ${c.colourName} flame — this indicates ${c.name}.`);
      await sleep(3500);
      if (!alive()) return;
      els.zoneFlame.classList.remove("guided-active");
      moveHeldWireAside();
      await sleep(650);
      if (!alive()) return;
      state.stepIndex = 3;
      renderSteps();
      state.phase = "done";
      updatePhaseBadge();

      setHolding(false);
      state.guidedRunning = false;
      openConcepts();
    } catch (_) {
      state.guidedRunning = false;
    }
  }

  function goHome() {
    clearTimers();
    sessionToken += 1;
    state.guidedRunning = false;
    resetLabVisuals();
    pendingGuidedCation = null;
    els.btnSampleStart.disabled = true;
    els.sampleGrid.querySelectorAll(".sample-option").forEach((b) => b.classList.remove("selected"));
    state = createInitialState();
    showScreen("screen-start");
  }

  function openSamplePicker() {
    pendingGuidedCation = null;
    els.btnSampleStart.disabled = true;
    els.sampleGrid.querySelectorAll(".sample-option").forEach((b) => b.classList.remove("selected"));
    els.overlaySample.hidden = false;
  }

  // ——— Events ———
  els.btnGuided.addEventListener("click", () => openSamplePicker());
  els.btnTest.addEventListener("click", () => startSession("test"));
  els.btnHome.addEventListener("click", goHome);
  els.btnRestart.addEventListener("click", () => {
    if (state.mode === "guided") startSession("guided", state.cation);
    else if (state.mode === "test") startSession("test");
  });
  els.btnErrorOk.addEventListener("click", hideError);

  els.btnSampleCancel.addEventListener("click", () => {
    els.overlaySample.hidden = true;
    pendingGuidedCation = null;
  });

  els.sampleGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".sample-option");
    if (!btn) return;
    pendingGuidedCation = btn.dataset.cation;
    els.sampleGrid.querySelectorAll(".sample-option").forEach((b) => {
      b.classList.toggle("selected", b === btn);
    });
    els.btnSampleStart.disabled = false;
  });

  els.btnSampleStart.addEventListener("click", () => {
    if (!pendingGuidedCation) return;
    els.overlaySample.hidden = true;
    startSession("guided", pendingGuidedCation);
  });

  els.btnConceptsClose.addEventListener("click", goHome);
  els.btnConceptsHome.addEventListener("click", goHome);
  els.btnConceptsRetry.addEventListener("click", () => {
    els.overlayConcepts.hidden = true;
    if (state.mode === "guided") startSession("guided", state.cation);
    else if (state.mode === "test") startSession("test");
  });

  // MCQ — capture phase so clicks always reach buttons even if something else is listening
  function onMcqChoice(e) {
    const btn = e.target.closest(".mcq-btn");
    if (!btn || btn.disabled || els.overlayMcq.hidden) return;
    e.preventDefault();
    e.stopPropagation();

    const answer = btn.dataset.answer;
    const correct = answer === state.cation;

    els.mcqOptions.querySelectorAll(".mcq-btn").forEach((b) => {
      b.disabled = true;
    });

    els.answerFlash.hidden = false;
    els.answerFlash.classList.remove("correct", "incorrect");
    els.answerFlash.classList.add(correct ? "correct" : "incorrect");
    els.answerFlashText.textContent = correct
      ? "Correct!"
      : `Incorrect — it was ${CATIONS[state.cation].name}`;

    setTimeout(() => openConcepts(), 1600);
  }

  els.overlayMcq.addEventListener("click", onMcqChoice, true);

  els.labStage.addEventListener("pointerdown", (e) => {
    if (state.mode !== "test" || state.paused || state.guidedRunning) return;
    if (!els.overlayMcq.hidden || !els.overlayError.hidden || !els.overlayConcepts.hidden) return;
    // After flame result, still allow dragging the held wire until MCQ opens
    if (state.resultShown && !state.holding) return;

    const onWire =
      e.target.closest("#wire-visual") ||
      e.target.closest("#zone-wire") ||
      zoneFromPoint(e.clientX, e.clientY) === "wire";

    if (!state.holding) {
      if (!onWire) return;
      pointerId = e.pointerId;
      els.labStage.setPointerCapture(e.pointerId);
      setHolding(true);
      tipZoneActive = null;
      moveHeldWire(e.clientX, e.clientY);
      updateTestHints();
      showToast("Holding wire — move the tip into HCl, sample, or flame");
      return;
    }

    // Already holding: resume dragging without needing to release for interactions
    pointerId = e.pointerId;
    tipZoneActive = null;
    try {
      els.labStage.setPointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
    moveHeldWire(e.clientX, e.clientY);
    if (!state.resultShown) checkTipInteraction();
  });

  els.labStage.addEventListener("pointermove", (e) => {
    if (state.mode !== "test" || !state.holding || state.paused) return;
    if (pointerId !== null && e.pointerId !== pointerId) return;
    // Drag while button is held (capture) so tip contact triggers without releasing
    if (pointerId === null && (e.buttons & 1) === 0) return;

    // Always keep the wire following the cursor; only tip interactions stop after result
    moveHeldWire(e.clientX, e.clientY);
    if (!state.resultShown) {
      requestAnimationFrame(() => checkTipInteraction());
    }
  });

  els.labStage.addEventListener("pointerup", () => {
    // Keep the wire in hand; do not require release to complete a dip/heat
    releasePointer();
  });

  els.labStage.addEventListener("pointercancel", () => {
    releasePointer();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!els.overlaySample.hidden) {
        els.overlaySample.hidden = true;
        return;
      }
      if (!els.overlayConcepts.hidden) goHome();
    }
  });
})();
