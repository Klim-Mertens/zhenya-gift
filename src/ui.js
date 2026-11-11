/* Интерфейс поверх игры (HTML): диалоги с портретом и печатью по буквам, цель, подсказки, крупные надписи.
   Текст в HTML остаётся чётким при любом масштабе, а кириллица в пиксельном шрифте выглядит аккуратно. */
"use strict";
window.UI = (() => {
  const $ = id => document.getElementById(id);
  const speakers = {};
  // В пиксельном шрифте «ёлочки» похожи на <<, поэтому меняем их на обычные кавычки
  const clean = t => String(t || "").replace(/[«»]/g, '"');
  let busy = false, advance = null;
  function speaker(id, name, portraitCanvas, color) { speakers[id] = { name, cv: portraitCanvas, color }; }
  // Нажатие пробела / Enter / E / клика продвигает диалог
  function onAdvance() { if (advance) advance(); }
  window.addEventListener("keydown", e => { if (["Space", "Enter", "KeyE", "NumpadEnter"].includes(e.code) && advance) { e.preventDefault(); onAdvance(); } });
  function bindClick() { $("dialog").addEventListener("pointerdown", e => { e.preventDefault(); onAdvance(); }); }

  // Диалог: список реплик [{who, text}] → Promise, когда всё прочитано
  function say(lines) {
    busy = true;
    const box = $("dialog"), nameEl = $("dname"), textEl = $("dtext"), por = $("dportrait"), more = $("dmore");
    box.hidden = false;
    return new Promise(resolve => {
      let i = 0;
      const show = () => {
        const L = lines[i], sp = speakers[L.who] || { name: L.who || "", cv: null, color: "#f2c46a" };
        nameEl.textContent = sp.name; nameEl.style.background = sp.color || "#f2c46a"; nameEl.hidden = !sp.name;
        const pg = por.getContext("2d"); pg.clearRect(0, 0, 16, 16); if (sp.cv) pg.drawImage(sp.cv, 0, 0); por.hidden = !sp.cv;
        box.classList.toggle("noportrait", !sp.cv);
        textEl.textContent = ""; more.hidden = true;
        const full = clean(L.text); let n = 0, done = false;
        const pitch = { zh: 1.3, mama: 1.15, papa: .7 }[String(L.who).replace(/w$/, "")] || 1;
        const tick = setInterval(() => {
          n++; textEl.textContent = full.slice(0, n);
          if (n % 2 === 0 && full[n - 1] !== " ") Sound.sfx("blip", pitch);
          if (n >= full.length) finish();
        }, 28);
        function finish() { clearInterval(tick); textEl.textContent = full; done = true; more.hidden = false; }
        advance = () => {
          if (!done) { finish(); return; }
          Sound.sfx("select"); i++;
          if (i < lines.length) show();
          else { advance = null; box.hidden = true; busy = false; resolve(); }
        };
      };
      show();
    });
  }
  function goal(text) { const el = $("goal"); el.textContent = clean(text); el.hidden = !text; }
  let toastTimer = null;
  function toast(text, ms = 2600) { const el = $("toast"); el.textContent = clean(text); el.hidden = false; el.classList.remove("show"); void el.offsetWidth; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, ms); }
  // Крупная надпись по центру (например, кричалка папы)
  function banner(html, cls = "", ms = 3000) {
    const el = $("banner"); el.innerHTML = html; el.className = "banner " + cls; el.hidden = false;
    return new Promise(r => setTimeout(() => { el.hidden = true; r(); }, ms));
  }
  function card(title, sub, ms) {
    const el = $("card"); $("ctitle").textContent = clean(title); $("csub").textContent = clean(sub); el.hidden = false; el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
    return new Promise(r => setTimeout(() => { el.hidden = true; r(); }, ms));
  }
  // Правила мини-игры: заголовок, строки «картинки + текст», ждём пробел/Enter/клик
  // rows: [{ icons: [canvas, ...], keys: ["A", "D"], text: "..." }]
  function rules(title, rows, foot = "Пробел — начать") {
    busy = true;
    let el = $("rules"); if (!el) { el = document.createElement("div"); el.id = "rules"; $("ui").appendChild(el); }
    el.innerHTML = ""; el.hidden = false;
    const box = document.createElement("div"); box.className = "rbox"; el.appendChild(box);
    const h = document.createElement("div"); h.className = "rtitle"; h.textContent = clean(title); box.appendChild(h);
    rows.forEach(r => {
      const row = document.createElement("div"); row.className = "rrow";
      const ic = document.createElement("div"); ic.className = "ricons";
      (r.keys || []).forEach(k => { const kb = document.createElement("span"); kb.className = "rkey"; kb.textContent = k; ic.appendChild(kb); });
      (r.icons || []).forEach(cv => { const c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height; c.style.width = `calc(${cv.width}px * var(--z))`; c.style.height = `calc(${cv.height}px * var(--z))`; c.getContext("2d").drawImage(cv, 0, 0); ic.appendChild(c); });
      const tx = document.createElement("div"); tx.className = "rtext"; tx.textContent = clean(r.text);
      row.appendChild(ic); row.appendChild(tx); box.appendChild(row);
    });
    const f = document.createElement("div"); f.className = "rfoot"; f.textContent = clean(foot); box.appendChild(f);
    return new Promise(resolve => {
      const done = e => { if (e.type === "keydown" && !["Space", "Enter", "NumpadEnter"].includes(e.code)) return; e.preventDefault(); window.removeEventListener("keydown", done); el.removeEventListener("pointerdown", done);
        Sound.sfx("select"); el.hidden = true; busy = false; setTimeout(resolve, 50); };
      setTimeout(() => { window.addEventListener("keydown", done); el.addEventListener("pointerdown", done); }, 400);
    });
  }
  function hint(text) { const el = $("hint"); el.textContent = clean(text); el.hidden = !text; }
  return { rules, portrait: id => speakers[id] && speakers[id].cv, speaker, say, goal, toast, banner, card, hint, bindClick, get busy() { return busy; } };
})();
