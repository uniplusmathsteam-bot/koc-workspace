const STORAGE_KEY = "notes-wall-v3";

const COPY = {
  en: {
    headerKicker: "HKDSE Chemistry · Topic 01 · S3 lab",
    headerTitle: "Notes Wall",
    headerLead: "Glassware → Heating → Set-ups → Check yourself. Cover names to recall. Press Esc to close a chart.",
    wall: "Wall",
    check: "Check yourself",
    notesWall: "Notes Wall",
    path: "Glassware → Heating → Set-ups → Check yourself",
    wallLead: "Wall stamp All opened = every page opened. Check stamp Clean run = first-try correct. Cover names, then tap a chart.",
    allOpened: "All opened",
    opened: "Opened",
    open: "Open",
    coverNames: "Cover names",
    resume: "Resume check",
    printCrib: "Print crib",
    exportNote: "This is an offline website. Double-click index.html. Keep this folder together when you share it.",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    close: "Close",
    steps: "Steps",
    job: "Job",
    trap: "Trap",
    safety: "Safety",
    glossary: "Glossary",
    pieces: "On this page",
    reveal: "Reveal names",
    showFullPage: "Full page",
    sameAs: "Same set-up",
    tryAgain: "Try again",
    newMix: "New mix",
    finish: "Finish",
    next: "Next",
    nextRecap: "Next recap",
    recapMisses: "Recap {n} miss{es}",
    firstTry: "first try",
    recapBanner: "Recap · {n} still to get right",
    recapFinished: "Recap finished",
    cleanRun: "Clean run",
    cleanRunTitle: "Clean first-try run",
    revised: "Revised",
    weakPages: "Weak pages",
    missedTimes: "missed {n} time{s}",
    backWall: "Back to the wall",
    correct: "Correct — that matches the notes",
    incorrect: "Not this time — look at the page again",
    modelAnswer: "Model answer",
    youChose: "You chose",
    pressKeys: "Press {keys} to choose",
    openThisPage: "Open this page",
    emptyWarnTitle: "You have not opened any charts yet",
    emptyWarnBody: "Check yourself is guessing until you have looked at the pages. You can still start.",
    startAnyway: "Start anyway",
    scanNote: "Scan note",
    printTitle: "Topic 01 crib — apparatus and set-ups",
    printPieces: "Apparatus",
    printSetups: "Set-ups",
    tapToName: "Tap to name",
    optionPage: "Notes page option {n}",
    notesPage: "Notes page",
    orderHint: "Tap the steps in order",
    resumeHint: "A check is in progress. Progress is saved.",
    noMisses: "Clean run — no misses to recap.",
  },
  zh: {
    headerKicker: "香港中學文憑 化學 · 課題 01 · 中三實驗",
    headerTitle: "筆記牆",
    headerLead: "玻璃儀器 → 加熱 → 裝置 → 自我檢測。遮蓋名稱來回憶。按 Esc 關閉圖表。",
    wall: "筆記牆",
    check: "自我檢測",
    notesWall: "筆記牆",
    path: "玻璃儀器 → 加熱 → 裝置 → 自我檢測",
    wallLead: "牆上「已全部打開」= 每頁都打開過。檢測「一次過關」= 第一遍全對。先遮蓋名稱，再點圖表。",
    allOpened: "已全部打開",
    opened: "已打開",
    open: "打開",
    coverNames: "遮蓋名稱",
    resume: "繼續檢測",
    printCrib: "列印小抄",
    exportNote: "這是離線網頁。雙擊 index.html。分享時請保持整個資料夾在一起。",
    darkMode: "深色模式",
    lightMode: "淺色模式",
    close: "關閉",
    steps: "步驟",
    job: "用途",
    trap: "易錯",
    safety: "安全",
    glossary: "詞語",
    pieces: "本頁儀器",
    reveal: "顯示名稱",
    showFullPage: "整頁",
    sameAs: "同一裝置",
    tryAgain: "再試",
    newMix: "重新出題",
    finish: "完成",
    next: "下一題",
    nextRecap: "下一題複習",
    recapMisses: "複習 {n} 題錯題",
    firstTry: "第一遍",
    recapBanner: "複習 · 還有 {n} 題要答對",
    recapFinished: "複習完成",
    cleanRun: "一次過關",
    cleanRunTitle: "第一遍全對",
    revised: "已複習",
    weakPages: "薄弱頁",
    missedTimes: "錯了 {n} 次",
    backWall: "返回筆記牆",
    correct: "正確 — 與筆記相符",
    incorrect: "今次不對 — 再看該頁",
    modelAnswer: "參考答案",
    youChose: "你選了",
    pressKeys: "按 {keys} 作答",
    openThisPage: "打開此頁",
    emptyWarnTitle: "你還沒有打開任何圖表",
    emptyWarnBody: "未看過筆記就檢測等於猜題。你仍可以開始。",
    startAnyway: "仍然開始",
    scanNote: "掃描說明",
    printTitle: "課題 01 小抄 — 儀器與裝置",
    printPieces: "儀器",
    printSetups: "裝置",
    tapToName: "點擊命名",
    optionPage: "筆記選項 {n}",
    notesPage: "筆記頁",
    orderHint: "按正確次序點選步驟",
    resumeHint: "檢測進行中。進度已儲存。",
    noMisses: "一次過關 — 沒有錯題要複習。",
  },
};

