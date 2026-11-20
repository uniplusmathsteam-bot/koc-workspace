(function () {
  var BLUE = JM33.BLUE, AMBER = JM33.AMBER, GOLD = JM33.GOLD;
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
          api.desc("\\text{Find the distance between }A\\text{ and }B");
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
        api.line(1, 1, 5, 4, { color: VIOLET, width: 5 });
        api.step();
        api.poly([[1, 1], [5, 1], [5, 4]], { fill: "rgba(79,195,247,0.13)" });
        api.together(function () {
          api.line(1, 1, 5, 1, { color: BLUE, width: 5 });
          api.label(3, 1, { anchor: "mid", dy: 22, parts: [{ tex: "4", id: "run", color: BLUE }] });
        });
        api.together(function () {
          api.line(5, 1, 5, 4, { color: AMBER, width: 5 });
          api.label(5, 2.5, { dx: 12, dy: -10, parts: [{ tex: "3", id: "rise", color: AMBER }] });
        });
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
        api.formula([{ w: "d=\\sqrt{25}=5", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Find the distance between }(3,a)\\text{ and }(2,a-1)");
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
        api.line(3, 2, 2, 1, { color: VIOLET, width: 4 });
        api.step();
        api.line(3, 2, 2, 2, { color: BLUE, width: 4 });
        api.line(2, 2, 2, 1, { color: AMBER, width: 4 });
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
        api.formula([{ w: "d=\\sqrt{(-1)^2+(-1)^2}=\\sqrt{2}", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Find the slope of }AB");
          api.plane({ x0: -0.6, x1: 6.8, y0: -1.5, y1: 5.3 });
        });
        api.together(function () {
          pt(1, 1, [{ tex: "A", color: BLUE }], { color: BLUE, dx: -22, dy: 10 })(api);
          pt(5, 4, [{ tex: "B", color: AMBER }], { color: AMBER, dx: 10, dy: -26 })(api);
        });
        api.line(1, 1, 5, 4, { color: VIOLET, width: 5 });
        api.step();
        api.poly([[1, 1], [5, 1], [5, 4]], { fill: "rgba(206,147,216,0.13)" });
        api.together(function () {
          api.line(1, 1, 5, 1, { color: BLUE, width: 5 });
          api.label(3, 1, { anchor: "mid", dy: 20, parts: [{ tex: "4", id: "run", color: BLUE }] });
        });
        api.together(function () {
          api.line(5, 1, 5, 4, { color: AMBER, width: 5 });
          api.label(5, 2.5, { dx: 12, dy: -8, parts: [{ tex: "3", id: "rise", color: AMBER }] });
        });
        api.step();
        api.formula([
          { w: "m=", color: INK },
          { frac: { num: { fly: "rise" }, den: { fly: "run" } } }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Arrange the slopes from smallest to largest}");
          api.plane({ x0: -0.8, x1: 8.4, y0: -2.4, y1: 4.4 });
        });
        api.line(1, 3, 2, 1, { color: PINK, width: 4 });
        api.label(2.15, 1.7, { parts: [{ tex: "-2", id: "m2", color: PINK }] });
        api.line(0, 2, 4, 0, { color: AMBER, width: 4 });
        api.label(0.55, 0.78, { anchor: "mid", parts: [{ tex: "-\\dfrac{1}{2}", id: "mh", color: AMBER }] });
        api.line(0, -1.4, 4, -1.4, { color: BLUE, width: 4 });
        api.label(2, -1.4, { anchor: "mid", dy: 18, parts: [{ tex: "0", id: "mz", color: BLUE }] });
        api.line(4.2, 0.2, 6.2, 2.2, { color: INK, width: 4 });
        api.label(5.05, 1.55, { parts: [{ tex: "1", id: "mp", color: INK }] });
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
          api.desc("\\text{The line cuts the axes at }(-8,0)\\text{ and }(0,2).\\\\ \\text{Find the slope}");
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
        api.step();
        api.line(-8, 0, 0, 0, { color: BLUE, width: 3, dash: true });
        api.line(0, 0, 0, 2, { color: AMBER, width: 3, dash: true });
        api.step();
        api.formula([
          { w: "m=-", color: INK },
          { frac: { num: { w: "c", color: AMBER }, den: { w: "a", color: BLUE } } }
        ]);
        api.step();
        api.formula([
          { w: "m=-", color: INK },
          { frac: {
            num: { fly: "c" },
            den: [{ w: "(", color: BLUE }, { fly: "a" }, { w: ")", color: BLUE }]
          } },
          { w: "=\\dfrac{1}{4}", color: GOLD }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{The line through }(6,2)\\text{ has slope }-\\dfrac{2}{3}.\\\\ \\text{Find the intercepts}");
          api.plane({ x0: -0.8, x1: 10.4, y0: -0.8, y1: 7.2 });
        });
        api.together(function () {
          pt(6, 2, [
            { tex: "(", color: INK }, { tex: "6", id: "x0", color: BLUE },
            { tex: ",", color: INK }, { tex: "2", id: "y0", color: AMBER }, { tex: ")", color: INK }
          ], { color: INK, dx: 4, dy: -6 })(api);
          api.label(4.3, 4.15, { parts: [
            { tex: "m=", color: VIOLET },
            { tex: "-\\dfrac{2}{3}", id: "m", color: VIOLET }
          ] });
        });
        api.line(6, 2, 0, 6, { color: VIOLET, width: 4 });
        api.line(6, 2, 9, 0, { color: VIOLET, width: 3, dash: true });
        api.step();
        api.poly([[6, 2], [3, 2], [3, 4]], { fill: "rgba(206,147,216,0.14)" });
        api.line(6, 2, 3, 2, { color: BLUE, width: 4 });
        api.label(4.5, 2, { anchor: "mid", dy: 18, parts: [{ tex: "-3", id: "run", color: BLUE }] });
        api.line(3, 2, 3, 4, { color: AMBER, width: 4 });
        api.label(2.35, 3.05, { anchor: "mid", parts: [{ tex: "+2", id: "rise", color: AMBER }] });
        api.step();
        api.formula([
          { w: "y-", color: INK }, { fly: "y0" }, { w: "=", color: INK }, { fly: "m" },
          { w: "(x-", color: INK }, { fly: "x0" }, { w: ")", color: INK }
        ]);
        api.step();
        api.formula([
          { w: "x=0\\Rightarrow y=", color: AMBER }, { w: "6", color: AMBER },
          { w: "\\qquad y=0\\Rightarrow x=", color: BLUE }, { w: "9", color: BLUE }
        ]);
        api.together(function () {
          pt(0, 6, [{ tex: "(0,", color: INK }, { tex: "6", color: AMBER }, { tex: ")", color: INK }], { color: AMBER, dx: 8, dy: -26 })(api);
          pt(9, 0, [{ tex: "(", color: INK }, { tex: "9", color: BLUE }, { tex: ",0)", color: INK }], { color: BLUE, dx: -8, dy: 14 })(api);
        });
        api.step();
        api.formula([{ w: "\\therefore\\;y=-\\dfrac{2}{3}x+6", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Do }A\\text{, }B\\text{ and }C\\text{ lie on one straight line?}");
          api.plane({ x0: -6.2, x1: 12.2, y0: -9, y1: 13, grid: 2 });
        });
        api.line(-4, 11, 10, -7, { color: VIOLET, width: 4 });
        api.together(function () {
          pt(10, -7, [{ tex: "A", color: BLUE }], { color: BLUE, dx: 14, dy: 14 })(api);
          pt(3, 2, [{ tex: "B", color: AMBER }], { color: AMBER, dx: 18, dy: -32 })(api);
          pt(-4, 11, [{ tex: "C", color: INK }], { color: INK, dx: -22, dy: 12 })(api);
        });
        api.label(7.35, -1.7, { parts: [{ tex: "-\\dfrac{9}{7}", id: "mab", color: VIOLET }] });
        api.label(0.35, 7.15, { parts: [{ tex: "-\\dfrac{9}{7}", id: "mbc", color: VIOLET }] });
        api.step();
        api.formula([
          { w: "m_{AB}=", color: INK }, { fly: "mab" },
          { w: "=m_{BC}", color: INK }
        ]);
        api.step();
        api.formula([{ w: "\\text{and }AB,\\,BC\\text{ both pass through }B", color: GOLD }]);
        api.step();
        api.formula([{ w: "\\therefore\\;A,\\,B,\\,C\\text{ are collinear}", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{P, }Q\\text{ and }R\\text{ lie on one line. Find }r");
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
          ], { color: INK, dx: 10, dy: -28 })(api);
        });
        api.step();
        api.formula([
          { w: "m_{PQ}=", color: INK },
          { frac: {
            num: [{ fly: "qy" }, { w: "-", color: INK }, { w: "(", color: INK }, { fly: "py" }, { w: ")", color: INK }],
            den: [{ fly: "qx" }, { w: "-", color: INK }, { w: "(", color: INK }, { fly: "px" }, { w: ")", color: INK }]
          } },
          { w: "=\\dfrac{3}{7}", color: INK }
        ]);
        api.step();
        api.formula([
          { frac: {
            num: [{ fly: "ry" }, { w: "-", color: INK }, { w: "(", color: INK }, { fly: "qy" }, { w: ")", color: INK }],
            den: [{ fly: "rx" }, { w: "-", color: INK }, { fly: "qx" }]
          } },
          { w: "=\\dfrac{3}{7}", color: INK }
        ]);
        api.step();
        api.formula([{ w: "\\therefore\\;r-2=7\\qquad r=9", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Lines through }C(4,6)\\text{ cut the y-axis}\\\\ \\text{at }12\\text{ and }{-8}\\text{. Find the area}");
          api.plane({ x0: -1.2, x1: 6.4, y0: -9.5, y1: 13.5, grid: 2 });
        });
        api.line(4, 6, 0, 12, { color: VIOLET, width: 4 });
        api.line(4, 6, 0, -8, { color: PINK, width: 4 });
        api.line(0, -8, 0, 12, { color: AMBER, width: 6 });
        api.together(function () {
          pt(4, 6, [
            { tex: "C(", color: INK }, { tex: "4", color: BLUE },
            { tex: ",", color: INK }, { tex: "6", color: AMBER }, { tex: ")", color: INK }
          ], { color: INK, dx: 8, dy: -8 })(api);
          pt(0, 12, [{ tex: "12", id: "top", color: AMBER }], { color: AMBER, dx: -36, dy: -22 })(api);
          pt(0, -8, [{ tex: "-8", id: "bot", color: AMBER }], { color: AMBER, dx: -40, dy: 8 })(api);
        });
        api.poly([[0, 12], [0, -8], [4, 6]], { fill: "rgba(255,213,79,0.14)" });
        api.step();
        api.line(4, 6, 0, 6, { color: BLUE, width: 3, dash: true });
        api.label(2, 6.5, { parts: [{ tex: "4", id: "h", color: BLUE }] });
        api.step();
        api.formula([
          { w: "\\text{base}=", color: AMBER }, { fly: "top" }, { w: "-", color: AMBER }, { w: "(", color: AMBER },
          { fly: "bot" }, { w: ")=", color: AMBER }, { w: "20", id: "base", color: AMBER }
        ]);
        api.step();
        api.formula([
          { w: "\\text{area}=\\dfrac{1}{2}\\times", color: INK }, { fly: "base" },
          { w: "\\times", color: INK }, { fly: "h" }, { w: "=40", color: GOLD }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{The circle has centre }B\\text{ and passes through }A.\\\\ \\text{Is }C\\text{ inside?}");
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
        api.line(1, 3, 5, 0, { color: VIOLET, width: 4 });
        api.label(3.3, 1.15, { parts: [{ tex: "r", color: VIOLET }] });
        api.step();
        api.line(1, 3, 4, 6, { color: PINK, width: 3, dash: true });
        api.step();
        api.formula([
          { w: "r^2=(", color: INK }, { fly: "ax" }, { w: "-", color: INK }, { fly: "hx" },
          { w: ")^2+(", color: INK }, { fly: "ay" }, { w: "-", color: INK }, { fly: "hy" },
          { w: ")^2=25", color: INK }
        ]);
        api.step();
        api.formula([
          { w: "BC^2=(", color: INK }, { fly: "cx" }, { w: "-", color: INK }, { fly: "hx" },
          { w: ")^2+(", color: INK }, { fly: "cy" }, { w: "-", color: INK }, { fly: "hy" },
          { w: ")^2=18", color: INK }
        ]);
        api.step();
        api.formula([{ w: "BC^2<r^2\\quad\\therefore\\;C\\text{ is inside}", color: GOLD }]);
        api.step();
        api.circle(1, 3, 5, { color: VIOLET, width: 3 });
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Start from }(4,-2).\\\\ \\text{Write the image of each move}");
          api.plane({ x0: -5.4, x1: 5.6, y0: -5.4, y1: 5.2 });
        });
        api.together(function () {
          pt(4, -2, [
            { tex: "(", color: INK }, { tex: "4", id: "x", color: BLUE },
            { tex: ",", color: INK }, { tex: "-2", id: "y", color: AMBER }, { tex: ")", color: INK }
          ], { color: INK, dx: 8, dy: 6 })(api);
          pt(-2, -4, [{ tex: "\\text{clockwise }90^\\circ", color: GOLD }], { color: INK, dx: 10, dy: 10 })(api);
          pt(2, 4, [{ tex: "\\text{anti-clockwise }90^\\circ", color: GOLD }], { color: INK, dx: 10, dy: -28 })(api);
          pt(-4, 2, [{ tex: "\\text{half turn}", color: GOLD }], { color: INK, dx: 10, dy: -24 })(api);
          pt(4, 2, [{ tex: "\\text{reflect in }x", color: GOLD }], { color: INK, dx: 10, dy: -24 })(api);
          pt(-4, -2, [{ tex: "\\text{reflect in }y", color: GOLD }], { color: INK, dx: 10, dy: 8 })(api);
        });
        api.step();
        api.formula([
          { w: "\\text{clockwise }90^\\circ\\;(y,-x)=(", color: GOLD }, { fly: "y" },
          { w: ",-", color: GOLD }, { fly: "x" }, { w: ")", color: GOLD }
        ]);
        api.step();
        api.formula([
          { w: "\\text{anti-clockwise }90^\\circ\\;(-y,x)=(-(", color: GOLD }, { fly: "y" },
          { w: "),", color: GOLD }, { fly: "x" }, { w: ")=(2,4)", color: GOLD }
        ]);
        api.step();
        api.formula([{ w: "\\text{half turn }180^\\circ\\;(-x,-y)", color: GOLD }]);
        api.step();
        api.formula([{ w: "\\text{reflect in the }x\\text{-axis }(x,-y)", color: GOLD }]);
        api.step();
        api.formula([{ w: "\\text{reflect in the }y\\text{-axis }(-x,y)", color: GOLD }]);
        api.step();
        api.formula([
          { w: "\\text{translate up by }t\\;(", color: GOLD }, { fly: "x" },
          { w: ",", color: GOLD }, { fly: "y" }, { w: "+t)", color: GOLD }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{A}(4,-2)\\text{ is rotated clockwise }90^\\circ\\text{ about }O\\text{ to }B.\\\\ \\text{Move }B\\text{ up by }t\\text{ so }C\\text{ lies on }OA\\text{. Find }t");
          api.plane({ x0: -4.2, x1: 6.2, y0: -5.2, y1: 2.6 });
        });
        api.line(0, 0, 4, -2, { color: BLUE, width: 4 });
        api.together(function () {
          pt(0, 0, [{ tex: "O", color: MUTED }], { color: MUTED, dx: -22, dy: 12 })(api);
          pt(4, -2, [
            { tex: "A(", color: INK }, { tex: "4", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "-2", id: "ay", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: 6 })(api);
        });
        api.step();
        api.formula([
          { w: "\\text{slope of }OA=", color: INK },
          { frac: { num: { fly: "ay" }, den: { fly: "ax" } } },
          { w: "=-1/2", color: INK }
        ]);
        api.step();
        pt(-2, -4, [
          { tex: "B(", color: INK }, { tex: "-2", id: "bx", color: BLUE },
          { tex: ",", color: INK }, { tex: "-4", id: "by", color: AMBER }, { tex: ")", color: INK }
        ], { color: PINK, dx: -92, dy: 8 })(api);
        api.formula([
          { w: "B=(", color: INK }, { fly: "ay" }, { w: ",-", color: INK }, { fly: "ax" }, { w: ")", color: INK }
        ]);
        api.step();
        api.line(0, 0, -2, 1, { color: BLUE, width: 4 });
        api.line(-2, -4, -2, 1, { color: AMBER, width: 3, dash: true });
        api.label(-2.7, -1.5, { parts: [{ tex: "t", color: AMBER }] });
        pt(-2, 1, [{ tex: "C", color: INK }], { color: INK, dx: -22, dy: -22 })(api);
        api.formula([{ w: "\\text{C lies on }OA\\text{, so slope of }OC=\\text{slope of }OA", color: INK }]);
        api.step();
        api.formula([
          { w: "(", color: INK }, { fly: "by" }, { w: "+", color: INK }, { w: "t", color: AMBER },
          { w: ")/(", color: INK }, { fly: "bx" }, { w: ")", color: INK },
          { w: "=-1/2", color: INK }
        ]);
        api.step();
        api.formula([{ w: "\\therefore\\;-4+t=1\\qquad t=5", color: GOLD }]);
      }
    ]
  });
})();
