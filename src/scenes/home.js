/* Пролог, часть 1: квартира родителей. Женя ходит, говорит с мамой и папой, собирает чемодан и выходит на вокзал. */
"use strict";
class HomeScene extends Phaser.Scene {
  constructor() { super("home"); }
  init(data) { this.packed = !!(data && data.packed); }
  create() {
    Save.store("home"); Sound.play("winter"); UI.goal("");
    this.cameras.main.fadeIn(500, 0, 0, 0);
    const draw = HomeArt.create();
    World.backdrop(this, "home_bg", (g, t) => { draw(g, t); this.garland(g, t); });
    // крупные планы: отдельный слой поверх всего, виден только во время «рассматривания»
    this.closeArt = Closeups.create(); this.close = null; this.cst = {};
    this.closeImg = World.backdrop(this, "home_close", (g, t) => { if (this.close) this.closeArt[this.close](g, t, this.cst); }, 9000).setVisible(false);
    this.papaTalks = 0;
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
      { x: 166, y: 134, r: 18, label: () => this.packed ? "посмотреть на чемодан" : "открыть чемодан", use: () => this.packed ? UI.say([{ who: "zhw", text: "Чемодан собран! Тяжёлый, как будто мама положила туда полкухни. Хотя почему как будто." }]) : this.talkMama() },
      { x: 292, y: 68, r: 20, label: "посмотреть телевизор", use: () => this.closeup("tv", { x: 292, y: 41 }, [
        { who: this.zhWho(), text: "О, футбол! Красные ведут 1:0. Значит, у папы сегодня отличное настроение." },
        { who: this.zhWho(), text: "Переключу-ка... Новогодний концерт! Всё те же артисты, что и двадцать лет назад. И почему-то это ужасно приятно.", ch: 1 },
        { who: "papa", text: "Эй, а футбол?.. Ладно-ладно, оставляй, я этих певцов тоже люблю. Только тихо, маме не говори.", ch: 1 },
        { who: this.zhWho(), text: "Прогноз погоды: в Коврове минус двадцать, в Милане плюс двадцать. Разница сорок градусов!", ch: 2 },
        { who: this.zhWho(), text: "Всё, решено: валенки оставлю дома. Если мама разрешит.", ch: 2 }]) },
      { x: 54, y: 78, r: 26, label: "посмотреть на ковёр", use: () => UI.say([{ who: this.zhWho(), text: "Тот самый ковёр на стене. В детстве я искала в узорах лица и драконов. Вон тот завиток до сих пор похож на папу в шапке." }]) },
      { x: 52, y: 144, r: 20, label: "посмотреть на стол", use: () => UI.say([{ who: this.zhWho(), text: "Блины с икрой, мамино фирменное! Утащу один на дорожку." }, { who: "mama", text: "Я всё вижу! Бери два, в дороге пригодится." }]) },
      { x: 300, y: 160, r: 22, label: "посмотреть на ёлку", use: () => this.closeup("tree", { x: 302, y: 122 }, [
        { who: this.zhWho(), text: "Ого, сколько игрушек! Мама каждый год достаёт их из той самой коробки с антресолей." },
        { who: this.zhWho(), text: "Синий шарик с буквами Ж+К. Мы с братом разрисовали его фломастерами, когда были мелкими. Мама до сих пор вешает его на самое видное место." },
        { who: this.zhWho(), text: "А вот и поезд РЖД! Мамины коллеги подарили. Сегодня я тоже еду на поезде, только на настоящем." },
        { who: this.zhWho(), text: "Космонавт ещё бабушкин. А мандарин на ниточке повесил папа. Говорит, для запаха. Мне кажется, он его потом съест." }]) },
      { x: 158, y: 70, r: 18, label: "посмотреть в окно", use: () => this.closeup("yard", { x: 158, y: 26 }, [
        { who: this.zhWho(), text: "Во дворе дети катаются с горки. Я тоже там каталась, на мамином подносе для пирогов." },
        { who: this.zhWho(), text: "Кто-то слепил снеговика с морковкой, а вокруг носится соседская собака. Ну просто открытка!" },
        { who: this.zhWho(), text: "Красота. Буду скучать по снегу... Минут пять. А потом пойду греться на солнышке!" }]) },
      { x: 229, y: 62, r: 16, label: "посмотреть на полку с фото", use: () => this.closeup("photos", { x: 229, y: 30 }, [
        { who: this.zhWho(), text: "Фото с папиного дня рождения в глэмпинге! Папа пел шаманские песни у костра и стучал палкой по железной чаше с огнём." },
        { who: "papa", text: "Это был обряд! Для хорошей погоды. И ведь сработало: дождь пошёл только утром." },
        { who: this.zhWho(), text: "А это яблочный десерт. Я попросила у брата чайную ложечку, а он принёс огромный половник. До сих пор смешно." },
        { who: this.zhWho(), text: "Медаль за кросс по Коврову, целых восемь километров! Мы бежали вместе с братом. Ноги потом болели три дня, но было здорово." },
        { who: this.zhWho(), text: "И общая фотка, вся семья. Надо сделать новую, когда все приедут ко мне в гости." }]) },
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
  // Гирлянда-лампочки над ковром и дверью: праздничное настроение
  garland(g, t) {
    const s = t / 1000, cols = ["#ff4a5a", "#f2d23a", "#4ab0ff", "#6ae06a"];
    const seg = (x0, x1, y0, sag, n) => { for (let i = 0; i <= n; i++) { const k = i / n, x = x0 + (x1 - x0) * k, y = y0 + Math.sin(k * Math.PI) * sag;
      if (i < n) { const k2 = (i + 1) / n; PK.line(g, x, y, x0 + (x1 - x0) * k2, y0 + Math.sin(k2 * Math.PI) * sag, "#2a3a2a"); }
      const on = (i + Math.floor(s * 2.5)) % 3 !== 0, c = cols[i % 4]; PK.R(g, x, y + 1, 2, 2, on ? c : PK.mix(c, "#000", .5)); if (on) PK.P(g, x, y + 1, "#ffffff"); } };
    seg(4, 66, 3, 5, 10); seg(66, 130, 3, 5, 10);
  }
  // Крупный план: камера наезжает на предмет, вспышка, картинка во весь экран, реплики, назад
  async closeup(name, focus, lines) {
    if (this.close || this.zooming) return;
    const cam = this.cameras.main; this.zooming = true; this.zh.frozen = true; UI.goal(""); UI.hint("");
    Sound.sfx("pick");
    cam.pan(focus.x, focus.y, 500, "Sine.easeInOut"); cam.zoomTo(4, 500, "Sine.easeInOut");
    await World.wait(this, 520);
    cam.fadeOut(140, 255, 255, 255); await World.wait(this, 150);
    cam.setZoom(1); cam.centerOn(160, 90);
    this.close = name; this.cst = { ch: 0 }; this.closeImg.setVisible(true);
    cam.fadeIn(220, 255, 255, 255); await World.wait(this, 240);
    // реплики по одной: у телевизора реплика может переключить канал
    for (const L of lines) { if (L.ch !== undefined && L.ch !== this.cst.ch) { this.cst.ch = L.ch; Sound.sfx("blip", 2); } await UI.say([L]); }
    cam.fadeOut(160, 0, 0, 0); await World.wait(this, 170);
    this.close = null; this.closeImg.setVisible(false);
    cam.fadeIn(260, 0, 0, 0);
    this.zh.frozen = false; this.zooming = false;
    UI.goal(this.goalText || "");
  }
  setGoal(t) { this.goalText = t; UI.goal(t); }
  async intro() {
    await UI.say([
      { who: "mama", text: "Женечка, поезд уже вечером, а чемодан до сих пор пустой!" },
      { who: "zh", text: "Мам, всё под контролем! Ну... почти." },
      { who: "papa", text: "Не спорь с мамой, у неё план. И, кажется, три пакета гостинцев." },
      { who: "papa", text: "А я тебе плейлист в дорогу собрал! Сорок часов музыки, как раз на двое суток." },
      { who: "zh", text: "Пап, ты лучший!" }
    ]);
    this.setGoal("Поговори с мамой и собери чемодан. Можно осмотреться!");
  }
  async talkMama() {
    if (this.packed) { await UI.say([{ who: "mama", text: "Шапку надела? Варежки? Ну, присядем на дорожку..." }, { who: "mama", text: "Всё, встали, пошли! А то папа уже в ботинках пританцовывает." }]); return; }
    await UI.say([
      { who: "mama", text: "Так, я тут кое-что положу. Только самое необходимое!" },
      { who: "papa", text: "И от меня кое-что будет. Секретное!" },
      { who: "zh", text: "Мам, это чемодан, а не грузовик... Ладно, сейчас всё уложу!" }
    ]);
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(380, () => this.scene.start("pack"));
  }
  async talkPapa() {
    if (this.packed) { await UI.say([{ who: "papa", text: "Пошли, провожу до самого вагона. И чемодан понесу, а то мама туда, кажется, кирпичи положила." }]); return; }
    const talks = [
      [{ who: "papa", text: "Смотри, какой плейлист! Тут всё: и Цой, и итальянцы, и то, что мы в пробке во Владимире слушали." },
       { who: "zh", text: "Это когда ты врубил на всю громкость и весь светофор подпевал?" },
       { who: "papa", text: "Вот именно! Хорошую музыку нельзя слушать тихо." }],
      [{ who: "papa", text: "Жень, загадка. Почему поезд никогда не грустит?" },
       { who: "zh", text: "Ну и почему?" },
       { who: "papa", text: "Потому что его всегда провожают! Ха! Ну смешно же." },
       { who: "zh", text: "Пап... ладно, смешно." }],
      [{ who: "papa", text: "А Лоренцо привет передавай! Скажи ему от меня: через ю навэрх ин зе фабио!" },
       { who: "zh", text: "Пап, что это вообще значит?" },
       { who: "papa", text: "Он поймёт. Мы с итальянцами всегда находим общий язык!" }]
    ];
    await UI.say(talks[this.papaTalks++ % talks.length]);
  }
  async afterPack() {
    await UI.say([
      { who: "zhw", text: "Мам, а зачем мне в Италии валенки?" },
      { who: "mama", text: "А вдруг похолодает! В Милане тоже бывает зима. Ну, почти." },
      { who: "papa", text: "Так! По нашей старой традиции: обряд на удачу в дорогу!" }
    ]);
    UI.toast("Папа трижды стучит половником по крышке кастрюли. БОМ! БОМ! БОМ!", 2400);
    for (let i = 0; i < 3; i++) { Sound.sfx("bong"); this.cameras.main.shake(120, .004); await World.wait(this, 380); }
    await UI.say([
      { who: "mama", text: "Лёша, ну соседи же!" },
      { who: "papa", text: "Соседи тоже хотят, чтобы Женя хорошо доехала! Всё, одеваемся, на улице минус двадцать. На вокзал!" }
    ]);
    this.setGoal("Выходи за дверь, пора на вокзал");
  }
  async leave() {
    if (!this.packed) { await UI.say([{ who: "zh", text: "Сначала чемодан! Без него мама меня даже до лифта не отпустит." }]); return; }
    Sound.sfx("door"); this.zh.frozen = true; UI.goal("");
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(650, () => this.scene.start("station"));
  }
  update(time, dt) {
    this.zh.update(dt); this.mama.update(); this.papa.update(); this.inter.update();
  }
}
