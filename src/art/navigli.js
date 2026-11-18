/* Переход главы 2 → 3: вечерняя набережная Навильи (каналы Милана).
   Сверху — разноцветные дома с огоньками в окнах и гирлянды, посередине — набережная, где гуляют, внизу — канал.
   Справа — дверь студии Даны с неоновой вывеской, слева — киоск джелато. */
"use strict";
window.NavigliArt = (() => {
  const W = 320, H = 180, R = PK.R, P = PK.P, OL = RK.OL;
  const WALK_TOP = 100, RAIL = 142;
  function build() {
    const cv = PK.mk(W, H), g = cv.getContext("2d"), rnd = PK.rng(77);
    // закатное небо полоской над крышами
    PK.gradV(g, 0, 0, W, 30, ["#f2a06a", "#e88a7a", "#b06a8a"]);
    // дома: охра, терракота, розовый, жёлтый
    const cols = [["#e2a65a", "#c4884a"], ["#d07a5a", "#b06048"], ["#e8b0a0", "#c88e80"], ["#f2d07a", "#d0ae5a"], ["#c8a07a", "#a88060"], ["#e89a6a", "#c87a50"]];
    let x = 0, i = 0;
    while (x < W) {
      const w = 44 + Math.floor(rnd() * 18), top = 10 + Math.floor(rnd() * 14), [c, d] = cols[i++ % cols.length];
      R(g, x, top, w, 92 - top, c); R(g, x, top, w, 3, d); R(g, x + w - 2, top, 2, 92 - top, d);
      // окна с ставнями, часть светится
      for (let wy = top + 8; wy < 74; wy += 16) for (let wx = x + 6; wx < x + w - 10; wx += 13) {
        const lit = rnd() < .55; R(g, wx, wy, 6, 9, lit ? "#ffe08a" : "#4a3a40"); if (lit) R(g, wx + 1, wy + 1, 2, 3, "#fff4c0");
        R(g, wx - 3, wy, 2, 9, "#4a7a5a"); R(g, wx + 7, wy, 2, 9, "#4a7a5a"); RK.box(g, wx - 1, wy - 1, 8, 11, d);
      }
      x += w;
    }
    // первые этажи: тенты кафе
    R(g, 0, 78, W, 14, "#5a3a32");
    [[14, "#c8323c"], [72, "#2a6a9a"], [130, "#c8323c"], [188, "#3a8a4a"]].forEach(([ax, col]) => {
      for (let k = 0; k < 40; k += 8) { R(g, ax + k, 76, 4, 6, col); R(g, ax + k + 4, 76, 4, 6, "#f4f0e8"); }
      R(g, ax, 82, 40, 1, OL); R(g, ax + 6, 84, 28, 8, "#ffe08a"); R(g, ax + 6, 84, 28, 1, "#c8a04a"); });
    // студия Даны справа: тёмная дверь, неон
    R(g, 252, 30, 68, 62, "#4a3a50"); R(g, 252, 30, 68, 3, "#3a2a40");
    for (let wy = 38; wy < 70; wy += 14) for (let wx = 258; wx < 314; wx += 14) { R(g, wx, wy, 8, 9, "#ff9ad0"); R(g, wx + 1, wy + 1, 3, 3, "#ffd0ea"); RK.box(g, wx - 1, wy - 1, 10, 11, "#2a1e30"); }
    R(g, 276, 74, 20, 18, "#2a1e2e"); R(g, 277, 75, 8, 17, "#3a2a40"); R(g, 287, 75, 8, 17, "#3a2a40"); P(g, 284, 84, "#f2c23a"); P(g, 288, 84, "#f2c23a");
    RK.box(g, 275, 73, 22, 19, OL);
    // набережная: брусчатка
    R(g, 0, 92, W, RAIL - 92, "#b8a890"); R(g, 0, 92, W, 2, "#8a7a68");
    for (let yy = 96; yy < RAIL; yy += 5) for (let xx = (yy % 10 ? 0 : 4); xx < W; xx += 9) R(g, xx, yy, 7, 1, "#a89880");
    for (let k = 0; k < 120; k++) P(g, Math.floor(rnd() * W), 94 + Math.floor(rnd() * (RAIL - 96)), "#c8b8a0");
    // киоск джелато слева
    R(g, 92, 94, 30, 14, "#f4e8d8"); R(g, 92, 90, 30, 5, "#7ac8b0"); for (let k = 0; k < 30; k += 6) R(g, 92 + k, 90, 3, 5, "#f4f0e8");
    [["#f2e0a0", 96], ["#9ad08a", 103], ["#f2a0b8", 110], ["#8a5a3a", 116]].forEach(([c, gx]) => PK.ell(g, gx + 2, 98, 2, 2, c));
    RK.box(g, 92, 90, 30, 18, OL); StationArt.text(g, "GELATO", 95, 101, "#c8323c");
    // перила и канал
    R(g, 0, RAIL, W, 4, "#6a6a72"); for (let xx = 2; xx < W; xx += 10) R(g, xx, RAIL - 6, 2, 6, "#4a4a54"); R(g, 0, RAIL - 7, W, 2, "#5a5a64");
    R(g, 0, RAIL + 4, W, H - RAIL - 4, "#2a4a6a");
    return cv;
  }
  // гирлянда над набережной + блики на воде (анимация)
  function make() {
    const base = build();
    const lights = []; for (let x = 4; x < W; x += 9) lights.push([x, 34 + Math.round(Math.sin(x / 26) * 5 + 5)]);
    return (g, t) => {
      const s = t / 1000; g.drawImage(base, 0, 0);
      // провод и лампочки
      for (let k = 0; k < lights.length - 1; k++) PK.line(g, lights[k][0], lights[k][1], lights[k + 1][0], lights[k + 1][1], "#3a2a2a");
      lights.forEach(([x, y], k) => { const on = (Math.floor(s * 2) + k) % 5 !== 0; R(g, x, y + 1, 2, 2, on ? ["#ffe08a", "#ff9ad0", "#9ae0ff"][k % 3] : "#6a5a50"); });
      // неон студии мигает
      const neon = Math.floor(s * 3) % 7 ? "#ff5aa0" : "#a03a6a";
      R(g, 258, 24, 56, 9, "#1e1424"); RK.box(g, 258, 24, 56, 9, neon); StationArt.text(g, "DANA DANCE", 263, 26, neon);
      // вода: отражения огней и рябь
      for (let k = 0; k < 26; k++) { const x = (k * 37 + Math.floor(s * 8)) % W, y = 150 + (k * 11) % 26; R(g, x, y, 4 + (k % 3) * 2, 1, k % 4 ? "#4a6a8a" : "#ffe08a"); }
      for (let k = 0; k < 6; k++) { const x = (k * 56 + 20) % W; R(g, x, 152 + Math.round(Math.sin(s * 2 + k) * 2), 2, 6, "#e8c060"); }
    };
  }
  return { make, WALK_TOP, RAIL };
})();
