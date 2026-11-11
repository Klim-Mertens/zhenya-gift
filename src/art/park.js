/* Глава 2: парк Семпионе (вид сбоку для раннера) и футбольное поле (вид сверху). */
"use strict";
window.ParkArt = (() => {
  const W = 320, H = 180, R = PK.R, P = PK.P, OL = RK.OL, GROUND = 124;
  const wrap = (v, m) => ((v % m) + m) % m;
  // Замок Сфорцеско: кирпичные стены с зубцами, круглые башни и высокая башня Филарете с часами
  function castle() {
    const cv = PK.mk(300, 96), g = cv.getContext("2d"); g.translate(0, 26); const brick = "#b8603e", dark = "#8a4430", lite = "#d27a52";
    R(g, 20, 34, 260, 36, brick); for (let x = 20; x < 280; x += 6) R(g, x, 30, 4, 4, brick);
    for (let y = 38; y < 70; y += 4) for (let x = 22 + (y % 8 ? 0 : 3); x < 278; x += 6) R(g, x, y, 4, 1, dark);
    [[24, 18], [276, 18]].forEach(([cx, w]) => { R(g, cx - w / 2, 22, w, 48, brick); R(g, cx - w / 2, 22, 3, 48, lite); for (let x = cx - w / 2; x < cx + w / 2; x += 4) R(g, x, 18, 3, 4, brick); });
    R(g, 135, 6, 30, 64, brick); R(g, 135, 6, 3, 64, lite); for (let x = 135; x < 165; x += 5) R(g, x, 2, 3, 4, brick);
    R(g, 142, -10, 16, 16, "#c86a48"); PK.poly(g, [[140, -10], [150, -24], [160, -10]], "#8a4430");
    PK.ell(g, 150, 18, 5, 5, "#f4e8d0"); P(g, 150, 15, OL); P(g, 150, 16, OL); P(g, 151, 18, OL); P(g, 152, 18, OL);
    R(g, 144, 50, 12, 20, "#3a2420"); PK.ell(g, 150, 50, 6, 4, "#3a2420");
    for (let x = 40; x < 270; x += 22) if (Math.abs(x - 150) > 20) { R(g, x, 44, 4, 6, "#4a2a20"); }
    return cv;
  }
  function tree(g, x, y, s, c1, c2) { R(g, x - 1, y - 10 * s, 3, 10 * s, "#6a4a32"); PK.ell(g, x, y - 14 * s, 9 * s, 8 * s, c1); PK.ell(g, x - 2 * s, y - 16 * s, 5 * s, 4 * s, c2); }
  function sempione() {
    const cs = castle();
    return (g, off, t) => {
      const s = t / 1000;
      PK.gradV(g, 0, 0, W, 112, ["#58a8e2", "#9ad0f0", "#d8eef8"]);
      PK.ell(g, 260, 18, 8, 8, "#fff6c0");
      for (let i = 0; i < 4; i++) { const x = wrap(i * 100 - off * .05 - s * 2, W + 60) - 30, y = 14 + (i % 2) * 10; PK.ell(g, x, y, 13, 3, "#ffffff"); PK.ell(g, x + 6, y - 2, 7, 3, "#ffffff"); }
      // замок вдали
      const cx = wrap(80 - off * .12, 900) - 300; g.drawImage(cs, cx, 14); g.drawImage(cs, cx + 900, 14);
      // дальние деревья
      R(g, 0, 104, W, 12, "#6aa04a");
      for (let i = -1; i < 12; i++) { const x = wrap(i * 30 - off * .3, W + 40) - 20; tree(g, x, 110, 1.2, "#4f8a3a", "#6aa848"); }
      // газон и кусты
      R(g, 0, 110, W, GROUND - 110, "#7ab84a"); for (let x = 0; x < W; x += 3) P(g, wrap(x - off * .7, W), 112 + (x % 9), "#8ac85a");
      for (let i = -1; i < 7; i++) { const x = wrap(i * 58 - off * .7, W + 60) - 30; PK.ell(g, x, 118, 12, 5, "#3f7a32"); PK.ell(g, x - 3, 116, 6, 2, "#5a9a40"); }
      // дорожка из гравия
      R(g, 0, GROUND, W, H - GROUND, "#e2d2b0"); R(g, 0, GROUND, W, 2, "#c8b48c");
      for (let i = 0; i < 60; i++) P(g, wrap(i * 37 - off, W), GROUND + 4 + (i * 13) % 30, "#c8b48c");
      for (let i = 0; i < 12; i++) R(g, wrap(i * 61 - off, W), GROUND + 10 + (i * 7) % 20, 2, 1, "#b8a07a");
      // фонари вдоль дорожки
      for (let i = 0; i < 3; i++) { const x = wrap(i * 140 - off, W + 140) - 70; R(g, x, GROUND - 40, 2, 40, "#2a2a30"); R(g, x - 3, GROUND - 44, 8, 5, "#2a2a30"); R(g, x - 2, GROUND - 43, 6, 3, "#f2e8b0"); }
    };
  }
  // ---------- футбольное поле (вид сверху) ----------
  const PITCH = { x: 14, y: 30, w: 292, h: 140 }, GOAL = { y: 82, h: 36 };
  function pitch(withStands) {
    const cv = PK.mk(W, H), g = cv.getContext("2d"), rnd = PK.rng(19), p = PITCH;
    R(g, 0, 0, W, H, "#3a7a3a");
    // трибуны сверху с болельщиками
    R(g, 0, 0, W, 26, "#4a4a58"); for (let y = 2; y < 26; y += 6) R(g, 0, y, W, 1, "#3a3a48");
    if (withStands) for (let i = 0; i < 160; i++) { const x = rnd() * W, y = 3 + Math.floor(rnd() * 4) * 6; R(g, x, y, 3, 4, ["#d8202c", "#3a6ac8", "#f4f0e8", "#f2d23a", "#3a8a4a"][Math.floor(rnd() * 5)]); P(g, x + 1, y - 1, "#e8b48e"); }
    R(g, 0, 26, W, 2, "#f4f0e8");
    // полосы газона
    for (let x = p.x; x < p.x + p.w; x += 24) R(g, x, p.y, 12, p.h, "#438a42");
    const L = "#f4f8f0"; RK.box(g, p.x, p.y, p.w, p.h, L);
    R(g, p.x + p.w / 2, p.y, 1, p.h, L); PK.ell(g, p.x + p.w / 2, p.y + p.h / 2, 20, 20, L); PK.ell(g, p.x + p.w / 2, p.y + p.h / 2, 19, 19, "#3f8240"); P(g, p.x + p.w / 2, p.y + p.h / 2, L);
    RK.box(g, p.x, GOAL.y - 22, 40, GOAL.h + 44, L); RK.box(g, p.x + p.w - 40, GOAL.y - 22, 40, GOAL.h + 44, L);
    RK.box(g, p.x, GOAL.y - 6, 14, GOAL.h + 12, L); RK.box(g, p.x + p.w - 14, GOAL.y - 6, 14, GOAL.h + 12, L);
    // ворота: сетка
    [[p.x - 10, 1], [p.x + p.w, -1]].forEach(([x]) => { R(g, x, GOAL.y, 10, GOAL.h, "#2a5a2a"); for (let k = 0; k < 10; k += 2) R(g, x + k, GOAL.y, 1, GOAL.h, "#c8d4c8"); for (let k = 0; k < GOAL.h; k += 3) R(g, x, GOAL.y + k, 10, 1, "#c8d4c8"); RK.box(g, x, GOAL.y - 1, 10, GOAL.h + 2, "#ffffff"); });
    RK.speck(g, rnd, p.x, p.y, p.w, p.h, 300, "#357535", .5);
    return cv;
  }
  return { sempione, pitch, PITCH, GOAL, GROUND, W, H };
})();
