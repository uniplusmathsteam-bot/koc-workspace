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
  { id: "clinistix", cat: "Carbohydrates", name: "Glucose paper", sub: "Dip Clinistix into the sample · pink → purple", reagents: [], extra: ["clinistix", "dropper"] },
  { id: "benedict", cat: "Carbohydrates", name: "Reducing sugar", sub: "Equal volume Benedict's + sample, e.g. 5 cm³ · boil 5 min", reagents: ["benedict"], extra: ["tube", "dropper", "bath"], heatMin: 5 },
  { id: "iodine", cat: "Carbohydrates", name: "Starch · food", sub: "Drops of iodine on a white tile / in a tube · brown → blue-black", reagents: ["iodine"], extra: ["tube", "dropper", "tile"] },
  { id: "iodine-leaf", cat: "Carbohydrates", name: "Starch · green leaf", sub: "Boil in water → alcohol tube in water bath → wash → dip in iodine", reagents: ["iodine"], extra: ["bath", "tube"], heatMin: 5 },
  { id: "albustix", cat: "Proteins", name: "Protein paper", sub: "Dip Albustix into the sample · yellow → blue-green", reagents: [], extra: ["albustix", "dropper"] },
  { id: "biuret", cat: "Proteins", name: "Protein", sub: "NaOH, then a few drops of CuSO₄ · shake gently", reagents: ["naoh", "cuso4"], extra: ["tube", "dropper"] },
  { id: "grease", cat: "Lipids", name: "Lipid", sub: "Rub / drop · dry · translucent 半透明 · alcohol", reagents: ["ethanol"], extra: ["paper", "dropper"] },
  { id: "vitc", cat: "Vitamin C", name: "Vitamin C", sub: "DCPIP · add sample dropwise 逐滴", reagents: ["dcpip"], extra: ["tube", "dropper"], conc: { key: "dcpip", label: "DCPIP concentration", min: 0.05, max: 1, step: 0.05, unit: "%", def: 0.1, hint: "Add the sample dropwise 逐滴 to DCPIP and mix well. Fewer drops to go colourless → higher vitamin C concentration. Heat destroys vitamin C." } },
  { id: "energy", cat: "Energy", name: "Energy in food", sub: "Burning test · stopwatch + thermometer", reagents: [], extra: ["burner"] },
  { id: "nrs", cat: "Carbohydrates", name: "Non-reducing sugar", sub: "Hydrolyse · cool · NaHCO₃ until alkaline · Benedict's", reagents: ["hcl", "nahco3", "benedict"], extra: ["tube", "dropper", "bath", "phpaper"], heatMin: 5 },
];

const LEAF_FOODS = ["leaf", "spinach", "kale", "cabbage"];
const LABS = [
  { id: "clinistix", title: "Glucose paper", foods: ["lemon", "glucose", "honey", "apple", "orange", "banana", "sucrose", "water", "milk"] },
  { id: "benedict", title: "Reducing sugar", foods: ["glucose", "honey", "apple", "onion", "sucrose", "starchsol", "water", "milk"] },
  { id: "iodine", title: "Starch · food", foods: ["starchsol", "potato", "bread", "rice", "onion", "banana", "water"] },
  { id: "iodine-leaf", title: "Starch · green leaf", foods: LEAF_FOODS },
  { id: "nrs", title: "Non-reducing sugar", foods: ["sucrose", "glucose", "honey", "water"] },
  { id: "albustix", title: "Protein paper", foods: ["albumen", "milk", "meat", "chicken", "water", "potato"] },
  { id: "biuret", title: "Protein · Biuret", foods: ["albumen", "milk", "meat", "chicken", "fish", "water", "oil"] },
  { id: "grease", title: "Lipid", foods: ["oil", "butter", "peanut", "salmon", "water", "potato"] },
  { id: "vitc", title: "Vitamin C", foods: ["lemon", "orange", "strawberry", "pepper", "cabbage", "apple", "water"] },
  { id: "energy", title: "Energy in food", foods: ["peanut", "butter", "bread", "rice", "potato", "meat"] },
  { id: "bank", title: "Food bank", tab: "bank" },
];

function labById(id) { return LABS.find((l) => l.id === id); }

const REAGENTS = {
  dcpip: { name: "DCPIP", color: "#2a5bdb" },
  benedict: { name: "Benedict's", color: "#2f74c4" },
  iodine: { name: "Iodine", color: "#c4a035" },
  biuret: { name: "Biuret", color: "#3d7ec9" },
  naoh: { name: "NaOH", color: "#e8eef3" },
  cuso4: { name: "CuSO₄", color: "#4a8fd4" },
  ethanol: { name: "Alcohol", color: "#eef4f8" },
  phpaper: { name: "pH paper", color: "#f0c070" },
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

function burnerDefaults(piece = {}) {
  return {
    mass: piece.mass != null ? Number(piece.mass) : 1,
    waterVol: piece.waterVol != null ? Number(piece.waterVol) : 20,
    t0: piece.t0 != null ? Number(piece.t0) : 20,
    distance: piece.distance || "medium",
  };
}

function distanceFactor(distance) {
  if (distance === "close") return 1.12;
  if (distance === "far") return 0.58;
  return 0.88;
}

function energyOf(food, piece) {
  if (!food) return { carb: 0, prot: 0, lip: 0, kJ: 0, time: 0, dT: 0, t0: 20, t1: 20, mass: 1, waterVol: 20, distance: "medium" };
  const { mass, waterVol, t0, distance } = burnerDefaults(piece);
  const carb = food.n.rs + food.n.nrs + food.n.starch;
  const prot = food.n.protein;
  const lip = food.n.lipid;
  const kJ = (carb * 1.7 + prot * 1.7 + lip * 3.8) * mass;
  const baseDT = 4 + carb * 0.9 + prot * 0.9 + lip * 1.8;
  const dT = +(baseDT * mass * (20 / Math.max(5, waterVol)) * distanceFactor(distance)).toFixed(1);
  const time = Math.max(1, Math.round((3 + carb * 0.35 + prot * 0.35 + lip * 0.7) * mass));
  return {
    carb, prot, lip, kJ, mass, waterVol, distance,
    time,
    dT,
    t0,
    t1: +(t0 + Number(dT)).toFixed(1),
  };
}

function pickEnergyBurner() {
  const burners = state.pieces.filter((p) => p.kind === "burner");
  if (!burners.length) return null;
  const sel = burners.find((p) => p.id === state.selectedPiece);
  if (sel && !sel.foodId) return sel;
  const empty = burners.find((p) => !p.foodId);
  if (empty) return empty;
  return sel || burners[burners.length - 1];
}

function burnerIndex(piece) {
  return state.pieces.filter((p) => p.kind === "burner").findIndex((p) => p.id === piece.id) + 1;
}

function energyPlan() {
  const iv = ENERGY_IV_OPTIONS.find((o) => o.id === (state.energyIV || "food")) || ENERGY_IV_OPTIONS[0];
  const cvs = ENERGY_IV_OPTIONS.filter((o) => o.id !== iv.id);
  return {
    iv,
    dvDT: state.energyDVs?.dT !== false,
    dvTime: state.energyDVs?.time !== false,
    cvs,
    keep: true,
  };
}

function resetEnergyReads(piece) {
  if (!piece || piece.kind !== "burner") return;
  piece.readDT = false;
  piece.readTime = false;
}

function readEnergyDv(piece, which) {
  if (!piece || piece.kind !== "burner" || !piece.burned || !piece.foodId) return false;
  const plan = energyPlan();
  if (which === "dT" && plan.dvDT) {
    piece.readDT = true;
    return true;
  }
  if (which === "time" && plan.dvTime) {
    piece.readTime = true;
    return true;
  }
  return false;
}

function burnerFactorValue(piece, factorId) {
  if (factorId === "food") return piece.foodId || "";
  const d = burnerDefaults(piece);
  if (factorId === "mass") return d.mass;
  if (factorId === "waterVol") return d.waterVol;
  if (factorId === "t0") return d.t0;
  if (factorId === "distance") return d.distance;
  return "";
}

function formatFactorValue(piece, factorId) {
  if (factorId === "food") return foodById(piece.foodId)?.name || "no food";
  if (factorId === "mass") return `${burnerDefaults(piece).mass} g`;
  if (factorId === "waterVol") return `${burnerDefaults(piece).waterVol} cm³`;
  if (factorId === "t0") return `${burnerDefaults(piece).t0}°C`;
  if (factorId === "distance") {
    const d = burnerDefaults(piece).distance;
    return d === "close" ? "near" : d === "far" ? "far" : "middle";
  }
  return "—";
}

function isEnergyCV(field) {
  return (state.energyIV || "food") !== field;
}

function applyCaloField(piece, key, value) {
  piece[key] = value;
  if (state.test !== "energy" || !energyPlan().keep || !isEnergyCV(key)) return;
  state.pieces.forEach((p) => {
    if (p.kind === "burner" && p.id !== piece.id) p[key] = value;
  });
}

function copyEnergyCVs(from) {
  if (!from || from.kind !== "burner") return;
  const iv = energyPlan().iv.id;
  state.pieces.forEach((p) => {
    if (p.kind !== "burner" || p.id === from.id) return;
    if (iv !== "mass") p.mass = from.mass;
    if (iv !== "waterVol") p.waterVol = from.waterVol;
    if (iv !== "t0") p.t0 = from.t0;
    if (iv !== "distance") p.distance = from.distance;
    if (iv !== "food" && from.foodId) {
      p.foodId = from.foodId;
      p.burned = false;
      resetEnergyReads(p);
    }
  });
}

function energyCvMismatches() {
  const plan = energyPlan();
  const burners = state.pieces.filter((p) => p.kind === "burner");
  if (burners.length < 2) return [];
  return plan.cvs.map((cv) => {
    const values = burners.map((p) => ({
      n: burnerIndex(p),
      text: formatFactorValue(p, cv.id),
      raw: String(burnerFactorValue(p, cv.id)),
    }));
    if (new Set(values.map((v) => v.raw)).size <= 1) return null;
    return { id: cv.id, label: cv.label, values };
  }).filter(Boolean);
}

function checkEnergyFairTest() {
  const plan = energyPlan();
  const burners = state.pieces.filter((p) => p.kind === "burner");
  const loaded = burners.filter((p) => p.foodId);
  const cvMismatches = energyCvMismatches();
  const issues = [];
  if (!plan.dvDT && !plan.dvTime) issues.push("Tick ΔT and/or time — that is the DV you will measure.");
  if (burners.length < 2) issues.push("Next: click Add set-up.");
  else if (loaded.length < 2) issues.push("Next: click a food onto each set-up.");
  if (loaded.length >= 2) {
    const ivVals = new Set(loaded.map((p) => String(burnerFactorValue(p, plan.iv.id))));
    if (ivVals.size < 2) {
      issues.push(plan.iv.id === "food"
        ? "Next: put a different food on each set-up."
        : `Next: change the ${plan.iv.label.toLowerCase()} on one set-up.`);
    }
  }
  cvMismatches.forEach((cv) => {
    issues.push(`Not fair: ${cv.label.toLowerCase()} is not the same.`);
  });
  return {
    ok: issues.length === 0 && loaded.length >= 2 && !cvMismatches.length && (plan.dvDT || plan.dvTime),
    issues,
    cvMismatches,
    loaded: loaded.length,
    n: burners.length,
  };
}

function energyCompareTableHtml() {
  const plan = energyPlan();
  const burners = state.pieces.filter((p) => p.kind === "burner");
  if (!burners.length) return "";
  const bad = new Set(energyCvMismatches().map((c) => c.id));
  const head = `<tr><th></th>${burners.map((p) => `<th>${burnerIndex(p)}</th>`).join("")}</tr>`;
  const row = (label, factorId, cls) =>
    `<tr class="${cls}"><th>${label}</th>${burners.map((p) => `<td>${formatFactorValue(p, factorId)}</td>`).join("")}</tr>`;
  const dvCells = (kind, getter) => burners.map((p) => {
    const food = foodById(p.foodId);
    const e = energyOf(food, p);
    const read = kind === "dT" ? p.readDT : p.readTime;
    return `<td>${p.burned && food && read ? getter(e) : "—"}</td>`;
  }).join("");
  const extraIv = plan.iv.id !== "food"
    ? row(plan.iv.label, plan.iv.id, "is-iv")
    : "";
  const skip = new Set(["food", plan.iv.id]);
  const badRows = ENERGY_IV_OPTIONS
    .filter((o) => bad.has(o.id) && !skip.has(o.id))
    .map((o) => row(o.label, o.id, "is-bad"))
    .join("");
  return `<table class="fair-table">
        ${head}
        ${row("Food", "food", plan.iv.id === "food" ? "is-iv" : (bad.has("food") ? "is-bad" : ""))}
        ${extraIv}
        ${badRows}
        ${plan.dvDT ? `<tr class="is-dv"><th>ΔT</th>${dvCells("dT", (e) => `+${e.dT}°C`)}</tr>` : ""}
        ${plan.dvTime ? `<tr class="is-dv"><th>Time</th>${dvCells("time", (e) => `${e.time} s`)}</tr>` : ""}
      </table>`;
}

function energyFairHtml() {
  const fair = checkEnergyFairTest();
  const plan = energyPlan();
  if (fair.cvMismatches.length) {
    return `<p class="quiz-bad">Not a fair test — CVs are not the same.</p>
      <ul class="cv-bad-list">${fair.cvMismatches.map((cv) =>
        `<li><strong>${cv.label}</strong>: ${cv.values.map((v) => `set-up ${v.n} = ${v.text}`).join(" · ")}</li>`
      ).join("")}</ul>`;
  }
  if (fair.ok) return `<p class="quiz-ok">Fair test ✓ You only changed the ${plan.iv.label.toLowerCase()}.</p>`;
  return `<p class="quiz-next">${fair.issues[0] || "Set up the test."}</p>`;
}

function renderEnergyFairOverlay() {
  const bench = document.getElementById("bench");
  if (!bench) return;
  bench.querySelectorAll(".fair-cross").forEach((el) => el.remove());
  if (state.test !== "energy") return;
  const bad = energyCvMismatches();
  if (!bad.length) return;
  const el = document.createElement("div");
  el.className = "fair-cross";
  el.setAttribute("role", "alert");
  el.innerHTML = `
    <div class="fair-cross-x" aria-hidden="true">✗</div>
    <div class="fair-cross-msg">
      <strong>Not a fair test</strong>
      <p>These CVs are not the same:</p>
      <ul>${bad.map((cv) =>
        `<li><strong>${cv.label}</strong><br>${cv.values.map((v) => `Set-up ${v.n}: ${v.text}`).join("<br>")}</li>`
      ).join("")}</ul>
    </div>`;
  bench.prepend(el);
}

function nextBurnerPos() {
  const n = state.pieces.filter((p) => p.kind === "burner").length;
  const w = Math.round(280 * state.energyScale + 28);
  const h = Math.round(268 * state.energyScale + 28);
  return { x: 16 + (n % 2) * w, y: 8 + Math.floor(n / 2) * h };
}

const BLUE = "#2f74c4";
const DCPIP_BLUE = "#2a5bdb";
const COLORLESS = "#f2f5f7";
const BROWN = "#c4a035";
const BLACK = "#1b1d33";
const PURPLE = "#7a3d9b";
const MILK = "#f0eee8";
const ALBUSTIX_YELLOW = "#f5e000";
const GLUCOSE_UNUSED = "#e8a0b8";
const STRIP_READ_MS = 1000;

const GLUCOSE_SCALE = [
  { key: "0", label: "no glucose", reading: "pink", min: 0, max: 0, color: "#e8a0b8", word: "pink" },
  { key: "pos", label: "glucose", reading: "purple", min: 1, max: 10, color: "#7a3d9b", word: "purple" },
];

const ALBUSTIX_SCALE = [
  { key: "neg", label: "NEG.", reading: "yellow", gl: "absent", min: 0, max: 0, color: "#f5e000", word: "yellow" },
  { key: "pos", label: "protein", reading: "blue-green", gl: "present", min: 1, max: 10, color: "#2a8a82", word: "blue-green" },
];

function albustixBand(protein) {
  const n = Number(protein) || 0;
  return ALBUSTIX_SCALE.find((b) => n >= b.min && n <= b.max) || ALBUSTIX_SCALE[0];
}

function glucoseBand(level) {
  const n = Number(level) || 0;
  return GLUCOSE_SCALE.find((b) => n >= b.min && n <= b.max) || GLUCOSE_SCALE[0];
}

function dipStrip(piece, foodId) {
  if (!piece) return;
  piece.foodId = foodId;
  if (piece.strip !== "albustix" && piece.strip !== "clinistix") return;
  piece.dippedAt = Date.now();
  setTimeout(() => {
    if (state.pieces.includes(piece) && piece.foodId === foodId) renderLab();
  }, STRIP_READ_MS);
}

const ENERGY_IV_OPTIONS = [
  { id: "food", label: "The food", how: "Put a different food on each set-up." },
  { id: "mass", label: "Mass of food", how: "Use the same food. Change the mass on one set-up." },
  { id: "waterVol", label: "Water volume", how: "Use the same food. Change the water on one set-up." },
  { id: "t0", label: "Start temperature", how: "Use the same food. Change the start temperature on one set-up." },
  { id: "distance", label: "Distance from tube", how: "Use the same food. Move the food closer or farther." },
];

const state = {
  tab: "lab",
  test: "clinistix",
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
  testCat: "Carbohydrates",
  embedLocked: null,
  varAnswers: {},
  energyScale: 1.2,
  energyIV: "food",
  energyDVs: { dT: true, time: true },
  energyKeepCV: true,
};

let drag = null;
let energyFoodPlaced = false;
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
  const bath = state.pieces.find((b) => {
    if (b.kind !== "bath" || !isBathHeating(b)) return false;
    const ids = b.heating?.pieceIds || [];
    if (ids.includes(piece.id)) return true;
    const host = state.pieces.find((x) => x.id === piece.dockedTo);
    return !!(host && ids.includes(host.id));
  });
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
    heated: 0, hydrolysed: false, cooled: false, alkaliAdded: false, neutralized: false, mixed: false, shaken: false,
  };
}

