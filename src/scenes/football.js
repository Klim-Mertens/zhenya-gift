/* Глава 2, части 2 и 3: матч Леры (сценка) и футбол один на один против Леры.
   Управление в дуэли: стрелки/WASD — бег, мяч ведётся сам, когда рядом;
   пробел — удар (держи, чтобы сильнее), Shift — ускорение (тратит выносливость). */
"use strict";
// маленькие игроки на матче (рисуем просто: футболка, шорты, голова)
function tinyPlayer(g, x, y, shirt, f) {
  const R = PK.R; x = Math.round(x); y = Math.round(y);
  RK.shadeEll(g, x, y, 4, 1, .3); R(g, x - 3, y - 9, 6, 6, shirt); R(g, x - 3, y - 3, 6, 2, "#2a2a30");
  R(g, x - 2, y - 1, 2, 1 + (f ? 1 : 0), "#e8b48e"); R(g, x + 1, y - 1, 2, 2 - (f ? 1 : 0), "#e8b48e");
  PK.ell(g, x, y - 11, 2, 2, "#e8b48e"); R(g, x - 2, y - 13, 4, 2, "#3a2a24");
}
function drawBall(g, x, y, z = 0) { RK.shadeEll(g, x, y + 1, 2, 1, .35); PK.ell(g, x, y - z - 1, 2, 2, "#ffffff"); PK.P(g, x, y - z - 1, "#2a2a30"); PK.P(g, x - 1, y - z - 2, "#2a2a30"); }

class MatchScene extends Phaser.Scene {
  constructor() { super("match"); }
  create() {
    Save.store("match"); Sound.play("piazza"); UI.goal("");
    this.cameras.main.fadeIn(600, 0, 0, 0);
    const bg = ParkArt.pitch(true), P = ParkArt.PITCH;
    // расстановка: синие — команда Леры (атакуют вправо), красные — соперницы
    this.blue = [[60, 70], [60, 130], [130, 60], [130, 140], [180, 100]].map(([x, y]) => ({ x, y }));
    this.red = [[200, 60], [200, 140], [150, 100], [240, 80], [240, 120]].map(([x, y]) => ({ x, y }));
    this.le = { x: 70, y: 100 }; this.ball = { x: 150, y: 100 }; this.carrier = this.red[2]; this.phase = 0;
    World.backdrop(this, "match_bg", (g, t) => {
      const s = t / 1000; g.drawImage(bg, 0, 0);
      const f = Math.floor(s * 8) % 2;
      this.red.forEach(p => tinyPlayer(g, p.x, p.y, "#d8202c", f));
      this.blue.forEach(p => tinyPlayer(g, p.x, p.y, "#3a6ac8", f));
      g.drawImage(this.textures.get(`le_kit_side_${f}`).getSourceImage(), 0, 0, 16, 23, Math.round(this.le.x) - 6, Math.round(this.le.y) - 16, 12, 17);
      drawBall(g, Math.round(this.ball.x), Math.round(this.ball.y));
      // Женя на трибуне машет
      g.drawImage(this.textures.get("zh_summer_front_0").getSourceImage(), 0, 0, 16, 12, 150, 8 + (Math.floor(s * 4) % 2), 16, 12);
      // табло
      PK.R(g, 4, 2, 40, 9, "#1e1e24"); StationArt.text(g, `${this.score || 0}-0`, 16, 4, "#f2d23a");
    }, -1000);
    this.time.delayedCall(700, () => this.run());
  }
  move(o, x, y, ms) { return new Promise(r => this.tweens.add({ targets: o, x, y, duration: ms, ease: "Sine.easeInOut", onComplete: r })); }
  async run() {
    await UI.say([
      { who: "zhs", text: "Ну и стадион! А вот и Лера, в защите, бело-синяя форма!" },
      { who: "le", text: "Женя, смотри внимательно! Сейчас будет красиво!" }
    ]);
    // соперница идёт в атаку, мяч у неё
    const c = this.red[2], follow = () => { this.ball.x = this.carrier.x + 5; this.ball.y = this.carrier.y; };
    this.events.on("update", follow);
    this.move(this.red[3], 120, 80, 1600); this.move(this.red[4], 120, 125, 1600);
    await this.move(c, 95, 100, 1600);
    // Лера отбирает подкатом
    Sound.sfx("place"); this.cameras.main.shake(150, .004);
    await this.move(this.le, 92, 100, 250);
    this.carrier = this.le; UI.toast("Отбор! Лера забрала мяч!", 1500);
    this.move(c, 80, 112, 500);
    // и проходит через всё поле
    this.move(this.red[0], 230, 95, 1400);
    await this.move(this.le, 170, 80, 1200);
    await this.move(this.le, 230, 112, 900);
    this.move(this.red[1], 255, 115, 600);
    await this.move(this.le, 262, 96, 600);
    // удар!
    this.events.off("update", follow); Sound.sfx("pick");
    await this.move(this.ball, ParkArt.PITCH.x + ParkArt.PITCH.w + 6, 104, 380);
    this.score = 1; Sound.sfx("chant"); this.cameras.main.shake(400, .006);
    await UI.banner('<div class="syl"><span>ГОЛ!!!</span></div>', "chant", 1800);
    await UI.say([
      { who: "zhs", text: "ЛЕРА-А-А! Защитник забил! Так вообще можно?!" },
      { who: "le", text: "Защитник тоже может! Главное — вовремя отобрать и не бояться бежать!" }
    ]);
    await UI.card("Финальный свисток", "Команда Леры побеждает 1:0", 2200);
    await UI.say([
      { who: "le", text: "Уф, победили! Ну что, теперь мы с тобой. Один на один, пока поле свободно!" },
      { who: "le", text: "Я защищаюсь, ты атакуешь. Забьёшь мне три гола за две минуты — с меня джелато." },
      { who: "zhs", text: "Принято! Готовь деньги на фисташковое!" }
    ]);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(550, () => this.scene.start("duel"));
  }
}

