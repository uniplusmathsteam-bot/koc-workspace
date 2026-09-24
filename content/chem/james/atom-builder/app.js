(() => {
  "use strict";

  const ELEMENTS = [
    null,
    { symbol: "H", en: "Hydrogen", zh: "氫", stable: [0, 1], factEn: "Hydrogen is the lightest element.", factZh: "氫是最輕的元素。" },
    { symbol: "He", en: "Helium", zh: "氦", stable: [1, 2], factEn: "Helium has a full first electron shell.", factZh: "氦的第一電子層已填滿。" },
    { symbol: "Li", en: "Lithium", zh: "鋰", stable: [3, 4], factEn: "Lithium usually forms a +1 ion.", factZh: "鋰通常形成 +1 離子。" },
    { symbol: "Be", en: "Beryllium", zh: "鈹", stable: [5], factEn: "Beryllium has two outer-shell electrons.", factZh: "鈹有兩個最外層電子。" },
    { symbol: "B", en: "Boron", zh: "硼", stable: [5, 6], factEn: "Boron is a metalloid.", factZh: "硼是一種類金屬。" },
    { symbol: "C", en: "Carbon", zh: "碳", stable: [6, 7], factEn: "Carbon forms the framework of organic compounds.", factZh: "碳構成有機化合物的基本骨架。" },
    { symbol: "N", en: "Nitrogen", zh: "氮", stable: [7, 8], factEn: "Nitrogen makes up most of Earth's atmosphere.", factZh: "氮氣佔地球大氣的大部分。" },
    { symbol: "O", en: "Oxygen", zh: "氧", stable: [8, 9, 10], factEn: "Oxygen supports combustion.", factZh: "氧氣支持燃燒。" },
    { symbol: "F", en: "Fluorine", zh: "氟", stable: [10], factEn: "Fluorine commonly forms a −1 ion.", factZh: "氟通常形成 −1 離子。" },
    { symbol: "Ne", en: "Neon", zh: "氖", stable: [10, 11, 12], factEn: "Neon has a full outer electron shell.", factZh: "氖的最外電子層已填滿。" },
    { symbol: "Na", en: "Sodium", zh: "鈉", stable: [12], factEn: "Sodium commonly loses one electron.", factZh: "鈉通常失去一個電子。" },
    { symbol: "Mg", en: "Magnesium", zh: "鎂", stable: [12, 13, 14], factEn: "Magnesium commonly forms a +2 ion.", factZh: "鎂通常形成 +2 離子。" },
    { symbol: "Al", en: "Aluminium", zh: "鋁", stable: [14], factEn: "Aluminium commonly forms a +3 ion.", factZh: "鋁通常形成 +3 離子。" },
    { symbol: "Si", en: "Silicon", zh: "矽", stable: [14, 15, 16], factEn: "Silicon is important in electronics.", factZh: "矽是電子工業的重要材料。" },
    { symbol: "P", en: "Phosphorus", zh: "磷", stable: [16], factEn: "Phosphorus has five outer-shell electrons.", factZh: "磷有五個最外層電子。" },
    { symbol: "S", en: "Sulfur", zh: "硫", stable: [16, 17, 18, 20], factEn: "Sulfur commonly forms a −2 ion.", factZh: "硫通常形成 −2 離子。" },
    { symbol: "Cl", en: "Chlorine", zh: "氯", stable: [18, 20], factEn: "Chlorine commonly gains one electron.", factZh: "氯通常獲得一個電子。" },
    { symbol: "Ar", en: "Argon", zh: "氬", stable: [18, 20, 22], factEn: "Argon is chemically unreactive.", factZh: "氬的化學性質不活潑。" }
  ];

  const TRANSLATIONS = {
    en: {
      title: "Atom Builder",
      subtitle: "Build atoms, ions and isotopes interactively",
      labTitle: "Interactive atom laboratory",
      labHeadingBuilder: "Build an atom",
      labHeadingQuest: "Solve the challenge",
      builderMode: "Builder mode",
      questMode: "Quest mode",
      element: "Element",
      mass: "Mass",
      charge: "Charge",
      workspace: "Workspace",
      atomModel: "Atom model",
      reset: "Reset",
      dropHint: "Drag particles here or use the controls",
      proton: "Proton",
      neutron: "Neutron",
      electron: "Electron",
      protons: "Protons",
      neutrons: "Neutrons",
      electrons: "Electrons",
      quickBuild: "Quick build",
      liveResults: "Live results",
      atomIdentity: "Atom identity",
      challengeTarget: "Challenge target",
      targetIdentity: "Target atom",
      targetHint: "Work out how many protons, neutrons and electrons this target needs.",
      stable: "Stable",
      unstable: "Unstable",
      noNucleus: "Add a proton",
      noElement: "No element",
      atomicNumber: "Atomic number",
      massNumber: "Mass number",
      netCharge: "Net charge",
      particleType: "Particle type",
      neutral: "Neutral atom",
      cation: "Cation",
      anion: "Anion",
      isotope: "{name}-{mass}",
      configuration: "Electron shells: {shells}",
      elementRule: "The number of protons determines the element.",
      stabilityRule: "This simplified indicator compares the neutron count with common stable isotopes.",
      challenge: "Challenge",
      quizTitle: "Build challenge",
      score: "Score",
      check: "Check answer",
      next: "New challenge",
      skip: "Skip challenge",
      successTitle: "Correct answer!",
      autoAdvance: "Next challenge in 3 seconds…",
      quizPrompt: "Build {name}-{mass} with charge {charge}.",
      correct: "Correct — excellent atom building!",
      incorrect: "Not quite. Compare your particle counts with the target.",
      alreadyChecked: "Choose a new challenge to score again.",
      footer: "An original educational simulation for learning atomic structure.",
      beyondRange: "H–Ar learning range",
      dragLimit: "The builder supports elements from hydrogen to argon.",
      hideText: "Hide description",
      showText: "Show description"
    },
    zh: {
      title: "原子建造器",
      subtitle: "互動建構原子、離子和同位素",
      labTitle: "互動原子實驗室",
      labHeadingBuilder: "建造原子",
      labHeadingQuest: "完成挑戰",
      builderMode: "建造模式",
      questMode: "任務模式",
      element: "元素",
      mass: "質量數",
      charge: "電荷",
      workspace: "工作區",
      atomModel: "原子模型",
      reset: "重設",
      dropHint: "拖放粒子到這裡，或使用下方控制器",
      proton: "質子",
      neutron: "中子",
      electron: "電子",
      protons: "質子數",
      neutrons: "中子數",
      electrons: "電子數",
      quickBuild: "快速建構",
      liveResults: "即時計算",
      atomIdentity: "原子資料",
      challengeTarget: "挑戰目標",
      targetIdentity: "目標原子",
      targetHint: "請推算這個目標需要多少質子、中子和電子。",
      stable: "穩定",
      unstable: "不穩定",
      noNucleus: "加入質子",
      noElement: "沒有元素",
      atomicNumber: "原子序",
      massNumber: "質量數",
      netCharge: "淨電荷",
      particleType: "粒子類別",
      neutral: "中性原子",
      cation: "陽離子",
      anion: "陰離子",
      isotope: "{name}-{mass}",
      configuration: "電子層：{shells}",
      elementRule: "質子數決定元素的種類。",
      stabilityRule: "此簡化指標把中子數與常見穩定同位素比較。",
      challenge: "挑戰",
      quizTitle: "建構挑戰",
      score: "得分",
      check: "檢查答案",
      next: "新挑戰",
      skip: "略過挑戰",
      successTitle: "答案正確！",
      autoAdvance: "3 秒後進入下一個挑戰…",
      quizPrompt: "建造 {name}-{mass}，電荷為 {charge}。",
      correct: "正確，原子建構成功！",
      incorrect: "尚未正確，請比較你的粒子數與目標。",
      alreadyChecked: "選擇新挑戰後可再次得分。",
      footer: "原創原子結構互動學習工具。",
      beyondRange: "氫至氬學習範圍",
      dragLimit: "此建造器支援氫至氬的元素。",
      hideText: "隱藏描述",
      showText: "顯示描述"
    }
  };

  const PRESETS = {
    hydrogen: { protons: 1, neutrons: 0, electrons: 1 },
    helium: { protons: 2, neutrons: 2, electrons: 2 },
    carbon: { protons: 6, neutrons: 6, electrons: 6 },
    oxygen: { protons: 8, neutrons: 8, electrons: 8 },
    sodiumIon: { protons: 11, neutrons: 12, electrons: 10 },
    chlorideIon: { protons: 17, neutrons: 18, electrons: 18 }
  };

  const QUIZZES = [
    { protons: 1, neutrons: 1, electrons: 1 },
    { protons: 6, neutrons: 6, electrons: 6 },
    { protons: 8, neutrons: 8, electrons: 10 },
    { protons: 10, neutrons: 10, electrons: 10 },
    { protons: 11, neutrons: 12, electrons: 10 },
    { protons: 12, neutrons: 12, electrons: 10 },
    { protons: 17, neutrons: 18, electrons: 18 },
    { protons: 18, neutrons: 22, electrons: 18 },
    { protons: 1, neutrons: 0, electrons: 1 },
    { protons: 2, neutrons: 2, electrons: 2 },
    { protons: 3, neutrons: 4, electrons: 3 },
    { protons: 5, neutrons: 6, electrons: 5 },
    { protons: 6, neutrons: 7, electrons: 6 },
    { protons: 7, neutrons: 7, electrons: 7 },
    { protons: 8, neutrons: 9, electrons: 8 },
    { protons: 9, neutrons: 10, electrons: 9 },
    { protons: 14, neutrons: 14, electrons: 14 },
    { protons: 15, neutrons: 16, electrons: 15 },
    { protons: 16, neutrons: 16, electrons: 16 },
    { protons: 3, neutrons: 4, electrons: 2 },
    { protons: 13, neutrons: 14, electrons: 10 },
    { protons: 9, neutrons: 10, electrons: 10 },
    { protons: 7, neutrons: 7, electrons: 10 },
    { protons: 16, neutrons: 16, electrons: 18 }
  ];

  const state = {
    lang: "en",
    mode: "builder",
    protons: 6,
    neutrons: 6,
    electrons: 6,
    quizIndex: 1,
    correct: 0,
    attempts: 0,
    checked: false,
    hideDescriptions: false
  };

  const $ = id => document.getElementById(id);
  const canvas = $("atomCanvas");
  const ctx = canvas.getContext("2d");
  const stage = $("atomDropZone");
  let advanceTimer = null;

  function t(key, replacements = {}) {
    let value = TRANSLATIONS[state.lang][key] || key;
    Object.entries(replacements).forEach(([name, replacement]) => {
      value = value.replace(`{${name}}`, replacement);
    });
    return value;
  }

  function elementFor(protons = state.protons) {
    return ELEMENTS[protons] || null;
  }

  function chargeFor(atom = state) {
    return atom.protons - atom.electrons;
  }

  function chargeText(charge) {
    if (charge === 0) return "0";
    return charge > 0 ? `+${charge}` : `−${Math.abs(charge)}`;
  }

  function symbolChargeText(charge) {
    if (charge === 0) return "";
    if (charge === 1) return "+";
    if (charge === -1) return "−";
    return charge > 0 ? `${charge}+` : `${Math.abs(charge)}−`;
  }

  function shellsFor(electronCount = state.electrons) {
    const capacities = [2, 8, 8];
    let remaining = electronCount;
    return capacities.map(capacity => {
      const count = Math.max(0, Math.min(capacity, remaining));
      remaining -= count;
      return count;
    });
  }

  function isStable(protons = state.protons, neutrons = state.neutrons) {
    const element = ELEMENTS[protons];
    return Boolean(element && element.stable.includes(neutrons));
  }

  function classificationFor(charge) {
    if (charge === 0) return t("neutral");
    return charge > 0 ? t("cation") : t("anion");
  }

  const PARTICLE_INPUTS = {
    proton: "protonCount",
    neutron: "neutronCount",
    electron: "electronCount"
  };

  function particleMax(type) {
    return type === "neutron" ? 24 : 18;
  }

  function syncParticleInput(type) {
    const input = $(PARTICLE_INPUTS[type]);
    if (document.activeElement === input) return;
    input.value = String(state[`${type}s`]);
  }

  function setParticleCount(type, rawValue) {
    const max = particleMax(type);
    const parsed = Number.parseInt(String(rawValue), 10);
    if (!Number.isFinite(parsed)) return null;
    const clamped = Math.max(0, Math.min(max, parsed));
    state[`${type}s`] = clamped;
    return clamped;
  }

  function commitParticleInput(type) {
    const input = $(PARTICLE_INPUTS[type]);
    const max = particleMax(type);
    const raw = input.value.trim();
    if (raw === "") {
      input.value = String(state[`${type}s`]);
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      input.value = String(state[`${type}s`]);
      return;
    }
    if (parsed > max) {
      $("learningNote").textContent = t("dragLimit");
    }
    setParticleCount(type, parsed);
    updateFacts();
  }

  function updateTranslations() {
    document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
    document.querySelectorAll("[data-i18n]").forEach(node => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-lang]").forEach(button => {
      button.classList.toggle("active", button.dataset.lang === state.lang);
    });
    const headingKey = state.mode === "quest" ? "labHeadingQuest" : "labHeadingBuilder";
    $("labHeading").textContent = t(headingKey);
    $("labHeading").dataset.i18n = headingKey;
    syncDescToggle();
  }

  function syncDescToggle() {
    document.body.classList.toggle("hide-descriptions", state.hideDescriptions);
    const btn = $("descToggle");
    if (!btn) return;
    const key = state.hideDescriptions ? "showText" : "hideText";
    btn.dataset.i18n = key;
    btn.textContent = t(key);
    btn.setAttribute("aria-pressed", state.hideDescriptions ? "true" : "false");
  }

  function setMode(mode) {
    if (mode !== "builder" && mode !== "quest") return;
    const leavingQuest = state.mode === "quest" && mode === "builder";
    state.mode = mode;
    document.body.dataset.mode = mode;
    document.querySelectorAll(".mode-switch [data-mode]").forEach(button => {
      button.classList.toggle("active", button.dataset.mode === mode);
    });
    updateTranslations();
    if (mode === "quest") {
      updateQuiz(advanceTimer !== null);
    } else if (leavingQuest) {
      clearAdvanceTimer();
      hideSuccessCelebration();
      $("checkButton").disabled = false;
      $("quizFeedback").textContent = "";
      $("quizFeedback").className = "quiz-feedback";
      updateFacts();
    } else {
      updateFacts();
    }
  }

  function fillIdentityCard(atom) {
    const element = elementFor(atom.protons);
    const mass = atom.protons + atom.neutrons;
    const charge = chargeFor(atom);
    const stable = isStable(atom.protons, atom.neutrons);
    const name = element ? element[state.lang] : t("noElement");
    const symbol = element ? element.symbol : "—";
    const shellText = shellsFor(atom.electrons).filter((count, index) => count > 0 || index === 0).join(", ");
    const quest = state.mode === "quest";

    $("factsKicker").textContent = t(quest ? "challengeTarget" : "liveResults");
    $("factsKicker").dataset.i18n = quest ? "challengeTarget" : "liveResults";
    $("factsTitle").textContent = t(quest ? "targetIdentity" : "atomIdentity");
    $("factsTitle").dataset.i18n = quest ? "targetIdentity" : "atomIdentity";

    $("massNumber").textContent = mass;
    $("atomicNumber").textContent = atom.protons;
    $("symbol").textContent = symbol;
    $("symbolCharge").textContent = symbolChargeText(charge);
    $("elementName").textContent = name;
    $("classification").textContent = element
      ? `${classificationFor(charge)} · ${t("isotope", { name, mass })}`
      : t("beyondRange");
    $("configuration").textContent = t("configuration", { shells: shellText });
    $("atomicNumberValue").textContent = atom.protons;
    $("massNumberValue").textContent = mass;
    $("chargeValue").textContent = chargeText(charge);
    $("particleTypeValue").textContent = classificationFor(charge);

    const badge = $("stabilityBadge");
    badge.textContent = stable ? t("stable") : t("unstable");
    badge.classList.toggle("stable", stable);
    badge.classList.toggle("unstable", !stable);
    $("learningNote").textContent = quest
      ? t("targetHint")
      : element
        ? `${element[state.lang === "zh" ? "factZh" : "factEn"]} ${t("stabilityRule")}`
        : t("elementRule");
  }

  function updateFacts() {
    const live = {
      protons: state.protons,
      neutrons: state.neutrons,
      electrons: state.electrons
    };
    const element = elementFor();
    const mass = state.protons + state.neutrons;
    const charge = chargeFor();
    const name = element ? element[state.lang] : t("noElement");
    const symbol = element ? element.symbol : "—";

    $("topElement").textContent = name;
    $("topMass").textContent = mass;
    $("topCharge").textContent = chargeText(charge);
    $("stageSymbol").textContent = symbol;
    $("stageName").textContent = state.protons ? name : t("noNucleus");
    syncParticleInput("proton");
    syncParticleInput("neutron");
    syncParticleInput("electron");

    if (state.mode === "quest") {
      fillIdentityCard(currentQuiz());
    } else {
      fillIdentityCard(live);
    }

    drawAtom();
  }

  function setAtom(atom) {
    state.protons = Math.max(0, Math.min(18, Number(atom.protons) || 0));
    state.neutrons = Math.max(0, Math.min(24, Number(atom.neutrons) || 0));
    state.electrons = Math.max(0, Math.min(18, Number(atom.electrons) || 0));
    updateFacts();
  }

  function changeParticle(type, delta) {
    const key = `${type}s`;
    const max = type === "neutron" ? 24 : 18;
    const next = state[key] + delta;
    if (next < 0 || next > max) {
      if (next > max) {
        $("learningNote").textContent = t("dragLimit");
      }
      return;
    }
    state[key] = next;
    updateFacts();
  }

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, Math.round(rect.width));
    const height = Math.max(320, Math.round(rect.height));
    if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { width, height };
  }

  function drawParticle(x, y, radius, fill, text, fontSize = 11) {
    const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.35, 1, x, y, radius);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.12, fill);
    gradient.addColorStop(1, shadeColor(fill, -18));
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(24, 48, 82, 0.45)";
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y + 0.5);
  }

  function shadeColor(hex, percent) {
    const value = parseInt(hex.slice(1), 16);
    const amount = Math.round(2.55 * percent);
    const r = Math.max(0, Math.min(255, (value >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((value >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (value & 0xff) + amount));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function drawAtom() {
    const { width, height } = sizeCanvas();
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    const radii = [maxRadius * 0.47, maxRadius * 0.72, maxRadius];
    const shellCounts = shellsFor();
    let activeShells = 1;
    shellCounts.forEach((count, index) => {
      if (count > 0) activeShells = index + 1;
    });

    radii.forEach((radius, index) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = index < activeShells
        ? "rgba(59, 113, 207, 0.42)"
        : "rgba(95, 126, 174, 0.2)";
      ctx.lineWidth = 1.25;
      ctx.stroke();
    });

    const nucleus = [];
    for (let index = 0; index < state.protons; index += 1) nucleus.push({ type: "p", fill: "#ed5264" });
    for (let index = 0; index < state.neutrons; index += 1) nucleus.push({ type: "n", fill: "#64748b" });
    nucleus.sort((a, b) => ((a.type.charCodeAt(0) * 13) % 7) - ((b.type.charCodeAt(0) * 13) % 7));

    const particleRadius = Math.max(8, Math.min(13, 34 / Math.sqrt(Math.max(1, nucleus.length) / 4)));
    nucleus.forEach((particle, index) => {
      const angle = index * 2.399963;
      const distance = particleRadius * 0.9 * Math.sqrt(index);
      const x = cx + Math.cos(angle) * distance;
      const y = cy + Math.sin(angle) * distance;
      drawParticle(x, y, particleRadius, particle.fill, particle.type, 9);
    });

    shellCounts.forEach((count, shellIndex) => {
      if (!count) return;
      const radius = radii[shellIndex];
      const offset = shellIndex % 2 ? Math.PI / 8 : -Math.PI / 2;
      for (let index = 0; index < count; index += 1) {
        const angle = offset + (Math.PI * 2 * index) / count;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        drawParticle(x, y, 8.5, "#3978ef", "−", 11);
      }
    });
  }

  function currentQuiz() {
    return QUIZZES[state.quizIndex % QUIZZES.length];
  }

  function hideSuccessCelebration() {
    $("successCelebration").hidden = true;
    document.querySelector(".quiz-card").classList.remove("celebrating");
  }

  function showSuccessCelebration() {
    const celebration = $("successCelebration");
    const quizCard = document.querySelector(".quiz-card");
    celebration.hidden = true;
    quizCard.classList.remove("celebrating");
    void celebration.offsetWidth;
    celebration.hidden = false;
    quizCard.classList.add("celebrating");
  }

  function clearAdvanceTimer() {
    if (advanceTimer !== null) {
      window.clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function updateQuiz(preserveSuccess = false) {
    const quiz = currentQuiz();
    const element = ELEMENTS[quiz.protons];
    const mass = quiz.protons + quiz.neutrons;
    const charge = chargeFor(quiz);
    $("quizPrompt").textContent = t("quizPrompt", {
      name: element[state.lang],
      mass,
      charge: chargeText(charge)
    });
    $("scoreValue").textContent = `${state.correct}/${state.attempts}`;
    if (!preserveSuccess) {
      hideSuccessCelebration();
      $("checkButton").disabled = false;
      $("quizFeedback").textContent = "";
      $("quizFeedback").className = "quiz-feedback";
    } else {
      $("quizFeedback").textContent = t("correct");
      $("quizFeedback").className = "quiz-feedback correct";
    }
    updateFacts();
  }

  function checkQuiz() {
    const feedback = $("quizFeedback");
    if (state.checked) {
      feedback.textContent = t("alreadyChecked");
      feedback.className = "quiz-feedback incorrect";
      return;
    }
    const quiz = currentQuiz();
    const correct = state.protons === quiz.protons
      && state.neutrons === quiz.neutrons
      && state.electrons === quiz.electrons;
    state.attempts += 1;
    if (correct) state.correct += 1;
    state.checked = true;
    feedback.textContent = t(correct ? "correct" : "incorrect");
    feedback.className = `quiz-feedback ${correct ? "correct" : "incorrect"}`;
    $("scoreValue").textContent = `${state.correct}/${state.attempts}`;
    if (correct) {
      $("checkButton").disabled = true;
      showSuccessCelebration();
      clearAdvanceTimer();
      advanceTimer = window.setTimeout(() => {
        advanceTimer = null;
        nextQuiz();
      }, 3000);
    }
  }

  function nextQuiz() {
    clearAdvanceTimer();
    hideSuccessCelebration();
    state.quizIndex = (state.quizIndex + 1) % QUIZZES.length;
    state.checked = false;
    updateQuiz();
  }

  function switchLanguage(lang) {
    const preserveSuccess = advanceTimer !== null;
    state.lang = lang;
    updateTranslations();
    updateFacts();
    updateQuiz(preserveSuccess);
  }

  document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      changeParticle(button.dataset.particle, button.dataset.action === "add" ? 1 : -1);
    });
  });

  Object.keys(PARTICLE_INPUTS).forEach(type => {
    const input = $(PARTICLE_INPUTS[type]);
    input.addEventListener("blur", () => commitParticleInput(type));
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitParticleInput(type);
        input.blur();
      }
    });
  });

  document.querySelectorAll(".particle-token").forEach(token => {
    token.addEventListener("click", () => changeParticle(token.dataset.particle, 1));
    token.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", token.dataset.particle);
      event.dataTransfer.effectAllowed = "copy";
    });
  });

  stage.addEventListener("dragover", event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    stage.classList.add("drag-active");
  });
  stage.addEventListener("dragleave", () => stage.classList.remove("drag-active"));
  stage.addEventListener("drop", event => {
    event.preventDefault();
    stage.classList.remove("drag-active");
    const particle = event.dataTransfer.getData("text/plain");
    if (["proton", "neutron", "electron"].includes(particle)) changeParticle(particle, 1);
  });

  document.querySelectorAll("[data-preset]").forEach(button => {
    button.addEventListener("click", () => setAtom(PRESETS[button.dataset.preset]));
  });

  document.querySelectorAll(".mode-switch [data-mode]").forEach(button => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => switchLanguage(button.dataset.lang));
  });

  const descToggle = $("descToggle");
  if (descToggle) {
    descToggle.addEventListener("click", () => {
      state.hideDescriptions = !state.hideDescriptions;
      syncDescToggle();
      window.dispatchEvent(new Event("resize"));
    });
  }

  $("resetButton").addEventListener("click", () => setAtom(PRESETS.carbon));
  $("checkButton").addEventListener("click", checkQuiz);
  $("nextButton").addEventListener("click", nextQuiz);
  window.addEventListener("resize", drawAtom);

  window.AtomBuilder = {
    setAtom,
    setMode,
    getState: () => ({
      mode: state.mode,
      protons: state.protons,
      neutrons: state.neutrons,
      electrons: state.electrons
    }),
    getQuizState: () => ({
      index: state.quizIndex,
      correct: state.correct,
      attempts: state.attempts,
      checked: state.checked,
      autoAdvancePending: advanceTimer !== null
    }),
    checkQuiz,
    skipQuiz: nextQuiz,
    calculate: atom => ({
      atomicNumber: atom.protons,
      massNumber: atom.protons + atom.neutrons,
      charge: atom.protons - atom.electrons,
      shells: shellsFor(atom.electrons),
      symbol: ELEMENTS[atom.protons]?.symbol || null
    })
  };

  const selfTests = [
    [{ protons: 6, neutrons: 6, electrons: 6 }, { atomicNumber: 6, massNumber: 12, charge: 0, symbol: "C" }],
    [{ protons: 11, neutrons: 12, electrons: 10 }, { atomicNumber: 11, massNumber: 23, charge: 1, symbol: "Na" }],
    [{ protons: 17, neutrons: 18, electrons: 18 }, { atomicNumber: 17, massNumber: 35, charge: -1, symbol: "Cl" }]
  ];
  const testsPassed = selfTests.every(([input, expected]) => {
    const result = window.AtomBuilder.calculate(input);
    return Object.entries(expected).every(([key, value]) => result[key] === value);
  });

  const quizKeys = new Set();
  const quizzesValid = QUIZZES.every(quiz => {
    const inBounds = quiz.protons >= 1 && quiz.protons <= 18
      && quiz.neutrons >= 0 && quiz.neutrons <= 24
      && quiz.electrons >= 0 && quiz.electrons <= 18;
    const knownElement = Boolean(ELEMENTS[quiz.protons]);
    const key = `${quiz.protons}:${quiz.neutrons}:${quiz.electrons}`;
    const unique = !quizKeys.has(key);
    quizKeys.add(key);
    return inBounds && knownElement && unique;
  });

  document.documentElement.dataset.atomBuilderTests = testsPassed ? "passed" : "failed";
  document.documentElement.dataset.atomBuilderQuizzes = quizzesValid ? "valid" : "invalid";
  if (!testsPassed) console.error("Atom Builder calculation self-test failed.");
  if (!quizzesValid) console.error("Atom Builder quiz bank validation failed.");

  updateTranslations();
  updateFacts();
  setMode("builder");
  document.documentElement.dataset.atomBuilderReady = "true";
})();
