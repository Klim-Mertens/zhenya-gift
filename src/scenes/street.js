/* Переход главы 2 → 3: Женя и Лера идут вечером по набережной Навильи к студии Даны.
   По дороге — обещанное фисташковое джелато (по желанию). Вход в студию — дверь справа. */
"use strict";
class StreetScene extends Phaser.Scene {
  constructor() { super("street"); }
  create() {
    Save.store("street"); Sound.play("centrale"); UI.goal(""); UI.hint("");
    this.cameras.main.fadeIn(700, 0, 0, 0);
    World.backdrop(this, "nav_bg", NavigliArt.make(), -1000);
    this.zh = World.player(this, World.frameKeys("zh_summer"), 16, 124);
    this.zh.face("side", false); this.zh.frozen = true;
    // набережная: сверху дома (кроме двери студии), снизу перила; киоск — препятствие
    this.zh.blockers = [[0, 0, 274, 104], [298, 0, 22, 104], [274, 0, 24, 96], [90, 0, 34, 110], [0, NavigliArt.RAIL - 6, 320, 40], [0, 0, 2, 180], [318, 0, 2, 180]];
    this.leF = World.follower(this, World.frameKeys("le_kit"), this.zh, 4, 126, 22);
    this.gelato = false;
    this.inter = World.interactions(this, this.zh, [
      { x: 107, y: 122, r: 24, label: "взять джелато", enabled: () => !this.gelato, use: () => this.buyGelato() },
      { x: 286, y: 106, r: 22, label: "войти в студию Даны", use: () => this.enter() },
      { x: 200, y: 136, r: 18, label: "посмотреть на канал", use: () => UI.say([
        { who: "zhs", text: "Какая красота! Огоньки прямо в воде отражаются." },
        { who: "le", text: "Это Навильи, старые каналы. По ним раньше возили мрамор для Дуомо." }]) }
    ]);
    this.time.delayedCall(800, async () => {
      await UI.say([
        { who: "le", text: "Ну что, чемпионка, как и обещала: джелато с меня! Киоск прямо по пути." },
        { who: "zhs", text: "Ноги после футбола гудят... Но ради фисташкового я дойду куда угодно." },
        { who: "le", text: "А потом к Дане! Студия в конце набережной, где розовая вывеска." }
      ]);
      this.zh.frozen = false; this.updGoal();
    });
  }
  updGoal() { UI.goal(this.gelato ? "Иди к студии Даны: дверь с розовой вывеской справа" : "Джелато у киоска или сразу к студии Даны (справа)"); }
  async buyGelato() {
    this.gelato = true; this.zh.frozen = true; Sound.sfx("pick");
    await UI.say([
      { who: "le", text: "Due pistacchio, per favore! Два фисташковых — победительнице и проигравшей." },
      { who: "zhs", text: "Мм! Вкуснее победы только мороженое после победы." },
      { who: "le", text: "Не зазнавайся! В следующий раз я тебе пять голов забью." }
    ]);
    UI.toast("Фисташковое джелато ★", 1600); this.zh.frozen = false; this.updGoal();
  }
  async enter() {
    this.zh.frozen = true; UI.goal("");
    await UI.say([
      { who: "le", text: "Пришли! Дана, наверное, уже включила музыку. Слышишь бочку?" },
      { who: "zhs", text: "Слышу! Ноги сами в пляс пошли." }
    ]);
    Sound.sfx("door");
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(650, () => this.scene.start("studio"));
  }
  update(time, dt) { this.zh.update(dt); this.leF.update(dt); this.inter.update(); }
}