class DuelScene extends Phaser.Scene {
  constructor() { super("duel"); }
  create() {
    Save.store("duel"); Sound.play("piazza"); UI.goal(""); UI.hint("");
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.bg = ParkArt.pitch(false);
    this.keys = this.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,SHIFT");
    this.goals = 0; this.time0 = 120; this.state = "intro";
    this.resetPositions();
    World.backdrop(this, "duel_bg", (g, t) => this.draw(g, t), -1000);
    this.time.delayedCall(500, () => this.intro());
  }
  resetPositions() {
    const P = ParkArt.PITCH;
    this.zh = { x: P.x + 60, y: 100, fx: 1, fy: 0, stam: 1, stun: 0, dir: "side", flip: false, t: 0 };
    this.le = { x: P.x + P.w - 70, y: 100, cd: 1, dash: 0, dx: 0, dy: 0, t: 0, flip: true };
    this.ball = { x: P.x + 70, y: 100, vx: 0, vy: 0, owner: "zh", lock: 0 };
    this.charge = -1;
  }
  async intro() {
    const tx = k => this.textures.get(k).getSourceImage();
    const ball = PK.mk(8, 8); drawBall(ball.getContext("2d"), 4, 5);
    await UI.rules("Обыграй Леру!", [
      { keys: ["←", "↑", "↓", "→"], icons: [tx("zh_summer_side_1"), ball], text: "Стрелки или WASD — бег. Мяч катится перед Женей сам." },
      { keys: ["Пробел"], text: "Удар: зажми пробел, чтобы набрать силу (полоска над Женей), отпусти — мяч летит. Целься в ворота справа." },
      { keys: ["Shift"], text: "Рывок: бежишь быстрее, но тратишь силы. Они восстанавливаются, когда отпускаешь." },
      { icons: [tx("le_kit_side_0")], text: "Лера отбирает мяч, блокирует слабые удары и бросается в ноги. Обведи её!" },
      { text: "Забей 3 гола за 2 минуты. Не успела — попробуешь ещё раз." }
    ]);
    for (const n of ["3", "2", "1"]) { UI.banner(`<div class="syl"><span>${n}</span></div>`, "chant", 600); Sound.sfx("blip", 1.6); await World.wait(this, 650); }
    Sound.sfx("whistle"); this.state = "play";
  }
  // уровень сложности растёт с каждым голом
  get lvl() { return this.goals; }
  update(time, dtMs) {
    const dt = Math.min(.05, dtMs / 1000), P = ParkArt.PITCH, G = ParkArt.GOAL, K = this.keys, z = this.zh, l = this.le, b = this.ball;
    if (this.state !== "play" || UI.busy) return;
    this.time0 -= dt;
    UI.goal(`Голы: ${this.goals}/3 · ${Math.max(0, Math.floor(this.time0 / 60))}:${String(Math.max(0, Math.floor(this.time0 % 60))).padStart(2, "0")}`);
    if (this.time0 <= 0) return this.lose();
    // ---------- Женя ----------
    z.stun = Math.max(0, z.stun - dt);
    let vx = 0, vy = 0;
    if (!z.stun) { if (K.LEFT.isDown || K.A.isDown) vx--; if (K.RIGHT.isDown || K.D.isDown) vx++; if (K.UP.isDown || K.W.isDown) vy--; if (K.DOWN.isDown || K.S.isDown) vy++; }
    const sprint = K.SHIFT.isDown && z.stam > .05 && (vx || vy);
    z.stam = Math.max(0, Math.min(1, z.stam + (sprint ? -.55 : .22) * dt));
    if (vx || vy) { const len = Math.hypot(vx, vy); z.fx = vx / len; z.fy = vy / len;
      const sp = (sprint ? 112 : 76) * (b.owner === "zh" ? .9 : 1); z.x += z.fx * sp * dt; z.y += z.fy * sp * dt; z.t += dtMs;
      z.dir = Math.abs(vx) >= Math.abs(vy) ? "side" : vy < 0 ? "back" : "front"; if (vx) z.flip = vx < 0; } else z.t = 0;
    z.x = Math.max(P.x + 4, Math.min(P.x + P.w - 4, z.x)); z.y = Math.max(P.y + 6, Math.min(P.y + P.h - 2, z.y));
    // удар: держим пробел — копим силу, отпускаем — бьём
    if (K.SPACE.isDown && b.owner === "zh") this.charge = Math.min(1, (this.charge < 0 ? 0 : this.charge) + dt * 1.4);
    if (!K.SPACE.isDown && this.charge >= 0) { if (b.owner === "zh") { const [kx, ky] = this.aim(vx, vy, z); this.kick(kx, ky, 130 + 210 * this.charge); } this.charge = -1; }
    // ---------- мяч ----------
    b.lock = Math.max(0, b.lock - dt);
    if (b.owner === "zh") { b.x = z.x + z.fx * 6; b.y = z.y + z.fy * 4 + 1; b.vx = b.vy = 0; }
    else if (b.owner === "le") { b.x = l.x - 6; b.y = l.y + 1; }
    else {
      b.x += b.vx * dt; b.y += b.vy * dt; const fr = Math.pow(.22, dt); b.vx *= fr; b.vy *= fr;
      if (b.y < P.y + 2 || b.y > P.y + P.h - 2) { b.vy *= -.7; b.y = Math.max(P.y + 2, Math.min(P.y + P.h - 2, b.y)); }
      const inGoalY = b.y > G.y && b.y < G.y + G.h;
      if (b.x > P.x + P.w) { if (inGoalY) return this.scored(); b.vx *= -.6; b.x = P.x + P.w; }
      if (b.x < P.x) { b.vx *= -.6; b.x = P.x; }
      if (!b.lock && Math.hypot(b.x - z.x, b.y - z.y) < 7 && !z.stun) { b.owner = "zh"; Sound.sfx("blip", .8); }
      if (!b.lock && Math.hypot(b.x - l.x, b.y - l.y) < 7) {
        const spd = Math.hypot(b.vx, b.vy), fast = spd > 170 - this.lvl * 12;
        // сильный удар часто проходит мимо Леры: шанс отбить падает со скоростью мяча
        if (fast && Math.random() > .75 - (spd - 170) / 400 + this.lvl * .08) { b.lock = .3; UI.toast("Лера не достала!", 800); }
        else if (fast) { b.vx = -b.vx * .5 + (Math.random() - .5) * 80; b.vy = b.vy * .5 + (Math.random() - .5) * 120; b.lock = .25; Sound.sfx("place"); UI.toast("Лера отбила!", 900); }
        else { b.owner = "le"; l.hold = .35; Sound.sfx("place"); }
      }
    }
    // ---------- Лера (защитник) ----------
    const lsp = 42 + this.lvl * 6; l.cd = Math.max(0, l.cd - dt);
    const goalX = P.x + P.w, goalY = G.y + G.h / 2;
    if (b.owner === "le") {                                   // Лера выносит мяч влево
      l.hold -= dt; if (l.hold <= 0) { b.owner = null; const a = Math.PI + (Math.random() - .5) * 1.4; b.vx = Math.cos(a) * 230; b.vy = Math.sin(a) * 230; b.lock = .4; Sound.sfx("pick"); UI.toast(["Лера: Вынос!", "Лера: Не так быстро!", "Лера: Защита не дремлет!"][Math.floor(Math.random() * 3)], 1100); }
    } else if (l.dash > 0) {                                  // подкат
      l.dash -= dt; l.x += l.dx * 140 * dt; l.y += l.dy * 140 * dt;
      if (b.owner === "zh" && Math.hypot(b.x - l.x, b.y - l.y) < 8) {
        b.owner = null; const a = Math.atan2(b.y - l.y, b.x - l.x) + Math.PI + (Math.random() - .5); b.vx = Math.cos(a) * 150 - 60; b.vy = Math.sin(a) * 150; b.lock = .35;
        z.stun = .55; Sound.sfx("wrong"); this.cameras.main.shake(150, .006); UI.toast("Подкат! Мяч отобран", 1100);
      }
    } else {
      // встаём между мячом и воротами, ближе к мячу; если мяч рядом и он у Жени — подкат
      let tx, ty, boost = 1;
      const tHit = !b.owner && b.vx > 50 ? (l.x - b.x) / b.vx : -1;
      if (tHit > 0 && tHit < 1.5) { tx = l.x + 6; ty = b.y + b.vy * tHit; boost = 1.25 + this.lvl * .15; }   // удар по воротам: бросается наперерез
      else if (b.owner === "zh") { const d = Math.hypot(goalX - b.x, goalY - b.y) || 1, k = Math.min(26 - this.lvl * 3, d * .5); tx = b.x + (goalX - b.x) / d * k; ty = b.y + (goalY - b.y) / d * k; }
      else { tx = b.x + 4; ty = b.y; }                        // свободный мяч — бежим к нему
      const dx = tx - l.x, dy = ty - l.y, d = Math.hypot(dx, dy);
      if (d > 1) { l.x += dx / d * Math.min(d, lsp * boost * dt); l.y += dy / d * Math.min(d, lsp * boost * dt); l.t += dtMs; l.flip = dx < 0; } else l.t = 0;
      const db = Math.hypot(b.x - l.x, b.y - l.y);
      if (b.owner === "zh" && db < 20 && l.cd <= 0 && Math.random() < dt * (1.6 + this.lvl * .6)) { l.dash = .22; l.dx = (b.x - l.x) / db; l.dy = (b.y - l.y) / db; l.cd = 1.8 - this.lvl * .25; Sound.sfx("step"); }
    }
    l.x = Math.max(P.x + 20, Math.min(P.x + P.w - 12, l.x)); l.y = Math.max(P.y + 6, Math.min(P.y + P.h - 2, l.y));
  }
  // Куда бить: по стрелкам, зажатым в момент удара; если ничего не зажато — куда Женя смотрит.
  // Направление округляем до одного из 8 (→ ↗ ↑ ...), чтобы «почти вправо» было ровно вправо.
  aim(vx, vy, z) {
    let a = vx || vy ? Math.atan2(vy, vx) : Math.atan2(z.fy, z.fx);
    a = Math.round(a / (Math.PI / 4)) * (Math.PI / 4);
    return [Math.cos(a), Math.sin(a)];
  }
  kick(fx, fy, power) {
    const b = this.ball; b.owner = null; b.vx = fx * power; b.vy = fy * power; b.lock = .3; Sound.sfx("pick"); this.cameras.main.shake(80, .003);
  }
  async scored() {
    this.state = "goal"; this.goals++; Sound.sfx("chant"); this.cameras.main.shake(300, .006);
    const lines = [["Ого! Ладно, это была разминка.", "Теперь серьёзно!"], ["Да как так-то?!", "Всё, я злая. Держись!"], []][this.goals - 1];
    await UI.banner(`<div class="syl"><span>ГОЛ ${this.goals}!</span></div>`, "chant", 1400);
    if (this.goals >= 3) return this.win();
    await UI.say(lines.map(t => ({ who: "le", text: t })));
    this.resetPositions(); await World.wait(this, 300); this.state = "play";
  }
  async lose() {
    this.state = "over"; UI.goal(""); Sound.sfx("whistle");
    await UI.say([
      { who: "le", text: `Время! ${this.goals} из 3. Неплохо, но защита сегодня в ударе!` },
      { who: "le", text: "Ещё раз? Подсказка: держи пробел подольше и бей, пока я не подбежала. И не забывай про рывок!" }
    ]);
    this.tries = (this.tries || 0) + 1;
    if (this.tries >= 2) await UI.say([{ who: "le", text: `Ладно, даю фору: ${120 + 20 * this.tries} секунд!` }]);
    this.goals = 0; this.time0 = 120 + 20 * this.tries; this.resetPositions(); this.state = "play";
  }
  async win() {
    this.state = "over"; UI.goal("");
    await UI.say([
      { who: "le", text: "Три гола! Мне, защитнику! Женя, ты где так научилась?!" },
      { who: "zhs", text: "Кросс по Коврову, восемь километров! Мы с братом тогда еле добежали, зато теперь я непобедима." },
      { who: "le", text: "Ха-ха! Ну всё, джелато с меня. Фисташковое, как договаривались." },
      { who: "le", text: "Вечером, кстати, у Даны танцы. Пойдём? Ты же любишь танцевать!" },
      { who: "zhs", text: "Ещё как! Только сначала джелато." }
    ]);
    Save.store("duel");
    await UI.card("Глава 2 пройдена", "Лера и футбол ★", 3000);
    const el = document.getElementById("card"); el.hidden = false; el.classList.remove("show");
    document.getElementById("ctitle").textContent = "Продолжение следует";
    document.getElementById("csub").textContent = "Глава 3: танцы у Даны · Пробел — в главное меню";
    const key = e => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); window.removeEventListener("keydown", key); el.hidden = true; this.scene.start("title"); } };
    window.addEventListener("keydown", key);
    this.events.once("shutdown", () => window.removeEventListener("keydown", key));
  }
  draw(g, t) {
    const s = t / 1000, z = this.zh, l = this.le, b = this.ball, src = k => this.textures.get(k).getSourceImage(), R = PK.R;
    g.drawImage(this.bg, 0, 0);
    // Лера и Женя (по глубине)
    const drawZh = () => { const list = { side: ["zh_summer_side_0", "zh_summer_side_1"], front: ["zh_summer_front_0", "zh_summer_front_1", "zh_summer_front_2"], back: ["zh_summer_back_0", "zh_summer_back_1", "zh_summer_back_2"] }[z.dir];
      const f = z.t ? list[list.length === 3 ? [1, 0, 2, 0][Math.floor(z.t / 120) % 4] : Math.floor(z.t / 120) % 2] : list[0];
      if (z.stun && Math.floor(s * 12) % 2) return; g.save(); if (z.flip && z.dir === "side") { g.translate(Math.round(z.x) * 2, 0); g.scale(-1, 1); } g.drawImage(src(f), Math.round(z.x) - 8, Math.round(z.y) - 26); g.restore(); };
    const drawLe = () => { const f = l.dash > 0 ? "le_kit_side_1" : l.t ? `le_kit_side_${Math.floor(l.t / 120) % 2}` : "le_kit_front_0";
      g.save(); if (l.flip && f.includes("side")) { g.translate(Math.round(l.x) * 2, 0); g.scale(-1, 1); } g.drawImage(src(f), Math.round(l.x) - 8, Math.round(l.y) - 23); g.restore(); };
    RK.shadeEll(g, z.x, z.y, 5, 2, .3); RK.shadeEll(g, l.x, l.y, 5, 2, .3);
    if (z.y < l.y) { drawZh(); drawLe(); } else { drawLe(); drawZh(); }
    drawBall(g, Math.round(b.x), Math.round(b.y));
    // полоска силы удара над Женей и выносливость внизу
    if (this.charge >= 0) { R(g, z.x - 8, z.y - 32, 16, 3, "#2a2a30"); R(g, z.x - 8, z.y - 32, 16 * this.charge, 3, this.charge > .8 ? "#e84a4a" : "#f2c23a"); }
    R(g, 6, 172, 60, 4, "#2a2a30"); R(g, 6, 172, 60 * z.stam, 4, z.stam < .2 ? "#e84a4a" : "#6ae06a"); RK.box(g, 5, 171, 62, 6, RK.OL);
    StationArt.text(g, "РЫВОК", 70, 172, "#ffffff");
  }
}
