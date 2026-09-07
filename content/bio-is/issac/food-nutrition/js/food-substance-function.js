(function () {
  const app = document.getElementById("app");
  const crumb = document.getElementById("crumb");

  const NUTRIENTS = [
    {
      id: "carb",
      name: "Carbohydrates",
      zh: "碳水化合物",
      accent: "carb",
      group: "primary",
      facts: [
        "Organic · C+H+O · H:O = 2:1",
        "~17 kJ/g",
        "e.g. glucose C₆H₁₂O₆"
      ],
      functions: [
        { id: "fuel", title: "Fast respiratory fuel", zh: "呼吸作用燃料", demo: "fuel", blurb: "Glucose is used first and fast.", text: "Glucose is the main respiratory fuel. It is FAST: absorbed directly and used for energy. That is why candy raises energy quickly compared with starch, which must be hydrolysed first." },
        { id: "store", title: "Energy storage", zh: "能量儲存", demo: "store", blurb: "Glycogen in animals, starch in plants.", text: "Polysaccharides store energy. Glycogen (肝醣) is stored in liver and muscles in animals. Starch (澱粉) is the storage form in plants (potato, grains)." },
        { id: "reserve", title: "Energy reserve in starvation", zh: "飢餓時的能量儲備", demo: "starvation", highlight: "glycogen", blurb: "Carbohydrates are used up first.", text: "In prolonged starvation the body uses carbohydrates first, then lipids, then proteins as last resort. Glycogen mass starts near 3.2 kg and is gone by about week 1.2." },
        { id: "sucrose", title: "Transport form in plants", zh: "植物運輸形式", demo: "sucrose", blurb: "Sucrose moves sugars through the plant.", text: "Sucrose is a non-reducing disaccharide and the transport form of carbohydrate in plants — sugars travel from leaves to other parts." },
        { id: "wall", title: "Support plant cell wall", zh: "支撐植物細胞壁", demo: "wall", blurb: "Cellulose bricks the wall.", text: "Cellulose is a structural polysaccharide in the plant cell wall. Plants make cellulose to support their own cells — not as a gift of fibre for humans." },
        { id: "fibre-human", title: "Dietary fibre in humans", zh: "膳食纖維", demo: "fibre-gut", blurb: "No energy, but gut movement and fullness.", text: "Humans have no enzyme to digest cellulose. It has no energy value, but gives a sense of fullness (飽) and promotes gut peristalsis (蠕動)." }
      ]
    },
    {
      id: "lipid",
      name: "Lipids",
      zh: "脂質",
      accent: "lipid",
      group: "primary",
      facts: [
        "Organic · C+H+O (+P in some)",
        "H:O > 2:1",
        "~37 kJ/g — about 2× carbs/proteins"
      ],
      functions: [
        { id: "energy", title: "Energy storage (2×)", zh: "能量儲存", demo: "energy2x", blurb: "Twice the energy per gram.", text: "Triglycerides store energy. Energy per gram is twice that of carbohydrates or proteins (~37 kJ/g vs ~17 kJ/g). Always ×2 before summing lipid energy. Plants store oils too (e.g. peanut oil)." },
        { id: "reserve", title: "Long-term reserve in starvation", zh: "長期能量儲備", demo: "starvation", highlight: "lipids", blurb: "After glycogen, lipids are the main fuel.", text: "After carbohydrates run out, lipids are the main long-term reserve. From week 0 to 4, lipid mass falls steadily from 10 kg toward about 2 kg." },
        { id: "heat", title: "Reduce heat loss", zh: "減少熱量散失", demo: "heat", blurb: "Subcutaneous fat traps heat.", text: "Subcutaneous fat (皮下脂肪) reduces heat loss. More lipid around the body traps heat inside; less fat lets more heat escape. Same tissue also stores energy and absorbs shock." },
        { id: "shock", title: "Organ protection", zh: "器官保護", demo: "shock", blurb: "Fat pads absorb shock.", text: "Fat around organs absorbs shock and protects them. Slide the padding: a thin coat lets the organ jolt; a thick coat cushions the hit." },
        { id: "nerve", title: "Insulating nerve", zh: "絕緣神經", demo: "nerve", blurb: "Lipid wraps stop the signal leaking.", text: "Lipids insulate nerves. A myelin-like lipid wrap keeps the impulse on the axon; without it the signal leaks and slows." },
        { id: "waterproof", title: "Waterproofing", zh: "防水", demo: "waterproof", blurb: "Non-polar lipids shed water.", text: "Lipids are insoluble in water (non-polar / hydrophobic). A lipid coat waterproofs surfaces so water beads and runs off instead of soaking in." },
        { id: "membrane", title: "Cell membrane bilayer", zh: "細胞膜雙層", demo: "membrane", blurb: "Hydrophilic heads, hydrophobic tails.", text: "Phospholipids have a hydrophilic (polar) head and hydrophobic (non-polar) tails → tail-to-tail bilayer. Cholesterol (a steroid) contributes to membrane fluidity. Phospholipids are the main component of cell membranes." },
        { id: "hormone", title: "Sex hormone precursor", zh: "性荷爾蒙前體", demo: "hormone", blurb: "Cholesterol → sex hormones.", text: "Steroids such as cholesterol are cell-membrane components and precursors for sex hormones (性荷爾蒙). The hormone binds a receptor and the cell responds." }
      ]
    },
    {
      id: "protein",
      name: "Proteins",
      zh: "蛋白質",
      accent: "prot",
      group: "primary",
      facts: [
        "Organic · C+H+O+N (+S in some)",
        "~17 kJ/g",
        "20 amino acids · 3D conformation"
      ],
      functions: [
        { id: "repair", title: "Growth and repair", zh: "生長與修復", demo: "repair", blurb: "Build muscle, skin, nails.", text: "Proteins are used for growth and repair of tissues — muscles, skin, nails. Different amino-acid sequences (set by DNA) fold into different structures and functions. Essential amino acids come only via food." },
        { id: "enzyme", title: "Enzymes catalyse reactions", zh: "酶催化反應", demo: "enzyme", blurb: "Shape = function. Heat/pH denature.", text: "Enzymes (酶) catalyse reactions. The active site is a 3D shape held by hydrogen bonds. Denaturation at high temperature (boiling) or sub-optimal pH is irreversible: loss of conformation = loss of function." },
        { id: "hormone", title: "Hormones", zh: "荷爾蒙", demo: "hormone", kind: "protein", blurb: "Bind a receptor → response.", text: "Most hormones in blood are proteins. They bind a receptor and trigger a response that regulates body functions." },
        { id: "antibody", title: "Antibodies", zh: "抗體", demo: "antibody", blurb: "Immune defence proteins.", text: "Antibodies (抗體) and antigens (抗原) are proteins. They are not antibiotics (抗生素). Antibody blocks bind matching antigen blocks." },
        { id: "channels", title: "Membrane proteins", zh: "細胞膜蛋白", demo: "channels", blurb: "Channels, carriers, receptors, antigens.", text: "Cell-membrane proteins include channels, receptors, carriers and antigens. They sit in the phospholipid bilayer and move or recognise specific substances." },
        { id: "last", title: "Last-resort energy", zh: "最後能量來源", demo: "starvation", highlight: "proteins", blurb: "Body preserves protein as long as it can.", text: "Proteins are the last resort in prolonged starvation. From week 0 to 4, protein mass only falls from 10 kg to about 8 kg — the body protects muscle and vital tissue." }
      ]
    },
    {
      id: "fibre",
      name: "Dietary fibre",
      zh: "膳食纖維",
      accent: "fibre",
      group: "protective",
      facts: [
        "Organic · no energy value",
        "Humans have no enzyme to digest it",
        "Cellulose (insoluble) · pectin (soluble)"
      ],
      functions: [
        { id: "peristalsis", title: "Help gut peristalsis", zh: "幫助腸胃蠕動", demo: "fibre-gut", blurb: "Absorb water, add bulk to faeces.", text: "Insoluble fibre (cellulose in plant cell walls) absorbs water and adds bulk to faeces, helping peristalsis. Deficiency: constipation, and longer toxin retention raises colorectal cancer risk." },
        { id: "full", title: "Sense of fullness", zh: "飽腹感", demo: "full", blurb: "Feel full with no energy intake.", text: "Fibre helps weight control by giving a sense of fullness (feel full but no energy intake). Plants did not make cellulose for our diet — we happen to eat cell walls." }
      ]
    },
    {
      id: "water",
      name: "Water",
      zh: "水",
      accent: "water",
      group: "protective",
      facts: [
        "Inorganic · H₂O",
        "Reactant · solvent · support · transport",
        "High latent heat · high specific heat"
      ],
      functions: [
        { id: "reactant", title: "Reactant", zh: "反應物", demo: "hydrolysis", blurb: "Used in hydrolysis and photosynthesis.", text: "Water is a reactant (反應物), e.g. hydrolysis (gain 1 H₂O per bond broken) and photosynthesis." },
        { id: "solvent", title: "Solvent", zh: "溶劑", demo: "solvent", blurb: "Medium for reactions in cytoplasm.", text: "Water is the solvent (溶劑) — the medium where chemical reactions take place, e.g. in cytoplasm (細胞質)." },
        { id: "support", title: "Support", zh: "支撐", demo: "support", blurb: "Buoyancy in animals, turgor in plants.", text: "In animals, water provides support and buoyancy (浮力). In plants, water in vacuoles (液泡) keeps the stem erect via turgidity (膨脹)." },
        { id: "transport", title: "Transport", zh: "運輸", demo: "transport", blurb: "Blood in humans; xylem stream in plants.", text: "In humans, blood is mainly water and circulates. In plants, water plus sugars and dissolved minerals is transported from roots to leaves." },
        { id: "latent", title: "High latent heat", zh: "高潛熱", demo: "sweat", blurb: "Sweating absorbs much heat.", text: "High latent heat capacity (潛熱) makes water a good cooling (冷卻) agent: sweating absorbs much heat during evaporation." },
        { id: "specific", title: "High specific heat", zh: "高比熱容", demo: "specific", blurb: "Internal temperature stays steady.", text: "High specific heat capacity (比熱容) keeps a rather constant internal environment — water temperature changes little even when much energy is supplied." }
      ]
    },
    {
      id: "vitamin",
      name: "Vitamins",
      zh: "維生素",
      accent: "vit",
      group: "protective",
      facts: [
        "Organic · no energy value",
        "Needed in small amounts",
        "A & D fat-soluble · C water-soluble"
      ],
      functions: [
        { id: "a-vision", title: "Vitamin A — dim-light vision", zh: "視紫素", demo: "vision", blurb: "Visual purple in rod cells.", text: "Vitamin A is needed to form visual purple (視紫素) for vision in dim light (rod cells). Deficiency: night blindness (夜盲症), drying of eye and skin, thickened cornea." },
        { id: "a-linings", title: "Vitamin A — skin and linings", zh: "皮膚與內壁", demo: "linings", blurb: "Keeps linings healthy.", text: "Vitamin A keeps skin and the linings of the alimentary canal and breathing system healthy. It is fat-soluble, absorbed with fats, stored in liver and fat tissues." },
        { id: "c-connect", title: "Vitamin C — connective tissue", zh: "結締組織", demo: "wound", blurb: "C for connective tissue.", text: "Vitamin C is needed for growth and repair of connective tissues (結締組織) — healing wounds, healthy skin and gums (牙齦). Deficiency: scurvy (壞血病). Heat destroys vitamin C!" },
        { id: "c-dcpip", title: "Vitamin C — DCPIP test", zh: "DCPIP 試驗", demo: "dcpip", blurb: "More vitamin C → fewer drops.", text: "DCPIP test: blue to colourless. Greater vitamin C concentration, fewer drops needed to decolorize a fixed volume. Hot lemon tea has less vitamin C than cold, so it needs more drops." },
        { id: "d-absorb", title: "Vitamin D — absorb Ca & phosphate", zh: "促進鈣磷吸收", demo: "dabsorb", blurb: "Not a component of bones and teeth.", text: "Vitamin D promotes calcium and phosphate absorption. It is not a component of bones and teeth. Without it, Ca/P stay in the gut and rickets / osteoporosis follow." },
        { id: "d-sun", title: "Vitamin D — made in skin", zh: "陽光合成", demo: "sun", blurb: "Synthesised under sunlight.", text: "Vitamin D is synthesised in skin under sunlight, and also absorbed with fats in the small intestine. Stored in liver and fat tissues. Indoor people need more vitamin D." }
      ]
    },
    {
      id: "mineral",
      name: "Minerals",
      zh: "礦物質",
      accent: "min",
      group: "protective",
      facts: [
        "Inorganic · no energy value",
        "Needed in small amounts",
        "Regulate metabolism · build tissues"
      ],
      functions: [
        { id: "ca-bone", title: "Calcium — bones and teeth", zh: "骨骼與牙齒成分", demo: "bone", blurb: "★Component★ of bones and teeth (99% stored there).", text: "Calcium is a component of bones and teeth (99% stored there). Absorption is enhanced by vitamin D. Deficiency: rickets (佝僂病) in children — bent legs; osteoporosis (骨質疏鬆) in adults. Excess: kidney stones." },
        { id: "ca-other", title: "Calcium — muscle, nerve, clotting", zh: "肌肉、神經、凝血", demo: "clot", blurb: "Also enzyme activation.", text: "Calcium is also needed for muscle contraction, nerve impulse transmission, blood clotting, and enzyme activation." },
        { id: "fe-o2", title: "Iron — oxygen transport", zh: "氧氣運輸", demo: "iron", blurb: "Part of haemoglobin.", text: "Iron (Fe²⁺) is for oxygen transport as part of haemoglobin (血紅蛋白), the oxygen-carrying protein in red blood cells. Stored in the liver. Deficiency: anaemia (貧血) — fatigue, pale skin, weakness. Excess: liver damage." },
        { id: "fe-enzyme", title: "Iron — enzyme activation", zh: "酶活化", demo: "fe-enzyme", blurb: "Helps enzymes work.", text: "Iron also activates enzymes. Without enough iron, metabolic reactions that need those enzymes slow down." }
      ]
    },
    {
      id: "ion",
      name: "Inorganic ions",
      zh: "無機離子",
      accent: "ion",
      group: "protective",
      facts: [
        "Inorganic",
        "Nitrate · Mg²⁺ · phosphorus · iodine"
      ],
      functions: [
        { id: "iodine", title: "Iodine — thyroid hormone", zh: "甲狀腺激素", demo: "thyroid", blurb: "Regulates metabolism.", text: "Iodine (I⁻) is needed for thyroid (甲狀腺) hormone synthesis and regulation of metabolism. Deficiency: goitre (enlarged thyroid) 甲狀腺腫大. Excess: thyroid problems." },
        { id: "p", title: "Phosphorus — bones & phospholipids", zh: "磷", demo: "phos", blurb: "Phosphate groups and hard tissues.", text: "Phosphorus is a component of the phosphate group (e.g. in phospholipids) and is needed for bone and teeth formation. Deficiency: weak bones and teeth." },
        { id: "mg", title: "Magnesium — chlorophyll", zh: "鎂", demo: "chloro", blurb: "Green pigment needs Mg²⁺.", text: "Magnesium (Mg²⁺) is needed for chlorophyll production and for enzyme activation in animals. Deficiency: yellowing in plants." },
        { id: "nitrate", title: "Nitrate — plant protein", zh: "硝酸鹽", demo: "nitrate", blurb: "N in the amino group.", text: "Nitrate (NO₃⁻) is used for protein synthesis in plants (N in the amino group) and chlorophyll production. Deficiency: poor plant growth and yellowing of leaves." }
      ]
    },
    {
      id: "na",
      name: "Nucleic acids",
      zh: "核酸",
      accent: "na",
      group: "other",
      facts: [
        "Organic · contain CHONP",
        "Nucleotide = sugar + phosphate + base",
        "DNA stores code · RNA helps make protein"
      ],
      functions: [
        { id: "dna", title: "DNA stores genetic information", zh: "遺傳資訊儲存", demo: "dna", blurb: "Double helix, A–T and C–G.", text: "DNA is a double-stranded nucleotide polymer (A–T, C–G) held by hydrogen bonds. Functions: genetic information storage and genetic code carrier. More stable than RNA. Sugar: deoxyribose." },
        { id: "rna", title: "RNA — protein synthesis", zh: "蛋白質合成", demo: "rna", blurb: "mRNA and tRNA.", text: "RNA is single-stranded (A–U, C–G), sugar ribose. It is involved in protein synthesis and gene-expression regulation. Location: nucleus and cytoplasm." },
        { id: "code", title: "Base sequence → protein", zh: "鹼基序列決定蛋白質", demo: "code", blurb: "DNA sequence sets amino-acid sequence.", text: "Base sequence on DNA → amino-acid sequence in the polypeptide → determines protein structure and function. Complementary pairing: A 2 H-bonds with T; C 3 H-bonds with G." }
      ]
    }
  ];

  const GROUPS = [
    { id: "primary", title: "Primary food substances", note: "Supply energy. Carbohydrates / proteins ~17 kJ/g · lipids ~37 kJ/g (~2×)." },
    { id: "protective", title: "Protective food substances", note: "No energy value (except water’s roles). Needed to regulate metabolism and build tissues." },
    { id: "other", title: "Also organic in the notes", note: "Nucleic acids contain CHONP — not an energy food, but the notes cover their functions." }
  ];

  function personMarkup() {
    return `<div class="person">
      <div class="fat-coat" hidden></div>
      <div class="blk head">
        <i class="eye l"></i><i class="eye r"></i>
        <i class="mouth"></i>
        <i class="drip"></i><i class="drip2"></i>
        <i class="collagen" hidden></i>
      </div>
      <div class="blk neck"></div>
      <div class="blk torso"></div>
      <div class="blk arm l"></div>
      <div class="blk arm r"></div>
      <div class="blk leg l"></div>
      <div class="blk leg r"></div>
    </div>`;
  }

  function thermoMarkup(id) {
    return `<div class="thermo" id="${id}">
      <div class="th-read">37.0°C</div>
      <div class="th-tube"><i class="th-fill"></i></div>
      <div class="th-bulb"></div>
    </div>`;
  }

  function setThermo(root, celsius, min, max) {
    if (!root) return;
    const fill = root.querySelector(".th-fill");
    const read = root.querySelector(".th-read");
    const pct = Math.max(0, Math.min(1, (celsius - min) / (max - min)));
    fill.style.height = (8 + pct * 92) + "%";
    read.textContent = celsius.toFixed(1) + "°C";
  }

  function skeletonMarkup() {
    return `<div class="skel" id="skel">
      <div class="blk skull"></div>
      <div class="blk teeth"></div>
      <div class="blk spine"></div>
      <div class="blk rib a"></div>
      <div class="blk rib b"></div>
      <div class="blk rib c"></div>
      <div class="blk arm l"></div>
      <div class="blk arm r"></div>
      <div class="blk pelvis"></div>
      <div class="blk leg l"></div>
      <div class="blk leg r"></div>
      <i class="crack" style="left:90px;top:100px"></i>
      <i class="crack" style="left:70px;top:250px"></i>
      <i class="crack" style="left:110px;top:160px"></i>
      <i class="crack" style="left:64px;top:310px"></i>
      <i class="tear-gap" style="left:82px;top:118px;width:18px;height:4px"></i>
      <i class="tear-gap" style="left:96px;top:268px;width:4px;height:22px"></i>
      <i class="tear-gap" style="left:70px;top:88px;width:14px;height:4px"></i>
      <i class="scar" style="left:78px;top:140px;width:16px;height:5px;transform:rotate(-25deg)"></i>
      <i class="scar" style="left:108px;top:240px;width:18px;height:5px;transform:rotate(18deg)"></i>
      <i class="scar" style="left:66px;top:300px;width:14px;height:5px;transform:rotate(-12deg)"></i>
    </div>`;
  }

  function plantConnMarkup() {
    return `<div class="plant-conn" id="pl">
      <div class="blk pot"></div>
      <div class="blk stem"></div>
      <div class="larm left" data-side="L" style="left:8px;bottom:180px">
        <div class="leaf"></div><i class="yspot" style="left:8px;top:6px"></i><i class="yspot" style="left:28px;top:12px"></i>
      </div>
      <div class="larm" data-side="R" style="left:90px;bottom:210px">
        <div class="leaf"></div><i class="yspot" style="left:10px;top:4px"></i><i class="yspot" style="left:36px;top:10px"></i>
      </div>
      <div class="larm left" data-side="L" style="left:8px;bottom:120px">
        <div class="leaf"></div><i class="yspot" style="left:16px;top:8px"></i>
      </div>
      <div class="larm" data-side="R" style="left:90px;bottom:140px">
        <div class="leaf"></div><i class="yspot" style="left:22px;top:6px"></i>
      </div>
    </div>`;
  }

  function parseHash() {
    const raw = (location.hash || "#").replace(/^#/, "").replace(/^\//, "");
    const [nid, fid] = raw.split("/").filter(Boolean);
    return { nid, fid };
  }

  function go(nid, fid) {
    location.hash = fid ? `#/${nid}/${fid}` : nid ? `#/${nid}` : "#/";
  }

  function findNutrient(id) {
    return NUTRIENTS.find((n) => n.id === id);
  }

  function findFn(n, id) {
    return n && n.functions.find((f) => f.id === id);
  }

  function setCrumb(parts) {
    crumb.innerHTML = "";
    parts.forEach((p, i) => {
      if (i) {
        const sep = document.createElement("span");
        sep.className = "sep";
        sep.textContent = "/";
        crumb.appendChild(sep);
      }
      if (p.on) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = p.label;
        b.addEventListener("click", p.on);
        crumb.appendChild(b);
      } else {
        const s = document.createElement("span");
        s.textContent = p.label;
        crumb.appendChild(s);
      }
    });
  }

  function sliderCtrl(panel, label, min, max, step, value, oninput) {
    const wrap = document.createElement("div");
    wrap.className = "ctrl";
    wrap.innerHTML = `<label><span>${label}</span><span class="val"></span></label>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" />`;
    const input = wrap.querySelector("input");
    const val = wrap.querySelector(".val");
    const fire = () => {
      val.textContent = input.value;
      oninput(Number(input.value));
    };
    input.addEventListener("input", fire);
    const cap = panel.querySelector("#live-cap");
    if (cap) panel.insertBefore(wrap, cap);
    else panel.appendChild(wrap);
    fire();
    return input;
  }

  function stepsCtrl(panel, labels, onstep) {
    const row = document.createElement("div");
    row.className = "step-row";
    labels.forEach((lab, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = lab;
      b.addEventListener("click", () => {
        [...row.children].forEach((x) => x.setAttribute("aria-current", "false"));
        b.setAttribute("aria-current", "true");
        onstep(i);
      });
      row.appendChild(b);
    });
    const cap = panel.querySelector("#live-cap");
    if (cap) panel.insertBefore(row, cap);
    else panel.appendChild(row);
    row.children[0].click();
    return row;
  }

  function panelShell(panel, fn, extraLead) {
    panel.innerHTML = "";
    const h = document.createElement("h2");
    h.textContent = "From the notes";
    panel.appendChild(h);
    const lead = document.createElement("p");
    lead.className = "lead";
    lead.textContent = extraLead || fn.text;
    panel.appendChild(lead);
    const cap = document.createElement("p");
    cap.className = "caption";
    cap.id = "live-cap";
    panel.appendChild(cap);
    return cap;
  }

  function live(text) {
    const el = document.getElementById("live-cap");
    if (el) el.textContent = text;
  }

  function showPhoto(stage, panel, fn, src, alt, caption) {
    stage.innerHTML = `<div class="photo-stage">
      <img class="photo-model" src="${src}" alt="${alt}" />
    </div>`;
    panelShell(panel, fn);
    live(caption);
  }

  function embedTool(stage, src, title) {
    stage.classList.add("stage-embed");
    stage.innerHTML = `<iframe class="tool-frame" src="${src}" title="${title}" allow="autoplay; fullscreen"></iframe>`;
    stage._cleanup = () => {
      const frame = stage.querySelector("iframe");
      if (frame) frame.src = "about:blank";
      stage.classList.remove("stage-embed");
    };
  }

  function spawnHeats(box, n, escaping) {
    box.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const h = document.createElement("div");
      h.className = "heat" + (escaping ? " escape" : "");
      h.style.left = 72 + (i % 4) * 16 + "px";
      h.style.top = 110 + Math.floor(i / 4) * 18 + "px";
      h.style.animationDelay = (i * 0.12) + "s";
      box.appendChild(h);
    }
  }

  function addCleanup(stage, fn) {
    const prev = stage._cleanup;
    stage._cleanup = () => {
      try { fn(); } finally { if (typeof prev === "function") prev(); }
    };
  }

  function runLoop(stage, tick) {
    let raf = 0;
    const t0 = performance.now();
    const frame = (now) => {
      tick((now - t0) / 1000, now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    addCleanup(stage, () => cancelAnimationFrame(raf));
  }

  function stepLabels(panel, labels) {
    const row = document.createElement("div");
    row.className = "step-row";
    labels.forEach((lab) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = lab;
      b.tabIndex = -1;
      row.appendChild(b);
    });
    const cap = panel.querySelector("#live-cap");
    if (cap) panel.insertBefore(row, cap);
    else panel.appendChild(row);
    return {
      set(i) {
        [...row.children].forEach((x, j) => x.setAttribute("aria-current", j === i ? "true" : "false"));
      }
    };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  const demos = {
    heat(stage, panel, fn) {
      stage.innerHTML = `<div class="scene"><span class="scene-label">Subcutaneous fat · 皮下脂肪</span>${personMarkup()}</div>`;
      const person = stage.querySelector(".person");
      const heats = document.createElement("div");
      heats.id = "heats";
      person.appendChild(heats);
      const coat = person.querySelector(".fat-coat");
      if (coat) coat.remove();
      const parts = person.querySelectorAll(".blk");
      panelShell(panel, fn);
      sliderCtrl(panel, "Lipid around body", 0, 10, 1, 8, (v) => {
        const cold = (10 - v) / 10;
        const r = Math.round(220 - cold * 100);
        const g = Math.round(220 - cold * 50);
        const b = Math.round(220 + cold * 35);
        parts.forEach((el) => { el.style.background = `rgb(${r},${g},${b})`; });
        if (v < 7) {
          person.classList.add("shivering");
        } else {
          person.classList.remove("shivering");
        }
        spawnHeats(heats, v >= 6 ? 6 : 14, v < 6);
        live(v < 4
          ? "Little lipid — body turns blue, shivers fast, heat leaves quickly."
          : v < 7
            ? "Some fat — shivering slows as more heat is kept in."
            : "Enough subcutaneous fat — heat stays in, no shivering.");
      });
    },

    starvation(stage, panel, fn) {
      stage.innerHTML = `<div class="scene" style="overflow:auto">
        <div class="stacks" id="stacks"></div>
        <img class="graph-img" src="./assets/prolonged-starvation.png" alt="Prolonged starvation graph: carbohydrates then lipids then proteins as last resort" />
      </div>`;
      panelShell(panel, fn);
      const stacks = stage.querySelector("#stacks");
      const hi = fn.highlight;

      function mass(week) {
        return {
          glycogen: Math.max(0, +(3.2 * Math.max(0, 1 - week / 1.2)).toFixed(2)),
          lipids: Math.max(0, +(10 - 2 * week).toFixed(2)),
          proteins: Math.max(0, +(10 - 0.5 * week).toFixed(2))
        };
      }

      function draw(week) {
        const m = mass(week);
        const cols = [
          { key: "glycogen", name: "Glycogen", cls: "glycogen", max: 4 },
          { key: "lipids", name: "Lipids", cls: "lipid", max: 10 },
          { key: "proteins", name: "Proteins", cls: "protein", max: 10 }
        ];
        stacks.innerHTML = cols.map((c) => {
          const n = Math.round(c.key === "glycogen" ? m.glycogen : m[c.key]);
          const on = hi === c.key || (hi === "glycogen" && c.key === "glycogen") || (hi === "lipids" && c.key === "lipids") || (hi === "proteins" && c.key === "proteins");
          const units = Array.from({ length: c.max }, (_, i) =>
            `<div class="unit ${c.cls}" style="opacity:${i < n ? (on ? 1 : 0.55) : 0.12}"></div>`
          ).join("");
          return `<div class="stack"><div class="col">${units}</div><div class="lbl">${c.name}</div><div class="kg">${m[c.key]} kg</div></div>`;
        }).join("");
        live(`Week ${week}: glycogen ${m.glycogen} kg → lipids ${m.lipids} kg → proteins ${m.proteins} kg (last resort).`);
      }

      sliderCtrl(panel, "Duration of starvation (week)", 0, 4, 0.1, 0, draw);
    },

    fuel(stage, panel, fn) {
      stage.innerHTML = `<div class="fuel-demo">
        <div class="fuel-lane">
          <h4>Glucose · used at once</h4>
          <div class="fuel-track" id="track-g"></div>
          ${personMarkup()}
          <div class="mouth-box" title="mouth"></div>
          <div class="energy-meter"><i id="em-g"></i><span id="ep-g">0%</span></div>
        </div>
        <div class="fuel-lane">
          <h4>Starch · hydrolyse first</h4>
          <div class="fuel-track" id="track-s"></div>
          ${personMarkup()}
          <div class="mouth-box" title="mouth"></div>
          <div class="energy-meter"><i id="em-s"></i><span id="ep-s">0%</span></div>
        </div>
      </div>`;
      panelShell(panel, fn, "Glucose is already a single sugar, so it enters cells and is respired at once. Starch is a chain — it must be hydrolysed to glucose before it can fuel respiration. Watch the left person fill with energy first.");
      const trackG = stage.querySelector("#track-g");
      const trackS = stage.querySelector("#track-s");
      const emG = stage.querySelector("#em-g");
      const emS = stage.querySelector("#em-s");
      const epG = stage.querySelector("#ep-g");
      const epS = stage.querySelector("#ep-s");
      stage.querySelectorAll(".fuel-lane .mouth").forEach((m) => { m.style.opacity = "0"; });
      const steps = stepLabels(panel, ["Eat", "Glucose in blood", "Starch still a chain", "Glucose already used"]);
      const gBits = Array.from({ length: 8 }, (_, i) => {
        const el = document.createElement("div");
        el.className = "bit";
        trackG.appendChild(el);
        return { el, i };
      });
      const sBits = Array.from({ length: 6 }, (_, i) => {
        const el = document.createElement("div");
        el.className = "bit chain";
        trackS.appendChild(el);
        return { el, i };
      });
      const cut = document.createElement("div");
      cut.className = "scissor";
      trackS.appendChild(cut);

      function energyAt(t, delay, speed) {
        return Math.max(0, Math.min(100, (t - delay) * speed));
      }

      runLoop(stage, (sec) => {
        const t = sec % 8;
        const gE = energyAt(t, 0.4, 28);
        const sE = energyAt(t, 3.2, 18);
        emG.style.width = gE + "%";
        emS.style.width = sE + "%";
        epG.textContent = Math.round(gE) + "%";
        epS.textContent = Math.round(sE) + "%";
        gBits.forEach((b) => {
          const start = 0.15 * b.i;
          const p = Math.max(0, Math.min(1, (t - start) / 1.6));
          b.el.style.left = lerp(12, 50, p) + "%";
          b.el.style.top = lerp(56, 132, p) + "px";
          b.el.style.opacity = p >= 0.96 ? "0" : "1";
        });
        sBits.forEach((b) => {
          const split = t > 1.4 + b.i * 0.35;
          const p = split ? Math.max(0, Math.min(1, (t - 1.4 - b.i * 0.35) / 2.2)) : 0;
          b.el.style.left = (split ? lerp(12 + b.i * 10, 50, p) : 10 + b.i * 11) + "%";
          b.el.style.top = (split ? lerp(64, 132, p) : 58) + "px";
          b.el.style.opacity = p >= 0.96 ? "0" : "1";
        });
        cut.style.left = "22%";
        cut.style.top = (t > 1.2 && t < 4.2) ? 48 + ((t * 40) % 36) + "px" : "48px";
        cut.style.opacity = t > 1.2 && t < 4.5 ? "1" : "0.15";
        const si = t < 0.8 ? 0 : t < 2.2 ? 1 : t < 3.4 ? 2 : 3;
        steps.set(si);
        live(si === 0
          ? "Food moves to the white mouth. It disappears on contact."
          : si === 1
            ? "Glucose has entered — energy bar on the left rises at once."
            : si === 2
              ? "Starch is hydrolysed (cut), then the pieces go to the mouth and vanish."
              : "Glucose has already powered respiration. Starch is only now releasing glucose.");
      });
    },

    store(stage, panel, fn) {
      stage.innerHTML = `<div class="store-layout">
        <div class="pct-rail"><div class="pct-fill" id="sf"></div><div class="pct-num" id="sn">0%</div><div class="pct-cap">Energy stored</div></div>
        <div class="compare">
          <div class="side"><h4>Animal · glycogen</h4><div class="stacks" id="a" style="height:380px;padding-top:48px"></div></div>
          <div class="side"><h4>Plant · starch</h4><div class="stacks" id="p" style="height:380px;padding-top:48px"></div></div>
        </div>
      </div>`;
      panelShell(panel, fn);
      const fillEl = stage.querySelector("#sf");
      const numEl = stage.querySelector("#sn");
      function fill(el, n, cls, label) {
        el.innerHTML = `<div class="stack"><div class="col">${Array.from({ length: 8 }, (_, i) =>
          `<div class="unit ${cls}" style="opacity:${i < n ? 1 : 0.12}"></div>`).join("")}</div><div class="lbl">${label}</div></div>`;
      }
      sliderCtrl(panel, "Stored carbohydrate", 0, 8, 1, 6, (v) => {
        const pct = Math.round((v / 8) * 100);
        fillEl.style.height = pct + "%";
        numEl.textContent = pct + "%";
        fill(stage.querySelector("#a"), v, "glycogen", "Liver & muscle");
        fill(stage.querySelector("#p"), v, "glycogen", "Potato / grains");
        live(pct + "% of the carbohydrate energy store is filled. More blocks = more energy stored for later.");
      });
    },

    sucrose(stage, panel, fn) {
      stage.innerHTML = `<div class="sucrose-layout">
        <div class="scene" style="min-height:0">
          <span class="scene-label">Plant · source → sink</span>
          <div class="plant">
            <div class="blk leaf a"></div><div class="blk leaf b"></div>
            <div class="blk stem"></div><div class="blk pot"></div>
            <div class="sugar" id="s1"></div>
          </div>
        </div>
        <div class="phloem-cut">
          <div class="cs-title">Vertical cross-section of stem</div>
          <div class="layer xylem"></div>
          <div class="layer phloem" id="phloem"></div>
          <span class="lab" style="left:22%;bottom:18px">Xylem</span>
          <span class="lab" style="left:56%;bottom:18px">Phloem</span>
        </div>
      </div>`;
      const s = stage.querySelector("#s1");
      const phloem = stage.querySelector("#phloem");
      const dots = Array.from({ length: 5 }, () => {
        const d = document.createElement("div");
        d.className = "sugar";
        d.style.left = "30%";
        phloem.appendChild(d);
        return d;
      });
      panelShell(panel, fn);
      runLoop(stage, (sec) => {
        const t = (sec * 18) % 100;
        s.style.left = "84px";
        s.style.bottom = (200 - t * 1.6) + "px";
        if (t > 90) s.style.bottom = "40px";
        dots.forEach((d, i) => {
          const y = ((sec * 70 + i * 48) % 280);
          d.style.top = y + "px";
          d.style.left = (28 + (i % 2) * 18) + "%";
        });
        live("Sucrose is loaded in the leaf, then travels down sieve tubes in the phloem (yellow tube). Xylem is the water path, not the sugar path.");
      });
    },

    wall(stage, panel, fn) {
      stage.innerHTML = `<div class="scene"><span class="scene-label">Plant tissue · cellulose walls</span>
        <div class="tissue" id="tissue"></div>
      </div>`;
      const tissue = stage.querySelector("#tissue");
      panelShell(panel, fn);
      const layout = [
        { x: 8, y: 8 }, { x: 36, y: 8 }, { x: 64, y: 8 },
        { x: 8, y: 52 }, { x: 36, y: 52 }, { x: 64, y: 52 }
      ];
      function seeded(i, k) {
        const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
        return x - Math.floor(x);
      }
      sliderCtrl(panel, "Cellulose in wall", 0, 10, 1, 8, (v) => {
        const weak = v < 5;
        tissue.innerHTML = "";
        layout.forEach((pos, i) => {
          const cell = document.createElement("div");
          cell.className = "pcell";
          const jitterX = weak ? (seeded(i, 1) - 0.5) * 10 : 0;
          const jitterY = weak ? (seeded(i, 2) - 0.5) * 10 : 0;
          const size = weak ? 22 + seeded(i, 3) * 10 : 26;
          cell.style.left = (pos.x + jitterX) + "%";
          cell.style.top = (pos.y + jitterY) + "%";
          cell.style.width = size + "%";
          cell.style.height = "40%";
          cell.style.borderWidth = (2 + v) + "px";
          if (weak) {
            cell.style.borderRadius = `${40 + seeded(i, 4) * 30}% ${35 + seeded(i, 5) * 30}% ${45 + seeded(i, 6) * 25}% ${30 + seeded(i, 7) * 35}%`;
            cell.style.borderColor = "#4a3b22";
            cell.style.background = "#d5dcc8";
            cell.style.transform = `rotate(${(seeded(i, 8) - 0.5) * 16}deg) scale(${0.9 + seeded(i, 9) * 0.25})`;
          } else {
            cell.style.borderRadius = "0";
            cell.style.borderColor = "#6b7c3a";
            cell.style.background = "#e8f5e9";
            cell.style.transform = "none";
          }
          const proto = document.createElement("div");
          proto.className = "proto";
          proto.style.left = "28%";
          proto.style.top = "28%";
          proto.style.width = "36%";
          proto.style.height = "36%";
          cell.appendChild(proto);
          const fibers = weak ? 5 : 10;
          for (let f = 0; f < fibers; f++) {
            const fib = document.createElement("div");
            fib.className = "fiber";
            if (weak) {
              fib.style.left = (8 + seeded(i, 20 + f) * 70) + "%";
              fib.style.top = (8 + seeded(i, 30 + f) * 70) + "%";
              fib.style.width = (10 + seeded(i, 40 + f) * 18) + "px";
              fib.style.height = "4px";
              fib.style.transform = `rotate(${seeded(i, 50 + f) * 180}deg)`;
              fib.style.opacity = "0.7";
            } else {
              const horiz = f % 2 === 0;
              fib.style.left = horiz ? "6%" : (10 + f * 8) + "%";
              fib.style.top = horiz ? (12 + f * 8) + "%" : "8%";
              fib.style.width = horiz ? "88%" : "4px";
              fib.style.height = horiz ? "3px" : "84%";
              fib.style.opacity = "0.45";
            }
            cell.appendChild(fib);
          }
          if (weak) {
            const tears = 2 + Math.floor(seeded(i, 60) * 3);
            for (let t = 0; t < tears; t++) {
              const tear = document.createElement("div");
              tear.className = "tear";
              tear.style.left = (6 + seeded(i, 70 + t) * 70) + "%";
              tear.style.top = (8 + seeded(i, 80 + t) * 65) + "%";
              tear.style.width = (10 + seeded(i, 90 + t) * 18) + "px";
              tear.style.height = (8 + seeded(i, 100 + t) * 16) + "px";
              tear.style.borderRadius = (seeded(i, 110 + t) * 40) + "%";
              tear.style.transform = `rotate(${seeded(i, 120 + t) * 50}deg)`;
              cell.appendChild(tear);
            }
            const stains = 1 + Math.floor(seeded(i, 61) * 2);
            for (let t = 0; t < stains; t++) {
              const stain = document.createElement("div");
              stain.className = "stain";
              stain.style.left = (10 + seeded(i, 130 + t) * 60) + "%";
              stain.style.top = (12 + seeded(i, 140 + t) * 55) + "%";
              stain.style.width = (12 + seeded(i, 150 + t) * 20) + "px";
              stain.style.height = (10 + seeded(i, 160 + t) * 18) + "px";
              stain.style.borderRadius = "40%";
              cell.appendChild(stain);
            }
          }
          tissue.appendChild(cell);
        });
        live(weak
          ? "Low cellulose — walls tear and gap, fibrils clump, cells swell into balloons, dark stained patches appear."
          : "Enough cellulose — walls stay square and densely interwoven, tissue holds shape.");
      });
    },

    "fibre-gut"(stage, panel, fn) {
      stage.innerHTML = `<div class="scene"><span class="scene-label">Gut tube</span>
        <div class="gut"><div class="wave" id="wave"></div><div class="bolus" id="bolus"></div></div>
      </div>`;
      const bolus = stage.querySelector("#bolus");
      const wave = stage.querySelector("#wave");
      panelShell(panel, fn);
      sliderCtrl(panel, "Dietary fibre", 0, 10, 1, 7, (v) => {
        bolus.style.height = 18 + v * 4 + "px";
        bolus.style.top = "80px";
        wave.style.animationDuration = (2.8 - v * 0.16) + "s";
        live(v < 3
          ? "Little fibre — small bulk, slow peristalsis → constipation risk."
          : "Fibre adds bulk and water. Waves push faeces along.");
      });
    },

    energy2x(stage, panel, fn) {
      stage.innerHTML = `<div class="store-layout">
        <div class="pct-rail">
          <div class="pct-fill lipid" id="lf-l"></div>
          <div class="pct-fill carb" id="lf-c"></div>
          <div class="pct-num" id="ln">0%</div>
          <div class="pct-legend">orange carb<br>green lipid</div>
          <div class="pct-cap">Energy stored</div>
        </div>
        <div class="compare">
          <div class="side"><h4>Carbohydrate store</h4><div class="energy-bar" id="c" style="left:50%;bottom:80px;width:48px"></div><div class="scene-label" style="left:0;right:0;top:auto;bottom:40px;text-align:center" id="cl">~17 kJ/g</div></div>
          <div class="side"><h4>Lipid store</h4><div class="energy-bar" id="l" style="left:50%;bottom:80px;width:48px;background:var(--lipid);border-color:#145c22"></div><div class="scene-label" style="left:0;right:0;top:auto;bottom:40px;text-align:center" id="ll">~37 kJ/g · ×2</div></div>
        </div>
      </div>`;
      panelShell(panel, fn);
      const c = stage.querySelector("#c");
      const l = stage.querySelector("#l");
      const carbFill = stage.querySelector("#lf-c");
      const lipFill = stage.querySelector("#lf-l");
      const numEl = stage.querySelector("#ln");
      carbFill.style.bottom = "0";
      lipFill.style.bottom = "0";
      sliderCtrl(panel, "Amount stored (g)", 0, 8, 1, 4, (g) => {
        const carbKj = g * 17;
        const lipKj = g * 37;
        const maxKj = 8 * 54;
        const carbH = (carbKj / maxKj) * 100;
        const lipH = (lipKj / maxKj) * 100;
        carbFill.style.height = carbH + "%";
        lipFill.style.height = lipH + "%";
        lipFill.style.bottom = carbH + "%";
        numEl.textContent = Math.round(((carbKj + lipKj) / maxKj) * 100) + "%";
        c.style.height = Math.max(8, g * 22) + "px";
        l.style.height = Math.max(8, g * 44) + "px";
        live("Same mass: orange = carbohydrate energy (" + carbKj + " kJ), green = lipid energy (" + lipKj + " kJ). Lipid is about twice the share.");
      });
    },

    shock(stage, panel, fn) {
      stage.innerHTML = `<div class="scene"><span class="scene-label">Hit · organ + fat pad in the belly</span>
        ${personMarkup()}
        <div class="fist" id="fist"></div>
      </div>`;
      const person = stage.querySelector(".person");
      const fist = stage.querySelector("#fist");
      const organ = document.createElement("div");
      organ.className = "organ-box";
      organ.id = "organ";
      const pad = document.createElement("div");
      pad.className = "fat-pad";
      pad.id = "pad";
      const dmg = document.createElement("div");
      dmg.className = "dmg";
      dmg.id = "dmg";
      person.appendChild(pad);
      person.appendChild(organ);
      person.appendChild(dmg);
      person.style.left = "58%";
      organ.style.width = "36px";
      organ.style.height = "28px";
      organ.style.left = "92px";
      organ.style.top = "188px";
      dmg.style.width = "36px";
      dmg.style.height = "28px";
      dmg.style.left = "92px";
      dmg.style.top = "188px";
      panelShell(panel, fn);
      let padV = 7;
      sliderCtrl(panel, "Fat padding", 0, 10, 1, 7, (v) => {
        padV = v;
        const w = 40 + v * 3.4;
        const h = 28 + v * 1.6;
        pad.style.width = Math.min(80, w) + "px";
        pad.style.height = Math.min(48, h) + "px";
        pad.style.left = (62 + (96 - Math.min(80, w)) / 2) + "px";
        pad.style.top = (168 + (40 - Math.min(48, h)) / 2) + "px";
      });
      runLoop(stage, (sec) => {
        const cycle = 1.8;
        const t = (sec % cycle) / cycle;
        const swing = t < 0.35 ? t / 0.35 : t < 0.48 ? 1 : Math.max(0, 1 - (t - 0.48) / 0.52);
        const hit = t > 0.32 && t < 0.55;
        const thick = padV >= 7;
        const amp = thick ? 0 : (10 - padV) * 3;
        fist.style.top = "214px";
        fist.style.left = lerp(10, 40, swing) + "%";
        const jolt = hit && !thick ? amp : 0;
        organ.style.left = (92 + jolt * 0.15) + "px";
        organ.style.top = (188 + jolt * 0.2) + "px";
        dmg.style.left = organ.style.left;
        dmg.style.top = organ.style.top;
        dmg.style.opacity = hit && !thick ? String(Math.max(0, (7 - padV) / 10)) : "0";
        live(thick
          ? "Thick belly fat stays inside the trunk. The organ does not move."
          : "Thin belly fat — the hit reaches the organ.");
      });
    },

    nerve(stage, panel, fn) {
      stage.innerHTML = `<div class="scene"><span class="scene-label">Nerve fibre</span>
        <div class="nerve" id="axon"><div class="myelin" id="my"></div><div class="impulse" id="imp"></div></div>
      </div>`;
      const my = stage.querySelector("#my");
      const imp = stage.querySelector("#imp");
      panelShell(panel, fn);
      let x = 0, wrap = 8, leak = false;
      const id = setInterval(() => {
        x += leak ? 1.2 : 3.2;
        if (x > 520) x = 0;
        imp.style.left = x + "px";
        imp.style.opacity = leak && (x % 40 < 12) ? "0.25" : "1";
      }, 30);
      sliderCtrl(panel, "Lipid insulation", 0, 10, 1, 8, (v) => {
        wrap = v;
        leak = v < 4;
        my.style.left = "40px";
        my.style.width = 40 + v * 28 + "px";
        live(leak ? "Little myelin — impulse leaks and crawls." : "Lipid wrap insulates. Impulse stays on the axon.");
      });
      stage._cleanup = () => clearInterval(id);
    },

    waterproof(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Grey surface · lipid coat</span>
        <div class="grey-skin" id="skin"></div>
        <div class="rain" id="rain"></div>
      </div>`;
      const rain = stage.querySelector("#rain");
      panelShell(panel, fn);
      let coat = 8;
      sliderCtrl(panel, "Lipid coat", 0, 10, 1, 8, (v) => {
        coat = v;
        live(v < 3
          ? "Little lipid — most droplets pass through the grey surface."
          : v < 7
            ? "Some coat — fewer droplets soak in; more bead and run off."
            : "Thick hydrophobic coat — almost no water passes through.");
      });
      const drops = [];
      function spawn() {
        const el = document.createElement("div");
        el.className = "drop";
        rain.appendChild(el);
        drops.push({ el, x: 70 + Math.random() * 300, y: -24 - Math.random() * 80, vy: 2.4 + Math.random() * 1.4, state: "fall", vx: 0, life: 0 });
      }
      runLoop(stage, () => {
        while (drops.length < 9) spawn();
        const surface = 210;
        const bottom = 298;
        drops.forEach((d) => {
          if (d.state === "fall") {
            d.y += d.vy;
            if (d.y >= surface) {
              const pass = Math.random() > (coat / 10);
              if (pass) {
                d.state = "through";
                d.el.style.opacity = "0.45";
              } else {
                d.state = "bead";
                d.vx = (Math.random() < 0.5 ? -1 : 1) * (1.6 + Math.random());
                d.y = surface - 4;
              }
            }
          } else if (d.state === "through") {
            d.y += d.vy * 0.85;
            if (d.y > bottom + 30) d.life = 99;
          } else if (d.state === "bead") {
            d.x += d.vx;
            d.y = surface - 6;
            d.life += 1;
            d.el.style.opacity = String(Math.max(0, 1 - d.life / 36));
            if (d.life > 36) d.life = 99;
          }
          d.el.style.left = d.x + "px";
          d.el.style.top = d.y + "px";
        });
        for (let i = drops.length - 1; i >= 0; i--) {
          if (drops[i].life >= 99 || drops[i].y > 520) {
            drops[i].el.remove();
            drops.splice(i, 1);
          }
        }
      });
    },

    membrane(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Phospholipid bilayer · blue heads out, yellow tails in</span>
        <div class="bilayer" id="mem"></div>
      </div>`;
      const mem = stage.querySelector("#mem");
      const N = 12;
      const lipids = [];
      function makeLipid(leaflet) {
        const wrap = document.createElement("div");
        wrap.className = "plipid";
        const head = document.createElement("div");
        head.className = "head-p";
        const tail = document.createElement("div");
        tail.className = "tail-p";
        if (leaflet === "top") {
          wrap.appendChild(head);
          wrap.appendChild(tail);
        } else {
          wrap.appendChild(tail);
          wrap.appendChild(head);
        }
        mem.appendChild(wrap);
        return wrap;
      }
      for (let i = 0; i < N; i++) lipids.push({ el: makeLipid("top"), i, leaflet: "top" });
      for (let i = 0; i < N; i++) lipids.push({ el: makeLipid("bot"), i, leaflet: "bot" });
      const chols = [];
      for (let i = 0; i < 8; i++) {
        const c = document.createElement("div");
        c.className = "chol";
        mem.appendChild(c);
        chols.push(c);
      }
      panelShell(panel, fn);
      let chol = 5;
      sliderCtrl(panel, "Cholesterol / flexibility", 0, 10, 1, 5, (v) => {
        chol = v;
        live(v < 3
          ? "Low cholesterol — membrane is very flexible: lipids wave and spread."
          : v > 7
            ? "High cholesterol — orange wedges pack the tails. Bilayer is stiffer and flatter."
            : "Cholesterol tunes flexibility. Heads (blue) face water; tails (yellow) face each other.");
      });
      runLoop(stage, (sec) => {
        const flex = (10 - chol) / 10;
        const gap = 18 + flex * 10;
        const amp = 3 + flex * 14;
        lipids.forEach((L) => {
          const wave = Math.sin(sec * (1.6 + flex * 3) + L.i * 0.55) * amp;
          const x = 8 + L.i * (22 + gap * 0.35);
          const y = L.leaflet === "top" ? 18 + wave : 18 + 64 - wave;
          L.el.style.left = x + "px";
          L.el.style.top = y + "px";
        });
        chols.forEach((c, i) => {
          const show = i < Math.round(chol * 0.8);
          c.style.display = show ? "block" : "none";
          c.style.left = 18 + i * 36 + "px";
          c.style.top = 62 + Math.sin(sec + i) * (2 + flex * 4) + "px";
        });
      });
    },

    hormone(stage, panel, fn) {
      if (fn.kind === "protein") {
        showPhoto(
          stage, panel, fn,
          "./assets/protein/hormone.gif",
          "Protein hormone binds a receptor and the cell responds",
          "Most hormones in blood are proteins. They bind a receptor and trigger a response that regulates body functions."
        );
        return;
      }
      showPhoto(
        stage, panel, fn,
        "./assets/lipid/sex-hormone.gif",
        "Cholesterol is converted into a sex hormone that binds a receptor",
        "Cholesterol (a steroid lipid) is a precursor for sex hormones. The hormone binds a receptor and the cell responds."
      );
    },

    repair(stage, panel, fn) {
      stage.innerHTML = `<div class="scene"><div class="grow-wrap" id="grow">${personMarkup()}</div></div>`;
      const wrap = stage.querySelector("#grow");
      panelShell(panel, fn);
      sliderCtrl(panel, "Protein for tissues", 0, 10, 1, 4, (v) => {
        const s = 0.55 + v * 0.07;
        wrap.style.transform = `translateX(-50%) scale(${s})`;
        live(v < 4
          ? "Little protein — the body stays small; growth and repair are slow."
          : "More amino acids — the whole body grows as muscle, skin and nails are built.");
      });
    },

    enzyme(stage, panel, fn) {
      embedTool(stage, "./enzyme-action-animation.html", "Enzyme action");
      panelShell(panel, fn);
      live("Lock-and-key enzyme action from the Enzyme tool: substrate fits the active site, products leave, enzyme unchanged.");
    },

    antibody(stage, panel, fn) {
      showPhoto(
        stage, panel, fn,
        "./assets/protein/antibody.gif",
        "Antibody binding to a matching antigen",
        "Antibodies (抗體) and antigens (抗原) are proteins. They are not antibiotics (抗生素). Matching shapes lock together."
      );
    },

    channels(stage, panel, fn) {
      embedTool(stage, "./membrane-animation.html?embed=1", "Membrane transport");
      panelShell(panel, fn);
      live("Membrane Transport from the tools hub: rotate the 3D bilayer and use the buttons to see channels, carriers and other paths.");
    },

    full(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Fibre goes into the mouth</span>
        ${personMarkup()}
        <div class="mouth-box" id="mouth" style="position:absolute;left:50%;top:92px;width:42px;height:20px;margin-left:-21px;background:#fff;border:2px solid var(--line);z-index:4"></div>
        <div class="stomach" id="stom"></div>
        <div class="rumble" id="rumble">hungry…</div>
        <div id="fibre-fly"></div>
      </div>`;
      const person = stage.querySelector(".person");
      const stom = stage.querySelector("#stom");
      const rumble = stage.querySelector("#rumble");
      const fly = stage.querySelector("#fibre-fly");
      person.querySelector(".mouth").style.opacity = "0";
      const bits = [];
      for (let i = 0; i < 12; i++) {
        const el = document.createElement("div");
        el.className = "fibre-bit";
        el.style.position = "absolute";
        fly.appendChild(el);
        bits.push({ el, i });
      }
      panelShell(panel, fn);
      let fibre = 1;
      sliderCtrl(panel, "Fibre in diet", 0, 10, 1, 1, (v) => {
        fibre = v;
        const hungry = v < 4;
        person.classList.toggle("is-hungry", hungry);
        person.classList.toggle("is-full", !hungry);
        stom.style.width = (28 + v * 7) + "px";
        stom.style.height = (22 + v * 5) + "px";
        stom.style.left = (96 - v * 2) + "px";
        stom.style.background = hungry ? "#fff" : "#e8f0d4";
        stom.style.borderStyle = hungry ? "dashed" : "solid";
        rumble.style.opacity = hungry ? "1" : "0";
        live(hungry
          ? "Little fibre — almost nothing reaches the mouth. Stomach stays empty (hungry)."
          : "More fibre blocks travel to the white mouth and disappear on contact. Stomach feels full, but fibre has no energy value.");
      });
      runLoop(stage, (sec) => {
        const n = Math.round(fibre);
        bits.forEach((b, i) => {
          const on = i < n;
          b.el.style.display = on ? "block" : "none";
          if (!on) return;
          const p = (sec * 0.55 + i * 0.18) % 1;
          b.el.style.left = lerp(12 + (i % 5) * 8, 50, p) + "%";
          b.el.style.top = lerp(40 + (i % 3) * 16, 96, p) + "px";
          b.el.style.opacity = p >= 0.92 ? "0" : "1";
        });
      });
    },

    hydrolysis(stage, panel, fn) {
      embedTool(stage, "./maltose-hydrolysis-animation.html", "Maltose hydrolysis");
      panelShell(panel, fn);
      live("Water is a reactant. Hydrolysis: maltose + 1 H₂O → two glucose. Use Play / Next on the extracted Ch5 tool.");
    },

    solvent(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Cytoplasm · water as solvent</span>
        <div class="beaker" id="beaker"><div class="water-fill" id="wf"></div></div>
      </div>`;
      const beaker = stage.querySelector("#beaker");
      const wf = stage.querySelector("#wf");
      const solids = [];
      for (let i = 0; i < 14; i++) {
        const d = document.createElement("div");
        d.className = "solute";
        d.style.background = i % 2 ? "var(--prot)" : "var(--heat)";
        beaker.appendChild(d);
        solids.push({ el: d, i });
      }
      panelShell(panel, fn);
      let water = 3;
      sliderCtrl(panel, "Amount of water", 0, 10, 1, 3, (v) => {
        water = v;
        wf.style.height = (8 + v * 8.5) + "%";
        live(v < 3
          ? "Little water — most particles stay undissolved at the bottom."
          : "More water dissolves more particles. They float and can meet to react.");
      });
      runLoop(stage, (sec) => {
        const nDissolved = Math.round(water * 1.4);
        solids.forEach((s, i) => {
          const dissolved = i < nDissolved;
          if (dissolved) {
            const x = 12 + (i % 6) * 42 + Math.sin(sec * 1.4 + i) * 10;
            const y = 40 + Math.floor(i / 6) * 50 + Math.cos(sec * 1.1 + i) * 8;
            s.el.style.left = x + "px";
            s.el.style.top = y + "px";
            s.el.style.opacity = "1";
          } else {
            s.el.style.left = 16 + (i % 7) * 36 + "px";
          s.el.style.top = ((beaker.clientHeight || 320) - 22) + "px";
            s.el.style.opacity = "0.85";
          }
        });
      });
    },

    support(stage, panel, fn) {
      stage.innerHTML = `<div class="compare support-align">
        <div class="side">
          <h4>Animal support</h4>
          <div class="figure-slot">${personMarkup()}</div>
        </div>
        <div class="side">
          <h4>Plant turgor</h4>
          <div class="figure-slot">${plantConnMarkup()}</div>
        </div>
      </div>`;
      const arms = [...stage.querySelectorAll(".larm")];
      const spots = [...stage.querySelectorAll(".yspot")];
      arms.forEach((a) => {
        a.style.transform = a.dataset.side === "L" ? "rotate(12deg)" : "rotate(-12deg)";
      });
      spots.forEach((s) => { s.style.opacity = "0"; });
      panelShell(panel, fn);
      live("Water supports the animal body (buoyancy) and keeps the plant erect by turgor in a connected stem and leaves.");
    },

    transport(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Blood vessel · cells + substances in water</span>
        <div class="vessel" id="ves">
          <div class="endo" style="left:8px;top:0"></div>
          <div class="endo" style="left:48px;top:0"></div>
          <div class="endo" style="left:88px;top:0"></div>
          <div class="endo" style="left:128px;top:0"></div>
          <div class="endo" style="left:168px;top:0"></div>
          <div class="endo" style="left:208px;top:0"></div>
          <div class="endo" style="left:248px;top:0"></div>
          <div class="endo" style="left:288px;top:0"></div>
          <div class="endo" style="left:8px;bottom:0;top:auto"></div>
          <div class="endo" style="left:48px;bottom:0;top:auto"></div>
          <div class="endo" style="left:88px;bottom:0;top:auto"></div>
          <div class="endo" style="left:128px;bottom:0;top:auto"></div>
          <div class="endo" style="left:168px;bottom:0;top:auto"></div>
          <div class="endo" style="left:208px;bottom:0;top:auto"></div>
          <div class="endo" style="left:248px;bottom:0;top:auto"></div>
          <div class="endo" style="left:288px;bottom:0;top:auto"></div>
        </div>
      </div>`;
      const ves = stage.querySelector("#ves");
      const bits = [];
      for (let i = 0; i < 16; i++) {
        const el = document.createElement("div");
        el.className = "rbc";
        ves.appendChild(el);
        bits.push({ el, x: (i * 28) % 360, y: 28 + (i % 3) * 22, kind: "rbc", sp: 1.4 + (i % 4) * 0.25 });
      }
      for (let i = 0; i < 10; i++) {
        const el = document.createElement("div");
        el.className = "solute blood";
        ves.appendChild(el);
        bits.push({ el, x: (i * 40 + 10) % 360, y: 36 + (i % 4) * 18, kind: "solute", sp: 1.1 + (i % 3) * 0.3 });
      }
      panelShell(panel, fn);
      live("Blood is mainly water. Many red blood cells and dissolved substances move together through the vessel. In plants, water carries minerals from roots to leaves.");
      runLoop(stage, () => {
        const w = ves.clientWidth || 360;
        bits.forEach((b) => {
          b.x += b.sp;
          if (b.x > w + 20) b.x = -24;
          b.el.style.left = b.x + "px";
          b.el.style.top = b.y + "px";
        });
      });
    },

    sweat(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Sweating · latent heat</span>
        ${thermoMarkup("th")}
        ${personMarkup()}
      </div>`;
      const th = stage.querySelector("#th");
      const person = stage.querySelector(".person");
      const drops = document.createElement("div");
      drops.id = "drops";
      person.appendChild(drops);
      th.style.left = "18px";
      th.style.top = "70px";
      person.style.left = "62%";
      const spots = [
        { l: 78, t: 18 }, { l: 102, t: 22 },
        { l: 74, t: 112 }, { l: 96, t: 128 }, { l: 118, t: 118 },
        { l: 86, t: 156 }, { l: 108, t: 172 },
        { l: 34, t: 120 }, { l: 38, t: 150 },
        { l: 168, t: 120 }, { l: 166, t: 150 }
      ];
      panelShell(panel, fn);
      sliderCtrl(panel, "Sweating", 0, 10, 1, 4, (v) => {
        const temp = Math.max(35, 37.4 - v * 0.24);
        setThermo(th, temp, 34.5, 38);
        drops.innerHTML = "";
        for (let i = 0; i < v; i++) {
          const d = document.createElement("div");
          d.className = "drop";
          const s = spots[i % spots.length];
          d.style.left = s.l + "px";
          d.style.top = s.t + "px";
          d.style.animation = "rise 1.35s linear infinite";
          d.style.animationDelay = (i * 0.11) + "s";
          drops.appendChild(d);
        }
        live(v < 3
          ? "Little sweat — drops only on the grey body. Temperature stays near 37°C."
          : "Sweat appears only on grey skin. Evaporation takes latent heat. Thermometer falls, not below 35°C.");
      });
    },

    specific(stage, panel, fn) {
      stage.innerHTML = `<div class="compare">
        <div class="side">
          <h4>Water</h4>
          ${thermoMarkup("thw")}
          <div class="blk" id="w" style="left:38%;top:140px;width:40%;height:160px;background:#bbdefb"></div>
        </div>
        <div class="side">
          <h4>Other block</h4>
          ${thermoMarkup("tho")}
          <div class="blk" id="o" style="left:38%;top:140px;width:40%;height:160px;background:#ffcc80"></div>
        </div>
      </div>`;
      const w = stage.querySelector("#w");
      const o = stage.querySelector("#o");
      const thw = stage.querySelector("#thw");
      const tho = stage.querySelector("#tho");
      thw.style.left = "10px"; thw.style.top = "48px";
      tho.style.left = "10px"; tho.style.top = "48px";
      panelShell(panel, fn);
      sliderCtrl(panel, "Energy supplied", 0, 10, 1, 0, (v) => {
        const tw = 20 + v * 1.1;
        const to = 20 + v * 4.6;
        setThermo(thw, tw, 18, 70);
        setThermo(tho, to, 18, 70);
        w.style.background = `rgb(${187 - v * 4},${222 - v * 6},${253 - v * 8})`;
        o.style.background = `rgb(255,${204 - v * 14},${128 - v * 8})`;
        live(`Same energy. Water: ${tw.toFixed(1)}°C (barely rises). Other block: ${to.toFixed(1)}°C (heats fast). High specific heat keeps the internal environment steady.`);
      });
    },

    vision(stage, panel, fn) {
      stage.innerHTML = `<div class="scene" id="sc" style="background:#111">
        ${personMarkup()}
        <div class="blk" id="glow" style="left:50%;top:28px;width:28px;height:18px;margin-left:-14px;background:#ffe082"></div>
      </div>`;
      const sc = stage.querySelector("#sc");
      const glow = stage.querySelector("#glow");
      const person = stage.querySelector(".person");
      panelShell(panel, fn);
      sliderCtrl(panel, "Vitamin A / visual purple", 0, 10, 1, 8, (v) => {
        sc.style.background = v < 3 ? "#111" : `rgb(${20 + v * 8},${20 + v * 8},${24 + v * 6})`;
        person.style.opacity = v < 3 ? "0.15" : String(0.3 + v / 14);
        glow.style.opacity = String(v / 10);
        live(v < 3 ? "Night blindness — rod cells lack visual purple. Scene stays black." : "Visual purple lets rod cells see in dim light.");
      });
    },

    linings(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">${personMarkup()}</div>`;
      const skin = [...stage.querySelectorAll(".blk")];
      panelShell(panel, fn);
      sliderCtrl(panel, "Vitamin A", 0, 10, 1, 7, (v) => {
        skin.forEach((b) => {
          b.style.background = v < 4 ? "#bdbdbd" : "#dcdcdc";
          b.style.borderStyle = v < 4 ? "dashed" : "solid";
        });
        live(v < 4 ? "Dry, thickened linings — eye, skin, gut and airway suffer." : "Healthy skin and linings of alimentary canal and breathing system.");
      });
    },

    wound(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Mouth · collagen holds gums</span>
        ${personMarkup()}
      </div>`;
      const person = stage.querySelector(".person");
      const coll = person.querySelector(".collagen");
      coll.hidden = false;
      panelShell(panel, fn);
      sliderCtrl(panel, "Vitamin C / collagen", 0, 10, 1, 2, (v) => {
        const low = v < 5;
        person.classList.toggle("is-scurvy", low);
        coll.style.opacity = String(v / 10);
        coll.style.display = "block";
        live(low
          ? "Low vitamin C — collagen in the mouth is weak. Gums bleed; red drops fall (scurvy)."
          : "Collagen mesh in the mouth holds gums. C for connective tissue — wounds and gums stay healthy.");
      });
    },

    dcpip(stage, panel, fn) {
      stage.innerHTML = `<div class="compare">
        <div class="side"><h4>Cold lemon tea</h4><div class="blk" id="c" style="left:30%;top:120px;width:40%;height:160px;background:#3949ab"></div><div class="scene-label" style="top:auto;bottom:48px;left:0;right:0;text-align:center" id="cn">drops</div></div>
        <div class="side"><h4>Hot lemon tea</h4><div class="blk" id="h" style="left:30%;top:120px;width:40%;height:160px;background:#3949ab"></div><div class="scene-label" style="top:auto;bottom:48px;left:0;right:0;text-align:center" id="hn">drops</div></div>
      </div>`;
      const c = stage.querySelector("#c");
      const h = stage.querySelector("#h");
      panelShell(panel, fn);
      let n = 0;
      stepsCtrl(panel, ["Add drops", "More drops", "Hot still blue"], (i) => {
        n = i + 1;
        c.style.background = i >= 1 ? "#e3f2fd" : "#3949ab";
        h.style.background = i >= 2 ? "#9fa8da" : "#3949ab";
        stage.querySelector("#cn").textContent = i === 0 ? "8 drops → colourless" : "already colourless";
        stage.querySelector("#hn").textContent = i < 2 ? "still blue — need more" : "44 drops (heat destroyed vit. C)";
        live("Greater vitamin C concentration, fewer drops to decolorize DCPIP. Heat destroys vitamin C, so hot tea needs more drops.");
      });
    },

    dabsorb(stage, panel, fn) {
      stage.innerHTML = `<div class="photo-stage">
        <img class="photo-model" src="./assets/vitamin-d/ca-phosphate-absorb.png" alt="Vitamin D helps calcium move from the intestine through epithelial cells into blood" />
      </div>`;
      panelShell(panel, fn);
      live("Vitamin D is not a bone component. It promotes Ca and phosphate absorption from the gut into blood.");
    },

    sun(stage, panel, fn) {
      stage.innerHTML = `<div class="scene" id="sky">
        <span class="scene-label">UV from the sun → grey skin</span>
        ${personMarkup()}
        <div class="blk" id="sun" style="right:28px;top:20px;left:auto;width:48px;height:48px;background:#ffe082"></div>
      </div>`;
      const sky = stage.querySelector("#sky");
      const sun = stage.querySelector("#sun");
      const scene = stage.querySelector(".scene");
      const dots = [];
      for (let i = 0; i < 12; i++) {
        const el = document.createElement("div");
        el.className = "uv";
        el.textContent = "UV";
        scene.appendChild(el);
        dots.push({ el, i });
      }
      panelShell(panel, fn);
      let light = 7;
      sliderCtrl(panel, "Light intensity", 0, 10, 1, 7, (v) => {
        light = v;
        sky.style.background = v < 3 ? "#ececec" : `rgb(${210 + v * 3},${220 + v},${230})`;
        sun.style.opacity = String(0.25 + v / 12);
        live(v < 3
          ? "Low light — almost no UV reaches the grey skin."
          : "Orange UV particles leave the yellow sun and hit the grey body. Skin makes vitamin D.");
      });
      runLoop(stage, (sec) => {
        const n = Math.round(light * 1.2);
        dots.forEach((d, i) => {
          const on = i < n;
          d.el.style.display = on ? "block" : "none";
          if (!on) return;
          const p = (sec * 0.4 + i * 0.16) % 1;
          const x0 = 82;
          const y0 = 36;
          const x1 = 42 + (i % 4) * 5;
          const y1 = 88 + (i % 3) * 28;
          d.el.style.left = lerp(x0, x1, p) + "%";
          d.el.style.top = lerp(y0, y1, p) + "px";
        });
      });
    },

    bone(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Skeleton · 99% of Ca is here</span>
        ${skeletonMarkup()}
      </div>`;
      const skel = stage.querySelector("#skel");
      const cracks = [...skel.querySelectorAll(".crack, .tear-gap, .scar")];
      panelShell(panel, fn);
      sliderCtrl(panel, "Calcium in skeleton", 0, 10, 1, 8, (v) => {
        const weak = v < 5;
        skel.classList.toggle("shaking", weak);
        skel.style.transform = weak ? "" : "translateX(-50%) rotate(0deg)";
        cracks.forEach((c, i) => { c.style.opacity = weak && i < Math.ceil((5 - v) * 1.6) ? "1" : "0"; });
        live(weak
          ? "Too little calcium — bones tear and show scars. The skeleton shakes gently, about to collapse."
          : "Calcium is a component of bones and teeth. The skeleton stands firm.");
      });
    },

    clot(stage, panel, fn) {
      stage.innerHTML = `<div class="three-fun">
        <div class="mini-fun" data-role="muscle">
          <h4>1 · Muscle contraction</h4>
          <div class="fun-media-wrap">
            <img class="fun-media" src="./assets/calcium/muscle-contraction.gif" alt="Muscle contraction" />
          </div>
        </div>
        <div class="mini-fun" data-role="nerve">
          <h4>2 · Nerve impulse</h4>
          <div class="fun-media-wrap">
            <img class="fun-media" src="./assets/calcium/nerve-impulse.gif" alt="Nerve impulse along myelinated and unmyelinated axons" />
          </div>
        </div>
        <div class="mini-fun" data-role="clot">
          <h4>3 · Blood clotting</h4>
          <div class="fun-media-wrap">
            <img class="fun-media" src="./assets/calcium/blood-clotting.jpg" alt="Blood clotting in a vessel" />
          </div>
        </div>
      </div>`;
      const panes = [...stage.querySelectorAll(".mini-fun")];
      panelShell(panel, fn);
      sliderCtrl(panel, "Calcium", 0, 10, 1, 6, (v) => {
        panes.forEach((p) => p.classList.toggle("is-low", v < 4));
        live(v < 4
          ? "Low Ca: muscle stays limp, nerve impulse barely moves, clot does not plug the cut."
          : "Calcium fires all three: muscle contracts, nerve impulse travels, clot seals the wound.");
      });
    },

    iron(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">O₂ in through the mouth → lungs</span>
        ${personMarkup()}
      </div>`;
      const person = stage.querySelector(".person");
      const lung = document.createElement("div");
      lung.className = "lung";
      person.appendChild(lung);
      const scene = stage.querySelector(".scene");
      const bits = [];
      for (let i = 0; i < 14; i++) {
        const el = document.createElement("div");
        el.className = "o2p";
        el.textContent = "O₂";
        scene.appendChild(el);
        bits.push({ el, i });
      }
      panelShell(panel, fn);
      let fe = 8;
      sliderCtrl(panel, "Iron / haemoglobin", 0, 10, 1, 8, (v) => {
        fe = v;
        person.querySelector(".head").style.background = v < 3 ? "#bdbdbd" : "var(--body)";
        live(v < 3
          ? "Little iron — few O₂ blocks make it from mouth to lung. Anaemia: pale, tired."
          : "O₂ keeps entering the mouth. Iron in haemoglobin lets more oxygen reach the lungs and blood.");
      });
      runLoop(stage, (sec) => {
        const n = Math.max(1, Math.round(fe * 1.3));
        bits.forEach((b, i) => {
          const on = i < n;
          b.el.style.display = on ? "block" : "none";
          if (!on) return;
          const p = (sec * 0.45 + i * 0.12) % 1;
          b.el.style.left = "50%";
          b.el.style.marginLeft = ((i % 3) - 1) * 10 + "px";
          b.el.style.top = lerp(28, 150, p) + "px";
          b.el.style.opacity = String(0.35 + p * 0.65);
        });
      });
    },

    "fe-enzyme"(stage, panel, fn) {
      demos.enzyme(stage, panel, fn);
      live("Iron also activates enzymes. Without enough iron, metabolic reactions that need those enzymes slow down.");
    },

    thyroid(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">${personMarkup()}</div>`;
      const neck = stage.querySelector(".neck");
      const heats = document.createElement("div");
      heats.id = "heats";
      stage.querySelector(".person").appendChild(heats);
      panelShell(panel, fn);
      sliderCtrl(panel, "Iodine / thyroid hormone", 0, 10, 1, 6, (v) => {
        neck.style.width = v < 4 ? "52px" : "32px";
        neck.style.left = v < 4 ? "84px" : "94px";
        spawnHeats(heats, v < 4 ? 2 : 8, false);
        live(v < 4 ? "Iodine low — goitre (enlarged thyroid), slow metabolism." : "Thyroid hormone from iodine keeps metabolic rate up.");
      });
    },

    phos(stage, panel, fn) {
      stage.innerHTML = `<div class="compare">
        <div class="side">
          <h4>Phospholipid</h4>
          <div class="membrane" style="top:42%"><div class="phos-row">${Array.from({ length: 6 }, () => `<div><div class="head-p"></div><div class="tail-p"></div></div>`).join("")}</div></div>
        </div>
        <div class="side">
          <h4>Bones and teeth</h4>
          ${skeletonMarkup()}
        </div>
      </div>`;
      const skel = stage.querySelector("#skel");
      skel.style.transform = "translateX(-50%) scale(0.82)";
      skel.style.transformOrigin = "top center";
      const marks = [...skel.querySelectorAll(".crack, .tear-gap, .scar")];
      panelShell(panel, fn);
      sliderCtrl(panel, "Phosphorus", 0, 10, 1, 7, (v) => {
        const weak = v < 5;
        skel.classList.toggle("shaking", weak);
        if (!weak) skel.style.transform = "translateX(-50%) scale(0.82) rotate(0deg)";
        marks.forEach((c, i) => { c.style.opacity = weak && i < Math.ceil((5 - v) * 1.6) ? "1" : "0"; });
        live(weak
          ? "Low phosphorus — bones tear and scar, teeth included. Gentle shake; about to collapse."
          : "P is in phosphate groups (phospholipids) and hardens bones and teeth.");
      });
    },

    chloro(stage, panel, fn) {
      stage.innerHTML = `<div class="scene"><div class="plant" id="pl">
        <div class="blk leaf a" id="la"></div><div class="blk leaf b" id="lb"></div>
        <div class="blk stem"></div><div class="blk pot"></div>
      </div></div>`;
      const la = stage.querySelector("#la");
      const lb = stage.querySelector("#lb");
      panelShell(panel, fn);
      sliderCtrl(panel, "Magnesium", 0, 10, 1, 8, (v) => {
        const c = v < 3 ? "#f0e68c" : "#7cb342";
        la.style.background = c;
        lb.style.background = c;
        live(v < 3 ? "Yellowing leaves — chlorophyll needs Mg²⁺." : "Magnesium sits in chlorophyll. Also activates enzymes in animals.");
      });
    },

    nitrate(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Nitrate → plant protein</span>
        ${plantConnMarkup()}
      </div>`;
      const pl = stage.querySelector("#pl");
      const leaves = [...pl.querySelectorAll(".leaf")];
      panelShell(panel, fn);
      sliderCtrl(panel, "Nitrate (NO₃⁻)", 0, 10, 1, 7, (v) => {
        const s = 0.42 + v * 0.06;
        pl.style.transform = `translateX(-50%) scale(${s})`;
        leaves.forEach((lf) => { lf.style.background = v < 3 ? "#f0e68c" : "#7cb342"; });
        live(v < 3
          ? "Little nitrate — the whole plant shrinks. Yellow leaves: not enough N for amino groups."
          : "Nitrate supplies N for plant amino acids (proteins) and chlorophyll. The plant grows larger.");
      });
    },

    dna(stage, panel, fn) {
      stage.innerHTML = `<div class="scene">
        <span class="scene-label">Double helix</span>
        <div class="helix" id="helix"></div>
      </div>`;
      const helix = stage.querySelector("#helix");
      const pairs = [["A", "T", "#90caf9", "#ffcc80"], ["C", "G", "#a5d6a7", "#ce93d8"], ["G", "C", "#ce93d8", "#a5d6a7"], ["T", "A", "#ffcc80", "#90caf9"]];
      const N = 12;
      for (let i = 0; i < N; i++) {
        const ang = i * 0.55;
        const cx = 170;
        const y = 18 + i * 34;
        const amp = 70;
        const x1 = cx + Math.sin(ang) * amp;
        const x2 = cx + Math.sin(ang + Math.PI) * amp;
        const p = pairs[i % pairs.length];
        const b1 = document.createElement("div");
        b1.className = "bb";
        b1.style.left = x1 + "px";
        b1.style.top = y + "px";
        b1.style.background = "#4aa3df";
        const b2 = document.createElement("div");
        b2.className = "bb";
        b2.style.left = x2 + "px";
        b2.style.top = y + "px";
        b2.style.background = "#4aa3df";
        const rung = document.createElement("div");
        rung.className = "rung";
        const left = Math.min(x1, x2) + 6;
        const w = Math.abs(x2 - x1) - 6;
        rung.style.left = left + "px";
        rung.style.top = (y + 4) + "px";
        rung.style.width = Math.max(8, w) + "px";
        const ba = document.createElement("div");
        ba.className = "base";
        ba.textContent = p[0];
        ba.style.background = p[2];
        ba.style.left = (left + 8) + "px";
        ba.style.top = (y - 2) + "px";
        const bb = document.createElement("div");
        bb.className = "base";
        bb.textContent = p[1];
        bb.style.background = p[3];
        bb.style.left = (left + w - 26) + "px";
        bb.style.top = (y - 2) + "px";
        helix.append(b1, b2, rung, ba, bb);
      }
      panelShell(panel, fn);
      live("DNA is a double helix: two sugar–phosphate backbones twist, with A–T (2 H-bonds) and C–G (3 H-bonds) as rungs. The sequence stores the genetic code.");
    },

    rna(stage, panel, fn) {
      showPhoto(
        stage, panel, fn,
        "./assets/nucleic/protein-synthesis.gif",
        "Protein synthesis: RNA polymerase transcribes DNA",
        "RNA (ribose, A–U, C–G) is involved in protein synthesis. Transcription copies DNA in the nucleus; RNA then works in the cytoplasm."
      );
    },

    code(stage, panel, fn) {
      stage.innerHTML = `<div class="photo-stage">
        <img class="photo-model" src="./assets/nucleic/transcription.gif" alt="Transcription in the nucleus: DNA unzips and RNA nucleotides pair to form mRNA" />
      </div>`;
      panelShell(panel, fn);
      live("Base sequence on DNA → mRNA → amino-acid sequence → protein structure and function. A pairs with T (or U in RNA); C pairs with G.");
    }
  };

  let activeStage = null;

  function cleanup() {
    if (activeStage && typeof activeStage._cleanup === "function") {
      activeStage._cleanup();
      activeStage._cleanup = null;
    }
  }

  function renderHome() {
    cleanup();
    setCrumb([{ label: "Food substance functions" }]);
    app.innerHTML = `<header class="head">
      <h1>Food substance functions</h1>
      <p>Click a nutrient tag, then a function. Each function opens a 2D block tool. Content follows Ch5 Food and humans notes (v2026).</p>
    </header>`;
    GROUPS.forEach((g) => {
      const box = document.createElement("section");
      box.className = "group";
      box.innerHTML = `<div class="group-kicker">${g.title}</div><p class="group-note">${g.note}</p>`;
      const tags = document.createElement("div");
      tags.className = "tags";
      NUTRIENTS.filter((n) => n.group === g.id).forEach((n) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tag";
        b.dataset.accent = n.accent;
        b.innerHTML = `${n.name}<span class="zh">${n.zh}</span>`;
        b.addEventListener("click", () => go(n.id));
        tags.appendChild(b);
      });
      box.appendChild(tags);
      app.appendChild(box);
    });
  }

  function renderNutrient(n) {
    cleanup();
    setCrumb([
      { label: "All nutrients", on: () => go() },
      { label: n.name }
    ]);
    app.innerHTML = `<header class="head">
      <h1>${n.name} <span class="zh" style="font-size:1rem;color:var(--muted);font-weight:600">${n.zh}</span></h1>
      <p>Choose a function. Each card opens a simple block animation.</p>
    </header>
    <div class="facts">${n.facts.map((f) => `<div class="fact">${f}</div>`).join("")}</div>
    <div class="fn-grid" id="grid"></div>`;
    const grid = document.getElementById("grid");
    n.functions.forEach((fn, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "fn-card";
      b.innerHTML = `<div class="n">${String(i + 1).padStart(2, "0")}</div><h3>${fn.title}</h3><p>${fn.zh} · ${fn.blurb}</p>`;
      b.addEventListener("click", () => go(n.id, fn.id));
      grid.appendChild(b);
    });
  }

  function renderDemo(n, fn) {
    cleanup();
    setCrumb([
      { label: "All nutrients", on: () => go() },
      { label: n.name, on: () => go(n.id) },
      { label: fn.title }
    ]);
    app.innerHTML = `<header class="head">
      <h1>${fn.title}</h1>
      <p>${fn.zh}</p>
    </header>
    <div class="demo-layout">
      <section class="stage" id="demo-stage" aria-label="Animation"></section>
      <aside class="panel" id="demo-panel"></aside>
    </div>`;
    const stage = document.getElementById("demo-stage");
    const panel = document.getElementById("demo-panel");
    activeStage = stage;
    const run = demos[fn.demo];
    if (run) run(stage, panel, fn);
    else {
      stage.innerHTML = `<div class="scene">${personMarkup()}</div>`;
      panelShell(panel, fn);
      live(fn.text);
    }
  }

  function route() {
    const { nid, fid } = parseHash();
    const n = findNutrient(nid);
    const fn = findFn(n, fid);
    if (n && fn) renderDemo(n, fn);
    else if (n) renderNutrient(n);
    else renderHome();
  }

  window.addEventListener("hashchange", route);
  route();
})();
