/* Титульный экран: зимний вокзал на фоне, кнопки «Начать» и «Продолжить». */
"use strict";
class TitleScene extends Phaser.Scene {
  constructor() { super("title"); }
  create() {
    const art = StationArt.create();
    World.backdrop(this, "title_bg", (g, t) => { art.back(g, t); g.drawImage(art.train, 20, 20); art.front(g, t); });
    const el = document.getElementById("title"), bs = document.getElementById("bstart"), bc = document.getElementById("bcont"), bch = document.getElementById("bchap"), tch = document.getElementById("tchap");
    const save = Save.load(); bc.hidden = !save || save.chapter === "home"; bch.hidden = Save.reached() < 1; tch.hidden = true;
    el.hidden = false; UI.goal(""); Sound.play((this.sys.settings.data && this.sys.settings.data.music) || "winter"); setTimeout(() => (save && !bc.hidden ? bc : bs).focus(), 50);
    const go = (scene, data) => { Sound.unlock(); Sound.sfx("select"); el.hidden = true; cleanup(); this.cameras.main.fadeOut(500, 0, 0, 0); this.time.delayedCall(520, () => this.scene.start(scene, data || {})); };
    const start = () => { Save.clear(); go("home"); }, cont = () => { const { chapter, at, ...data } = save; go(({ italy: "milan" })[chapter] || (this.scene.get(chapter) ? chapter : "home"), data); };
    const chap = () => { Sound.unlock(); Sound.sfx("select"); el.classList.add("chap"); Pause.chapterList(tch, k => go(k), () => { el.classList.remove("chap"); setTimeout(() => bch.focus(), 0); }); };
    const key = e => { if (e.code === "Enter" || e.code === "Space") { const a = document.activeElement; if (a && a.classList.contains("pch")) return; e.preventDefault(); a === bc ? cont() : a === bch ? chap() : start(); } };
    bs.onclick = start; bc.onclick = cont; bch.onclick = chap; window.addEventListener("keydown", key);
    const cleanup = () => { window.removeEventListener("keydown", key); bs.onclick = bc.onclick = bch.onclick = null; tch.hidden = true; el.classList.remove("chap"); };
    this.events.once("shutdown", cleanup);
  }
}
