const STORAGE_KEY = "name-that-piece-v2";

const NOTES_DIAGRAMS = [
  "beaker", "test-tube", "measuring-cylinder", "filter-funnel", "conical-flask",
  "round-bottomed-flask", "evaporating-dish", "watch-glass", "wire-gauze",
  "bunsen-burner", "tripod", "dropper", "glass-rod", "thermometer", "crucible",
];

const APPARATUS = [
  { id: "beaker", name: "Beaker", zh: "燒杯", easy: "A glass cup for holding, mixing, or heating a larger amount of liquid.", easyZh: "用來盛載、混合或加熱較多液體的玻璃杯。", exam: "Contains / mixes solutions; boils about 200 cm³ of water.", examZh: "盛載／混合溶液；把約 200 cm³ 水煮沸。", photo: true, diagram: true, similar: ["conical-flask", "measuring-cylinder", "crucible", "round-bottomed-flask"] },
  { id: "test-tube", name: "Test tube", zh: "試管", easy: "A small glass tube for a little liquid or a small reaction.", easyZh: "盛少量液體或進行小反應的小玻璃管。", exam: "Mixes solutions to observe changes; heats a few cm³ of liquid.", examZh: "混合溶液以觀察變化；加熱數 cm³ 液體。", photo: true, diagram: true, similar: ["measuring-cylinder", "dropper", "conical-flask", "glass-rod"] },
  { id: "conical-flask", name: "Conical flask", zh: "錐形瓶", easy: "Wide bottom, narrow neck — easy to swirl without spilling.", easyZh: "底闊頸窄，搖動時不易濺出。", exam: "Contains a solution that is shaken or swirled.", examZh: "盛載需要搖動或旋動的溶液。", photo: true, diagram: true, similar: ["beaker", "round-bottomed-flask", "filter-funnel", "measuring-cylinder"] },
  { id: "filter-funnel", name: "Filter funnel", zh: "漏斗", easy: "A cone that holds filter paper to separate solid from liquid.", easyZh: "圓錐形，放濾紙以分開固體和液體。", exam: "Filters a suspension.", examZh: "過濾懸濁液。", photo: true, diagram: true, similar: ["conical-flask", "dropper", "measuring-cylinder", "round-bottomed-flask"] },
  { id: "glass-rod", name: "Glass rod", zh: "玻璃棒", easy: "A stick for stirring, or for pouring liquid onto filter paper.", easyZh: "用來攪拌，或把液體引到濾紙上。", exam: "Stirs a mixture; guides liquid onto filter paper.", examZh: "攪拌混合物；把液體引到濾紙上。", photo: true, diagram: true, similar: ["thermometer", "dropper", "spatula", "test-tube"] },
  { id: "dropper", name: "Dropper", zh: "滴管", easy: "Adds liquid one drop at a time.", easyZh: "每次加入一滴液體。", exam: "Adds drop quantities of a liquid.", examZh: "逐滴加入液體。", photo: true, diagram: true, similar: ["glass-rod", "thermometer", "test-tube", "filter-funnel"] },
  { id: "tripod", name: "Tripod", zh: "三腳架", easy: "A three-legged stand that sits over a Bunsen burner.", easyZh: "三腳支架，放在本生燈上方。", exam: "Supports a wire gauze or pipe-clay triangle over a Bunsen burner.", examZh: "在本生燈上承托鐵絲網或泥三角。", photo: true, diagram: true, similar: ["stand-and-clamp", "wire-gauze", "bunsen-burner", "heat-proof-mat"] },
  { id: "wire-gauze", name: "Wire gauze", zh: "鐵絲網", easy: "Metal mesh that spreads heat under a beaker.", easyZh: "金屬網，把熱力均勻傳到燒杯底部。", exam: "Supports a beaker or evaporating dish on a tripod while heating.", examZh: "加熱時在三腳架上承托燒杯或蒸發皿。", photo: true, diagram: true, similar: ["tripod", "watch-glass", "evaporating-dish", "heat-proof-mat"] },
  { id: "evaporating-dish", name: "Evaporating dish", zh: "蒸發皿", easy: "A shallow dish. Heat a solution until only solid is left.", easyZh: "淺碟。加熱溶液直至只剩下固體。", exam: "Contains a solution which is to be evaporated to dryness.", examZh: "盛載溶液並蒸發至乾。", photo: true, diagram: true, similar: ["watch-glass", "crucible", "beaker", "wire-gauze"] },
  { id: "bunsen-burner", name: "Bunsen burner", zh: "本生燈", easy: "Makes a flame for heating. Stand it on a heat-resistant mat.", easyZh: "提供加熱用的火焰。放在耐熱墊上。", exam: "Provides a flame for heating.", examZh: "提供加熱用的火焰。", photo: true, diagram: true, similar: ["tripod", "stand-and-clamp", "dropper", "heat-proof-mat"] },
  { id: "measuring-cylinder", name: "Measuring cylinder", zh: "量筒", easy: "A tall marked tube for measuring liquid volume.", easyZh: "有刻度的高筒，用來量度液體體積。", exam: "Measure the volume of a liquid.", examZh: "量度液體的體積。", photo: true, diagram: true, similar: ["test-tube", "filter-funnel", "dropper", "beaker"] },
  { id: "round-bottomed-flask", name: "Round-bottomed flask", zh: "圓底燒瓶", easy: "Round bottom — it cannot stand by itself. Use a clamp.", easyZh: "底部是圓的，不能自行站穩，要用夾固定。", exam: "Contains a liquid, often held with a stand and clamp.", examZh: "盛載液體，通常用鐵架和夾固定。", photo: true, diagram: true, similar: ["conical-flask", "beaker", "filter-funnel", "stand-and-clamp"] },
  { id: "watch-glass", name: "Watch glass", zh: "錶面玻璃", easy: "A small curved glass dish for a pinch of solid, or as a cover.", easyZh: "小而彎的玻璃碟，放少量固體，或作蓋子。", exam: "Holds a small amount of solid, or covers a beaker.", examZh: "盛載少量固體，或蓋住燒杯。", photo: true, diagram: true, similar: ["evaporating-dish", "crucible", "beaker", "wire-gauze"] },
  { id: "thermometer", name: "Thermometer", zh: "溫度計", easy: "Tells you how hot or cold something is.", easyZh: "量度物體的冷熱。", exam: "Measures temperature.", examZh: "量度溫度。", photo: true, diagram: true, similar: ["glass-rod", "dropper", "test-tube", "spatula"] },
  { id: "crucible", name: "Crucible", zh: "坩堝", easy: "A small ceramic pot for heating a solid very strongly.", easyZh: "小陶瓷鍋，用來強熱固體。", exam: "Contains a solid which is heated strongly.", examZh: "盛載並強熱固體。", photo: true, diagram: true, similar: ["evaporating-dish", "watch-glass", "beaker", "pestle-and-mortar"] },
  { id: "heat-proof-mat", name: "Heat-resistant mat", zh: "耐熱墊", easy: "Protects the bench from a hot flame or hot glass.", easyZh: "保護實驗桌，免受熱火焰或熱玻璃燙壞。", exam: "Provides a heat-resistant surface for placing a hot object / Bunsen burner.", examZh: "提供耐熱表面，放置熱物件或本生燈。", photo: true, diagram: false, similar: ["wire-gauze", "tripod", "bunsen-burner", "watch-glass"] },
  { id: "stand-and-clamp", name: "Stand and clamp", zh: "鐵架和夾", easy: "Holds apparatus still, such as a funnel or flask.", easyZh: "固定儀器，例如漏斗或燒瓶。", exam: "Supports apparatus (e.g. a funnel or flask).", examZh: "承托儀器（例如漏斗或燒瓶）。", photo: true, diagram: true, similar: ["tripod", "bunsen-burner", "test-tube-holder", "test-tube-rack"] },
  { id: "test-tube-holder", name: "Test tube holder", zh: "試管夾", easy: "A clip so you can heat a test tube without burning your fingers.", easyZh: "夾住試管加熱，避免燙傷手指。", exam: "Holds a test tube for heating.", examZh: "夾住試管以便加熱。", photo: true, diagram: false, similar: ["test-tube-rack", "stand-and-clamp", "bunsen-burner", "spatula"] },
  { id: "test-tube-rack", name: "Test tube rack", zh: "試管架", easy: "Keeps test tubes upright on the bench.", easyZh: "讓試管在實驗桌上直立放置。", exam: "Holds test tubes upright.", examZh: "使試管直立。", photo: true, diagram: false, similar: ["test-tube-holder", "stand-and-clamp", "tripod", "heat-proof-mat"] },
  { id: "spatula", name: "Spatula", zh: "藥匙", easy: "A small scoop for moving a little bit of solid, like salt.", easyZh: "小匙，用來移取少量固體，例如鹽。", exam: "Transfers a small amount of a solid.", examZh: "轉移少量固體。", photo: true, diagram: false, similar: ["glass-rod", "dropper", "thermometer", "pestle-and-mortar"] },
  { id: "pestle-and-mortar", name: "Mortar and pestle", zh: "研缽和研杵", easy: "A bowl and grinder for crushing a solid into powder.", easyZh: "缽和杵，把固體磨成粉末。", exam: "Grinds a solid into fine powder.", examZh: "把固體磨成幼粉。", photo: true, diagram: false, similar: ["crucible", "evaporating-dish", "spatula", "watch-glass"] },
  { id: "gas-jar", name: "Gas jar", zh: "集氣瓶", easy: "A tall jar for collecting a gas.", easyZh: "高瓶，用來收集氣體。", exam: "Collects a gas.", examZh: "收集氣體。", photo: true, diagram: false, similar: ["beaker", "measuring-cylinder", "conical-flask", "desiccator"] },
  { id: "desiccator", name: "Desiccator", zh: "乾燥器", easy: "A lidded pot that keeps a solid dry.", easyZh: "有蓋的容器，保持固體乾燥。", exam: "Dries a solid.", examZh: "使固體乾燥。", photo: true, diagram: false, similar: ["gas-jar", "evaporating-dish", "crucible", "beaker"] },
  { id: "electronic-balance", name: "Electronic balance", zh: "電子天平", easy: "A digital scale for finding the mass of something.", easyZh: "電子秤，用來找出質量。", exam: "Measures the mass of an object.", examZh: "量度物件的質量。", photo: true, diagram: false, similar: ["heat-proof-mat", "watch-glass", "spatula", "desiccator"] },
];

