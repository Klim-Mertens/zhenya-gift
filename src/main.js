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
    scene: [BootScene, TitleScene, HomeScene, PackScene, StationScene, RideScene, MilanScene, DuomoScene, KitchenScene, RunScene, MatchScene, DuelScene, StreetScene, StudioScene, DriveScene, SunsetScene, TransitScene, RedLightScene, MemoryScene, PartyScene]
  });
  window.addEventListener("resize", () => { const nz = zoomFor(); if (nz !== z) { z = nz; applyZoom(z); game.scale.setZoom(z); } });
  // Кнопка и клавиша звука
  const mute = document.getElementById("mute");
  const toggle = () => { Sound.unlock(); mute.classList.toggle("off", Sound.toggleMute()); };
  // звук: только клик мышкой по кнопке или клавиша M (она же Ь в русской раскладке); пробел кнопку не нажимает
  mute.tabIndex = -1;
  mute.addEventListener("mousedown", e => e.preventDefault());   // кнопка не забирает фокус
  mute.addEventListener("click", e => { if (e.detail === 0) return; toggle(); mute.blur(); });
  window.addEventListener("keydown", e => { if (e.code === "KeyM" && !e.repeat) toggle(); });
  window.addEventListener("pointerdown", () => Sound.unlock(), { once: true });
  window.addEventListener("keydown", () => Sound.unlock(), { once: true });
  UI.bindClick();
  window.__game = game;
  // фон-звуки окружения для каждой сцены
  const AMB = { home: "home", station: "station", milan: "milan", duomo: "duomo", kitchen: "kitchen", run: "park", match: "stadium", duel: "stadium",
    street: "street", drive: "hills", sunset: "sunset", transit: "milan", redlight: "park", party: "home" };
  const hookAmb = () => game.scene.scenes.forEach(sc => sc.sys.events.on("create", () => Sound.ambient(AMB[sc.scene.key] || null)));
  game.isBooted ? hookAmb() : game.events.once("ready", hookAmb);
  Pause.init(game);
  if (window.Dev) Dev.init(game);   // меню разработчика (временно)
})();
