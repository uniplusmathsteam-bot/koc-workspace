const NUT = ["rs", "nrs", "starch", "protein", "lipid", "vitC"];
const NUT_LABEL = {
  rs: "Reducing sugar",
  nrs: "Non-reducing sugar",
  starch: "Starch",
  protein: "Protein",
  lipid: "Lipid",
  vitC: "Vitamin C",
};
const LEVEL = (n) => (n >= 8 ? "+++" : n >= 5 ? "++" : n >= 2 ? "+" : n >= 1 ? "±" : "−");

const FOODS = [
  { id: "lemon", name: "Lemon juice", zh: "檸檬汁", form: "liquid", color: "#f3e27a", photo: "Lemon.jpg", source: "Vitamin C", n: { rs: 2, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 9 }, note: "Classic DSE vitamin C sample. Weak reducing sugar." },
  { id: "orange", name: "Orange juice", zh: "橙汁", form: "liquid", color: "#f4a02a", photo: "Orange-Fruit-Pieces.jpg", source: "Vitamin C", n: { rs: 4, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 8 }, note: "High vitamin C; also a reducing-sugar source." },
  { id: "apple", name: "Apple juice", zh: "蘋果汁", form: "liquid", color: "#e8c96a", photo: "Red_Apple.jpg", source: "Carbohydrate · fibre", n: { rs: 5, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 3 }, note: "Reducing sugar from fructose; modest vitamin C." },
  { id: "glucose", name: "Glucose solution", zh: "葡萄糖溶液", form: "liquid", color: "#f7f2d8", photo: "Glucose-3D-balls.png", n: { rs: 10, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 0 }, note: "Standard positive control for Benedict's test." },
  { id: "sucrose", name: "Sucrose solution", zh: "蔗糖溶液", form: "liquid", color: "#f3f0ea", photo: "Sucrose_crystals.jpg", n: { rs: 0, nrs: 10, starch: 0, protein: 0, lipid: 0, vitC: 0 }, note: "Non-reducing sugar. Negative Benedict's until hydrolysed." },
  { id: "starchsol", name: "Starch solution", zh: "澱粉溶液", form: "liquid", color: "#f0eee6", photo: "Potato_starch.jpg", n: { rs: 0, nrs: 0, starch: 10, protein: 0, lipid: 0, vitC: 0 }, note: "Positive control for the iodine test." },
  { id: "albumen", name: "Egg albumen", zh: "蛋白溶液", form: "liquid", color: "#f4f1e6", photo: "Chicken_egg.jpg", source: "Protein", n: { rs: 0, nrs: 0, starch: 0, protein: 10, lipid: 0, vitC: 0 }, note: "Standard Biuret sample (peptide bonds)." },
  { id: "milk", name: "Fresh milk", zh: "鮮奶", form: "liquid", color: "#f7f4ea", photo: "Glass_of_milk.jpg", source: "Protein · calcium", n: { rs: 3, nrs: 0, starch: 0, protein: 6, lipid: 5, vitC: 0 }, note: "Lactose (reducing), casein (protein), milk fat." },
  { id: "oil", name: "Cooking oil", zh: "食油", form: "liquid", color: "#e6c04a", photo: "Olive_oil_from_Oneglia.jpg", n: { rs: 0, nrs: 0, starch: 0, protein: 0, lipid: 10, vitC: 0 }, note: "Pure lipid. Emulsion / grease-spot positive." },
  { id: "honey", name: "Honey", zh: "蜂蜜", form: "liquid", color: "#d9921a", photo: "Runny_hunny.jpg", n: { rs: 9, nrs: 1, starch: 0, protein: 0, lipid: 0, vitC: 0 }, note: "Mostly glucose and fructose — strong Benedict's." },
  { id: "water", name: "Distilled water", zh: "蒸餾水", form: "liquid", color: "#d7e8f4", photo: "Glass_of_water.jpg", n: { rs: 0, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 0 }, note: "Negative control for every food test." },
  { id: "potato", name: "Potato", zh: "馬鈴薯", form: "block", color: "#e4d2a0", photo: "Patates.jpg", source: "Carbohydrate", n: { rs: 0, nrs: 0, starch: 9, protein: 1, lipid: 0, vitC: 2 }, note: "Starch store. Weak vitamin C in raw extract." },
  { id: "bread", name: "Bread", zh: "麵包", form: "block", color: "#d2a36a", photo: "Korb_mit_Brotchen.JPG", n: { rs: 2, nrs: 0, starch: 8, protein: 3, lipid: 1, vitC: 0 }, note: "Starch plus some protein from flour / gluten." },
  { id: "rice", name: "Cooked rice", zh: "飯", form: "block", color: "#f3efe4", photo: "White_rice.jpg", n: { rs: 0, nrs: 0, starch: 9, protein: 1, lipid: 0, vitC: 0 }, note: "Almost pure starch in DSE practicals." },
  { id: "onion", name: "Onion", zh: "洋蔥", form: "block", color: "#f0d9a8", photo: "Onion_on_White.JPG", n: { rs: 6, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 2 }, note: "Reducing sugar, no starch — classic contrast with potato." },
  { id: "banana", name: "Banana", zh: "香蕉", form: "block", color: "#f2d65a", photo: "Banana-Single.jpg", source: "Carbohydrate · fibre", n: { rs: 6, nrs: 0, starch: 5, protein: 0, lipid: 0, vitC: 2 }, note: "Ripe fruit: reducing sugar and remaining starch." },
  { id: "peanut", name: "Peanut", zh: "花生", form: "block", color: "#c4924a", photo: "Peanuts.jpg", n: { rs: 0, nrs: 0, starch: 2, protein: 7, lipid: 9, vitC: 0 }, note: "Protein + lipid seed. Grease spot and Biuret positive." },
  { id: "butter", name: "Butter", zh: "牛油", form: "block", color: "#f0d05a", photo: "Butter.jpg", n: { rs: 0, nrs: 0, starch: 0, protein: 0, lipid: 10, vitC: 0 }, note: "Almost all lipid. Permanent translucent spot." },
  { id: "cabbage", name: "Cabbage", zh: "椰菜", form: "block", color: "#8fbf6a", photo: "Cabbage_and_cross_section_on_white.jpg", n: { rs: 2, nrs: 0, starch: 0, protein: 1, lipid: 0, vitC: 6 }, note: "Leafy vitamin C source used in comparison experiments." },
  { id: "yolk", name: "Egg yolk", zh: "蛋黃", form: "block", color: "#f0b429", photo: "Egg_yolk.jpg", source: "Protein · vitamin A · vitamin D", n: { rs: 0, nrs: 0, starch: 0, protein: 6, lipid: 8, vitC: 0 }, note: "Protein and lipid together. Vitamin A and D in the yolk." },
  { id: "soy", name: "Soya bean", zh: "大豆", form: "block", color: "#c8b56a", photo: "Soybean_us.jpg", n: { rs: 0, nrs: 0, starch: 3, protein: 8, lipid: 5, vitC: 0 }, note: "Plant protein staple in DSE diet questions." },
  { id: "fish", name: "Fish flesh", zh: "魚肉", form: "block", color: "#f0d8d0", photo: "Salmon_steak.jpg", source: "Protein · iodine", n: { rs: 0, nrs: 0, starch: 0, protein: 9, lipid: 3, vitC: 0 }, note: "Muscle protein; some oil in fatty fish." },
  { id: "meat", name: "Lean meat", zh: "瘦肉", form: "block", color: "#c45a4a", photo: "Raw_steak.jpg", source: "Protein", n: { rs: 0, nrs: 0, starch: 0, protein: 9, lipid: 2, vitC: 0 }, note: "Protein-rich animal tissue." },
  { id: "brownrice", name: "Brown rice", zh: "糙米", form: "block", color: "#c4a86a", source: "Carbohydrate · fibre", n: { rs: 0, nrs: 0, starch: 8, protein: 2, lipid: 1, vitC: 0 }, note: "Whole grain. Starch plus fibre in the bran." },
  { id: "oats", name: "Oats", zh: "燕麥", form: "block", color: "#d8c088", source: "Carbohydrate · fibre", n: { rs: 0, nrs: 0, starch: 7, protein: 3, lipid: 2, vitC: 0 }, note: "Whole grain. Iodine test positive for starch." },
  { id: "wholewheat", name: "Whole wheat", zh: "全麥", form: "block", color: "#c4a060", source: "Carbohydrate · fibre", n: { rs: 1, nrs: 0, starch: 7, protein: 3, lipid: 1, vitC: 0 }, note: "Whole-grain cereal. Starch and some gluten protein." },
  { id: "pear", name: "Pear", zh: "梨", form: "block", color: "#d8e07a", source: "Carbohydrate · fibre", n: { rs: 5, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 2 }, note: "Fruit reducing sugar (fructose). Fibre source." },
  { id: "salmon", name: "Salmon", zh: "三文魚", form: "block", color: "#e87858", source: "Unsaturated fat · vitamin D", n: { rs: 0, nrs: 0, starch: 0, protein: 8, lipid: 7, vitC: 0 }, note: "Fatty fish. Protein + lipid; DSE source of vitamin D / omega-3." },
  { id: "mackerel", name: "Mackerel", zh: "鯖魚", form: "block", color: "#6a8aaa", source: "Unsaturated fat · vitamin D", n: { rs: 0, nrs: 0, starch: 0, protein: 8, lipid: 7, vitC: 0 }, note: "Fatty fish. Grease-spot / emulsion positive." },
  { id: "walnut", name: "Walnut", zh: "合桃", form: "block", color: "#8a5a32", source: "Unsaturated fat", n: { rs: 0, nrs: 0, starch: 1, protein: 4, lipid: 9, vitC: 0 }, note: "Nut. High lipid; Biuret weakly positive." },
  { id: "almond", name: "Almond", zh: "杏仁", form: "block", color: "#d4b07a", source: "Unsaturated fat", n: { rs: 0, nrs: 0, starch: 1, protein: 5, lipid: 8, vitC: 0 }, note: "Nut. Protein and unsaturated fat." },
  { id: "flax", name: "Flaxseeds", zh: "亞麻籽", form: "block", color: "#6a4a2a", source: "Unsaturated fat", n: { rs: 0, nrs: 0, starch: 1, protein: 3, lipid: 8, vitC: 0 }, note: "Seed oil. Emulsion / grease-spot positive." },
  { id: "chia", name: "Chia seeds", zh: "奇亞籽", form: "block", color: "#4a3a32", source: "Unsaturated fat", n: { rs: 0, nrs: 0, starch: 2, protein: 3, lipid: 6, vitC: 0 }, note: "Seed. Lipid plus some starch." },
  { id: "chicken", name: "Chicken", zh: "雞肉", form: "block", color: "#e8c8b0", source: "Protein", n: { rs: 0, nrs: 0, starch: 0, protein: 9, lipid: 2, vitC: 0 }, note: "Lean meat. Strong Biuret positive." },
  { id: "turkey", name: "Turkey", zh: "火雞", form: "block", color: "#d4b498", source: "Protein", n: { rs: 0, nrs: 0, starch: 0, protein: 9, lipid: 1, vitC: 0 }, note: "Lean meat. Protein; little lipid." },
  { id: "lentil", name: "Lentils", zh: "扁豆", form: "block", color: "#c45a3a", source: "Protein · iron", n: { rs: 0, nrs: 0, starch: 4, protein: 6, lipid: 0, vitC: 0 }, note: "Legume. Protein and starch; DSE iron source." },
  { id: "chickpea", name: "Chickpeas", zh: "鷹嘴豆", form: "block", color: "#e0c070", source: "Protein · iron", n: { rs: 0, nrs: 0, starch: 4, protein: 6, lipid: 1, vitC: 0 }, note: "Legume. Biuret and iodine both positive." },
  { id: "yogurt", name: "Yogurt", zh: "乳酪", form: "liquid", color: "#f4f0e4", source: "Protein · calcium", n: { rs: 2, nrs: 0, starch: 0, protein: 5, lipid: 3, vitC: 0 }, note: "Dairy. Lactose, protein, calcium." },
  { id: "cheese", name: "Cheese", zh: "芝士", form: "block", color: "#f0c84a", source: "Calcium · protein", n: { rs: 0, nrs: 0, starch: 0, protein: 7, lipid: 8, vitC: 0 }, note: "Concentrated dairy protein and fat. Calcium source." },
  { id: "broccoli", name: "Broccoli", zh: "西蘭花", form: "block", color: "#4a9a4a", source: "Fibre · vitamin C", n: { rs: 1, nrs: 0, starch: 0, protein: 2, lipid: 0, vitC: 7 }, note: "Vegetable. DCPIP decolourises; some protein." },
  { id: "carrot", name: "Carrot", zh: "甘筍", form: "block", color: "#e87828", source: "Vitamin A · fibre", n: { rs: 2, nrs: 0, starch: 1, protein: 0, lipid: 0, vitC: 2 }, note: "Orange vegetable. β-carotene (vitamin A) source." },
  { id: "spinach", name: "Spinach", zh: "菠菜", form: "block", color: "#2a6a32", source: "Calcium · iron", n: { rs: 0, nrs: 0, starch: 0, protein: 2, lipid: 0, vitC: 4 }, note: "Leafy green. Iron and calcium in the diet list." },
  { id: "kale", name: "Kale", zh: "羽衣甘藍", form: "block", color: "#3a7a38", source: "Calcium · iron · vitamin C", n: { rs: 1, nrs: 0, starch: 0, protein: 2, lipid: 0, vitC: 7 }, note: "Leafy green. Strong vitamin C; also Ca / Fe." },
  { id: "plantmilk", name: "Fortified plant milk", zh: "強化植物奶", form: "liquid", color: "#efe6d4", source: "Calcium", n: { rs: 1, nrs: 0, starch: 0, protein: 2, lipid: 2, vitC: 0 }, note: "Fortified with calcium. Weaker protein than cow's milk unless soya." },
  { id: "fortmilk", name: "Fortified milk", zh: "強化牛奶", form: "liquid", color: "#f4f0e0", source: "Calcium · vitamin D", n: { rs: 3, nrs: 0, starch: 0, protein: 6, lipid: 5, vitC: 0 }, note: "Cow's milk with added vitamin D (and often A)." },
  { id: "redmeat", name: "Red meat", zh: "紅肉", form: "block", color: "#a83232", source: "Iron · protein", n: { rs: 0, nrs: 0, starch: 0, protein: 9, lipid: 4, vitC: 0 }, note: "Haem iron source. Biuret positive; some lipid." },
  { id: "liver", name: "Liver", zh: "肝", form: "block", color: "#7a3030", source: "Iron · vitamin A", n: { rs: 0, nrs: 0, starch: 0, protein: 8, lipid: 3, vitC: 2 }, note: "Offal. Protein, iron, and vitamin A." },
  { id: "salt", name: "Iodized salt", zh: "碘鹽", form: "block", color: "#f4f2ee", source: "Iodine", n: { rs: 0, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 0 }, note: "No organic nutrient for food tests. Dietary iodine source." },
  { id: "shrimp", name: "Shrimp", zh: "蝦", form: "block", color: "#f0a078", source: "Iodine · protein", n: { rs: 0, nrs: 0, starch: 0, protein: 8, lipid: 1, vitC: 0 }, note: "Seafood. Protein; DSE iodine source." },
  { id: "seaweed", name: "Seaweed", zh: "海藻", form: "block", color: "#2a5a3a", source: "Iodine", n: { rs: 0, nrs: 0, starch: 0, protein: 2, lipid: 0, vitC: 1 }, note: "Very high iodine. Little starch / lipid." },
  { id: "sweetpotato", name: "Sweet potato", zh: "番薯", form: "block", color: "#e09040", source: "Vitamin A · starch", n: { rs: 2, nrs: 0, starch: 7, protein: 1, lipid: 0, vitC: 3 }, note: "Starchy orange vegetable. β-carotene + iodine-test starch." },
  { id: "mango", name: "Mango", zh: "芒果", form: "block", color: "#f0b020", source: "Vitamin A", n: { rs: 6, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 5 }, note: "Orange fruit. Reducing sugar and vitamin A / C." },
  { id: "strawberry", name: "Strawberry", zh: "草莓", form: "block", color: "#d4303a", source: "Vitamin C", n: { rs: 3, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 8 }, note: "DCPIP decolourises readily. Some reducing sugar." },
  { id: "pepper", name: "Bell pepper", zh: "彩椒", form: "block", color: "#e03a2a", source: "Vitamin C", n: { rs: 2, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 9 }, note: "Among the richest vitamin C vegetables." },
  { id: "leaf", name: "Green leaf", zh: "綠葉", form: "block", color: "#3a7a32", source: "Starch (photosynthesis)", n: { rs: 0, nrs: 0, starch: 8, protein: 1, lipid: 0, vitC: 3 }, note: "Iodine test on a leaf: boil → hot alcohol → wash → iodine. Blue-black where starch is present." },
];