const NAME_TRAPS = {
  "Beaker|Conical flask": "Common mix-up: conical flask is shaken or swirled. Beaker contains / mixes solutions. Tip: neck vs spout.",
  "Conical flask|Beaker": "Common mix-up: beaker contains / mixes solutions. Conical flask is shaken or swirled. Tip: look for the tapering neck.",
  "Conical flask|Round-bottomed flask": "Common mix-up: round-bottomed flask is held with a stand and clamp. Conical flask has a flat base.",
  "Round-bottomed flask|Conical flask": "Common mix-up: conical flask stands on the bench. Round-bottomed flask needs a stand and clamp.",
  "Test tube|Measuring cylinder": "Common mix-up: measuring cylinder measures the volume of a liquid. Test tube mixes solutions or heats a few cm³.",
  "Measuring cylinder|Test tube": "Common mix-up: a test tube is not a volume-measuring tool. Measuring cylinder measures the volume of a liquid.",
  "Evaporating dish|Watch glass": "Common mix-up: watch glass holds a small amount of solid. Evaporating dish: solution evaporated to dryness.",
  "Watch glass|Evaporating dish": "Common mix-up: evaporating dish is for dryness. Watch glass holds a small amount of solid or covers a beaker.",
  "Evaporating dish|Crucible": "Common mix-up: crucible = solid heated strongly. Evaporating dish = solution evaporated to dryness.",
  "Crucible|Evaporating dish": "Common mix-up: evaporating dish is not for strong heating of a solid. Crucible = solid heated strongly.",
  "Tripod|Stand and clamp": "Common mix-up: stand and clamp supports a funnel or flask. Tripod supports gauze or a pipe-clay triangle over a Bunsen burner.",
  "Stand and clamp|Tripod": "Common mix-up: tripod sits over a Bunsen burner. Stand and clamp supports a funnel or flask.",
  "Wire gauze|Tripod": "Common mix-up: tripod is the stand. Wire gauze supports a beaker or evaporating dish on a tripod while heating.",
  "Glass rod|Thermometer": "Common mix-up: thermometer measures temperature. Glass rod stirs a mixture.",
  "Thermometer|Glass rod": "Common mix-up: glass rod stirs a mixture. Thermometer measures temperature.",
  "Dropper|Glass rod": "Common mix-up: glass rod stirs / guides liquid onto filter paper. Dropper adds drop quantities of a liquid.",
  "Filter funnel|Conical flask": "Common mix-up: conical flask is swirled. Filter funnel filters a suspension.",
  "Filter funnel|Dropper": "Common mix-up: dropper = drop quantities. Filter funnel filters a suspension.",
  "Test tube holder|Test tube rack": "Common mix-up: the rack stands tubes on the bench. The holder is the clip you use while heating.",
  "Test tube rack|Test tube holder": "Common mix-up: the holder is for heating. The rack keeps test tubes upright on the bench.",
  "Spatula|Glass rod": "Common mix-up: glass rod stirs a liquid. Spatula transfers a small amount of solid.",
  "Mortar and pestle|Crucible": "Common mix-up: crucible heats a solid strongly. Mortar and pestle grinds a solid into powder.",
  "Gas jar|Beaker": "Common mix-up: a beaker holds liquid. A gas jar collects a gas.",
  "Desiccator|Evaporating dish": "Common mix-up: evaporating dish drives off water by heating. A desiccator keeps a solid dry in a closed pot.",
};

