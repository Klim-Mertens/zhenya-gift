/* Пиксельный набор: всё рисуется по целым пикселям, без сглаживания. */
"use strict";
window.PK = (() => {
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
  function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function mk(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.imageSmoothingEnabled = false; return c; }
  const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const toHex = (r, g, b) => "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  // Рампа оттенков: от тени (холоднее) к свету (теплее)
  function ramp(base, n = 5, shadow = "#2a2050", light = "#fff2c8") {
    const out = []; const mid = (n - 1) / 2;
    for (let i = 0; i < n; i++) { const t = (i - mid) / mid; out.push(t < 0 ? mix(base, shadow, -t * .55) : mix(base, light, t * .5)); }
    return out;
  }
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const P = (c, x, y, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); };
  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (let y = -ry; y <= ry; y++) { const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry || 1))) + .35); if (half > 0) c.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2, 1); }
  }
  function poly(c, pts, col) {
    c.fillStyle = col; let a = Infinity, b = -Infinity; pts.forEach(p => { a = Math.min(a, p[1]); b = Math.max(b, p[1]); });
    for (let y = Math.ceil(a); y < Math.ceil(b); y++) {
      const xs = []; for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + (y - y1) / (y2 - y1) * (x2 - x1)); }
      xs.sort((p, q) => p - q); for (let k = 0; k + 1 < xs.length; k += 2) c.fillRect(Math.round(xs[k]), y, Math.round(xs[k + 1]) - Math.round(xs[k]), 1);
    }
  }
  function line(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); c.fillStyle = col;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (;;) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  // Вертикальный градиент полосами с дизерингом между соседними цветами
  function gradV(c, x, y, w, h, cols) {
    for (let j = 0; j < h; j++) {
      const t = j / Math.max(1, h - 1) * (cols.length - 1), i = Math.min(cols.length - 2, Math.floor(t)), f = t - i;
      for (let k = 0; k < w; k++) { const th = BAYER[((y + j) & 3) * 4 + ((x + k) & 3)]; c.fillStyle = f > th ? cols[i + 1] : cols[i]; c.fillRect(x + k, y + j, 1, 1); }
    }
  }
  // Дизеринг-заливка: доля f пикселей цветом b поверх a (по сетке Байера)
  function dither(c, x, y, w, h, a, b, f) { for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) { const th = BAYER[((y + j) & 3) * 4 + ((x + k) & 3)]; c.fillStyle = f > th ? b : a; c.fillRect(x + k, y + j, 1, 1); } }
  const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  // Спрайт из строк: символ → цвет из палитры
  function sprite(rows, pal) {
    const w = Math.max(...rows.map(r => r.length)), cv = mk(w, rows.length), c = cv.getContext("2d");
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { c.fillStyle = col; c.fillRect(x, y, 1, 1); } } });
    return cv;
  }
  // Контур вокруг непрозрачных пикселей холста
  function outline(cv, col = "#1b1528", diag = false) {
    const c = cv.getContext("2d"), w = cv.width, h = cv.height, im = c.getImageData(0, 0, w, h), d = im.data, o = new Uint8ClampedArray(d), C = hex(col);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (d[i + 3]) continue;
      const on = (xx, yy) => xx >= 0 && yy >= 0 && xx < w && yy < h && d[(yy * w + xx) * 4 + 3] > 128;
      if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1) || (diag && (on(x - 1, y - 1) || on(x + 1, y + 1) || on(x - 1, y + 1) || on(x + 1, y - 1)))) { o[i] = C[0]; o[i + 1] = C[1]; o[i + 2] = C[2]; o[i + 3] = 255; }
    }
    c.putImageData(new ImageData(o, w, h), 0, 0); return cv;
  }
  // Отразить по горизонтали
  function flip(cv) { const o = mk(cv.width, cv.height), g = o.getContext("2d"); g.translate(cv.width, 0); g.scale(-1, 1); g.drawImage(cv, 0, 0); return o; }
  // Перевод картинки в палитру с упорядоченным дизерингом (amt — сила сетки)
  function quantize(cv, pal, amt = 16) {
    const c = cv.getContext("2d"), w = cv.width, h = cv.height, im = c.getImageData(0, 0, w, h), d = im.data;
    const P = pal.map(hex), cache = new Map();
    const near = (r, g, b) => { const k = (r >> 2) << 12 | (g >> 2) << 6 | (b >> 2); let v = cache.get(k); if (v !== undefined) return v;
      let best = 0, bd = 1e9; for (let i = 0; i < P.length; i++) { const p = P[i], dr = p[0] - r, dg = p[1] - g, db = p[2] - b, dd = dr * dr * .3 + dg * dg * .59 + db * db * .11; if (dd < bd) { bd = dd; best = i; } } cache.set(k, best); return best; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (d[i + 3] < 128) { d[i + 3] = 0; continue; }
      const o = (BAYER[(y & 3) * 4 + (x & 3)] - .5) * amt;
      const p = P[near(Math.max(0, Math.min(255, d[i] + o)), Math.max(0, Math.min(255, d[i + 1] + o)), Math.max(0, Math.min(255, d[i + 2] + o)))];
      d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255;
    }
    c.putImageData(im, 0, 0); return cv;
  }
  return { quantize, rng, mk, hex, toHex, mix, ramp, R, P, ell, poly, line, gradV, dither, bayer, sprite, outline, flip, BAYER };
})();
