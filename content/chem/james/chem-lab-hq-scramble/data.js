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

const JOB_HELP = {
  1: { trap: "Common mix-up: measuring cylinder = measure the volume of a liquid (Q.5.9), not a gas. Tip: write gas syringe." },
  4: { trap: "Common mix-up: thermometer measures temperature. Q.5 stir a mixture = glass rod." },
  6: { trap: "Common mix-up: evaporating dish = solution evaporated to dryness (Q.5.16). Crucible = solid heated strongly (Q.5.6)." },
  9: { trap: "Common mix-up: a beaker contains / mixes solutions. It is not the Q.5 answer for measure the volume of a liquid." },
  10: { trap: "Common mix-up: measuring cylinder = volume of a liquid (Q.5.9). Dropper = add drop quantities of a liquid (Q.5.10)." },
  11: { trap: "Common mix-up: beaker can collect filtrate, but Q.5.11 is filter funnel — filter a suspension." },
  14: { trap: "Common mix-up: either test tube or beaker scores. Do not write evaporating dish or crucible." },
  16: { trap: "Common mix-up: watch glass holds a small amount of solid. Q.5.16 is evaporating dish — solution evaporated to dryness." },
};

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
  "That does not score. Read the note, then go on.",
];

const JOB_Q = [
  { n: 1, easy: "You need to catch a gas and see how much there is.", exam: "Collect and measure the volume of a gas", answer: "Gas syringe", options: [{ id: null, label: "Gas syringe", diagram: "images/diagram-gas-syringe.jpg" }, { id: "conical-flask", label: "Conical flask" }, { id: "measuring-cylinder", label: "Measuring cylinder" }, { id: "dropper", label: "Dropper" }] },
  { n: 4, easy: "Mix a liquid by stirring.", exam: "Stir a mixture", answer: "Glass rod", options: [{ id: "glass-rod", label: "Glass rod" }, { id: "beaker", label: "Beaker" }, { id: "thermometer", label: "Thermometer" }, { id: "dropper", label: "Dropper" }] },
  { n: 6, easy: "Heat a solid very strongly (hotter than a dish of solution).", exam: "Contains a solid which is heated strongly", answer: "Crucible", options: [{ id: "crucible", label: "Crucible" }, { id: "evaporating-dish", label: "Evaporating dish" }, { id: "beaker", label: "Beaker" }, { id: "watch-glass", label: "Watch glass" }] },
  { n: 9, easy: "Measure 10 cm³ of a liquid carefully.", exam: "Measure the volume of a liquid", answer: "Measuring cylinder", options: [{ id: "measuring-cylinder", label: "Measuring cylinder" }, { id: "beaker", label: "Beaker" }, { id: "conical-flask", label: "Conical flask" }, { id: "dropper", label: "Dropper" }] },
  { n: 10, easy: "Add liquid a few drops at a time.", exam: "Add drop quantities of a liquid", answer: "Dropper", options: [{ id: "dropper", label: "Dropper" }, { id: "measuring-cylinder", label: "Measuring cylinder" }, { id: "glass-rod", label: "Glass rod" }, { id: "thermometer", label: "Thermometer" }] },
  { n: 11, easy: "Separate muddy water into mud and water.", exam: "Filter a suspension", answer: "Filter funnel", options: [{ id: "filter-funnel", label: "Filter funnel" }, { id: "evaporating-dish", label: "Evaporating dish" }, { id: "beaker", label: "Beaker" }, { id: "conical-flask", label: "Conical flask" }] },
  { n: 14, easy: "Mix two solutions in a small amount and watch if anything happens.", exam: "Mix solutions for observing any changes", answer: "Test tube / beaker", options: [{ id: "test-tube", label: "Test tube / beaker" }, { id: "evaporating-dish", label: "Evaporating dish" }, { id: "measuring-cylinder", label: "Measuring cylinder" }, { id: "crucible", label: "Crucible" }] },
  { n: 16, easy: "Heat a salt solution until only dry salt is left.", exam: "Contain a solution which is to be evaporated to dryness", answer: "Evaporating dish", options: [{ id: "evaporating-dish", label: "Evaporating dish" }, { id: "beaker", label: "Beaker" }, { id: "crucible", label: "Crucible" }, { id: "watch-glass", label: "Watch glass" }] },
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
  "Close — read the model answer",
  "Not yet. Read the note below",
  "That does not score",
  "Read the model answer, then go on",
  "A common mix-up — see the note",
];

