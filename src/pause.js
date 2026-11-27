/* Пауза (Esc или P): управление в текущей сцене, громкость музыки и звуков, выход в меню.
   Пока пауза открыта, сцена Phaser стоит, а нажатия клавиш не доходят до игры.
   Здесь же — общий выбор «Попробовать ещё / Пропустить» (UI.choice) для мини-игр. */
"use strict";
window.Pause = (() => {
  const COMMON = [["Пробел / Enter", "дальше в диалоге"], ["M", "звук вкл/выкл"], ["Esc", "пауза"]];
  const WALK = [["Стрелки / WASD", "ходить"], ["Пробел / E", "говорить, действовать"]];
  const CONTROLS = {
    home: WALK, station: WALK, milan: WALK, duomo: [["Стрелки / WASD", "ходить"], ["Пробел", "сделать фото"]], street: WALK,
    pack: [["Мышь", "тянуть вещь"], ["Правый клик / R", "повернуть"]],
    ride: [], match: [], sunset: [],
    kitchen: [["Стрелки / WASD", "ходить по кухне"], ["Пробел", "взять продукт / отдать повару"]],
    run: [["A и D по очереди", "бежать быстрее"], ["Пробел", "прыжок"], ["↓", "пригнуться"]],
    duel: [["Стрелки / WASD", "бег"], ["Пробел (держать)", "удар, сила зависит от времени"], ["Shift", "рывок"]],
    studio: [["← ↓ ↑ →", "повторяй стрелки в такт"]],
    drive: [["← →", "руль"], ["↑", "газ"], ["↓", "тормоз"]],
    redlight: [["→ (держать)", "бежать"], ["отпустить", "замереть, когда папа оборачивается"]],
    transit: [["Пробел", "пропустить дорогу"]], memory: [], credits: [["Пробел", "в главное меню (в конце)"]], party: [["Стрелки / WASD", "ходить"], ["Пробел", "поговорить"], ["Tab", "список гостей"]]
  };
  let game = null, el = null, open = false, paused = [];
  const $ = id => document.getElementById(id);
  function build() {
    el = document.createElement("div"); el.id = "pause"; el.hidden = true;
    el.innerHTML = `<div class="pbox">
      <div class="ptitle">Пауза</div>
      <div class="pcols">
        <div class="pctl"><div class="psub">Управление</div><div id="pkeys"></div></div>
        <div class="pset"><div class="psub">Громкость</div>
          <label>Музыка <input id="pvm" type="range" min="0" max="10" step="1"></label>
          <label>Звуки <input id="pvs" type="range" min="0" max="10" step="1"></label>
          <button id="pres" type="button">Продолжить</button>
          <button id="prestart" type="button">Начать эту сцену заново</button>
          <button id="pchapbtn" type="button">Выбрать главу</button>
          <button id="pmenu" type="button">В главное меню</button>
        </div>
      </div>
      <div id="pchap" hidden></div>
      <div class="pfoot">Esc — продолжить · Tab — по кнопкам · ← → — громкость</div>
    </div>`;
    $("ui").appendChild(el);
    const vm = $("pvm"), vs = $("pvs");
    vm.addEventListener("input", () => { Sound.setVolume("music", vm.value / 10); });
    vs.addEventListener("input", () => { Sound.setVolume("sfx", vs.value / 10); Sound.sfx("blip", 1.2); });
    $("pres").addEventListener("click", close);
    $("pmenu").addEventListener("click", toMenu);
    $("prestart").addEventListener("click", restart);
    $("pchapbtn").addEventListener("click", () => { el.querySelector(".pbox").classList.add("chapmode"); chapterList($("pchap"), key => goTo(key), () => { el.querySelector(".pbox").classList.remove("chapmode"); setTimeout(() => $("pchapbtn").focus(), 0); }); });
    // клавиши внутри паузы не уходят в игру
    el.addEventListener("keydown", e => { e.stopPropagation(); if (e.code === "Escape" || e.code === "KeyP") { e.preventDefault(); close(); } });
    el.addEventListener("pointerdown", e => e.stopPropagation());
    const btn = document.createElement("button"); btn.id = "pausebtn"; btn.type = "button"; btn.textContent = "II"; btn.title = "Пауза (Esc)";
    btn.addEventListener("click", e => { e.preventDefault(); btn.blur(); toggle(); }); $("ui").appendChild(btn);
  }
  function current() { return game.scene.getScenes(true)[0]; }
  function fillKeys(key) {
    const rows = (CONTROLS[key] || WALK).concat(COMMON);
    $("pkeys").innerHTML = "";
    rows.forEach(([k, t]) => { const r = document.createElement("div"); r.className = "prow"; const b = document.createElement("b"); b.textContent = k; const s = document.createElement("span"); s.textContent = t; r.appendChild(b); r.appendChild(s); $("pkeys").appendChild(r); });
  }
  function canPause() { const s = current(); return s && !["boot", "title"].includes(s.scene.key) && $("title").hidden && (!$("dev") || $("dev").hidden); }
  function show() {
    if (open || !canPause()) return;
    open = true; Sound.unlock(); Sound.sfx("select");
    const s = current(); fillKeys(s.scene.key);
    paused = game.scene.getScenes(true); paused.forEach(sc => sc.scene.pause());
    const v = Sound.volume; $("pvm").value = Math.round(v.music * 10); $("pvs").value = Math.round(v.sfx * 10);
    $("prestart").hidden = NO_RESTART.includes(s.scene.key); $("pchap").hidden = true; el.querySelector(".pbox").classList.remove("chapmode");
    el.hidden = false; setTimeout(() => $("pres").focus(), 0);
  }
  function close() {
    if (!open) return; open = false; el.hidden = true; Sound.sfx("select");
    paused.forEach(sc => { if (sc.scene.isPaused()) sc.scene.resume(); }); paused = [];
    if (document.activeElement && el.contains(document.activeElement)) document.activeElement.blur();
  }
  function toMenu() {
    const sc = paused[0]; open = false; el.hidden = true; paused = [];
    UI.reset(); if (sc) { sc.scene.resume(); sc.scene.start("title"); }
  }
  // перезапуск текущей сцены с теми же данными (осмотренные места сохраняются)
  const NO_RESTART = ["memory", "transit", "credits", "title", "boot"];
  function restart() {
    const sc = paused.find(x => !NO_RESTART.includes(x.scene.key)) || paused[0]; if (!sc) return;
    const key = sc.scene.key, data = Object.assign({}, sc.sys.settings.data || {});
    open = false; el.hidden = true; paused.forEach(x => { if (x !== sc) x.scene.stop(); }); paused = [];
    UI.reset(); sc.scene.resume(); sc.scene.start(key, data);
  }
  function goTo(key) {
    const sc = paused[0]; open = false; el.hidden = true; paused.forEach(x => { if (x !== sc) x.scene.stop(); }); paused = [];
    UI.reset(); if (sc) { sc.scene.resume(); sc.scene.start(key); }
  }
  // список открытых глав (общий для паузы и титульного экрана)
  function chapterList(box, pick, back) {
    const n = Save.reached(); box.innerHTML = '<div class="psub">Выбери главу (открытые)</div>'; box.hidden = false;
    Save.CHAPTERS.forEach(([key, name], i) => { const b = document.createElement("button"); b.type = "button"; b.className = "pch"; b.textContent = i <= n ? name : "??? (ещё не открыта)"; b.disabled = i > n;
      b.addEventListener("click", () => { Sound.sfx("select"); pick(key); }); box.appendChild(b); });
    const bb = document.createElement("button"); bb.type = "button"; bb.className = "pch pback"; bb.textContent = "← Назад";
    bb.addEventListener("click", () => { Sound.sfx("select"); box.hidden = true; if (back) back(); }); box.appendChild(bb);
    const f = box.querySelector("button:not([disabled])"); if (f) setTimeout(() => f.focus(), 0);
  }
  function toggle() { open ? close() : show(); }
  // Esc / P открывают паузу; пока пауза открыта, клавиши вне меню глушим
  window.addEventListener("keydown", e => {
    if (!el) return;
    if (open) { if (!el.contains(e.target)) { e.stopImmediatePropagation(); e.preventDefault(); if (e.code === "Escape" || e.code === "KeyP") close(); else $("pres").focus(); } return; }
    if ((e.code === "Escape" || e.code === "KeyP") && canPause() && !UI.choosing) { e.preventDefault(); e.stopImmediatePropagation(); show(); }
  }, true);
  // свернули вкладку — ставим на паузу
  document.addEventListener("visibilitychange", () => { if (document.hidden && game && !open) show(); });
  function init(g) { game = g; build(); }
  return { init, chapterList, get open() { return open; } };
})();
