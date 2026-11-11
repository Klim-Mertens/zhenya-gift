/* Пролог, часть 3: поезд. За окном зима сменяется итальянским летом. Конец пролога. */
"use strict";
class RideScene extends Phaser.Scene {
  constructor() { super("ride"); }
  create() {
    Save.store("ride"); Sound.play("train"); UI.goal("");
    this.cameras.main.fadeIn(900, 0, 0, 0);
    const draw = RideArt.create();
    this.k = 0; this.speed = 60;
    World.backdrop(this, "ride_bg", (g, t) => draw(g, t, this.k, this.speed));
    this.run();
  }
  async run() {
    const w = ms => World.wait(this, ms);
    await w(1800);
    await UI.say([
      { who: "zhw", text: "Ну вот, еду! Мама уже наверняка пишет: как ты, покушала?" },
      { who: "zhw", text: "А папа, наверное, уже дома врубил мой любимый трек на всю громкость и кружит маму по кухне." },
      { who: "zhw", text: "Так, включу его плейлист. Трек номер семь... на полную!" }
    ]);
    await w(800);
    await UI.card("Двое суток спустя…", "", 2200);
    // смена сезона за окном: растворение по сетке
    this.tweens.add({ targets: this, k: 1, duration: 4200, ease: "Sine.easeInOut" });
    this.time.delayedCall(1800, () => Sound.play("summer"));
    await w(4600);
    await UI.say([
      { who: "zh", text: "Ого... Снег кончился! Море, кипарисы, виноградники, городок на холме... Тут правда лето!" },
      { who: "zh", text: "Валенки, кажется, пока не понадобятся. Но маме я об этом не скажу." }
    ]);
    this.tweens.add({ targets: this, speed: 14, duration: 2500 });
    await w(1500);
    Save.store("milan");
    await UI.card("Глава 1", "Нарина и Джанлука", 3200);
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.time.delayedCall(950, () => this.scene.start("milan"));
  }
}
