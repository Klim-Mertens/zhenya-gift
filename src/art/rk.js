/* Помощники для «тёплого» пиксель-арта по референсам: тёмно-коричневый контур вместо чёрного,
   мебель в виде 3/4 (верх светлее, перед темнее), мягкие тени, шум-текстура. */
"use strict";
window.RK = (() => {
  const OL = "#3b2420";                      // основной контур: тёплый тёмно-коричневый
  const R = PK.R, P = PK.P;
  // Рамка внутри прямоугольника
  function box(g, x, y, w, h, col) { R(g, x, y, w, 1, col); R(g, x, y + h - 1, w, 1, col); R(g, x, y, 1, h, col); R(g, x + w - 1, y, 1, h, col); }
  // Полупрозрачная тень (тёплая, не серая)
  function shade(g, x, y, w, h, a = .28, col = "#3a1810") { g.globalAlpha = a; R(g, x, y, w, h, col); g.globalAlpha = 1; }
  function shadeEll(g, cx, cy, rx, ry, a = .28, col = "#3a1810") { g.globalAlpha = a; PK.ell(g, cx, cy, rx, ry, col); g.globalAlpha = 1; }
  // Предмет мебели в 3/4: верхняя грань topH, передняя frontH; c = {top, topL, front, frontD, ol}
  function block(g, x, y, w, topH, frontH, c) {
    shade(g, x + 1, y + topH + frontH - 1, w + 1, 3);
    R(g, x, y, w, topH, c.top); R(g, x + 1, y + 1, w - 2, 1, c.topL || PK.mix(c.top, "#fff4d8", .35));
    R(g, x, y + topH, w, frontH, c.front); R(g, x, y + topH, w, 1, c.frontL || PK.mix(c.front, "#fff4d8", .18));
    R(g, x, y + topH + frontH - 2, w, 1, c.frontD || PK.mix(c.front, "#2a1018", .3));
    box(g, x, y, w, topH + frontH, c.ol || OL);
    R(g, x + 1, y + topH, w - 2, 1, c.edge || PK.mix(c.top, "#2a1018", .35));
  }
  // Шумовая крапинка: n точек цветом col в прямоугольнике
  function speck(g, rnd, x, y, w, h, n, col, a = 1) { g.globalAlpha = a; for (let i = 0; i < n; i++) P(g, x + Math.floor(rnd() * w), y + Math.floor(rnd() * h), col); g.globalAlpha = 1; }
  // «Выборочный» контур: каждый внешний пиксель = затемнённый цвет соседнего (как в hi-bit спрайтах)
  function selout(cv, k = .55, dark = OL) {
    const g = cv.getContext("2d"), w = cv.width, h = cv.height, im = g.getImageData(0, 0, w, h), d = im.data, o = new Uint8ClampedArray(d), D = PK.hex(dark);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (d[i + 3]) continue;
      let best = -1; for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h && d[(yy * w + xx) * 4 + 3] > 128) { best = (yy * w + xx) * 4; break; } }
      if (best < 0) continue;
      for (let c = 0; c < 3; c++) o[i + c] = d[best + c] * (1 - k) + D[c] * k; o[i + 3] = 255;
    }
    g.putImageData(new ImageData(o, w, h), 0, 0); return cv;
  }
  return { OL, box, shade, shadeEll, block, speck, selout };
})();
