(function () {
  const I18N = {
    en: {
      "header.title": "Chemistry Atom Lab",
      "header.subtitle": "Build atoms from the first 20 elements — full outer shell means stable",
      "panel.model": "Atomic model",
      "panel.controls": "Controls",
      "panel.concepts": "Concepts",
      "legend.proton": "Proton (p) charge +",
      "legend.neutron": "Neutron (n)",
      "legend.electron": "Electron (e) charge −",
      "label.ptable": "Select element (first 20)",
      "label.builder": "Adjust subatomic particles",
      "hint.builder": "Add or remove particles. Removed particles fly away and leave the model.",
      "hint.pan": "Drag to pan · Scroll wheel to zoom",
      "count.protons": "Protons",
      "count.neutrons": "Neutrons",
      "count.electrons": "Electrons",
      "info.stabilityTitle": "Why this stability?",
      "info.chargeTitle": "Charge calculation",
      "charge.rule": "Overall charge = total proton charge − total magnitude of electron charge.",
      "shell.limits": "Atom requires an octet structure (for atoms with >1 filled electron shells) or a duplet structure (for atoms with 1 filled electron shell).",
      "process.idle": "Pick an element, then add or remove particles. Stability needs a full outer shell.",
      "stable": "Stable",
      "unstable": "Unstable",
      "atomForm": "atom",
      "ionForm": "ion",
      "btn.resetElement": "Reset to element defaults",
      "btn.hideText": "Hide description",
      "btn.showText": "Show description",
      "zoom.in": "Zoom in",
      "zoom.out": "Zoom out",
      "zoom.resetTitle": "Reset view",
      "step1": "Proton charge: {n} proton(s) × (+1) = {sum}",
      "step2": "{n} electron(s) × (−1) = {sum}",
      "step3": "Overall charge = {sumP} − {mag} = {net}",
      "shellStep": "Current electronic arrangement is {config}",
      "outerStep": "Outermost filled electron shell has {filled} electrons",
      "octetDupletStep": "This atom {can} attain a stable {structure} structure",
      "can": "can",
      "cannot": "cannot",
      "structure.octet": "octet",
      "structure.duplet": "duplet",
      "explainVerdict": "Therefore, this atom is {verdict}",
      "explainUnstableEmpty": "Therefore, this atom is unstable",
      "logRemoved": "1 {name} left the atom.",
      "logAdded": "Added 1 {name} into the atom.",
      "name.p": "proton",
      "name.n": "neutron",
      "name.e": "electron",
      "chargeBadge": "Charge {net}",
      "chargeNeutral": "Charge 0",
      "arrangementLabel": "Electronic arrangement",
      "arrangementHint": "Electronic arrangement: {config}",
      "badge.atomicLabel": "Atomic number (Z)",
      "badge.atomicFormula": "Z = number of protons = {p}",
      "badge.massLabel": "Mass number (A)",
      "badge.massFormula": "A = protons + neutrons = {p} + {n} = {A}"
    },
    zh: {
      "header.title": "化學原子實驗室",
      "header.subtitle": "以首 20 種元素組建原子 — 最外層電子殼填滿即穩定",
      "panel.model": "原子模型",
      "panel.controls": "控制",
      "panel.concepts": "概念",
      "legend.proton": "質子 (p) 電荷 +",
      "legend.neutron": "中子 (n)",
      "legend.electron": "電子 (e) 電荷 −",
      "label.ptable": "選擇元素（首 20 種）",
      "label.builder": "調整次原子粒子",
      "hint.builder": "可增減粒子。移走的粒子會飛離畫面並離開模型。",
      "hint.pan": "拖曳平移 · 滾輪縮放",
      "count.protons": "質子",
      "count.neutrons": "中子",
      "count.electrons": "電子",
      "info.stabilityTitle": "為何穩定／不穩定？",
      "info.chargeTitle": "電荷計算",
      "charge.rule": "總電荷 = 質子總電荷 − 電子電荷的總絕對值。",
      "shell.limits": "原子需要八隅體結構（多於一層電子殼的原子）或二隅體結構（只有一層電子殼的原子）。",
      "process.idle": "選擇元素後增減粒子。穩定條件：最外層電子殼已滿。",
      "stable": "穩定",
      "unstable": "不穩定",
      "atomForm": "原子",
      "ionForm": "離子",
      "btn.resetElement": "重設為元素預設",
      "btn.hideText": "隱藏描述",
      "btn.showText": "顯示描述",
      "zoom.in": "放大",
      "zoom.out": "縮小",
      "zoom.resetTitle": "重設視圖",
      "step1": "質子電荷：{n} 個質子 × (+1) = {sum}",
      "step2": "{n} 個電子 × (−1) = {sum}",
      "step3": "總電荷 = {sumP} − {mag} = {net}",
      "shellStep": "目前電子排布為 {config}",
      "outerStep": "最外層已填充電子殼有 {filled} 個電子",
      "octetDupletStep": "此原子{can}達到穩定的{structure}結構",
      "can": "可以",
      "cannot": "未能",
      "structure.octet": "八隅體",
      "structure.duplet": "二隅體",
      "explainVerdict": "因此，此原子是{verdict}",
      "explainUnstableEmpty": "因此，此原子是不穩定",
      "logRemoved": "已移走 1 個{name}。",
      "logAdded": "已加入 1 個{name}到原子中。",
      "name.p": "質子",
      "name.n": "中子",
      "name.e": "電子",
      "chargeBadge": "電荷 {net}",
      "chargeNeutral": "電荷 0",
      "arrangementLabel": "電子排布",
      "arrangementHint": "電子排布：{config}",
      "badge.atomicLabel": "質子數／原子序 (Z)",
      "badge.atomicFormula": "Z = 質子數目 = {p}",
      "badge.massLabel": "質量數 (A)",
      "badge.massFormula": "A = 質子 + 中子 = {p} + {n} = {A}"
    }
  };

  const ZOOM_MIN = 0.7;
  const ZOOM_MAX = 2.5;
  const ZOOM_STEP = 0.15;
  const MAX_P = 30;
  const MAX_N = 40;
  const MAX_E = 26;

  // Compact table with a mini gap between metals and non-metals (column index 2 unused)
  // Columns: 0 1 |gap| 3 4 5 6 7 8
  const PT_POS = {
    1: [0, 0], 2: [0, 8],
    3: [1, 0], 4: [1, 1], 5: [1, 3], 6: [1, 4], 7: [1, 5], 8: [1, 6], 9: [1, 7], 10: [1, 8],
    11: [2, 0], 12: [2, 1], 13: [2, 3], 14: [2, 4], 15: [2, 5], 16: [2, 6], 17: [2, 7], 18: [2, 8],
    19: [3, 0], 20: [3, 1]
  };

  const state = {
    lang: "en",
    Z: 8,
    protons: 8,
    neutrons: 8,
    electrons: 8,
    busy: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    hideDescriptions: false
  };

  const svg = document.getElementById("atom-svg");
  const atomViewport = document.getElementById("atom-viewport");
  const labScene = document.getElementById("lab-scene");
  const processLog = document.getElementById("process-log");
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const zoomResetBtn = document.getElementById("zoom-reset-btn");

  function t(key, vars) {
    let s = (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return s;
  }

  function formatCharge(n) {
    if (n > 0) return "+" + n;
    return String(n);
  }

  function netCharge() {
    return state.protons - state.electrons;
  }

  function elementByProtons(p) {
    return window.ATOM_LAB_ELEMENTS.find((e) => e.Z === p) || null;
  }

  function outerShellInfo(electrons) {
    const caps = window.ATOM_LAB_SHELL_CAPS;
    const shells = window.shellsForElectrons(electrons);
    if (!shells.length) {
      return { filled: 0, cap: caps[0], shells, full: false };
    }
    const outer = shells.length - 1;
    return {
      filled: shells[outer],
      cap: caps[outer],
      shells,
      full: shells[outer] === caps[outer]
    };
  }

  function applyTransform() {
    state.zoom = Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, state.zoom)) * 100) / 100;
    atomViewport.style.transform =
      `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
    zoomResetBtn.textContent = `${Math.round(state.zoom * 100)}%`;
    zoomOutBtn.disabled = state.zoom <= ZOOM_MIN + 0.001;
    zoomInBtn.disabled = state.zoom >= ZOOM_MAX - 0.001;
  }

  function setZoom(next) {
    state.zoom = next;
    applyTransform();
  }

  function resetView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform();
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    document.documentElement.lang = state.lang === "zh" ? "zh-HK" : "en";
    document.title = t("header.title") + " — Subatomic";
    zoomInBtn.setAttribute("title", t("zoom.in"));
    zoomInBtn.setAttribute("aria-label", t("zoom.in"));
    zoomOutBtn.setAttribute("title", t("zoom.out"));
    zoomOutBtn.setAttribute("aria-label", t("zoom.out"));
    zoomResetBtn.setAttribute("title", t("zoom.resetTitle"));
    zoomResetBtn.setAttribute("aria-label", t("zoom.resetTitle"));
    buildPeriodicTable();
    updateUI();
    syncDescToggle();
  }

  function syncDescToggle() {
    document.body.classList.toggle("hide-descriptions", state.hideDescriptions);
    const btn = document.getElementById("desc-toggle");
    if (!btn) return;
    const key = state.hideDescriptions ? "btn.showText" : "btn.hideText";
    btn.setAttribute("data-i18n", key);
    btn.textContent = t(key);
    btn.setAttribute("aria-pressed", state.hideDescriptions ? "true" : "false");
  }

  function loadElement(Z) {
    const el = window.ATOM_LAB_ELEMENTS.find((e) => e.Z === Z);
    if (!el) return;
    state.Z = Z;
    state.protons = el.Z;
    state.neutrons = el.massNumber - el.Z;
    state.electrons = el.Z;
    setLog(t("process.idle"), false);
    updateUI();
  }

  function buildPeriodicTable() {
    const wrap = document.getElementById("periodic-table");
    wrap.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "pt-grid";

    window.ATOM_LAB_ELEMENTS.forEach((el) => {
      const [row, col] = PT_POS[el.Z];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pt-cell" + (state.Z === el.Z ? " active" : "");
      btn.style.gridRow = String(row + 1);
      btn.style.gridColumn = String(col + 1);
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", state.Z === el.Z ? "true" : "false");
      const name = state.lang === "zh" ? el.nameZh : el.name;
      btn.title = `${el.Z}. ${el.symbol} — ${name}`;
      btn.innerHTML =
        `<span class="pt-z">${el.Z}</span>` +
        `<span class="pt-sym">${el.symbol}</span>`;
      btn.addEventListener("click", () => {
        interruptAnimation();
        loadElement(el.Z);
        buildPeriodicTable();
      });
      grid.appendChild(btn);
    });

    wrap.appendChild(grid);
  }

  function updateChargeAndStability() {
    const p = state.protons;
    const eCount = state.electrons;
    const pCharge = p;
    const eMag = eCount;
    const net = pCharge - eMag;
    const outer = outerShellInfo(eCount);
    const stable = window.isOuterShellFull(eCount);

    document.getElementById("step-proton-charge").textContent = t("step1", {
      n: p, sum: formatCharge(pCharge)
    });
    document.getElementById("step-electron-charge").textContent = t("step2", {
      n: eCount,
      sum: formatCharge(-eCount)
    });
    document.getElementById("step-net-charge").textContent = t("step3", {
      sumP: String(pCharge),
      mag: String(eMag),
      net: formatCharge(net)
    });

    document.getElementById("step-shell-config").textContent = t("shellStep", {
      config: window.describeShellConfig(eCount)
    });
    document.getElementById("step-outer-shell").textContent = t("outerStep", {
      filled: outer.filled
    });

    // Duplet = only one electron shell; octet = more than one shell
    const structureKey = outer.shells.length > 1 ? "structure.octet" : "structure.duplet";
    const canAttain = eCount > 0 && stable;
    document.getElementById("step-octet-duplet").textContent = t("octetDupletStep", {
      can: t(canAttain ? "can" : "cannot"),
      structure: t(structureKey)
    });

    const explain = document.getElementById("stability-explain");
    if (eCount <= 0) {
      explain.textContent = t("explainUnstableEmpty");
    } else {
      explain.textContent = t("explainVerdict", {
        verdict: (stable ? t("stable") : t("unstable")).toLowerCase()
      });
    }
    explain.className = "stability-explain " + (stable ? "ok" : "bad");

    const banner = document.getElementById("stability-banner");
    const text = document.getElementById("stability-text");
    banner.classList.remove("stable", "unstable");
    banner.classList.add(stable ? "stable" : "unstable");
    text.textContent = stable ? t("stable") : t("unstable");

    const chargeText = document.getElementById("charge-badge-text");
    chargeText.textContent = net === 0
      ? t("chargeNeutral")
      : t("chargeBadge", { net: formatCharge(net) });
  }

  function updateUI() {
    const matched = elementByProtons(state.protons);
    const net = netCharge();
    const A = state.protons + state.neutrons;
    const letter = matched ? matched.symbol : "X";
    const chargeEl = document.getElementById("nuclide-charge");
    document.getElementById("nuclide-mass").textContent = String(A);
    document.getElementById("nuclide-atomic").textContent = String(state.protons);
    document.getElementById("nuclide-letter").textContent = letter;

    if (net === 0) {
      chargeEl.textContent = "";
      chargeEl.hidden = true;
    } else {
      const abs = Math.abs(net);
      const sign = net > 0 ? "+" : "−";
      chargeEl.textContent = abs === 1 ? sign : abs + sign;
      chargeEl.hidden = false;
    }

    const nuclideRoot = document.getElementById("species-symbol");
    const chargeLabel = net === 0 ? "" : ` ${formatCharge(net)}`;
    nuclideRoot.setAttribute(
      "aria-label",
      `${letter}, mass number ${A}, atomic number ${state.protons}${chargeLabel}`
    );

    document.getElementById("species-atomic-formula").textContent = t("badge.atomicFormula", {
      p: state.protons
    });
    document.getElementById("species-mass-formula").textContent = t("badge.massFormula", {
      p: state.protons,
      n: state.neutrons,
      A
    });

    const config = window.describeShellConfig(state.electrons);
    const arrEl = document.getElementById("species-arrangement");
    arrEl.innerHTML =
      `<span class="arr-label">${t("arrangementLabel")}</span>` +
      `<span class="arr-value">${config}</span>`;

    document.getElementById("count-p").textContent = String(state.protons);
    document.getElementById("count-n").textContent = String(state.neutrons);
    document.getElementById("count-e").textContent = String(state.electrons);

    updateChargeAndStability();

    document.querySelectorAll("[data-action='dec']").forEach((btn) => {
      const type = btn.getAttribute("data-ptype");
      const n = type === "p" ? state.protons : type === "n" ? state.neutrons : state.electrons;
      btn.disabled = n <= 0;
    });
    document.querySelectorAll("[data-action='inc']").forEach((btn) => {
      const type = btn.getAttribute("data-ptype");
      const n = type === "p" ? state.protons : type === "n" ? state.neutrons : state.electrons;
      const max = type === "p" ? MAX_P : type === "n" ? MAX_N : MAX_E;
      btn.disabled = n >= max;
    });

    window.AtomRenderer.render(svg, {
      protons: state.protons,
      neutrons: state.neutrons,
      electrons: state.electrons
    });

    applyTransform();
  }

  function setLog(message, active) {
    processLog.textContent = message;
    processLog.classList.toggle("active", !!active);
  }

  let activeAnimSkip = null;
  let animGen = 0;

  function interruptAnimation() {
    if (activeAnimSkip) {
      const skip = activeAnimSkip;
      activeAnimSkip = null;
      skip();
    }
    state.busy = false;
    animGen += 1;
  }

  function setBusy(v) {
    state.busy = v;
    if (!v) {
      document.querySelectorAll(".pt-cell, #reset-element-btn").forEach((b) => {
        b.disabled = false;
      });
      updateUI();
    }
  }

  async function removeParticle(type) {
    interruptAnimation();
    const gen = animGen;

    const count = type === "p" ? state.protons : type === "n" ? state.neutrons : state.electrons;
    if (count <= 0) return;

    // Capture fly-away origin BEFORE re-render (electrons: reverse placement order)
    const startPos = window.AtomRenderer.getFlyAwayStart(type);

    state.busy = true;
    if (type === "p") state.protons -= 1;
    else if (type === "n") state.neutrons -= 1;
    else state.electrons -= 1;

    setLog(t("logRemoved", { name: t("name." + type) }), true);
    // Sync control-panel counts immediately (do not wait for fly-off animation)
    updateUI();

    const anim = window.AtomRenderer.animateOffScreen(svg, type, startPos);
    activeAnimSkip = anim.skip;
    await anim.promise;
    if (gen !== animGen) return;
    activeAnimSkip = null;
    state.busy = false;
  }

  function addParticle(type) {
    interruptAnimation();
    const count = type === "p" ? state.protons : type === "n" ? state.neutrons : state.electrons;
    const max = type === "p" ? MAX_P : type === "n" ? MAX_N : MAX_E;
    if (count >= max) return;

    if (type === "p") state.protons += 1;
    else if (type === "n") state.neutrons += 1;
    else state.electrons += 1;
    setLog(t("logAdded", { name: t("name." + type) }), true);
    updateUI();
  }

  document.querySelector(".builder-rows").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn || btn.disabled) return;
    const action = btn.getAttribute("data-action");
    const type = btn.getAttribute("data-ptype");
    if (action === "inc") addParticle(type);
    else removeParticle(type);
  });

  document.getElementById("reset-element-btn").addEventListener("click", () => {
    interruptAnimation();
    loadElement(state.Z);
    buildPeriodicTable();
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lang = btn.getAttribute("data-lang");
      document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b === btn));
      applyI18n();
    });
  });

  const descToggle = document.getElementById("desc-toggle");
  if (descToggle) {
    descToggle.addEventListener("click", () => {
      state.hideDescriptions = !state.hideDescriptions;
      syncDescToggle();
      window.dispatchEvent(new Event("resize"));
    });
  }

  zoomInBtn.addEventListener("click", () => setZoom(state.zoom + ZOOM_STEP));
  zoomOutBtn.addEventListener("click", () => setZoom(state.zoom - ZOOM_STEP));
  zoomResetBtn.addEventListener("click", () => resetView());

  labScene.addEventListener("wheel", (e) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1;
    setZoom(state.zoom + dir * ZOOM_STEP);
  }, { passive: false });

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  labScene.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, a, input, select")) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    labScene.classList.add("panning");
    labScene.setPointerCapture(e.pointerId);
  });

  labScene.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    state.panX += e.clientX - lastX;
    state.panY += e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    applyTransform();
  });

  function endPan(e) {
    if (!dragging) return;
    dragging = false;
    labScene.classList.remove("panning");
    try { labScene.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  }

  labScene.addEventListener("pointerup", endPan);
  labScene.addEventListener("pointercancel", endPan);

  // Resizable Controls / Concepts split (initial sizes match prior defaults)
  (function initPanelSplitter() {
    const splitter = document.getElementById("panel-splitter");
    const controlsBody = document.querySelector('.side-stack > .panel[aria-label="Controls"] .controls');
    const conceptsBody = document.querySelector(".side-stack .concepts-body");
    if (!splitter || !controlsBody || !conceptsBody) return;

    const MIN_H = 120;
    function defaultControlsH() {
      // Match screenshot: full periodic table + builder intro, protons row just peeking
      return 310;
    }
    function defaultConceptsH() {
      return Math.min(window.innerHeight * 0.42, 420);
    }
    function maxH() {
      return Math.max(MIN_H + 40, window.innerHeight * 0.85);
    }

    const heights = {
      controls: defaultControlsH(),
      concepts: defaultConceptsH()
    };

    function applyHeights() {
      controlsBody.style.setProperty("--panel-body-h", `${Math.round(heights.controls)}px`);
      conceptsBody.style.setProperty("--panel-body-h", `${Math.round(heights.concepts)}px`);
      splitter.setAttribute("aria-valuenow", String(Math.round(heights.controls)));
    }

    function resizeBy(dy) {
      let c = heights.controls + dy;
      let n = heights.concepts - dy;
      const max = maxH();

      if (c < MIN_H) {
        n += (MIN_H - c); // extend Concepts when Controls hits minimum
        c = MIN_H;
      }
      if (n < MIN_H) {
        c += (MIN_H - n); // extend Controls when Concepts hits minimum
        n = MIN_H;
      }

      heights.controls = Math.min(max, Math.max(MIN_H, c));
      heights.concepts = Math.min(max, Math.max(MIN_H, n));
      applyHeights();
    }

    applyHeights();
    splitter.setAttribute("aria-valuemin", String(MIN_H));
    splitter.setAttribute("aria-valuemax", String(Math.round(maxH())));

    let draggingSplit = false;
    let lastY = 0;

    splitter.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      draggingSplit = true;
      lastY = e.clientY;
      splitter.classList.add("is-dragging");
      splitter.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    splitter.addEventListener("pointermove", (e) => {
      if (!draggingSplit) return;
      const dy = e.clientY - lastY;
      lastY = e.clientY;
      resizeBy(dy);
    });

    function endSplitDrag(e) {
      if (!draggingSplit) return;
      draggingSplit = false;
      splitter.classList.remove("is-dragging");
      try { splitter.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }

    splitter.addEventListener("pointerup", endSplitDrag);
    splitter.addEventListener("pointercancel", endSplitDrag);

    splitter.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 24 : 12;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        resizeBy(-step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        resizeBy(step);
      } else if (e.key === "Home") {
        e.preventDefault();
        heights.controls = defaultControlsH();
        heights.concepts = defaultConceptsH();
        applyHeights();
      }
    });

    window.addEventListener("resize", () => {
      // Keep within new viewport bounds without resetting user preference
      const max = maxH();
      heights.controls = Math.min(heights.controls, max);
      heights.concepts = Math.min(heights.concepts, max);
      applyHeights();
      splitter.setAttribute("aria-valuemax", String(Math.round(max)));
    });
  })();

  loadElement(8);
  applyI18n();
})();
