/* Финал главы 4: вечеринка-сюрприз дома у Лоренцо.
   Темно → «SORPRESA!» → все друзья и Егор (он и подкладывал открытки), родители, коллеги из Lido с плюшевым гусем, гости.
   Женя обходит гостей (список «Интересное рядом»), Егор протягивает «ложечку» (опять половник!), потом свечи на торте. */
"use strict";
class PartyScene extends Phaser.Scene {
  constructor() { super("party"); }
  create() {
    Save.store("party"); Sound.stopMusic(); UI.goal(""); UI.hint("");
    const add = (k, cv) => { if (!this.textures.exists(k)) this.textures.addCanvas(k, cv); };
    const D = DanceArt.dana(); D.front.forEach((c, i) => add(`da_front_${i}`, c)); add("da_blink", D.blink);
    add("pc_ladle", EgorArt.item("ladle")); add("goose", EgorArt.goose());
    // массовка и коллеги: мужчины — шаблон Егора, женщины — шаблон Жени, другие цвета
    const T = People.templates();
    const woman = o => { const pal = Object.assign({}, T.ZH_PAL, o); const F = T.ZH_FRONT;
      return { idle: PK.sprite(F.concat(T.LEGS.stand), pal), blink: PK.sprite(F.map((r, i) => i === 8 ? "..oHSSSSSSSSHo.." : i === 9 ? "..oHSSoSSoSSHo.." : r).concat(T.LEGS.stand), pal) }; };
    const GUESTS = {
      c1: woman({ H: "#2a1c18", h: "#1a100c", L: "#4a3028", W: "#3a6ac8", w: "#2a4a98", J: "#2a2a34", j: "#1a1a24" }),
      c2: EgorArt.variant({ H: "#c8a060", h: "#9a7840", k: "#d8b878", K: "#f4f0e8", q: "#c8c4bc", d: "#a8a49c", J: "#4a4a5a" }),
      c3: woman({ H: "#b8402a", h: "#8a2a1a", L: "#d8603a", W: "#3a9a6a", w: "#2a7a4a", J: "#e8dcc8", j: "#c8bca8" }),
      x1: EgorArt.variant({ H: "#1a1a1e", h: "#0e0e12", k: "#3a3a3e", S: "#c8906a", s: "#a8704a", K: "#d8302c", q: "#a8201c", d: "#8a1a18" }),
      x2: woman({ H: "#f0d890", h: "#c8b060", L: "#fff0b8", W: "#ff8ab0", w: "#d86a90" }),
      x3: EgorArt.variant({ bald: true, beard: true, S: "#e8b48e", s: "#c48a66", h: "#6a4a3a", K: "#4a4a5a", q: "#3a3a48", d: "#2a2a34", J: "#2a2a34" }),
      x4: woman({ H: "#3a2418", h: "#24140c", L: "#5a3a28", S: "#a8704a", s: "#88583a", W: "#f2c23a", w: "#c89a1a", J: "#3a3a8a" }),
      x5: woman({ H: "#8a8a92", h: "#6a6a72", L: "#b8b8c0", W: "#8a4ab8", w: "#6a2a98" }),
      x6: EgorArt.variant({ H: "#7a3a1a", h: "#5a2a10", k: "#9a5a2a", K: "#f4f0e8", q: "#d8d4cc", d: "#c8c4bc", J: "#6a4a2a" })
    };
    Object.entries(GUESTS).forEach(([k, v]) => { add(`pg_${k}`, v.idle); add(`pg_${k}_b`, v.blink); });
    UI.speaker("lido", "Коллеги из Lido", People.portrait(GUESTS.c1.idle), "#5ab0ff");
    UI.speaker("lido2", "Коллега из Lido", People.portrait(GUESTS.c2.idle), "#5ab0ff");
    UI.speaker("lido3", "Коллега из Lido", People.portrait(GUESTS.c3.idle), "#5ab0ff");
    ["x1", "x2", "x3", "x4", "x5", "x6"].forEach(k => UI.speaker("g" + k, "Гость", People.portrait(GUESTS[k].idle), "#d8c8b0"));
    this.st = { light: 0, confetti: [], candles: true, flash: 0 };
    this.cameras.main.fadeIn(800, 0, 0, 0);
    World.backdrop(this, "party_bg", (g, t) => this.draw(g, t), -1000);
    World.backdrop(this, "party_fx", (g, t) => this.fx(g, t), 6000);
    // гости (координаты — ноги)
    const N = (k, idle, blink, x, y, ph) => World.npc(this, idle, blink, x, y, ph);
    this.npcs = {
      eg: N("eg", "eg_front_0", "eg_blink", 140, 104, .7),
      na: N("na", "na_front_0", "na_blink", 56, 120, .2), gi: N("gi", "gi_idle", "gi_blink", 76, 122, 1.1),
      pa: N("pa", "pa_home_idle", "pa_home_blink", 98, 160, .4), ma: N("ma", "ma_home_idle", "ma_home_blink", 116, 162, 1.9),
      le: N("le", "le_run_front_0", "le_run_blink", 230, 120, 2.1), da: N("da", "da_front_0", "da_blink", 252, 122, 1.6),
      c1: N("c1", "pg_c1", "pg_c1_b", 206, 162, .9), c2: N("c2", "pg_c2", "pg_c2_b", 224, 164, 2.4), c3: N("c3", "pg_c3", "pg_c3_b", 242, 162, .1),
      x1: N("x1", "pg_x1", "pg_x1_b", 104, 116, 1.3), x2: N("x2", "pg_x2", "pg_x2_b", 210, 112, 2.8), x3: N("x3", "pg_x3", "pg_x3_b", 292, 134, .5),
      x4: N("x4", "pg_x4", "pg_x4_b", 302, 162, 1.7), x5: N("x5", "pg_x5", "pg_x5_b", 30, 168, 3.1), x6: N("x6", "pg_x6", "pg_x6_b", 156, 166, 2.2)
    };
    this.gooseImg = this.add.image(233, 152, "goose").setOrigin(.5, 1).setDepth(165);   // гусь в руках у коллеги
    this.lo = World.npc(this, "lo_front_0", "lo_blink", 30, 102, 1.4); this.lo.spr.setAlpha(0);
    this.zh = World.player(this, World.frameKeys("zh_summer"), 22, 102);
    this.zh.spr.setAlpha(0); this.zh.frozen = true;
    // стена; стол целиком (за него зайти нельзя — там стоит Егор); столик; края; гости — небольшие «ноги»-препятствия
    this.zh.blockers = [[0, 0, 320, 100], [122, 96, 76, 32], [276, 96, 44, 22], [0, 0, 4, 180], [316, 0, 4, 180], [0, 176, 320, 4]];
    Object.entries(this.npcs).forEach(([k, n]) => { if (k !== "eg") this.zh.blockers.push([n.spr.x - 6, n.spr.y - 5, 12, 6]); });
    this.talked = {};
    const self = this, TASKS = this.TASKS = ["eg", "na", "pa", "lido", "le", "da", "lo"];
    // точка разговора: прямо перед гостем; у Егора — перед столом
    const spot = id => id === "lo" ? [self.lo.spr.x + 10, self.lo.spr.y] : id === "eg" ? [140, 134] : id === "pa" ? [107, 168] : id === "lido" ? [224, 172] : id === "na" ? [66, 128] : [self.npcs[id].spr.x, self.npcs[id].spr.y + 8];
    const talk = (id, label, task, fn) => ({ get x() { return spot(id)[0]; }, get y() { return spot(id)[1]; }, r: 16, label, task,
      markDy: id === "eg" ? 56 : 36, enabled: () => this.free && !this.talked[id],
      use: async () => { this.talked[id] = true; this.zh.frozen = true; await fn(); this.zh.frozen = false; this.updGoal(); } });
    const extra = (id, lines) => ({ get x() { return self.npcs[id].spr.x; }, get y() { return self.npcs[id].spr.y + 7; }, r: 14, label: "поболтать с гостем",
      enabled: () => this.free, use: async () => { this.zh.frozen = true; await UI.say(lines); this.zh.frozen = false; } });
    this.inter = World.interactions(this, this.zh, [
      talk("eg", "обнять брата", "поговорить с Егором", () => this.egor()),
      talk("na", "поговорить с Нариной и Джаном", "Нарина и Джан", () => UI.say([
        { who: "na", text: "С днём рождения, родная! Джан неделю учил поздравление по-русски." },
        { who: "gi", text: "Же-ня! С... днём... рож-де-ни-я! Ти — су-пер! Salute!" },
        { who: "na", text: "Он поднимает бокал. Говорит, что это лучший день в году, потому что ты родилась." },
        { who: "zhs", text: "Grazie, Джан! Ты тоже супер!" }])),
      talk("pa", "обнять маму и папу", "мама и папа", () => UI.say([
        { who: "mama", text: "Женечка, с днём рождения, доченька! Мы тебя очень-очень любим!" },
        { who: "mama", text: "Я блинов с икрой напекла, целую гору. Всех итальянцев накормим!" },
        { who: "papa", text: "С днём рождения, дочка! А теперь все вместе: МО-СКОВ-СКИЙ..." },
        { who: "mama", text: "Лёша!" },
        { who: "papa", text: "...ДЕНЬ РОЖ-ДЕ-НИ-Я! Ну а что, тоже в ритм!" },
        { who: "zhs", text: "Ахаха! Пап, мам, я так рада, что вы здесь!" }])),
      talk("lido", "поговорить с коллегами из Lido", "коллеги из Lido", () => this.lido()),
      talk("le", "поговорить с Лерой", "Лера", () => UI.say([
        { who: "le", text: "С днём рождения, чемпионка! Желаю, чтобы каждый забег заканчивался джелато!" },
        { who: "zhs", text: "И чтобы самокатчики объезжали меня стороной!" },
        { who: "le", text: "Договорились. А завтра — реванш один на один!" }])),
      talk("da", "поговорить с Даной", "Дана", () => UI.say([
        { who: "da", text: "Именинница! После торта — танцпол. Vogue, High Heels, всё, что захочешь!" },
        { who: "zhs", text: "Только без стрелочек на скорость, умоляю!" },
        { who: "da", text: "Сегодня никаких оценок. Сегодня ты звезда!" }])),
      talk("lo", "поговорить с Лоренцо", "Лоренцо", () => UI.say([
        { who: "zhs", text: "Так ты всё знал! «Niente, ничего»... Артист!" },
        { who: "lo", text: "Твой брат написал мне месяц назад. Я молчал, как партизан. Так говорят, да?" },
        { who: "lo", text: "Amore, с днём рождения. С тобой каждый день как сегодняшний закат." },
        { who: "zhs", text: "Это самый лучший день." }])),
      extra("x1", [{ who: "gx1", text: "Tanti auguri! Я друг Лоренцо. Он про тебя столько рассказывал!" }]),
      extra("x2", [{ who: "gx2", text: "Buon compleanno! А правда, что в России сейчас минус двадцать?" }, { who: "zhs", text: "Правда. Поэтому я здесь!" }]),
      extra("x3", [{ who: "gx3", text: "Auguri! Я сосед Лоренцо. Если будет шумно — я и сам приду танцевать!" }]),
      extra("x4", [{ who: "gx4", text: "С днём рождения! Торт выглядит потрясающе. Когда режем?" }]),
      extra("x5", [{ who: "gx5", text: "Cara, sei bellissima! Счастья тебе!" }]),
      extra("x6", [{ who: "gx6", text: "Auguri! Говорят, твой брат прилетел ради этого вечера. Вот это семья!" }]),
      { x: 178, y: 134, r: 14, label: "задуть свечи на торте", enabled: () => this.free && this.allTalked(), use: () => this.candles() }
    ]);
    this.time.delayedCall(900, () => this.intro());
  }
  allTalked() { return this.TASKS.every(k => this.talked[k]); }
  updGoal() {
    const left = this.TASKS.filter(k => !this.talked[k]).length;
    UI.goal(left ? `Поздравления: подойди к гостям из списка (осталось ${left})` : "Все поздравили! Теперь задуй свечи на торте");
  }
  async intro() {
    Sound.sfx("door"); this.tweens.add({ targets: [this.zh.spr, this.lo.spr], alpha: 1, duration: 400 });
    await World.walkTo(this, this.zh, 44, 140, 40);
    this.tweens.add({ targets: this.lo.spr, x: 22, y: 146, duration: 900 }); this.lo.spr.setDepth(146);
    this.zh.face("side", false);
    await UI.say([{ who: "zhs", text: "Лоренцо, а почему так темно? Где тут выключатель?" }, { who: "lo", text: "Сейчас найду... Uno... due... TRE!" }]);
    // свет!
    this.tweens.add({ targets: this.st, light: 1, duration: 250 }); Sound.sfx("party"); this.burst(160, 60, 140);
    Sound.play("birthday");
    UI.banner('<div class="syl"><span>SOR</span><span>PRE</span><span>SA!</span></div>', "chant", 2200);
    await World.wait(this, 2300);
    await UI.say([
      { who: "zhs", text: "А-А-А! Что?! Вы все здесь?!" },
      { who: "eg", text: "С днём рождения, сестрёнка!" },
      { who: "zhs", text: "ЕГОР?! Ты в Милане?! Так это ты весь день подкладывал мне открытки?!" },
      { who: "eg", text: "Четыре открытки — четыре наших воспоминания. А сегодня мы сделаем новое, все вместе." },
      { who: "zhs", text: "Подожди... Мама? Папа?! И вы здесь?!" },
      { who: "mama", text: "Сюрприз, доченька! Разве мы могли пропустить такой день?" },
      { who: "lido", text: "И мы! Вся команда Lido в сборе!" },
      { who: "na", text: "Мы еле удержались, чтобы не проболтаться!" },
      { who: "lo", text: "А я же говорил: я ничего не знаю. Niente!" }
    ]);
    this.free = true; this.zh.frozen = false; this.updGoal();
  }
  async lido() {
    await UI.say([
      { who: "lido", text: "Женя, с днём рождения от всей нашей команды Lido!" },
      { who: "lido2", text: "Мы долго выбирали подарок... и выбрали самый лучший." },
      { who: "lido3", text: "Встречай! Белый гусь!" }
    ]);
    // гусь «летит» к Жене и дальше остаётся у неё в руках
    const z = this.zh.spr; Sound.sfx("flap");
    await new Promise(r => this.tweens.add({ targets: this.gooseImg, x: z.x + 9, y: z.y - 6, duration: 700, ease: "Sine.easeInOut", onComplete: r }));
    this.gooseHeld = true; Sound.sfx("sparkle");
    await UI.say([
      { who: "zhs", text: "А-а-а, какой мягкий! Белый плюшевый гусь! Я его обожаю!" },
      { who: "lido2", text: "Пусть охраняет твой рабочий стол." },
      { who: "lido", text: "И напоминает: в Lido тебя все очень любят и ждут!" },
      { who: "zhs", text: "Спасибо, ребята! Гусь теперь официально член команды." }
    ]);
  }
  async egor() {
    await UI.say([
      { who: "zhs", text: "Иди сюда, обниму! Ты как вообще сюда добрался?" },
      { who: "eg", text: "Секрет фирмы. Главное — успел к торту." },
      { who: "zhs", text: "Кстати, о торте. Дай ложечку, попробую крем." },
      { who: "eg", text: "Держи!" }
    ]);
    // «ложечка» — огромный половник, как тогда с яблочным десертом
    const e = this.npcs.eg.spr, img = this.add.image(e.x + 10, e.y - 14, "pc_ladle").setScale(.5).setDepth(5500);
    this.tweens.add({ targets: img, scale: 2.4, x: e.x, y: e.y - 34, angle: -20, duration: 600, ease: "Back.easeOut" }); Sound.sfx("blip", .5);
    await World.wait(this, 900);
    await UI.say([
      { who: "zhs", text: "Опять половник?! Ахаха! Как тогда с яблочным десертом! Ничего не меняется!" },
      { who: "eg", text: "Это традиция! Посмотри, к нему кое-что приколото." }
    ]);
    this.tweens.add({ targets: img, alpha: 0, scale: 1, duration: 400, onComplete: () => img.destroy() });
    await Postcards.find(this, "dessert");   // пятая открытка и воспоминание про десерт
    await UI.say([{ who: "zhs", text: "Пять открыток — пять воспоминаний. Ты всё это придумал сам?" }, { who: "eg", text: "Ага. Чайные ложечки — для слабаков." }]);
    await UI.say([{ who: "eg", text: "А если серьёзно... Я тебя очень люблю, Жень. С днём рождения!" }, { who: "zhs", text: "И я тебя, братишка. Это лучший подарок." }]);
  }
  async candles() {
    this.free = false; this.zh.frozen = true; UI.goal(""); UI.hint("");
    await UI.say([{ who: "eg", text: "Все сюда! Женя, загадывай желание!" }, { who: "lo", text: "Uno, due, tre..." }]);
    await World.wait(this, 600);
    Sound.sfx("blow"); this.st.candles = false; this.st.smoke = this.time.now; await World.wait(this, 700);
    Sound.sfx("party"); this.burst(178, 96, 90); this.burst(80, 70, 50); this.burst(240, 70, 50); Sound.sfx("cheers");
    await UI.banner('<div class="syl"><span>AUGURI,</span><br><span>ЖЕНЯ!</span></div>', "chant", 2200);
    await UI.say([{ who: "na", text: "Все вместе на фото! Джан, ты в центр, ты самый высокий... то есть самый блестящий!" }]);
    // общее фото: вспышка
    Sound.sfx("shutter"); this.st.flash = this.time.now; await World.wait(this, 900);
    Save.store("party");
    await UI.card("С днём рождения, Женя!", "Все, кто тебя любит, сегодня рядом ★", 3600);
    // финальная игра во дворе
    await UI.say([
      { who: "papa", text: "Так, а теперь — последняя игра! Все во двор!" },
      { who: "eg", text: "Помнишь «Игру в кальмара», которую мы смотрели? Сейчас будет своя версия." },
      { who: "zhs", text: "Только не говорите, что папа будет куклой..." },
      { who: "papa", text: "Ещё как буду!" }
    ]);
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.time.delayedCall(950, () => this.scene.start("redlight"));
  }
  burst(x, y, n) {
    const cols = ["#ff5a7a", "#ffd84a", "#5ad0ff", "#8aff8a", "#ff9aff", "#ffffff"];
    for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90;
      this.st.confetti.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, c: cols[k % cols.length], life: 2.5 + Math.random() * 2, w: Math.random() < .5 ? 2 : 1 }); }
  }
  update(time, dt) {
    this.zh.update(dt); this.inter.update(); this.lo.update(); Object.values(this.npcs).forEach(n => n.update());
    if (this.gooseHeld) { const z = this.zh.spr, side = this.zh.dir === "side" ? (z.flipX ? -1 : 1) : 1;   // гусь в руках у Жени
      this.gooseImg.setPosition(z.x + 8 * side, z.y - 5).setFlipX(side < 0).setDepth(this.zh.dir === "back" ? z.y - 1 : z.y + 1); }
    const d = dt / 1000;
    this.st.confetti = this.st.confetti.filter(p => { p.vy += 120 * d; p.vx *= .985; p.x += p.vx * d; p.y += p.vy * d; p.life -= d; return p.life > 0 && p.y < 182; });
  }
  fx(g, t) {
    const st = this.st, R = PK.R;
    st.confetti.forEach(p => R(g, Math.round(p.x), Math.round(p.y), p.w, p.w === 2 ? 1 : 2, p.c));
    if (st.light < 1) { g.save(); g.globalAlpha = .88 * (1 - st.light); R(g, 0, 0, 320, 180, "#0a0812");
      g.globalAlpha = .35 * (1 - st.light); PK.ell(g, 178, 88, 26, 16, "#ffb060"); R(g, 169, 82, 18, 3, "#ffd84a"); g.restore(); }   // в темноте светятся только свечи
    if (st.flash && t - st.flash < 600) { g.save(); g.globalAlpha = 1 - (t - st.flash) / 600; R(g, 0, 0, 320, 180, "#ffffff"); g.restore(); }
  }
  draw(g, t) {
    const R = PK.R, P = PK.P, OL = RK.OL, s = t / 1000, st = this.st;
    // стены: тёплая штукатурка, плинтус
    R(g, 0, 0, 320, 98, "#efd9b8"); for (let x = 6; x < 320; x += 14) for (let y = 8; y < 92; y += 14) P(g, x + (y % 28 ? 7 : 0), y, "#e2c8a2");
    R(g, 0, 92, 320, 6, "#9a6a46"); R(g, 0, 92, 320, 1, "#b88a62");
    // пол: деревянные доски
    R(g, 0, 98, 320, 82, "#b4804e"); for (let y = 98; y < 180; y += 7) { R(g, 0, y, 320, 1, "#9a6a3e"); for (let x = (y * 7) % 40; x < 320; x += 40) R(g, x, y, 1, 7, "#9a6a3e"); }
    PK.ell(g, 160, 150, 90, 22, "#a83a3a"); PK.ell(g, 160, 150, 82, 18, "#c85a4a"); PK.ell(g, 160, 150, 60, 12, "#d8885a");   // ковёр
    // дверь слева
    R(g, 8, 36, 30, 60, "#7a4a2a"); RK.box(g, 8, 36, 30, 60, OL); R(g, 12, 40, 22, 24, "#8a5a36"); R(g, 12, 68, 22, 24, "#8a5a36"); P(g, 33, 66, "#f2c23a");
    // окно: ночной Милан, шпиль Дуомо, огни
    R(g, 214, 12, 80, 60, "#1a2048"); for (let k = 0; k < 30; k++) P(g, 216 + (k * 37) % 76, 14 + (k * 23) % 30, (k + Math.floor(s * 2)) % 7 ? "#f4f0e8" : "#1a2048");
    R(g, 214, 52, 80, 20, "#2a2a4a"); for (let k = 0; k < 18; k++) R(g, 216 + (k * 13) % 74, 54 + (k * 7) % 14, 2, 2, k % 3 ? "#ffd870" : "#ff9a5a");
    PK.poly(g, [[250, 52], [254, 28], [258, 52]], "#3a3a5a"); R(g, 253, 24, 2, 5, "#ffd870");
    RK.box(g, 214, 12, 80, 60, OL); R(g, 253, 12, 2, 60, "#f4ece0"); R(g, 214, 41, 80, 2, "#f4ece0");
    R(g, 206, 8, 10, 70, "#c8402a"); R(g, 292, 8, 10, 70, "#c8402a"); R(g, 206, 8, 96, 4, "#8a2a1a");
    // диван и подушки
    R(g, 44, 68, 70, 28, "#4a6a9a"); R(g, 40, 64, 78, 8, "#5a7aaa"); R(g, 40, 64, 8, 32, "#3a5a8a"); R(g, 110, 64, 8, 32, "#3a5a8a"); RK.box(g, 40, 64, 78, 32, OL);
    R(g, 52, 70, 12, 9, "#f2c23a"); R(g, 92, 70, 12, 9, "#ff7aa0");
    // полка с пластинками и растение
    R(g, 134, 50, 56, 4, "#7a4a2a"); [[138, "#d8302c"], [146, "#3a8a4a"], [154, "#2a4a8a"], [162, "#f2c23a"]].forEach(([x, c]) => R(g, x, 38, 6, 12, c));
    PK.ell(g, 178, 44, 6, 6, "#4a8a3a"); R(g, 175, 46, 6, 4, "#c86a3a");
    R(g, 196, 72, 10, 18, "#c86a3a"); [[201, 56, 7], [196, 62, 5], [206, 62, 5]].forEach(([x, y, r]) => { PK.ell(g, x, y, r, r - 1, "#2f6a2a"); PK.ell(g, x - 1, y - 1, r - 2, r - 2, "#4f9a3a"); });
    // гирлянда флажков и надпись
    for (let x = 4; x < 320; x += 12) { const y = 6 + Math.round(Math.sin(x / 50) * 3); PK.poly(g, [[x, y], [x + 10, y], [x + 5, y + 8]], ["#ff5a7a", "#ffd84a", "#5ad0ff", "#8ad86a"][(x / 12 | 0) % 4]); }
    R(g, 0, 5, 320, 1, "#8a6a4a");
    if (st.light > .5) StationArt.text(g, "BUON COMPLEANNO!", 118, 22, (Math.floor(s * 2) % 2) ? "#d8302c" : "#c8402a", 1);
    // лампочки
    for (let k = 0; k < 22; k++) { const x = 8 + k * 14, y = 32 + Math.round(Math.sin(k * .7) * 3); R(g, x, y, 2, 2, st.light > .5 && (k + Math.floor(s * 3)) % 3 ? ["#ffd870", "#ff8aa0", "#8ad8ff"][k % 3] : "#5a4a3a"); }
    // шарики
    [[124, 40, "#ff5a7a", 0], [132, 34, "#ffd84a", 1], [140, 42, "#5ad0ff", 2], [298, 82, "#ff9aff", 3], [306, 76, "#8ad86a", 4]].forEach(([x, y, c, k]) => {
      const by = y + Math.round(Math.sin(s * 1.6 + k) * 2); PK.line(g, x, by + 6, x + (k % 2 ? 2 : -2), by + 26, "#8a8a8a"); PK.ell(g, x, by, 5, 6, c); P(g, x - 2, by - 3, "#ffffff"); });
    // столик с ноутбуком (родители по видео)
    R(g, 276, 98, 40, 6, "#7a4a2a"); R(g, 280, 104, 3, 14, "#5a3a22"); R(g, 309, 104, 3, 14, "#5a3a22"); RK.box(g, 276, 98, 40, 6, OL);
    R(g, 284, 82, 24, 16, "#2a2a34"); R(g, 286, 84, 20, 12, "#1a2a4a"); R(g, 282, 97, 28, 2, "#8a8a98");
    if (st.light > .5) for (let k = 0; k < 6; k++) { const h = 2 + Math.round(Math.abs(Math.sin(s * 6 + k * 1.7)) * 8); R(g, 288 + k * 3, 95 - h, 2, h, ["#ff5a7a", "#ffd84a", "#5ad0ff"][k % 3]); }   // плейлист вечеринки
    // стол с тортом
    R(g, 126, 106, 68, 16, "#f4f0e8"); R(g, 126, 118, 68, 4, "#d8d0c4"); RK.box(g, 126, 106, 68, 16, OL);
    for (let x = 128; x < 194; x += 6) R(g, x, 121, 3, 3, "#e8e0d4");
    R(g, 130, 108, 12, 4, "#e8c060"); R(g, 178, 108, 12, 4, "#e8c060");   // тарелки
    g.save(); g.translate(18, 0);   // торт справа на столе, Егор стоит за столом слева
    R(g, 148, 96, 24, 12, "#ff9ac0"); R(g, 148, 96, 24, 3, "#fff0f6"); R(g, 152, 90, 16, 7, "#ffb8d4"); R(g, 152, 90, 16, 2, "#fff0f6"); RK.box(g, 148, 96, 24, 12, OL); RK.box(g, 152, 90, 16, 7, OL);
    for (let k = 0; k < 5; k++) { const x = 153 + k * 3; R(g, x, 85, 1, 5, ["#5ad0ff", "#ffd84a", "#ff5a7a"][k % 3]);
      if (st.candles && st.light > .2) { const f = Math.floor(s * 10 + k) % 2; P(g, x, 83 - f, "#ffd84a"); P(g, x, 84, "#ff8a2a"); } }
    if (st.smoke && t - st.smoke < 1800) { const k = (t - st.smoke) / 1800; g.save(); g.globalAlpha = .6 * (1 - k); for (let i = 0; i < 5; i++) PK.ell(g, 154 + i * 3, 80 - k * 20 - (i % 2) * 3, 1 + k * 2, 1 + k * 2, "#d8d8e0"); g.restore(); }
    g.restore();
  }
}
