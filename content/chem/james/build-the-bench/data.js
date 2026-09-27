const APPARATUS = [
  { id: "beaker", letter: "(a)", name: "Beaker", easy: "A glass cup for holding, mixing, or heating a larger amount of liquid.", exam: "Contains / mixes solutions; boils about 200 cm³ of water.", photo: true, diagram: true },
  { id: "test-tube", letter: "(b)", name: "Test tube", easy: "A small glass tube for a little liquid or a small reaction.", exam: "Mixes solutions to observe changes; heats a few cm³ of liquid.", photo: true, diagram: true },
  { id: "conical-flask", letter: "(c)", name: "Conical flask", easy: "Wide bottom, narrow neck — easy to swirl without spilling.", exam: "Contains a solution that is shaken or swirled.", photo: true, diagram: true },
  { id: "filter-funnel", letter: "(d)", name: "Filter funnel", easy: "A cone that holds filter paper to separate solid from liquid.", exam: "Filters a suspension.", photo: true, diagram: true },
  { id: "glass-rod", letter: "(e)", name: "Glass rod", easy: "A stick for stirring, or for pouring liquid onto filter paper.", exam: "Stirs a mixture; guides liquid onto filter paper.", photo: true, diagram: true },
  { id: "dropper", letter: "(f)", name: "Dropper", easy: "Adds liquid one drop at a time.", exam: "Adds drop quantities of a liquid.", photo: true, diagram: true },
  { id: "tripod", letter: "(g)", name: "Tripod", easy: "A three-legged stand that sits over a Bunsen burner.", exam: "Supports a wire gauze or pipe-clay triangle over a Bunsen burner.", photo: true, diagram: true },
  { id: "wire-gauze", letter: "(h)", name: "Wire gauze", easy: "Metal mesh that spreads heat under a beaker.", exam: "Supports a beaker or evaporating dish on a tripod while heating.", photo: true, diagram: true },
  { id: "evaporating-dish", letter: "(i)", name: "Evaporating dish", easy: "A shallow dish. Heat a solution until only solid is left.", exam: "Contains a solution which is to be evaporated to dryness.", photo: true, diagram: true },
  { id: "bunsen-burner", letter: "(j)", name: "Bunsen burner", easy: "Makes a flame for heating. Stand it on a heat-resistant mat.", exam: "Provides a flame for heating.", photo: true, diagram: true },
  { id: "measuring-cylinder", letter: "", name: "Measuring cylinder", easy: "A tall marked tube for measuring liquid volume.", exam: "Measure the volume of a liquid.", photo: true, diagram: true },
  { id: "round-bottomed-flask", letter: "", name: "Round-bottomed flask", easy: "Round bottom — it cannot stand by itself. Use a clamp.", exam: "Contains a liquid, often held with a stand and clamp.", photo: true, diagram: true },
  { id: "watch-glass", letter: "", name: "Watch glass", easy: "A small curved glass dish for a pinch of solid, or as a cover.", exam: "Holds a small amount of solid, or covers a beaker.", photo: true, diagram: true },
  { id: "thermometer", letter: "", name: "Thermometer", easy: "Tells you how hot or cold something is.", exam: "Measures temperature.", photo: true, diagram: true },
  { id: "crucible", letter: "", name: "Crucible", easy: "A small ceramic pot for heating a solid very strongly.", exam: "Contains a solid which is heated strongly.", photo: true, diagram: true },
  { id: "heat-proof-mat", letter: "", name: "Heat-resistant mat", easy: "Protects the bench from a hot flame or hot glass.", exam: "Provides a heat-resistant surface for placing a hot object / Bunsen burner.", photo: true, diagram: false },
  { id: "stand-and-clamp", letter: "", name: "Stand and clamp", easy: "Holds apparatus still, such as a funnel or flask.", exam: "Supports apparatus (e.g. a funnel or flask).", photo: true, diagram: true },
  { id: "test-tube-holder", letter: "", name: "Test tube holder", easy: "A clip so you can heat a test tube without burning your fingers.", exam: "Holds a test tube for heating.", photo: true, diagram: false },
  { id: "test-tube-rack", letter: "", name: "Test tube rack", easy: "Keeps test tubes upright on the bench.", exam: "Holds test tubes upright.", photo: true, diagram: false },
  { id: "spatula", letter: "", name: "Spatula", easy: "A small scoop for moving a little bit of solid, like salt.", exam: "Transfers a small amount of a solid.", photo: true, diagram: false },
  { id: "pestle-and-mortar", letter: "", name: "Mortar and pestle", easy: "A bowl and grinder for crushing a solid into powder.", exam: "Grinds a solid into fine powder.", photo: true, diagram: false },
  { id: "gas-jar", letter: "", name: "Gas jar", easy: "A tall jar for collecting a gas.", exam: "Collects a gas.", photo: true, diagram: false },
  { id: "desiccator", letter: "", name: "Desiccator", easy: "A lidded pot that keeps a solid dry.", exam: "Dries a solid.", photo: true, diagram: false },
  { id: "electronic-balance", letter: "", name: "Electronic balance", easy: "A digital scale for finding the mass of something.", exam: "Measures the mass of an object (up to 0.0001 g in the exercise).", photo: true, diagram: false },
];

