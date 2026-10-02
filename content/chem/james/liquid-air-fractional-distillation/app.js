(() => {
  "use strict";

  const BP = { N2: -196, Ar: -185, O2: -183 };
  const N2_SEP = -196;
  const AR_SEP = -185;
  const PURIFY_T = -80;
  const LIQUID_T = -200;
  // Column 1 may warm past N₂'s boiling point, but not to −185 °C or Ar boils there too.
  const COL1_WARM_LIMIT = -190;
  // Column 2 may warm past Ar's boiling point, but not to −183 °C or O₂ boils.
  const COL2_WARM_LIMIT = -184;

  const STRINGS = {
    en: {
      title: "Liquid Air Fractional Distillation",
      subtitle: "Dynamic thermal simulation of purifying, liquefying and fractionating air",
      labTitle: "Interactive process laboratory",
      labHeading: "Thermal process control",
      stage1Short: "Purification",
      stage2Short: "Liquefaction",
      stage3Short: "Distillation",
      chipStage: "Stage",
      chipTemp: "Temperature",
      chipPhase: "Phase",
      play: "Play",
      pause: "Pause",
      auto: "Auto",
      stop: "Stop",
      step: "Step",
      reset: "Reset",
      hideText: "Hide description",
      showText: "Show description",
      processProgress: "Process progress",
      workspace: "Workspace",
      notes: "Process notes",
      whatHappening: "What is happening",
      data: "Reference data",
      bpTable: "Boiling points",
      colGas: "Gas",
      colFormula: "Formula",
      colBp: "b.p. / °C",
      colState: "State now",
      nitrogen: "Nitrogen",
      argon: "Argon",
      oxygen: "Oxygen",
      bpNote: "In Stage 3, N₂ separates at −196 °C in column 1; Ar at −185 °C in column 2; liquid O₂ collects at the bottom of column 2.",
      phaseCooling: "Cooling",
      phaseLiquefying: "Liquefying",
      phaseWarming: "Warming",
      stage1Title: "Stage 1 — Purification",
      stage2Title: "Stage 2 — Liquefaction",
      stage3Title: "Stage 3 — Fractional Distillation",
      gas: "Gas",
      liquid: "Liquid",
      exiting: "Exiting",
      remaining: "Remaining",
      notYet: "—",
      dustPending: "Dust in air",
      dustDone: "Dust filtered",
      h2oPending: "H₂O vapor present",
      h2oActive: "H₂O solidifying (−80 °C)",
      h2oDone: "H₂O(s) removed",
      co2Pending: "CO₂ vapor present",
      co2Active: "CO₂ solidifying (−80 °C)",
      co2Done: "CO₂(s) removed",
      compress: "Compressing",
      cool: "Cooling",
      expand: "Expanding",
      liquidAir: "Liquid air forming (−200 °C)",
      liquidAirDone: "Liquid air ready",
      n2Out: "N₂ gas exiting",
      arOut: "Ar vapor rising",
      o2Bottom: "O₂ liquid at bottom",
      caption1a: "Ambient air enters the plant. Dust particles are trapped by filters so they cannot clog downstream pipes.",
      caption1b: "Temperature falls toward −80 °C. Water vapor begins to freeze as ice and is removed.",
      caption1c: "At about −80 °C, carbon dioxide solidifies as dry ice and is scraped away — preventing pipe blockage.",
      caption1d: "Purified dry air is ready for liquefaction. Dust, H₂O and CO₂ have been removed.",
      caption2a: "Air is compressed, raising pressure. Heat of compression is removed by coolers.",
      caption2b: "Repeated cool–expand cycles lower the temperature. The Joule–Thomson expansion cools the gas further.",
      caption2c: "Near −200 °C, air condenses into pale blue liquid air — a mixture of N₂, Ar and O₂.",
      caption3a: "Liquid air enters the first fractionating column and is warmed slowly.",
      caption3b: "At −196 °C, nitrogen (b.p. −196 °C) boils first and leaves as gas from the top of column 1.",
      caption3c: "The O₂+Ar-rich liquid passes to column 2. At −185 °C, argon vaporises and is collected.",
      caption3d: "Oxygen (b.p. −183 °C) remains liquid longest and is collected at the bottom of column 2.",
      notes1: "Air must be cleaned before deep cooling. Solids of H₂O and CO₂ would block narrow pipes.",
      notes2: "Compression, cooling and expansion convert purified air into liquid air near −200 °C.",
      notes3: "Two fractionating columns separate liquid air by boiling point: N₂ first, then Ar; O₂ stays liquid at the bottom of column 2.",
      bullet1a: "Filter removes dust particles from inlet air.",
      bullet1b: "Cool to about −80 °C so H₂O and CO₂ freeze out.",
      bullet1c: "Solid impurities are removed to protect the plant.",
      bullet2a: "Compress air, then cool it under pressure.",
      bullet2b: "Allow controlled expansion to drop the temperature.",
      bullet2c: "Liquid air forms when the mixture reaches about −200 °C.",
      bullet3a: "Warm liquid air gradually in column 1 (N₂ separation).",
      bullet3b: "N₂ exits column 1 at −196 °C; O₂+Ar liquid feeds column 2.",
      bullet3c: "Ar separates at −185 °C in column 2; liquid O₂ collects at the bottom.",
    },
    zh: {
      title: "液態空氣分餾",
      subtitle: "淨化、液化和分餾空氣的動態熱力模擬",
      labTitle: "互動過程實驗室",
      labHeading: "熱力過程控制",
      stage1Short: "淨化",
      stage2Short: "液化",
      stage3Short: "分餾",
      chipStage: "階段",
      chipTemp: "溫度",
      chipPhase: "過程",
      play: "播放",
      pause: "暫停",
      auto: "自動",
      stop: "停止",
      step: "單步",
      reset: "重設",
      hideText: "隱藏描述",
      showText: "顯示描述",
      processProgress: "過程進度",
      workspace: "工作區",
      notes: "過程說明",
      whatHappening: "正在發生什麼",
      data: "參考數據",
      bpTable: "沸點",
      colGas: "氣體",
      colFormula: "化學式",
      colBp: "沸點 / °C",
      colState: "目前狀態",
      nitrogen: "氮",
      argon: "氬",
      oxygen: "氧",
      bpNote: "在第三階段，N₂ 於 −196 °C 在第一分餾塔分離；Ar 於 −185 °C 在第二分餾塔分離；液態 O₂ 積聚在第二塔底部。",
      phaseCooling: "冷卻中",
      phaseLiquefying: "液化中",
      phaseWarming: "升溫中",
      stage1Title: "第一階段 — 淨化",
      stage2Title: "第二階段 — 液化",
      stage3Title: "第三階段 — 分餾塔",
      gas: "氣態",
      liquid: "液態",
      exiting: "離開中",
      remaining: "殘留",
      notYet: "—",
      dustPending: "空氣含塵",
      dustDone: "已濾除灰塵",
      h2oPending: "含水蒸氣",
      h2oActive: "水蒸氣凝固（−80 °C）",
      h2oDone: "已除去 H₂O(s)",
      co2Pending: "含二氧化碳",
      co2Active: "CO₂ 凝固（−80 °C）",
      co2Done: "已除去 CO₂(s)",
      compress: "壓縮中",
      cool: "冷卻中",
      expand: "膨脹中",
      liquidAir: "液態空氣形成（−200 °C）",
      liquidAirDone: "液態空氣就緒",
      n2Out: "N₂ 氣體離開",
      arOut: "Ar 蒸氣上升",
      o2Bottom: "O₂ 液態在底部",
      caption1a: "環境空氣進入裝置。灰塵被過濾器截留，以免堵塞下游管道。",
      caption1b: "溫度降至接近 −80 °C。水蒸氣開始結成冰並被除去。",
      caption1c: "約在 −80 °C，二氧化碳凝固成乾冰並被刮除——避免管道堵塞。",
      caption1d: "淨化後的乾燥空氣已可進入液化。灰塵、H₂O 和 CO₂ 均已除去。",
      caption2a: "空氣被壓縮，壓力上升。壓縮熱經冷卻器帶走。",
      caption2b: "反覆冷卻與膨脹使溫度下降。焦耳–湯姆孫膨脹進一步冷卻氣體。",
      caption2c: "接近 −200 °C 時，空氣凝結成淡藍色液態空氣——N₂、Ar 與 O₂ 的混合物。",
      caption3a: "液態空氣進入第一分餾塔並緩慢升溫。",
      caption3b: "在 −196 °C，氮（沸點 −196 °C）最先沸騰，以氣體從第一塔頂部離開。",
      caption3c: "富 O₂+Ar 的液體進入第二塔。在 −185 °C，氬汽化並被收集。",
      caption3d: "氧（沸點 −183 °C）最長時間保持液態，並在第二塔底部收集。",
      notes1: "深度冷卻前必須淨化空氣。H₂O 與 CO₂ 的固體會堵塞窄管。",
      notes2: "壓縮、冷卻與膨脹把淨化空氣轉化為約 −200 °C 的液態空氣。",
      notes3: "兩座分餾塔按沸點分離液態空氣：N₂ 先離開，然後是 Ar；O₂ 留在第二塔底部。",
      bullet1a: "過濾器除去入口空氣中的灰塵。",
      bullet1b: "冷卻至約 −80 °C，使 H₂O 與 CO₂ 凝固析出。",
      bullet1c: "除去固體雜質以保護裝置。",
      bullet2a: "壓縮空氣，再在壓力下冷卻。",
      bullet2b: "控制膨脹使溫度下降。",
      bullet2c: "混合物約達 −200 °C 時形成液態空氣。",
      bullet3a: "在第一分餾塔內逐漸加熱液態空氣（分離 N₂）。",
      bullet3b: "N₂ 於 −196 °C 從第一塔離開；O₂+Ar 液體送入第二塔。",
      bullet3c: "Ar 於 −185 °C 在第二塔分離；液態 O₂ 在塔底收集。",
    },
  };

  function stateFromProgress(p) {
    const clamped = Math.max(0, Math.min(1, p));
    let stage;
    let local;
    let temperature;
    let phaseKey;

    if (clamped < 1 / 3) {
      stage = 1;
      local = clamped / (1 / 3);
      temperature = lerp(25, PURIFY_T, easeInOut(local));
      phaseKey = "phaseCooling";
    } else if (clamped < 2 / 3) {
      stage = 2;
      local = (clamped - 1 / 3) / (1 / 3);
      temperature = lerp(PURIFY_T, LIQUID_T, easeInOut(local));
      phaseKey = "phaseLiquefying";
    } else {
      stage = 3;
      local = (clamped - 2 / 3) / (1 / 3);
      temperature = lerp(LIQUID_T, COL2_WARM_LIMIT, easeInOut(local));
      phaseKey = "phaseWarming";
    }

    return { progress: clamped, stage, local, temperature, phaseKey };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function formatTemp(t) {
    const rounded = Math.round(t);
    const sign = rounded > 0 ? "" : rounded < 0 ? "−" : "";
    return `${sign}${Math.abs(rounded)} °C`;
  }

  const state = {
    progress: 0,
    lastProgress: 0,
    autoRun: false,
    lang: "en",
    hideDescriptions: false,
    viewStage: 1,
    lastTs: 0,
    flow: [],
    dust: [],
    frost: [],
    mist: [],
    droplets: [],
    vapor: [],
    reflux: [],
    compMols: [],
    expMols: [],
    pipeMols: [],
    inletMols: [],
    transferMols: [],
    scraperY: 210,
    scraperDir: 1,
    tankN2: 0,
    tankAr: 0,
    tankO2: 0,
  };

  const els = {};

  function t(key) {
    return STRINGS[state.lang][key] || STRINGS.en[key] || key;
  }

  function initDom() {
    els.auto = document.getElementById("autoButton");
    els.step = document.getElementById("stepButton");
    els.reset = document.getElementById("resetButton");
    els.slider = document.getElementById("progressSlider");
    els.progressLabel = document.getElementById("progressLabel");
    els.chipStage = document.getElementById("chipStageValue");
    els.chipTemp = document.getElementById("chipTempValue");
    els.chipPhase = document.getElementById("chipPhaseValue");
    els.stageTitle = document.getElementById("stageTitle");
    els.stageTemp = document.getElementById("stageTempBadge");
    els.statusChips = document.getElementById("statusChips");
    els.liveCaption = document.getElementById("liveCaption");
    els.notesBody = document.getElementById("notesBody");
    els.notesList = document.getElementById("notesList");
    els.stateN2 = document.getElementById("stateN2");
    els.stateAr = document.getElementById("stateAr");
    els.stateO2 = document.getElementById("stateO2");
    els.rowN2 = document.getElementById("rowN2");
    els.rowAr = document.getElementById("rowAr");
    els.rowO2 = document.getElementById("rowO2");
    els.canvas = document.getElementById("simCanvas");
    els.ctx = els.canvas.getContext("2d");
    els.stageTabs = [...document.querySelectorAll(".stage-tab")];
    els.langButtons = [...document.querySelectorAll("[data-lang]")];
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (STRINGS[state.lang][key]) node.textContent = STRINGS[state.lang][key];
    });
    document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
    document.title =
      state.lang === "zh"
        ? "液態空氣分餾 · Liquid Air Fractional Distillation"
        : "Liquid Air Fractional Distillation · 液態空氣分餾";
    syncAutoButton();
    syncDescToggle();
  }

  function syncDescToggle() {
    document.body.classList.toggle("hide-descriptions", state.hideDescriptions);
    const btn = document.getElementById("descToggle");
    if (!btn) return;
    const key = state.hideDescriptions ? "showText" : "hideText";
    btn.dataset.i18n = key;
    btn.textContent = STRINGS[state.lang][key];
    btn.setAttribute("aria-pressed", state.hideDescriptions ? "true" : "false");
  }

  // ——— Particle helpers ———

  function makeFlowParticle(xMin, xMax, yMin, yMax, speed) {
    return {
      x: xMin + Math.random() * (xMax - xMin),
      y: yMin + Math.random() * (yMax - yMin),
      r: 1.2 + Math.random() * 2.2,
      vx: speed * (0.7 + Math.random() * 0.6),
      phase: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.45,
    };
  }

  function seedParticles() {
    state.flow = Array.from({ length: 90 }, () =>
      makeFlowParticle(242, 258, 32, 78, 1.8)
    );
    state.dust = Array.from({ length: 42 }, () => ({
      x: 244 + Math.random() * 12,
      y: 32 + Math.random() * 48,
      r: 2 + Math.random() * 3.2,
      vx: 0.9 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      caught: false,
      pileY: 0,
    }));
    state.frost = Array.from({ length: 55 }, () => ({
      x: 186 + Math.random() * 128,
      y: 188 + Math.random() * 150,
      size: 2.5 + Math.random() * 5,
      kind: Math.random() < 0.55 ? "h2o" : "co2",
      birth: Math.random(),
      fall: 0,
      removed: false,
      spin: Math.random() * Math.PI,
    }));
    state.mist = Array.from({ length: 40 }, () => ({
      x: 455 + Math.random() * 40,
      y: 200 + Math.random() * 50,
      r: 2 + Math.random() * 5,
      life: Math.random(),
    }));
    state.droplets = Array.from({ length: 48 }, () => ({
      x: 592 + Math.random() * 40,
      y: 270 + Math.random() * 70,
      r: 1.8 + Math.random() * 2.2,
      vy: 0.8 + Math.random() * 1.2,
      active: false,
    }));
    state.vapor = Array.from({ length: 50 }, (_, i) => ({
      x: 0,
      y: 0,
      r: 2 + Math.random() * 4,
      vy: 0.8 + Math.random() * 1.5,
      gas: i % 2 === 0 ? "N2" : "Ar",
      column: i % 2 === 0 ? 1 : 2,
      reset: true,
    }));
    state.reflux = Array.from({ length: 28 }, () => ({
      x: 0,
      y: 0,
      r: 1.5 + Math.random() * 2,
      vy: 0.6 + Math.random() * 1.2,
      reset: true,
    }));
    state.compMols = Array.from({ length: 28 }, () => ({
      nx: 0.15 + Math.random() * 0.7,
      ny: 0.15 + Math.random() * 0.7,
      r: 2.2 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    }));
    state.expMols = Array.from({ length: 36 }, () => ({
      side: Math.random() < 0.45 ? "high" : "low",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 2 + Math.random() * 2.4,
      life: Math.random(),
      reset: true,
    }));
    state.pipeMols = Array.from({ length: 70 }, (_, i) => {
      const zone = Math.min(4, Math.floor((i / 70) * 5));
      return makeZoneMol(zone);
    });
    const inletY = STAGE3_LAYOUT.col1.y + Math.round(STAGE3_LAYOUT.col1.h * 0.55);
    state.inletMols = Array.from({ length: 24 }, () => ({
      x: 20 + Math.random() * 40,
      y: inletY - 15 + Math.random() * 30,
      vx: 1.2 + Math.random() * 0.8,
      r: 2 + Math.random() * 2.5,
      liquid: Math.random() < 0.6,
    }));
    state.transferMols = Array.from({ length: 16 }, () => ({
      t: Math.random(),
      r: 1.8 + Math.random() * 2,
    }));
    state.scraperY = 210;
    state.scraperDir = 1;
    state.tankN2 = 0;
    state.tankAr = 0;
    state.tankO2 = 0;
  }

  function maybeReseedOnScrub(p) {
    if (p + 0.02 < state.lastProgress) seedParticles();
    state.lastProgress = p;
  }

  function setProgress(p) {
    const next = Math.max(0, Math.min(1, p));
    maybeReseedOnScrub(next);
    state.progress = next;
    els.slider.value = String(Math.round(state.progress * 1000));
    const sim = stateFromProgress(state.progress);
    if (state.autoRun) state.viewStage = sim.stage;
    updateUI(sim);
  }

  function syncAutoButton() {
    if (!els.auto) return;
    const on = state.autoRun;
    els.auto.textContent = on ? t("stop") : t("auto");
    els.auto.setAttribute("aria-pressed", on ? "true" : "false");
    els.auto.classList.toggle("auto-on", on);
  }

  function stopAuto() {
    state.autoRun = false;
    syncAutoButton();
  }

  function updateUI(sim) {
    const view = getViewState(sim);
    els.progressLabel.textContent = `${Math.round(state.progress * 100)}%`;
    els.chipStage.textContent = String(state.viewStage);
    els.chipTemp.textContent = formatTemp(view.temperature);
    els.chipPhase.textContent = t(view.phaseKey);
    els.stageTemp.textContent = formatTemp(view.temperature);

    const titles = { 1: "stage1Title", 2: "stage2Title", 3: "stage3Title" };
    els.stageTitle.textContent = t(titles[state.viewStage]);

    els.stageTabs.forEach((tab) => {
      const s = Number(tab.dataset.stage);
      tab.classList.toggle("active", state.viewStage === s);
      tab.setAttribute("aria-selected", state.viewStage === s ? "true" : "false");
      tab.disabled = false;
    });

    updateStatusAndCaption(view);
    updateBoilingStates(view);
  }

  function getViewState(sim) {
    if (state.viewStage === sim.stage) return sim;
    const anchors = {
      1: Math.min(state.progress, 1 / 3 - 0.001),
      2: Math.min(Math.max(state.progress, 1 / 3), 2 / 3 - 0.001),
      3: Math.max(state.progress, 2 / 3),
    };
    return stateFromProgress(anchors[state.viewStage] ?? state.progress);
  }

  function updateStatusAndCaption(view) {
    const chips = [];
    let caption = "";
    let notesKey = "";
    let bullets = [];

    if (state.viewStage === 1) {
      notesKey = "notes1";
      bullets = ["bullet1a", "bullet1b", "bullet1c"];
      const local = view.stage === 1 ? view.local : 1;
      const dustDone = local > 0.15;
      const h2oStart = view.temperature <= -40 || local > 0.45;
      const h2oDone = view.temperature <= PURIFY_T + 5 && local > 0.7;
      const co2Start = view.temperature <= -60 || local > 0.55;
      const co2Done = view.temperature <= PURIFY_T + 2 && local > 0.85;

      chips.push(chip(dustDone ? "dustDone" : "dustPending", dustDone ? "done" : "active"));
      chips.push(
        chip(
          h2oDone ? "h2oDone" : h2oStart ? "h2oActive" : "h2oPending",
          h2oDone ? "done" : h2oStart ? "active" : "pending"
        )
      );
      chips.push(
        chip(
          co2Done ? "co2Done" : co2Start ? "co2Active" : "co2Pending",
          co2Done ? "done" : co2Start ? "active" : "pending"
        )
      );

      if (local < 0.25) caption = t("caption1a");
      else if (local < 0.55) caption = t("caption1b");
      else if (local < 0.85) caption = t("caption1c");
      else caption = t("caption1d");
    } else if (state.viewStage === 2) {
      notesKey = "notes2";
      bullets = ["bullet2a", "bullet2b", "bullet2c"];
      const local = view.stage === 2 ? view.local : 1;
      chips.push(chip("compress", local < 0.35 ? "active" : "done"));
      chips.push(chip("cool", local >= 0.2 && local < 0.7 ? "active" : local >= 0.7 ? "done" : "pending"));
      chips.push(chip("expand", local >= 0.45 && local < 0.85 ? "active" : local >= 0.85 ? "done" : "pending"));
      chips.push(
        chip(
          local > 0.9 ? "liquidAirDone" : "liquidAir",
          local > 0.75 ? (local > 0.9 ? "done" : "active") : "pending"
        )
      );

      if (local < 0.35) caption = t("caption2a");
      else if (local < 0.75) caption = t("caption2b");
      else caption = t("caption2c");
    } else {
      notesKey = "notes3";
      bullets = ["bullet3a", "bullet3b", "bullet3c"];
      const temp = view.temperature;
      const n2Out = temp >= N2_SEP;
      const arOut = temp >= AR_SEP;
      const o2Collecting = temp >= N2_SEP && temp < COL2_WARM_LIMIT;
      const o2Done = temp >= COL2_WARM_LIMIT;

      chips.push(chip("n2Out", n2Out ? "active" : "pending"));
      chips.push(chip("arOut", arOut ? "active" : "pending"));
      chips.push(chip("o2Bottom", o2Done ? "done" : o2Collecting ? "active" : "pending"));

      if (temp < N2_SEP) caption = t("caption3a");
      else if (temp < AR_SEP) caption = t("caption3b");
      else if (temp < COL2_WARM_LIMIT) caption = t("caption3c");
      else caption = t("caption3d");
    }

    els.statusChips.innerHTML = chips.join("");
    els.liveCaption.textContent = caption;
    els.notesBody.textContent = t(notesKey);
    els.notesList.innerHTML = bullets.map((k) => `<li>${t(k)}</li>`).join("");
  }

  function chip(key, cls) {
    return `<span class="status-chip ${cls}">${t(key)}</span>`;
  }

  function updateBoilingStates(view) {
    const temp = view.temperature;
    let n2 = t("notYet");
    let ar = t("notYet");
    let o2 = t("notYet");

    els.rowN2.className = "";
    els.rowAr.className = "";
    els.rowO2.className = "";

    if (state.viewStage === 3) {
      if (temp < N2_SEP) {
        n2 = t("liquid");
        ar = t("liquid");
        o2 = t("liquid");
      } else if (temp < AR_SEP) {
        n2 = t("exiting");
        ar = t("liquid");
        o2 = t("liquid");
        els.rowN2.className = "highlight-n2";
      } else if (temp < BP.O2) {
        n2 = t("gas");
        ar = t("exiting");
        o2 = t("liquid");
        els.rowAr.className = "highlight-ar";
      } else {
        n2 = t("gas");
        ar = t("gas");
        o2 = t("remaining");
        els.rowO2.className = "highlight-o2";
      }
    }

    els.stateN2.textContent = n2;
    els.stateAr.textContent = ar;
    els.stateO2.textContent = o2;
  }

  // ——— Drawing helpers ———

  function roundedRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawLabel(ctx, text, x, y, color = "#17345a", size = 13) {
    ctx.fillStyle = color;
    ctx.font = `600 ${size}px Segoe UI, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(text, x, y);
  }

  function drawPipe(ctx, x1, y1, x2, y2, width, color) {
    ctx.lineCap = "round";
    ctx.strokeStyle = mixHex(color, "#1a3a5c", 0.4);
    ctx.lineWidth = width + 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawFlowArrow(ctx, x, y, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-6, 5);
    ctx.lineTo(-6, -5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFlowDashes(ctx, x1, y1, x2, y2, now, color) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const spacing = 14;
    const offset = ((now / 30) % spacing);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    for (let d = -spacing + offset; d < len; d += spacing) {
      const sx = x1 + ux * d;
      const sy = y1 + uy * d;
      const ex = x1 + ux * Math.min(len, d + 7);
      const ey = y1 + uy * Math.min(len, d + 7);
      if (d + 7 < 0) continue;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }

  function parseHexColor(hex) {
    if (typeof hex !== "string") {
      return { r: 0, g: 0, b: 0 };
    }
    const rgbMatch = hex.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (rgbMatch) {
      return {
        r: Math.round(Number(rgbMatch[1])),
        g: Math.round(Number(rgbMatch[2])),
        b: Math.round(Number(rgbMatch[3])),
      };
    }
    const h = hex.replace("#", "").trim();
    if (h.length >= 6 && /^[0-9a-fA-F]+$/.test(h.slice(0, 6))) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
      };
    }
    return { r: 128, g: 128, b: 128 };
  }

  function mixHex(hex, toward, t) {
    const a = parseHexColor(hex);
    const b = parseHexColor(toward);
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const bl = Math.round(a.b + (b.b - a.b) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function muteHex(hex) {
    return mixHex(hex, "#9aa8b8", 0.45);
  }

  /** Orthogonal path with elbow set back from the tank so the bend is visible. */
  function orthoTubePoints(x1, y1, x2, y2, prefer) {
    if (Math.abs(x1 - x2) < 1.5 || Math.abs(y1 - y2) < 1.5) {
      return [
        [x1, y1],
        [x2, y2],
      ];
    }
    const stub = 22;
    if (prefer === "vh") {
      const midY = y2 > y1 ? y2 - stub : y2 + stub;
      if (Math.abs(midY - y1) < 8) {
        return [
          [x1, y1],
          [x1, y2],
          [x2, y2],
        ];
      }
      return [
        [x1, y1],
        [x1, midY],
        [x2, midY],
        [x2, y2],
      ];
    }
    const midX = x2 > x1 ? x2 - stub : x2 + stub;
    if (Math.abs(midX - x1) < 8) {
      return [
        [x1, y1],
        [x2, y1],
        [x2, y2],
      ];
    }
    return [
      [x1, y1],
      [midX, y1],
      [midX, y2],
      [x2, y2],
    ];
  }

  function drawTubeSegment(ctx, x1, y1, x2, y2, width, color) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const hw = width / 2;
    const ax = x1 + nx * hw;
    const ay = y1 + ny * hw;
    const bx = x1 - nx * hw;
    const by = y1 - ny * hw;
    const cx = x2 - nx * hw;
    const cy = y2 - ny * hw;
    const dx2 = x2 + nx * hw;
    const dy2 = y2 + ny * hw;

    // outer metal rim
    const ox = nx * 1.6;
    const oy = ny * 1.6;
    ctx.beginPath();
    ctx.moveTo(ax + ox, ay + oy);
    ctx.lineTo(dx2 + ox, dy2 + oy);
    ctx.lineTo(cx - ox, cy - oy);
    ctx.lineTo(bx - ox, by - oy);
    ctx.closePath();
    ctx.fillStyle = mixHex(color, "#0f1c2a", 0.65);
    ctx.fill();

    const g = ctx.createLinearGradient(ax, ay, bx, by);
    g.addColorStop(0, mixHex(color, "#0f1c2a", 0.62));
    g.addColorStop(0.22, mixHex(color, "#ffffff", 0.55));
    g.addColorStop(0.38, mixHex(color, "#ffffff", 0.22));
    g.addColorStop(0.55, color);
    g.addColorStop(0.82, mixHex(color, "#1a2838", 0.28));
    g.addColorStop(1, mixHex(color, "#0f1c2a", 0.58));

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(dx2, dy2);
    ctx.lineTo(cx, cy);
    ctx.lineTo(bx, by);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();

    // specular highlight strip
    const hx1 = x1 + nx * hw * 0.45;
    const hy1 = y1 + ny * hw * 0.45;
    const hx2 = x2 + nx * hw * 0.45;
    const hy2 = y2 + ny * hw * 0.45;
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = Math.max(1.5, width * 0.18);
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(hx1, hy1);
    ctx.lineTo(hx2, hy2);
    ctx.stroke();
  }

  function drawTubeFlange(ctx, x, y, width, color) {
    const outer = width * 0.85 + 3;
    const inner = width * 0.35 + 1;
    ctx.beginPath();
    ctx.arc(x, y, outer, 0, Math.PI * 2);
    ctx.fillStyle = mixHex(color, "#2a3544", 0.35);
    ctx.fill();
    ctx.strokeStyle = mixHex(color, "#0f1c2a", 0.55);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, inner, 0, Math.PI * 2);
    ctx.fillStyle = mixHex(color, "#ffffff", 0.2);
    ctx.fill();
    ctx.strokeStyle = mixHex(color, "#ffffff", 0.35);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawTubeElbow(ctx, x, y, width, color) {
    ctx.beginPath();
    ctx.arc(x, y, width * 0.55 + 1, 0, Math.PI * 2);
    ctx.fillStyle = mixHex(color, "#1a2838", 0.25);
    ctx.fill();
    ctx.strokeStyle = mixHex(color, "#0f1c2a", 0.5);
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, width * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = mixHex(color, "#ffffff", 0.25);
    ctx.fill();
  }

  function drawTubePath(ctx, points, width, color, opts) {
    const active = !opts || opts.active !== false;
    const w = active ? width : Math.max(5, width * 0.72);
    const c = active ? color : muteHex(color);

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      drawTubeSegment(ctx, a[0], a[1], b[0], b[1], w, c);
    }
    for (let i = 1; i < points.length - 1; i++) {
      drawTubeElbow(ctx, points[i][0], points[i][1], w, c);
    }
    const start = points[0];
    const end = points[points.length - 1];
    drawTubeFlange(ctx, start[0], start[1], w, c);
    drawTubeFlange(ctx, end[0], end[1], w, c);
  }

  function drawFlowAlongPath(ctx, points, now, color) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      drawFlowDashes(ctx, a[0], a[1], b[0], b[1], now, color);
    }
  }

  function drawEquipmentBox(ctx, x, y, w, h, fill, stroke) {
    const radius = Math.min(22, w * 0.2, h * 0.45);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "#f7fbfe");
    g.addColorStop(0.4, "#c5ddf2");
    g.addColorStop(1, "#3d74ae");
    roundedRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    roundedRect(ctx, x, y, w, h, radius);
    ctx.clip();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, w, h, radius);
    ctx.stroke();
  }

  function drawBackground(ctx, w, h, stage) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    if (stage === 1) {
      g.addColorStop(0, "#eaf3fb");
      g.addColorStop(1, "#d2e3f2");
    } else if (stage === 2) {
      g.addColorStop(0, "#ddebf7");
      g.addColorStop(1, "#c0d6eb");
    } else {
      g.addColorStop(0, "#d2e4f5");
      g.addColorStop(1, "#b4cce3");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // subtle grid
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  // ——— Stage 1 ———

  function drawStage1(ctx, w, h, view, now, s, dt) {
    const local = view.stage === 1 ? view.local : 1;
    const cold = Math.max(0, Math.min(1, (25 - view.temperature) / (25 - PURIFY_T)));

    // upright stage-1 plant: air falls through the filter into the cooler
    const pipeX = 250;
    const filter = { x: pipeX - 22, y: 86, w: 44, h: 40 };
    const cooler = { x: 168, y: 168, w: 164, h: 200 };
    const outletY = cooler.y + 86;
    const clean = { x: 500, y: outletY - 48, w: 130, h: 96 };
    const bin = { x: 168, y: 392, w: 180, h: 50 };

    drawPipe(ctx, pipeX, 28, pipeX, filter.y, 16, "#b7d2ea");
    drawPipe(ctx, pipeX, filter.y + filter.h, pipeX, cooler.y + 10, 16, "#b7d2ea");
    drawFlowDashes(ctx, pipeX, 36, pipeX, filter.y, now, "rgba(210,59,59,0.85)");
    drawFlowArrow(ctx, pipeX, 58, Math.PI / 2, "#d23b3b");
    drawLabel(ctx, state.lang === "zh" ? "入口空氣" : "Inlet air", pipeX + 18, 46);

    roundedRect(ctx, filter.x, filter.y, filter.w, filter.h, 4);
    ctx.fillStyle = "#f7f4ef";
    ctx.fill();
    ctx.strokeStyle = "#5d5148";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(filter.x + 3, filter.y + 6 + i * 7);
      ctx.lineTo(filter.x + filter.w - 3, filter.y + 6 + i * 7);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(filter.x + 8 + i * 9, filter.y + 3);
      ctx.lineTo(filter.x + 8 + i * 9, filter.y + filter.h - 3);
      ctx.stroke();
    }
    drawLabel(ctx, state.lang === "zh" ? "過濾器" : "Filter", filter.x - 62, filter.y + 24);

    const coolerFill = `rgba(${Math.round(200 - cold * 50)}, ${Math.round(225 - cold * 20)}, ${Math.round(240)}, ${0.45 + cold * 0.25})`;
    drawEquipmentBox(ctx, cooler.x, cooler.y, cooler.w, cooler.h, coolerFill, "#6f9bbd");
    if (cold > 0.35) {
      ctx.fillStyle = `rgba(230,245,255,${0.15 + cold * 0.35})`;
      roundedRect(ctx, cooler.x + 8, cooler.y + 16, 14, cooler.h - 32, 8);
      ctx.fill();
      roundedRect(ctx, cooler.x + cooler.w - 22, cooler.y + 16, 14, cooler.h - 32, 8);
      ctx.fill();
      roundedRect(ctx, cooler.x + 8, cooler.y + 10, cooler.w - 16, 14, 8);
      ctx.fill();
    }
    drawLabel(
      ctx,
      state.lang === "zh" ? "冷卻室 (−80 °C)" : "Cooler (−80 °C)",
      18,
      cooler.y + 36
    );

    drawPipe(ctx, cooler.x + cooler.w, outletY, clean.x, outletY, 14, "#b7c9dc");
    drawFlowDashes(ctx, cooler.x + cooler.w, outletY, clean.x, outletY, now, "rgba(90,170,140,0.75)");
    drawFlowArrow(ctx, clean.x - 6, outletY, 0, "#3d9a6a");
    drawEquipmentBox(ctx, clean.x, clean.y, clean.w, clean.h, "rgba(255,255,255,0.9)", "#8fa9c4");
    drawLabel(ctx, state.lang === "zh" ? "淨化空氣" : "Clean air", clean.x + 8, clean.y - 10);
    drawPipe(ctx, clean.x + clean.w, outletY, 712, outletY, 12, "#9bb3cc");
    drawFlowDashes(ctx, clean.x + clean.w, outletY, 712, outletY, now, "rgba(210,59,59,0.85)");
    drawFlowArrow(ctx, 696, outletY, 0, "#d23b3b");
    drawLabel(
      ctx,
      state.lang === "zh" ? "至壓縮機" : "To compressor",
      clean.x + clean.w - 4,
      outletY + 18,
      "#174684",
      11
    );

    drawEquipmentBox(ctx, bin.x, bin.y, bin.w, bin.h, "rgba(240,246,252,0.95)", "#9bb0c6");
    drawLabel(
      ctx,
      state.lang === "zh" ? "除去固體（防堵塞）" : "Solids removed (anti-block)",
      bin.x + 8,
      bin.y + 30,
      "#0f6a4a",
      11
    );

    state.flow.forEach((p) => {
      const inColumn = p.x < cooler.x + cooler.w - 8;
      if (inColumn) {
        p.y += p.vx * s;
        p.x += Math.sin(now / 280 + p.phase) * 0.25 * s;
        p.x = Math.max(pipeX - 8, Math.min(pipeX + 8, p.x));
        if (p.y > outletY - 6) p.x = cooler.x + cooler.w - 4;
      } else {
        p.x += p.vx * s;
        p.y += (outletY - p.y) * 0.25 * s;
      }
      if (p.x > 700 || p.y > cooler.y + cooler.h) {
        p.x = pipeX + (Math.random() - 0.5) * 8;
        p.y = 34 + Math.random() * 28;
      }
      const cleanAir = p.y > filter.y + filter.h || p.x > cooler.x + cooler.w;
      ctx.fillStyle = cleanAir
        ? `rgba(110, 180, 150, ${p.alpha})`
        : `rgba(120, 160, 210, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    let caughtCount = 0;
    state.dust.forEach((d, i) => {
      if (!d.caught) {
        d.y += d.vx * s;
        d.x += (pipeX - d.x) * 0.12 * s;
        if (d.y >= filter.y && d.y <= filter.y + filter.h) {
          d.caught = true;
          d.x = filter.x + 6 + (i % 5) * 7;
          d.pileY = filter.y + 7 + (Math.floor(i / 5) % 4) * 8;
        }
        if (d.y > filter.y + filter.h + 8 && !d.caught) {
          d.x = pipeX + (Math.random() - 0.5) * 8;
          d.y = 34 + Math.random() * 24;
        }
      }
      if (d.caught) {
        caughtCount += 1;
        ctx.fillStyle = "rgba(70,80,95,0.85)";
        ctx.beginPath();
        ctx.arc(d.x, d.pileY, d.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#4a5568";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (local < 0.4 && caughtCount > 30) {
      state.dust.filter((d) => d.caught).slice(0, 8).forEach((d) => {
        d.caught = false;
        d.x = pipeX + (Math.random() - 0.5) * 8;
        d.y = 34 + Math.random() * 24;
      });
    }

    const freeze = Math.max(0, Math.min(1, (PURIFY_T + 35 - view.temperature) / 55));
    if (freeze > 0.15) {
      state.scraperY += state.scraperDir * (0.6 + freeze) * s;
      if (state.scraperY > cooler.y + cooler.h - 28) state.scraperDir = -1;
      if (state.scraperY < cooler.y + 20) state.scraperDir = 1;

      if (local > 0.55) {
        ctx.fillStyle = "rgba(90,110,130,0.85)";
        roundedRect(ctx, cooler.x + 14, state.scraperY, cooler.w - 28, 8, 3);
        ctx.fill();
        ctx.fillStyle = "#5a7088";
        ctx.fillRect(cooler.x + cooler.w - 18, state.scraperY - 6, 10, 20);
      }

      state.frost.forEach((f) => {
        if (freeze < f.birth * 0.85) return;
        if (local > 0.7 && Math.abs(state.scraperY - f.y) < 14 && !f.removed) {
          f.fall += 2.2 * s;
        }
        if (f.fall > 90) f.removed = true;
        if (f.removed) {
          // draw in waste briefly as falling chips
          return;
        }
        const y = f.y + f.fall;
        if (f.kind === "h2o") {
          ctx.save();
          ctx.translate(f.x, y);
          ctx.rotate(f.spin + now / 2000);
          ctx.fillStyle = "rgba(210,235,255,0.95)";
          ctx.strokeStyle = "rgba(110,160,200,0.9)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const ang = (a * Math.PI) / 3;
            const px = Math.cos(ang) * f.size;
            const py = Math.sin(ang) * f.size;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.fillStyle = "rgba(235,242,250,0.95)";
          roundedRect(ctx, f.x - f.size, y - f.size, f.size * 2, f.size * 2, 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(140,170,200,0.85)";
          ctx.stroke();
        }
      });

      // falling removed solids into bin
      if (local > 0.72) {
        for (let i = 0; i < 8; i++) {
          const fy = cooler.y + cooler.h + ((now / 25 + i * 18) % 28);
          ctx.fillStyle = i % 2 ? "rgba(210,235,255,0.85)" : "rgba(230,240,250,0.9)";
          ctx.beginPath();
          ctx.arc(bin.x + 18 + i * 18, fy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    roundedRect(ctx, 400, 430, 300, 60, 10);
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fill();
    ctx.fillStyle = "#4a5568";
    ctx.beginPath();
    ctx.arc(420, 460, 4, 0, Math.PI * 2);
    ctx.fill();
    drawLabel(ctx, state.lang === "zh" ? "灰塵" : "Dust", 430, 464, "#17345a", 12);
    ctx.fillStyle = "rgba(120,160,210,0.8)";
    ctx.beginPath();
    ctx.arc(489, 460, 4, 0, Math.PI * 2);
    ctx.fill();
    drawLabel(ctx, state.lang === "zh" ? "氣流" : "Air flow", 499, 464, "#17345a", 12);
    ctx.fillStyle = "rgba(210,235,255,0.95)";
    ctx.beginPath();
    ctx.arc(574, 460, 5, 0, Math.PI * 2);
    ctx.fill();
    drawLabel(ctx, "H₂O(s)", 584, 464, "#17345a", 12);
    ctx.fillStyle = "rgba(235,242,250,0.95)";
    roundedRect(ctx, 639, 454, 10, 10, 2);
    ctx.fill();
    drawLabel(ctx, "CO₂(s)", 654, 464, "#17345a", 12);
  }


  /** Stage 2 layout — liquid air vessel aligned with process line */
  const STAGE2_LAYOUT = {
    liquidTank: { x: 586, y: 250, w: 50, h: 72 },
  };

  function liquidTankInner() {
    const t = STAGE2_LAYOUT.liquidTank;
    return {
      x: t.x + 8,
      y: t.y + 12,
      w: t.w - 16,
      h: t.h - 24,
      bottom: t.y + t.h - 12,
    };
  }

  /** Stage 2 equipment zones for random molecule clouds */
  function stage2Zones() {
    const tank = STAGE2_LAYOUT.liquidTank;
    return [
      { id: 0, x: 116, y: 252, w: 60, h: 56, name: "compress" },
      { id: 1, x: 112, y: 30, w: 310, h: 190, name: "cooler" },
      { id: 2, x: 286, y: 180, w: 72, h: 130, name: "highP" },
      { id: 3, x: 418, y: 180, w: 78, h: 130, name: "lowP" },
      { id: 4, x: tank.x + 6, y: tank.y + 28, w: tank.w - 12, h: tank.h - 40, name: "liquid" },
    ];
  }

  function makeZoneMol(zone) {
    const zones = stage2Zones();
    const z = zones[Math.max(0, Math.min(zones.length - 1, zone))];
    const pad = 6;
    return {
      zone,
      x: z.x + pad + Math.random() * Math.max(4, z.w - pad * 2),
      y: z.y + pad + Math.random() * Math.max(4, z.h - pad * 2),
      vx: (Math.random() - 0.35) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      r: 2 + Math.random() * 2.4,
      dwell: 20 + Math.random() * 50,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function placeMolInZone(m, zone) {
    const z = stage2Zones()[zone];
    const pad = 8;
    m.zone = zone;
    m.x = z.x + pad + Math.random() * Math.max(4, z.w - pad * 2);
    m.y = z.y + pad + Math.random() * Math.max(4, z.h - pad * 2);
    m.vx = 0.4 + Math.random() * 0.9;
    m.vy = (Math.random() - 0.5) * 1.2;
    m.dwell = 25 + Math.random() * 55;
  }

  function stage2Routes() {
    const bend = 16;
    const leftX = 128;
    const rightX = 408;
    const topY = 42;
    const leftEnd = 215;
    const rightEnd = 136;
    const loop = [[rightX, rightEnd], [rightX, topY + bend]];
    const rightCorner = [rightX - bend, topY + bend];
    for (let i = 1; i <= 8; i++) {
      const a = (-Math.PI / 2) * (i / 8);
      loop.push([
        rightCorner[0] + Math.cos(a) * bend,
        rightCorner[1] + Math.sin(a) * bend,
      ]);
    }
    loop.push([leftX + bend, topY]);
    const leftCorner = [leftX + bend, topY + bend];
    for (let i = 1; i <= 8; i++) {
      const a = -Math.PI / 2 - (Math.PI / 2) * (i / 8);
      loop.push([
        leftCorner[0] + Math.cos(a) * bend,
        leftCorner[1] + Math.sin(a) * bend,
      ]);
    }
    loop.push([leftX, leftEnd]);
    return {
      inlet: { pts: [[14, 254], [108, 254], [200, 254]], next: "feed" },
      feed: { pts: [[200, 254], [268, 254]], next: null },
      toLoop: { pts: [[268, 254], [408, 254], [408, rightEnd]], next: "loop" },
      loop: { pts: loop, next: "throughComp" },
      throughComp: { pts: [[leftX, leftEnd], [leftX, 254], [200, 254]], next: "feed" },
      toTank: { pts: [[518, 245], [575, 245], [590, 262]], next: "toTank" },
    };
  }

  function polyLength(pts) {
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    }
    return total;
  }

  function pointAlong(pts, dist) {
    let left = Math.max(0, dist);
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0];
      const dy = pts[i][1] - pts[i - 1][1];
      const len = Math.hypot(dx, dy) || 1;
      if (left <= len) {
        const u = left / len;
        return [pts[i - 1][0] + dx * u, pts[i - 1][1] + dy * u];
      }
      left -= len;
    }
    const end = pts[pts.length - 1];
    return [end[0], end[1]];
  }

  function drawPipeMols(ctx, now, local, s) {
    const routes = stage2Routes();
    const names = Object.keys(routes);

    state.pipeMols.forEach((m) => {
      if (!routes[m.route]) {
        m.route = names[Math.floor(Math.random() * names.length)];
        m.dist = Math.random() * polyLength(routes[m.route].pts);
        m.speed = 0.55 + Math.random() * 0.45;
      }
      const route = routes[m.route];
      const len = polyLength(route.pts);
      m.dist += m.speed * s;
      if (m.dist >= len) {
        const extra = m.dist - len;
        let next = route.next;
        if (m.route === "feed") next = "toLoop";
        m.route = next;
        m.dist = Math.min(extra, 6);
      }
      const p = pointAlong(routes[m.route].pts, m.dist);
      m.x = p[0];
      m.y = p[1];

      ctx.fillStyle = m.route === "loop" || m.route === "toLoop"
        ? "rgba(70,160,210,0.9)"
        : "rgba(90,150,210,0.9)";
      ctx.beginPath();
      ctx.arc(m.x, m.y, Math.min(m.r, 2.4), 0, Math.PI * 2);
      ctx.fill();
    });
  }


  // ——— Stage 2 ———

  function drawStage2(ctx, w, h, view, now, s, dt) {
    const local = view.stage === 2 ? view.local : 1;
    const pulse = 0.5 + 0.5 * Math.sin(now / 280);

    // ——— Small compressor. Air arrives from stage 1. ———
    const compX = 108;
    const compY = 209;
    const compW = 92;
    const compH = 118;
    const feedY = 254;
    drawEquipmentBox(ctx, compX, compY, compW, compH, "#eef3f9", "#7f98b4");
    drawLabel(ctx, state.lang === "zh" ? "壓縮機" : "Compressor", compX, compY + compH + 22, "#17345a", 12);

    const cylX = 120;
    const cylY = 228;
    const cylW = 68;
    const cylH = 64;
    roundedRect(ctx, cylX, cylY, cylW, cylH, 8);
    ctx.fillStyle = "rgba(210, 225, 240, 0.55)";
    ctx.fill();
    ctx.strokeStyle = "#4a7fd4";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const pistonPhase = (Math.sin(now / 320) + 1) / 2;
    const pistonTravel = 28;
    const pistonTop = cylY + 6 + pistonPhase * pistonTravel;
    const chamberTop = pistonTop + 14;
    const chamberBottom = cylY + cylH - 4;
    const chamberH = Math.max(12, chamberBottom - chamberTop);
    const pack = pistonPhase;

    ctx.fillStyle = "#5a6f88";
    ctx.fillRect(cylX + cylW / 2 - 4, cylY + 3, 8, pistonTop - cylY);
    roundedRect(ctx, cylX + 5, pistonTop, cylW - 10, 12, 3);
    ctx.fillStyle = pack > 0.65
      ? `rgba(34,100,222,${0.55 + 0.3 * pulse})`
      : "rgba(70,110,170,0.75)";
    ctx.fill();
    ctx.strokeStyle = "#174ca8";
    ctx.stroke();

    state.compMols.forEach((m, i) => {
      const jitterX = Math.sin(now / 180 + m.phase) * (1 - pack) * 0.04;
      const jitterY = Math.cos(now / 200 + m.phase) * (1 - pack) * 0.05;
      const nx = lerp(m.nx, 0.2 + (i % 7) * 0.09, pack * 0.55) + jitterX;
      const ny = lerp(m.ny, 0.25 + Math.floor(i / 7) * 0.18, pack * 0.7) + jitterY;
      const px = cylX + 8 + Math.max(0.05, Math.min(0.95, nx)) * (cylW - 16);
      const py = chamberTop + 3 + Math.max(0.05, Math.min(0.95, ny)) * (chamberH - 8);
      const r = m.r * (1 - pack * 0.25);
      ctx.fillStyle = pack > 0.6
        ? `rgba(34,100,222,${0.55 + pack * 0.35})`
        : `rgba(90,150,210,${0.45 + (1 - pack) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    });

    drawLabel(ctx, "P↑", cylX + 22, cylY + cylH + 16, "#174ca8", 14);

    drawPipe(ctx, 8, feedY, compX, feedY, 12, "#9bb3cc");
    drawFlowDashes(ctx, 8, feedY, compX, feedY, now, "rgba(210,59,59,0.85)");
    drawFlowArrow(ctx, compX - 16, feedY, 0, "#d23b3b");
    drawLabel(
      ctx,
      state.lang === "zh" ? "上一階段" : "From stage 1",
      8,
      feedY - 14,
      "#174684",
      11
    );

    // ——— Large expansion area. Bigger than the compressor and the cooling loop. ———
    const exX = 268;
    const exY = 128;
    const exW = 250;
    const exH = 250;
    const highX = exX + 18;
    const highY = exY + 52;
    const highW = 72;
    const highH = 130;
    const lowX = exX + 150;
    const lowY = exY + 52;
    const lowW = 78;
    const lowH = 130;
    drawEquipmentBox(
      ctx,
      exX,
      exY,
      exW,
      exH,
      local >= 0.25 ? `rgba(255,244,230,${0.75 + 0.1 * pulse})` : "#f4f7fb",
      "#c49a55"
    );
    drawLabel(ctx, state.lang === "zh" ? "膨脹閥" : "Expand", exX + 8, exY - 8);

    roundedRect(ctx, highX, highY, highW, highH, 8);
    ctx.fillStyle = "rgba(34,100,222,0.18)";
    ctx.fill();
    ctx.strokeStyle = "#4a7fd4";
    ctx.lineWidth = 2;
    ctx.stroke();
    drawLabel(ctx, "High P", highX + 8, highY - 6, "#174ca8", 10);

    ctx.fillStyle = "#8a7048";
    ctx.fillRect(exX + 108, highY + 52, 22, 22);
    ctx.fillStyle = "#f0e6d4";
    ctx.fillRect(exX + 113, highY + 60, 12, 7);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "#5a4a30";
      ctx.beginPath();
      ctx.arc(exX + 119, highY + 58 + i * 6, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    roundedRect(ctx, lowX, lowY, lowW, lowH, 8);
    ctx.fillStyle = "rgba(120,190,230,0.2)";
    ctx.fill();
    ctx.strokeStyle = "#6a9ab8";
    ctx.lineWidth = 2;
    ctx.stroke();
    drawLabel(ctx, "Low P", lowX + 10, lowY - 6, "#2a6a8a", 10);

    const orificeY = highY + 63;
    state.expMols.forEach((m) => {
      if (m.reset || m.side === "low" && m.x === 0) {
        m.side = "high";
        m.x = highX + 8 + Math.random() * (highW - 20);
        m.y = highY + 8 + Math.random() * (highH - 16);
        m.vx = 0.7 + Math.random() * 0.5;
        m.life = 0;
        m.reset = false;
      }

      if (m.side === "high") {
        m.x += m.vx * s;
        m.y += (orificeY - m.y) * 0.12 * s;
        if (m.x < highX + 6) m.x = highX + 6;
        if (m.y < highY + 6) m.y = highY + 6;
        if (m.y > highY + highH - 6) m.y = highY + highH - 6;
        if (m.x >= highX + highW - 2) {
          m.side = "valve";
          m.x = highX + highW - 2;
          m.y = orificeY;
        }
      } else if (m.side === "valve") {
        m.x += 2.2 * s;
        m.y = orificeY;
        if (m.x >= lowX + 6) {
          m.side = "low";
          m.x = lowX + 6;
          m.vx = 0.8 + Math.random() * 0.6;
          m.vy = (Math.random() - 0.5) * 0.8;
        }
      } else {
        m.x += m.vx * s;
        m.y += m.vy * s;
        if (m.y < lowY + 6) {
          m.y = lowY + 6;
          m.vy = Math.abs(m.vy);
        }
        if (m.y > lowY + lowH - 6) {
          m.y = lowY + lowH - 6;
          m.vy = -Math.abs(m.vy);
        }
        if (m.x < lowX + 4) m.x = lowX + 4;
        if (m.x > lowX + lowW - 6) m.reset = true;
      }

      ctx.fillStyle = m.side === "high" ? "rgba(34,100,222,0.85)" : "rgba(90,180,220,0.8)";
      ctx.beginPath();
      ctx.arc(m.x, m.y, Math.min(m.r, 2.6), 0, Math.PI * 2);
      ctx.fill();
    });

    if (local > 0.15) {
      state.mist.forEach((mist, i) => {
        mist.life += 0.025 * s;
        if (mist.life > 1) {
          mist.life = 0;
          mist.x = lowX + 8 + Math.random() * (lowW - 16);
          mist.y = lowY + 10 + Math.random() * (lowH - 24);
          mist.r = 3 + Math.random() * 7;
        }
        mist.x = Math.max(lowX + 8, Math.min(lowX + lowW - 8, mist.x));
        mist.y = Math.max(lowY + 8, Math.min(lowY + lowH - 8, mist.y));
        const a = (1 - mist.life) * 0.4;
        ctx.fillStyle = `rgba(180,220,240,${a})`;
        ctx.beginPath();
        ctx.arc(
          mist.x,
          mist.y + Math.sin(now / 200 + i) * 2,
          Math.min(mist.r, lowW * 0.22),
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
    }

    drawLabel(ctx, "T↓", exX + 112, highY + highH + 8, "#9a5b00", 15);
    drawLabel(
      ctx,
      state.lang === "zh" ? "控制膨脹，溫度下降" : "Controlled expansion",
      exX + 8,
      exY + exH + 16,
      "#9a5b00",
      11
    );

    // Liquid leaves the right side of the expansion vessel, then enters
    // column 1 the same way stage 3 does. Nothing crosses the vessel.
    const outCol = { x: 575, y: 135, w: 72, h: 200 };
    const colInletY = outCol.y + Math.round(outCol.h * 0.55);
    const fill = Math.max(0, Math.min(1, (local - 0.5) / 0.45));
    drawFractionatingColumn(ctx, outCol, {
      title: state.lang === "zh" ? "第一分餾塔 (N₂)" : "Column 1 (N₂)",
      poolHeight: 24 + fill * 62,
      tempLabel: "−196 °C",
      tempActive: fill > 0.15,
    });
    drawPipe(ctx, exX + exW, colInletY, outCol.x, colInletY, 10, "#9bb3cc");
    drawFlowDashes(ctx, exX + exW, colInletY, outCol.x, colInletY, now, "rgba(74,127,212,0.8)");
    drawFlowArrow(ctx, outCol.x - 8, colInletY, 0, "#4a7fd4");
    drawLabel(
      ctx,
      state.lang === "zh" ? "液態空氣入口" : "Liquid air inlet",
      exX + exW + 4,
      colInletY - 12,
      "#174684",
      11
    );
    drawLabel(ctx, "≈ −200 °C", outCol.x + 2, outCol.y + outCol.h + 16, "#174ca8", 11);

    const tank = STAGE2_LAYOUT.liquidTank;
    const inner = liquidTankInner();

    // Textbook loop: down into the compressor, across into the vessel,
    // and back up off the top of the vessel.
    const leftX = 128;
    const rightX = 408;
    const topY = 42;
    const leftEnd = 215;
    const rightEnd = 136;
    const bend = 16;
    function strokeOpenLoop(width, color) {
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(leftX, leftEnd);
      ctx.lineTo(leftX, topY + bend);
      ctx.arcTo(leftX, topY, leftX + bend, topY, bend);
      ctx.lineTo(rightX - bend, topY);
      ctx.arcTo(rightX, topY, rightX, topY + bend, bend);
      ctx.lineTo(rightX, rightEnd);
      ctx.stroke();
    }
    strokeOpenLoop(16, mixHex("#b7d2ea", "#1a3a5c", 0.4));
    strokeOpenLoop(12, "#b7d2ea");
    drawFlowDashes(ctx, rightX, rightEnd - 4, rightX, topY + bend, now, "rgba(210,59,59,0.85)");
    drawFlowDashes(ctx, rightX - bend, topY, leftX + bend, topY, now + 40, "rgba(210,59,59,0.85)");
    drawFlowDashes(ctx, leftX, topY + bend, leftX, leftEnd - 4, now + 80, "rgba(210,59,59,0.85)");
    drawFlowArrow(ctx, rightX, (topY + rightEnd) / 2, -Math.PI / 2, "#d23b3b");
    drawFlowArrow(ctx, (leftX + rightX) / 2, topY, Math.PI, "#d23b3b");
    drawFlowArrow(ctx, leftX, (topY + leftEnd) / 2, Math.PI / 2, "#d23b3b");

    drawPipe(ctx, compX + compW, feedY, exX, feedY, 12, "#9bb3cc");
    drawFlowDashes(ctx, compX + compW, feedY, exX, feedY, now, "rgba(210,59,59,0.85)");
    drawFlowArrow(ctx, exX - 18, feedY, 0, "#d23b3b");

    drawPipeMols(ctx, now, local, s);

    if (local > 0.5) {
      state.droplets.forEach((d) => {
        d.active = true;
        d.y += d.vy * s;
        d.x += Math.sin((now + d.x * 10) / 400) * 0.2 * s;
        const minX = outCol.x + 16;
        const maxX = outCol.x + outCol.w - 16;
        const topY = outCol.y + 36;
        d.x = Math.max(minX, Math.min(maxX, d.x));
        const surfaceY = inner.bottom - (inner.h - 8) * fill;
        if (d.y < topY || d.y > surfaceY) {
          d.y = topY + Math.random() * 16;
          d.x = minX + Math.random() * (maxX - minX);
        }
        ctx.fillStyle = "rgba(120,185,235,0.9)";
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.r * 0.65, d.r, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    drawLabel(
      ctx,
      state.lang === "zh"
        ? "加壓冷卻 → 控制膨脹 → 液態空氣（−200 °C）"
        : "Cool under pressure → Expand → Liquid air (−200 °C)",
      80,
      470,
      "#174684",
      13
    );
  }

  // ——— Stage 3 ———

  const STAGE3_LAYOUT = {
    col1: { x: 55, y: 30, w: 90, h: 260 },
    col2: { x: 225, y: 145, w: 90, h: 280 },
    n2Tank: { x: 480, y: 40, w: 70, h: 110 },
    arTank: { x: 560, y: 190, w: 70, h: 110 },
    o2Tank: { x: 420, y: 355, w: 200, h: 105 },
  };

  function drawFractionatingColumn(ctx, col, opts) {
    const x = col.x;
    const y = col.y;
    const w = col.w;
    const h = col.h;
    ctx.save();
    roundedRect(ctx, x, y, w, h, w / 2);
    ctx.clip();
    const body = ctx.createLinearGradient(x, y, x, y + h);
    body.addColorStop(0, "#f4f9fd");
    body.addColorStop(0.32, "#d5e7f6");
    body.addColorStop(0.7, "#6fa0cf");
    body.addColorStop(1, "#24598f");
    ctx.fillStyle = body;
    ctx.fillRect(x, y, w, h);
    const trayCount = opts.trayCount || 5;
    for (let i = 0; i < trayCount; i++) {
      const ty = y + 38 + i * ((h - 70) / trayCount);
      ctx.fillStyle = "rgba(100,130,160,0.2)";
      ctx.fillRect(x + 10, ty, w - 20, 4);
      ctx.strokeStyle = "rgba(100,130,160,0.45)";
      ctx.beginPath();
      ctx.moveTo(x + 10, ty);
      ctx.lineTo(x + w - 10, ty);
      ctx.stroke();
    }
    if (opts.poolHeight > 0) {
      const poolH = opts.poolHeight;
      const poolTop = y + h - 14 - poolH;
      const g = ctx.createLinearGradient(x, poolTop, x, y + h - 14);
      g.addColorStop(0, opts.poolTopColor || "rgba(150,200,235,0.55)");
      g.addColorStop(1, opts.poolBottomColor || "rgba(70,140,210,0.85)");
      ctx.fillStyle = g;
      roundedRect(ctx, x + 10, poolTop, w - 20, poolH, 6);
      ctx.fill();
    }
    ctx.restore();
    roundedRect(ctx, x, y, w, h, w / 2);
    ctx.strokeStyle = "#6d97bf";
    ctx.lineWidth = 2;
    ctx.stroke();
    if (opts.title) {
      drawLabel(ctx, opts.title, x + 2, y - 8, "#17345a", 11);
    }
    if (opts.tempLabel) {
      roundedRect(ctx, x + w + 6, y + h * 0.35, 52, 22, 6);
      ctx.fillStyle = opts.tempActive ? "rgba(34,100,222,0.15)" : "rgba(255,255,255,0.7)";
      ctx.fill();
      ctx.strokeStyle = opts.tempActive ? "#4a7fd4" : "#a8bfd6";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawLabel(ctx, opts.tempLabel, x + w + 12, y + h * 0.35 + 15, opts.tempActive ? "#174ca8" : "#5a7088", 10);
    }
    if (opts.bottomLabel) {
      drawLabel(ctx, opts.bottomLabel, x + 4, y + h + 14, opts.bottomColor || "#e85d4c", 10);
    }
  }

  function drawStage3(ctx, w, h, view, now, s, dt) {
    const temp = view.temperature;
    const local = view.stage === 3 ? view.local : 1;
    const layout = STAGE3_LAYOUT;
    const col1 = layout.col1;
    const col2 = layout.col2;
    const col1Bottom = col1.y + col1.h;
    const col2Bottom = col2.y + col2.h;

    const col1Temp = Math.min(temp, COL1_WARM_LIMIT);
    const col2Temp = Math.min(temp, COL2_WARM_LIMIT);
    const n2Frac = col1Temp >= N2_SEP
      ? Math.min(1, (col1Temp - N2_SEP) / (COL1_WARM_LIMIT - N2_SEP))
      : 0;
    const arFrac = col2Temp >= AR_SEP
      ? Math.min(1, (col2Temp - AR_SEP) / (COL2_WARM_LIMIT - AR_SEP))
      : 0;

    const targetN2 = n2Frac;
    const targetAr = arFrac;
    const targetO2 = col2Temp < AR_SEP ? 0 : Math.min(1, 0.12 + arFrac * 0.88);
    const fillN2 = 1 - Math.exp(-2.45 * dt);
    const fillAr = 1 - Math.exp(-2.45 * dt);
    const fillO2 = 1 - Math.exp(-1.85 * dt);
    state.tankN2 += (targetN2 - state.tankN2) * fillN2;
    state.tankAr += (targetAr - state.tankAr) * fillAr;
    state.tankO2 += (targetO2 - state.tankO2) * fillO2;

    // slow warming heater under left side of column 1 base
    const heaterX = 8;
    const heaterY = col1Bottom + 8;
    const heaterW = 88;
    const heaterH = 56;
    drawEquipmentBox(ctx, heaterX, heaterY, heaterW, heaterH, "rgba(255,244,230,0.95)", "#d4a36a");
    drawLabel(ctx, state.lang === "zh" ? "緩慢加熱" : "Slow warming", heaterX + 8, heaterY + 20, "#9a5b00", 11);
    drawLabel(ctx, formatTemp(col1Temp), heaterX + 12, heaterY + 40, "#174ca8", 12);
    ctx.fillStyle = `rgba(255,160,60,${0.15 + 0.1 * Math.sin(now / 250)})`;
    roundedRect(ctx, heaterX + 10, heaterY + 44, heaterW - 20, 8, 4);
    ctx.fill();
    drawPipe(ctx, heaterX + heaterW / 2, heaterY, col1.x + 22, col1Bottom - 6, 8, "#c4a078");
    drawFlowDashes(ctx, heaterX + heaterW / 2, heaterY, col1.x + 22, col1Bottom - 6, now, "rgba(196,122,18,0.7)");

    // liquid air inlet → mid of column 1
    const inletY = col1.y + Math.round(col1.h * 0.55);
    drawPipe(ctx, 12, inletY, col1.x, inletY, 10, "#9bb3cc");
    drawFlowDashes(ctx, 12, inletY, col1.x, inletY, now, "rgba(74,127,212,0.8)");
    drawLabel(
      ctx,
      state.lang === "zh" ? "液態空氣入口" : "Liquid air inlet",
      14,
      inletY - 14,
      "#174684",
      11
    );
    state.inletMols.forEach((m) => {
      m.x += m.vx * s;
      m.y += Math.sin(now / 280 + m.x * 0.05) * 0.6 * s;
      if (m.x > col1.x + 15) {
        m.x = 14 + Math.random() * 30;
        m.y = inletY - 12 + Math.random() * 24;
        m.liquid = Math.random() < 0.6;
      }
      ctx.fillStyle = m.liquid
        ? "rgba(80,150,220,0.9)"
        : "rgba(120,180,230,0.75)";
      ctx.beginPath();
      if (m.liquid) ctx.ellipse(m.x, m.y, m.r * 0.7, m.r, 0, 0, Math.PI * 2);
      else ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const col1Pool = temp < N2_SEP ? 50 + local * 30 : Math.max(25, 70 - n2Frac * 45);
    drawFractionatingColumn(ctx, col1, {
      title: state.lang === "zh" ? "第一分餾塔 (N₂)" : "Column 1 (N₂)",
      poolHeight: col1Pool,
      tempLabel: "−196 °C",
      tempActive: col1Temp >= N2_SEP,
    });

    const col2Pool = col2Temp < AR_SEP ? 0 : Math.max(20, 35 + arFrac * 55);
    drawFractionatingColumn(ctx, col2, {
      title: state.lang === "zh" ? "第二分餾塔 (Ar/O₂)" : "Column 2 (Ar/O₂)",
      poolHeight: col2Pool,
      poolTopColor: "rgba(139,107,199,0.35)",
      poolBottomColor: arFrac > 0.45 ? "rgba(232,93,76,0.85)" : "rgba(70,140,210,0.75)",
      tempLabel: "−185 °C",
      tempActive: col2Temp >= AR_SEP,
      bottomLabel: col2Temp >= AR_SEP
        ? (state.lang === "zh" ? "液態 O₂" : "Liquid O₂")
        : "",
      bottomColor: "#e85d4c",
    });

    // transfer pipe: column 1 bottom → cascade down into column 2 side
    const transferStartX = col1.x + col1.w / 2;
    const transferStartY = col1Bottom - 8;
    const transferElbowX = col1.x + col1.w + 28;
    const transferElbowY = col1Bottom + 24;
    const transferEndX = col2.x;
    const transferEndY = col2.y + Math.round(col2.h * 0.52);
    drawPipe(ctx, transferStartX, transferStartY, transferStartX, transferElbowY, 8, "#9bb3cc");
    drawPipe(ctx, transferStartX, transferElbowY, transferElbowX, transferElbowY, 8, "#9bb3cc");
    drawPipe(ctx, transferElbowX, transferElbowY, transferEndX, transferEndY, 8, "#9bb3cc");
    if (temp >= N2_SEP) {
      drawFlowDashes(ctx, transferStartX, transferElbowY, transferElbowX, transferElbowY, now, "rgba(74,127,212,0.75)");
      drawFlowDashes(ctx, transferElbowX, transferElbowY, transferEndX, transferEndY, now, "rgba(74,127,212,0.75)");
    }
    drawLabel(
      ctx,
      state.lang === "zh" ? "O₂+Ar 液體" : "O₂+Ar liquid",
      transferElbowX - 4,
      transferElbowY - 8,
      "#174684",
      10
    );

    if (temp >= N2_SEP) {
      state.transferMols.forEach((m, i) => {
        m.t = (m.t || 0) + (0.004 + local * 0.003) * s;
        if (m.t >= 1) m.t = 0;
        const t = m.t;
        let px;
        let py;
        if (t < 0.22) {
          const u = t / 0.22;
          px = transferStartX;
          py = lerp(transferStartY, transferElbowY, u);
        } else if (t < 0.42) {
          const u = (t - 0.22) / 0.2;
          px = lerp(transferStartX, transferElbowX, u);
          py = transferElbowY;
        } else {
          const u = (t - 0.42) / 0.58;
          px = lerp(transferElbowX, transferEndX + 18, u);
          py = lerp(transferElbowY, transferEndY, u) + Math.sin(now / 250 + i) * 1.5;
        }
        ctx.fillStyle = "rgba(100,170,230,0.9)";
        ctx.beginPath();
        ctx.ellipse(px, py, m.r * 0.65, m.r, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // N₂ vapor in column 1
    state.vapor.forEach((v, i) => {
      if (v.column !== 1) return;
      if (n2Frac <= 0) return;
      if (v.reset) {
        v.x = col1.x + 20 + Math.random() * (col1.w - 40);
        v.y = col1Bottom - 50 - Math.random() * 40;
        v.reset = false;
      }
      v.y -= v.vy * (0.8 + local) * s;
      v.x += Math.sin(now / 300 + i) * 0.4 * s;
      if (v.y < col1.y + 30) v.reset = true;
      ctx.fillStyle = `rgba(74,127,212,${0.35 + 0.4 * n2Frac})`;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ar vapor in column 2
    state.vapor.forEach((v, i) => {
      if (v.column !== 2) return;
      if (arFrac <= 0) return;
      if (v.reset) {
        v.x = col2.x + 20 + Math.random() * (col2.w - 40);
        v.y = col2Bottom - 60 - Math.random() * 50;
        v.reset = false;
      }
      v.y -= v.vy * (0.7 + local) * s;
      v.x += Math.sin(now / 280 + i) * 0.35 * s;
      if (v.y < col2.y + 40) v.reset = true;
      ctx.fillStyle = `rgba(139,107,199,${0.35 + 0.4 * arFrac})`;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // reflux in column 1
    state.reflux.forEach((r, i) => {
      if (r.reset) {
        r.x = col1.x + 20 + Math.random() * (col1.w - 40);
        r.y = col1.y + 40 + Math.random() * 60;
        r.reset = false;
      }
      r.y += r.vy * s;
      if (r.y > col1Bottom - 30) r.reset = true;
      ctx.fillStyle = "rgba(120,170,220,0.55)";
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r * 0.6, r.r, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    function collectionOutlet(fromX, fromY, toX, toY, color, active, label, prefer) {
      const points = orthoTubePoints(fromX, fromY, toX, toY, prefer || "hv");
      drawTubePath(ctx, points, active ? 11 : 7, color, { active });
      if (active) {
        drawFlowAlongPath(ctx, points, now, color);
        const end = points[points.length - 1];
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(end[0], end[1], 7 + Math.sin(now / 200) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      drawLabel(ctx, label, toX + 8, toY - 10, color, 11);
    }

    collectionOutlet(
      col1.x + col1.w,
      col1.y + 35,
      layout.n2Tank.x,
      layout.n2Tank.y + layout.n2Tank.h / 2,
      "#4a7fd4",
      n2Frac > 0,
      state.lang === "zh" ? "N₂ 出口" : "N₂ out",
      "hv"
    );
    const arExitY = col2.y + 90;
    collectionOutlet(
      col2.x + col2.w,
      arExitY,
      layout.arTank.x,
      layout.arTank.y + layout.arTank.h / 2,
      "#8b6bc7",
      arFrac > 0,
      state.lang === "zh" ? "Ar 出口" : "Ar out",
      "hv"
    );

    const o2ExitX = col2.x + col2.w;
    const o2ExitY = col2Bottom - 22;
    const o2TankMidY = layout.o2Tank.y + layout.o2Tank.h / 2;
    collectionOutlet(
      o2ExitX,
      o2ExitY,
      layout.o2Tank.x,
      o2TankMidY,
      "#e85d4c",
      temp >= AR_SEP,
      state.lang === "zh" ? "O₂ 出口" : "O₂ out",
      "hv"
    );

    drawCollectionTank(ctx, layout.n2Tank.x, layout.n2Tank.y, layout.n2Tank.w, layout.n2Tank.h,
      state.tankN2, "#4a7fd4", "N₂", n2Frac > 0, now);
    drawCollectionTank(ctx, layout.arTank.x, layout.arTank.y, layout.arTank.w, layout.arTank.h,
      state.tankAr, "#8b6bc7", "Ar", arFrac > 0, now);
    drawCollectionTank(ctx, layout.o2Tank.x, layout.o2Tank.y, layout.o2Tank.w, layout.o2Tank.h,
      state.tankO2, "#e85d4c", "O₂", temp >= AR_SEP, now);

    drawLabel(
      ctx,
      state.lang === "zh" ? "收集缸（按沸點次序）" : "Collection tanks (b.p. order)",
      layout.n2Tank.x,
      30,
      "#17345a",
      12
    );
  }

  function drawCollectionTank(ctx, x, y, w, h, fill, color, label, active, now) {
    const tankRadius = Math.min(18, w * 0.28, h * 0.28);
    roundedRect(ctx, x, y, w, h, tankRadius);
    const shell = ctx.createLinearGradient(x, y, x, y + h);
    shell.addColorStop(0, "#f7fbfe");
    shell.addColorStop(1, active ? hexToRgba(color, 0.28) : "#d5e3f0");
    ctx.fillStyle = shell;
    ctx.fill();
    ctx.strokeStyle = active ? color : "#a8bfd6";
    ctx.lineWidth = active ? 2.5 : 1.5;
    ctx.stroke();

    const level = Math.max(0, Math.min(1, fill));
    if (level > 0.01) {
      const lh = (h - 16) * level;
      ctx.fillStyle = hexToRgba(color, 0.55);
      roundedRect(ctx, x + 8, y + h - 8 - lh, w - 16, lh, 8);
      ctx.fill();

      if (active) {
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.moveTo(x + 10, y + h - 8 - lh + 3);
        ctx.quadraticCurveTo(
          x + w / 2,
          y + h - 8 - lh - 2 + Math.sin(now / 220) * 2,
          x + w - 10,
          y + h - 8 - lh + 3
        );
        ctx.stroke();
      }
    }

    drawLabel(ctx, label, x + 12, y + 22, color, 14);
    drawLabel(ctx, `${Math.round(level * 100)}%`, x + 12, y + h - 14, "#17345a", 11);
  }

  function hexToRgba(hex, a) {
    const { r, g, b } = parseHexColor(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  function drawFrame(now, dt) {
    const sim = stateFromProgress(state.progress);
    const view = getViewState(sim);
    const ctx = els.ctx;
    const w = els.canvas.width;
    const h = els.canvas.height;
    const frameScale = Math.min(2.5, Math.max(0.25, dt * 60));

    ctx.clearRect(0, 0, w, h);
    drawBackground(ctx, w, h, state.viewStage);

    if (state.viewStage === 1) drawStage1(ctx, w, h, view, now, frameScale, dt);
    else if (state.viewStage === 2) drawStage2(ctx, w, h, view, now, frameScale, dt);
    else drawStage3(ctx, w, h, view, now, frameScale, dt);
  }

  // ——— Loop & controls ———

  function tick(ts) {
    if (!state.lastTs) state.lastTs = ts;
    const dt = Math.min(0.05, (ts - state.lastTs) / 1000);
    state.lastTs = ts;

    if (state.autoRun) {
      state.progress = Math.min(1, state.progress + dt / 55);
      state.lastProgress = state.progress;
      els.slider.value = String(Math.round(state.progress * 1000));
      if (state.progress >= 1) stopAuto();
      const sim = stateFromProgress(state.progress);
      state.viewStage = sim.stage;
      updateUI(sim);
    }

    drawFrame(ts, dt);
    requestAnimationFrame(tick);
  }

  function bindEvents() {
    els.auto.addEventListener("click", () => {
      if (state.autoRun) {
        stopAuto();
        return;
      }
      if (state.progress >= 1) {
        seedParticles();
        setProgress(0);
      }
      state.autoRun = true;
      syncAutoButton();
    });
    els.step.addEventListener("click", () => {
      stopAuto();
      setProgress(Math.min(1, state.progress + 0.02));
      state.viewStage = stateFromProgress(state.progress).stage;
      updateUI(stateFromProgress(state.progress));
    });
    els.reset.addEventListener("click", () => {
      stopAuto();
      seedParticles();
      state.viewStage = 1;
      state.lastProgress = 0;
      setProgress(0);
    });
    els.slider.addEventListener("input", () => {
      stopAuto();
      const p = Number(els.slider.value) / 1000;
      maybeReseedOnScrub(p);
      state.progress = p;
      const sim = stateFromProgress(p);
      state.viewStage = sim.stage;
      updateUI(sim);
    });

    els.stageTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const s = Number(tab.dataset.stage);
        stopAuto();
        state.viewStage = s;
        const target = (s - 1) / 3;
        seedParticles();
        setProgress(target);
        state.viewStage = s;
        updateUI(stateFromProgress(state.progress));
      });
    });

    els.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lang = btn.dataset.lang;
        els.langButtons.forEach((b) => b.classList.toggle("active", b === btn));
        applyI18n();
        updateUI(stateFromProgress(state.progress));
      });
    });

    const descToggle = document.getElementById("descToggle");
    if (descToggle) {
      descToggle.addEventListener("click", () => {
        state.hideDescriptions = !state.hideDescriptions;
        syncDescToggle();
      });
    }
  }

  function start() {
    initDom();
    seedParticles();
    applyI18n();
    bindEvents();
    setProgress(0);
    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