function isDropReagent(id) {
  if (id === "iodine") return state.test !== "iodine-leaf";
  return id === "cuso4";
}

function reagentDoseLabel(id) {
  if (isDropReagent(id)) return "1 drop";
  if (id === "benedict") return "5 cm³";
  if (id === "naoh") return "2 cm³";
  return "1 cm³";
}

function foodAddPayload(foodId) {
  if (state.test === "vitc") return { foodId, drops: 1 };
  if (state.test === "benedict") return { foodId, cm3: 5 };
  if (state.test === "biuret") return { foodId, cm3: 2 };
  return { foodId, cm3: 1 };
}

function reagentAddPayload(reagentId) {
  if (isDropReagent(reagentId)) return { reagent: reagentId, drops: 1 };
  if (reagentId === "benedict") return { reagent: reagentId, cm3: 5 };
  if (reagentId === "naoh") return { reagent: reagentId, cm3: 2 };
  return { reagent: reagentId, cm3: 1 };
}

function reagentSolutionCm3(c) {
  return (c.dcpip || 0) + (c.benedict || 0) + (c.biuret || 0) + (c.naoh || 0)
    + (c.ethanol || 0) + (c.alcohol || 0) + (c.water || 0) + (c.hcl || 0) + (c.nahco3 || 0)
    + (state.test === "iodine-leaf" ? (c.iodine || 0) : 0);
}

function tubeMeasuredCm3(c) {
  return (c.foodCm3 || 0) + reagentSolutionCm3(c);
}

function dropperDoseLabel() {
  if (!state.dropper.fill) return "1 cm³";
  if (foodById(state.dropper.fill) && state.test === "vitc") return "1 drop";
  if (foodById(state.dropper.fill) && state.test === "benedict") return "5 cm³";
  if (foodById(state.dropper.fill) && state.test === "biuret") return "2 cm³ extract";
  if (REAGENTS[state.dropper.fill]) return reagentDoseLabel(state.dropper.fill);
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
  const filled = (c.foodCm3 || 0) + c.foodDrops + reagentCm3 + (c.cuso4 || 0) * 0.05;
  const vol = filled ? Math.min(78, 12 + (c.foodCm3 || 0) * 6 + c.foodDrops * 3 + reagentCm3 * 6) : 0;
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
        text = "Put 1 cm³ DCPIP in the tube first, then add the sample dropwise 逐滴 and mix well after each drop.";
    } else {
      color = DCPIP_BLUE;
      const need = dropsNeededVitC(food, conc);
      drops = { used: c.foodDrops, need: Number.isFinite(need) ? need : "∞", conc };
      if (!food || n.vitC <= 0) {
        text = "Remains blue after mixing. No observable change — vitamin C absent.";
      } else if (c.foodDrops >= need) {
        color = COLORLESS;
        text = `Blue → colourless after ${need} drop(s). Vitamin C present. Fewer drops needed = higher vitamin C concentration.`;
      } else {
        color = lerpColor(DCPIP_BLUE, COLORLESS, c.foodDrops / need);
        text = `Still blue. Mix, then add more drops. ${c.foodDrops} / ${need} drops needed at ${conc}% DCPIP.`;
      }
    }
  } else if (test === "benedict" || test === "nrs") {
    if (test === "nrs" && !(c.hydrolysed && c.neutralized)) {
      color = hasFood ? food.color : "transparent";
      const left = heatingRemainFor(piece);
      if (!hasFood) {
        text = "Add 1 cm³ of food extract, then dilute HCl. Boil 5 min to hydrolyse.";
      } else if (c.hcl <= 0) {
        text = "Add 1 cm³ dilute HCl, then drag the tube into the beaker of boiling water.";
      } else if (!c.hydrolysed) {
        text = left
          ? `Heating to hydrolyse… still no colour change. ${left} min left (1 lab min = 1 s).`
          : "HCl added. Drag the tube into the water bath and boil for 5 minutes to hydrolyse.";
      } else if (!c.cooled) {
        text = "Hydrolysed. Cool the tube before adding NaHCO₃ (do not add alkali while it is still hot).";
      } else if (!c.alkaliAdded) {
        text = "Cooled. Add NaHCO₃ until the acid is neutralised (it should fizz). Then check with pH paper.";
      } else {
        fizz = true;
        text = "Fizzing — acid is being neutralised. Dip pH paper: it must be alkaline before Benedict’s.";
      }
    } else if (c.benedict <= 0 && test === "benedict") {
      color = hasFood ? food.color : "transparent";
      text = hasFood
        ? "Add an equal volume of Benedict's solution (5 cm³ sample + 5 cm³ Benedict's), then stand the tube in a beaker of boiling water for 5 minutes."
        : "Add 5 cm³ sample and 5 cm³ Benedict's (equal volumes).";
    } else if (c.benedict <= 0 && test === "nrs") {
      color = hasFood ? food.color : COLORLESS;
      text = "Neutralised and alkaline. Now add 5 cm³ Benedict's and boil in the water bath for 5 minutes.";
    } else if (c.benedict > 0 && c.heated < 1) {
      color = BLUE;
      const left = heatingRemainFor(piece);
      text = left
        ? `Boiling in the water bath… still blue. ${left} min left (1 lab min = 1 s).`
        : "Equal volumes mixed — still blue. Stand the tube in the beaker of boiling water for 5 minutes.";
    } else if (c.benedict > 0 && c.heated >= 1) {
      let rs = n.rs;
      if (c.hydrolysed && c.neutralized) rs += n.nrs;
      const result = benedictColour(rs, 2);
      color = result.color;
      ppt = result.ppt;
      const amount = rs <= 0 ? "no" : rs < 4 ? "a little" : rs < 7 ? "a moderate" : "a large";
      evPptAmt = rs <= 0 ? "none" : rs < 4 ? "low" : rs < 7 ? "mid" : "high";
      if (test === "nrs" && n.nrs > 0 && n.rs === 0 && !(c.hydrolysed && c.neutralized)) {
        text = "Remains blue. Sucrose is non-reducing until hydrolysed, cooled, and made alkaline.";
      } else if (rs <= 0) {
        text = "Remains blue after boiling. No brick-red precipitate — reducing sugar absent.";
      } else {
        text = `${result.word} after boiling 5 min. ${amount} amount of brick-red precipitate — more precipitate = more reducing sugar.`;
      }
    }
  } else if (test === "iodine") {
    if (c.iodine <= 0) {
      color = hasFood ? food.color : "transparent";
      text = hasFood ? "Add a few drops of iodine solution." : "Liquid sample in the tube, then a few drops of iodine. Solid food goes on the white tile.";
    } else if (n.starch > 0) {
      color = BLACK;
      text = "Brown → blue-black. Starch present.";
    } else {
      color = BROWN;
      text = "Remains brown. Starch absent.";
    }
  } else if (test === "iodine-leaf") {
    if (c.iodine <= 0) {
      color = "transparent";
      text = "Add iodine solution to this test tube. Then dip the washed leaf into the iodine, or drag this tube onto the leaf on the white tile.";
    } else {
      color = BROWN;
      const nested = state.pieces.find((x) => x.kind === "block" && x.dockedTo === piece.id);
      text = nested?.iodine
        ? evaluateBlock(nested).text
        : "Iodine ready. Dip the washed leaf into this tube, or pour it onto the leaf on the white tile.";
    }
  } else if (test === "biuret") {
    if (!hasFood) {
      color = "transparent";
      text = "Add 2 cm³ of sample (grind solid food with water and filter to make an extract). Then add NaOH, then a few drops of CuSO₄.";
    } else if (c.naoh <= 0 && c.cuso4 <= 0 && c.biuret <= 0) {
      color = food.color;
      text = "Add about 2 cm³ sodium hydroxide (NaOH) first, then a few drops of copper sulfate (CuSO₄). Shake gently.";
    } else if (c.naoh <= 0 && c.cuso4 > 0) {
      color = "#7eb4e0";
      text = "CuSO₄ added too early. Add sodium hydroxide (NaOH) first, then the copper sulfate drops.";
    } else if (c.cuso4 <= 0 && c.biuret <= 0) {
      color = hasFood ? food.color : COLORLESS;
      text = "NaOH added. Now add a few drops of CuSO₄, then shake gently.";
    } else if (!c.shaken) {
      color = "#3d7ec9";
      text = "NaOH + CuSO₄ added — still blue. Click Shake on the tube.";
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
      ? "Click a food sample to load it onto the burning set-up. Ignite, then record the stopwatch and thermometer."
      : test === "albustix"
        ? "Dip unused yellow Albustix into the sample. Color change to blue-green indicates protein."
        : "Dip unused pink Clinistix into the sample. Color change to purple indicates glucose.";
  }

  return { color, vol, ppt, pptAmt: evPptAmt, cloudy, fizz, text, drops };
}

