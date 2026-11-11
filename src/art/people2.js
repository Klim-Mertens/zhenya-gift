/* Люди главы 1 (Милан): летняя Женя, Нарина и Джанлука.
   Те же шаблоны 16×26, что в people.js, только другие причёски, одежда и палитры. */
"use strict";
window.People2 = (() => {
  const sp = (rows, pal) => PK.sprite(rows, pal);
  // ---- шаблоны «длинные волосы» (как у Жени), берём из People через копию ----
  const T = People.templates();
  const setCh = (row, i, ch) => row.slice(0, i) + ch + row.slice(i + 1);
  // юбка вместо штанов: верх ног в цвет юбки, ниже — кожа
  const skirtLegs = legs => legs.map((r, i) => i >= 2 && i <= 3 ? r.replace(/J/g, "S") : r);
  const skirtSide = legs => legs.map((r, i) => i >= 1 && i <= 2 ? r.replace(/J/g, "S") : r);
  // без рукавов: внешние пиксели рук на плечах — кожа
  const sleeveless = rows => rows.map((r, i) => i >= 14 && i <= 17 ? r.replace(/^(\.o)W/, "$1S").replace(/W(o\.)$/, "S$1").replace(/^(\.o)w/, "$1S").replace(/w(o\.)$/, "S$1") : r);

  // ---------- Женя летом: белый топ, голубая юбка, сандалии, очки на голове ----------
  const ZH_SUM_PAL = Object.assign({}, T.ZH_PAL, { W: "#fff6e8", w: "#d8c8b0", J: "#7ab0d8", j: "#5a90bc", B: "#c89a6a", K: "#2a1e22", G: "#f2c23a" });
  const glassesOnHead = rows => rows.map((r, i) => i === 2 ? "...oKKHHHHKKo..." : r);
  // ---------- Нарина: длинные тёмно-каштановые волосы, тёмный топ без рукавов, золотой браслет ----------
  const NA_PAL = Object.assign({}, T.ZH_PAL, { H: "#6a4232", h: "#4a2c22", L: "#8a5c42", S: "#f2c6a2", s: "#d6a07e", W: "#3e2c28", w: "#2a1e1c",
    G: "#f2c23a", J: "#e8dcc8", j: "#c8b8a0", B: "#e8dcc8", K: "#3a1e1e", r: "#c45a5a" });
  const naRows = rows => sleeveless(rows).map((r, i) => {
    if (i === 2) return "...oKKHHHHKKo...";                  // очки на голове
    if (i === 12) r = setCh(setCh(r, 3, "G"), 12, "G");       // серьги
    if (i === 17) r = setCh(r, 13, "G");                      // браслет на руке
    return r;
  });
  // ---------- Джанлука: лысый, борода, солнечные очки, белая футболка и рубашка в полоску, золотые часы ----------
  const GI_TOP = [
    "................", "......oooo......", "....oSSSSSSo....", "...oSSSSSSlSo...", "..oSSSSSSSSlSo..",
    "..oSSSSSSSSSSo..", "..oSbbbSSbbbSo..", "..oSKKKKKKKKSo..", "..osKKKsSKKKso..", "..osSSSnnSSSso..",
    "..oddSmmmmSddo..", "..oddddrrddddo..", "...oddddddddo...", ".oTVTVWWWWVTVTo.", "oTVTVTWWWWTVTVTo",
    "oTVTVTWgWWTVTVTo", "oTVTVTWWWWTVTVTo", "oSTVTVWWWWVTVTSo", "oSTVTVWWWWVTVTSo", "oYTVTVWWWWVTVTSo", "oSoTVTWWWWTVToGo", "oSoKKKKKKKKKKoSo",
    "..oKKKKKKKKKKo.."
  ];
  const GI_PAL = { o: "#2a1a18", S: "#e2ae86", s: "#c48a66", l: "#fff0dc", b: "#3a2a24", K: "#1c1a20", E: "#2a1a18", n: "#c48a66",
    d: "#3a2a22", m: "#2a1e18", r: "#9c5a4c", T: "#b8a68c", V: "#f4f0e8", W: "#ffffff", g: "#e8c060", G: "#e8c060", Y: "#ffd84a" };
  const GI_LEGS = { stand: ["...oKKKooKKKo...", "...oKKKo.oKKKo..", "...oKKKo.oKKKo..", "...oKKKo.oKKKo..", "...oWWWo.oWWWo..", "...ooooo.ooooo.."],
    a: ["...oKKKooKKKo...", "...oKKKo.oKKKo..", "...oKKKo.oKKKo..", "...oWWWo.oKKKo..", "...oooo..oWWWo..", "..........oooo.."],
    b: ["...oKKKooKKKo...", "...oKKKo.oKKKo..", "...oKKKo.oKKKo..", "...oKKKo.oWWWo..", "...oWWWo..oooo..", "...oooo........."] };
  // без очков (глаза видно) — для смешной реакции на водку
  const giEyes = (rows, wide) => rows.map((r, i) => i === 7 ? (wide ? "..oSWWWSSWWWSo.." : "..oSSESSSSESSo..") : i === 8 ? (wide ? "..osWEWSSWEWso.." : "..osSSSSSSSSso..") : r);
  const GI_RED = Object.assign({}, GI_PAL, { S: "#f08a6a", s: "#d06a4a", n: "#d06a4a" });

  function frames(F, B, S, legs, sideLegs, pal, blinkF) {
    const f = v => sp(F.concat(legs[v]), pal), b = v => sp(B.concat(legs[v]), pal), s = v => sp(S.concat(sideLegs[v]), pal);
    return { front: [f("stand"), f("a"), f("b")], back: [b("stand"), b("a"), b("b")], side: [s("stand"), s("a")], blink: sp(blinkF.concat(legs.stand), pal) };
  }
  const blink = (rows, a, b) => rows.map((r, i) => i === 8 ? a : i === 9 ? b : r);
  function build() {
    const out = {};
    // Женя летом
    const legs = { stand: skirtLegs(T.LEGS.stand), a: skirtLegs(T.LEGS.a), b: skirtLegs(T.LEGS.b) }, sl = { stand: skirtSide(T.SIDE_LEGS.stand), a: skirtSide(T.SIDE_LEGS.a) };
    const ZF = glassesOnHead(sleeveless(T.ZH_FRONT)), ZB = sleeveless(T.ZH_BACK), ZS = T.ZH_SIDE.map((r, i) => i === 2 ? "...oHHHHHHKKo..." : r);
    out.zh_summer = frames(ZF, ZB, ZS, legs, sl, ZH_SUM_PAL, blink(ZF, "..oHSSSSSSSSHo..", "..oHSSoSSoSSHo.."));
    // Нарина (полный набор кадров: она ходит вместе с Женей)
    const NF = naRows(T.ZH_FRONT), NB = sleeveless(T.ZH_BACK), NS = T.ZH_SIDE.map((r, i) => i === 2 ? "...oHHHHHHKKo..." : r);
    out.na = frames(NF, NB, NS, T.LEGS, T.SIDE_LEGS, NA_PAL, blink(NF, "..oHSSSSSSSSHo..", "..oHSSoSSoSSHo.."));
    // Нарина показывает браслет: рука поднята к лицу
    const show = PK.mk(16, 26); { const g = show.getContext("2d"); g.drawImage(out.na.front[0], 0, 0); g.clearRect(13, 14, 3, 6);
      PK.R(g, 13, 9, 2, 6, "#f2c6a2"); PK.R(g, 13, 14, 2, 1, "#f2c23a"); PK.P(g, 14, 13, "#fff4a0"); PK.R(g, 15, 9, 1, 6, "#3b2420"); PK.R(g, 13, 8, 2, 1, "#3b2420"); }
    out.na.show = show;
    // Джанлука
    out.gi = { front: ["stand", "a", "b"].map(v => sp(GI_TOP.concat(GI_LEGS[v]), GI_PAL)) };
    out.gi.idle = out.gi.front[0];
    out.gi.blink = sp(GI_TOP.map((r, i) => i === 3 ? "...oSSSSSSSSo..." : r).concat(GI_LEGS.stand), GI_PAL);   // блик на лысине «мигает»
    out.gi.eyes = sp(giEyes(GI_TOP, false).concat(GI_LEGS.stand), GI_PAL);
    const gshow = PK.mk(16, out.gi.idle.height); { const g = gshow.getContext("2d"); g.drawImage(out.gi.idle, 0, 0); g.clearRect(0, 17, 2, 5);
      PK.R(g, 0, 9, 2, 8, "#e2ae86"); PK.R(g, 0, 15, 2, 1, "#ffd84a"); PK.P(g, 1, 14, "#fff4a0"); PK.R(g, 0, 8, 2, 1, "#2a1a18"); PK.R(g, 2, 9, 1, 6, "#2a1a18"); }
    out.gi.show = gshow;
    out.gi.wide = sp(giEyes(GI_TOP, true).concat(GI_LEGS.stand), GI_PAL);
    out.gi.shock = sp(giEyes(GI_TOP, true).concat(GI_LEGS.stand), GI_RED);
    return out;
  }
  return { build };
})();
