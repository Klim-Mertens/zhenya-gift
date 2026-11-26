/* Мини-игра «Красный свет, зелёный свет» — отсылка на «Игру в кальмара».
   Вместо гигантской куклы — папа в футболке «Спартака». Пока он кричит «МО-СКОВ-СКИЙ СПАР-…» спиной к нам, можно бежать (держи →).
   На «ТАК!» он оборачивается — надо замереть. Двинулась — папа «ловит» и отправляет на пару шагов назад (не на старт).
   Рядом бегут Лера и Нарина: чуть медленнее Жени, тоже ошибаются; если Женя стоит, они добегают до красной линии и останавливаются.
   Все в зелёных костюмах как в сериале, у Жени номер 456. После 3 поимок можно пропустить.
   Идёт после вечеринки у Лоренцо (во дворе), после неё — титры. */
"use strict";
class RedLightScene extends Phaser.Scene {
  constructor() { super("redlight"); }
  init(data) { this.devData = data || {}; }
  create() {
    Save.store("redlight"); Sound.play("piazza"); UI.goal(""); UI.hint("");
    this.cameras.main.fadeIn(700, 0, 0, 0);
    this.papaBack = this.makePapaBack(); this.bg = this.makeBg();
    this.START = 24; this.FINISH = 262; this.G = 150;
    this.zh = { x: this.START, t: 0, moving: false };
    this.npcs = [{ key: "le_kit", name: "Лера", num: "067", x: this.START, y: 132, sp: 31, f: 1, t: 0, react: 0 }, { key: "na", name: "Нарина", num: "218", x: this.START, y: 166, sp: 25, f: 1, t: 0, react: 0 }];
    this.kit = {}; ["zh_summer", "le_kit", "na"].forEach(k => [0, 1].forEach(i => { this.kit[`${k}_${i}`] = this.greenKit(`${k}_side_${i}`); }));
    this.state = "intro"; this.light = "green"; this.syl = []; this.caught = 0; this.flashT = 0; this.round = 0;
    this.keys = this.input.keyboard.addKeys("RIGHT,D,LEFT,A");
    this.events.once("shutdown", () => { document.getElementById("banner").hidden = true; });
    World.backdrop(this, "rl_bg", (g, t) => this.draw(g, t), -1000);
    this.time.delayedCall(800, () => this.intro());
  }
  makePapaBack() {
    // папа со спины: из обычного спрайта закрашиваем лицо волосами
    const src = this.textures.get("pa_home_idle").getSourceImage(), cv = PK.mk(16, 26), g = cv.getContext("2d"); g.drawImage(src, 0, 0);
    const id = g.getImageData(0, 0, 16, 26), d = id.data, OL = [0x2a, 0x1a, 0x18];
    const hair = [0x4a, 0x3a, 0x32], skin = [0xe8, 0xb4, 0x8e];
    for (let y = 4; y < 13; y++) for (let x = 3; x < 13; x++) { const i = (y * 16 + x) * 4; if (!d[i + 3]) continue;
      const isOL = d[i] === OL[0] && d[i + 1] === OL[1] && d[i + 2] === OL[2]; if (isOL && y < 11) { if (x > 3 && x < 12) { d[i] = hair[0]; d[i + 1] = hair[1]; d[i + 2] = hair[2]; } continue; }
      if (isOL) continue; const c = y < 11 ? hair : skin; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; }
    // белая полоса «Спартака» спереди не видна со спины — красим её в красный
    for (let x = 0; x < 16; x++) { const i = (15 * 16 + x) * 4; if (d[i] === 0xf4 && d[i + 1] === 0xf0) { d[i] = 0xd8; d[i + 1] = 0x20; d[i + 2] = 0x2c; } }
    g.putImageData(id, 0, 0); return cv;
  }
  // зелёный спортивный костюм как в сериале: одежда (всё ниже шеи, кроме кожи, волос и контура) — в зелёный, на груди белый номер
  greenKit(key) {
    const src = this.textures.get(key).getSourceImage(), w = src.width, h = src.height, cv = PK.mk(w, h), g = cv.getContext("2d"); g.drawImage(src, 0, 0);
    const id = g.getImageData(0, 0, w, h), d = id.data, hair = new Set(), key3 = i => (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    const OL = key3(0 + (0 * w + 6) * 4);   // контур — верхний пиксель головы
    for (let y = 0; y < 9; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i + 3]) hair.add(key3(i)); }
    const skin = i => d[i] > 195 && d[i + 1] > 140 && d[i] - d[i + 2] > 40 && d[i] - d[i + 2] < 110;
    for (let y = 12; y < h - 1; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (!d[i + 3]) continue; const k = key3(i);
      if (k === OL || hair.has(k) || skin(i)) continue;
      const lum = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255, c = lum > .7 ? [0x3a, 0xa8, 0x82] : lum > .4 ? [0x2a, 0x8a, 0x6a] : [0x1e, 0x6a, 0x52];
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; }
    g.putImageData(id, 0, 0);
    const cy = h - 11; PK.R(g, 8, cy, 3, 2, "#f4f0e8");   // белая нашивка с номером на груди
    return cv;
  }
  // номер игрока над головой (свой мини-шрифт 3×5)
  num(g, s, cx, y, col) {
    const F = { 0: "111101101101111", 1: "010110010010111", 2: "111001111100111", 4: "101101111001001", 5: "111100111001111", 6: "111100111101111", 7: "111001010010010", 8: "111101111101111" };
    const w = s.length * 4 - 1, x0 = Math.round(cx - w / 2);
    PK.R(g, x0 - 1, y - 1, w + 2, 7, "rgba(20,30,26,.7)");
    [...s].forEach((ch, k) => { const f = F[ch] || F[0]; for (let i = 0; i < 15; i++) if (f[i] === "1") PK.R(g, x0 + k * 4 + i % 3, y + Math.floor(i / 3), 1, 1, col); });
  }
  makeBg() {
    // двор в духе «Игры в кальмара»: стены, расписанные небом и облаками, песочный пол, дерево за папой, фигуры ○△□
    const cv = PK.mk(320, 180), g = cv.getContext("2d"), R = PK.R, rnd = PK.rng(31);
    PK.gradV(g, 0, 0, 320, 112, ["#7ac0f0", "#a8d8f8", "#d8f0ff"]);
    for (let k = 0; k < 7; k++) { const x = Math.floor(rnd() * 300), y = 10 + Math.floor(rnd() * 70); PK.ell(g, x, y, 14, 5, "#ffffff"); PK.ell(g, x + 10, y - 3, 9, 5, "#ffffff"); PK.ell(g, x - 8, y + 1, 8, 4, "#f0f8ff"); }
    R(g, 0, 108, 320, 4, "#c8d8e8");                                    // стык стены и пола
    R(g, 0, 112, 320, 68, "#e8cf9a"); for (let i = 0; i < 700; i++) PK.P(g, Math.floor(rnd() * 320), 112 + Math.floor(rnd() * 68), rnd() < .5 ? "#dcc088" : "#f2dcae");
    // дерево за папой
    R(g, 296, 64, 6, 48, "#7a5a3a"); PK.ell(g, 299, 56, 18, 14, "#5a9a48"); PK.ell(g, 292, 50, 10, 8, "#6aaa58");
    // фигуры на стене
    g.save(); g.strokeStyle = "#f05a8a"; g.lineWidth = 2;
    g.beginPath(); g.arc(40, 30, 7, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(64, 37); g.lineTo(72, 23); g.lineTo(80, 37); g.closePath(); g.stroke();
    g.strokeRect(89, 23, 14, 14); g.restore();
    // старт и финиш
    for (let y = 114; y < 180; y += 4) { R(g, 30, y, 2, 2, "#f4f0e8"); R(g, 268, y, 2, 2, (y / 4) % 2 ? "#d8202c" : "#f4f0e8"); }
    StationArt.text(g, "START", 14, 172, "#8a6a4a"); StationArt.text(g, "FINISH", 254, 172, "#d8202c");
    return cv;
  }
  async intro() {
    await UI.say([
      { who: "papa", text: "Женя! А ну-ка, сыграем в игру. Помнишь, вы с братом смотрели сериал про кальмара?" },
      { who: "zhs", text: "Пап... только не говори, что ты кукла. И откуда у всех зелёные костюмы? Почему я номер 456?!" },
      { who: "papa", text: "Как в сериале! А я лучше куклы: я болельщик «Спартака»! Пока кричу — беги. Как обернусь — замри!" },
      { who: "le", text: "Я в деле! Марафонцы не сдаются." },
      { who: "na", text: "Ой, я на каблуках... Ну ладно!" }
    ]);
    await UI.rules("Красный свет, зелёный свет", [
      { keys: ["→"], icons: [this.kit.zh_summer_0], text: "Держи → (или D) — Женя бежит. Отпусти — стоит." },
      { icons: [this.papaBack], text: "Папа спиной кричит «МО-СКОВ-СКИЙ СПАР-…». В это время беги!" },
      { icons: [this.textures.get("pa_station_cheer").getSourceImage()], text: "На «ТАК!» папа оборачивается. Замри и не двигайся, пока он снова не отвернётся." },
      { text: "Двинулась, когда папа смотрит, — пара шагов назад. Добеги до красной линии!" }
    ]);
    this.state = "play"; this.cycle(); UI.goal("Беги, пока папа кричит! Замри на «ТАК!»");
  }
  // один круг: слоги кричалки (зелёный), потом папа смотрит (красный)
  async cycle() {
    if (this.state !== "play") return;
    this.light = "green"; this.syl = []; this.showChant();
    this.npcs.forEach(n => { n.f = .75 + Math.random() * .35; });   // у каждой свой темп на этот круг
    const speed = .75 + Math.random() * .55 + Math.min(.4, this.round++ * .06), base = [0, 360, 720, 1200, 1560];
    const words = ["МО-", "СКОВ-", "СКИЙ\u00a0", "СПАР-", "ТАК!"];
    for (let i = 0; i < 5; i++) {
      await World.wait(this, i ? (base[i] - base[i - 1]) / speed : 250);
      if (this.state !== "play") return;
      this.syl.push(words[i]); Sound.sfx("syl", i); this.showChant();
      if (i === 4) { this.light = "red"; this.graceT = 280; this.watchT = 1500 + Math.random() * 1200;
        this.npcs.forEach(n => { n.twitch = Math.random() < .2 ? .4 + Math.random() * 1 : 0; }); }
    }
  }
  // кричалка — HTML-плашка сверху (в пиксельном шрифте холста нет буквы Й)
  showChant() {
    const el = document.getElementById("banner");
    if (!this.syl.length || this.state === "done") { el.hidden = true; return; }
    el.className = "banner chant rl" + (this.light === "red" ? " red" : ""); el.hidden = false;
    el.innerHTML = '<div class="syl">' + this.syl.map(w => `<span>${w}</span>`).join("") + "</div>";
  }
  update(time, dtMs) {
    if (this.state !== "play" || UI.busy) return;
    const dt = Math.min(.05, dtMs / 1000), K = this.keys, run = K.RIGHT.isDown || K.D.isDown;
    const z = this.zh;
    z.moving = run; if (run) { z.x = Math.min(this.FINISH + 10, z.x + 40 * dt); z.t += dtMs; z.stepT = (z.stepT || 0) + dtMs; if (z.stepT > 230) { z.stepT = 0; Sound.sfx("step"); } }
    // соперницы: бегут чуть медленнее Жени (темп меняется каждый круг), на красный иногда не успевают замереть или дёргаются.
    // До красной линии добегают и останавливаются за ней — с поля не убегают.
    const LINE = this.FINISH + 8;
    this.npcs.forEach(n => {
      if (n.done) return;
      const step = () => { n.x = Math.min(LINE, n.x + n.sp * n.f * dt); n.t += dtMs; if (n.x >= LINE) this.npcDone(n); };
      if (this.light === "green") { n.react = .1 + Math.random() * .3; step(); }
      else if (this.light === "red") {
        if (n.react > 0) { n.react -= dt; step(); if (n.react <= 0 && !n.oops && Math.random() < .3) this.catchNpc(n); }
        else if (!n.oops && n.twitch > 0 && (n.twitch -= dt) <= 0) this.catchNpc(n);   // не выдержала и шевельнулась
      }
    });
    if (this.light === "red") {
      this.graceT -= dtMs; this.watchT -= dtMs;
      if (this.graceT <= 0 && run) return this.caughtZh();
      if (this.watchT <= 0) { this.light = "wait"; this.syl = []; this.showChant(); this.npcs.forEach(n => n.oops = false); this.time.delayedCall(250, () => this.cycle()); }
    }
    if (z.x >= this.FINISH) this.win();
  }
  catchNpc(n) {
    if (n.done) return;
    n.oops = true; n.x = Math.max(this.START, n.x - 30); Sound.sfx("wrong"); n.miss = (n.miss || 0) + 1;
    const L = n.name === "Лера" ? ["Папа: Игрок 067, Лера! Я всё видел! Назад!", "Папа: Лера, это не марафон! Замри!", "Папа: Опять Лера! Защитник, стоять!"]
      : ["Папа: Игрок 218, Нарина! Каблуки не оправдание!", "Папа: Нарина, назад! Я всё вижу!", "Папа: Нарина, Джан тебе не поможет!"];
    UI.toast(L[(n.miss - 1) % 3], 1500);
  }
  npcDone(n) {
    n.done = true; n.x = this.FINISH + 8;
    UI.toast(`${n.name} добежала! Женя, теперь твоя очередь!`, 2000);
  }
  async caughtZh() {
    this.state = "caught"; this.caught++; Sound.sfx("wrong"); this.cameras.main.shake(200, .006); this.flashT = 400;
    const back = 40; this.tweens.add({ targets: this.zh, x: Math.max(this.START, this.zh.x - back), duration: 500, ease: "Sine.easeOut" });
    await UI.say([{ who: "papa", text: ["Женя! Я всё вижу! Два шага назад!", "Шевельнулась! Назад, назад! Ха-ха!", "Дочка, замри как статуя! Ну-ка, ещё разок."][Math.min(2, this.caught - 1)] }]);
    if (await UI.offerSkip(this.caught, "эту игру")) { this.skipped = true; return this.win(); }
    this.state = "play"; this.cycle();
  }
  async win() {
    if (this.state === "done") return; this.state = "done"; UI.goal(""); Sound.sfx("done"); document.getElementById("banner").hidden = true;
    this.tweens.add({ targets: this.zh, x: this.FINISH + 14, duration: 500 });
    await World.wait(this, 600);
    await UI.say([
      { who: "papa", text: this.skipped ? "Ладно-ладно, засчитываю! Для любимой дочки правила не писаны." : "Добежала! Ни разу не дрогнула под взглядом болельщика «Спартака»!" },
      { who: "zhs", text: "Пап, это была самая громкая «Игра в кальмара» в истории." },
      { who: "papa", text: "Зато весело! МО-СКОВ-СКИЙ..." },
      { who: "le", text: "...СПАР-ТАК! Ой. Я что, теперь тоже болею за «Спартак»?" }
    ]);
    await UI.card("Красный свет, зелёный свет", "Игрок №456 — победитель ★", 2800);
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.time.delayedCall(950, () => this.scene.start("credits"));
  }
  draw(g, t) {
    const R = PK.R, s = t / 1000, src = k => this.textures.get(k).getSourceImage();
    g.drawImage(this.bg, 0, 0);
    // светофор-фонарь на стене
    R(g, 150, 8, 20, 12, "#2a2430"); PK.ell(g, 156, 14, 4, 4, this.light === "green" ? "#5ae05a" : "#2a4a2a"); PK.ell(g, 164, 14, 4, 4, this.light === "red" ? "#f04040" : "#4a2a2a");
    // папа (спиной или лицом)
    const facing = this.light === "red", papa = facing ? (this.flashT > 0 ? src("pa_station_cheer") : src("pa_home_idle")) : this.papaBack;
    g.save(); g.translate(296, 92); g.scale(2, 2); g.drawImage(papa, -8, 0); g.restore();
    if (facing) { const k = Math.floor(s * 6) % 2; R(g, 280, 84, 2, 2, k ? "#f04040" : "#ff8080"); R(g, 310, 84, 2, 2, k ? "#f04040" : "#ff8080"); }
    // соперницы и Женя (по глубине)
    const list = [...this.npcs.map(n => ({ y: n.y, draw: () => { const f = n.t && !n.done ? Math.floor(n.t / 130) % 2 : 0, im = this.kit[`${n.key}_${f}`]; g.drawImage(im, Math.round(n.x) - 8, n.y - im.height); this.num(g, n.num, n.x, n.y - im.height - 8, "#f4f0e8"); } })),
      { y: this.G, draw: () => { const f = this.zh.moving ? Math.floor(this.zh.t / 120) % 2 : 0, im = this.kit[`zh_summer_${f}`]; g.drawImage(im, Math.round(this.zh.x) - 8, this.G - im.height); this.num(g, "456", this.zh.x, this.G - im.height - 8, "#ffe070"); } }];
    list.sort((a, b) => a.y - b.y).forEach(o => o.draw());
    if (this.flashT > 0) { this.flashT -= 16; g.save(); g.globalAlpha = .25; R(g, 0, 0, 320, 180, "#f04040"); g.restore(); }
    // полоска прогресса
    const p = (this.zh.x - this.START) / (this.FINISH - this.START); R(g, 110, 4, 100, 3, "#3a3048"); R(g, 110, 4, Math.round(100 * Math.max(0, Math.min(1, p))), 3, "#f2c23a");
  }
}
