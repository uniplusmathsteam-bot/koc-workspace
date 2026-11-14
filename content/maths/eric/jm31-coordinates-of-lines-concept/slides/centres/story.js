(function () {
  var BLUE = JM33.BLUE, AMBER = JM33.AMBER, GREEN = JM33.GREEN;
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
          api.desc("\\text{Parallel copies the slope}");
          api.plane({ x0: -1.2, x1: 8.6, y0: -2.8, y1: 7.2 });
        });
        api.line(1, 1, 7, 6, { color: VIOLET, width: 4 });
        api.poly([[1, 1], [7, 1], [7, 6]], { fill: "rgba(206,147,216,0.12)" });
        api.label(4, 0.55, { anchor: "mid", parts: [{ tex: "6", id: "run", color: BLUE }] });
        api.label(7, 3.5, { dx: 14, dy: -10, parts: [{ tex: "5", id: "rise", color: AMBER }] });
        api.line(1, 1, 7, 1, { color: BLUE, width: 3 });
        api.line(7, 1, 7, 6, { color: AMBER, width: 3 });
        dot(api, 7, 6, [{ tex: "A", color: VIOLET }], { color: VIOLET, dx: -18, dy: -24 });
        dot(api, 1, 1, [{ tex: "B", color: VIOLET }], { color: VIOLET, dx: -20, dy: 10 });
        api.line(6, 3, 0, -2, { color: PINK, width: 4 });
        dot(api, 6, 3, [
          { tex: "C(", color: INK }, { tex: "6", id: "cx", color: BLUE },
          { tex: ",", color: INK }, { tex: "3", id: "cy", color: AMBER }, { tex: ")", color: INK }
        ], { color: PINK, dx: -28, dy: -34 });
        dot(api, 0, -2, [{ tex: "D(0,-2)", color: GREEN }], { color: GREEN, dx: 8, dy: 6 });
        api.step();
        api.formula([
          { w: "m=", color: VIOLET },
          { frac: { num: { fly: "rise" }, den: { fly: "run" } } },
          { w: "=\\dfrac{5}{6}", color: VIOLET }
        ]);
        api.step();
        api.formula([
          { w: "y-", color: INK }, { fly: "cy" }, { w: "=", color: INK },
          { w: "\\dfrac{5}{6}(x-", color: VIOLET }, { fly: "cx" }, { w: ")", color: VIOLET }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{A right angle flips the triangle}");
          api.plane({ x0: -0.8, x1: 7.4, y0: -1.3, y1: 5.6 });
        });
        api.poly([[0, 2], [3, 2], [3, 0]], { fill: "rgba(206,147,216,0.16)" });
        api.line(0, 2, 3, 2, { color: BLUE, width: 4 });
        api.line(3, 2, 3, 0, { color: AMBER, width: 4 });
        api.line(0, 2, 3, 0, { color: VIOLET, width: 4 });
        api.line(0, 2, 2, 5, { color: PINK, width: 4 });
        api.right(0, 2, 3, -2, 2, 3, { s: 0.36 });
        api.label(1.5, 2, { anchor: "mid", dy: -18, parts: [{ tex: "3", id: "run", color: BLUE }] });
        api.label(3.15, 1, { parts: [{ tex: "-2", id: "rise", color: AMBER }] });
        api.label(2.15, 3.7, { parts: [{ tex: "\\dfrac{3}{2}", id: "m2", color: PINK }] });
        api.line(5, 3, 3, 0, { color: PINK, width: 3, dash: true });
        dot(api, 5, 3, [
          { tex: "Q(", color: INK }, { tex: "5", id: "qx", color: BLUE },
          { tex: ",", color: INK }, { tex: "3", id: "qy", color: AMBER }, { tex: ")", color: INK }
        ], { color: PINK, dx: 8, dy: -26 });
        dot(api, 3, 0, [{ tex: "R(3,0)", color: GREEN }], { color: GREEN, dx: -8, dy: 16 });
        api.step();
        api.formula([
          { w: "m_1=", color: VIOLET },
          { frac: { num: { fly: "rise" }, den: { fly: "run" } } },
          { w: "=-\\dfrac{2}{3}", color: VIOLET }
        ]);
        api.step();
        api.formula([
          { w: "m_2=-\\dfrac{1}{m_1}=", color: PINK }, { fly: "m2" },
          { w: "\\qquad m_1m_2=-1", color: INK }
        ]);
        api.step();
        api.formula([
          { w: "0-", color: INK }, { fly: "qy" }, { w: "=\\dfrac{3}{2}\\big(x-", color: PINK },
          { fly: "qx" }, { w: "\\big)", color: PINK }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Equidistant means the perpendicular bisector}");
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
            { tex: "R(", color: INK }, { tex: "-4", id: "r", color: GREEN },
            { tex: ",0)", color: INK }
          ], { color: GREEN, dx: -20, dy: 16 });
        });
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
        api.formula([{ w: "r=-4", color: GREEN }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{The mid-point is the average}");
          api.plane({ x0: -13.5, x1: 7.5, y0: -3.2, y1: 4.2, grid: 2 });
        });
        api.line(-11, 2, 5, -2, { color: VIOLET, width: 4 });
        api.together(function () {
          dot(api, 5, -2, [
            { tex: "A(", color: INK }, { tex: "5", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "-2", id: "ay", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: 4 });
          dot(api, -11, 2, [
            { tex: "B(", color: INK }, { tex: "-11", id: "bx", color: BLUE },
            { tex: ",", color: INK }, { tex: "2", id: "by", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: 8, dy: -24 });
          dot(api, -3, 0, [{ tex: "M", color: GREEN }], { color: GREEN, dx: -8, dy: -26 });
        });
        api.step();
        api.formula([
          { w: "M=", color: INK },
          { frac: {
            num: [{ fly: "ax" }, { w: "+", color: BLUE }, { fly: "bx" }],
            den: { w: "2", color: BLUE }
          } },
          { w: ",", color: INK },
          { frac: {
            num: [{ fly: "ay" }, { w: "+", color: AMBER }, { fly: "by" }],
            den: { w: "2", color: AMBER }
          } },
          { w: "=(-3,\\,0)", color: INK }
        ]);
        api.step();
        api.formula([
          { w: "\\text{other end }=2M-A", color: GREEN }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{A point that cuts a segment }m:n");
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
          dot(api, 2, 2, [{ tex: "P", color: GREEN }], { color: GREEN, dx: 10, dy: 8 });
        });
        api.label(-0.4, -1.7, { parts: [{ tex: "2", id: "m", color: BLUE }] });
        api.label(3.15, 3.15, { parts: [{ tex: "1", id: "n", color: AMBER }] });
        api.step();
        api.formula([{ w: "AP:PB=2:1", color: INK }]);
        api.step();
        api.formula([
          { w: "x=", color: BLUE },
          { frac: {
            num: [
              { fly: "n" }, { w: "\\times(", color: BLUE }, { fly: "ax" },
              { w: ")+", color: BLUE }, { fly: "m" }, { w: "\\times", color: BLUE }, { fly: "bx" }
            ],
            den: { w: "3", color: BLUE }
          } },
          { w: "=2", color: BLUE }
        ]);
        api.step();
        api.formula([
          { w: "y=", color: AMBER },
          { frac: {
            num: [
              { fly: "n" }, { w: "\\times(", color: AMBER }, { fly: "ay" },
              { w: ")+", color: AMBER }, { fly: "m" }, { w: "\\times", color: AMBER }, { fly: "by" }
            ],
            den: { w: "3", color: AMBER }
          } },
          { w: "=2", color: AMBER }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Compare the part with the whole segment}");
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
          dot(api, 5, -1, [{ tex: "P(5,-1)", color: GREEN }], { color: GREEN, dx: 8, dy: -24 });
        });
        api.label(0.2, 4.4, { parts: [{ tex: "3", id: "part", color: BLUE }] });
        api.label(8.4, -3.2, { parts: [{ tex: "2", id: "rest", color: AMBER }] });
        api.step();
        api.formula([
          { w: "AP:AB=3:5\\Rightarrow AP:PB=", color: INK },
          { fly: "part" }, { w: ":", color: INK }, { fly: "rest" }
        ]);
        api.step();
        api.formula([
          { w: "P=A+\\dfrac{3}{5}(B-A)=(5,-1)", color: GREEN }
        ]);
        api.step();
        api.formula([{ w: "7\\,AP=5\\,PB\\Rightarrow AP:PB=5:7", color: INK }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Area from an altitude, or a shared height}");
          api.plane({ x0: -1.2, x1: 8.4, y0: -1.2, y1: 5.4 });
        });
        api.poly([[1, 1], [7, 1], [3, 4]], { fill: "rgba(102,187,106,0.15)" });
        api.line(1, 1, 7, 1, { color: BLUE, width: 5 });
        api.line(1, 1, 3, 4, { color: INK, width: 3 });
        api.line(7, 1, 3, 4, { color: INK, width: 3 });
        api.line(3, 4, 3, 1, { color: GREEN, width: 4, dash: true });
        api.right(3, 1, 1, 0, 0, 1);
        api.label(4, 1, { anchor: "mid", dy: 22, parts: [{ tex: "6", id: "base", color: BLUE }] });
        api.label(3.15, 2.4, { parts: [{ tex: "3", id: "ht", color: GREEN }] });
        dot(api, 1, 1, [{ tex: "D", color: BLUE }], { color: BLUE, dx: -18, dy: 8 });
        dot(api, 7, 1, [{ tex: "B", color: BLUE }], { color: BLUE, dx: 8, dy: 8 });
        dot(api, 3, 4, [{ tex: "A", color: GREEN }], { color: GREEN, dx: 8, dy: -24 });
        api.line(3, 4, 5, 1, { color: PINK, width: 3 });
        dot(api, 5, 1, [{ tex: "Q", color: PINK }], { color: PINK, dx: -6, dy: 28 });
        api.step();
        api.formula([
          { w: "\\text{area}=\\dfrac{1}{2}\\times", color: INK }, { fly: "base" },
          { w: "\\times", color: INK }, { fly: "ht" }, { w: "=9", color: INK }
        ]);
        api.step();
        api.formula([
          { w: "\\dfrac{\\text{area }\\triangle APQ}{\\text{area }\\triangle ABD}=\\dfrac{AQ}{AB}", color: PINK }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{The centroid is the average of the vertices}");
          api.plane({ x0: -1.2, x1: 13.2, y0: -1.2, y1: 15.5, grid: 2 });
        });
        api.poly([[7, 14], [3, 8], [11, 2]], { fill: "rgba(79,195,247,0.12)" });
        api.line(7, 14, 3, 8, { color: INK, width: 3 });
        api.line(3, 8, 11, 2, { color: INK, width: 3 });
        api.line(11, 2, 7, 14, { color: INK, width: 3 });
        api.line(7, 14, 7, 5, { color: VIOLET, width: 3, dash: true });
        api.together(function () {
          dot(api, 7, 14, [
            { tex: "A(", color: INK }, { tex: "7", id: "ax", color: BLUE },
            { tex: ",", color: INK }, { tex: "14", id: "ay", color: AMBER }, { tex: ")", color: INK }
          ], { color: BLUE, dx: 8, dy: -22 });
          dot(api, 3, 8, [
            { tex: "B(", color: INK }, { tex: "3", id: "bx", color: BLUE },
            { tex: ",", color: INK }, { tex: "8", id: "by", color: AMBER }, { tex: ")", color: INK }
          ], { color: AMBER, dx: -72, dy: -8 });
          dot(api, 11, 2, [{ tex: "C", color: GREEN }], { color: GREEN, dx: 8, dy: 6 });
          dot(api, 7, 8, [
            { tex: "G(", color: INK }, { tex: "7", id: "gx", color: BLUE },
            { tex: ",", color: INK }, { tex: "8", id: "gy", color: AMBER }, { tex: ")", color: INK }
          ], { color: VIOLET, dx: -70, dy: 12 });
        });
        api.step();
        api.formula([
          { w: "G=\\left(\\dfrac{x_1+x_2+x_3}{3},\\dfrac{y_1+y_2+y_3}{3}\\right)", color: VIOLET }
        ]);
        api.step();
        api.formula([
          { w: "y_C=3\\times", color: AMBER }, { fly: "gy" }, { w: "-", color: AMBER },
          { fly: "ay" }, { w: "-", color: AMBER }, { fly: "by" }, { w: "=2", color: AMBER }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{The orthocentre from perpendicular slopes}");
          api.plane({ x0: -4.5, x1: 14, y0: -1.6, y1: 10.5, grid: 2 });
        });
        api.line(-3, 0, 12, 0, { color: BLUE, width: 4 });
        api.line(6, 9, 12, 0, { color: INK, width: 3 });
        api.line(6, 9, -3, 0, { color: INK, width: 3 });
        api.line(6, 0, 6, 9, { color: GREEN, width: 3, dash: true });
        api.line(-3, 0, 6, 6, { color: PINK, width: 3, dash: true });
        api.together(function () {
          dot(api, -3, 0, [{ tex: "B(-3,0)", color: BLUE }], { color: BLUE, dx: -70, dy: 12 });
          dot(api, 12, 0, [{ tex: "C(12,0)", color: BLUE }], { color: BLUE, dx: -78, dy: -28 });
          dot(api, 6, 9, [
            { tex: "A(", color: INK }, { tex: "6", id: "ax", color: BLUE },
            { tex: ",9)", color: INK }
          ], { color: GREEN, dx: 8, dy: -24 });
          dot(api, 6, 6, [
            { tex: "H(", color: INK }, { tex: "6", id: "hx", color: BLUE },
            { tex: ",6)", color: INK }
          ], { color: PINK, dx: 14, dy: 16 });
        });
        api.label(9.3, 4.1, { parts: [{ tex: "-\\dfrac{3}{2}", id: "mac", color: VIOLET }] });
        api.label(1.2, 3.4, { parts: [{ tex: "\\dfrac{2}{3}", id: "malt", color: PINK }] });
        api.step();
        api.formula([
          { w: "x_A=", color: BLUE }, { fly: "hx" }
        ]);
        api.step();
        api.formula([
          { w: "m_{AC}=", color: VIOLET }, { fly: "mac" },
          { w: "\\qquad m_{BH}=", color: PINK }, { fly: "malt" }
        ]);
        api.step();
        api.formula([{ w: "\\left(-\\dfrac{3}{2}\\right)\\left(\\dfrac{2}{3}\\right)=-1", color: INK }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{The circumcentre is equidistant}");
          api.plane({ x0: -1.2, x1: 7.4, y0: -1.2, y1: 5.2 });
        });
        api.poly([[0, 0], [6, 0], [2, 4]], { fill: "rgba(255,213,79,0.12)" });
        api.line(0, 0, 6, 0, { color: BLUE, width: 4 });
        api.line(0, 0, 2, 4, { color: INK, width: 3 });
        api.line(6, 0, 2, 4, { color: INK, width: 3 });
        api.line(3, 0, 3, 4.6, { color: GREEN, width: 3, dash: true });
        api.line(1, 2, 4, 0.5, { color: PINK, width: 3, dash: true });
        api.together(function () {
          dot(api, 0, 0, [{ tex: "A", color: BLUE }], { color: BLUE, dx: -18, dy: 10 });
          dot(api, 6, 0, [{ tex: "B", color: BLUE }], { color: BLUE, dx: 8, dy: 8 });
          dot(api, 2, 4, [{ tex: "C", color: AMBER }], { color: AMBER, dx: -22, dy: -26 });
          dot(api, 3, 0, [{ tex: "M(3,0)", color: GREEN }], { color: GREEN, dx: 8, dy: 12 });
          dot(api, 3, 1, [{ tex: "O(3,1)", color: PINK }], { color: PINK, dx: 10, dy: -8 });
        });
        api.label(1, 2.35, { parts: [{ tex: "2", id: "ms", color: VIOLET }] });
        api.step();
        api.formula([
          { w: "\\text{mid-point of }AB=(3,0)", color: GREEN }
        ]);
        api.step();
        api.formula([
          { w: "m_{AC}=", color: VIOLET }, { fly: "ms" },
          { w: "\\qquad\\text{perp. bisector slope }=-\\dfrac{1}{2}", color: PINK }
        ]);
        api.step();
        api.formula([{ w: "OA=OB=OC=\\sqrt{10}", color: INK }]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{In-centre, and }r=\\text{area}/s");
          api.plane({ x0: -1.2, x1: 8.2, y0: -1.4, y1: 9.2 });
        });
        api.poly([[0, 0], [6, 0], [0, 8]], { fill: "rgba(244,143,177,0.14)" });
        api.line(0, 0, 6, 0, { color: BLUE, width: 5 });
        api.line(0, 0, 0, 8, { color: AMBER, width: 5 });
        api.line(6, 0, 0, 8, { color: GREEN, width: 4 });
        api.line(2, 0, 2, 2, { color: PINK, width: 3, dash: true });
        api.right(2, 0, -1, 0, 0, 1, { s: 0.28, color: PINK });
        api.together(function () {
          dot(api, 0, 0, [{ tex: "P", color: INK }], { color: INK, dx: -18, dy: 10 });
          dot(api, 6, 0, [
            { tex: "Q\\;", color: INK }, { tex: "6", id: "q", color: BLUE }
          ], { color: BLUE, dx: 8, dy: 6 });
          dot(api, 0, 8, [
            { tex: "R\\;", color: INK }, { tex: "8", id: "rlen", color: AMBER }
          ], { color: AMBER, dx: -36, dy: -26 });
          dot(api, 2, 2, [{ tex: "I(2,2)", color: PINK }], { color: PINK, dx: 10, dy: -24 });
        });
        api.label(3, 0, { anchor: "mid", dy: 26, parts: [{ tex: "6", id: "side", color: BLUE }] });
        api.label(3.4, 4.3, { parts: [{ tex: "10", id: "hyp", color: GREEN }] });
        api.step();
        api.formula([
          { w: "\\text{area}=\\dfrac{1}{2}\\times", color: INK }, { fly: "side" },
          { w: "\\times", color: INK }, { fly: "rlen" }, { w: "=24", color: INK }
        ]);
        api.step();
        api.formula([
          { w: "s=\\dfrac{6+8+10}{2}=12\\qquad r=\\dfrac{24}{12}=2", color: PINK }
        ]);
        api.step();
        api.formula([
          { w: "I=", color: INK },
          { frac: {
            num: [
              { fly: "hyp" }, { w: "P+", color: INK },
              { fly: "rlen" }, { w: "Q+", color: INK },
              { fly: "side" }, { w: "R", color: INK }
            ],
            den: { w: "24", color: INK }
          } },
          { w: "=(2,\\,2)", color: INK }
        ]);
      },

      function (api) {
        api.together(function () {
          api.desc("\\text{Which test starts the question}");
          api.plane({ x0: -1, x1: 7, y0: -1, y1: 5 });
        });
        api.poly([[1, 1], [5, 1], [3, 4]], { fill: "rgba(79,195,247,0.12)" });
        api.line(1, 1, 5, 1, { color: BLUE, width: 4 });
        api.line(1, 1, 3, 4, { color: AMBER, width: 4 });
        api.line(5, 1, 3, 4, { color: GREEN, width: 4 });
        api.line(3, 4, 3, 1, { color: PINK, width: 3, dash: true });
        dot(api, 1, 1, [{ tex: "A", color: BLUE }], { color: BLUE, dx: -24, dy: 18 });
        dot(api, 5, 1, [{ tex: "B", color: GREEN }], { color: GREEN, dx: 16, dy: 18 });
        dot(api, 3, 4, [{ tex: "C", color: AMBER }], { color: AMBER, dx: 0, dy: -40 });
        api.step();
        api.formula([{ w: "\\text{length}\\Rightarrow\\text{distance, or compare squares}", color: GREEN }]);
        api.step();
        api.formula([{ w: "\\text{direction}\\Rightarrow\\text{slope}", color: VIOLET }]);
        api.step();
        api.formula([{ w: "\\text{parallel: }m_1=m_2\\qquad\\text{perpendicular: }m_1m_2=-1", color: PINK }]);
        api.step();
        api.formula([{ w: "\\text{on a segment}\\Rightarrow\\text{mid-point or section}", color: BLUE }]);
        api.step();
        api.formula([{ w: "\\text{a centre}\\Rightarrow\\text{its line, then the shortcut}", color: AMBER }]);
      }
    ]
  });
})();
