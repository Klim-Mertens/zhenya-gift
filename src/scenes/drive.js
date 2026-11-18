/* Глава 4: «Закат с Лоренцо».
   Часть 1 — DriveScene «Серпантин к закату»: Лоренцо даёт Жене порулить. Вид сверху, дорога петляет вверх по холму.
   ← → — руль, ↑ — газ, ↓ — тормоз. Обочина тормозит, козы/велосипедисты/мопеды — столкновение и остановка.
   Нужно доехать до вершины, пока солнце не село (шкала солнца справа вверху). Не успела — дорога становится проще.
   Часть 2 — SunsetScene: вершина, цветы, поцелуй, футболка «Интер/Спартак» и видеозвонок родителям. */
"use strict";
class DriveScene extends Phaser.Scene {
  constructor() { super("drive"); }
  // уровни: T — секунд до заката, w — ширина дороги, obs — сколько препятствий (доля)
  static LEVELS = [
    { T: 72, w: 70, obs: 1 }, { T: 95, w: 78, obs: .75 }, { T: 110, w: 86, obs: .5 }, { T: 135, w: 96, obs: .3 }
  ];
  static hash(k) { let h = Math.imul(k ^ 0x9e3779b9, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return (h >>> 0) % 2147483646 + 1; }
  get L() { return DriveScene.LEVELS[Math.min(this.fails, DriveScene.LEVELS.length - 1)]; }
  create() {
    Save.store("drive"); Sound.play("piazza"); UI.goal(""); UI.hint("");
    this.cameras.main.fadeIn(700, 0, 0, 0);
    const A = LorenzoArt;
    this.img = { car: A.car(false), brake: A.car(true), goat: [A.goat(0), A.goat(1)], cyclist: [A.cyclist(0), A.cyclist(1)], vespa: A.vespa(),
      flowers: ["#f4f0e8", "#ff9ad0", "#f2d23a"].map(A.flower), grass: A.grassTile(), cypress: A.cypress(), olive: A.olive(), vines: A.vines(), lavender: A.lavender(), house: A.house(), rock: A.rock() };
    this.fails = 0; this.D = 5200; this.CY = 138; this.state = "intro";
    this.keys = this.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D");
    this.reset();
    World.backdrop(this, "drive_bg", (g, t) => this.draw(g, t), -1000);
    this.time.delayedCall(800, () => this.intro());
  }
  reset() {
    this.dist = 0; this.x = this.cx(0); this.vx = 0; this.v = 0; this.sun = 1; this.stun = 0; this.obs = []; this.nextObs = 260; this.got = 0;
    this.flowers = []; for (let d = 300; d < this.D - 100; d += 230 + (d * 7) % 120) this.flowers.push({ d, side: (d / 230 | 0) % 2 ? 1 : -1, col: (d / 100 | 0) % 3, taken: false });
    this.offT = 0; this.hitMsg = 0;
  }
  // центр дороги на расстоянии d: петли становятся круче ближе к вершине
  cx(d) { const k = Math.min(1, d / this.D), A = 46 + 44 * k; return 160 + A * (.62 * Math.sin(d / 170) + .38 * Math.sin(d / 71 + 1.3)); }
  async intro() {
    await UI.say([
      { who: "lo", text: "Ciao, amore! Как танцы? Лера уже написала, что ты всех порвала!" },
      { who: "zhs", text: "Лоренцо! Ноги гудят, но я самая счастливая." },
      { who: "lo", text: "Тогда садись. Я знаю место, откуда лучший закат в Ломбардии. Только надо успеть, пока солнце не село!" },
      { who: "lo", text: "Хочешь порулить? Серпантин, козы, велосипедисты... Ты справишься, я рядом." }
    ]);
    const im = this.img;
    await UI.rules("Серпантин к закату!", [
      { keys: ["←", "→"], icons: [im.car], text: "Руль: держись на дороге. На обочине машина еле ползёт." },
      { keys: ["↑", "↓"], text: "↑ — газ, ↓ — тормоз. На крутых поворотах лучше притормозить." },
      { icons: [im.goat[0], im.cyclist[0], im.vespa], text: "Объезжай коз, велосипедистов и мопеды. Врезалась — машина встанет, время уходит." },
      { icons: im.flowers, text: "Полевые цветы у обочины — по желанию, для букета." },
      { text: "Доберись до вершины, пока солнце не село (шкала справа вверху). Не успела — дорога станет проще." }
    ]);
    await this.countdown();
  }
  async countdown() {
    for (const n of ["3", "2", "1"]) { UI.banner(`<div class="syl"><span>${n}</span></div>`, "chant", 600); Sound.sfx("blip", 1.6); await World.wait(this, 650); }
    Sound.sfx("pick"); this.state = "play"; UI.goal("Вверх к закату! ← → руль, ↑ газ, ↓ тормоз");
  }
  spawn() {
    const r = Math.random(), d = this.dist + 230;
    if (r < .38) this.obs.push({ type: "goat", d, xo: -this.L.w / 2 - 14, vxo: 16 + Math.random() * 10, f: 0, w: 12, h: 8 });
    else if (r < .72) this.obs.push({ type: "cyclist", d, xo: this.L.w / 4, vd: 42, w: 7, h: 14 });
    else this.obs.push({ type: "vespa", d: d + 60, xo: -this.L.w / 4, vd: -60, w: 7, h: 14 });
    this.nextObs = (170 + Math.random() * 180) / this.L.obs;
  }
  update(time, dtMs) {
    const dt = Math.min(.05, dtMs / 1000), K = this.keys;
    if (this.state !== "play" || UI.busy) return;
    const dir = ((K.RIGHT.isDown || K.D.isDown) ? 1 : 0) - ((K.LEFT.isDown || K.A.isDown) ? 1 : 0);
    const gas = K.UP.isDown || K.W.isDown, brake = K.DOWN.isDown || K.S.isDown;
    this.brakeOn = brake;
    this.stun = Math.max(0, this.stun - dt);
    // руль и скорость
    this.vx += (dir * 115 - this.vx) * Math.min(1, dt * 9); this.x += this.vx * dt; this.x = Math.max(6, Math.min(314, this.x));
    const target = this.stun ? 0 : brake ? 45 : gas ? 140 : 95;
    this.v += (target - this.v) * Math.min(1, dt * (brake || this.stun ? 4 : 1.6));
    const off = Math.abs(this.x - this.cx(this.dist)) > this.L.w / 2 - 5;
    if (off) { this.v = Math.min(this.v, 42); this.offT += dt; if (this.offT > 1.2) { this.offT = -2; UI.toast("Лоренцо: Piano! Мы на обочине!", 1200); } } else this.offT = Math.min(this.offT, 0) + 0;
    this.dist += this.v * dt; this.sun -= dt / this.L.T;
    // препятствия
    this.nextObs -= this.v * dt; if (this.nextObs <= 0 && this.dist < this.D - 300) this.spawn();
    this.obs.forEach(o => {
      if (o.type === "goat") { o.xo += o.vxo * dt; o.f += dt; } else o.d += o.vd * dt;
      const ox = this.cx(o.d) + o.xo, oy = this.CY - (o.d - this.dist);
      if (!o.hit && Math.abs(ox - this.x) < o.w / 2 + 6 && Math.abs(oy - this.CY) < o.h / 2 + 11) {
        o.hit = true; this.stun = .7; this.v = 0; Sound.sfx("wrong"); this.cameras.main.shake(180, .006);
        UI.toast({ goat: "Бе-е-е! Коза обиделась.", cyclist: "Scusi! Велосипедист ругается по-итальянски.", vespa: "Мопед! Чуть не столкнулись!" }[o.type], 1400);
      }
    });
    this.obs = this.obs.filter(o => o.d > this.dist - 80 && o.d < this.dist + 400 && !(o.type === "goat" && o.xo > this.L.w / 2 + 30));
    // цветы
    this.flowers.forEach(f => { if (f.taken) return; const fx = this.cx(f.d) + f.side * (this.L.w / 2 - 6), fy = this.CY - (f.d - this.dist);
      if (Math.abs(fx - this.x) < 9 && Math.abs(fy - this.CY) < 12) { f.taken = true; this.got++; Sound.sfx("sparkle"); } });
    UI.goal(`До вершины: ${Math.max(0, Math.round((this.D - this.dist) / 52))} м · цветов: ${this.got}`);
    if (this.dist >= this.D) this.finish();
    else if (this.sun <= 0) this.fail();
  }
  async fail() {
    this.state = "fail"; UI.goal(""); Sound.sfx("wrong");
    this.fails++;
    await UI.say([
      { who: "lo", text: "Ох, солнце почти село... Ничего! Давай ещё раз, я подскажу дорогу." },
      { who: "lo", text: this.fails >= 2 ? "Возьмём другую дорогу: она шире, и коз там меньше. Не спеши на поворотах!" : "Держи газ на прямых, а перед поворотами чуть тормози." }
    ]);
    this.reset(); await this.countdown();
  }
  async finish() {
    this.state = "done"; UI.goal(""); Sound.sfx("done");
    this.cameras.main.fadeOut(900, 255, 200, 140);
    this.time.delayedCall(950, () => this.scene.start("sunset", { flowers: this.got }));
  }
  // ---------- отрисовка ----------
  draw(g, t) {
    const R = PK.R, s = t / 1000, im = this.img, CY = this.CY, w = this.L.w;
    // трава прокручивается вниз
    const oy = Math.round(this.dist % 180); g.drawImage(im.grass, 0, oy - 180); g.drawImage(im.grass, 0, oy);
    // декорации: кипарисы, виноградники, камни — по сегментам дороги (всегда одинаковые)
    for (let k = Math.floor((this.dist - 70) / 26); k < Math.floor((this.dist + 210) / 26); k++) {
      const rnd = PK.rng(DriveScene.hash(k)), _ = rnd(), d = k * 26, y = Math.round(CY - (d - this.dist));
      for (const side of [-1, 1]) { if (rnd() < .2) continue;
        const x = Math.round(this.cx(d) + side * (w / 2 + 20 + rnd() * 100)), dy = Math.round(rnd() * 12);
        const kind = rnd(), img = kind < .3 ? im.cypress : kind < .5 ? im.olive : kind < .66 ? im.vines : kind < .78 ? im.lavender : kind < .86 ? im.house : im.rock;
        g.drawImage(img, x - img.width / 2, y + dy - img.height / 2); }
    }
    // дорога построчно (каждые 2 px): обочина, асфальт, разметка, отбойник
    for (let y = 0; y < 180; y += 2) {
      const d = this.dist + (CY - y), c = Math.round(this.cx(d)), l = c - w / 2;
      R(g, l - 4, y, w + 8, 2, "#d8c8a0"); R(g, l, y, w, 2, "#5a5a66");
      if (Math.floor(d / 12) % 2) R(g, c - 1, y, 2, 2, "#f4f0e8");
      R(g, l + 2, y, 1, 2, "#e8e0d0"); R(g, l + w - 3, y, 1, 2, "#e8e0d0");
      R(g, l + w + 4, y, 2, 2, "#c8c8d0"); if (Math.floor(d / 16) % 3 === 0) R(g, l + w + 4, y, 2, 2, "#6a6a72");
    }
    // цветы у обочины
    this.flowers.forEach(f => { if (f.taken) return; const y = CY - (f.d - this.dist); if (y < -10 || y > 190) return;
      g.drawImage(im.flowers[f.col], Math.round(this.cx(f.d) + f.side * (w / 2 - 6)) - 3, Math.round(y) - 3); });
    // препятствия
    this.obs.forEach(o => { const y = CY - (o.d - this.dist), x = this.cx(o.d) + o.xo; if (y < -20 || y > 200) return;
      const img = o.type === "goat" ? im.goat[Math.floor(o.f * 6) % 2] : o.type === "cyclist" ? im.cyclist[Math.floor(s * 6) % 2] : im.vespa;
      g.save(); if (o.type === "vespa") { g.translate(Math.round(x), Math.round(y)); g.rotate(Math.PI); g.drawImage(img, -img.width / 2, -img.height / 2); }
      else g.drawImage(img, Math.round(x - img.width / 2), Math.round(y - img.height / 2)); g.restore(); });
    // машина (немного наклоняется в поворот)
    g.save(); g.globalAlpha = .3; R(g, Math.round(this.x) - 6, CY - 10, 15, 25, "#000"); g.restore();
    g.save(); g.translate(Math.round(this.x), CY); g.rotate(this.vx / 115 * .18 + (this.stun ? Math.sin(s * 40) * .08 : 0));
    g.drawImage(this.brakeOn ? im.brake : im.car, -8, -13); g.restore();
    // закатный свет: чем ниже солнце, тем теплее
    const k = 1 - Math.max(0, this.sun);
    g.save(); g.globalAlpha = .08 + k * .3; R(g, 0, 0, 320, 180, k < .6 ? "#ffb060" : "#e8607a"); g.restore();
    if (this.state === "intro") return;
    // шкала солнца: горизонт и солнце, которое опускается
    R(g, 262, 6, 52, 30, "#3a2a4a"); PK.gradV(g, 263, 7, 50, 20, ["#5a8ad8", "#f0a070", "#e8607a"]); R(g, 263, 27, 50, 8, "#4a6a3a");
    PK.ell(g, 288, Math.round(10 + 18 * k), 5, 5, "#fff0a0"); R(g, 263, 27, 50, 8, "#4a6a3a"); RK.box(g, 262, 6, 52, 30, RK.OL);
    // дорога до вершины: вертикальная полоска слева
    R(g, 6, 20, 4, 140, "#3a3048"); const p = Math.min(1, this.dist / this.D); R(g, 6, 20 + 140 * (1 - p), 4, 140 * p, "#f2c23a"); RK.box(g, 5, 19, 6, 142, RK.OL);
    R(g, 4, 14, 8, 4, "#e8607a");
  }
}

class SunsetScene extends Phaser.Scene {
  constructor() { super("sunset"); }
  init(data) { this.flowers = (data && data.flowers) || 0; }
  create() {
    Save.store("sunset"); Sound.play("centrale"); UI.goal(""); UI.hint("");
    this.cameras.main.fadeIn(900, 255, 200, 140);
    this.bg = LorenzoArt.summit(); this.hearts = []; this.bouquet = false;
    World.backdrop(this, "sun_bg", (g, t) => this.draw(g, t), -1000);
    this.zh = World.npc(this, "zh_summer_front_0", "zh_summer_blink", 138, 124, .3);
    this.lo = World.npc(this, "lo_front_0", "lo_blink", 176, 124, 1.4);
    this.time.delayedCall(1000, () => this.story());
  }
  async story() {
    const cam = this.cameras.main;
    await UI.say([
      { who: "lo", text: "Успели! Смотри, amore..." },
      { who: "zhs", text: "Какая красота... Озеро как будто горит." },
      this.flowers ? { who: "zhs", text: `А я по дороге собрала полевые цветы, ${this.flowers} шт. Держи, это тебе!` } : { who: "lo", text: "Тихо как... Только кузнечики." },
      { who: "lo", text: this.flowers ? "Ха! Ты меня опередила. Но у меня тоже кое-что есть..." : "Подожди, у меня для тебя кое-что есть..." }
    ]);
    // букет
    this.bouquet = true; Sound.sfx("sparkle");
    await UI.say([
      { who: "lo", text: "Это тебе. Просто так. Потому что ты — это ты." },
      { who: "zhs", text: "Лоренцо... Спасибо. Это лучший вечер." }
    ]);
    // поцелуй: подходят ближе, камера приближается, сердечки
    this.tweens.add({ targets: this.zh.spr, x: 150, duration: 900, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: this.lo.spr, x: 164, duration: 900, ease: "Sine.easeInOut" });
    cam.pan(157, 106, 900, "Sine.easeInOut"); cam.zoomTo(3, 900, "Sine.easeInOut");
    await World.wait(this, 1000);
    for (let i = 0; i < 14; i++) this.time.delayedCall(i * 140, () => { this.hearts.push({ x: 152 + (Math.random() - .5) * 20, y: 96, t: 0, s: Math.random() < .5 ? 1 : 2 }); if (i % 3 === 0) Sound.sfx("sparkle"); });
    await World.wait(this, 2600);
    cam.pan(160, 90, 900, "Sine.easeInOut"); cam.zoomTo(1, 900, "Sine.easeInOut"); await World.wait(this, 950);
    // футболка
    await UI.say([
      { who: "lo", text: "И ещё... Я долго думал, как подружить наши семьи. И придумал!" }
    ]);
    Sound.sfx("done");
    const bn = UI.banner('<div class="syl"><canvas class="shirt" width="40" height="40"></canvas></div>', "chant", 2600);
    const cvs = document.querySelector("#banner canvas.shirt"); if (cvs) { cvs.style.width = "calc(80px * var(--z))"; cvs.style.height = "calc(80px * var(--z))"; cvs.style.imageRendering = "pixelated"; cvs.getContext("2d").drawImage(LorenzoArt.shirt(), 0, 0); }
    await bn;
    await UI.say([
      { who: "zhs", text: "Наполовину «Интер», наполовину «Спартак»?! Лоренцо, ты гений!" },
      { who: "lo", text: "Мир между Миланом и Москвой! Позвоним твоему папе? Хочу, чтобы он оценил." }
    ]);
    // видеозвонок родителям
    Sound.sfx("blip", 1.2); await World.wait(this, 300); Sound.sfx("blip", 1.2); await World.wait(this, 500);
    await UI.say([
      { who: "papa", text: "Женя! Привет! А это кто там рядом... Ого, что за футболка?!" },
      { who: "papa", text: "Так... половина синяя, половина... КРАСНО-БЕЛАЯ! Лоренцо, ты наш человек!" }
    ]);
    Sound.sfx("chant");
    const el = document.getElementById("banner"); el.className = "banner chant"; el.hidden = false;
    el.innerHTML = '<div class="who"><canvas width="16" height="16"></canvas><b>Папа</b></div><div class="syl"></div>';
    const pc = UI.portrait("papa"); if (pc) el.querySelector("canvas").getContext("2d").drawImage(pc, 0, 0);
    const box = el.querySelector(".syl");
    ["МО-", "СКОВ-", "СКИЙ", "СПАР-", "ТАК!!!"].forEach((sy, i) => this.time.delayedCall([0, 320, 640, 1080, 1400][i], () => { const sp = document.createElement("span"); sp.textContent = sy; box.appendChild(sp); if (i === 2) box.appendChild(document.createElement("br")); }));
    await World.wait(this, 3200); el.hidden = true;
    await UI.say([
      { who: "mama", text: "Лёша, не кричи, соседи! Лоренцо, приезжайте зимой, я напеку блинов с икрой!" },
      { who: "lo", text: "Bli-ny! Спа-си-бо! Обязательно приедем!" },
      { who: "zhs", text: "Мам, пап, я вас люблю. Тут так хорошо... Но чего-то не хватает." },
      { who: "lo", text: "Чего же?" },
      { who: "zhs", text: "Не знаю... Как будто кто-то весь день оставляет мне знаки. Ладно, поехали домой!" }
    ]);
    Save.store("sunset");
    await UI.card("Глава 4 пройдена", "Закат с Лоренцо ★", 3000);
    const c = document.getElementById("card"); c.hidden = false; c.classList.remove("show");
    document.getElementById("ctitle").textContent = "Продолжение следует";
    document.getElementById("csub").textContent = "Финал: день рождения Жени · Пробел — в главное меню";
    const key = e => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); window.removeEventListener("keydown", key); c.hidden = true; this.scene.start("title"); } };
    window.addEventListener("keydown", key);
    this.events.once("shutdown", () => window.removeEventListener("keydown", key));
  }
  draw(g, t) {
    const R = PK.R, s = t / 1000;
    g.drawImage(this.bg, 0, 0);
    // солнце медленно садится, блики на озере
    for (let k = 0; k < 8; k++) R(g, 170 + ((k * 23 + Math.floor(s * 6)) % 90), 108 + (k * 3) % 8, 6, 1, "#fff4c8");
    // букет в руках у Лоренцо, потом у Жени
    if (this.bouquet && this.lo) { const sp = this.zh.spr, x = Math.round(sp.x + 5), y = Math.round(sp.y - 12);
      R(g, x, y, 1, 6, "#3a7a2a"); R(g, x + 2, y, 1, 6, "#3a7a2a"); [[x - 1, y - 2, "#ff5a7a"], [x + 2, y - 3, "#f4f0e8"], [x + 4, y - 1, "#ff9ad0"], [x + 1, y - 1, "#f2d23a"]].forEach(([a, b, c]) => R(g, a, b, 2, 2, c)); }
    // сердечки
    this.hearts.forEach(h => { h.t += 1 / 60; h.y -= .35; const a = Math.max(0, 1 - h.t / 2.2); if (!a) return; g.save(); g.globalAlpha = a;
      ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"].forEach((row, yy) => [...row].forEach((b, xx) => { if (b === "1") R(g, Math.round(h.x + xx * h.s / 2), Math.round(h.y + yy * h.s / 2), 1, 1, "#ff5a7a"); }));
      g.restore(); });
  }
  update() { this.zh.update(); this.lo.update(); }
}
