/* Загрузка: рисуем всю графику кодом и регистрируем как текстуры Phaser. */
"use strict";
class BootScene extends Phaser.Scene {
  constructor() { super("boot"); }
  create() {
    const add = (key, cv) => { if (!this.textures.exists(key)) this.textures.addCanvas(key, cv); };
    const P = People.build();
    ["zh_home", "zh_winter"].forEach(k => { const f = P[k]; f.front.forEach((c, i) => add(`${k}_front_${i}`, c)); f.back.forEach((c, i) => add(`${k}_back_${i}`, c)); f.side.forEach((c, i) => add(`${k}_side_${i}`, c)); add(`${k}_blink`, f.blink); });
    ["pa_home", "pa_station", "ma_home", "ma_station"].forEach(k => Object.entries(P[k]).forEach(([n, c]) => add(`${k}_${n}`, c)));
    Items.LIST.forEach(it => { add(`item_${it.id}_0`, Items.texture(it, false)); if (it.w !== it.h) add(`item_${it.id}_1`, Items.texture(it, true)); });
    UI.speaker("zh", "Женя", People.portrait(P.zh_home.front[0]), "#f2c46a");
    UI.speaker("mama", "Мама", People.portrait(P.ma_home.idle), "#b79ae8");
    UI.speaker("papa", "Папа", People.portrait(P.pa_home.idle), "#ff7a6a");
    UI.speaker("zhw", "Женя", People.portrait(P.zh_winter.front[0]), "#f2c46a");
    UI.speaker("mamaw", "Мама", People.portrait(P.ma_station.idle), "#b79ae8");
    UI.speaker("papaw", "Папа", People.portrait(P.pa_station.idle), "#ff7a6a");
    // ?scene=home|pack|station|ride — для проверки отдельных сцен
    const q = new URLSearchParams(location.search).get("scene");
    this.scene.start(q && ["home", "pack", "station", "ride"].includes(q) ? q : "title");
  }
}
