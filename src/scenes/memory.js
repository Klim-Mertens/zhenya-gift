/* Открытки «Помнишь, как мы…?» и сценки-воспоминания.
   В каждой главе Женя находит вещь, связанную с братом, к ней приколота открытка от Егора.
   Postcards.find(scene, id) ставит текущую сцену на паузу, показывает открытку, потом запускает MemoryScene поверх
   (в тёплых, «плёночных» тонах), а после — возвращает игру ровно туда, где она была. */
"use strict";
window.Postcards = (() => {
  const LIST = {
    series: { n: 1, item: "remote", name: "пульт от телевизора", text: "Помнишь, как мы смотрели сериалы дома, на диване в зале? «Гравити Фолз», «Время приключений», «Перевал Дятлова», «Игра в кальмара»... Нашёл пульт — и сразу вспомнил наши вечера." },
    run: { n: 2, item: "bib", name: "наклейка бегуна, номер 300", text: "Помнишь кросс по Коврову этим летом? Восемь километров плечом к плечу. Ты держала темп как настоящая спортсменка, а я еле поспевал. Ты у меня сильная, упорная и самая классная сестра. Горжусь тобой!" },
    video: { n: 3, item: "phone", name: "старый телефон с видео", text: "Помнишь, как ты снимала меня на телефон? Мне шесть, я танцую «брейкданс», а ты кричишь: «Егорка умеет вилять попой! Егор мастер попы!» И тут что-то произошло... Мы смеялись до слёз. Мастер попы помнит всё!" },
    dessert: { n: 5, item: "ladle", name: "огромный половник", text: "Помнишь яблочный десерт? Ты попросила чайную ложечку, а я положил тебе огромный половник. Это была забота: десерта должно быть много! С днём рождения, сестрёнка." },
    traffic: { n: 4, item: "flash", name: "папина флешка с музыкой", text: "Помнишь пробку во Владимире? Все стоят и скучают, а папа врубает музыку на полную, и наша машина качается в такт. Самая весёлая пробка в жизни!" },
  };
  const TOTAL = 5;
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
    if (id === "run") { Sound.play("phonk"); trackTag(true); }   // к открытке про кросс — фонк-трек и подпись
    return new Promise(res => {
      const done = e => { if (e.type === "keydown" && !["Space", "Enter", "NumpadEnter"].includes(e.code)) return; e.preventDefault(); e.stopImmediatePropagation();
        window.removeEventListener("keydown", done, true); el.removeEventListener("pointerdown", done); el.hidden = true; Sound.sfx("select"); setTimeout(res, 80); };
      setTimeout(() => { window.addEventListener("keydown", done, true); el.addEventListener("pointerdown", done); }, 500);
    });
  }
  // подпись с названием трека (только когда есть настоящее переложение по нотам — в личной версии)
  const TAGS = { phonk: ["Murder In My Mind", "Kordhell · 8-бит версия"], credits: ["In the End", "Linkin Park · 8-бит версия"] };
  function trackTag(on, track = "phonk") {
    let el = document.getElementById("tracktag");
    if (!on || !(window.ZG_TRACKS && window.ZG_TRACKS[track])) { if (el) el.hidden = true; return; }
    if (!el) { el = document.createElement("div"); el.id = "tracktag"; document.getElementById("ui").appendChild(el); }
    el.innerHTML = `<span class="tt-ico"></span><span><b>${TAGS[track][0]}</b><br>${TAGS[track][1]}</span>`; el.hidden = false;
  }
  // воспоминание поверх текущей сцены: сцена на паузе, цель/список спрятаны, музыка потом возвращается
  async function recall(scene, id) {
    const game = scene.game, track = Sound.trackName, amb = Sound.ambName;
    scene.scene.pause();
    const hide = ["goal", "tasks", "hint"].map(k => document.getElementById(k)).filter(Boolean), was = hide.map(e => e.hidden);
    hide.forEach(e => { e.hidden = true; });
    await new Promise(res => { game.events.once("memory-done", res); scene.scene.launch("memory", { id, from: scene.scene.key }); scene.scene.bringToTop("memory"); });
    hide.forEach((e, i) => { if (e.id !== "hint") e.hidden = was[i]; });
    scene.scene.resume(); Sound.play(track); Sound.ambient(amb);
  }
  // открытка от Егора + воспоминание
  async function find(scene, id) {
    await show(id); mark(id);
    await recall(scene, id);
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
  // Женя на кроссе: кепка и спортивная футболка (кадры zh_sport_front_0..2)
  function sport(scene) {
    if (scene.textures.exists("zh_sport_front_0")) return;
    const T = People.templates(), pal = Object.assign({}, T.ZH_PAL, { W: "#f05a7a", w: "#c83a5a", G: "#ffffff", J: "#2a2a34", j: "#1a1a24", C: "#2a3a6a", V: "#1a2448", B: "#f4f4f0" });
    const CAP = ["......oooo......", "....ooCCCCoo....", "...oCCCCCCCCo...", "..oCCCCGCCCCCo..", ".oVVVVVVVVVVVVo."];
    const top = T.ZH_FRONT.map((r, i) => i < 5 ? CAP[i] : r);
    ["stand", "a", "b"].forEach((v, i) => { const legs = T.LEGS[v].map((r, y) => y >= 2 && y <= 3 ? r.replace(/J/g, "S") : r);
      scene.textures.addCanvas(`zh_sport_front_${i}`, PK.sprite(top.concat(legs), pal)); });
  }
  return { find, recall, show, placeItem, cameo, sport, trackTag, LIST, got, TOTAL };
})();

