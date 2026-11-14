/* Глава 3: танцевальная студия Даны.
   Дана (фото нет, рисуем наугад): тёмные волосы в высоком хвосте, чёрный топ, фиолетовые лосины, красные каблуки.
   pose() делает из обычного спрайта 16×26 танцевальную позу: стирает руки и рисует их заново под нужным углом. */
"use strict";
window.DanceArt = (() => {
  const R = PK.R, P = PK.P, OL = "#3b2420";
  // ---------- Дана ----------
  function dana() {
    const T = People.templates();
    const PAL = Object.assign({}, T.ZH_PAL, { H: "#2a1c22", h: "#1a1016", L: "#4a3038", S: "#e8b48e", s: "#c48a66",
      W: "#1e1a24", w: "#121016", J: "#6a3a8a", j: "#4a2a6a", B: "#d8203a", G: "#f2c23a", p: "#e88a7a" });
    // топ короткий: живот открыт; серьги-кольца
    const top = T.ZH_FRONT.map((r, i) => {
      if (i === 18) return ".oSwSSSSSSSSwSo.";
      if (i === 12) return "..oHGHossoHGHo..";
      return r;
    });
    const blinkRows = top.map((r, i) => i === 8 ? "..oHSSSSSSSSHo.." : i === 9 ? "..oHSSoSSoSSHo.." : r);
    const legs = T.LEGS;
    const mk = rows => { const cv = PK.sprite(rows, PAL); const g = cv.getContext("2d");
      // высокий хвост на макушке (рисуем поверх, справа вверху)
      R(g, 7, 0, 3, 1, OL); return cv; };
    return { front: [mk(top.concat(legs.stand)), mk(top.concat(legs.a)), mk(top.concat(legs.b))], blink: mk(blinkRows.concat(legs.stand)), skin: PAL.S, skinD: PAL.s, hair: PAL.H };
  }

  // ---------- танцевальные позы ----------
  // Холст 28×36: спрайт стоит на (6, 8), сверху запас для поднятых рук и хвоста.
  const PW = 28, PH = 36, OX = 6, OY = 8;
  const POSES = {
    idle: { L: [[-1, 6]], R: [[1, 6]] },
    left: { L: [[-5, -1], [-10, -2]], R: [[3, 3], [1, 6]] },          // левая рука в сторону, правая на поясе
    right: { L: [[-3, 3], [-1, 6]], R: [[5, -1], [10, -2]] },
    up: { L: [[-3, -6], [-5, -12]], R: [[3, -6], [5, -12]] },            // руки вверх «V»
    down: { L: [[-3, 3], [-6, 6]], R: [[3, 3], [6, 6]], dip: 2 },       // присед, руки вниз в стороны
    frame: { L: [[-4, -3], [-1, -9]], R: [[4, -3], [1, -9]] },          // vogue: руки рамкой вокруг лица
    hip: { L: [[-3, 3], [-1, 6]], R: [[3, 3], [1, 6]] }                 // обе руки на поясе
  };
  function pose(src, name, skin, skinD, extra) {
    const p = POSES[name] || POSES.idle, cv = PK.mk(PW, PH), g = cv.getContext("2d"), dy = p.dip || 0;
    // тело без рук
    const body = PK.mk(16, 26), b = body.getContext("2d"); b.drawImage(src, 0, 0);
    b.clearRect(0, 14, 3, 6); b.clearRect(13, 14, 3, 6);
    R(b, 2, 14, 1, 5, OL); R(b, 13, 14, 1, 5, OL);
    if (dy) { g.drawImage(body, 0, 0, 16, 20, OX, OY + dy, 16, 20); g.drawImage(body, 0, 20, 16, 6, OX - 1, OY + 20, 18, 6); }
    else g.drawImage(body, OX, OY);
    if (extra) extra(g, OX, OY + dy);
    // руки: сначала контур (толстая линия), потом кожа
    const sh = { L: [OX + 2, OY + 14 + dy], R: [OX + 13, OY + 14 + dy] };
    const path = side => { const pts = [sh[side]]; p[side].forEach(([x, y]) => pts.push([sh[side][0] + x, sh[side][1] + y])); return pts; };
    const stamp = (pts, col, r) => { for (let k = 0; k < pts.length - 1; k++) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); R(g, x - r, y - r, 1 + 2 * r, 1 + 2 * r, col); } } };
    ["L", "R"].forEach(s => stamp(path(s), OL, 1));
    ["L", "R"].forEach(s => { const pts = path(s); stamp(pts, skin, 0); const [ex, ey] = pts[pts.length - 1]; R(g, ex - 1, ey - 1, 2, 2, skin); P(g, ex, ey, skinD); });
    return cv;
  }
  const POSE_NAMES = Object.keys(POSES);
  // ---------- стрелки ----------
  const ARROW = [".....11.....", "....1111....", "...111111...", "..11111111..", ".1111111111.", "111111111111", "111111111111",
    "....1111....", "....1111....", "....1111....", "....1111....", "....1111...."];
  const COLORS = { left: "#ff5aa0", down: "#4ab8f0", up: "#5ad86a", right: "#f2c23a" };
  const ROT = { up: 0, right: 1, down: 2, left: 3 };
  // стрелка 14×14: dir — направление, mode: "fill" (летит), "ring" (приёмник), "glow" (вспышка)
  function arrow(dir, mode) {
    const cv = PK.mk(14, 14), g = cv.getContext("2d"), col = mode === "ring" ? "#5a5068" : mode === "glow" ? "#ffffff" : COLORS[dir];
    const put = (x, y, c) => { let X = x, Y = y; for (let k = 0; k < ROT[dir]; k++) { const t = X; X = 11 - Y; Y = t; } P(g, X + 1, Y + 1, c); };
    // контур
    ARROW.forEach((row, y) => [...row].forEach((b, x) => { if (b !== "1") return;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const r2 = ARROW[y + dy]; if (!r2 || r2[x + dx] !== "1") put(x, y, mode === "ring" ? "#8a80a0" : OL); }); }));
    ARROW.forEach((row, y) => [...row].forEach((b, x) => { if (b !== "1") return; const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const r2 = ARROW[y + dy]; return !r2 || r2[x + dx] !== "1"; });
      if (!edge) put(x, y, mode === "ring" ? "#2a2236" : (y > 1 && y < 5 && x === 5 ? "#ffffff" : col)); }));
    return cv;
  }
  // ---------- зал ----------
  function studio() {
    const W = 320, H = 180, FLOOR = 112, rnd = PK.rng(33);
    const base = PK.mk(W, H), g = base.getContext("2d");
    // стена
    R(g, 0, 0, W, FLOOR, "#e6d2c0"); for (let x = 0; x < W; x += 2) if (rnd() < .2) P(g, x, Math.floor(rnd() * FLOOR), "#dcc6b2");
    R(g, 0, 0, W, 8, "#cdb6a2"); R(g, 0, 8, W, 1, "#b89c88");
    // зеркало во всю стену (левая часть, справа место для дорожек)
    PK.gradV(g, 6, 16, 172, 88, ["#c8e2ec", "#a8ccdc", "#94bccc"]);
    for (let k = 0; k < 4; k++) PK.line(g, 20 + k * 44, 102, 50 + k * 44, 18, "#e2f2f8");
    for (let k = 0; k < 4; k++) PK.line(g, 26 + k * 44, 102, 56 + k * 44, 18, "#d4eaf2");
    RK.box(g, 5, 15, 174, 90, "#8a7a6a"); R(g, 92, 16, 1, 88, "#8a9aa4");
    // станок (балетная палка)
    R(g, 4, 80, 178, 2, "#a8743e"); R(g, 4, 82, 178, 1, "#7a5228"); [14, 92, 170].forEach(x => { R(g, x, 82, 2, 6, "#6a6a72"); });
    // вывеска
    R(g, 116, 2, 60, 11, "#2a1e2e"); RK.box(g, 116, 2, 60, 11, "#f2c23a"); StationArt.text(g, "DANA DANCE", 124, 5, "#ff5aa0");
    // пол: деревянные доски с перспективой
    R(g, 0, FLOOR, W, H - FLOOR, "#b8834e");
    for (let y = FLOOR + 4, k = 0; y < H; y += 5 + k, k++) R(g, 0, y, W, 1, "#9c6a3c");
    for (let i = 0; i < 40; i++) { const y = FLOOR + 2 + Math.floor(rnd() * (H - FLOOR - 2)), x = Math.floor(rnd() * W); R(g, x, y, 1, 4, "#a8743e"); }
    R(g, 0, FLOOR, W, 2, "#8a5a32"); R(g, 0, FLOOR - 4, W, 4, "#d8c0aa");
    // лампы на потолке
    for (let x = 6; x < W; x += 50) { if (x > 100 && x < 180) continue; R(g, x, 8, 12, 2, "#5a5060"); R(g, x + 2, 10, 8, 1, "#fff4c8"); }
    return (ctx, beat) => {
      ctx.drawImage(base, 0, 0);
      // цветные пятна света на полу, мигают в такт
      const ph = beat - Math.floor(beat), pulse = Math.max(0, 1 - ph * 2.5), k = Math.floor(beat) % 4;
      const cols = ["#ff5aa0", "#4ab8f0", "#5ad86a", "#f2c23a"];
      ctx.save(); ctx.globalAlpha = .18 + .22 * pulse;
      [[40, 150], [96, 140], [150, 156]].forEach(([x, y], i) => PK.ell(ctx, x, y, 26, 7, cols[(k + i) % 4]));
      ctx.restore();
    };
  }
  return { dana, pose, POSE_NAMES, arrow, COLORS, studio };
})();
