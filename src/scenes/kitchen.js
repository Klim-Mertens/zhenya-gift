/* Глава 1, часть 3: кухня Нарины. Кулинарный квест: Нарина просит продукты для долмы,
   Джан — для карбонары (только по-итальянски!). Женя подаёт нужное с полки мышкой.
   Потом застолье: мамин борщ на стол и водка для Джана. */
"use strict";
class KitchenScene extends Phaser.Scene {
  constructor() { super("kitchen"); }
  create() {
    Save.store("kitchen"); Sound.play("cucina"); UI.goal(""); UI.hint("");
    this.cameras.main.fadeIn(600, 0, 0, 0);
    const art = MilanoArt.kitchen();
    this.dishes = [];       // что уже стоит на столе
    this.shelfOn = false; this.hover = -1; this.ask = null; this.glasses = 0;
    World.backdrop(this, "ki_back", (g, t) => { art.back(g, t); this.drawTable(g, t); }, -1000);
    World.backdrop(this, "ki_front", (g, t) => this.drawShelf(g, t), 5000);
    this.na = World.npc(this, "na_front_0", "na_blink", 160, 104, .2);
    this.gi = World.npc(this, "gi_idle", "gi_blink", 252, 104, 1.1);
    this.zh = World.npc(this, "zh_summer_front_0", "zh_summer_blink", 60, 128, 2.3);
    this.icons = Food.LIST.map(f => Object.assign({}, f)); this.shuffle();
    this.input.on("pointermove", p => { const i = this.slotAt(p.worldX, p.worldY); if (i !== this.hover) { this.hover = i; UI.hint(i >= 0 && this.shelfOn ? this.icons[i].ru : ""); } });
    this.input.on("pointerdown", p => { if (!this.shelfOn || UI.busy) return; const i = this.slotAt(p.worldX, p.worldY); if (i >= 0) this.pick(i); });
    // ?scene=kitchen&feast — сразу к застолью (для проверки)
    if (new URLSearchParams(location.search).has("feast")) { this.dishes = ["dolma", "carbonara", "borsch"]; this.time.delayedCall(700, () => this.feast()); }
    else this.time.delayedCall(700, () => this.run());
  }
  // ---------- полка с продуктами внизу экрана ----------
  slotAt(x, y) { if (y < 154 || y > 176) return -1; const i = Math.floor((x - 5) / 21); return i >= 0 && i < this.icons.length && (x - 5) % 21 < 19 ? i : -1; }
  drawShelf(g, t) {
    if (!this.shelfOn || !this.gi) return;
    const R = PK.R, OL = RK.OL, s = t / 1000;
    R(g, 0, 150, 320, 30, "#8a5a32"); R(g, 0, 150, 320, 2, "#b07a48"); R(g, 0, 177, 320, 3, "#5a3a20"); RK.box(g, 0, 150, 320, 30, OL);
    this.icons.forEach((f, i) => { const x = 6 + i * 21, y = 156, hov = i === this.hover, used = f.used;
      R(g, x - 1, y - 1, 19, 19, hov ? "#f2d23a" : "#6a4024"); R(g, x, y, 17, 17, used ? "#7a5030" : "#f4e8d0");
      if (!used) g.drawImage(this.textures.get(`food_${f.id}`).getSourceImage(), x, y + (hov ? -1 : 0)); });
    // восклицательный знак над тем, кто сейчас просит
    if (this.ask) { const sp = this.ask.who === "na" ? this.na.spr : this.gi.spr, by = sp.y - 34 + Math.round(Math.sin(s * 6));
      R(g, sp.x - 5, by, 11, 11, "#fbf8f0"); RK.box(g, sp.x - 5, by, 11, 11, OL); R(g, sp.x - 1, by + 11, 3, 2, "#fbf8f0");
      g.drawImage(this.textures.get(`food_${this.ask.id}`).getSourceImage(), sp.x - 4, by + 1, 9, 9);
      if (this.ask.who === "gi" && !this.ask.revealed) { R(g, sp.x - 4, by + 1, 9, 9, "#fbf8f0"); StationArt.text(g, "?", sp.x - 1, by + 3, OL); R(g, sp.x - 1, by + 3, 3, 1, OL); R(g, sp.x + 1, by + 4, 1, 2, OL); R(g, sp.x, by + 6, 1, 1, OL); R(g, sp.x, by + 8, 1, 1, OL); } }
  }
  drawTable(g, t) {
    const pos = { dolma: [104, 118], carbonara: [148, 120], borsch: [184, 118] };
    this.dishes.forEach(k => { const [x, y] = pos[k]; g.drawImage(this.textures.get(`dish_${k}`).getSourceImage(), x, y); });
    if (this.vodka) { const R = PK.R; R(g, 212, 116, 6, 14, "#e8f4f8"); R(g, 213, 114, 4, 2, "#d8202c"); R(g, 213, 121, 4, 4, "#f4f0e8"); RK.box(g, 212, 116, 6, 14, RK.OL);
      for (let i = 0; i < this.glasses; i++) { const x = [126, 165, 204][i]; R(g, x, 132, 4, 5, "#d8eef4"); R(g, x, 134, 4, 3, "#ffffff"); RK.box(g, x, 132, 4, 5, RK.OL); } }
  }
  // ---------- квест: последовательность просьб ----------
  async run() {
    await UI.say([
      { who: "na", text: "Добро пожаловать к нам! Разувайся, мой руки и становись помощницей." },
      { who: "gi", text: "Cucina! La guerra comincia!" },
      { who: "na", text: "«Кухонная война начинается». Он всегда так говорит, когда мы готовим одновременно." },
      { who: "na", text: "Сначала долма! Я говорю, что нужно, а ты подаёшь с полки. Наводи мышку, там подписи." }
    ]);
    const food = id => this.textures.get(`food_${id}`).getSourceImage();
    await UI.rules("Помоги на кухне!", [
      { icons: ["leaves", "rice", "onion"].map(food), text: "Внизу полка с продуктами. Наведи мышку — появится подпись." },
      { icons: [this.textures.get("na_front_0").getSourceImage()], text: "Нарина просит продукт по-русски — кликни по нужному." },
      { icons: [this.textures.get("gi_idle").getSourceImage()], text: "Джан просит только по-итальянски! Над головой у него будет «?». Ошиблась — Нарина переведёт." },
      { icons: ["pineapple", "ketchup"].map(food), text: "Продукты каждый раз перемешиваются. Ананас в карбонару лучше не класть..." }
    ], "Пробел или клик — начать");
    this.shelfOn = true;
    await this.round("na", ["leaves", "mince", "rice", "onion", "herbs", "matsun"], id => `Нарина просит: ${Food.byId(id).ru}`);
    this.shelfOn = false; this.ask = null; UI.goal("");
    await this.cook("dolma", [
      { who: "na", text: "Заворачиваем фарш с рисом в листики... Вот так, плотненько, как маленькие голубцы." },
      { who: "zhs", text: "Голубцы-малыши! Мама бы оценила." },
      { who: "na", text: "Долма готова! Мацун сверху, и это лучшее, что ты пробовала. Обещаю!" }
    ]);
    await UI.say([
      { who: "gi", text: "Adesso tocca a me! Carbonara!" },
      { who: "na", text: "Теперь его очередь. Он будет просить по-итальянски. Не угадаешь — переведу!" }
    ]);
    this.shelfOn = true;
    await this.round("gi", ["spaghetti", "guanciale", "eggs", "pecorino", "pepper"], id => `Джан просит: ${Food.byId(id).it}!`);
    this.shelfOn = false; this.ask = null; UI.goal("");
    await this.cook("carbonara", [
      { who: "gi", text: "Guanciale croccante... uova, pecorino... e pepe! Niente panna, MAI!" },
      { who: "na", text: "Хрустящая щёчка, яйца, сыр и перец. И никаких сливок, никогда!" },
      { who: "gi", text: "Perfetto! Ка-рбо-на-ра... хо-ро-шо!" }
    ]);
    await UI.say([{ who: "na", text: "Стол почти готов. Жень, а ты ничего не привезла из дома? Чего-то русского не хватает!" }]);
    this.shelfOn = true;
    await this.round("na", ["borsch"], () => "Что привезла мама? Найди на полке");
    this.shelfOn = false; this.ask = null; UI.goal("");
    this.dishes.push("borsch"); Sound.sfx("place");
    await UI.say([
      { who: "zhs", text: "Мамин борщ! Ехал со мной двое суток в обнимку с валенками." },
      { who: "na", text: "Ура! Обожаю твою маму. Передай ей огромное спасибо!" },
      { who: "gi", text: "Bor-sch... che colore! Красный, как... Ferrari!" }
    ]);
    await this.feast();
  }
  // перемешать продукты на полке (каждый раунд по-новому)
  shuffle() { const a = this.icons; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }
  // одна серия просьб: ждём правильный клик на каждую
  round(who, ids, goalText) {
    this.shuffle(); ids = ids.slice().sort(() => Math.random() - .5);   // и порядок просьб тоже случайный
    return new Promise(resolve => {
      let k = 0;
      const next = () => {
        if (k >= ids.length) { this.ask = null; this.onPick = null; resolve(); return; }
        this.ask = { who, id: ids[k], revealed: who !== "gi", miss: 0 };
        UI.goal(goalText(ids[k]));
        (who === "na" ? this.na : this.gi).override = null;
      };
      this.onPick = async f => {
        const a = this.ask; if (!a) return;
        if (f.id === a.id) {
          Sound.sfx("pick"); f.used = true; this.flyTo(f, who === "na" ? this.na.spr : this.gi.spr);
          const praise = who === "na" ? ["Умница!", "Да, оно!", "Отлично!", "Ты прирождённый повар!"] : ["Brava!", "Sì, sì!", "Perfetto!", "Bravissima!"];
          UI.toast(`${who === "na" ? "Нарина" : "Джан"}: ${praise[k % praise.length]}`, 1300);
          k++; await World.wait(this, 450); next();
        } else { Sound.sfx("wrong"); a.miss++; await this.wrong(f, a); }
      };
      next();
    });
  }
  pick(i) { const f = this.icons[i]; if (f.used || !this.onPick || this.busyPick) return; this.busyPick = true; Promise.resolve(this.onPick(f)).then(() => { this.busyPick = false; }); }
  flyTo(f, spr) {
    const x = 6 + this.icons.indexOf(f) * 21 + 8, img = this.add.image(x, 164, `food_${f.id}`).setDepth(6000);
    this.tweens.add({ targets: img, x: spr.x, y: spr.y - 18, scale: .6, duration: 420, ease: "Quad.easeIn", onComplete: () => img.destroy() });
  }
  // смешные реакции на неправильные продукты
  async wrong(f, a) {
    const special = {
      cream: a.who === "gi" ? [{ who: "gi", text: "PANNA?! NO! NO! NO! Mamma mia..." }, { who: "na", text: "Сливки в карбонару — для итальянца это преступление. Он сейчас упадёт в обморок." }] : null,
      pineapple: [{ who: "gi", text: "Ananas... in cucina italiana?! Io... muoio." }, { who: "na", text: "Он говорит, что умирает. Ананас для него только на пицце у туристов. И то это ужас." }],
      ketchup: [{ who: "gi", text: "Ketchup?! Нарина... она шутит, sì?" }, { who: "na", text: "Шутит, шутит. Жень, убери, пока он не заплакал." }],
      borsch: [{ who: "na", text: "Борщ — потом, на стол! Это же главное блюдо вечера." }]
    }[f.id];
    if (special) { if (a.who === "gi" || f.id !== "cream") this.gi.override = "gi_wide"; await UI.say(special); this.gi.override = null; }
    else if (a.who === "na") UI.toast(`Нарина: Не, это не ${Food.byId(a.id).ru.toLowerCase()}. Ищи ещё!`, 1800);
    else UI.toast(`Джан: No, no! ${Food.byId(a.id).it}!`, 1800);
    // Джан: после промаха Нарина переводит
    if (a.who === "gi" && !a.revealed) { a.revealed = true; UI.goal(`Джан просит: ${Food.byId(a.id).it}! (Нарина: это «${Food.byId(a.id).ru.toLowerCase()}»)`); }
  }
  async cook(kind, lines) {
    Sound.sfx("place"); this.cameras.main.shake(200, .002);
    await UI.say(lines);
    this.dishes.push(kind); Sound.sfx("done");
    UI.toast(kind === "dolma" ? "Долма готова! ★" : "Карбонара готова! ★", 1600);
    await World.wait(this, 500);
  }
  // ---------- застолье ----------
  async feast() {
    const cam = this.cameras.main;
    cam.fadeOut(300, 0, 0, 0); await World.wait(this, 320);
    this.na.spr.setPosition(122, 112); this.gi.spr.setPosition(200, 112); this.zh.spr.setPosition(161, 112);
    [this.na, this.gi, this.zh].forEach(o => o.spr.setDepth(o.spr.y));
    Sound.play("piazza");
    cam.fadeIn(400, 0, 0, 0); await World.wait(this, 420);
    await UI.say([
      { who: "na", text: "Ну что, за стол! Долма, карбонара и мамин борщ. Интернациональный ужин!" },
      { who: "zhs", text: "А теперь главное. Мама просила передать Джану лично в руки..." }
    ]);
    this.vodka = true; Sound.sfx("place");
    await UI.say([
      { who: "zhs", text: "Водка! Прямо из Коврова. Наша, настоящая." },
      { who: "gi", text: "Vodka russa! Wow... Ну... да-вай!" }
    ]);
    Sound.sfx("pour"); this.glasses = 3; await World.wait(this, 600);
    await UI.say([
      { who: "na", text: "Тост! За Женю, которая наконец-то с нами!" },
      { who: "zhs", text: "За вас! Спасибо, что так встретили!" },
      { who: "na", text: "Кенац! Это по-армянски «за жизнь»." },
      { who: "gi", text: "Salute! За... здо-ро-вье!" }
    ]);
    Sound.sfx("cheers"); await World.wait(this, 500);
    // Джан выпивает залпом: крупный план
    const gs = this.gi.spr;
    cam.pan(gs.x, gs.y - 2, 450, "Sine.easeInOut"); cam.zoomTo(3, 450, "Sine.easeInOut");
    await World.wait(this, 500);
    Sound.sfx("gulp"); this.gi.override = "gi_eyes"; await World.wait(this, 700);
    this.gi.override = "gi_shock"; cam.shake(500, .01);
    const bn = UI.banner('<div class="who"><canvas width="16" height="16"></canvas><b class="gi">Джанлука</b></div><div class="syl"><span>MAMMA</span> <span>MIA!!!</span></div>', "chant", 2200);
    const pc = UI.portrait("gi"); if (pc) document.querySelector("#banner canvas").getContext("2d").drawImage(pc, 0, 0);
    await bn;
    await UI.say([
      { who: "gi", text: "Uff... Fuoco! Огонь!" },
      { who: "gi", text: "...Ха-ра-шо! Ещё!" }
    ]);
    this.gi.override = null;
    cam.pan(160, 90, 500, "Sine.easeInOut"); cam.zoomTo(1, 500, "Sine.easeInOut"); await World.wait(this, 520);
    await UI.say([
      { who: "na", text: "Всё, он покорён. Теперь будет просить русскую водку каждые выходные." },
      { who: "zhs", text: "Скажу маме, пусть шлёт посылками. Вместе с борщом!" },
      { who: "gi", text: "Женя! Ты... су-пер! Benvenuta in famiglia!" },
      { who: "na", text: "«Добро пожаловать в семью». Он редко так говорит. Ну, только когда его кормят." }
    ]);
    await UI.card("Глава 1 пройдена", "Нарина и Джанлука ★", 3000);
    Save.store("run");
    await UI.card("Глава 2", "Лера и футбол · на следующее утро", 2600);
    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.time.delayedCall(750, () => this.scene.start("run"));
  }
  update() { this.na.update(); this.gi.update(); this.zh.update(); }
}