function alcoholHostOf(piece) {
  const host = state.pieces.find((x) => x.id === piece.dockedTo);
  if (host?.kind === "beaker" && host.role === "alcohol") return host;
  return null;
}

function alcoholTubeInBath(beaker) {
  return !!(beaker && state.pieces.some((b) => b.kind === "bath" && beaker.dockedTo === b.id));
}

function evaluatePaper(piece) {
  const food = foodById(piece.foodId);
  if (!food) return { on: false, translucent: false, gone: false, text: "Drop a liquid or rub a solid food onto filter paper, then leave the spot to dry." };
  const lipid = food.n.lipid > 0;
  if (!piece.dried) {
    return {
      on: true,
      translucent: false,
      gone: false,
      wet: true,
      text: piece.rubbed
        ? `Rubbed ${food.name} onto the paper. Leave the spot to dry — a water spot disappears; a lipid spot stays.`
        : `Spot of ${food.name} on the paper. Leave it to dry before holding it up to the light.`,
    };
  }
  if (!lipid) {
    return { on: false, translucent: false, gone: true, text: `Spot disappeared after drying. Not a lipid (water evaporates). Lipid not detected in ${food.name}.` };
  }
  if (piece.solvent) {
    return { on: false, translucent: false, gone: true, text: "Translucent spot dissolves in alcohol (organic solvent). Lipid present." };
  }
  if (!piece.lit) {
    return { on: true, translucent: false, gone: false, text: "Spot remains after drying. Hold the paper up to the light to check if it is translucent (半透明)." };
  }
  return { on: true, translucent: true, gone: false, text: "Translucent 半透明 spot under light — lipid present. Optional: drip alcohol onto the spot; a lipid spot dissolves." };
}

function evaluateBlock(piece) {
  const food = foodById(piece.foodId);
  if (!food) return { stain: null, pale: false, text: "" };
  const isLeaf = LEAF_IDS.has(food.id);
  if (isLeaf && (state.test === "iodine" || state.test === "iodine-leaf")) {
    const alcohol = alcoholHostOf(piece);
    if (!piece.boiled) {
      const left = heatingRemainFor(piece);
      if (left) return { stain: null, pale: false, text: `Boiling the leaf in water… ${left} min left (1 lab min = 1 s). This destroys the cell membrane.` };
      const inBath = state.pieces.some((b) => b.kind === "bath" && piece.dockedTo === b.id);
      if (inBath) return { stain: null, pale: false, text: "Leaf is in the water bath. Click Boil 5 min (destroy cell membrane)." };
      return { stain: null, pale: false, text: "1. Drop the green leaf into the beaker of water and boil (destroy cell membrane)." };
    }
    if (!piece.decolourised) {
      if (!alcohol) {
        return { stain: null, pale: false, text: "2. Put the boiled leaf into the alcohol boiling tube. Then heat that tube in the water bath — never heat alcohol directly." };
      }
      const inBath = alcoholTubeInBath(alcohol);
      const left = heatingRemainFor(alcohol) || (inBath ? heatingRemainFor(piece) : 0);
      if (inBath && left) return { stain: null, pale: false, text: `Heating the alcohol tube in the water bath… ${left} min left. Chlorophyll is dissolving.` };
      if (inBath) return { stain: null, pale: false, text: "Alcohol tube is in the water bath. Click Boil 5 min to remove chlorophyll." };
      return { stain: null, pale: false, text: "Leaf is in alcohol. Drag the alcohol boiling tube into the water bath and boil. Never heat alcohol directly — it is flammable." };
    }
    if (!piece.washed) return { stain: null, pale: true, text: "3. Wash with water (wash away alcohol and soften the leaf)." };
    if (!piece.iodine) return { stain: null, pale: true, text: "4. Add iodine to a test tube, then dip the pale leaf into the iodine (or pour the iodine onto the leaf on the white tile)." };
    if (food.n.starch > 0) return { stain: BLACK, pale: true, text: "Brown → blue-black. Starch present in the leaf." };
    return { stain: BROWN, pale: true, text: "Remains brown. Starch absent." };
  }
  if (piece.iodine && food.n.starch > 0) return { stain: BLACK, pale: false, text: `Iodine on ${food.name}: brown → blue-black. Starch present.` };
  if (piece.iodine) return { stain: BROWN, pale: false, text: `Iodine on ${food.name}: remains brown. Starch absent.` };
  return { stain: null, pale: false, text: "Put solid food on the white tile and add a few drops of iodine." };
}

function evaluateStrip(piece) {
  if (piece.strip === "phpaper") {
    const tube = state.pieces.find((p) => p.id === piece.tubeId && p.kind === "tube");
    const c = tube?.contents;
    if (!tube || !c) {
      return {
        color: "#f0c070",
        text: "Unused pH paper. Dip it into the hydrolysed mixture after adding NaHCO₃. Alkaline (blue-green) means you may add Benedict’s.",
        reading: "",
        band: "",
      };
    }
    if (c.alkaliAdded || c.neutralized) {
      if (tube.contents) tube.contents.neutralized = true;
      return {
        color: "#2a8a82",
        text: "pH paper → blue-green. Mixture is alkaline. Now add 5 cm³ Benedict’s and boil.",
        reading: "alkaline",
        band: "alk",
      };
    }
    if (c.hydrolysed || c.hcl > 0) {
      return {
        color: "#d94a2a",
        text: "pH paper → red / orange. Still acidic. Add more NaHCO₃ until alkaline.",
        reading: "acidic",
        band: "acid",
      };
    }
    return {
      color: "#f0c070",
      text: "pH paper unchanged. Hydrolyse with HCl first, cool, then add NaHCO₃.",
      reading: "",
      band: "",
    };
  }
  const food = foodById(piece.foodId);
  if (piece.strip === "clinistix") {
    if (!food) {
      return {
        color: GLUCOSE_UNUSED,
        text: "Unused Clinistix paper is pink. Dip it into the sample. Color change (pink → purple) indicates presence of glucose.",
        reading: "",
        band: "",
      };
    }
    const developing = piece.dippedAt && Date.now() - piece.dippedAt < STRIP_READ_MS;
    if (developing) {
      return {
        color: GLUCOSE_UNUSED,
        text: `Dipped in ${food.name}. Watch for pink → purple.`,
        reading: "",
        band: "",
        developing: true,
      };
    }
    const band = glucoseBand(glucoseOf(food));
    if (band.key === "0") {
      return {
        color: band.color,
        text: `Paper stays pink. No color change — glucose not detected in ${food.name}.`,
        reading: band.reading,
        band: band.key,
      };
    }
    return {
      color: band.color,
      text: `Pink → purple. Glucose present in ${food.name}.`,
      reading: band.reading,
      band: band.key,
    };
  }
  if (!food) {
    return {
      color: ALBUSTIX_YELLOW,
      text: "Unused Albustix paper is yellow. Dip it into the sample. Color change (yellow → blue-green) indicates protein.",
      reading: "",
      band: "",
    };
  }
  const developing = piece.dippedAt && Date.now() - piece.dippedAt < STRIP_READ_MS;
  if (developing) {
    return {
      color: ALBUSTIX_YELLOW,
      text: `Dipped in ${food.name}. Watch for yellow → blue-green.`,
      reading: "",
      band: "",
      developing: true,
    };
  }
  const band = albustixBand(food.n.protein);
  if (band.key === "neg") {
    return {
      color: band.color,
      text: `Pad remains yellow. No color change — protein not detected in ${food.name}.`,
      reading: band.reading,
      band: band.key,
    };
  }
  return {
    color: band.color,
    text: `Yellow → blue-green. Protein present in ${food.name}.`,
    reading: band.reading,
    band: band.key,
  };
}

function evaluateBurner(piece) {
  const food = foodById(piece.foodId);
  const plan = energyPlan();
  const n = burnerIndex(piece);
  if (!plan.dvDT && !plan.dvTime) return { text: "Tick ΔT and/or time on the right — that is the DV you will measure." };
  if (!food) return { text: `Set-up ${n}: click a food on the left, then Ignite.` };
  const e = energyOf(food, piece);
  const taps = [plan.dvDT ? "the thermometer (ΔT)" : null, plan.dvTime ? "the stopwatch (time)" : null].filter(Boolean);
  if (!piece.burned) {
    return { text: `Set-up ${n} has ${food.name}. Click Ignite, then tap ${taps.join(" and ")} to record the DV.` };
  }
  const missing = [];
  if (plan.dvDT && !piece.readDT) missing.push("tap the thermometer for ΔT");
  if (plan.dvTime && !piece.readTime) missing.push("tap the stopwatch for time");
  if (missing.length) return { text: `Set-up ${n}: flame out. Next: ${missing.join(" and ")}.` };
  const bits = [
    plan.dvDT ? `ΔT +${e.dT}°C` : null,
    plan.dvTime ? `${e.time} s` : null,
  ].filter(Boolean).join(" · ");
  const extra = e.lip >= 6
    ? " High fat — about double the energy of starch or protein."
    : plan.dvDT && plan.iv.id === "waterVol" && e.waterVol !== 20
      ? (e.waterVol > 20 ? " More water → smaller ΔT." : " Less water → larger ΔT.")
      : plan.dvDT && plan.iv.id === "mass" && e.mass !== 1
        ? (e.mass > 1 ? " More food → larger ΔT." : " Less food → smaller ΔT.")
        : plan.dvDT && plan.iv.id === "distance" && e.distance === "far"
          ? " Farther away → more heat lost → smaller ΔT."
          : "";
  return { text: `Set-up ${n} · ${food.name}: ${bits}.${extra}` };
}

