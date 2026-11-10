/* Квест «Собери чемодан»: перетащи все вещи в сетку 7×4, чтобы ничего не торчало.
   Правый клик или R — повернуть вещь. Через минуту можно позвать маму на помощь (клавиша H). */
"use strict";
class PackScene extends Phaser.Scene {
  constructor() { super("pack"); }
  create() {
    Sound.play("pack"); UI.goal("Уложи все вещи в чемодан"); UI.hint("Тяни мышкой · правый клик или R — повернуть");
    this.cameras.main.fadeIn(350, 0, 0, 0);
    this.input.mouse.disableContextMenu();
    const C = Items.CELL, GX = 168, GY = 70, COLS = 7, ROWS = 4;
    this.G = { C, GX, GY, COLS, ROWS };
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    // ---------- фон: пол, чемодан ----------
    const bg = this.bgCanvas();
    World.backdrop(this, "pack_bg", (g, t) => { g.drawImage(bg, 0, 0); this.drawGhost(g); });
    // ---------- вещи на полу слева ----------
    const HOME = { borsch: [12, 34], vodka: [46, 30], valenki: [66, 34], herring: [12, 72], scarf: [64, 112], dress: [106, 30], passport: [116, 82], sneakers: [12, 96], makeup: [12, 118] };
    this.items = Items.LIST.map(it => {
      const [hx, hy] = HOME[it.id];
      const spr = this.add.image(hx, hy, `item_${it.id}_0`).setOrigin(0).setDepth(10);
      return { it, spr, rot: 0, home: [hx, hy], cell: null, said: false };
    });
    this.drag = null;
    this.input.on("pointerdown", p => this.onDown(p));
    this.input.on("pointermove", p => this.onMove(p));
    this.input.on("pointerup", p => this.onUp(p));
    this.rKey = this.input.keyboard.addKey("R"); this.rKey.on("down", () => this.rotate());
    this.hKey = this.input.keyboard.addKey("H"); this.hKey.on("down", () => { if (this.helpReady) this.solve(); });
    this.helpReady = false;
    this.time.delayedCall(60000, () => { if (!this.finished) { this.helpReady = true; UI.toast("Не влезает? Нажми H, и мама поможет."); UI.hint("Тяни мышкой · R — повернуть · H — мама поможет"); } });
    this.finished = false;
    this.time.delayedCall(400, () => UI.toast("Мама: Всё должно влезть, я проверяла!"));
  }
  bgCanvas() {
    const cv = PK.mk(320, 180), g = cv.getContext("2d"), R = PK.R, OL = RK.OL, rnd = PK.rng(4), { C, GX, GY, COLS, ROWS } = this.G;
    // ковёр под вещами
    R(g, 0, 0, 320, 180, "#7a2a2a");
    for (let y = 0; y < 180; y += 12) for (let x = ((y / 12) & 1) * 12; x < 320; x += 24) { PK.poly(g, [[x + 6, y], [x + 12, y + 6], [x + 6, y + 12], [x, y + 6]], "#8a3430"); PK.P(g, x + 6, y + 6, "#e8b860"); }
    RK.speck(g, rnd, 0, 0, 320, 180, 300, "#5a1e22", .6);
    // зона «пол» слева — подсказка, где лежат вещи
    g.globalAlpha = .25; R(g, 6, 24, 150, 150, "#000"); g.globalAlpha = 1; RK.box(g, 6, 24, 150, 150, "#e8b860");
    // чемодан: крышка сверху, дно с сеткой
    const W = COLS * C, H = ROWS * C;
    RK.shade(g, GX - 4, GY + H + 6, W + 12, 5, .35);
    R(g, GX - 6, GY - 46, W + 12, 40, "#c48a32"); R(g, GX - 3, GY - 43, W + 6, 34, "#e8c890"); RK.box(g, GX - 6, GY - 46, W + 12, 40, OL);
    for (let x = GX; x < GX + W; x += 8) PK.P(g, x, GY - 26, "#c8a870");
    // наклейки на крышке
    R(g, GX + 4, GY - 40, 15, 9, "#3a8a4a"); R(g, GX + 9, GY - 40, 5, 9, "#f4ece0"); R(g, GX + 14, GY - 40, 5, 9, "#c8303a"); RK.box(g, GX + 3, GY - 41, 17, 11, OL);
    R(g, GX + 26, GY - 38, 15, 3, "#f4ece0"); R(g, GX + 26, GY - 35, 15, 3, "#3a5ab0"); R(g, GX + 26, GY - 32, 15, 3, "#c8303a"); RK.box(g, GX + 25, GY - 39, 17, 11, OL);
    R(g, GX - 4, GY - 6, W + 8, 4, "#8a5a2a");   // петли
    R(g, GX - 6, GY - 3, W + 12, H + 8, "#c48a32"); RK.box(g, GX - 6, GY - 3, W + 12, H + 8, OL);
    R(g, GX - 1, GY - 1, W + 2, H + 2, "#4a2a1a"); R(g, GX, GY, W, H, "#5a3424");
    for (let c = 0; c <= COLS; c++) R(g, GX + c * C, GY, 1, H, "#6a4430"); for (let r = 0; r <= ROWS; r++) R(g, GX, GY + r * C, W, 1, "#6a4430");
    R(g, GX + W / 2 - 6, GY + H + 3, 12, 3, "#e8c060");    // замок
    return cv;
  }
  dims(o, rot = o.rot) { return rot ? [o.it.h, o.it.w] : [o.it.w, o.it.h]; }
  itemAt(x, y) { for (let i = this.items.length - 1; i >= 0; i--) { const o = this.items[i], s = o.spr; if (x >= s.x && y >= s.y && x < s.x + s.width && y < s.y + s.height) return o; } return null; }
  // Где окажется вещь, если отпустить: клетка под её левым верхним углом
  target(o) {
    const { C, GX, GY, COLS, ROWS } = this.G, [w, h] = this.dims(o);
    const c = Math.round((o.spr.x - GX) / C), r = Math.round((o.spr.y - GY) / C);
    if (o.spr.x + o.spr.width < GX - C / 2 || o.spr.x > GX + COLS * C + C / 2 || o.spr.y + o.spr.height < GY - C / 2 || o.spr.y > GY + ROWS * C + C / 2) return null;
    const ok = c >= 0 && r >= 0 && c + w <= COLS && r + h <= ROWS && this.free(c, r, w, h, o);
    return { c, r, w, h, ok };
  }
  free(c, r, w, h, self) { for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) { const v = this.grid[y] && this.grid[y][x]; if (v && v !== self) return false; } return true; }
  mark(o, val) { if (!o.cell) return; const [w, h] = this.dims(o); for (let y = o.cell.r; y < o.cell.r + h; y++) for (let x = o.cell.c; x < o.cell.c + w; x++) this.grid[y][x] = val; }
  onDown(p) {
    if (this.finished || UI.busy) return;
    if (this.drag && p.rightButtonDown()) { this.rotate(); return; }
    const o = this.itemAt(p.worldX, p.worldY); if (!o) return;
    if (p.rightButtonDown()) { this.drag = { o, dx: p.worldX - o.spr.x, dy: p.worldY - o.spr.y }; this.mark(o, null); o.cell = null; this.rotate(); this.onUp(p); return; }
    this.mark(o, null); o.cell = null;
    this.drag = { o, dx: p.worldX - o.spr.x, dy: p.worldY - o.spr.y };
    o.spr.setDepth(100); this.children.bringToTop(o.spr);
    this.items.splice(this.items.indexOf(o), 1); this.items.push(o);
    Sound.sfx("pick"); UI.hint(o.it.name);
  }
  onMove(p) { if (!this.drag) return; const { o, dx, dy } = this.drag; o.spr.setPosition(Math.round(p.worldX - dx), Math.round(p.worldY - dy)); }
  rotate() {
    if (!this.drag) return; const o = this.drag.o; if (o.it.w === o.it.h) return;
    o.rot = 1 - o.rot; o.spr.setTexture(`item_${o.it.id}_${o.rot}`); const t = this.drag.dx; this.drag.dx = this.drag.dy; this.drag.dy = t; Sound.sfx("blip", 1.6);
  }
  onUp(p) {
    if (!this.drag) return; const o = this.drag.o; this.drag = null; o.spr.setDepth(10);
    const tg = this.target(o);
    if (tg && tg.ok) this.place(o, tg.c, tg.r);
    else { if (tg) Sound.sfx("wrong"); this.tweens.add({ targets: o.spr, x: o.home[0], y: o.home[1], duration: 180 }); if (o.rot) { o.rot = 0; o.spr.setTexture(`item_${o.it.id}_0`); } }
    UI.hint(this.helpReady ? "Тяни мышкой · R — повернуть · H — мама поможет" : "Тяни мышкой · правый клик или R — повернуть");
    this.check();
  }
  place(o, c, r, quiet) {
    const { C, GX, GY } = this.G;
    o.cell = { c, r }; this.mark(o, o); o.spr.setPosition(GX + c * C, GY + r * C);
    if (!quiet) { Sound.sfx("place"); if (!o.said) { o.said = true; UI.toast(o.it.say); } }
  }
  drawGhost(g) {
    if (!this.drag) return; const tg = this.target(this.drag.o); if (!tg) return;
    const { C, GX, GY } = this.G;
    g.globalAlpha = .45; PK.R(g, GX + tg.c * C, GY + tg.r * C, tg.w * C, tg.h * C, tg.ok ? "#6ae06a" : "#ff4a4a"); g.globalAlpha = 1;
  }
  solve() {
    this.helpReady = false; UI.toast("Мама: Дай-ка я. Смотри: платье сюда, валенки вот так...");
    this.grid.forEach(row => row.fill(null));
    this.items.forEach(o => { const [c, r, rot] = Items.SOLUTION[o.it.id]; o.cell = null; o.rot = rot; o.spr.setTexture(`item_${o.it.id}_${rot}`); });
    this.items.forEach((o, i) => { const [c, r] = Items.SOLUTION[o.it.id]; this.time.delayedCall(i * 140, () => { this.place(o, c, r, true); Sound.sfx("place"); if (i === this.items.length - 1) this.check(); }); });
  }
  async check() {
    if (this.finished || !this.items.every(o => o.cell)) return;
    this.finished = true; UI.hint(""); UI.goal(""); Sound.sfx("done");
    await World.wait(this, 700);
    await UI.say([
      { who: "zh", text: "Влезло! Всё до последней селёдки." },
      { who: "mama", text: "Ну вот, а ты говорила, грузовик. Умница моя." },
      { who: "papa", text: "Шарф сверху? Сверху. Застёгиваем!" }
    ]);
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.time.delayedCall(480, () => this.scene.start("home", { packed: true }));
  }
}
