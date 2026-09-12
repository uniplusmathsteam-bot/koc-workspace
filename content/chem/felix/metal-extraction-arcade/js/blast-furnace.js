/**
 * Blast Furnace Run — place ingredients + MCQ reactions
 */
window.BlastFurnaceGame = (() => {
  const INGREDIENTS = [
    { id: "haematite", label: "Haematite (Fe₂O₃)", zone: "top" },
    { id: "coke", label: "Coke (C)", zone: "top" },
    { id: "limestone", label: "Limestone (CaCO₃)", zone: "top" },
    { id: "hot-air", label: "Hot air", zone: "tuyere" },
    { id: "cryolite", label: "Cryolite", zone: null },
    { id: "bauxite", label: "Bauxite", zone: null },
  ];

  const STEPS = [
    {
      type: "place",
      id: "charge",
      instruction: "Charge the top of the furnace with haematite, coke and limestone.",
      need: ["haematite", "coke", "limestone"],
      zone: "top",
    },
    {
      type: "place",
      id: "blast",
      instruction: "Blast hot air in near the bottom of the furnace.",
      need: ["hot-air"],
      zone: "tuyere",
    },
    {
      type: "mcq",
      instruction: "Coke burns in hot air. Choose the correct equation.",
      prompt: "Carbon + oxygen → ?",
      options: [
        "C + O₂ → CO₂",
        "C + CO₂ → 2CO",
        "3CO + Fe₂O₃ → 3CO₂ + 2Fe",
        "CaCO₃ → CaO + CO₂",
      ],
      correct: "C + O₂ → CO₂",
      fx: "co2",
    },
    {
      type: "mcq",
      instruction: "Coke reacts further with carbon dioxide.",
      prompt: "Choose the equation that forms the reducing agent.",
      options: [
        "C + CO₂ → 2CO",
        "C + O₂ → CO₂",
        "CaO + SiO₂ → CaSiO₃",
        "2O²⁻ → O₂ + 4e⁻",
      ],
      correct: "C + CO₂ → 2CO",
      fx: "co",
    },
    {
      type: "mcq",
      instruction: "Haematite is reduced.",
      prompt: "Choose the reduction equation (CO is the reducing agent).",
      options: [
        "3CO + Fe₂O₃ → 3CO₂ + 2Fe",
        "Fe₂O₃ + 3C → 2Fe + 3CO₂",
        "C + O₂ → CO₂",
        "CaCO₃ → CaO + CO₂",
      ],
      correct: "3CO + Fe₂O₃ → 3CO₂ + 2Fe",
      fx: "iron",
    },
    {
      type: "mcq",
      instruction: "Limestone decomposes in the heat.",
      prompt: "Choose the thermal decomposition of limestone.",
      options: [
        "CaCO₃ → CaO + CO₂",
        "CaO + SiO₂ → CaSiO₃",
        "C + CO₂ → 2CO",
        "CaCO₃ + SiO₂ → CaSiO₃ + CO₂",
      ],
      correct: "CaCO₃ → CaO + CO₂",
      fx: "lime",
    },
    {
      type: "mcq",
      instruction: "Calcium oxide removes sandy impurities.",
      prompt: "Choose the equation for slag formation.",
      options: [
        "CaO + SiO₂ → CaSiO₃",
        "CaCO₃ → CaO + CO₂",
        "3CO + Fe₂O₃ → 3CO₂ + 2Fe",
        "SiO₂ + C → Si + CO₂",
      ],
      correct: "CaO + SiO₂ → CaSiO₃",
      fx: "slag",
    },
    {
      type: "mcq",
      instruction: "Useful metal leaves the furnace.",
      prompt: "What is the main metal product of the blast furnace?",
      options: [
        "Molten iron",
        "Molten aluminium",
        "Solid coke",
        "Cryolite",
      ],
      correct: "Molten iron",
      fx: "iron",
    },
    {
      type: "mcq",
      instruction: "Impurities are removed as a separate layer.",
      prompt: "What is the waste product that floats on top of the molten iron?",
      options: [
        "Molten slag (calcium silicate)",
        "Hot air",
        "Bauxite",
        "Graphite",
      ],
      correct: "Molten slag (calcium silicate)",
      fx: "slag",
    },
    {
      type: "mcq",
      instruction: "Gases leave from the top of the furnace.",
      prompt: "What leaves from the top of the blast furnace?",
      options: [
        "Hot waste gas",
        "Molten iron",
        "Molten slag",
        "Cryolite vapour only",
      ],
      correct: "Hot waste gas",
      fx: "co2",
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

  function render() {
    const step = currentStep();
    if (!step) {
      finish();
      return;
    }

    const placed = state.placed;
    const topNames = (placed.top || [])
      .map((id) => INGREDIENTS.find((i) => i.id === id)?.label.split(" ")[0] || id)
      .join(" · ");

    state.root.innerHTML = `
      <div class="sim-layout furnace-layout">
        <p class="sim-instruction">${step.instruction}</p>
        <div class="furnace-board">
          <div class="ingredient-tray">
            <h3>Ingredients</h3>
            <div class="tray-items" id="bf-tray"></div>
          </div>
          <div class="furnace-diagram ${state.fxClass}" id="bf-diagram">
            <div class="furnace-art">
              <img src="assets/blast-furnace.svg" alt="Blast furnace cross-section" class="furnace-img" />
              <div class="furnace-hotspot top ${step.zone === "top" ? "active-zone" : ""} ${
                placed.top?.length ? "filled" : ""
              }" data-drop-zone="top" title="Ingredients: iron ore + coke + limestone">
                <span>Drop ingredients here</span>
                <small>${topNames || "iron ore + coke + limestone"}</small>
              </div>
              <div class="furnace-hotspot tuyere ${step.zone === "tuyere" ? "active-zone" : ""} ${
                placed.tuyere ? "filled" : ""
              }" data-drop-zone="tuyere" title="Hot air blast">
                <span>Drop hot air here</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mcq-overlay ${step.type === "mcq" ? "" : "hidden"}" id="bf-mcq"></div>
        <div class="game-toast"></div>
      </div>`;

    const tray = state.root.querySelector("#bf-tray");
    INGREDIENTS.forEach((ing) => {
      const usedTop = (state.placed.top || []).includes(ing.id);
      const usedAir = state.placed.tuyere && ing.id === "hot-air";
      if (usedTop || usedAir) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tray-chip";
      btn.textContent = ing.label;
      btn.dataset.ing = ing.id;
      enableDragChip(btn, ing);
      tray.appendChild(btn);
    });

    if (step.type === "mcq") showMcq(step);
    emitHud();
  }

  function enableDragChip(btn, ing) {
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
        dropIngredient(ing, ev.clientX, ev.clientY);
      };
      btn.addEventListener("pointermove", move);
      btn.addEventListener("pointerup", up);
    });
  }

  function dropIngredient(ing, x, y) {
    const step = currentStep();
    if (step?.type !== "place") return;
    const zones = [...state.root.querySelectorAll("[data-drop-zone]")];
    const hit = zones.find((z) => {
      const r = z.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
    if (!hit) return;
    const zone = hit.dataset.dropZone;
    if (ing.zone !== zone || step.zone !== zone) {
      miss();
      toast("Wrong place for that ingredient!", true);
      emitHud();
      return;
    }
    if (zone === "top") {
      state.placed.top = state.placed.top || [];
      if (state.placed.top.includes(ing.id)) return;
      if (!step.need.includes(ing.id)) {
        miss();
        toast("Not needed in this step!", true);
        emitHud();
        return;
      }
      state.placed.top.push(ing.id);
      score(80);
      toast(`Added ${ing.label.split(" ")[0]}`);
      const remaining = step.need.filter((id) => !state.placed.top.includes(id));
      if (!remaining.length) advance();
      else {
        emitHud();
        render();
      }
      return;
    }
    if (zone === "tuyere") {
      if (ing.id !== "hot-air") {
        miss();
        toast("Only hot air goes here!", true);
        emitHud();
        return;
      }
      state.placed.tuyere = true;
      score(100);
      toast("Hot air blasted in!");
      advance();
    }
  }

  function showMcq(step) {
    const box = state.root.querySelector("#bf-mcq");
    box.innerHTML = `
      <div class="mcq-card">
        <p class="mcq-prompt">${step.prompt}</p>
        <div class="options">
          ${step.options
            .map(
              (o) =>
                `<label class="option"><input type="radio" name="bf-mcq" value="${escapeAttr(
                  o
                )}" /><span>${escapeHtml(o)}</span></label>`
            )
            .join("")}
        </div>
        <button type="button" class="btn-primary" id="bf-check">Check</button>
        <div id="bf-mcq-fb"></div>
      </div>`;
    box.querySelectorAll(".option").forEach((opt) => {
      opt.addEventListener("click", () => {
        box.querySelectorAll(".option").forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
        opt.querySelector("input").checked = true;
      });
    });
    box.querySelector("#bf-check").addEventListener("click", () => {
      const checked = box.querySelector('input[name="bf-mcq"]:checked');
      if (!checked) return;
      if (checked.value === step.correct) {
        const g = score(150);
        if (step.fx) state.fxClass = `fx-${step.fx}`;
        box.querySelector("#bf-mcq-fb").innerHTML =
          `<div class="feedback ok">Correct! +${g}</div>`;
        setTimeout(() => advance(), 700);
      } else {
        miss();
        box.querySelector("#bf-mcq-fb").innerHTML =
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

  function start(root, { onHud, onComplete } = {}) {
    stop();
    state = {
      root,
      stepIndex: 0,
      placed: { top: [], tuyere: false },
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
