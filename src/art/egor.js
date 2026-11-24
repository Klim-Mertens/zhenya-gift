/* Егор (брат, его в игре зовут так, как зовёт Женя): тёмно-русые растрёпанные волосы с чёлкой, короче по бокам,
   чёрная футболка с Hello Kitty, джинсы, белые кеды. Рост как у Жени (16×26).
   Маленький Егор (6 лет, для воспоминания про смешные видео): 12×18, жёлтая футболка, шорты. */
"use strict";
window.EgorArt = (() => {
  const OL = "#2a1a18";
  const HEAD = [
    "................", "....oooooooo....", "...oHHhHHHHHo...", "..oHHHHHhHHHHo..", "..oHhHHHHHHhHo..",
    "..oHHHHHHHHHHo..", "..okHHSHHHSHko..", "..okSESSSSESko..", "..oSSESSSSESSo..", "..osSSSnnSSSso..",
    "..osSSSSSSSSso..", "...osSSrrSSso...", "....osssssso...."
  ];
  const BACKHEAD = [
    "................", "....oooooooo....", "...oHHhHHHHHo...", "..oHHHHHhHHHHo..", "..oHhHHHHHHhHo..",
    "..oHHHHHHHHHHo..", "..okHHHHHHHHko..", "..okHHhHHhHHko..", "..okkHHHHHHkko..", "..oskkkkkkkkso..",
    "..osSSSSSSSSso..", "...osSSSSSSso...", "....osssssso...."
  ];
  // чёрная футболка с «качком» Hello Kitty на груди (как на фото от Клима), джинсы, белые кеды
  const BODY = [".oKKKKdSSdKKKKo.", "oKKyKKddddKKyKKo", "oKqyyKWWWPKyyqKo", "oSqKyyWbWbyyKqSo", "oSKKKyyyyyyKKKSo", "oSoqKKyyyyKKqoSo", "..oJJJJJJJJJJo.."];
  const BACKBODY = [".oKKKKddddKKKKo.", "oKKKKKKKKKKKKKKo", "oKqKKKKKKKKKKqKo", "oSqKKKKKKKKKKqSo", "oSKKKKKKKKKKKKSo", "oSoqqKKKKKKqqoSo", "..oJJJJJJJJJJo.."];
  const LEGS = {
    stand: ["...oJJJooJJJo...", "...oSSSo.oSSSo..", "...oSSSo.oSSSo..", "...owwwo.owwwo..", "...ooooo.ooooo.."],
    a: ["...oJJJooJJJo...", "...oSSSo.oSSSo..", "...owwwo.oSSSo..", "...oooo..owwwo..", "..........oooo.."],
    b: ["...oJJJooJJJo...", "...oSSSo.oSSSo..", "...oSSSo.owwwo..", "...owwwo..oooo..", "...oooo........."]
  };
  const PAL = { o: OL, H: "#5a3e2a", h: "#3e2a1e", k: "#7a5a46", S: "#f0c8a8", s: "#d4a684", E: "#2a1a18", n: "#d4a684", r: "#c07a6a",
    K: "#1e1e24", q: "#121216", d: "#0c0c10", y: "#ead6ba", P: "#ff6a9a", b: "#1a1a1a", R: "#d8302c", W: "#ffffff", J: "#3a5a8a", w: "#f4f0e8" };
  // маленький Егор
  const KID = [
    "...oooooo...", "..oHHHHHHo..", ".oHHhHHHHHo.", ".oHHHHHHhHo.", ".okSHSSHSko.", ".oSESSSSESo.", ".oSSSSSSSSo.", ".osSSrrSSso.",
    "..osssssso..", ".oTTTTTTTTo.", "oSTTTTTTTTSo", "oSTTTTTTTTSo", ".oSTTTTTTSo.", "..oJJJJJJo..", "..oJJooJJo..", "..oSSo.oSSo.", "..oSSo.oSSo.", "..ooo..ooo.."
  ];
  const KPAL = Object.assign({}, PAL, { H: "#7a5a3a", h: "#5a3e2a", k: "#9a7a5a", T: "#f2c23a", J: "#4a7ac8" });
  function build() {
    const sp = rows => PK.sprite(rows, PAL), F = HEAD.concat(BODY), B = BACKHEAD.concat(BACKBODY);
    const blink = F.map((r, i) => i === 7 ? "..okSSSSSSSSko.." : i === 8 ? "..oSSoSSSSoSSo.." : r);
    const front = [sp(F.concat(LEGS.stand)), sp(F.concat(LEGS.a)), sp(F.concat(LEGS.b))];
    // машет рукой: правая рука поднята
    const wave = PK.mk(16, 25); { const g = wave.getContext("2d"); g.drawImage(front[0], 0, 0); g.clearRect(14, 16, 2, 4); PK.R(g, 14, 9, 2, 7, "#1e1e24"); PK.R(g, 14, 7, 2, 2, "#f0c8a8"); PK.P(g, 15, 8, OL); }
    const kidSp = rows => PK.sprite(rows, KPAL);
    const shift = (rows, from, dx) => rows.map((r, i) => i < from ? r : dx > 0 ? "." + r.slice(0, -1) : r.slice(1) + ".");
    return { front, back: [sp(B.concat(LEGS.stand)), sp(B.concat(LEGS.a)), sp(B.concat(LEGS.b))], blink: sp(blink.concat(LEGS.stand)), wave,
      kid: kidSp(KID), kidL: kidSp(shift(KID, 12, -1)), kidR: kidSp(shift(KID, 12, 1)),
      kidBlink: kidSp(KID.map((r, i) => i === 5 ? ".oSSSSSSSSo." : r)) };
  }
  // гость-мужчина для массовки: тот же шаблон, другие волосы/кожа/одежда; bald — без волос, beard — борода
  function variant(o) {
    const pal = Object.assign({}, PAL, o);
    let head = HEAD.slice();
    if (o.bald) head = head.map((r, i) => i >= 1 && i <= 5 ? r.replace(/[Hh]/g, "S") : i === 6 ? r.replace(/[Hhk]/g, "S") : r);
    if (o.beard) head = head.map((r, i) => i >= 9 && i <= 12 ? r.replace(/s/g, "h") : r);
    const F = head.concat(BODY.map(r => r.replace(/[yWPb]/g, "K")))  /* у гостей футболка без принта */, rows = F.concat(LEGS.stand);
    const blink = F.map((r, i) => i === 7 ? r.replace(/E/g, "S") : i === 8 ? r.replace(/E/g, "o") : r).concat(LEGS.stand);
    return { idle: PK.sprite(rows, pal), blink: PK.sprite(blink, pal) };
  }
  // плюшевый белый гусь (подарок от коллег из Lido), 14×16
  function goose() {
    const cv = PK.mk(14, 16), g = cv.getContext("2d"), R = PK.R, P = PK.P;
    PK.ell(g, 7, 11, 6, 4, "#f4f4f0"); PK.ell(g, 6, 12, 4, 2, "#dcdcd8"); R(g, 9, 3, 3, 8, "#f4f4f0"); PK.ell(g, 10, 3, 2, 2, "#f4f4f0");
    R(g, 12, 3, 2, 1, "#f29a2a"); P(g, 12, 4, "#d8781a"); P(g, 10, 2, "#2a1a18"); P(g, 3, 9, "#e8e8e4"); R(g, 5, 15, 2, 1, "#f29a2a"); R(g, 8, 15, 2, 1, "#f29a2a");
    R(g, 8, 6, 3, 1, "#d8302c"); P(g, 9, 7, "#d8302c");   // красный бантик
    PK.outline(cv, OL); return cv;
  }
  // вещи для открыток (крупные иконки 16×16)
  function item(id) {
    const cv = PK.mk(16, 16), g = cv.getContext("2d"), R = PK.R, P = PK.P;
    if (id === "remote") { R(g, 5, 1, 6, 14, "#3a3a44"); R(g, 6, 2, 4, 2, "#d8302c"); for (let y = 5; y < 13; y += 2) { R(g, 6, y, 1, 1, "#c8c8d0"); R(g, 9, y, 1, 1, "#c8c8d0"); } R(g, 7, 5, 2, 2, "#5a9ac8"); }
    if (id === "bib") {   // наклейка бегуна на грудь с номером 300
      R(g, 1, 3, 14, 11, "#f4f0e8"); R(g, 1, 3, 14, 2, "#d8302c"); R(g, 1, 12, 14, 2, "#d8302c");
      P(g, 2, 4, "#c8c8c8"); P(g, 13, 4, "#c8c8c8"); P(g, 2, 12, "#c8c8c8"); P(g, 13, 12, "#c8c8c8");
      const D = { 3: ["111", "001", "011", "001", "111"], 0: ["111", "101", "101", "101", "111"] };
      [3, 0, 0].forEach((n, i) => D[n].forEach((row, y) => [...row].forEach((c, x) => { if (c === "1") P(g, 3 + i * 4 + x, 6 + y, "#1a1a24"); }))); }
    if (id === "bag") { R(g, 2, 5, 12, 9, "#f08ab0"); for (let y = 6; y < 14; y += 2) for (let x = 3; x < 14; x += 2) P(g, x, y, "#c85a88"); R(g, 2, 4, 12, 2, "#c8c8d0"); for (let x = 3; x < 14; x += 2) P(g, x, 4, "#8a8a98"); R(g, 12, 2, 2, 3, "#c8c8d0"); }
    if (id === "phone") { R(g, 4, 1, 8, 14, "#2a2a34"); R(g, 5, 3, 6, 9, "#5ab0e8"); R(g, 5, 3, 6, 3, "#8ad0ff"); R(g, 7, 13, 2, 1, "#8a8a98"); P(g, 7, 7, "#f4f0e8"); R(g, 8, 6, 1, 3, "#f4f0e8"); P(g, 9, 7, "#f4f0e8"); }
    if (id === "flash") { R(g, 3, 5, 9, 6, "#2a5ac8"); R(g, 3, 5, 9, 1, "#5a8ae8"); R(g, 12, 6, 3, 4, "#c8ccd8"); R(g, 13, 7, 1, 1, "#5a5a64"); R(g, 13, 8, 1, 1, "#5a5a64"); P(g, 5, 7, "#f4f0e8"); R(g, 7, 8, 3, 1, "#f2c23a"); }
    if (id === "ladle") { PK.ell(g, 5, 11, 4, 3, "#c8ccd8"); PK.ell(g, 5, 10, 3, 1, "#8a8e9a"); for (let k = 0; k < 9; k++) R(g, 8 + k, 9 - k, 1, 2, "#a8acb8"); R(g, 14, 1, 2, 2, "#c8ccd8"); }
    if (id === "stick") { for (let k = 0; k < 13; k++) R(g, 1 + k, 13 - k, 2, 2, k < 4 ? "#2a1e18" : "#8a5a32"); R(g, 1, 13, 2, 2, "#e8602a"); P(g, 2, 12, "#ffb040"); }
    PK.outline(cv, OL); return cv;
  }
  return { build, item, variant, goose };
})();
