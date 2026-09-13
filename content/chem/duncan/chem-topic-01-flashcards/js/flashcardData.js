/** Topic 1: Planet Earth — flashcard deck (112 cards) */
const FLASHCARD_TAGS = ["Chemistry", "PlanetEarth", "S3", "HKDSE"];

const FLASHCARD_DECK = [
  {
    "id": 1,
    "subtopic": "Classification of matter",
    "front": "Define <strong>mixture</strong>.",
    "back": "Two or more pure substances <strong>not chemically combined</strong>."
  },
  {
    "id": 2,
    "subtopic": "Classification of matter",
    "front": "Define <strong>element</strong>.",
    "back": "A pure substance that <strong>cannot be broken down</strong> into anything simpler by chemical methods."
  },
  {
    "id": 3,
    "subtopic": "Classification of matter",
    "front": "Define <strong>compound</strong>.",
    "back": "A pure substance made of two or more elements <strong>chemically combined</strong>."
  },
  {
    "id": 4,
    "subtopic": "Classification of matter",
    "front": "Pure or mixture? Element or compound?",
    "back": "<strong>Pure element</strong>",
    "image": "./assets/G001.png",
    "imageAlt": "Particle diagram G001",
    "imageFace": "front"
  },
  {
    "id": 5,
    "subtopic": "Classification of matter",
    "front": "Pure or mixture? Element or compound?",
    "back": "<strong>Pure compound</strong>",
    "image": "./assets/G002.png",
    "imageAlt": "Particle diagram G002",
    "imageFace": "front"
  },
  {
    "id": 6,
    "subtopic": "Classification of matter",
    "front": "Pure or mixture? Element or compound?",
    "back": "<strong>Mixture of compounds</strong>",
    "image": "./assets/G003.png",
    "imageAlt": "Particle diagram G003",
    "imageFace": "front"
  },
  {
    "id": 7,
    "subtopic": "Classification of matter",
    "front": "Pure or mixture? Element or compound?",
    "back": "<strong>Mixture of elements</strong>",
    "image": "./assets/G004.png",
    "imageAlt": "Particle diagram G004",
    "imageFace": "front"
  },
  {
    "id": 8,
    "subtopic": "Classification of matter",
    "front": "Pure or mixture? Element or compound?",
    "back": "<strong>Mixture of element and compound</strong>",
    "image": "./assets/G005.png",
    "imageAlt": "Particle diagram G005",
    "imageFace": "front"
  },
  {
    "id": 9,
    "subtopic": "Classification of matter",
    "front": "Graphite and diamond are different forms of which <strong>element</strong>?",
    "back": "<strong>Carbon</strong>"
  },
  {
    "id": 10,
    "subtopic": "Classification of matter",
    "front": "Top 5 percentage abundance by mass of elements in the Earth’s crust?",
    "back": "<strong>Oxygen (O) > Silicon (Si) > Aluminium (Al) > Iron (Fe) > Calcium (Ca)</strong>"
  },
  {
    "id": 11,
    "subtopic": "Classification of matter",
    "front": "Are alloys (steel, bronze) elements, compounds, or mixtures?",
    "back": "<strong>Mixtures</strong>"
  },
  {
    "id": 12,
    "subtopic": "Classification of matter",
    "front": "Pencil lead is mainly a mixture of…?",
    "back": "<strong>Graphite</strong> and <strong>clay</strong>"
  },
  {
    "id": 13,
    "subtopic": "Classification of matter",
    "front": "Constituent elements of water (H<sub>2</sub>O)?",
    "back": "<strong>Hydrogen</strong> and <strong>oxygen</strong>"
  },
  {
    "id": 14,
    "subtopic": "Classification of matter",
    "front": "Mixture vs compound: composition by mass is <strong>variable</strong> or <strong>fixed</strong>?",
    "back": "Mixture: <strong>variable</strong><br>Compound: <strong>fixed</strong>"
  },
  {
    "id": 15,
    "subtopic": "Classification of matter",
    "front": "Mixture vs compound: <strong>definite</strong> or <strong>range</strong> of melting / boiling point?",
    "back": "Mixture: <strong>range</strong> of melting / boiling point<br>Compound: <strong>definite</strong> melting / boiling point"
  },
  {
    "id": 16,
    "subtopic": "Classification of matter",
    "front": "Mixture vs compound: separation methods?",
    "back": "Mixture: <strong>physical</strong> methods<br>Compound: <strong>chemical</strong> methods"
  },
  {
    "id": 17,
    "subtopic": "Classification of matter",
    "front": "Iron–sulphur <strong>mixture</strong>: what does a magnet attract?",
    "back": "<strong>Only iron</strong>"
  },
  {
    "id": 18,
    "subtopic": "Classification of matter",
    "front": "Iron(II) sulphide: attracted by a magnet?",
    "back": "<strong>No</strong>"
  },
  {
    "id": 19,
    "subtopic": "Classification of matter",
    "front": "Iron(II) sulphide + dilute HCl gives…?",
    "back": "Toxic <strong>hydrogen sulphide (H<sub>2</sub>S) gas</strong> (bad-egg smell)"
  },
  {
    "id": 20,
    "subtopic": "Classification of matter",
    "front": "How is iron(II) sulphide formed?",
    "back": "<strong>Heat</strong> iron with sulphur"
  },
  {
    "id": 21,
    "subtopic": "Physical vs chemical change",
    "front": "What is a <strong>physical change</strong>?",
    "back": "A change in which no <strong>new substances</strong> are produced."
  },
  {
    "id": 22,
    "subtopic": "Physical vs chemical change",
    "front": "What is a <strong>chemical change</strong>?",
    "back": "A change in which one or more <strong>new substances</strong> are produced."
  },
  {
    "id": 23,
    "subtopic": "Physical vs chemical change",
    "front": "Define physical properties.",
    "back": "Properties that can be determined <strong>without</strong> the substance changing into another substance."
  },
  {
    "id": 24,
    "subtopic": "Physical vs chemical change",
    "front": "Define chemical properties.",
    "back": "Properties that describe the ability of that substance to <strong>react</strong> with other substance(s)."
  },
  {
    "id": 25,
    "subtopic": "Physical vs chemical change",
    "front": "Change of state, dissolving, filtration — physical or chemical?",
    "back": "<strong>Physical</strong>"
  },
  {
    "id": 26,
    "subtopic": "Physical vs chemical change",
    "front": "Burning, electrolysis, chemical tests — physical or chemical?",
    "back": "<strong>Chemical</strong>"
  },
  {
    "id": 27,
    "subtopic": "Physical vs chemical change",
    "front": "Solid → liquid process name?",
    "back": "<strong>Melting</strong>"
  },
  {
    "id": 28,
    "subtopic": "Physical vs chemical change",
    "front": "Liquid → gas process name?",
    "back": "<strong>Boiling</strong>"
  },
  {
    "id": 29,
    "subtopic": "Physical vs chemical change",
    "front": "Solid → gas process name?",
    "back": "<strong>Sublimation</strong>"
  },
  {
    "id": 30,
    "subtopic": "Physical vs chemical change",
    "front": "Liquid → solid process name?",
    "back": "<strong>Freezing</strong>"
  },
  {
    "id": 31,
    "subtopic": "Physical vs chemical change",
    "front": "Gas → liquid process name?",
    "back": "<strong>Condensation</strong>"
  },
  {
    "id": 32,
    "subtopic": "Physical vs chemical change",
    "front": "Gas → solid process name?",
    "back": "<strong>Deposition</strong>"
  },
  {
    "id": 33,
    "subtopic": "Physical vs chemical change",
    "front": "Which state changes <strong>absorb heat</strong>?",
    "back": "Melting, boiling, sublimation",
    "image": "./assets/G006.png",
    "imageAlt": "Change of states: heat absorbed vs given out"
  },
  {
    "id": 34,
    "subtopic": "Physical vs chemical change",
    "front": "Which state changes <strong>give out heat</strong>?",
    "back": "Freezing, condensation, deposition",
    "image": "./assets/G006.png",
    "imageAlt": "Change of states: heat absorbed vs given out"
  },
  {
    "id": 35,
    "subtopic": "The atmosphere",
    "front": "Which gas has the largest percentage composition in air?",
    "back": "Nitrogen (N<sub>2</sub>) <strong>78%</strong>"
  },
  {
    "id": 36,
    "subtopic": "The atmosphere",
    "front": "Name the process in which the different gases in air are separated.",
    "back": "Fractional distillation of <strong>liquid</strong> air"
  },
  {
    "id": 37,
    "subtopic": "The atmosphere",
    "front": "Why can air be separated by fractional distillation?",
    "back": "Different gases have different <strong>boiling points</strong>.",
    "image": "./assets/G007.png",
    "imageAlt": "Fractional distillation of liquid air"
  },
  {
    "id": 38,
    "subtopic": "The atmosphere",
    "front": "Why remove water and CO<sub>2</sub> before liquefying air?",
    "back": "They <strong>solidify</strong> and block the pipes."
  },
  {
    "id": 39,
    "subtopic": "The atmosphere",
    "front": "In the air fractionating column, gas with <strong>lower</strong> or <strong>higher</strong> b.p. leaves at the <strong>top</strong>?",
    "back": "<strong>Lower b.p.</strong>"
  },
  {
    "id": 40,
    "subtopic": "The atmosphere",
    "front": "In the air fractionating column, gas with <strong>lower</strong> or <strong>higher</strong> b.p. leaves at the <strong>bottom</strong>?",
    "back": "<strong>Higher b.p.</strong>"
  },
  {
    "id": 41,
    "subtopic": "The atmosphere",
    "front": "Two uses of nitrogen?",
    "back": "Food packaging; refrigerant; making <strong>ammonia</strong> (any two)"
  },
  {
    "id": 42,
    "subtopic": "The atmosphere",
    "front": "Main use of argon?",
    "back": "Filling <strong>light bulbs</strong>"
  },
  {
    "id": 43,
    "subtopic": "The atmosphere",
    "front": "Test for oxygen?",
    "back": "<strong>Relights</strong> a <strong>glowing</strong> splint"
  },
  {
    "id": 44,
    "subtopic": "The atmosphere",
    "front": "Hazard label on an oxygen cylinder?",
    "back": "<strong>Oxidizing</strong> (not flammable)"
  },
  {
    "id": 45,
    "subtopic": "The atmosphere",
    "front": "Test for hydrogen?",
    "back": "<strong>Burning</strong> splint → <strong>pop</strong> sound"
  },
  {
    "id": 46,
    "subtopic": "The atmosphere",
    "front": "Hazard label on a hydrogen cylinder?",
    "back": "<strong>Flammable</strong>"
  },
  {
    "id": 47,
    "subtopic": "Solutions",
    "front": "Solute + solvent = ?",
    "back": "<strong>Solution</strong>"
  },
  {
    "id": 48,
    "subtopic": "Solutions",
    "front": "In seawater: What is solute? What is solvent?",
    "back": "Solute: <strong>salts</strong><br>Solvent: <strong>water</strong>"
  },
  {
    "id": 49,
    "subtopic": "Solutions",
    "front": "Largest salt fraction in seawater (by %)?",
    "back": "<strong>Sodium chloride</strong> (68%)"
  },
  {
    "id": 50,
    "subtopic": "Solutions",
    "front": "What is a <strong>saturated</strong> solution?",
    "back": "Solvent has dissolved the <strong>maximum</strong> solute it can at that temperature."
  },
  {
    "id": 51,
    "subtopic": "Solutions",
    "front": "Is a saturated solution always concentrated?",
    "back": "<strong>No</strong> — limewater is saturated but still <strong>dilute</strong>."
  },
  {
    "id": 52,
    "subtopic": "Separation methods",
    "front": "Decantation separates…?",
    "back": "A dense <strong>insoluble solid</strong> from a liquid (quick but rough).",
    "image": "./assets/G009.png",
    "imageAlt": "Decantation of sand from seawater"
  },
  {
    "id": 53,
    "subtopic": "Separation methods",
    "front": "In filtration: What is left behind on filter paper? What passes through filter paper?",
    "back": "<strong>Residue</strong>: <strong>insoluble solid</strong> on paper<br><strong>Filtrate</strong>: <strong>water and other dissolved substances</strong> that pass through",
    "image": "./assets/G010.png",
    "imageAlt": "Filtration apparatus"
  },
  {
    "id": 54,
    "subtopic": "Separation methods",
    "front": "Evaporation of seawater obtains…?",
    "back": "The <strong>solute</strong> (salts)"
  },
  {
    "id": 55,
    "subtopic": "Separation methods",
    "front": "Direct heating of seawater: crystals or powder?",
    "back": "<strong>Powder</strong> (mixture of salts, not crystals)",
    "image": "./assets/G011.png",
    "imageAlt": "Direct heating evaporation",
    "imageFace": "front"
  },
  {
    "id": 56,
    "subtopic": "Separation methods",
    "front": "When should a <strong>steam bath</strong> be used for evaporation instead of direct heating?",
    "back": "If the solvent <strong>burns easily</strong>",
    "image": "./assets/G012.png",
    "imageAlt": "Steam-bath evaporation",
    "imageFace": "front"
  },
  {
    "id": 57,
    "subtopic": "Separation methods",
    "front": "Two disadvantages of evaporating by direct heating?",
    "back": "1. Solution may <strong>splash</strong><br>2. Watch glass may <strong>crack</strong>"
  },
  {
    "id": 58,
    "subtopic": "Separation methods",
    "front": "Hydrated copper(II) sulphate strongly heated becomes…?",
    "back": "<strong>Anhydrous</strong> copper(II) sulphate"
  },
  {
    "id": 59,
    "subtopic": "Separation methods",
    "front": "Outline the steps required to obtain salt crystals from seawater by crystallization (cooling a hot concentrated solution).",
    "back": "1. Sea water is <strong>heated</strong> to remove some of the water such that a <strong>saturated</strong> solution is obtained.<br>2. <strong>Cool</strong> the solution <strong>slowly</strong> by standing in air. Water will further evaporate and <strong>crystals</strong> will be <strong>formed</strong>.<br>3. <strong>Filter</strong> to obtain the crystals.<br>4. <strong>Wash</strong> the crystals with <strong>small amount</strong> of <strong>cold</strong>, <strong>distilled</strong> water and <strong>dry</strong> the crystals with <strong>filter paper</strong>.",
    "image": "./assets/G013.png",
    "imageAlt": "Crystallization by cooling",
    "frontCompact": true,
    "backCompact": true,
    "imageCompact": true
  },
  {
    "id": 60,
    "subtopic": "Separation methods",
    "front": "Outline the steps required to obtain salt crystals from seawater by crystallization (slow evaporation).",
    "back": "1. Sea water is allowed to <strong>evaporate slowly</strong> at room temperature and becomes <strong>saturated</strong>.<br>2. Further evaporation of water will cause salt crystals to <strong>separate out</strong>.<br>3. <strong>Filter</strong> to obtain the crystals.<br>4. <strong>Wash</strong> the crystals with <strong>small amount</strong> of <strong>cold</strong> <strong>distilled</strong> water and <strong>dry</strong> the crystals with <strong>filter paper</strong>.",
    "image": "./assets/G014.png",
    "imageAlt": "Slow evaporation crystallization"
  },
  {
    "id": 61,
    "subtopic": "Separation methods",
    "front": "Wash crystals with…?",
    "back": "A <strong>small amount</strong> of <strong>cold</strong> <strong>distilled</strong> water"
  },
  {
    "id": 62,
    "subtopic": "Separation methods",
    "front": "How to test whether a solution is <strong>saturated</strong>?",
    "back": "<strong>Dip a glass rod</strong> into the solution and <strong>take it out</strong>. If crystals are formed on it <strong>upon cooling</strong>, the solution is saturated."
  },
  {
    "id": 63,
    "subtopic": "Separation methods",
    "front": "Cooling a hot saturated solution gives <strong>small</strong> or <strong>large</strong> crystals?",
    "back": "<strong>Small</strong> crystals",
    "image": "./assets/G013.png",
    "imageAlt": "Crystallization by cooling"
  },
  {
    "id": 64,
    "subtopic": "Separation methods",
    "front": "Slow evaporation at room temperature gives <strong>small</strong> or <strong>large</strong> crystals?",
    "back": "<strong>Large</strong> crystals",
    "image": "./assets/G014.png",
    "imageAlt": "Slow evaporation crystallization"
  },
  {
    "id": 65,
    "subtopic": "Separation methods",
    "front": "During slow crystallization, should filter paper tightly cover the beaker? Why?",
    "back": "<strong>No</strong> — water must still evaporate."
  },
  {
    "id": 66,
    "subtopic": "Separation methods",
    "front": "Distillation of seawater obtains…?",
    "back": "<strong>Pure water</strong> (the solvent)",
    "image": "./assets/G015.png",
    "imageAlt": "Distillation with condenser"
  },
  {
    "id": 67,
    "subtopic": "Separation methods",
    "front": "What is the purpose of anti-bumping granules?",
    "back": "Smooth heating; prevent <strong>bumping</strong> of water"
  },
  {
    "id": 68,
    "subtopic": "Separation methods",
    "front": "Condenser: cold water enters from lower or upper opening?",
    "back": "The <strong>lower</strong> opening (leaves from the upper)"
  },
  {
    "id": 69,
    "subtopic": "Separation methods",
    "front": "Why should the end of the delivery tube be placed above the distillate and below the cooling agent?",
    "back": "To prevent <strong>sucking back of distillate</strong> and prevent <strong>water vapor escaping</strong> from the test tube.",
    "image": "./assets/G016.png",
    "imageAlt": "Simple distillation apparatus"
  },
  {
    "id": 70,
    "subtopic": "Chemical tests",
    "front": "Flame colour of <strong>potassium</strong>?",
    "back": "<strong>Lilac</strong>",
    "image": "./assets/G017.png",
    "imageAlt": "Potassium flame test"
  },
  {
    "id": 71,
    "subtopic": "Chemical tests",
    "front": "Flame colour of <strong>sodium</strong>?",
    "back": "<strong>Golden yellow</strong>",
    "image": "./assets/G018.png",
    "imageAlt": "Sodium flame test"
  },
  {
    "id": 72,
    "subtopic": "Chemical tests",
    "front": "Flame colour of <strong>calcium</strong>?",
    "back": "<strong>Brick-red</strong>",
    "image": "./assets/G019.png",
    "imageAlt": "Calcium flame test"
  },
  {
    "id": 73,
    "subtopic": "Chemical tests",
    "front": "Flame colour of <strong>copper</strong>?",
    "back": "<strong>Bluish green</strong>",
    "image": "./assets/G020.png",
    "imageAlt": "Copper flame test"
  },
  {
    "id": 74,
    "subtopic": "Chemical tests",
    "front": "How to clean a platinum/nichrome wire?",
    "back": "Dip the wire in <strong>concentrated</strong> HCl. Heat in a <strong>non-luminous</strong> flame until <strong>no characteristic flame color</strong> can be observed."
  },
  {
    "id": 75,
    "subtopic": "Chemical tests",
    "front": "Describe the procedures of flame test.",
    "back": "Dip the wire in <strong>concentrated</strong> HCl. Then dip the wire into the sample. Heat in a <strong>non-luminous</strong> flame and observe the flame color."
  },
  {
    "id": 76,
    "subtopic": "Chemical tests",
    "front": "In silver nitrate test, what reagents should be added in order after dissolving the sample?",
    "back": "<strong>Excess dilute</strong> nitric acid (HNO<sub>3</sub>) first, then silver nitrate (AgNO<sub>3</sub>) solution",
    "image": "./assets/G021.png",
    "imageAlt": "White AgCl precipitate"
  },
  {
    "id": 77,
    "subtopic": "Chemical tests",
    "front": "What is the name of the white precipitate formed in the silver nitrate test?",
    "back": "<strong>Silver chloride</strong> (AgCl)"
  },
  {
    "id": 78,
    "subtopic": "Chemical tests",
    "front": "Why add dilute HNO<sub>3</sub> before AgNO<sub>3</sub>?",
    "back": "Prevents other white precipitates (e.g. Ag<sub>2</sub>CO<sub>3</sub>) that <strong>dissolve in HNO<sub>3</sub></strong>",
    "image": "./assets/G022.png",
    "imageAlt": "AgCl remains; carbonate/sulphite dissolve"
  },
  {
    "id": 79,
    "subtopic": "Chemical tests",
    "front": "Anhydrous copper(II) sulphate + water: colour change?",
    "back": "<strong>White → blue</strong>",
    "image": "./assets/G023.png",
    "imageAlt": "CuSO4 hydration"
  },
  {
    "id": 80,
    "subtopic": "Chemical tests",
    "front": "Dry cobalt(II) chloride paper + water: colour change?",
    "back": "<strong>Blue → pink</strong>",
    "image": "./assets/G024.png",
    "imageAlt": "CoCl2 hydration"
  },
  {
    "id": 81,
    "subtopic": "Chemical tests",
    "front": "Anhydrous copper(II) sulphate / dry cobalt(II) chloride paper tests prove the sample is <strong>pure water</strong>?",
    "back": "<strong>No</strong> — need boiling point <strong>100 °C</strong>"
  },
  {
    "id": 82,
    "subtopic": "Electrolysis of seawater",
    "front": "Electrolysis means…?",
    "back": "<strong>Decomposition by electricity</strong>"
  },
  {
    "id": 83,
    "subtopic": "Electrolysis of seawater",
    "front": "Electrolysis of acidified water: gas at the <strong>negative</strong> electrode?",
    "back": "<strong>Hydrogen</strong>",
    "image": "./assets/G025.png",
    "imageAlt": "Electrolysis of acidified water"
  },
  {
    "id": 84,
    "subtopic": "Electrolysis of seawater",
    "front": "Electrolysis of acidified water: gas at the <strong>positive</strong> electrode?",
    "back": "<strong>Oxygen</strong>",
    "image": "./assets/G025.png",
    "imageAlt": "Electrolysis of acidified water"
  },
  {
    "id": 85,
    "subtopic": "Electrolysis of seawater",
    "front": "Electrolysis of seawater: three products?",
    "back": "<strong>Hydrogen</strong> + <strong>Chlorine</strong> + <strong>Sodium hydroxide</strong> solution",
    "image": "./assets/G026.png",
    "imageAlt": "Electrolysis of seawater"
  },
  {
    "id": 86,
    "subtopic": "Electrolysis of seawater",
    "front": "Seawater electrolysis: gas at the <strong>positive</strong> electrode?",
    "back": "<strong>Chlorine</strong>",
    "image": "./assets/G026.png",
    "imageAlt": "Electrolysis of seawater"
  },
  {
    "id": 87,
    "subtopic": "Electrolysis of seawater",
    "front": "Seawater electrolysis: gas at the <strong>negative</strong> electrode?",
    "back": "<strong>Hydrogen</strong>",
    "image": "./assets/G026.png",
    "imageAlt": "Electrolysis of seawater"
  },
  {
    "id": 88,
    "subtopic": "Electrolysis of seawater",
    "front": "A use of hydrogen from seawater electrolysis?",
    "back": "Making margarine / ammonia / rocket fuel"
  },
  {
    "id": 89,
    "subtopic": "Electrolysis of seawater",
    "front": "A use of chlorine from seawater electrolysis?",
    "back": "Sterilizing swimming pools / making PVC"
  },
  {
    "id": 90,
    "subtopic": "Electrolysis of seawater",
    "front": "A use of sodium hydroxide from seawater electrolysis?",
    "back": "Making soap / drain cleaner / neutralizing acidic effluent"
  },
  {
    "id": 91,
    "subtopic": "Ores and metal extraction",
    "front": "What is an <strong>ore</strong>?",
    "back": "Rock containing useful minerals from which a <strong>metal</strong> can be extracted."
  },
  {
    "id": 92,
    "subtopic": "Ores and metal extraction",
    "front": "Bauxite: main compound and metal?",
    "back": "Al<sub>2</sub>O<sub>3</sub> → <strong>aluminium</strong>"
  },
  {
    "id": 93,
    "subtopic": "Ores and metal extraction",
    "front": "Haematite: main compound and metal?",
    "back": "Fe<sub>2</sub>O<sub>3</sub> → <strong>iron</strong>"
  },
  {
    "id": 94,
    "subtopic": "Ores and metal extraction",
    "front": "Galena: main compound and metal?",
    "back": "PbS → <strong>lead</strong>"
  },
  {
    "id": 95,
    "subtopic": "Ores and metal extraction",
    "front": "Copper pyrite: main compound and metal?",
    "back": "CuFeS<sub>2</sub> → <strong>copper</strong>"
  },
  {
    "id": 96,
    "subtopic": "Ores and metal extraction",
    "front": "Gold extracted by panning: physical or chemical change?",
    "back": "<strong>Physical</strong> (no new substances)"
  },
  {
    "id": 97,
    "subtopic": "Ores and metal extraction",
    "front": "Ag and Hg extracted by…?",
    "back": "<strong>Heating the ore alone</strong>"
  },
  {
    "id": 98,
    "subtopic": "Ores and metal extraction",
    "front": "Zn, Fe, Pb, Cu extracted by…?",
    "back": "Heating the ore with <strong>carbon</strong>"
  },
  {
    "id": 99,
    "subtopic": "Ores and metal extraction",
    "front": "K, Na, Ca, Mg, Al extracted by…?",
    "back": "<strong>Electrolysis</strong> of the <strong>molten</strong> ore"
  },
  {
    "id": 100,
    "subtopic": "Ores and metal extraction",
    "front": "Word equation: lead(II) oxide + carbon → ?",
    "back": "<strong>Lead + carbon dioxide</strong>"
  },
  {
    "id": 101,
    "subtopic": "Limestone and lime cycle",
    "front": "Limestone, chalk and marble are mainly…?",
    "back": "<strong>Calcium carbonate</strong> (calcite)"
  },
  {
    "id": 102,
    "subtopic": "Limestone and lime cycle",
    "front": "Eggshells and oyster shells are made of…?",
    "back": "<strong>Calcium carbonate</strong>"
  },
  {
    "id": 103,
    "subtopic": "Limestone and lime cycle",
    "front": "One use of limestone in agriculture?",
    "back": "<strong>Neutralize acidic soil</strong>"
  },
  {
    "id": 104,
    "subtopic": "Limestone and lime cycle",
    "front": "Rainwater is slightly acidic because…?",
    "back": "CO<sub>2</sub> + H<sub>2</sub>O → <strong>H<sub>2</sub>CO<sub>3</sub></strong> (carbonic acid)"
  },
  {
    "id": 105,
    "subtopic": "Limestone and lime cycle",
    "front": "Carbonic acid + limestone forms soluble…?",
    "back": "<strong>Calcium hydrogencarbonate</strong> Ca(HCO<sub>3</sub>)<sub>2</sub>",
    "image": "./assets/G027.png",
    "imageAlt": "Weathered limestone"
  },
  {
    "id": 106,
    "subtopic": "Limestone and lime cycle",
    "front": "Strong heating of CaCO<sub>3</sub> (thermal decomposition) → ?",
    "back": "<strong>CaO</strong> (quicklime) + <strong>CO<sub>2</sub></strong>",
    "image": "./assets/G028.png",
    "imageAlt": "Lime cycle"
  },
  {
    "id": 107,
    "subtopic": "Limestone and lime cycle",
    "front": "CaO + H<sub>2</sub>O → ?",
    "back": "<strong>Ca(OH)<sub>2</sub> (s)</strong> (slaked lime)"
  },
  {
    "id": 108,
    "subtopic": "Limestone and lime cycle",
    "front": "State an observation when solid calcium hydroxide is dissolved in water to become calcium hydroxide solution.",
    "back": "<strong>White suspension</strong> is formed. (Calcium hydroxide is <strong>slightly soluble</strong> in water)"
  },
  {
    "id": 109,
    "subtopic": "Limestone and lime cycle",
    "front": "Limewater is a solution of…?",
    "back": "<strong>Calcium hydroxide</strong> (slightly soluble)"
  },
  {
    "id": 110,
    "subtopic": "Limestone and lime cycle",
    "front": "Limewater + CO<sub>2</sub>: observation?",
    "back": "Turns <strong>milky</strong> (CaCO<sub>3</sub> precipitate)"
  },
  {
    "id": 111,
    "subtopic": "Limestone and lime cycle",
    "front": "Milky limewater + <strong>excess</strong> CO<sub>2</sub> → ?",
    "back": "Turns <strong>colourless</strong> (Ca(HCO<sub>3</sub>)<sub>2</sub>)"
  },
  {
    "id": 112,
    "subtopic": "Limestone and lime cycle",
    "front": "Test for carbonate?",
    "back": "Dilute <strong>HCl</strong> → colourless gas turns limewater <strong>milky</strong>",
    "image": "./assets/G029.png",
    "imageAlt": "Carbonate test apparatus"
  }
];
