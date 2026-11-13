/* Opens one Nutrition Classroom view inside the infographic.
   Query: embed=1&topic=villi&view=guided|anatomy&adaptation=&route=&application=
          &process=&transit=&situation=&fn=&nutrient=&group=&villi=normal|flat
          &animate=1&fit=1&cycle=selectName:a,b,c&dwell=9000 */
(function () {
  const q = new URLSearchParams(location.search);
  if (q.get("embed") !== "1") return;

  const style = document.createElement("style");
  style.textContent = [
    "html.embed-mode, html.embed-mode body { height: 100%; margin: 0; background: #fffdf8; }",
    "html.embed-mode body { display: flex !important; flex-direction: column; height: 100vh !important; height: 100dvh !important; overflow: hidden !important; padding: 0 !important; }",
    "html.embed-mode body > :not(#workspace) { display: none !important; }",
    "html.embed-mode #workspace { flex: 1 1 auto !important; display: flex !important; grid-template-columns: minmax(0,1fr) !important; height: auto !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; }",
    "html.embed-mode #textPanel, html.embed-mode #notesPanel, html.embed-mode #practicePanel { display: none !important; }",
    "html.embed-mode #modelPanel { display: flex !important; flex: 1 1 auto !important; width: 100% !important; height: 100% !important; min-height: 0 !important; padding: 6px !important; }",
    "html.embed-mode #modelTitle, html.embed-mode .panel-label, html.embed-mode #modelControls, html.embed-mode #processStory, html.embed-mode .mechanism-explanation, html.embed-mode #currentStepExplanation, html.embed-mode .timeline-label, html.embed-mode .playback-row { display: none !important; }",
    "html.embed-controls .playback-row { display: flex !important; flex-shrink: 0; }",
    "html.embed-mode #modelStage, html.embed-mode #anatomyContext, html.embed-mode #guidedHost, html.embed-mode #diagramHost, html.embed-mode #anatomyHost { flex: 1 1 auto; min-height: 0; height: 100%; }",
    "html.embed-mode #modelStage.guided-stage { display: flex !important; flex-direction: column !important; grid-template-columns: none !important; gap: 0 !important; }",
    "html.embed-mode #modelStage #diagramHost:not([hidden]) { display: flex !important; flex: 1 1 auto; min-height: 180px; }",
    "html.embed-mode #modelStage #diagramHost .diagram-picture { flex: 1 1 auto; min-height: 0; display: flex; align-items: center; justify-content: center; }",
    "html.embed-mode #modelStage #diagramHost svg { width: 100%; height: auto; max-height: 100%; }",
    "html.embed-mode #modelStage .learning-scene { flex: 1 1 auto; min-height: 0; }",
    "html.embed-mode #modelStage .learning-scene-actions { display: none !important; }",
    "html.embed-mode #modelStage .diagram-actions { display: none !important; }",
    "html.embed-mode #modelStage .villus-purpose { font-size: 12px; flex: none; }",
    "html.embed-controls #play, html.embed-controls #replay { min-height: 36px; }",
    "html.embed-legend .villus-purpose, html.embed-legend .learning-scene-actions, html.embed-legend #processStory, html.embed-legend .mechanism-explanation { display: none !important; }",
    "html.embed-legend #modelPanel { padding: 0 !important; background: #fff !important; }",
    "html.embed-legend #modelStage, html.embed-legend #guidedHost, html.embed-legend .learning-scene { display: flex !important; flex-direction: column; height: 100% !important; min-height: 0 !important; overflow: hidden; }",
    "html.embed-legend .learning-scene svg { flex: 1 1 auto; width: 100%; min-height: 0; }",
    "html.embed-legend .diagram-legend { display: flex !important; flex: none; }"
  ].join("");
  document.head.appendChild(style);
  document.documentElement.classList.add("embed-mode");
  if (q.get("legend") === "1") document.documentElement.classList.add("embed-legend");
  if (q.get("controls") === "1") document.documentElement.classList.add("embed-controls");

  const wantAnimate = q.get("animate") !== "0";

  const topics = ["villi", "transport", "assimilation", "glucose", "liver", "egestion", "applications"];
  const fateNutrients = {
    glucose: "Glucose 葡萄糖",
    amino: "Amino acids 氨基酸",
    lipid: "Lipids 脂質",
    lipids: "Lipids 脂質",
  };
  function resolveNutrient(raw) {
    if (!raw) return null;
    return fateNutrients[raw] || raw;
  }

  function setSelect(name, value) {
    if (value == null || value === "") return;
    const sel = document.querySelector('[data-choice-select="' + name + '"]');
    if (!sel) return;
    sel.value = value;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function onlyModel() {
    document.querySelectorAll("[data-panel]").forEach(function (btn) {
      const want = btn.dataset.panel === "model";
      const on = btn.getAttribute("aria-pressed") === "true";
      if (want !== on) btn.click();
    });
  }

  function pressAnimate() {
    const play = document.getElementById("play");
    if (play && play.getAttribute("aria-pressed") !== "true") play.click();
  }

  function kickAutoplay() {
    if (!wantAnimate) return;
    const app = window.NutritionApp;
    if (app && app.state) {
      app.state.reducedMotion = false;
      app.state.phase = 0;
      app.state.playing = true;
    }
    const replay = document.getElementById("replay");
    if (replay) replay.click();
    else pressAnimate();
  }

  function applyChoices() {
    const adaptation = q.get("adaptation");
    if (adaptation) {
      const button = document.querySelector('[data-choice="adaptation:' + adaptation + '"]');
      if (button && button.getAttribute("aria-pressed") !== "true") button.click();
    }
    setSelect("villi", q.get("villi"));
    setSelect("route", q.get("route"));
    const diseaseComparison = q.get("diseaseComparison");
    if (diseaseComparison && window.NutritionApp) {
      window.NutritionApp.state.diseaseComparison = diseaseComparison;
      window.NutritionApp.state.compareBoth = false;
    }
    const app = q.get("application");
    if (app) setSelect("application", app);
    if (diseaseComparison && window.NutritionApp) window.NutritionApp.renderModel();
    setSelect("experiment", q.get("experiment"));
    const proc = q.get("process");
    if (proc && app === "processes") {
      setTimeout(function () {
        setSelect("transportProcess", proc);
        if (q.get("animate") === "1") {
          pressAnimate();
          setTimeout(function () { document.getElementById("replay")?.click(); }, 60);
        }
      }, 150);
    } else if (proc) {
      setSelect("transportProcess", proc);
    }
    setSelect("transit", q.get("transit"));
    const topic = q.get("topic") || "villi";
    const fn = q.get("fn");
    if (!(fn != null && fn !== "" && topic === "liver")) {
      setSelect("situation", q.get("situation"));
      setSelect("function", fn);
    }
    if (fn != null && fn !== "" && topic === "liver") {
      setTimeout(function () {
        setSelect("function", fn);
        const situation = q.get("situation");
        if (situation) setSelect("situation", situation);
        const production = q.get("production");
        if (production) setSelect("production", production);
        if (q.get("animate") === "1") {
          pressAnimate();
          setTimeout(function () { document.getElementById("replay")?.click(); }, 60);
        }
      }, 150);
    } else if (q.get("situation") && topic !== "liver") {
      setSelect("situation", q.get("situation"));
    }
    const nutrient = resolveNutrient(q.get("nutrient"));
    const fate = q.get("fate") || (nutrient ? "use" : null);
    if (nutrient && topic === "assimilation") {
      setTimeout(function () {
        if (fate) setSelect("fate", fate);
        setSelect("nutrient", nutrient);
        const lipidUse = q.get("lipidUse");
        if (lipidUse) setSelect("lipidUse", lipidUse);
        if (q.get("animate") === "1") {
          pressAnimate();
          setTimeout(function () { document.getElementById("replay")?.click(); }, 60);
        }
      }, 150);
    } else if (nutrient) {
      setSelect("nutrient", nutrient);
      if (fate) setSelect("fate", fate);
    }
    setSelect("absorptionGroup", q.get("group"));
    if (q.get("fit") === "1") document.getElementById("fitAll")?.click();
    const deferPlay = (proc && app === "processes") || (nutrient && topic === "assimilation") || (fn != null && fn !== "" && topic === "liver");
    if (q.get("loop") === "1") armAutoLoop();
    startCycle();
    if (wantAnimate) setTimeout(kickAutoplay, deferPlay ? 300 : 120);
    requestAnimationFrame(function () { window.dispatchEvent(new Event("resize")); });
  }

  function armAutoLoop() {
    setInterval(function () {
      const app = window.NutritionApp;
      if (!app || !app.state) return;
      if (app.state.playing || app.state.phase < 0.97) return;
      const replay = document.getElementById("replay");
      if (replay) replay.click();
    }, 600);
  }

  function startCycle() {
    const cycle = q.get("cycle");
    if (!cycle || cycle.indexOf(":") < 0) return;
    const name = cycle.slice(0, cycle.indexOf(":"));
    const values = cycle.slice(cycle.indexOf(":") + 1).split(",").filter(Boolean);
    if (!values.length) return;
    let index = 0;
    setSelect(name, values[0]);
    setTimeout(function () { document.getElementById("replay")?.click(); }, 120);
    const dwell = Number(q.get("dwell") || 9000);
    setInterval(function () {
      index = (index + 1) % values.length;
      setSelect(name, values[index]);
      setTimeout(function () { document.getElementById("replay")?.click(); }, 80);
    }, dwell);
  }

  function boot(tries) {
    if (!window.NutritionApp || !document.querySelector("#topics button")) {
      if (tries < 50) setTimeout(function () { boot(tries + 1); }, 80);
      return;
    }
    const topic = q.get("topic") || "villi";
    const index = topics.indexOf(topic);
    const view = q.get("view");
  function finishEmbed() {
    onlyModel();
    if (window.NutritionApp) {
      const embedOpts = {};
      if (view) embedOpts.view = view;
      const appParam = q.get("application");
      if (appParam) embedOpts.application = appParam;
      const dc = q.get("diseaseComparison");
      if (dc) embedOpts.diseaseComparison = dc;
      window.NutritionApp.applyEmbed(embedOpts);
    }
    setTimeout(applyChoices, 60);
  }
  if (index >= 0) {
    window.NutritionApp.setTopic(index);
    finishEmbed();
  } else finishEmbed();
  }

  boot(0);
})();