const TESTS = [
  { id: "clinistix", cat: "Carbohydrates", name: "Glucose", sub: "Clinistix paper · pink → purple", reagents: [], extra: ["clinistix", "dropper"] },
  { id: "benedict", cat: "Carbohydrates", name: "Reducing sugar", sub: "Benedict's · 1 cm³ + equal vol. + boil 5 min", reagents: ["benedict"], extra: ["tube", "dropper", "bath"], heatMin: 5 },
  { id: "iodine", cat: "Carbohydrates", name: "Starch", sub: "Iodine · food or leaf · boil 5 min", reagents: ["iodine", "alcohol", "water"], extra: ["tube", "dropper", "bath"], heatMin: 5 },
  { id: "albustix", cat: "Proteins", name: "Protein paper", sub: "Albustix · dip 1 s · read 60 s · yellow → green", reagents: [], extra: ["albustix", "dropper"] },
  { id: "biuret", cat: "Proteins", name: "Protein", sub: "Biuret reagent + shake", reagents: ["biuret"], extra: ["tube", "dropper"] },
  { id: "grease", cat: "Lipids", name: "Lipid", sub: "Grease spot + organic solvent", reagents: ["ethanol"], extra: ["paper", "dropper"] },
  { id: "vitc", cat: "Vitamin C", name: "Vitamin C", sub: "DCPIP · add sample dropwise", reagents: ["dcpip"], extra: ["tube", "dropper"], conc: { key: "dcpip", label: "DCPIP concentration", min: 0.05, max: 1, step: 0.05, unit: "%", def: 0.1, hint: "Add the sample dropwise to DCPIP and mix. Fewer drops to go colourless → higher vitamin C. Higher DCPIP conc. needs more drops." } },
  { id: "energy", cat: "Energy", name: "Energy in food", sub: "Burning test · time & ΔT", reagents: [], extra: ["burner", "dropper"] },
  { id: "nrs", cat: "Carbohydrates", name: "Non-reducing sugar", sub: "Hydrolysis + Benedict's", reagents: ["hcl", "nahco3", "benedict"], extra: ["tube", "dropper", "bath"], heatMin: 5 },
];

const REAGENTS = {
  dcpip: { name: "DCPIP", color: "#2a5bdb" },
  benedict: { name: "Benedict's", color: "#2f74c4" },
  iodine: { name: "Iodine", color: "#c4a035" },
  biuret: { name: "Biuret", color: "#3d7ec9" },
  naoh: { name: "NaOH", color: "#e8eef3" },
  cuso4: { name: "CuSO₄", color: "#4a8fd4" },
  ethanol: { name: "Alcohol", color: "#eef4f8" },
  alcohol: { name: "Hot alcohol", color: "#e8f0f4" },
  water: { name: "Water", color: "#d4e8f4" },
  hcl: { name: "Dil. HCl", color: "#f3efe4" },
  nahco3: { name: "NaHCO₃", color: "#f4f1ea" },
};

const LEAF_IDS = new Set(["leaf", "spinach", "kale", "cabbage"]);
const GLUCOSE_IDS = new Set(["glucose", "honey", "apple", "orange", "banana", "mango", "strawberry", "pear", "lemon"]);

function glucoseOf(food) {
  if (!food) return 0;
  if (food.id === "glucose") return 10;
  if (food.id === "honey") return 8;
  if (GLUCOSE_IDS.has(food.id)) return Math.max(2, food.n.rs);
  return 0;
}

function energyOf(food) {
  if (!food) return { carb: 0, prot: 0, lip: 0, kJ: 0, time: 0, dT: 0 };
  const carb = food.n.rs + food.n.nrs + food.n.starch;
  const prot = food.n.protein;
  const lip = food.n.lipid;
  const kJ = carb * 1.7 + prot * 1.7 + lip * 3.8;
  return {
    carb, prot, lip, kJ,
    time: Math.round(3 + carb * 0.35 + prot * 0.35 + lip * 0.7),
    dT: +(4 + carb * 0.9 + prot * 0.9 + lip * 1.8).toFixed(1),
  };
}

const BLUE = "#2f74c4";
const DCPIP_BLUE = "#2a5bdb";
const COLORLESS = "#f2f5f7";
const BROWN = "#c4a035";
const BLACK = "#1b1d33";
const PURPLE = "#7a3d9b";
const MILK = "#f0eee8";
const ALBUSTIX_YELLOW = "#f5e000";
const STRIP_READ_MS = 1000;

const ALBUSTIX_SCALE = [
  { key: "neg", label: "NEG.", reading: "NEG.", gl: "0 g/l", min: 0, max: 0, color: "#f5e000", word: "yellow" },
  { key: "0.3", label: "0.3", reading: "0.3 g/l", gl: "0.3 g/l", min: 1, max: 1, color: "#c8d84a", word: "pale green" },
  { key: "1.0", label: "1.0", reading: "1.0 g/l", gl: "1.0 g/l", min: 2, max: 3, color: "#6fb8a0", word: "light teal-green" },
  { key: "3.0", label: "3.0", reading: "3.0 g/l", gl: "3.0 g/l", min: 4, max: 6, color: "#2a8a82", word: "medium teal" },
  { key: "10", label: "≥ 10", reading: "≥ 10 g/l", gl: "≥ 10 g/l", min: 7, max: 10, color: "#163e42", word: "dark teal" },
];

function albustixBand(protein) {
  const n = Number(protein) || 0;
  return ALBUSTIX_SCALE.find((b) => n >= b.min && n <= b.max) || ALBUSTIX_SCALE[0];
}

function dipAlbustix(piece, foodId) {
  if (!piece) return;
  piece.foodId = foodId;
  if (piece.strip !== "albustix") return;
  piece.dippedAt = Date.now();
  setTimeout(() => {
    if (state.pieces.includes(piece) && piece.foodId === foodId) renderLab();
  }, STRIP_READ_MS);
}

const state = {
  tab: "lab",
  test: "vitc",
  conc: { dcpip: 0.1, sample: 5, iodine: 1 },
  foods: FOODS.map((f) => f.id),
  selectedFood: null,
  selectedPiece: null,
  pieces: [],
  dropper: { on: false, fill: null },
  nextId: 1,
  bankFilter: "all",
  bankQ: "",
  openCard: null,
  testCat: "",
};

