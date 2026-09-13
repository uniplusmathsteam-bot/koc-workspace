/** Laboratory Safety — flashcard deck (88 cards) */
const FLASHCARD_TAGS = ["Chemistry", "LaboratorySafety", "S3", "HKDSE"];

const FLASHCARD_DECK = [
  {
    "id": 1,
    "subtopic": "Common apparatus",
    "front": "Where are test tubes placed when not in use?",
    "back": "In a <strong>test tube rack</strong>",
    "image": "./assets/G001.png",
    "imageAlt": "Test tubes: rack, stopper, test tube, boiling tube, holder, brush"
  },
  {
    "id": 2,
    "subtopic": "Common apparatus",
    "front": "Where does a test tube holder grip the tube?",
    "back": "<strong>Near its mouth</strong>"
  },
  {
    "id": 3,
    "subtopic": "Common apparatus",
    "front": "Large test tubes used to boil more liquid are called…?",
    "back": "<strong>Boiling tubes</strong>",
    "image": "./assets/G001.png",
    "imageAlt": "Test tubes: rack, stopper, test tube, boiling tube, holder, brush"
  },
  {
    "id": 4,
    "subtopic": "Common apparatus",
    "front": "Two main uses of a beaker?",
    "back": "Holding and <strong>heating</strong> a large volume of liquid"
  },
  {
    "id": 5,
    "subtopic": "Common apparatus",
    "front": "Name four common flask types.",
    "back": "Flat-bottomed; round-bottomed; <strong>conical</strong>; <strong>volumetric</strong>",
    "image": "./assets/G002.png",
    "imageAlt": "Flask drawings: flat-bottomed, round-bottomed, conical, volumetric"
  },
  {
    "id": 6,
    "subtopic": "Common apparatus",
    "front": "Which flask has a <strong>graduation mark</strong>?",
    "back": "<strong>Volumetric flask</strong>",
    "image": "./assets/G002.png",
    "imageAlt": "Flask drawings: flat-bottomed, round-bottomed, conical, volumetric"
  },
  {
    "id": 7,
    "subtopic": "Common apparatus",
    "front": "Watch glass and Petri dish are mainly for…?",
    "back": "<strong>Temporary storage</strong> of solids (sometimes liquids)",
    "image": "./assets/G004.png",
    "imageAlt": "Watch glass and Petri dish"
  },
  {
    "id": 8,
    "subtopic": "Common apparatus",
    "front": "Name three common laboratory bottles.",
    "back": "Plastic <strong>wash</strong> bottle; <strong>reagent</strong> bottle; <strong>dropping</strong> bottle",
    "image": "./assets/G005.png",
    "imageAlt": "Plastic wash bottle, reagent bottle, dropping bottle"
  },
  {
    "id": 9,
    "subtopic": "Common apparatus",
    "front": "What are evaporating basins used for?",
    "back": "To <strong>evaporate</strong> solutions",
    "image": "./assets/G006.png",
    "imageAlt": "Evaporating a solution in an evaporating basin"
  },
  {
    "id": 10,
    "subtopic": "Common apparatus",
    "front": "What material are crucibles usually made of?",
    "back": "<strong>Porcelain</strong>"
  },
  {
    "id": 11,
    "subtopic": "Common apparatus",
    "front": "What supports a crucible on a tripod?",
    "back": "A <strong>pipe-clay triangle</strong>",
    "image": "./assets/G008.png",
    "imageAlt": "Heating set: crucible, pipe-clay triangle, tripod, Bunsen, tongs"
  },
  {
    "id": 12,
    "subtopic": "Common apparatus",
    "front": "How do you handle a hot crucible?",
    "back": "With <strong>crucible tongs</strong>",
    "image": "./assets/G008.png",
    "imageAlt": "Heating set: crucible, pipe-clay triangle, tripod, Bunsen, tongs"
  },
  {
    "id": 13,
    "subtopic": "Common apparatus",
    "front": "Two uses of a gas syringe?",
    "back": "<strong>Collect</strong> a gas; <strong>measure</strong> its volume",
    "image": "./assets/G009.png",
    "imageAlt": "Gas syringe collecting gas"
  },
  {
    "id": 14,
    "subtopic": "Common apparatus",
    "front": "Mortar and pestle are used to…?",
    "back": "Grind a solid into a <strong>fine powder</strong>",
    "image": "./assets/G010.png",
    "imageAlt": "Mortar and pestle"
  },
  {
    "id": 15,
    "subtopic": "Common apparatus",
    "front": "Spatulas are used to pick up…?",
    "back": "<strong>Small amounts of solids</strong>",
    "image": "./assets/G011.png",
    "imageAlt": "Spatulas, dropper, teat pipette, glass rod, thermometer"
  },
  {
    "id": 16,
    "subtopic": "Common apparatus",
    "front": "Droppers and teat pipettes add…?",
    "back": "<strong>Drop quantities</strong> of a liquid",
    "image": "./assets/G011.png",
    "imageAlt": "Spatulas, dropper, teat pipette, glass rod, thermometer"
  },
  {
    "id": 17,
    "subtopic": "Common apparatus",
    "front": "A glass rod is used for…?",
    "back": "<strong>Stirring</strong>",
    "image": "./assets/G011.png",
    "imageAlt": "Spatulas, dropper, teat pipette, glass rod, thermometer"
  },
  {
    "id": 18,
    "subtopic": "Common apparatus",
    "front": "A thermometer is used to…?",
    "back": "Measure <strong>temperature</strong>",
    "image": "./assets/G011.png",
    "imageAlt": "Spatulas, dropper, teat pipette, glass rod, thermometer"
  },
  {
    "id": 19,
    "subtopic": "Common apparatus",
    "front": "Two uses of a filter funnel?",
    "back": "<strong>Filtration</strong>; addition of liquid",
    "image": "./assets/G012.png",
    "imageAlt": "Funnels: filter, thistle, tap, separating"
  },
  {
    "id": 20,
    "subtopic": "Common apparatus",
    "front": "A thistle funnel is used for…?",
    "back": "Addition of liquid during <strong>gas preparation</strong>",
    "image": "./assets/G012.png",
    "imageAlt": "Funnels: filter, thistle, tap, separating"
  },
  {
    "id": 21,
    "subtopic": "Common apparatus",
    "front": "Why close the tap of a tap funnel during gas preparation?",
    "back": "Prevents <strong>escape of gas</strong> through the funnel",
    "image": "./assets/G012.png",
    "imageAlt": "Funnels: filter, thistle, tap, separating"
  },
  {
    "id": 22,
    "subtopic": "Common apparatus",
    "front": "A separating funnel separates…?",
    "back": "Two <strong>immiscible</strong> liquids",
    "image": "./assets/G012.png",
    "imageAlt": "Funnels: filter, thistle, tap, separating"
  },
  {
    "id": 23,
    "subtopic": "Common apparatus",
    "front": "What does a desiccator keep substances away from?",
    "back": "<strong>Moisture</strong> from the air",
    "image": "./assets/G013.png",
    "imageAlt": "Desiccator with drying agent"
  },
  {
    "id": 24,
    "subtopic": "Common apparatus",
    "front": "Name two drying agents used in a desiccator.",
    "back": "Anhydrous <strong>calcium chloride</strong>; <strong>silica gel</strong>"
  },
  {
    "id": 25,
    "subtopic": "Common apparatus",
    "front": "Which apparatus should you use for accurate weighing of substances?",
    "back": "<strong>Electronic balance</strong>"
  },
  {
    "id": 26,
    "subtopic": "Common apparatus",
    "front": "When weighing chemicals, don't place them directly on the balance pan. Instead, place them on…?",
    "back": "Filter paper or a <strong>weighing bottle</strong>",
    "image": "./assets/G014.png",
    "imageAlt": "Analytical balance and top-loading balance"
  },
  {
    "id": 27,
    "subtopic": "Common apparatus",
    "front": "Which three apparatus give <strong>accurate</strong> liquid volumes?",
    "back": "<strong>Pipette</strong>; <strong>burette</strong>; <strong>volumetric flask</strong>",
    "image": "./assets/G015.png",
    "imageAlt": "Pipette, burette, volumetric flask, measuring cylinder"
  },
  {
    "id": 28,
    "subtopic": "Common apparatus",
    "front": "Does a measuring cylinder give an <strong>accurate</strong> or a <strong>rough</strong> measurement?",
    "back": "<strong>Rough</strong> measurement",
    "image": "./assets/G015.png",
    "imageAlt": "Pipette, burette, volumetric flask, measuring cylinder"
  },
  {
    "id": 29,
    "subtopic": "Bunsen burner",
    "front": "First step when lighting a Bunsen burner?",
    "back": "<strong>Close the air hole</strong>",
    "image": "./assets/G016.png",
    "imageAlt": "Bunsen burner parts"
  },
  {
    "id": 30,
    "subtopic": "Bunsen burner",
    "front": "What does the <strong>gas tap</strong> control?",
    "back": "Supply of fuel → <strong>size</strong> of the flame",
    "image": "./assets/G016.png",
    "imageAlt": "Bunsen burner parts"
  },
  {
    "id": 31,
    "subtopic": "Bunsen burner",
    "front": "What does the <strong>air hole</strong> control?",
    "back": "Air supply → <strong>luminosity</strong> and <strong>temperature</strong> of the flame"
  },
  {
    "id": 32,
    "subtopic": "Bunsen burner",
    "front": "Air hole <strong>open</strong>: flame type and temperature?",
    "back": "<strong>Non-luminous</strong> blue flame; <strong>high</strong> temperature"
  },
  {
    "id": 33,
    "subtopic": "Bunsen burner",
    "front": "Air hole <strong>closed</strong>: flame type and temperature?",
    "back": "<strong>Luminous</strong> yellow flame; <strong>lower</strong> temperature"
  },
  {
    "id": 34,
    "subtopic": "Bunsen burner",
    "front": "Why is burning more complete when the air hole is open?",
    "back": "More air mixes with the gaseous fuel"
  },
  {
    "id": 35,
    "subtopic": "Transferring and mixing",
    "front": "Tool for transferring solid into a test tube?",
    "back": "Clean dry <strong>spatula</strong>"
  },
  {
    "id": 36,
    "subtopic": "Transferring and mixing",
    "front": "May unused chemicals be put back into the reagent bottle?",
    "back": "<strong>Never</strong>"
  },
  {
    "id": 37,
    "subtopic": "Transferring and mixing",
    "front": "When pouring from a reagent bottle, where is the stopper held?",
    "back": "In the <strong>hand</strong> (not on the bench)",
    "image": "./assets/G018.png",
    "imageAlt": "Transfer a liquid from a reagent bottle"
  },
  {
    "id": 38,
    "subtopic": "Transferring and mixing",
    "front": "How do you pour liquid from a beaker without spilling?",
    "back": "Run it down a <strong>glass rod</strong> at the lip",
    "image": "./assets/G019.png",
    "imageAlt": "Pour a liquid from a beaker down a glass rod"
  },
  {
    "id": 39,
    "subtopic": "Transferring and mixing",
    "front": "Name any three ways to mix substances in a test tube.",
    "back": "Shake gently; stir with glass rod; tap bottom; pour to and fro; stopper and shake (any three)",
    "image": "./assets/G020.png",
    "imageAlt": "Five ways to mix in a test tube"
  },
  {
    "id": 40,
    "subtopic": "Transferring and mixing",
    "front": "For vigorous mixing in a test tube, what should you do?",
    "back": "<strong>Stopper</strong> the tube and shake",
    "image": "./assets/G020.png",
    "imageAlt": "Five ways to mix in a test tube"
  },
  {
    "id": 41,
    "subtopic": "Heating",
    "front": "Heating a dry solid (no water given off): tube orientation?",
    "back": "<strong>Horizontally</strong>; solid in a shallow layer"
  },
  {
    "id": 42,
    "subtopic": "Heating",
    "front": "Heating a solid that gives off water: tube orientation?",
    "back": "Slightly <strong>sloping downwards</strong>",
    "image": "./assets/G021.png",
    "imageAlt": "Heating a hydrated solid with tube sloping downwards"
  },
  {
    "id": 43,
    "subtopic": "Heating",
    "front": "Why slope the tube downwards when heating a hydrated solid?",
    "back": "Stops condensed water running back and <strong>cracking</strong> the hot glass",
    "image": "./assets/G021.png",
    "imageAlt": "Heating a hydrated solid with tube sloping downwards"
  },
  {
    "id": 44,
    "subtopic": "Heating",
    "front": "Apparatus for heating a solid <strong>very strongly</strong>?",
    "back": "<strong>Crucible</strong>",
    "image": "./assets/G007.png",
    "imageAlt": "Very strong heating a solid in a crucible"
  },
  {
    "id": 45,
    "subtopic": "Heating",
    "front": "Max fill when heating liquid in a test tube?",
    "back": "Not more than <strong>one-third</strong> full",
    "image": "./assets/G022.png",
    "imageAlt": "Heating a liquid in a test tube"
  },
  {
    "id": 46,
    "subtopic": "Heating",
    "front": "Flame type for heating liquid in a test tube?",
    "back": "Small <strong>non-luminous</strong> flame",
    "image": "./assets/G022.png",
    "imageAlt": "Heating a liquid in a test tube"
  },
  {
    "id": 47,
    "subtopic": "Heating",
    "front": "Why swirl continuously when heating liquid in a test tube?",
    "back": "So heating is <strong>uniform</strong>",
    "image": "./assets/G022.png",
    "imageAlt": "Heating a liquid in a test tube"
  },
  {
    "id": 48,
    "subtopic": "Heating",
    "front": "How to heat a large quantity of liquid?",
    "back": "In a <strong>beaker</strong> on tripod and <strong>wire gauze</strong>",
    "image": "./assets/G023.png",
    "imageAlt": "Heat a large quantity of liquid in a beaker"
  },
  {
    "id": 49,
    "subtopic": "Heating",
    "front": "How to heat a volatile or flammable liquid?",
    "back": "Use a <strong>water-bath</strong> (oil-bath if higher temperature needed)",
    "image": "./assets/G024.png",
    "imageAlt": "Water-bath for a volatile or flammable liquid"
  },
  {
    "id": 50,
    "subtopic": "Heating",
    "front": "Setup to evaporate a solution quickly?",
    "back": "<strong>Steam-bath</strong>",
    "image": "./assets/G025.png",
    "imageAlt": "Steam-bath to evaporate a solution quickly"
  },
  {
    "id": 51,
    "subtopic": "Heating",
    "front": "Safety item to wear when heating liquid in a test tube?",
    "back": "<strong>Safety spectacles</strong>"
  },
  {
    "id": 52,
    "subtopic": "Collecting and drying gases",
    "front": "Method for gases less dense than air?",
    "back": "<strong>Upward delivery</strong> / downward displacement of air",
    "image": "./assets/G026.png",
    "imageAlt": "Upward delivery / downward displacement of air"
  },
  {
    "id": 53,
    "subtopic": "Collecting and drying gases",
    "front": "Examples of gases collected by upward delivery?",
    "back": "<strong>Hydrogen</strong>; methane; ammonia (any two)"
  },
  {
    "id": 54,
    "subtopic": "Collecting and drying gases",
    "front": "Method for gases denser than air?",
    "back": "<strong>Downward delivery</strong> / upward displacement of air",
    "image": "./assets/G027.png",
    "imageAlt": "Downward delivery / upward displacement of air"
  },
  {
    "id": 55,
    "subtopic": "Collecting and drying gases",
    "front": "Examples of gases collected by downward delivery?",
    "back": "<strong>Carbon dioxide</strong>; chlorine; sulphur dioxide (any two)"
  },
  {
    "id": 56,
    "subtopic": "Collecting and drying gases",
    "front": "Displacement of water collects what kind of gases?",
    "back": "<strong>Water-insoluble</strong> gases",
    "image": "./assets/G028.png",
    "imageAlt": "Displacement of water"
  },
  {
    "id": 57,
    "subtopic": "Collecting and drying gases",
    "front": "Which collection method works for <strong>any</strong> gas?",
    "back": "<strong>Gas syringe</strong>",
    "image": "./assets/G029.png",
    "imageAlt": "Collecting gas with a gas syringe"
  },
  {
    "id": 58,
    "subtopic": "Collecting and drying gases",
    "front": "Why remove the delivery tube before stopping heating?",
    "back": "Prevents <strong>sucking back</strong> of water (may crack hot glass)"
  },
  {
    "id": 59,
    "subtopic": "Collecting and drying gases",
    "front": "Why keep oven < 105°C for drying hydrated salts?",
    "back": "Otherwise <strong>water of crystallization</strong> is removed"
  },
  {
    "id": 60,
    "subtopic": "Collecting and drying gases",
    "front": "Besides an oven, dry crystals can be dried using…?",
    "back": "<strong>Filter papers</strong>"
  },
  {
    "id": 61,
    "subtopic": "Collecting and drying gases",
    "front": "Drying agent for ammonia gas?",
    "back": "Anhydrous <strong>calcium oxide</strong>",
    "image": "./assets/G030.png",
    "imageAlt": "Drying ammonia with anhydrous calcium oxide"
  },
  {
    "id": 62,
    "subtopic": "Collecting and drying gases",
    "front": "Drying agent for acidic gases?",
    "back": "Concentrated <strong>sulphuric acid</strong>",
    "image": "./assets/G031.png",
    "imageAlt": "Drying acidic gases with concentrated sulphuric acid"
  },
  {
    "id": 63,
    "subtopic": "Smelling and testing gases",
    "front": "How should you smell a gas (not breathe directly above)?",
    "back": "<strong>Fan</strong> a little gas towards your nose"
  },
  {
    "id": 64,
    "subtopic": "Smelling and testing gases",
    "front": "Gas test method using a delivery tube?",
    "back": "Bubble gas through a <strong>testing solution</strong>",
    "image": "./assets/G032.png",
    "imageAlt": "Testing a gas with a delivery tube into a testing solution"
  },
  {
    "id": 65,
    "subtopic": "Smelling and testing gases",
    "front": "Gas test method using testing paper?",
    "back": "Hold <strong>moist</strong> testing paper at the mouth of the vessel",
    "image": "./assets/G033.png",
    "imageAlt": "Testing a gas with moist testing paper"
  },
  {
    "id": 66,
    "subtopic": "Smelling and testing gases",
    "front": "Gas test with a glass rod: what is on the rod?",
    "back": "<strong>1 drop</strong> of testing solution",
    "image": "./assets/G034.png",
    "imageAlt": "Testing a gas with a glass rod holding one drop of solution"
  },
  {
    "id": 67,
    "subtopic": "Storage and microscale",
    "front": "Potassium and sodium are kept under…?",
    "back": "<strong>Paraffin oil</strong>"
  },
  {
    "id": 68,
    "subtopic": "Storage and microscale",
    "front": "Yellow phosphorus is kept under…?",
    "back": "<strong>Water</strong>"
  },
  {
    "id": 69,
    "subtopic": "Storage and microscale",
    "front": "Where should flammable / volatile liquids be stored?",
    "back": "Cool place, away from sunlight and heat"
  },
  {
    "id": 70,
    "subtopic": "Storage and microscale",
    "front": "Should containers of flammable liquids be completely filled?",
    "back": "<strong>No</strong>"
  },
  {
    "id": 71,
    "subtopic": "Storage and microscale",
    "front": "How are water-absorbing chemicals stored?",
    "back": "In <strong>well-sealed</strong> containers"
  },
  {
    "id": 72,
    "subtopic": "Storage and microscale",
    "front": "Examples of chemicals that absorb water?",
    "back": "AlCl<sub>3</sub>; NaOH; KOH; <strong>conc.</strong> H<sub>2</sub>SO<sub>4</sub> (any two)"
  },
  {
    "id": 73,
    "subtopic": "Storage and microscale",
    "front": "Chemicals that decompose in light are kept in…?",
    "back": "<strong>Brown bottles</strong>"
  },
  {
    "id": 74,
    "subtopic": "Storage and microscale",
    "front": "Examples kept in brown bottles?",
    "back": "<strong>Conc.</strong> HNO<sub>3</sub>; AgNO<sub>3</sub>; H<sub>2</sub>O<sub>2</sub>; chlorine water; bromine water (any two)"
  },
  {
    "id": 75,
    "subtopic": "Storage and microscale",
    "front": "Name two advantages of microscale experiments.",
    "back": "Less chemicals / less waste / lower cost / faster / fewer hazards (any two)"
  },
  {
    "id": 76,
    "subtopic": "Storage and microscale",
    "front": "Why keep potassium and sodium under oil / phosphorus under water?",
    "back": "Prevent contact and reaction with <strong>air</strong>"
  },
  {
    "id": 77,
    "subtopic": "Hazard symbols",
    "front": "What hazard does this symbol show?",
    "back": "<strong>Explosive</strong> / 爆炸性",
    "image": "./assets/G035-front.png",
    "imageAlt": "Hazard symbol (labels hidden): explosive",
    "imageFace": "front"
  },
  {
    "id": 78,
    "subtopic": "Hazard symbols",
    "front": "What hazard does this symbol show?",
    "back": "<strong>Oxidizing</strong> / 助燃",
    "image": "./assets/G036-front.png",
    "imageAlt": "Hazard symbol (labels hidden): oxidizing",
    "imageFace": "front"
  },
  {
    "id": 79,
    "subtopic": "Hazard symbols",
    "front": "What hazard does this symbol show?",
    "back": "<strong>Flammable</strong> / 易燃",
    "image": "./assets/G037-front.png",
    "imageAlt": "Hazard symbol (labels hidden): flammable",
    "imageFace": "front"
  },
  {
    "id": 80,
    "subtopic": "Hazard symbols",
    "front": "What hazard does this symbol show?",
    "back": "<strong>Carcinogenic</strong> / 致癌物",
    "image": "./assets/G038-front.png",
    "imageAlt": "Hazard symbol (labels hidden): carcinogenic",
    "imageFace": "front"
  },
  {
    "id": 81,
    "subtopic": "Hazard symbols",
    "front": "What hazard does this symbol show?",
    "back": "<strong>Toxic</strong> / 有毒",
    "image": "./assets/G039-front.png",
    "imageAlt": "Hazard symbol (labels hidden): toxic",
    "imageFace": "front"
  },
  {
    "id": 82,
    "subtopic": "Hazard symbols",
    "front": "What hazard does this symbol show?",
    "back": "<strong>Harmful</strong> / 有害",
    "image": "./assets/G040-front.png",
    "imageAlt": "Hazard symbol (labels hidden): harmful",
    "imageFace": "front"
  },
  {
    "id": 83,
    "subtopic": "Hazard symbols",
    "front": "What hazard does this symbol show?",
    "back": "<strong>Corrosive</strong> / 腐蝕性",
    "image": "./assets/G041-front.png",
    "imageAlt": "Hazard symbol (labels hidden): corrosive",
    "imageFace": "front"
  },
  {
    "id": 84,
    "subtopic": "Hazard symbols",
    "front": "What hazard does this symbol show?",
    "back": "<strong>Irritant</strong> / 刺激性",
    "image": "./assets/G042-front.png",
    "imageAlt": "Hazard symbol (labels hidden): irritant",
    "imageFace": "front"
  },
  {
    "id": 85,
    "subtopic": "Hazard symbols",
    "front": "Define <strong>explosive</strong> (hazard).",
    "back": "May explode if ignited, heated, or by shock / friction"
  },
  {
    "id": 86,
    "subtopic": "Hazard symbols",
    "front": "Define <strong>flammable</strong> (hazard).",
    "back": "Can catch fire easily under ordinary conditions"
  },
  {
    "id": 87,
    "subtopic": "Hazard symbols",
    "front": "Define <strong>toxic</strong> (hazard).",
    "back": "If breathed / swallowed / absorbed → serious health risk or death"
  },
  {
    "id": 88,
    "subtopic": "Hazard symbols",
    "front": "What should you do if concentrated acid spills on skin/eyes?",
    "back": "Wash the affected area with running water for at least 3 minutes and go for medical check-up."
  }
];
