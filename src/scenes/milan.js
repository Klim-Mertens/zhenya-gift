/* Глава 1, часть 1: вокзал Милано Централе. Женя выходит из поезда в пуховике прямо в жару,
   Нарина и Джанлука её встречают, Нарина хвастается браслетом. */
"use strict";
class MilanScene extends Phaser.Scene {
  // у Джана рисуем только вид спереди, его используем для всех направлений
  static GI_FRAMES = { front: ["gi_front_0", "gi_front_1", "gi_front_2"], back: ["gi_front_0", "gi_front_1", "gi_front_2"], side: ["gi_front_1", "gi_front_2"], blink: "gi_blink" };
  constructor() { super("milan"); }
  create() {
    Save.store("milan"); Sound.play("summer"); UI.goal("");
    this.cameras.main.fadeIn(700, 0, 0, 0);
    const art = MilanoArt.centrale(), train = StationArt.create().train;
    this.sparkle = 0;
    World.backdrop(this, "mi_back", (g, t) => { art.back(g, t); g.drawImage(train, 20, 20); }, -1000);
    // блёстки браслета и капли пота «в пуховике» поверх всего
    World.backdrop(this, "mi_front", (g, t) => this.fx(g, t), 5000);
    const doorX = 20 + StationArt.DOOR_X + 8;
    this.na = World.npc(this, "na_front_0", "na_blink", doorX + 28, 110, .3);
    this.gi = World.npc(this, "gi_idle", "gi_blink", doorX + 48, 112, 1.4);
    this.zh = World.player(this, World.frameKeys("zh_winter"), doorX, 84);
    this.zh.blockers = [[0, 0, 320, 80], [72, 100, 36, 10], [16, 104, 20, 14], [264, 118, 46, 32], [118, 96, 4, 18], [178, 96, 4, 18], [doorX + 22, 106, 12, 6], [doorX + 42, 108, 12, 6], [0, 172, 320, 8], [0, 0, 4, 180]];
    this.zh.spr.setAlpha(0); this.zh.frozen = true;
    this.met = false; this.summer = false; const self = this;
    this.inter = World.interactions(this, this.zh, [
      { x: 288, y: 156, r: 18, label: "заглянуть в кафе", use: () => UI.say([
        { who: "gi", text: "Un caffè? Espresso! Капучино только утром, dopo pranzo — no, no, no!" },
        { who: "na", text: "Итальянское правило: капучино после обеда не пьют. Джан за это может обидеться." },
        { who: "zhs", text: "Запомню. Буду пить капучино тайно, по-русски." }]) },
      { x: 26, y: 122, r: 18, label: "посмотреть на лимонное дерево", use: () => UI.say([{ who: this.who(), text: "Настоящие лимоны растут прямо на вокзале! А у нас на вокзале растут только сугробы." }]) },
      { x: 152, y: 118, r: 18, label: "посмотреть на табличку", use: () => UI.say([{ who: this.who(), text: "Милано Централе. Двое суток, и я в Италии! Мама, наверное, уже третий раз пишет «ну как ты?»." }]) },
      { get x() { return self.naF ? self.naF.spr.x : doorX + 38; }, get y() { return self.naF ? self.naF.spr.y : 114; }, r: 20, label: "поговорить с Нариной и Джаном", enabled: () => this.met, use: () => this.chat() },
      { x: 314, y: 140, r: 16, label: "пойти к Дуомо", enabled: () => this.met, use: () => this.leave() }
    ]);
    this.chats = 0;
    this.time.delayedCall(800, () => this.arrive());
  }
  who() { return this.summer ? "zhs" : "zhw"; }
  fx(g, t) {
    if (!this.zh) return;
    const s = t / 1000;
    if (this.sparkle > 0) [[this.na.spr.x + 6, this.na.spr.y - 12], [this.gi.spr.x - 7, this.gi.spr.y - 14]].forEach(([sx, sy]) => {
      for (let i = 0; i < 6; i++) { const a = s * 3 + i, r = 3 + (i % 3) * 2, x = sx + Math.cos(a) * r, y = sy + Math.sin(a * 1.3) * r; if ((Math.floor(s * 8) + i) % 3) { PK.P(g, x, y, "#fff6a0"); PK.P(g, x + 1, y, "#f2c23a"); PK.P(g, x - 1, y, "#f2c23a"); PK.P(g, x, y - 1, "#f2c23a"); PK.P(g, x, y + 1, "#f2c23a"); } } });
    if (!this.summer && this.zh.spr.alpha > .5) { const sx = this.zh.spr.x, sy = this.zh.spr.y - 24;   // жарко в пуховике: капельки и пар
      for (let i = 0; i < 3; i++) { const ph = (s * .9 + i / 3) % 1; g.globalAlpha = 1 - ph; PK.P(g, sx - 7 + i * 7, sy + ph * 6, "#8ad0ff"); PK.P(g, sx - 7 + i * 7, sy + ph * 6 + 1, "#5ab0f0"); } g.globalAlpha = 1; }
  }
  async arrive() {
    Sound.sfx("door"); this.tweens.add({ targets: this.zh.spr, alpha: 1, duration: 300 });
    await World.wait(this, 500);
    await World.walkTo(this, this.zh, this.zh.spr.x, 104, 40);
    this.zh.face("side", false);
    await UI.say([
      { who: "na", text: "Женя-а-а! Наконец-то! Ты как доехала?" },
      { who: "zhw", text: "Отлично! Двое суток, три кроссворда и мамины бутерброды." },
      { who: "gi", text: "Ciao, Женя! При-вет! Как... де-ла?" },
      { who: "na", text: "Он неделю учил эту фразу. Очень гордится." },
      { who: "zhw", text: "Ciao, Джан! Дела отлично! Только почему-то очень жарко..." },
      { who: "na", text: "Женя. Ты в пуховике. И в шапке. Тут плюс тридцать!" },
      { who: "gi", text: "Mamma mia... La Siberia è arrivata!" },
      { who: "na", text: "Говорит: «Сибирь приехала». Иди переоденься, вон туалет, мы подождём." }
    ]);
    // переодевание: затемнение и летний наряд
    this.cameras.main.fadeOut(350, 255, 255, 255); await World.wait(this, 380);
    this.summer = true; this.zh.setFrames(World.frameKeys("zh_summer")); this.zh.face("side", false);
    Sound.sfx("done");
    this.cameras.main.fadeIn(450, 255, 255, 255); await World.wait(this, 500);
    await UI.say([
      { who: "zhs", text: "Вот, так гораздо лучше! Валенки, кстати, тоже со мной. Мама настояла." },
      { who: "gi", text: "Ва-лен-ки? Cosa sono?" },
      { who: "na", text: "Потом покажем, он упадёт. Ой, Жень, смотри, что у меня есть!" }
    ]);
    await this.bracelet();
    this.met = true; this.zh.frozen = false;   // после катсцены снова можно ходить
    UI.goal("Идём к Дуомо: выход справа");
  }
  async bracelet() {
    const cam = this.cameras.main, ns = this.na.spr;
    this.na.override = "na_show"; this.gi.override = "gi_show"; Sound.sfx("sparkle"); this.sparkle = 1;
    cam.pan((ns.x + this.gi.spr.x) / 2, ns.y - 16, 450, "Sine.easeInOut"); cam.zoomTo(2.5, 450, "Sine.easeInOut");
    await World.wait(this, 500);
    await UI.say([
      { who: "na", text: "Та-да! Парные браслеты! У меня и у Джана одинаковые. Настоящее золото!" },
      { who: "gi", text: "Sì! Uguali! Од-на-ко-вые!" },
      { who: "zhs", text: "Ого, какая красота! Вы теперь как команда. Блестите так, что из Коврова видно!" },
      { who: "gi", text: "Per la mia regina!" },
      { who: "na", text: "Он говорит: «для моей королевы». Ну всё, я растаяла." },
      { who: "zhs", text: "Джан, научишь таким словам Лоренцо?" },
      { who: "gi", text: "Лоренцо? Ah, Lorenzo è un bravo ragazzo! Ma io... più romantico!" },
      { who: "na", text: "Говорит, Лоренцо хороший парень, но он сам романтичнее. Не спорь с ним, это бесполезно!" }
    ]);
    this.sparkle = 0; this.na.override = null; this.gi.override = null;
    cam.pan(160, 90, 500, "Sine.easeInOut"); cam.zoomTo(1, 500, "Sine.easeInOut");
    await World.wait(this, 520);
    await UI.say([
      { who: "na", text: "План такой: гуляем к Дуомо, едим джелато, а потом к нам. Я сегодня делаю долму!" },
      { who: "gi", text: "E io — carbonara! Vera carbonara!" },
      { who: "na", text: "А он — карбонару. Настоящую, без сливок, это очень важно." }
    ]);
    // теперь друзья идут следом
    const nx = ns.x, ny = ns.y, gx = this.gi.spr.x, gy = this.gi.spr.y;
    this.na.spr.destroy(); this.gi.spr.destroy();
    this.naF = World.follower(this, World.frameKeys("na"), this.zh, nx, ny, 24);
    this.giF = World.follower(this, MilanScene.GI_FRAMES, this.zh, gx, gy, 46);
  }
  async chat() {
    const lines = [
      [{ who: "gi", text: "Женя! Ты... лю-бишь... пиц-ца?" }, { who: "zhs", text: "Очень!" }, { who: "gi", text: "Bene! Allora siamo amici!" }, { who: "na", text: "Всё, вы друзья. Это у него главный тест." }],
      [{ who: "na", text: "Я так рада, что ты приехала! Теперь будет с кем поболтать по-русски, а то я с Джаном уже говорю на смеси трёх языков." }, { who: "gi", text: "Sì, sì! Миксто!" }],
      [{ who: "gi", text: "Женя... Ру-сси-я... бор-щ? Buono?" }, { who: "zhs", text: "Очень буоно! Мама передала целую банку, вечером попробуешь." }, { who: "gi", text: "Evviva la mamma!" }, { who: "na", text: "«Да здравствует мама!» Он уже её любит, а они даже не знакомы."}]
    ];
    await UI.say(lines[this.chats++ % lines.length]);
  }
  leave() {
    this.zh.frozen = true; UI.goal("");
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(650, () => this.scene.start("duomo"));
  }
  update(time, dt) {
    this.zh.update(dt); this.inter.update();
    if (this.naF) { this.naF.update(dt); this.giF.update(dt); } else { this.na.update(); this.gi.update(); }
    if (this.met && this.zh.spr.x > 312 && !this.zh.frozen) this.leave();
  }
}
