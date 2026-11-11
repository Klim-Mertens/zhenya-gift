/* Запуск игры: Phaser рисует мир 320×180, масштаб всегда целый, чтобы пиксели не размывались. */
"use strict";
(() => {
  const stage = document.getElementById("stage");
  const zoomFor = () => Math.max(1, Math.floor(Math.min(window.innerWidth / 320, window.innerHeight / 180)));
  const applyZoom = z => stage.style.setProperty("--z", z);
  let z = zoomFor(); applyZoom(z);
  const game = new Phaser.Game({
    type: Phaser.AUTO, parent: "stage", width: 320, height: 180, zoom: z, pixelArt: true, roundPixels: true, backgroundColor: "#0d0b12",
    scale: { mode: Phaser.Scale.NONE },
    audio: { noAudio: true },                       // звук свой, через Sound
    scene: [BootScene, TitleScene, HomeScene, PackScene, StationScene, RideScene, MilanScene, DuomoScene, KitchenScene]
  });
  window.addEventListener("resize", () => { const nz = zoomFor(); if (nz !== z) { z = nz; applyZoom(z); game.scale.setZoom(z); } });
  // Кнопка и клавиша звука
  const mute = document.getElementById("mute");
  const toggle = () => { Sound.unlock(); mute.classList.toggle("off", Sound.toggleMute()); };
  mute.addEventListener("click", toggle);
  window.addEventListener("keydown", e => { if (e.code === "KeyM") toggle(); });
  window.addEventListener("pointerdown", () => Sound.unlock(), { once: true });
  window.addEventListener("keydown", () => Sound.unlock(), { once: true });
  UI.bindClick();
  window.__game = game;
})();
