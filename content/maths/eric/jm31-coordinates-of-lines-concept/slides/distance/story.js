(function () {
  var BLUE = JM33.BLUE, AMBER = JM33.AMBER, GREEN = JM33.GREEN;
  var PINK = JM33.PINK, VIOLET = JM33.VIOLET, INK = JM33.INK, MUTED = JM33.MUTED;

  function pt(x, y, parts, opt) {
    opt = opt || {};
    return function (api) {
      api.dot(x, y, {
        color: opt.color || INK,
        dx: opt.dx, dy: opt.dy, anchor: opt.anchor, r: opt.r,
        parts: parts
      });
    };
  }

  JM33.start({
    title: "Distance, Slope, and the Line",
    slides: [
      function (api) {
        api.together(function () {
          api.desc("\\text{Distance between two points}");
          api.plane({ x0: -0.6, x1: 6.8, y0: -1.4, y1: 5.3 });
        });
        api.together(function () {
          pt(1, 1, [
            { tex: "A(", color: INK }, { tex: "1", id: "x1", color: BLUE },
            { tex: ",", color: INK }, { tex: "1", id: "y1", color: AMBER },
            { tex: ")", color: INK }
          ], { color: BLUE, dx: -86, dy: 8 })(api);
          pt(5, 4, [
            { tex: "B(", color: INK }, { tex: "5", id: "x2", color: BLUE },
            { tex: ",", color: INK }, { tex: "4", id: "y2", color: AMBER },
            { tex: ")", color: INK }
          ], { color: AMBER, dx: 12, dy: -32 })(api);
        });
        api.poly([[1, 1], [5, 1], [5, 4]], { fill: "rgba(79,195,247,0.13)" });
        api.together(function () {
          api.line(1, 1, 5, 1, { color: BLUE, width: 5 });
          api.label(3, 1, { anchor: "mid", dy: 22, parts: [{ tex: "4", id: "run", color: BLUE }] });
        });
        api.together(function () {
          api.line(5, 1, 5, 4, { color: AMBER, width: 5 });
          api.label(5, 2.5, { dx: 12, dy: -10, parts: [{ tex: "3", id: "rise", color: AMBER }] });
        });
        api.line(1, 1, 5, 4, { color: GREEN, width: 5 });
        api.right(5, 1, -1, 0, 0, 1);
        api.step();
        api.formula([{ w: "d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}" }]);
        api.step();
        api.formula([
          { w: "d^2=", color: INK },
          { fly: "run" }, { w: "{}^2+", color: INK },
          { fly: "rise" }, { w: "{}^2=25", color: INK }
        ]);
        api.step();
        api.formula([{ w: "d=\\sqrt{25}=5", color: GREEN }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{The letter cancels, leaving a surd}");
          api.plane({ x0: 0.4, x1: 4.6, y0: -0.4, y1: 3.4 });
        });
        api.together(function () {
          pt(3, 2, [
            { tex: "(", color: INK }, { tex: "3", id: "xA", color: BLUE },
            { tex: ",", color: INK }, { tex: "a", id: "yA", color: AMBER },
            { tex: ")", color: INK }
          ], { color: BLUE, dx: 10, dy: -30 })(api);
          pt(2, 1, [
            { tex: "(", color: INK }, { tex: "2", id: "xB", color: BLUE },
            { tex: ",", color: INK }, { tex: "a-1", id: "yB", color: AMBER },
            { tex: ")", color: INK }
          ], { color: AMBER, dx: 12, dy: 16 })(api);
        });
        api.line(3, 2, 2, 2, { color: BLUE, width: 4 });
        api.line(2, 2, 2, 1, { color: AMBER, width: 4 });
        api.line(3, 2, 2, 1, { color: GREEN, width: 4 });
        api.step();
        api.formula([
          { w: "\\Delta x=", color: BLUE }, { fly: "xB" }, { w: "-", color: INK }, { fly: "xA" },
          { w: "=-1", color: BLUE }
        ]);
        api.step();
        api.formula([
          { w: "\\Delta y=", color: AMBER }, { fly: "yB" },
          { w: "-", color: INK }, { fly: "yA" }, { w: "=-1", color: AMBER }
        ]);
        api.step();
        api.formula([{ w: "d=\\sqrt{(-1)^2+(-1)^2}=\\sqrt{2}" }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{A right angle from the lengths}");
          api.plane({ x0: -3.2, x1: 3.4, y0: -2.2, y1: 5.2 });
        });
        api.together(function () {
          pt(1, 4, [{ tex: "A(1,4)", color: BLUE }], { color: BLUE, dx: 8, dy: -22 })(api);
          pt(2, 3, [{ tex: "B(2,3)", color: AMBER }], { color: AMBER, dx: 10, dy: 4 })(api);
          pt(-2, -1, [{ tex: "C(-2,-1)", color: GREEN }], { color: GREEN, dx: 8, dy: 4 })(api);
        });
        api.line(1, 4, 2, 3, { color: BLUE, width: 4 });
        api.line(2, 3, -2, -1, { color: AMBER, width: 4 });
        api.line(1, 4, -2, -1, { color: GREEN, width: 4 });
        api.right(2, 3, -1, 1, -1, -1, { s: 0.32 });
        api.label(2.55, 3.85, { parts: [{ tex: "AB^2=", color: BLUE }, { tex: "2", id: "ab", color: BLUE }] });
        api.label(0.15, 0.55, { parts: [{ tex: "BC^2=", color: AMBER }, { tex: "32", id: "bc", color: AMBER }] });
        api.label(-1.55, 2.15, { parts: [{ tex: "AC^2=", color: GREEN }, { tex: "34", id: "ac", color: GREEN }] });
        api.step();
        api.formula([{ w: "AB^2+BC^2=AC^2", color: INK }]);
        api.step();
        api.formula([
          { fly: "ab" }, { w: "+", color: INK }, { fly: "bc" }, { w: "=", color: INK }, { fly: "ac" }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Slope is rise over run}");
          api.plane({ x0: -0.6, x1: 6.8, y0: -1.5, y1: 5.3 });
        });
        api.together(function () {
          pt(1, 1, [{ tex: "A", color: BLUE }], { color: BLUE, dx: -22, dy: 10 })(api);
          pt(5, 4, [{ tex: "B", color: AMBER }], { color: AMBER, dx: 10, dy: -26 })(api);
        });
        api.poly([[1, 1], [5, 1], [5, 4]], { fill: "rgba(206,147,216,0.13)" });
        api.together(function () {
          api.line(1, 1, 5, 1, { color: BLUE, width: 5 });
          api.label(3, 1, { anchor: "mid", dy: 20, parts: [{ tex: "4", id: "run", color: BLUE }] });
        });
        api.together(function () {
          api.line(5, 1, 5, 4, { color: AMBER, width: 5 });
          api.label(5, 2.5, { dx: 12, dy: -8, parts: [{ tex: "3", id: "rise", color: AMBER }] });
        });
        api.line(1, 1, 5, 4, { color: VIOLET, width: 5 });
        api.step();
        api.formula([
          { w: "m=", color: VIOLET },
          { frac: { num: { fly: "rise" }, den: { fly: "run" } } }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Compare slopes}");
          api.plane({ x0: -0.8, x1: 8.4, y0: -2.4, y1: 4.4 });
        });
        api.line(1, 3, 2, 1, { color: PINK, width: 4 });
        api.label(2.15, 1.7, { parts: [{ tex: "-2", id: "m2", color: PINK }] });
        api.line(0, 2, 4, 0, { color: AMBER, width: 4 });
        api.label(1.2, 0.15, { parts: [{ tex: "-\\dfrac{1}{2}", id: "mh", color: AMBER }] });
        api.line(0, -1.4, 4, -1.4, { color: BLUE, width: 4 });
        api.label(2, -1.4, { anchor: "mid", dy: 18, parts: [{ tex: "0", id: "mz", color: BLUE }] });
        api.line(4.2, 0.2, 6.2, 2.2, { color: GREEN, width: 4 });
        api.label(6.3, 1.5, { parts: [{ tex: "1", id: "mp", color: GREEN }] });
        api.line(7.2, -0.4, 7.2, 3.2, { color: VIOLET, width: 4 });
        api.label(7.35, 1.4, { parts: [{ tex: "\\text{no }m", id: "mu", color: VIOLET }] });
        api.step();
        api.formula([
          { fly: "m2" }, { w: "<", color: INK }, { fly: "mh" },
          { w: "<", color: INK }, { fly: "mz" }, { w: "<", color: INK }, { fly: "mp" }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Slope from the two intercepts}");
          api.plane({ x0: -9.2, x1: 2.4, y0: -1.6, y1: 3.6 });
        });
        api.line(-8, 0, 0, 2, { color: VIOLET, width: 4 });
        api.together(function () {
          pt(-8, 0, [
            { tex: "(", color: INK }, { tex: "-8", id: "a", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: -28, dy: 14 })(api);
          pt(0, 2, [
            { tex: "(", color: INK }, { tex: "0", color: BLUE },
            { tex: ",", color: INK }, { tex: "2", id: "c", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: 10, dy: -28 })(api);
        });
        api.line(-8, 0, 0, 0, { color: BLUE, width: 3, dash: true });
        api.line(0, 0, 0, 2, { color: AMBER, width: 3, dash: true });
        api.step();
        api.formula([
          { w: "m=", color: VIOLET },
          { frac: {
            num: [{ fly: "c" }, { w: "-", color: VIOLET }, { w: "0", color: VIOLET }],
            den: [{ w: "0-(", color: VIOLET }, { fly: "a" }, { w: ")", color: VIOLET }]
          } },
          { w: "=\\dfrac{1}{4}", color: VIOLET }
        ]);
        api.step();
        api.formula([
          { w: "m=-\\dfrac{c}{a}=-", color: VIOLET },
          { frac: { num: { fly: "c" }, den: { fly: "a" } } },
          { w: "=\\dfrac{1}{4}", color: GREEN }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{A point and a slope meet both axes}");
          api.plane({ x0: -0.8, x1: 10.4, y0: -0.8, y1: 7.2 });
        });
        api.together(function () {
          pt(6, 2, [
            { tex: "(", color: INK }, { tex: "6", id: "x0", color: BLUE },
            { tex: ",", color: INK }, { tex: "2", id: "y0", color: AMBER }, { tex: ")", color: INK }
          ], { color: INK, dx: 8, dy: 10 })(api);
          api.label(7.3, 3.15, { parts: [{ tex: "m=-\\dfrac{2}{3}", id: "m", color: VIOLET }] });
        });
        api.poly([[6, 2], [3, 2], [3, 4]], { fill: "rgba(206,147,216,0.14)" });
        api.line(6, 2, 3, 2, { color: BLUE, width: 4 });
        api.label(4.5, 2, { anchor: "mid", dy: 18, parts: [{ tex: "-3", id: "run", color: BLUE }] });
        api.line(3, 2, 3, 4, { color: AMBER, width: 4 });
        api.label(3, 3, { dx: 10, dy: -8, parts: [{ tex: "+2", id: "rise", color: AMBER }] });
        api.line(6, 2, 0, 6, { color: VIOLET, width: 4 });
        api.line(6, 2, 9, 0, { color: VIOLET, width: 3, dash: true });
        api.together(function () {
          pt(0, 6, [{ tex: "(0,6)", id: "yi", color: AMBER }], { color: AMBER, dx: 8, dy: -26 })(api);
          pt(9, 0, [{ tex: "(9,0)", id: "xi", color: BLUE }], { color: BLUE, dx: -8, dy: 14 })(api);
        });
        api.step();
        api.formula([
          { w: "y-", color: INK }, { fly: "y0" }, { w: "=", color: INK }, { fly: "m" },
          { w: "(x-", color: INK }, { fly: "x0" }, { w: ")", color: INK }
        ]);
        api.step();
        api.formula([
          { w: "x=0\\Rightarrow y=6", color: AMBER },
          { w: "\\qquad y=0\\Rightarrow x=9", color: BLUE }
        ]);
        api.step();
        api.formula([{ w: "y=-\\dfrac{2}{3}x+6", color: VIOLET }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Same slope through one common point}");
          api.plane({ x0: -6.2, x1: 12.2, y0: -9, y1: 13, grid: 2 });
        });
        api.line(-4, 11, 10, -7, { color: VIOLET, width: 4 });
        api.together(function () {
          pt(10, -7, [{ tex: "A", color: BLUE }], { color: BLUE, dx: 14, dy: 14 })(api);
          pt(3, 2, [{ tex: "B", color: AMBER }], { color: AMBER, dx: 18, dy: -32 })(api);
          pt(-4, 11, [{ tex: "C", color: GREEN }], { color: GREEN, dx: -22, dy: 12 })(api);
        });
        api.label(8.1, -0.6, { parts: [{ tex: "-\\dfrac{9}{7}", id: "mab", color: VIOLET }] });
        api.label(-2.7, 4.4, { parts: [{ tex: "-\\dfrac{9}{7}", id: "mbc", color: VIOLET }] });
        api.step();
        api.formula([
          { w: "m_{AB}=", color: VIOLET }, { fly: "mab" },
          { w: "=m_{BC}", color: VIOLET }
        ]);
        api.step();
        api.formula([{ w: "\\text{and }AB,\\,BC\\text{ both pass through }B", color: AMBER }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{A missing coordinate on the line}");
          api.plane({ x0: -6.5, x1: 11, y0: -5.2, y1: 3.4 });
        });
        api.line(-5, -4, 9, 2, { color: VIOLET, width: 4 });
        api.together(function () {
          pt(-5, -4, [
            { tex: "P(", color: INK }, { tex: "-5", id: "px", color: BLUE },
            { tex: ",", color: INK }, { tex: "-4", id: "py", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: -96, dy: 8 })(api);
          pt(2, -1, [
            { tex: "Q(", color: INK }, { tex: "2", id: "qx", color: BLUE },
            { tex: ",", color: INK }, { tex: "-1", id: "qy", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: -20, dy: 14 })(api);
          pt(9, 2, [
            { tex: "R(", color: INK }, { tex: "r", id: "rx", color: BLUE },
            { tex: ",", color: INK }, { tex: "2", id: "ry", color: AMBER }, { tex: ")", color: INK }
          ], { color: GREEN, dx: 10, dy: -28 })(api);
        });
        api.step();
        api.formula([
          { w: "m_{PQ}=", color: VIOLET },
          { frac: {
            num: [{ fly: "qy" }, { w: "-", color: VIOLET }, { w: "(", color: VIOLET }, { fly: "py" }, { w: ")", color: VIOLET }],
            den: [{ fly: "qx" }, { w: "-", color: VIOLET }, { w: "(", color: VIOLET }, { fly: "px" }, { w: ")", color: VIOLET }]
          } },
          { w: "=\\dfrac{3}{7}", color: VIOLET }
        ]);
        api.step();
        api.formula([
          { frac: {
            num: [{ fly: "ry" }, { w: "-", color: VIOLET }, { w: "(", color: VIOLET }, { fly: "qy" }, { w: ")", color: VIOLET }],
            den: [{ fly: "rx" }, { w: "-", color: VIOLET }, { w: "2", color: VIOLET }]
          } },
          { w: "=\\dfrac{3}{7}", color: VIOLET }
        ]);
        api.step();
        api.formula([{ w: "r-2=7\\qquad r=9", color: BLUE }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Area when a side is on an axis}");
          api.plane({ x0: -1.2, x1: 6.4, y0: -9.5, y1: 13.5, grid: 2 });
        });
        api.line(4, 6, 0, 12, { color: VIOLET, width: 4 });
        api.line(4, 6, 0, -8, { color: PINK, width: 4 });
        api.line(0, -8, 0, 12, { color: AMBER, width: 6 });
        api.line(4, 6, 0, 6, { color: BLUE, width: 3, dash: true });
        api.together(function () {
          pt(4, 6, [{ tex: "C(4,6)", color: INK }], { color: INK, dx: 8, dy: -8 })(api);
          pt(0, 12, [{ tex: "12", id: "top", color: AMBER }], { color: AMBER, dx: -36, dy: -22 })(api);
          pt(0, -8, [{ tex: "-8", id: "bot", color: AMBER }], { color: AMBER, dx: -40, dy: 8 })(api);
        });
        api.label(2, 6.5, { parts: [{ tex: "4", id: "h", color: BLUE }] });
        api.poly([[0, 12], [0, -8], [4, 6]], { fill: "rgba(255,213,79,0.14)" });
        api.step();
        api.formula([
          { w: "\\text{base}=", color: AMBER }, { fly: "top" }, { w: "-", color: AMBER }, { w: "(", color: AMBER },
          { fly: "bot" }, { w: ")=20", color: AMBER }
        ]);
        api.step();
        api.formula([
          { w: "\\text{area}=\\dfrac{1}{2}\\times 20\\times", color: INK },
          { fly: "h" }, { w: "=40", color: INK }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Area from the three vertices}");
          api.plane({ x0: -0.8, x1: 5.4, y0: -0.8, y1: 4.2 });
        });
        api.poly([[0, 0], [4, 2], [1, 3]], { fill: "rgba(102,187,106,0.16)" });
        api.line(0, 0, 4, 2, { color: BLUE, width: 4 });
        api.line(4, 2, 1, 3, { color: AMBER, width: 4 });
        api.line(1, 3, 0, 0, { color: GREEN, width: 4 });
        api.together(function () {
          pt(0, 0, [
            { tex: "A(", color: INK }, { tex: "0", id: "x1", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", id: "y1", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: -78, dy: 8 })(api);
          pt(4, 2, [
            { tex: "B(", color: INK }, { tex: "4", id: "x2", color: BLUE },
            { tex: ",", color: INK }, { tex: "2", id: "y2", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: 8, dy: -8 })(api);
          pt(1, 3, [
            { tex: "C(", color: INK }, { tex: "1", id: "x3", color: BLUE },
            { tex: ",", color: INK }, { tex: "3", id: "y3", color: AMBER }, { tex: ")", color: INK }
          ], { color: GREEN, dx: -70, dy: -28 })(api);
        });
        api.step();
        api.formula([{ w: "\\dfrac{1}{2}\\left|x_1(y_2-y_3)+x_2(y_3-y_1)+x_3(y_1-y_2)\\right|" }]);
        api.step();
        api.formula([
          { w: "\\dfrac{1}{2}\\big|", color: INK }, { fly: "x1" },
          { w: "(", color: INK }, { fly: "y2" }, { w: "-", color: INK }, { fly: "y3" },
          { w: ")+", color: INK }, { fly: "x2" },
          { w: "(", color: INK }, { fly: "y3" }, { w: "-", color: INK }, { fly: "y1" },
          { w: ")+", color: INK }, { fly: "x3" },
          { w: "(", color: INK }, { fly: "y1" }, { w: "-", color: INK }, { fly: "y2" },
          { w: ")\\big|=5", color: INK }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Is the point inside the circle?}");
          api.plane({ x0: -1.2, x1: 7.2, y0: -1.2, y1: 7.4 });
        });
        api.together(function () {
          pt(1, 3, [
            { tex: "B(", color: INK }, { tex: "1", id: "hx", color: BLUE },
            { tex: ",", color: INK }, { tex: "3", id: "hy", color: AMBER }, { tex: ")", color: INK }
          ], { color: VIOLET, dx: -78, dy: -8 })(api);
          pt(5, 0, [
            { tex: "A(", color: INK }, { tex: "5", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", id: "ay", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: 8 })(api);
          pt(4, 6, [
            { tex: "C(", color: INK }, { tex: "4", id: "cx", color: BLUE },
            { tex: ",", color: INK }, { tex: "6", id: "cy", color: AMBER }, { tex: ")", color: INK }
          ], { color: PINK, dx: 8, dy: -26 })(api);
        });
        api.line(1, 3, 5, 0, { color: GREEN, width: 4 });
        api.line(1, 3, 4, 6, { color: PINK, width: 3, dash: true });
        api.label(3.3, 1.15, { parts: [{ tex: "r", id: "rad", color: GREEN }] });
        api.step();
        api.formula([
          { w: "r^2=(", color: GREEN }, { fly: "ax" }, { w: "-", color: GREEN }, { fly: "hx" },
          { w: ")^2+(", color: GREEN }, { fly: "ay" }, { w: "-", color: GREEN }, { fly: "hy" },
          { w: ")^2=25", color: GREEN }
        ]);
        api.step();
        api.formula([
          { w: "BC^2=(", color: PINK }, { fly: "cx" }, { w: "-", color: PINK }, { fly: "hx" },
          { w: ")^2+(", color: PINK }, { fly: "cy" }, { w: "-", color: PINK }, { fly: "hy" },
          { w: ")^2=18", color: PINK }
        ]);
        api.step();
        api.formula([{ w: "18<25\\quad\\text{inside}", color: INK }]);
        api.step();
        api.circle(1, 3, 5, { color: GREEN, width: 3 });
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Clockwise, reflect, or translate}");
          api.plane({ x0: -5.4, x1: 5.6, y0: -5.4, y1: 5.2 });
        });
        api.together(function () {
          pt(4, -2, [
            { tex: "(", color: INK }, { tex: "4", id: "x", color: BLUE },
            { tex: ",", color: INK }, { tex: "-2", id: "y", color: AMBER }, { tex: ")", color: INK }
          ], { color: INK, dx: 8, dy: 6 })(api);
          pt(-2, -4, [{ tex: "\\text{clockwise }90^\\circ", color: PINK }], { color: PINK, dx: 10, dy: 10 })(api);
          pt(2, 4, [{ tex: "\\text{anti-clockwise }90^\\circ", color: GREEN }], { color: GREEN, dx: 10, dy: -28 })(api);
          pt(-4, 2, [{ tex: "\\text{half turn}", color: AMBER }], { color: AMBER, dx: 10, dy: -24 })(api);
          pt(4, 2, [{ tex: "\\text{reflect in }x", color: VIOLET }], { color: VIOLET, dx: 10, dy: -24 })(api);
          pt(-4, -2, [{ tex: "\\text{reflect in }y", color: BLUE }], { color: BLUE, dx: 10, dy: 8 })(api);
        });
        api.step();
        api.formula([
          { w: "\\text{clockwise }90^\\circ\\;(y,-x)=(", color: PINK }, { fly: "y" },
          { w: ",-", color: PINK }, { fly: "x" }, { w: ")", color: PINK }
        ]);
        api.step();
        api.formula([
          { w: "\\text{anti-clockwise }90^\\circ\\;(-y,x)=(-(", color: GREEN }, { fly: "y" },
          { w: "),", color: GREEN }, { fly: "x" }, { w: ")=(2,4)", color: GREEN }
        ]);
        api.step();
        api.formula([{ w: "\\text{half turn }180^\\circ\\;(-x,-y)", color: AMBER }]);
        api.step();
        api.formula([{ w: "\\text{reflect in the }x\\text{-axis }(x,-y)", color: VIOLET }]);
        api.step();
        api.formula([{ w: "\\text{reflect in the }y\\text{-axis }(-x,y)", color: BLUE }]);
        api.step();
        api.formula([
          { w: "\\text{translate up by }t\\;(", color: INK }, { fly: "x" },
          { w: ",", color: INK }, { fly: "y" }, { w: "+t)", color: AMBER }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Turn clockwise, then move up onto the line}");
          api.plane({ x0: -4.2, x1: 6.2, y0: -5.2, y1: 2.6 });
        });
        api.line(0, 0, 4, -2, { color: BLUE, width: 4 });
        api.line(0, 0, -2, 1, { color: PINK, width: 4 });
        api.line(-2, -4, -2, 1, { color: MUTED, width: 3, dash: true });
        api.together(function () {
          pt(0, 0, [{ tex: "O", color: MUTED }], { color: MUTED, dx: -22, dy: 12 })(api);
          pt(4, -2, [
            { tex: "A(", color: INK }, { tex: "4", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "-2", id: "ay", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: 6 })(api);
          pt(-2, -4, [
            { tex: "B(", color: INK }, { tex: "-2", id: "bx", color: BLUE },
            { tex: ",", color: INK }, { tex: "-4", id: "by", color: AMBER }, { tex: ")", color: INK }
          ], { color: PINK, dx: -92, dy: 8 })(api);
          pt(-2, 1, [
            { tex: "C(-2,1)", color: GREEN }
          ], { color: GREEN, dx: -78, dy: -26 })(api);
        });
        api.step();
        api.formula([
          { w: "\\text{clockwise }B=(", color: PINK }, { fly: "ay" }, { w: ",-", color: PINK }, { fly: "ax" }, { w: ")", color: PINK }
        ]);
        api.step();
        api.formula([
          { w: "\\text{slope of }OA=", color: VIOLET },
          { frac: { num: { fly: "ay" }, den: { fly: "ax" } } },
          { w: "=-\\dfrac{1}{2}", color: VIOLET }
        ]);
        api.step();
        api.formula([
          { w: "\\text{up by }t\\text{ onto }OA:\\;(-4+t)/(", color: VIOLET }, { fly: "bx" },
          { w: ")=-\\dfrac{1}{2}", color: VIOLET }
        ]);
        api.step();
        api.formula([{ w: "-4+t=1\\qquad t=5", color: GREEN }]);
      }
    ]
  });
})();