const WALL_TABS = [
  { id: "all", label: { en: "All", zh: "全部" } },
  { id: "glass", label: { en: "Glassware", zh: "玻璃儀器" } },
  { id: "heat", label: { en: "Heating", zh: "加熱" } },
  { id: "setup", label: { en: "Set-ups", zh: "裝置" } },
];

const WALL_ITEMS = [
  {
    id: "tubes-beakers",
    tag: "glass",
    src: "images/chart-tubes-beakers.jpg",
    title: "Test tube, beaker, measuring cylinder, filter funnel",
    zh: "試管、燒杯、量筒、漏斗",
    exam: {
      en: "Four common vessels: hold a small sample, mix a liquid, measure a rough volume, or filter.",
      zh: "四件常用儀器：盛載少量樣品、混合液體、粗略量度體積，或過濾。",
    },
    steps: {
      en: [
        "Name each column: test tube, beaker, measuring cylinder, filter funnel.",
        "Match the photo to the exam drawing under it.",
        "Say one job for each — not the same job for all four.",
      ],
      zh: [
        "說出每欄名稱：試管、燒杯、量筒、漏斗。",
        "把照片對應下方的考試繪圖。",
        "各說一個用途 — 四件不是同一用途。",
      ],
    },
  },
  {
    id: "flasks-dishes",
    tag: "glass",
    src: "images/chart-flasks-dishes.jpg",
    title: "Conical flask, round-bottomed flask, evaporating dish, watch glass",
    zh: "錐形瓶、圓底燒瓶、蒸發皿、錶面玻璃",
    exam: {
      en: "Swirl a solution, heat a liquid in a flask, evaporate to dryness, or hold a pinch of solid.",
      zh: "旋搖溶液、在燒瓶中加熱液體、蒸發至乾，或盛載少量固體。",
    },
    steps: {
      en: [
        "Conical flask: mix by swirling; narrow neck cuts splashes.",
        "Round-bottomed flask: heat a liquid; clamp the neck.",
        "Evaporating dish vs watch glass: dryness of a solution vs a small solid.",
      ],
      zh: [
        "錐形瓶：旋搖混合；窄瓶口減少濺出。",
        "圓底燒瓶：加熱液體；用夾承住瓶頸。",
        "蒸發皿對錶面玻璃：溶液蒸乾對少量固體。",
      ],
    },
    trap: {
      en: "A watch glass is not an evaporating dish. Do not evaporate a solution to dryness on a watch glass.",
      zh: "錶面玻璃不是蒸發皿。不要在錶面玻璃上把溶液蒸乾。",
    },
  },
  {
    id: "volume-glassware",
    tag: "glass",
    src: "images/notes-volume-glassware.png",
    title: "Measuring liquid volume",
    zh: "量度液體體積",
    exam: {
      en: "Read the volume at the bottom of the meniscus. Pipette, burette and volumetric flask make accurate measurements; a measuring cylinder makes a rough measurement.",
      zh: "在彎月面底部讀取體積。移液管、滴定管和容量瓶作準確量度；量筒只作粗略量度。",
    },
    steps: {
      en: [
        "Place the vessel on a flat bench. Eye level with the liquid surface.",
        "Read water at the bottom of the meniscus.",
        "Choose pipette, burette or volumetric flask for an accurate volume; cylinder for a rough volume.",
      ],
      zh: [
        "儀器放在水平枱面。視線與液面同高。",
        "水的體積讀彎月面底部。",
        "準確體積用移液管、滴定管或容量瓶；粗略用體積量筒。",
      ],
    },
    trap: {
      en: "A measuring cylinder is not accurate enough for titration or making a standard solution.",
      zh: "量筒不夠準確，不能用於滴定或配製標準溶液。",
    },
    terms: [
      {
        word: { en: "Meniscus", zh: "彎月面" },
        def: { en: "The curved surface of a liquid in a narrow tube. For water, read the bottom.", zh: "窄管中液面的彎曲。水要讀底部。" },
      },
    ],
  },
  {
    id: "pouring",
    tag: "glass",
    src: "images/diagram-pouring-liquid.jpg",
    title: "Pouring along a glass rod",
    zh: "沿玻璃棒倒液體",
    exam: {
      en: "A glass rod guides liquid onto filter paper so it does not splash.",
      zh: "玻璃棒引導液體到濾紙上，避免濺出。",
    },
    steps: {
      en: [
        "Rest a glass rod on the filter paper or the lip of the vessel.",
        "Pour the liquid down the rod, not straight from the beaker mouth.",
        "This is the same idea as pouring a muddy mixture into a filter funnel.",
      ],
      zh: [
        "把玻璃棒靠在濾紙或器皿口。",
        "沿棒倒出液體，不要從燒杯口直倒。",
        "把泥水倒入漏斗時也用同一方法。",
      ],
    },
  },
  {
    id: "heating-dropper",
    tag: "heat",
    src: "images/chart-heating-dropper.jpg",
    title: "Wire gauze, Bunsen burner, tripod — and a dropper on the notes page",
    zh: "鐵絲網、本生燈、三腳架、滴管",
    exam: {
      en: "Tripod and gauze support a vessel over a Bunsen flame. The dropper on this page adds liquid in drops — it is not a heating tool.",
      zh: "三腳架和鐵絲網承住器皿在本生燈火焰上。本頁的滴管用來逐滴加液 — 它不是加熱工具。",
    },
    steps: {
      en: [
        "Heat-resistant mat, then Bunsen burner.",
        "Tripod over the burner; wire gauze on the tripod.",
        "The dropper stays in the rack until you add liquid in drops.",
      ],
      zh: [
        "耐熱墊，再放本生燈。",
        "三腳架跨在燈上；鐵絲網放在三腳架上。",
        "滴管留在架上，直到要逐滴加液。",
      ],
    },
    trap: {
      en: "The dropper is printed on the heating chart, but it does not heat, support, or spread the flame.",
      zh: "滴管印在加熱圖表上，但它不加熱、不承托，也不分散火焰。",
    },
    safety: {
      en: "Heat-resistant mat under the burner. Tie hair back. Never heat a sealed vessel.",
      zh: "燈下放耐熱墊。束起頭髮。切勿加熱密封器皿。",
    },
  },
  {
    id: "rod-thermo-crucible",
    tag: "heat",
    src: "images/chart-rod-thermo-crucible.jpg",
    title: "Glass rod, thermometer, crucible",
    zh: "玻璃棒、溫度計、坩堝",
    exam: {
      en: "Stir; measure temperature; heat a solid strongly in a crucible.",
      zh: "攪拌；量度溫度；在坩堝中強熱固體。",
    },
    steps: {
      en: [
        "Glass rod: stir a mixture or guide a pour.",
        "Thermometer: bulb in the liquid, not touching the vessel wall while you read.",
        "Crucible: solid heated strongly — later it sits on a pipe-clay triangle, not gauze.",
      ],
      zh: [
        "玻璃棒：攪拌混合物或引導傾倒。",
        "溫度計：液泡浸在液體中，讀數時不要貼著器壁。",
        "坩堝：強熱固體 — 之後放在泥三角上，不是鐵絲網。",
      ],
    },
    safety: {
      en: "A hot crucible looks like a cold one. Use tongs. Rest it on a heat-resistant mat.",
      zh: "熱坩堝看起來像冷的。用坩堝鉗。放在耐熱墊上。",
    },
  },
  {
    id: "bunsen-parts",
    tag: "heat",
    src: "images/notes-bunsen-parts-page.jpg",
    title: "Parts of a Bunsen burner",
    zh: "本生燈各部分",
    exam: {
      en: "Close the air hole, light at the barrel, then turn on the gas. Open the air hole slowly for a heating flame.",
      zh: "關閉空氣孔，在燈管口點火，然後打開煤氣。慢慢打開空氣孔得到加熱火焰。",
    },
    steps: {
      en: [
        "Close the air hole.",
        "Light a match at the barrel, then turn on the gas.",
        "Open the air hole slowly for a heating (non-luminous) flame.",
      ],
      zh: [
        "關閉空氣孔。",
        "在燈管口劃著火柴，然後打開煤氣。",
        "慢慢打開空氣孔，得到加熱（非光亮）火焰。",
      ],
    },
    trap: {
      en: "The leftover headings “Volumetric flask / Measuring cylinder” on this scan belong to the previous notes column — not to the Bunsen burner.",
      zh: "掃描頁上餘下的「容量瓶 / 量筒」標題屬於上一欄筆記 — 不是本生燈。",
    },
    safety: {
      en: "Luminous flame to light. Then open the air hole. If the flame strikes back, turn the gas off.",
      zh: "先用光亮火焰點燃。再打開空氣孔。若回火，立即關閉煤氣。",
    },
    scanNote: {
      en: "This photo is a cropped notes page. Ignore the flask and cylinder headings at the top — this card is only the Bunsen burner.",
      zh: "這是裁切過的筆記頁。忽略頂部的燒瓶和量筒標題 — 本卡只講本生燈。",
    },
    terms: [
      {
        word: { en: "Air hole", zh: "空氣孔" },
        def: { en: "Controls air mix, so luminosity and temperature of the flame.", zh: "控制空氣混合，因而控制火焰的光亮程度和溫度。" },
      },
      {
        word: { en: "Luminous flame", zh: "光亮火焰" },
        def: { en: "Yellow, cooler flame when the air hole is closed. Use it to light the burner.", zh: "關閉空氣孔時的黃色、較低溫火焰。用來點燃本生燈。" },
      },
    ],
  },
  {
    id: "evaporation-photo",
    tag: "setup",
    src: "images/setup-evaporation.jpg",
    title: "Evaporate sea water to get salt",
    zh: "蒸發海水取得鹽",
    exam: {
      en: "Heat a solution in an evaporating dish until only solid is left. W dish, X wire gauze, Y tripod, Z Bunsen burner.",
      zh: "在蒸發皿中加熱溶液至只剩固體。W 蒸發皿，X 鐵絲網，Y 三腳架，Z 本生燈。",
    },
    steps: {
      en: [
        "Heat-resistant mat on the bench, then Bunsen burner.",
        "Tripod over the burner, wire gauze on the tripod.",
        "Evaporating dish of sea water on the gauze. Heat until dryness.",
      ],
      zh: [
        "枱上放耐熱墊，再放本生燈。",
        "三腳架跨在燈上，鐵絲網放在三腳架上。",
        "盛海水的蒸發皿放在網上。加熱至乾。",
      ],
    },
    safety: {
      en: "Heat-resistant mat. Do not lean over the dish. The dish stays hot after the flame is off.",
      zh: "使用耐熱墊。不要俯身在皿上方。熄火後皿仍然很熱。",
    },
    sameAs: "evaporation-diagram",
    parts: [
      { id: "W", en: "Evaporating dish", zh: "蒸發皿" },
      { id: "X", en: "Wire gauze", zh: "鐵絲網" },
      { id: "Y", en: "Tripod", zh: "三腳架" },
      { id: "Z", en: "Bunsen burner", zh: "本生燈" },
    ],
  },
  {
    id: "filtration-photo",
    tag: "setup",
    src: "images/setup-filtration.jpg",
    title: "Filter mud from sea water",
    zh: "過濾泥和水",
    exam: {
      en: "A filter funnel and filter paper separate an insoluble solid from a liquid. The liquid that runs through is the filtrate.",
      zh: "漏斗和濾紙把不溶固體與液體分開。流下去的液體是濾液。",
    },
    steps: {
      en: [
        "Fold filter paper, sit it in the filter funnel.",
        "Stand and clamp (or a conical flask) hold the funnel.",
        "Pour the muddy mixture along a glass rod onto the paper. Mud stays; filtrate collects below.",
      ],
      zh: [
        "摺好濾紙，放入漏斗。",
        "用鐵架和夾（或錐形瓶）承住漏斗。",
        "沿玻璃棒把泥水倒在濾紙上。泥留下；濾液在下方收集。",
      ],
    },
    terms: [
      {
        word: { en: "Filtrate", zh: "濾液" },
        def: { en: "The liquid that runs through the filter paper.", zh: "穿過濾紙流下的液體。" },
      },
      {
        word: { en: "Residue", zh: "殘渣" },
        def: { en: "The insoluble solid left on the filter paper.", zh: "留在濾紙上的不溶固體。" },
      },
    ],
  },
  {
    id: "evaporation-diagram",
    tag: "setup",
    src: "images/diagram-evaporation-setup.jpg",
    title: "Evaporating dish on wire gauze",
    zh: "蒸發皿放在鐵絲網上",
    exam: {
      en: "The dish holds a solution to be evaporated to dryness. Wire gauze spreads the heat on a tripod.",
      zh: "皿盛載要蒸乾的溶液。鐵絲網在三腳架上分散熱力。",
    },
    steps: {
      en: [
        "Tripod over a Bunsen burner.",
        "Wire gauze on the tripod.",
        "Evaporating dish of solution on the gauze.",
      ],
      zh: [
        "三腳架跨在本生燈上。",
        "鐵絲網放在三腳架上。",
        "盛溶液的蒸發皿放在網上。",
      ],
    },
    safety: {
      en: "Gauze spreads the flame so the dish does not crack from a point of heat.",
      zh: "鐵絲網分散火焰，避免皿因局部過熱而裂。",
    },
    sameAs: "evaporation-photo",
  },
  {
    id: "crucible-setup",
    tag: "setup",
    src: "images/diagram-crucible-setup.jpg",
    title: "Crucible on a pipe-clay triangle",
    zh: "坩堝放在泥三角上",
    exam: {
      en: "A crucible holds a solid heated strongly. A pipe-clay triangle supports it on a tripod — not wire gauze.",
      zh: "坩堝盛載要強熱的固體。泥三角在三腳架上承住它 — 不是鐵絲網。",
    },
    steps: {
      en: [
        "Tripod over a Bunsen burner.",
        "Pipe-clay triangle on the tripod.",
        "Crucible of solid on the triangle. Heat strongly.",
      ],
      zh: [
        "三腳架跨在本生燈上。",
        "泥三角放在三腳架上。",
        "盛固體的坩堝放在三角上。強熱。",
      ],
    },
    trap: {
      en: "Wire gauze is for a beaker or evaporating dish. A crucible needs a pipe-clay triangle so the flame can heat it strongly.",
      zh: "鐵絲網用於燒杯或蒸發皿。坩堝要用泥三角，火焰才能強熱它。",
    },
    safety: {
      en: "Use tongs. A hot crucible and lid stay hot. Rest them on a heat-resistant mat.",
      zh: "用坩堝鉗。熱坩堝和蓋仍然很熱。放在耐熱墊上。",
    },
  },
  {
    id: "eight-pieces",
    tag: "setup",
    src: "images/setup-eight-pieces.jpg",
    title: "Boil about 200 cm³ of water",
    zh: "煮沸約 200 cm³ 水",
    exam: {
      en: "Beaker on wire gauze and tripod, over a Bunsen burner on a heat-resistant mat.",
      zh: "燒杯放在鐵絲網和三腳架上，下面是本生燈和耐熱墊。",
    },
    steps: {
      en: [
        "Heat-resistant mat, then Bunsen burner.",
        "Tripod, wire gauze, beaker of water.",
        "This is not a test-tube heating. A test tube is only a few cm³.",
      ],
      zh: [
        "耐熱墊，再放本生燈。",
        "三腳架、鐵絲網、盛水的燒杯。",
        "這不是試管加熱。試管只盛幾立方厘米。",
      ],
    },
    trap: {
      en: "About 200 cm³ needs a beaker. A test tube holds only a few cm³.",
      zh: "約 200 cm³ 要用燒杯。試管只盛幾立方厘米。",
    },
    safety: {
      en: "Heat-resistant mat. Point no vessel mouth at a face. Do not heat a sealed container.",
      zh: "使用耐熱墊。器皿口不要對着臉。不要加熱密封容器。",
    },
  },
  {
    id: "watchglass-bath",
    tag: "setup",
    src: "images/setup-watchglass-bath.jpg",
    title: "Watch glass over a water bath",
    zh: "錶面玻璃放在水浴上",
    exam: {
      en: "A watch glass holds a small amount of solid. Gentle heat comes from a beaker of hot water, not a direct flame on the glass.",
      zh: "錶面玻璃盛載少量固體。溫和熱力來自盛熱水的燒杯，不是火焰直接打在玻璃上。",
    },
    steps: {
      en: [
        "Beaker of water heated on gauze and tripod.",
        "Watch glass rests on the beaker.",
        "Use this for a small amount of solid, not evaporating a solution to dryness.",
      ],
      zh: [
        "燒杯盛水，在鐵絲網和三腳架上加熱。",
        "錶面玻璃放在燒杯上。",
        "用於少量固體，不是把溶液蒸乾。",
      ],
    },
    trap: {
      en: "To evaporate sea water to salt, use an evaporating dish on gauze — not a watch glass over a water bath.",
      zh: "要把海水蒸成鹽，用鐵絲網上的蒸發皿 — 不是水浴上的錶面玻璃。",
    },
    safety: {
      en: "Steam burns. Lift the watch glass with tongs. Do not put the watch glass in a direct flame.",
      zh: "蒸汽會燙傷。用鉗拿起錶面玻璃。不要把錶面玻璃放進直火。",
    },
  },
];

