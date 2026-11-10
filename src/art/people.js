/* Люди пролога: Женя (дома и в зимней одежде), папа Алексей, мама Наталья.
   Спрайты 16×26, каждый пиксель задан строкой. Наряды получаются заменой символов,
   поэтому один шаблон даёт и домашний, и зимний вариант. */
"use strict";
window.People = (() => {
  const B = s => s;  // для читаемости
  // ---------- Женя ----------
  const ZH_FRONT = [
    "......oooo......", "....ooLLHHoo....", "...oLLHHHHHHo...", "..oLHHHHHHHHHo..", "..oHHHHhhHHHHo..",
    "..oHHhSSSShHHo..", "..oHhSSSSSShHo..", "..oHSSSSSSSSHo..", "..oHSSESSESSHo..", "..oHSSESSESSHo..",
    "..oHSpSSSSpSHo..", "..oHHsSrrSsHHo..", "..oHHHossoHHHo..", "..oHHWWssWWHHo..", ".oWHHWWsWWWHHWo.",
    ".oWHhWWGWWWhHWo.", ".owWhWWWWWWhWwo.", ".owWWWWWWWWWWwo.", ".oSwWWWWWWWWwSo.", ".oSoJJJJJJJJoSo.",
    "..ooJJJJJJJJoo.."
  ];
  const ZH_BACK = [
    "......oooo......", "....ooLLHHoo....", "...oLLHHHHHHo...", "..oLHHHHHHHHHo..", "..oHHHHHHHHHHo..",
    "..oLHHHHHHHHho..", "..oLHHHHHHHHho..", "..oLHHHHHHHhho..", "..oHHHHHHHHhho..", "..oHHHHHHHHhho..",
    "..oHHHHHHHHhho..", "..oHHHHHHHhhho..", "..oHHHHHHHHhho..", "..oHHHHHHHhhho..", ".oWHHHHHHHHhhWo.",
    ".oWhHHHHHHHHhWo.", ".owWhHHHHHHhWwo.", ".owWWhhhhhhWWwo.", ".oSwWWWWWWWWwSo.", ".oSoJJJJJJJJoSo.",
    "..ooJJJJJJJJoo.."
  ];
  const ZH_SIDE = [
    "......oooo......", "....ooHHHLoo....", "...oHHHHHHLLo...", "..oHHHHHHHHHLo..", "..oHHHHHHHHHHo..",
    "..ohHHHHHHHSSSo.", "..ohHHHHHHSSSSo.", "..ohHHHHHHSSESo.", "..ohHHHHHHSSESo.", "..ohHHHHHHSSSSSo",
    "..ohHHHHHHSpSSo.", "..ohHHHHHHsSrso.", "..ohHHHHHHosso..", "..ohHHHHHWWsWo..", "..ohHHHHWWWWWWo.",
    "..ohhHHWWWWWWWo.", "...ohhWWwWWWWWo.", "....oWWwWWWWWo..", "....oWWSWWWWWo..", "....oJJJJJJJJo..",
    "....oJJJJJJJJo.."
  ];
  const LEGS = {
    stand: ["...oJJJjjJJJo...", "...oJJJooJJJo...", "...oJJo..oJJo...", "...oJJo..oJJo...", "...oBBo..oBBo...", "...oooo..oooo..."],
    a:     ["...oJJJjjJJJo...", "...oJJJooJJJo...", "...oJJo..oJJo...", "...oBBo..oJJo...", "...oooo..oBBo...", ".........oooo..."],
    b:     ["...oJJJjjJJJo...", "...oJJJooJJJo...", "...oJJo..oJJo...", "...oJJo..oBBo...", "...oBBo..oooo...", "...oooo........."]
  };
  const SIDE_LEGS = {
    stand: ["....oJJJJJJJo...", "....oJJjoJJJo...", "....oJJjoJJJo...", "....oBBBoBBBBo..", "....oooooooooo.."],
    a:     ["....oJJJJJJJo...", "...oJJJoJJJJo...", "..oJJJo..oJJJo..", ".oBBBo....oBBBBo", ".ooooo....oooooo"]
  };
  const HAT = ["......oPPo......", "....ooRRRRoo....", "...oRrRRrRRRo...", "..oRRRRRRRRRRo..", "..oKKKKKKKKKKo.."];
  const ZH_PAL = { o: "#3b2420", H: "#d39a52", h: "#a46a36", L: "#f0c77e", S: "#f6caa4", s: "#d89a78", E: "#3b2420", p: "#ee9a88", r: "#c45a52",
    W: "#f2e8d2", w: "#c8b494", G: "#f2c23a", J: "#56739e", j: "#3b5482", B: "#f6f1e8",
    P: "#f6f1e8", R: "#c8323c", r2: "#9a1e2a", K: "#f0e4d0", M: "#c8323c" };
  // Зимний вариант: шапка с помпоном, пуховик ниже бёдер, красные варежки, коричневые сапоги
  const ZH_WIN_PAL = Object.assign({}, ZH_PAL, { W: "#e9e2d6", w: "#b4a998", B: "#7a4a2e", J: "#3e5684", j: "#2c3c62" });
  const winterize = (rows, view) => rows.map((r, i) => {
    if (i < 5) return HAT[i];
    if (i >= 17) r = r.replace(/S/g, "M");
    if (i >= 19 && view !== "side") r = r.replace(/J/g, "W");
    if (view === "side" && i >= 19) r = r.replace(/J/g, "W");
    return r;
  });
  // палитра без ключа r2: шапку-полоску рисуем строчной r
  const fixPal = p => { const q = Object.assign({}, p); q.r = p.r; return q; };

  // ---------- Папа Алексей: короткая стрижка, крепкий, тату-рукав, щетина ----------
  const PA_TOP = [
    "................", "....oooooooo....", "...oHHHHHHHHo...", "..oHHHHHHHHHHo..", "..oHhSSSSSShHo..",
    "..oSSSSSSSSSSo..", "..oSbbbSSbbbSo..", "..oSSESSSSESSo..", "..osSSSSSSSSso..", "..osSSSnnSSSso..",
    "..oddSSSSSSddo..", "...oddsrrsddo...", "....oddddddo....", ".oTTTTTssTTTTTo.", "oTTTTTTTTTTTTTTo",
    "oTTVVVVVVVVVVTTo", "oiTTTTTTTTTTTTSo", "oiTTTTTTTTTTTTSo", "oSoTTTTTTTTTToSo", "oSoKKKKKKKKKKoSo",
    "..oKKKKKKKKKKo.."
  ];
  const PA_LEGS = ["...oKKKooKKKo...", "...oSSSo.oSSSo..", "...oSSSo.oSSSo..", "...oRRRo.oRRRo..", "...ooooo.ooooo.."];
  const PA_PAL = { o: "#2a1a18", H: "#4a3a32", h: "#2e221e", S: "#e8b48e", s: "#c48a68", b: "#3a2a24", E: "#2a1a18", n: "#c48a68", d: "#b88a6c", r: "#9c5a4c",
    T: "#d8202c", V: "#f4f0e8", i: "#5a6a8a", K: "#26262e", R: "#d8202c", U: "#d8202c", W: "#f4f0e8", t: "#1c222c" };
  // На вокзале: тёмная куртка, шарф «Спартака», джинсы, ботинки
  function papaStation(rows) {
    const r = rows.slice();
    r[13] = ".oTTUWUWUWUTTTo.";
    r[14] = "oTTTTUWTTTTTTTTo";
    r[15] = "oTTTTWUTTTTTTTTo";
    r[16] = "otTTTUWTTTTTTTto";
    r[17] = "otTTTWUTTTTTTTto";
    return r;
  }
  const PA_ST_PAL = Object.assign({}, PA_PAL, { T: "#2c3442", t: "#1c222c", K: "#3e5684", S: "#e8b48e", R: "#1e1a1a" });
  const PA_ST_LEGS = ["...oKKKooKKKo...", "...oKKKo.oKKKo..", "...oKKKo.oKKKo..", "...oRRRo.oRRRo..", "...ooooo.ooooo.."];

  // ---------- Мама Наталья: светлое каре, мягкий взгляд ----------
  const MA_TOP = [
    "......oooo......", "....ooAAAAoo....", "...oAAaAAAAAo...", "..oAAAAAAAAAAo..", "..oAAAAAAAAAAo..",
    "..oAAaSSSSaAAo..", "..oAaSSSSSSaAo..", "..oASSSSSSSSAo..", "..oASSESSESSAo..", "..oASSESSESSAo..",
    "..oASpSSSSpSAo..", "..oAAsSrrSsAAo..", "..oAAAossoAAAo..", "..ooTTTssTTToo..", ".oTTTTTTTTTTTTo.",
    ".oTtTTTTTTTTtTo.", ".oTtTTTTTTTTtTo.", ".oTtTTTTTTTTtTo.", ".oSoTTTTTTTToSo.", ".oSoKKKKKKKKoSo.",
    "..oKKKKKKKKKKo.."
  ];
  const MA_LEGS = ["..oKKKKKKKKKKo..", "...oSSo..oSSo...", "...oSSo..oSSo...", "...oBBo..oBBo...", "...oooo..oooo..."];
  const MA_PAL = { o: "#3a2626", A: "#e4c890", a: "#c4a46a", S: "#f4cca8", s: "#d8a07e", E: "#3a2626", p: "#ee9a8a", r: "#c4606a",
    T: "#a88ac8", t: "#8468a8", K: "#5a4a6a", B: "#6a4a3a", F: "#8a7464", f: "#6a5444", R: "#d8202c" };
  // На вокзале: меховая шапка, тёмно-синее пальто с красным шарфом (как у РЖД), сапоги
  function mamaStation(rows) {
    const r = rows.slice();
    r[0] = "....oooooooo...."; r[1] = "...oFFFFFFFFo..."; r[2] = "..oFfFFFfFFFFo.."; r[3] = "..oFFFFFFFFFFo..";
    r[13] = "..ooTTRRRRTToo..";
    return r.map((s, i) => i >= 19 ? s.replace(/K/g, "T") : s);
  }
  const MA_ST_PAL = Object.assign({}, MA_PAL, { T: "#2a3a5c", t: "#1e2a44", K: "#2a3a5c", B: "#1e1a1e", S: "#f4cca8" });
  const MA_ST_LEGS = ["..oTTTTTTTTTTo..", "...oKKo..oKKo...", "...oKKo..oKKo...", "...oBBo..oBBo...", "...oooo..oooo..."];

  const blinkRows = (rows, i8, row8, i9, row9) => rows.map((r, i) => i === i8 ? row8 : i === i9 ? row9 : r);
  const sp = (rows, pal) => PK.sprite(rows, pal);

  // Сборка всех кадров. Ключи: <кто>_<наряд>_<вид>_<кадр>
  function build() {
    const out = {};
    // Женя дома
    const zf = v => sp(ZH_FRONT.concat(LEGS[v]), ZH_PAL), zb = v => sp(ZH_BACK.concat(LEGS[v]), ZH_PAL), zs = v => sp(ZH_SIDE.concat(SIDE_LEGS[v]), ZH_PAL);
    out.zh_home = { front: [zf("stand"), zf("a"), zf("b")], back: [zb("stand"), zb("a"), zb("b")], side: [zs("stand"), zs("a")],
      blink: sp(blinkRows(ZH_FRONT, 8, "..oHSSSSSSSSHo..", 9, "..oHSSoSSoSSHo..").concat(LEGS.stand), ZH_PAL) };
    // Женя зимой
    const WF = winterize(ZH_FRONT, "front"), WB = winterize(ZH_BACK, "back"), WS = winterize(ZH_SIDE, "side");
    const wpal = Object.assign({}, ZH_WIN_PAL, { r: "#9a1e2a" });   // r в шапке = тёмная петля; рот тоже тёмно-красный
    const wf = v => sp(WF.concat(LEGS[v]), wpal), wb = v => sp(WB.concat(LEGS[v]), wpal), ws = v => sp(WS.concat(SIDE_LEGS[v]), wpal);
    out.zh_winter = { front: [wf("stand"), wf("a"), wf("b")], back: [wb("stand"), wb("a"), wb("b")], side: [ws("stand"), ws("a")],
      blink: sp(blinkRows(WF, 8, "..oHSSSSSSSSHo..", 9, "..oHSSoSSoSSHo..").concat(LEGS.stand), wpal) };
    // Папа
    const pb = blinkRows(PA_TOP, 7, "..oSSoSSSSoSSo..", -1, "");
    out.pa_home = { idle: sp(PA_TOP.concat(PA_LEGS), PA_PAL), blink: sp(pb.concat(PA_LEGS), PA_PAL) };
    out.pa_station = { idle: sp(papaStation(PA_TOP).concat(PA_ST_LEGS), PA_ST_PAL), blink: sp(papaStation(pb).concat(PA_ST_LEGS), PA_ST_PAL) };
    // папа машет шарфом над головой (для «МО-СКОВ-СКИЙ СПАР-ТАК»)
    const cheer = papaStation(PA_TOP).slice(); cheer[16] = "UtTTTTTTTTTTTtU"; cheer[17] = "WoTTTTTTTTTTTTW";
    const cheerCv = PK.mk(16, 26); { const g = cheerCv.getContext("2d"); g.drawImage(sp(papaStation(PA_TOP).concat(PA_ST_LEGS), PA_ST_PAL), 0, 0);
      // поднятые руки и шарф над головой
      g.clearRect(0, 16, 1, 4); g.clearRect(15, 16, 1, 4);
      PK.R(g, 0, 6, 2, 10, "#2c3442"); PK.R(g, 14, 6, 2, 10, "#2c3442"); PK.R(g, 0, 4, 2, 2, "#e8b48e"); PK.R(g, 14, 4, 2, 2, "#e8b48e");
      for (let k = 0; k < 16; k++) PK.R(g, k, 1 + (k % 4 < 2 ? 0 : 1), 1, 2, k % 4 < 2 ? "#d8202c" : "#f4f0e8"); }
    out.pa_station.cheer = cheerCv;
    // Мама
    const mb = blinkRows(MA_TOP, 8, "..oASSSSSSSSAo..", 9, "..oASSoSSoSSAo..");
    out.ma_home = { idle: sp(MA_TOP.concat(MA_LEGS), MA_PAL), blink: sp(mb.concat(MA_LEGS), MA_PAL) };
    out.ma_station = { idle: sp(mamaStation(MA_TOP).concat(MA_ST_LEGS), MA_ST_PAL), blink: sp(mamaStation(mb).concat(MA_ST_LEGS), MA_ST_PAL) };
    // мама машет рукой
    const wave = PK.mk(16, 26); { const g = wave.getContext("2d"); g.drawImage(out.ma_station.idle, 0, 0); g.clearRect(14, 14, 2, 6); PK.R(g, 14, 8, 2, 7, "#2a3a5c"); PK.R(g, 14, 6, 2, 2, "#f4cca8"); PK.P(g, 15, 7, "#3a2626"); }
    out.ma_station.wave = wave;
    return out;
  }

  // Портрет для диалога: голова и плечи из спрайта (первые 16 строк)
  function portrait(cv) {
    const p = PK.mk(16, 16); p.getContext("2d").drawImage(cv, 0, 0, 16, 16, 0, 0, 16, 16); return p;
  }
  return { build, portrait };
})();