const STREAK_TIERS = [
  { min: 0, label: "Ready", note: "First-try streak" },
  { min: 1, label: "Getting started", note: "First correct" },
  { min: 3, label: "Steady", note: "Keep checking the model answer" },
  { min: 5, label: "Focused", note: "Five first-tries in a row" },
  { min: 8, label: "Lab ready", note: "Stay accurate" },
  { min: 12, label: "Excellent", note: "Twelve in a row" },
];

const DRILL_MODES = [
  { id: "name", title: "Name", titleZh: "名稱", blurb: "See a photo or 2D diagram. Choose the correct name.", blurbZh: "看相片或平面圖，選出正確名稱。", thumb: "images/notes-conical-flask-diagram.jpg" },
  { id: "spot", title: "Spot", titleZh: "辨圖", blurb: "Read the name. Tap the matching photo or diagram.", blurbZh: "讀名稱，點選相符的相片或圖。", thumb: "images/notes-test-tube-diagram.jpg" },
  { id: "use", title: "Use", titleZh: "用途", blurb: "Read the job. Choose the apparatus that does it.", blurbZh: "讀用途，選出負責的儀器。", thumb: "images/notes-evaporating-dish-diagram.jpg" },
  { id: "mix", title: "Mix", titleZh: "混合", blurb: "Name, spot, and use — one question per piece.", blurbZh: "名稱、辨圖和用途，每件一題。", thumb: "images/notes-bunsen-burner-diagram.jpg" },
];

