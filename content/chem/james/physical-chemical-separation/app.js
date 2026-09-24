(() => {
  "use strict";

  const TRANSLATIONS = {
    en: {
      title: "Physical vs Chemical Separation",
      subtitle: "A state engine that separates mixtures physically and changes compounds only with energy input",
      labTitle: "Interactive separation laboratory",
      labHeading: "Choose a sample",
      sampleIron: "Iron + sulphur",
      sampleSand: "Sand + water",
      sampleCustom: "Custom pair",
      chooseElements: "Choose elements",
      chipKind: "Kind",
      chipBonded: "Bonded",
      chipEnergy: "Energy",
      chipResult: "Last result",
      workspace: "Workspace",
      stageIron: "Iron + sulphur mixture",
      stageIronCompound: "Iron(II) sulphide compound",
      stageIronSeparated: "Iron pulled from sulphur",
      stageSand: "Sand + water mixture",
      stageSandDecanted: "Sand settled, water poured off",
      stageSandFiltered: "Sand residue and water filtrate",
      stageIronMolten: "Molten iron and sulphur",
      stageIronMoltenCompound: "Molten iron(II) sulphide",
      stageSandMolten: "Molten sand in water",
      stageCustom: "Custom element mixture",
      stageCustomSeparated: "Magnetic metal pulled away",
      stageCustomMolten: "Molten custom pair",
      physicalMethods: "Physical methods",
      chemicalMethods: "Chemical / energy",
      magnet: "Magnet",
      decant: "Decant",
      filter: "Filter",
      melt: "Molten state",
      heat: "Strong heat",
      reset: "Reset",
      hideText: "Hide description",
      showText: "Show description",
      tableKicker: "Periodic table",
      tableTitle: "Choose two elements",
      tableHint: "Select two solids or liquids for the watch glass. Room-temperature gases cannot be placed on the plate. Iron + sulphur still forms FeS with strong heat.",
      tableSlotA: "Element A",
      tableSlotB: "Element B",
      tableClear: "Clear",
      tableApply: "Apply pair",
      tableCancel: "Cancel",
      sourceBeaker: "Mixture",
      pouredBeaker: "Decanted liquid",
      filterLabel: "Filtration",
      clingFilm: "cling film",
      residue: "Residue",
      filtrate: "Filtrate",
      demoIdle: "Idle",
      demoMagnetApproach: "Magnet approaches",
      demoMagnetPull: "Iron is attracted",
      demoMagnetLift: "Iron lifts away",
      demoMagnetFail: "No attraction",
      demoSettle: "Sedimentation",
      demoPour: "Decantation",
      demoFilterPour: "Pouring into funnel",
      demoFilterDrip: "Residue and filtrate",
      demoHeatGlow: "Energy input",
      demoMelt: "Melting",
      demoPlaying: "Playing",
      mixture: "Mixture",
      compound: "Compound",
      elements: "Elements",
      yes: "Yes",
      no: "No",
      ready: "Ready",
      separated: "Separated",
      combined: "Combined",
      decomposed: "Decomposed",
      melted: "Melted",
      blocked: "Blocked",
      note: "Note",
      energyNone: "—",
      energyHeat: "Heat",
      energyElectricity: "Electricity",
      energyBoth: "Heat + electricity",
      iron: "Iron",
      sulphur: "Sulphur",
      ironSulphide: "Iron(II) sulphide",
      sand: "Sand",
      water: "Water",
      captionIronStart: "Grey iron and yellow sulphur are mixed but not bonded. Try a magnet, or supply heat to make a compound.",
      captionSandStart: "Insoluble sand is suspended in water. Use decantation and filtration — physical methods that leave the substances chemically unchanged.",
      captionMagnetSuccess: "The magnet attracts iron. Sulphur is left behind. The components of the mixture kept their own properties.",
      captionSettle: "Sand is dense and insoluble. Left undisturbed, it settles to the bottom — sedimentation.",
      captionPour: "The liquid is poured off, leaving the solid behind. Decantation is a quick but rough physical method.",
      captionFilterStep: "The mixture is poured onto filter paper. Sand stays as residue; water passing through is the filtrate.",
      captionDecantSuccess: "Sand settled, then the water was poured off. Decantation is a physical separation of an insoluble solid from a liquid.",
      captionFilterSuccess: "Filter paper traps sand as residue. Clear water is the filtrate. No new substance was formed.",
      captionHeatSuccess: "Strong heating supplies energy. Iron and sulphur combine to form black, non-magnetic iron(II) sulphide.",
      captionCustomStart: "Two elements are mixed but not bonded. Try a magnet if one is magnetic, melt them, or use iron + sulphur if you want Strong heat to make FeS.",
      captionMagnetCustom: "The magnet attracts the magnetic metal. The other element is left behind. The components kept their own properties.",
      captionMeltIron: "Heat raises the temperature. Sulphur melts at 115 °C, then iron at 1538 °C. Melting is a physical change — no new compound yet.",
      captionMeltSand: "Water is already liquid (melts at 0 °C). Sand melts near 1710 °C to a glassy liquid. The substances are not chemically changed.",
      captionMeltCustom: "Each element melts at its own melting point and becomes a liquid. This is a physical change; identities stay the same.",
      captionMeltCompound: "Iron(II) sulphide melts, but it is still the same compound. Melting does not undo chemical bonds.",
      captionMeltAlreadyLiquid: "These substances are already liquid at bench temperature. Raising the heat does not create a new substance.",
      noteAlreadyMolten: "The sample is already molten. Reset or cool by choosing the sample again if you want the solids back.",
      noteMoltenMagnetCurie: "Molten iron (and other magnetic metals) is above the Curie point, so it is no longer a magnetic solid. A magnet cannot pull it out.",
      noteNoMagnetic: "Neither element in this pair is magnetic. Only solid iron, cobalt or nickel is attracted to a magnet.",
      noteMoltenSandPhysical: "The sand has melted into a liquid (molten glass). Decantation and filtration are for insoluble solids in liquids, not two liquids.",
      noteHeatCustomPair: "Strong heating in this lab demonstrates Fe + S → FeS. Your custom pair can still melt, but combination is shown with iron and sulphur.",
      noteMeltWrongSample: "This electrolysis sample is already a liquid. Use the mixture samples to explore melting.",
      warnFeSMagnetTitle: "A magnet cannot separate this compound",
      warnFeSMagnetBody: "Iron(II) sulphide is a compound. Iron and sulphur are chemically bonded. A magnet cannot separate them — that only works on the mixture.",
      warnFeSPhysicalTitle: "Physical methods cannot undo a compound",
      warnFeSPhysicalBody: "Iron(II) sulphide is a new substance. Decantation and filtration do not break the Fe–S bonds. Chemical change needed energy input; reversing it needs another chemical method.",
      noteAlreadySeparated: "These components are already physically separated.",
      noteAlreadyDecanted: "The liquid has already been poured off. Filtering the remainder can still trap leftover sand.",
      noteNoIron: "There is no magnetic metal in this sand–water mixture. Use decantation or filtration instead.",
      noteNotSolidLiquid: "Decantation and filtration are for insoluble solids in liquids, not for this iron–sulphur powder.",
      noteHeatWrongSample: "Strong heating is the energy method that combines iron and sulphur. It does not separate sand from water, and it does not split H₂O.",
      noteAlreadyFeS: "The mixture has already reacted. FeS is a compound; more heating here does not pull iron and sulphur apart.",
      noteHeatSeparated: "The iron has already been lifted away. Heat can form FeS only while iron and sulphur are still mixed together."
    },
    zh: {
      title: "物理與化學分離",
      subtitle: "以狀態引擎分辨混合物的物理分離，以及化合物所需的能量輸入",
      labTitle: "互動分離實驗室",
      labHeading: "選擇樣本",
      sampleIron: "鐵 + 硫",
      sampleSand: "沙 + 水",
      sampleCustom: "自選元素",
      chooseElements: "選擇元素",
      chipKind: "種類",
      chipBonded: "鍵合",
      chipEnergy: "能量",
      chipResult: "上次結果",
      workspace: "工作區",
      stageIron: "鐵與硫混合物",
      stageIronCompound: "硫化鐵(II)化合物",
      stageIronSeparated: "鐵已被磁鐵吸出",
      stageSand: "沙與水混合物",
      stageSandDecanted: "沙已沉降，水已傾出",
      stageSandFiltered: "沙為殘餘物，水為濾液",
      stageIronMolten: "熔融的鐵與硫",
      stageIronMoltenCompound: "熔融的硫化鐵(II)",
      stageSandMolten: "熔融的沙與水",
      stageCustom: "自選元素混合物",
      stageCustomSeparated: "磁性金屬已被吸走",
      stageCustomMolten: "熔融的自選元素",
      physicalMethods: "物理方法",
      chemicalMethods: "化學／能量",
      magnet: "磁鐵",
      decant: "傾析",
      filter: "過濾",
      melt: "熔融態",
      heat: "強熱",
      reset: "重設",
      hideText: "隱藏描述",
      showText: "顯示描述",
      tableKicker: "週期表",
      tableTitle: "選擇兩種元素",
      tableHint: "請選兩種固體或液體放在表面皿上。室溫氣體不能放在碟上。鐵 + 硫仍可用強熱製成 FeS。",
      tableSlotA: "元素 A",
      tableSlotB: "元素 B",
      tableClear: "清除",
      tableApply: "套用配對",
      tableCancel: "取消",
      sourceBeaker: "混合物",
      pouredBeaker: "傾出液體",
      filterLabel: "過濾",
      clingFilm: "保鮮膜",
      residue: "殘餘物",
      filtrate: "濾液",
      demoIdle: "待機",
      demoMagnetApproach: "磁鐵靠近",
      demoMagnetPull: "鐵被吸引",
      demoMagnetLift: "鐵被吸起",
      demoMagnetFail: "沒有吸引",
      demoSettle: "沉降",
      demoPour: "傾析",
      demoFilterPour: "倒入漏斗",
      demoFilterDrip: "殘餘物與濾液",
      demoHeatGlow: "能量輸入",
      demoMelt: "熔化中",
      demoPlaying: "演示中",
      mixture: "混合物",
      compound: "化合物",
      elements: "元素",
      yes: "是",
      no: "否",
      ready: "就緒",
      separated: "已分離",
      combined: "已化合",
      decomposed: "已分解",
      melted: "已熔融",
      blocked: "已阻擋",
      note: "提示",
      energyNone: "—",
      energyHeat: "熱能",
      energyElectricity: "電能",
      energyBoth: "熱能 + 電能",
      iron: "鐵",
      sulphur: "硫",
      ironSulphide: "硫化鐵(II)",
      sand: "沙",
      water: "水",
      captionIronStart: "灰色鐵粉和黃色硫粉只是混合，尚未鍵合。可試磁鐵，或加熱製成化合物。",
      captionSandStart: "不溶的沙懸浮在水中。請用傾析和過濾——這些物理方法不會改變物質的化學身分。",
      captionMagnetSuccess: "磁鐵吸走鐵，硫留在原處。混合物的各成分仍保持各自性質。",
      captionSettle: "沙又密又不溶。靜置後沉降到杯底——這是沉降。",
      captionPour: "把液體傾出，固體留下。傾析是快捷但較粗略的物理方法。",
      captionFilterStep: "把混合物倒上濾紙。沙留作殘餘物，通過的水是濾液。",
      captionDecantSuccess: "沙沉降後把水傾出。傾析是把不溶固體與液體分開的物理方法。",
      captionFilterSuccess: "濾紙截留沙作為殘餘物，清水是濾液。沒有新物質生成。",
      captionHeatSuccess: "強熱提供能量。鐵和硫化合成黑色、不帶磁性的硫化鐵(II)。",
      captionCustomStart: "兩種元素只是混合，尚未鍵合。若其中一種有磁性可試磁鐵，也可加熱至熔融。若要示範化合，請選鐵 + 硫再施強熱。",
      captionMagnetCustom: "磁鐵吸走磁性金屬，另一種元素留下。各成分仍保持各自性質。",
      captionMeltIron: "溫度上升。硫在 115 °C 熔化，鐵在 1538 °C 熔化。熔化是物理變化，尚未生成新化合物。",
      captionMeltSand: "水在室溫已是液體（熔點 0 °C）。沙約在 1710 °C 熔成玻璃狀液體。物質的化學身分沒有改變。",
      captionMeltCustom: "各元素在自己的熔點變成液體。這是物理變化，元素身分不變。",
      captionMeltCompound: "硫化鐵(II)熔化了，但仍是同一種化合物。熔化不能拆開化學鍵。",
      captionMeltAlreadyLiquid: "這些物質在室溫已是液體。繼續加熱也不會生成新物質。",
      noteAlreadyMolten: "樣本已經熔融。若要固體回來，請重設或再選一次樣本。",
      noteMoltenMagnetCurie: "熔融的鐵（及其他磁性金屬）已超過居里點，不再是磁性固體，磁鐵不能把它吸出。",
      noteNoMagnetic: "這一對元素都沒有磁性。只有固態的鐵、鈷或鎳會被磁鐵吸引。",
      noteMoltenSandPhysical: "沙已熔成液體（熔融玻璃）。傾析和過濾適用於液體中的不溶固體，不適用於兩種液體。",
      noteHeatCustomPair: "這個實驗用強熱示範 Fe + S → FeS。自選配對仍可熔化，但化合反應請用鐵和硫來示範。",
      noteMeltWrongSample: "這個電解樣本已經是液體。請改用混合物樣本來觀察熔化。",
      warnFeSMagnetTitle: "磁鐵不能分離這個化合物",
      warnFeSMagnetBody: "硫化鐵(II)是化合物。鐵和硫已經化學鍵合，磁鐵不能把它們分開——那只適用於混合物。",
      warnFeSPhysicalTitle: "物理方法不能拆開化合物",
      warnFeSPhysicalBody: "硫化鐵(II)是新物質。傾析和過濾不能破壞 Fe–S 鍵。形成它需要能量輸入，要還原也需要另一個化學方法。",
      noteAlreadySeparated: "這些成分已經被物理分離。",
      noteAlreadyDecanted: "液體已經傾出。過濾剩餘部分仍可截留沙粒。",
      noteNoIron: "這個沙–水混合物沒有磁性金屬。請改用傾析或過濾。",
      noteNotSolidLiquid: "傾析和過濾適用於液體中的不溶固體，不適用於鐵–硫粉末。",
      noteHeatWrongSample: "強熱是把鐵和硫化合成化合物的能量方法。它不能把沙從水分開，也不能拆開 H₂O。",
      noteAlreadyFeS: "混合物已經反應。FeS 是化合物，再加熱也不能把鐵和硫拉開。",
      noteHeatSeparated: "鐵已經被吸走。只有鐵和硫仍混在一起時，加熱才能生成 FeS。"
    }
  };

  const ui = {
    lang: "en",
    pendingLang: null,
    hideDescriptions: false
  };

  const MOTION = {
    easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
    easeIn: "cubic-bezier(0.55, 0.06, 0.68, 0.19)",
    easeInOut: "cubic-bezier(0.45, 0.05, 0.55, 0.95)",
    magnetApproach: 720,
    magnetPull: 860,
    magnetLift: 700,
    magnetFail: 980,
    magnetStagger: 40,
    settleBase: 1050,
    settleSpread: 520,
    settleStagger: 48,
    settlePause: 360,
    pourSlide: 540,
    pourTilt: 720,
    decantPosition: 680,
    decantTip: 900,
    decantFlow: 1900,
    decantUpright: 760,
    decantReturn: 560,
    streamGrow: 460,
    streamHold: 1300,
    easeRest: 500,
    heat: 1450,
    melt: 2400,
    filterGrain: 980,
    dripCycle: 700,
    dripRepeats: 7
  };

  const lab = window.SeparationEngine.createLab("ironSulphur");
  const ELEMENTS = window.SeparationEngine.ELEMENTS;
  const PERIODIC_LAYOUT = window.SeparationEngine.PERIODIC_LAYOUT;
  const ROOM_TEMP = window.SeparationEngine.ROOM_TEMP;
  let snapshot = lab.getState();
  const picks = [];
  let lastCustom = null;
  const demo = {
    playing: false,
    step: "idle",
    timers: [],
    animations: [],
    frames: [],
    runId: 0
  };

  const APPARATUS = {
    decant: {
      receiverInsetX: 0.16,
      receiverInsetY: 0.2,
      rodOffsetX: 0.365,
      rodOffsetY: 0.42,
      tipAngle: 52,
      flowAngle: 58,
      sourceStartFill: 72,
      sourceEndFill: 10,
      receiverEndFill: 60
    },
    filter: {
      receiverInsetX: 0.5,
      receiverInsetY: 0.12,
      rodOffsetX: 0.38,
      rodOffsetY: 0.4,
      tipAngle: 50,
      flowAngle: 56,
      sourceStartFill: 72,
      sourceEndFill: 0,
      receiverEndFill: 58
    },
    magnet: {
      targetInsetX: 0.2,
      targetInsetY: 0.34,
      liftRatioX: 0.3,
      liftDistanceY: 38
    }
  };

  const DOM = {
    body: document.body,
    magnet: document.getElementById("magnetArm"),
    magnetCling: document.getElementById("magnetCling"),
    ironParticles: document.getElementById("feParticles"),
    ironBench: document.querySelector(".bench-fe"),
    watchGlass: document.querySelector(".watch-glass"),
    sandBench: document.querySelector(".bench-sand"),
    sourceBeaker: document.getElementById("sourceBeaker"),
    sourceLip: document.getElementById("sourceLip"),
    sourceWater: document.querySelector(".source-beaker .sand-water"),
    receiverBeaker: document.getElementById("pouredBeaker"),
    receiverWater: document.querySelector(".poured-water"),
    decantRod: document.getElementById("decantRod"),
    stream: document.getElementById("lipStream"),
    liquidLayer: document.getElementById("liquidLayer"),
    tempReadout: document.getElementById("tempReadout"),
    dishPools: document.getElementById("dishPools"),
    moltenSand: document.getElementById("moltenSand"),
    periodicDialog: document.getElementById("periodicDialog"),
    periodicGrid: document.getElementById("periodicGrid"),
    applyPair: document.getElementById("applyPair"),
    particleLegend: document.getElementById("particleLegend")
  };

  function isDishSample(sample) {
    return sample === "ironSulphur" || sample === "custom";
  }

  function canPlaceOnPlate(symbol) {
    return window.SeparationEngine.canPlaceOnPlate(symbol);
  }

  function platePair(symbols) {
    return (symbols || []).filter(canPlaceOnPlate).slice(0, 2);
  }

  function elementName(symbol) {
    const element = ELEMENTS[symbol];
    if (!element) {
      return symbol;
    }
    return ui.lang === "zh" ? element.nameZh : element.nameEn;
  }

  function t(key) {
    return TRANSLATIONS[ui.lang][key] || TRANSLATIONS.en[key] || key;
  }

  function prettyFormula(formula) {
    return String(formula || "").replace(/([A-Za-z)])(\d+)/g, "$1<sub>$2</sub>");
  }

  function stageTitleFor(state) {
    if (state.sample === "ironSulphur") {
      if (state.phase === "molten" && state.kind === "compound") {
        return t("stageIronMoltenCompound");
      }
      if (state.phase === "molten") {
        return t("stageIronMolten");
      }
      if (state.kind === "compound") {
        return t("stageIronCompound");
      }
      if (state.phase === "magnetSeparated") {
        return t("stageIronSeparated");
      }
      return t("stageIron");
    }
    if (state.sample === "sandWater") {
      if (state.phase === "molten") {
        return t("stageSandMolten");
      }
      if (demo.step === "filter-pour" || demo.step === "filter") {
        return t("stageSandFiltered");
      }
      if (state.phase === "decanted") {
        return t("stageSandDecanted");
      }
      if (state.phase === "filtered") {
        return t("stageSandFiltered");
      }
      return t("stageSand");
    }
    if (state.sample === "custom") {
      if (state.phase === "molten") {
        return t("stageCustomMolten");
      }
      if (state.phase === "magnetSeparated") {
        return t("stageCustomSeparated");
      }
      return t("stageCustom");
    }
    return t("stageIron");
  }

  function energyLabel(state) {
    if (state.energy.heat && state.energy.electricity) {
      return t("energyBoth");
    }
    if (state.energy.heat) {
      return t("energyHeat");
    }
    if (state.energy.electricity) {
      return t("energyElectricity");
    }
    return t("energyNone");
  }

  function kindLabel(kind) {
    return t(kind);
  }

  function resultLabel(outcome) {
    return t(outcome);
  }

  function applyI18n() {
    document.documentElement.lang = ui.lang === "zh" ? "zh-Hant" : "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === ui.lang);
    });
    document.title = ui.lang === "zh"
      ? "物理與化學分離 · Physical vs Chemical Separation"
      : "Physical vs Chemical Separation · 物理與化學分離";
    syncDescToggle();
  }

  function syncDescToggle() {
    document.body.classList.toggle("hide-descriptions", ui.hideDescriptions);
    const btn = document.getElementById("descToggle");
    if (!btn) return;
    const key = ui.hideDescriptions ? "showText" : "hideText";
    btn.setAttribute("data-i18n", key);
    btn.textContent = t(key);
    btn.setAttribute("aria-pressed", ui.hideDescriptions ? "true" : "false");
  }

  function seedParticles(state) {
    const current = state || snapshot;
    const dish = DOM.ironParticles;
    const cling = DOM.magnetCling;
    if (cling) {
      cling.replaceChildren();
    }
    if (!dish) {
      return;
    }
    dish.innerHTML = "";

    const spots = [
      [
        [18, 22], [38, 48], [62, 28], [74, 58], [28, 70],
        [50, 36], [12, 54], [80, 18], [44, 78], [66, 72]
      ],
      [
        [30, 18], [54, 22], [70, 40], [22, 40], [46, 56],
        [78, 64], [14, 76], [58, 80], [36, 32], [86, 46]
      ]
    ];

    current.components.forEach((component, index) => {
      if (component.location !== "dish" && component.location !== "magnetPile") {
        return;
      }
      const host = component.location === "magnetPile" && cling ? cling : dish;
      (spots[index] || spots[0]).forEach(([x, y], grainIndex) => {
        const grain = document.createElement("span");
        grain.className = "particle" + (component.magnetic ? " fe magnetic" : " s");
        grain.dataset.id = component.id;
        grain.style.left = component.location === "magnetPile" ? (grainIndex % 4) * 10 + "px" : x + "%";
        grain.style.top = component.location === "magnetPile" ? Math.floor(grainIndex / 4) * 9 + "px" : y + "%";
        grain.style.background = component.colour;
        if (component.location === "magnetPile") {
          grain.classList.add("is-attached");
        }
        host.appendChild(grain);
      });
    });
  }

  function seedSandGrains() {
    const bed = document.getElementById("sandGrains");
    bed.innerHTML = "";
    // Suspended mid-liquid only — no pre-settled bed look
    const spots = [
      [18, 18], [42, 14], [66, 22], [28, 32], [54, 28],
      [74, 36], [16, 44], [38, 48], [60, 42], [80, 26],
      [24, 24], [48, 38], [70, 16], [32, 12], [58, 20]
    ];
    spots.forEach(([x, y], index) => {
      const grain = document.createElement("span");
      const size = 0.72 + (index % 5) * 0.09;
      grain.className = "sand-grain";
      grain.style.left = x + "%";
      grain.style.top = y + "%";
      grain.style.transform = "scale(" + size.toFixed(2) + ")";
      grain.dataset.scale = String(size);
      // Larger grains rest lower / settle faster (Stokes-like)
      grain.dataset.rest = String(76 + (index % 5) * 2.4);
      bed.appendChild(grain);
    });
  }

  function render(state) {
    snapshot = state;
    document.body.dataset.sample = state.sample;
    document.body.dataset.phase = state.phase;
    document.body.dataset.kind = state.kind;

    document.querySelectorAll(".stage-tab").forEach((button) => {
      const active = button.dataset.sample === state.sample;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    document.querySelectorAll(".bench").forEach((bench) => {
      if (bench.classList.contains("bench-fe")) {
        bench.hidden = !isDishSample(state.sample);
        return;
      }
      bench.hidden = bench.dataset.sample !== state.sample;
    });

    document.getElementById("chipKindValue").textContent = kindLabel(state.kind);
    document.getElementById("chipBondedValue").textContent = state.bonded ? t("yes") : t("no");
    document.getElementById("chipEnergyValue").textContent = energyLabel(state);
    document.getElementById("chipResultValue").textContent = resultLabel(state.log.outcome);
    document.getElementById("stageTitle").textContent = stageTitleFor(state);
    document.getElementById("formulaBadge").innerHTML = prettyFormula(state.formula);

    const banner = document.getElementById("warningBanner");
    if (state.warning) {
      banner.hidden = false;
      document.getElementById("warningTitle").textContent = t(state.warning.titleKey);
      document.getElementById("warningBody").textContent = t(state.warning.bodyKey);
    } else {
      banner.hidden = true;
    }

    document.getElementById("liveCaption").textContent = t(state.log.captionKey);
    const equation = document.getElementById("equationLine");
    if (state.log.equation) {
      equation.hidden = false;
      equation.innerHTML = prettyFormula(state.log.equation);
    } else {
      equation.hidden = true;
    }

    renderTemp(state);
    renderMoltenPools(state);
    renderParticleLegend(state);
    renderDemoChip();
  }

  function componentLegendName(component) {
    if (ui.lang === "zh" && component.nameZh) {
      return component.nameZh;
    }
    if (component.nameEn) {
      return component.nameEn;
    }
    if (component.nameKey && TRANSLATIONS.en[component.nameKey]) {
      return t(component.nameKey);
    }
    return elementName(component.formula || component.id);
  }

  function renderParticleLegend(state) {
    const legend = DOM.particleLegend;
    if (!legend) {
      return;
    }
    if (!isDishSample(state.sample)) {
      legend.hidden = true;
      legend.replaceChildren();
      return;
    }
    legend.hidden = false;
    legend.replaceChildren();
    state.components.forEach(function (component) {
      const row = document.createElement("div");
      row.className = "legend-row";
      const swatch = document.createElement("span");
      swatch.className = "legend-swatch";
      swatch.style.background = component.colour || "#8a93a0";
      const label = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = componentLegendName(component);
      label.appendChild(name);
      label.appendChild(document.createTextNode(" (" + (component.formula || component.id) + ")"));
      row.appendChild(swatch);
      row.appendChild(label);
      legend.appendChild(row);
    });
  }

  function renderTemp(state, liveValue) {
    const readout = DOM.tempReadout;
    if (!readout) {
      return;
    }
    const value = typeof liveValue === "number" ? liveValue : (state.temperature || ROOM_TEMP);
    readout.hidden = false;
    readout.textContent = Math.round(value) + " °C";
  }

  function renderMoltenPools(state) {
    const pools = DOM.dishPools ? Array.from(DOM.dishPools.querySelectorAll(".molten-pool")) : [];
    pools.forEach((pool, index) => {
      const component = state.components[index];
      if (!component || state.phase !== "molten" || component.phase !== "liquid") {
        pool.classList.remove("is-visible");
        pool.style.background = "";
        return;
      }
      pool.style.background = component.colour;
      pool.classList.add("is-visible");
    });

    if (DOM.moltenSand) {
      const sand = state.components.find((item) => item.id === "sand");
      const show = state.sample === "sandWater" && state.phase === "molten" && sand && sand.phase === "liquid";
      DOM.moltenSand.classList.toggle("is-visible", !!show);
    }
  }

  function renderDemoChip() {
    const chip = document.getElementById("demoStepChip");
    const keyMap = {
      idle: "demoIdle",
      "magnet-approach": "demoMagnetApproach",
      "magnet-pull": "demoMagnetPull",
      "magnet-lift": "demoMagnetLift",
      "magnet-fail": "demoMagnetFail",
      settle: "demoSettle",
      pour: "demoPour",
      "filter-pour": "demoFilterPour",
      filter: "demoFilterDrip",
      heat: "demoHeatGlow",
      melt: "demoMelt"
    };
    chip.textContent = t(keyMap[demo.step] || "demoIdle");
  }

  function setDemoStep(step, captionKey) {
    demo.step = step;
    document.body.dataset.demo = step === "idle" ? "" : step;
    renderDemoChip();
    const heading = document.getElementById("stageTitle");
    if (heading) {
      heading.textContent = stageTitleFor(snapshot);
    }
    if (captionKey) {
      document.getElementById("liveCaption").textContent = t(captionKey);
    }
  }

  function setControlsLocked(locked) {
    document.querySelectorAll("[data-action], .stage-tab, #openTableBtn").forEach((button) => {
      button.disabled = locked;
    });
  }

  function wait(ms) {
    return new Promise((resolve) => {
      const timer = {
        id: 0,
        resolve: resolve
      };
      timer.id = window.setTimeout(function () {
        demo.timers = demo.timers.filter((item) => item !== timer);
        resolve();
      }, ms);
      demo.timers.push(timer);
    });
  }

  function animateFrames(duration, draw) {
    return new Promise((resolve) => {
      const startedAt = performance.now();
      const runId = demo.runId;
      const frame = {
        id: 0,
        done: false,
        cancel: function () {
          if (frame.done) {
            return;
          }
          frame.done = true;
          window.cancelAnimationFrame(frame.id);
          demo.frames = demo.frames.filter((item) => item !== frame);
          resolve(false);
        }
      };

      function tick(now) {
        if (frame.done || runId !== demo.runId) {
          frame.cancel();
          return;
        }
        const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
        draw(progress);
        if (progress >= 1) {
          frame.done = true;
          demo.frames = demo.frames.filter((item) => item !== frame);
          resolve(true);
          return;
        }
        frame.id = window.requestAnimationFrame(tick);
      }

      demo.frames.push(frame);
      frame.id = window.requestAnimationFrame(tick);
    });
  }

  function track(animation) {
    if (animation) {
      demo.animations.push(animation);
    }
    return animation;
  }

  function cancelDemo() {
    demo.runId += 1;
    demo.timers.forEach((timer) => {
      window.clearTimeout(timer.id);
      timer.resolve();
    });
    demo.timers = [];
    demo.frames.slice().forEach((frame) => frame.cancel());
    demo.frames = [];
    demo.animations.forEach((animation) => {
      if (animation && animation.cancel) {
        animation.cancel();
      }
    });
    demo.animations = [];
    demo.playing = false;
    demo.step = "idle";
    document.body.dataset.demo = "";
    document.body.dataset.heating = "false";
    document.body.classList.remove("is-dripping");
    const feBench = document.querySelector(".bench-fe");
    if (feBench) {
      feBench.classList.remove("is-heating");
    }
    setControlsLocked(false);
    applyPendingLanguage();
  }

  function demoKind(type, state) {
    if (type === "magnet" && isDishSample(state.sample) && state.kind === "compound") {
      return "magnetFail";
    }
    if (type === "magnet" && isDishSample(state.sample) && state.kind === "mixture" && state.phase !== "magnetSeparated") {
      const hasSolidMagnet = state.components.some((item) => item.magnetic && item.phase !== "liquid");
      return hasSolidMagnet ? "magnetPull" : "magnetFail";
    }
    if (type === "decant" && state.sample === "sandWater" && state.phase === "mixed") {
      return "decant";
    }
    if (type === "filter" && state.sample === "sandWater" && (state.phase === "mixed" || state.phase === "decanted")) {
      return "filter";
    }
    if (type === "heat" && state.sample === "ironSulphur" && state.kind === "mixture" && (state.phase === "mixed" || state.phase === "molten")) {
      return "heat";
    }
    if (type === "melt" && state.phase !== "molten" && state.sample !== "acidifiedWater") {
      return "melt";
    }
    return null;
  }

  function prepareMagnetPath() {
    const magnet = DOM.magnet;
    const cling = DOM.magnetCling;
    const dish = DOM.watchGlass;
    if (!magnet || !cling || !dish) {
      return;
    }
    const dishBox = dish.getBoundingClientRect();
    const clingBox = cling.getBoundingClientRect();
    if (!dishBox.width || !clingBox.width) {
      return;
    }

    const transform = window.getComputedStyle(magnet).transform;
    const matrix = transform === "none"
      ? new DOMMatrixReadOnly()
      : new DOMMatrixReadOnly(transform);
    const clingBaseCenter = {
      x: clingBox.left + clingBox.width / 2 - matrix.m41,
      y: clingBox.top + clingBox.height / 2 - matrix.m42
    };
    const target = {
      x: dishBox.right - dishBox.width * APPARATUS.magnet.targetInsetX,
      y: dishBox.top + dishBox.height * APPARATUS.magnet.targetInsetY
    };
    const approachX = target.x - clingBaseCenter.x;
    const approachY = target.y - clingBaseCenter.y;
    const liftX = approachX * APPARATUS.magnet.liftRatioX;
    const liftY = approachY - Math.max(
      30,
      dishBox.height * 0.23,
      APPARATUS.magnet.liftDistanceY
    );

    magnet.style.setProperty("--magnet-approach-x", approachX.toFixed(2) + "px");
    magnet.style.setProperty("--magnet-approach-y", approachY.toFixed(2) + "px");
    magnet.style.setProperty("--magnet-lift-x", liftX.toFixed(2) + "px");
    magnet.style.setProperty("--magnet-lift-y", liftY.toFixed(2) + "px");
  }

  function flyIronToMagnet() {
    const runId = demo.runId;
    const cling = DOM.magnetCling;
    const clingBox = cling.getBoundingClientRect();
    const grains = Array.from(DOM.ironParticles.querySelectorAll(".particle.magnetic, .particle.fe"));
    const ranked = grains.map((grain, index) => {
      const from = grain.getBoundingClientRect();
      const dx = clingBox.left + (index % 4) * 10 - from.left;
      const dy = clingBox.top + Math.floor(index / 4) * 9 - from.top;
      const dist = Math.hypot(dx, dy);
      return { grain, dx, dy, dist, index };
    }).sort((a, b) => a.dist - b.dist);

    return Promise.all(ranked.map((item, order) => {
      const midX = item.dx * 0.45;
      const midY = item.dy * 0.45 - 18 - (order % 3) * 4;
      const animation = item.grain.animate(
        [
          { transform: "translate(0px, 0px)" },
          { transform: "translate(" + midX + "px, " + midY + "px)", offset: 0.42 },
          { transform: "translate(" + item.dx + "px, " + item.dy + "px)" }
        ],
        {
          duration: MOTION.magnetPull,
          delay: order * MOTION.magnetStagger,
          fill: "forwards",
          easing: MOTION.easeOut
        }
      );
      track(animation);
      return animation.finished.catch(function () {});
    })).then(function () {
      if (runId !== demo.runId || demo.step !== "magnet-pull") {
        return;
      }
      ranked.forEach((item) => {
        item.grain.getAnimations().forEach((animation) => animation.cancel());
        item.grain.style.left = (item.index % 4) * 10 + "px";
        item.grain.style.top = Math.floor(item.index / 4) * 9 + "px";
        item.grain.style.transform = "none";
        item.grain.classList.add("is-attached");
        cling.appendChild(item.grain);
      });
    });
  }

  function resetSandTransforms() {
    const source = DOM.sourceBeaker;
    const liquid = DOM.liquidLayer;
    const stream = DOM.stream;
    const rod = DOM.decantRod;
    [source, liquid, stream, rod].forEach((node) => {
      if (!node) {
        return;
      }
      node.getAnimations().forEach((animation) => animation.cancel());
      node.style.transform = "";
    });
    if (stream) {
      stream.style.height = "0px";
      stream.style.width = "";
      stream.style.opacity = "0";
      stream.style.left = "0px";
      stream.style.top = "0px";
    }
    if (rod) {
      rod.classList.remove("is-active");
      rod.style.height = "";
      rod.style.left = "";
      rod.style.top = "";
      rod.style.opacity = "";
    }
    const filtrate = document.querySelector(".filtrate-water");
    const residue = document.querySelector(".residue-pile");
    const sandBed = document.querySelector(".source-beaker .sand-bed");
    [DOM.sourceWater, DOM.receiverWater, filtrate].forEach((water) => {
      if (!water) {
        return;
      }
      water.getAnimations().forEach((animation) => animation.cancel());
      water.style.height = "";
      water.style.clipPath = "";
      water.style.transform = "";
    });
    if (sandBed) {
      sandBed.style.height = "";
    }
    if (residue) {
      residue.style.height = "";
      residue.style.opacity = "";
    }
    document.querySelectorAll("#sandGrains .sand-grain").forEach((grain) => {
      grain.getAnimations().forEach((animation) => animation.cancel());
      grain.style.opacity = "";
      grain.style.visibility = "";
    });
    document.body.classList.remove("is-dripping");
  }

  function easeToRest(el) {
    if (!el) {
      return;
    }
    const current = window.getComputedStyle(el).transform;
    el.getAnimations().forEach((animation) => animation.cancel());
    if (!current || current === "none") {
      el.style.transform = "";
      return;
    }
    const anim = track(el.animate(
      [
        { transform: current },
        { transform: "none" }
      ],
      { duration: MOTION.easeRest, fill: "forwards", easing: MOTION.easeOut }
    ));
    anim.finished.then(function () {
      el.style.transform = "";
    }).catch(function () {});
  }

  function endPourGently() {
    const source = DOM.sourceBeaker;
    const liquid = DOM.liquidLayer;
    const stream = DOM.stream;
    if (stream) {
      stream.getAnimations().forEach((animation) => animation.cancel());
      stream.style.height = "0px";
      stream.style.opacity = "0";
      stream.style.transform = "";
    }
    easeToRest(source);
    easeToRest(liquid);
  }

  function placeVerticalStream(fromEl, toEl) {
    const wrap = document.querySelector(".bench-sand");
    const stream = document.getElementById("lipStream");
    if (!wrap || !stream || !fromEl || !toEl) {
      return Promise.resolve();
    }
    const wrapBox = wrap.getBoundingClientRect();
    const from = fromEl.getBoundingClientRect();
    const to = toEl.getBoundingClientRect();
    const x = from.left + from.width / 2 - wrapBox.left - 4;
    const y = from.bottom - wrapBox.top - 2;
    const height = Math.max(14, to.top - y + 4);
    stream.style.left = x + "px";
    stream.style.top = y + "px";
    stream.style.opacity = "1";
    stream.style.width = "7px";
    stream.style.transform = "none";

    const grow = stream.animate(
      [
        { height: "0px", opacity: 0.35, offset: 0 },
        { height: height + "px", opacity: 1, offset: 0.28 },
        { height: height + "px", opacity: 0.85, offset: 0.72 },
        { height: height + "px", opacity: 0.55, offset: 1 }
      ],
      { duration: MOTION.streamGrow + MOTION.streamHold, fill: "forwards", easing: MOTION.easeInOut }
    );
    track(grow);

    const pulse = stream.animate(
      [
        { width: "6px" },
        { width: "9px" },
        { width: "6px" }
      ],
      {
        duration: 420,
        iterations: Math.max(2, Math.round(MOTION.streamHold / 420)),
        delay: MOTION.streamGrow * 0.35,
        easing: MOTION.easeInOut
      }
    );
    track(pulse);

    return grow.finished.catch(function () {});
  }

  function positionGuideLine(element, from, to, wrapBox) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;
    const transform = "rotate(" + angle + "deg)";

    element.style.left = (from.x - wrapBox.left) + "px";
    element.style.top = (from.y - wrapBox.top) + "px";
    element.style.height = length + "px";
    element.style.transform = transform;
  }

  function preparePourGeometry(target, config) {
    const wrap = DOM.sandBench;
    const source = DOM.sourceBeaker;
    const sourceLip = DOM.sourceLip;
    const rod = DOM.decantRod;
    const stream = DOM.stream;
    if (!wrap || !source || !sourceLip || !target || !rod || !stream || !config) {
      return null;
    }

    const wrapBox = wrap.getBoundingClientRect();
    const sourceBox = source.getBoundingClientRect();
    const lipBox = sourceLip.getBoundingClientRect();
    const receiverBox = target.getBoundingClientRect();
    const transformOrigin = window.getComputedStyle(source).transformOrigin
      .split(" ")
      .map((value) => parseFloat(value));
    const pivot = {
      x: sourceBox.left + transformOrigin[0],
      y: sourceBox.top + transformOrigin[1]
    };
    const lipStart = {
      x: lipBox.left + lipBox.width / 2,
      y: lipBox.top + lipBox.height / 2
    };
    const receiverContact = {
      x: receiverBox.left + receiverBox.width * config.receiverInsetX,
      y: receiverBox.top + receiverBox.height * config.receiverInsetY
    };
    const lipContact = {
      x: receiverContact.x - sourceBox.width * config.rodOffsetX,
      y: receiverContact.y - sourceBox.height * config.rodOffsetY
    };
    positionGuideLine(rod, lipContact, receiverContact, wrapBox);

    stream.style.width = "4px";
    stream.style.height = "0px";
    stream.style.opacity = "0";
    rod.style.opacity = "0";
    rod.classList.add("is-active");

    return {
      dx: lipContact.x - lipStart.x,
      dy: lipContact.y - lipStart.y,
      pivot: pivot,
      lipOffset: {
        x: lipStart.x - pivot.x,
        y: lipStart.y - pivot.y
      },
      receiverContact: receiverContact,
      wrapBox: wrapBox
    };
  }

  function prepareDecantGeometry() {
    return preparePourGeometry(DOM.receiverBeaker, APPARATUS.decant);
  }

  function clampedDepthIntegral(depth) {
    if (depth <= 0) {
      return 0;
    }
    if (depth < 100) {
      return depth * depth / 2;
    }
    return 100 * depth - 5000;
  }

  function fluidPolygon(angle, fillPercent, source) {
    const width = source.clientWidth || 148;
    const height = source.clientHeight || 210;
    const delta = Math.tan(angle * Math.PI / 180) * width / height * 100;

    const visibleVolume = (leftY) => {
      const startDepth = 100 - leftY;
      const endDepth = startDepth + delta;
      if (Math.abs(delta) < 0.0001) {
        return Math.max(0, Math.min(100, startDepth));
      }
      return (clampedDepthIntegral(endDepth) - clampedDepthIntegral(startDepth)) / delta;
    };

    let low = -100 - Math.abs(delta);
    let high = 200 + Math.abs(delta);
    for (let index = 0; index < 28; index += 1) {
      const middle = (low + high) / 2;
      if (visibleVolume(middle) > fillPercent) {
        low = middle;
      } else {
        high = middle;
      }
    }
    const leftY = (low + high) / 2;
    const rightY = leftY - delta;
    return "polygon(0% " + leftY.toFixed(2) + "%, 100% " + rightY.toFixed(2) +
      "%, 100% 100%, 0% 100%)";
  }

  function smoothStep(value) {
    const progress = Math.min(1, Math.max(0, value));
    return progress * progress * (3 - 2 * progress);
  }

  function smootherStep(value) {
    const progress = Math.min(1, Math.max(0, value));
    return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
  }

  function setApparatusPose(element, x, y, angle) {
    element.style.transform = "translate3d(" + x.toFixed(2) + "px, " +
      y.toFixed(2) + "px, 0) rotate(" + angle.toFixed(2) + "deg)";
  }

  function placePourStream(stream, geometry, translateX, translateY, angle, strength) {
    if (!stream || !geometry) {
      return;
    }
    const radians = angle * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const from = {
      x: geometry.pivot.x + translateX +
        geometry.lipOffset.x * cos - geometry.lipOffset.y * sin,
      y: geometry.pivot.y + translateY +
        geometry.lipOffset.x * sin + geometry.lipOffset.y * cos
    };
    positionGuideLine(stream, from, geometry.receiverContact, geometry.wrapBox);
    stream.style.width = (2.2 + strength * 3.8).toFixed(2) + "px";
    stream.style.opacity = (strength * 0.9).toFixed(3);
  }

  async function playBeakerPour(options) {
    const source = DOM.sourceBeaker;
    const sourceWater = options.sourceWater;
    const receiverWater = options.receiverWater;
    const rod = DOM.decantRod;
    const stream = DOM.stream;
    const geometry = options.geometry;
    if (!source || !sourceWater || !receiverWater || !rod || !stream || !geometry) {
      return;
    }

    const tipAngle = options.tipAngle;
    const flowAngle = options.flowAngle;
    const sourceStartFill = options.sourceStartFill;
    const sourceEndFill = options.sourceEndFill;
    const receiverEndFill = options.receiverEndFill;
    const onFlow = options.onFlow;
    sourceWater.style.height = "100%";
    sourceWater.style.clipPath = fluidPolygon(0, sourceStartFill, source);
    receiverWater.style.height = receiverEndFill + "%";
    receiverWater.style.transform = "scaleY(0)";

    let completed = await animateFrames(MOTION.decantPosition, function (progress) {
      const eased = smootherStep(progress);
      const lift = Math.sin(Math.PI * eased) * 16;
      setApparatusPose(
        source,
        geometry.dx * eased,
        geometry.dy * eased - lift,
        0
      );
      rod.style.opacity = (0.82 * eased).toFixed(3);
    });
    if (!completed) {
      return;
    }

    completed = await animateFrames(MOTION.decantTip, function (progress) {
      const angle = tipAngle * smootherStep(progress);
      setApparatusPose(source, geometry.dx, geometry.dy, angle);
      sourceWater.style.clipPath = fluidPolygon(angle, sourceStartFill, source);
    });
    if (!completed) {
      return;
    }

    completed = await animateFrames(MOTION.decantFlow, function (progress) {
      const angleProgress = smoothStep(progress / 0.3);
      const angle = tipAngle + (flowAngle - tipAngle) * angleProgress;
      const transferred = smootherStep(progress);
      const sourceFill = sourceStartFill -
        (sourceStartFill - sourceEndFill) * transferred;
      const startFlow = smoothStep(progress / 0.12);
      const endFlow = 1 - smoothStep((progress - 0.78) / 0.22);
      const pulse = 0.96 + Math.sin(progress * Math.PI * 10) * 0.04;
      const streamStrength = Math.max(0, startFlow * endFlow * pulse);

      setApparatusPose(source, geometry.dx, geometry.dy, angle);
      sourceWater.style.clipPath = fluidPolygon(angle, sourceFill, source);
      receiverWater.style.transform = "scaleY(" + transferred.toFixed(4) + ")";
      placePourStream(
        stream,
        geometry,
        geometry.dx,
        geometry.dy,
        angle,
        streamStrength
      );
      if (typeof onFlow === "function") {
        onFlow(progress, transferred);
      }
    });
    if (!completed) {
      return;
    }

    sourceWater.style.clipPath = fluidPolygon(flowAngle, sourceEndFill, source);
    receiverWater.style.transform = "scaleY(1)";
    placePourStream(stream, geometry, geometry.dx, geometry.dy, flowAngle, 0);

    completed = await animateFrames(MOTION.decantUpright, function (progress) {
      const angle = flowAngle * (1 - smootherStep(progress));
      setApparatusPose(source, geometry.dx, geometry.dy, angle);
      sourceWater.style.clipPath = fluidPolygon(angle, sourceEndFill, source);
    });
    if (!completed) {
      return;
    }

    completed = await animateFrames(MOTION.decantReturn, function (progress) {
      const eased = smootherStep(progress);
      const remaining = 1 - eased;
      const lift = Math.sin(Math.PI * eased) * 10;
      setApparatusPose(
        source,
        geometry.dx * remaining,
        geometry.dy * remaining - lift,
        0
      );
      rod.style.opacity = (0.82 * remaining).toFixed(3);
    });
    if (!completed) {
      return;
    }

    source.style.transform = "";
    rod.style.opacity = "0";
    stream.style.height = "0px";
    stream.style.opacity = "0";
  }

  async function playDecantPour() {
    await playBeakerPour({
      geometry: prepareDecantGeometry(),
      sourceWater: DOM.sourceWater,
      receiverWater: DOM.receiverWater,
      tipAngle: APPARATUS.decant.tipAngle,
      flowAngle: APPARATUS.decant.flowAngle,
      sourceStartFill: APPARATUS.decant.sourceStartFill,
      sourceEndFill: APPARATUS.decant.sourceEndFill,
      receiverEndFill: APPARATUS.decant.receiverEndFill
    });
  }

  async function playFilterPour() {
    const funnel = document.getElementById("funnelMouth");
    const filtrate = document.querySelector(".filtrate-water");
    const residue = document.querySelector(".residue-pile");
    const sandBed = document.querySelector(".source-beaker .sand-bed");
    const geometry = preparePourGeometry(funnel, APPARATUS.filter);
    if (!funnel || !filtrate || !geometry) {
      return;
    }

    if (residue) {
      residue.style.height = "0px";
      residue.style.opacity = "0";
    }
    if (sandBed) {
      sandBed.style.height = "28%";
    }

    const startFill = snapshot.phase === "decanted"
      ? 10
      : APPARATUS.filter.sourceStartFill;
    const dripPromise = wait(MOTION.decantPosition + MOTION.decantTip).then(function () {
      return playFiniteDrips();
    });
    await playBeakerPour({
      geometry: geometry,
      sourceWater: DOM.sourceWater,
      receiverWater: filtrate,
      tipAngle: APPARATUS.filter.tipAngle,
      flowAngle: APPARATUS.filter.flowAngle,
      sourceStartFill: startFill,
      sourceEndFill: APPARATUS.filter.sourceEndFill,
      receiverEndFill: APPARATUS.filter.receiverEndFill,
      onFlow: function (progress, transferred) {
        if (residue) {
          residue.style.height = (22 * transferred).toFixed(1) + "px";
          residue.style.opacity = transferred.toFixed(3);
        }
        if (sandBed) {
          sandBed.style.height = (28 * (1 - transferred)).toFixed(2) + "%";
        }
      }
    });
    await dripPromise;
  }

  function settleSand() {
    const host = document.getElementById("sandGrains");
    const hostHeight = host ? host.getBoundingClientRect().height : 100;
    const grains = Array.from(document.querySelectorAll("#sandGrains .sand-grain"));

    return Promise.all(grains.map((grain, index) => {
      const scale = Number(grain.dataset.scale || 1);
      const rest = Number(grain.dataset.rest || 80);
      const start = parseFloat(grain.style.top) || 20;
      const dropPx = (hostHeight * (rest - start)) / 100;
      // Larger grains settle faster (shorter duration)
      const duration = MOTION.settleBase + MOTION.settleSpread * (1.15 - scale) + (index % 3) * 40;
      const drift = ((index % 5) - 2) * 3.5;
      const animation = grain.animate(
        [
          { transform: "translate(0px, 0px) scale(" + scale + ")", offset: 0 },
          {
            transform: "translate(" + (drift * 0.4) + "px, " + (dropPx * 0.55) + "px) scale(" + scale + ")",
            offset: 0.55
          },
          { transform: "translate(" + drift + "px, " + dropPx + "px) scale(" + scale + ")", offset: 1 }
        ],
        {
          duration: duration,
          delay: index * MOTION.settleStagger,
          fill: "forwards",
          easing: MOTION.easeIn
        }
      );
      track(animation);
      return animation.finished.then(function () {
        grain.style.top = rest + "%";
        grain.style.left = (parseFloat(grain.style.left) + drift * 0.08) + "%";
        grain.style.transform = "scale(" + scale + ")";
        grain.getAnimations().forEach((a) => a.cancel());
      }).catch(function () {});
    })).then(function () {
      // Bed reads as the sediment pile; hide discrete grains after they merge
      grains.forEach((grain, index) => {
        const fade = grain.animate(
          [
            { opacity: 1 },
            { opacity: 0 }
          ],
          {
            duration: 380,
            delay: index * 18,
            fill: "forwards",
            easing: MOTION.easeOut
          }
        );
        track(fade);
      });
      return wait(420);
    });
  }

  function transferSandToResidue() {
    const grains = Array.from(document.querySelectorAll("#sandGrains .sand-grain"));
    const residue = document.querySelector(".residue-pile");
    if (!residue || !grains.length) {
      return Promise.resolve();
    }
    const to = residue.getBoundingClientRect();

    return Promise.all(grains.map((grain, index) => {
      grain.getAnimations().forEach((animation) => animation.cancel());
      grain.style.opacity = "1";
      grain.style.visibility = "visible";
      const from = grain.getBoundingClientRect();
      const dx = to.left + to.width / 2 - from.left - from.width / 2 + ((index % 5) - 2) * 4;
      const dy = to.top + 6 - from.top + Math.floor(index / 5) * 3;
      const scale = Number(grain.dataset.scale || 1);
      const animation = grain.animate(
        [
          { transform: "translate(0px, 0px) scale(" + scale + ")", opacity: 1, offset: 0 },
          {
            transform: "translate(" + (dx * 0.55) + "px, " + (dy * 0.35 - 24) + "px) scale(" + scale + ")",
            opacity: 1,
            offset: 0.45
          },
          {
            transform: "translate(" + dx + "px, " + dy + "px) scale(" + (scale * 0.55) + ")",
            opacity: 0,
            offset: 1
          }
        ],
        {
          duration: MOTION.filterGrain,
          delay: index * 36,
          fill: "forwards",
          easing: MOTION.easeInOut
        }
      );
      track(animation);
      return animation.finished.catch(function () {});
    }));
  }

  function playFiniteDrips() {
    const drips = Array.from(document.querySelectorAll(".drip-stack .drip"));
    document.body.classList.add("is-dripping");
    return Promise.all(drips.map((drip, index) => {
      const animation = drip.animate(
        [
          { transform: "translateY(0)", opacity: 0, offset: 0 },
          { transform: "translateY(4px)", opacity: 1, offset: 0.18 },
          { transform: "translateY(28px)", opacity: 0, offset: 1 }
        ],
        {
          duration: MOTION.dripCycle,
          delay: index * 220,
          iterations: MOTION.dripRepeats,
          easing: MOTION.easeIn
        }
      );
      track(animation);
      return animation.finished.catch(function () {});
    })).then(function () {
      document.body.classList.remove("is-dripping");
    });
  }

  function markGrainsSettledVisually() {
    const grains = Array.from(document.querySelectorAll("#sandGrains .sand-grain"));
    grains.forEach((grain) => {
      const rest = Number(grain.dataset.rest || 80);
      const scale = Number(grain.dataset.scale || 1);
      grain.getAnimations().forEach((a) => a.cancel());
      grain.style.top = rest + "%";
      grain.style.transform = "scale(" + scale + ")";
      grain.style.opacity = "0";
    });
  }

  async function playDemo(kind) {
    if (kind === "magnetPull") {
      prepareMagnetPath();
      setDemoStep("magnet-approach", "demoMagnetApproach");
      await wait(MOTION.magnetApproach);
      setDemoStep("magnet-pull", snapshot.sample === "custom" ? "captionMagnetCustom" : "captionMagnetSuccess");
      await flyIronToMagnet();
      setDemoStep("magnet-lift", "demoMagnetLift");
      await wait(MOTION.magnetLift);
      return;
    }
    if (kind === "magnetFail") {
      prepareMagnetPath();
      setDemoStep(
        "magnet-fail",
        snapshot.phase === "molten" ? "noteMoltenMagnetCurie" : "demoMagnetFail"
      );
      await wait(MOTION.magnetFail);
      return;
    }
    if (kind === "decant") {
      setDemoStep("settle", "captionSettle");
      await settleSand();
      await wait(MOTION.settlePause);
      setDemoStep("pour", "captionPour");
      // Allow the receiver and guide-rod layout to become measurable.
      await wait(90);
      await playDecantPour();
      return;
    }
    if (kind === "filter") {
      const needsSettle = snapshot.phase === "mixed";
      if (needsSettle) {
        setDemoStep("settle", "captionSettle");
        await settleSand();
        await wait(MOTION.settlePause);
      } else {
        markGrainsSettledVisually();
      }
      setDemoStep("filter-pour", "captionFilterStep");
      await wait(90);
      await playFilterPour();
      setDemoStep("filter", "captionFilterStep");
      return;
    }
    if (kind === "heat") {
      document.body.dataset.heating = "true";
      const feBench = document.querySelector(".bench-fe");
      if (feBench) {
        feBench.classList.add("is-heating");
      }
      setDemoStep("heat", "demoHeatGlow");
      await wait(MOTION.heat);
      return;
    }
    if (kind === "melt") {
      document.body.dataset.heating = "true";
      const feBench = document.querySelector(".bench-fe");
      if (feBench && isDishSample(snapshot.sample)) {
        feBench.classList.add("is-heating");
      }
      setDemoStep("melt", "demoMelt");
      const start = ROOM_TEMP;
      const components = snapshot.components.slice();
      const target = Math.max.apply(null, [start].concat(components.map(function (item) {
        return typeof item.meltingPoint === "number" ? item.meltingPoint : start;
      })));
      await animateFrames(MOTION.melt, function (progress) {
        const temp = start + (target - start) * progress;
        renderTemp(snapshot, temp);
        components.forEach(function (component, index) {
          if (typeof component.meltingPoint !== "number" || temp < component.meltingPoint) {
            return;
          }
          const pool = document.querySelector('#dishPools .molten-pool[data-pool="' + index + '"]');
          if (pool) {
            pool.style.background = component.colour;
            pool.classList.add("is-visible");
          }
          if (component.id === "sand" && DOM.moltenSand) {
            DOM.moltenSand.classList.add("is-visible");
          }
        });
      });
      return;
    }
  }

  function commit(action) {
    const next = lab.dispatch(action);
    applyI18n();
    render(next);
  }

  async function handleAction(type) {
    if (demo.playing) {
      return;
    }
    const kind = demoKind(type, snapshot);
    if (!kind) {
      commit({ type: type });
      return;
    }
    demo.playing = true;
    const runId = ++demo.runId;
    setControlsLocked(true);
    try {
      await playDemo(kind);
      if (runId !== demo.runId) {
        return;
      }
      // Commit while demo heights still match final phase CSS — then ease beaker upright
      commit({ type: type });
      if (kind === "decant" || kind === "filter") {
        const sourceWater = document.querySelector(".source-beaker .sand-water");
        const receiverWater = document.querySelector(kind === "filter" ? ".filtrate-water" : ".poured-water");
        const sandBed = document.querySelector(".source-beaker .sand-bed");
        const residue = document.querySelector(".residue-pile");
        if (sourceWater) {
          sourceWater.style.height = "";
          sourceWater.style.clipPath = "";
        }
        if (receiverWater) {
          receiverWater.style.height = "";
          receiverWater.style.transform = "";
        }
        if (kind === "filter" && sandBed) {
          sandBed.style.height = "";
        }
        if (kind === "filter" && residue) {
          residue.style.height = "";
          residue.style.opacity = "";
        }
      }
      document.body.dataset.demo = "";
      demo.step = "idle";
      endPourGently();
      await wait(MOTION.easeRest);
    } finally {
      if (runId !== demo.runId) {
        return;
      }
      demo.playing = false;
      demo.step = "idle";
      document.body.dataset.demo = "";
      document.body.dataset.heating = "false";
      document.body.classList.remove("is-dripping");
      const feBench = document.querySelector(".bench-fe");
      if (feBench) {
        feBench.classList.remove("is-heating");
      }
      setControlsLocked(false);
      renderDemoChip();
      applyPendingLanguage();
    }
  }

  function resetLab() {
    cancelDemo();
    resetSandTransforms();
    commit({ type: "reset" });
    seedParticles(snapshot);
    seedSandGrains();
    renderDemoChip();
  }

  function loadPreset(sample) {
    cancelDemo();
    resetSandTransforms();
    commit({ type: "loadSample", sample: sample });
    seedParticles(snapshot);
    seedSandGrains();
  }

  function updatePickChips() {
    ["pickedA", "pickedB"].forEach(function (id, index) {
      const chip = document.getElementById(id);
      if (!chip) {
        return;
      }
      const strong = chip.querySelector("strong");
      const symbol = picks[index];
      if (!strong) {
        return;
      }
      if (!symbol || !ELEMENTS[symbol]) {
        strong.textContent = "—";
        return;
      }
      const element = ELEMENTS[symbol];
      strong.textContent = symbol + " · " + elementName(symbol) + " · " + element.mp + " °C";
    });
    if (DOM.applyPair) {
      DOM.applyPair.disabled = picks.length !== 2;
    }
    if (DOM.periodicGrid) {
      DOM.periodicGrid.querySelectorAll(".pt-cell").forEach(function (cell) {
        cell.classList.toggle("is-picked", picks.indexOf(cell.dataset.symbol) !== -1);
      });
    }
  }

  function togglePick(symbol) {
    if (!canPlaceOnPlate(symbol)) {
      return;
    }
    const index = picks.indexOf(symbol);
    if (index !== -1) {
      picks.splice(index, 1);
    } else if (picks.length < 2) {
      picks.push(symbol);
    } else {
      picks[1] = symbol;
    }
    updatePickChips();
  }

  function buildPeriodicTable() {
    const grid = DOM.periodicGrid;
    if (!grid) {
      return;
    }
    grid.innerHTML = "";
    PERIODIC_LAYOUT.forEach(function (cell) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pt-cell";
      button.style.gridColumn = String(cell.group);
      button.style.gridRow = String(cell.period);
      button.dataset.symbol = cell.symbol;
      const data = ELEMENTS[cell.symbol];
      const placeable = !!(data && canPlaceOnPlate(cell.symbol));
      button.disabled = !placeable;
      button.innerHTML = "<small>" + cell.z + "</small><strong>" + cell.symbol + "</strong>";
      if (placeable) {
        button.title = data.nameEn + " / " + data.nameZh + " · " + data.mp + " °C";
        button.addEventListener("click", function () {
          togglePick(cell.symbol);
        });
      } else if (data && data.roomState === "gas") {
        button.title = data.nameEn + " / " + data.nameZh + " · gas (not for the watch glass)";
      }
      grid.appendChild(button);
    });
  }

  function openPeriodicDialog() {
    const leftover = platePair(picks.length ? picks : (snapshot.customElements || lastCustom));
    picks.splice(0, picks.length);
    leftover.forEach(function (symbol) {
      picks.push(symbol);
    });
    updatePickChips();
    applyI18n();
    if (DOM.periodicDialog && typeof DOM.periodicDialog.showModal === "function") {
      DOM.periodicDialog.showModal();
    }
  }

  function applyCustomPair() {
    const pair = platePair(picks);
    if (pair.length !== 2) {
      return;
    }
    cancelDemo();
    resetSandTransforms();
    lastCustom = pair;
    picks.splice(0, picks.length, pair[0], pair[1]);
    commit({ type: "loadSample", sample: "custom", elements: lastCustom });
    seedParticles(snapshot);
    seedSandGrains();
  }

  function switchLanguage(lang) {
    if (demo.playing) {
      ui.pendingLang = lang;
      return;
    }
    ui.lang = lang;
    applyI18n();
    render(snapshot);
    updatePickChips();
  }

  function applyPendingLanguage() {
    if (!ui.pendingLang || demo.playing) {
      return;
    }
    const lang = ui.pendingLang;
    ui.pendingLang = null;
    switchLanguage(lang);
  }

  let resizeTimer = 0;
  let viewportWidth = window.innerWidth;
  function handleViewportChange() {
    if (Math.abs(window.innerWidth - viewportWidth) < 1) {
      return;
    }
    viewportWidth = window.innerWidth;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (demo.playing) {
        resetLab();
        return;
      }
      prepareMagnetPath();
    }, 140);
  }

  seedParticles(snapshot);
  seedSandGrains();
  buildPeriodicTable();
  applyI18n();
  render(snapshot);
  prepareMagnetPath();

  document.querySelectorAll(".stage-tab").forEach((button) => {
    button.addEventListener("click", () => {
      if (demo.playing) {
        return;
      }
      if (button.dataset.sample === "custom") {
        const saved = platePair(lastCustom);
        if (saved.length === 2) {
          cancelDemo();
          resetSandTransforms();
          lastCustom = saved;
          commit({ type: "loadSample", sample: "custom", elements: lastCustom });
          seedParticles(snapshot);
          seedSandGrains();
          return;
        }
        lastCustom = null;
        openPeriodicDialog();
        return;
      }
      loadPreset(button.dataset.sample);
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleAction(button.dataset.action);
    });
  });

  document.getElementById("resetButton").addEventListener("click", resetLab);

  const openTableBtn = document.getElementById("openTableBtn");
  if (openTableBtn) {
    openTableBtn.addEventListener("click", function () {
      if (demo.playing) {
        return;
      }
      openPeriodicDialog();
    });
  }

  const clearPicks = document.getElementById("clearPicks");
  if (clearPicks) {
    clearPicks.addEventListener("click", function () {
      picks.splice(0, picks.length);
      updatePickChips();
    });
  }

  if (DOM.periodicDialog) {
    DOM.periodicDialog.addEventListener("close", function () {
      if (DOM.periodicDialog.returnValue === "apply") {
        applyCustomPair();
      }
    });
  }

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => switchLanguage(button.dataset.lang));
  });

  const descToggle = document.getElementById("descToggle");
  if (descToggle) {
    descToggle.addEventListener("click", () => {
      ui.hideDescriptions = !ui.hideDescriptions;
      syncDescToggle();
    });
  }

  window.addEventListener("resize", handleViewportChange, { passive: true });
  window.addEventListener("orientationchange", handleViewportChange, { passive: true });
})();