let drag = null;
let heatTicker = null;
const LAB_MIN_MS = 1000;

function foodById(id) { return FOODS.find((f) => f.id === id); }
function testById(id) { return TESTS.find((t) => t.id === id); }
function uid() { return "p" + state.nextId++; }

function heatMinutesNeeded() {
  return testById(state.test)?.heatMin || 0;
}

function isBathHeating(bath) {
  return !!(bath?.heating && Date.now() - bath.heating.started < bath.heating.durationMs);
}

function heatingRemainMin(bath) {
  if (!isBathHeating(bath)) return 0;
  return Math.max(1, Math.ceil((bath.heating.durationMs - (Date.now() - bath.heating.started)) / 1000));
}

function heatingRemainFor(piece) {
  const bath = state.pieces.find((b) => b.kind === "bath" && isBathHeating(b) && b.heating.pieceIds.includes(piece.id));
  return bath ? heatingRemainMin(bath) : 0;
}

function lerpColor(a, b, t) {
  const p = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const [ar, ag, ab] = p(a), [br, bg, bb] = p(b);
  const c = (x, y) => Math.round(x + (y - x) * Math.min(1, Math.max(0, t)));
  return `rgb(${c(ar, br)},${c(ag, bg)},${c(ab, bb)})`;
}

function emptyContents() {
  return {
    foodId: null,
    foodDrops: 0,
    foodCm3: 0,
    poured: false,
    dcpip: 0, benedict: 0, iodine: 0, naoh: 0, cuso4: 0, biuret: 0,
    ethanol: 0, alcohol: 0, water: 0, hcl: 0, nahco3: 0,
    heated: 0, hydrolysed: false, neutralized: false, mixed: false, shaken: false,
  };
}

function foodAddPayload(foodId) {
  if (state.test === "vitc") return { foodId, drops: 1 };
  return { foodId, cm3: 1 };
}

function reagentAddPayload(reagentId) {
  return { reagent: reagentId, cm3: 1 };
}

function reagentSolutionCm3(c) {
  return (c.dcpip || 0) + (c.benedict || 0) + (c.iodine || 0) + (c.biuret || 0)
    + (c.ethanol || 0) + (c.alcohol || 0) + (c.water || 0) + (c.hcl || 0) + (c.nahco3 || 0);
}

function tubeMeasuredCm3(c) {
  return (c.foodCm3 || 0) + reagentSolutionCm3(c);
}

function dropperDoseLabel() {
  if (!state.dropper.fill) return "1 cm³";
  if (foodById(state.dropper.fill) && state.test === "vitc") return "1 drop";
  return "1 cm³";
}

function dropsNeededVitC(food, conc) {
  if (!food || food.n.vitC <= 0) return Infinity;
  return Math.max(1, Math.round((conc / 0.1) * (27 / food.n.vitC)));
}

function benedictColour(rs, reagentConc) {
  const score = rs * reagentConc;
  if (score < 1) return { color: BLUE, ppt: false, word: "remains blue" };
  if (score < 3) return { color: "#6aa84f", ppt: false, word: "blue → green" };
  if (score < 5.5) return { color: "#e1b833", ppt: false, word: "blue → yellow" };
  if (score < 8) return { color: "#e67e22", ppt: true, word: "blue → orange" };
  return { color: "#a83226", ppt: true, word: "blue → brick-red precipitate" };
}

function evaluateTube(piece) {
  const c = piece.contents;
  const food = foodById(c.foodId);
  const n = food ? food.n : { rs: 0, nrs: 0, starch: 0, protein: 0, lipid: 0, vitC: 0 };
  const test = state.test;
  const hasFood = !!(food && (c.foodDrops || c.foodCm3));
  const reagentCm3 = reagentSolutionCm3(c);
  const filled = (c.foodCm3 || 0) + c.foodDrops + reagentCm3;
  const vol = filled ? Math.min(78, 10 + (c.foodCm3 || 0) * 16 + c.foodDrops * 4 + reagentCm3 * 16) : 0;
  let color = "transparent";
  let ppt = false;
  let evPptAmt = "none";
  let cloudy = false;
  let fizz = false;
  let text = "Add a food sample, then the reagent.";
  let drops = null;

  if (test === "vitc") {
    const conc = state.conc.dcpip;
    if (c.dcpip <= 0) {
      color = hasFood ? food.color : "transparent";
      text = "Put 1 cm³ DCPIP in the tube first, then add the sample dropwise and mix after each drop.";
    } else {
      color = DCPIP_BLUE;
      const need = dropsNeededVitC(food, conc);
      drops = { used: c.foodDrops, need: Number.isFinite(need) ? need : "∞", conc };
      if (!food || n.vitC <= 0) {
        text = "Remains blue after mixing. No observable change — vitamin C absent.";
      } else if (c.foodDrops >= need) {
        color = COLORLESS;
        text = `Blue → colourless after ${need} drop(s). Vitamin C present. Fewer drops than another sample would mean a higher vitamin C concentration.`;
      } else {
        color = lerpColor(DCPIP_BLUE, COLORLESS, c.foodDrops / need);
        text = `Still blue. Mix, then add more drops. ${c.foodDrops} / ${need} drops needed at ${conc}% DCPIP.`;
      }
    }
  } else if (test === "benedict" || test === "nrs") {
    if (c.benedict <= 0 && test === "benedict") {
      color = hasFood ? food.color : "transparent";
      text = hasFood
        ? "Add an equal volume of Benedict's (1 cm³ with the dropper), then boil in a hot water bath for 5 minutes."
        : "Add 1 cm³ of food sample with the dropper, then an equal volume of Benedict's.";
    } else if (test === "nrs" && c.hcl > 0 && !c.hydrolysed) {
      color = food ? food.color : COLORLESS;
      const left = heatingRemainFor(piece);
      text = left
        ? `Heating to hydrolyse… still no colour change. ${left} min left (1 lab min = 1 s).`
        : "1 cm³ HCl added. Drag the tube into the water bath and boil for 5 minutes to hydrolyse.";
    } else if (test === "nrs" && c.hydrolysed && !c.neutralized) {
      color = food ? food.color : COLORLESS;
      fizz = c.nahco3 > 0;
      text = c.nahco3 > 0 ? "Fizzing as acid is neutralised. Add 1 cm³ Benedict's next." : "Hydrolysed. Neutralise with 1 cm³ NaHCO₃ before Benedict's.";
    } else if (c.benedict > 0 && c.heated < 1) {
      color = BLUE;
      const left = heatingRemainFor(piece);
      text = left
        ? `Boiling… still blue. ${left} min left (1 lab min = 1 s). The colour change appears after 5 min.`
        : "Equal volumes mixed — still blue. Drag the tube into the water bath and boil for 5 minutes.";
    } else if (c.benedict > 0 && c.heated >= 1) {
      let rs = n.rs;
      if (c.hydrolysed && c.neutralized) rs += n.nrs;
      const result = benedictColour(rs, 2);
      color = result.color;
      ppt = result.ppt;
      const amount = rs <= 0 ? "no" : rs < 4 ? "a little" : rs < 7 ? "a moderate" : "a large";
      evPptAmt = rs <= 0 ? "none" : rs < 4 ? "low" : rs < 7 ? "mid" : "high";
      if (test === "nrs" && n.nrs > 0 && n.rs === 0 && !(c.hydrolysed && c.neutralized)) {
        text = "Remains blue. Sucrose is non-reducing until hydrolysed and neutralised.";
      } else if (rs <= 0) {
        text = "Remains blue after boiling. No brick-red precipitate — reducing sugar absent.";
      } else {
        text = `${result.word} after boiling 5 min. ${amount} amount of precipitate — higher reducing-sugar concentration gives more precipitate.`;
      }
    } else if (test === "nrs") {
      text = "Add 1 cm³ of food with the dropper, then 1 cm³ dilute HCl → heat → 1 cm³ NaHCO₃ → 1 cm³ Benedict's → heat.";
    }
  } else if (test === "iodine") {
    const conc = state.conc.iodine;
    if (c.iodine <= 0) {
      color = hasFood ? food.color : "transparent";
      text = hasFood ? "Add 1 cm³ iodine solution with the dropper." : "Add 1 cm³ of sample with the dropper, then 1 cm³ iodine.";
    } else if (n.starch > 0 && c.iodine * conc >= 0.6) {
      color = BLACK;
      text = "Brown / yellow → blue-black. Starch present.";
    } else if (n.starch > 0) {
      color = lerpColor(BROWN, BLACK, 0.35);
      text = "Colour deepening. Add another 1 cm³ of iodine (or raise conc.).";
    } else {
      color = lerpColor("#e6d48a", BROWN, Math.min(1, conc / 2));
      text = "Remains brown / yellow. No observable starch.";
    }
  } else if (test === "biuret") {
    const hasReagent = c.biuret > 0 || (c.naoh > 0 && c.cuso4 > 0);
    if (!hasReagent) {
      color = hasFood ? food.color : "transparent";
      text = hasFood
        ? "Add 1 cm³ Biuret reagent to the sample, then shake gently."
        : "Add 1 cm³ of sample with the dropper, then 1 cm³ Biuret reagent.";
    } else if (!c.shaken) {
      color = "#3d7ec9";
      text = "Biuret added — still blue. Click Shake on the tube.";
    } else if (n.protein > 0) {
      color = PURPLE;
      text = "Blue → violet / purple after shaking. Protein present.";
    } else {
      color = "#5b8fd4";
      text = "Remains blue after shaking. Protein absent.";
    }
  } else if (test === "grease") {
    text = "Use filter paper for the grease-spot test (not a test tube).";
  } else if (test === "clinistix" || test === "albustix" || test === "energy") {
    text = test === "energy"
      ? "Use the burning set-up — drag it onto the bench, then drop a food on it."
      : test === "albustix"
        ? "Dip the yellow test end into the sample for 1 s. Wait 60 s, then compare the pad with the PROTEIN g/l colour chart."
        : "Dip the test paper into the sample (drag paper onto the food or a tube).";
  }

  return { color, vol, ppt, pptAmt: evPptAmt, cloudy, fizz, text, drops };
}

function evaluatePaper(piece) {
  const food = foodById(piece.foodId);
  if (!food) return { on: false, translucent: false, gone: false, text: "Drop the sample onto filter paper, then view the spot under light." };
  if (food.n.lipid <= 0) {
    return { on: true, translucent: false, gone: false, text: `No translucent (半透明) spot under light. Lipid not detected in ${food.name}.` };
  }
  if (piece.solvent) {
    return { on: false, translucent: false, gone: true, text: "Translucent spot disappears after alcohol (organic solvent). Lipid present — the grease dissolved." };
  }
  if (!piece.lit) {
    return { on: true, translucent: true, gone: false, text: "Spot on the paper. Click “Under light” to check if it is translucent (半透明)." };
  }
  return { on: true, translucent: true, gone: false, text: "Translucent spot under light. Now drip alcohol onto the spot — a lipid spot will disappear." };
}