class MemoryScene extends Phaser.Scene {
  constructor() { super("memory"); }
  init(data) { data = data || {}; this.mid = typeof MemoryScene.prototype[data.id] === "function" && !["create", "init", "end", "draw", "update"].includes(data.id) ? data.id : "series"; this.from = data.from; this.test = !!data.test || !data.from; }
  create() {
    Sound.play(this.mid === "run" ? "phonk" : "memory"); Sound.ambient(null); Postcards.trackTag(this.mid === "run");
    this.events.once("shutdown", () => { Postcards.trackTag(false); const ph = document.getElementById("memphoto"); if (ph) ph.remove(); });
    Postcards.sport(this);
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
  // ---------- 4. пробка во Владимире: папа врубает музыку ----------
  async traffic() {
    this.state.loud = 0;
    await UI.say([{ who: "", text: "Владимир, пробка. Машины стоят, все скучают." }, { who: "papa", text: "Так, что-то мы приуныли. Сейчас исправим!" }]);
    this.state.loud = this.time.now; Sound.play("sprint", true);
    await UI.say([{ who: "", text: "Папа выкручивает громкость на максимум. Машина качается в такт!" },
      { who: "zh", text: "Па-а-ап! Нас слышно на всю улицу!" }, { who: "eg", text: "Смотри, в соседней машине тоже танцуют!" },
      { who: "papa", text: "Пробка — не повод скучать! Громче!" }]);
    this.state.laugh = true; Sound.sfx("laugh"); await World.wait(this, 1500);
    await UI.say([{ who: "zh", text: "Ахаха! Лучшая пробка в моей жизни." }]);
    this.state.laugh = false; this.state.loud = 0; Sound.play("memory", true);
    await this.end();
  }
  // ---------- 5. яблочный десерт и половник ----------
  async dessert() {
    this.state.ladle = 0;
    await UI.say([{ who: "", text: "Кухня у родителей. На столе — горячий яблочный десерт." },
      { who: "zh", text: "Егор, положи мне десерт, пожалуйста. И дай чайную ложечку!" }, { who: "eg", text: "Сейчас всё будет!" }]);
    this.state.ladle = 1; Sound.sfx("place"); await World.wait(this, 900);
    await UI.say([{ who: "zh", text: "Егор... Это что?!" }, { who: "eg", text: "Ложечка! Ну... большая ложечка." },
      { who: "zh", text: "Я просила ЧАЙНУЮ!" }, { who: "eg", text: "Так десерт же вкусный. Чего мелочиться?" }]);
    this.state.laugh = true; Sound.sfx("laugh"); await World.wait(this, 1600);
    await UI.say([{ who: "zh", text: "Ахаха! Ладно, половником даже удобнее..." }]);
    this.state.laugh = false;
    await this.photo("dessert", "Тот самый половник. Это было на самом деле!");
    await this.end();
  }
  // настоящее фото от Клима (только в личной версии): несколько секунд, пробел — дальше
  async photo(id, caption) {
    const src = window.ZG_PHOTOS && window.ZG_PHOTOS[id]; if (!src) return;
    const el = document.createElement("div"); el.id = "memphoto";
    el.innerHTML = `<div class="mp"><img alt=""><div class="mpc"></div></div>`;
    el.querySelector("img").src = src; el.querySelector(".mpc").textContent = caption;
    document.getElementById("ui").appendChild(el); Sound.sfx("sparkle");
    requestAnimationFrame(() => el.classList.add("show"));
    await new Promise(res => {
      let ok = false; const fin = () => { window.removeEventListener("keydown", key, true); clearTimeout(tm); res(); };
      const key = e => { if (ok && ["Space", "Enter"].includes(e.code)) { e.preventDefault(); e.stopImmediatePropagation(); fin(); } };
      setTimeout(() => { ok = true; }, 1500); window.addEventListener("keydown", key, true);
      const tm = setTimeout(fin, 5000);
    });
    el.classList.remove("show"); await World.wait(this, 400); el.remove();
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
        else if (st.kid === "spin") fig("egk", kx, ky - 44, { sc: 2.4, rot: Math.PI, flip: Math.floor(s * 10) % 2 });   // стойка на голове: голова у пола, всё в кадре
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
      fig(`zh_sport_front_${f}`, 136, 128 - bob, { sc: 2.4 }); fig(`eg_front_${st.run ? 2 - (Math.floor(s * 7) % 2) : 0}`, 186, 128 - (st.run ? Math.abs(Math.cos(s * 14)) * 2 : 0), { sc: 2.4 });
      if (st.tired) { R(g, 128, 70, 3, 3, "#9ad0f0"); R(g, 196, 68, 3, 3, "#9ad0f0"); }
    } else if (this.mid === "traffic") {
      // вечерний город, пробка; наша машина крупно, в окнах — папа, Женя и Егор
      PK.gradV(g, 0, 0, 320, 70, ["#f2a46a", "#f8d0a0"]); for (let k = 0; k < 9; k++) R(g, k * 38, 30 + (k * 13) % 24, 30, 70, ["#8a7a8a", "#9a8aa0", "#7a6a7a"][k % 3]);
      for (let k = 0; k < 30; k++) R(g, 4 + (k * 41) % 310, 36 + (k * 17) % 34, 3, 3, "#ffe0a0");
      R(g, 0, 96, 320, 84, "#5a5a64"); for (let x = 0; x < 320; x += 30) R(g, x, 112, 16, 2, "#e8e0c8");
      [[-10, "#c8402a"], [250, "#3a7ac8"]].forEach(([x, c]) => { R(g, x, 74, 70, 22, c); R(g, x + 10, 64, 46, 12, c); R(g, x + 14, 66, 38, 9, "#a8c8e0"); PK.ell(g, x + 14, 98, 6, 6, "#1a1a1e"); PK.ell(g, x + 56, 98, 6, 6, "#1a1a1e"); R(g, x + 66, 80, 4, 4, "#ff4a3a"); });
      const loud = this.state.loud, bounce = loud ? Math.round(Math.abs(Math.sin(s * 9)) * 3) : 0, cx = 90, cy = 104 - bounce;
      R(g, cx, cy - 26, 150, 28, "#e8e0d0"); R(g, cx + 22, cy - 50, 100, 26, "#e8e0d0"); RK.box(g, cx, cy - 26, 150, 28, RK.OL);
      R(g, cx + 28, cy - 46, 40, 20, "#a8c8e0"); R(g, cx + 74, cy - 46, 42, 20, "#a8c8e0");
      const head = (key, x, y) => { const img = src(key); g.drawImage(img, 0, 0, 16, 13, x, y + laugh(x), 16, 13); };
      head("pa_home_idle", cx + 34, cy - 42); head("zh_home_front_0", cx + 78, cy - 42); head("eg_front_0", cx + 96, cy - 42);
      R(g, cx + 28, cy - 30, 88, 4, "#e8e0d0"); RK.box(g, cx + 22, cy - 50, 100, 26, RK.OL);
      PK.ell(g, cx + 30, cy + 2, 10, 10, "#1a1a1e"); PK.ell(g, cx + 30, cy + 2, 4, 4, "#8a8a92"); PK.ell(g, cx + 120, cy + 2, 10, 10, "#1a1a1e"); PK.ell(g, cx + 120, cy + 2, 4, 4, "#8a8a92");
      R(g, cx + 146, cy - 20, 4, 6, "#ffe070");
      if (loud) for (let k = 0; k < 6; k++) { const ph = ((t - loud) / 900 + k / 6) % 1; const nx = Math.round(cx + 40 + k * 18 + Math.sin(ph * 6) * 6), ny = Math.round(cy - 56 - ph * 40), c = ["#ff5a7a", "#ffd84a", "#5ad0ff"][k % 3];
        PK.ell(g, nx, ny + 6, 2, 2, c); R(g, nx + 1, ny, 1, 6, c); R(g, nx + 1, ny, 3, 1, c); }   // нотки
    } else if (this.mid === "dessert") {
      // кухня: плитка, окно со снегом, стол с десертом
      R(g, 0, 0, 320, 106, "#f2e8d4"); for (let x = 0; x < 320; x += 10) for (let y = 0; y < 106; y += 10) { R(g, x, y, 10, 1, "#ddd0b8"); R(g, x, y, 1, 10, "#ddd0b8"); }
      R(g, 220, 14, 70, 50, "#bfe0f4"); RK.box(g, 220, 14, 70, 50, RK.OL); R(g, 254, 14, 2, 50, "#f4f0e8"); for (let k = 0; k < 12; k++) PK.P(g, 224 + (k * 23 + Math.floor(s * 12)) % 62, 18 + (k * 17 + Math.floor(s * 20)) % 44, "#ffffff");
      R(g, 20, 30, 70, 30, "#c8d0d8"); RK.box(g, 20, 30, 70, 30, RK.OL); PK.ell(g, 40, 40, 8, 4, "#3a3a44"); PK.ell(g, 66, 40, 8, 4, "#3a3a44");   // плита
      R(g, 0, 106, 320, 74, "#a87a52"); for (let x = 0; x < 320; x += 16) R(g, x, 106, 1, 74, "#946a44");
      fig("zh_home_front_0", 110, 124 + laugh(1), { sc: 2 });
      fig(Math.floor(s * 3) % 7 === 0 ? "eg_blink" : "eg_front_0", 210, 124 + laugh(2), { sc: 2 });
      R(g, 70, 100, 180, 12, "#f4f0e8"); R(g, 70, 112, 180, 20, "#e8dcc8"); RK.box(g, 70, 100, 180, 32, RK.OL);   // стол
      PK.ell(g, 160, 100, 22, 6, "#f4f0e8"); PK.ell(g, 160, 98, 18, 4, "#c87a3a"); PK.ell(g, 156, 96, 5, 3, "#e8a050"); PK.ell(g, 166, 97, 5, 3, "#d8903a");   // десерт
      for (let k = 0; k < 3; k++) { const yy = 90 - ((s * 12 + k * 6) % 16); PK.P(g, 152 + k * 7, Math.round(yy), "#ffffff"); }   // пар
      if (this.state.ladle) { const img = EgorArt.item("ladle"); g.save(); g.translate(196, 70); g.rotate(-.5 + Math.sin(s * 3) * .05); g.drawImage(img, 0, 0, 16, 16, -20, -20, 40, 40); g.restore(); }
      else R(g, 128, 102, 1, 6, "#c8ccd8");
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
