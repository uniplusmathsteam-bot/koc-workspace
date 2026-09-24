(() => {
  "use strict";

  const MIN_ISOTOPES = 1;
  const MAX_ISOTOPES = 12;
  const TOTAL_TOLERANCE = 0.01;
  const COLORS = ["#2d6be8", "#28a4d9", "#16a179", "#805bd8", "#e58a3a"];
  const { ElementLibrary } = window;

  const MODE_STARTERS = {
    mixture: "Cl",
    mass: "Br",
    abundances: "Mg"
  };

  const TRANSLATIONS = {
    en: {
      appTitle: "Relative Atomic Mass Laboratory",
      appSubtitle: "Interactive isotope weighted-average calculator",
      workspace: "CALCULATION WORKSPACE",
      modeMixture: "Isotope mixture",
      modeMass: "Find mass number",
      modeAbundances: "Find two abundances",
      workspaceTitleMixture: "Isotope mixture",
      workspaceTitleMass: "Find mass number",
      workspaceTitleAbundances: "Find two abundances",
      enterValuesMixture: "Enter mass and abundance",
      enterValuesMass: "Enter Aᵣ, abundances, and known masses",
      enterValuesAbundances: "Enter Aᵣ, masses, and known abundances",
      arLabel: "Relative atomic mass (A<sub>r</sub>)",
      modeHintMass: "Leave exactly one isotope mass blank — that is the unknown mass number.",
      modeHintAbundances: "Leave exactly two abundance fields blank — those are the unknowns.",
      chooseElement: "Choose from periodic table",
      periodicHub: "PERIODIC TABLE HUB",
      periodicTitle: "Choose an element",
      searchElement: "Search",
      searchPlaceholder: "Cl, Bromine, 溴...",
      selectedElement: "{name} ({symbol}) · Aᵣ {ar}",
      examples: "Examples",
      isotope: "Isotope",
      mass: "Isotope mass",
      abundance: "Abundance (%)",
      addIsotope: "Add isotope",
      calculate: "Calculate Aᵣ",
      calculateMass: "Calculate mass number",
      calculateAbundances: "Calculate abundances",
      reset: "Reset",
      abundanceTotal: "Abundance total",
      totalReady: "Ready — total is 100%",
      totalShort: "Total is {total}%; enter exactly 100%.",
      totalPartial: "Known abundances total {total}%; remaining {remaining}% for the two unknowns.",
      analysis: "LIVE ANALYSIS",
      resultsMixture: "Relative atomic mass",
      resultsMass: "Unknown mass number",
      resultsAbundances: "Unknown abundances",
      valid: "Valid",
      checkData: "Check data",
      calculatedResult: "Calculated result",
      noUnit: "unitless value",
      massUnit: "mass number",
      abundanceUnit: "percentage abundance",
      chartTitle: "Isotope abundance profile",
      percentScale: "0–100% scale",
      working: "Calculation working",
      weightedMean: "Weighted mean",
      learningNoteMixture: "Relative atomic mass is the weighted average of an element's isotope masses. It has no unit and is usually not a whole number.",
      learningNoteMass: "When Aᵣ and all abundances are known, rearrange the weighted-average formula to find one missing isotope mass.",
      learningNoteAbundances: "When Aᵣ and all isotope masses are known, two unknown abundances can be found using the 100% total and the Aᵣ equation.",
      simplifiedNote: "This element has no characteristic terrestrial isotopic abundance, so a simplified single-isotope example is used.",
      footer: "An original educational tool for isotope calculations.",
      hideText: "Hide description",
      showText: "Show description",
      missingValues: "Enter a valid non-negative mass and abundance for every isotope.",
      missingAr: "Enter a valid non-negative relative atomic mass (Aᵣ).",
      abundanceRange: "Each abundance must be between 0% and 100%.",
      totalError: "The isotope abundances must add up to 100%. Current total: {total}%.",
      oneUnknownMass: "Leave exactly one isotope mass blank for the unknown mass number.",
      twoUnknownAbundances: "Leave exactly two abundance fields blank for the unknowns.",
      needTwoIsotopes: "At least two isotopes are required for this mode.",
      equalMasses: "The two unknown isotopes must have different masses.",
      negativeAbundance: "The solved abundances are not between 0% and 100%. Check Aᵣ and the masses.",
      zeroAbundanceMass: "The unknown isotope must have a non-zero abundance.",
      invalidMassResult: "The solved mass number is not valid. Check Aᵣ and the abundances.",
      remainingNegative: "Known abundances already exceed 100%.",
      maxRows: "A maximum of twelve isotopes is supported.",
      minimumRows: "At least one isotope row is required.",
      removeIsotope: "Remove isotope {number}",
      massLabel: "Isotope {number} mass",
      abundanceLabel: "Isotope {number} abundance",
      workingProductsSigFig: "Weighted products: {products}",
      workingSumExact: "Sum of products = {sum}",
      workingResult: "Aᵣ = {sum} ÷ 100 = {result}",
      workingMassSetup: "Aᵣ = [(known products) + (x × {abundance})] ÷ 100",
      workingMassKnown: "Known products = {products} = {sum}",
      workingMassSolve: "{ar} = ({sum} + {abundance}x) ÷ 100 → x = {result}",
      workingAbundSetup: "Let the unknowns be x% and y% for masses {massX} and {massY}.",
      workingAbundSum: "x + y = {remaining}  (because known abundances total {known}%)",
      workingAbundEq: "{ar} = [{knownProducts} + ({massX} × x) + ({massY} × y)] ÷ 100",
      workingAbundSolve: "Substitute y = {remaining} − x → x = {x}, y = {y}",
      isotopeSummaryTitle: "{name} isotopes",
      isotopeSummaryCount: "{natural} natural isotopes",
      isotopeSummaryCountOne: "1 natural isotope (monoisotopic)",
      isotopeSummaryCountSimplified: "0 natural isotopes",
      isotopeSummarySimplified: "No characteristic terrestrial isotopic abundance is known, so a simplified single-isotope example is used for Aᵣ.",
      isotopeExample: "example (100%)",
      categoryAlkali: "Alkali metal",
      categoryAlkalineEarth: "Alkaline earth",
      categoryTransition: "Transition metal",
      categoryPostTransition: "Post-transition metal",
      categoryMetalloid: "Metalloid",
      categoryNonmetal: "Non-metal",
      categoryHalogen: "Halogen",
      categoryNoble: "Noble gas",
      categoryLanthanide: "Lanthanide",
      categoryActinide: "Actinide",
      categoryUnknown: "Unknown"
    },
    zh: {
      appTitle: "相對原子質量實驗室",
      appSubtitle: "互動同位素加權平均計算器",
      workspace: "計算工作區",
      modeMixture: "同位素混合物",
      modeMass: "求質量數",
      modeAbundances: "求兩個未知豐度",
      workspaceTitleMixture: "同位素混合物",
      workspaceTitleMass: "求質量數",
      workspaceTitleAbundances: "求兩個未知豐度",
      enterValuesMixture: "輸入質量及豐度",
      enterValuesMass: "輸入 Aᵣ、豐度及已知質量",
      enterValuesAbundances: "輸入 Aᵣ、質量及已知豐度",
      arLabel: "相對原子質量 (A<sub>r</sub>)",
      modeHintMass: "請剛好留下一個同位素質量空白 — 那就是未知質量數。",
      modeHintAbundances: "請剛好留下兩個豐度空白 — 那就是兩個未知數。",
      chooseElement: "從週期表選擇元素",
      periodicHub: "週期表互動中心",
      periodicTitle: "選擇元素",
      searchElement: "搜尋",
      searchPlaceholder: "Cl、Bromine、溴...",
      selectedElement: "{name} ({symbol}) · Aᵣ {ar}",
      examples: "例子",
      isotope: "同位素",
      mass: "同位素質量",
      abundance: "豐度 (%)",
      addIsotope: "新增同位素",
      calculate: "計算 Aᵣ",
      calculateMass: "計算質量數",
      calculateAbundances: "計算豐度",
      reset: "重設",
      abundanceTotal: "豐度總和",
      totalReady: "可計算 — 總和為 100%",
      totalShort: "總和為 {total}%；請輸入剛好 100%。",
      totalPartial: "已知豐度總和為 {total}%；兩個未知數合共 {remaining}%。",
      analysis: "即時分析",
      resultsMixture: "相對原子質量",
      resultsMass: "未知質量數",
      resultsAbundances: "未知豐度",
      valid: "有效",
      checkData: "檢查數據",
      calculatedResult: "計算結果",
      noUnit: "沒有單位",
      massUnit: "質量數",
      abundanceUnit: "百分豐度",
      chartTitle: "同位素豐度分佈",
      percentScale: "0–100% 比例",
      working: "計算步驟",
      weightedMean: "加權平均",
      learningNoteMixture: "相對原子質量是元素各同位素質量的加權平均值。它沒有單位，而且通常不是整數。",
      learningNoteMass: "當已知 Aᵣ 及所有豐度時，可重排加權平均公式以求出一個未知同位素質量。",
      learningNoteAbundances: "當已知 Aᵣ 及所有同位素質量時，可利用豐度總和為 100% 及 Aᵣ 方程式求出兩個未知豐度。",
      simplifiedNote: "此元素沒有特徵的陸地同位素豐度，因此使用簡化單同位素例子。",
      footer: "原創同位素計算學習工具。",
      hideText: "隱藏描述",
      showText: "顯示描述",
      missingValues: "請為每個同位素輸入有效的非負質量及豐度。",
      missingAr: "請輸入有效的非負相對原子質量 (Aᵣ)。",
      abundanceRange: "每個豐度必須介乎 0% 至 100%。",
      totalError: "同位素豐度總和必須為 100%。目前總和：{total}%。",
      oneUnknownMass: "請剛好留下一個同位素質量空白作為未知質量數。",
      twoUnknownAbundances: "請剛好留下兩個豐度空白作為未知數。",
      needTwoIsotopes: "此模式至少需要兩個同位素。",
      equalMasses: "兩個未知同位素的質量必須不同。",
      negativeAbundance: "求得的豐度不在 0% 至 100% 之間。請檢查 Aᵣ 及質量。",
      zeroAbundanceMass: "未知同位素的豐度不可為 0。",
      invalidMassResult: "求得的質量數無效。請檢查 Aᵣ 及豐度。",
      remainingNegative: "已知豐度總和已超過 100%。",
      maxRows: "最多支援十二個同位素。",
      minimumRows: "至少需要一個同位素列。",
      removeIsotope: "移除同位素 {number}",
      massLabel: "同位素 {number} 的質量",
      abundanceLabel: "同位素 {number} 的豐度",
      workingProductsSigFig: "加權乘積：{products}",
      workingSumExact: "乘積總和 = {sum}",
      workingResult: "Aᵣ = {sum} ÷ 100 = {result}",
      workingMassSetup: "Aᵣ = [(已知乘積) + (x × {abundance})] ÷ 100",
      workingMassKnown: "已知乘積 = {products} = {sum}",
      workingMassSolve: "{ar} = ({sum} + {abundance}x) ÷ 100 → x = {result}",
      workingAbundSetup: "設質量 {massX} 及 {massY} 的未知豐度為 x% 及 y%。",
      workingAbundSum: "x + y = {remaining}  （已知豐度總和為 {known}%）",
      workingAbundEq: "{ar} = [{knownProducts} + ({massX} × x) + ({massY} × y)] ÷ 100",
      workingAbundSolve: "代入 y = {remaining} − x → x = {x}，y = {y}",
      isotopeSummaryTitle: "{name} 同位素",
      isotopeSummaryCount: "{natural} 個天然同位素",
      isotopeSummaryCountOne: "1 個天然同位素（單同位素）",
      isotopeSummaryCountSimplified: "0 個天然同位素",
      isotopeSummarySimplified: "沒有特徵的陸地同位素豐度，因此 Aᵣ 使用簡化單同位素例子。",
      isotopeExample: "例子（100%）",
      categoryAlkali: "鹼金屬",
      categoryAlkalineEarth: "鹼土金屬",
      categoryTransition: "過渡金屬",
      categoryPostTransition: "貧金屬",
      categoryMetalloid: "類金屬",
      categoryNonmetal: "非金屬",
      categoryHalogen: "鹵素",
      categoryNoble: "稀有氣體",
      categoryLanthanide: "鑭系元素",
      categoryActinide: "錒系元素",
      categoryUnknown: "未知"
    }
  };

  const CATEGORY_I18N = {
    alkali: "categoryAlkali",
    alkalineEarth: "categoryAlkalineEarth",
    transition: "categoryTransition",
    postTransition: "categoryPostTransition",
    metalloid: "categoryMetalloid",
    nonmetal: "categoryNonmetal",
    halogen: "categoryHalogen",
    noble: "categoryNoble",
    lanthanide: "categoryLanthanide",
    actinide: "categoryActinide",
    unknown: "categoryUnknown"
  };

  const FORMULAS = {
    mixture: [
      { html: "A<sub>r</sub>" },
      { text: "=" },
      { text: "Σ(m × %)" },
      { text: "÷ 100" }
    ],
    mass: [
      { html: "x" },
      { text: "=" },
      { text: "(Aᵣ×100 − Σ known)" },
      { text: "÷ aₓ" }
    ],
    abundances: [
      { text: "x + y = R" },
      { text: "·" },
      { html: "A<sub>r</sub>" },
      { text: "equation" }
    ]
  };

  const state = {
    lang: "en",
    mode: "mixture",
    activeElement: "Cl",
    rows: [],
    arValue: null,
    isotopeMeta: null,
    loadNote: null,
    periodicFilter: "",
    hideDescriptions: false
  };

  const $ = id => document.getElementById(id);
  let lastFocusedElement = null;

  function t(key, replacements = {}) {
    let value = TRANSLATIONS[state.lang][key] || key;
    Object.entries(replacements).forEach(([name, replacement]) => {
      value = value.replace(`{${name}}`, replacement);
    });
    return value;
  }

  function formatNumber(value, maxDecimals = 4) {
    if (!Number.isFinite(value)) return "—";
    return Number(value.toFixed(maxDecimals)).toLocaleString(state.lang === "zh" ? "zh-HK" : "en-GB", {
      maximumFractionDigits: maxDecimals
    });
  }

  function roundSigFig(value, sigFigs = 3) {
    if (!Number.isFinite(value)) return NaN;
    if (value === 0) return 0;
    const abs = Math.abs(value);
    const digits = Math.floor(Math.log10(abs));
    const scale = 10 ** (sigFigs - 1 - digits);
    return Math.round(value * scale) / scale;
  }

  function formatSigFig(value, sigFigs = 3) {
    const rounded = roundSigFig(value, sigFigs);
    if (!Number.isFinite(rounded)) return "—";
    return Number(rounded.toPrecision(sigFigs)).toString();
  }

  function isBlank(value) {
    return value === "" || value === null || value === undefined;
  }

  function parseOptionalNumber(raw) {
    if (isBlank(raw) || String(raw).trim() === "") return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : NaN;
  }

  function clearElementContext() {
    state.activeElement = null;
    state.isotopeMeta = null;
    $("elementIsotopeSummary").hidden = true;
    updatePresetButtons();
    renderPeriodicSelection();
  }

  function currentElement() {
    return ElementLibrary.getElementBySymbol(state.activeElement);
  }

  function calculateRelativeAtomicMass(rows) {
    const totalAbundance = rows.reduce((sum, row) => sum + row.abundance, 0);
    const productSum = rows.reduce((sum, row) => sum + row.mass * row.abundance, 0);
    return {
      totalAbundance,
      productSum,
      relativeAtomicMass: productSum / 100
    };
  }

  function setArFromMixtureRows(rows) {
    const { relativeAtomicMass } = calculateRelativeAtomicMass(rows);
    if (!Number.isFinite(relativeAtomicMass)) return;
    state.arValue = relativeAtomicMass;
    $("arInput").value = String(Number(relativeAtomicMass.toFixed(6)));
  }

  function calculateUnknownMass(rows, ar) {
    const unknownIndex = rows.findIndex(row => row.mass === null);
    if (unknownIndex < 0) return { error: "oneUnknownMass" };
    const unknown = rows[unknownIndex];
    if (!(unknown.abundance > 0)) return { error: "zeroAbundanceMass" };

    let knownProducts = 0;
    const knownParts = [];
    rows.forEach((row, index) => {
      if (index === unknownIndex) return;
      knownProducts += row.mass * row.abundance;
      knownParts.push(`(${formatNumber(row.mass, 4)} × ${formatNumber(row.abundance, 4)})`);
    });

    const mass = (ar * 100 - knownProducts) / unknown.abundance;
      if (!Number.isFinite(mass) || mass < 0) return { error: "invalidMassResult" };

    return {
      unknownIndex,
      mass,
      knownProducts,
      knownParts,
      abundance: unknown.abundance,
      ar
    };
  }

  function calculateTwoAbundances(rows, ar) {
    const unknownIndexes = rows
      .map((row, index) => (row.abundance === null ? index : -1))
      .filter(index => index >= 0);
    if (unknownIndexes.length !== 2) return { error: "twoUnknownAbundances" };

    const [i, j] = unknownIndexes;
    const massX = rows[i].mass;
    const massY = rows[j].mass;
    if (Math.abs(massX - massY) < 1e-12) return { error: "equalMasses" };

    let knownSum = 0;
    let knownProducts = 0;
    const knownParts = [];
    rows.forEach((row, index) => {
      if (index === i || index === j) return;
      knownSum += row.abundance;
      knownProducts += row.mass * row.abundance;
      knownParts.push(`(${formatNumber(row.mass, 4)} × ${formatNumber(row.abundance, 4)})`);
    });

    const remaining = 100 - knownSum;
    if (remaining < -TOTAL_TOLERANCE) return { error: "remainingNegative" };

    const x = (ar * 100 - knownProducts - massY * remaining) / (massX - massY);
    const y = remaining - x;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < -TOTAL_TOLERANCE || y < -TOTAL_TOLERANCE
      || x > 100 + TOTAL_TOLERANCE || y > 100 + TOTAL_TOLERANCE) {
      return { error: "negativeAbundance" };
    }

    return {
      indexes: [i, j],
      x: Math.max(0, x),
      y: Math.max(0, y),
      remaining,
      knownSum,
      knownProducts,
      knownParts,
      massX,
      massY,
      ar
    };
  }

  function readRowsFromDom() {
    const rowNodes = [...$("isotopeRows").querySelectorAll(".isotope-row")];
    state.rows = rowNodes.map(node => ({
      mass: parseOptionalNumber(node.querySelector(".mass-input").value),
      abundance: parseOptionalNumber(node.querySelector(".abundance-input").value)
    }));
    const arRaw = $("arInput").value;
    state.arValue = parseOptionalNumber(arRaw);
  }

  function updateSelectedElementSummary() {
    const element = currentElement();
    if (!element) {
      $("selectedElementSummary").textContent = "—";
      return;
    }
    $("selectedElementSummary").innerHTML = t("selectedElement", {
      name: element[state.lang === "zh" ? "zh" : "en"],
      symbol: element.symbol,
      ar: formatNumber(element.ar, 3)
    }).replace("Aᵣ", "A<sub>r</sub>");
  }

  function updateLearningNote() {
    if (state.loadNote === "simplified") {
      $("learningNoteText").textContent = t("simplifiedNote");
      return;
    }
    const key = state.mode === "mass"
      ? "learningNoteMass"
      : state.mode === "abundances"
        ? "learningNoteAbundances"
        : "learningNoteMixture";
    $("learningNoteText").textContent = t(key);
  }

  function updateModeChrome() {
    const titleKey = state.mode === "mass"
      ? "workspaceTitleMass"
      : state.mode === "abundances"
        ? "workspaceTitleAbundances"
        : "workspaceTitleMixture";
    const enterKey = state.mode === "mass"
      ? "enterValuesMass"
      : state.mode === "abundances"
        ? "enterValuesAbundances"
        : "enterValuesMixture";
    const resultsKey = state.mode === "mass"
      ? "resultsMass"
      : state.mode === "abundances"
        ? "resultsAbundances"
        : "resultsMixture";
    const calcKey = state.mode === "mass"
      ? "calculateMass"
      : state.mode === "abundances"
        ? "calculateAbundances"
        : "calculate";

    $("workspaceTitle").textContent = t(titleKey);
    $("inputTitle").textContent = t(enterKey);
    $("resultsTitle").textContent = t(resultsKey);
    $("calculateButton").textContent = t(calcKey);
    $("arLabelText").innerHTML = t("arLabel");
    $("arInputBlock").hidden = state.mode === "mixture";
    $("modeHint").textContent = state.mode === "mass"
      ? t("modeHintMass")
      : state.mode === "abundances"
        ? t("modeHintAbundances")
        : "";

    document.querySelectorAll(".mode-tab").forEach(button => {
      const active = button.dataset.mode === state.mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    const chip = $("formulaChip");
    chip.replaceChildren();
    FORMULAS[state.mode].forEach(part => {
      const span = document.createElement("span");
      if (part.html) span.innerHTML = part.html;
      else span.textContent = part.text;
      chip.appendChild(span);
    });

    if (state.mode === "mixture") {
      $("resultSymbol").innerHTML = "A<sub>r</sub>";
      $("resultUnit").textContent = t("noUnit");
    } else if (state.mode === "mass") {
      $("resultSymbol").textContent = "x";
      $("resultUnit").textContent = t("massUnit");
    } else {
      $("resultSymbol").textContent = "%";
      $("resultUnit").textContent = t("abundanceUnit");
    }
  }

  function renderIsotopeSummary(loadResult) {
    const element = currentElement();
    const summary = $("elementIsotopeSummary");
    if (!element || !loadResult) {
      summary.hidden = true;
      return;
    }

    const name = element[state.lang === "zh" ? "zh" : "en"];
    $("isotopeSummaryTitle").textContent = t("isotopeSummaryTitle", { name });
    $("isotopeSummaryCount").textContent = loadResult.simplified
      ? t("isotopeSummaryCountSimplified")
      : loadResult.naturalCount === 1
        ? t("isotopeSummaryCountOne")
        : t("isotopeSummaryCount", {
          natural: loadResult.naturalCount
        });

    const note = loadResult.simplified
      ? t("isotopeSummarySimplified")
      : "";
    $("isotopeSummaryNote").textContent = note;

    const list = $("isotopeSummaryList");
    list.replaceChildren();
    const visibleIsotopes = loadResult.simplified
      ? loadResult.allIsotopes.filter(row => row.example)
      : loadResult.naturalIsotopes;
    visibleIsotopes.forEach(row => {
      const item = document.createElement("li");
      if (row.natural) item.classList.add("natural");
      if (row.example) item.classList.add("example");
      if (row.loaded) item.classList.add("loaded");
      const label = document.createElement("span");
      const value = document.createElement("span");
      label.textContent = `m = ${row.mass}`;
      if (row.example) {
        value.textContent = t("isotopeExample");
      } else {
        value.textContent = `${formatSigFig(row.abundance, 3)}%`;
      }
      item.append(label, value);
      list.appendChild(item);
    });

    const exampleItem = list.querySelector("li.example");
    exampleItem?.scrollIntoView({ block: "nearest" });

    summary.hidden = false;
  }

  function renderPresetButtons() {
    const container = $("presetButtons");
    container.replaceChildren();
    ElementLibrary.PRESET_SYMBOLS.forEach(symbol => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-button";
      button.dataset.symbol = symbol;
      button.textContent = symbol;
      button.classList.toggle("active", symbol === state.activeElement);
      button.addEventListener("click", () => applyElement(symbol));
      container.appendChild(button);
    });
  }

  function updatePresetButtons() {
    document.querySelectorAll("[data-symbol]").forEach(button => {
      button.classList.toggle("active", button.dataset.symbol === state.activeElement);
    });
  }

  function shapeRowsForMode(rows) {
    const shaped = rows.map(row => ({
      mass: Number.isFinite(row.mass) ? row.mass : null,
      abundance: Number.isFinite(row.abundance) ? row.abundance : null
    }));

    if (state.mode === "mass") {
      if (shaped.length < 2) {
        while (shaped.length < 2) shaped.push({ mass: null, abundance: null });
      }
      const blankMasses = shaped.filter(row => row.mass === null).length;
      if (blankMasses === 0 && shaped.length >= 2) {
        shaped[shaped.length - 1].mass = null;
      } else if (blankMasses > 1) {
        let kept = false;
        shaped.forEach(row => {
          if (row.mass === null) {
            if (!kept) {
              kept = true;
            } else {
              row.mass = 0;
            }
          }
        });
        if (!kept) shaped[shaped.length - 1].mass = null;
      }
      return shaped;
    }

    if (state.mode === "abundances") {
      if (shaped.length < 2) {
        while (shaped.length < 2) shaped.push({ mass: null, abundance: null });
      }
      const blankAbundances = shaped.filter(row => row.abundance === null).length;
      if (blankAbundances === 0 && shaped.length >= 2) {
        shaped[shaped.length - 1].abundance = null;
        if (shaped.length >= 3) shaped[shaped.length - 2].abundance = null;
        else shaped[0].abundance = null;
      } else if (blankAbundances === 1 && shaped.length >= 2) {
        const filled = shaped.find(row => row.abundance !== null);
        if (filled) filled.abundance = null;
      } else if (blankAbundances > 2) {
        let keep = 2;
        shaped.forEach(row => {
          if (row.abundance === null) {
            if (keep > 0) keep -= 1;
            else row.abundance = 0;
          }
        });
      }
      return shaped;
    }

    return shaped.map(row => ({
      mass: row.mass === null ? 0 : row.mass,
      abundance: row.abundance === null ? 0 : row.abundance
    }));
  }

  function teachingExampleRows() {
    if (state.mode === "mass") {
      state.arValue = 79.988;
      $("arInput").value = "79.988";
      return [
        { mass: 79, abundance: 50.6 },
        { mass: null, abundance: 49.4 }
      ];
    }
    if (state.mode === "abundances") {
      state.arValue = 24.327;
      $("arInput").value = "24.327";
      return [
        { mass: 24, abundance: 78.6 },
        { mass: 25, abundance: null },
        { mass: 26, abundance: null }
      ];
    }
    state.arValue = null;
    $("arInput").value = "";
    return null;
  }

  function renderRows() {
    const container = $("isotopeRows");
    const template = $("isotopeRowTemplate");
    container.replaceChildren();

    const minRows = state.mode === "mixture" ? MIN_ISOTOPES : 2;

    state.rows.forEach((row, index) => {
      const fragment = template.content.cloneNode(true);
      const rowNode = fragment.querySelector(".isotope-row");
      const massInput = fragment.querySelector(".mass-input");
      const abundanceInput = fragment.querySelector(".abundance-input");
      const removeButton = fragment.querySelector(".remove-button");
      const number = index + 1;

      fragment.querySelector(".isotope-index").textContent = number;
      massInput.value = row.mass === null || row.mass === undefined ? "" : row.mass;
      abundanceInput.value = row.abundance === null || row.abundance === undefined ? "" : row.abundance;
      massInput.setAttribute("aria-label", t("massLabel", { number }));
      abundanceInput.setAttribute("aria-label", t("abundanceLabel", { number }));
      removeButton.setAttribute("aria-label", t("removeIsotope", { number }));
      removeButton.disabled = state.rows.length <= minRows;

      const massUnknown = state.mode === "mass" && (row.mass === null || row.mass === undefined);
      const abundUnknown = state.mode === "abundances" && (row.abundance === null || row.abundance === undefined);
      massInput.classList.toggle("unknown-slot", massUnknown);
      abundanceInput.classList.toggle("unknown-slot", abundUnknown);
      rowNode.classList.toggle("has-unknown", massUnknown || abundUnknown);

      [massInput, abundanceInput].forEach(input => {
        input.addEventListener("input", () => {
          readRowsFromDom();
          clearElementContext();
          clearInputErrors();
          updateAbundanceMeter();
          calculateAndRender();
        });
      });

      removeButton.addEventListener("click", () => removeIsotope(index));
      container.appendChild(fragment);
    });

    $("isotopeCount").textContent = `${state.rows.length} / ${MAX_ISOTOPES}`;
    $("addIsotopeButton").disabled = state.rows.length >= MAX_ISOTOPES;
  }

  function addIsotope() {
    if (state.rows.length >= MAX_ISOTOPES) {
      showValidation(t("maxRows"));
      return;
    }
    readRowsFromDom();
    if (state.mode === "mass") {
      state.rows.push({ mass: 0, abundance: 0 });
    } else if (state.mode === "abundances") {
      state.rows.push({ mass: 0, abundance: 0 });
    } else {
      state.rows.push({ mass: 0, abundance: 0 });
    }
    clearElementContext();
    renderRows();
    updateAbundanceMeter();
    calculateAndRender();
    const inputs = $("isotopeRows").querySelectorAll(".mass-input");
    inputs[inputs.length - 1]?.focus();
  }

  function removeIsotope(index) {
    const minRows = state.mode === "mixture" ? MIN_ISOTOPES : 2;
    if (state.rows.length <= minRows) {
      showValidation(t("minimumRows"));
      return;
    }
    readRowsFromDom();
    state.rows.splice(index, 1);
    clearElementContext();
    renderRows();
    updateAbundanceMeter();
    calculateAndRender();
  }

  function clearInputErrors() {
    document.querySelectorAll(".isotope-row input").forEach(input => input.classList.remove("invalid"));
    $("arInput").classList.remove("invalid");
    $("validationMessage").textContent = "";
  }

  function showValidation(message) {
    $("validationMessage").textContent = message;
  }

  function validateRows() {
    clearInputErrors();
    readRowsFromDom();

    if (state.mode === "mixture") {
      return validateMixture();
    }
    if (state.mode === "mass") {
      return validateMassMode();
    }
    return validateAbundancesMode();
  }

  function validateMixture() {
    const inputs = [...document.querySelectorAll(".isotope-row input")];
    let missing = false;
    let rangeError = false;

    inputs.forEach(input => {
      const value = Number(input.value);
      const invalid = input.value.trim() === "" || !Number.isFinite(value) || value < 0;
      const outOfRange = input.classList.contains("abundance-input") && value > 100;
      if (invalid || outOfRange) input.classList.add("invalid");
      missing ||= invalid;
      rangeError ||= outOfRange;
    });

    readRowsFromDom();
    const total = state.rows.reduce((sum, row) => sum + (row.abundance || 0), 0);
    if (missing) return { valid: false, message: t("missingValues") };
    if (rangeError) return { valid: false, message: t("abundanceRange") };
    if (Math.abs(total - 100) > TOTAL_TOLERANCE) {
      return { valid: false, message: t("totalError", { total: formatNumber(total, 2) }) };
    }
    return { valid: true };
  }

  function validateMassMode() {
    if (state.rows.length < 2) {
      return { valid: false, message: t("needTwoIsotopes") };
    }
    if (state.arValue === null || Number.isNaN(state.arValue) || state.arValue < 0) {
      $("arInput").classList.add("invalid");
      return { valid: false, message: t("missingAr") };
    }

    let blankMasses = 0;
    let missing = false;
    let rangeError = false;
    const rowNodes = [...$("isotopeRows").querySelectorAll(".isotope-row")];

    state.rows.forEach((row, index) => {
      const massInput = rowNodes[index].querySelector(".mass-input");
      const abundanceInput = rowNodes[index].querySelector(".abundance-input");

      if (row.mass === null) {
        blankMasses += 1;
      } else if (Number.isNaN(row.mass) || row.mass < 0) {
        massInput.classList.add("invalid");
        missing = true;
      }

      if (row.abundance === null || Number.isNaN(row.abundance) || row.abundance < 0) {
        abundanceInput.classList.add("invalid");
        missing = true;
      } else if (row.abundance > 100) {
        abundanceInput.classList.add("invalid");
        rangeError = true;
      }
    });

    if (blankMasses !== 1) {
      rowNodes.forEach((node, index) => {
        if (state.rows[index].mass === null || blankMasses === 0) {
          node.querySelector(".mass-input").classList.add("invalid");
        }
      });
      return { valid: false, message: t("oneUnknownMass") };
    }
    if (missing) return { valid: false, message: t("missingValues") };
    if (rangeError) return { valid: false, message: t("abundanceRange") };

    const total = state.rows.reduce((sum, row) => sum + row.abundance, 0);
    if (Math.abs(total - 100) > TOTAL_TOLERANCE) {
      return { valid: false, message: t("totalError", { total: formatNumber(total, 2) }) };
    }
    return { valid: true };
  }

  function validateAbundancesMode() {
    if (state.rows.length < 2) {
      return { valid: false, message: t("needTwoIsotopes") };
    }
    if (state.arValue === null || Number.isNaN(state.arValue) || state.arValue < 0) {
      $("arInput").classList.add("invalid");
      return { valid: false, message: t("missingAr") };
    }

    let blankAbundances = 0;
    let missing = false;
    let rangeError = false;
    const rowNodes = [...$("isotopeRows").querySelectorAll(".isotope-row")];

    state.rows.forEach((row, index) => {
      const massInput = rowNodes[index].querySelector(".mass-input");
      const abundanceInput = rowNodes[index].querySelector(".abundance-input");

      if (row.mass === null || Number.isNaN(row.mass) || row.mass < 0) {
        massInput.classList.add("invalid");
        missing = true;
      }

      if (row.abundance === null) {
        blankAbundances += 1;
      } else if (Number.isNaN(row.abundance) || row.abundance < 0) {
        abundanceInput.classList.add("invalid");
        missing = true;
      } else if (row.abundance > 100) {
        abundanceInput.classList.add("invalid");
        rangeError = true;
      }
    });

    if (blankAbundances !== 2) {
      rowNodes.forEach((node, index) => {
        if (state.rows[index].abundance === null || blankAbundances < 2) {
          node.querySelector(".abundance-input").classList.add("invalid");
        }
      });
      return { valid: false, message: t("twoUnknownAbundances") };
    }
    if (missing) return { valid: false, message: t("missingValues") };
    if (rangeError) return { valid: false, message: t("abundanceRange") };
    return { valid: true };
  }

  function updateAbundanceMeter() {
    if (state.mode === "abundances") {
      const knownTotal = state.rows.reduce((sum, row) => {
        return sum + (row.abundance === null || Number.isNaN(row.abundance) ? 0 : row.abundance);
      }, 0);
      const remaining = 100 - knownTotal;
      const percentage = Math.max(0, Math.min(100, knownTotal));
      $("abundanceTotal").textContent = `${formatNumber(knownTotal, 2)}%`;
      $("abundanceFill").style.width = `${percentage}%`;
      $("totalStatus").textContent = t("totalPartial", {
        total: formatNumber(knownTotal, 2),
        remaining: formatNumber(Math.max(0, remaining), 2)
      });
      document.querySelector(".abundance-meter").classList.toggle("invalid", remaining < -TOTAL_TOLERANCE);
      return;
    }

    const total = state.rows.reduce((sum, row) => {
      return sum + (row.abundance === null || Number.isNaN(row.abundance) ? 0 : row.abundance);
    }, 0);
    const ready = Math.abs(total - 100) <= TOTAL_TOLERANCE;
    const percentage = Math.max(0, Math.min(100, total));
    $("abundanceTotal").textContent = `${formatNumber(total, 2)}%`;
    $("abundanceFill").style.width = `${percentage}%`;
    $("totalStatus").textContent = ready
      ? t("totalReady")
      : t("totalShort", { total: formatNumber(total, 2) });
    document.querySelector(".abundance-meter").classList.toggle("invalid", !ready);
  }

  function renderChart(rows) {
    const chart = $("abundanceChart");
    chart.replaceChildren();
    rows.forEach((row, index) => {
      const item = document.createElement("div");
      const value = document.createElement("span");
      const bar = document.createElement("span");
      const label = document.createElement("span");
      item.className = "bar-item";
      value.className = "bar-value";
      bar.className = "bar";
      label.className = "bar-label";
      value.textContent = `${formatNumber(row.abundance, 2)}%`;
      bar.style.height = `${Math.max(2, Math.min(100, row.abundance))}%`;
      bar.style.background = `linear-gradient(180deg, ${COLORS[index % COLORS.length]}bb, ${COLORS[index % COLORS.length]})`;
      label.textContent = `m = ${formatNumber(row.mass, 3)}`;
      item.append(value, bar, label);
      chart.appendChild(item);
    });
  }

  function appendWorkingLines(lines) {
    const working = $("workingSteps");
    working.replaceChildren();
    lines.forEach((text, index) => {
      const line = document.createElement("p");
      if (index === lines.length - 1) {
        const strong = document.createElement("strong");
        strong.textContent = text;
        line.appendChild(strong);
      } else {
        line.textContent = text;
      }
      working.appendChild(line);
    });
  }

  function renderWorkingMixture(rows, calculation) {
    const products = rows.map(row => {
      const mass = formatNumber(row.mass, 4);
      const abundance = formatNumber(row.abundance, 4);
      return `(${mass} × ${abundance})`;
    });
    appendWorkingLines([
      t("workingProductsSigFig", { products: products.join(" + ") }),
      t("workingSumExact", { sum: formatNumber(calculation.productSum, 4) }),
      t("workingResult", {
        sum: formatNumber(calculation.productSum, 4),
        result: formatNumber(calculation.relativeAtomicMass, 4)
      })
    ]);
  }

  function renderWorkingMass(result) {
    appendWorkingLines([
      t("workingMassSetup", { abundance: formatNumber(result.abundance, 4) }),
      t("workingMassKnown", {
        products: result.knownParts.join(" + ") || "0",
        sum: formatNumber(result.knownProducts, 4)
      }),
      t("workingMassSolve", {
        ar: formatNumber(result.ar, 4),
        sum: formatNumber(result.knownProducts, 4),
        abundance: formatNumber(result.abundance, 4),
        result: formatNumber(result.mass, 4)
      })
    ]);
  }

  function renderWorkingAbundances(result) {
    appendWorkingLines([
      t("workingAbundSetup", {
        massX: formatNumber(result.massX, 4),
        massY: formatNumber(result.massY, 4)
      }),
      t("workingAbundSum", {
        remaining: formatNumber(result.remaining, 4),
        known: formatNumber(result.knownSum, 4)
      }),
      t("workingAbundEq", {
        ar: formatNumber(result.ar, 4),
        knownProducts: result.knownParts.join(" + ") || "0",
        massX: formatNumber(result.massX, 4),
        massY: formatNumber(result.massY, 4)
      }),
      t("workingAbundSolve", {
        remaining: formatNumber(result.remaining, 4),
        x: formatNumber(result.x, 4),
        y: formatNumber(result.y, 4)
      })
    ]);
  }

  function setResultValidity(valid) {
    const badge = $("resultStatus");
    badge.textContent = t(valid ? "valid" : "checkData");
    badge.classList.toggle("valid", valid);
    badge.classList.toggle("invalid", !valid);
  }

  function setResultValue(content) {
    const target = $("resultValue");
    if (typeof content === "string") {
      target.classList.remove("result-value-stack");
      target.textContent = content;
      return;
    }
    target.classList.add("result-value-stack");
    target.replaceChildren();
    content.forEach(line => {
      const lineNode = document.createElement("div");
      lineNode.textContent = line;
      target.appendChild(lineNode);
    });
  }

  function calculateAndRender(event) {
    event?.preventDefault();
    const validation = validateRows();
    updateAbundanceMeter();
    if (!validation.valid) {
      showValidation(validation.message);
      setResultValidity(false);
      return false;
    }

    if (state.mode === "mixture") {
      const calculation = calculateRelativeAtomicMass(state.rows);
      setResultValue(formatNumber(calculation.relativeAtomicMass, 4));
      renderChart(state.rows);
      renderWorkingMixture(state.rows, calculation);
      setResultValidity(true);
      return true;
    }

    if (state.mode === "mass") {
      const result = calculateUnknownMass(state.rows, state.arValue);
      if (result.error) {
        showValidation(t(result.error));
        setResultValidity(false);
        return false;
      }
      setResultValue(formatNumber(result.mass, 4));
      const chartRows = state.rows.map((row, index) => ({
        mass: index === result.unknownIndex ? result.mass : row.mass,
        abundance: row.abundance
      }));
      renderChart(chartRows);
      renderWorkingMass(result);
      setResultValidity(true);
      return true;
    }

    const result = calculateTwoAbundances(state.rows, state.arValue);
    if (result.error) {
      showValidation(t(result.error));
      setResultValidity(false);
      return false;
    }
    setResultValue([
      `x = ${formatNumber(result.x, 4)}%`,
      `y = ${formatNumber(result.y, 4)}%`
    ]);
    const chartRows = state.rows.map((row, index) => {
      if (index === result.indexes[0]) return { mass: row.mass, abundance: result.x };
      if (index === result.indexes[1]) return { mass: row.mass, abundance: result.y };
      return { mass: row.mass, abundance: row.abundance };
    });
    renderChart(chartRows);
    renderWorkingAbundances(result);
    setResultValidity(true);
    return true;
  }

  function applyElement(symbol, options = {}) {
    const { useTeachingExample = false } = options;
    const loadResult = ElementLibrary.getIsotopeRows(symbol);
    state.activeElement = symbol;
    state.isotopeMeta = loadResult;
    state.loadNote = loadResult.simplified ? "simplified" : null;

    if (useTeachingExample) {
      const example = teachingExampleRows();
      if (example) {
        state.rows = example;
      } else {
        const mixtureRows = loadResult.rows.map(row => ({ ...row }));
        state.rows = shapeRowsForMode(mixtureRows.map(row => ({ ...row })));
        if (state.mode !== "mixture" && mixtureRows.length) {
          setArFromMixtureRows(mixtureRows);
        }
      }
    } else {
      const mixtureRows = loadResult.rows.map(row => ({ ...row }));
      let rows = mixtureRows.map(row => ({ ...row }));
      if (state.mode === "mass" && rows.length >= 2) {
        setArFromMixtureRows(mixtureRows);
        rows = rows.map((row, index) => (
          index === rows.length - 1
            ? { mass: null, abundance: row.abundance }
            : { mass: row.mass, abundance: row.abundance }
        ));
      } else if (state.mode === "abundances" && rows.length >= 2) {
        setArFromMixtureRows(mixtureRows);
        rows = rows.map((row, index) => {
          if (rows.length === 2) {
            return { mass: row.mass, abundance: null };
          }
          if (index >= rows.length - 2) {
            return { mass: row.mass, abundance: null };
          }
          return { mass: row.mass, abundance: row.abundance };
        });
      } else {
        state.arValue = null;
        $("arInput").value = "";
      }
      state.rows = shapeRowsForMode(rows);
    }

    renderRows();
    updatePresetButtons();
    renderPeriodicSelection();
    updateSelectedElementSummary();
    renderIsotopeSummary(loadResult);
    updateLearningNote();
    clearInputErrors();
    updateAbundanceMeter();
    calculateAndRender();
    closePeriodicModal();
  }

  function switchMode(mode) {
    if (!["mixture", "mass", "abundances"].includes(mode)) return;
    state.mode = mode;
    updateModeChrome();
    updateLearningNote();
    applyElement(MODE_STARTERS[mode], { useTeachingExample: mode !== "mixture" });
  }

  function renderCategoryLegend() {
    const legend = $("categoryLegend");
    legend.replaceChildren();
    Object.entries(ElementLibrary.CATEGORY_KEYS).forEach(([, key]) => {
      const chip = document.createElement("span");
      chip.className = `legend-chip cat-${key}`;
      chip.textContent = t(CATEGORY_I18N[key]);
      legend.appendChild(chip);
    });
  }

  function elementMatchesFilter(element, atomicNumber) {
    if (!state.periodicFilter.trim()) return true;
    const query = state.periodicFilter.trim().toLowerCase();
    const name = `${element.en} ${element.zh} ${element.symbol} ${atomicNumber}`.toLowerCase();
    return name.includes(query);
  }

  function renderPeriodicTable() {
    const grid = $("periodicTableGrid");
    grid.replaceChildren();

    ElementLibrary.PERIODIC_GRID.forEach(row => {
      const rowNode = document.createElement("div");
      rowNode.className = "periodic-row";
      row.forEach(atomicNumber => {
        const cell = document.createElement("div");
        cell.className = "periodic-cell";
        if (!atomicNumber) {
          cell.classList.add("empty");
          rowNode.appendChild(cell);
          return;
        }

        const element = ElementLibrary.getElement(atomicNumber);
        if (!element) {
          rowNode.appendChild(cell);
          return;
        }

        const visible = elementMatchesFilter(element, atomicNumber);
        cell.classList.toggle("hidden-match", !visible);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `element-card cat-${element.category}`;
        button.dataset.symbol = element.symbol;
        button.setAttribute("aria-label", `${element.symbol}, ${element.en}`);
        if (element.symbol === state.activeElement) button.classList.add("selected");

        button.innerHTML = `
          <span class="element-number">${atomicNumber}</span>
          <strong class="element-symbol">${element.symbol}</strong>
          <span class="element-name">${element[state.lang === "zh" ? "zh" : "en"]}</span>
          <span class="element-ar">${formatNumber(element.ar, 3)}</span>
        `;
        button.addEventListener("click", () => applyElement(element.symbol));
        cell.appendChild(button);
        rowNode.appendChild(cell);
      });
      grid.appendChild(rowNode);
    });
  }

  function renderPeriodicSelection() {
    document.querySelectorAll(".element-card").forEach(button => {
      button.classList.toggle("selected", button.dataset.symbol === state.activeElement);
    });
  }

  function openPeriodicModal() {
    lastFocusedElement = document.activeElement;
    $("periodicModal").hidden = false;
    document.body.classList.add("modal-open");
    renderPeriodicTable();
    $("elementSearchInput").focus();
  }

  function closePeriodicModal() {
    $("periodicModal").hidden = true;
    document.body.classList.remove("modal-open");
    lastFocusedElement?.focus?.();
  }

  function updateTranslations() {
    document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
    document.querySelectorAll("[data-i18n]").forEach(node => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(node => {
      node.placeholder = t(node.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-lang]").forEach(button => {
      button.classList.toggle("active", button.dataset.lang === state.lang);
    });
    $("closePeriodicTableButton").setAttribute("aria-label", state.lang === "zh" ? "關閉週期表" : "Close periodic table");
    updateModeChrome();
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

  function switchLanguage(lang) {
    readRowsFromDom();
    state.lang = lang;
    updateTranslations();
    renderPresetButtons();
    renderRows();
    renderCategoryLegend();
    renderPeriodicTable();
    updateSelectedElementSummary();
    if (state.isotopeMeta && state.activeElement) renderIsotopeSummary(state.isotopeMeta);
    updateLearningNote();
    updateAbundanceMeter();
    calculateAndRender();
  }

  $("calculatorForm").addEventListener("submit", calculateAndRender);
  $("addIsotopeButton").addEventListener("click", addIsotope);
  $("resetButton").addEventListener("click", () => {
    applyElement(MODE_STARTERS[state.mode], { useTeachingExample: state.mode !== "mixture" });
  });
  $("arInput").addEventListener("input", () => {
    readRowsFromDom();
    clearInputErrors();
    updateAbundanceMeter();
    calculateAndRender();
  });
  $("openPeriodicTableButton").addEventListener("click", openPeriodicModal);
  $("closePeriodicTableButton").addEventListener("click", closePeriodicModal);
  $("periodicModal").addEventListener("click", event => {
    if (event.target.dataset.closeModal === "true") closePeriodicModal();
  });
  $("elementSearchInput").addEventListener("input", event => {
    state.periodicFilter = event.target.value;
    renderPeriodicTable();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("periodicModal").hidden) closePeriodicModal();
  });
  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => switchLanguage(button.dataset.lang));
  });
  const descToggle = $("descToggle");
  if (descToggle) {
    descToggle.addEventListener("click", () => {
      state.hideDescriptions = !state.hideDescriptions;
      syncDescToggle();
    });
  }
  document.querySelectorAll(".mode-tab").forEach(button => {
    button.addEventListener("click", () => switchMode(button.dataset.mode));
  });

  window.RAMCalculator = {
    calculate: rows => calculateRelativeAtomicMass(rows),
    calculateUnknownMass,
    calculateTwoAbundances,
    applyElement,
    switchMode,
    getState: () => ({
      lang: state.lang,
      mode: state.mode,
      activeElement: state.activeElement,
      rows: state.rows.map(row => ({ ...row })),
      arValue: state.arValue,
      result: $("resultValue").textContent
    })
  };

  const selfTests = [
    { symbol: "Cl", min: 35.4, max: 35.6, minKnown: 20, natural: 2 },
    { symbol: "V", natural: 2, minKnown: 20, minRows: 2, min: 50.9, max: 51.0 },
    { symbol: "Mn", natural: 1, minKnown: 20, minRows: 1, min: 54.9, max: 55.1 },
    { symbol: "Ti", natural: 5, minKnown: 20, minRows: 5, min: 47.8, max: 47.95 },
    { symbol: "U", natural: 3, minKnown: 20, minRows: 3, min: 237.9, max: 238.1 },
    { symbol: "Ca", natural: 6, minKnown: 20, minRows: 6 },
    { symbol: "Sn", natural: 10, minKnown: 20, minRows: 10 },
    { symbol: "Mg", min: 24.31, max: 24.33 },
    { symbol: "Cu", min: 63.59, max: 63.65 },
    { symbol: "Br", min: 79.9, max: 80.0 },
    { symbol: "Pb", min: 207.1, max: 207.3 },
    { symbol: "Fe", natural: 4, min: 55.8, max: 55.92 },
    { symbol: "Hs", simplified: true, exampleMass: 269, minKnown: 10, minRows: 1, min: 268.9, max: 269.1 },
    { symbol: "Tc", simplified: true, exampleMass: 98, minKnown: 10, minRows: 1, min: 97.9, max: 98.1 }
  ];
  const testsPassed = selfTests.every(test => {
    const loadResult = ElementLibrary.getIsotopeRows(test.symbol);
    const result = calculateRelativeAtomicMass(loadResult.rows);
    const abundanceOk = Math.abs(result.totalAbundance - 100) < 0.01;
    const knownOk = !test.minKnown || loadResult.totalIsotopes >= test.minKnown;
    const naturalOk = !test.natural || loadResult.naturalCount === test.natural;
    const simplifiedOk = !test.simplified
      || (loadResult.simplified
        && loadResult.rows.length === 1
        && loadResult.rows[0].mass === test.exampleMass
        && loadResult.allIsotopes.some(row => row.mass === test.exampleMass && row.example && row.abundance === 100));
    if (test.simplified) {
      return simplifiedOk && knownOk && abundanceOk
        && loadResult.rows.length >= (test.minRows || 1)
        && result.relativeAtomicMass >= test.min
        && result.relativeAtomicMass <= test.max;
    }
    if (test.natural || test.minKnown) {
      return knownOk
        && naturalOk
        && loadResult.rows.length >= (test.minRows || 1)
        && abundanceOk
        && (!test.min || result.relativeAtomicMass >= test.min)
        && (!test.max || result.relativeAtomicMass <= test.max);
    }
    return abundanceOk
      && result.relativeAtomicMass >= test.min
      && result.relativeAtomicMass <= test.max;
  });

  const massExample = calculateUnknownMass(
    [{ mass: 79, abundance: 50.6 }, { mass: null, abundance: 49.4 }],
    79.988
  );
  const abundanceExample = calculateTwoAbundances(
    [
      { mass: 24, abundance: 78.6 },
      { mass: 25, abundance: null },
      { mass: 26, abundance: null }
    ],
    24.327
  );
  const snLoad = ElementLibrary.getIsotopeRows("Sn");
  const snMixture = calculateRelativeAtomicMass(snLoad.rows);
  const snMassRows = snLoad.rows.map((row, index) => (
    index === snLoad.rows.length - 1
      ? { mass: null, abundance: row.abundance }
      : { mass: row.mass, abundance: row.abundance }
  ));
  const snMassExample = calculateUnknownMass(snMassRows, snMixture.relativeAtomicMass);
  const snLastMass = snLoad.rows[snLoad.rows.length - 1].mass;
  const modeTestsPassed = !massExample.error
    && Math.abs(massExample.mass - 81) < 0.05
    && !abundanceExample.error
    && Math.abs(abundanceExample.x - 10.1) < 0.15
    && Math.abs(abundanceExample.y - 11.3) < 0.15
    && !snMassExample.error
    && Math.abs(snMassExample.mass - snLastMass) < 0.05;

  const allTestsPassed = testsPassed && modeTestsPassed;
  document.documentElement.dataset.ramTests = allTestsPassed ? "passed" : "failed";
  if (!allTestsPassed) console.error("Relative atomic mass self-tests failed.", {
    testsPassed,
    modeTestsPassed,
    massExample,
    abundanceExample,
    snMassExample
  });

  updateTranslations();
  applyElement("Cl");
  renderPresetButtons();
  renderCategoryLegend();
  document.documentElement.dataset.ramReady = "true";
})();
