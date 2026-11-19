/* Переходы между местами: пиксельная карта Милана, по ней пунктиром идёт маршрут, а значок (Женя, метро, машина)
   едет от точки к точке. Длится ~4 секунды, пробел — пропустить. Потом запускается следующая сцена.
   Запуск: this.scene.start("transit", { route: "metro", next: "duomo" }). */
"use strict";
window.MapArt = (() => {
  const W = 320, H = 180, R = PK.R, P = PK.P, OL = RK.OL;
  const PLACES = {
    centrale: [238, 36, "CENTRALE"], duomo: [168, 98, "DUOMO"], casa: [240, 132, "CASA NARINA"],
    sempione: [100, 58, "SEMPIONE"], navigli: [112, 150, "NAVIGLI"], colline: [30, 42, "COLLINE"], lorenzo: [290, 92, "CASA LORENZO"]
  };
  let base = null;
  function build() {
    const cv = PK.mk(W, H), g = cv.getContext("2d"), rnd = PK.rng(5);
    R(g, 0, 0, W, H, "#efe2c4");
    for (let i = 0; i < 900; i++) P(g, Math.floor(rnd() * W), Math.floor(rnd() * H), rnd() < .5 ? "#e6d6b4" : "#f6ecd4");
    // кварталы: сетка домиков
    for (let y = 4; y < H; y += 12) for (let x = 4; x < W; x += 14) { if (rnd() < .2) continue; R(g, x, y, 10, 8, rnd() < .5 ? "#e2c9a0" : "#dcbf94"); R(g, x, y + 7, 10, 1, "#c8a878"); }
    // кольца бульваров вокруг Дуомо
    g.save(); g.strokeStyle = "#f8f0dc"; g.lineWidth = 4; [42, 84].forEach(r => { g.beginPath(); g.ellipse(168, 98, r * 1.25, r, 0, 0, Math.PI * 2); g.stroke(); }); g.restore();
    g.save(); g.strokeStyle = "#c8b08a"; g.lineWidth = 1; [42, 84].forEach(r => { g.beginPath(); g.ellipse(168, 98, r * 1.25 + 2, r + 2, 0, 0, Math.PI * 2); g.stroke(); }); g.restore();
    // проспекты лучами от центра
    g.save(); g.strokeStyle = "#f8f0dc"; g.lineWidth = 3; [[238, 36], [100, 58], [112, 170], [300, 150], [20, 110], [320, 80]].forEach(([x, y]) => { g.beginPath(); g.moveTo(168, 98); g.lineTo(x, y); g.stroke(); }); g.restore();
    // холмы и озеро вдали (левый верхний угол)
    PK.poly(g, [[0, 18], [60, 18], [70, 30], [58, 44], [40, 52], [16, 58], [0, 60]], "#9ab070");
    PK.poly(g, [[0, 26], [44, 26], [40, 36], [20, 44], [0, 48]], "#7a9a5a");
    for (let k = 0; k < 5; k++) PK.poly(g, [[6 + k * 12, 40 - (k % 2) * 4], [12 + k * 12, 30 - (k % 2) * 4], [18 + k * 12, 40 - (k % 2) * 4]], "#6a8a4a");
    PK.ell(g, 58, 26, 8, 4, "#7ab8d8");
    // парк Семпионе и замок
    PK.ell(g, 100, 58, 30, 18, "#8ab868"); PK.ell(g, 96, 55, 24, 13, "#9ac878");
    for (let k = 0; k < 26; k++) { const a = rnd() * 6.28, r = rnd(); PK.ell(g, Math.round(100 + Math.cos(a) * 24 * r), Math.round(58 + Math.sin(a) * 14 * r), 2, 2, "#5a9a48"); }
    R(g, 118, 66, 14, 9, "#b86a4a"); R(g, 117, 64, 3, 4, "#a85a3a"); R(g, 130, 64, 3, 4, "#a85a3a"); RK.box(g, 117, 64, 16, 11, OL);
    // каналы Навильи
    g.save(); g.strokeStyle = "#5a9ac8"; g.lineWidth = 3; g.beginPath(); g.moveTo(120, 140); g.lineTo(60, 178); g.stroke(); g.beginPath(); g.moveTo(120, 140); g.lineTo(150, 178); g.stroke(); g.restore();
    PK.ell(g, 120, 140, 6, 4, "#5a9ac8");
    // Централе
    R(g, 226, 26, 26, 12, "#d8c8a8"); R(g, 230, 22, 18, 4, "#c8b898"); for (let x = 229; x < 250; x += 4) R(g, x, 29, 2, 6, "#8a7a6a"); RK.box(g, 226, 22, 26, 16, OL);
    // Дуомо: белый собор со шпилями
    R(g, 156, 92, 24, 12, "#f8f6f0"); for (let x = 156; x < 181; x += 4) R(g, x, 87, 1, 5, "#f8f6f0"); R(g, 167, 82, 2, 10, "#f8f6f0"); P(g, 167, 81, "#f2c23a"); P(g, 168, 81, "#f2c23a");
    R(g, 160, 97, 3, 4, "#c8c0b0"); R(g, 173, 97, 3, 4, "#c8c0b0"); RK.box(g, 155, 91, 26, 14, OL);
    // дом Нарины: домик с сердечком
    R(g, 233, 128, 14, 9, "#e8b090"); PK.poly(g, [[231, 128], [240, 121], [249, 128]], "#c8603a"); R(g, 238, 132, 3, 5, "#7a4a32"); RK.box(g, 233, 128, 14, 9, OL);
    R(g, 243, 124, 1, 1, "#e8607a"); R(g, 245, 124, 1, 1, "#e8607a"); R(g, 243, 125, 3, 1, "#e8607a"); P(g, 244, 126, "#e8607a");
    // подписи
    Object.values(PLACES).forEach(([x, y, name]) => { const w = StationArt.textW(name, 1); const tx = Math.max(2, Math.min(W - w - 4, x - w / 2)), ty = y + 10;
      R(g, tx - 2, ty - 1, w + 4, 8, "#fff8e6"); RK.box(g, tx - 2, ty - 1, w + 4, 8, "#8a6a4a"); StationArt.text(g, name, tx, ty, "#5a3a2a"); });
    // роза ветров и рамка
    PK.poly(g, [[302, 150], [305, 160], [302, 170], [299, 160]], "#8a6a4a"); PK.poly(g, [[292, 160], [302, 157], [312, 160], [302, 163]], "#b89a74"); StationArt.text(g, "N", 300, 142, "#5a3a2a");
    RK.box(g, 0, 0, W, H, "#8a6a4a"); RK.box(g, 1, 1, W - 2, H - 2, "#c8a878");
    StationArt.text(g, "MILANO", W / 2 - StationArt.textW("MILANO", 2) / 2, 4, "#8a4a3a", 2);
    return cv;
  }
  return { get base() { return base || (base = build()); }, PLACES };
})();

