/* Люди главы 2: Лера (каштановое каре, невысокая, спортивная) в беговой форме и в футбольной.
   Лера ниже остальных: спрайт 16×24. */
"use strict";
window.People3 = (() => {
  const sp = (rows, pal) => PK.sprite(rows, pal);
  const HEAD = [
    "......oooo......", "....ooAAAAoo....", "...oAAaAAAAAo...", "..oAAAAAAAAAAo..", "..oAAAAAaAAAAo..",
    "..oAAaSSSSaAAo..", "..oAaSSSSSSaAo..", "..oASSSSSSSSAo..", "..oASSESSESSAo..", "..oASSESSESSAo..",
    "..oASpSSSSpSAo..", "..oAAsSrrSsAAo..", "..oAAAossoAAAo.."
  ];
  const BODY = ["..oSoTTssTToSo..", ".oSSTTTTTTTTSSo.", ".oSoTTWWWWTToSo.", ".oSoTTTTTTTToSo.", ".oSoKKKKKKKKoSo.", "..oKKKKKKKKKKo.."];
  const BACK_HEAD = HEAD.map((r, i) => i >= 5 ? (i === 12 ? "..ooAAAAAAAAoo.." : "..oAAAAAAAAAAo..") : r);
  const BACK_BODY = ["..oSoTTTTTToSo..", ".oSSTTTTTTTTSSo.", ".oSoTTTTTTTToSo.", ".oSoTTTTTTTToSo.", ".oSoKKKKKKKKoSo.", "..oKKKKKKKKKKo.."];
  const SIDE = [
    "......oooo......", "....ooAAAAoo....", "...oAAAAAAAAo...", "..oAAAAAAAAAAo..", "..oAAAAAAAAAAo..",
    "..oAAAAAAASSSo..", "..oAAAAAASSSSo..", "..oAAAAAASSESo..", "..oAAAAAASSESo..", "..oAAAAAASSSSSo.",
    "..oAAAAAASpSSo..", "..oAAAAAAsSrso..", "...oAAAAAossoo..", "....oTTTTsTo....", "....oSTTTTTo....",
    "....oSTTWTTo....", "....oSTTTTTo....", "....oSoKKKKo....", "....oKKKKKKo...."
  ];
  const LEGS = {
    stand: ["...oSSo..oSSo...", "...oSSo..oSSo...", "...oBBo..oBBo...", "...oooo..oooo..."],
    a:     ["...oSSo..oSSo...", "...oBBo..oSSo...", "...oooo..oBBo...", ".........oooo..."],
    b:     ["...oSSo..oSSo...", "...oSSo..oBBo...", "...oBBo..oooo...", "...oooo........."]
  };
  const SIDE_LEGS = {
    stand: ["....oSSoSSSo....", "....oSSoSSSo....", "....oBBBoBBBo...", "....ooooooooo..."],
    a:     ["...oSSo..oSSo...", "..oSSo....oSSo..", ".oBBBo....oBBBo.", ".ooooo....ooooo."]
  };
  const PAL = { o: "#3a2420", A: "#8a5434", a: "#a8704a", S: "#f2c8a4", s: "#d6a07e", E: "#3a2420", p: "#ee9a8a", r: "#c45a5a",
    T: "#26242a", W: "#f4f0e8", K: "#26242a", B: "#f4f0e8" };
  // футбольная форма: светлая футболка с синими полосками, синие шорты, гетры
  const KIT = Object.assign({}, PAL, { T: "#f4f0e8", W: "#3a6ac8", K: "#2a4a9a", B: "#2a2a30" });
  const blink = rows => rows.map((r, i) => i === 8 ? "..oASSSSSSSSAo.." : i === 9 ? "..oASSoSSoSSAo.." : r);
  function set(pal) {
    const F = HEAD.concat(BODY), Bk = BACK_HEAD.concat(BACK_BODY);
    const f = v => sp(F.concat(LEGS[v]), pal), b = v => sp(Bk.concat(LEGS[v]), pal), s = v => sp(SIDE.concat(SIDE_LEGS[v]), pal);
    return { front: [f("stand"), f("a"), f("b")], back: [b("stand"), b("a"), b("b")], side: [s("stand"), s("a")], blink: sp(blink(F).concat(LEGS.stand), pal) };
  }
  function build() {
    const out = { le_run: set(PAL), le_kit: set(KIT) };
    // медаль на шее (после матча)
    const medal = PK.mk(16, 24); { const g = medal.getContext("2d"); g.drawImage(out.le_kit.front[0], 0, 0); PK.R(g, 6, 13, 1, 3, "#3a6ac8"); PK.R(g, 9, 13, 1, 3, "#3a6ac8"); PK.R(g, 7, 15, 2, 3, "#f2c23a"); PK.P(g, 7, 15, "#fff4a0"); }
    out.le_kit.medal = medal;
    return out;
  }
  return { build };
})();