function currentObservation() {
  if (state.test === "iodine-leaf") {
    const sel = state.pieces.find((p) => p.id === state.selectedPiece);
    if (sel?.kind === "tube") return evaluateTube(sel).text;
    const leaf = (sel?.kind === "block" ? sel : null)
      || [...state.pieces].reverse().find((p) => p.kind === "block" && LEAF_IDS.has(p.foodId));
    if (leaf) return evaluateBlock(leaf).text;
    return "Click a green leaf (or drag it into the water bath), then boil 5 min in water. Next: leaf into the alcohol tube → heat that tube in the water bath → wash → white tile → dip in iodine from a test tube.";
  }
  const sel = state.pieces.find((p) => p.id === state.selectedPiece);
  if (sel?.kind === "tube") return evaluateTube(sel).text;
  if (sel?.kind === "paper") return evaluatePaper(sel).text;
  if (sel?.kind === "block") return evaluateBlock(sel).text;
  if (sel?.kind === "strip") return evaluateStrip(sel).text;
  if (sel?.kind === "burner") return evaluateBurner(sel).text;
  const prefer = { clinistix: "strip", albustix: "strip", grease: "paper", energy: "burner", iodine: "block", "iodine-leaf": "block" }[state.test];
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
  return "Follow the procedure on the left. Drag apparatus if you need extra pieces, then add the sample.";
}

function currentDrops() {
  const tube = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "tube")
    || [...state.pieces].reverse().find((p) => p.kind === "tube");
  if (!tube || state.test !== "vitc") return null;
  return evaluateTube(tube).drops;
}

function visibleFoods() {
  const lab = labById(state.test);
  const ids = lab?.foods;
  if (!ids?.length) return FOODS;
  return FOODS.filter((f) => ids.includes(f.id));
}

function renderFoods() {
  const box = document.getElementById("food-list");
  if (!box) return;
  const foods = visibleFoods();
  box.innerHTML = foods.map((f) => `
    <button type="button" class="food-item ${state.selectedFood === f.id ? "selected" : ""}" data-food="${f.id}">
      <span class="food-swatch ${f.form}" style="--swatch:${f.color}"></span>
      <span><span class="name">${f.name}</span><br><span class="sub">${f.zh} · ${f.form === "liquid" ? "liquid" : "block"}</span></span>
    </button>
  `).join("");
}

function renderLabNav() {
  const nav = document.getElementById("lab-nav");
  if (!nav) return;
  nav.innerHTML = LABS.map((lab) => {
    const on = lab.tab === "bank" ? state.tab === "bank" : (state.tab === "lab" && state.test === lab.id);
    return `<button type="button" data-lab="${lab.id}" class="${on ? "active" : ""}">${lab.title}</button>`;
  }).join("");
}

function leafStepIndex() {
  const leaf = [...state.pieces].reverse().find((p) => p.kind === "block" && LEAF_IDS.has(p.foodId));
  if (!leaf) return 0;
  if (!leaf.boiled) return 1;
  if (!leaf.decolourised) return 2;
  if (!leaf.washed) return 3;
  if (!leaf.iodine) return 4;
  return 5;
}

function procedureFor(testId) {
  const steps = {
    clinistix: {
      title: "Glucose test paper (Clinistix)",
      items: ["Dip Clinistix paper into the sample.", "Look for a color change."],
      why: "Positive result: pink → purple. Color change indicates presence of glucose.",
    },
    benedict: {
      title: "Benedict’s test (reducing sugar)",
      items: [
        "Add equal volumes: 5 cm³ sample + 5 cm³ Benedict’s.",
        "Stand the tube in a beaker of boiling water (water bath) for 5 min.",
        "Observe the precipitate.",
      ],
      why: "Positive: brick-red precipitate. More precipitate = more reducing sugar. Sucrose is non-reducing until hydrolysed.",
    },
    iodine: {
      title: "Iodine test (starch in food)",
      items: [
        "Solid food: put it on a white tile and add a few drops of iodine.",
        "Liquid: add a few drops of iodine to the sample in a test tube.",
        "Observe the colour.",
      ],
      why: "Positive: brown → blue-black. Starch is the storage polysaccharide in plants.",
    },
    "iodine-leaf": {
      title: "Iodine test on a green leaf",
      items: [
        "Boil the leaf in water (destroy cell membrane).",
        "Put the leaf in a boiling tube of alcohol. Heat that tube in the water bath (never heat alcohol directly).",
        "Wash with water (wash away alcohol).",
        "Spread the leaf on a white tile. Put iodine in a test tube and dip the leaf into it (or pour the iodine onto the leaf).",
      ],
      why: "Chlorophyll would hide the blue-black colour, so remove it in hot alcohol. Alcohol is flammable — heat the alcohol tube in a water bath, never with a naked flame. Positive: brown → blue-black.",
    },
    nrs: {
      title: "Non-reducing sugar (sucrose)",
      items: [
        "Add sample + dilute HCl. Boil 5 min to hydrolyse.",
        "Cool the tube.",
        "Add NaHCO₃ until alkaline (check with pH paper).",
        "Then do Benedict’s test (5 cm³, boil 5 min).",
      ],
      why: "Sucrose is the ★ exception: a non-reducing sugar. After hydrolysis it gives glucose + fructose, so Benedict’s can go brick-red.",
    },
    albustix: {
      title: "Protein test paper (Albustix)",
      items: ["Dip Albustix paper into the sample.", "Look for a color change."],
      why: "Positive: yellow → blue-green.",
    },
    biuret: {
      title: "Biuret test (protein)",
      items: [
        "Add the sample (grind solid food and filter to make an extract).",
        "Add sodium hydroxide (NaOH).",
        "Add a few drops of copper sulfate (CuSO₄).",
        "Shake gently.",
      ],
      why: "Positive: blue → violet/purple.",
    },
    grease: {
      title: "Grease spot test (lipid)",
      items: [
        "Drop a liquid or rub a solid food onto filter paper.",
        "Leave the spot to dry.",
        "Hold the paper up to the light. A lipid spot stays translucent 半透明.",
        "Drip alcohol onto a lipid spot — it dissolves.",
      ],
      why: "Positive: spot remains after drying and is translucent; it then dissolves in organic solvent. Water spots disappear on drying. Lipids are insoluble in water (non-polar).",
    },
    vitc: {
      title: "DCPIP test (vitamin C)",
      items: ["Add sample dropwise 逐滴 to DCPIP solution.", "Mix well.", "Observe color change."],
      why: "Positive: blue → colorless. Fewer drops needed = higher vitamin C concentration. Heat destroys vitamin C.",
    },
    energy: (() => {
      const plan = energyPlan();
      const read = [plan.dvDT ? "tap the thermometer" : null, plan.dvTime ? "tap the stopwatch" : null].filter(Boolean).join(" and ");
      return {
        title: "Energy in food",
        items: [
          "Choose what you change (IV) and what you measure (DV) on the right.",
          plan.iv.id === "food"
            ? "Add a second set-up. Put a different food on each one."
            : `Add a second set-up. Use the same food. Change only the ${plan.iv.label.toLowerCase()}.`,
          plan.dvDT || plan.dvTime
            ? `Click Ignite, then ${read} to record the DV.`
            : "Tick ΔT and/or time first — that is the DV.",
        ],
        why: "Change only one thing (the IV). Keep the rest the same. The DV is what you read from the apparatus. Fat has about double the energy of starch or protein.",
      };
    })(),
  };
  return steps[testId];
}

function renderProcedure() {
  const box = document.getElementById("proc");
  if (!box) return;
  const p = procedureFor(state.test);
  if (!p) {
    box.innerHTML = "";
    return;
  }
  const leafNow = state.test === "iodine-leaf" ? leafStepIndex() : -1;
  box.innerHTML = `<h3>${p.title}</h3><ol>${p.items.map((s, i) => {
    let cls = "";
    if (leafNow >= 0) {
      if (i + 1 < leafNow) cls = "done";
      else if (i + 1 === Math.min(leafNow, 4)) cls = "now";
    }
    return `<li class="${cls}">${s}</li>`;
  }).join("")}</ol><p class="why">${p.why}</p>`;
}

function renderVars() {
  const side = document.getElementById("lab-side");
  if (!side) return;
  if (state.test !== "energy") {
    const extra = {
      clinistix: "Notes table: dip Clinistix into the sample. Pink to purple (color change).",
      benedict: "Equal volumes (5 cm³ + 5 cm³). Stand the tube in a beaker of boiling water for 5 min. Brick-red precipitate — more precipitate = more reducing sugar.",
      iodine: "Solid food: white tile + drops of iodine. Liquid: drops in a test tube. Use the Green leaf panel for chlorophyll-removal.",
      "iodine-leaf": "Boil in water first. Heat the alcohol tube in the water bath — never heat alcohol directly. After washing, dip the leaf in iodine from a test tube.",
      nrs: "Hydrolyse with HCl → cool → NaHCO₃ until pH paper is alkaline → Benedict’s. Sucrose is non-reducing until then.",
      albustix: "Notes table: dip Albustix into the sample. Yellow to blue-green.",
      biuret: "NaOH first, then a few drops of CuSO₄. Shake gently. Blue → violet/purple. Solid food: grind and filter an extract.",
      grease: "Rub or drop onto paper, dry, then hold up to the light. Lipid spot stays translucent 半透明 and dissolves in alcohol. Water spots vanish on drying.",
      vitc: "Fewer drops to decolorize a fixed volume of DCPIP = higher vitamin C. Heat destroys vitamin C.",
    }[state.test] || "";
    side.innerHTML = extra ? `<div class="side-card"><h3>From the notes</h3><p>${extra}</p></div>` : "";
    return;
  }
  const plan = energyPlan();
  const calo = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "burner")
    || [...state.pieces].reverse().find((p) => p.kind === "burner");
  const ivOpts = ENERGY_IV_OPTIONS.map((o) =>
    `<option value="${o.id}" ${plan.iv.id === o.id ? "selected" : ""}>${o.label}</option>`
  ).join("");
  const cid = calo ? calo.id : "";
  const fieldInput = (p, field) => {
    const d = burnerDefaults(p);
    if (field === "mass") return `<input type="range" min="0.5" max="2" step="0.5" value="${d.mass}" data-calo="${p.id}" data-calo-field="mass" /><span class="conc-val">${d.mass} g</span>`;
    if (field === "waterVol") return `<input type="range" min="10" max="40" step="5" value="${d.waterVol}" data-calo="${p.id}" data-calo-field="waterVol" /><span class="conc-val">${d.waterVol} cm³</span>`;
    if (field === "t0") return `<input type="range" min="10" max="30" step="5" value="${d.t0}" data-calo="${p.id}" data-calo-field="t0" /><span class="conc-val">${d.t0}°C</span>`;
    return `<select data-calo="${p.id}" data-calo-field="distance">
          <option value="close" ${d.distance === "close" ? "selected" : ""}>Near</option>
          <option value="medium" ${d.distance === "medium" ? "selected" : ""}>Middle</option>
          <option value="far" ${d.distance === "far" ? "selected" : ""}>Far</option>
        </select>`;
  };
  const slider = (p, field, label, cls) => `
      <label class="quiz-row ${cls}">${label}
        ${fieldInput(p, field)}
      </label>`;
  const burners = state.pieces.filter((p) => p.kind === "burner");
  const ivCtrl = plan.iv.id === "food"
    ? `<p class="why">Put a different food on each set-up (click the food, then the next food).</p>`
    : burners.map((p) => slider(p, plan.iv.id, `${plan.iv.label} · set-up ${burnerIndex(p)}`, "is-iv")).join("");
  const cvSliders = calo ? plan.cvs.filter((c) => c.id !== "food").map((c) => slider(calo, c.id, c.label, "is-cv")).join("") : "";
  side.innerHTML = `
    <div class="side-card">
      <h3>Fair test</h3>
      <label class="quiz-row"><span class="var-tag iv">IV</span> What I change
        <select data-energy-iv>${ivOpts}</select>
      </label>
      <p class="keep-line"><span class="var-tag cv">CV</span> Same on both: ${plan.cvs.map((c) => c.label.toLowerCase()).join(", ")}</p>
      <p class="check-label"><span class="var-tag dv">DV</span> What I measure</p>
      <label class="check-row"><input type="checkbox" data-energy-dv="dT" ${plan.dvDT ? "checked" : ""} /> ΔT (temperature change)</label>
      <label class="check-row"><input type="checkbox" data-energy-dv="time" ${plan.dvTime ? "checked" : ""} /> Time until the flame goes out</label>
      <p class="why">${!plan.dvDT && !plan.dvTime
        ? "Tick at least one DV."
        : `After Ignite, ${[plan.dvDT ? "tap the thermometer" : null, plan.dvTime ? "tap the stopwatch" : null].filter(Boolean).join(" and ")}.`}</p>
      <div data-fair-status>${energyFairHtml()}</div>
      ${energyCompareTableHtml()}
      ${ivCtrl}
      ${calo ? `<details class="energy-more"${energyCvMismatches().length ? " open" : ""}><summary>Same on both (CV)</summary>${cvSliders}<p class="why">Changing these copies them to every set-up.</p></details>` : ""}
      <details class="energy-more"><summary>Picture size</summary>
        <label class="quiz-row">Size
          <input type="range" min="0.85" max="1.8" step="0.05" value="${state.energyScale}" data-energy-scale />
          <span class="conc-val">${Math.round(state.energyScale * 100)}%</span>
        </label>
      </details>
      <p class="why">Bigger ΔT = more energy. Fat ≈ double starch / protein.</p>
    </div>`;
}

