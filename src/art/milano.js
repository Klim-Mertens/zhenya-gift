/* Глава 1, Милан: вокзал Милано Централе, площадь Дуомо, кухня Нарины.
   Всё рисуется кодом, 320×180, вид 3/4 сверху, тёплый контур как в прологе. */
"use strict";
window.MilanoArt = (() => {
  const W = 320, H = 180, R = PK.R, P = PK.P, OL = RK.OL;
  const text = (...a) => StationArt.text(...a), textW = (...a) => StationArt.textW(...a);
  const EDGE = 74;    // край перрона (как в прологе: поезд у верхнего края)

  // ---------- 1. Милано Централе ----------
  function centraleStatic() {
    const cv = PK.mk(W, H), g = cv.getContext("2d"), rnd = PK.rng(31);
    // стеклянный свод с железными арками, солнечный свет
    PK.gradV(g, 0, 0, W, 24, ["#bfe0f0", "#e4f2f6"]);
    for (let x = -10; x < W + 10; x += 40) { for (let k = 0; k < 40; k++) { const y = Math.round(22 - Math.sin(k / 40 * Math.PI) * 18); P(g, x + k, y, "#4a5058"); P(g, x + k, y + 1, "#6a7078"); } R(g, x, 0, 2, 24, "#4a5058"); }
    for (let y = 4; y < 22; y += 6) R(g, 0, y, W, 1, "#8a9098");
    // пути
    R(g, 0, 22, W, EDGE - 22, "#7a7068"); for (let x = 0; x < W; x += 6) R(g, x, 58, 4, 12, "#5a4a40");
    R(g, 0, 60, W, 2, "#b8b4ac"); R(g, 0, 67, W, 2, "#b8b4ac"); RK.speck(g, rnd, 0, 22, W, 50, 260, "#8a8078", .8);
    // перрон: светлый камень плитками
    R(g, 0, EDGE, W, H - EDGE, "#e8dcc4");
    for (let y = EDGE + 6; y < H; y += 12) { R(g, 0, y, W, 1, "#d4c6aa"); for (let x = ((y / 12) & 1) * 12; x < W; x += 24) R(g, x, y - 11, 1, 11, "#d4c6aa"); }
    RK.speck(g, rnd, 0, EDGE, W, H - EDGE, 500, "#d8caae", .7);
    R(g, 0, EDGE, W, 3, "#f2c23a"); R(g, 0, EDGE + 3, W, 1, "#b8902a"); RK.shade(g, 0, EDGE + 4, W, 2, .18);
    // солнечные пятна сквозь стекло
    for (let i = 0; i < 6; i++) { g.globalAlpha = .18; PK.poly(g, [[20 + i * 56, EDGE + 6], [44 + i * 56, EDGE + 6], [64 + i * 56, H], [34 + i * 56, H]], "#fff6d8"); g.globalAlpha = 1; }
    // табличка MILANO CENTRALE
    const t = "MILANO CENTRALE", tw = textW(t) + 12, sx = 116, sy = 86;
    R(g, sx + 4, sy + 10, 2, 18, "#2a2a30"); R(g, sx + tw - 6, sy + 10, 2, 18, "#2a2a30");
    R(g, sx, sy, tw, 11, "#1e4a8a"); RK.box(g, sx, sy, tw, 11, OL); RK.box(g, sx + 1, sy + 1, tw - 2, 9, "#f4f0e8"); text(g, t, sx + 6, sy + 3, "#f4f0e8");
    RK.shadeEll(g, sx + tw / 2, sy + 29, tw / 2, 2, .2);
    // лимонное дерево в кадке
    RK.shadeEll(g, 26, 118, 12, 3, .3); RK.block(g, 18, 104, 16, 3, 11, { top: "#5a3a24", front: "#c8683a" });
    PK.ell(g, 26, 92, 12, 10, "#3a6a2e"); PK.ell(g, 24, 90, 9, 7, "#4f8a3a"); PK.ell(g, 22, 87, 4, 3, "#6aa848");
    [[20, 90], [30, 88], [27, 96], [33, 94], [18, 96]].forEach(([x, y]) => { R(g, x, y, 3, 3, "#f2d23a"); P(g, x, y, "#fff4a0"); });
    // скамейка
    RK.shadeEll(g, 90, 112, 18, 3, .25); RK.block(g, 72, 100, 36, 4, 7, { top: "#6a4a32", front: "#4a3020" }); R(g, 74, 107, 3, 5, "#2a2a30"); R(g, 103, 107, 3, 5, "#2a2a30");
    // кофейный киоск
    RK.block(g, 266, 128, 44, 6, 22, { top: "#f4ece0", front: "#3a6a4a" }); R(g, 266, 118, 44, 10, "#c8402a"); for (let x = 266; x < 310; x += 8) R(g, x, 118, 4, 10, "#f4ece0"); RK.box(g, 266, 118, 44, 10, OL);
    text(g, "CAFFE", 276, 141, "#f4ece0"); R(g, 272, 130, 6, 4, "#f4f0e8"); R(g, 280, 130, 6, 4, "#f4f0e8"); P(g, 274, 129, "#8a5a32");
    return cv;
  }
  function centrale() {
    const st = centraleStatic(), rnd = PK.rng(5), pig = Array.from({ length: 5 }, (_, i) => ({ x: 120 + i * 30 + rnd() * 20, y: 140 + rnd() * 26, ph: rnd() * 6 }));
    return {
      back(g, t) { g.drawImage(st, 0, 0); const s = t / 1000;
        pig.forEach(p => { const peck = Math.sin(s * 3 + p.ph) > .6 ? 1 : 0, x = p.x + Math.sin(s * .4 + p.ph) * 6; R(g, x - 2, p.y - 2, 5, 3, "#8a8a98"); R(g, x + 2, p.y - 3 + peck, 2, 2, "#6a6a78"); P(g, x + 3, p.y - 3 + peck, "#3a2a24"); P(g, x - 1, p.y - 2, "#b8b8c8"); R(g, x - 1, p.y + 1, 1, 1, "#e8902a"); R(g, x + 1, p.y + 1, 1, 1, "#e8902a"); });
      },
      pigeons: pig
    };
  }

  // ---------- 2. Площадь Дуомо ----------
  function duomoStatic() {
    const cv = PK.mk(W, H), g = cv.getContext("2d"), rnd = PK.rng(77);
    PK.gradV(g, 0, 0, W, 70, ["#3a8ad8", "#6ab4ea", "#bfe2f4"]);
    // собор: белый мрамор с розоватым оттенком, шпили, три острых окна, порталы
    const cx = 160, top = 14, bw = 196, x0 = cx - bw / 2, base = 92;
    R(g, x0, 40, bw, base - 40, "#f2e8e0");
    for (let x = x0; x < x0 + bw; x += 2) for (let y = 40; y < base; y++) if (PK.bayer(x, y) > .8) P(g, x, y, "#e4d4cc");
    PK.poly(g, [[x0 + 30, 40], [cx, top + 8], [x0 + bw - 30, 40]], "#f2e8e0");                    // фронтон
    for (let i = 0; i <= 12; i++) { const sx = x0 + 4 + i * 15.6, sh = (i % 2 ? 22 : 30) + (i === 6 ? 14 : 0), sy = 40 - sh + (Math.abs(i - 6) < 3 ? -Math.max(0, 14 - Math.abs(i - 6) * 6) : 0);
      R(g, sx, sy, 4, 40 - sy + 4, "#f6efe8"); R(g, sx + 3, sy, 1, 40 - sy + 4, "#d8c8c0"); PK.poly(g, [[sx - 1, sy], [sx + 2, sy - 7], [sx + 5, sy]], "#f6efe8"); P(g, sx + 2, sy - 8, "#e8c060");
      for (let y = sy + 3; y < 40; y += 4) { P(g, sx - 1, y, "#e4d4cc"); P(g, sx + 4, y, "#e4d4cc"); } }
    R(g, cx - 1, top - 10, 2, 8, "#e8c060"); PK.ell(g, cx, top - 12, 2, 2, "#f2d23a");            // Мадоннина
    // вертикальные пилястры
    for (let i = 0; i < 7; i++) { const px = x0 + 4 + i * 31; R(g, px, 40, 5, base - 40, "#fbf6f0"); R(g, px + 4, 40, 1, base - 40, "#d8c8c0"); }
    // окна
    [[cx - 50, 48, 10], [cx, 44, 16], [cx + 50, 48, 10]].forEach(([x, y, w]) => { PK.poly(g, [[x - w / 2, y + 22], [x - w / 2, y + 6], [x, y], [x + w / 2, y + 6], [x + w / 2, y + 22]], "#5a4a6a");
      R(g, x - 1, y + 2, 2, 20, "#e8dcd4"); R(g, x - w / 2, y + 12, w, 1, "#e8dcd4"); P(g, x - 2, y + 8, "#c84a5a"); P(g, x + 2, y + 15, "#4a8ad8"); });
    // порталы
    for (let i = 0; i < 5; i++) { const px = x0 + 18 + i * 40, w = i === 2 ? 18 : 12, y = base - (i === 2 ? 22 : 16);
      R(g, px - w / 2, y, w, base - y, "#3a2a24"); PK.ell(g, px, y, w / 2, 4, "#3a2a24"); R(g, px - w / 2 + 1, y + 2, w - 2, base - y - 2, "#5a3a2a"); R(g, px - 1, y + 2, 1, base - y - 2, "#3a2a24"); }
    R(g, x0 - 2, base - 1, bw + 4, 3, "#d8c8c0");
    // боковые здания и галерея слева
    R(g, 0, 34, x0 - 4, 62, "#e8c890"); for (let y = 40; y < 90; y += 12) for (let x = 6; x < x0 - 10; x += 12) { R(g, x, y, 6, 8, "#5a4a3a"); R(g, x - 1, y - 1, 8, 1, "#c8a870"); }
    R(g, 8, 62, 40, 34, "#3a2a24"); PK.ell(g, 28, 62, 20, 12, "#3a2a24"); PK.ell(g, 28, 63, 17, 10, "#6a5a4a"); R(g, 11, 63, 34, 33, "#6a5a4a"); R(g, 12, 80, 32, 16, "#f2d8a0");
    R(g, x0 + bw + 4, 34, W - x0 - bw - 4, 62, "#f2dcb0"); for (let y = 40; y < 90; y += 12) for (let x = x0 + bw + 10; x < W - 4; x += 12) { R(g, x, y, 6, 8, "#4a5a6a"); R(g, x - 1, y + 8, 8, 1, "#c8a870"); }
    // площадь: светлая плитка с узором
    R(g, 0, 94, W, H - 94, "#e8dccc");
    for (let y = 100; y < H; y += 10) for (let x = ((y / 10) & 1) * 10; x < W; x += 20) { PK.poly(g, [[x + 5, y - 4], [x + 10, y], [x + 5, y + 4], [x, y]], "#ddcdb8"); }
    RK.speck(g, rnd, 0, 94, W, H - 94, 400, "#d4c4ae", .6);
    R(g, 0, 94, W, 2, "#c8b8a0");
    // киоск с джелато
    RK.shadeEll(g, 276, 150, 22, 4, .3);
    RK.block(g, 254, 124, 44, 6, 22, { top: "#f4ece0", front: "#e8a0b8" }); R(g, 254, 110, 44, 10, "#f4ece0"); for (let x = 254; x < 298; x += 8) R(g, x, 110, 4, 10, "#5ab0a0"); RK.box(g, 254, 110, 44, 10, OL);
    text(g, "GELATO", 263, 136, "#ffffff"); [[258, "#fff0c0"], [266, "#f8b0c0"], [274, "#8a5a3a"], [282, "#b8e0a0"], [290, "#f2d23a"]].forEach(([x, c]) => { PK.ell(g, x + 2, 126, 3, 2, c); });
    R(g, 300, 116, 2, 34, "#3a3a48"); R(g, 294, 112, 14, 5, "#e8a0b8");
    // фонари
    [[60, 112], [124, 112], [196, 112]].forEach(([x, y]) => { R(g, x, y, 2, 30, "#2a2a30"); R(g, x - 3, y - 4, 8, 5, "#2a2a30"); R(g, x - 2, y - 3, 6, 3, "#f2e8b0"); RK.shadeEll(g, x + 1, y + 30, 5, 1, .3); });
    return cv;
  }
  function duomo() {
    const st = duomoStatic(), rnd = PK.rng(9), pig = Array.from({ length: 14 }, () => ({ x: 70 + rnd() * 170, y: 120 + rnd() * 50, ph: rnd() * 6, fly: 0, vx: 0, vy: 0 }));
    const clouds = [[40, 12], [200, 22], [280, 8]];
    return {
      pigeons: pig,
      scare(x, y) { pig.forEach(p => { if (!p.fly && Math.hypot(p.x - x, p.y - y) < 22) { p.fly = 1; p.vx = (p.x - x || 1) * .06 + (rnd() - .5); p.vy = -1.4 - rnd(); } }); },
      back(g, t, dt = 16) { g.drawImage(st, 0, 0); const s = t / 1000;
        clouds.forEach(([x, y], i) => { const cx = ((x + s * 3 * (i + 1)) % 360) - 30; g.globalAlpha = .85; PK.ell(g, cx, y, 14, 3, "#ffffff"); PK.ell(g, cx + 6, y - 2, 8, 3, "#ffffff"); g.globalAlpha = 1; });
        pig.forEach(p => {
          if (p.fly) { p.x += p.vx; p.y += p.vy; p.vy -= .01; const f = Math.floor(s * 12) % 2; R(g, p.x - 2, p.y - 1, 5, 2, "#8a8a98"); R(g, p.x - 4, p.y - 2 - f, 3, 1, "#a8a8b8"); R(g, p.x + 2, p.y - 2 - f, 3, 1, "#a8a8b8");
            if (p.y < -10) { p.fly = 0; p.y = 120 + rnd() * 50; p.x = 60 + rnd() * 180; } return; }
          const peck = Math.sin(s * 3 + p.ph) > .6 ? 1 : 0, x = p.x + Math.sin(s * .4 + p.ph) * 4;
          R(g, x - 2, p.y - 2, 5, 3, "#8a8a98"); R(g, x + 2, p.y - 3 + peck, 2, 2, "#6a6a78"); P(g, x + 3, p.y - 3 + peck, "#3a2a24"); P(g, x - 1, p.y - 2, "#b8b8c8"); P(g, x + 2, p.y - 2 + peck, "#5aa088"); });
      }
    };
  }

  // ---------- 3. Кухня Нарины ----------
  function kitchenStatic() {
    const cv = PK.mk(W, H), g = cv.getContext("2d"), rnd = PK.rng(13);
    // стена: тёплая штукатурка и плитка-майолика у плиты
    R(g, 0, 0, W, 78, "#f2dcb8"); RK.speck(g, rnd, 0, 0, W, 78, 300, "#e8ccA0".toLowerCase(), .6);
    for (let y = 30; y < 78; y += 8) for (let x = 120; x < 316; x += 8) { const odd = ((x + y) / 8) % 2; R(g, x, y, 8, 8, odd ? "#f4f0e8" : "#e8eef0"); if (odd) { P(g, x + 4, y + 3, "#5a8ad0"); P(g, x + 3, y + 4, "#5a8ad0"); P(g, x + 5, y + 4, "#5a8ad0"); P(g, x + 4, y + 5, "#5a8ad0"); P(g, x + 4, y + 4, "#e8a020"); } RK.box(g, x, y, 8, 8, "#d8e0e4"); }
    // окно с видом на Милан и балконом с геранью
    R(g, 22, 6, 72, 46, "#f4f0e8"); RK.box(g, 22, 6, 72, 46, OL); PK.gradV(g, 26, 10, 64, 30, ["#58a8e2", "#a8d8f0"]);
    for (let x = 28; x < 88; x += 8) { R(g, x, 24 + (x % 3) * 2, 6, 16, ["#e8b878", "#f2dcb0", "#d89a68"][x % 3]); R(g, x - 1, 23 + (x % 3) * 2, 8, 2, "#c8582a"); P(g, x + 2, 30 + (x % 3) * 2, "#6a4a3a"); }
    R(g, 66, 12, 3, 14, "#f2e8e0"); PK.poly(g, [[65, 12], [67, 7], [70, 12]], "#f2e8e0"); P(g, 67, 6, "#e8c060");                     // шпиль Дуомо вдали
    R(g, 57, 10, 2, 30, "#f4f0e8"); R(g, 26, 24, 64, 2, "#f4f0e8");
    for (let x = 24; x < 92; x += 10) { R(g, x, 34, 8, 5, "#c8683a"); PK.ell(g, x + 4, 33, 5, 2, "#3a7a2e"); P(g, x + 2, 31, "#e83a4a"); P(g, x + 5, 31, "#e83a4a"); P(g, x + 6, 32, "#ff6a7a"); }
    R(g, 24, 39, 68, 11, "#3a3a44"); for (let x = 26; x < 92; x += 3) R(g, x, 41, 1, 9, "#5a5a64"); R(g, 24, 39, 68, 2, "#5a5a64");   // кованые перила
    // полка с банками
    R(g, 0, 66, 112, 4, "#8a5a32"); RK.box(g, 0, 66, 112, 4, OL);
    [[6, "#e8dcc8"], [18, "#c8402a"], [30, "#f2d23a"], [42, "#5a8a3a"], [54, "#8a5a32"], [66, "#e8dcc8"], [78, "#c8402a"], [90, "#3a7ac8"], [102, "#f2c23a"]].forEach(([x, c], i) => { R(g, x, 58 - (i % 2) * 2, 7, 8 + (i % 2) * 2, c); R(g, x, 56 - (i % 2) * 2, 7, 2, "#8a8a92"); RK.box(g, x, 56 - (i % 2) * 2, 7, 10 + (i % 2) * 2, OL); });
    // плитка на полу «шашечкой»
    R(g, 0, 78, W, H - 78, "#e8dcc4"); for (let y = 78; y < H; y += 10) for (let x = ((y - 78) / 10 & 1) * 10; x < W; x += 20) R(g, x, y, 10, 10, "#c8a878");
    // столешница с плитой и раковиной вдоль задней стены
    RK.block(g, 118, 70, 198, 8, 22, { top: "#e8e4dc", front: "#7a9a6a" });
    for (let x = 122; x < 312; x += 26) RK.box(g, x, 79, 24, 19, "#5a7a4a");
    R(g, 150, 72, 30, 5, "#2a2a30"); [[156, 74], [172, 74]].forEach(([x, y]) => { PK.ell(g, x, y, 4, 1, "#4a4a54"); });                 // плита
    R(g, 240, 72, 26, 5, "#a8b4bc"); R(g, 242, 73, 22, 3, "#c8d4dc"); R(g, 252, 64, 2, 8, "#a8b4bc"); R(g, 252, 64, 6, 2, "#a8b4bc");      // раковина
    R(g, 284, 62, 10, 10, "#c8402a"); R(g, 286, 60, 6, 2, "#2a2a30"); RK.box(g, 284, 62, 10, 10, OL);                                    // кофеварка-мока
    PK.poly(g, [[200, 70], [208, 60], [216, 70]], "#c8a060");                                                                           // хлеб
    // стол в центре с клетчатой скатертью
    RK.shadeEll(g, 160, 146, 66, 8, .25);
    R(g, 96, 112, 128, 26, "#f4f0e8"); for (let y = 112; y < 138; y += 4) for (let x = 96 + ((y / 4) & 1) * 4; x < 224; x += 8) R(g, x, y, 4, 4, "#d84a4a");
    R(g, 96, 138, 128, 6, "#c83a3a"); RK.box(g, 96, 112, 128, 32, OL); R(g, 100, 144, 4, 10, "#5a3a24"); R(g, 216, 144, 4, 10, "#5a3a24");
    // стулья
    [[80, 120], [228, 120]].forEach(([x, y]) => { RK.block(g, x, y, 14, 4, 6, { top: "#a8683a", front: "#7a4a2a" }); R(g, x + 1, y + 10, 2, 8, "#5a3a24"); R(g, x + 11, y + 10, 2, 8, "#5a3a24"); });
    // корзинка с лимонами и базилик
    PK.ell(g, 300, 150, 10, 4, "#c8a060"); [[296, 147], [301, 146], [305, 148]].forEach(([x, y]) => PK.ell(g, x, y, 3, 2, "#f2d23a"));
    R(g, 16, 140, 10, 10, "#c8683a"); PK.ell(g, 21, 136, 8, 5, "#3a8a2e"); PK.ell(g, 19, 134, 4, 2, "#5aaa3a");
    return cv;
  }
  function kitchen() {
    const st = kitchenStatic();
    return { back(g, t) { g.drawImage(st, 0, 0); const s = t / 1000;
      // пар из кастрюли на плите
      R(g, 150, 62, 14, 10, "#c8c8d0"); R(g, 150, 62, 14, 2, "#e8e8f0"); RK.box(g, 150, 62, 14, 10, OL);
      for (let i = 0; i < 4; i++) { const ph = (s * .7 + i / 4) % 1; g.globalAlpha = .7 * (1 - ph); P(g, 154 + i * 2 + Math.round(Math.sin(ph * 6 + i) * 2), 60 - ph * 16, "#ffffff"); }
      g.globalAlpha = 1; } };
  }
  return { centrale, duomo, kitchen, EDGE, W, H };
})();
