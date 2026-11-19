/* Егор (брат, его в игре зовут так, как зовёт Женя): тёмно-русые растрёпанные волосы с чёлкой, короче по бокам,
   чёрная волейбольная форма с красным воротом и рукавом, номер 18. Рост как у Жени (16×26).
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
  const BODY = [".oKKKRRSSRRKKKo.", "oKKKKKRRRRKKKRRo", "oKKKKKWWKWWKKRRo", "oSKKKKKWKWWKKKSo", "oSKKKKKWKWWKKKSo", "oSoKKKKWKWWKKoSo", "..oJJJJJJJJJJo.."];
  const BACKBODY = [".oKKKRRRRRRKKKo.", "oKKKKKKKKKKKKRRo", "oKKKKKWWKWWKKRRo", "oSKKKKKWKWWKKKSo", "oSKKKKKWKWWKKKSo", "oSoKKKKWKWWKKoSo", "..oJJJJJJJJJJo.."];
  const LEGS = {
    stand: ["...oJJJooJJJo...", "...oSSSo.oSSSo..", "...oSSSo.oSSSo..", "...owwwo.owwwo..", "...ooooo.ooooo.."],
    a: ["...oJJJooJJJo...", "...oSSSo.oSSSo..", "...owwwo.oSSSo..", "...oooo..owwwo..", "..........oooo.."],
    b: ["...oJJJooJJJo...", "...oSSSo.oSSSo..", "...oSSSo.owwwo..", "...owwwo..oooo..", "...oooo........."]
  };
  const PAL = { o: OL, H: "#5a3e2a", h: "#3e2a1e", k: "#7a5a46", S: "#f0c8a8", s: "#d4a684", E: "#2a1a18", n: "#d4a684", r: "#c07a6a",
    K: "#1c1c22", R: "#d8302c", W: "#f4f0e8", J: "#2a2a34", w: "#f4f0e8" };
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
    const wave = PK.mk(16, 25); { const g = wave.getContext("2d"); g.drawImage(front[0], 0, 0); g.clearRect(14, 16, 2, 4); PK.R(g, 14, 9, 2, 7, "#1c1c22"); PK.R(g, 14, 7, 2, 2, "#f0c8a8"); PK.P(g, 15, 8, OL); }
    const kidSp = rows => PK.sprite(rows, KPAL);
    const shift = (rows, from, dx) => rows.map((r, i) => i < from ? r : dx > 0 ? "." + r.slice(0, -1) : r.slice(1) + ".");
    return { front, back: [sp(B.concat(LEGS.stand)), sp(B.concat(LEGS.a)), sp(B.concat(LEGS.b))], blink: sp(blink.concat(LEGS.stand)), wave,
      kid: kidSp(KID), kidL: kidSp(shift(KID, 12, -1)), kidR: kidSp(shift(KID, 12, 1)),
      kidBlink: kidSp(KID.map((r, i) => i === 5 ? ".oSSSSSSSSo." : r)) };
  }
  // вещи для открыток (крупные иконки 16×16)
  function item(id) {
    const cv = PK.mk(16, 16), g = cv.getContext("2d"), R = PK.R, P = PK.P;
    if (id === "remote") { R(g, 5, 1, 6, 14, "#3a3a44"); R(g, 6, 2, 4, 2, "#d8302c"); for (let y = 5; y < 13; y += 2) { R(g, 6, y, 1, 1, "#c8c8d0"); R(g, 9, y, 1, 1, "#c8c8d0"); } R(g, 7, 5, 2, 2, "#5a9ac8"); }
    if (id === "bib") { R(g, 1, 3, 14, 10, "#f4f0e8"); R(g, 1, 3, 14, 2, "#3a8a4a"); P(g, 2, 4, "#c8c8c8"); P(g, 13, 4, "#c8c8c8"); P(g, 2, 11, "#c8c8c8"); P(g, 13, 11, "#c8c8c8");
      R(g, 5, 7, 1, 4, "#2a2a34"); R(g, 7, 7, 3, 1, "#2a2a34"); R(g, 9, 7, 1, 4, "#2a2a34"); R(g, 7, 9, 3, 1, "#2a2a34"); R(g, 7, 10, 3, 1, "#2a2a34"); }
    if (id === "bag") { R(g, 2, 5, 12, 9, "#f08ab0"); for (let y = 6; y < 14; y += 2) for (let x = 3; x < 14; x += 2) P(g, x, y, "#c85a88"); R(g, 2, 4, 12, 2, "#c8c8d0"); for (let x = 3; x < 14; x += 2) P(g, x, 4, "#8a8a98"); R(g, 12, 2, 2, 3, "#c8c8d0"); }
    if (id === "stick") { for (let k = 0; k < 13; k++) R(g, 1 + k, 13 - k, 2, 2, k < 4 ? "#2a1e18" : "#8a5a32"); R(g, 1, 13, 2, 2, "#e8602a"); P(g, 2, 12, "#ffb040"); }
    PK.outline(cv, OL); return cv;
  }
  return { build, item };
})();