const STREAK_TIERS = [
  { min: 0, label: "Ready", vibe: "calm", note: "Correct answers in a row" },
  { min: 1, label: "Getting started", vibe: "warm", note: "First correct answer" },
  { min: 2, label: "Focused", vibe: "hot", note: "Two in a row" },
  { min: 3, label: "Steady", vibe: "fire", note: "Keep checking the model answer" },
  { min: 5, label: "Confident", vibe: "scary", note: "Five correct in a row" },
  { min: 7, label: "Lab ready", vibe: "boss", note: "Work carefully and keep going" },
  { min: 10, label: "Excellent", vibe: "mythic", note: "Ten in a row — stay accurate" },
  { min: 15, label: "Outstanding", vibe: "final", note: "Fifteen in a row. Keep that standard" },
];

const WIN_MEMES = [
  "That matches the model answer.",
  "Clear and accurate.",
  "Well chosen.",
  "Keep that standard.",
  "Good laboratory thinking.",
];

const MISS_MEMES = [
  "Check the model answer below.",
  "A common mix-up — read the note.",
  "Compare the shape once more.",
  "Use the hint, then try again.",
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

const PRAISE = [
  "Well spotted — that is exactly right.",
  "You read the shape carefully. Well done.",
  "That would score the mark.",
  "You chose the right apparatus.",
  "Nice work — keep looking at the details.",
  "The photo and the name agree.",
  "On to the next one.",
  "That is the model answer.",
  "A clean match.",
  "You compared the outline, not a guess.",
  "Trust that same careful look next time.",
  "The shape, the job, and the name all line up.",
  "Full mark on this one. Keep going.",
  "You noticed the detail that matters.",
  "That is how this question is marked.",
];

const WIN_TITLES = [
  "Correct — well done",
  "Yes — that is it",
  "Well chosen",
  "Full mark",
  "That’s the one",
  "Excellent match",
  "Got it in one",
  "Accurate work",
];

const STREAK_TITLES = [
  "{n} in a row — well done",
  "{n} correct in a row — keep going",
  "{n} in a row. Stay accurate",
  "{n} consecutive correct answers",
];

const MISS_TITLES = [
  "Not this time — check the model answer",
  "Close — have another look",
  "Not yet. Read the note below",
  "Almost — try once more",
  "Have another go",
  "Use the hint, then choose again",
];

const MISS_BODIES = [
  "Read the short explanation, then try again.",
  "First picks can be wrong. Compare the shape once more.",
  "Use the hint below, then choose again.",
  "Look at the outline, not the first name that comes to mind.",
  "Read what the question is actually asking.",
  "Pause, see why this one is different, then try a fresh answer.",
];

const PARTIAL_TITLES = [
  "Some of this set-up is already correct",
  "Part of the match is right — keep going",
  "Several slots are already correct",
  "You are part-way there",
];

const PARTIAL_BODIES = [
  "Keep the green matches, fix the rest, and check again.",
  "Do not clear the whole answer. Hold what is right and finish the gaps.",
  "Some ticks are already in place. Complete the rest carefully.",
  "One more careful pass should finish this set-up.",
];

const BUILD = [
  {
    id: "few",
    title: "Heat a few cm³ of water",
    easy: "Only a little liquid — use a test tube, not a beaker.",
    exam: "Topic 01 Q.6(iii).",
    ask: "images/setup-eight-pieces.jpg",
    askCaption: "The photo shows pieces A–H. Choose the ones this job needs.",
    reveal: "",
    safety: "Point the mouth of the test tube away from people.",
    follow: "Heating a few cm³ of liquid uses a test tube held in a test tube holder.",
    slots: [
      { id: "1", label: "On the bench", answer: "heat-proof-mat", why: "The Bunsen burner stands on a heat-resistant mat so the bench does not scorch." },
      { id: "2", label: "Heat source", answer: "bunsen-burner", why: "The heat source is a Bunsen burner." },
      { id: "3", label: "Holds the tube", answer: "test-tube-holder", why: "Hold the test tube with a test tube holder. Your fingers must stay off the hot glass." },
      { id: "4", label: "A few cm³ of water", answer: "test-tube", why: "A few cm³ of water goes in a test tube. A beaker is for about 200 cm³." },
    ],
    tray: ["heat-proof-mat", "bunsen-burner", "test-tube-holder", "test-tube", "beaker", "wire-gauze", "tripod", "spatula"],
    mark: "B test tube · C Bunsen burner · F heat-resistant mat · G test tube holder",
  },
  {
    id: "boil",
    title: "Boil 200 cm³ of water",
    easy: "A large volume needs a beaker on gauze — not a test tube. Stack from the bench up.",
    exam: "Topic 01 Q.6(iv) and Laboratory safety: heat a large quantity in a beaker on a tripod and wire gauze.",
    ask: "",
    askCaption: "Build this from the description, from the bench upward. The diagram appears when the set-up is correct.",
    reveal: "images/diagram-beaker-heating.jpg",
    revealCaption: "Diagram from the notes. It shows the beaker, wire gauze and tripod. The mat and the Bunsen burner sit below the tripod.",
    safety: "Stand the Bunsen burner on the mat. Do not fill the beaker to the brim.",
    follow: "Boiling about 200 cm³ of water uses a beaker on wire gauze, on a tripod, over a Bunsen burner.",
    slots: [
      { id: "1", label: "On the bench", answer: "heat-proof-mat", why: "The burner stands on a heat-resistant mat." },
      { id: "2", label: "Heat source", answer: "bunsen-burner", why: "The heat source is a Bunsen burner." },
      { id: "3", label: "Stand", answer: "tripod", why: "A tripod stands over the burner and supports the gauze." },
      { id: "4", label: "Spreads the heat", answer: "wire-gauze", why: "Wire gauze spreads the flame under a beaker. A pipe-clay triangle is for a crucible." },
      { id: "5", label: "Holds 200 cm³", answer: "beaker", why: "200 cm³ is a large volume. Use a beaker, not a test tube." },
    ],
    tray: ["heat-proof-mat", "bunsen-burner", "tripod", "wire-gauze", "beaker", "test-tube", "evaporating-dish", "conical-flask"],
    mark: "Heat-resistant mat, Bunsen burner, tripod, wire gauze, beaker",
  },
  {
    id: "crucible",
    title: "Heat a solid very strongly",
    easy: "A crucible sits on a pipe-clay triangle on a tripod — not on wire gauze.",
    exam: "Laboratory safety notes: very strong heating of a solid in a crucible.",
    ask: "",
    askCaption: "Build this from the description, from the bench upward. The diagram appears when the set-up is correct.",
    reveal: "images/diagram-crucible-setup.jpg",
    revealCaption: "Diagram from the notes. The exam name is pipe-clay triangle.",
    safety: "Do not pick up a hot crucible with your fingers. Use tongs.",
    follow: "A crucible contains a solid which is heated strongly. The pipe-clay triangle supports the crucible on the tripod.",
    slots: [
      { id: "1", label: "On the bench", answer: "heat-proof-mat", why: "The burner stands on a heat-resistant mat." },
      { id: "2", label: "Heat source", answer: "bunsen-burner", why: "The heat source is a Bunsen burner." },
      { id: "3", label: "Stand", answer: "tripod", why: "The tripod supports the pipe-clay triangle over the flame." },
      { id: "4", label: "Supports the crucible", answer: "pipe-clay-triangle", why: "A crucible sits in a pipe-clay triangle. Wire gauze is for a beaker or an evaporating dish." },
      { id: "5", label: "Holds the solid", answer: "crucible", why: "A solid heated very strongly goes in a crucible. An evaporating dish is for a solution." },
    ],
    tray: ["heat-proof-mat", "bunsen-burner", "tripod", "pipe-clay-triangle", "crucible", "wire-gauze", "evaporating-dish", "beaker"],
    mark: "Heat-resistant mat, Bunsen burner, tripod, pipe-clay triangle, crucible",
  },
  {
    id: "evap",
    title: "Salt from sea water",
    easy: "Build the evaporation set-up. Place each piece into W, X, Y and Z.",
    exam: "Topic 01 Q.3 — obtaining common salt from sea water.",
    ask: "images/setup-evaporation.jpg",
    askCaption: "Match W, X, Y and Z on the photo. The named diagram appears when the set-up is correct.",
    reveal: "images/diagram-evaporation-setup.jpg",
    revealCaption: "Diagram from the notes. It may say evaporating basin. The exam name is evaporating dish.",
    safety: "Keep the flame under the tripod, and keep the burner on the mat.",
    follow: "The evaporating dish contains the sea water. Heating it to dryness leaves the salt in the dish.",
    slots: [
      { id: "W", label: "W · top", answer: "evaporating-dish", why: "W is the evaporating dish. The sea water is heated there until only salt is left." },
      { id: "X", label: "X", answer: "wire-gauze", why: "X is the wire gauze. It supports the dish on the tripod." },
      { id: "Y", label: "Y", answer: "tripod", why: "Y is the tripod. It holds the gauze over the flame." },
      { id: "Z", label: "Z · heat", answer: "bunsen-burner", why: "Z is the Bunsen burner. It supplies the heat." },
    ],
    tray: ["evaporating-dish", "wire-gauze", "tripod", "bunsen-burner", "beaker", "crucible", "conical-flask", "heat-proof-mat"],
    mark: "W evaporating dish · X wire gauze · Y tripod · Z Bunsen burner",
  },
  {
    id: "bath",
    title: "Evaporate a few drops on a watch glass",
    easy: "A few drops of solution sit on a watch glass over a beaker of boiling water. The heating is gentle.",
    exam: "Topic 01 Q.10 step 4 — water-bath evaporation.",
    ask: "",
    askCaption: "Build this from the description, from the bench upward. The photo appears when the set-up is correct.",
    reveal: "images/setup-watchglass-bath.jpg",
    revealCaption: "Set-up from the notes, shown after a correct check.",
    safety: "A water bath is gentler than a direct flame. Do not let the beaker boil dry.",
    follow: "The watch glass holds a few drops of solution. The beaker holds the boiling water, so the drops are not heated by the flame directly.",
    slots: [
      { id: "1", label: "On the bench", answer: "heat-proof-mat", why: "The burner stands on a heat-resistant mat." },
      { id: "2", label: "Heat source", answer: "bunsen-burner", why: "The heat source is a Bunsen burner." },
      { id: "3", label: "Stand", answer: "tripod", why: "The tripod supports the gauze over the burner." },
      { id: "4", label: "Spreads the heat", answer: "wire-gauze", why: "Wire gauze spreads the heat under the beaker of boiling water." },
      { id: "5", label: "Boiling water", answer: "beaker", why: "The beaker holds the boiling water. That water heats the watch glass gently." },
      { id: "6", label: "Holds the drops", answer: "watch-glass", why: "The watch glass holds the few drops. They are not heated directly by the flame." },
    ],
    tray: ["heat-proof-mat", "bunsen-burner", "tripod", "wire-gauze", "beaker", "watch-glass", "evaporating-dish", "test-tube"],
    mark: "Heat-resistant mat, Bunsen burner, tripod, wire gauze, beaker, watch glass",
  },
  {
    id: "filt",
    title: "Mud and sea water",
    easy: "Build the filtration set-up. Pour down a glass rod into a funnel.",
    exam: "Topic 01 Q.4 — separating mud from sea water.",
    ask: "images/setup-filtration.jpg",
    askCaption: "Match P, Q, R, S and T on the photo.",
    reveal: "",
    safety: "",
    follow: "The beaker (T) collects the filtrate. The mud remains on the filter paper (R) as the residue.",
    slots: [
      { id: "P", label: "P · pour", answer: "glass-rod", why: "P is the glass rod. Pour down the rod so the mixture runs into the paper." },
      { id: "Q", label: "Q · support", answer: "stand-and-clamp", why: "Q is the stand and clamp. It holds the funnel still." },
      { id: "R", label: "R · in the funnel", answer: "filter-paper", why: "R is the filter paper inside the funnel. The mud stays on it as the residue." },
      { id: "S", label: "S · funnel", answer: "filter-funnel", why: "S is the filter funnel. It holds the paper. The stem is part of the funnel." },
      { id: "T", label: "T · collect", answer: "beaker", why: "T is a beaker. It collects the filtrate. A measuring cylinder is for measuring a volume." },
    ],
    tray: ["glass-rod", "stand-and-clamp", "filter-paper", "filter-funnel", "beaker", "dropper", "conical-flask", "measuring-cylinder"],
    mark: "P glass rod · Q stand and clamp · R filter paper · S filter funnel · T beaker",
  },
];

const TRAY_META = {
  "filter-paper": { name: "Filter paper", photo: false },
  "pipe-clay-triangle": { name: "Pipe-clay triangle", photo: false },
};

function trayName(id) {
  if (TRAY_META[id]) return TRAY_META[id].name;
  const item = byId(id);
  return item ? item.name : id;
}

function trayHasPhoto(id) {
  if (TRAY_META[id]) return false;
  return true;
}

function trayHasDiagram(id) {
  if (TRAY_META[id]) return false;
  const item = byId(id);
  return Boolean(item && item.diagram);
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