function evaluateBlock(piece) {
  const food = foodById(piece.foodId);
  if (!food) return { stain: null, pale: false, text: "" };
  const isLeaf = LEAF_IDS.has(food.id);
  if (isLeaf && state.test === "iodine") {
    if (!piece.boiled) {
      const left = heatingRemainFor(piece);
      if (left) return { stain: null, pale: false, text: `Boiling the leaf… ${left} min left (1 lab min = 1 s). Result after 5 min.` };
      return { stain: null, pale: false, text: "Leaf test: drop the leaf into the water bath and boil for 5 minutes to destroy cell membranes." };
    }
    if (!piece.decolourised) return { stain: null, pale: false, text: "Boiled. Place the leaf in hot alcohol to remove chlorophyll." };
    if (!piece.washed) return { stain: null, pale: true, text: "Chlorophyll removed — leaf is pale. Wash with water to remove alcohol." };
    if (!piece.iodine) return { stain: null, pale: true, text: "Washed. Add iodine solution." };
    if (food.n.starch > 0) return { stain: BLACK, pale: true, text: "Brown → blue-black. Starch present in the leaf." };
    return { stain: BROWN, pale: true, text: "Remains brown. Starch absent." };
  }
  if (piece.iodine && food.n.starch > 0) return { stain: BLACK, pale: false, text: `Iodine on ${food.name}: brown → blue-black. Starch present.` };
  if (piece.iodine) return { stain: BROWN, pale: false, text: `Iodine on ${food.name}: remains brown. Starch absent.` };
  return { stain: null, pale: false, text: "Add iodine to the food, or follow the leaf steps if it is a green leaf." };
}

function evaluateStrip(piece) {
  const food = foodById(piece.foodId);
  if (piece.strip === "clinistix") {
    if (!food) return { color: "#f4b6c2", text: "Dip Clinistix into the sample (pink paper)." };
    if (glucoseOf(food) > 0) return { color: "#7a3d9b", text: `Pink → purple. Glucose present in ${food.name}.` };
    return { color: "#f4b6c2", text: `Remains pink. Glucose not detected in ${food.name} (Clinistix is glucose-specific).` };
  }
  if (!food) {
    return {
      color: ALBUSTIX_YELLOW,
      text: "The test end of Albustix paper is yellow. Dip it into the food sample for 1 s, wait 60 s, then compare with the colour chart.",
      reading: "",
      band: "",
    };
  }
  const developing = piece.dippedAt && Date.now() - piece.dippedAt < STRIP_READ_MS;
  if (developing) {
    return {
      color: ALBUSTIX_YELLOW,
      text: `Dipped 1 s in ${food.name}. Wait 60 s (1 lab min), then read the pad against the PROTEIN g/l chart.`,
      reading: "",
      band: "",
      developing: true,
    };
  }
  const band = albustixBand(food.n.protein);
  if (band.key === "neg") {
    return {
      color: band.color,
      text: `Pad remains yellow (NEG.). Protein not detected in ${food.name}.`,
      reading: band.reading,
      band: band.key,
    };
  }
  return {
    color: band.color,
    text: `The test end turns ${band.word} — about ${band.reading} protein in ${food.name}.`,
    reading: band.reading,
    band: band.key,
  };
}

function evaluateBurner(piece) {
  const food = foodById(piece.foodId);
  if (!food) return { text: "Drop a food sample onto the burning set-up. Ignite, then read the stopwatch and thermometer." };
  const e = energyOf(food);
  if (!piece.burned) {
    return { text: `${food.name} ready. Click Ignite. Lipids give about double the energy per gram of carbohydrate or protein.` };
  }
  const note = e.lip >= 6
    ? "High lipid — flame lasts longer and ΔT is larger (lipid energy per gram is about double)."
    : "Mostly carbohydrate / protein — shorter flame and smaller ΔT than a fatty food of the same mass.";
  return { text: `${food.name}: flame ${e.time} s · water ΔT +${e.dT} °C. ${note}` };
}

function currentObservation() {
  const sel = state.pieces.find((p) => p.id === state.selectedPiece);
  if (sel?.kind === "tube") return evaluateTube(sel).text;
  if (sel?.kind === "paper") return evaluatePaper(sel).text;
  if (sel?.kind === "block") return evaluateBlock(sel).text;
  if (sel?.kind === "strip") return evaluateStrip(sel).text;
  if (sel?.kind === "burner") return evaluateBurner(sel).text;
  const prefer = { clinistix: "strip", albustix: "strip", grease: "paper", energy: "burner", iodine: "block" }[state.test];
  if (prefer) {
    const hit = [...state.pieces].reverse().find((p) => p.kind === prefer);
    if (hit?.kind === "strip") return evaluateStrip(hit).text;
    if (hit?.kind === "paper") return evaluatePaper(hit).text;
    if (hit?.kind === "burner") return evaluateBurner(hit).text;
    if (hit?.kind === "block") return evaluateBlock(hit).text;
  }
  const tube = [...state.pieces].reverse().find((p) => p.kind === "tube");
  if (tube) return evaluateTube(tube).text;
  if (state.dropper.on && !state.dropper.fill) {
    return "Dropper in hand. Click a food sample to fill it, then click a test tube or filter paper.";
  }
  if (state.dropper.on && state.dropper.fill) {
    const filled = foodById(state.dropper.fill)?.name || REAGENTS[state.dropper.fill]?.name || state.dropper.fill;
    return `Dropper holds ${filled} (${dropperDoseLabel()}). Click a test tube or filter paper to add it.`;
  }
  return "Drag a test tube onto the bench and place it anywhere. Each dropper squeeze of food or test solution is 1 cm³ (vitamin C sample stays dropwise). Drag a tube into the water bath only when you want to heat it.";
}

function currentDrops() {
  const tube = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "tube")
    || [...state.pieces].reverse().find((p) => p.kind === "tube");
  if (!tube || state.test !== "vitc") return null;
  return evaluateTube(tube).drops;
}

function renderFoods() {
  const box = document.getElementById("food-list");
  box.innerHTML = FOODS.map((f) => `
    <button type="button" class="food-item ${state.selectedFood === f.id ? "selected" : ""}" data-food="${f.id}">
      <span class="food-swatch ${f.form}" style="--swatch:${f.color}"></span>
      <span><span class="name">${f.name}</span><br><span class="sub">${f.zh} · ${f.form === "liquid" ? "liquid" : "block"}</span></span>
    </button>
  `).join("");
}

function renderTests() {
  const box = document.getElementById("test-list");
  const block = document.getElementById("test-block");
  const sel = document.getElementById("test-cat");
  if (sel && sel.value !== state.testCat) sel.value = state.testCat;
  if (!state.testCat) {
    block.hidden = true;
    box.innerHTML = "";
    return;
  }
  block.hidden = false;
  const rows = TESTS.filter((t) => t.cat === state.testCat);
  box.innerHTML = rows.map((t) => `
    <button type="button" class="test-item ${state.test === t.id ? "active" : ""}" data-test="${t.id}">
      <span class="t-name">${t.name}</span>
      <span class="t-sub">${t.sub}</span>
    </button>
  `).join("");
}

function renderProteinScale(matchKey) {
  const scale = document.getElementById("protein-scale");
  if (!scale) return;
  scale.hidden = false;
  scale.innerHTML = `<div class="protein-scale-title">PROTEIN g/l</div>` + ALBUSTIX_SCALE.map((b) => `
    <div class="protein-scale-row ${b.key === matchKey ? "match" : ""}">
      <span class="protein-swatch" style="background:${b.color}"></span>
      <span class="protein-scale-label">${b.label}</span>
    </div>`).join("");
}

function renderConc() {
  const t = testById(state.test);
  const panel = document.getElementById("conc-panel");
  const sliderWrap = document.getElementById("conc-slider-wrap");
  const scale = document.getElementById("protein-scale");
  if (t?.id === "albustix") {
    panel.classList.add("on");
    if (sliderWrap) sliderWrap.hidden = true;
    const sel = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "strip" && p.strip === "albustix")
      || [...state.pieces].reverse().find((p) => p.kind === "strip" && p.strip === "albustix");
    const ev = sel ? evaluateStrip(sel) : null;
    renderProteinScale(ev?.band || "");
    document.getElementById("conc-hint").textContent = "Dip the yellow test end into the food sample for 1 s. Wait 60 s, then compare the pad colour with this chart. Shade may be greener than blue, depending on the strip chart.";
    return;
  }
  if (scale) {
    scale.hidden = true;
    scale.innerHTML = "";
  }
  if (sliderWrap) sliderWrap.hidden = false;
  if (!t?.conc) {
    panel.classList.remove("on");
    return;
  }
  panel.classList.add("on");
  const v = state.conc[t.conc.key];
  document.getElementById("conc-label").textContent = t.conc.label;
  document.getElementById("conc-val").textContent = `${v}${t.conc.unit}`;
  const sl = document.getElementById("conc-slider");
  sl.min = t.conc.min;
  sl.max = t.conc.max;
  sl.step = t.conc.step;
  sl.value = v;
  document.getElementById("conc-hint").textContent = t.conc.hint;
}

function dropperLabel() {
  if (!state.dropper.on) return "Dropper";
  if (state.dropper.fill && foodById(state.dropper.fill)) {
    const dose = state.test === "vitc" ? " · 1 drop" : " · 1 cm³";
    return "Dropper · " + foodById(state.dropper.fill).name + dose;
  }
  if (state.dropper.fill && REAGENTS[state.dropper.fill]) {
    return "Dropper · " + REAGENTS[state.dropper.fill].name + " · 1 cm³";
  }
  return "Dropper · empty";
}

function apparatusList() {
  const t = testById(state.test);
  const items = [];
  if (t.extra.includes("tube")) items.push({ id: "tube", label: "Test tube" });
  items.push({ id: "dropper", label: dropperLabel() });
  if (t.extra.includes("bath")) items.push({ id: "bath", label: t.id === "benedict" ? "Hot water bath" : "Water bath" });
  if (t.extra.includes("paper")) items.push({ id: "paper", label: "Filter paper" });
  if (t.extra.includes("clinistix")) items.push({ id: "clinistix", label: "Clinistix" });
  if (t.extra.includes("albustix")) items.push({ id: "albustix", label: "Albustix" });
  if (t.extra.includes("burner")) items.push({ id: "burner", label: "Burning set-up" });
  (t.reagents || []).forEach((r) => items.push({ id: r, label: REAGENTS[r].name + " · 1 cm³", reagent: true }));
  return items;
}

function miniTubeSVG(color) {
  return `<svg width="22" height="32" viewBox="0 0 22 32"><rect x="6" y="2" width="10" height="4" rx="1" fill="none" stroke="#8aa"/><rect x="7" y="6" width="8" height="22" rx="4" fill="${color}" stroke="#8aa"/></svg>`;
}

function renderApparatus() {
  const box = document.getElementById("apparatus");
  box.innerHTML = apparatusList().map((a) => {
    const col = a.reagent ? REAGENTS[a.id].color : "#eef3f6";
    const preview = a.id === "tube" ? miniTubeSVG("#eef3f6")
      : a.id === "bath" ? `<span style="width:28px;height:14px;background:#f3c56b;border:1px solid #c5a04a;display:inline-block"></span>`
      : a.id === "paper" ? `<span style="width:22px;height:16px;background:#f3f1ea;border:1px solid #ccc;display:inline-block"></span>`
      : a.id === "dropper" ? `<svg width="18" height="28" viewBox="0 0 18 28"><rect x="7" y="2" width="4" height="10" fill="#c5d0d8"/><path d="M5 12 h8 l-2 14 h-4z" fill="#9eb0bc"/></svg>`
      : a.id === "clinistix" ? `<span style="width:18px;height:28px;background:#f4b6c2;display:inline-block;border:1px solid #d48"></span>`
      : a.id === "albustix" ? `<span class="mini-albustix"><i></i></span>`
      : a.id === "burner" ? `<span style="width:22px;height:22px;background:#f4a024;border-radius:50%;display:inline-block"></span>`
      : miniTubeSVG(col);
    return `<button type="button" class="app-item ${a.id === "dropper" && state.dropper.on ? "selected" : ""}" data-app="${a.id}" data-reagent="${a.reagent ? "1" : "0"}">
      <span class="app-preview">${preview}</span><span class="an">${a.label}</span>
    </button>`;
  }).join("");
}

