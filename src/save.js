/* Сохранение прогресса в браузере (localStorage). Храним только название главы и пару флагов, ничего личного. */
"use strict";
window.Save = (() => {
  const KEY = "zhenya-gift-save-v1";
  function load() { try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return v && typeof v.chapter === "string" ? v : null; } catch (e) { return null; } }
  function store(chapter, extra = {}) { try { localStorage.setItem(KEY, JSON.stringify(Object.assign({ chapter, at: Date.now() }, extra))); } catch (e) { /* приватный режим: просто не сохраняем */ } }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }
  return { load, store, clear };
})();
