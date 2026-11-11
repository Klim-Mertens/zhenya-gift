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
      { x: 276, y: 156, r: 20, label: "купить джелато", enabled: () => !this.did.gelato, use: () => this.gelato() },
      { x: 160, y: 112, r: 18, label: "сделать селфи у собора", enabled: () => !this.did.selfie, use: () => this.selfie() },
      { x: 28, y: 108, r: 20, label: "посмотреть на галерею", use: () => UI.say([
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
  async selfie() {
    this.did.selfie = true; this.zh.frozen = true; UI.goal("");
    await UI.say([
      { who: "na", text: "Стоп! Надо сделать фото. Все вместе, Дуомо сзади!" },
      { who: "gi", text: "Sì! Foto! Io... улыбка!" },
      { who: "na", text: "Три, два, один... Cheese!" }
    ]);
    Sound.sfx("shutter");
    this.cameras.main.flash(200, 255, 255, 255);
    await World.wait(this, 250);
    this.photo = true; this.photoT = this.time.now; this.photoImg.setVisible(true);
    await World.wait(this, 900);
    await UI.say([
      { who: "zhs", text: "Идеально! Нарина с губками, Джан сияет, я счастливая." },
      { who: "na", text: "Отправь маме с папой! Пусть видят, что ты в надёжных руках." }
    ]);
    this.photo = false; this.photoImg.setVisible(false);
    UI.toast("Фото добавлено в альбом ★");
    await UI.say([{ who: "na", text: "Ну всё, поехали к нам. Долма сама себя не завернёт!" }]);
    this.zh.frozen = false; this.updGoal();
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
    RK.box(g, px - 1, py - 1, pw + 2, ph + 2, "#c8c0b0");
    StationArt.text(g, "MILANO", fx + fw / 2 - StationArt.textW("MILANO", 2) / 2, fy + fh - 17, "#3a5ab0", 2);
  }
  leave() {
    this.zh.frozen = true; UI.goal("");
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(650, () => this.scene.start("kitchen"));
  }
  update(time, dt) {
    this.zh.update(dt); this.naF.update(dt); this.giF.update(dt); this.inter.update();
    // голуби разлетаются, когда к ним подходишь
    this.flapCd -= dt;
    const before = this.art.pigeons.filter(p => p.fly).length;
    this.art.scare(this.zh.spr.x, this.zh.spr.y - 3);
    if (this.art.pigeons.filter(p => p.fly).length > before && this.flapCd <= 0) { Sound.sfx("flap"); this.flapCd = 500; }
    if (this.did.selfie && this.zh.spr.x > 314 && !this.zh.frozen) this.leave();
  }
}
