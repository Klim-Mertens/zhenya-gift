/* Вид из окна поезда: зима за окном постепенно превращается в итальянское лето.
   Переход — «растворение» по сетке Байера, чтобы смена сезона выглядела пиксельно. */
"use strict";
window.RideArt = (() => {
  const W = 320, H = 180, WX = 34, WY = 18, WW = 252, WH = 104;   // окно
  const R = PK.R, P = PK.P, OL = RK.OL;
  // Пейзаж одного сезона на холсте окна; off — сдвиг от скорости поезда
  const wrap = (v, m) => ((v % m) + m) % m;
  // Италия: море с парусниками, холмы с городком и колокольней, кипарисы, виноградники, пинии, подсолнухи
  function italy(g, off, s) {
    const w = WW, h = WH;
    PK.gradV(g, 0, 0, w, 50, ["#3a8ad8", "#6ab4ea", "#bfe2f4", "#fff0d0"]);
    PK.ell(g, 206, 16, 10, 10, "#fff6c0"); PK.ell(g, 206, 16, 7, 7, "#ffffff");
    for (let i = 0; i < 3; i++) { const x = wrap(i * 110 - off * .03 - s * 2, w + 60) - 30, y = 10 + i * 7; PK.ell(g, x, y, 14, 3, "#ffffff"); PK.ell(g, x + 6, y - 2, 8, 3, "#ffffff"); }
    // море
    R(g, 0, 44, w, 12, "#2f7ec4"); R(g, 0, 44, w, 1, "#9ad4f4");
    for (let x = 0; x < w; x += 7) P(g, wrap(x + Math.floor(s * 4) - off * .05, w), 47 + (x % 3) * 2, "#8cc8ee");
    for (let i = 0; i < 2; i++) { const x = wrap(60 + i * 150 - off * .06 + s * 1.5, w + 20) - 10; PK.poly(g, [[x, 50], [x, 42], [x + 5, 50]], "#ffffff"); R(g, x - 3, 50, 9, 2, "#c8402a"); }
    // дальние холмы с городком на вершине
    const hy = X => 54 - Math.round(Math.sin(X * .02) * 8 + Math.sin(X * .007) * 5);
    for (let x = 0; x < w; x++) { const X = x + off * .22, y = hy(X); R(g, x, y, 1, h - y, "#8aa860"); if ((X | 0) % 9 === 0) P(g, x, y + 2, "#a8c070"); }
    for (let k = -1; k < 3; k++) { const base = Math.floor(off * .22 / 300) * 300 + k * 300 + 150, x0 = Math.round(base - off * .22); if (x0 < -40 || x0 > w + 40) continue;
      const top = hy(base);
      for (let i = 0; i < 7; i++) { const hx = x0 - 18 + i * 6, hh = 6 + ((i * 5) % 4), y = top - hh + 2 + Math.abs(i - 3);
        R(g, hx, y, 6, hh, ["#f2dcb0", "#e8c890", "#f4e8d0", "#e0b880"][i % 4]); R(g, hx - 1, y - 2, 8, 2, "#c8582a"); P(g, hx + 2, y + 3, "#6a4a3a"); }
      R(g, x0 + 4, top - 22, 5, 20, "#e8c890"); R(g, x0 + 3, top - 25, 7, 3, "#c8582a"); PK.poly(g, [[x0 + 3, top - 25], [x0 + 6, top - 31], [x0 + 10, top - 25]], "#c8582a"); R(g, x0 + 5, top - 19, 3, 3, "#6a4a3a");   // колокольня
      for (let c = 0; c < 4; c++) { const cx = x0 + 22 + c * 4; for (let j = 0; j < 12; j++) R(g, cx - (j > 2 && j < 10 ? 1 : 0), top - j + 2, j > 2 && j < 10 ? 3 : 1, 1, "#2c4c26"); } }
    // виноградники: ровные ряды
    R(g, 0, 64, w, 18, "#9ab850");
    for (let r = 0; r < 4; r++) { const y = 66 + r * 4; for (let x = 0; x < w; x++) { const X = x + off * (.45 + r * .08); if (X % 8 < 6) P(g, x, y, "#4f7a2a"); if (X % 8 < 5 && (X | 0) % 3) P(g, x, y - 1, "#6a9a3a"); if ((X | 0) % 16 === 3) P(g, x, y + 1, "#6a2a5a"); } }
    // пинии-«зонтики» и одинокие кипарисы среднего плана
    for (let i = -1; i < 7; i++) { const X = wrap(i * 52 - off * .7, w + 60) - 30, base = 82;
      if (i % 3 === 0) { for (let k = 0; k < 28; k++) { const ww = Math.round(Math.sin(Math.min(1, k / 26) * Math.PI * .9) * 3 + 1); R(g, X - ww, base - k, ww * 2, 1, k % 3 ? "#24442a" : "#36603a"); } }
      else { R(g, X, base - 16, 2, 16, "#6a4a32"); PK.line(g, X + 1, base - 12, X + 6, base - 18, "#6a4a32"); PK.ell(g, X + 2, base - 20, 13, 4, "#2f5a2e"); PK.ell(g, X + 1, base - 22, 10, 3, "#4a7a3a"); PK.ell(g, X - 3, base - 23, 4, 1, "#6a9a4a"); } }
    // подсолнухи у самой дороги
    R(g, 0, 82, w, h - 82, "#7aa83a");
    for (let i = 0; i < 40; i++) { const X = wrap(i * 13 - off * 1.4, w + 20) - 10, y = 88 + (i * 7) % 12;
      R(g, X, y, 1, h - y, "#4a7a2a"); P(g, X + 1, y + 4, "#5a9a3a"); PK.ell(g, X, y - 1, 3, 3, "#f2c21a"); PK.ell(g, X, y - 1, 1, 1, "#6a3a1a"); }
    // столбы
    for (let i = 0; i < 3; i++) { const X = wrap(i * 110 - off * 2.4, w + 60) - 30; R(g, X, 4, 3, h, "#3a2a24"); R(g, X - 8, 10, 19, 2, "#3a2a24"); }
    PK.line(g, 0, 11, w, 13, "#2a2a30");
  }
  function scenery(g, season, off, s) {
    if (season !== "winter") return italy(g, off, s);
    const w = WW, h = WH, win = season === "winter";
    PK.gradV(g, 0, 0, w, 60, win ? ["#5a6a8a", "#8a9ab8", "#b8c4d8"] : ["#2f88d4", "#58a8e2", "#a8d8f0"]);
    if (!win) { PK.ell(g, 200, 18, 9, 9, "#fff6c0"); PK.ell(g, 200, 18, 7, 7, "#ffffff"); }
    // дальние холмы / море
    for (let x = 0; x < w; x++) { const X = x + off * .15, y = 54 + Math.round(Math.sin(X * .03) * 6 + Math.sin(X * .011) * 4);
      R(g, x, y, 1, h - y, win ? "#c8d4e4" : "#6aa04a"); if (!win && y < 62) P(g, x, y, "#8ac05a"); }
    if (!win) { R(g, 0, 64, w, 6, "#3a8ac8"); for (let x = 0; x < w; x += 9) R(g, (x + Math.floor(s * 6)) % w, 66, 4, 1, "#a8dcf4"); }   // полоска моря
    // ближняя земля
    R(g, 0, 70, w, h - 70, win ? "#e8eef6" : "#5a9a3a");
    for (let x = 0; x < w; x += 2) { const X = Math.floor(x + off * .6); if ((X * 13) % 7 < 2) P(g, x, 72 + (X * 5) % 20, win ? "#c4d0e0" : "#7ab84a"); }
    // деревья среднего плана
    for (let i = -1; i < 9; i++) { const X = ((i * 34 - off * .6) % (w + 40) + w + 40) % (w + 40) - 20, base = 74;
      if (win && i % 2) {                                                                  // ель в снегу
        for (let k = 0; k < 5; k++) { const y = base - 30 + k * 6, ww = 3 + k * 2; PK.poly(g, [[X, y - 4], [X + ww, y + 4], [X - ww, y + 4]], "#24402e"); PK.poly(g, [[X, y - 4], [X - ww, y + 4], [X - 1, y + 4]], "#2f5238"); R(g, X - ww + 1, y + 3, ww, 1, "#f4f6fa"); P(g, X, y - 3, "#f4f6fa"); }
        R(g, X - 1, base - 2, 2, 3, "#3a2a24"); }
      else if (win) {                                                                      // голая берёза
        R(g, X, base - 30, 2, 30, "#f4f0e8"); R(g, X + 1, base - 30, 1, 30, "#c8c4bc"); for (let k = 0; k < 7; k++) R(g, X, base - 28 + k * 4, 1 + (k % 2), 1, "#2a2a30");
        [[-7, -26], [6, -24], [-5, -18], [7, -14], [-4, -32], [4, -33]].forEach(([dx, dy], j) => { PK.line(g, X + 1, base + dy + 6, X + 1 + dx, base + dy, "#6a5a52"); P(g, X + 1 + dx, base + dy - 1, "#f4f6fa"); });
      }
      else if (i % 2) { for (let k = 0; k < 26; k++) { const ww = Math.round(Math.sin(Math.min(1, k / 24) * Math.PI * .9) * 3 + 1); R(g, X - ww, base - k, ww * 2, 1, k % 3 ? "#2c4c26" : "#3e6232"); } }   // кипарис
      else { R(g, X, base - 8, 2, 8, "#5a4632"); PK.ell(g, X + 1, base - 12, 8, 6, "#64765a"); PK.ell(g, X, base - 14, 5, 3, "#8a9c7a"); } }                                  // олива
    // столбы, проносятся быстро
    for (let i = 0; i < 3; i++) { const X = ((i * 110 - off * 2.4) % (w + 60) + w + 60) % (w + 60) - 30; R(g, X, 4, 3, h, "#3a2a24"); R(g, X - 8, 10, 19, 2, "#3a2a24"); }
    PK.line(g, 0, 11, w, 13, "#2a2a30");
  }
  function frame() {
    const cv = PK.mk(W, H), g = cv.getContext("2d");
    // стена купе
    R(g, 0, 0, W, H, "#8a5a3a"); for (let x = 0; x < W; x += 10) R(g, x, 0, 1, H, "#7a4a2e");
    R(g, 0, 0, W, 4, "#5a3a24");
    R(g, WX - 6, WY - 6, WW + 12, WH + 12, "#d8d4cc"); RK.box(g, WX - 6, WY - 6, WW + 12, WH + 12, OL); RK.box(g, WX - 2, WY - 2, WW + 4, WH + 4, "#9a968e");
    g.clearRect(WX, WY, WW, WH);
    // шторки
    [[WX - 18, 1], [WX + WW + 4, -1]].forEach(([x]) => { R(g, x, WY - 10, 14, WH + 22, "#c8402a"); for (let k = 2; k < 14; k += 3) R(g, x + k, WY - 10, 1, WH + 22, "#a82a1e"); RK.box(g, x, WY - 10, 14, WH + 22, OL); });
    // столик с подстаканником
    R(g, 20, 130, 280, 10, "#c8b090"); R(g, 20, 130, 280, 2, "#e8d4b0"); RK.box(g, 20, 130, 280, 10, OL); R(g, 20, 140, 280, 40, "#6a4024");
    R(g, 200, 112, 12, 18, "#e8c060"); R(g, 201, 113, 10, 3, "#b88a2a"); R(g, 201, 116, 2, 12, "#fff0a0"); R(g, 212, 116, 4, 8, "#b88a2a"); R(g, 213, 118, 2, 4, "#8a6a1e");
    R(g, 201, 110, 10, 3, "#a85a2a"); RK.box(g, 200, 110, 12, 20, OL); PK.line(g, 208, 100, 205, 111, "#c8c8d0");    // чай с ложкой
    // пачка печенья и билет
    R(g, 90, 124, 22, 8, "#3f6f8f"); R(g, 92, 125, 18, 2, "#f2d23a"); RK.box(g, 90, 124, 22, 8, OL);
    R(g, 140, 126, 18, 6, "#f4ece0"); R(g, 140, 126, 18, 2, "#d8202c"); RK.box(g, 140, 126, 18, 6, OL);
    return cv;
  }
  function create() {
    const fr = frame(), A = PK.mk(WW, WH), B = PK.mk(WW, WH), ga = A.getContext("2d"), gb = B.getContext("2d"), mix = PK.mk(WW, WH), gm = mix.getContext("2d");
    // k: 0 — зима, 1 — лето
    return (g, t, k, speed) => {
      const s = t / 1000, off = s * speed;
      R(g, 0, 0, W, H, "#000");
      if (k <= 0) { scenery(ga, "winter", off, s); g.drawImage(A, WX, WY); }
      else if (k >= 1) { scenery(gb, "summer", off, s); g.drawImage(B, WX, WY); }
      else {
        scenery(ga, "winter", off, s); scenery(gb, "summer", off, s);
        const ia = ga.getImageData(0, 0, WW, WH), ib = gb.getImageData(0, 0, WW, WH), d = ia.data, e = ib.data;
        for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) { const th = PK.bayer(x >> 1, y >> 1); if (k > th) { const i = (y * WW + x) * 4; d[i] = e[i]; d[i + 1] = e[i + 1]; d[i + 2] = e[i + 2]; } }
        gm.putImageData(ia, 0, 0); g.drawImage(mix, WX, WY);
      }
      // снежинки зимой
      if (k < .6) { for (let i = 0; i < 40; i++) { const x = WX + ((i * 47 - s * (40 + i)) % WW + WW) % WW, y = WY + ((i * 29 + s * 30) % WH); if (PK.bayer(x, y) > k * 1.6) P(g, x, y, "#ffffff"); } }
      g.drawImage(fr, 0, 0);
      // пар от чая
      for (let i = 0; i < 3; i++) { const ph = (s * .6 + i / 3) % 1; g.globalAlpha = .6 * (1 - ph); P(g, 205 + Math.round(Math.sin(ph * 6 + i) * 2), 108 - Math.round(ph * 14), "#ffffff"); }
      g.globalAlpha = 1;
    };
  }
  return { create, W, H };
})();