function tubeInBath(tube, bath) {
  return tube.kind === "tube" && tube.dockedTo === bath.id;
}

function dockedItems(bath) {
  return state.pieces.filter((p) => (p.kind === "tube" || p.kind === "block") && p.dockedTo === bath.id);
}

function bathAtClientPoint(clientX, clientY) {
  const bench = document.getElementById("bench");
  if (!bench) return null;
  const r = bench.getBoundingClientRect();
  const x = clientX - r.left;
  const y = clientY - r.top;
  return state.pieces.find((p) => {
    if (p.kind !== "bath") return false;
    if (drag?.kind === "piece" && drag.id === p.id) return false;
    return x >= p.x + 8 && x <= p.x + 312 && y >= p.y + 22 && y <= p.y + 216;
  }) || null;
}

function placePieceAtClient(p, clientX, clientY) {
  const bench = document.getElementById("bench");
  const r = bench.getBoundingClientRect();
  const grabX = p.kind === "tube" ? 23 : 20;
  const grabY = p.kind === "tube" ? 36 : 20;
  const minW = p.kind === "bath" ? 80 : 40;
  const minH = p.kind === "bath" ? 60 : 40;
  p.x = Math.max(8, Math.min(r.width - minW, clientX - r.left - grabX));
  p.y = Math.max(8, Math.min(r.height - minH, clientY - r.top - grabY));
}

function dockIntoBath(piece, bath) {
  const slot = dockedItems(bath).filter((t) => t.id !== piece.id).length;
  piece.dockedTo = bath.id;
  piece.x = bath.x + 24 + slot * 56;
  piece.y = bath.y + 36;
}

function highlightBathUnderPointer(clientX, clientY) {
  const over = bathAtClientPoint(clientX, clientY);
  document.querySelectorAll(".piece.bath").forEach((el) => {
    el.classList.toggle("drop-hot", !!(over && el.dataset.id === over.id));
  });
}

function dockedTubes(bath) {
  return dockedItems(bath).filter((p) => p.kind === "tube");
}

function blockInnerHtml(p) {
  const food = foodById(p.foodId);
  const ev = evaluateBlock(p);
  return `
    <button class="x" type="button" data-del="${p.id}">×</button>
    <div class="solid-cube ${ev.pale ? "pale" : ""}" style="background:${ev.pale ? "#e8e4c8" : food.color}"></div>
    <div class="solid-stain ${ev.stain ? "on" : ""}" style="background:${ev.stain || "transparent"}"></div>
    <div class="tube-tag">${food.name}</div>`;
}

function tubeInnerHtml(p, extraClass = "") {
  const ev = evaluateTube(p);
  const cm3 = tubeMeasuredCm3(p.contents);
  const shakeBtn = state.test === "biuret" && p.contents.biuret + p.contents.naoh > 0 && !p.contents.shaken
    ? `<button type="button" class="btn heat-btn" data-shake="${p.id}">Shake</button>` : "";
  return `
    <button class="x" type="button" data-del="${p.id}">×</button>
    <div class="tube-lip"></div>
    <div class="tube-glass">
      <div class="tube-liquid ${ev.ppt ? "ppt ppt-" + (ev.pptAmt || "mid") : ""} ${ev.cloudy ? "cloudy" : ""}" style="height:${ev.vol}%;background:${ev.color}"></div>
      <div class="tube-fizz ${ev.fizz ? "on" : ""}"><i style="left:30%;bottom:20%"></i><i style="left:55%;bottom:10%;animation-delay:.2s"></i><i style="left:40%;bottom:30%;animation-delay:.4s"></i></div>
    </div>
    <div class="tube-tag">${foodById(p.contents.foodId)?.name || "empty"}${cm3 ? ` · ${cm3} cm³` : ""}</div>${shakeBtn}`;
}

function renderPieces() {
  const bench = document.getElementById("bench");
  bench.classList.toggle("has-items", state.pieces.length > 0);
  bench.querySelectorAll(".piece").forEach((el) => el.remove());
  const baths = state.pieces.filter((p) => p.kind === "bath");
  const hidden = new Set();
  baths.forEach((b) => dockedItems(b).forEach((t) => hidden.add(t.id)));
  state.pieces.forEach((p) => {
    if (hidden.has(p.id)) return;
    bench.appendChild(pieceEl(p));
  });
}

function pieceEl(p) {
  const el = document.createElement("div");
  el.className = "piece" + (state.selectedPiece === p.id ? " selected" : "");
  el.dataset.id = p.id;
  el.style.left = p.x + "px";
  el.style.top = p.y + "px";
  if (p.kind === "tube") {
    el.classList.add("tube");
    el.innerHTML = tubeInnerHtml(p);
  } else if (p.kind === "bath") {
    el.classList.add("bath");
    if (p.hot) el.classList.add("hot");
    const mins = heatMinutesNeeded();
    const heatingNow = isBathHeating(p);
    const remain = heatingRemainMin(p);
    const heatLabel = heatingNow
      ? `Boiling… ${remain} min`
      : (mins ? `Boil ${mins} min` : "Heat");
    const nested = dockedItems(p).map((item) => {
      if (item.kind === "block") {
        return `<div class="bath-item bath-block ${state.selectedPiece === item.id ? "selected" : ""}" data-id="${item.id}">${blockInnerHtml(item)}</div>`;
      }
      return `<div class="bath-item bath-tube tube ${state.selectedPiece === item.id ? "selected" : ""}" data-id="${item.id}">${tubeInnerHtml(item)}</div>`;
    }).join("");
    const emptyHint = state.test === "iodine"
      ? "Drop a leaf or test tube in here"
      : "Drop a test tube in here";
    el.innerHTML = `
      <button class="x" type="button" data-del="${p.id}">×</button>
      <div class="bath-label">Water bath${heatingNow ? ` · boiling · ${remain} min left` : (p.hot ? " · boiled" : "")}</div>
      <div class="bath-box">
        <div class="bath-water"></div>
        <div class="bath-rack">${nested || `<span style="font-size:11px;color:#355;padding:8px">${emptyHint}</span>`}</div>
        <div class="bath-front"></div>
        <button type="button" class="btn heat-btn" data-heat="${p.id}" ${heatingNow ? `aria-busy="true"` : ""}>${heatLabel}</button>
      </div>`;
  } else if (p.kind === "paper") {
    const ev = evaluatePaper(p);
    el.classList.add("paper");
    el.innerHTML = `
      <button class="x" type="button" data-del="${p.id}">×</button>
      <div class="bath-label">Filter paper</div>
      <div class="paper-sheet ${p.lit ? "lit" : ""}"><div class="paper-spot ${ev.on ? "on" : ""} ${ev.translucent ? "translucent" : ""} ${ev.gone ? "gone" : ""}"></div></div>
      <button type="button" class="btn heat-btn" data-light="${p.id}">Under light</button>`;
  } else if (p.kind === "block") {
    el.classList.add("solid-block");
    el.innerHTML = blockInnerHtml(p);
  } else if (p.kind === "strip") {
    const ev = evaluateStrip(p);
    el.classList.add("strip-piece");
    if (p.strip === "clinistix") {
      el.classList.add("clinistix-strip");
      el.innerHTML = `
        <button class="x" type="button" data-del="${p.id}">×</button>
        <div class="strip-pad" style="background:${ev.color}"></div>
        <div class="tube-tag">Clinistix</div>`;
    } else {
      el.classList.add("albustix-strip");
      el.innerHTML = `
        <button class="x" type="button" data-del="${p.id}">×</button>
        <div class="strip-body">
          <div class="strip-pad${ev.developing ? " developing" : ""}" style="background:${ev.color}"></div>
        </div>
        <div class="tube-tag">${ev.reading ? `Albustix · ${ev.reading}` : "Albustix"}</div>`;
    }
  } else if (p.kind === "burner") {
    const food = foodById(p.foodId);
    const e = food ? energyOf(food) : null;
    el.classList.add("burner");
    el.innerHTML = `
      <button class="x" type="button" data-del="${p.id}">×</button>
      <div class="bath-label">Burning set-up</div>
      <div class="burn-stand">
        <div class="burn-food" style="background:${food ? food.color : "#ddd"}"></div>
        ${p.burned ? `<div class="flame"></div>` : ""}
        <div class="thermo">θ ${p.burned && e ? `+${e.dT}°C` : "20°C"}</div>
        <div class="watch">${p.burned && e ? e.time + " s" : "0:00"}</div>
      </div>
      <button type="button" class="btn heat-btn" data-burn="${p.id}">Ignite</button>
      <div class="tube-tag">${food ? food.name : "no food"}</div>`;
  }
  return el;
}

function renderObs() {
  const evDrops = currentDrops();
  const dropHtml = evDrops
    ? `<span class="drop-ind">Drops ${evDrops.used} / ${evDrops.need} · DCPIP ${evDrops.conc}%</span>`
    : "";
  document.getElementById("obs").innerHTML = `<strong>Observation</strong> ${dropHtml}<div class="muted">${currentObservation()}</div>`;
}

function renderLab() {
  renderFoods();
  renderTests();
  renderConc();
  renderApparatus();
  renderPieces();
  renderObs();
  const btnDrop = document.getElementById("btn-drop");
  if (btnDrop) {
    btnDrop.textContent = state.test === "vitc"
      ? "Add 1 drop of selected food"
      : "Add 1 cm³ of selected food";
  }
}

