/* Digestion Journey, motion panel only.
   stages are 0-based: 0 mouth, 1 pharynx, 2 oesophagus, 3 stomach, 4 duodenum,
   5 ileum, 6 colon, 7 rectum, 8 anus.
   embed=1&stages=3,4&animate=1&chrome=1&dwell=8200 */
(function () {
  const q = new URLSearchParams(location.search);
  if (q.get("map") === "1") {
    const fit = document.createElement("style");
    fit.textContent = [
      ".teach-dock, .header, .panel-switches { display: none !important; }",
      ".app { padding: 0 !important; height: 100dvh !important; }",
      "#classroomWorkspace { height: 100% !important; }"
    ].join("");
    document.head.appendChild(fit);

    function hideChrome() {
      document.querySelectorAll(".header, .panel-switches, .teach-dock").forEach(function (el) {
        el.style.setProperty("display", "none", "important");
      });
      const app = document.querySelector(".app");
      if (app) app.style.setProperty("padding", "0", "important");
    }
    function armJourney() {
      hideChrome();
      const btn = document.querySelector("#playBtn");
      if (!btn) {
        setTimeout(armJourney, 150);
        return;
      }
      const label = btn.textContent || "";
      if (label.indexOf("Play") >= 0) btn.click();
      setTimeout(armJourney, 1000);
    }
    hideChrome();
    setTimeout(armJourney, 200);
  }
  if (q.get("embed") !== "1") return;

  const style = document.createElement("style");
  style.textContent = [
    "html.embed-mode body, html.embed-mode body * { font-size: 14px !important; font-weight: 650 !important; letter-spacing: 0 !important; }",
    "html.embed-mode .app { height: 100dvh !important; padding: 4px !important; gap: 4px !important; }",
    "html.embed-mode .panel-switches, html.embed-mode .workspace-empty, html.embed-mode .teach-dock, html.embed-mode #whyBox { display: none !important; }",
    "html.embed-mode .header { display: none !important; }",
    "html.embed-chrome .header { display: flex !important; align-items: center; gap: 6px; }",
    "html.embed-chrome .header h1 { display: none !important; }",
    "html.embed-mode button, html.embed-mode select { min-height: 32px !important; padding: 2px 8px !important; }",
    "html.embed-mode #classroomWorkspace { flex: 1 1 auto !important; min-height: 0 !important; height: auto !important; }",
    "html.embed-mode [data-panel='mechanism'] { height: 100% !important; min-height: 0 !important; display: flex !important; flex-direction: column !important; }",
    "html.embed-mode .mechanism-screen { flex: 1 1 auto !important; min-height: 120px !important; height: auto !important; }",
    "html.embed-mode .mechanism-screen canvas { width: 100% !important; height: 100% !important; min-height: 120px !important; }",
    "html.embed-mode .mechanism-panel .panel-head, html.embed-mode .motion-controls, html.embed-mode #mechanismLegend, html.embed-mode .mechanism-screen .model-note, html.embed-mode #mechanismResult { display: none !important; }",
    "html.embed-mode .mechanism-panel { padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: 0 !important; background: #fff !important; }"
  ].join("");
  document.head.appendChild(style);
  document.documentElement.classList.add("embed-mode");
  if (q.get("chrome") === "1") document.documentElement.classList.add("embed-chrome");
  if (q.get("labels") === "0") {
    style.textContent += [
      "html.embed-no-labels #villusModel .villus-labels, html.embed-no-labels #villusModel .picture-routes, html.embed-no-labels #villusModel .villus-callouts { display: none !important; }",
      "html.embed-no-labels #villusModel > text { display: none !important; }",
      "html.embed-no-labels #villusModel { max-height: 100%; }",
      "html.embed-no-labels .mechanism-screen.is-absorption, html.embed-no-labels [data-panel='mechanism'].is-absorption .mechanism-screen { align-items: center; justify-content: center; }"
    ].join("");
    document.documentElement.classList.add("embed-no-labels");
  }

  const autoAnimate = q.get("animate") !== "0";
  const stages = (q.get("stages") || "0").split(",").map(Number).filter(function (n) { return !Number.isNaN(n); });
  const dwell = Number(q.get("dwell") || 8200);

  function onlyMotion() {
    document.querySelectorAll(".panel-switches button[data-show]").forEach(function (btn) {
      const want = btn.dataset.show === "mechanism";
      const on = btn.getAttribute("aria-pressed") === "true";
      if (want !== on) btn.click();
    });
  }

  function startAnimate() {
    if (!autoAnimate) return;
    const replay = document.querySelector("#motionReplay");
    if (replay) {
      replay.click();
      return;
    }
    const btn = document.querySelector("#motionPause");
    if (!btn) return;
    const label = btn.textContent || "";
    if (label.indexOf("Animate") >= 0 || label.indexOf("Resume") >= 0 || label.indexOf("動畫") >= 0) btn.click();
  }

  function show(index) {
    const sel = document.querySelector("#organSelect");
    if (!sel) return;
    sel.value = String(index);
    sel.dispatchEvent(new Event("change"));
    setTimeout(startAnimate, 260);
  }

  function boot(tries) {
    if (!document.querySelector("#organSelect") || !document.querySelector(".panel-switches button[data-show]")) {
      if (tries < 50) setTimeout(function () { boot(tries + 1); }, 80);
      return;
    }
    onlyMotion();
    let cursor = 0;
    show(stages[0]);
    if (stages.length > 1) {
      setInterval(function () {
        cursor = (cursor + 1) % stages.length;
        show(stages[cursor]);
      }, dwell);
    }
    requestAnimationFrame(function () { window.dispatchEvent(new Event("resize")); });
  }

  boot(0);
})();
