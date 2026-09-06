(function initBioEmbed() {
  const STANDALONE_ROUTES = {
    "summary.html": "table",
    "notes.html": "ions",
    "lab.html": "tools",
    "flashcards.html": "worksheet",
    "flashcards-study.html": "worksheet",
    "quiz.html": "settings",
    "quiz-hub.html": "settings",
    "quiz-ch4.html": "settings",
    "quiz-ch5.html": "settings",
    "comics-hub.html": "comics",
    "carbohydrate-comic.html": "comics/osmosis/carbohydrate-comic.html",
    "lipid-comic.html": "comics/osmosis/lipid-comic.html",
    "protein-comic.html": "comics/osmosis/protein-comic.html",
    "virtual-osmosis-lab.html": "tools/virtual-osmosis-lab.html",
    "membrane-animation.html": "tools/membrane-animation.html",
    "endosymbiotic-animation.html": "tools/endosymbiotic-animation.html",
    "maltose-animation.html": "tools/maltose-animation.html",
    "carbohydrate-builder.html": "tools/carbohydrate-builder.html",
    "phospholipid-builder-standalone.html": "tools/food-nutrition/phospholipid-builder-standalone.html",
    "lipid-builder-standalone.html": "tools/food-nutrition/lipid-builder-standalone.html",
    "enzyme-interactive.html": "tools/enzyme-interactive.html",
    "plant-cell.html": "tools/cell-models/plant-cell.html",
    "animal-cell.html": "tools/cell-models/animal-cell.html",
    "prokaryote.html": "tools/cell-models/prokaryote.html",
    "eukaryote.html": "tools/cell-models/eukaryote.html",
    "virtual-microscope-lab.html": "tools/cells/virtual-microscope-lab.html",
  };

  if (window.self === window.top) {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "";
    const search = window.location.search || "";

    if (page === "in-class-test-hub.html") {
      const root = new URL("../../", window.location.href);
      window.location.replace(`${root.href}#inclasstest`);
      return;
    }

    if (page === "in-class-test.html") {
      const root = new URL("../../", window.location.href);
      window.location.replace(`${root.href}#inclasstest/osmosis/in-class-test.html${search}`);
      return;
    }

    const route = STANDALONE_ROUTES[page];
    const skipPlatformRedirect =
      search.includes("standalone=1") || page === "enzyme-interactive-standalone.html";
    if (route && !skipPlatformRedirect) {
      const inFoodNutrition = path.includes("/food-nutrition/");
      const inEnzymes = path.includes("/enzymes/");
      const inCellModels = path.includes("/cell-models/");
      const inCells = path.includes("/cells/");
      const root = new URL(inFoodNutrition || inEnzymes || inCellModels || inCells ? "../../../" : "../../", window.location.href);
      window.location.replace(`${root.href}#${route}`);
      return;
    }
  }

  if (window.self !== window.top) {
    document.documentElement.classList.add("bio-embed");
  }
})();