function byId(id) {
  return APPARATUS.find((item) => item.id === id);
}

function photoSrc(id) {
  return `images/${id}-photo.jpg`;
}

function diagramSrc(id) {
  return `images/${id}-diagram.jpg`;
}

function notesDiagramSrc(id) {
  return `images/notes-${id}-diagram.jpg`;
}

function drawingSrc(id) {
  if (NOTES_DIAGRAMS.includes(id)) return notesDiagramSrc(id);
  return diagramSrc(id);
}

function pictureKinds(item) {
  const kinds = [];
  if (item.photo) kinds.push("photo");
  if (item.diagram) kinds.push("diagram");
  return kinds;
}

function pictureSrc(id, kind) {
  if (kind === "diagram" && byId(id) && byId(id).diagram) return drawingSrc(id);
  return photoSrc(id);
}

function kindLabel(kind) {
  return kind === "diagram" ? "2D diagram" : "Photograph";
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickDistractors(item, n) {
  const preferred = shuffle((item.similar || []).map(byId).filter(Boolean));
  const rest = shuffle(APPARATUS.filter((row) => row.id !== item.id && !preferred.some((p) => p.id === row.id)));
  return preferred.concat(rest).slice(0, n);
}

function trapLine(pickedName, answerName) {
  const key = `${answerName}|${pickedName}`;
  const rev = `${pickedName}|${answerName}`;
  return NAME_TRAPS[key] || NAME_TRAPS[rev] || "";
}

function makeNameQuestion(item, kind) {
  const distractors = pickDistractors(item, 3).map((row) => row.name);
  return {
    type: "name",
    key: `${item.id}-${kind}-name`,
    id: item.id,
    kind,
    options: shuffle([item.name].concat(distractors)),
  };
}

function makeSpotQuestion(item, kind) {
  const distractors = pickDistractors(item, 3).map((row) => row.id);
  return {
    type: "spot",
    key: `${item.id}-${kind}-spot`,
    id: item.id,
    kind,
    options: shuffle([item.id].concat(distractors)),
  };
}

function makeUseQuestion(item) {
  const distractors = pickDistractors(item, 3).map((row) => row.name);
  return {
    type: "use",
    key: `${item.id}-use`,
    id: item.id,
    prompt: item.exam,
    options: shuffle([item.name].concat(distractors)),
  };
}

function cloneQuestion(q) {
  return { ...q, options: shuffle(q.options.slice()) };
}

function allNameQuestions() {
  const list = [];
  APPARATUS.forEach((item) => {
    pictureKinds(item).forEach((kind) => list.push(makeNameQuestion(item, kind)));
  });
  return list;
}

function allSpotQuestions() {
  const list = [];
  APPARATUS.forEach((item) => {
    pictureKinds(item).forEach((kind) => list.push(makeSpotQuestion(item, kind)));
  });
  return list;
}

function allUseQuestions() {
  return APPARATUS.map((item) => makeUseQuestion(item));
}

function mixQuestions() {
  return APPARATUS.map((item) => {
    const kinds = pictureKinds(item);
    const kind = pickOne(kinds);
    const roll = Math.random();
    if (roll < 0.34) return makeNameQuestion(item, kind);
    if (roll < 0.67) return makeSpotQuestion(item, kind);
    return makeUseQuestion(item);
  });
}

function buildDeck(mode) {
  if (mode === "name") return shuffle(allNameQuestions());
  if (mode === "spot") return shuffle(allSpotQuestions());
  if (mode === "use") return shuffle(allUseQuestions());
  return shuffle(mixQuestions());
}

function modeMeta(id) {
  return DRILL_MODES.find((row) => row.id === id);
}