function foodArt(f) {
  const c = f.color;
  const shapes = {
    lemon: `<ellipse cx="80" cy="62" rx="38" ry="32" fill="#f3e27a" stroke="#d4c04a"/><ellipse cx="68" cy="54" rx="8" ry="5" fill="#fff6b0" opacity=".7"/><rect x="76" y="26" width="8" height="8" fill="#6a9a3a"/>`,
    orange: `<circle cx="80" cy="64" r="34" fill="#f4a02a"/><circle cx="70" cy="54" r="7" fill="#ffc56a" opacity=".6"/><circle cx="80" cy="36" r="5" fill="#3d8a3a"/>`,
    apple: `<circle cx="80" cy="68" r="30" fill="#d8242c"/><ellipse cx="70" cy="56" rx="6" ry="4" fill="#f26" opacity=".4"/><rect x="78" y="32" width="4" height="12" fill="#5a3a1a"/><ellipse cx="88" cy="38" rx="8" ry="4" fill="#3d8a3a"/>`,
    potato: `<ellipse cx="80" cy="64" rx="40" ry="26" fill="#e4d2a0" stroke="#c4b080"/><circle cx="62" cy="58" r="3" fill="#b8a070"/><circle cx="92" cy="70" r="2.5" fill="#b8a070"/>`,
    bread: `<path d="M40 78 q40 -44 80 0 v16 q-40 10 -80 0z" fill="#d2a36a"/><path d="M48 76 q32 -30 64 0" fill="none" stroke="#f0d2a0" stroke-width="3"/>`,
    rice: `<ellipse cx="80" cy="78" rx="36" ry="14" fill="#e8e2d4"/><ellipse cx="62" cy="62" rx="7" ry="4" fill="#f7f3ea"/><ellipse cx="80" cy="56" rx="7" ry="4" fill="#f7f3ea"/><ellipse cx="96" cy="64" rx="7" ry="4" fill="#f3efe4"/>`,
    onion: `<ellipse cx="80" cy="70" rx="28" ry="26" fill="#f0d9a8" stroke="#e0c070"/><path d="M80 44 v-16" stroke="#8a6"/><circle cx="80" cy="26" r="4" fill="#8a6"/>`,
    banana: `<path d="M46 40 q-8 30 10 50 q40 8 62 -20 q-28 4 -40 -10 q-10 -16 -32 -20z" fill="#f2d65a" stroke="#d4b83a"/>`,
    peanut: `<ellipse cx="62" cy="64" rx="16" ry="20" fill="#c4924a"/><ellipse cx="92" cy="64" rx="16" ry="20" fill="#c4924a"/><ellipse cx="62" cy="64" rx="8" ry="11" fill="#e8c88a"/><ellipse cx="92" cy="64" rx="8" ry="11" fill="#e8c88a"/>`,
    butter: `<rect x="48" y="48" width="64" height="32" rx="3" fill="#f0d05a" stroke="#d4b43a"/><rect x="52" y="52" width="56" height="8" fill="#f8e080"/>`,
    cabbage: `<circle cx="80" cy="64" r="32" fill="#8fbf6a"/><circle cx="80" cy="64" r="20" fill="#b5d98a"/><circle cx="80" cy="64" r="10" fill="#d4efb0"/>`,
    yolk: `<circle cx="80" cy="64" r="32" fill="#f7eec8" stroke="#e6d8a0"/><circle cx="80" cy="64" r="16" fill="#f0b429"/>`,
    soy: `<ellipse cx="58" cy="64" rx="12" ry="10" fill="#c8b56a"/><ellipse cx="80" cy="58" rx="12" ry="10" fill="#b8a45a"/><ellipse cx="100" cy="66" rx="12" ry="10" fill="#c8b56a"/>`,
    fish: `<ellipse cx="86" cy="64" rx="40" ry="18" fill="#f0d8d0"/><polygon points="44,64 28,50 28,78" fill="#e8c8c0"/><circle cx="110" cy="60" r="3" fill="#333"/>`,
    meat: `<rect x="44" y="40" width="72" height="48" rx="8" fill="#c45a4a"/><path d="M56 52 h48 M56 64 h40 M56 76 h36" stroke="#e8a098" stroke-width="3"/>`,
    albumen: `<ellipse cx="70" cy="68" rx="36" ry="24" fill="#f4f1e6" stroke="#e0d8c4"/><circle cx="92" cy="60" r="16" fill="#f0b429"/>`,
    milk: `<rect x="60" y="28" width="40" height="64" rx="4" fill="#f7f4ea" stroke="#d8d0c0"/><rect x="60" y="28" width="40" height="12" fill="#cfd6dc"/>`,
    oil: `<rect x="68" y="22" width="24" height="76" rx="4" fill="#e6c04a" stroke="#c4a030"/><rect x="72" y="18" width="16" height="10" fill="#d8d8d8"/>`,
    honey: `<path d="M58 40 h44 l8 48 h-60z" fill="#d9921a"/><rect x="66" y="28" width="28" height="12" fill="#cfd6dc"/>`,
    water: `<rect x="60" y="28" width="40" height="64" rx="4" fill="#d7e8f4" stroke="#9ab"/><rect x="64" y="50" width="32" height="38" rx="3" fill="#b9d7ea"/>`,
    glucose: `<rect x="58" y="22" width="44" height="14" rx="3" fill="#d5dde4"/><rect x="62" y="36" width="36" height="64" rx="6" fill="#f7f2d8" stroke="#c8c0a0"/>`,
    sucrose: `<rect x="50" y="48" width="22" height="22" fill="#f3f0ea" stroke="#d4cfc4"/><rect x="74" y="40" width="22" height="22" fill="#f7f4ee" stroke="#d4cfc4"/><rect x="86" y="62" width="22" height="22" fill="#efece6" stroke="#d4cfc4"/>`,
    starchsol: `<rect x="58" y="22" width="44" height="14" rx="3" fill="#d5dde4"/><rect x="62" y="36" width="36" height="64" rx="6" fill="#f0eee6" stroke="#c8c0b0"/>`,
    brownrice: `<ellipse cx="80" cy="80" rx="36" ry="12" fill="#c4a86a"/><ellipse cx="60" cy="62" rx="8" ry="4" fill="#b89458"/><ellipse cx="80" cy="54" rx="8" ry="4" fill="#c4a86a"/><ellipse cx="98" cy="64" rx="8" ry="4" fill="#a88048"/>`,
    oats: `<ellipse cx="56" cy="64" rx="14" ry="7" fill="#d8c088" stroke="#b8a060"/><ellipse cx="80" cy="58" rx="14" ry="7" fill="#e0c890" stroke="#b8a060"/><ellipse cx="104" cy="66" rx="14" ry="7" fill="#d0b878" stroke="#b8a060"/>`,
    wholewheat: `<ellipse cx="80" cy="70" rx="34" ry="18" fill="#c4a060"/><path d="M50 70 q30 -28 60 0" fill="#d8b878"/>`,
    pear: `<circle cx="80" cy="72" r="22" fill="#d8e07a"/><ellipse cx="80" cy="50" rx="12" ry="16" fill="#c8d060"/><rect x="78" y="30" width="4" height="12" fill="#6a5"/><circle cx="72" cy="64" r="4" fill="#eef0a0" opacity=".5"/>`,
    salmon: `<ellipse cx="88" cy="64" rx="38" ry="16" fill="#e87858"/><path d="M60 64 l-28 -12 v24z" fill="#d46848"/><path d="M70 58 h36 M70 64 h40 M70 70 h32" stroke="#f0a088" stroke-width="1.5"/>`,
    mackerel: `<ellipse cx="88" cy="64" rx="38" ry="16" fill="#6a8aaa"/><path d="M60 64 l-28 -12 v24z" fill="#5a7a9a"/><path d="M72 52 q8 12 0 24" stroke="#d8e0e8" stroke-width="2" fill="none"/>`,
    walnut: `<path d="M80 36 q28 8 28 30 q0 28 -28 28 q-28 0 -28 -28 q0 -22 28 -30z" fill="#8a5a32"/><path d="M80 40 v50" stroke="#6a4020"/>`,
    almond: `<ellipse cx="80" cy="64" rx="16" ry="28" fill="#d4b07a" stroke="#b89058"/><ellipse cx="80" cy="64" rx="8" ry="16" fill="#e8d0a0"/>`,
    flax: `<ellipse cx="58" cy="64" rx="8" ry="5" fill="#6a4a2a"/><ellipse cx="78" cy="58" rx="8" ry="5" fill="#5a3a22"/><ellipse cx="96" cy="66" rx="8" ry="5" fill="#7a5a32"/><ellipse cx="74" cy="74" rx="8" ry="5" fill="#4a3020"/>`,
    chia: `<circle cx="58" cy="60" r="5" fill="#4a3a32"/><circle cx="74" cy="70" r="5" fill="#3a2a24"/><circle cx="90" cy="58" r="5" fill="#5a4a40"/><circle cx="104" cy="68" r="5" fill="#2a201c"/><circle cx="80" cy="50" r="4" fill="#4a3a32"/>`,
    chicken: `<ellipse cx="80" cy="68" rx="36" ry="20" fill="#e8c8b0"/><rect x="50" y="50" width="60" height="16" rx="6" fill="#f0d8c4"/>`,
    turkey: `<ellipse cx="80" cy="68" rx="36" ry="20" fill="#d4b498"/><rect x="50" y="50" width="60" height="16" rx="6" fill="#e0c8b0"/>`,
    lentil: `<ellipse cx="58" cy="64" rx="12" ry="8" fill="#c45a3a"/><ellipse cx="80" cy="58" rx="12" ry="8" fill="#b44a2a"/><ellipse cx="100" cy="66" rx="12" ry="8" fill="#d46a4a"/>`,
    chickpea: `<ellipse cx="58" cy="64" rx="11" ry="10" fill="#e0c070"/><ellipse cx="80" cy="58" rx="11" ry="10" fill="#d4b458"/><ellipse cx="100" cy="66" rx="11" ry="10" fill="#e8c878"/>`,
    yogurt: `<rect x="56" y="36" width="48" height="52" rx="4" fill="#f4f0e4" stroke="#d8d0c0"/><rect x="56" y="36" width="48" height="12" fill="#e8e4d8"/>`,
    cheese: `<polygon points="48,80 80,36 112,80" fill="#f0c84a" stroke="#d4a830"/><path d="M64 70 h8 M88 62 h6" stroke="#e8d878" stroke-width="3"/>`,
    broccoli: `<circle cx="68" cy="48" r="16" fill="#4a9a4a"/><circle cx="92" cy="48" r="16" fill="#3a8a3a"/><circle cx="80" cy="38" r="14" fill="#5aaa52"/><rect x="74" y="60" width="12" height="28" fill="#7ab05a"/>`,
    carrot: `<path d="M70 28 l20 8 -8 64 -20 -8z" fill="#e87828"/><ellipse cx="84" cy="26" rx="10" ry="6" fill="#4a8a3a"/>`,
    spinach: `<ellipse cx="70" cy="56" rx="22" ry="12" fill="#2a6a32" transform="rotate(-20 70 56)"/><ellipse cx="92" cy="64" rx="22" ry="12" fill="#3a7a3a" transform="rotate(18 92 64)"/>`,
    kale: `<ellipse cx="64" cy="60" rx="20" ry="14" fill="#3a7a38"/><ellipse cx="96" cy="58" rx="20" ry="14" fill="#2a6a30"/><ellipse cx="80" cy="74" rx="18" ry="12" fill="#4a8a40"/>`,
    plantmilk: `<rect x="60" y="28" width="40" height="64" rx="4" fill="#efe6d4" stroke="#d0c4b0"/><rect x="60" y="28" width="40" height="12" fill="#b8d4a8"/>`,
    fortmilk: `<rect x="60" y="28" width="40" height="64" rx="4" fill="#f4f0e0" stroke="#d8d0c0"/><rect x="60" y="28" width="40" height="12" fill="#f0d060"/>`,
    redmeat: `<rect x="44" y="40" width="72" height="48" rx="8" fill="#a83232"/><path d="M56 52 h48 M56 64 h40 M56 76 h36" stroke="#c85858" stroke-width="3"/>`,
    liver: `<ellipse cx="80" cy="64" rx="40" ry="24" fill="#7a3030"/><ellipse cx="70" cy="58" rx="14" ry="10" fill="#8a4040"/>`,
    salt: `<rect x="50" y="48" width="16" height="16" fill="#f4f2ee" stroke="#d4d0c8"/><rect x="70" y="40" width="16" height="16" fill="#fff"/><rect x="88" y="54" width="16" height="16" fill="#f0eeea" stroke="#d4d0c8"/>`,
    shrimp: `<path d="M50 70 q20 -40 50 -20 q10 20 -10 28 q-24 4 -40 -8z" fill="#f0a078"/><circle cx="96" cy="52" r="3" fill="#333"/>`,
    seaweed: `<path d="M50 90 q10 -40 6 -70 q16 20 8 50 q12 -30 10 -60 q14 28 6 70" fill="none" stroke="#2a5a3a" stroke-width="8" stroke-linecap="round"/>`,
    sweetpotato: `<ellipse cx="80" cy="64" rx="40" ry="22" fill="#e09040"/><ellipse cx="80" cy="64" rx="28" ry="14" fill="#f0c878"/>`,
    mango: `<ellipse cx="82" cy="66" rx="28" ry="32" fill="#f0b020"/><ellipse cx="70" cy="54" rx="8" ry="6" fill="#f8d060" opacity=".6"/><rect x="78" y="28" width="5" height="12" fill="#3a7a2a"/>`,
    strawberry: `<path d="M80 36 q28 8 28 32 q0 28 -28 36 q-28 -8 -28 -36 q0 -24 28 -32z" fill="#d4303a"/><polygon points="68,38 80,28 92,38" fill="#3a8a3a"/><circle cx="70" cy="56" r="1.6" fill="#fff6a0"/><circle cx="86" cy="62" r="1.6" fill="#fff6a0"/><circle cx="78" cy="72" r="1.6" fill="#fff6a0"/>`,
    pepper: `<path d="M64 44 q-8 8 -8 28 q0 28 24 32 q24 -4 24 -32 q0 -20 -8 -28z" fill="#e03a2a"/><ellipse cx="80" cy="40" rx="10" ry="6" fill="#3a8a3a"/>`,
    leaf: `<ellipse cx="86" cy="64" rx="36" ry="20" fill="#3a7a32"/><path d="M52 64 q34 0 56 0" stroke="#2a5a22"/><path d="M86 44 q8 20 0 40" stroke="#2a5a22"/>`,
  };
  const inner = shapes[f.id] || (f.form === "liquid"
    ? `<rect x="62" y="28" width="36" height="70" rx="6" fill="#eef3f6" stroke="#9aadb8"/><rect x="64" y="54" width="32" height="42" rx="5" fill="${c}"/>`
    : `<rect x="48" y="28" width="64" height="64" rx="4" fill="${c}"/>`);
  return `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="120" fill="#fff"/>${inner}</svg>`;
}

