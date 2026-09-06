(() => {
  const db = window.EQUATIONS_DB;
  if (!db) {
    console.error("EQUATIONS_DB missing");
    return;
  }

  const LEVELS = [
    { id: "1", label: "Level 1 — complete one blank" },
    { id: "2", label: "Level 2 — drag all words" },
    { id: "3", label: "Level 3 — type the equation" },
  ];

  const state = {
    queue: [],
    index: 0,
    correctCount: 0,
    answered: 0,
    wrongQueue: [],
    blanks: {},
    slotChips: {},
    bankWords: [],
    selectedWord: null,
    selectedChip: null,
    dragFromSlot: null,
    attempts: 0,
    missedFirstTry: false,
    level1Blank: null,
    level1Blanks: [],
    active: false,
  };

  const el = {
    layout: document.getElementById("quiz-layout"),
    settings: document.getElementById("settings-panel"),
    bankSummary: document.getElementById("quiz-bank-summary"),
    topicChecks: document.getElementById("topic-checks"),
    levelChecks: document.getElementById("level-checks"),
    numCount: document.getElementById("quiz-num-count"),
    selDiff: document.getElementById("quiz-sel-diff"),
    btnGenerate: document.getElementById("btn-generate"),
    btnPrint: document.getElementById("btn-print"),
    btnToggle: document.getElementById("btn-toggle-settings"),
    toggleIcon: document.getElementById("settings-toggle-icon"),
    toggleLabel: document.getElementById("settings-toggle-label"),
    progressText: document.getElementById("quiz-progress-text"),
    progressBar: document.getElementById("quiz-progress-bar"),
    btnSummary: document.getElementById("btn-summary"),
    summaryPanel: document.getElementById("summary-panel"),
    quizArea: document.getElementById("quiz-area"),
  };

  /* —— helpers —— */
  function hashSeed(str) {
    let h = 2166136261;
    const s = String(str || "default");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, seed) {
    const a = [...arr];
    const rand = mulberry32(hashSeed(seed || String(Date.now())));
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function shuffle(arr) {
    return seededShuffle(arr, String(Math.random()));
  }

  function topicTitle(id) {
    return db.topics.find((t) => t.id === id)?.title ?? id;
  }

  function methodLabel(id) {
    return db.methods.find((m) => m.id === id)?.label ?? id;
  }

  /** Normalize one substance name: case, aliases, and all spaces ignored. */
  function normalizeToken(text) {
    return String(text)
      .toLowerCase()
      .replace(/hydrogen\s*carbonate/g, "hydrogencarbonate")
      .replace(/aluminum/g, "aluminium")
      .replace(/sulfite/g, "sulphite")
      .replace(/sulfur/g, "sulphur")
      .replace(/colorless/g, "colourless")
      .replace(/lead\s*\(?\s*ii\s*\)?\s*oxide/g, "lead(ii)oxide")
      .replace(/leadoxide/g, "lead(ii)oxide")
      .replace(/\s+/g, "");
  }

  /**
   * Parse a side of a typed equation into a sorted list of normalized tokens.
   * Order and whitespace around "+" (or within names) do not matter.
   */
  function parseSide(text) {
    return String(text)
      .split("+")
      .map((part) => normalizeToken(part))
      .filter((part) => part.length > 0)
      .sort();
  }

  function sidesMatch(typed, expectedParts) {
    const a = parseSide(typed);
    const b = expectedParts.map(normalizeToken).filter(Boolean).sort();
    if (a.length !== b.length) return false;
    return a.every((tok, i) => tok === b[i]);
  }

  function joinSide(parts) {
    return parts.join(" + ");
  }

  function expectedEquation(eq) {
    return { left: joinSide(eq.reactants), right: joinSide(eq.products) };
  }

  function pickDistractors(excludeSet, count) {
    const pool = db.wordPool.filter((w) => !excludeSet.has(w));
    return shuffle(pool).slice(0, Math.max(0, count));
  }

  function selectedTopics() {
    return Array.from(el.topicChecks.querySelectorAll("input:checked")).map((x) => x.value);
  }

  function selectedLevels() {
    return Array.from(el.levelChecks.querySelectorAll("input:checked")).map((x) => Number(x.value));
  }

  function resolveLevels() {
    const diff = el.selDiff.value;
    if (diff !== "all") return [Number(diff)];
    const checked = selectedLevels();
    return checked.length ? checked : [1, 2, 3];
  }

  /* —— settings UI —— */
  function checkboxRow(value, label, checked = true) {
    return `
      <label class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 cursor-pointer">
        <input type="checkbox" class="rounded border-outline-variant text-primary focus:ring-primary" value="${value}" ${
          checked ? "checked" : ""
        } />
        <span class="text-body-sm text-on-surface flex-1">${label}</span>
      </label>`;
  }

  function initSettings() {
    el.topicChecks.innerHTML = db.topics
      .map((t) => checkboxRow(t.id, t.title, true))
      .join("");
    el.levelChecks.innerHTML = LEVELS.map((l) => checkboxRow(l.id, l.label, true)).join("");

    el.topicChecks.addEventListener("change", updateBankSummary);
    el.levelChecks.addEventListener("change", updateBankSummary);
    el.selDiff.addEventListener("change", updateBankSummary);
    el.btnGenerate.addEventListener("click", generate);
    el.btnPrint.addEventListener("click", () => window.print());
    el.btnSummary.addEventListener("click", showSummaryPanel);
    el.btnToggle.addEventListener("click", toggleSettings);

    updateBankSummary();
  }

  function toggleSettings() {
    const collapsed = el.layout.classList.toggle("settings-collapsed");
    el.btnToggle.setAttribute("aria-expanded", String(!collapsed));
    el.toggleIcon.textContent = collapsed ? "chevron_right" : "chevron_left";
    el.toggleLabel.textContent = collapsed ? "Show settings" : "Hide settings";
  }

  function updateBankSummary() {
    const topics = selectedTopics();
    const levels = resolveLevels();
    let available = 0;
    const rows = db.topics
      .map((t) => {
        const n = db.equations.filter((e) => e.topic === t.id).length;
        const inFilter = topics.includes(t.id);
        const cells = [1, 2, 3]
          .map((lv) => {
            const hit = inFilter && levels.includes(lv) && n > 0;
            if (hit) available += n;
            const cls = hit ? "cell-hit" : "cell-zero";
            const val = inFilter && n > 0 ? n : 0;
            return `<td class="${cls}">${val}</td>`;
          })
          .join("");
        return `<tr><td>${t.title}</td>${cells}</tr>`;
      })
      .join("");

    // available counts equation×level pairs matching filters
    el.bankSummary.innerHTML = `
      <div class="bank-available">${available} available</div>
      <div class="text-on-surface-variant mt-1 mb-1">Equations × selected levels</div>
      <table class="quiz-bank-matrix">
        <thead>
          <tr><th>Topic</th><th>L1</th><th>L2</th><th>L3</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  /* —— generate session —— */
  function generate() {
    const topics = selectedTopics();
    if (!topics.length) {
      alert("Select at least one topic.");
      return;
    }
    const levels = resolveLevels();
    if (!levels.length) {
      alert("Select at least one question type (level), or set Difficulty.");
      return;
    }

    const pool = db.equations.filter((e) => topics.includes(e.topic));
    if (!pool.length) {
      alert("No equations match the selected topics.");
      return;
    }

    const count = Math.min(50, Math.max(1, Number(el.numCount.value) || 9));
    const shuffledEq = shuffle(pool);

    const items = [];
    for (const eq of shuffledEq) {
      for (const level of levels) {
        items.push({ eq, level });
      }
    }
    const queue = shuffle(items).slice(0, count);

    state.queue = queue;
    state.index = 0;
    state.correctCount = 0;
    state.answered = 0;
    state.wrongQueue = [];
    state.active = true;
    el.summaryPanel.hidden = true;
    updateProgress();
    renderQuestion();
  }

  function startRetryWrong() {
    if (!state.wrongQueue.length) return;
    const retry = shuffle(state.wrongQueue.map((item) => ({ eq: item.eq, level: item.level })));
    state.queue = retry;
    state.index = 0;
    state.correctCount = 0;
    state.answered = 0;
    state.wrongQueue = [];
    state.active = true;
    el.summaryPanel.hidden = true;
    updateProgress();
    renderQuestion();
  }

  function updateProgress() {
    if (!state.queue.length) {
      el.progressText.textContent = "No session yet";
      el.progressBar.style.width = "0%";
      return;
    }
    const n = state.queue.length;
    const i = Math.min(state.index + 1, n);
    el.progressText.textContent = `Question ${Math.min(state.index + 1, n)} of ${n}`;
    const pct = state.index >= n ? 100 : ((state.index) / n) * 100;
    el.progressBar.style.width = `${pct}%`;
  }

  function currentItem() {
    return state.queue[state.index];
  }

  /* —— render —— */
  function renderQuestion() {
    if (!state.queue.length || state.index >= state.queue.length) {
      finishSession();
      return;
    }

    const { eq, level } = currentItem();
    state.blanks = {};
    state.slotChips = {};
    state.bankWords = [];
    state.selectedWord = null;
    state.selectedChip = null;
    state.attempts = 0;
    state.missedFirstTry = false;
    state.level1Blank = null;
    state.level1Blanks = [];
    updateProgress();

    const wrap = document.createElement("div");
    wrap.className = "practice-question";

    wrap.innerHTML = `
      <div class="meta-pills">
        <span class="meta-pill">${topicTitle(eq.topic)}</span>
        <span class="meta-pill">Level ${level}</span>
      </div>
      <div class="goal-block">
        <p class="goal-label">Purpose of this reaction</p>
        <p class="goal-text" id="goal-text"></p>
      </div>
      <div id="note-area"></div>
      <div id="method-area"></div>
      <div id="equation-area"></div>
      <p class="mobile-tap-hint" id="tap-hint" hidden>
        Tip: tap a word, then tap an empty slot. Tap a filled slot to return it.
      </p>
      <div class="actions-row">
        <p class="feedback" id="feedback" aria-live="polite"></p>
        <button type="button" class="btn-check" id="btn-check">Check answer</button>
      </div>
    `;

    el.quizArea.className = "";
    el.quizArea.innerHTML = "";
    el.quizArea.appendChild(wrap);
    wrap.querySelector("#goal-text").textContent = eq.goal;

    const noteArea = wrap.querySelector("#note-area");
    const methodArea = wrap.querySelector("#method-area");
    const equationArea = wrap.querySelector("#equation-area");
    const tapHint = wrap.querySelector("#tap-hint");
    const feedback = wrap.querySelector("#feedback");
    const btnCheck = wrap.querySelector("#btn-check");

    // stash for handlers
    state._dom = { noteArea, methodArea, equationArea, tapHint, feedback, btnCheck };

    if (eq.note) {
      noteArea.innerHTML = `<p class="note-banner">${eq.note}</p>`;
    }

    if (eq.topic === "metal-extraction") {
      renderMethodMC(methodArea, eq);
    }

    if (eq.multiStep) {
      renderMultiStep(equationArea, tapHint, eq, level);
    } else if (eq.noEquation) {
      tapHint.hidden = true;
      equationArea.innerHTML =
        `<p class="type-hint">There is no chemical word equation for this extraction. Choose the correct method above.</p>`;
    } else if (level === 1) {
      renderLevel1(equationArea, tapHint, eq);
    } else if (level === 2) {
      renderLevel2(equationArea, tapHint, eq);
    } else {
      renderLevel3(equationArea, tapHint, eq);
    }

    btnCheck.addEventListener("click", checkAnswer);
  }

  /* —— Silver nitrate multi-step (2 equations + observations) —— */
  function normalizeObs(text) {
    let t = normalizeToken(text);
    t = t.replace(/precipitate/g, "ppt");
    t = t.replace(/observable/g, "");
    return t;
  }

  function obsMatch(typed, expected) {
    const n = normalizeObs(typed);
    const exp = normalizeObs(expected);
    if (n === exp) return true;

    // aliases for the three allowed observation phrases
    if (exp === normalizeObs("White precipitate forms")) {
      return n === "whitepptforms" || n === normalizeObs("white ppt forms");
    }
    if (exp === normalizeObs("White precipitate dissolves")) {
      return (
        n === "whitepptdissolves" ||
        n === normalizeObs("white ppt dissolves") ||
        n === normalizeObs("precipitate dissolves")
      );
    }
    if (exp === normalizeObs("No observable change")) {
      return (
        n === "noobservablechange" ||
        n === "nochange" ||
        n === normalizeObs("no change") ||
        n === normalizeObs("no observable change")
      );
    }
    return false;
  }

  function partHeading(text) {
    const h = document.createElement("h3");
    h.className = "part-heading";
    h.textContent = text;
    return h;
  }

  function renderMultiStep(equationArea, tapHint, eq, level) {
    state.level1Blanks = [];
    const steps = eq.steps;

    steps.forEach((step, si) => {
      const block = document.createElement("div");
      block.className = "step-block";
      block.appendChild(partHeading(`${si === 0 ? "Part 1" : "Part 2"}: ${step.title}`));

      if (level === 3) {
        tapHint.hidden = true;
        const wrap = document.createElement("div");
        wrap.className = "type-row";
        wrap.innerHTML = `
          <div class="type-field">
            <label for="type-left-${si}">Reactants</label>
            <input id="type-left-${si}" type="text" autocomplete="off" spellcheck="false" />
          </div>
          <span class="eq-arrow" aria-hidden="true">→</span>
          <div class="type-field">
            <label for="type-right-${si}">Products</label>
            <input id="type-right-${si}" type="text" autocomplete="off" spellcheck="false" />
          </div>`;
        block.appendChild(wrap);
      } else {
        tapHint.hidden = false;
        const prefix = `s${si}-`;
        let onlyBlankId = null;
        if (level === 1) {
          const allParts = [
            ...step.reactants.map((w, i) => ({ side: "r", index: i, word: w })),
            ...step.products.map((w, i) => ({ side: "p", index: i, word: w })),
          ];
          const blank = allParts[Math.floor(Math.random() * allParts.length)];
          onlyBlankId = `${prefix}${blank.side}-${blank.index}`;
          state.level1Blanks.push({ id: onlyBlankId, word: blank.word });
        }
        const row = document.createElement("div");
        row.className = "equation-row";
        row.append(...buildSideNodes(step.reactants, "r", onlyBlankId, prefix));
        row.append(arrowNode());
        row.append(...buildSideNodes(step.products, "p", onlyBlankId, prefix));
        block.appendChild(row);
      }
      equationArea.appendChild(block);
    });

    if (level === 1 || level === 2) {
      const needed = [];
      steps.forEach((step) => needed.push(...step.reactants, ...step.products));
      if (level === 1) {
        // Keep one chip per blank (duplicates if the same word is blanked twice)
        const blankWords = state.level1Blanks.map((b) => b.word);
        const exclude = new Set(blankWords);
        state.bankWords = shuffle([
          ...blankWords,
          ...pickDistractors(exclude, 5),
        ]);
      } else {
        // Keep multiplicity: same substance across steps → multiple chips
        const exclude = new Set(needed);
        state.bankWords = shuffle([
          ...needed,
          ...pickDistractors(exclude, Math.min(6, needed.length + 2)),
        ]);
      }
      equationArea.appendChild(
        bankNode(state.bankWords, {
          id: "word-bank-eq",
          label: "Word bank (equations) — order within each side does not matter",
        })
      );
    }

    const obsBlock = document.createElement("div");
    obsBlock.className = "step-block";
    obsBlock.appendChild(partHeading("Part 3: Observations"));

    steps.forEach((step, si) => {
      const row = document.createElement("div");
      row.className = "obs-row";
      const lab = document.createElement("span");
      lab.className = "obs-label";
      lab.textContent = `After step ${si + 1}:`;
      row.appendChild(lab);

      if (level === 3) {
        const input = document.createElement("input");
        input.type = "text";
        input.id = `type-obs-${si}`;
        input.className = "obs-input";
        input.autocomplete = "off";
        input.spellcheck = false;
        input.placeholder = "e.g. White precipitate forms";
        row.appendChild(input);
      } else {
        row.appendChild(slotNode(`obs-${si}`));
      }
      obsBlock.appendChild(row);
    });
    equationArea.appendChild(obsBlock);

    if (level === 1 || level === 2) {
      const neededObs = steps.map((s) => s.observation);
      const pool = (db.observationPool || []).filter((o) => !neededObs.includes(o));
      const obsBank = shuffle([...neededObs, ...shuffle(pool).slice(0, 4)]);
      equationArea.appendChild(
        bankNode(obsBank, {
          id: "word-bank-obs",
          label: "Word bank (observations)",
        })
      );
      wireDragDrop(equationArea);
    } else {
      const hint = document.createElement("p");
      hint.className = "type-hint";
      hint.textContent =
        "Type both word equations and both observations. Equation order/spaces do not matter.";
      equationArea.appendChild(hint);
    }
  }

  function checkMultiStep(eq, level, equationArea) {
    const steps = eq.steps;
    let eqOk = true;
    let obsOk = true;

    if (level === 1) {
      eqOk = state.level1Blanks.every((b) => state.blanks[b.id] === b.word);
    } else if (level === 2) {
      eqOk = steps.every((step, si) => {
        const prefix = `s${si}-`;
        return (
          slotSideMatch("r", step.reactants, prefix) &&
          slotSideMatch("p", step.products, prefix)
        );
      });
    } else {
      eqOk = steps.every((step, si) => {
        const left = document.getElementById(`type-left-${si}`)?.value ?? "";
        const right = document.getElementById(`type-right-${si}`)?.value ?? "";
        return sidesMatch(left, step.reactants) && sidesMatch(right, step.products);
      });
    }

    if (level === 3) {
      obsOk = steps.every((step, si) => {
        const typed = document.getElementById(`type-obs-${si}`)?.value ?? "";
        return obsMatch(typed, step.observation);
      });
    } else {
      obsOk = steps.every((step, si) => {
        const placed = state.blanks[`obs-${si}`];
        return placed && obsMatch(placed, step.observation);
      });
    }

    if (level !== 3) flashSlots(equationArea, eqOk && obsOk);
    return eqOk && obsOk;
  }

  function multiStepModelAnswer(eq) {
    return eq.steps
      .map((step, si) => {
        const left = step.reactants.join(" + ");
        const right = step.products.join(" + ");
        return `Step ${si + 1}: ${left} → ${right} | Observation: ${step.observation}`;
      })
      .join(" || ");
  }

  function renderMethodMC(methodArea) {
    const options = shuffle([...db.methods]);
    const wrap = document.createElement("div");
    wrap.className = "method-block";
    wrap.innerHTML = `<h3>Method of extraction</h3>`;
    const list = document.createElement("div");
    list.className = "method-options";
    options.forEach((m, i) => {
      const label = document.createElement("label");
      label.className = "method-option";
      label.innerHTML = `
        <input type="radio" name="extraction-method" value="${m.id}" id="method-${i}" />
        <span>${m.label}</span>`;
      list.appendChild(label);
    });
    wrap.appendChild(list);
    methodArea.appendChild(wrap);
  }

  function getSelectedMethod() {
    const checked = document.querySelector('input[name="extraction-method"]:checked');
    return checked ? checked.value : null;
  }

  function buildSideNodes(words, side, onlyBlankId, prefix = "") {
    const nodes = [];
    words.forEach((word, i) => {
      if (i > 0) nodes.push(opNode("+"));
      const id = `${prefix}${side}-${i}`;
      if (onlyBlankId && id === onlyBlankId) nodes.push(slotNode(id));
      else if (!onlyBlankId) nodes.push(slotNode(id));
      else {
        const span = document.createElement("span");
        span.className = "eq-part";
        span.textContent = word;
        nodes.push(span);
      }
    });
    return nodes;
  }

  function arrowNode() {
    const a = document.createElement("span");
    a.className = "eq-arrow";
    a.textContent = "→";
    a.setAttribute("aria-hidden", "true");
    return a;
  }

  function opNode(ch) {
    const s = document.createElement("span");
    s.className = "eq-op";
    s.textContent = ch;
    return s;
  }

  function slotNode(id) {
    const slot = document.createElement("span");
    slot.className = "slot";
    slot.dataset.slotId = id;
    slot.setAttribute("tabindex", "0");
    slot.setAttribute("role", "button");
    slot.setAttribute("aria-label", `Empty slot ${id}`);
    return slot;
  }

  function bankNode(words, { id = "word-bank", label = "Word bank" } = {}) {
    const wrap = document.createElement("div");
    const lab = document.createElement("p");
    lab.className = "bank-label";
    lab.textContent = label;
    const bank = document.createElement("div");
    bank.className = "word-bank";
    bank.id = id;
    words.forEach((w, i) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip-word";
      chip.draggable = true;
      chip.dataset.word = w;
      chip.dataset.chipId = `${id}-${i}-${Math.random().toString(36).slice(2, 8)}`;
      chip.textContent = w;
      bank.appendChild(chip);
    });
    wrap.appendChild(lab);
    wrap.appendChild(bank);
    return wrap;
  }

  function renderLevel1(equationArea, tapHint, eq) {
    tapHint.hidden = false;
    const allParts = [
      ...eq.reactants.map((w, i) => ({ side: "r", index: i, word: w })),
      ...eq.products.map((w, i) => ({ side: "p", index: i, word: w })),
    ];
    const blank = allParts[Math.floor(Math.random() * allParts.length)];
    const blankId = `${blank.side}-${blank.index}`;
    state.level1Blank = { id: blankId, word: blank.word };

    const exclude = new Set([...eq.reactants, ...eq.products]);
    state.bankWords = shuffle([blank.word, ...pickDistractors(exclude, 4)]);

    const row = document.createElement("div");
    row.className = "equation-row";
    row.append(...buildSideNodes(eq.reactants, "r", blankId));
    row.append(arrowNode());
    row.append(...buildSideNodes(eq.products, "p", blankId));
    equationArea.appendChild(row);
    equationArea.appendChild(
      bankNode(state.bankWords, {
        id: "word-bank",
        label: "Word bank — drag words into blanks (order within each side does not matter)",
      })
    );
    wireDragDrop(equationArea);
  }

  function renderLevel2(equationArea, tapHint, eq) {
    tapHint.hidden = false;
    const needed = [...eq.reactants, ...eq.products];
    const exclude = new Set(needed);
    state.bankWords = shuffle([
      ...needed,
      ...pickDistractors(exclude, Math.min(5, needed.length + 2)),
    ]);

    const row = document.createElement("div");
    row.className = "equation-row";
    row.append(...buildSideNodes(eq.reactants, "r", null));
    row.append(arrowNode());
    row.append(...buildSideNodes(eq.products, "p", null));
    equationArea.appendChild(row);
    equationArea.appendChild(
      bankNode(state.bankWords, {
        id: "word-bank",
        label: "Word bank — drag words into blanks (order within each side does not matter)",
      })
    );
    wireDragDrop(equationArea);
  }

  function renderLevel3(equationArea, tapHint) {
    tapHint.hidden = true;
    const wrap = document.createElement("div");
    wrap.className = "type-row";
    wrap.innerHTML = `
      <div class="type-field">
        <label for="type-left">Reactants (left of arrow)</label>
        <input id="type-left" type="text" autocomplete="off" spellcheck="false"
          placeholder="e.g. Calcium oxide + Water" />
      </div>
      <span class="eq-arrow" aria-hidden="true">→</span>
      <div class="type-field">
        <label for="type-right">Products (right of arrow)</label>
        <input id="type-right" type="text" autocomplete="off" spellcheck="false"
          placeholder="e.g. Calcium hydroxide" />
      </div>`;
    equationArea.appendChild(wrap);
    const hint = document.createElement("p");
    hint.className = "type-hint";
    hint.textContent =
      "Join substances with +. Order and spaces do not matter; spelling must match.";
    equationArea.appendChild(hint);
  }

  /* —— drag / tap —— */
  function wireDragDrop(equationArea) {
    equationArea.querySelectorAll(".chip-word").forEach((chip) => {
      chip.addEventListener("dragstart", (e) => {
        if (chip.classList.contains("used")) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/plain", chip.dataset.word);
        e.dataTransfer.setData("text/chip-id", chip.dataset.chipId);
        e.dataTransfer.effectAllowed = "move";
        chip.classList.add("dragging");
        state.selectedWord = chip.dataset.word;
        state.selectedChip = chip;
        state.dragFromSlot = null;
      });
      chip.addEventListener("dragend", () => chip.classList.remove("dragging"));
      chip.addEventListener("click", () => {
        clearChipHighlights(equationArea);
        if (chip.classList.contains("used")) return;
        state.selectedWord = chip.dataset.word;
        state.selectedChip = chip;
        state.dragFromSlot = null;
        chip.classList.add("dragging");
      });
    });

    equationArea.querySelectorAll(".slot").forEach((slot) => {
      slot.draggable = true;

      slot.addEventListener("dragstart", (e) => {
        if (!slot.classList.contains("filled")) {
          e.preventDefault();
          return;
        }
        // Pick up like a bank chip: return chip to bank, then drag that chip
        const word = state.blanks[slot.dataset.slotId];
        const chipId = state.slotChips[slot.dataset.slotId];
        const chip = chipId
          ? equationArea.querySelector(`[data-chip-id="${chipId}"]`)
          : null;
        clearSlot(equationArea, slot, true);
        if (chip) {
          chip.classList.remove("used");
          chip.classList.add("dragging");
        }
        e.dataTransfer.setData("text/plain", word);
        e.dataTransfer.setData("text/chip-id", chipId || "");
        e.dataTransfer.effectAllowed = "move";
        state.selectedWord = word;
        state.selectedChip = chip;
        state.dragFromSlot = null;
        slot.classList.add("dragging-slot");
      });

      slot.addEventListener("dragend", () => {
        slot.classList.remove("dragging-slot");
        equationArea.querySelectorAll(".chip-word.dragging").forEach((c) =>
          c.classList.remove("dragging")
        );
      });

      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("drag-over");
      });
      slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        slot.classList.remove("drag-over");
        const word = e.dataTransfer.getData("text/plain");
        const chipId = e.dataTransfer.getData("text/chip-id");
        const chip = chipId
          ? equationArea.querySelector(`[data-chip-id="${chipId}"]`)
          : null;
        placeWord(equationArea, slot, word, chip);
      });

      slot.addEventListener("click", () => {
        if (slot.classList.contains("filled")) {
          if (state.selectedWord) {
            // Place selected word into this slot (replaces existing)
            placeWord(equationArea, slot, state.selectedWord, state.selectedChip);
            return;
          }
          // Pick up filled word — same as selecting it from the word bank
          const word = state.blanks[slot.dataset.slotId];
          const chipId = state.slotChips[slot.dataset.slotId];
          const chip = chipId
            ? equationArea.querySelector(`[data-chip-id="${chipId}"]`)
            : null;
          clearSlot(equationArea, slot, true);
          clearChipHighlights(equationArea);
          state.selectedWord = word;
          state.selectedChip = chip;
          state.dragFromSlot = null;
          if (chip) chip.classList.add("dragging");
          return;
        }
        if (state.selectedWord) {
          placeWord(equationArea, slot, state.selectedWord, state.selectedChip);
        }
      });
    });
  }

  function clearChipHighlights(equationArea) {
    equationArea.querySelectorAll(".chip-word").forEach((c) => c.classList.remove("dragging"));
  }

  function placeWord(equationArea, slot, word, fromChip) {
    if (!word) return;

    // If this chip is already sitting in another slot, clear that slot first (move)
    if (fromChip) {
      const fromSlotId = Object.keys(state.slotChips).find(
        (id) => state.slotChips[id] === fromChip.dataset.chipId
      );
      if (fromSlotId && fromSlotId !== slot.dataset.slotId) {
        const src = equationArea.querySelector(`[data-slot-id="${fromSlotId}"]`);
        if (src) clearSlot(equationArea, src, false);
      }
    }

    if (slot.classList.contains("filled")) clearSlot(equationArea, slot, true);

    let chip = fromChip && fromChip.dataset.word === word ? fromChip : null;
    if (!chip || (chip.classList.contains("used") && Object.values(state.slotChips).includes(chip.dataset.chipId))) {
      chip = [...equationArea.querySelectorAll(".chip-word")].find(
        (c) => c.dataset.word === word && !c.classList.contains("used")
      );
    }

    if (chip) {
      chip.classList.add("used");
      chip.classList.remove("dragging");
      state.slotChips[slot.dataset.slotId] = chip.dataset.chipId;
    }

    state.blanks[slot.dataset.slotId] = word;
    slot.textContent = word;
    slot.classList.add("filled");
    state.selectedWord = null;
    state.selectedChip = null;
    clearChipHighlights(equationArea);
  }

  function clearSlot(equationArea, slot, restoreBank) {
    const word = state.blanks[slot.dataset.slotId];
    const chipId = state.slotChips[slot.dataset.slotId];
    delete state.blanks[slot.dataset.slotId];
    delete state.slotChips[slot.dataset.slotId];
    slot.textContent = "";
    slot.classList.remove("filled", "correct-flash", "wrong-flash");
    if (restoreBank) {
      let chip = chipId
        ? equationArea.querySelector(`[data-chip-id="${chipId}"]`)
        : null;
      if (!chip && word) {
        chip = [...equationArea.querySelectorAll(".chip-word.used")].find(
          (c) => c.dataset.word === word
        );
      }
      if (chip) chip.classList.remove("used");
    }
  }

  /* —— check —— */
  function checkAnswer() {
    const item = currentItem();
    if (!item) return;
    const { eq, level } = item;
    const { equationArea, feedback, btnCheck } = state._dom;

    let equationOk = true;
    let methodOk = true;

    if (eq.topic === "metal-extraction") {
      methodOk = getSelectedMethod() === eq.method;
    }

    if (eq.multiStep) {
      equationOk = checkMultiStep(eq, level, equationArea);
    } else if (eq.noEquation) {
      equationOk = true;
    } else if (level === 1) {
      equationOk = state.blanks[state.level1Blank.id] === state.level1Blank.word;
      flashSlots(equationArea, equationOk);
    } else if (level === 2) {
      equationOk = checkLevel2(eq);
      flashSlots(equationArea, equationOk);
    } else {
      equationOk = checkLevel3(eq);
    }

    const ok = equationOk && methodOk;
    state.attempts += 1;

    if (!ok && state.attempts === 1) {
      state.missedFirstTry = true;
      state.wrongQueue.push({ eq: item.eq, level: item.level });
    }

    if (ok) {
      const firstTry = !state.missedFirstTry;
      feedback.textContent = firstTry
        ? "Correct!"
        : "Correct — counted as wrong (not first try).";
      feedback.className = firstTry ? "feedback ok" : "feedback hint";
      if (firstTry) state.correctCount += 1;
      state.answered += 1;
      btnCheck.disabled = true;
      setTimeout(() => {
        state.index += 1;
        if (state.index >= state.queue.length) finishSession();
        else renderQuestion();
      }, 650);
      return;
    }

    const parts = [];
    if (!methodOk) parts.push("method of extraction");
    if (!equationOk && !eq.noEquation) {
      parts.push(eq.multiStep ? "equations / observations" : "word equation");
    }
    feedback.textContent = `Not quite — check the ${parts.join(" and ")}.`;
    feedback.className = "feedback bad";
  }

  function flashSlots(equationArea, ok) {
    equationArea.querySelectorAll(".slot").forEach((slot) => {
      slot.classList.remove("correct-flash", "wrong-flash");
      slot.classList.add(ok ? "correct-flash" : "wrong-flash");
    });
  }

  function checkLevel2(eq) {
    return slotSideMatch("r", eq.reactants) && slotSideMatch("p", eq.products);
  }

  /** Slots filled; order within each side does not matter. */
  function slotSideMatch(side, expected, prefix = "") {
    const placed = expected.map((_, i) => state.blanks[`${prefix}${side}-${i}`]);
    if (placed.some((w) => !w)) return false;
    const a = [...placed].map(normalizeToken).sort();
    const b = expected.map(normalizeToken).sort();
    return a.length === b.length && a.every((tok, i) => tok === b[i]);
  }

  function checkLevel3(eq) {
    const left = document.getElementById("type-left")?.value ?? "";
    const right = document.getElementById("type-right")?.value ?? "";
    return sidesMatch(left, eq.reactants) && sidesMatch(right, eq.products);
  }

  function finishSession() {
    state.active = false;
    const total = state.queue.length;
    const wrongN = state.wrongQueue.length;
    el.progressBar.style.width = "100%";
    el.progressText.textContent = `Session complete · ${state.correctCount}/${total} correct on first try`;
    el.quizArea.className = "";
    el.quizArea.innerHTML = `
      <div class="text-center py-6">
        <p class="text-headline-lg-mobile font-headline-lg-mobile text-on-surface mb-2">Session complete</p>
        <p class="mb-2">First-try score: <strong class="text-primary">${state.correctCount}</strong> / ${total}</p>
        <p class="text-body-sm text-on-surface-variant mb-6">
          ${wrongN ? `${wrongN} question(s) missed on the first try.` : "No wrong answers — well done!"}
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          ${
            wrongN
              ? `<button type="button" class="btn-check" id="btn-retry-wrong">Retry ${wrongN} wrong question(s)</button>`
              : ""
          }
          <button type="button" class="py-2.5 px-5 rounded-full border border-outline-variant/40 bg-surface font-label-bold text-body-sm" id="btn-finish-ok">
            Done
          </button>
        </div>
      </div>`;

    const retryBtn = document.getElementById("btn-retry-wrong");
    if (retryBtn) retryBtn.addEventListener("click", startRetryWrong);
    document.getElementById("btn-finish-ok")?.addEventListener("click", () => {
      el.quizArea.className = "quiz-empty text-center text-on-surface-variant py-12 text-body-sm";
      el.quizArea.textContent = "Generate questions first.";
    });
    showSummaryPanel();
  }

  function showSummaryPanel() {
    if (!state.queue.length) {
      el.summaryPanel.hidden = false;
      el.summaryPanel.innerHTML =
        `<p class="text-body-sm text-on-surface-variant">No session yet. Generate questions first.</p>`;
      return;
    }
    const byTopic = {};
    state.queue.forEach(({ eq }) => {
      byTopic[eq.topic] = (byTopic[eq.topic] || 0) + 1;
    });
    const topicLines = Object.entries(byTopic)
      .map(([id, n]) => `<li>${topicTitle(id)}: ${n} question(s)</li>`)
      .join("");
    const wrongN = state.wrongQueue.length;

    el.summaryPanel.hidden = false;
    el.summaryPanel.innerHTML = `
      <h3 class="font-label-bold text-on-surface mb-2">Session summary</h3>
      <p class="text-body-sm mb-2">First-try score: <strong class="text-primary">${state.correctCount}</strong> / ${state.queue.length}</p>
      <p class="text-body-sm mb-2">${wrongN} wrong on first try</p>
      <p class="text-body-sm text-on-surface-variant mb-1">Mix in this set:</p>
      <ul class="text-body-sm text-on-surface list-disc pl-5">${topicLines}</ul>`;
  }

  initSettings();
})();