const MISS_BODIES = [
  "That does not score. Read the model answer, then go on.",
  "First picks can be wrong. Compare the shape, then continue.",
  "Use the hint below, then go to the next question.",
  "Look at the outline, not the first name that comes to mind.",
  "Read what the question is actually asking.",
  "Pause, see why this one is different, then continue.",
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

const TREE_Q = [
  {
    id: "vol",
    theme: "Precision vs rough containers",
    scene: "images/notes-volume-glassware.jpg",
    sceneCaption: "Laboratory safety notes §M",
    scenario: "You need to accurately measure 23.5 cm³ of dilute hydrochloric acid.",
    exam: "Pipette, burette and volumetric flask make accurate measurements of liquid volumes. A measuring cylinder makes a rough measurement.",
    options: [
      { label: "Beaker", id: "beaker", ok: false, fail: "Q.5: beaker contains / mixes solutions; boils about 200 cm³ of water.", trap: "Common mix-up: a beaker is not in notes §M with pipette / burette / volumetric flask. Those three make accurate volume measurements." },
      { label: "Measuring cylinder", id: "measuring-cylinder", ok: false, fail: "Notes §M: a measuring cylinder makes a rough measurement of liquid volume.", trap: "Common mix-up: Q.5.9 is measure the volume of a liquid = measuring cylinder. Accurate 23.5 cm³ is pipette / burette / volumetric flask." },
      { label: "Burette", ok: true, why: "Notes §M: pipette, burette and volumetric flask make accurate measurements of liquid volumes." },
    ],
  },
  {
    id: "hold",
    theme: "Precision vs rough containers",
    scenario: "You only need to hold and swirl a solution — you are not measuring a volume.",
    exam: "Conical flask: contains a solution that is shaken or swirled.",
    options: [
      { label: "Measuring cylinder", id: "measuring-cylinder", ok: false, fail: "Q.5.9: measuring cylinder — measure the volume of a liquid.", trap: "Common mix-up: do not swirl in a measuring cylinder. Tip: volume tool ≠ mixing flask." },
      { label: "Conical flask", id: "conical-flask", ok: true, why: "Contains a solution that is shaken or swirled." },
      { label: "Burette", ok: false, fail: "Notes §M: burette makes accurate measurements of liquid volumes.", trap: "Common mix-up: burette is for accurate volume, not swirling." },
    ],
  },
  {
    id: "heat-liq",
    theme: "Heating apparatus rules",
    scene: "images/diagram-beaker-heating.jpg",
    sceneCaption: "Notes: large quantity of liquid in a beaker on tripod and wire gauze",
    scenario: "You need to boil about 200 cm³ of water.",
    exam: "Q.6(iv): beaker, Bunsen burner, wire gauze, tripod, heat-resistant mat.",
    options: [
      { label: "Test tube on a holder", id: "test-tube", ok: false, fail: "Q.6(iii): heating a few cm³ of water — test tube, Bunsen burner, heat-resistant mat, test tube holder.", trap: "Common mix-up: few cm³ → test tube. 200 cm³ → beaker. Tip: match the volume in the question." },
      { label: "Beaker on tripod and wire gauze", id: "beaker", ok: true, why: "Q.6(iv): beaker, Bunsen burner, wire gauze, tripod, heat-resistant mat. Notes: heat a large quantity of liquid in a beaker on a tripod and wire gauze." },
      { label: "Crucible on a pipe-clay triangle", id: "crucible", ok: false, fail: "Q.5.6: crucible contains a solid which is heated strongly. Pipeclay triangle supports a crucible on a tripod.", trap: "Common mix-up: crucible is for a solid, not 200 cm³ of water." },
    ],
  },
  {
    id: "heat-sol",
    theme: "Heating apparatus rules",
    scene: "images/diagram-crucible-setup.jpg",
    sceneCaption: "Notes: solid heated strongly in a crucible on a pipe-clay triangle",
    scenario: "You need to heat a solid very strongly.",
    exam: "Crucible contains a solid which is heated strongly. A pipeclay triangle supports the crucible on a tripod.",
    options: [
      { label: "Evaporating dish on wire gauze", id: "evaporating-dish", ok: false, fail: "Q.5.16: evaporating dish contains a solution which is to be evaporated to dryness. Wire gauze supports a beaker or evaporating dish on a tripod while heating.", trap: "Common mix-up: dish = solution to dryness. Crucible = solid heated strongly." },
      { label: "Beaker on wire gauze", id: "beaker", ok: false, fail: "Q.5: beaker contains / mixes solutions; boils about 200 cm³ of water.", trap: "Common mix-up: beaker is for liquid. Strong heating of a solid is the crucible line." },
      { label: "Crucible on a pipe-clay triangle", id: "crucible", ok: true, why: "Contains a solid which is heated strongly. Pipeclay triangle supports a crucible on a tripod." },
    ],
  },
  {
    id: "solid",
    theme: "Solid handling",
    scenario: "Transfer a small amount of solid powder (for example sodium chloride) from a bottle into a test tube.",
    exam: "Q.6(i): spatula only. Notes: spatulas pick up small amounts of solids.",
    options: [
      { label: "Spatula", id: "spatula", ok: true, why: "Q.6(i): spatula only. Notes: spatulas pick up small amounts of solids." },
      { label: "Tongs", ok: false, fail: "Q.5: tongs pick up a hot evaporating dish.", trap: "Common mix-up: tongs = hot dish, not powder. Tip: spatula for a small amount of solid." },
      { label: "Dropper", id: "dropper", ok: false, fail: "Q.5.10: dropper — add drop quantities of a liquid.", trap: "Common mix-up: dropper is liquid drops, not solid." },
    ],
  },
  {
    id: "hot",
    theme: "Solid handling",
    scenario: "The evaporating dish (or crucible) is hot. You must move it.",
    exam: "Q.5: tongs pick up a hot evaporating dish.",
    options: [
      { label: "Spatula", id: "spatula", ok: false, fail: "Q.6(i): spatula — transferring a small amount of solid.", trap: "Common mix-up: spatula scoops solid. Hot dish = tongs." },
      { label: "Tongs / crucible tongs", ok: true, why: "Q.5: tongs pick up a hot evaporating dish." },
      { label: "Bare hands", ok: false, fail: "Q.5: tongs pick up a hot evaporating dish.", trap: "Common mix-up: never write bare hands. Tip: the model answer is tongs." },
    ],
  },
  {
    id: "light",
    theme: "Heating apparatus rules",
    scene: "images/diagram-bunsen-parts.jpg",
    sceneCaption: "Notes: how to light a Bunsen burner",
    scenario: "You are about to light a Bunsen burner.",
    exam: "Close the air hole first. Put a lighted match near the top of the barrel. Then turn on the gas tap. Open the air hole slowly until the flame is non-luminous.",
    options: [
      { label: "Open the air hole, then turn on the gas", ok: false, fail: "Notes: close the air hole first. Put a lighted match near the top of the barrel. Then turn on the gas tap.", trap: "Common mix-up: air hole is closed when lighting, then opened slowly. Tip: closed first is not a mistake." },
      { label: "Close the air hole, light a match at the barrel, then turn on the gas", ok: true, why: "Notes: close the air hole first. Put a lighted match near the top of the barrel. Then turn on the gas tap. Open the air hole slowly until the flame is non-luminous." },
      { label: "Turn on the gas, then look for a match", ok: false, fail: "Notes: put a lighted match near the top of the barrel, then turn on the gas tap.", trap: "Common mix-up: match at the barrel before the gas tap." },
    ],
  },
];

const SAFETY_Q = [
  {
    id: "bu-3",
    theme: "Bunsen burner",
    scenario: "When the air hole is open, the Bunsen flame is…",
    exam: "Open air hole → more complete burning → non-luminous blue flame with a high temperature.",
    options: [
      { label: "luminous and yellow, with a lower temperature", ok: false, fail: "That is the closed-air-hole flame.", trap: "Common mix-up: closed air hole = luminous yellow, cooler. Open air hole = non-luminous blue, hotter." },
      { label: "non-luminous and blue, with a high temperature", ok: true, why: "Open air hole → more complete burning → non-luminous blue flame with a high temperature." },
      { label: "invisible", ok: false, fail: "The non-luminous flame is blue, not invisible.", trap: "Common mix-up: non-luminous means not yellow/sooty — it is still a visible blue flame." },
      { label: "green and cool", ok: false, fail: "A Bunsen flame is not green.", trap: "Common mix-up: colour and temperature are set by the air hole, not a green cool flame." },
    ],
  },
  {
    id: "bu-4",
    theme: "Bunsen burner",
    scenario: "The gas tap controls the supply of gaseous fuel, hence the _____ of the flame.",
    exam: "Gas tap → size of the flame. Air hole → luminosity and temperature.",
    options: [
      { label: "colour only", ok: false, fail: "Colour (luminosity) is controlled by the air hole.", trap: "Common mix-up: air hole changes colour and temperature. Gas tap changes size." },
      { label: "size", ok: true, why: "The gas tap controls the supply of gaseous fuel, hence the size of the flame." },
      { label: "direction", ok: false, fail: "The gas tap does not aim the flame.", trap: "Common mix-up: gas tap = how much fuel = size, not direction." },
      { label: "smell", ok: false, fail: "Smell is not a Bunsen control.", trap: "Common mix-up: gas tap = size; air hole = luminosity and temperature." },
    ],
  },
  {
    id: "bu-5",
    theme: "Bunsen burner",
    scenario: "When the air hole is closed, burning is more complete and the flame is non-luminous.",
    exam: "False. Closed air hole → incomplete burning → luminous yellow flame.",
    options: [
      { label: "True", ok: false, fail: "Closed air hole gives incomplete burning and a luminous yellow flame.", trap: "Common mix-up: closed = yellow / incomplete. Open = blue / complete / non-luminous." },
      { label: "False", ok: true, why: "Closed air hole → incomplete burning → luminous yellow flame." },
    ],
  },
  {
    id: "te-2",
    theme: "Transferring and mixing",
    scenario: "Unused chemicals may be put back into the reagent bottle.",
    exam: "False. Never put any chemicals back into the reagent bottle.",
    options: [
      { label: "True", ok: false, fail: "Unused chemicals must not go back into the reagent bottle.", trap: "Common mix-up: leftover solid or liquid can contaminate the stock. Tip: never return unused chemicals." },
      { label: "False", ok: true, why: "Never put any chemicals back into the reagent bottle." },
    ],
  },
  {
    id: "ht-1",
    theme: "Heating solids and liquids",
    scenario: "For a solid which gives off water during heating, hold the test tube slightly sloping…",
    exam: "Hold the test tube slightly sloping downwards so condensed water does not run back onto hot glass.",
    options: [
      { label: "upwards", ok: false, fail: "Water would run back onto hot glass and may crack the tube.", trap: "Common mix-up: sloping down stops condensed water running back." },
      { label: "downwards", ok: true, why: "Sloping downwards prevents condensed water running back and cracking hot glass." },
      { label: "vertically", ok: false, fail: "A vertical tube lets water run back onto the hot part.", trap: "Common mix-up: solids that give off water need a slight downward slope." },
      { label: "horizontally only", ok: false, fail: "A slight downward slope is required, not a flat tube.", trap: "Common mix-up: downwards, not horizontal, so water cannot run back." },
    ],
  },
  {
    id: "ht-3",
    theme: "Heating solids and liquids",
    scenario: "When heating a non-flammable liquid in a test tube, do not fill the tube to more than _____ of its capacity.",
    exam: "Do not fill the test tube to more than one-third of its capacity.",
    options: [
      { label: "one-half", ok: false, fail: "One-half is too full for safe heating in a test tube.", trap: "Common mix-up: the safety rule is one-third, not half." },
      { label: "one-third", ok: true, why: "When heating a non-flammable liquid in a test tube, do not fill the tube to more than one-third of its capacity." },
      { label: "two-thirds", ok: false, fail: "Two-thirds is far too full.", trap: "Common mix-up: liquid can bump and spit if the tube is more than one-third full." },
      { label: "the top", ok: false, fail: "Never fill a test tube to the top for heating.", trap: "Common mix-up: leave most of the tube empty — one-third at most." },
    ],
  },
  {
    id: "ht-4",
    theme: "Heating solids and liquids",
    scenario: "When heating a liquid in a test tube, you should use a small _____ flame.",
    exam: "Use a small non-luminous flame for heating.",
    options: [
      { label: "luminous", ok: false, fail: "A luminous flame is sooty and cooler — not the heating flame.", trap: "Common mix-up: heating uses a small non-luminous (blue) flame." },
      { label: "non-luminous", ok: true, why: "When heating a liquid in a test tube, use a small non-luminous flame." },
      { label: "yellow smoky", ok: false, fail: "Yellow smoky is the luminous flame.", trap: "Common mix-up: yellow / smoky = air hole closed. Heat with a small blue flame." },
      { label: "invisible", ok: false, fail: "The heating flame is small and non-luminous (blue), not invisible.", trap: "Common mix-up: non-luminous is blue, not invisible." },
    ],
  },
  {
    id: "ht-5",
    theme: "Heating solids and liquids",
    scenario: "A volatile or flammable liquid should be heated using a…",
    exam: "Use a water-bath (or an oil-bath if a higher temperature is required). Do not use a direct Bunsen flame.",
    options: [
      { label: "direct Bunsen flame on the test tube", ok: false, fail: "A direct flame can ignite a flammable or volatile liquid.", trap: "Common mix-up: flammable / volatile → water-bath, not a direct Bunsen flame." },
      { label: "water-bath", ok: true, why: "A volatile or flammable liquid should be heated using a water-bath (or an oil-bath if a higher temperature is required)." },
      { label: "crucible on a tripod", ok: false, fail: "A crucible is for strong heating of a solid.", trap: "Common mix-up: crucible = solid heated strongly. Flammable liquid = water-bath." },
      { label: "gas syringe", ok: false, fail: "A gas syringe collects or measures a gas.", trap: "Common mix-up: gas syringe is not a heater." },
    ],
  },
  {
    id: "ht-6",
    theme: "Heating solids and liquids",
    scenario: "When heating a liquid in a test tube, you should swirl the tube continuously so that heating is uniform.",
    exam: "True. Swirl continuously so that heating is uniform.",
    options: [
      { label: "True", ok: true, why: "When heating a liquid in a test tube, swirl the tube continuously so that heating is uniform." },
      { label: "False", ok: false, fail: "The notes require continuous swirling.", trap: "Common mix-up: a still tube heats unevenly and the liquid can bump." },
    ],
  },
  {
    id: "ga-1",
    theme: "Collecting gases",
    scenario: "Upward delivery (downward displacement of air) is used to collect gases that are…",
    exam: "Upward delivery collects gases less dense than air (e.g. hydrogen, methane, ammonia).",
    options: [
      { label: "denser than air", ok: false, fail: "Denser-than-air gases use downward delivery.", trap: "Common mix-up: upward delivery = less dense than air. Downward delivery = denser than air." },
      { label: "less dense than air", ok: true, why: "Upward delivery (downward displacement of air) is used to collect gases that are less dense than air." },
      { label: "soluble in water only", ok: false, fail: "Solubility chooses water displacement, not upward delivery.", trap: "Common mix-up: density vs air decides upward / downward delivery. Water solubility decides water displacement." },
      { label: "always coloured", ok: false, fail: "Colour is not the rule for upward delivery.", trap: "Common mix-up: compare density with air, not colour." },
    ],
  },
  {
    id: "ga-2",
    theme: "Collecting gases",
    scenario: "Downward delivery (upward displacement of air) is used to collect…",
    exam: "Downward delivery collects gases denser than air, such as carbon dioxide, chlorine and sulphur dioxide.",
    options: [
      { label: "hydrogen", ok: false, fail: "Hydrogen is less dense than air — use upward delivery.", trap: "Common mix-up: H₂, CH₄, NH₃ are less dense than air. CO₂, Cl₂, SO₂ are denser." },
      { label: "carbon dioxide", ok: true, why: "Downward delivery is used to collect gases denser than air, such as carbon dioxide." },
      { label: "methane", ok: false, fail: "Methane is less dense than air — use upward delivery.", trap: "Common mix-up: methane is collected by upward delivery, not downward delivery." },
      { label: "ammonia", ok: false, fail: "Ammonia is less dense than air — use upward delivery.", trap: "Common mix-up: ammonia is less dense than air." },
    ],
  },
  {
    id: "ga-3",
    theme: "Collecting gases",
    scenario: "Displacement of water is used to collect water-_____ gases.",
    exam: "Displacement of water collects water-insoluble gases. The collected gas is wet.",
    options: [
      { label: "soluble", ok: false, fail: "A water-soluble gas dissolves instead of collecting over water.", trap: "Common mix-up: water displacement = water-insoluble gases." },
      { label: "insoluble", ok: true, why: "Displacement of water is used to collect water-insoluble gases (but the gas is wet)." },
      { label: "toxic only", ok: false, fail: "Toxicity is not the rule for water displacement.", trap: "Common mix-up: the key word is water-insoluble, not toxic." },
      { label: "coloured", ok: false, fail: "Colour does not decide water displacement.", trap: "Common mix-up: solubility in water, not colour." },
    ],
  },
  {
    id: "ga-4",
    theme: "Collecting gases",
    scenario: "If gas is collected from a heated vessel over water, the delivery tube must be removed from water before heating is stopped to prevent…",
    exam: "Remove the delivery tube from the water before stopping the heat, or water may be sucked back into the hot vessel.",
    options: [
      { label: "explosion", ok: false, fail: "The main risk here is suck-back, not explosion.", trap: "Common mix-up: stopping heat creates a partial vacuum — water is sucked back and can crack hot glass." },
      { label: "sucking back of water into the hot vessel", ok: true, why: "Stopping heating creates a partial vacuum; water can be sucked back and crack hot glass." },
      { label: "loss of colour", ok: false, fail: "Colour is not the reason to remove the tube first.", trap: "Common mix-up: the danger is suck-back of water into the hot vessel." },
      { label: "freezing", ok: false, fail: "The mixture does not freeze when heating stops.", trap: "Common mix-up: take the delivery tube out of the water before removing the flame." },
    ],
  },
  {
    id: "ga-5",
    theme: "Collecting gases",
    scenario: "To dry ammonia gas, which drying agent is used in the notes?",
    exam: "Anhydrous calcium oxide dries ammonia. Concentrated sulphuric acid dries acidic gases — not ammonia.",
    options: [
      { label: "Concentrated sulphuric acid", ok: false, fail: "Concentrated sulphuric acid dries acidic gases and reacts with ammonia.", trap: "Common mix-up: NH₃ is alkaline. Dry it with anhydrous calcium oxide, not concentrated H₂SO₄." },
      { label: "Anhydrous calcium oxide", ok: true, why: "Anhydrous calcium oxide is used to dry ammonia gas." },
      { label: "Silica gel in a desiccator only", ok: false, fail: "The notes name anhydrous calcium oxide for ammonia.", trap: "Common mix-up: a desiccator dries a solid; ammonia gas is dried with CaO." },
      { label: "Filter paper", ok: false, fail: "Filter paper does not dry a gas.", trap: "Common mix-up: drying agent for ammonia = anhydrous calcium oxide." },
    ],
  },
  {
    id: "ga-6",
    theme: "Collecting gases",
    scenario: "Concentrated sulphuric acid is used to dry…",
    exam: "Concentrated sulphuric acid is used to dry acidic gases. It is not used for ammonia.",
    options: [
      { label: "ammonia", ok: false, fail: "Ammonia is dried with anhydrous calcium oxide.", trap: "Common mix-up: concentrated H₂SO₄ dries acidic gases, not ammonia." },
      { label: "acidic gases", ok: true, why: "Concentrated sulphuric acid is used to dry acidic gases." },
      { label: "hydrogen only", ok: false, fail: "The notes pair concentrated sulphuric acid with acidic gases.", trap: "Common mix-up: the named use is acidic gases, not hydrogen only." },
      { label: "all gases without exception", ok: false, fail: "Ammonia must not be dried with concentrated sulphuric acid.", trap: "Common mix-up: one drying agent does not fit every gas." },
    ],
  },
  {
    id: "ga-7",
    theme: "Collecting gases",
    scenario: "To smell a gas safely, hold the tube about 15 cm from the nose and…",
    exam: "Hold the tube about 15 cm from the nose and fan a little of the gas towards your nose. Never breathe in directly above the tube.",
    options: [
      { label: "breathe in directly above the tube", ok: false, fail: "Never breathe in directly above the test tube.", trap: "Common mix-up: fan a little gas towards the nose from about 15 cm away." },
      { label: "fan a little of the gas towards your nose", ok: true, why: "Hold the tube about 15 cm from the nose and fan a little of the gas towards your nose." },
      { label: "pour the gas onto your hand", ok: false, fail: "Do not pour or touch the gas.", trap: "Common mix-up: the safe method is wafting, not pouring." },
      { label: "heat the tube strongly first", ok: false, fail: "Heating is not part of smelling a gas.", trap: "Common mix-up: 15 cm + fan a little gas. Do not heat first." },
    ],
  },
  {
    id: "ga-8",
    theme: "Collecting gases",
    scenario: "If the reaction mixture is being heated, always take out the delivery tube from the testing solution before removing the flame.",
    exam: "True. Taking the delivery tube out first prevents sucking back of the solution.",
    options: [
      { label: "True", ok: true, why: "If the mixture is being heated, take the delivery tube out of the testing solution before removing the flame, to prevent suck-back." },
      { label: "False", ok: false, fail: "The delivery tube must come out before the flame is removed.", trap: "Common mix-up: removing the flame first can suck the testing solution back into the hot vessel." },
    ],
  },
  {
    id: "st-1",
    theme: "Storage of chemicals",
    scenario: "Potassium and sodium are kept under…",
    exam: "Potassium and sodium are kept under paraffin oil to prevent contact and reaction with air.",
    options: [
      { label: "water", ok: false, fail: "Sodium and potassium react with water. Yellow phosphorus is kept under water.", trap: "Common mix-up: Na / K under paraffin oil. Yellow phosphorus under water." },
      { label: "paraffin oil", ok: true, why: "Potassium and sodium are kept under paraffin oil to prevent contact and reaction with air." },
      { label: "concentrated sulphuric acid", ok: false, fail: "Concentrated sulphuric acid is not the storage liquid for sodium or potassium.", trap: "Common mix-up: alkali metals sit under paraffin oil." },
      { label: "brown bottles only", ok: false, fail: "Brown bottles are for light-sensitive chemicals such as silver nitrate.", trap: "Common mix-up: brown bottle = light-sensitive. Na / K = paraffin oil." },
    ],
  },
  {
    id: "st-2",
    theme: "Storage of chemicals",
    scenario: "Chemicals that decompose quickly in light (e.g. silver nitrate solution) are kept in…",
    exam: "Light-sensitive chemicals such as silver nitrate solution are kept in brown bottles.",
    options: [
      { label: "open beakers", ok: false, fail: "An open beaker does not protect the solution from light.", trap: "Common mix-up: brown bottles protect light-sensitive chemicals." },
      { label: "brown bottles", ok: true, why: "Chemicals that decompose quickly in light (e.g. silver nitrate solution) are kept in brown bottles." },
      { label: "crucibles", ok: false, fail: "A crucible is for strong heating of a solid.", trap: "Common mix-up: crucible ≠ storage for light-sensitive solutions." },
      { label: "gas syringes", ok: false, fail: "A gas syringe collects or measures a gas.", trap: "Common mix-up: brown bottle, not a gas syringe." },
    ],
  },
  {
    id: "st-3",
    theme: "Storage of chemicals",
    scenario: "Flammable and volatile liquids should be stored in containers that are completely filled to the top.",
    exam: "False. Their containers should never be completely filled.",
    options: [
      { label: "True", ok: false, fail: "Do not fill those containers to the top.", trap: "Common mix-up: leave space in bottles of flammable / volatile liquids." },
      { label: "False", ok: true, why: "Containers of flammable and volatile liquids should never be completely filled." },
    ],
  },
  {
    id: "hz-1",
    theme: "Hazardous chemicals",
    scenario: "A substance which would destroy living tissues upon contact is described as…",
    exam: "Corrosive — for example concentrated mineral acids and sodium hydroxide.",
    options: [
      { label: "corrosive", ok: true, why: "A substance which would destroy living tissues upon contact is described as corrosive." },
      { label: "harmful", ok: false, fail: "Harmful is a milder hazard class than corrosive.", trap: "Common mix-up: destroy living tissue on contact = corrosive. Dilute acids are often irritants." },
      { label: "explosive", ok: false, fail: "Explosive substances may explode if ignited, heated, or shocked.", trap: "Common mix-up: tissue damage on contact is corrosive, not explosive." },
      { label: "oxidizing", ok: false, fail: "Oxidizing substances help other materials burn.", trap: "Common mix-up: the definition given is corrosive." },
    ],
  },
  {
    id: "hz-2",
    theme: "Hazardous chemicals",
    scenario: "Which is an example of a flammable substance from the notes?",
    exam: "Ethanol is flammable. Other examples include methanol, hydrogen and yellow phosphorus.",
    options: [
      { label: "Ethanol", ok: true, why: "Flammable examples from the notes include methanol, ethanol, hydrogen and yellow phosphorus." },
      { label: "Concentrated sulphuric acid", ok: false, fail: "Concentrated sulphuric acid is corrosive, not the flammable example.", trap: "Common mix-up: concentrated acid = corrosive. Ethanol = flammable." },
      { label: "Silver nitrate", ok: false, fail: "Silver nitrate is stored in a brown bottle because it is light-sensitive.", trap: "Common mix-up: silver nitrate is not the flammable example." },
      { label: "Asbestos", ok: false, fail: "Asbestos is not listed as the flammable example.", trap: "Common mix-up: ethanol is the flammable substance in this set." },
    ],
  },
  {
    id: "hz-3",
    theme: "Hazardous chemicals",
    scenario: "Carcinogens such as benzene should be handled…",
    exam: "Handle carcinogens in a fume cupboard, wearing a lab coat, safety spectacles and gloves. Avoid vapours.",
    options: [
      { label: "without any protection in the open lab", ok: false, fail: "Carcinogens need protection and a fume cupboard.", trap: "Common mix-up: benzene → coat, spectacles, gloves, fume cupboard." },
      { label: "in a fume cupboard with coat, spectacles and gloves", ok: true, why: "Carcinogens such as benzene should be handled in a fume cupboard with a lab coat, safety spectacles and gloves." },
      { label: "only by smelling directly", ok: false, fail: "Do not smell a carcinogen directly.", trap: "Common mix-up: even safe smelling is not how benzene is handled." },
      { label: "near naked flames", ok: false, fail: "Benzene is also flammable — keep it away from flames.", trap: "Common mix-up: fume cupboard and PPE, not a naked flame." },
    ],
  },
  {
    id: "hz-5",
    theme: "Hazardous chemicals",
    scenario: "If concentrated acid is accidentally spilt into the eyes or onto the skin, wash with running water for at least _____ minutes.",
    exam: "Wash with running water for at least 3 minutes, then go for a medical check-up.",
    options: [
      { label: "1", ok: false, fail: "One minute is too short.", trap: "Common mix-up: the notes say at least 3 minutes, then a medical check-up." },
      { label: "3", ok: true, why: "Wash with running water for at least 3 minutes, then go for a medical check-up." },
      { label: "10", ok: false, fail: "The notes specify at least 3 minutes.", trap: "Common mix-up: write 3 minutes as in the notes, not a longer guess." },
      { label: "30", ok: false, fail: "The notes specify at least 3 minutes.", trap: "Common mix-up: the model answer is 3 minutes, then medical check-up." },
    ],
  },
  {
    id: "hz-7",
    theme: "Hazardous chemicals",
    scenario: "Dilute mineral acids are corrosive substances that destroy living tissues upon contact.",
    exam: "False. Dilute mineral acids are irritants — they cause inflammation or reddening of the skin. Concentrated mineral acids are corrosive.",
    options: [
      { label: "True", ok: false, fail: "Dilute mineral acids are irritants, not corrosive.", trap: "Common mix-up: concentrated acids destroy tissue (corrosive). Dilute acids redden / inflame (irritant)." },
      { label: "False", ok: true, why: "Dilute mineral acids are irritants. They cause inflammation or reddening of the skin — they are not classed as corrosive." },
    ],
  },
];

const BUILD = [
  {
    id: "evap",
    title: "Salt from sea water",
    easy: "Build the evaporation set-up. Place each piece into W, X, Y and Z.",
    exam: "Topic 01 Q.3 — obtaining common salt from sea water.",
    photo: "images/setup-evaporation.jpg",
    diagram: "images/diagram-evaporation-setup.jpg",
    slots: [
      { id: "W", label: "W · top", answer: "evaporating-dish" },
      { id: "X", label: "X", answer: "wire-gauze" },
      { id: "Y", label: "Y", answer: "tripod" },
      { id: "Z", label: "Z · heat", answer: "bunsen-burner" },
    ],
    tray: ["evaporating-dish", "wire-gauze", "tripod", "bunsen-burner", "beaker", "crucible", "conical-flask", "heat-proof-mat"],
    mark: "W evaporating dish · X wire gauze · Y tripod · Z Bunsen burner",
  },
  {
    id: "filt",
    title: "Mud and sea water",
    easy: "Build the filtration set-up. Pour down a glass rod into a funnel.",
    exam: "Topic 01 Q.4 — separating mud from sea water.",
    photo: "images/setup-filtration.jpg",
    slots: [
      { id: "P", label: "P · pour", answer: "glass-rod" },
      { id: "Q", label: "Q · support", answer: "stand-and-clamp" },
      { id: "R", label: "R · in the funnel", answer: "filter-paper" },
      { id: "S", label: "S · funnel", answer: "filter-funnel" },
      { id: "T", label: "T · collect", answer: "beaker" },
    ],
    tray: ["glass-rod", "stand-and-clamp", "filter-paper", "filter-funnel", "beaker", "dropper", "conical-flask", "measuring-cylinder"],
    mark: "P glass rod · Q stand and clamp · R filter paper · S filter funnel · T beaker",
  },
  {
    id: "boil",
    title: "Boil 200 cm³ of water",
    easy: "A large volume needs a beaker on gauze — not a test tube. Stack from the bench up.",
    exam: "Topic 01 Q.6(iv) and Laboratory safety: heat a large quantity in a beaker on a tripod and wire gauze.",
    photo: "images/diagram-beaker-heating.jpg",
    slots: [
      { id: "1", label: "On the bench", answer: "heat-proof-mat" },
      { id: "2", label: "Heat source", answer: "bunsen-burner" },
      { id: "3", label: "Stand", answer: "tripod" },
      { id: "4", label: "Spreads the heat", answer: "wire-gauze" },
      { id: "5", label: "Holds 200 cm³", answer: "beaker" },
    ],
    tray: ["heat-proof-mat", "bunsen-burner", "tripod", "wire-gauze", "beaker", "test-tube", "evaporating-dish", "conical-flask"],
    mark: "A, C, D, E, F — beaker, Bunsen burner, wire gauze, tripod, heat-resistant mat",
  },
  {
    id: "few",
    title: "Heat a few cm³ of water",
    easy: "Only a little liquid — use a test tube, not a beaker.",
    exam: "Topic 01 Q.6(iii).",
    photo: "images/setup-eight-pieces.jpg",
    slots: [
      { id: "1", label: "On the bench", answer: "heat-proof-mat" },
      { id: "2", label: "Heat source", answer: "bunsen-burner" },
      { id: "3", label: "Holds the tube", answer: "test-tube-holder" },
      { id: "4", label: "A few cm³ of water", answer: "test-tube" },
    ],
    tray: ["heat-proof-mat", "bunsen-burner", "test-tube-holder", "test-tube", "beaker", "wire-gauze", "tripod", "spatula"],
    mark: "B, C, F, G — test tube, Bunsen burner, heat-resistant mat, test tube holder",
  },
  {
    id: "crucible",
    title: "Heat a solid very strongly",
    easy: "A crucible sits on a pipe-clay triangle on a tripod — not on wire gauze.",
    exam: "Laboratory safety notes: very strong heating of a solid in a crucible.",
    photo: "images/diagram-crucible-setup.jpg",
    slots: [
      { id: "1", label: "On the bench", answer: "heat-proof-mat" },
      { id: "2", label: "Heat source", answer: "bunsen-burner" },
      { id: "3", label: "Stand", answer: "tripod" },
      { id: "4", label: "Supports the crucible", answer: "pipe-clay-triangle" },
      { id: "5", label: "Holds the solid", answer: "crucible" },
    ],
    tray: ["heat-proof-mat", "bunsen-burner", "tripod", "pipe-clay-triangle", "crucible", "wire-gauze", "evaporating-dish", "beaker"],
    mark: "Heat-resistant mat, Bunsen burner, tripod, pipe-clay triangle, crucible",
  },
  {
    id: "bath",
    title: "Evaporate a few drops on a watch glass",
    easy: "Dickson’s salt experiment: a watch glass of solution sits on a beaker of boiling water.",
    exam: "Topic 01 Q.10 step 4 — water-bath evaporation.",
    photo: "images/setup-watchglass-bath.jpg",
    slots: [
      { id: "1", label: "On the bench", answer: "heat-proof-mat" },
      { id: "2", label: "Heat source", answer: "bunsen-burner" },
      { id: "3", label: "Stand", answer: "tripod" },
      { id: "4", label: "Spreads the heat", answer: "wire-gauze" },
      { id: "5", label: "Boiling water", answer: "beaker" },
      { id: "6", label: "Holds the drops", answer: "watch-glass" },
    ],
    tray: ["heat-proof-mat", "bunsen-burner", "tripod", "wire-gauze", "beaker", "watch-glass", "evaporating-dish", "test-tube"],
    mark: "Heat-resistant mat, Bunsen burner, tripod, wire gauze, beaker, watch glass",
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