const PIECES = [
  {
    id: "test-tube",
    parent: "tubes-beakers",
    col: 0,
    cols: 4,
    title: "Test tube",
    zh: "試管",
    job: { en: "Hold and heat a small amount of liquid or solid (a few cm³).", zh: "盛載並加熱少量液體或固體（幾立方厘米）。" },
    trap: { en: "Not for 200 cm³ of water. That needs a beaker.", zh: "不能盛 200 cm³ 水。那要用燒杯。" },
  },
  {
    id: "beaker",
    parent: "tubes-beakers",
    col: 1,
    cols: 4,
    title: "Beaker",
    zh: "燒杯",
    job: { en: "Hold, mix, or heat a liquid. Rough volume only.", zh: "盛載、混合或加熱液體。體積只是粗略。" },
    trap: { en: "Not for an accurate volume. Use a pipette, burette or volumetric flask.", zh: "不能作準確體積。要用移液管、滴定管或容量瓶。" },
  },
  {
    id: "measuring-cylinder",
    parent: "tubes-beakers",
    col: 2,
    cols: 4,
    title: "Measuring cylinder",
    zh: "量筒",
    job: { en: "Make a rough measurement of liquid volume. Read the bottom of the meniscus.", zh: "粗略量度液體體積。讀彎月面底部。" },
    trap: { en: "Rough, not accurate. Not for titration or a standard solution.", zh: "粗略，不準確。不能用於滴定或標準溶液。" },
  },
  {
    id: "filter-funnel",
    parent: "tubes-beakers",
    col: 3,
    cols: 4,
    title: "Filter funnel",
    zh: "漏斗",
    job: { en: "Hold filter paper to separate an insoluble solid from a liquid.", zh: "承住濾紙，把不溶固體與液體分開。" },
    trap: { en: "The funnel alone does not filter. You need filter paper, and you pour along a glass rod.", zh: "單是漏斗不能過濾。需要濾紙，並沿玻璃棒傾倒。" },
  },
  {
    id: "conical-flask",
    parent: "flasks-dishes",
    col: 0,
    cols: 4,
    title: "Conical flask",
    zh: "錐形瓶",
    job: { en: "Swirl a solution to mix it. Narrow neck reduces splashes. Collects filtrate.", zh: "旋搖溶液以混合。窄瓶口減少濺出。可收集濾液。" },
    trap: { en: "Not for evaporating to dryness. Use an evaporating dish.", zh: "不能用來蒸乾。要用蒸發皿。" },
  },
  {
    id: "round-bottomed-flask",
    parent: "flasks-dishes",
    col: 1,
    cols: 4,
    title: "Round-bottomed flask",
    zh: "圓底燒瓶",
    job: { en: "Heat a liquid evenly. Clamp the neck; it will not stand on the bench.", zh: "均勻加熱液體。夾住瓶頸；它不能立在枱上。" },
    trap: { en: "Never stand it on the bench without a stand. Never heat it sealed.", zh: "沒有鐵架不要立在枱上。切勿密封加熱。" },
  },
  {
    id: "evaporating-dish",
    parent: "flasks-dishes",
    col: 2,
    cols: 4,
    title: "Evaporating dish",
    zh: "蒸發皿",
    job: { en: "Evaporate a solution to dryness to obtain a solid (for example salt from sea water).", zh: "把溶液蒸乾以取得固體（例如從海水取鹽）。" },
    trap: { en: "Sits on wire gauze, not a pipe-clay triangle. Not for heating a solid very strongly — that is a crucible.", zh: "放在鐵絲網上，不是泥三角。不是用來強熱固體 — 那是坩堝。" },
  },
  {
    id: "watch-glass",
    parent: "flasks-dishes",
    col: 3,
    cols: 4,
    title: "Watch glass",
    zh: "錶面玻璃",
    job: { en: "Hold a pinch of solid, or cover a beaker. Gentle heat on a water bath.", zh: "盛載少量固體，或蓋住燒杯。在水浴上溫和加熱。" },
    trap: { en: "Not for evaporating a solution to dryness. Not in a direct flame.", zh: "不能把溶液蒸乾。不能放在直火中。" },
  },
  {
    id: "pipette",
    parent: "volume-glassware",
    col: 0,
    cols: 4,
    title: "Pipette",
    zh: "移液管",
    job: { en: "Deliver an accurate fixed volume of liquid (graduation mark on the stem).", zh: "準確量取固定體積的液體（管頸有刻度標記）。" },
    trap: { en: "Accurate — unlike a measuring cylinder or beaker.", zh: "準確 — 不像量筒或燒杯。" },
  },
  {
    id: "burette",
    parent: "volume-glassware",
    col: 1,
    cols: 4,
    title: "Burette",
    zh: "滴定管",
    job: { en: "Deliver an accurate variable volume, drop by drop, using the stopcock. Used in titration.", zh: "用活塞準確、可逐滴放出可變體積。用於滴定。" },
    trap: { en: "Accurate. A measuring cylinder is only rough.", zh: "準確。量筒只是粗略。" },
  },
  {
    id: "volumetric-flask",
    parent: "volume-glassware",
    col: 2,
    cols: 4,
    title: "Volumetric flask",
    zh: "容量瓶",
    job: { en: "Make up an accurate fixed volume of solution to the graduation mark on the neck.", zh: "在瓶頸刻度配製準確固定體積的溶液。" },
    trap: { en: "Accurate. Do not confuse the leftover flask heading on the Bunsen scan with this page.", zh: "準確。不要把本生燈掃描頁上餘下的燒瓶標題當成這一頁。" },
  },
  {
    id: "measuring-cylinder-volume",
    parent: "volume-glassware",
    col: 3,
    cols: 4,
    title: "Measuring cylinder",
    zh: "量筒",
    job: { en: "Rough measurement of liquid volume. Read the bottom of the meniscus.", zh: "粗略量度液體體積。讀彎月面底部。" },
    trap: { en: "Rough, not accurate — the other three on this page are the accurate set.", zh: "粗略，不準確 — 本頁另外三件才是準確儀器。" },
  },
  {
    id: "wire-gauze",
    parent: "heating-dropper",
    col: 0,
    cols: 4,
    title: "Wire gauze",
    zh: "鐵絲網",
    job: { en: "Spreads the Bunsen flame under a beaker or evaporating dish on a tripod.", zh: "在三腳架上為燒杯或蒸發皿分散本生燈火焰。" },
    trap: { en: "Not under a crucible. A crucible sits on a pipe-clay triangle.", zh: "不放在坩堝下。坩堝放在泥三角上。" },
  },
  {
    id: "bunsen-burner",
    parent: "heating-dropper",
    col: 1,
    cols: 4,
    title: "Bunsen burner",
    zh: "本生燈",
    job: { en: "Heat with a gas flame. Air hole sets luminosity and temperature.", zh: "用煤氣火焰加熱。空氣孔決定光亮程度和溫度。" },
    trap: { en: "Close the air hole to light; then open it for a heating flame.", zh: "點火時關閉空氣孔；再打開才是加熱火焰。" },
  },
  {
    id: "tripod",
    parent: "heating-dropper",
    col: 2,
    cols: 4,
    title: "Tripod",
    zh: "三腳架",
    job: { en: "Stand that holds gauze or a pipe-clay triangle over the burner.", zh: "承住鐵絲網或泥三角、跨在燈上的架子。" },
    trap: { en: "The tripod is not the heat source. The Bunsen burner is.", zh: "三腳架不是熱源。本生燈才是。" },
  },
  {
    id: "dropper",
    parent: "heating-dropper",
    col: 3,
    cols: 4,
    title: "Dropper",
    zh: "滴管",
    job: { en: "Add liquid in drops.", zh: "逐滴加入液體。" },
    trap: { en: "Printed on the heating chart, but it is not a heating tool.", zh: "印在加熱圖表上，但不是加熱工具。" },
  },
  {
    id: "glass-rod",
    parent: "rod-thermo-crucible",
    col: 0,
    cols: 3,
    title: "Glass rod",
    zh: "玻璃棒",
    job: { en: "Stir a mixture, or guide liquid when pouring onto filter paper.", zh: "攪拌混合物，或引導液體倒在濾紙上。" },
    trap: { en: "Not a thermometer and not a heat source.", zh: "不是溫度計，也不是熱源。" },
  },
  {
    id: "thermometer",
    parent: "rod-thermo-crucible",
    col: 1,
    cols: 3,
    title: "Thermometer",
    zh: "溫度計",
    job: { en: "Measure temperature. Bulb in the liquid.", zh: "量度溫度。液泡浸在液體中。" },
    trap: { en: "Do not use it as a stirring rod.", zh: "不要當攪拌棒用。" },
  },
  {
    id: "crucible",
    parent: "rod-thermo-crucible",
    col: 2,
    cols: 3,
    title: "Crucible",
    zh: "坩堝",
    job: { en: "Heat a solid strongly. Later: pipe-clay triangle on a tripod, not gauze.", zh: "強熱固體。之後：泥三角放在三腳架上，不是鐵絲網。" },
    trap: { en: "Not an evaporating dish. Not for boiling 200 cm³ of water.", zh: "不是蒸發皿。不能煮 200 cm³ 水。" },
  },
];

