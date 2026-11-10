/* Крупные планы в квартире: ёлка с игрушками, телевизор с каналами, двор за окном, полка с фото.
   Каждый — картинка 320×180 с анимацией: draw(g, t, state). */
"use strict";
window.Closeups = (() => {
  const W = 320, H = 180, R = PK.R, P = PK.P, OL = RK.OL;
  const FONT = StationArt.text;
  // ---------- ёлка ----------
  function treeBg() {
    const cv = PK.mk(W, H), g = cv.getContext("2d"), rnd = PK.rng(61);
    R(g, 0, 0, W, H, "#0f2a1a");
    // хвоя: много коротких штрихов разных оттенков
    const cols = ["#16381f", "#1e4a2a", "#2a5e34", "#3a7444", "#4f8a52"];
    for (let i = 0; i < 2600; i++) { const x = rnd() * W, y = rnd() * H, l = 3 + rnd() * 6, c = cols[Math.floor(rnd() * rnd() * 5)], d = rnd() < .5 ? 1 : -1;
      for (let k = 0; k < l; k++) P(g, x + k * d, y + k * .5, c); }
    // мишура: золотая и серебряная волной
    [[22, "#f2c23a", "#fff0a0"], [112, "#c8d0dc", "#ffffff"]].forEach(([y0, c, l]) => { for (let x = 0; x < W; x++) { const y = y0 + Math.round(Math.sin(x / 40) * 14 + x * .08); for (let k = -2; k <= 2; k++) P(g, x, y + k, (x + k * 3) % 5 === 0 ? l : (x * 7 + k) % 3 ? c : PK.mix(c, "#000", .25)); } });
    return cv;
  }
  function ball(g, x, y, r, col, label) {
    R(g, x - 2, y - r - 5, 4, 4, "#c8c0b0"); R(g, x - 2, y - r - 5, 4, 1, "#f0e8d8"); PK.line(g, x, y - r - 14, x, y - r - 5, "#d8d0c0");
    PK.ell(g, x, y, r + 1, r + 1, OL); PK.ell(g, x, y, r, r, PK.mix(col, "#1a0a1a", .3)); PK.ell(g, x - 1, y - 1, r - 2, r - 2, col);
    PK.ell(g, x - r * .35, y - r * .35, r * .3, r * .3, PK.mix(col, "#ffffff", .5)); P(g, x - r * .4, y - r * .45, "#ffffff");
    if (label) label(g, x, y, r);
  }
  const TREE_SPOTS = [
    { x: 58, y: 66, name: "ball_red" }, { x: 160, y: 56, name: "zk" }, { x: 262, y: 70, name: "rzd" },
    { x: 96, y: 136, name: "cosmo" }, { x: 214, y: 140, name: "tangerine" }, { x: 290, y: 150, name: "icicle" }
  ];
  function treeDraw(bg) {
    return (g, t) => {
      const s = t / 1000; g.drawImage(bg, 0, 0);
      const sw = k => Math.round(Math.sin(s * 1.3 + k) * 1.5);
      // красный шар с отражением гирлянды
      ball(g, 52 + sw(0), 52, 18, "#d8202c", (g, x, y) => { for (let k = 0; k < 5; k++) P(g, x - 8 + k * 4, y + 6 + Math.round(Math.sin(k) * 2), ["#f2d23a", "#4ab0ff", "#6ae06a", "#ff4a5a", "#ffffff"][(k + Math.floor(s * 2)) % 5]); });
      // шарик, который Женя с братом расписали в детстве: «Ж+К»
      ball(g, 160 + sw(1), 50, 21, "#3a6ac8", (g, x, y) => { FONT(g, "Ж", x - 13, y - 5, "#ffffff", 2); R(g, x - 1, y, 5, 1, "#f2d23a"); R(g, x + 1, y - 2, 1, 5, "#f2d23a"); FONT(g, "К", x + 6, y - 5, "#ffffff", 2);
        for (let k = 0; k < 6; k++) P(g, x - 12 + k * 5, y + 10, "#f2d23a"); });
      // игрушечный поезд РЖД
      const tx = 266 + sw(2), ty = 56; PK.line(g, tx, ty - 26, tx, ty - 10, "#d8d0c0");
      R(g, tx - 18, ty - 10, 36, 16, "#d4d8dc"); R(g, tx - 18, ty - 1, 36, 3, "#d8202c"); for (let k = 0; k < 4; k++) { R(g, tx - 15 + k * 8, ty - 7, 5, 5, "#f2c87a"); } RK.box(g, tx - 18, ty - 10, 36, 16, OL);
      [tx - 12, tx + 10].forEach(x => { PK.ell(g, x, ty + 7, 3, 3, OL); P(g, x, ty + 7, "#8a8a92"); }); FONT(g, "РЖД", tx - 6, ty - 18, "#f4f0e8");
      // космонавт — старая советская игрушка
      const cx = 100 + sw(3), cy = 96; PK.line(g, cx, cy - 30, cx, cy - 16, "#d8d0c0");
      PK.ell(g, cx, cy - 8, 8, 8, "#e8e8f0"); PK.ell(g, cx, cy - 8, 5, 5, "#3a5ab0"); P(g, cx - 2, cy - 10, "#ffffff"); R(g, cx - 6, cy, 12, 14, "#e8e8f0"); R(g, cx - 6, cy + 4, 12, 2, "#d8202c");
      R(g, cx - 10, cy + 1, 4, 9, "#e8e8f0"); R(g, cx + 6, cy + 1, 4, 9, "#e8e8f0"); FONT(g, "О", cx - 2, cy + 7, "#d8202c"); RK.box(g, cx - 6, cy, 12, 14, OL);
      // мандарин на ниточке
      const mx = 218 + sw(4), my = 104; PK.line(g, mx, my - 30, mx, my - 12, "#d8d0c0"); PK.ell(g, mx, my, 12, 11, OL); PK.ell(g, mx, my, 11, 10, "#f08a1e"); PK.ell(g, mx - 3, my - 3, 5, 4, "#ffb04a");
      for (let k = 0; k < 10; k++) P(g, mx - 8 + (k * 7) % 16, my - 6 + (k * 5) % 12, "#d8701a"); R(g, mx - 1, my - 12, 3, 3, "#3a7a2a"); PK.ell(g, mx + 5, my - 12, 4, 2, "#5a9a3a");
      // сосулька, переливается
      const ix = 300 + sw(5), iy = 100; PK.poly(g, [[ix - 5, iy - 16], [ix + 5, iy - 16], [ix, iy + 20]], "#c8e8f8"); PK.poly(g, [[ix - 5, iy - 16], [ix, iy - 16], [ix, iy + 20]], "#ffffff");
      g.globalAlpha = .5 + .5 * Math.sin(s * 3); P(g, ix - 1, iy - 6, "#ffffff"); P(g, ix - 2, iy - 7, "#ffffff"); P(g, ix, iy - 7, "#ffffff"); g.globalAlpha = 1;
      // гирлянда-лампочки
      for (let i = 0; i < 22; i++) { const x = i * 15 + 6, y = 74 + Math.round(Math.sin(i * .8) * 6); PK.line(g, x, y, x + 15, 74 + Math.round(Math.sin((i + 1) * .8) * 6), "#1a2a1a");
        const on = (i + Math.floor(s * 3)) % 3 !== 0, c = ["#ff4a5a", "#f2d23a", "#4ab0ff", "#6ae06a"][i % 4];
        if (on) { g.globalAlpha = .25; PK.ell(g, x, y + 3, 5, 5, c); g.globalAlpha = 1; } R(g, x - 1, y + 1, 3, 4, on ? c : PK.mix(c, "#000", .55)); P(g, x - 1, y + 1, on ? "#ffffff" : c); }
      // звезда сверху светится
      const st = Math.sin(s * 2) > 0; PK.poly(g, [[160, 2], [164, 10], [172, 10], [166, 15], [168, 23], [160, 18], [152, 23], [154, 15], [148, 10], [156, 10]], st ? "#ffe040" : "#f2c23a");
    };
  }
  // ---------- телевизор: три канала ----------
  function tvDraw() {
    const rnd = PK.rng(8), conf = Array.from({ length: 50 }, () => [rnd() * 200, rnd() * 120, rnd()]);
    return (g, t, st) => {
      const s = t / 1000, ch = st.ch || 0, X = 70, Y = 14, SW = 180, SH = 100;
      R(g, 0, 0, W, H, "#5a3a24"); for (let y = 0; y < H; y += 6) R(g, 0, y, W, 1, "#4a2e1c");
      R(g, X - 10, Y - 10, SW + 20, SH + 20, "#1e1e24"); RK.box(g, X - 10, Y - 10, SW + 20, SH + 20, OL); R(g, X - 9, Y - 9, SW + 18, 1, "#4a4a54");
      R(g, X + SW / 2 - 14, Y + SH + 10, 28, 8, "#2a2a30"); R(g, X + SW / 2 - 30, Y + SH + 18, 60, 4, "#2a2a30");
      const scr = PK.mk(SW, SH), c = scr.getContext("2d");
      if (ch === 0) {               // футбол
        R(c, 0, 0, SW, SH, "#3a8a3a"); for (let x = 0; x < SW; x += 20) R(c, x, 0, 10, SH, "#44964a");
        R(c, SW / 2, 0, 1, SH, "#e8f4e8"); PK.ell(c, SW / 2, SH / 2, 18, 18, "#e8f4e8"); PK.ell(c, SW / 2, SH / 2, 17, 17, "#3a8a3a"); RK.box(c, 4, 30, 30, 64, "#e8f4e8"); RK.box(c, SW - 34, 30, 30, 64, "#e8f4e8");
        R(c, SW - 6, 48, 4, 28, "#ffffff");
        const goal = (s % 9) > 6.5, bx = goal ? SW - 8 : SW / 2 + Math.sin(s * 1.3) * 70, by = SH / 2 + Math.cos(s * 1.7) * 30;
        for (let i = 0; i < 10; i++) { const red = i < 5, px = (red ? SW / 2 + 20 : SW / 2 - 20) + Math.sin(s * (1 + i * .2) + i) * 60 + (bx - SW / 2) * .4, py = 14 + (i % 5) * 22 + Math.cos(s * 1.1 + i) * 6;
          R(c, px, py, 4, 6, red ? "#e8202c" : "#f4f4f4"); if (red) R(c, px, py + 2, 4, 1, "#ffffff"); R(c, px, py + 6, 4, 2, "#222222"); P(c, px + 1, py - 1, "#e8b48e"); P(c, px + 2, py - 1, "#e8b48e"); }
        PK.ell(c, bx, by, 2, 2, "#ffffff"); P(c, bx, by, "#222");
        R(c, 4, 4, 92, 10, "#1e1e24"); R(c, 6, 6, 6, 6, "#e8202c"); FONT(c, "1", 52, 6, "#ffffff"); FONT(c, "0", 64, 6, "#ffffff"); R(c, 59, 8, 2, 1, "#ffffff"); R(c, 84, 6, 6, 6, "#3a5ab0");
        if (goal && Math.floor(s * 6) % 2) { R(c, SW / 2 - 40, SH / 2 - 14, 80, 28, "#f2d23a"); RK.box(c, SW / 2 - 40, SH / 2 - 14, 80, 28, OL); FONT(c, "ГОЛ!", SW / 2 - 15, SH / 2 - 5, "#d8202c", 2); }
      } else if (ch === 1) {        // новогодний концерт
        PK.gradV(c, 0, 0, SW, SH, ["#2a0a4a", "#5a1a7a", "#8a2a8a"]);
        for (let i = 0; i < 6; i++) { const x = 20 + i * 36, a = Math.sin(s * 2 + i) * .5; c.globalAlpha = .18; PK.poly(c, [[x, 0], [x + 8, 0], [x + 30 + a * 40, SH], [x - 22 + a * 40, SH]], ["#ffd84a", "#4ae0ff", "#ff6ab8"][i % 3]); c.globalAlpha = 1; }
        PK.ell(c, SW / 2, 14, 10, 10, "#c8d0dc"); for (let k = 0; k < 12; k++) P(c, SW / 2 - 8 + (k * 7) % 16, 6 + (k * 5) % 16, (k + Math.floor(s * 6)) % 3 ? "#ffffff" : "#8a92a0");
        R(c, 0, SH - 24, SW, 24, "#3a1a3a"); for (let x = 0; x < SW; x += 8) R(c, x, SH - 24, 4, 2, "#f2c23a");
        [[70, "#e84a8a"], [110, "#f2c23a"], [150, "#4ab0ff"]].forEach(([x, col], i) => { const j = Math.abs(Math.sin(s * 4 + i)) * 4;
          R(c, x - 4, SH - 52 - j, 8, 20, col); PK.ell(c, x, SH - 58 - j, 4, 5, "#f4cca8"); R(c, x - 4, SH - 64 - j, 8, 4, ["#3a2626", "#e4c890", "#2a1a18"][i]); R(c, x - 3, SH - 32 - j, 2, 8, "#2a2a30"); R(c, x + 1, SH - 32 - j, 2, 8, "#2a2a30"); });
        conf.forEach(([x, y, k]) => { const yy = (y + s * 30 * (k + .5)) % SH; P(c, x + Math.sin(s * 2 + k * 9) * 3, yy, ["#ffd84a", "#4ae0ff", "#ff6ab8", "#ffffff"][Math.floor(k * 4)]); });
        R(c, 4, 4, 120, 10, "rgba(0,0,0,.4)"); FONT(c, "С НОВЫМ ГОДОМ!", 8, 6, "#ffd84a");
      } else {                      // прогноз погоды: Ковров и Милан
        PK.gradV(c, 0, 0, SW, SH, ["#1e4a8a", "#3a7ac8"]);
        R(c, 10, 18, 95, 90, "#e8eef6"); R(c, 115, 18, 95, 90, "#fff4d0"); RK.box(c, 10, 18, 95, 90, OL); RK.box(c, 115, 18, 95, 90, OL);
        FONT(c, "КОВРОВ", 30, 24, "#1e4a8a"); FONT(c, "-20", 40, 86, "#1e4a8a", 2);
        for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + s * .5; PK.line(c, 57, 58, 57 + Math.cos(a) * 14, 58 + Math.sin(a) * 14, "#6aa8e8"); } PK.ell(c, 57, 58, 3, 3, "#ffffff");
        FONT(c, "МИЛАН", 140, 24, "#c8402a");
        PK.ell(c, 162, 58, 12 + Math.sin(s * 3), 12 + Math.sin(s * 3), "#ffd84a"); PK.ell(c, 162, 58, 9, 9, "#fff0a0"); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + s; P(c, 162 + Math.cos(a) * 17, 58 + Math.sin(a) * 17, "#f2a020"); }
        FONT(c, "+20", 145, 86, "#c8402a", 2);
        FONT(c, "ПОГОДА", 92, 6, "#ffffff");
      }
      // помехи и блик экрана
      for (let y = 0; y < SH; y += 2) { c.globalAlpha = .07; R(c, 0, y, SW, 1, "#000"); } c.globalAlpha = 1;
      g.drawImage(scr, X, Y);
      R(g, X + 4, Y + 4, 30, 2, "rgba(255,255,255,.25)");
      // кнопки и подпись канала
      R(g, X + SW - 4, Y + SH + 3, 3, 3, "#e8202c");
      const names = ["КАНАЛ 1", "КАНАЛ 2", "КАНАЛ 3"]; void names;
      for (let k = 0; k < 3; k++) R(g, X + 6 + k * 8, Y + SH + 3, 5, 3, k === ch ? "#6ae06a" : "#3a3a44");
    };
  }
  // ---------- двор за окном ----------
  function yardBg() {
    const cv = PK.mk(W, H), g = cv.getContext("2d"), rnd = PK.rng(17);
    PK.gradV(g, 0, 0, W, 90, ["#0e1430", "#1c2850", "#2e4274"]);
    for (let i = 0; i < 40; i++) P(g, rnd() * W, rnd() * 50, "#ffffff");
    // панельки
    [[0, 30, 90], [96, 14, 110], [214, 36, 106]].forEach(([x, y, w]) => { R(g, x, y - 8, w, 84 - y, "#3a4058"); R(g, x, y - 8, w, 2, "#e8f0f8");
      for (let wy = y - 2; wy < 72; wy += 9) for (let wx = x + 5; wx < x + w - 6; wx += 9) { const lit = rnd() < .55; R(g, wx, wy, 5, 5, lit ? (rnd() < .5 ? "#ffd88a" : "#f2b860") : "#1e2236"); if (lit && rnd() < .3) { P(g, wx + 1, wy + 1, "#ff4a5a"); P(g, wx + 3, wy + 2, "#6ae06a"); } } });
    // снежная горка и двор (сдвинуты вверх, чтобы не прятаться под диалогом)
    g.save(); g.translate(0, -30);
    R(g, 0, 104, W, 76, "#e4ecf6"); PK.poly(g, [[150, 104], [240, 104], [300, 150], [120, 150]], "#f2f6fa");
    for (let y = 104; y < H; y++) for (let x = 0; x < W; x++) if (PK.bayer(x, y) > .85 && (x + y) % 7 === 0) P(g, x, y, "#c8d4e4");
    // машина в сугробе
    R(g, 20, 132, 46, 14, "#8a2a2a"); R(g, 28, 124, 28, 9, "#8a2a2a"); R(g, 30, 126, 10, 6, "#2a3a5a"); R(g, 44, 126, 10, 6, "#2a3a5a"); PK.ell(g, 43, 124, 22, 5, "#f4f6fa"); PK.ell(g, 43, 132, 26, 3, "#f4f6fa"); PK.ell(g, 30, 146, 5, 4, "#1a1a1e"); PK.ell(g, 58, 146, 5, 4, "#1a1a1e"); RK.box(g, 20, 132, 46, 14, OL);
    // снеговик
    PK.ell(g, 96, 150, 12, 10, "#ffffff"); PK.ell(g, 96, 134, 9, 8, "#ffffff"); PK.ell(g, 96, 121, 7, 6, "#ffffff"); P(g, 94, 120, OL); P(g, 98, 120, OL); R(g, 96, 122, 4, 1, "#f08a1e");
    R(g, 90, 112, 12, 3, "#c8402a"); R(g, 92, 108, 8, 4, "#c8402a"); for (let k = 0; k < 3; k++) P(g, 96, 130 + k * 4, OL); PK.line(g, 87, 132, 78, 126, "#5a3a24"); PK.line(g, 105, 132, 113, 125, "#5a3a24");
    // фонарь
    R(g, 276, 96, 2, 54, "#2a2a30"); R(g, 270, 94, 12, 3, "#2a2a30"); g.globalAlpha = .2; PK.ell(g, 277, 150, 26, 8, "#ffd88a"); g.globalAlpha = 1; R(g, 272, 97, 8, 2, "#fff0b0"); R(g, 0, 180, W, 40, "#e4ecf6"); g.restore();
    // рама окна поверх (мы смотрим изнутри)
    RK.box(g, 0, 0, W, H, "#f4f0e8"); R(g, 0, 0, W, 6, "#f4f0e8"); R(g, 0, H - 8, W, 8, "#f4f0e8"); R(g, 0, 0, 6, H, "#f4f0e8"); R(g, W - 6, 0, 6, H, "#f4f0e8"); R(g, W / 2 - 3, 0, 6, H, "#f4f0e8"); R(g, 0, 60, W, 5, "#f4f0e8");
    RK.box(g, 6, 6, W / 2 - 9, 54, "#c8c0b0"); RK.box(g, W / 2 + 3, 6, W / 2 - 9, 54, "#c8c0b0"); RK.box(g, 6, 65, W / 2 - 9, H - 73, "#c8c0b0"); RK.box(g, W / 2 + 3, 65, W / 2 - 9, H - 73, "#c8c0b0");
    for (let k = 0; k < 60; k++) { const a = rnd() * 6, r = rnd() * 16; P(g, 7 + Math.abs(Math.cos(a) * r), 66 + Math.abs(Math.sin(a) * r), "#d8e8f8"); P(g, W - 7 - Math.abs(Math.cos(a) * r), H - 9 - Math.abs(Math.sin(a) * r), "#d8e8f8"); }
    return cv;
  }
  function yardDraw(bg) {
    const rnd = PK.rng(3), fl = Array.from({ length: 90 }, () => [rnd() * W, rnd() * H, .5 + rnd()]);
    return (g, t) => {
      const s = t / 1000; g.drawImage(bg, 0, 0); g.save(); g.translate(0, -30);
      // дети катаются с горки на санках по очереди
      for (let i = 0; i < 2; i++) { const ph = ((s * .35 + i * .5) % 1), x = 236 - ph * 110, y = 104 + ph * 44;
        R(g, x - 6, y + 2, 14, 2, "#c8402a"); R(g, x - 3, y - 6, 6, 8, i ? "#3a6ac8" : "#e8a020"); PK.ell(g, x, y - 9, 3, 3, "#f4cca8"); R(g, x - 3, y - 13, 6, 3, i ? "#d8202c" : "#3a8a4a"); }
      // собака бегает вокруг снеговика
      const dx = 96 + Math.cos(s * 1.5) * 26, dy = 160 + Math.sin(s * 1.5) * 6, f = Math.floor(s * 8) % 2;
      R(g, dx - 5, dy - 4, 10, 5, "#8a5a32"); R(g, dx + (Math.cos(s * 1.5 + 1.6) > 0 ? 4 : -7), dy - 7, 4, 4, "#8a5a32"); R(g, dx - 4, dy + 1, 2, 2 + f, "#6a4024"); R(g, dx + 2, dy + 1, 2, 3 - f, "#6a4024");
      g.restore(); fl.forEach(([x, y, k]) => P(g, (x + Math.sin(s + y) * 3) % W, (y + s * 14 * k) % H, "#ffffff"));
    };
  }
  // ---------- полка с фотографиями ----------
  function photosBg() {
    const cv = PK.mk(W, H), g = cv.getContext("2d");
    R(g, 0, 0, W, H, "#5a2e1a"); for (let x = 0; x < W; x += 3) R(g, x, 0, 1, H, "#52291a");
    R(g, 0, 128, W, 10, "#7a4428"); R(g, 0, 128, W, 2, "#9a5a34"); R(g, 0, 138, W, 42, "#3a1c10");
    // хрусталь по краям
    [[8, 92], [290, 96]].forEach(([x, y]) => { for (let k = 0; k < 2; k++) { const gx = x + k * 12; R(g, gx, y, 9, 36, "#c8dce4"); R(g, gx + 1, y + 2, 2, 30, "#ffffff"); R(g, gx + 2, y + 34, 5, 2, "#a8c4d0"); RK.box(g, gx, y, 9, 36, "#8aa8b8"); } });
    return cv;
  }
  function frame(g, x, y, w, h, col) { R(g, x - 4, y - 4, w + 8, h + 8, col); RK.box(g, x - 4, y - 4, w + 8, h + 8, OL); R(g, x - 3, y - 3, w + 6, 1, PK.mix(col, "#fff", .4)); RK.box(g, x - 1, y - 1, w + 2, h + 2, OL); }
  function photosDraw(bg) {
    return (g, t) => {
      const s = t / 1000; g.drawImage(bg, 0, 0);
      // 1) день рождения папы в глэмпинге: костёр, папа бьёт палкой по тарелке
      const a = { x: 40, y: 34, w: 74, h: 84 }; frame(g, a.x, a.y, a.w, a.h, "#c89a52");
      PK.gradV(g, a.x, a.y, a.w, a.h, ["#141a36", "#2a2050", "#4a2a4a"]); for (let k = 0; k < 10; k++) P(g, a.x + (k * 23) % a.w, a.y + (k * 11) % 30, "#ffffff");
      PK.poly(g, [[a.x + 6, a.y + 60], [a.x + 22, a.y + 30], [a.x + 38, a.y + 60]], "#e8dcc0"); PK.poly(g, [[a.x + 22, a.y + 30], [a.x + 38, a.y + 60], [a.x + 22, a.y + 60]], "#c8b898");   // палатка
      R(g, a.x, a.y + 60, a.w, 24, "#2a3a2a");
      PK.ell(g, a.x + 50, a.y + 70, 10, 3, "#8a8a92"); const fl = Math.floor(s * 8) % 3; PK.poly(g, [[a.x + 44, a.y + 70], [a.x + 50, a.y + 56 - fl], [a.x + 56, a.y + 70]], "#f08a1e"); PK.poly(g, [[a.x + 47, a.y + 70], [a.x + 50, a.y + 62 - fl], [a.x + 53, a.y + 70]], "#ffe040");
      R(g, a.x + 62, a.y + 54, 6, 12, "#d8202c"); PK.ell(g, a.x + 65, a.y + 51, 3, 3, "#e8b48e"); R(g, a.x + 62, a.y + 66, 2, 6, "#26262e"); R(g, a.x + 66, a.y + 66, 2, 6, "#26262e");
      PK.line(g, a.x + 62, a.y + 56, a.x + 56, a.y + (Math.floor(s * 4) % 2 ? 62 : 66), "#8a5a32");          // палка стучит
      R(g, a.x + 4, a.y + 64, 6, 10, "#b79ae8"); PK.ell(g, a.x + 7, a.y + 61, 3, 3, "#f4cca8"); R(g, a.x + 14, a.y + 66, 5, 8, "#f2e8d2"); PK.ell(g, a.x + 16, a.y + 63, 3, 3, "#d39a52"); R(g, a.x + 22, a.y + 66, 5, 8, "#5a2a3a"); PK.ell(g, a.x + 24, a.y + 63, 3, 3, "#3a2a24");
      if (Math.floor(s * 2) % 2) { FONT(g, "О", a.x + 66, a.y + 40, "#f2d23a"); }
      // 2) детство: десерт из яблок и огромный половник
      const b = { x: 132, y: 26, w: 60, h: 70 }; frame(g, b.x, b.y, b.w, b.h, "#e8e0d0");
      R(g, b.x, b.y, b.w, b.h, "#f4e4c4"); R(g, b.x, b.y + 46, b.w, 24, "#c8a070");
      PK.ell(g, b.x + 20, b.y + 50, 10, 4, "#ffffff"); PK.ell(g, b.x + 20, b.y + 48, 7, 3, "#e8b040"); P(g, b.x + 18, b.y + 47, "#c8302a");
      PK.line(g, b.x + 34, b.y + 56, b.x + 44, b.y + 18, "#a8b0b8"); PK.ell(g, b.x + 46, b.y + 14, 9, 7, "#a8b0b8"); PK.ell(g, b.x + 46, b.y + 13, 6, 4, "#d8dee2");   // половник!
      R(g, b.x + 6, b.y + 26, 8, 14, "#f2e8d2"); PK.ell(g, b.x + 10, b.y + 22, 4, 4, "#f6caa4"); R(g, b.x + 6, b.y + 18, 8, 4, "#d39a52"); P(g, b.x + 9, b.y + 22, OL); P(g, b.x + 11, b.y + 22, OL);
      R(g, b.x + 48, b.y + 34, 7, 12, "#3a5a8a"); PK.ell(g, b.x + 51, b.y + 31, 3, 3, "#f0c8a8"); R(g, b.x + 48, b.y + 27, 7, 2, "#3a2a24");
      // 3) медаль за кросс по Коврову
      const m = { x: 222, y: 44 }; PK.line(g, m.x + 14, m.y - 18, m.x + 6, m.y, "#3a5ab0"); PK.line(g, m.x + 16, m.y - 18, m.x + 24, m.y, "#d8202c");
      R(g, m.x + 10, m.y - 20, 10, 3, "#3a3a48");
      PK.ell(g, m.x + 15, m.y + 14, 15, 15, OL); PK.ell(g, m.x + 15, m.y + 14, 14, 14, "#d8a020"); PK.ell(g, m.x + 15, m.y + 14, 10, 10, "#f2c23a"); FONT(g, "8", m.x + 9, m.y + 9, "#8a5a10", 2);
      R(g, m.x + 21, m.y + 13, 6, 1, "#8a5a10"); P(g, m.x + 7, m.y + 6, "#fff0a0");
      // 4) семейная фотография в центре полки
      const c = { x: 140, y: 104, w: 44, h: 20 }; frame(g, c.x, c.y, c.w, c.h, "#8a5a32"); R(g, c.x, c.y, c.w, c.h, "#9ac8e0");
      [[6, "#d39a52", "#f2e8d2"], [15, "#e4c890", "#a88ac8"], [25, "#4a3a32", "#d8202c"], [35, "#3a2a24", "#3a5a8a"]].forEach(([dx, hair, top]) => { R(g, c.x + dx - 2, c.y + 12, 5, 8, top); PK.ell(g, c.x + dx, c.y + 9, 2, 2, "#f4cca8"); R(g, c.x + dx - 2, c.y + 6, 5, 2, hair); });
      // блик на стекле фото
      g.globalAlpha = .25; PK.line(g, a.x + 4 + ((s * 20) % 80), a.y, a.x + ((s * 20) % 80) - 10, a.y + 30, "#ffffff"); g.globalAlpha = 1;
    };
  }
  function create() {
    return { tree: treeDraw(treeBg()), tv: tvDraw(), yard: yardDraw(yardBg()), photos: photosDraw(photosBg()) };
  }
  return { create, TREE_SPOTS };
})();
