(function () {
  var BLUE = JM33.BLUE, AMBER = JM33.AMBER, GOLD = JM33.GOLD;
  var PINK = JM33.PINK, VIOLET = JM33.VIOLET, INK = JM33.INK, MUTED = JM33.MUTED;

  function dot(api, x, y, parts, opt) {
    opt = opt || {};
    api.dot(x, y, {
      color: opt.color || INK,
      dx: opt.dx, dy: opt.dy, anchor: opt.anchor,
      parts: parts
    });
  }

  JM33.start({
    title: "Parallel Lines, Ratios, and Centres",
    slides: [
      function (api) {
        api.together(function () {
          api.desc("\\text{Show that }AB\\text{ is parallel to }CD");
          api.plane({ x0: -1.2, x1: 8.6, y0: -2.8, y1: 7.2 });
        });
        api.line(1, 1, 7, 6, { color: VIOLET, width: 4 });
        dot(api, 7, 6, [{ tex: "A", color: INK }], { color: INK, dx: 8, dy: -24 });
        dot(api, 1, 1, [{ tex: "B", color: INK }], { color: INK, dx: -20, dy: 12 });
        api.line(6, 3, 0, -2, { color: PINK, width: 4 });
        dot(api, 6, 3, [
          { tex: "C(", color: INK }, { tex: "6", id: "cx", color: BLUE },
          { tex: ",", color: INK }, { tex: "3", id: "cy", color: AMBER }, { tex: ")", color: INK }
        ], { color: INK, dx: 12, dy: -30 });
        dot(api, 0, -2, [
          { tex: "D(", color: INK }, { tex: "0", id: "dx0", color: BLUE },
          { tex: ",", color: INK }, { tex: "-2", id: "dy0", color: AMBER }, { tex: ")", color: INK }
        ], { color: INK, dx: 10, dy: 10 });
        api.step();
        api.poly([[1, 1], [7, 1], [7, 6]], { fill: "rgba(206,147,216,0.12)" });
        api.label(4, 0.55, { anchor: "mid", parts: [{ tex: "6", id: "run", color: BLUE }] });
        api.label(7, 3.5, { dx: 14, dy: -10, parts: [{ tex: "5", id: "rise", color: AMBER }] });
        api.line(1, 1, 7, 1, { color: BLUE, width: 3 });
        api.line(7, 1, 7, 6, { color: AMBER, width: 3 });
        api.step();
        api.formula([
          { w: "m_{AB}=", color: INK },
          { frac: { num: { fly: "rise" }, den: { fly: "run" } } }
        ]);
        api.step();
        api.formula([
          { w: "m_{CD}=", color: INK },
          { frac: {
            num: [
              { fly: "cy" }, { w: "-(", color: INK }, { fly: "dy0" }, { w: ")", color: INK }
            ],
            den: [
              { fly: "cx" }, { w: "-", color: INK }, { fly: "dx0" }
            ]
          } },
          { w: "=\\dfrac{5}{6}", color: INK }
        ]);
        api.step();
        api.formula([{ w: "\\because\\;m_{AB}=m_{CD}", color: GOLD }]);
        api.step();
        api.formula([{ w: "\\therefore\\;AB\\,//\\,CD", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Show that the two lines are perpendicular}");
          api.plane({ x0: -0.8, x1: 4.6, y0: -0.8, y1: 5.6 });
        });
        api.line(0, 2, 3, 0, { color: VIOLET, width: 4 });
        api.line(0, 2, 2, 5, { color: PINK, width: 4 });
        api.label(0.55, 3.9, { parts: [{ tex: "\\dfrac{3}{2}", id: "m2", color: PINK }] });
        api.step();
        api.poly([[0, 2], [3, 2], [3, 0]], { fill: "rgba(206,147,216,0.16)" });
        api.line(0, 2, 3, 2, { color: BLUE, width: 4 });
        api.line(3, 2, 3, 0, { color: AMBER, width: 4 });
        api.right(0, 2, 3, -2, 2, 3, { s: 0.36 });
        api.label(1.5, 2, { anchor: "mid", dy: -18, parts: [{ tex: "3", id: "run", color: BLUE }] });
        api.label(3.15, 1, { parts: [{ tex: "-2", id: "rise", color: AMBER }] });
        api.step();
        api.formula([
          { w: "m_1=", color: INK },
          { frac: { num: { fly: "rise" }, den: { fly: "run" } } }
        ]);
        api.step();
        api.formula([
          { w: "m_2=", color: INK }, { fly: "m2" }
        ]);
        api.step();
        api.formula([
          { w: "\\because\\;", color: GOLD },
          { frac: { num: { fly: "rise" }, den: { fly: "run" } } },
          { w: "\\times", color: GOLD }, { fly: "m2" },
          { w: "=-1", color: GOLD }
        ]);
        api.step();
        api.formula([{ w: "\\therefore\\;\\text{the lines are perpendicular}", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{R lies on the }x\\text{-axis, and }RP=RQ\\text{. Find }r");
          api.plane({ x0: -12.5, x1: 7.5, y0: -9.5, y1: 7.5, grid: 2 });
        });
        api.line(-10, -8, -4, 0, { color: BLUE, width: 4 });
        api.line(4, 6, -4, 0, { color: AMBER, width: 4 });
        api.together(function () {
          dot(api, -10, -8, [
            { tex: "P(", color: INK }, { tex: "-10", id: "px", color: BLUE },
            { tex: ",", color: INK }, { tex: "-8", id: "py", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: 4 });
          dot(api, 4, 6, [
            { tex: "Q(", color: INK }, { tex: "4", id: "qx", color: BLUE },
            { tex: ",", color: INK }, { tex: "6", id: "qy", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: 8, dy: -24 });
          dot(api, -4, 0, [
            { tex: "R(", color: INK }, { tex: "r", id: "r", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", color: AMBER }, { tex: ")", color: INK }
          ], { color: INK, dx: -18, dy: 16 });
        });
        api.step();
        api.formula([{ w: "RP=RQ", color: INK }]);
        api.step();
        api.formula([
          { w: "(r-(", color: INK }, { fly: "px" }, { w: "))^2+(0-(", color: INK },
          { fly: "py" }, { w: "))^2", color: INK }
        ]);
        api.step();
        api.formula([
          { w: "=(r-", color: INK }, { fly: "qx" }, { w: ")^2+(0-", color: INK },
          { fly: "qy" }, { w: ")^2", color: INK }
        ]);
        api.step();
        api.formula([{ w: "(r+10)^2+64=(r-4)^2+36", color: INK }]);
        api.step();
        api.formula([{ w: "\\therefore\\;r=-4", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{M is the mid-point of }AB\\text{. Find }B");
          api.plane({ x0: -13.5, x1: 7.5, y0: -3.2, y1: 4.2, grid: 2 });
        });
        api.line(-11, 2, 5, -2, { color: VIOLET, width: 4 });
        api.together(function () {
          dot(api, -11, 2, [{ tex: "B", color: INK }], { color: INK, dx: 12, dy: -26 });
          dot(api, 5, -2, [
            { tex: "A(", color: INK }, { tex: "5", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "-2", id: "ay", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: 4 });
          dot(api, -3, 0, [
            { tex: "M(", color: INK }, { tex: "-3", id: "mx", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", id: "my", color: AMBER }, { tex: ")", color: INK }
          ], { color: INK, dx: -8, dy: -26 });
        });
        api.step();
        api.formula([{ w: "M=\\left(\\dfrac{x_A+x_B}{2},\\dfrac{y_A+y_B}{2}\\right)", color: INK }]);
        api.step();
        api.formula([{ w: "B=2M-A", color: INK }]);
        api.step();
        api.formula([
          { w: "\\therefore\\;B=2(", color: GOLD }, { fly: "mx" }, { w: ",", color: GOLD },
          { fly: "my" }, { w: ")-(", color: GOLD }, { fly: "ax" }, { w: ",", color: GOLD },
          { fly: "ay" }, { w: ")=(-11,2)", color: GOLD }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Find }P\\text{ on }AB\\text{, with }AP:PB=2:1");
          api.plane({ x0: -3.2, x1: 5.4, y0: -5.2, y1: 6.2 });
        });
        api.line(-2, -4, 4, 5, { color: MUTED, width: 4 });
        api.line(-2, -4, 2, 2, { color: BLUE, width: 6 });
        api.line(2, 2, 4, 5, { color: AMBER, width: 6 });
        api.together(function () {
          dot(api, -2, -4, [
            { tex: "A(", color: INK }, { tex: "-2", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "-4", id: "ay", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: -96, dy: 6 });
          dot(api, 4, 5, [
            { tex: "B(", color: INK }, { tex: "4", id: "bx", color: BLUE },
            { tex: ",", color: INK }, { tex: "5", id: "by", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: 8, dy: -24 });
          dot(api, 2, 2, [{ tex: "P", color: INK }], { color: INK, dx: 10, dy: 8 });
        });
        api.label(-0.4, -1.7, { parts: [{ tex: "2", id: "m", color: PINK }] });
        api.label(2.95, 3.65, { parts: [{ tex: "1", id: "n", color: VIOLET }] });
        api.step();
        api.formula([{ w: "AP:PB=m:n", color: INK }]);
        api.step();
        api.formula([{ w: "x=\\dfrac{nx_A+mx_B}{m+n}", color: INK }]);
        api.step();
        api.formula([{ w: "y=\\dfrac{ny_A+my_B}{m+n}", color: INK }]);
        api.step();
        api.formula([
          { w: "AP:PB=", color: INK }, { fly: "m" }, { w: ":", color: INK }, { fly: "n" }
        ]);
        api.step();
        api.formula([
          { w: "x=", color: INK },
          { frac: {
            num: [
              { fly: "n" }, { w: "\\times(", color: INK }, { fly: "ax" },
              { w: ")+", color: INK }, { fly: "m" }, { w: "\\times", color: INK }, { fly: "bx" }
            ],
            den: { w: "3", color: INK }
          } },
          { w: "=2", color: BLUE }
        ]);
        api.step();
        api.formula([
          { w: "y=", color: INK },
          { frac: {
            num: [
              { fly: "n" }, { w: "\\times(", color: INK }, { fly: "ay" },
              { w: ")+", color: INK }, { fly: "m" }, { w: "\\times", color: INK }, { fly: "by" }
            ],
            den: { w: "3", color: INK }
          } },
          { w: "=2", color: AMBER }
        ]);
        api.step();
        api.formula([{ w: "\\therefore\\;P=(2,\\,2)", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Find }P\\text{ on }AB\\text{, with }AP:AB=3:5");
          api.plane({ x0: -6, x1: 13, y0: -8.5, y1: 10, grid: 2 });
        });
        api.line(-4, 8, 11, -7, { color: VIOLET, width: 4 });
        api.together(function () {
          dot(api, -4, 8, [
            { tex: "A(", color: INK }, { tex: "-4", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "8", id: "ay", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: -78, dy: -24 });
          dot(api, 11, -7, [
            { tex: "B(", color: INK }, { tex: "11", id: "bx", color: BLUE },
            { tex: ",", color: INK }, { tex: "-7", id: "by", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: 8, dy: 4 });
          dot(api, 5, -1, [{ tex: "P", color: INK }], { color: INK, dx: 10, dy: -22 });
        });
        api.label(0.2, 4.4, { parts: [{ tex: "3", id: "part", color: PINK }] });
        api.label(8.4, -3.2, { parts: [{ tex: "2", id: "rest", color: VIOLET }] });
        api.step();
        api.formula([
          { w: "AP:AB=", color: INK }, { fly: "part" },
          { w: ":5\\Rightarrow AP:PB=", color: INK },
          { fly: "part" }, { w: ":", color: INK }, { fly: "rest" }
        ]);
        api.step();
        api.formula([
          { w: "x=", color: BLUE }, { fly: "ax" },
          { w: "+", color: BLUE },
          { frac: { num: { fly: "part" }, den: { w: "5", color: BLUE } } },
          { w: "(", color: BLUE }, { fly: "bx" },
          { w: "-(", color: BLUE }, { fly: "ax" }, { w: "))=5", color: BLUE }
        ]);
        api.step();
        api.formula([
          { w: "y=", color: AMBER }, { fly: "ay" },
          { w: "+", color: AMBER },
          { frac: { num: { fly: "part" }, den: { w: "5", color: AMBER } } },
          { w: "(", color: AMBER }, { fly: "by" },
          { w: "-", color: AMBER }, { fly: "ay" }, { w: ")=-1", color: AMBER }
        ]);
        api.step();
        api.formula([{ w: "\\therefore\\;P=(5,-1)", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{G is the centroid of triangle }ABC\\text{. Find }C");
          api.plane({ x0: -1.2, x1: 13.2, y0: -1.2, y1: 15.5, grid: 2 });
        });
        api.poly([[7, 14], [3, 8], [11, 2]], { fill: "rgba(79,195,247,0.12)" });
        api.line(7, 14, 3, 8, { color: INK, width: 3 });
        api.line(3, 8, 11, 2, { color: INK, width: 3 });
        api.line(11, 2, 7, 14, { color: INK, width: 3 });
        api.together(function () {
          dot(api, 7, 14, [
            { tex: "A(", color: INK }, { tex: "7", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "14", id: "ay", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: -22 });
          dot(api, 3, 8, [
            { tex: "B(", color: INK }, { tex: "3", id: "bx", color: BLUE },
            { tex: ",", color: INK }, { tex: "8", id: "by", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: -72, dy: -8 });
          dot(api, 11, 2, [{ tex: "C", color: INK }], { color: INK, dx: 8, dy: 6 });
          dot(api, 7, 8, [
            { tex: "G(", color: INK }, { tex: "7", id: "gx", color: BLUE },
            { tex: ",", color: INK }, { tex: "8", id: "gy", color: AMBER }, { tex: ")", color: INK }
          ], { color: INK, dx: -70, dy: 12 });
        });
        api.step();
        api.line(7, 14, 7, 5, { color: VIOLET, width: 3, dash: true });
        api.step();
        api.formula([{ w: "x_G=\\dfrac{x_A+x_B+x_C}{3}", color: INK }]);
        api.step();
        api.formula([{ w: "y_G=\\dfrac{y_A+y_B+y_C}{3}", color: INK }]);
        api.step();
        api.formula([{ w: "\\text{where }A,\\,B,\\,C\\text{ are the vertices}", color: GOLD }]);
        api.step();
        api.formula([
          { w: "x_C=3\\times", color: INK }, { fly: "gx" }, { w: "-", color: INK },
          { fly: "ax" }, { w: "-", color: INK }, { fly: "bx" }, { w: "=11", color: BLUE }
        ]);
        api.step();
        api.formula([
          { w: "y_C=3\\times", color: INK }, { fly: "gy" }, { w: "-", color: INK },
          { fly: "ay" }, { w: "-", color: INK }, { fly: "by" }, { w: "=2", color: AMBER }
        ]);
        api.step();
        api.formula([{ w: "\\therefore\\;C=(11,\\,2)", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Show that }BH\\text{ is perpendicular to }AC");
          api.plane({ x0: -4.5, x1: 14, y0: -1.6, y1: 10.5, grid: 2 });
        });
        api.line(-3, 0, 12, 0, { color: BLUE, width: 4 });
        api.line(6, 9, 12, 0, { color: INK, width: 3 });
        api.line(6, 9, -3, 0, { color: INK, width: 3 });
        api.together(function () {
          dot(api, -3, 0, [
            { tex: "B(", color: INK }, { tex: "-3", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: -78, dy: 12 });
          dot(api, 12, 0, [
            { tex: "C(", color: INK }, { tex: "12", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: -78, dy: -28 });
          dot(api, 6, 9, [
            { tex: "A(", color: INK }, { tex: "6", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "9", color: AMBER }, { tex: ")", color: INK }
          ], { color: INK, dx: 8, dy: -24 });
          dot(api, 6, 6, [
            { tex: "H(", color: INK }, { tex: "6", id: "hx", color: BLUE },
            { tex: ",", color: INK }, { tex: "6", color: AMBER }, { tex: ")", color: INK }
          ], { color: PINK, dx: 14, dy: 16 });
        });
        api.step();
        api.line(6, 0, 6, 9, { color: VIOLET, width: 3, dash: true });
        api.line(-3, 0, 6, 6, { color: PINK, width: 3, dash: true });
        api.step();
        api.label(9.9, 5.05, { parts: [{ tex: "-\\dfrac{3}{2}", id: "mac", color: VIOLET }] });
        api.label(2.2, 1.9, { anchor: "mid", parts: [{ tex: "\\dfrac{2}{3}", id: "malt", color: PINK }] });
        api.formula([
          { w: "m_{AC}=", color: INK }, { fly: "mac" },
          { w: "\\qquad m_{BH}=", color: INK }, { fly: "malt" }
        ]);
        api.step();
        api.formula([{ w: "\\because\\;\\left(-\\dfrac{3}{2}\\right)\\left(\\dfrac{2}{3}\\right)=-1", color: GOLD }]);
        api.step();
        api.formula([{ w: "\\therefore\\;BH\\perp AC", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Find the circumcentre of }\\triangle ABC");
          api.plane({ x0: -1.6, x1: 7.8, y0: -2.8, y1: 5.6 });
        });
        api.poly([[0, 0], [6, 0], [2, 4]], { fill: "rgba(255,213,79,0.12)" });
        api.line(0, 0, 6, 0, { color: BLUE, width: 4 });
        api.line(0, 0, 2, 4, { color: INK, width: 3 });
        api.line(6, 0, 2, 4, { color: INK, width: 3 });
        api.together(function () {
          dot(api, 0, 0, [
            { tex: "A(", color: INK }, { tex: "0", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: -78, dy: 16 });
          dot(api, 6, 0, [
            { tex: "B(", color: INK }, { tex: "6", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: 14 });
          dot(api, 2, 4, [
            { tex: "C(", color: INK }, { tex: "2", color: BLUE },
            { tex: ",", color: INK }, { tex: "4", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: 10, dy: -30 });
        });
        api.step();
        api.line(3, 0, 3, 4.6, { color: VIOLET, width: 3, dash: true });
        dot(api, 3, 0, [
          { tex: "M(", color: INK }, { tex: "3", color: BLUE },
          { tex: ",", color: INK }, { tex: "0", color: AMBER }, { tex: ")", color: INK }
        ], { color: INK, dx: -8, dy: 18 });
        api.formula([
          { w: "\\text{AB is horizontal}\\Rightarrow\\text{bisector }", color: INK },
          { w: "x=3", color: INK }
        ]);
        api.step();
        api.label(0.95, 2.55, { anchor: "end", parts: [
          { tex: "m=", color: INK }, { tex: "2", id: "ms", color: INK }
        ] });
        api.formula([
          { w: "m_{AC}=", color: INK }, { fly: "ms" },
          { w: "\\qquad 2\\times m=-1", color: INK }
        ]);
        api.step();
        api.line(1, 2, 4, 0.5, { color: PINK, width: 3, dash: true });
        api.formula([
          { w: "m=-\\dfrac{1}{2}", color: INK },
          { w: "\\quad\\text{mid-point of }AC=(1,2)", color: INK }
        ]);
        api.step();
        api.formula([{ w: "y-2=-\\dfrac{1}{2}(3-1)=-1", color: INK }]);
        api.step();
        dot(api, 3, 1, [{ tex: "O", color: INK }], { color: INK, dx: 12, dy: -8 });
        api.formula([{ w: "O=(3,1)", color: INK }]);
        api.step();
        api.formula([{ w: "OA=\\sqrt{3^2+1^2}=\\sqrt{10}", color: INK }]);
        api.formula([{ w: "OB=OC=\\sqrt{10}", color: INK }]);
        api.step();
        api.circle(3, 1, Math.sqrt(10), { color: VIOLET, fill: "none", width: 3 });
        api.step();
        api.formula([{ w: "\\therefore\\;O=(3,1)\\text{ is the circumcentre}", color: GOLD }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{The axes are cut at }(6,0)\\text{ and }(0,8).\\\\ \\text{Find the in-radius and the in-centre}");
          api.plane({ x0: -1.2, x1: 8.2, y0: -1.4, y1: 9.2 });
        });
        api.poly([[0, 0], [6, 0], [0, 8]], { fill: "rgba(244,143,177,0.14)" });
        api.line(0, 0, 6, 0, { color: BLUE, width: 5 });
        api.line(0, 0, 0, 8, { color: AMBER, width: 5 });
        api.line(6, 0, 0, 8, { color: VIOLET, width: 4 });
        api.together(function () {
          dot(api, 0, 0, [{ tex: "P", color: INK }], { color: INK, dx: -18, dy: 10 });
          dot(api, 6, 0, [
            { tex: "Q(", color: INK }, { tex: "6", id: "q", color: BLUE },
            { tex: ",", color: INK }, { tex: "0", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: 10 });
          dot(api, 0, 8, [
            { tex: "R(", color: INK }, { tex: "0", color: BLUE },
            { tex: ",", color: INK }, { tex: "8", id: "rlen", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: -86, dy: -22 });
          dot(api, 2, 2, [{ tex: "I", color: INK }], { color: INK, dx: 12, dy: -22 });
        });
        api.step();
        api.label(3.6, 4.5, { parts: [{ tex: "10", id: "hyp", color: VIOLET }] });
        api.formula([
          { w: "RQ^2=", color: INK }, { fly: "q" }, { w: "^2+", color: INK },
          { fly: "rlen" }, { w: "^2=100", color: INK },
          { w: "\\qquad RQ=10", color: INK }
        ]);
        api.step();
        api.formula([{ w: "r=\\dfrac{\\text{area}}{s}\\qquad s=\\dfrac{a+b+c}{2}", color: INK }]);
        api.step();
        api.line(2, 0, 2, 2, { color: PINK, width: 3, dash: true });
        api.right(2, 0, -1, 0, 0, 1, { s: 0.28, color: PINK });
        api.formula([
          { w: "\\text{area}=\\dfrac{1}{2}\\times", color: INK }, { fly: "q" },
          { w: "\\times", color: INK }, { fly: "rlen" }, { w: "=24", color: INK }
        ]);
        api.step();
        api.formula([
          { w: "s=(", color: INK }, { fly: "q" }, { w: "+", color: INK },
          { fly: "rlen" }, { w: "+", color: INK }, { fly: "hyp" },
          { w: ")/2=12\\qquad r=24/12", color: INK }
        ]);
        api.step();
        api.formula([{ w: "\\therefore\\;r=2", color: GOLD }]);
        api.step();
        api.formula([{ w: "I=\\dfrac{aP+bQ+cR}{a+b+c}", color: INK }]);
        api.step();
        api.formula([
          { w: "I=", color: INK },
          { frac: {
            tight: true,
            num: [
              { fly: "hyp" }, { w: "P+", color: INK },
              { fly: "rlen" }, { w: "Q+", color: INK },
              { fly: "q" }, { w: "R", color: INK }
            ],
            den: { w: "24", color: INK }
          } },
          { w: "=(2,\\,2)", color: GOLD }
        ]);
      }
    ]
  });
})();
