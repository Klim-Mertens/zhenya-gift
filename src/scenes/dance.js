/* Глава 3: «Танцы у Даны». Ритм-игра.
   Стрелки летят снизу вверх по 4 дорожкам; когда стрелка совпадает с рамкой наверху — жми ту же стрелку (или WASD).
   Дана заранее показывает движение (позу) следующей стрелки, Женя повторяет, когда ты нажимаешь.
   Две части: Vogue (четверти, спокойнее) и High Heels (восьмые, быстрее). Нужно набрать точность 60%.
   Время берём из звука (Sound.beatNow), чтобы стрелки совпадали с музыкой. */
"use strict";
class StudioScene extends Phaser.Scene {
  constructor() { super("studio"); }
  create() {
    Save.store("studio"); Sound.play("summer"); UI.goal(""); UI.hint("");
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.bg = DanceArt.studio();
    const src = k => this.textures.get(k).getSourceImage();
    // позы заранее: Женя и Дана
    const D = this.danaSet = DanceArt.dana();
    // высокий хвост: резинка на макушке, хвост свисает вправо за спину
    const tail = (g, ox, oy) => { const O = "#3b2420", H = D.hair;
      PK.R(g, ox + 10, oy - 2, 4, 3, O); PK.R(g, ox + 11, oy - 1, 2, 2, H);
      PK.R(g, ox + 12, oy, 3, 9, O); PK.R(g, ox + 13, oy + 1, 1, 8, H); PK.R(g, ox + 13, oy + 9, 2, 3, O); PK.P(g, ox + 13, oy + 9, H);
      PK.R(g, ox + 10, oy + 1, 2, 1, "#ff5aa0"); };
    this.zhP = {}; this.daP = {};
    DanceArt.POSE_NAMES.forEach(n => { this.zhP[n] = DanceArt.pose(src("zh_summer_front_0"), n, "#f6caa4", "#d89a78"); this.daP[n] = DanceArt.pose(D.front[0], n, D.skin, D.skinD, tail); });
    this.daBlink = DanceArt.pose(D.blink, "hip", D.skin, D.skinD, tail);
    this.arrows = {}; ["left", "down", "up", "right"].forEach(d => ["fill", "ring", "glow"].forEach(m => { this.arrows[d + m] = DanceArt.arrow(d, m); }));
    this.LANES = ["left", "down", "up", "right"]; this.LX = 190; this.LW = 29; this.HIT_Y = 22; this.PXB = 58;   // пикселей на долю
    this.state = "intro"; this.zhPose = "idle"; this.zhPoseT = 0; this.daPose = "hip"; this.fails = 0;
    this.fx = []; this.press = { left: 0, down: 0, up: 0, right: 0 };
    World.backdrop(this, "studio_bg", (g, t) => this.draw(g, t), -1000);
    const MAP = { ArrowLeft: "left", KeyA: "left", ArrowDown: "down", KeyS: "down", ArrowUp: "up", KeyW: "up", ArrowRight: "right", KeyD: "right" };
    const kd = e => { const d = MAP[e.code]; if (!d || this.state !== "play") return; e.preventDefault(); if (e.repeat) return; this.hit(d); };
    window.addEventListener("keydown", kd);
    this.events.once("shutdown", () => window.removeEventListener("keydown", kd));
    this.time.delayedCall(700, () => this.intro());
  }
  // ---------- уровни сложности: после каждой неудачи Дана упрощает танец ----------
  // win — окна попадания в секундах (СУПЕР / ОТЛИЧНО / НОРМ), need — нужная точность, gap — минимум долей между стрелками
  static LEVELS = [
    { name: "Уровень 1", win: [.06, .11, .18], need: .6, pxb: 58, gap: 0, chords: true },
    { name: "Уровень 2 · проще", win: [.07, .13, .21], need: .55, pxb: 54, gap: 1, chords: true },
    { name: "Уровень 3 · ещё проще", win: [.08, .15, .24], need: .5, pxb: 50, gap: 1, chords: false },
    { name: "Уровень 4 · лёгкий", win: [.1, .18, .28], need: .45, pxb: 46, gap: 2, chords: false },
    { name: "Уровень 5 · самый лёгкий", win: [.12, .2, .32], need: .35, pxb: 42, gap: 4, chords: false }
  ];
  get L() { return StudioScene.LEVELS[Math.min(this.fails, StudioScene.LEVELS.length - 1)]; }
  // ---------- карта стрелок (одинаковая каждый раз) ----------
  chart() {
    const rnd = PK.rng(24), notes = [], L = "left", Dn = "down", U = "up", Rt = "right";
    const add = (b, ...dirs) => notes.push({ b, dirs, got: {}, done: false });
    const A = [[[0, L], [1, Rt], [2, U]], [[0, L], [1, L], [2, Rt], [3, Rt]], [[0, U], [2, Dn]], [[0, L], [1, Dn], [2, Rt], [3, U]],
      [[0, Dn], [1, U], [2, Dn], [3, U]], [[0, Rt], [1, L], [2, U], [3, U]]];
    const B = [[[0, L], [.5, Rt], [1, L], [1.5, Rt], [2, U], [3, Dn]], [[0, U], [.5, U], [1, Dn], [2, L], [2.5, Dn], [3, Rt]],
      [[0, L], [1, Rt], [1.5, L], [2, U], [2.5, Dn], [3, U]], [[0, Rt], [.5, U], [1, L], [1.5, U], [2, Dn], [3, Dn]]];
    // Vogue: доли 8–55; каждая 4-я «фраза» заканчивается позой-рамкой (две стрелки сразу: ← и →)
    for (let bar = 0; bar < 12; bar++) { const b0 = 8 + bar * 4;
      if (bar % 4 === 3) { add(b0, U); add(b0 + 2, L, Rt); continue; }
      A[Math.floor(rnd() * A.length)].forEach(([o, d]) => add(b0 + o, d)); }
    // High Heels: доли 64–119, восьмые
    for (let bar = 0; bar < 14; bar++) { const b0 = 64 + bar * 4;
      if (bar % 4 === 3) { add(b0, Dn); add(b0 + 1, U); add(b0 + 2, L, Rt); continue; }
      B[Math.floor(rnd() * B.length)].forEach(([o, d]) => add(b0 + o, d)); }
    add(120, L, Rt);                                           // финальная поза
    // упрощение под уровень: убираем восьмые, близкие стрелки, двойные
    const lv = this.L; let last = -99;
    return notes.filter(n => { if (lv.gap && (n.b % 1 || n.b - last < lv.gap)) return false; last = n.b; return true; })
      .map(n => lv.chords ? n : Object.assign(n, { dirs: [n.dirs[0]] }));
  }
  async intro() {
    await UI.say([
      { who: "le", text: "Вот и студия! Дана, знакомься: это Женя, моя подруга из России." },
      { who: "da", text: "Ciao, Женя! Лера говорит, ты обожаешь танцевать. Сегодня у нас Vogue и High Heels." },
      { who: "zhs", text: "Vogue — это где руки рамкой вокруг лица, как на обложке журнала?" },
      { who: "da", text: "Именно! Смотри на меня и повторяй. Я показываю движение, ты — за мной, точно в такт." },
      { who: "le", text: "А я посмотрю со стороны. Мне после футбола только на скамейке сидеть." }
    ]);
    const a = this.arrows;
    const pose = n => { const c = PK.mk(28, 36); c.getContext("2d").drawImage(this.daP[n], 0, 0); return c; };
    await UI.rules("Танцуй с Даной!", [
      { keys: ["←", "↓", "↑", "→"], icons: [a.leftfill, a.downfill, a.upfill, a.rightfill], text: "Стрелки летят снизу вверх. Когда стрелка попадает в рамку наверху — жми ту же стрелку (или A S W D)." },
      { icons: [a.leftfill, a.rightfill], text: "Две стрелки рядом — жми обе сразу: это поза-рамка, как в Vogue." },
      { icons: [pose("left"), pose("up"), pose("frame")], text: "Дана заранее показывает следующее движение, Женя повторяет за ней, когда ты нажимаешь." },
      { text: "Точно в такт — «СУПЕР!», чуть раньше или позже — «ОТЛИЧНО» или «НОРМ». Набери точность 60% (белая черта на шкале внизу справа)." },
      { text: "Две части: Vogue (спокойнее), потом High Heels (быстрее). Не получилось — Дана сделает танец проще, и так после каждой попытки." }
    ]);
    this.startSong();
  }
  startSong() {
    this.notes = this.chart(); this.score = 0; this.combo = 0; this.best = 0; this.judged = 0; this.fx = []; this.cues = {};
    Sound.play("studio", true); this.t0 = this.time.now; this.state = "play"; UI.goal("Повторяй за Даной! ← ↓ ↑ →");
  }
  // текущая доля песни: из звука, а если звука нет — по часам сцены
  beat() { const b = Sound.beatNow(); return b == null ? (this.time.now - this.t0 - 100) / 500 : b; }
  // ---------- нажатие ----------
  hit(d) {
    const now = this.beat(), sec = x => x / 2;                 // 120 bpm: одна доля = 0,5 с
    this.press[d] = .12;
    const n = this.notes.find(n => !n.done && n.dirs.includes(d) && !n.got[d] && Math.abs(sec(n.b - now)) <= this.L.win[2]);
    if (!n) { this.setZh(d === "left" ? "left" : d === "right" ? "right" : d); return; }   // лишнее нажатие: просто движение, без штрафа
    const err = Math.abs(sec(n.b - now));
    const W = this.L.win; n.got[d] = err <= W[0] ? 3 : err <= W[1] ? 2 : 1;
    if (n.dirs.every(x => n.got[x])) this.judge(n, Math.min(...n.dirs.map(x => n.got[x])));
    else this.setZh(d);
  }
  judge(n, q) {
    n.done = true; n.q = q; this.judged++;
    const pts = [0, 50, 80, 100][q]; this.score += pts;
    if (q) { this.combo++; this.best = Math.max(this.best, this.combo); } else this.combo = 0;
    const word = ["МИМО", "НОРМ", "ОТЛИЧНО", "СУПЕР!"][q], col = ["#e84a4a", "#c8d0e0", "#5ad86a", "#f2c23a"][q];
    this.fx.push({ word, col, t: 0 });
    n.dirs.forEach(d => { if (q) this.fx.push({ glow: d, t: 0 }); });
    if (q) this.setZh(n.dirs.length > 1 ? "frame" : n.dirs[0]);
    else { this.zhPose = "idle"; this.zhPoseT = .3; this.cameras.main.shake(80, .003); }
  }
  setZh(d) { this.zhPose = d === "left" || d === "right" || d === "up" || d === "down" || d === "frame" ? d : "idle"; this.zhPoseT = .35; }
  get acc() { return this.judged ? this.score / (this.judged * 100) : 1; }
  update(time, dtMs) {
    const dt = Math.min(.05, dtMs / 1000);
    for (const k in this.press) this.press[k] = Math.max(0, this.press[k] - dt);
    this.zhPoseT = Math.max(0, this.zhPoseT - dt); if (!this.zhPoseT) this.zhPose = "idle";
    this.fx.forEach(f => f.t += dt); this.fx = this.fx.filter(f => f.t < .6);
    if (this.state !== "play") return;
    const now = this.beat();
    // пропущенные стрелки
    this.notes.forEach(n => { if (!n.done && (n.b - now) / 2 < -this.L.win[2]) this.judge(n, 0); });
    // Дана показывает позу ближайшей стрелки
    const next = this.notes.find(n => !n.done && n.b > now - .1);
    this.daPose = !next || next.b - now > 1.2 ? "hip" : next.dirs.length > 1 ? "frame" : next.dirs[0];
    // реплики Даны по ходу песни
    const cue = (b, text) => { if (now >= b && !this.cues[b]) { this.cues[b] = 1; UI.toast(text, 1600); } };
    cue(3, "Дана: Пять, шесть, семь, восемь!"); cue(20, "Дана: Руки длинные! Как на подиуме!"); cue(38, "Дана: Рамка! Лицо в кадре!");
    cue(57, "Дана: А теперь High Heels! Быстрее!"); cue(84, "Дана: Бёдра! Уверенно!"); cue(104, "Лера: Женя, огонь!!!");
    UI.goal(`${this.L.name} · ${now < 60 ? "Vogue" : "High Heels"} · точность ${Math.round(this.acc * 100)}% · комбо ${this.combo}`);
    if (now > 122 && this.notes.every(n => n.done)) this.finish();
  }
  async finish() {
    this.state = "end"; UI.goal("");
    const acc = this.acc, need = this.L.need, pct = Math.round(acc * 100);
    const grade = acc >= .92 ? "S" : acc >= .8 ? "A" : acc >= .68 ? "B" : "C";
    Sound.play("summer");
    if (acc < need) {
      this.fails++; Sound.sfx("wrong");
      await UI.say([
        { who: "da", text: `${pct}% — неплохо для первого раза! Но я знаю, ты можешь лучше.` },
        { who: "da", text: `Сделаем чуть проще. ${this.L.name}: ${this.fails === 1 ? "убираю быстрые шаги" : this.fails === 2 ? "ещё меньше движений, без двойных поз" : "медленно и спокойно, только главные движения"}. Слушай бочку: стрелки приходят ровно на удар!` }
      ]);
      for (const n of ["3", "2", "1"]) { UI.banner(`<div class="syl"><span>${n}</span></div>`, "chant", 600); Sound.sfx("blip", 1.6); await World.wait(this, 650); }
      this.startSong(); return;
    }
    Sound.sfx("done"); this.daPose = "frame"; this.zhPose = "frame"; this.zhPoseT = 3;
    await UI.banner(`<div class="syl"><span>${grade}</span></div>`, "chant", 1400);
    await UI.say([
      { who: "da", text: `Брава, Женя! ${pct}% точности, лучшая серия — ${this.best}. ${grade === "S" ? "Это уровень сцены!" : "Ты прирождённая танцовщица!"}` },
      { who: "le", text: "Женя, это было огонь! Я бы так не смогла, у меня ноги только для мяча." },
      { who: "zhs", text: "Ноги не чувствую, но это было круто! Дана, можно я буду приходить к тебе на занятия?" },
      { who: "da", text: "Конечно! Vogue по вторникам, High Heels по четвергам. Каблуки свои приноси!" }
    ]);
    Save.store("studio");
    await UI.card("Глава 3 пройдена", "Танцы у Даны ★", 3000);
    const el = document.getElementById("card"); el.hidden = false; el.classList.remove("show");
    document.getElementById("ctitle").textContent = "Продолжение следует";
    document.getElementById("csub").textContent = "Глава 4: закат с Лоренцо · Пробел — в главное меню";
    const key = e => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); window.removeEventListener("keydown", key); el.hidden = true; this.scene.start("title"); } };
    window.addEventListener("keydown", key);
    this.events.once("shutdown", () => window.removeEventListener("keydown", key));
  }
  // ---------- отрисовка ----------
  draw(g, t) {
    const R = PK.R, s = t / 1000, playing = this.state === "play", now = playing ? this.beat() : s * 2;
    this.bg(g, now);
    // Лера смотрит у зеркала
    const le = this.textures.get(Math.floor(s * .7) % 5 ? "le_run_front_0" : "le_run_blink").getSourceImage();
    g.drawImage(le, 162, 92);
    // Дана и Женя (2×), подпрыгивают в такт
    const bob = playing && (now - Math.floor(now)) < .25 ? -2 : 0;
    const dimg = !playing && Math.floor(s * .8) % 6 === 0 && this.daPose === "hip" ? this.daBlink : this.daP[this.daPose];
    const FY = 128;                                            // линия ног: выше окна диалога, чтобы героинь было видно
    RK.shadeEll(g, 54, FY, 16, 3, .3); RK.shadeEll(g, 128, FY, 16, 3, .3);
    g.drawImage(dimg, 54 - 28, FY - 68 + bob, 56, 72);
    g.drawImage(this.zhP[this.zhPose], 128 - 28, FY - 68 + bob, 56, 72);
    if (this.state !== "intro") { StationArt.text(g, "ДАНА", 46, FY + 6, "#ff7ac0"); StationArt.text(g, "ЖЕНЯ", 118, FY + 6, "#f2c46a"); }
    // всплывающие оценки над Женей
    this.fx.filter(f => f.word).slice(-1).forEach(f => { const w = StationArt.text(PK.mk(1, 1).getContext("2d"), f.word, 0, 0, "#000"); StationArt.text(g, f.word, 128 - w / 2, 50 - f.t * 20, f.col); });
    if (this.combo >= 5 && playing) { const txt = `КОМБО ${this.combo}`, w = StationArt.text(PK.mk(1, 1).getContext("2d"), txt, 0, 0, "#000"); StationArt.text(g, txt, 128 - w / 2, 150, "#ffffff"); }
    if (this.state === "intro") return;
    // дорожки
    g.save(); g.globalAlpha = .62; R(g, this.LX - 4, 0, this.LW * 4 + 8, 180, "#1a1424"); g.restore();
    R(g, this.LX - 4, 0, 1, 180, "#5a5068"); R(g, this.LX + this.LW * 4 + 3, 0, 1, 180, "#5a5068");
    this.LANES.forEach((d, i) => { const x = this.LX + i * this.LW + (this.LW - 14) / 2;
      if (this.press[d] > 0) { g.save(); g.globalAlpha = .25; R(g, this.LX + i * this.LW, 0, this.LW, 180, DanceArt.COLORS[d]); g.restore(); }
      g.drawImage(this.arrows[d + "ring"], x, this.HIT_Y - 7 + (this.press[d] > 0 ? 1 : 0)); });
    if (playing && this.notes) {
      for (const n of this.notes) { if (n.done && n.q) continue; const y = this.HIT_Y + (n.b - now) * this.L.pxb; if (y > 186 || y < -14) continue;
        if (n.dirs.length > 1) { const xs = n.dirs.map(d => this.LX + this.LANES.indexOf(d) * this.LW + this.LW / 2); R(g, Math.min(...xs), Math.round(y), Math.max(...xs) - Math.min(...xs), 1, "#ffffff"); }
        n.dirs.forEach(d => { if (n.got[d]) return; const x = this.LX + this.LANES.indexOf(d) * this.LW + (this.LW - 14) / 2; g.save(); if (n.done) g.globalAlpha = .35; g.drawImage(this.arrows[d + "fill"], x, Math.round(y - 7)); g.restore(); }); }
    }
    this.fx.filter(f => f.glow).forEach(f => { const i = this.LANES.indexOf(f.glow), x = this.LX + i * this.LW + (this.LW - 14) / 2; g.save(); g.globalAlpha = 1 - f.t / .6; g.drawImage(this.arrows[f.glow + "glow"], x, this.HIT_Y - 7 - f.t * 8); g.restore(); });
    // шкала точности с отметкой «нужно»
    const bx = this.LX, bw = this.LW * 4, need = this.L.need, acc = this.notes ? this.acc : 1;
    R(g, bx, 172, bw, 4, "#3a3048"); R(g, bx, 172, bw * acc, 4, acc >= need ? "#5ad86a" : "#e84a4a"); R(g, bx + bw * need, 170, 1, 8, "#ffffff"); RK.box(g, bx - 1, 171, bw + 2, 6, RK.OL);
    // прогресс песни
    if (playing) R(g, bx, 168, bw * Math.max(0, Math.min(1, now / 121)), 1, "#f2c23a");
  }
}
