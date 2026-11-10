/* Пролог, часть 1: квартира родителей. Женя ходит, говорит с мамой и папой, собирает чемодан и выходит на вокзал. */
"use strict";
class HomeScene extends Phaser.Scene {
  constructor() { super("home"); }
  init(data) { this.packed = !!(data && data.packed); }
  create() {
    Save.store("home"); Sound.play("winter"); UI.goal("");
    this.cameras.main.fadeIn(500, 0, 0, 0);
    const draw = HomeArt.create();
    World.backdrop(this, "home_bg", draw);
    // чемодан посреди ковра: открытый пустой или закрытый собранный
    this.suitcase = this.add.image(166, 130, this.suitcaseTex(this.packed)).setOrigin(.5, 1).setDepth(130);
    this.mama = World.npc(this, "ma_home_idle", "ma_home_blink", 104, 112, .7);
    this.papa = World.npc(this, "pa_home_idle", "pa_home_blink", 246, 92, 1.9);
    const outfit = this.packed ? "zh_winter" : "zh_home";
    this.zh = World.player(this, World.frameKeys(outfit), this.packed ? 166 : 156, this.packed ? 100 : 86);
    this.zh.blockers = HomeArt.BLOCKERS.concat([[156, 118, 22, 14], [96, 106, 16, 8], [238, 86, 16, 8]]);
    const D = HomeArt.DOOR;
    this.inter = World.interactions(this, this.zh, [
      { x: 104, y: 116, r: 22, label: "поговорить с мамой", use: () => this.talkMama() },
      { x: 246, y: 96, r: 22, label: "поговорить с папой", use: () => this.talkPapa() },
      { x: 166, y: 134, r: 18, label: () => this.packed ? "посмотреть на чемодан" : "открыть чемодан", use: () => this.packed ? UI.say([{ who: "zhw", text: "Чемодан собран. Тяжёлый, как будто мама положила туда полкухни." }]) : this.talkMama() },
      { x: 292, y: 68, r: 20, label: "посмотреть телевизор", use: () => UI.say([{ who: this.zhWho(), text: "По телевизору футбол. Спартак в красном, конечно. Папа не пропускает ни одного матча." }]) },
      { x: 54, y: 78, r: 26, label: "посмотреть на ковёр", use: () => UI.say([{ who: this.zhWho(), text: "Тот самый ковёр на стене. В детстве я искала в узорах лица и драконов." }]) },
      { x: 52, y: 144, r: 20, label: "посмотреть на стол", use: () => UI.say([{ who: this.zhWho(), text: "Блины с икрой, мамино фирменное. Утащу один на дорожку." }, { who: "mama", text: "Я всё вижу! Ешь, ешь, в дорогу надо поесть." }]) },
      { x: 300, y: 160, r: 22, label: "посмотреть на ёлку", use: () => UI.say([{ who: this.zhWho(), text: "Ёлка уже стоит, хотя до Нового года ещё далеко. Гирлянда мигает так же, как в детстве." }]) },
      { x: 158, y: 70, r: 18, label: "посмотреть в окно", use: () => UI.say([{ who: this.zhWho(), text: "Снег, минус двадцать. А в Италии сейчас, говорят, совсем по-другому." }]) },
      { x: D.x + D.w / 2, y: 70, r: 18, label: () => this.packed ? "выйти на вокзал" : "выйти", use: () => this.leave() }
    ]);
    if (!this.packed) this.time.delayedCall(700, () => this.intro());
    else this.time.delayedCall(600, () => this.afterPack());
  }
  zhWho() { return this.packed ? "zhw" : "zh"; }
  suitcaseTex(closed) {
    const key = closed ? "suit_closed" : "suit_open";
    if (!this.textures.exists(key)) {
      const cv = PK.mk(28, 24), g = cv.getContext("2d"), R = PK.R, OL = RK.OL;
      if (closed) { RK.block(g, 1, 6, 26, 6, 12, { top: "#d8a040", front: "#c48a32" }); R(g, 9, 3, 10, 3, "#5a3a24"); RK.box(g, 9, 2, 10, 4, OL);
        R(g, 4, 14, 3, 4, "#3a8a4a"); R(g, 7, 14, 3, 4, "#f4ece0"); R(g, 10, 14, 3, 4, "#c8303a"); R(g, 17, 13, 7, 2, "#f4ece0"); R(g, 17, 15, 7, 2, "#3a5ab0"); R(g, 17, 17, 7, 1, "#c8303a"); }
      else { R(g, 1, 0, 26, 9, "#c48a32"); R(g, 3, 2, 22, 5, "#e8c890"); RK.box(g, 1, 0, 26, 9, OL); RK.block(g, 1, 9, 26, 10, 5, { top: "#7a4a2a", front: "#c48a32" }); R(g, 3, 11, 22, 6, "#5a3020"); }
      this.textures.addCanvas(key, cv);
    }
    return key;
  }
  async intro() {
    await UI.say([
      { who: "mama", text: "Женечка, поезд уже вечером! А чемодан до сих пор пустой." },
      { who: "zh", text: "Мам, я успею!" },
      { who: "papa", text: "Иди-иди, мама тебе там гостинцев насобирала. Целую гору." }
    ]);
    UI.goal("Поговори с мамой и собери чемодан");
  }
  async talkMama() {
    if (this.packed) { await UI.say([{ who: "mama", text: "Всё взяла? Шапку надела? Ну, присядем на дорожку... Всё, пошли на вокзал!" }]); return; }
    await UI.say([
      { who: "mama", text: "Вот, я тут кое-что положу. Только всё по местам, чтобы влезло!" },
      { who: "papa", text: "И от меня кое-что будет. Самое важное!" },
      { who: "zh", text: "Мам... это же чемодан, а не грузовик. Ладно, попробую." }
    ]);
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(380, () => this.scene.start("pack"));
  }
  async talkPapa() {
    if (this.packed) { await UI.say([{ who: "papa", text: "Шарф взяла? Взяла. Значит, всё будет хорошо. Пошли, провожу до самого вагона." }]); return; }
    await UI.say([
      { who: "papa", text: "Тише-тише! Спартак в атаке!.. Эх, мимо." },
      { who: "papa", text: "Иди к маме, Жень, она чемодан собирает. А я тут за счётом послежу." }
    ]);
  }
  async afterPack() {
    await UI.say([
      { who: "zhw", text: "Мам, а зачем мне в Италии валенки?" },
      { who: "mama", text: "А вдруг похолодает! Там тоже бывает зима." },
      { who: "papa", text: "Главное, шарф положили. Остальное уже не так важно." },
      { who: "papa", text: "Всё, одевайся, на улице минус двадцать. Пошли на вокзал!" }
    ]);
    UI.goal("Выходи за дверь, пора на вокзал");
  }
  async leave() {
    if (!this.packed) { await UI.say([{ who: "zh", text: "Сначала надо собрать чемодан. Без него мама меня никуда не отпустит." }]); return; }
    Sound.sfx("door"); this.zh.frozen = true; UI.goal("");
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(650, () => this.scene.start("station"));
  }
  update(time, dt) {
    this.zh.update(dt); this.mama.update(); this.papa.update(); this.inter.update();
  }
}