class TransitScene extends Phaser.Scene {
  constructor() { super("transit"); }
  // маршруты: путь по точкам, значок, подпись
  static ROUTES = {
    metro:   { from: "centrale", to: "duomo", icon: "metro", via: [[214, 60], [190, 82]], text: "На метро от вокзала до Дуомо", sfx: "tram" },
    car:     { from: "duomo", to: "casa", icon: "walk", via: [[196, 110], [224, 118]], text: "Втроём к Нарине домой" },
    walk:    { from: "casa", to: "sempione", icon: "walk", via: [[210, 112], [168, 80], [134, 64]], text: "Утром — пробежка в парк Семпионе" },
    navigli: { from: "sempione", to: "navigli", icon: "walk", via: [[110, 84], [118, 120]], text: "С Лерой вдоль каналов к Навильи" },
    party:   { from: "colline", to: "lorenzo", icon: "car", via: [[70, 60], [140, 72], [220, 80], [270, 88]], text: "Вечером — домой к Лоренцо" },
    hills:   { from: "navigli", to: "colline", icon: "car", via: [[90, 120], [60, 84], [40, 56]], text: "С Лоренцо за город, к холмам" }
  };
  init(data) { this.data_ = data || {}; }
  create() {
    const r = TransitScene.ROUTES[this.data_.route] || TransitScene.ROUTES.walk, P = MapArt.PLACES;
    this.pts = [P[r.from].slice(0, 2), ...r.via, P[r.to].slice(0, 2)];
    this.lens = []; this.total = 0; for (let i = 1; i < this.pts.length; i++) { const l = Math.hypot(this.pts[i][0] - this.pts[i - 1][0], this.pts[i][1] - this.pts[i - 1][1]); this.lens.push(l); this.total += l; }
    this.icon = r.icon; this.t = 0; this.dur = 3600; this.done = false;
    const src = k => this.textures.get(k).getSourceImage();
    this.carCv = LorenzoArt.car(false); this.headCv = UI.portrait("zhs");
    UI.goal(r.text); UI.hint("Пробел — пропустить");
    this.cameras.main.fadeIn(500, 0, 0, 0);
    World.backdrop(this, "map_bg", (g, t) => this.draw(g, t), -1000);
    const skip = e => { if (["Space", "Enter"].includes(e.code) && !this.done && !UI.busy) { e.preventDefault(); this.finish(); } };
    window.addEventListener("keydown", skip); this.events.once("shutdown", () => { window.removeEventListener("keydown", skip); UI.hint(""); UI.goal(""); });
    this.stepT = 0;
  }
  at(p) { let d = p * this.total; for (let i = 0; i < this.lens.length; i++) { if (d <= this.lens[i] || i === this.lens.length - 1) { const k = Math.min(1, d / this.lens[i]), a = this.pts[i], b = this.pts[i + 1]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[1] - a[1], b[0] - a[0])]; } d -= this.lens[i]; } }
  update(time, dt) {
    if (this.done) return;
    this.t += dt; this.stepT += dt;
    if (this.stepT > (this.icon === "walk" ? 260 : 600)) { this.stepT = 0; Sound.sfx(this.icon === "walk" ? "step" : "blip", .5); }
    if (this.t >= this.dur + 600) this.finish();
  }
  finish() {
    if (this.done) return; this.done = true; Sound.sfx("select");
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.time.delayedCall(480, () => this.scene.start(this.data_.next || "title", this.data_.data || {}));
  }
  draw(g, t) {
    const R = PK.R, p = Math.min(1, this.t / this.dur), ease = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    g.drawImage(MapArt.base, 0, 0);
    // пройденный путь — пунктир
    for (let d = 0; d < ease; d += 6 / this.total) { const [x, y] = this.at(d); if (Math.floor(d * this.total / 6) % 2 === 0) R(g, Math.round(x) - 1, Math.round(y) - 1, 2, 2, "#d8303a"); }
    // точки «откуда» и «куда»
    const [ax, ay] = this.pts[0], [bx, by] = this.pts[this.pts.length - 1], pulse = Math.floor(t / 300) % 2;
    PK.ell(g, ax, ay, 3, 3, "#5a3a2a"); PK.ell(g, bx, by, 4 + pulse, 4 + pulse, "#d8303a"); PK.ell(g, bx, by, 2, 2, "#fff8e6");
    // значок едет по маршруту
    const [x, y, ang] = this.at(ease);
    if (this.icon === "car") { g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(ang + Math.PI / 2); g.scale(.7, .7); g.drawImage(this.carCv, -8, -13); g.restore(); }
    else if (this.icon === "metro") { R(g, Math.round(x) - 6, Math.round(y) - 6, 12, 12, "#d8303a"); RK.box(g, Math.round(x) - 6, Math.round(y) - 6, 12, 12, RK.OL); StationArt.text(g, "M", Math.round(x) - 2, Math.round(y) - 3, "#fff8e6"); }
    else if (this.headCv) { const bob = Math.floor(t / 130) % 2; R(g, Math.round(x) - 9, Math.round(y) - 18 - bob, 18, 18, "#fff8e6"); RK.box(g, Math.round(x) - 9, Math.round(y) - 18 - bob, 18, 18, RK.OL); g.drawImage(this.headCv, Math.round(x) - 8, Math.round(y) - 17 - bob); }
  }
}