function renderBank() {
  const q = state.bankQ.toLowerCase();
  const rows = FOODS.filter((f) => {
    if (q && !(`${f.name} ${f.zh}`.toLowerCase().includes(q))) return false;
    if (state.bankFilter !== "all" && f.n[state.bankFilter] <= 0) return false;
    return true;
  });
  document.getElementById("bank-grid").innerHTML = rows.map((f) => {
    const pills = NUT.filter((k) => f.n[k] > 0).map((k) => `<span class="pill yes">${NUT_LABEL[k]} ${LEVEL(f.n[k])}</span>`).join("");
    const rowsN = NUT.map((k) => `<span>${NUT_LABEL[k]}</span><b>${LEVEL(f.n[k])}</b>`).join("");
    const tests = [
      `Clinistix: ${glucoseOf(f) ? "pink → purple" : "remains pink"}`,
      `Benedict's: ${f.n.rs ? "brick-red ppt (more ppt = more reducing sugar)" : (f.n.nrs ? "blue until hydrolysed" : "remains blue")}`,
      `Iodine: ${f.n.starch ? "brown → blue-black" : "remains brown"}`,
      `Albustix: ${(() => { const b = albustixBand(f.n.protein); return b.key === "neg" ? "remains yellow (NEG.)" : `yellow → ${b.word} (${b.reading})`; })()}`,
      `Biuret: ${f.n.protein ? "blue → violet / purple" : "remains blue"}`,
      `Grease spot: ${f.n.lipid ? "translucent spot; disappears in alcohol" : "no translucent spot"}`,
      `DCPIP: ${f.n.vitC ? "blue → colourless (fewer drops = more vit. C)" : "remains blue"}`,
      `Burning: lipids ≈ 2× energy of carb / protein per gram`,
    ].join("<br>");
    return `<article class="bank-card ${state.openCard === f.id ? "open" : ""}" data-card="${f.id}">
      <div class="bank-img">${foodArt(f)}</div>
      <div class="bank-body">
        <div class="bank-title">${f.name}</div>
        <div class="bank-zh">${f.zh}${f.source ? ` · ${f.source}` : ""}</div>
        <div class="pills">${pills || `<span class="pill">no testable nutrient</span>`}</div>
        <div class="bank-detail">
          <div class="nv">${rowsN}</div>
          <p class="test-mini">${f.note}<br><br>${tests}</p>
        </div>
      </div>
    </article>`;
  }).join("");
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll(".tab").forEach((b) => {
    const on = b.dataset.tab === tab;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
  });
  document.getElementById("panel-lab").classList.toggle("active", tab === "lab");
  document.getElementById("panel-bank").classList.toggle("active", tab === "bank");
  document.querySelector(".top-actions").hidden = tab !== "lab";
  if (tab === "bank") renderBank();
}

function addPiece(kind, extra = {}) {
  const bench = document.getElementById("bench");
  const r = bench.getBoundingClientRect();
  const n = state.pieces.length;
  const piece = {
    id: uid(),
    kind,
    x: 40 + (n % 5) * 70,
    y: 36 + Math.floor(n / 5) * 40,
    ...extra,
  };
  if (kind === "tube") {
    piece.contents = emptyContents();
    piece.dockedTo = null;
  }
  if (kind === "bath") piece.hot = piece.hot || false;
  if (kind === "paper") {
    if (piece.foodId === undefined) piece.foodId = null;
    piece.lit = !!piece.lit;
    piece.solvent = !!piece.solvent;
  }
  if (kind === "block") {
    piece.iodine = !!piece.iodine;
    piece.boiled = !!piece.boiled;
    piece.decolourised = !!piece.decolourised;
    piece.washed = !!piece.washed;
    piece.dockedTo = piece.dockedTo || null;
  }
  if (kind === "strip" && piece.foodId === undefined) piece.foodId = null;
  if (kind === "burner") {
    if (piece.foodId === undefined) piece.foodId = null;
    piece.burned = !!piece.burned;
  }
  if (piece.x > r.width - 80) piece.x = 36;
  if (piece.y > r.height - 80) piece.y = 28;
  state.pieces.push(piece);
  state.selectedPiece = piece.id;
  return piece;
}

function removePiece(id) {
  state.pieces.forEach((p) => {
    if (p.dockedTo === id) p.dockedTo = null;
  });
  state.pieces = state.pieces.filter((p) => p.id !== id);
  if (state.selectedPiece === id) state.selectedPiece = null;
}

function targetPieceAt(clientX, clientY) {
  const el = document.elementFromPoint(clientX, clientY);
  const inner = el?.closest?.(".bath-item");
  if (inner) return state.pieces.find((p) => p.id === inner.dataset.id) || null;
  const piece = el?.closest?.(".piece");
  if (!piece) return null;
  return state.pieces.find((p) => p.id === piece.dataset.id) || null;
}

function addToTube(tube, payload) {
  const c = tube.contents;
  if (payload.foodId) {
    if (c.foodId && c.foodId !== payload.foodId) {
      Object.assign(c, emptyContents());
    }
    c.foodId = payload.foodId;
    if (payload.cm3) {
      c.foodCm3 = (c.foodCm3 || 0) + payload.cm3;
    } else {
      const amt = payload.drops || (payload.pour ? 8 : 1);
      c.foodDrops += amt;
      if (payload.pour) c.poured = true;
    }
  }
  if (payload.reagent) {
    c[payload.reagent] = (c[payload.reagent] || 0) + (payload.cm3 || payload.drops || 1);
    if (payload.reagent === "biuret") { c.naoh += 1; c.cuso4 += 1; }
    if (payload.reagent === "nahco3" && c.hydrolysed) c.neutralized = true;
    if (payload.reagent === "hcl" && c.heated >= 1) c.hydrolysed = true;
  }
}

function applyHeatToPiece(p) {
  if (p.kind === "block") {
    p.boiled = true;
    return;
  }
  if (p.kind !== "tube") return;
  const c = p.contents;
  if (state.test === "nrs" && c.hcl > 0 && !c.hydrolysed && c.benedict <= 0) {
    c.hydrolysed = true;
    return;
  }
  if (c.benedict > 0) c.heated += 1;
  if (c.hydrolysed && c.nahco3 > 0) c.neutralized = true;
}

function finishHeat(bath) {
  const ids = new Set(bath.heating?.pieceIds || []);
  bath.heating = null;
  bath.hot = true;
  state.pieces.forEach((p) => {
    if (p.dockedTo !== bath.id) return;
    if (ids.size && !ids.has(p.id)) return;
    applyHeatToPiece(p);
  });
}

function updateHeatUi(bath) {
  const remain = heatingRemainMin(bath);
  const btn = document.querySelector(`[data-heat="${bath.id}"]`);
  if (btn) {
    btn.textContent = `Boiling… ${remain} min`;
    btn.setAttribute("aria-busy", "true");
  }
  const label = document.querySelector(`.piece.bath[data-id="${bath.id}"] .bath-label`);
  if (label) label.textContent = `Water bath · boiling · ${remain} min left`;
  renderObs();
}

function ensureHeatTicker() {
  if (heatTicker) return;
  heatTicker = setInterval(() => {
    const baths = state.pieces.filter((p) => p.kind === "bath" && p.heating);
    if (!baths.length) {
      clearInterval(heatTicker);
      heatTicker = null;
      return;
    }
    baths.forEach((bath) => {
      if (Date.now() - bath.heating.started >= bath.heating.durationMs) {
        finishHeat(bath);
        renderLab();
      } else {
        updateHeatUi(bath);
      }
    });
  }, 200);
}

function applyHeat(bath) {
  if (isBathHeating(bath)) return;
  const ids = state.pieces.filter((p) => p.dockedTo === bath.id).map((p) => p.id);
  const mins = heatMinutesNeeded();
  if (mins <= 0) {
    bath.hot = true;
    ids.forEach((id) => {
      const p = state.pieces.find((x) => x.id === id);
      if (p) applyHeatToPiece(p);
    });
    return;
  }
  if (!ids.length) return;
  bath.hot = true;
  bath.heating = {
    started: Date.now(),
    durationMs: mins * LAB_MIN_MS,
    labMin: mins,
    pieceIds: ids,
  };
  ensureHeatTicker();
}

function usePalette(appId, reagent, clientX, clientY) {
  if (appId === "dropper") {
    state.dropper.on = !state.dropper.on;
    document.body.classList.toggle("dropper-on", state.dropper.on);
    if (!state.dropper.on) state.dropper.fill = null;
    renderObs();
    return;
  }
  const hit = targetPieceAt(clientX, clientY);
  if (appId === "tube" && !hit) addPiece("tube");
  else if (appId === "bath" && !hit) addPiece("bath");
  else if (appId === "paper" && !hit) addPiece("paper");
  else if (appId === "clinistix" && !hit) addPiece("strip", { strip: "clinistix" });
  else if (appId === "albustix" && !hit) addPiece("strip", { strip: "albustix" });
  else if (appId === "burner" && !hit) addPiece("burner");
  else if ((appId === "alcohol" || appId === "ethanol") && hit?.kind === "paper") {
    hit.solvent = true;
    state.selectedPiece = hit.id;
  } else if ((appId === "alcohol" || appId === "ethanol") && hit?.kind === "block" && hit.boiled) {
    hit.decolourised = true;
    state.selectedPiece = hit.id;
  } else if (appId === "water" && hit?.kind === "block" && hit.decolourised) {
    hit.washed = true;
    state.selectedPiece = hit.id;
  } else if (appId === "iodine" && hit?.kind === "block") {
    hit.iodine = true;
    state.selectedPiece = hit.id;
  } else if (reagent && hit?.kind === "tube") {
    addToTube(hit, reagentAddPayload(appId));
    state.selectedPiece = hit.id;
  } else if ((appId === "clinistix" || appId === "albustix") && hit?.kind === "tube") {
    const strip = addPiece("strip", { strip: appId });
    if (hit.contents.foodId) {
      if (appId === "albustix") dipAlbustix(strip, hit.contents.foodId);
      else strip.foodId = hit.contents.foodId;
    }
    state.selectedPiece = strip.id;
  }
}