function byId(id) {
  return WALL_ITEMS.find((row) => row.id === id);
}

function byPiece(id) {
  return PIECES.find((row) => row.id === id);
}

function piecesFor(parentId) {
  return PIECES.filter((row) => row.parent === parentId);
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistractors(item, n) {
  const same = shuffle(WALL_ITEMS.filter((row) => row.tag === item.tag && row.id !== item.id));
  const rest = shuffle(WALL_ITEMS.filter((row) => row.tag !== item.tag && row.id !== item.id));
  return same.concat(rest).slice(0, n);
}

function itemLabel(id) {
  const item = byId(id);
  if (!item) return { en: id, zh: id };
  return { en: item.title, zh: `${item.zh} · ${item.title}` };
}

function pieceLabel(id) {
  const piece = byPiece(id);
  if (!piece) return itemLabel(id);
  return { en: piece.title, zh: `${piece.zh} · ${piece.title}` };
}

function makeQuestion(spec) {
  const options = spec.options.map((opt) => (typeof opt === "string" ? opt : opt.id));
  const labels = {};
  spec.options.forEach((opt) => {
    if (typeof opt === "string") {
      labels[opt] = spec.labelFor ? spec.labelFor(opt) : itemLabel(opt);
    } else {
      labels[opt.id] = { en: opt.en, zh: opt.zh };
    }
  });
  return {
    type: spec.type,
    key: spec.key,
    id: spec.id,
    prompt: spec.prompt,
    answer: spec.answer,
    options: shuffle(options.slice()),
    labels,
    showSrc: Boolean(spec.showSrc),
    explain: spec.explain || null,
  };
}

function makeSpotQuestion(item, prompt) {
  const distractors = pickDistractors(item, 3);
  return makeQuestion({
    type: "spot",
    key: item.id + "-spot",
    id: item.id,
    prompt,
    answer: item.id,
    options: [item.id].concat(distractors.map((row) => row.id)),
    labelFor: itemLabel,
  });
}

function makeNameQuestion(item, prompt) {
  const distractors = pickDistractors(item, 3);
  return makeQuestion({
    type: "name",
    key: item.id + "-name",
    id: item.id,
    prompt,
    answer: item.id,
    options: [item.id].concat(distractors.map((row) => row.id)),
    labelFor: itemLabel,
    showSrc: true,
  });
}

function makeOrderQuestion(item, prompt) {
  const n = (item.steps && item.steps.en ? item.steps.en : []).length;
  const options = [];
  for (let i = 0; i < n; i += 1) {
    options.push({
      id: String(i),
      en: item.steps.en[i],
      zh: item.steps.zh[i],
    });
  }
  const ids = options.map((row) => row.id);
  return makeQuestion({
    type: "order",
    key: item.id + "-order",
    id: item.id,
    prompt,
    answer: ids.join(","),
    options,
    showSrc: true,
  });
}

function buildCheckDeck() {
  const volume = byId("volume-glassware");
  const heating = byId("heating-dropper");
  const bunsen = byId("bunsen-parts");
  const evapPhoto = byId("evaporation-photo");
  const filtration = byId("filtration-photo");
  const evapDiagram = byId("evaporation-diagram");
  const crucible = byId("crucible-setup");
  const boil = byId("eight-pieces");
  const watch = byId("watchglass-bath");

  return shuffle([
    makeNameQuestion(byId("tubes-beakers"), {
      en: "Which notes page shows a test tube, beaker, measuring cylinder and filter funnel?",
      zh: "哪一頁筆記顯示試管、燒杯、量筒和漏斗？",
    }),
    makeNameQuestion(byId("flasks-dishes"), {
      en: "Which page shows a conical flask, round-bottomed flask, evaporating dish and watch glass?",
      zh: "哪一頁顯示錐形瓶、圓底燒瓶、蒸發皿和錶面玻璃？",
    }),
    makeSpotQuestion(volume, {
      en: "Which chart is about measuring the volume of a liquid?",
      zh: "哪一張圖是關於量度液體體積？",
    }),
    makeNameQuestion(byId("pouring"), {
      en: "Liquid is poured along a glass rod onto filter paper. Which diagram is this?",
      zh: "液體沿玻璃棒倒在濾紙上。這是哪一張圖？",
    }),
    makeQuestion({
      type: "trap",
      key: "dropper-not-heat",
      id: heating.id,
      prompt: {
        en: "The dropper on the heating notes page is used to —",
        zh: "加熱筆記頁上的滴管用來 —",
      },
      answer: "drops",
      options: [
        { id: "drops", en: "Add liquid in drops — it is not a heating tool", zh: "逐滴加液 — 它不是加熱工具" },
        { id: "heat", en: "Heat a liquid over the Bunsen flame", zh: "在本生燈火焰上加熱液體" },
        { id: "gauze", en: "Spread the flame under the evaporating dish", zh: "在蒸發皿下分散火焰" },
        { id: "stand", en: "Support the beaker on the tripod", zh: "在三腳架上承住燒杯" },
      ],
      explain: heating.trap,
    }),
    makeNameQuestion(byId("rod-thermo-crucible"), {
      en: "Which page shows a glass rod, a thermometer and a crucible?",
      zh: "哪一頁顯示玻璃棒、溫度計和坩堝？",
    }),
    makeOrderQuestion(bunsen, {
      en: "Light a Bunsen burner. Tap the steps in order.",
      zh: "點燃本生燈。按正確次序點選步驟。",
    }),
    makeQuestion({
      type: "part",
      key: "evaporation-photo-X",
      id: evapPhoto.id,
      prompt: {
        en: "In the sea-water photo, what is X?",
        zh: "在海水照片中，X 是甚麼？",
      },
      answer: "X",
      options: evapPhoto.parts.map((part) => ({ id: part.id, en: part.en, zh: part.zh })),
      showSrc: true,
      explain: {
        en: "W evaporating dish, X wire gauze, Y tripod, Z Bunsen burner.",
        zh: "W 蒸發皿，X 鐵絲網，Y 三腳架，Z 本生燈。",
      },
    }),
    makeOrderQuestion(filtration, {
      en: "Filter mud from sea water. Tap the steps in order.",
      zh: "過濾泥和水。按正確次序點選步驟。",
    }),
    makeQuestion({
      type: "same",
      key: "evaporation-same",
      id: evapDiagram.id,
      prompt: {
        en: "This exam drawing is the same set-up as which photo?",
        zh: "這張考試繪圖與哪一張照片是同一裝置？",
      },
      answer: "evaporation-photo",
      options: ["evaporation-photo", "filtration-photo", "watchglass-bath", "eight-pieces"],
      labelFor: itemLabel,
      showSrc: true,
      explain: {
        en: "Same set-up — photo vs exam drawing: evaporating dish on wire gauze over a Bunsen burner.",
        zh: "同一裝置 — 照片對考試繪圖：蒸發皿放在鐵絲網上，下面是本生燈。",
      },
    }),
    makeNameQuestion(crucible, {
      en: "A solid is heated strongly. Which set-up is this?",
      zh: "固體被強熱。這是哪一個裝置？",
    }),
    makeNameQuestion(boil, {
      en: "About 200 cm³ of water is boiled. Which set-up is this?",
      zh: "約 200 cm³ 水被煮沸。這是哪一個裝置？",
    }),
    makeNameQuestion(watch, {
      en: "A small amount of solid is warmed gently. Which set-up is this?",
      zh: "少量固體被溫和加熱。這是哪一個裝置？",
    }),
    makeQuestion({
      type: "job",
      key: "volume-accurate",
      id: volume.id,
      prompt: {
        en: "Which apparatus makes an accurate measurement of liquid volume?",
        zh: "哪一件儀器能準確量度液體體積？",
      },
      answer: "pipette",
      options: ["pipette", "measuring-cylinder", "beaker", "test-tube"],
      labelFor: pieceLabel,
      explain: volume.exam,
    }),
    makeQuestion({
      type: "job",
      key: "meniscus-read",
      id: volume.id,
      prompt: {
        en: "Where do you read the volume of water in a measuring cylinder?",
        zh: "量筒中水的體積應在哪裏讀取？",
      },
      answer: "bottom",
      options: [
        { id: "bottom", en: "The bottom of the meniscus", zh: "彎月面底部" },
        { id: "top", en: "The top of the meniscus", zh: "彎月面頂部" },
        { id: "spout", en: "The pouring spout", zh: "倒出口" },
        { id: "base", en: "The highest graduation on the cylinder", zh: "量筒最高刻度" },
      ],
      explain: volume.terms[0].def,
    }),
    makeQuestion({
      type: "trap",
      key: "crucible-triangle",
      id: crucible.id,
      prompt: {
        en: "A solid is heated strongly in a crucible. What supports the crucible?",
        zh: "固體在坩堝中被強熱。甚麼承住坩堝？",
      },
      answer: "triangle",
      options: [
        { id: "triangle", en: "A pipe-clay triangle on a tripod", zh: "三腳架上的泥三角" },
        { id: "gauze", en: "Wire gauze on a tripod", zh: "三腳架上的鐵絲網" },
        { id: "watch", en: "A watch glass over a water bath", zh: "水浴上的錶面玻璃" },
        { id: "funnel", en: "A filter funnel and filter paper", zh: "漏斗和濾紙" },
      ],
      explain: crucible.trap,
    }),
  ]);
}

function cloneQuestion(q) {
  return { ...q, options: shuffle(q.options.slice()), labels: q.labels };
}
