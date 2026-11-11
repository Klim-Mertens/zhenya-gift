/* Глава 2, часть 1: «Догони Леру». Раннер в парке Семпионе.
   Пробел / ↑ / W — прыжок, ↓ / S — пригнуться. Три сердечка, скорость растёт. */
"use strict";
class RunScene extends Phaser.Scene {
  constructor() { super("run"); }
  create() {
    Save.store("run"); Sound.play("centrale"); UI.goal(""); UI.hint("");
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.bg = ParkArt.sempione();
    this.G = ParkArt.GROUND; this.D = 5200;          // длина забега в пикселях
    this.state = "intro"; this.off = 0; this.leX = 360;
    this.reset();
    this.keys = { up: false, down: false };
    World.backdrop(this, "run_bg", (g, t) => this.draw(g, t), -1000);
    const kd = e => {
      if (["Space", "ArrowUp", "KeyW"].includes(e.code)) { if (this.state === "run" && !UI.busy) { e.preventDefault(); this.jumpBuf = .12; } }
      if (["ArrowDown", "KeyS"].includes(e.code)) this.keys.down = true;
    };
    const ku = e => { if (["ArrowDown", "KeyS"].includes(e.code)) this.keys.down = false; };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    this.events.once("shutdown", () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); });
    this.time.delayedCall(700, () => this.intro());
  }
  reset() {
    this.dist = 0; this.v = 0; this.y = 0; this.vy = 0; this.hearts = 3; this.inv = 0; this.water = 0; this.slow = 0;
    this.obs = []; this.nextGap = 260; this.jumpBuf = 0; this.t = 0; this.cheerT = 4; this.pig = [];
  }
  tex(key) { return this.textures.get(key).getSourceImage(); }
  async intro() {
    // Лера пробегает мимо
    this.state = "intro";
    this.tweens.add({ targets: this, leX: 200, duration: 1600, ease: "Sine.easeOut" });
    await World.wait(this, 1700);
    await UI.say([
      { who: "le", text: "Женя?! Привет! Ты уже в Милане! Обнимашки потом, я на пробежке!" },
      { who: "zhs", text: "Лера! Ты бегаешь в такую рань?" },
      { who: "le", text: "Конечно! У меня через час матч, разминаюсь. Догоняй, расскажешь всё на бегу!" },
      { who: "zhs", text: "Ох... Ладно, мамины бутерброды, выручайте!" }
    ]);
    this.tweens.add({ targets: this, leX: 270, duration: 900 });
    await UI.card("Догони Леру!", "Пробел или ↑ — прыжок · ↓ — пригнуться · 3 сердечка", 2600);
    for (const n of ["3", "2", "1"]) { UI.banner(`<div class="syl"><span>${n}</span></div>`, "chant", 600); Sound.sfx("blip", 1.6); await World.wait(this, 650); }
    Sound.sfx("whistle"); this.state = "run"; this.v = 95; UI.goal("Догони Леру!");
  }
  // ---------- препятствия ----------
  spawn() {
    const r = Math.random(), late = this.dist > 2200, x = 340;
    const add = o => this.obs.push(Object.assign({ x, vx: 0, hit: false }, o));
    if (r < .16) add({ type: "puddle", w: 20, lo: 0, hi: 3 });
    else if (r < .32) add({ type: "bench", w: 24, lo: 0, hi: 12 });
    else if (r < .46) add({ type: "dog", w: 14, lo: 0, hi: 9, vx: -25 });
    else if (r < .58) add({ type: "scooter", w: 14, lo: 0, hi: 18, vx: -55 });
    else if (r < .72) add({ type: "selfie", w: 22, lo: 13, hi: 22 });
    else if (r < .82) add({ type: "branch", w: 26, lo: 12, hi: 34 });
    else if (r < .9) { add({ type: "pigeons", w: 24, lo: 0, hi: 0, harmless: true }); }
    else add({ type: "water", w: 8, lo: Math.random() < .5 ? 2 : 26, hi: 0, pickup: true });
    // ближе к концу — связки: скамейка + бутылка над ней, или ветка сразу за лужей
    if (late && Math.random() < .35) { const o = this.obs[this.obs.length - 1]; if (o.type === "bench") add({ type: "water", x: x + 6, w: 8, lo: 26, pickup: true });
      else if (o.type === "puddle") add({ type: "branch", x: x + 70, w: 26, lo: 12, hi: 34 }); }
    if (Math.random() < .04 && this.hearts < 3) add({ type: "heart", x: x + 40, w: 8, lo: 24, pickup: true });
    this.nextGap = 120 + Math.random() * 90 + this.v * .45;
  }
  hitbox() { const slide = this.keys.down && this.y >= 0 && this.state === "run"; return { x0: 66, x1: 74, y0: this.y - (slide ? 9 : 20), y1: this.y, slide }; }
  update(time, dtMs) {
    const dt = Math.min(.05, dtMs / 1000);
    if (this.state !== "run" || UI.busy) return;
    this.t += dt;
    this.v = Math.min(170, 95 + this.dist * .014) * (this.slow > 0 ? .65 : 1);
    this.slow = Math.max(0, this.slow - dt); this.inv = Math.max(0, this.inv - dt); this.jumpBuf = Math.max(0, this.jumpBuf - dt);
    const step = this.v * dt; this.dist += step; this.off += step;
    // прыжок и гравитация (y: 0 — земля, отрицательный — в воздухе)
    if (this.jumpBuf > 0 && this.y >= 0) { this.vy = -205; this.jumpBuf = 0; Sound.sfx("pick"); }
    if (this.y < 0 || this.vy < 0) { this.vy += (this.keys.down ? 900 : 560) * dt; this.y += this.vy * dt; if (this.y >= 0) { this.y = 0; this.vy = 0; } }
    // препятствия
    this.nextGap -= step; if (this.nextGap <= 0 && this.dist < this.D - 300) this.spawn();
    const hb = this.hitbox();
    this.obs.forEach(o => {
      o.x += o.vx * dt - step;
      if (o.hit) return;
      const ox0 = o.x, ox1 = o.x + o.w, oy0 = -(o.hi || o.lo + 8), oy1 = -o.lo;
      const over = hb.x1 > ox0 && hb.x0 < ox1 && hb.y0 < oy1 && hb.y1 > oy0;
      if (o.type === "pigeons" && Math.abs(o.x - 70) < 30) { o.hit = true; Sound.sfx("flap"); o.flyT = 0; return; }
      if (!over) return;
      if (o.pickup) { o.hit = true; if (o.type === "water") { this.water++; Sound.sfx("sparkle"); } else { this.hearts = Math.min(3, this.hearts + 1); Sound.sfx("done"); UI.toast("+1 сердечко!", 1200); } return; }
      if (this.inv > 0) return;
      o.hit = true; this.hearts--; this.inv = 1.4; this.slow = .5; Sound.sfx("wrong"); this.cameras.main.shake(180, .008);
      const oops = { puddle: "Плюх! Прямо в лужу!", bench: "Ай, скамейка!", dog: "Ой, пёсик! Извини!", scooter: "Самокатчик!", selfie: "Осторожно, селфи-палка!", branch: "Ветка! Голову береги!" }[o.type];
      if (oops) UI.toast(oops, 1200);
      if (this.hearts <= 0) this.fail();
    });
    this.obs = this.obs.filter(o => o.x > -60);
    // Лера: впереди, расстояние сокращается
    const k = Math.min(1, this.dist / this.D); this.leX = 270 - k * 170;
    this.cheerT -= dt; if (this.cheerT <= 0) { this.cheerT = 7 + Math.random() * 4; UI.toast(["Лера: Давай-давай!", "Лера: Дыши ровно!", "Лера: Ещё чуть-чуть!", "Лера: Ты сможешь!", "Лера: Не отставай!"][Math.floor(Math.random() * 5)], 1500); }
    if (this.dist >= this.D) this.finish();
  }
  async fail() {
    this.state = "fail"; UI.goal("");
    await World.wait(this, 500);
    await UI.say([{ who: "le", text: "Женя, ты как? Цела? Отдышись и давай ещё разок, я подожду!" }]);
    this.reset(); this.leX = 270;
    for (const n of ["3", "2", "1"]) { UI.banner(`<div class="syl"><span>${n}</span></div>`, "chant", 600); Sound.sfx("blip", 1.6); await World.wait(this, 650); }
    this.state = "run"; this.v = 95; UI.goal("Догони Леру!");
  }
  async finish() {
    this.state = "done"; UI.goal(""); Sound.sfx("done");
    this.tweens.add({ targets: this, leX: 92, duration: 900 });
    await World.wait(this, 1000);
    await UI.say([
      { who: "le", text: "Ого, догнала! Да ты в отличной форме!" },
      { who: "zhs", text: "Уф... Это всё мамины бутерброды. И ещё немного злости на самокатчиков." },
      { who: "le", text: this.water ? `И воду по дороге собрала, ${this.water} бут.! Вот это подготовка.` : "Ха! Самокатчики тут везде, привыкай." },
      { who: "le", text: "Слушай, пошли со мной на матч! Посмотришь, как я играю. А потом сыграем один на один?" },
      { who: "zhs", text: "Один на один с защитником? Ну держись!" }
    ]);
    Save.store("match");
    this.cameras.main.fadeOut(700, 0, 0, 0);
    this.time.delayedCall(750, () => this.scene.start("match"));
  }
  // ---------- отрисовка ----------
  draw(g, t) {
    const R = PK.R, P = PK.P, OL = RK.OL, G = this.G, s = t / 1000;
    this.bg(g, this.off, t);
    // препятствия
    this.obs.forEach(o => { const x = Math.round(o.x); if (o.hit && (o.type === "water" || o.type === "heart")) return;
      switch (o.type) {
        case "puddle": PK.ell(g, x + 10, G + 2, 11, 3, "#7ab0d8"); PK.ell(g, x + 8, G + 1, 5, 1, "#c8e4f4"); break;
        case "bench": RK.block(g, x, G - 12, 24, 3, 6, { top: "#8a5a32", front: "#6a4024" }); R(g, x, G - 18, 24, 3, "#8a5a32"); RK.box(g, x, G - 18, 24, 3, OL); R(g, x + 2, G - 3, 2, 3, "#2a2a30"); R(g, x + 20, G - 3, 2, 3, "#2a2a30"); break;
        case "dog": { const f = Math.floor(s * 10) % 2; R(g, x + 2, G - 7, 10, 5, "#c8883a"); R(g, x, G - 10, 5, 5, "#c8883a"); P(g, x + 1, G - 9, OL); R(g, x - 1, G - 7, 2, 1, "#3a2420"); R(g, x + 12, G - 9, 2, 2, "#c8883a");
          R(g, x + 3, G - 2, 2, 2 - f, "#8a5a28"); R(g, x + 9, G - 2, 2, 1 + f, "#8a5a28"); RK.box(g, x + 2, G - 7, 10, 5, OL); break; }
        case "scooter": R(g, x, G - 3, 14, 2, "#2a2a30"); R(g, x + 1, G - 18, 2, 16, "#4a4a54"); R(g, x - 1, G - 18, 6, 2, "#4a4a54"); PK.ell(g, x + 2, G - 1, 2, 2, OL); PK.ell(g, x + 12, G - 1, 2, 2, OL);
          R(g, x + 4, G - 16, 6, 9, "#3a8ac8"); PK.ell(g, x + 7, G - 19, 3, 3, "#e8b48e"); R(g, x + 4, G - 22, 6, 3, "#d8202c"); R(g, x + 5, G - 7, 2, 5, "#2a2a30"); R(g, x + 8, G - 7, 2, 5, "#2a2a30"); break;
        case "selfie": { const tx = x - 10; R(g, tx, G - 24, 7, 12, "#e86a8a"); PK.ell(g, tx + 3, G - 27, 3, 3, "#f4cca8"); R(g, tx + 1, G - 12, 2, 12, "#3a3a48"); R(g, tx + 4, G - 12, 2, 12, "#3a3a48"); R(g, tx - 1, G - 32, 9, 2, "#f2d23a");
          PK.line(g, tx + 6, G - 20, x + o.w, G - 18, "#8a8a92"); R(g, x + o.w - 1, G - 21, 4, 6, "#2a2a30"); P(g, x + o.w, G - 19, "#8ad0ff"); break; }
        case "branch": R(g, x - 9, G - 74, 6, 72, "#5a3e2a"); R(g, x - 9, G - 74, 2, 72, "#7a5a3a"); PK.ell(g, x - 6, G - 76, 16, 8, "#3f7a32");
          PK.line(g, x - 4, G - 40, x + o.w, G - 26, "#6a4a32"); PK.line(g, x - 4, G - 39, x + o.w, G - 25, "#6a4a32");
          for (let k = 0; k < 7; k++) PK.ell(g, x + k * 4, G - 30 + k * 1.4 + (k % 2) * 2, 4, 3, k % 2 ? "#4f8a3a" : "#3f7a32"); break;
        case "pigeons": for (let k = 0; k < 4; k++) { if (o.hit) { o.flyT = (o.flyT || 0) + .016; const fx = x + k * 6 + o.flyT * 40 * (k % 2 ? 1 : -1), fy = G - 3 - o.flyT * 80 - k * 4, f = Math.floor(s * 12) % 2; R(g, fx, fy, 5, 2, "#8a8a98"); R(g, fx - 2, fy - 1 - f, 3, 1, "#a8a8b8"); R(g, fx + 4, fy - 1 - f, 3, 1, "#a8a8b8"); }
          else { const px = x + k * 6, peck = Math.sin(s * 3 + k) > .6 ? 1 : 0; R(g, px, G - 4, 5, 3, "#8a8a98"); R(g, px + 4, G - 5 + peck, 2, 2, "#6a6a78"); P(g, px + 5, G - 5 + peck, OL); } } break;
        case "water": { const y = G - o.lo - 10 + Math.round(Math.sin(s * 4 + o.x * .1)); R(g, x + 2, y, 5, 9, "#8ad0ff"); R(g, x + 3, y - 2, 3, 2, "#3a6ac8"); R(g, x + 3, y + 3, 3, 3, "#f4f0e8"); RK.box(g, x + 2, y, 5, 9, "#3a6ac8"); break; }
        case "heart": { const y = G - o.lo - 8 + Math.round(Math.sin(s * 4) * 2); ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"].forEach((row, yy) => [...row].forEach((b, xx) => { if (b === "1") P(g, x + xx, y + yy, "#e84a5a"); })); break; }
      } });
    // Лера впереди
    const lf = Math.floor(s * 8) % 2, lk = this.state === "intro" && this.leX >= 199 && this.leX <= 201 ? "le_run_side_0" : `le_run_side_${lf}`;
    g.drawImage(this.tex(lk), Math.round(this.leX) - 8, G - 23 + (lf && this.state !== "done" ? -1 : 0));
    // Женя
    const hb = this.hitbox(), blinkOff = this.inv > 0 && Math.floor(s * 12) % 2;
    if (!blinkOff) {
      const air = this.y < 0, f = this.state === "run" ? Math.floor(s * 9) % 2 : 0, img = this.tex(air ? "zh_summer_side_1" : `zh_summer_side_${f}`);
      if (hb.slide) g.drawImage(img, 0, 0, 16, 26, 62, G - 14, 16, 14);
      else g.drawImage(img, 62, Math.round(G - 26 + this.y));
    }
    RK.shadeEll(g, 70, G + 1, 6, 2, .25);
    if (this.state === "intro") return;
    // интерфейс: сердечки, вода, полоса до Леры
    for (let i = 0; i < 3; i++) ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"].forEach((row, yy) => [...row].forEach((b, xx) => { if (b === "1") P(g, 6 + i * 11 + xx, 166 + yy, i < this.hearts ? "#e84a5a" : "#5a3a40"); }));
    const bx = 100, bw = 140, k = Math.min(1, this.dist / this.D);
    R(g, bx, 168, bw, 4, "#3a3a48"); R(g, bx, 168, bw * k, 4, "#f2c23a"); RK.box(g, bx - 1, 167, bw + 2, 6, OL);
    g.drawImage(this.tex("zh_summer_front_0"), 0, 0, 16, 12, bx + bw * k - 8, 154, 16, 12);
    g.drawImage(this.tex("le_run_front_0"), 0, 0, 16, 12, bx + bw - 8, 154, 16, 12);
    R(g, 290, 166, 5, 8, "#8ad0ff"); RK.box(g, 290, 166, 5, 8, "#3a6ac8"); StationArt.text(g, String(this.water), 298, 168, "#ffffff");
  }
}