function useFoodOn(food, target, pour) {
  if (target?.kind === "tube" || target?.kind === "paper") return;
  if (!target) {
    if (food.form === "block" && (state.test === "iodine" || state.test === "energy")) {
      addPiece("block", { foodId: food.id, iodine: false, boiled: false, decolourised: false, washed: false });
    }
    return;
  }
  if (target.kind === "strip") {
    if (target.strip === "albustix") dipAlbustix(target, food.id);
    else target.foodId = food.id;
    state.selectedPiece = target.id;
  } else if (target.kind === "burner") {
    target.foodId = food.id;
    target.burned = false;
    state.selectedPiece = target.id;
  } else if (target.kind === "block" && state.dropper.fill === "iodine") {
    target.iodine = true;
  }
}

function startDrag(kind, id, reagent, ev) {
  ev.preventDefault();
  drag = { kind, id, reagent: !!reagent, pour: kind === "food", x: ev.clientX, y: ev.clientY };
  document.body.classList.add("dragging");
  const g = document.getElementById("ghost");
  if (kind === "piece") {
    g.hidden = true;
    const el = document.querySelector(`.piece[data-id="${id}"], .bath-item[data-id="${id}"]`);
    if (el) el.classList.add("lifted");
    return;
  }
  g.hidden = false;
  if (kind === "food") {
    const f = foodById(id);
    g.innerHTML = `<div class="food-swatch ${f.form}" style="--swatch:${f.color};width:34px;height:34px"></div>`;
  } else {
    g.textContent = reagent ? REAGENTS[id].name : id;
    g.style.fontSize = "12px";
    g.style.fontWeight = "700";
    g.style.background = "#fff";
    g.style.border = "1px solid #cfd4dc";
    g.style.padding = "6px 8px";
    g.style.borderRadius = "8px";
  }
  moveGhost(ev);
}

function moveGhost(ev) {
  const g = document.getElementById("ghost");
  g.style.left = ev.clientX + "px";
  g.style.top = ev.clientY + "px";
}

function onPointerMove(ev) {
  if (!drag) return;
  if (drag.kind === "piece") {
    const p = state.pieces.find((x) => x.id === drag.id);
    if (!p) return;
    const moved = Math.abs(ev.clientX - drag.x) + Math.abs(ev.clientY - drag.y) > 6;
    if (p.dockedTo && moved) {
      p.dockedTo = null;
      placePieceAtClient(p, ev.clientX, ev.clientY);
      renderPieces();
    }
    if (!p.dockedTo) {
      placePieceAtClient(p, ev.clientX, ev.clientY);
      const el = document.querySelector(`.piece[data-id="${p.id}"]`);
      if (el) {
        el.style.left = p.x + "px";
        el.style.top = p.y + "px";
        el.classList.add("lifted");
      }
    }
    if (p.kind === "tube" || p.kind === "block") highlightBathUnderPointer(ev.clientX, ev.clientY);
    return;
  }
  moveGhost(ev);
}

function endDrag(ev) {
  if (!drag) return;
  const g = document.getElementById("ghost");
  g.hidden = true;
  document.body.classList.remove("dragging");
  const bench = document.getElementById("bench");
  const overBench = bench.contains(document.elementFromPoint(ev.clientX, ev.clientY)) || ev.target === bench;
  const hit = targetPieceAt(ev.clientX, ev.clientY);
  if (drag.kind === "food") {
    const f = foodById(drag.id);
    state.selectedFood = f.id;
    if (overBench) useFoodOn(f, hit, true);
  } else if (drag.kind === "app") {
    if (drag.id === "dropper" || overBench || ["tube", "bath", "paper", "clinistix", "albustix", "burner"].includes(drag.id)) {
      usePalette(drag.id, drag.reagent, ev.clientX, ev.clientY);
    }
  } else if (drag.kind === "piece") {
    const p = state.pieces.find((x) => x.id === drag.id);
    if (p) {
      const moved = Math.abs(ev.clientX - drag.x) + Math.abs(ev.clientY - drag.y) > 6;
      if (moved) {
        placePieceAtClient(p, ev.clientX, ev.clientY);
        p.dockedTo = null;
        if ((p.kind === "tube" || p.kind === "block") && overBench) {
          const bath = bathAtClientPoint(ev.clientX, ev.clientY);
          if (bath) dockIntoBath(p, bath);
        }
      }
    }
  }
  drag = null;
  renderLab();
}

function onPointerDown(ev) {
  const foodBtn = ev.target.closest("[data-food]");
  if (foodBtn && ev.target.closest("#food-list")) {
    const f = foodById(foodBtn.dataset.food);
    state.selectedFood = f.id;
    if (state.dropper.on) {
      state.dropper.fill = f.id;
      renderLab();
      return;
    }
    startDrag("food", f.id, false, ev);
    return;
  }
  const appBtn = ev.target.closest("[data-app]");
  if (appBtn && ev.target.closest("#apparatus")) {
    if (state.dropper.on && REAGENTS[appBtn.dataset.app]) {
      state.dropper.fill = appBtn.dataset.app;
      renderLab();
      return;
    }
    startDrag("app", appBtn.dataset.app, appBtn.dataset.reagent === "1", ev);
    return;
  }
  const del = ev.target.closest("[data-del]");
  if (del) {
    ev.stopPropagation();
    removePiece(del.dataset.del);
    renderLab();
    return;
  }
  const heat = ev.target.closest("[data-heat]");
  if (heat) {
    ev.stopPropagation();
    const bath = state.pieces.find((p) => p.id === heat.dataset.heat);
    if (!bath || isBathHeating(bath)) return;
    applyHeat(bath);
    renderLab();
    return;
  }
  const shake = ev.target.closest("[data-shake]");
  if (shake) {
    ev.stopPropagation();
    const tube = state.pieces.find((p) => p.id === shake.dataset.shake);
    if (tube?.contents) tube.contents.shaken = true;
    renderLab();
    return;
  }
  const light = ev.target.closest("[data-light]");
  if (light) {
    ev.stopPropagation();
    const paper = state.pieces.find((p) => p.id === light.dataset.light);
    if (paper) paper.lit = true;
    renderLab();
    return;
  }
  const burn = ev.target.closest("[data-burn]");
  if (burn) {
    ev.stopPropagation();
    const b = state.pieces.find((p) => p.id === burn.dataset.burn);
    if (b?.foodId) b.burned = true;
    renderLab();
    return;
  }
  const innerTube = ev.target.closest(".bath-item");
  const piece = innerTube || ev.target.closest(".piece");
  if (piece) {
    const p = state.pieces.find((x) => x.id === (innerTube?.dataset.id || piece.dataset.id));
    if (!p) return;
    state.selectedPiece = p.id;
    if (state.dropper.on) {
      if (p.kind === "tube") {
        if (state.dropper.fill && REAGENTS[state.dropper.fill]) addToTube(p, reagentAddPayload(state.dropper.fill));
        else if (state.dropper.fill) addToTube(p, foodAddPayload(state.dropper.fill));
      } else if (p.kind === "block") {
        if (state.dropper.fill === "iodine") p.iodine = true;
        if (state.dropper.fill === "alcohol" || state.dropper.fill === "ethanol") p.decolourised = !!p.boiled;
        if (state.dropper.fill === "water" && p.decolourised) p.washed = true;
      } else if (p.kind === "paper") {
        if (state.dropper.fill === "ethanol" || state.dropper.fill === "alcohol") p.solvent = true;
        else if (state.dropper.fill && foodById(state.dropper.fill)) p.foodId = state.dropper.fill;
      } else if (p.kind === "strip" && state.dropper.fill && foodById(state.dropper.fill)) {
        if (p.strip === "albustix") dipAlbustix(p, state.dropper.fill);
        else p.foodId = state.dropper.fill;
      } else if (p.kind === "burner" && state.dropper.fill && foodById(state.dropper.fill)) {
        p.foodId = state.dropper.fill;
      }
      renderLab();
      return;
    }
    startDrag("piece", p.id, false, ev);
  }
}

function onClick(ev) {
  const tab = ev.target.closest("[data-tab]");
  if (tab) { setTab(tab.dataset.tab); return; }
  const testBtn = ev.target.closest("[data-test]");
  if (testBtn) {
    state.test = testBtn.dataset.test;
    const t = testById(state.test);
    if (t.conc && state.conc[t.conc.key] == null) state.conc[t.conc.key] = t.conc.def;
    renderLab();
    return;
  }
  const chip = ev.target.closest("[data-filter]");
  if (chip) {
    state.bankFilter = chip.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((c) => c.classList.toggle("on", c.dataset.filter === state.bankFilter));
    renderBank();
    return;
  }
  const card = ev.target.closest("[data-card]");
  if (card) {
    state.openCard = state.openCard === card.dataset.card ? null : card.dataset.card;
    renderBank();
  }
}

function bind() {
  document.addEventListener("click", onClick);
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", endDrag);
  document.getElementById("test-cat").addEventListener("change", (e) => {
    state.testCat = e.target.value;
    const rows = TESTS.filter((t) => !state.testCat || t.cat === state.testCat);
    if (rows.length && !rows.some((t) => t.id === state.test)) {
      state.test = rows[0].id;
      const t = testById(state.test);
      if (t.conc && state.conc[t.conc.key] == null) state.conc[t.conc.key] = t.conc.def;
    }
    renderLab();
  });
  document.getElementById("conc-slider").addEventListener("input", (e) => {
    const t = testById(state.test);
    if (!t.conc) return;
    state.conc[t.conc.key] = Number(e.target.value);
    renderConc();
    renderObs();
  });
  document.getElementById("btn-clear").addEventListener("click", () => {
    state.pieces = [];
    state.selectedPiece = null;
    if (heatTicker) {
      clearInterval(heatTicker);
      heatTicker = null;
    }
    renderLab();
  });
  document.getElementById("btn-drop").addEventListener("click", () => {
    if (!state.dropper.on || !state.dropper.fill) return;
    let tube = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "tube")
      || [...state.pieces].reverse().find((p) => p.kind === "tube");
    const paper = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "paper")
      || [...state.pieces].reverse().find((p) => p.kind === "paper");
    const strip = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "strip")
      || [...state.pieces].reverse().find((p) => p.kind === "strip");
    if (strip && foodById(state.dropper.fill)) {
      if (strip.strip === "albustix") dipAlbustix(strip, state.dropper.fill);
      else strip.foodId = state.dropper.fill;
      state.selectedPiece = strip.id;
    } else if (paper && foodById(state.dropper.fill)) {
      paper.foodId = state.dropper.fill;
      state.selectedPiece = paper.id;
    } else if (tube && foodById(state.dropper.fill)) {
      addToTube(tube, foodAddPayload(state.dropper.fill));
      state.selectedPiece = tube.id;
    } else if (tube && REAGENTS[state.dropper.fill]) {
      addToTube(tube, reagentAddPayload(state.dropper.fill));
      state.selectedPiece = tube.id;
    }
    renderLab();
  });
  document.getElementById("bank-q").addEventListener("input", (e) => {
    state.bankQ = e.target.value;
    renderBank();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      state.dropper.on = false;
      document.body.classList.remove("dropper-on");
    }
  });
}

function init() {
  bind();
  renderLab();
  renderBank();
}

init();