function renderTests() {
  renderLabNav();
  renderProcedure();
  renderVars();
}

function renderColorScale(title, bands, matchKey) {
  const scale = document.getElementById("protein-scale");
  if (!scale) return;
  scale.hidden = false;
  scale.innerHTML = `<div class="protein-scale-title">${title}</div>` + bands.map((b) => `
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
  if (t?.id === "albustix" || t?.id === "clinistix") {
    panel.classList.add("on");
    panel.hidden = false;
    panel.removeAttribute("aria-hidden");
    if (sliderWrap) sliderWrap.hidden = true;
    const stripId = t.id;
    const sel = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "strip" && p.strip === stripId)
      || [...state.pieces].reverse().find((p) => p.kind === "strip" && p.strip === stripId);
    const ev = sel ? evaluateStrip(sel) : null;
    if (t.id === "clinistix") {
      renderColorScale("Glucose", GLUCOSE_SCALE, ev?.band || "");
      document.getElementById("conc-hint").textContent = "Unused Clinistix is pink. Color change to purple indicates glucose.";
    } else {
      renderColorScale("Protein", ALBUSTIX_SCALE, ev?.band || "");
      document.getElementById("conc-hint").textContent = "Unused Albustix is yellow. Color change to blue-green indicates protein.";
    }
    return;
  }
  if (scale) {
    scale.hidden = true;
    scale.innerHTML = "";
  }
  if (sliderWrap) sliderWrap.hidden = false;
  if (!t?.conc) {
    panel.classList.remove("on");
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    return;
  }
  panel.classList.add("on");
  panel.hidden = false;
  panel.removeAttribute("aria-hidden");
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
    const dose = state.test === "vitc" ? " · 1 drop"
      : state.test === "benedict" ? " · 5 cm³"
      : state.test === "biuret" ? " · 2 cm³ extract"
      : " · 1 cm³";
    return "Dropper · " + foodById(state.dropper.fill).name + dose;
  }
  if (state.dropper.fill && REAGENTS[state.dropper.fill]) {
    return "Dropper · " + REAGENTS[state.dropper.fill].name + " · " + reagentDoseLabel(state.dropper.fill);
  }
  return "Dropper · empty";
}

function apparatusList() {
  const t = testById(state.test);
  if (!t) return [];
  const items = [];
  if (t.extra.includes("tube")) items.push({ id: "tube", label: "Test tube" });
  if (t.id !== "energy" && t.id !== "iodine-leaf") items.push({ id: "dropper", label: dropperLabel() });
  if (t.extra.includes("bath")) items.push({ id: "bath", label: "Water bath (beaker)" });
  if (t.extra.includes("paper")) items.push({ id: "paper", label: "Filter paper" });
  if (t.extra.includes("tile")) items.push({ id: "tile", label: "White tile" });
  if (t.extra.includes("clinistix")) items.push({ id: "clinistix", label: "Glucose paper" });
  if (t.extra.includes("albustix")) items.push({ id: "albustix", label: "Albustix" });
  if (t.extra.includes("phpaper")) items.push({ id: "phpaper", label: "pH paper" });
  if (t.extra.includes("burner")) items.push({ id: "burner", label: "Add set-up" });
  (t.reagents || []).forEach((r) => items.push({ id: r, label: REAGENTS[r].name + " · " + reagentDoseLabel(r), reagent: true }));
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
      : a.id === "bath" ? `<span style="width:22px;height:18px;background:#c5e0f0;border:1px solid #8aa;border-radius:0 0 8px 8px;display:inline-block"></span>`
      : a.id === "paper" ? `<span style="width:22px;height:16px;background:#f3f1ea;border:1px solid #ccc;display:inline-block"></span>`
      : a.id === "tile" ? `<span style="width:22px;height:14px;background:#fbfbfb;border:1px solid #ccc;display:inline-block"></span>`
      : a.id === "dropper" ? `<svg width="18" height="28" viewBox="0 0 18 28"><rect x="7" y="2" width="4" height="10" fill="#c5d0d8"/><path d="M5 12 h8 l-2 14 h-4z" fill="#9eb0bc"/></svg>`
      : a.id === "clinistix" ? `<span class="mini-glucose"><i></i></span>`
      : a.id === "albustix" ? `<span class="mini-albustix"><i></i></span>`
      : a.id === "phpaper" ? `<span class="mini-phpaper"><i></i></span>`
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
  return state.pieces.filter((p) => (p.kind === "tube" || p.kind === "block" || p.kind === "beaker") && p.dockedTo === bath.id);
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
    return x >= p.x + 8 && x <= p.x + 208 && y >= p.y + 18 && y <= p.y + 188;
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

function stationAtClientPoint(clientX, clientY) {
  const bench = document.getElementById("bench");
  if (!bench) return null;
  const r = bench.getBoundingClientRect();
  const x = clientX - r.left;
  const y = clientY - r.top;
  const hits = state.pieces.filter((p) => {
    if (drag?.kind === "piece" && drag.id === p.id) return false;
    const size = p.kind === "tile" ? { w: 120, h: 88 } : p.kind === "beaker" ? { w: 86, h: 120 } : null;
    if (!size) return false;
    return x >= p.x && x <= p.x + size.w && y >= p.y && y <= p.y + size.h;
  });
  return hits[hits.length - 1] || null;
}

function hitStation(clientX, clientY) {
  return stationAtClientPoint(clientX, clientY);
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
  const leaf = LEAF_IDS.has(food.id);
  return `
    <button class="x" type="button" data-del="${p.id}">×</button>
    <div class="solid-cube ${leaf ? "leaf-shape" : ""} ${ev.pale ? "pale" : ""}" style="background:${ev.pale ? "#e8e4c8" : food.color}"></div>
    <div class="solid-stain ${ev.stain ? "on" : ""}" style="background:${ev.stain || "transparent"}"></div>
    <div class="tube-tag">${food.name}</div>`;
}

function tubeInnerHtml(p, extraClass = "") {
  const ev = evaluateTube(p);
  const cm3 = tubeMeasuredCm3(p.contents);
  const c = p.contents;
  const shakeBtn = state.test === "biuret" && c.naoh > 0 && (c.cuso4 > 0 || c.biuret > 0) && !c.shaken
    ? `<button type="button" class="btn heat-btn" data-shake="${p.id}">Shake</button>` : "";
  const coolBtn = state.test === "nrs" && c.hydrolysed && !c.cooled
    ? `<button type="button" class="btn heat-btn" data-cool="${p.id}">Cool</button>` : "";
  const nestedLeaf = state.pieces.filter((x) => x.kind === "block" && x.dockedTo === p.id)
    .map((item) => `<div class="bath-item bath-block in-tube ${state.selectedPiece === item.id ? "selected" : ""}" data-id="${item.id}">${blockInnerHtml(item)}</div>`)
    .join("");
  const tag = c.iodine > 0 && !c.foodId ? "iodine" : (c.alcohol > 0 && !c.foodId ? "alcohol" : (foodById(c.foodId)?.name || (c.alcohol ? "alcohol" : "empty")));
  return `
    <button class="x" type="button" data-del="${p.id}">×</button>
    <div class="tube-lip"></div>
    <div class="tube-glass">
      <div class="tube-liquid ${ev.ppt ? "ppt ppt-" + (ev.pptAmt || "mid") : ""} ${ev.cloudy ? "cloudy" : ""}" style="height:${ev.vol}%;background:${ev.color}"></div>
      <div class="tube-fizz ${ev.fizz ? "on" : ""}"><i style="left:30%;bottom:20%"></i><i style="left:55%;bottom:10%;animation-delay:.2s"></i><i style="left:40%;bottom:30%;animation-delay:.4s"></i></div>
      ${nestedLeaf}
    </div>
    <div class="tube-tag">${tag}${cm3 ? ` · ${cm3} cm³` : ""}</div>${coolBtn}${shakeBtn}`;
}

function renderPieces() {
  const bench = document.getElementById("bench");
  bench.classList.toggle("has-items", state.pieces.length > 0);
  bench.querySelectorAll(".piece").forEach((el) => el.remove());
  const hosts = state.pieces.filter((p) => p.kind === "bath" || p.kind === "beaker" || p.kind === "tile" || p.kind === "tube");
  const hidden = new Set();
  hosts.forEach((h) => {
    state.pieces.forEach((p) => {
      if ((p.kind === "tube" || p.kind === "block" || p.kind === "beaker") && p.dockedTo === h.id) hidden.add(p.id);
    });
  });
  state.pieces.forEach((p) => {
    if (hidden.has(p.id)) return;
    bench.appendChild(pieceEl(p));
  });
  renderEnergyFairOverlay();
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
      if (item.kind === "beaker") {
        const innerLeaf = state.pieces.filter((x) => x.kind === "block" && x.dockedTo === item.id)
          .map((leaf) => `<div class="bath-item bath-block ${state.selectedPiece === leaf.id ? "selected" : ""}" data-id="${leaf.id}">${blockInnerHtml(leaf)}</div>`)
          .join("");
        return `<div class="bath-item bath-alcohol ${state.selectedPiece === item.id ? "selected" : ""}" data-id="${item.id}">
          <div class="alcohol-tube-mini"><span>alcohol</span>${innerLeaf}</div>
        </div>`;
      }
      return `<div class="bath-item bath-tube tube ${state.selectedPiece === item.id ? "selected" : ""}" data-id="${item.id}">${tubeInnerHtml(item)}</div>`;
    }).join("");
    const emptyHint = state.test === "iodine-leaf"
      ? "1. Drop a green leaf in here and boil in water"
      : "Stand the test tube in this beaker of water";
    el.innerHTML = `
      <button class="x" type="button" data-del="${p.id}">×</button>
      <div class="bath-label">Water bath (beaker)${heatingNow ? ` · boiling · ${remain} min left` : (p.hot ? " · boiling" : "")}</div>
      <div class="bath-box">
        <div class="bath-water"></div>
        <div class="bath-rack">${nested || `<span style="font-size:11px;color:#355;padding:8px">${emptyHint}</span>`}</div>
        <div class="bath-front"></div>
        <button type="button" class="btn heat-btn" data-heat="${p.id}" ${heatingNow ? `aria-busy="true"` : ""}>${heatLabel}</button>
      </div>`;
  } else if (p.kind === "paper") {
    const ev = evaluatePaper(p);
    el.classList.add("paper");
    const dryBtn = !p.dried && p.foodId
      ? `<button type="button" class="btn heat-btn" data-dry="${p.id}">Dry</button>`
      : (p.dried && !p.lit
        ? `<button type="button" class="btn heat-btn" data-light="${p.id}">Hold up to light</button>`
        : "");
    el.innerHTML = `
      <button class="x" type="button" data-del="${p.id}">×</button>
      <div class="bath-label">Filter paper</div>
      <div class="paper-sheet ${p.lit ? "lit" : ""}"><div class="paper-spot ${ev.on ? "on" : ""} ${ev.wet ? "wet" : ""} ${ev.translucent ? "translucent" : ""} ${ev.gone ? "gone" : ""}"></div></div>
      ${dryBtn}`;
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
        <div class="strip-body">
          <div class="strip-pad${ev.developing ? " developing" : ""}" style="background:${ev.color}"></div>
        </div>
        <div class="tube-tag">${ev.reading ? `Glucose · ${ev.reading}` : "Clinistix"}</div>`;
    } else if (p.strip === "phpaper") {
      el.classList.add("phpaper-strip");
      el.innerHTML = `
        <button class="x" type="button" data-del="${p.id}">×</button>
        <div class="strip-body">
          <div class="strip-pad${ev.developing ? " developing" : ""}" style="background:${ev.color}"></div>
        </div>
        <div class="tube-tag">${ev.reading ? `pH · ${ev.reading}` : "pH paper"}</div>`;
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
    const e = food ? energyOf(food, p) : energyOf(null, p);
    const s = burnerDefaults(p);
    const n = burnerIndex(p);
    const plan = energyPlan();
    const needDT = !!(p.burned && food && plan.dvDT && !p.readDT);
    const needTime = !!(p.burned && food && plan.dvTime && !p.readTime);
    const thermoTxt = !p.burned || !food
      ? `T ${s.t0}°C`
      : !plan.dvDT ? `T ${s.t0}°C`
      : p.readDT ? `T ${e.t1}°C`
      : "Tap to read T";
    const watchTxt = !p.burned || !food
      ? "0:00"
      : !plan.dvTime ? "—"
      : p.readTime ? `${e.time} s`
      : "Tap to read";
    const dTTxt = !plan.dvDT
      ? ""
      : p.readDT && p.burned && food ? `ΔT +${e.dT}°C` : "ΔT = T₁ − T₀";
    el.classList.add("burner");
    if (energyCvMismatches().length) el.classList.add("cv-bad");
    el.setAttribute("aria-label", food ? `Set-up ${n}, ${food.name}` : `Set-up ${n}, empty`);
    const scale = state.energyScale;
    el.style.width = `${280 * scale}px`;
    el.style.height = `${268 * scale}px`;
    const foodBottom = s.distance === "close" ? 58 : s.distance === "far" ? 28 : 48;
    const needleH = s.distance === "close" ? 12 : s.distance === "far" ? 24 : 18;
    const needleBottom = foodBottom - needleH + 2;
    const flameBottom = foodBottom + 8;
    el.innerHTML = `
      <div class="burn-scale" style="transform:scale(${scale})">
        <button class="x" type="button" data-del="${p.id}">×</button>
        <div class="bath-label">Set-up ${n}</div>
        <div class="burn-stand">
          <div class="stand-pole"></div>
          <div class="stand-base"></div>
          <div class="clamp-arm"></div>
          <div class="calo-tube">
            <div class="thermo-stem"></div>
            <div class="thermo-bulb"></div>
            <span class="calo-water">${s.waterVol} cm³ water</span>
          </div>
          <div class="needle" style="height:${needleH}px;bottom:${needleBottom}px"></div>
          <div class="burn-food" style="background:${food ? food.color : "#ddd"};bottom:${foodBottom}px"></div>
          <div class="flame" style="bottom:${flameBottom}px"></div>
          <div class="bunsen"><i></i></div>
          <button type="button" class="read-inst thermo ${plan.dvDT ? (needDT ? "need-read is-dv" : "is-dv") : "is-muted"}" data-read-dv="dT" data-read="${p.id}" ${plan.dvDT && p.burned && food ? "" : "disabled"}>${thermoTxt}</button>
          <button type="button" class="read-inst watch ${plan.dvTime ? (needTime ? "need-read is-dv" : "is-dv") : "is-muted"}" data-read-dv="time" data-read="${p.id}" ${plan.dvTime && p.burned && food ? "" : "disabled"}>${watchTxt}</button>
          ${plan.dvDT ? `<div class="dT ${p.readDT ? "is-dv" : ""}">${dTTxt}</div>` : ""}
        </div>
        <button type="button" class="btn heat-btn" data-burn="${p.id}">Ignite</button>
        <div class="tube-tag">${food ? `${food.name} · ${s.mass} g` : "no food on needle"}</div>
      </div>`;
  } else if (p.kind === "beaker") {
    el.classList.add("beaker", p.role || "alcohol");
    const nested = state.pieces.filter((x) => x.kind === "block" && x.dockedTo === p.id)
      .map((item) => `<div class="bath-item bath-block ${state.selectedPiece === item.id ? "selected" : ""}" data-id="${item.id}">${blockInnerHtml(item)}</div>`)
      .join("");
    el.innerHTML = `
      <button class="x" type="button" data-del="${p.id}">×</button>
      <div class="bath-label">${p.role === "rinse" ? "Water (wash)" : "Alcohol boiling tube"}</div>
      <div class="beaker-body"><div class="beaker-fill"></div>${nested}</div>
      <div class="tube-tag">${p.role === "rinse" ? "wash away alcohol" : "heat this tube in the water bath"}</div>`;
  } else if (p.kind === "tile") {
    el.classList.add("tile-piece");
    const onTile = state.pieces.filter((x) => x.kind === "block" && x.dockedTo === p.id);
    const nested = onTile.map((item) => `<div class="bath-item bath-block on-tile ${state.selectedPiece === item.id ? "selected" : ""}" data-id="${item.id}">${blockInnerHtml(item)}</div>`).join("");
    el.innerHTML = `
      <button class="x" type="button" data-del="${p.id}">×</button>
      <div class="bath-label">White tile</div>
      <div class="tile-sheet">${nested}</div>
      <div class="tube-tag">${onTile[0] ? foodById(onTile[0].foodId)?.name || "sample" : (state.test === "iodine-leaf" ? "leaf · dip iodine from the tube" : "solid food + drops of iodine")}</div>`;
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

function syncCaloFieldLabels() {
  document.querySelectorAll("[data-calo-field]").forEach((el) => {
    const p = state.pieces.find((x) => x.id === el.dataset.calo);
    if (!p) return;
    const span = el.closest("label")?.querySelector(".conc-val");
    if (!span) return;
    const key = el.dataset.caloField;
    if (key === "mass") span.textContent = `${p.mass} g`;
    else if (key === "waterVol") span.textContent = `${p.waterVol} cm³`;
    else if (key === "t0") span.textContent = `${p.t0}°C`;
  });
}

function refreshEnergyLive() {
  renderPieces();
  renderObs();
  syncCaloFieldLabels();
  const table = document.querySelector(".fair-table");
  const next = energyCompareTableHtml();
  if (table && next) table.outerHTML = next;
  const status = document.querySelector("[data-fair-status]");
  if (status) status.innerHTML = energyFairHtml();
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
    const hideDrop = ["energy", "iodine-leaf", "clinistix", "albustix"].includes(state.test);
    btnDrop.hidden = hideDrop;
    btnDrop.textContent = state.test === "vitc"
      ? "Add 1 drop of selected food"
      : state.test === "benedict"
        ? "Add 5 cm³ of selected food"
        : state.test === "biuret"
          ? "Add 2 cm³ extract of selected food"
          : "Add 1 cm³ of selected food";
  }
  const hint = document.getElementById("empty-hint");
  if (hint) {
    hint.textContent = procedureFor(state.test)?.items[0] || "Use the set-up on this bench.";
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
      `Glucose paper: ${(() => { const b = glucoseBand(glucoseOf(f)); return b.key === "0" ? "stays pink" : "pink → purple"; })()}`,
      `Benedict's: ${f.n.rs ? "brick-red ppt (more ppt = more reducing sugar)" : (f.n.nrs ? "blue until hydrolysed" : "remains blue")}`,
      `Iodine: ${f.n.starch ? "brown → blue-black" : "remains brown"}`,
      `Albustix: ${(() => { const b = albustixBand(f.n.protein); return b.key === "neg" ? "stays yellow" : "yellow → blue-green"; })()}`,
      `Biuret: ${f.n.protein ? "blue → violet / purple" : "remains blue"}`,
      `Grease spot: ${f.n.lipid ? "translucent spot; disappears in alcohol" : "no translucent spot"}`,
      `DCPIP: ${f.n.vitC ? "blue → colourless (fewer drops = more vit. C)" : "remains blue"}`,
      `Burning: lipids’ energy per gram is DOUBLE carb / protein`,
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
  document.getElementById("panel-lab").classList.toggle("active", tab === "lab");
  document.getElementById("panel-bank").classList.toggle("active", tab === "bank");
  const actions = document.querySelector(".top-actions");
  if (actions) actions.hidden = tab !== "lab";
  if (tab === "bank") renderBank();
  renderLabNav();
}

function applyLeafStation(leaf, target) {
  if (!leaf || leaf.kind !== "block") return false;
  if (target?.kind === "beaker" && target.role === "alcohol") {
    if (!leaf.boiled) return false;
    leaf.dockedTo = target.id;
    leaf.x = target.x + 10;
    leaf.y = target.y + 18;
    state.selectedPiece = leaf.id;
    return true;
  }
  if (target?.kind === "beaker" && target.role === "rinse") {
    if (!leaf.decolourised) return false;
    leaf.washed = true;
    leaf.dockedTo = target.id;
    leaf.x = target.x + 10;
    leaf.y = target.y + 18;
    state.selectedPiece = leaf.id;
    return true;
  }
  if (target?.kind === "tile") {
    leaf.dockedTo = target.id;
    leaf.x = target.x + 20;
    leaf.y = target.y + 8;
    state.selectedPiece = leaf.id;
    return true;
  }
  return false;
}

function tubeHasIodine(tube) {
  return !!(tube?.kind === "tube" && tube.contents && tube.contents.iodine > 0);
}

function leafOnTileOrWashed(leaf) {
  if (!leaf || leaf.kind !== "block") return false;
  return !!leaf.washed;
}

function applyIodineFromTube(tube, leaf) {
  if (!tubeHasIodine(tube) || !leafOnTileOrWashed(leaf)) return false;
  leaf.iodine = true;
  state.selectedPiece = leaf.id;
  return true;
}

function dipLeafInIodineTube(leaf, tube) {
  if (!applyIodineFromTube(tube, leaf)) return false;
  leaf.dockedTo = tube.id;
  leaf.x = tube.x + 4;
  leaf.y = tube.y + 48;
  return true;
}

function fillIodineTube(tube) {
  if (!tube || tube.kind !== "tube") return false;
  if (!tubeHasIodine(tube)) addToTube(tube, reagentAddPayload("iodine"));
  state.selectedPiece = tube.id;
  return true;
}

function iodineTubeOnBench() {
  return state.pieces.find((p) => p.kind === "tube" && !p.dockedTo)
    || state.pieces.find((p) => p.kind === "tube")
    || null;
}

function leafOnHost(host) {
  return state.pieces.find((p) => p.kind === "block" && p.dockedTo === host?.id) || null;
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
    piece.dried = !!piece.dried;
    piece.rubbed = !!piece.rubbed;
  }
  if (kind === "block") {
    piece.iodine = !!piece.iodine;
    piece.boiled = !!piece.boiled;
    piece.decolourised = !!piece.decolourised;
    piece.washed = !!piece.washed;
    piece.dockedTo = piece.dockedTo || null;
  }
  if (kind === "beaker") piece.role = piece.role || "alcohol";
  if (kind === "tile") piece.dockedTo = null;
  if (kind === "strip" && piece.foodId === undefined) piece.foodId = null;
  if (kind === "burner") {
    if (piece.foodId === undefined) piece.foodId = null;
    piece.burned = !!piece.burned;
    piece.readDT = !!piece.readDT;
    piece.readTime = !!piece.readTime;
    const d = burnerDefaults(piece);
    piece.mass = d.mass;
    piece.waterVol = d.waterVol;
    piece.t0 = d.t0;
    piece.distance = d.distance;
  }
  if (extra.x == null && piece.x > r.width - 80) piece.x = Math.max(8, r.width - 96);
  if (extra.y == null && piece.y > r.height - 80) piece.y = Math.max(8, r.height - 90);
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
  const skip = (node) => node && (node.classList.contains("lifted") || (drag?.kind === "piece" && node.dataset.id === drag.id));
  const inner = el?.closest?.(".bath-item");
  if (inner && !skip(inner)) return state.pieces.find((p) => p.id === inner.dataset.id) || null;
  const piece = el?.closest?.(".piece");
  if (!piece || skip(piece)) return null;
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
    if (payload.reagent === "biuret") { c.naoh += 2; c.cuso4 += 1; }
    if (payload.reagent === "nahco3" && c.hydrolysed && c.cooled) c.alkaliAdded = true;
    if (payload.reagent === "hcl" && c.heated >= 1) c.hydrolysed = true;
  }
}

