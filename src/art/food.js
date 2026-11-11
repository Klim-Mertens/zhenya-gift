/* Продукты для кулинарного квеста у Нарины: иконки 16×16 и готовые блюда для стола. */
"use strict";
window.Food = (() => {
  const R = PK.R, P = PK.P, OL = RK.OL;
  // id, название по-русски, по-итальянски (Джан говорит только так), рисовалка
  const LIST = [
    { id: "leaves", ru: "Виноградные листья", it: "Foglie di vite", d: g => { [[2, 3], [7, 2], [4, 8]].forEach(([x, y], i) => { PK.poly(g, [[x, y + 3], [x + 3, y], [x + 6, y + 2], [x + 7, y + 6], [x + 3, y + 7]], i % 2 ? "#5a9a3a" : "#4a8a2e"); P(g, x + 3, y + 3, "#8ac05a"); }); } },
    { id: "mince", ru: "Фарш", it: "Carne macinata", d: g => { R(g, 2, 8, 12, 5, "#f4f0e8"); PK.ell(g, 8, 8, 5, 3, "#c84a4a"); for (let k = 0; k < 8; k++) P(g, 4 + (k * 3) % 8, 6 + (k % 3), "#e87a7a"); } },
    { id: "rice", ru: "Рис", it: "Riso", d: g => { R(g, 4, 3, 8, 11, "#e8dcc8"); R(g, 4, 3, 8, 2, "#c8402a"); for (let k = 0; k < 10; k++) P(g, 5 + (k * 3) % 6, 7 + (k % 4) * 2, "#ffffff"); } },
    { id: "onion", ru: "Лук", it: "Cipolla", d: g => { PK.ell(g, 8, 9, 5, 5, "#e8b878"); PK.ell(g, 7, 8, 2, 3, "#f4d8a8"); R(g, 7, 2, 2, 3, "#6a9a3a"); R(g, 6, 13, 4, 1, "#a8783a"); } },
    { id: "herbs", ru: "Зелень", it: "Erbe", d: g => { for (let k = 0; k < 5; k++) { R(g, 4 + k * 2, 6, 1, 8, "#3a7a2a"); PK.ell(g, 4 + k * 2, 5, 2, 2, k % 2 ? "#5aaa3a" : "#4a9a2e"); } R(g, 4, 11, 9, 2, "#c8402a"); } },
    { id: "matsun", ru: "Мацун", it: "Yogurt", d: g => { R(g, 4, 4, 8, 10, "#f4f0e8"); R(g, 4, 4, 8, 2, "#3a7ac8"); R(g, 5, 8, 6, 3, "#c8dcf0"); } },
    { id: "spaghetti", ru: "Спагетти", it: "Spaghetti", d: g => { R(g, 3, 3, 10, 11, "#3a5ab0"); R(g, 4, 1, 8, 4, "#f2d890"); for (let x = 4; x < 12; x += 2) R(g, x, 1, 1, 4, "#e8c060"); R(g, 4, 8, 8, 3, "#f4f0e8"); } },
    { id: "guanciale", ru: "Гуанчале (щёчка)", it: "Guanciale", d: g => { R(g, 2, 5, 12, 7, "#e8a090"); for (let y = 6; y < 12; y += 2) R(g, 2, y, 12, 1, "#f4e8e0"); RK.box(g, 2, 5, 12, 7, "#a85a4a"); } },
    { id: "eggs", ru: "Яйца", it: "Uova", d: g => { [[5, 9], [10, 8], [8, 12]].forEach(([x, y]) => { PK.ell(g, x, y, 3, 4, "#f4e8d0"); P(g, x - 1, y - 2, "#ffffff"); }); } },
    { id: "pecorino", ru: "Пекорино", it: "Pecorino", d: g => { PK.poly(g, [[2, 12], [14, 12], [14, 6], [2, 9]], "#f2dca0"); R(g, 2, 12, 12, 2, "#c8a050"); P(g, 7, 10, "#d8c080"); P(g, 11, 9, "#d8c080"); } },
    { id: "pepper", ru: "Чёрный перец", it: "Pepe nero", d: g => { R(g, 5, 5, 6, 9, "#2a2a30"); R(g, 6, 2, 4, 3, "#8a8a92"); for (let k = 0; k < 3; k++) P(g, 7 + k, 3, "#2a2a30"); } },
    { id: "cream", ru: "Сливки", it: "Panna", d: g => { R(g, 4, 4, 8, 10, "#f4f0e8"); PK.poly(g, [[4, 4], [8, 1], [12, 4]], "#e8e4dc"); R(g, 5, 8, 6, 3, "#f2a0b0"); } },
    { id: "pineapple", ru: "Ананас", it: "Ananas", d: g => { PK.ell(g, 8, 10, 4, 5, "#e8b030"); for (let k = 0; k < 6; k++) P(g, 6 + (k % 3) * 2, 8 + Math.floor(k / 3) * 3, "#a8701a"); PK.poly(g, [[5, 5], [8, 0], [11, 5]], "#4a9a3a"); } },
    { id: "ketchup", ru: "Кетчуп", it: "Ketchup", d: g => { R(g, 5, 4, 6, 10, "#d8202c"); R(g, 6, 1, 4, 3, "#f4f0e8"); R(g, 6, 8, 4, 3, "#f4f0e8"); } },
    { id: "borsch", ru: "Мамин борщ", it: "Borsch", d: g => { R(g, 3, 4, 10, 10, "#c8323c"); R(g, 3, 3, 10, 2, "#d8d0c0"); R(g, 5, 7, 6, 4, "#f4ece0"); R(g, 6, 8, 4, 1, "#c8323c"); } }
  ];
  function icon(f) { const cv = PK.mk(16, 16); f.d(cv.getContext("2d")); PK.outline(cv, OL); return cv; }
  // Блюда на столе (вид 3/4)
  function dish(kind) {
    const cv = PK.mk(24, 14), g = cv.getContext("2d");
    PK.ell(g, 12, 8, 11, 5, "#f4f0e8"); PK.ell(g, 12, 7, 9, 4, "#e8e4dc");
    if (kind === "dolma") for (let k = 0; k < 7; k++) { const x = 5 + (k % 4) * 4 + (k > 3 ? 2 : 0), y = 5 + (k > 3 ? 3 : 0); R(g, x, y, 4, 3, "#4a7a2e"); P(g, x, y, "#6a9a3a"); P(g, x + 3, y + 2, "#3a5a22"); }
    if (kind === "carbonara") { PK.ell(g, 12, 7, 7, 3, "#f2d890"); for (let k = 0; k < 10; k++) P(g, 6 + k, 6 + (k % 3), k % 2 ? "#e8c060" : "#fff0b0"); [[9, 6], [14, 7], [12, 8]].forEach(([x, y]) => R(g, x, y, 2, 1, "#c86a5a")); P(g, 11, 6, "#2a2a30"); P(g, 15, 8, "#2a2a30"); }
    if (kind === "borsch") { PK.ell(g, 12, 7, 7, 3, "#b8202c"); PK.ell(g, 13, 6, 2, 1, "#f4f0e8"); P(g, 9, 7, "#5aaa3a"); }
    PK.outline(cv, OL); return cv;
  }
  return { LIST, icon, dish, byId: id => LIST.find(f => f.id === id) };
})();
