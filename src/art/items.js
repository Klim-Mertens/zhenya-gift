/* Вещи для чемодана. Каждая занимает прямоугольник клеток (w×h), клетка CELL пикселей.
   Рисунок помещается в этот прямоугольник и получает тёмно-коричневый контур. */
"use strict";
window.Items = (() => {
  const CELL = 14, OL = "#3b2420";
  const R = PK.R, P = PK.P;
  const LIST = [
    { id: "borsch", name: "Банка борща", who: "mama", w: 2, h: 2,
      say: "Мама: Борщ домашний! В Италии такого не сваришь.",
      draw: (g, W, H) => { R(g, 4, 3, W - 8, 3, "#c8b090"); R(g, 4, 3, W - 8, 1, "#e0cca8");                      // крышка
        R(g, 3, 6, W - 6, H - 8, "#b8202c"); R(g, 4, 7, 3, H - 11, "#e85a5a"); R(g, 3, 6, W - 6, 1, "#d8e8f0");
        R(g, 6, 12, W - 12, 7, "#f4ecd8"); R(g, 7, 14, W - 14, 1, "#b8202c"); R(g, 8, 16, W - 16, 1, "#6a5a4a");          // этикетка
        P(g, W - 7, 9, "#ff9a8a"); R(g, 3, H - 3, W - 6, 1, "#7a1018"); } },
    { id: "vodka", name: "Водка", who: "mama", w: 1, h: 2,
      say: "Мама: Это не тебе, это для хороших людей. Угостишь кого-нибудь.",
      draw: (g, W, H) => { R(g, 5, 1, 4, 3, "#c8202c"); R(g, 5, 4, 4, 4, "#d8eef4"); PK.poly(g, [[5, 8], [9, 8], [12, 11], [12, H - 2], [2, H - 2], [2, 11]], "#d8eef4");
        R(g, 3, 13, 8, 7, "#f4ece0"); R(g, 4, 14, 6, 1, "#c8202c"); R(g, 5, 17, 4, 1, "#3a3a4a"); R(g, 3, 10, 1, H - 13, "#ffffff"); R(g, 10, 12, 1, H - 15, "#a8c8d4"); } },
    { id: "valenki", name: "Валенки", who: "mama", w: 2, h: 2,
      say: "Мама: Валенки! А вдруг в Италии похолодает?",
      draw: (g, W, H) => { [[2, "#8a8478"], [13, "#a49e92"]].forEach(([x, c]) => {
          R(g, x, 2, 9, 16, c); PK.poly(g, [[x, 17], [x + 9, 15], [x + 13, 19], [x + 13, 24], [x, 24]], c);
          R(g, x, 2, 9, 2, PK.mix(c, "#ffffff", .3)); R(g, x + 1, 5, 1, 12, PK.mix(c, "#ffffff", .2)); R(g, x, 23, 13, 2, PK.mix(c, "#2a2020", .3));
          for (let k = 0; k < 6; k++) P(g, x + 3 + (k * 3) % 7, 6 + k * 3, PK.mix(c, "#2a2020", .2)); }); } },
    { id: "herring", name: "Селёдка", who: "mama", w: 3, h: 1,
      say: "Мама: Селёдочка, чтобы не скучала по дому.",
      draw: (g, W, H) => { R(g, 1, 2, W - 2, H - 4, "#f4ece0"); R(g, 1, H - 3, W - 2, 1, "#c8b8a0");                    // бумага
        PK.ell(g, 20, 7, 14, 4, "#8a9aa8"); PK.ell(g, 20, 6, 13, 2, "#c4d0d8"); PK.poly(g, [[33, 7], [40, 2], [40, 12]], "#6a7a8a");
        P(g, 9, 6, OL); R(g, 12, 5, 1, 4, "#5a6a7a"); P(g, 8, 8, "#c45a5a"); } },
    { id: "scarf", name: "Шарф «Спартака»", who: "papa", w: 4, h: 1,
      say: "Папа: А это главное! Без шарфа в Италию не пущу.",
      draw: (g, W, H) => { for (let x = 3; x < W - 3; x++) R(g, x, 3, 1, 8, Math.floor((x - 3) / 5) % 2 ? "#f4f0e8" : "#d8202c");
        R(g, 3, 3, W - 6, 1, "#ff6a6a"); R(g, 3, 10, W - 6, 1, "#8a1018"); for (let k = 0; k < 3; k++) { R(g, 1, 4 + k * 2, 2, 1, "#f4f0e8"); R(g, W - 3, 4 + k * 2, 2, 1, "#d8202c"); }
        R(g, 22, 5, 12, 4, "#f4f0e8"); R(g, 24, 6, 8, 2, "#d8202c"); } },
    { id: "dress", name: "Летнее платье", who: "zh", w: 2, h: 3,
      say: "Женя: Платье с лимонами. Там же лето!",
      draw: (g, W, H) => { PK.poly(g, [[9, 3], [19, 3], [21, 14], [26, 38], [2, 38], [7, 14]], "#f6eccc"); R(g, 9, 1, 2, 4, "#e8c870"); R(g, 17, 1, 2, 4, "#e8c870");
        for (let k = 0; k < 9; k++) { const x = 6 + (k * 7) % 16, y = 10 + k * 3; PK.ell(g, x, y, 2, 1, "#f2c23a"); P(g, x + 2, y - 1, "#5a9a3a"); }
        R(g, 7, 14, 14, 2, "#e8c870"); R(g, 2, 37, 24, 1, "#c8b890"); } },
    { id: "passport", name: "Паспорт и билет", who: "zh", w: 1, h: 1,
      say: "Мама: Паспорт положила? Проверь ещё раз!",
      draw: (g, W, H) => { R(g, 2, 1, 10, 12, "#6a1424"); R(g, 3, 2, 8, 10, "#8a1c30"); PK.ell(g, 7, 6, 2, 2, "#e8c060"); R(g, 4, 9, 6, 1, "#e8c060"); R(g, 9, 3, 4, 9, "#f4ece0"); R(g, 9, 4, 4, 1, "#d8202c"); } },
    { id: "sneakers", name: "Кроссовки", who: "zh", w: 2, h: 1,
      say: "Женя: Кроссовки для прогулок по Милану.",
      draw: (g, W, H) => { [[1, 0], [13, 1]].forEach(([x, d]) => { PK.poly(g, [[x, 10 - d], [x + 2, 4 - d], [x + 7, 3 - d], [x + 9, 6 - d], [x + 13, 8 - d], [x + 13, 11 - d], [x, 11 - d]], "#f6f1e8"); R(g, x, 10 - d, 13, 2, "#d8d0c4"); R(g, x + 3, 5 - d, 4, 1, "#3fa0d8"); P(g, x + 9, 8 - d, "#3fa0d8"); }); } },
    { id: "makeup", name: "Косметичка", who: "zh", w: 2, h: 1,
      say: "Женя: Косметичка. Без неё никуда.",
      draw: (g, W, H) => { PK.ell(g, 14, 8, 12, 5, "#f0a8b8"); R(g, 3, 4, 22, 2, "#f8c8d4"); R(g, 4, 5, 20, 1, "#d8a040"); P(g, 21, 3, "#f2c23a"); P(g, 22, 4, "#f2c23a"); R(g, 6, 9, 3, 1, "#ffffff"); } }
  ];
  // Решение-подсказка (столбец, строка, повёрнута ли) для сетки 7×4
  const SOLUTION = { dress: [0, 0, 0], scarf: [0, 3, 0], borsch: [2, 0, 0], valenki: [4, 0, 0], herring: [2, 2, 0], vodka: [6, 0, 0], sneakers: [5, 2, 0], makeup: [4, 3, 0], passport: [6, 3, 0] };
  function texture(item, rot) {
    const w = (rot ? item.h : item.w) * CELL, h = (rot ? item.w : item.h) * CELL;
    const base = PK.mk(item.w * CELL, item.h * CELL), g = base.getContext("2d");
    item.draw(g, base.width, base.height); PK.outline(base, OL);
    if (!rot) return base;
    const cv = PK.mk(w, h), c = cv.getContext("2d"); c.translate(w, 0); c.rotate(Math.PI / 2); c.drawImage(base, 0, 0); return cv;
  }
  return { CELL, LIST, SOLUTION, texture };
})();
