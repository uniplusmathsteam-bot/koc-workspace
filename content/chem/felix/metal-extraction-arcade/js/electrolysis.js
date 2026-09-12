/**
 * Electrolysis Sprint — live aluminium cell + MCQ (aligned with blast-furnace UX)
 */
window.ElectrolysisGame = (() => {
  const PARTS = [
    { id: "cathode", label: "Graphite cathode (−)", zone: "cathode" },
    { id: "cryolite", label: "Cryolite", zone: "electrolyte" },
    { id: "bauxite", label: "Bauxite (Al₂O₃)", zone: "electrolyte" },
    { id: "anode", label: "Graphite anodes (+)", zone: "anode" },
    { id: "coke", label: "Coke", zone: null },
    { id: "haematite", label: "Haematite", zone: null },
    { id: "limestone", label: "Limestone", zone: null },
    { id: "hot-air", label: "Hot air", zone: null },
  ];

  const STEPS = [
    {
      type: "place",
      instruction: "Line the steel tank with the graphite cathode (negative electrode).",
      need: "cathode",
      zone: "cathode",
    },
    {
      type: "place",
      instruction: "Add molten cryolite to the cell (electrolyte solvent).",
      need: "cryolite",
      zone: "electrolyte",
    },
    {
      type: "place",
      instruction: "Dissolve bauxite (Al₂O₃) in the molten cryolite.",
      need: "bauxite",
      zone: "electrolyte",
      require: "cryolite",
    },
    {
      type: "mcq",
      instruction: "Why is cryolite used?",
      prompt: "What is the role of cryolite?",
      options: [
        "To lower the melting point of aluminium oxide",
        "To act as the reducing agent",
        "To remove silicon dioxide as slag",
        "To provide carbon for reduction",
      ],
      correct: "To lower the melting point of aluminium oxide",
    },
    {
      type: "place",
      instruction: "Lower the positive graphite anodes into the electrolyte.",
      need: "anode",
      zone: "anode",
    },
    {
      type: "power",
      instruction: "Switch on the electric current to start electrolysis.",
    },
    {
      type: "mcq",
      instruction: "Oxygen bubbles off at the anodes.",
      prompt: "Half equation at the anode (+ve):",
      options: [
        "2O²⁻ → O₂ + 4e⁻",
        "Al³⁺ + 3e⁻ → Al",
        "Al → Al³⁺ + 3e⁻",
        "O₂ + 4e⁻ → 2O²⁻",
      ],
      correct: "2O²⁻ → O₂ + 4e⁻",
      fx: "bubbles",
    },
    {
      type: "mcq",
      instruction: "Aluminium is produced at the cathode.",
      prompt: "Half equation at the cathode (−ve):",
      options: [
        "Al³⁺ + 3e⁻ → Al",
        "2O²⁻ → O₂ + 4e⁻",
        "Al³⁺ → Al + 3e⁻",
        "Al + 3e⁻ → Al³⁺",
      ],
      correct: "Al³⁺ + 3e⁻ → Al",
      fx: "aluminium",
    },
    {
      type: "mcq",
      instruction: "Overall change in the cell.",
      prompt: "Choose the overall equation / fact.",
      options: [
        "2Al₂O₃ → 4Al + 3O₂ (Al forms at the cathode)",
        "2Al₂O₃ → 4Al + 3CO₂ (Al forms at the anode)",
        "Al₂O₃ + 3C → 2Al + 3CO",
        "Al³⁺ + O²⁻ → AlO",
      ],
      correct: "2Al₂O₃ → 4Al + 3O₂ (Al forms at the cathode)",
    },
    {
      type: "mcq",
      instruction: "Useful metal collects in the cell.",
      prompt: "What is the main metal product of this process?",
      options: [
        "Molten aluminium",
        "Molten iron",
        "Solid cryolite",
        "Graphite powder",
      ],
      correct: "Molten aluminium",
      fx: "aluminium",
    },
    {
      type: "mcq",
      instruction: "A gas is also produced at the positive electrodes.",
      prompt: "What gas bubbles off at the anodes?",
      options: [
        "Oxygen",
        "Hydrogen",
        "Nitrogen",
        "Carbon monoxide",
      ],
      correct: "Oxygen",
      fx: "bubbles",
    },
  ];

  let state = null;

  function emitHud() {
    state?.onHud?.({
      score: state.score,
      streak: state.streak,
      combo: state.combo,
      progress: `${state.stepIndex + 1}/${STEPS.length}`,
      label: "Step",
    });
  }

  function score(base) {
    const gained = base * state.combo;
    state.score += gained;
    state.xpGained += Math.round(gained / 10);
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.combo = Math.min(3, state.combo + 1);
    state.correct += 1;
    return gained;
  }

  function miss() {
    state.streak = 0;
    state.combo = 1;
    state.mistakes += 1;
  }

  function toast(msg, bad) {
    const t = state.root.querySelector(".game-toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle("bad", !!bad);
    t.classList.add("show");
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove("show"), 1600);
  }

  function currentStep() {
    return STEPS[state.stepIndex];
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  function electrolyteLabel() {
    const bits = [];
    if (state.parts.cryolite) bits.push("cryolite");
    if (state.parts.bauxite) bits.push("bauxite");
    return bits.join(" + ") || "cryolite + bauxite";
  }

  function render() {
    const step = currentStep();
    if (!step) {
      finish();
      return;
    }

    const p = state.parts;
    state.root.innerHTML = `
      <div class="sim-layout cell-layout">
        <p class="sim-instruction">${step.instruction}</p>
        <div class="furnace-board">
          <div class="ingredient-tray">
            <h3>Parts &amp; materials</h3>
            <div class="tray-items" id="el-tray"></div>
          </div>
          <div class="cell-diagram ${state.fxClass} ${state.powered ? "powered" : ""}" id="el-diagram">
            <div class="cell-art">
              <img src="assets/electrolysis-cell.svg" alt="Electrolysis cell for aluminium" class="cell-img" />
              <div class="cell-hotspot cathode ${step.zone === "cathode" ? "active-zone" : ""} ${
                p.cathode ? "filled" : ""
              }" data-drop-zone="cathode">
                <span>${p.cathode ? "Cathode lined" : "Drop cathode here"}</span>
              </div>
              <div class="cell-hotspot electrolyte ${step.zone === "electrolyte" ? "active-zone" : ""} ${
                p.cryolite || p.bauxite ? "filled" : ""
              }" data-drop-zone="electrolyte">
                <span>${
                  p.cryolite && p.bauxite
                    ? "Electrolyte ready"
                    : "Drop ingredients here"
                }</span>
                <small>${electrolyteLabel()}</small>
              </div>
              <div class="cell-hotspot anode ${step.zone === "anode" ? "active-zone" : ""} ${
                p.anode ? "filled" : ""
              }" data-drop-zone="anode">
                <span>${p.anode ? "Anodes in place" : "Drop anodes here"}</span>
              </div>
              <button type="button" class="power-btn diagram-power ${state.powered ? "on" : ""}" id="el-power" ${
                step.type === "power" ? "" : "disabled"
              }>${state.powered ? "Current ON" : "Switch ON"}</button>
            </div>
          </div>
        </div>
        <div class="mcq-overlay ${step.type === "mcq" ? "" : "hidden"}" id="el-mcq"></div>
        <div class="game-toast"></div>
      </div>`;

    const tray = state.root.querySelector("#el-tray");
    PARTS.forEach((part) => {
      if (state.parts[part.id]) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tray-chip";
      btn.textContent = part.label;
      enableDrag(btn, part);
      tray.appendChild(btn);
    });

    if (step.type === "mcq") showMcq(step);
    if (step.type === "power") {
      state.root.querySelector("#el-power").addEventListener("click", () => {
        state.powered = true;
        score(100);
        toast("Cell energised!");
        advance();
      });
    }

    emitHud();
  }

  function enableDrag(btn, part) {
    btn.addEventListener("pointerdown", (e) => {
      if (currentStep()?.type !== "place") return;
      btn.setPointerCapture(e.pointerId);
      btn.classList.add("dragging");
      const move = (ev) => {
        btn.style.position = "fixed";
        btn.style.left = `${ev.clientX - 40}px`;
        btn.style.top = `${ev.clientY - 16}px`;
        btn.style.zIndex = "50";
      };
      const up = (ev) => {
        btn.releasePointerCapture(e.pointerId);
        btn.classList.remove("dragging");
        btn.style.position = "";
        btn.style.left = "";
        btn.style.top = "";
        btn.style.zIndex = "";
        btn.removeEventListener("pointermove", move);
        btn.removeEventListener("pointerup", up);
        dropPart(part, ev.clientX, ev.clientY);
      };
      btn.addEventListener("pointermove", move);
      btn.addEventListener("pointerup", up);
    });
  }

  function dropPart(part, x, y) {
    const step = currentStep();
    if (step?.type !== "place") return;
    const zones = [...state.root.querySelectorAll("[data-drop-zone]")];
    const hit = zones.find((z) => {
      const r = z.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
    if (!hit) return;
    const zone = hit.dataset.dropZone;
    if (part.zone !== zone || step.zone !== zone || part.id !== step.need) {
      miss();
      toast("Wrong part or wrong place!", true);
      emitHud();
      return;
    }
    if (step.require && !state.parts[step.require]) {
      miss();
      toast("Add cryolite first!", true);
      emitHud();
      return;
    }
    state.parts[part.id] = true;
    score(100);
    toast(`Placed ${part.label}`);
    advance();
  }

  function showMcq(step) {
    const box = state.root.querySelector("#el-mcq");
    box.innerHTML = `
      <div class="mcq-card">
        <p class="mcq-prompt">${step.prompt}</p>
        <div class="options">
          ${step.options
            .map(
              (o) =>
                `<label class="option"><input type="radio" name="el-mcq" value="${escapeAttr(
                  o
                )}" /><span>${escapeHtml(o)}</span></label>`
            )
            .join("")}
        </div>
        <button type="button" class="btn-primary" id="el-check">Check</button>
        <div id="el-mcq-fb"></div>
      </div>`;
    box.querySelectorAll(".option").forEach((opt) => {
      opt.addEventListener("click", () => {
        box.querySelectorAll(".option").forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
        opt.querySelector("input").checked = true;
      });
    });
    box.querySelector("#el-check").addEventListener("click", () => {
      const checked = box.querySelector('input[name="el-mcq"]:checked');
      if (!checked) return;
      if (checked.value === step.correct) {
        const g = score(150);
        if (step.fx) state.fxClass = `fx-${step.fx}`;
        box.querySelector("#el-mcq-fb").innerHTML =
          `<div class="feedback ok">Correct! +${g}</div>`;
        setTimeout(() => advance(), 700);
      } else {
        miss();
        box.querySelector("#el-mcq-fb").innerHTML =
          `<div class="feedback bad">Not quite — try again.</div>`;
        emitHud();
      }
    });
  }

  function advance() {
    state.stepIndex += 1;
    if (state.stepIndex >= STEPS.length) {
      finish();
      return;
    }
    render();
  }

  function finish() {
    const total = state.correct + state.mistakes;
    state.onComplete?.({
      score: state.score,
      streak: state.bestStreak,
      correct: state.correct,
      total: Math.max(total, 1),
      accuracy: total ? Math.round((state.correct / total) * 100) : 100,
      xpGained: state.xpGained,
    });
  }

  function start(root, { onHud, onComplete } = {}) {
    stop();
    state = {
      root,
      stepIndex: 0,
      parts: {},
      powered: false,
      fxClass: "",
      score: 0,
      streak: 0,
      bestStreak: 0,
      combo: 1,
      correct: 0,
      mistakes: 0,
      xpGained: 0,
      onHud,
      onComplete,
    };
    render();
  }

  function stop() {
    state = null;
  }

  return { start, stop, STEPS };
})();
