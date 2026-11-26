/* Финальные титры: тёмный зал в духе «Игры в кальмара» (○ △ □, номер игрока 456 — как у главного героя сериала,
   золотая копилка-приз), снизу шагают все герои, по центру ползут титры. Музыка — трек "credits". */
"use strict";
class CreditsScene extends Phaser.Scene {
  constructor() { super("credits"); }
  create() {
    Save.store("credits"); Sound.play("credits"); Sound.ambient(null); UI.reset(); Postcards.trackTag(true, "credits");
    this.cameras.main.fadeIn(1200, 0, 0, 0);
    this.t0 = this.time.now;
    const add = (k, cv) => { if (!this.textures.exists(k)) this.textures.addCanvas(k, cv); };
    const D = DanceArt.dana(); D.front.forEach((c, i) => add(`da_front_${i}`, c));
    add("goose", EgorArt.goose());
    // кто шагает внизу (по очереди слева направо)
    this.walkers = [["zh_summer_front_", 3], ["eg_front_", 3], ["lo_front_", 3], ["na_front_", 3], ["gi_front_", 3], ["le_run_front_", 3], ["da_front_", 3], ["pa_home_idle", 1], ["ma_home_idle", 1]];
    World.backdrop(this, "cr_bg", (g, t) => this.draw(g, t), -1000);
    this.buildRoll();
    this.skipKey = e => { if (["Space", "Enter"].includes(e.code) && this.done) { e.preventDefault(); this.finish(); } };
    window.addEventListener("keydown", this.skipKey);
    this.events.once("shutdown", () => { window.removeEventListener("keydown", this.skipKey); Postcards.trackTag(false); const el = document.getElementById("credits"); if (el) el.remove(); });
  }
  buildRoll() {
    const el = document.createElement("div"); el.id = "credits";
    const P = (k, w) => { const img = this.textures.get(k).getSourceImage(); const c = document.createElement("canvas"); c.width = 16; c.height = 16; c.getContext("2d").drawImage(img, 0, 0, 16, 16, 0, 0, 16, 16); return c.toDataURL(); };
    const row = (key, role, name) => `<div class="cr-row"><span class="cr-role">${role}</span><img src="${P(key)}" alt=""><span class="cr-name">${name}</span></div>`;
    el.innerHTML = `<div class="cr-roll">
      <div class="cr-shapes">○ △ □</div>
      <div class="cr-title">Лето Жени</div>
      <div class="cr-sub">С днём рождения, Женя!</div>
      <div class="cr-h">В ролях</div>
      ${row("zh_summer_front_0", "Главная героиня, игрок №456", "Женя")}
      ${row("eg_front_0", "Брат, автор открыток", "Егор")}
      ${row("lo_front_0", "Лоренцо, водитель серпантина", "Лоренцо")}
      ${row("na_front_0", "Лучшая подруга и переводчица", "Нарина")}
      ${row("gi_idle", "Мастер эспрессо и голубей", "Джанлука")}
      ${row("le_run_front_0", "Защитник и марафонец", "Лера")}
      ${row("da_front_0", "Тренер Vogue и High Heels", "Дана")}
      ${row("pa_home_idle", "Кукла «Красный свет», болельщик «Спартака»", "Папа Алексей")}
      ${row("ma_home_idle", "Блины с икрой", "Мама Наталья")}
      ${row("goose", "Подарок от коллег из Lido", "Белый гусь")}
      <div class="cr-h">Открытки «Помнишь, как мы...?»</div>
      <div class="cr-line">Сериалы на диване · Кросс по Коврову · Мастер попы</div>
      <div class="cr-line">Пробка во Владимире · Яблочный десерт и половник</div>
      <div class="cr-line">и папин шаманский обряд в глэмпинге</div>
      <div class="cr-h">Идея, сюжет и любовь</div>
      <div class="cr-line big">Егор</div>
      <div class="cr-h">Финальная игра</div>
      <div class="cr-line">Игрок №456 — Женя</div>
      <div class="cr-line">Статус: <b>ПОБЕДИТЕЛЬ</b></div>
      <div class="cr-line">Приз: вся наша любовь (копилка уже переполнена)</div>
      <div class="cr-end">С днём рождения! ★</div>
    </div>`;
    document.getElementById("ui").appendChild(el);
    this.roll = el.querySelector(".cr-roll"); this.rollY = 0;
  }
  update(time, dt) {
    if (!this.roll) return;
    const z = this.game.canvas.clientHeight / 180 || 4;
    this.rollY += dt / 1000 * 11 * z;   // 11 «игровых» пикселей в секунду
    // окно титров — над головами шагающих героев; в конце «С днём рождения!» останавливается посередине окна
    const H = this.roll.parentNode.clientHeight, e = this.roll.querySelector(".cr-end"), end = H * .5 + e.offsetTop + e.offsetHeight / 2;
    const y = Math.min(this.rollY, end);
    this.roll.style.transform = `translateY(${(H - y).toFixed(1)}px)`;
    if (!this.done && this.rollY >= end) { this.done = true; this.time.delayedCall(800, () => UI.hint("Пробел — в главное меню")); }
  }
  finish() { UI.hint(""); this.cameras.main.fadeOut(900, 0, 0, 0); this.time.delayedCall(950, () => this.scene.start("title", { music: "credits" })); }
  draw(g, t) {
    const R = PK.R, s = (t - this.t0) / 1000;
    PK.gradV(g, 0, 0, 320, 180, ["#120a1e", "#1e1030", "#2a1238"]);
    // неоновые ○ △ □ плывут по фону
    const sh = [["o", "#ff4a8a"], ["t", "#ff4a8a"], ["q", "#ff4a8a"]];
    for (let k = 0; k < 9; k++) { const x = (k * 47 + s * (6 + k % 3 * 3)) % 360 - 20, y = 16 + (k * 29) % 110 + Math.sin(s + k) * 4, a = .18 + .12 * Math.sin(s * 2 + k);
      g.save(); g.globalAlpha = a; g.strokeStyle = sh[k % 3][1]; g.lineWidth = 2; g.beginPath();
      if (k % 3 === 0) g.arc(x, y, 7, 0, 6.3); else if (k % 3 === 1) { g.moveTo(x - 8, y + 6); g.lineTo(x, y - 8); g.lineTo(x + 8, y + 6); g.closePath(); } else g.rect(x - 7, y - 7, 14, 14);
      g.stroke(); g.restore(); }
    // золотая копилка-приз под потолком
    const py = 18 + Math.sin(s * 1.5) * 2; g.save(); g.globalAlpha = .85;
    PK.ell(g, 290, py + 10, 14, 10, "#e8b830"); PK.ell(g, 286, py + 7, 6, 3, "#ffe070"); R(g, 286, py, 8, 2, "#7a5a10"); R(g, 280, py + 18, 4, 4, "#c89a20"); R(g, 296, py + 18, 4, 4, "#c89a20"); PK.ell(g, 302, py + 11, 3, 3, "#f2c840"); g.restore();
    // пол и шагающие герои
    R(g, 0, 152, 320, 28, "#2a1a30"); for (let x = 0; x < 320; x += 20) R(g, x, 152, 10, 1, "#ff4a8a");
    this.walkers.forEach(([k, n], i) => {
      const x = ((s * 18 + i * 34) % 400) - 40, f = n > 1 ? `${k}${Math.floor(s * 6 + i) % 3}` : k, img = this.textures.get(f).getSourceImage();
      g.drawImage(img, Math.round(x) - 8, 150 - img.height + (n > 1 ? 0 : Math.round(Math.abs(Math.sin(s * 6 + i)))));
      if (i === 0 && this.textures.exists("goose")) g.drawImage(this.textures.get("goose").getSourceImage(), Math.round(x) + 2, 138);
    });
  }
}
