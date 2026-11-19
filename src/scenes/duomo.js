/* Глава 1, часть 2: площадь Дуомо. Голуби, джелато и общее селфи у собора (как на их фото). */
"use strict";
class DuomoScene extends Phaser.Scene {
  constructor() { super("duomo"); }
  create() {
    Save.store("duomo"); Sound.play("piazza"); UI.goal("");
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.art = MilanoArt.duomo();
    World.backdrop(this, "du_back", (g, t) => this.art.back(g, t), -1000);
    // слой селфи-полароида поверх всего
    this.photo = false;
    this.photoImg = World.backdrop(this, "du_photo", (g, t) => { if (this.photo) this.drawPhoto(g, t); }, 9000).setVisible(false);
    this.zh = World.player(this, World.frameKeys("zh_summer"), 14, 150);
    this.zh.face("side", false);
    this.zh.blockers = [[0, 0, 320, 100], [252, 112, 48, 38], [298, 112, 6, 38], [59, 138, 4, 6], [123, 138, 4, 6], [195, 138, 4, 6], [0, 174, 320, 6], [0, 0, 2, 180]];
    this.naF = World.follower(this, World.frameKeys("na"), this.zh, 4, 150, 24);
    this.giF = World.follower(this, MilanScene.GI_FRAMES, this.zh, -8, 152, 46);
    this.did = { gelato: false, selfie: false };
    this.inter = World.interactions(this, this.zh, [
      { x: 276, y: 156, r: 20, label: "купить джелато", task: "джелато для Джана", enabled: () => !this.did.gelato, use: () => this.gelato() },
      { x: 160, y: 112, r: 18, label: "сделать селфи у собора", enabled: () => !this.did.selfie, use: () => this.selfie() },
      { x: 28, y: 108, r: 20, label: "посмотреть на галерею", task: "галерея с быком", use: () => UI.say([
        { who: "na", text: "Это галерея Виктора Эммануила. Там на полу мозаика с быком. Говорят, если покрутиться на пятке, обязательно вернёшься в Милан." },
        { who: "zhs", text: "Тогда я буду крутиться, пока голова не закружится!" },
        { who: "gi", text: "Tre volte! Три... раза!" }]) },
      { x: 310, y: 164, r: 16, label: "пойти к Нарине домой", enabled: () => this.did.selfie, use: () => this.leave() }
    ]);
    this.flapCd = 0;
    this.time.delayedCall(700, async () => {
      await UI.say([
        { who: "zhs", text: "Ва-а-ау... Он же огромный! И белый, как торт!" },
        { who: "na", text: "Дуомо! Его строили почти шестьсот лет. Наверху золотая Мадоннина, видишь?" },
        { who: "gi", text: "Il Duomo! Bellissimo, no? Как... Кремль, sì?" },
        { who: "zhs", text: "Почти! Только голубей тут явно больше." }
      ]);
      this.updGoal();
    });
  }
  updGoal() {
    if (!this.did.selfie) UI.goal(this.did.gelato ? "Сделай селфи у собора" : "Погуляй: джелато у киоска и селфи у собора");
    else UI.goal(this.did.gelato ? "Идём к Нарине: выход справа" : "Можно купить джелато или идти к Нарине (справа)");
  }
  async gelato() {
    this.did.gelato = true; this.zh.frozen = true;
    await UI.say([
      { who: "zhs", text: "Мне фисташковое, пожалуйста! То есть... pistacchio, per favore!" },
      { who: "na", text: "Ого, ты уже говоришь по-итальянски!" }
    ]);
    Sound.sfx("pick");
    this.giF.override = "gi_wide";
    await UI.say([
      { who: "na", text: "Джан. Хватит так смотреть на чужое мороженое." },
      { who: "gi", text: "Io? Niente! Ну... чу-чуть?" },
      { who: "zhs", text: "Держи, попробуй!" }
    ]);
    this.giF.override = null;
    await UI.say([
      { who: "gi", text: "Mmm! Буо-но! Спа-си-бо, Женя!" },
      { who: "na", text: "Всё, теперь он твой лучший друг навсегда." }
    ]);
    UI.toast("Джелато съедено! ★");
    this.zh.frozen = false; this.updGoal();
  }
  // ---------- мини-игра «Селфи у Дуомо» ----------
  // Видоискатель двигается стрелками; сцена живая: Джан отходит к киоску, Нарина пританцовывает, голубь гуляет.
  // Пробел — снимок. Нужно, чтобы в кадр попали Женя, Нарина, Джан и голубь. После 3 неудачных снимков фото делает Нарина.
  async selfie() {
    this.did.selfie = true; this.zh.frozen = true; UI.goal("");
    await UI.say([
      { who: "na", text: "Стоп! Надо сделать фото. Все вместе, Дуомо сзади!" },
      { who: "gi", text: "Sì! Foto! E... il piccione! Голубь тоже!" },
      { who: "na", text: "Джан хочет, чтобы в кадре был голубь. Это его любимая птица. Женя, держи телефон!" }
    ]);
    // расставляем всех у собора
    const zs = this.zh.spr; this.tweens.add({ targets: zs, x: 150, y: 146, duration: 500 }); this.zh.face("front");
    this.naF.active = false; this.giF.active = false;
    this.tweens.add({ targets: this.naF.spr, x: 132, y: 146, duration: 500 }); this.tweens.add({ targets: this.giF.spr, x: 170, y: 148, duration: 500 });
    await World.wait(this, 550); this.naF.dir = this.giF.dir = "front"; this.naF.spr.setFlipX(false); this.giF.spr.setFlipX(false);
    const pig = this.pigCv || (this.pigCv = (() => { const c = PK.mk(10, 8), g = c.getContext("2d"), R = PK.R;
      R(g, 1, 3, 6, 3, "#8a8a98"); R(g, 6, 1, 3, 3, "#6a6a78"); PK.P(g, 8, 2, "#2a1a14"); R(g, 9, 2, 1, 1, "#e8902a"); R(g, 2, 3, 3, 1, "#b8b8c8"); R(g, 6, 4, 2, 1, "#7ab0a0");
      R(g, 3, 6, 1, 2, "#e8902a"); R(g, 5, 6, 1, 2, "#e8902a"); R(g, 0, 4, 1, 2, "#6a6a78"); PK.outline(c, "#2a2430"); return c; })());
    await UI.rules("Селфи у Дуомо", [
      { keys: ["←", "↑", "↓", "→"], text: "Двигай рамку видоискателя стрелками." },
      { icons: [this.textures.get("na_front_0").getSourceImage(), this.textures.get("zh_summer_front_0").getSourceImage(), this.textures.get("gi_idle").getSourceImage(), pig], text: "В кадр должны попасть Нарина, Женя, Джан и голубь. Сверху видно, кто уже в кадре." },
      { keys: ["Пробел"], text: "Сделать снимок. Лови момент: Джан всё время отходит к киоску, а голубь гуляет где хочет!" }
    ]);
    this.sm = { x: 70, y: 74, w: 104, h: 68, t: 0, tries: 0, pig: { x: 220, y: 158, vx: -14, hop: 0 }, ok: {} };
    this.vfKeys = this.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D");
    this.vfLayer = World.backdrop(this, "du_vf", (g, t) => { if (this.sm) this.drawVF(g, t); }, 8000);
    await new Promise(res => {
      this.smDone = res;
      this.smKey = e => { if (e.code === "Space" && this.sm && !this.sm.busy && !UI.busy) { e.preventDefault(); this.shoot(); } };
      window.addEventListener("keydown", this.smKey);
      this.events.once("shutdown", () => window.removeEventListener("keydown", this.smKey));
    });
    window.removeEventListener("keydown", this.smKey);
    // полароид
    this.photo = true; this.photoT = this.time.now; this.photoImg.setVisible(true);
    await World.wait(this, 900);
    await UI.say([
      { who: "zhs", text: this.sm.helped ? "Нарина, ты гений фотографии! Все в кадре, даже голубь." : "Идеально! Нарина с губками, Джан сияет, голубь позирует, я счастливая." },
      { who: "gi", text: "Il piccione! Bravissima!" },
      { who: "na", text: "Отправь маме с папой! Пусть видят, что ты в надёжных руках." }
    ]);
    this.photo = false; this.photoImg.setVisible(false); this.sm = null; this.vfLayer.setVisible(false); UI.goal("");
    this.naF.active = true; this.giF.active = true; this.naF.reset(); this.giF.reset();
    UI.toast("Фото у Дуомо ★");
    await UI.say([{ who: "na", text: "Ну всё, поехали к нам. Долма сама себя не завернёт!" }]);
    this.zh.frozen = false; this.updGoal();
  }
  // кто сейчас в кадре
  inFrame() {
    const m = this.sm, box = (x, y, w, h) => x - w / 2 >= m.x && x + w / 2 <= m.x + m.w && y - h >= m.y && y <= m.y + m.h;
    return { na: box(this.naF.spr.x, this.naF.spr.y - 2, 12, 24), zh: box(this.zh.spr.x, this.zh.spr.y - 2, 12, 24), gi: box(this.giF.spr.x, this.giF.spr.y - 2, 12, 27), pig: box(m.pig.x, m.pig.y, 10, 8) };
  }
  async shoot() {
    const m = this.sm; m.busy = true; const ok = this.inFrame();
    Sound.sfx("shutter"); this.cameras.main.flash(180, 255, 255, 255); await World.wait(this, 250);
    if (ok.na && ok.zh && ok.gi && ok.pig) { this.pigeonIn = true; m.busy = false; this.smDone(); return; }
    m.tries++;
    const miss = !ok.gi ? "Джан ушёл из кадра, он опять смотрит на джелато!" : !ok.pig ? "Без голубя не считается! Джан расстроен." : !ok.na ? "Нарину обрезало! Она такое не простит." : "А где ты сама? Это же селфи!";
    if (m.tries >= 3) {
      await UI.say([{ who: "na", text: miss }, { who: "na", text: "Дай-ка я! Джан, стой смирно. Голубь... ну, как получится. Три, два, один!" }]);
      Sound.sfx("shutter"); this.cameras.main.flash(180, 255, 255, 255); m.helped = true; this.pigeonIn = true; await World.wait(this, 300); m.busy = false; this.smDone(); return;
    }
    await UI.say([{ who: m.tries === 1 ? "na" : "gi", text: m.tries === 1 ? miss : "Ancora! Ещё... раз!" }]);
    m.busy = false;
  }
  drawVF(g, t) {
    const m = this.sm, R = PK.R, s = t / 1000, ok = this.inFrame(), all = ok.na && ok.zh && ok.gi && ok.pig;
    // голубь
    const pg = m.pig, hop = Math.max(0, Math.sin(pg.hop * 10)) * 2;
    g.save(); if (pg.vx > 0) { g.translate(Math.round(pg.x) + 5, 0); g.scale(-1, 1); g.drawImage(this.pigCv, 0, Math.round(pg.y - 8 - hop)); } else g.drawImage(this.pigCv, Math.round(pg.x) - 5, Math.round(pg.y - 8 - hop)); g.restore();
    // затемнение вокруг рамки
    g.save(); g.globalAlpha = .45; g.fillStyle = "#0d0b12";
    g.fillRect(0, 0, 320, m.y); g.fillRect(0, m.y + m.h, 320, 180 - m.y - m.h); g.fillRect(0, m.y, m.x, m.h); g.fillRect(m.x + m.w, m.y, 320 - m.x - m.w, m.h); g.restore();
    // уголки рамки
    const c = all ? "#7af07a" : "#f4f0e8", L = 8, x0 = Math.round(m.x), y0 = Math.round(m.y), x1 = x0 + m.w - 1, y1 = y0 + m.h - 1;
    [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([x, y, dx, dy]) => { R(g, dx > 0 ? x : x - L + 1, y, L, 1, c); R(g, x, dy > 0 ? y : y - L + 1, 1, L, c); });
    R(g, x0 + m.w / 2 - 2, y0 + m.h / 2, 5, 1, "rgba(255,255,255,.5)"); R(g, x0 + m.w / 2, y0 + m.h / 2 - 2, 1, 5, "rgba(255,255,255,.5)");
    if (Math.floor(s * 2) % 2) PK.ell(g, x0 + 6, y0 + 6, 2, 2, "#e83a3a");
    if (all) StationArt.text(g, "OK!", x1 - 16, y0 + 3, "#7af07a");
  }
  // Полароид: кусочек площади с собором и три героя крупно
  drawPhoto(g, t) {
    const R = PK.R, OL = RK.OL, k = Math.min(1, (t - this.photoT) / 400);
    g.globalAlpha = .6 * k; R(g, 0, 0, 320, 180, "#140c10"); g.globalAlpha = 1;
    const fw = 136, fh = 112, fx = 92, fy = Math.round(8 + (1 - k) * 30), px = fx + 7, py = fy + 7, pw = fw - 14, ph = 82;
    R(g, fx + 3, fy + 3, fw, fh, "rgba(0,0,0,.35)"); R(g, fx, fy, fw, fh, "#fbf8f0"); RK.box(g, fx, fy, fw, fh, OL);
    // фон снимка: площадь и собор
    if (!this.bgSnap) { const c = PK.mk(320, 180); this.art.back(c.getContext("2d"), 0); this.bgSnap = c; }
    g.drawImage(this.bgSnap, 160 - pw / 4, 6, pw / 2, ph / 2, px, py, pw, ph);
    // герои ×3: Нарина (поцелуйчик), Женя, Джан в очках
    const src = key => this.textures.get(key).getSourceImage(), sc = 3, cw = 38;
    [["na_front_0", px + 2, 22], ["zh_summer_front_0", px + 2 + cw, 22], ["gi_idle", px + 2 + cw * 2, 25]].forEach(([key, x, h]) => g.drawImage(src(key), 0, 0, 16, h, x, py + ph - h * sc + 2, 16 * sc, h * sc));
    // губки Нарины «уточкой»
    R(g, px + 2 + 7 * sc, py + ph - 22 * sc + 2 + 11 * sc, 2 * sc, 2 * sc, "#d84a5a");
    if (this.pigeonIn && this.pigCv) g.drawImage(this.pigCv, 0, 0, 10, 8, px + pw - 26, py + ph - 18, 20, 16);
    RK.box(g, px - 1, py - 1, pw + 2, ph + 2, "#c8c0b0");
    StationArt.text(g, "MILANO", fx + fw / 2 - StationArt.textW("MILANO", 2) / 2, fy + fh - 17, "#3a5ab0", 2);
  }
  updSelfie(dt) {
    const m = this.sm, k = this.vfKeys, d = dt / 1000; if (!m || UI.busy) return;
    m.t += d;
    const vx = ((k.RIGHT.isDown || k.D.isDown) ? 1 : 0) - ((k.LEFT.isDown || k.A.isDown) ? 1 : 0), vy = ((k.DOWN.isDown || k.S.isDown) ? 1 : 0) - ((k.UP.isDown || k.W.isDown) ? 1 : 0);
    m.x = Math.max(0, Math.min(320 - m.w, m.x + vx * 80 * d)); m.y = Math.max(0, Math.min(180 - m.h, m.y + vy * 80 * d));
    // Джан медленно уходит к киоску и возвращается, Нарина пританцовывает
    this.giF.spr.x = 170 + Math.max(0, Math.sin(m.t * .5)) * 46; this.giF.spr.setFlipX(Math.cos(m.t * .5) < 0 && Math.sin(m.t * .5) > .05);
    this.naF.spr.x = 132 + Math.sin(m.t * 1.3) * 5;
    // голубь гуляет и иногда меняет направление
    const pg = m.pig; pg.x += pg.vx * d; pg.hop += d;
    m.gt = (m.gt || 0) - dt; if (m.gt <= 0) { m.gt = 150; const ok = this.inFrame(), f = (n, v) => `${n} ${v ? "✓" : "✗"}`;
      UI.goal(`В кадре: ${f("Нарина", ok.na)} · ${f("Женя", ok.zh)} · ${f("Джан", ok.gi)} · ${f("голубь", ok.pig)} · Пробел — снимок`); }
    if (pg.x < 96 || pg.x > 236 || Math.random() < d * .25) pg.vx = (pg.x < 96 ? 1 : pg.x > 236 ? -1 : (Math.random() < .5 ? -1 : 1)) * (10 + Math.random() * 12);
  }
  leave() {
    this.zh.frozen = true; UI.goal("");
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(650, () => this.scene.start("transit", { route: "car", next: "kitchen" }));
  }
  update(time, dt) {
    if (this.sm) this.updSelfie(dt);
    this.zh.update(dt); this.naF.update(dt); this.giF.update(dt); this.inter.update();
    // голуби разлетаются, когда к ним подходишь
    this.flapCd -= dt;
    const before = this.art.pigeons.filter(p => p.fly).length;
    this.art.scare(this.zh.spr.x, this.zh.spr.y - 3);
    if (this.art.pigeons.filter(p => p.fly).length > before && this.flapCd <= 0) { Sound.sfx("flap"); this.flapCd = 500; }
    if (this.did.selfie && this.zh.spr.x > 314 && !this.zh.frozen) this.leave();
  }
}
