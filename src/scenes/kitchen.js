/* Глава 1, часть 3: кухня Нарины. «Кухонная война»: две кухни сразу.
   Нарина готовит армянскую долму (слева, у плиты), Джан — итальянскую карбонару (справа).
   Оба просят продукты одновременно: над головой — картинка нужного продукта и полоска терпения.
   Женя ходит по кухне (стрелки/WASD), берёт продукт с полки внизу (пробел) и несёт нужному повару (пробел).
   Не успела — повар ворчит, минус звёздочка; неправильный продукт — смешная реакция и тоже минус.
   Потом мамин борщ из чемодана на стол и застолье с водкой для Джана. */
"use strict";
class KitchenScene extends Phaser.Scene {
  constructor() { super("kitchen"); }
  init(data) { this.devData = data || {}; }
  create() {
    Save.store("kitchen"); Sound.play("cucina"); UI.goal(""); UI.hint("");
    this.cameras.main.fadeIn(600, 0, 0, 0);
    const art = MilanoArt.kitchen();
    this.dishes = []; this.glasses = 0; this.state = "intro";
    this.pantry = Food.LIST.map(f => f.id); this.shuffle(this.pantry);
    World.backdrop(this, "ki_back", (g, t) => art.back(g, t), -1000);
    // стол — отдельная картинка с глубиной: кто стоит за столом (выше), того стол закрывает по пояс
    const snap = PK.mk(320, 180); art.back(snap.getContext("2d"), 0);
    const tbl = PK.mk(140, 44); tbl.getContext("2d").drawImage(snap, 90, 108, 140, 44, 0, 0, 140, 44);
    if (this.textures.exists("ki_table")) this.textures.remove("ki_table");
    this.textures.addCanvas("ki_table", tbl); this.add.image(90, 108, "ki_table").setOrigin(0).setDepth(140);
    World.backdrop(this, "ki_dishes", (g, t) => this.drawTable(g, t), 141);
    World.backdrop(this, "ki_front", (g, t) => this.drawFront(g, t), 5000);
    this.na = World.npc(this, "na_front_0", "na_blink", 150, 104, .2);
    this.gi = World.npc(this, "gi_idle", "gi_blink", 262, 104, 1.1);
    this.zhP = World.player(this, World.frameKeys("zh_summer"), 60, 128); this.zhP.speed = 82; this.zhP.frozen = true;
    this.zh = this.zhP;                                  // для застолья: у игрока тоже есть spr
    this.zhP.blockers = [[0, 0, 118, 82], [118, 0, 202, 100], [143, 96, 14, 12], [255, 96, 14, 12], [94, 116, 134, 26], [80, 120, 14, 16], [228, 120, 14, 16],
      [12, 128, 20, 16], [0, 157, 320, 23], [0, 0, 3, 180], [317, 0, 3, 180]];
    this.carry = null; this.stars = 3; this.mistakes = 0; this.timeouts = 0;
    const kd = e => { if (["Space", "KeyE", "Enter"].includes(e.code) && (this.state === "play" || this.state === "borsch") && !UI.busy) { e.preventDefault(); this.act(); } };
    const hintEl = document.getElementById("hint"); if (hintEl) hintEl.classList.add("high");
    window.addEventListener("keydown", kd); this.events.once("shutdown", () => { window.removeEventListener("keydown", kd); UI.hint(""); if (hintEl) hintEl.classList.remove("high"); });
    // ?scene=kitchen&feast — сразу к застолью (для проверки)
    if (new URLSearchParams(location.search).has("feast") || (this.devData && this.devData.feast)) { this.dishes = ["dolma", "carbonara", "borsch"]; this.time.delayedCall(700, () => this.feast()); }
    else this.time.delayedCall(700, () => this.run());
  }
  shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // ---------- где стоит Женя ----------
  slotUnder() { const x = this.zhP.spr.x, y = this.zhP.spr.y; if (y < 144) return -1; const i = Math.floor((x - 5) / 21); return i >= 0 && i < this.pantry.length ? i : -1; }
  chefNear() { const x = this.zhP.spr.x, y = this.zhP.spr.y; for (const c of this.chefs || []) if (Math.abs(x - c.npc.spr.x) < 22 && y < 120) return c; return null; }
  tableNear() { const x = this.zhP.spr.x, y = this.zhP.spr.y; return x > 84 && x < 236 && (y < 112 || y > 144); }
  // ---------- правила и запуск ----------
  async run() {
    await UI.say([
      { who: "na", text: "Добро пожаловать к нам! Разувайся, мой руки и становись помощницей." },
      { who: "gi", text: "Cucina! La guerra comincia!" },
      { who: "na", text: "«Кухонная война начинается». Мы готовим одновременно: я — долму, он — карбонару." },
      { who: "na", text: "Продукты на полке внизу. Носи нам то, что нарисовано над головой. И побыстрее, мы голодные!" }
    ]);
    const food = id => this.textures.get(`food_${id}`).getSourceImage();
    await UI.rules("Кухонная война!", [
      { keys: ["←", "↑", "↓", "→"], icons: [this.textures.get("zh_summer_side_0").getSourceImage()], text: "Стрелки или WASD — ходить по кухне." },
      { keys: ["Пробел"], icons: ["rice", "eggs", "onion"].map(food), text: "Встань у полки внизу и нажми пробел — возьмёшь продукт (название видно в подсказке). Ещё раз у полки — поменяешь." },
      { icons: [this.textures.get("na_front_0").getSourceImage(), this.textures.get("gi_idle").getSourceImage()], text: "Над Нариной и Джаном — картинка того, что им нужно сейчас, и полоска терпения. Подойди к повару и нажми пробел — отдашь продукт." },
      { icons: ["cream", "pineapple"].map(food), text: "Готовят оба сразу — успевай к обоим! Не успела или принесла не то — минус звёздочка. Сливки и ананас Джану лучше не носить..." }
    ]);
    // очереди продуктов (порядок случайный), терпение в секундах
    this.chefs = [
      { who: "na", name: "Нарина", npc: this.na, dish: "dolma", queue: this.shuffle(["leaves", "mince", "rice", "onion", "herbs", "matsun"]), max: 24 },
      { who: "gi", name: "Джан", npc: this.gi, dish: "carbonara", queue: this.shuffle(["spaghetti", "guanciale", "eggs", "pecorino", "pepper"]), max: 20 }
    ];
    this.chefs.forEach(c => { c.total = c.queue.length; c.pat = c.max; c.done = false; c.ok = 0; });
    this.zhP.frozen = false; this.state = "play"; this.announce(this.chefs[1]); this.updGoal();
  }
  // Джан выкрикивает продукт по-итальянски, а подсказка сразу даёт перевод
  announce(c) { if (c.who === "gi" && c.queue.length) UI.toast(`Джан: ${Food.byId(c.queue[0]).it}! (это «${Food.byId(c.queue[0]).ru.toLowerCase()}»)`, 2000); }
  updGoal() {
    if (this.state === "borsch") { UI.goal(this.carry === "borsch" ? "Неси борщ на стол (подойди к столу, пробел)" : "Найди на полке мамин борщ из чемодана"); return; }
    const parts = this.chefs.map(c => c.done ? `${c.name}: готово ★` : `${c.name} ждёт: ${Food.byId(c.queue[0]).ru}${c.who === "gi" ? ` (${Food.byId(c.queue[0]).it})` : ""}`);
    UI.goal(parts.join(" · ") + `  ${"★".repeat(this.stars)}${"☆".repeat(3 - this.stars)}`);
  }
  // ---------- пробел ----------
  async act() {
    const slot = this.slotUnder(), chef = this.chefNear();
    if (this.state === "borsch" && this.carry === "borsch" && this.tableNear()) return this.serveBorsch();
    if (slot >= 0) {                                       // у полки: взять / поменять
      const id = this.pantry[slot]; if (this.carry === id) { this.carry = null; Sound.sfx("place"); }
      else { this.carry = id; Sound.sfx("pick"); }
      this.updGoal(); return;
    }
    if (chef && this.carry && this.state === "play") return this.give(chef);
    if (chef && !this.carry && this.state === "play" && !chef.done) UI.toast(`${chef.name}: ${chef.who === "gi" ? "Mi serve... " + Food.byId(chef.queue[0]).it + "!" : "Мне нужно: " + Food.byId(chef.queue[0]).ru.toLowerCase() + "!"}`, 1500);
  }
  async give(c) {
    const id = this.carry;
    if (c.done) { UI.toast(`${c.name}: У меня уже всё готово! Помоги другому.`, 1400); return; }
    if (id === c.queue[0]) {
      this.carry = null; c.queue.shift(); c.ok++; c.pat = c.max; Sound.sfx("pick"); this.fly(id, c.npc.spr);
      const praise = c.who === "na" ? ["Умница!", "Да, оно!", "Отлично!", "Ты прирождённый повар!", "Супер!"] : ["Brava!", "Sì, sì!", "Perfetto!", "Bravissima!", "Molto bene!"];
      UI.toast(`${c.name}: ${praise[c.ok % praise.length]}`, 1100);
      if (!c.queue.length) await this.cook(c); else this.announce(c);
      this.updGoal();
      if (this.chefs.every(x => x.done)) this.toBorsch();
      return;
    }
    // не то: другому повару — подсказка, иначе — смешная реакция и минус
    const other = this.chefs.find(x => x !== c && !x.done && x.queue[0] === id);
    if (other) { UI.toast(`${c.name}: Это не мне — это ждёт ${other.who === "gi" ? "Джан" : "Нарина"}!`, 1500); return; }
    this.carry = null; Sound.sfx("wrong"); this.loseStar("wrong");
    await this.wrong({ id }, { who: c.who, id: c.queue[0] });
    this.updGoal();
  }
  loseStar(why) { if (why === "wrong") this.mistakes++; else this.timeouts++; if ((this.mistakes + this.timeouts) % 2 === 0 && this.stars > 1) { this.stars--; UI.toast("−★", 900); } }
  fly(id, spr) {
    const img = this.add.image(this.zhP.spr.x, this.zhP.spr.y - 32, `food_${id}`).setDepth(6000);
    this.tweens.add({ targets: img, x: spr.x, y: spr.y - 18, scale: .6, duration: 380, ease: "Quad.easeIn", onComplete: () => img.destroy() });
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
    else if (a.who === "na") UI.toast(`Нарина: Не, это ${Food.byId(f.id).ru.toLowerCase()}. А мне нужно: ${Food.byId(a.id).ru.toLowerCase()}!`, 1900);
    else UI.toast(`Джан: No, no! ${Food.byId(a.id).it}! (${Food.byId(a.id).ru.toLowerCase()})`, 1900);
  }
  async cook(c) {
    c.done = true; this.dishes.push(c.dish); Sound.sfx("done"); this.cameras.main.shake(150, .002);
    await UI.say(c.dish === "dolma" ? [
      { who: "na", text: "Заворачиваем фарш с рисом в листики... Вот так, плотненько. Долма готова!" },
      { who: "zhs", text: "Голубцы-малыши! Мама бы оценила." }
    ] : [
      { who: "gi", text: "Guanciale croccante, uova, pecorino e pepe! Niente panna, MAI!" },
      { who: "na", text: "Хрустящая щёчка, яйца, сыр и перец. И никаких сливок! Карбонара готова." }
    ]);
    UI.toast(c.dish === "dolma" ? "Долма готова! ★" : "Карбонара готова! ★", 1500);
  }
  async toBorsch() {
    this.state = "borsch"; this.zhP.frozen = true;
    await UI.say([
      { who: "na", text: "Обе кухни победили! Жень, а ты ничего не привезла из дома? Чего-то русского не хватает!" },
      { who: "zhs", text: "Точно! Мамин борщ в чемодане. Сейчас найду на полке!" }
    ]);
    this.zhP.frozen = false; this.updGoal();
  }
  async serveBorsch() {
    this.carry = null; this.state = "end"; this.zhP.frozen = true; this.zhP.face("front"); UI.hint("");
    this.dishes.push("borsch"); Sound.sfx("place");
    await UI.say([
      { who: "zhs", text: "Мамин борщ! Ехал со мной двое суток в обнимку с валенками." },
      { who: "na", text: "Ура! Обожаю твою маму. Передай ей огромное спасибо!" },
      { who: "gi", text: "Bor-sch... che colore! Красный, как... Ferrari!" }
    ]);
    const stars = "★".repeat(this.stars) + "☆".repeat(3 - this.stars);
    await UI.banner(`<div class="syl"><span>${stars}</span></div>`, "chant", 1500);
    await this.feast();
  }
  // ---------- отрисовка ----------
  drawTable(g, t) {
    const pos = { dolma: [104, 118], carbonara: [148, 120], borsch: [184, 118] };
    this.dishes.forEach(k => { const [x, y] = pos[k]; g.drawImage(this.textures.get(`dish_${k}`).getSourceImage(), x, y); });
    if (this.vodka) { const R = PK.R; R(g, 212, 116, 6, 14, "#e8f4f8"); R(g, 213, 114, 4, 2, "#d8202c"); R(g, 213, 121, 4, 4, "#f4f0e8"); RK.box(g, 212, 116, 6, 14, RK.OL);
      for (let i = 0; i < this.glasses; i++) { const x = [126, 165, 204][i]; R(g, x, 132, 4, 5, "#d8eef4"); R(g, x, 134, 4, 3, "#ffffff"); RK.box(g, x, 132, 4, 5, RK.OL); } }
  }
  drawFront(g, t) {
    if (!this.zhP) return;
    const R = PK.R, OL = RK.OL, s = t / 1000, tex = id => this.textures.get(`food_${id}`).getSourceImage();
    if (this.state === "play" || this.state === "borsch") {
      // полка с продуктами внизу; ячейка под Женей подсвечена
      const cur = this.slotUnder();
      R(g, 0, 152, 320, 28, "#8a5a32"); R(g, 0, 152, 320, 2, "#b07a48"); R(g, 0, 177, 320, 3, "#5a3a20"); RK.box(g, 0, 152, 320, 28, OL);
      this.pantry.forEach((id, i) => { const x = 6 + i * 21, y = 157, on = i === cur;
        R(g, x - 1, y - 1, 19, 19, on ? "#f2d23a" : "#6a4024"); R(g, x, y, 17, 17, "#f4e8d0"); g.drawImage(tex(id), x, y + (on ? -1 : 0)); });
      // подсказка у полки / у повара
      const c = this.chefNear(), serve = this.state === "borsch" && this.carry === "borsch" && this.tableNear();
      const hint = serve ? "Пробел — поставить борщ на стол" : cur >= 0 ? `Пробел — ${this.carry === this.pantry[cur] ? "положить обратно" : "взять"}: ${Food.byId(this.pantry[cur]).ru}`
        : c && this.carry && this.state === "play" ? `Пробел — отдать: ${c.name}` : "";
      if (hint !== this.lastHint) { this.lastHint = hint; UI.hint(hint); }
    }
    // продукт в руках над головой
    if (this.carry && this.zhP.spr.visible) { const x = Math.round(this.zhP.spr.x) - 8, y = Math.round(this.zhP.spr.y) - 46 + Math.round(Math.sin(s * 5));
      R(g, x - 1, y - 1, 18, 18, "#fbf8f0"); RK.box(g, x - 1, y - 1, 18, 18, OL); g.drawImage(tex(this.carry), x, y); }
    // заказы над поварами: картинка + полоска терпения
    if (this.state === "play" && this.chefs) this.chefs.forEach(c => { if (c.done) return;
      const sp = c.npc.spr, w = 22, x = Math.round(sp.x - w / 2), y = Math.round(sp.y - (c.who === "gi" ? 58 : 52)) + Math.round(Math.sin(s * 4 + (c.who === "gi" ? 1 : 0)));
      const k = c.pat / c.max, col = k > .5 ? "#5ad86a" : k > .25 ? "#f2c23a" : "#e84a4a", shake = k < .25 ? Math.round(Math.sin(s * 30)) : 0;
      R(g, x + shake, y, w, 22, "#fbf8f0"); RK.box(g, x + shake, y, w, 22, OL); R(g, x + 9 + shake, y + 22, 4, 2, "#fbf8f0");
      g.drawImage(tex(c.queue[0]), x + 3 + shake, y + 1);
      R(g, x + 2, y + 18, w - 4, 2, "#3a3048"); R(g, x + 2, y + 18, Math.round((w - 4) * k), 2, col);
      // сколько продуктов уже отдано: кружочки справа от пузыря
      for (let i = 0; i < c.total; i++) { const px = x + w + 2, py = y + 1 + i * 3.5; R(g, px, Math.round(py), 3, 3, OL); R(g, px + 1, Math.round(py) + 1, 1, 1, i < c.ok ? "#5ad86a" : "#fbf8f0"); } });
  }
  // ---------- терпение поваров ----------
  update(time, dt) {
    this.na.update(); this.gi.update(); this.zhP.update(dt);
    if (this.state !== "play" || UI.busy) return;
    this.chefs.forEach(c => { if (c.done) return; c.pat -= dt / 1000;
      if (c.pat <= 0) { c.pat = c.max; Sound.sfx("wrong"); this.loseStar("time");
        UI.toast(c.who === "na" ? `Нарина: Жень, ну где ${Food.byId(c.queue[0]).ru.toLowerCase()}? Долма стынет!` : `Джан: Allora?! ${Food.byId(c.queue[0]).it}! (${Food.byId(c.queue[0]).ru.toLowerCase()})`, 2000);
        this.updGoal(); } });
  }
  // ---------- застолье ----------
  async feast() {
    Save.store("kitchen", { feast: true });   // автосохранение: при «Продолжить» сразу к застолью
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
    this.time.delayedCall(750, () => this.scene.start("transit", { route: "walk", next: "run" }));
  }
}
