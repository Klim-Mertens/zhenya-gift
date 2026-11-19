/* Открытки «Помнишь, как мы…?» и сценки-воспоминания.
   В каждой главе Женя находит вещь, связанную с братом, к ней приколота открытка от Егора.
   Postcards.find(scene, id) ставит текущую сцену на паузу, показывает открытку, потом запускает MemoryScene поверх
   (в тёплых, «плёночных» тонах), а после — возвращает игру ровно туда, где она была. */
"use strict";
window.Postcards = (() => {
  const LIST = {
    series: { n: 1, item: "remote", name: "пульт от телевизора", text: "Помнишь, как мы смотрели сериалы дома, на диване в зале? «Гравити Фолз», «Время приключений», «Перевал Дятлова», «Игра в кальмара»... Нашёл пульт — и сразу вспомнил наши вечера." },
    run: { n: 2, item: "bib", name: "номер участника кросса", text: "Помнишь кросс по Коврову этим летом? Восемь километров плечом к плечу. Ты держала темп как настоящая спортсменка, а я еле поспевал. Ты у меня сильная, упорная и самая классная сестра. Горжусь тобой!" },
    video: { n: 3, item: "phone", name: "старый телефон с видео", text: "Помнишь, как ты снимала меня на телефон? Мне шесть, я танцую «брейкданс», ты кричишь: «Егорка умеет вилять попой! Егор мастер попы!» — и тут я случайно пукнул. Мы смеялись до слёз. Мастер попы помнит всё!" },
    glamping: { n: 4, item: "stick", name: "палочка от костра", text: "Помнишь папин день рождения в глэмпинге? Костёр, палка, металлическая тарелка и папино горловое пение. Мы смеялись до слёз." }
  };
  const TOTAL = 4;
  function got() { try { return JSON.parse(localStorage.getItem("zhenya-gift-cards") || "[]"); } catch (e) { return []; } }
  function mark(id) { try { const g = got(); if (!g.includes(id)) g.push(id); localStorage.setItem("zhenya-gift-cards", JSON.stringify(g)); } catch (e) {} }
  // HTML-открытка: вещь крупно + текст + подпись; закрывается пробелом/кликом
  function show(id) {
    const c = LIST[id];
    let el = document.getElementById("postcard"); if (!el) { el = document.createElement("div"); el.id = "postcard"; document.getElementById("ui").appendChild(el); }
    el.innerHTML = `<div class="pc"><div class="pcl"><canvas width="16" height="16"></canvas><div class="pci"></div></div>
      <div class="pcr"><div class="pch">Помнишь, как мы...?</div><div class="pct"></div><div class="pcs">— Егор</div><div class="pcf">Пробел — вспомнить</div></div><div class="pcn">${c.n}/${TOTAL}</div></div>`;
    el.querySelector("canvas").getContext("2d").drawImage(EgorArt.item(c.item), 0, 0);
    el.querySelector(".pci").textContent = c.name; el.querySelector(".pct").textContent = c.text;
    el.hidden = false; Sound.sfx("sparkle");
    return new Promise(res => {
      const done = e => { if (e.type === "keydown" && !["Space", "Enter", "NumpadEnter"].includes(e.code)) return; e.preventDefault(); e.stopImmediatePropagation();
        window.removeEventListener("keydown", done, true); el.removeEventListener("pointerdown", done); el.hidden = true; Sound.sfx("select"); setTimeout(res, 80); };
      setTimeout(() => { window.addEventListener("keydown", done, true); el.addEventListener("pointerdown", done); }, 500);
    });
  }
  async function find(scene, id) {
    const game = scene.game, track = Sound.trackName, amb = Sound.ambName;
    await show(id); mark(id);
    // воспоминание поверх: текущая сцена на паузе, музыка возвращается после
    scene.scene.pause();
    await new Promise(res => { game.events.once("memory-done", res); scene.scene.launch("memory", { id, from: scene.scene.key }); });
    scene.scene.resume(); Sound.play(track); Sound.ambient(amb);
    UI.toast(`Открытка ${LIST[id].n} из ${TOTAL} ★`, 2200);
  }
  // вещь лежит в мире (маленькая, с бликом)
  function placeItem(scene, id, x, y) {
    const key = "item_pc_" + id; if (!scene.textures.exists(key)) scene.textures.addCanvas(key, EgorArt.item(LIST[id].item));
    const img = scene.add.image(x, y, key).setScale(.6).setOrigin(.5, 1).setDepth(y - 1);
    scene.tweens.add({ targets: img, y: y - 1, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    return img;
  }
  // Егор мелькает вдалеке: появляется, машет и исчезает
  async function cameo(scene, x, y, flip) {
    const spr = scene.add.image(x, y, "eg_wave").setOrigin(.5, 1).setDepth(y).setAlpha(0).setFlipX(!!flip);
    scene.tweens.add({ targets: spr, alpha: 1, duration: 400 });
    await World.wait(scene, 1500);
    spr.setTexture("eg_back_0"); scene.tweens.add({ targets: spr, alpha: 0, x: x + (flip ? -20 : 20), duration: 700 });
    await World.wait(scene, 750); spr.destroy();
  }
  return { find, show, placeItem, cameo, LIST, got, TOTAL };
})();

class MemoryScene extends Phaser.Scene {
  constructor() { super("memory"); }
  init(data) { data = data || {}; this.mid = Postcards.LIST[data.id] ? data.id : "series"; this.from = data.from; this.test = !!data.test || !data.from; }
  create() {
    Sound.play("memory"); Sound.ambient(null);
    this.cameras.main.fadeIn(600, 255, 230, 190);
    this.t0 = this.time.now; this.state = {}; this.chars = [];
    const E = this.textures; this.src = k => E.get(k).getSourceImage();
    World.backdrop(this, "mem_bg", (g, t) => this.draw(g, t), -1000);
    this.time.delayedCall(700, () => this[this.mid]());
  }
  async end() {
    this.cameras.main.fadeOut(600, 255, 230, 190); await World.wait(this, 650);
    if (this.test) { this.scene.start("title"); return; } // запуск из меню разработчика
    this.game.events.emit("memory-done");
    this.scene.stop();
  }
  // ---------- 1. сериалы на диване ----------
  async series() {
    this.state.tv = 0;
    await UI.say([{ who: "", text: "Дом у родителей. Вечер, диван в зале." },
      { who: "zh", text: "Так, что смотрим сегодня? «Гравити Фолз»?" }, { who: "eg", text: "Давай! А потом «Время приключений»." }]);
    this.state.tv = 1; Sound.sfx("blip", .6);
    await UI.say([{ who: "zh", text: "Или «Перевал Дятлова»... Страшно, но интересно." }]);
    this.state.tv = 2; Sound.sfx("blip", .6);
    await UI.say([{ who: "eg", text: "И «Игру в кальмара»! Красный свет, зелёный свет!" }]);
    this.state.tv = 3; Sound.sfx("blip", .6);
    await UI.say([{ who: "zh", text: "Ха! Ещё одну серию — и спать." }, { who: "eg", text: "Ещё одну... и ещё одну." }]);
    await this.end();
  }
  // ---------- 2. кросс по Коврову ----------
  async run() {
    this.state.run = true; this.state.km = 0;
    await UI.say([{ who: "", text: "Ковров, этим летом. Кросс — восемь километров." }, { who: "zh", text: "Держим темп, Егр!" }, { who: "eg", text: "Держу! Ты бежишь как профи, сестрёнка." }]);
    for (let k = 1; k <= 8; k++) { this.state.km = k; Sound.sfx("blip", 1 + k * .05); await World.wait(this, 520); }
    this.state.run = false; this.state.tired = true;
    await UI.say([{ who: "zh", text: "Уф... Восемь километров!" }, { who: "eg", text: "Ты просто машина! Я бы один сдался ещё на третьем." },
      { who: "zh", text: "Вместе бежать легче." }, { who: "eg", text: "С тобой — всё легче. Ты лучшая, Жень." }]);
    await this.end();
  }
  // ---------- 3. «реклама» и смешные видео (Егору 6 лет) ----------
  async video() {
    this.state.rec = true; this.state.kid = "stand";
    await UI.say([{ who: "", text: "Старое видео на телефоне. Женя снимает, Егору шесть лет. Он объявляет, что сейчас будет номер." },
      { who: "egk", text: "Смотри! Сейчас будет брейкданс!" },
      { who: "zh", text: "Так, снимаю! Встречайте: Егор и его коронный танец!" }]);
    this.state.kid = "dance"; Sound.play("studio", true);
    await UI.say([{ who: "", text: "Егор изо всех сил крутит попой под музыку. Женя еле держит телефон от смеха." },
      { who: "zh", text: "Егорка умеет вилять попой! Вот как! Вот как попой повилял!" }]);
    this.state.kid = "spin";
    await UI.say([{ who: "", text: "Финальный трюк: Егор встаёт на голову..." }, { who: "zh", text: "Урааааа! Егор мастер попы!" }]);
    this.state.kid = "stand"; Sound.stopMusic(); Sound.sfx("fart"); this.state.puk = this.time.now; await World.wait(this, 900);
    await UI.say([{ who: "", text: "...и в полной тишине раздаётся «пук». Случайно. Очень громко." }]);
    this.state.laugh = true; Sound.sfx("laugh"); await World.wait(this, 1600);
    await UI.say([{ who: "", text: "Оба падают от смеха. Видео трясётся, слышно только хохот." },
      { who: "zh", text: "Мдааааа... Егор точно мастер попы..." }, { who: "egk", text: "Это был спецэффект!" }]);
    this.state.laugh = false; Sound.play("memory", true);
    await UI.say([{ who: "zh", text: "Это видео я сохраню навсегда." }]);
    await this.end();
  }
  // ---------- 4. глэмпинг: папино горловое пение ----------
  async glamping() {
    this.state.fire = true;
    await UI.say([{ who: "", text: "Папин день рождения. Глэмпинг, вечер, костёр." }, { who: "papa", text: "Тишина! Сейчас будет древний обряд." }]);
    this.state.shaman = this.time.now; Sound.sfx("throat");
    await World.wait(this, 3600);
    await UI.say([{ who: "papa", text: "Ммммм-оооо-ыыыы... (горловое пение под удары палкой по тарелке)" }]);
    this.state.laugh = true; Sound.sfx("laugh");
    await UI.say([{ who: "mama", text: "Лёша, ты шаман или именинник?" }, { who: "zh", text: "Ахаха! Пап, ещё!" }, { who: "eg", text: "Монголы бы гордились!" }]);
    this.state.shaman = this.time.now; Sound.sfx("throat"); await World.wait(this, 2400);
    await UI.say([{ who: "papa", text: "Это чтобы год был удачный! Всем загадывать желания!" }]);
    this.state.laugh = false;
    await this.end();
  }
  // ---------- отрисовка ----------
  draw(g, t) {
    const R = PK.R, s = (t - this.t0) / 1000, st = this.state, src = this.src;
    const fig = (key, x, y, opts = {}) => { const img = src(key); g.save(); g.translate(Math.round(x), Math.round(y)); if (opts.rot) g.rotate(opts.rot); if (opts.flip) g.scale(-1, 1); const sc = opts.sc || 2; g.scale(sc, sc); g.drawImage(img, -img.width / 2, -img.height); g.restore(); };
    const laugh = k => st.laugh ? Math.round(Math.sin(s * 30 + k) * 1.5) : 0;
    if (this.mid === "series" || this.mid === "video") {
      // зал: обои, ковёр на стене, диван
      R(g, 0, 0, 320, 180, "#e8d4b0"); for (let x = 0; x < 320; x += 12) for (let y = 0; y < 106; y += 12) PK.P(g, x + 6, y + 6, "#d4bc94");
      R(g, 40, 12, 110, 62, "#8a2a2a"); RK.box(g, 40, 12, 110, 62, "#5a1a1a");
      for (let y = 16; y < 72; y += 8) for (let x = 44; x < 146; x += 8) { R(g, x + 3, y, 2, 8, "#c8783a"); R(g, x, y + 3, 8, 2, "#c8783a"); PK.P(g, x + 4, y + 4, "#f2c23a"); }
      R(g, 0, 106, 320, 74, "#a87a52"); for (let x = 0; x < 320; x += 16) R(g, x, 106, 1, 74, "#946a44");
      if (this.mid === "series") {
        // телевизор справа
        R(g, 196, 16, 104, 66, "#1e1e24"); RK.box(g, 196, 16, 104, 66, RK.OL); R(g, 238, 82, 20, 8, "#2a2a30"); R(g, 186, 90, 124, 22, "#6a4a32"); RK.box(g, 186, 90, 124, 22, RK.OL);
        this.tvScreen(g, 203, 21, 90, 56, st.tv || 0, s);
        // диван спереди, на нём Женя и Егор (видно по пояс)
        R(g, 30, 74, 130, 14, "#4a6aa0"); RK.box(g, 30, 74, 130, 14, RK.OL);
        fig("zh_home_front_0", 70, 120, { sc: 2 }); fig(Math.floor(s * 3.1) % 7 === 0 ? "eg_blink" : "eg_front_0", 120, 120, { sc: 2 });
        R(g, 30, 102, 130, 26, "#5a7ab0"); R(g, 30, 98, 130, 6, "#6a8ac0"); R(g, 22, 92, 14, 36, "#4a6aa0"); R(g, 154, 92, 14, 36, "#4a6aa0"); RK.box(g, 22, 92, 146, 36, RK.OL);
        g.save(); g.globalAlpha = .12 + Math.sin(s * 9) * .03; R(g, 0, 0, 320, 180, ["#6ac0ff", "#ffb0e0", "#c0e0ff", "#ff6a8a"][st.tv || 0]); g.restore();
      } else {
        // съёмка: Женя-«ведущая» и маленький Егор
        fig("zh_home_front_0", 110, 126 + laugh(1), { sc: 2 });
        { const img = EgorArt.item("phone"); g.drawImage(img, 0, 0, 16, 16, 120, 80, 18, 18); }  // Женя снимает на телефон
        const kx = 200, ky = 126;
        if (st.kid === "dance") fig(Math.floor(s * 6) % 2 ? "egk_L" : "egk_R", kx, ky, { sc: 2.4 });
        else if (st.kid === "spin") fig("egk", kx, ky - 22, { sc: 2.4, rot: Math.PI, flip: Math.floor(s * 10) % 2 });
        else fig(Math.floor(s * 2.7) % 6 === 0 ? "egk_blink" : "egk", kx, ky + laugh(2), { sc: 2.4 });
        if (st.puk && t - st.puk < 1400) { const k = (t - st.puk) / 1400; g.save(); g.globalAlpha = 1 - k; StationArt.text(g, "ПУК!", kx + 12, ky - 30 - k * 20, "#6a8a3a", 2); PK.ell(g, kx - 10 - k * 10, ky - 14, 4 + k * 6, 3 + k * 4, "#b8c890"); g.restore(); }
        // рамка видоискателя
        const c = "#f4f0e8"; [[6, 6, 1, 1], [313, 6, -1, 1], [6, 128, 1, -1], [313, 128, -1, -1]].forEach(([x, y, dx, dy]) => { R(g, dx > 0 ? x : x - 11, y, 12, 1, c); R(g, x, dy > 0 ? y : y - 11, 1, 12, c); });
        if (Math.floor(s * 2) % 2) PK.ell(g, 18, 16, 3, 3, "#e83a3a"); StationArt.text(g, "REC", 24, 13, "#f4f0e8");
        const sec = Math.floor(s); StationArt.text(g, `00:${String(sec % 60).padStart(2, "0")}`, 278, 13, "#f4f0e8");
      }
    } else if (this.mid === "run") {
      // летний Ковров: дорога уходит вдаль, деревья проносятся мимо
      PK.gradV(g, 0, 0, 320, 80, ["#7ac0f0", "#bfe4ff"]); R(g, 0, 70, 320, 110, "#7aa84a");
      PK.poly(g, [[150, 70], [170, 70], [260, 180], [60, 180]], "#8a8a92");
      const sp = st.run ? s * 1.6 : 0;
      for (let k = 0; k < 6; k++) { const d = ((k / 6 + sp) % 1), y = 72 + d * d * 108; R(g, 159, Math.round(y), 2, Math.max(1, Math.round(d * 10)), "#f4f0e8"); }
      for (let k = 0; k < 8; k++) { const d = ((k / 8 + sp * .8) % 1), y = 70 + d * d * 110, side = k % 2 ? 1 : -1, x = 160 + side * (16 + d * d * 170), sz = 2 + d * 14;
        R(g, Math.round(x - 1), Math.round(y - sz), 2, Math.round(sz), "#6a4a32"); PK.ell(g, Math.round(x), Math.round(y - sz * 1.4), Math.round(sz * .7), Math.round(sz * .6), "#4a8a3a"); }
      StationArt.text(g, "КОВРОВ", 8, 8, "#2a4a8a", 2);
      R(g, 196, 8, 60, 18, "#f4f0e8"); RK.box(g, 196, 8, 60, 18, RK.OL); StationArt.text(g, `${st.km || 0} КМ`, 208, 12, "#d8302c", 2);
      const f = st.run ? 1 + Math.floor(s * 7) % 2 : 0, bob = st.run ? Math.abs(Math.sin(s * 14)) * 2 : 0;
      fig(`zh_summer_front_${f}`, 136, 128 - bob, { sc: 2.4 }); fig(`eg_front_${st.run ? 2 - (Math.floor(s * 7) % 2) : 0}`, 186, 128 - (st.run ? Math.abs(Math.cos(s * 14)) * 2 : 0), { sc: 2.4 });
      if (st.tired) { R(g, 128, 70, 3, 3, "#9ad0f0"); R(g, 196, 68, 3, 3, "#9ad0f0"); }
    } else if (this.mid === "glamping") {
      // ночь, звёзды, купола глэмпинга, костёр в металлической тарелке
      PK.gradV(g, 0, 0, 320, 120, ["#0e1030", "#1e2a5a", "#2a3a6a"]);
      for (let k = 0; k < 60; k++) { const x = (k * 53) % 320, y = (k * 29) % 100; if ((k + Math.floor(s * 2)) % 9) PK.P(g, x, y, "#f4f0e8"); }
      R(g, 0, 112, 320, 68, "#1e3a22");
      [[40, 112], [292, 110]].forEach(([x, y]) => { PK.ell(g, x, y, 26, 22, "#d8dce8"); R(g, x - 26, y, 52, 22, "#1e3a22"); for (let k = -20; k <= 20; k += 10) PK.line(g, x + k, y - 20 + Math.abs(k) / 2, x + k * 1.2, y, "#a8acb8"); R(g, x - 4, y - 8, 8, 8, "#ffd870"); });
      const fx = 160, fy = 120, fl = Math.sin(s * 12) * 2;
      g.save(); g.globalAlpha = .18 + Math.sin(s * 8) * .04; PK.ell(g, fx, fy - 8, 56, 30, "#ffb060"); g.restore();
      R(g, fx - 16, fy - 4, 32, 5, "#8a8a94"); R(g, fx - 12, fy + 1, 24, 2, "#6a6a74"); RK.box(g, fx - 16, fy - 4, 32, 5, RK.OL);
      PK.poly(g, [[fx - 12, fy - 4], [fx - 4, fy - 22 - fl], [fx, fy - 12], [fx + 5, fy - 26 + fl], [fx + 12, fy - 4]], "#ff7a2a"); PK.poly(g, [[fx - 7, fy - 4], [fx - 1, fy - 16 + fl], [fx + 6, fy - 4]], "#ffd84a");
      for (let k = 0; k < 6; k++) { const yy = fy - 20 - ((s * 30 + k * 13) % 50); PK.P(g, fx - 8 + (k * 7) % 16 + Math.sin(s * 3 + k) * 3, Math.round(yy), "#ffb040"); }
      // папа с палкой, мама, Женя, Егор
      const hit = st.shaman && t - st.shaman < 3600 ? Math.floor((t - st.shaman) / 220) % 2 : 0;
      fig("pa_home_idle", 120, 126 + laugh(0) + (hit ? 1 : 0), { sc: 2 });
      g.save(); g.strokeStyle = "#8a5a32"; g.lineWidth = 3; g.beginPath(); g.moveTo(134, 94); g.lineTo(hit ? 148 : 150, hit ? 112 : 102); g.stroke(); g.restore();
      if (hit && Math.floor((t - st.shaman) / 110) % 2) { R(g, 146, 110, 3, 1, "#fff4a0"); R(g, 150, 108, 1, 3, "#fff4a0"); }
      fig("ma_home_idle", 200, 128 + laugh(1), { sc: 2 }); fig("zh_home_front_0", 228, 130 + laugh(2), { sc: 2 }); fig("eg_front_0", 256, 130 + laugh(3), { sc: 2 });
      if (st.shaman && t - st.shaman < 3600) for (let k = 0; k < 3; k++) { const yy = 62 - ((t - st.shaman) / 30 + k * 12) % 36; StationArt.text(g, ["М", "О", "Ы"][k], 100 + k * 8 + Math.sin(s * 5 + k) * 3, Math.round(yy), "#ffd870"); }
    }
    // плёнка: тёплый тон, виньетка, царапины
    g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha = .35; R(g, 0, 0, 320, 180, "#f0c890"); g.restore();
    g.save(); g.globalAlpha = .5; g.fillStyle = "#2a1a10"; [[0, 0, 320, 4], [0, 176, 320, 4], [0, 0, 4, 180], [316, 0, 4, 180]].forEach(r => g.fillRect(...r)); g.restore();
    if (Math.floor(s * 7) % 5 === 0) R(g, (Math.floor(s * 97) * 37) % 320, 0, 1, 180, "rgba(255,240,210,.25)");
  }
  tvScreen(g, x, y, w, h, ch, s) {
    const R = PK.R;
    if (ch === 0) {        // лес, хижина и знак вопроса (отсылка, без персонажей)
      R(g, x, y, w, h, "#2a3a5a"); for (let k = 0; k < 8; k++) PK.poly(g, [[x + k * 12, y + h], [x + 6 + k * 12, y + 14 + (k % 3) * 4], [x + 12 + k * 12, y + h]], "#1e4a2a");
      R(g, x + 30, y + 26, 30, 20, "#6a4a32"); PK.poly(g, [[x + 26, y + 26], [x + 45, y + 14], [x + 64, y + 26]], "#4a3022"); StationArt.text(g, "?", x + 43, y + 30, "#f2c23a");
    } else if (ch === 1) { // заснеженный перевал и палатка
      R(g, x, y, w, h, "#9ab0c8"); PK.poly(g, [[x, y + h], [x + 30, y + 12], [x + 55, y + 30], [x + 75, y + 8], [x + w, y + h]], "#e8eef6");
      PK.poly(g, [[x + 34, y + h - 6], [x + 44, y + h - 20], [x + 54, y + h - 6]], "#c8802a"); for (let k = 0; k < 20; k++) PK.P(g, x + (k * 17 + Math.floor(s * 20)) % w, y + (k * 11 + Math.floor(s * 30)) % h, "#ffffff");
    } else if (ch === 2) { // ○△□ и розовые маски
      R(g, x, y, w, h, "#1e1a2a"); g.save(); g.strokeStyle = "#ff4a8a"; g.lineWidth = 2; g.beginPath(); g.arc(x + 20, y + 28, 9, 0, 6.3); g.stroke();
      g.beginPath(); g.moveTo(x + 36, y + 38); g.lineTo(x + 46, y + 18); g.lineTo(x + 56, y + 38); g.closePath(); g.stroke(); g.strokeRect(x + 62, y + 19, 18, 18); g.restore();
    } else {               // радуга и домик на дереве
      PK.gradV(g, x, y, w, h, ["#8ad8ff", "#c8f0ff"]); ["#ff5a5a", "#ffb03a", "#f2e23a", "#5ad05a", "#5a9aff"].forEach((c, i) => { g.save(); g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.arc(x + w / 2, y + h, 36 - i * 3, Math.PI, 0); g.stroke(); g.restore(); });
      R(g, x + 66, y + 30, 4, 26, "#8a5a32"); PK.ell(g, x + 68, y + 24, 14, 10, "#4aa84a"); R(g, x + 62, y + 22, 12, 8, "#c8803a");
    }
  }
}