function applyHeatToPiece(p) {
  if (p.kind === "block") {
    const host = state.pieces.find((x) => x.id === p.dockedTo);
    if (host?.kind === "beaker" && host.role === "alcohol") {
      if (p.boiled) p.decolourised = true;
      return;
    }
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
}

function finishHeat(bath) {
  const ids = new Set(bath.heating?.pieceIds || []);
  bath.heating = null;
  bath.hot = true;
  const targets = [];
  state.pieces.forEach((p) => {
    if (p.dockedTo !== bath.id) return;
    if (ids.size && !ids.has(p.id)) return;
    targets.push(p);
    state.pieces.forEach((x) => {
      if (x.dockedTo === p.id) targets.push(x);
    });
  });
  targets.forEach(applyHeatToPiece);
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
  const direct = state.pieces.filter((p) => p.dockedTo === bath.id);
  const ids = direct.map((p) => p.id);
  const mins = heatMinutesNeeded();
  if (mins <= 0) {
    bath.hot = true;
    direct.forEach((p) => {
      applyHeatToPiece(p);
      state.pieces.filter((x) => x.dockedTo === p.id).forEach(applyHeatToPiece);
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
  else if (appId === "phpaper" && !hit) addPiece("strip", { strip: "phpaper" });
  else if (appId === "tile" && !hit) addPiece("tile");
  else if (appId === "burner" && !hit) {
    const keep = state.selectedPiece;
    addPiece("burner", nextBurnerPos());
    const prev = state.pieces.find((p) => p.id === keep && p.kind === "burner");
    if (prev) state.selectedPiece = prev.id;
  }
  else if ((appId === "alcohol" || appId === "ethanol") && hit?.kind === "paper") {
    if (hit.dried && hit.lit) {
      hit.solvent = true;
      state.selectedPiece = hit.id;
    }
  } else if (appId === "phpaper" && hit?.kind === "tube") {
    const strip = addPiece("strip", { strip: "phpaper", x: hit.x + 50, y: hit.y });
    strip.tubeId = hit.id;
    if (hit.contents.alkaliAdded) hit.contents.neutralized = true;
    state.selectedPiece = strip.id;
  } else if ((appId === "alcohol" || appId === "ethanol") && hit?.kind === "block" && hit.boiled) {
    const alc = state.pieces.find((p) => p.kind === "beaker" && p.role === "alcohol");
    if (alc) applyLeafStation(hit, alc);
    state.selectedPiece = hit.id;
  } else if (appId === "water" && hit?.kind === "block" && hit.decolourised) {
    hit.washed = true;
    state.selectedPiece = hit.id;
  } else if (appId === "iodine" && state.test === "iodine-leaf") {
    const tube = hit?.kind === "tube"
      ? hit
      : (state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "tube") || iodineTubeOnBench() || addPiece("tube"));
    fillIodineTube(tube);
  } else if (appId === "iodine" && hit?.kind === "block") {
    hit.iodine = true;
    state.selectedPiece = hit.id;
  } else if (appId === "iodine" && (hit?.kind === "tile" || hit?.kind === "beaker")) {
    const leaf = state.pieces.find((p) => p.kind === "block" && p.dockedTo === hit.id)
      || [...state.pieces].reverse().find((p) => p.kind === "block" && (p.washed || state.test === "iodine"));
    if (leaf) {
      leaf.iodine = true;
      state.selectedPiece = leaf.id;
    }
  } else if (reagent && hit?.kind === "tube") {
    addToTube(hit, reagentAddPayload(appId));
    state.selectedPiece = hit.id;
  } else if ((appId === "clinistix" || appId === "albustix") && hit?.kind === "tube") {
    const strip = addPiece("strip", { strip: appId });
    if (hit.contents.foodId) dipStrip(strip, hit.contents.foodId);
    state.selectedPiece = strip.id;
  }
}

function dropLeafIntoLab(food) {
  if (!food || food.form !== "block") return;
  const bath = state.pieces.find((p) => p.kind === "bath");
  const existing = state.pieces.find((p) => p.kind === "block" && p.foodId === food.id);
  if (existing && bath) {
    if (!existing.boiled) dockIntoBath(existing, bath);
    state.selectedPiece = existing.id;
    return;
  }
  useFoodOn(food, bath || null, true);
}

function useFoodOn(food, target, pour) {
  if (target?.kind === "paper") {
    target.foodId = food.id;
    target.dried = false;
    target.lit = false;
    target.solvent = false;
    target.rubbed = food.form === "block";
    state.selectedPiece = target.id;
    return;
  }
  if (state.test === "energy") {
    const burner = target?.kind === "burner" ? target : pickEnergyBurner();
    if (burner) {
      burner.foodId = food.id;
      burner.burned = false;
      resetEnergyReads(burner);
      state.selectedPiece = burner.id;
    }
    return;
  }
  if (state.test === "iodine" && food.form === "block") {
    if (!target || target.kind === "tube") {
      const tile = state.pieces.find((p) => p.kind === "tile");
      if (tile) target = tile;
    }
  }
  if (state.test === "iodine-leaf" && food.form === "block") {
    if (!target || target.kind === "tube" || target.kind === "paper") {
      const bath = state.pieces.find((p) => p.kind === "bath");
      if (bath) target = bath;
    }
  }
  if (!target) {
    if (state.test === "energy") {
      const burner = pickEnergyBurner();
      if (burner) {
        burner.foodId = food.id;
        burner.burned = false;
        state.selectedPiece = burner.id;
        return;
      }
    }
    if (food.form === "block" && (state.test === "iodine" || state.test === "iodine-leaf" || state.test === "energy")) {
      addPiece("block", { foodId: food.id, iodine: false, boiled: false, decolourised: false, washed: false });
    }
    return;
  }
  if (target.kind === "strip") {
    dipStrip(target, food.id);
    state.selectedPiece = target.id;
  } else if (target.kind === "burner") {
    target.foodId = food.id;
    target.burned = false;
    state.selectedPiece = target.id;
  } else if (target.kind === "bath" && food.form === "block") {
    const leaf = addPiece("block", { foodId: food.id, iodine: false, boiled: false, decolourised: false, washed: false });
    dockIntoBath(leaf, target);
  } else if (target.kind === "beaker" || target.kind === "tile") {
    const leaf = state.pieces.find((p) => p.kind === "block" && p.foodId === food.id)
      || addPiece("block", { foodId: food.id, iodine: false, boiled: false, decolourised: false, washed: false });
    applyLeafStation(leaf, target);
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
    if (p.kind === "tube" || p.kind === "block" || p.kind === "beaker") {
      highlightBathUnderPointer(ev.clientX, ev.clientY);
      const overStation = hitStation(ev.clientX, ev.clientY);
      const overPiece = targetPieceAt(ev.clientX, ev.clientY);
      document.querySelectorAll(".piece.beaker, .piece.tile-piece, .piece.tube").forEach((el) => {
        const hot = (overStation && el.dataset.id === overStation.id) || (overPiece && el.dataset.id === overPiece.id);
        el.classList.toggle("drop-hot", !!hot);
      });
    }
    return;
  }
  moveGhost(ev);
  if (drag.kind === "food" && state.test === "energy") {
    const hit = targetPieceAt(ev.clientX, ev.clientY);
    document.querySelectorAll(".piece.burner").forEach((el) => {
      el.classList.toggle("drop-hot", !!(hit && hit.kind === "burner" && el.dataset.id === hit.id));
    });
  }
}

function endDrag(ev) {
  if (!drag) return;
  const g = document.getElementById("ghost");
  g.hidden = true;
  document.body.classList.remove("dragging");
  const bench = document.getElementById("bench");
  const overBench = bench.contains(document.elementFromPoint(ev.clientX, ev.clientY)) || ev.target === bench;
  const hit = targetPieceAt(ev.clientX, ev.clientY);
  const bath = bathAtClientPoint(ev.clientX, ev.clientY);
  const station = stationAtClientPoint(ev.clientX, ev.clientY);
  if (drag.kind === "food") {
    const f = foodById(drag.id);
    state.selectedFood = f.id;
    if (state.test === "energy") {
      const onto = overBench && hit?.kind === "burner" ? hit : pickEnergyBurner();
      useFoodOn(f, onto, true);
      energyFoodPlaced = true;
    } else if (overBench) useFoodOn(f, bath || station || hit, true);
  } else if (drag.kind === "app") {
    if (drag.id === "dropper" || overBench || drag.id === "iodine" || ["tube", "bath", "paper", "clinistix", "albustix", "phpaper", "tile", "burner"].includes(drag.id)) {
      usePalette(drag.id, drag.reagent, ev.clientX, ev.clientY);
    }
  } else if (drag.kind === "piece") {
    const p = state.pieces.find((x) => x.id === drag.id);
    if (p) {
      const moved = Math.abs(ev.clientX - drag.x) + Math.abs(ev.clientY - drag.y) > 6;
      if (moved) {
        placePieceAtClient(p, ev.clientX, ev.clientY);
        p.dockedTo = null;
        if (p.kind === "strip" && p.strip === "phpaper" && hit?.kind === "tube") {
          p.tubeId = hit.id;
          if (hit.contents.alkaliAdded) hit.contents.neutralized = true;
          state.selectedPiece = p.id;
        } else if ((p.kind === "tube" || p.kind === "block" || p.kind === "beaker") && overBench) {
          if (state.test === "iodine-leaf" && p.kind === "tube") {
            const leaf = hit?.kind === "block" ? hit : (hit?.kind === "tile" ? leafOnHost(hit) : null);
            if (!applyIodineFromTube(p, leaf) && bath) dockIntoBath(p, bath);
          } else if (state.test === "iodine-leaf" && p.kind === "block" && hit?.kind === "tube") {
            if (!dipLeafInIodineTube(p, hit)) {
              if (bath) dockIntoBath(p, bath);
              else applyLeafStation(p, station);
            }
          } else if (bath) dockIntoBath(p, bath);
          else if (p.kind === "block") applyLeafStation(p, station);
        }
      }
    }
  }
  drag = null;
  document.querySelectorAll(".drop-hot").forEach((el) => el.classList.remove("drop-hot"));
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
    if (state.test === "energy") {
      startDrag("food", f.id, false, ev);
      return;
    }
    if (state.test === "iodine" && f.form === "block") {
      const tile = state.pieces.find((p) => p.kind === "tile");
      useFoodOn(f, tile || null, true);
      renderLab();
      return;
    }
    if (state.test === "grease") {
      startDrag("food", f.id, false, ev);
      return;
    }
    if (state.test === "iodine-leaf") {
      dropLeafIntoLab(f);
      renderLab();
      return;
    }
    startDrag("food", f.id, false, ev);
    return;
  }
  const appBtn = ev.target.closest("[data-app]");
  if (appBtn && ev.target.closest("#apparatus")) {
    if (state.test === "iodine-leaf" && appBtn.dataset.app === "iodine") {
      const tube = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "tube")
        || iodineTubeOnBench()
        || addPiece("tube", { x: 312, y: 8 });
      fillIodineTube(tube);
      renderLab();
      return;
    }
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
  const cool = ev.target.closest("[data-cool]");
  if (cool) {
    ev.stopPropagation();
    const tube = state.pieces.find((p) => p.id === cool.dataset.cool);
    if (tube?.contents) tube.contents.cooled = true;
    renderLab();
    return;
  }
  const dry = ev.target.closest("[data-dry]");
  if (dry) {
    ev.stopPropagation();
    const paper = state.pieces.find((p) => p.id === dry.dataset.dry);
    if (paper) paper.dried = true;
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
  const readDv = ev.target.closest("[data-read-dv]");
  if (readDv) {
    ev.stopPropagation();
    const b = state.pieces.find((p) => p.id === readDv.dataset.read);
    if (readEnergyDv(b, readDv.dataset.readDv)) {
      state.selectedPiece = b.id;
      renderLab();
    }
    return;
  }
  const burn = ev.target.closest("[data-burn]");
  if (burn) {
    ev.stopPropagation();
    const b = state.pieces.find((p) => p.id === burn.dataset.burn);
    if (b?.foodId) {
      b.burned = true;
      resetEnergyReads(b);
    }
    renderLab();
    return;
  }
  const innerTube = ev.target.closest(".bath-item");
  const piece = innerTube || ev.target.closest(".piece");
  if (piece) {
    const p = state.pieces.find((x) => x.id === (innerTube?.dataset.id || piece.dataset.id));
    if (!p) return;
    const prevStrip = state.pieces.find((x) => x.id === state.selectedPiece && x.strip === "phpaper");
    if (p.kind === "tube" && prevStrip) {
      prevStrip.tubeId = p.id;
      if (p.contents.alkaliAdded) p.contents.neutralized = true;
      state.selectedPiece = prevStrip.id;
      renderLab();
      return;
    }
    const prevSel = state.pieces.find((x) => x.id === state.selectedPiece);
    if (state.test === "iodine-leaf" && prevSel && prevSel.id !== p.id) {
      if (prevSel.kind === "tube" && (p.kind === "block" || p.kind === "tile")) {
        const leaf = p.kind === "block" ? p : leafOnHost(p);
        if (applyIodineFromTube(prevSel, leaf)) {
          renderLab();
          return;
        }
      }
      if (prevSel.kind === "block" && p.kind === "tube") {
        if (dipLeafInIodineTube(prevSel, p)) {
          renderLab();
          return;
        }
      }
    }
    state.selectedPiece = p.id;
    if (state.dropper.on) {
      if (p.kind === "tube") {
        if (state.dropper.fill && REAGENTS[state.dropper.fill]) addToTube(p, reagentAddPayload(state.dropper.fill));
        else if (state.dropper.fill) addToTube(p, foodAddPayload(state.dropper.fill));
      } else if (p.kind === "block") {
        if (state.dropper.fill === "iodine" && state.test !== "iodine-leaf") p.iodine = true;
        if ((state.dropper.fill === "alcohol" || state.dropper.fill === "ethanol") && p.boiled) {
          const alc = state.pieces.find((x) => x.kind === "beaker" && x.role === "alcohol");
          if (alc) applyLeafStation(p, alc);
        }
        if (state.dropper.fill === "water" && p.decolourised) p.washed = true;
      } else if ((p.kind === "tile" || p.kind === "beaker") && state.dropper.fill === "iodine" && state.test !== "iodine-leaf") {
        const leaf = state.pieces.find((x) => x.kind === "block" && x.dockedTo === p.id)
          || [...state.pieces].reverse().find((x) => x.kind === "block" && x.washed);
        if (leaf) {
          leaf.iodine = true;
          state.selectedPiece = leaf.id;
        }
      } else if (p.kind === "paper") {
        if ((state.dropper.fill === "ethanol" || state.dropper.fill === "alcohol") && p.dried && p.lit) p.solvent = true;
        else if (state.dropper.fill && foodById(state.dropper.fill)) {
          p.foodId = state.dropper.fill;
          p.dried = false;
          p.lit = false;
          p.solvent = false;
          p.rubbed = foodById(state.dropper.fill).form === "block";
        }
      } else if (p.kind === "strip" && state.dropper.fill && foodById(state.dropper.fill)) {
        dipStrip(p, state.dropper.fill);
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
  const labBtn = ev.target.closest("[data-lab]");
  if (labBtn) {
    setLab(labBtn.dataset.lab);
    return;
  }
  const foodPick = ev.target.closest("#food-list [data-food]");
  if (foodPick && (state.test === "energy" || state.test === "iodine-leaf" || (state.test === "iodine" && foodById(foodPick.dataset.food)?.form === "block"))) {
    const f = foodById(foodPick.dataset.food);
    if (f) {
      state.selectedFood = f.id;
      if (state.test === "energy") {
        if (energyFoodPlaced) {
          energyFoodPlaced = false;
          return;
        }
        useFoodOn(f, pickEnergyBurner(), true);
      } else if (state.test === "iodine-leaf") dropLeafIntoLab(f);
      else if (state.test === "iodine") useFoodOn(f, state.pieces.find((p) => p.kind === "tile") || null, true);
      renderLab();
    }
    return;
  }
  const iodineBtn = ev.target.closest("#apparatus [data-app=\"iodine\"]");
  if (iodineBtn && state.test === "iodine-leaf") {
    const tube = state.pieces.find((p) => p.id === state.selectedPiece && p.kind === "tube")
      || iodineTubeOnBench()
      || addPiece("tube", { x: 286, y: 8 });
    fillIodineTube(tube);
    renderLab();
    return;
  }
  const heat = ev.target.closest("[data-heat]");
  if (heat) {
    const bath = state.pieces.find((p) => p.id === heat.dataset.heat);
    if (bath && !isBathHeating(bath)) {
      applyHeat(bath);
      const leaf = state.pieces.find((p) => p.kind === "block" && (
        p.dockedTo === bath.id
        || state.pieces.some((h) => h.id === p.dockedTo && h.dockedTo === bath.id)
      ));
      if (leaf) state.selectedPiece = leaf.id;
      renderLab();
    }
    return;
  }
  const cool = ev.target.closest("[data-cool]");
  if (cool) {
    const tube = state.pieces.find((p) => p.id === cool.dataset.cool);
    if (tube?.contents) tube.contents.cooled = true;
    renderLab();
    return;
  }
  const dry = ev.target.closest("[data-dry]");
  if (dry) {
    const paper = state.pieces.find((p) => p.id === dry.dataset.dry);
    if (paper) paper.dried = true;
    renderLab();
    return;
  }
  const readDv = ev.target.closest("[data-read-dv]");
  if (readDv) {
    const b = state.pieces.find((p) => p.id === readDv.dataset.read);
    if (readEnergyDv(b, readDv.dataset.readDv)) {
      state.selectedPiece = b.id;
      renderLab();
    }
    return;
  }
  const burn = ev.target.closest("[data-burn]");
  if (burn) {
    const b = state.pieces.find((p) => p.id === burn.dataset.burn);
    if (b?.foodId) {
      b.burned = true;
      resetEnergyReads(b);
      state.selectedPiece = b.id;
      renderLab();
    }
    return;
  }
  const testBtn = ev.target.closest("[data-test]");
  if (testBtn) {
    if (state.embedLocked && testBtn.dataset.test !== state.embedLocked) return;
    state.test = testBtn.dataset.test;
    const t = testById(state.test);
    if (t.conc && state.conc[t.conc.key] == null) state.conc[t.conc.key] = t.conc.def;
    seedLab();
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
  const side = document.getElementById("lab-side");
  if (side) {
    side.addEventListener("change", (e) => {
      const ivSel = e.target.closest("[data-energy-iv]");
      if (ivSel) {
        state.energyIV = ivSel.value;
        renderLab();
        return;
      }
      const dvBox = e.target.closest("[data-energy-dv]");
      if (dvBox) {
        state.energyDVs = state.energyDVs || { dT: true, time: true };
        state.energyDVs[dvBox.dataset.energyDv] = dvBox.checked;
        renderLab();
        return;
      }
      const field = e.target.closest("[data-calo-field]");
      if (field) {
        const p = state.pieces.find((x) => x.id === field.dataset.calo);
        if (!p) return;
        const key = field.dataset.caloField;
        applyCaloField(p, key, key === "distance" ? field.value : Number(field.value));
        renderLab();
        return;
      }
    });
    side.addEventListener("input", (e) => {
      const sl = e.target.closest("[data-energy-scale]");
      if (sl) {
        state.energyScale = Number(sl.value);
        renderLab();
        return;
      }
      const field = e.target.closest("[data-calo-field]");
      if (!field) return;
      const p = state.pieces.find((x) => x.id === field.dataset.calo);
      if (!p) return;
      const key = field.dataset.caloField;
      if (key === "distance") return;
      applyCaloField(p, key, Number(field.value));
      refreshEnergyLive();
    });
  }
  document.getElementById("conc-slider").addEventListener("input", (e) => {
    const t = testById(state.test);
    if (!t.conc) return;
    state.conc[t.conc.key] = Number(e.target.value);
    renderConc();
    renderObs();
  });
  document.getElementById("btn-clear").addEventListener("click", () => {
    seedLab();
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
      dipStrip(strip, state.dropper.fill);
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

function applyQuery() {
  const q = new URLSearchParams(location.search);
  const testId = q.get("test");
  const embed = q.get("embed") === "1" || q.get("ppt") === "1";
  if (testId && testById(testId)) {
    const t = testById(testId);
    state.test = testId;
    state.testCat = t.cat;
    if (t.conc && state.conc[t.conc.key] == null) state.conc[t.conc.key] = t.conc.def;
    if (embed) {
      state.embedLocked = testId;
      document.documentElement.classList.add("ppt-embed");
    }
  }
}

function clearHeat() {
  if (heatTicker) {
    clearInterval(heatTicker);
    heatTicker = null;
  }
}

function seedLab() {
  clearHeat();
  state.pieces = [];
  state.selectedPiece = null;
  const t = testById(state.test);
  if (!t) return;
  if (t.id === "iodine-leaf") {
    addPiece("bath", { x: 8, y: 16 });
    addPiece("beaker", { role: "alcohol", x: 216, y: 8 });
    addPiece("beaker", { role: "rinse", x: 216, y: 172 });
    addPiece("tile", { x: 312, y: 172 });
    addPiece("tube", { x: 286, y: 8 });
    const bath = state.pieces.find((p) => p.kind === "bath");
    state.selectedPiece = bath ? bath.id : null;
    return;
  }
  if (t.extra.includes("bath")) addPiece("bath", { x: 16, y: 28 });
  if (t.id === "iodine") {
    addPiece("tile", { x: 24, y: 40 });
    addPiece("tube", { x: 168, y: 36 });
    return;
  }
  if (t.extra.includes("tube")) addPiece("tube", { x: 236, y: 40 });
  if (t.extra.includes("paper")) addPiece("paper", { x: 210, y: 48 });
  if (t.extra.includes("clinistix")) addPiece("strip", { strip: "clinistix", x: 210, y: 36 });
  if (t.extra.includes("albustix")) addPiece("strip", { strip: "albustix", x: 210, y: 36 });
  if (t.extra.includes("phpaper")) addPiece("strip", { strip: "phpaper", x: 300, y: 36 });
  if (t.extra.includes("burner")) addPiece("burner", { x: 24, y: 8 });
}

function setLab(id) {
  if (state.embedLocked && id !== state.embedLocked && id !== "bank") return;
  const lab = labById(id);
  if (!lab) return;
  if (lab.tab === "bank") {
    setTab("bank");
    return;
  }
  const t = testById(lab.id);
  if (!t) return;
  state.test = t.id;
  state.testCat = t.cat;
  if (t.conc && state.conc[t.conc.key] == null) state.conc[t.conc.key] = t.conc.def;
  setTab("lab");
  seedLab();
  renderLab();
}

function seedApparatus() {
  seedLab();
}

function init() {
  applyQuery();
  bind();
  seedLab();
  renderLab();
  renderBank();
}

init();
