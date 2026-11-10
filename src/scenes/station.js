/* Пролог, часть 2: зимний вокзал. Прощание с мамой и папой, Женя садится в поезд,
   поезд уходит, папа кричит «МО-СКОВ-СКИЙ СПАР-ТАК!!!». */
"use strict";
class StationScene extends Phaser.Scene {
  constructor() { super("station"); }
  create() {
    Save.store("station"); Sound.play("winter"); UI.goal("");
    this.cameras.main.fadeIn(600, 0, 0, 0);
    const art = StationArt.create();
    this.trainX = 20; this.zhInTrain = false;
    // задний план, поезд, снег спереди
    World.backdrop(this, "st_back", (g, t) => {
      art.back(g, t); g.drawImage(art.train, Math.round(this.trainX), 20);
      if (this.zhInTrain) { const wx = Math.round(this.trainX) + StationArt.DOOR_X + 2, src = this.textures.get("zh_winter_front_0").getSourceImage(); g.drawImage(src, 2, 0, 12, 12, wx, 33, 12, 12); }
    }, -1000);
    World.backdrop(this, "st_front", (g, t) => art.front(g, t), 5000);
    const doorX = this.trainX + StationArt.DOOR_X + 8;
    this.mama = World.npc(this, "ma_station_idle", "ma_station_blink", doorX - 30, 104, .5);
    this.papa = World.npc(this, "pa_station_idle", "pa_station_blink", doorX - 12, 106, 1.6);
    this.zh = World.player(this, World.frameKeys("zh_winter"), 36, 140);
    this.zh.face("side", false);
    this.zh.blockers = [[0, 0, 320, 80], [28, 92, 48, 16], [282, 136, 38, 36], [0, 168, 320, 12], [0, 0, 4, 180], [316, 0, 4, 180], [108, 136, 14, 14], [146, 128, 8, 8],
      [doorX - 37, 100, 14, 6], [doorX - 19, 102, 14, 6]];
    // чемодан катится за Женей
    this.makeBag();
    this.bag = this.add.image(0, 0, "suit_closed_st").setOrigin(.5, 1);
    this.said = false;
    this.inter = World.interactions(this, this.zh, [
      { x: doorX - 21, y: 108, r: 26, label: "попрощаться с родителями", enabled: () => !this.said, use: () => this.farewell() },
      { x: doorX, y: 84, r: 16, label: "сесть в поезд", enabled: () => this.said, use: () => this.board() },
      { x: 52, y: 110, r: 18, label: "посмотреть на скамейку", use: () => UI.say([{ who: "zhw", text: "Скамейка вся в снегу. Летом мы тут ели мороженое и ждали электричку." }]) },
      { x: 151, y: 136, r: 14, label: "посмотреть на часы", use: () => UI.say([{ who: "zhw", text: "18:40. Поезд по расписанию. Мама наверняка уже проверила." }]) }
    ]);
    this.time.delayedCall(700, () => UI.goal("Подойди к маме и папе"));
  }
  makeBag() {
    if (this.textures.exists("suit_closed_st")) return;
    const cv = PK.mk(14, 14), g = cv.getContext("2d"), R = PK.R;
    R(g, 1, 3, 12, 10, "#d8a040"); R(g, 1, 3, 12, 1, "#f0c060"); R(g, 4, 0, 6, 3, "#5a3a24"); R(g, 5, 1, 4, 1, "#d8a040");
    R(g, 3, 6, 2, 3, "#3a8a4a"); R(g, 5, 6, 2, 3, "#c8303a"); R(g, 8, 6, 4, 1, "#f4ece0"); R(g, 8, 7, 4, 1, "#3a5ab0"); R(g, 8, 8, 4, 1, "#c8303a");
    PK.outline(cv, RK.OL); this.textures.addCanvas("suit_closed_st", cv);
  }
  async farewell() {
    this.said = true; UI.goal("");
    const W = (who, text) => ({ who, text });
    await UI.say([
      W("mamaw", "Ну вот и всё... Женечка, мы тебя очень-очень любим."),
      W("papaw", "Очень. Будь там осторожна, ладно? Смотри по сторонам."),
      W("mamaw", "Проверь документы. Паспорт, билет... Всё на месте?"),
      W("zhw", "Мам, всё на месте. Даже валенки."),
      W("mamaw", "И не забывай обедать вовремя! Борщ в чемодане, сверху."),
      W("papaw", "Позвони, как доедешь. И если кто обидит, сразу звони мне."),
      W("mamaw", "Тепло одевайся. И спи нормально, а не до трёх ночи."),
      W("zhw", "Я вас тоже очень люблю. Обнимаю! Всё, бегу, а то без меня уедет.")
    ]);
    UI.goal("Садись в поезд");
  }
  async board() {
    const p = this.zh, doorX = this.trainX + StationArt.DOOR_X + 8;
    UI.goal(""); p.frozen = true;
    await World.walkTo(this, p, doorX, 84, 45);
    p.face("back"); await World.wait(this, 250);
    Sound.sfx("door"); this.tweens.add({ targets: [p.spr, this.bag], alpha: 0, duration: 300 });
    await World.wait(this, 500);
    this.zhInTrain = true;
    await World.wait(this, 500);
    Sound.sfx("whistle");
    await World.wait(this, 900);
    // поезд трогается, мама машет, папа поднимает шарф
    this.departing = true; this.depT = 0;
    this.mama.override = "ma_station_wave";
    await World.wait(this, 1300);
    this.papa.override = "pa_station_cheer";
    Sound.stopMusic(); Sound.sfx("chant");
    this.cameras.main.shake(1600, .006);
    const syl = ["МО-", "СКОВ-", "СКИЙ", "СПАР-", "ТАК!!!"];
    const el = document.getElementById("banner"); el.className = "banner chant"; el.hidden = false; el.innerHTML = "<div></div>";
    const box = el.firstChild; const delays = [0, 320, 640, 1080, 1400];
    syl.forEach((s, i) => this.time.delayedCall(delays[i], () => { const sp = document.createElement("span"); sp.textContent = s; box.appendChild(sp); if (i === 2) box.appendChild(document.createElement("br")); }));
    await World.wait(this, 3200);
    el.hidden = true;
    await World.wait(this, 1200);
    Save.store("ride");
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.time.delayedCall(950, () => this.scene.start("ride"));
  }
  update(time, dt) {
    this.zh.update(dt); this.mama.update(); this.papa.update(); this.inter.update();
    // чемодан справа от Жени, чуть позади
    const s = this.zh.spr; this.bag.setPosition(s.x + (s.flipX ? 9 : -9), s.y).setDepth(s.y - 1);
    if (this.zh.dir === "back") this.bag.setPosition(s.x + 9, s.y);
    if (this.departing) { this.depT += dt / 1000; this.trainX = 20 + 6 * this.depT * this.depT; if (this.mama.override) this.mama.override = Math.floor(time / 250) % 2 ? "ma_station_wave" : "ma_station_idle"; }
  }
}
