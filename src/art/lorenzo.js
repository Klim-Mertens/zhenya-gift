/* Глава 4: Лоренцо (тёмные кудри, кепка козырьком назад, щетина, футболка в сине-чёрную полоску — он за «Интер»),
   красная машинка (вид сверху), трава с виноградниками для серпантина, закатная вершина и футболка «Интер/Спартак».
   Логотипов клубов нет — только цвета. */
"use strict";
window.LorenzoArt = (() => {
  const R = PK.R, P = PK.P, OL = "#2a1a18";
  // ---------- Лоренцо ----------
  const HEAD = [
    "......oooo......", "....ooCCCCoo....", "...oCCCCCCCCo...", "..oCCCCcCCCCCo..", "..oAaAAaAAaAAo..",
    "..oAaSSSSSSaAo..", "..oASSSSSSSSAo..", "..oSSESSSSESSo..", "..oSSESSSSESSo..", "..osSSSnnSSSso..",
    "..odSSSSSSSSdo..", "...oddsrrsddo...", "....oddddddo...."
  ];
  const BODY = [".oTKTKsssKTKTKo.", "oTKTKTKTKTKTKTKo", "oTKTKTKTKTKTKTKo", "oSKTKTKTKTKTKTSo", "oSoKTKTKTKTKToSo", "oSoJJJJJJJJJJoSo", "..oJJJJJJJJJJo.."];
  const LEGS = {
    stand: ["...oJJJooJJJo...", "...oSSSo.oSSSo..", "...oSSSo.oSSSo..", "...oWWWo.oWWWo..", "...ooooo.ooooo.."],
    a: ["...oJJJooJJJo...", "...oSSSo.oSSSo..", "...oWWWo.oSSSo..", "...oooo..oWWWo..", "..........oooo.."],
    b: ["...oJJJooJJJo...", "...oSSSo.oSSSo..", "...oSSSo.oWWWo..", "...oWWWo..oooo..", "...oooo........."]
  };
  const PAL = { o: OL, C: "#1e2a4a", c: "#3a4a7a", A: "#2a1c18", a: "#4a3428", S: "#e2b48e", s: "#c48e6a", E: "#2a1a18", n: "#c48e6a",
    d: "#b88e70", r: "#a85a4c", T: "#2a4ab0", K: "#1a1a22", J: "#c8b48a", W: "#f4f0e8" };
  function build() {
    const F = HEAD.concat(BODY), sp = rows => PK.sprite(rows, PAL);
    const blink = F.map((r, i) => i === 7 ? "..oSSSSSSSSSSo.." : i === 8 ? "..oSSoSSSSoSSo.." : r);
    return { front: [sp(F.concat(LEGS.stand)), sp(F.concat(LEGS.a)), sp(F.concat(LEGS.b))], blink: sp(blink.concat(LEGS.stand)) };
  }
  // ---------- машина сверху (16×26), фары вверх ----------
  function car(brake) {
    const cv = PK.mk(16, 26), g = cv.getContext("2d");
    R(g, 2, 2, 12, 22, "#d8303a"); R(g, 3, 1, 10, 1, "#d8303a"); R(g, 3, 24, 10, 1, "#d8303a");
    R(g, 3, 6, 10, 4, "#9ad0f0"); R(g, 4, 6, 3, 1, "#e8f6ff"); R(g, 3, 17, 10, 3, "#7ab0d0");   // стёкла
    R(g, 4, 10, 8, 7, "#f4f0e8"); R(g, 4, 10, 8, 1, "#d8d0c0");                                  // белая крыша
    R(g, 3, 1, 2, 2, "#fff4b0"); R(g, 11, 1, 2, 2, "#fff4b0");                                   // фары
    R(g, 3, 23, 2, 2, brake ? "#ff4040" : "#8a1a1a"); R(g, 11, 23, 2, 2, brake ? "#ff4040" : "#8a1a1a");
    R(g, 0, 5, 2, 4, "#1a1a1a"); R(g, 14, 5, 2, 4, "#1a1a1a"); R(g, 0, 18, 2, 4, "#1a1a1a"); R(g, 14, 18, 2, 4, "#1a1a1a");   // колёса
    PK.outline(cv, OL); return cv;
  }
  // ---------- препятствия на серпантине (вид сверху) ----------
  function goat(f) { const cv = PK.mk(14, 10), g = cv.getContext("2d");
    R(g, 2, 3, 9, 5, "#f4f0e8"); R(g, 10, 1, 3, 4, "#f4f0e8"); P(g, 12, 2, OL); R(g, 10, 0, 1, 1, "#8a7a6a"); R(g, 12, 0, 1, 1, "#8a7a6a"); R(g, 12, 5, 1, 2, "#d8d0c0");
    R(g, 3, 8, 1, 2 - f, "#5a4a3a"); R(g, 9, 8, 1, 1 + f, "#5a4a3a"); R(g, 1, 3, 1, 2, "#d8d0c0"); PK.outline(cv, OL); return cv; }
  function cyclist(f) { const cv = PK.mk(8, 16), g = cv.getContext("2d");
    R(g, 3, 0, 2, 16, "#2a2a30"); R(g, 1, 5, 6, 6, "#f2c23a"); PK.ell(g, 4, 6, 2, 2, "#e8b48e"); R(g, 2, 4, 4, 2, "#d8303a"); R(g, f ? 1 : 6, 11, 1, 2, "#e8b48e"); PK.outline(cv, OL); return cv; }
  function vespa() { const cv = PK.mk(8, 16), g = cv.getContext("2d");
    R(g, 2, 1, 4, 14, "#7ac8b0"); R(g, 1, 3, 6, 2, "#5a5a64"); R(g, 2, 7, 4, 5, "#3a3a48"); PK.ell(g, 4, 9, 2, 2, "#f4f0e8"); P(g, 3, 1, "#fff4b0"); P(g, 4, 1, "#fff4b0"); PK.outline(cv, OL); return cv; }
  function flower(col) { const cv = PK.mk(7, 7), g = cv.getContext("2d");
    R(g, 3, 4, 1, 3, "#3a7a2a"); [[3, 1], [1, 3], [5, 3], [3, 5]].forEach(([x, y]) => P(g, x, y, col)); R(g, 2, 2, 3, 3, col); P(g, 3, 3, "#f2d23a"); return cv; }
  // ---------- трава с виноградниками: плитка 320×180, крутится вертикально ----------
  function grassTile() {
    const cv = PK.mk(320, 180), g = cv.getContext("2d"), rnd = PK.rng(41);
    R(g, 0, 0, 320, 180, "#7aa84a");
    // широкие полосы скошенной травы и тёмные пятна
    for (let y = 0; y < 180; y += 30) R(g, 0, y, 320, 15, "#80ae50");
    for (let i = 0; i < 14; i++) PK.ell(g, Math.floor(rnd() * 320), Math.floor(rnd() * 180), 10 + Math.floor(rnd() * 14), 5 + Math.floor(rnd() * 6), "#6e9c40");
    for (let i = 0; i < 700; i++) P(g, Math.floor(rnd() * 320), Math.floor(rnd() * 180), rnd() < .5 ? "#90be60" : "#62903a");
    for (let i = 0; i < 70; i++) { const x = Math.floor(rnd() * 320), y = Math.floor(rnd() * 180); R(g, x, y, 1, 2, "#5a8a32"); R(g, x + 2, y + 1, 1, 2, "#5a8a32"); }
    // полевые цветочки
    for (let i = 0; i < 90; i++) P(g, Math.floor(rnd() * 320), Math.floor(rnd() * 180), ["#f4f0e8", "#f2d23a", "#e87aa0", "#b08ae0"][i % 4]);
    return cv;
  }
  // всё «вид сверху», с тенью вправо-вниз (солнце садится слева-сверху)
  const shade = (g, x, y, rx, ry) => { g.save(); g.globalAlpha = .28; PK.ell(g, x, y, rx, ry, "#1e3a12"); g.restore(); };
  function cypress() { const cv = PK.mk(14, 26), g = cv.getContext("2d"); shade(g, 8, 18, 5, 7);
    PK.ell(g, 6, 11, 4, 10, "#24481f"); PK.ell(g, 5, 10, 3, 8, "#2f5a2a"); PK.ell(g, 4, 8, 1, 5, "#4a7f3a"); P(g, 6, 3, "#4a7f3a"); PK.outline(cv, "#16301a"); return cv; }
  function olive() { const cv = PK.mk(24, 22), g = cv.getContext("2d"); shade(g, 14, 14, 9, 6);
    R(g, 10, 12, 3, 6, "#6a4a32"); PK.ell(g, 11, 9, 9, 7, "#6a8a5a"); PK.ell(g, 8, 7, 5, 4, "#7e9e6a"); PK.ell(g, 15, 10, 4, 3, "#5a7a4a");
    for (let k = 0; k < 9; k++) P(g, 4 + (k * 7) % 15, 4 + (k * 5) % 10, "#9ab884"); PK.outline(cv, "#2a3a22"); return cv; }
  function vines() { const cv = PK.mk(34, 26), g = cv.getContext("2d");
    R(g, 0, 0, 34, 26, "#9a8a5a"); for (let k = 0; k < 5; k++) { R(g, 1 + k * 7, 0, 4, 26, "#4f7a2a"); R(g, 2 + k * 7, 0, 1, 26, "#6a9a3a");
      for (let y = 2; y < 26; y += 4) { P(g, 2 + k * 7, y, "#6a2a5a"); P(g, 3 + k * 7, y + 1, "#8a3a7a"); } P(g, 3 + k * 7, 0, "#5a4a32"); }
    PK.outline(cv, "#3a3a20"); return cv; }
  function lavender() { const cv = PK.mk(30, 20), g = cv.getContext("2d");
    for (let k = 0; k < 4; k++) { R(g, k * 8, 0, 6, 20, "#5a7a4a"); for (let y = 0; y < 20; y += 2) { P(g, k * 8 + 1 + (y % 4 ? 0 : 2), y, "#9a7ad0"); P(g, k * 8 + 3, y + 1, "#b89ae8"); } }
    return cv; }
  function house() { const cv = PK.mk(34, 30), g = cv.getContext("2d"); shade(g, 20, 22, 15, 8);
    // черепичная крыша сверху: два ската + труба, внизу дворик с горшками
    R(g, 3, 3, 26, 9, "#c8603a"); R(g, 3, 12, 26, 9, "#a84a2c"); for (let x = 4; x < 29; x += 3) { R(g, x, 3, 1, 9, "#d8784a"); R(g, x, 12, 1, 9, "#b85a34"); }
    R(g, 3, 11, 26, 2, "#e0906a"); R(g, 22, 5, 3, 4, "#8a7a6a"); R(g, 3, 21, 26, 6, "#e8d8b0"); R(g, 13, 22, 4, 5, "#6a4a32");
    [[6, 24], [24, 24]].forEach(([x, y]) => { R(g, x, y, 3, 3, "#b8603a"); P(g, x + 1, y - 1, "#e85a6a"); });
    PK.outline(cv, OL); return cv; }
  function rock() { const cv = PK.mk(11, 8), g = cv.getContext("2d"); shade(g, 6, 5, 5, 2); PK.ell(g, 5, 3, 4, 2, "#a8a090"); PK.ell(g, 4, 2, 2, 1, "#c8c0b0"); PK.outline(cv, OL); return cv; }
  // ---------- закатная вершина (вид сбоку) ----------
  function summit() {
    const W = 320, H = 180, cv = PK.mk(W, H), g = cv.getContext("2d");
    PK.gradV(g, 0, 0, W, 96, ["#4a3a7a", "#a85a8a", "#f08a6a", "#ffc87a"]);
    PK.ell(g, 214, 92, 16, 16, "#ffe8a0"); PK.ell(g, 214, 92, 12, 12, "#fff4c8");
    // горы вдали и озеро
    PK.poly(g, [[0, 98], [40, 74], [80, 92], [130, 70], [170, 96], [230, 78], [280, 94], [320, 76], [320, 104], [0, 104]], "#6a4a7a");
    PK.poly(g, [[0, 104], [60, 88], [110, 102], [180, 90], [250, 104], [320, 92], [320, 110], [0, 110]], "#4a3a6a");
    R(g, 0, 104, W, 14, "#e8a07a"); for (let k = 0; k < 12; k++) R(g, 150 + (k * 13) % 120, 106 + (k * 5) % 10, 10, 1, "#ffd8a0");
    // деревенька на дальнем берегу: огоньки в окнах
    for (let k = 0; k < 9; k++) { const x = 30 + k * 13 + (k % 3) * 4, y = 100 + (k % 2); R(g, x, y, 7, 5, "#8a5a6a"); R(g, x, y - 2, 7, 2, "#a85a4a"); P(g, x + 2, y + 2, "#ffd870"); }
    R(g, 104, 92, 3, 10, "#8a5a6a"); R(g, 104, 90, 3, 2, "#a85a4a");                       // колокольня
    // вершина холма с травой
    PK.poly(g, [[0, 114], [90, 108], [200, 110], [320, 116], [320, 180], [0, 180]], "#5a7a3a");
    PK.poly(g, [[0, 114], [90, 108], [200, 110], [320, 116], [320, 119], [200, 113], [90, 111], [0, 117]], "#86a85a");
    const rnd = PK.rng(9);
    for (let i = 0; i < 260; i++) { const x = Math.floor(rnd() * W), y = 116 + Math.floor(rnd() * 64); P(g, x, y, rnd() < .5 ? "#6a8a4a" : "#4e6e32"); }
    for (let i = 0; i < 70; i++) { const x = Math.floor(rnd() * W), y = 118 + Math.floor(rnd() * 60); P(g, x, y, ["#f4f0e8", "#f2d23a", "#e87aa0", "#ff9a6a"][i % 4]); P(g, x, y + 1, "#3a5a2a"); }
    // скамейка и кипарисы
    R(g, 40, 120, 34, 3, "#8a5a32"); R(g, 40, 114, 34, 2, "#8a5a32"); R(g, 40, 116, 34, 1, "#6a4224"); R(g, 42, 123, 2, 6, "#5a3a20"); R(g, 70, 123, 2, 6, "#5a3a20");
    RK.box(g, 40, 114, 34, 2, OL); RK.box(g, 40, 120, 34, 3, OL);
    [[12, 122], [24, 126], [292, 124], [304, 128]].forEach(([x, y]) => { PK.ell(g, x, y - 16, 5, 16, "#2a3a2a"); PK.ell(g, x - 1, y - 18, 2, 11, "#3a4e30"); });
    return cv;
  }
  // ---------- футболка: половина «Интер» (сине-чёрные полосы), половина «Спартак» (красно-белая) ----------
  function shirt() {
    const cv = PK.mk(40, 40), g = cv.getContext("2d");
    PK.poly(g, [[13, 3], [27, 3], [38, 9], [35, 19], [30, 16], [30, 38], [10, 38], [10, 16], [5, 19], [2, 9]], "#fff");
    const im = g.getImageData(0, 0, 40, 40), d = im.data; g.clearRect(0, 0, 40, 40);
    for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) { if (!d[(y * 40 + x) * 4 + 3]) continue;
      if (y < 7 && Math.abs(x - 19.5) < 4.5 - (y - 3) * .9) continue;                 // вырез горловины
      const col = x < 20 ? (Math.floor((x - 2) / 3) % 2 ? "#14141c" : "#1e48c0")          // «Интер»: сине-чёрные полосы
        : (y >= 17 && y < 22 ? "#f4f0e8" : "#d8202c");                                  // «Спартак»: красная с белой полосой
      P(g, x, y, col); }
    // воротник и манжеты
    for (let x = 14; x < 26; x++) { const y = 3 + Math.round(Math.max(0, 4.5 - Math.abs(x - 19.5)) * .9); P(g, x, y, "#f4f0e8"); }
    PK.line(g, 3, 10, 6, 18, "#f4f0e8"); PK.line(g, 37, 10, 34, 18, "#f4f0e8");
    R(g, 20, 6, 1, 32, "#f2c23a");                                                       // шов «дружбы» посередине
    for (let y = 8; y < 38; y += 3) { P(g, 19, y, "#f2c23a"); P(g, 21, y + 1, "#f2c23a"); }
    R(g, 10, 36, 20, 2, "#00000033");
    PK.outline(cv, OL); return cv;
  }
  return { build, car, goat, cyclist, vespa, flower, grassTile, cypress, olive, vines, lavender, house, rock, summit, shirt };
})();
