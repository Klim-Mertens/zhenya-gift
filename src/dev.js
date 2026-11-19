/* МЕНЮ РАЗРАБОТЧИКА (временное, для Клима — потом удалить этот файл и строку в index.html).
   Открыть: кнопка DEV справа вверху или клавиша F2 / ` или § (слева от 1). Стрелки ↑↓ + Enter или клик — прыжок в нужный этап. Esc — закрыть.
   Игра на паузе, пока меню открыто. Прыжок сбрасывает диалоги и надписи на экране. */
"use strict";
window.Dev = (() => {
  const STAGES = [
    ["Пролог", [["home", "Квартира родителей"], ["home", "Квартира: чемодан уже собран", { packed: true }], ["pack", "Собери чемодан"], ["station", "Вокзал, кричалка папы"], ["ride", "Поезд: зима → лето"]]],
    ["Глава 1 · Нарина и Джан", [["milan", "Милано Централе"], ["duomo", "Площадь Дуомо"], ["kitchen", "Кухонная война"], ["kitchen", "Застолье (после кухни)", { feast: true }]]],
    ["Глава 2 · Лера", [["run", "Забег в парке"], ["match", "Футбольное поле"], ["duel", "Дуэль с Лерой"]]],
    ["Глава 3 · Дана", [["street", "Набережная Навильи"], ["studio", "Танцы: уровень 1"], ["studio", "Танцы: уровень 3 (проще)", { fails: 2 }], ["studio", "Танцы: уровень 5 (самый лёгкий)", { fails: 4 }]]],
    ["Глава 4 · Лоренцо", [["drive", "Серпантин: уровень 1"], ["drive", "Серпантин: уровень 4 (самый лёгкий)", { fails: 3 }], ["sunset", "Закат на вершине"]]],
    ["Воспоминания", [["memory", "1. Сериалы на диване", { id: "series", test: true }], ["memory", "2. Кросс по Коврову", { id: "run", test: true }], ["memory", "3. «Реклама» и видео", { id: "video", test: true }], ["memory", "4. Глэмпинг", { id: "glamping", test: true }]]],
    ["Финал (черновик)", [["party", "Вечеринка у Лоренцо"], ["redlight", "Красный свет, зелёный свет"], ["transit", "Карта: переход к холмам", { route: "hills", next: "drive" }], ["title", "Музыка титров (In the End-стиль)", { music: "credits" }]]],
    ["Другое", [["title", "Главное меню"]]]
  ];
  let game = null, el = null, items = [], sel = 0, paused = [];
  function build() {
    el = document.createElement("div"); el.id = "dev"; el.hidden = true;
    const box = document.createElement("div"); box.className = "dbox"; el.appendChild(box);
    const h = document.createElement("div"); h.className = "dtitle"; h.textContent = "Тест: выбери этап"; box.appendChild(h);
    const hk = document.createElement("span"); hk.className = "dkeys"; hk.textContent = "↑↓ + Enter или клик · Esc / F2 — закрыть"; h.appendChild(hk);
    const cols = document.createElement("div"); cols.className = "dcols"; box.appendChild(cols);
    STAGES.forEach(([chap, list]) => {
      const grp = document.createElement("div"); grp.className = "dgrp"; cols.appendChild(grp);
      const c = document.createElement("div"); c.className = "dchap"; c.textContent = chap; grp.appendChild(c);
      list.forEach(([key, label, data]) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.className = "ditem";
        const i = items.length; items.push({ key, data, b });
        b.addEventListener("click", e => { e.preventDefault(); jump(i); }); b.addEventListener("mouseenter", () => mark(i));
        grp.appendChild(b);
      });
    });
    document.getElementById("ui").appendChild(el);
    const btn = document.createElement("button"); btn.id = "devbtn"; btn.type = "button"; btn.textContent = "DEV"; btn.title = "Меню разработчика (F2)";
    btn.addEventListener("click", e => { e.preventDefault(); btn.blur(); toggle(); }); document.getElementById("ui").appendChild(btn);
  }
  function mark(i) { sel = (i + items.length) % items.length; items.forEach((it, k) => it.b.classList.toggle("on", k === sel)); items[sel].b.scrollIntoView({ block: "nearest" }); }
  function open() {
    paused = game.scene.getScenes(true); paused.forEach(s => s.scene.pause());
    el.hidden = false; const act = paused[0] && paused[0].scene.key; const k = items.findIndex(it => it.key === act); mark(k < 0 ? 0 : k);
  }
  function close() { el.hidden = true; paused.forEach(s => { if (s.scene.isPaused()) s.scene.resume(); }); paused = []; }
  function toggle() { if (!game) return; el.hidden ? open() : close(); }
  function jump(i) {
    const it = items[i]; el.hidden = true; Sound.unlock();
    const cur = game.scene.getScenes(true).concat(paused)[0] || game.scene.getScenes(false)[0];
    paused = []; UI.reset();
    if (cur) { if (cur.scene.isPaused()) cur.scene.resume(); cur.scene.start(it.key, it.data || {}); }
    else game.scene.start(it.key, it.data || {});
  }
  // перехватываем клавиши раньше игры (фаза capture), чтобы, пока меню открыто, игра их не видела
  window.addEventListener("keydown", e => {
    const isToggle = e.code === "F2" || e.code === "Backquote" || e.code === "IntlBackslash";
    if (!el) return;
    if (isToggle) { e.preventDefault(); e.stopImmediatePropagation(); toggle(); return; }
    if (el.hidden) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.code === "Escape") close();
    else if (e.code === "ArrowDown" || e.code === "KeyS") mark(sel + 1);
    else if (e.code === "ArrowUp" || e.code === "KeyW") mark(sel - 1);
    else if (e.code === "Enter" || e.code === "Space" || e.code === "NumpadEnter") jump(sel);
  }, true);
  function init(g) { game = g; build(); }
  return { init, STAGES };
})();
