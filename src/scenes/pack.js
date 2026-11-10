/* Квест «Собери чемодан»: перетащи все вещи в сетку 7×4, чтобы ничего не торчало.
   Правый клик или R — повернуть вещь. Через минуту можно позвать маму на помощь (клавиша H). */
"use strict";
class PackScene extends Phaser.Scene {
  // Поднос слева и места вещей на нём: три ровных ряда, выровненных по центру
  static TRAY = { x: 10, y: 30, w: 148, h: 120 };
  static HOME = { dress: [20, 50], borsch: [58, 57], valenki: [96, 57], vodka: [134, 57],
    herring: [23, 102], sneakers: [77, 102], makeup: [117, 102], scarf: [42, 126], passport: [112, 126] };
  constructor() { super("pack"); }
  create() {
    Sound.play("pack"); UI.goal("Уложи все вещи в чемодан"); UI.hint("Тяни мышкой · правый клик или R — повернуть");
    this.cameras.main.fadeIn(350, 0, 0, 0);
    this.input.mouse.disableContextMenu();
    const C = Items.CELL, GX = 189, GY = 84, COLS = 7, ROWS = 4;
    this.G = { C, GX, GY, COLS, ROWS };
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    // ---------- фон: пол, чемодан ----------
    const bg = this.bgCanvas();
    World.backdrop(this, "pack_bg", (g, t) => { g.drawImage(bg, 0, 0); this.drawGhost(g); });
    // ---------- вещи на полу слева ----------
    const HOME = PackScene.HOME;
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
    const cv = PK.mk(320, 180), g = cv.getContext("2d"), R = PK.R, P = PK.P, OL = RK.OL, rnd = PK.rng(4), { C, GX, GY, COLS, ROWS } = this.G;
    // ковёр
    R(g, 0, 0, 320, 180, "#7a2a2a");
    for (let y = 0; y < 180; y += 12) for (let x = ((y / 12) & 1) * 12; x < 320; x += 24) { PK.poly(g, [[x + 6, y], [x + 12, y + 6], [x + 6, y + 12], [x, y + 6]], "#8a3430"); P(g, x + 6, y + 6, "#e8b860"); }
    RK.speck(g, rnd, 0, 0, 320, 180, 300, "#5a1e22", .6);
    // ---------- поднос «Мамины гостинцы»: аккуратные места под каждую вещь ----------
    const T = PackScene.TRAY;
    RK.shade(g, T.x + 3, T.y + T.h + 1, T.w, 4, .35);
    R(g, T.x, T.y, T.w, T.h, "#e8d4b0"); R(g, T.x + 3, T.y + 14, T.w - 6, T.h - 17, "#d8bc90"); RK.box(g, T.x, T.y, T.w, T.h, OL);
    for (let y = T.y + 16; y < T.y + T.h - 3; y += 4) for (let x = T.x + 5 + ((y >> 2) & 1) * 2; x < T.x + T.w - 4; x += 4) P(g, x, y, "#ccb084");
    R(g, T.x + 1, T.y + 1, T.w - 2, 12, "#c8402a"); R(g, T.x + 1, T.y + 12, T.w - 2, 1, "#8a2a1e");
    const title = "МАМИНЫ ГОСТИНЦЫ", tw = StationArt.textW(title); StationArt.text(g, title, Math.round(T.x + (T.w - tw) / 2), T.y + 4, "#fff4d8");
    [[T.x + 6, T.y + 6], [T.x + T.w - 8, T.y + 6]].forEach(([x, y]) => { R(g, x, y, 2, 2, "#f2d23a"); });
    Items.LIST.forEach(it => { const [hx, hy] = PackScene.HOME[it.id], w = it.w * C, h = it.h * C;
      R(g, hx - 1, hy - 1, w + 2, h + 2, "#c4a274"); for (let x = hx - 1; x < hx + w + 1; x += 2) { P(g, x, hy - 2, "#a8865a"); P(g, x, hy + h + 1, "#a8865a"); } for (let y = hy - 1; y < hy + h + 1; y += 2) { P(g, hx - 2, y, "#a8865a"); P(g, hx + w + 1, y, "#a8865a"); } });
    // ---------- чемодан ----------
    const W = COLS * C, H = ROWS * C, cx = GX + W / 2, LY = GY - 50;
    RK.shade(g, GX - 4, GY + H + 6, W + 12, 5, .35);
    // крышка: корпус, стёганая подкладка, две резинки и карман на молнии
    R(g, GX - 6, LY, W + 12, 44, "#c48a32"); R(g, GX - 6, LY, W + 12, 2, "#e0a84a"); RK.box(g, GX - 6, LY, W + 12, 44, OL);
    R(g, GX - 2, LY + 4, W + 4, 36, "#8a3a3a"); RK.box(g, GX - 2, LY + 4, W + 4, 36, "#5a2020");
    for (let y = LY + 6; y < LY + 39; y += 6) for (let x = GX + 1 + ((((y - LY) / 6) & 1) ? 4 : 0); x < GX + W; x += 8) { P(g, x, y, "#a85050"); P(g, x - 1, y + 1, "#6a2a2a"); P(g, x + 1, y + 1, "#6a2a2a"); }
    R(g, GX + 2, LY + 28, W - 4, 10, "#7a3030"); R(g, GX + 2, LY + 28, W - 4, 1, "#c8a040"); for (let x = GX + 3; x < GX + W - 3; x += 2) P(g, x, LY + 29, "#e8c060"); R(g, cx - 2, LY + 30, 4, 3, "#e8c060");
    // наклейки строго по центру: Италия — сердечко — Россия
    const flag = (x, y, cols, vertical) => { R(g, x - 1, y - 1, 17, 12, OL); cols.forEach((c, i) => vertical ? R(g, x + i * 5, y, 5, 10, c) : R(g, x, y + i * 3 + (i ? 1 : 0), 15, i ? 3 : 4, c)); R(g, x, y, 15, 1, "rgba(255,255,255,.35)"); };
    flag(cx - 30, LY + 11, ["#3a8a4a", "#f4ece0", "#c8303a"], true);
    flag(cx + 15, LY + 11, ["#f4ece0", "#3a5ab0", "#c8303a"], false);
    ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"].forEach((row, y) => [...row].forEach((b, x) => { if (b === "1") P(g, cx - 4 + x, LY + 13 + y, y === 0 && x === 1 ? "#ffb0b8" : "#e84a5a"); }));
    [GX + 9, GX + W - 9].forEach(x => { R(g, x - 2, LY + 4, 4, 24, "#2a2a30"); R(g, x - 3, LY + 14, 6, 4, "#c8c8d0"); });
    // петли
    R(g, GX - 4, GY - 6, W + 8, 4, "#8a5a2a"); [GX + 10, GX + W - 14].forEach(x => R(g, x, GY - 6, 4, 4, "#d8d0c0"));
    // дно: корпус, подкладка, сетка-ячейки, ремни по бокам
    R(g, GX - 6, GY - 3, W + 12, H + 8, "#c48a32"); RK.box(g, GX - 6, GY - 3, W + 12, H + 8, OL);
    R(g, GX - 1, GY - 1, W + 2, H + 2, "#4a2020"); R(g, GX, GY, W, H, "#6a2a2a");
    for (let y = GY; y < GY + H; y += 2) for (let x = GX + (y & 2 ? 1 : 0); x < GX + W; x += 4) P(g, x, y, "#723030");
    for (let c = 1; c < COLS; c++) for (let y = GY; y < GY + H; y += 2) P(g, GX + c * C, y, "#8a4040");
    for (let r = 1; r < ROWS; r++) for (let x = GX; x < GX + W; x += 2) P(g, x, GY + r * C, "#8a4040");
    [GY + 3, GY + H - 6].forEach(y => { R(g, GX - 6, y, 3, 3, "#2a2a30"); R(g, GX + W + 3, y, 3, 3, "#2a2a30"); });
    R(g, cx - 6, GY + H + 3, 12, 3, "#e8c060"); R(g, cx - 1, GY + H + 3, 2, 2, "#8a6a1e");    // замок по центру
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
