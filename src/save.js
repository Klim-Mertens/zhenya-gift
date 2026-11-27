/* Сохранение прогресса в браузере (localStorage). Храним только название главы, пару флагов,
   самую дальнюю открытую главу (для «Выбрать главу») и осмотренные места (чтобы список заданий не сбрасывался). Ничего личного. */
"use strict";
window.Save = (() => {
  const KEY = "zhenya-gift-save-v1", REACH = "zhenya-gift-reached", TASKS = "zhenya-gift-tasks";
  // главы для выбора: [сцена, название]
  const CHAPTERS = [["home", "Пролог: дома у родителей"], ["milan", "Глава 1: Милан, Нарина и Джан"], ["run", "Глава 2: Лера и футбол"],
    ["street", "Глава 3: танцы у Даны"], ["drive", "Глава 4: закат с Лоренцо"], ["party", "Финал: вечеринка у Лоренцо"]];
  const OF = { home: 0, pack: 0, station: 0, ride: 0, milan: 1, duomo: 1, kitchen: 1, run: 2, match: 2, duel: 2, street: 3, studio: 3, drive: 4, sunset: 4, party: 5, redlight: 5, credits: 5 };
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? d; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* приватный режим: просто не сохраняем */ } };
  function load() { const v = get(KEY, null); return v && typeof v.chapter === "string" ? v : null; }
  function store(chapter, extra = {}) {
    put(KEY, Object.assign({ chapter, at: Date.now() }, extra));
    if (chapter in OF && OF[chapter] > reached()) put(REACH, OF[chapter]);
  }
  function reached() { const r = get(REACH, 0); return Number.isInteger(r) ? Math.max(0, Math.min(CHAPTERS.length - 1, r)) : 0; }
  function clear() { try { localStorage.removeItem(KEY); localStorage.removeItem(TASKS); } catch (e) {} }   // открытые главы не стираем
  // осмотренные «интересные места» по сценам
  function tasksDone(scene) { const t = get(TASKS, {}); return Array.isArray(t[scene]) ? t[scene] : []; }
  function taskDone(scene, name) { const t = get(TASKS, {}); if (typeof t !== "object" || !t) return; const a = Array.isArray(t[scene]) ? t[scene] : []; if (!a.includes(name)) a.push(name); t[scene] = a; put(TASKS, t); }
  return { load, store, clear, reached, tasksDone, taskDone, CHAPTERS };
})();
