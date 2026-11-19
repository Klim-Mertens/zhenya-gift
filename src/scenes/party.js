/* Финал главы 4: вечеринка-сюрприз дома у Лоренцо.
   Темно → «SORPRESA!» → все друзья и Егор (он и подкладывал открытки), родители по видео на ноутбуке.
   Женя обходит гостей (список «Интересное рядом»), Егор протягивает «ложечку» (опять половник!), потом свечи на торте. */
"use strict";
class PartyScene extends Phaser.Scene {
  constructor() { super("party"); }
  create() {
    Save.store("party"); Sound.stopMusic(); UI.goal(""); UI.hint("");
    const add = (k, cv) => { if (!this.textures.exists(k)) this.textures.addCanvas(k, cv); };
    const D = DanceArt.dana(); D.front.forEach((c, i) => add(`da_front_${i}`, c)); add("da_blink", D.blink);
    add("pc_ladle", EgorArt.item("ladle"));
    this.st = { light: 0, confetti: [], candles: true, flash: 0 };
    this.cameras.main.fadeIn(800, 0, 0, 0);
    World.backdrop(this, "party_bg", (g, t) => this.draw(g, t), -1000);
    World.backdrop(this, "party_fx", (g, t) => this.fx(g, t), 6000);
    // гости
    this.npcs = {
      na: World.npc(this, "na_front_0", "na_blink", 64, 132, .2), gi: World.npc(this, "gi_idle", "gi_blink", 86, 134, 1.1),
      eg: World.npc(this, "eg_front_0", "eg_blink", 140, 102, .7),
      le: World.npc(this, "le_run_front_0", "le_run_blink", 236, 132, 2.1), da: World.npc(this, "da_front_0", "da_blink", 260, 136, 1.6)
    };
    this.lo = World.npc(this, "lo_front_0", "lo_blink", 30, 102, 1.4); this.lo.spr.setAlpha(0);
    this.zh = World.player(this, World.frameKeys("zh_summer"), 22, 100);
    this.zh.spr.setAlpha(0); this.zh.frozen = true;
    this.zh.blockers = [[0, 0, 320, 98], [124, 104, 72, 24], [276, 100, 44, 20], [0, 0, 4, 180], [316, 0, 4, 180], [0, 176, 320, 4]];
    this.talked = {};
    const talk = (id, label, task, fn) => ({ get x() { return id === "lo" ? self.lo.spr.x : self.npcs[id] ? self.npcs[id].spr.x : 0; }, get y() { return (id === "lo" ? self.lo.spr.y : self.npcs[id].spr.y) + (id === "eg" ? 22 : 2); },
      r: 18, label, task, markDy: id === "eg" ? 48 : 30, enabled: () => this.free && !this.talked[id], use: async () => { this.talked[id] = true; this.zh.frozen = true; await fn(); this.zh.frozen = false; this.updGoal(); } });
    const self = this;
    this.inter = World.interactions(this, this.zh, [
      talk("eg", "обнять брата", "поговорить с Егором", () => this.egor()),
      talk("na", "поговорить с Нариной и Джаном", "Нарина и Джан", () => UI.say([
        { who: "na", text: "С днём рождения, родная! Джан неделю учил поздравление по-русски." },
        { who: "gi", text: "Же-ня! С... днём... рож-де-ни-я! Ти — су-пер! Salute!" },
        { who: "na", text: "Он поднимает бокал. Говорит, что это лучший день в году, потому что ты родилась." },
        { who: "zhs", text: "Grazie, Джан! Ты тоже супер!" }])),
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
      { x: 294, y: 124, r: 18, label: "поговорить с мамой и папой по видео", task: "мама и папа на ноутбуке", enabled: () => this.free && !this.talked.pa,
        use: async () => { this.talked.pa = true; this.zh.frozen = true; this.st.call = true; Sound.sfx("ding");
          await UI.say([
            { who: "mama", text: "Женечка, с днём рождения, доченька! Мы тебя очень-очень любим!" },
            { who: "papa", text: "С днём рождения! Здоровья, счастья, и чтобы Спартак... то есть чтобы у тебя всё было отлично!" },
            { who: "mama", text: "Жалко, блинов с икрой на всех не напечёшь через экран. Приезжайте зимой!" },
            { who: "zhs", text: "Обязательно приедем! Я вас люблю!" }]);
          this.zh.frozen = false; this.updGoal(); } },
      { x: 178, y: 132, r: 16, label: "задуть свечи на торте", enabled: () => this.free && this.allTalked(), use: () => this.candles() }
    ]);
    this.time.delayedCall(900, () => this.intro());
  }
  allTalked() { return ["eg", "na", "le", "da", "lo", "pa"].every(k => this.talked[k]); }
  updGoal() {
    const left = ["eg", "na", "le", "da", "lo", "pa"].filter(k => !this.talked[k]).length;
    UI.goal(left ? `Поздравления: подойди ко всем гостям (осталось ${left})` : "Задуй свечи на торте!");
  }
  async intro() {
    Sound.sfx("door"); this.tweens.add({ targets: [this.zh.spr, this.lo.spr], alpha: 1, duration: 400 });
    await World.walkTo(this, this.zh, 44, 140, 40);
    this.tweens.add({ targets: this.lo.spr, x: 26, y: 142, duration: 900 }); this.lo.spr.setDepth(142);
    this.zh.face("side", false);
    await UI.say([{ who: "zhs", text: "Лоренцо, а почему так темно? Где тут выключатель?" }, { who: "lo", text: "Сейчас найду... Uno... due... TRE!" }]);
    // свет!
    this.tweens.add({ targets: this.st, light: 1, duration: 250 }); Sound.sfx("party"); this.burst(160, 60, 120);
    Sound.play("birthday");
    UI.banner('<div class="syl"><span>SOR</span><span>PRE</span><span>SA!</span></div>', "chant", 2200);
    await World.wait(this, 2300);
    await UI.say([
      { who: "zhs", text: "А-А-А! Что?! Вы все здесь?!" },
      { who: "eg", text: "С днём рождения, сестрёнка!" },
      { who: "zhs", text: "ЕГОР?! Ты в Милане?! Так это ты весь день подкладывал мне открытки?!" },
      { who: "eg", text: "Четыре открытки — четыре наших воспоминания. А пятое сделаем сегодня, все вместе." },
      { who: "na", text: "Мы еле удержались, чтобы не проболтаться!" },
      { who: "lo", text: "Я же говорил: я ничего не знаю. Niente!" }
    ]);
    this.free = true; this.zh.frozen = false; this.updGoal();
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
      { who: "eg", text: "Это традиция! Чайные ложечки — для слабаков." }
    ]);
    this.tweens.add({ targets: img, alpha: 0, scale: 1, duration: 400, onComplete: () => img.destroy() });
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
    const c = document.getElementById("card"); c.hidden = false; c.classList.remove("show");
    document.getElementById("ctitle").textContent = "Продолжение следует";
    document.getElementById("csub").textContent = "Пробел — в главное меню";
    const key = ev => { if (ev.code === "Space" || ev.code === "Enter") { ev.preventDefault(); window.removeEventListener("keydown", key); c.hidden = true; this.scene.start("title", { music: "credits" }); } };
    window.addEventListener("keydown", key);
    this.events.once("shutdown", () => window.removeEventListener("keydown", key));
  }
  burst(x, y, n) {
    const cols = ["#ff5a7a", "#ffd84a", "#5ad0ff", "#8aff8a", "#ff9aff", "#ffffff"];
    for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90;
      this.st.confetti.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, c: cols[k % cols.length], life: 2.5 + Math.random() * 2, w: Math.random() < .5 ? 2 : 1 }); }
  }
  update(time, dt) {
    this.zh.update(dt); this.inter.update(); this.lo.update(); Object.values(this.npcs).forEach(n => n.update());
    // гости смотрят на Женю, когда она рядом (поворот спрайта)
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
    R(g, 284, 82, 24, 16, "#2a2a34"); R(g, 286, 84, 20, 12, st.call ? "#bfe4ff" : "#3a4a6a"); R(g, 282, 97, 28, 2, "#8a8a98");
    if (st.call) { const ma = UI.portrait("mama"), pa = UI.portrait("papa"); if (ma) g.drawImage(ma, 0, 0, 16, 16, 286, 84, 10, 10); if (pa) g.drawImage(pa, 0, 0, 16, 16, 296, 84, 10, 10); }
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
