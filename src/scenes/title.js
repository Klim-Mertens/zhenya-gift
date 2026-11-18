/* Титульный экран: зимний вокзал на фоне, кнопки «Начать» и «Продолжить». */
"use strict";
class TitleScene extends Phaser.Scene {
  constructor() { super("title"); }
  create() {
    const art = StationArt.create();
    World.backdrop(this, "title_bg", (g, t) => { art.back(g, t); g.drawImage(art.train, 20, 20); art.front(g, t); });
    const el = document.getElementById("title"), bs = document.getElementById("bstart"), bc = document.getElementById("bcont");
    const save = Save.load(); bc.hidden = !save || save.chapter === "home";
    el.hidden = false; UI.goal(""); Sound.play((this.sys.settings.data && this.sys.settings.data.music) || "winter"); setTimeout(() => (save && !bc.hidden ? bc : bs).focus(), 50);
    const go = (scene, data) => { Sound.unlock(); Sound.sfx("select"); el.hidden = true; cleanup(); this.cameras.main.fadeOut(500, 0, 0, 0); this.time.delayedCall(520, () => this.scene.start(scene, data || {})); };
    const start = () => { Save.clear(); go("home"); }, cont = () => { const { chapter, at, ...data } = save; go(({ italy: "milan" })[chapter] || (this.scene.get(chapter) ? chapter : "home"), data); };
    const key = e => { if (e.code === "Enter" || e.code === "Space") { e.preventDefault(); document.activeElement === bc ? cont() : start(); } };
    bs.onclick = start; bc.onclick = cont; window.addEventListener("keydown", key);
    const cleanup = () => { window.removeEventListener("keydown", key); bs.onclick = bc.onclick = null; };
    this.events.once("shutdown", cleanup);
  }
}
