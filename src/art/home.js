/* Квартира родителей зимним вечером: ковёр на стене, стенка с хрусталём, телевизор с футболом,
   ёлка с гирляндой, за окном снег и огни соседних домов. 320×180, вид 3/4 сверху. */
"use strict";
window.HomeArt = (() => {
  const W = 320, H = 180, WALL = 60;
  const R = PK.R, P = PK.P, OL = RK.OL;
  const WIN = { x: 138, y: 8, w: 40, h: 36 };
  const TV = { x: 270, y: 30, w: 44, h: 22 };
  function staticLayer() {
    const cv = PK.mk(W, H), g = cv.getContext("2d"), rnd = PK.rng(11);
    // ---------- обои с советским узором ----------
    R(g, 0, 0, W, WALL, "#d6bf9c");
    for (let y = 4; y < WALL - 6; y += 10) for (let x = ((y / 10) & 1) * 8; x < W; x += 16) {
      P(g, x, y, "#b89a74"); P(g, x - 1, y + 1, "#b89a74"); P(g, x + 1, y + 1, "#b89a74"); P(g, x, y + 2, "#b89a74"); P(g, x, y + 1, "#c8605a"); }
    for (let x = 0; x < W; x += 16) R(g, x + 12, 0, 1, WALL, "#cdb48e");
    R(g, 0, 0, W, 3, "#a88a64"); R(g, 0, 3, W, 1, "#eedcbc");
    R(g, 0, WALL - 4, W, 4, "#7a4a2a"); R(g, 0, WALL - 4, W, 1, "#a8703e"); R(g, 0, WALL - 1, W, 1, "#4a2a18");
    // ---------- паркет ёлочкой ----------
    for (let y = WALL; y < H; y += 4) for (let x = -8; x < W; x += 8) {
      const odd = ((x + 8) / 8 + (y - WALL) / 4) & 1, col = ["#c48a52", "#cc945a", "#b88048", "#d29c62"][Math.floor(rnd() * 4)];
      if (odd) { R(g, x, y, 8, 4, col); R(g, x, y, 8, 1, PK.mix(col, "#f0c890", .3)); R(g, x + 7, y, 1, 4, "#8a5a32"); }
      else { R(g, x, y, 4, 4, col); R(g, x + 4, y, 4, 4, PK.mix(col, "#8a5a32", .12)); R(g, x + 3, y, 1, 4, "#8a5a32"); R(g, x, y + 3, 8, 1, "#8a5a32"); }
    }
    RK.shade(g, 0, WALL, W, 3, .3);
    RK.speck(g, rnd, 0, WALL + 3, W, H - WALL - 3, 120, "#9a6a3a", .5);

    // ---------- дверь в коридор ----------
    R(g, 96, 6, 28, WALL - 6, "#e8e0d0"); RK.box(g, 96, 6, 28, WALL - 6, OL);
    R(g, 99, 9, 22, WALL - 9, "#a8784a"); R(g, 99, 9, 22, 1, "#c8945e"); RK.box(g, 102, 12, 16, 18, "#8a5a32"); RK.box(g, 102, 33, 16, 20, "#8a5a32");
    R(g, 103, 13, 14, 16, "#d8e8ec"); R(g, 104, 14, 2, 14, "#ffffff");      // матовое стекло
    R(g, 116, 34, 3, 2, "#e8c060"); P(g, 116, 34, "#fff0a0");
    // ---------- ковёр на стене ----------
    const cx = 18, cy = 6, cw = 72, ch = 40;
    R(g, cx, cy, cw, ch, "#8a1c24"); RK.box(g, cx, cy, cw, ch, OL); RK.box(g, cx + 2, cy + 2, cw - 4, ch - 4, "#e8b860"); RK.box(g, cx + 4, cy + 4, cw - 8, ch - 8, "#3a1c3a");
    for (let x = cx + 6; x < cx + cw - 6; x += 6) { P(g, x, cy + 3, "#3a1c3a"); P(g, x + 3, cy + ch - 4, "#3a1c3a"); }
    PK.poly(g, [[cx + 36, cy + 7], [cx + 60, cy + 20], [cx + 36, cy + 33], [cx + 12, cy + 20]], "#c8402a");
    PK.poly(g, [[cx + 36, cy + 11], [cx + 52, cy + 20], [cx + 36, cy + 29], [cx + 20, cy + 20]], "#1e3a5a");
    PK.poly(g, [[cx + 36, cy + 15], [cx + 44, cy + 20], [cx + 36, cy + 25], [cx + 28, cy + 20]], "#e8b860");
    R(g, cx + 35, cy + 19, 3, 3, "#8a1c24");
    [[cx + 9, cy + 9], [cx + 63, cy + 9], [cx + 9, cy + 31], [cx + 63, cy + 31]].forEach(([x, y]) => { PK.poly(g, [[x, y - 3], [x + 3, y], [x, y + 3], [x - 3, y]], "#e8b860"); P(g, x, y, "#c8402a"); });
    // ---------- диван под ковром ----------
    RK.block(g, 16, 40, 76, 6, 10, { top: "#5a7a4a", front: "#4a6a3c" });
    RK.block(g, 12, 46, 10, 4, 26, { top: "#5a7a4a", front: "#41603a" });
    RK.block(g, 86, 46, 10, 4, 26, { top: "#5a7a4a", front: "#41603a" });
    RK.block(g, 22, 54, 64, 10, 10, { top: "#6a8a58", front: "#4a6a3c" });
    for (let x = 30; x < 86; x += 16) R(g, x, 55, 1, 9, "#4a6a3c");
    R(g, 26, 47, 12, 8, "#e8c060"); RK.box(g, 26, 47, 12, 8, OL); R(g, 27, 48, 10, 2, "#f8dc90");         // подушки
    R(g, 68, 47, 12, 8, "#c8402a"); RK.box(g, 68, 47, 12, 8, OL); R(g, 69, 48, 10, 2, "#e86a4a");
    // ---------- окно: ночь, снег, соседние дома ----------
    const w = WIN;
    PK.gradV(g, w.x + 2, w.y + 2, w.w - 4, w.h - 4, ["#0e1430", "#1c2850", "#2c3c6a"]);
    R(g, w.x + 4, w.y + 16, 14, 18, "#1a1e30"); R(g, w.x + 22, w.y + 12, 14, 22, "#20243a");
    for (let k = 0; k < 14; k++) { const x = w.x + 5 + (k % 3) * 4 + (k > 6 ? 18 : 0), y = w.y + 18 + Math.floor((k % 7) / 3) * 5 - (k > 6 ? 4 : 0); if (rnd() < .6) R(g, x, y, 2, 2, rnd() < .5 ? "#ffd88a" : "#f2b860"); }
    R(g, w.x + 2, w.y + w.h - 6, w.w - 4, 4, "#e8f0f8"); R(g, w.x + 2, w.y + w.h - 6, w.w - 4, 1, "#ffffff");   // сугроб на подоконнике снаружи
    RK.box(g, w.x, w.y, w.w, w.h, OL); RK.box(g, w.x + 1, w.y + 1, w.w - 2, w.h - 2, "#f4f0e8");
    R(g, w.x + w.w / 2 - 1, w.y + 1, 2, w.h - 2, "#f4f0e8"); R(g, w.x + 1, w.y + 12, w.w - 2, 2, "#f4f0e8");
    // иней по углам стекла
    for (let k = 0; k < 18; k++) { const a = rnd() * 6, r = rnd() * 5; P(g, w.x + 2 + Math.abs(Math.cos(a) * r), w.y + 2 + Math.abs(Math.sin(a) * r), "#c8dcf0"); P(g, w.x + w.w - 3 - Math.abs(Math.cos(a) * r), w.y + w.h - 3 - Math.abs(Math.sin(a) * r), "#c8dcf0"); }
    // тюль
    for (let x = w.x - 6; x < w.x + w.w + 6; x++) { if (x > w.x + 6 && x < w.x + w.w - 6) continue; g.globalAlpha = .75; R(g, x, w.y - 3, 1, w.h + 8, (x & 1) ? "#f4f0e8" : "#e0dace"); g.globalAlpha = 1; }
    R(g, w.x - 8, w.y - 5, w.w + 16, 2, "#8a6a4a");
    // подоконник и батарея
    R(g, w.x - 4, w.y + w.h, w.w + 8, 3, "#f4f0e8"); RK.box(g, w.x - 4, w.y + w.h, w.w + 8, 3, OL);
    R(g, w.x + 2, w.y + w.h + 5, w.w - 4, 9, "#e8e4dc"); for (let x = w.x + 3; x < w.x + w.w - 2; x += 3) R(g, x, w.y + w.h + 5, 1, 9, "#b8b0a4"); RK.box(g, w.x + 2, w.y + w.h + 5, w.w - 4, 9, OL);
    // фиалки на подоконнике
    [[w.x - 2, "#9a5ac8"], [w.x + w.w - 6, "#e85a8a"]].forEach(([x, f]) => { R(g, x, w.y + w.h - 4, 6, 4, "#c86a3a"); RK.box(g, x, w.y + w.h - 4, 6, 4, OL); PK.ell(g, x + 3, w.y + w.h - 6, 4, 2, "#4f7a3a"); P(g, x + 1, w.y + w.h - 7, f); P(g, x + 4, w.y + w.h - 8, f); P(g, x + 3, w.y + w.h - 6, f); });

    // ---------- стенка с хрусталём ----------
    RK.block(g, 194, 2, 70, 3, 56, { top: "#6a3a22", front: "#5a2e1a" });
    for (let k = 0; k < 3; k++) { const x = 197 + k * 22; RK.box(g, x, 8, 20, 24, "#3a1c10"); R(g, x + 1, 9, 18, 22, "#8aa8b8"); R(g, x + 2, 10, 2, 20, "#c8dce4");
      for (let s = 0; s < 2; s++) { R(g, x + 1, 19 + s * 11, 18, 1, "#5a2e1a"); for (let c = 0; c < 4; c++) { const gx = x + 3 + c * 4, gy = 13 + s * 11; R(g, gx, gy, 3, 5, "#e8f4f8"); P(g, gx + 1, gy + 1, "#ffffff"); P(g, gx, gy + 4, "#a8c4d0"); } } }
    for (let k = 0; k < 3; k++) { RK.box(g, 197 + k * 22, 34, 20, 20, "#3a1c10"); R(g, 205 + k * 22, 42, 4, 1, "#e8c060"); }
    // сервиз «Мадонна» на верхней полке и фото
    R(g, 205, 0, 8, 2, "#f4ece0"); R(g, 230, 0, 6, 2, "#e8c060");
    // ---------- тумба и телевизор ----------
    RK.block(g, 266, 50, 50, 4, 12, { top: "#6a3a22", front: "#5a2e1a" }); RK.box(g, 270, 55, 18, 6, "#3a1c10"); RK.box(g, 292, 55, 18, 6, "#3a1c10");
    R(g, TV.x - 1, TV.y - 1, TV.w + 2, TV.h + 2, "#1e1e24"); RK.box(g, TV.x - 2, TV.y - 2, TV.w + 4, TV.h + 4, OL); R(g, TV.x + 18, TV.y + TV.h + 1, 8, 3, "#2a2a30");
    // ---------- фикус ----------
    R(g, 182, 46, 10, 12, "#c86a3a"); RK.box(g, 182, 46, 10, 12, OL); RK.shadeEll(g, 187, 59, 7, 2);
    [[186, 32, 5], [182, 38, 4], [191, 37, 4], [187, 24, 4], [184, 44, 3]].forEach(([x, y, r]) => { PK.ell(g, x, y, r + 1, r, "#2f5426"); PK.ell(g, x - 1, y - 1, r, r - 1, "#4f8a3a"); P(g, x - 2, y - 2, "#8ac25a"); });

    // ---------- круглый ковёр ----------
    PK.ell(g, 160, 128, 64, 30, OL); PK.ell(g, 160, 128, 63, 29, "#8a2a2a"); PK.ell(g, 160, 128, 58, 26, "#e8b860"); PK.ell(g, 160, 128, 55, 24, "#5a2a4a"); PK.ell(g, 160, 128, 36, 15, "#c84a3a"); PK.ell(g, 160, 128, 20, 8, "#e8b860");
    RK.speck(g, rnd, 100, 104, 120, 48, 70, "#3a1a2a", .4);
    // ---------- стол с чаем и блинами ----------
    RK.block(g, 24, 104, 60, 22, 10, { top: "#f4ecd8", front: "#c8b89a" });
    for (let x = 26; x < 82; x += 7) R(g, x, 106, 3, 20, "#ece0c4"); for (let x = 25; x < 84; x += 3) P(g, x, 136, "#f4ecd8");
    // самовар
    R(g, 32, 98, 10, 14, "#d8a040"); R(g, 33, 99, 3, 12, "#f2d080"); R(g, 30, 110, 14, 3, "#a87a2a"); R(g, 35, 95, 4, 3, "#a87a2a"); P(g, 44, 105, "#a87a2a"); P(g, 45, 106, "#a87a2a"); RK.box(g, 32, 98, 10, 14, OL);
    // блины с икрой на тарелке
    PK.ell(g, 60, 114, 10, 4, "#e8e4dc"); PK.ell(g, 60, 113, 8, 3, "#e8a848"); PK.ell(g, 60, 112, 7, 2, "#f6c86a"); PK.ell(g, 60, 111, 3, 1, "#c8202c"); P(g, 59, 111, "#ff6a5a");
    // чашки
    [[48, 118], [72, 107], [76, 120]].forEach(([x, y]) => { R(g, x, y, 5, 4, "#ffffff"); R(g, x + 1, y + 1, 3, 1, "#8a4a2a"); RK.box(g, x - 1, y - 1, 7, 6, OL); P(g, x + 5, y + 1, OL); });
    // стулья
    RK.block(g, 88, 112, 12, 3, 10, { top: "#8a5a32", front: "#6a4024" }); RK.block(g, 8, 112, 12, 3, 10, { top: "#8a5a32", front: "#6a4024" });
    // ---------- ёлка в углу ----------
    RK.shadeEll(g, 302, 152, 14, 3, .35);
    R(g, 298, 144, 8, 8, "#c84a3a"); RK.box(g, 298, 144, 8, 8, OL); R(g, 300, 140, 4, 4, "#5a3a24");
    for (let k = 0; k < 5; k++) { const y = 104 + k * 8, ww = 5 + k * 3; PK.poly(g, [[302, y - 4], [302 + ww, y + 6], [302 - ww, y + 6]], "#1e4a2a"); PK.poly(g, [[302, y - 4], [302 - ww, y + 6], [301, y + 6]], "#2f6a34"); }
    PK.poly(g, [[302, 96], [304, 100], [300, 100]], "#f2d23a"); P(g, 302, 98, "#fff4a0");
    // подарки под ёлкой
    R(g, 284, 146, 10, 8, "#3f6f8f"); R(g, 288, 146, 2, 8, "#f2d23a"); RK.box(g, 284, 146, 10, 8, OL);
    R(g, 308, 148, 8, 7, "#e84a5a"); R(g, 311, 148, 2, 7, "#f4ece0"); RK.box(g, 308, 148, 8, 7, OL);
    // ---------- тапочки и газета ----------
    R(g, 110, 160, 6, 3, "#5a6aa8"); R(g, 117, 161, 6, 3, "#5a6aa8"); RK.box(g, 109, 159, 8, 5, OL); RK.box(g, 116, 160, 8, 5, OL);
    RK.shade(g, 231, 87, 14, 9, .25); R(g, 230, 86, 14, 9, "#e8e0cc"); R(g, 232, 88, 10, 1, "#6a6a6a"); R(g, 232, 90, 6, 1, "#6a6a6a"); R(g, 232, 92, 8, 1, "#d8202c");
    return cv;
  }
  // Что нельзя проходить (прямоугольники в координатах «ног» героя)
  const BLOCKERS = [
    [0, 0, W, 64], [10, 0, 88, 76], [266, 0, 54, 66], [180, 0, 16, 62],
    [22, 102, 64, 38], [6, 110, 16, 14], [86, 110, 16, 14], [282, 100, 38, 58],
    [0, 0, 4, H], [W - 4, 0, 4, H], [0, H - 4, W, 4]
  ];
  const DOOR = { x: 96, y: 56, w: 28, h: 12 };
  function create() {
    const bg = staticLayer(), rnd = PK.rng(5);
    const flakes = Array.from({ length: 24 }, () => ({ x: rnd() * WIN.w, y: rnd() * WIN.h, s: .4 + rnd() * .6 }));
    const players = Array.from({ length: 6 }, (_, i) => ({ x: rnd() * 36, y: 4 + (i % 3) * 5, red: i < 3 }));
    // Перерисовка подложки каждый кадр: снег за окном, футбол по телевизору, гирлянда на ёлке
    return (g, t) => {
      const s = t / 1000;
      g.drawImage(bg, 0, 0);
      // снег
      flakes.forEach(f => { const y = (f.y + s * 10 * f.s) % (WIN.h - 8), x = (f.x + Math.sin(s + f.y) * 2 + WIN.w) % (WIN.w - 6); P(g, WIN.x + 3 + x, WIN.y + 3 + y, "#ffffff"); });
      // телевизор: футбольное поле, бегают игроки, мяч
      const tv = TV; R(g, tv.x, tv.y, tv.w, tv.h, "#3a8a3a"); for (let x = tv.x; x < tv.x + tv.w; x += 6) R(g, x, tv.y, 3, tv.h, "#44964a");
      R(g, tv.x + tv.w / 2, tv.y, 1, tv.h, "#e8f4e8"); PK.ell(g, tv.x + tv.w / 2, tv.y + tv.h / 2, 4, 4, "#e8f4e8"); PK.ell(g, tv.x + tv.w / 2, tv.y + tv.h / 2, 3, 3, "#3a8a3a");
      players.forEach((p, i) => { const x = tv.x + 3 + ((p.x + Math.sin(s * (1 + i * .3) + i) * 8 + 36) % 38), y = tv.y + 3 + p.y + Math.round(Math.cos(s * 1.4 + i) * 2); R(g, x, y, 2, 3, p.red ? "#e8202c" : "#f4f4f4"); P(g, x, y + 3, "#222"); });
      P(g, tv.x + 22 + Math.round(Math.sin(s * 2) * 14), tv.y + 11 + Math.round(Math.cos(s * 3) * 5), "#ffffff");
      R(g, tv.x + 1, tv.y + 1, 15, 4, "#1e1e24"); R(g, tv.x + 2, tv.y + 2, 3, 2, "#e8202c"); R(g, tv.x + 6, tv.y + 2, 2, 2, "#ffffff"); R(g, tv.x + 10, tv.y + 2, 1, 2, "#ffffff"); R(g, tv.x + 12, tv.y + 2, 3, 2, "#3a5ab0");
      // гирлянда
      const bulbs = [[296, 104], [306, 110], [298, 116], [309, 122], [294, 126], [303, 130], [313, 136], [291, 138], [300, 138]];
      bulbs.forEach(([x, y], i) => P(g, x, y, ["#ff4a5a", "#f2d23a", "#4ab0ff", "#6ae06a"][(i + Math.floor(s * 2)) % 4]));
    };
  }
  return { create, W, H, BLOCKERS, DOOR };
})();
