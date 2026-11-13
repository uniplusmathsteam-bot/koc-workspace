/* Teeth Explorer model for one topic and item.
   embed=1&topic=types&item=incisor&model=1&zoom=1&isolate=1 */
(function () {
  const q = new URLSearchParams(location.search);
  if (q.get("embed") !== "1") return;

  const style = document.createElement("style");
  style.textContent = [
    "html.embed-mode, html.embed-mode body { margin: 0; padding: 0 !important; height: 100%; overflow: hidden; background: #fff; }",
    "html.embed-mode #teeth-explorer { height: 100% !important; min-height: 100% !important; padding: 0 !important; border-radius: 0; }",
    "html.embed-mode #teeth-explorer header, html.embed-mode #teeth-explorer .toolbar, html.embed-mode #teeth-explorer footer, html.embed-mode #teeth-explorer .drawing-tools, html.embed-mode #teeth-explorer .selection, html.embed-mode #teeth-explorer .description, html.embed-mode #teeth-explorer .source { display: none !important; }",
    "html.embed-mode #teeth-explorer main { display: block !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; grid-template-columns: 1fr !important; }",
    "html.embed-mode #teeth-explorer .model-area { height: 100% !important; min-height: 0 !important; position: relative !important; }",
    "html.embed-mode #teeth-explorer #te-model { width: 100% !important; height: 100% !important; min-height: 0 !important; }",
    "html.embed-mode #teeth-explorer #te-webgl { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; border-radius: 0 !important; }",
    "html.embed-flat #teeth-explorer #te-webgl { display: none !important; }",
    "html.embed-mode #teeth-explorer .model-label, html.embed-mode #teeth-explorer #te-anatomy-label, html.embed-mode #te-selection-overlay, html.embed-mode #te-process-labels, html.embed-mode #te-detail, html.embed-mode #te-mechanism { display: none !important; }",
    "html.embed-mode:not(.embed-cycle) #teeth-explorer #te-model-label { display: none !important; }",
    "html.embed-cycle #teeth-explorer #te-model-label { display: block !important; text-align: center; font-size: 18px; margin: 4px 0 0; }",
    "html.embed-mode #teeth-explorer .model-controls { display: none !important; }",
    "html.embed-mode #teeth-explorer small { display: none !important; }"
  ].join("");
  document.head.appendChild(style);
  document.documentElement.classList.add("embed-mode");
  if (q.get("cycle")) document.documentElement.classList.add("embed-cycle");
  if (q.get("isolate") === "1") document.documentElement.classList.add("embed-flat");

  function replay() {
    const button = Array.from(document.querySelectorAll("button")).find(function (node) {
      return node.textContent.indexOf("重播") >= 0 && !node.hidden;
    });
    if (button) button.click();
  }

  function boot(tries) {
    const topic = document.querySelector("#te-topic");
    const item = document.querySelector("#te-item");
    const root = document.querySelector("#teeth-explorer");
    if (!topic || !item || !item.options.length || !root) {
      if (tries < 50) setTimeout(function () { boot(tries + 1); }, 80);
      return;
    }
    const wantTopic = q.get("topic");
    if (wantTopic && topic.value !== wantTopic) {
      topic.value = wantTopic;
      topic.dispatchEvent(new Event("change"));
    }
    const wantItem = q.get("item");
    if (wantItem && item.value !== wantItem) {
      item.value = wantItem;
      item.dispatchEvent(new Event("change"));
    }
    if (q.get("model") === "1" && !root.classList.contains("hide-description")) {
      document.querySelector("#te-hide")?.click();
    }
    if (q.get("zoom") === "1" && !root.classList.contains("enlarged")) {
      document.querySelector("#te-zoom")?.click();
    }
    if (q.get("isolate") === "1") {
      const isolate = document.querySelector("#te-isolate");
      if (isolate && isolate.textContent.indexOf("單顆") >= 0) isolate.click();
      const scale = document.querySelector("#te-scale");
      if (scale) {
        scale.value = "125";
        scale.dispatchEvent(new Event("input"));
      }
    }
    setTimeout(replay, 300);
  const loop = Number(q.get("loop") || (q.get("topic") === "decay" ? "2600" : "0"));
    if (loop > 0) setInterval(replay, loop);
    if (q.get("spin") === "1") {
      setInterval(function () {
        document.querySelector("#te-right")?.click();
      }, 100);
    }
    setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
      document.querySelector("#te-right")?.click();
    }, 450);

    const cycle = q.get("cycle");
    if (cycle) {
      const parts = cycle.split(",").filter(Boolean);
      const dwell = Number(q.get("dwell") || 3000);
      let index = Math.max(0, parts.indexOf(item.value));
      function tell(part) {
        try {
          window.parent.postMessage({ source: "teeth-structure", item: part }, "*");
        } catch (err) {}
      }
      function go(part) {
        if (!part || item.value === part) {
          tell(part || item.value);
          return;
        }
        item.value = part;
        item.dispatchEvent(new Event("change"));
        tell(part);
      }
      go(parts[index] || parts[0]);
      if (parts.length > 1) {
        setInterval(function () {
          index = (index + 1) % parts.length;
          go(parts[index]);
        }, dwell);
      }
    }
  }

  boot(0);
})();
