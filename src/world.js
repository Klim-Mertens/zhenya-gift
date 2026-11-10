/* Общее для сцен с ходьбой: подложка-холст, герой с анимацией шагов и столкновениями,
   предметы и люди, с которыми можно поговорить. */
"use strict";
window.World = (() => {
  // Холст 320×180, который перерисовывается каждый кадр функцией draw(ctx, time)
  function backdrop(scene, key, draw, depth = -1000) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const tex = scene.textures.createCanvas(key, 320, 180), ctx = tex.getContext(); ctx.imageSmoothingEnabled = false;
    const img = scene.add.image(0, 0, key).setOrigin(0).setDepth(depth);
    const redraw = () => { ctx.clearRect(0, 0, 320, 180); draw(ctx, scene.time.now); tex.refresh(); };
    redraw(); scene.events.on("update", redraw);
    scene.events.once("shutdown", () => scene.events.off("update", redraw));
    return img;
  }
  const hit = (ax, ay, aw, ah, b) => ax < b[0] + b[2] && ax + aw > b[0] && ay < b[1] + b[3] && ay + ah > b[1];

  // Герой: frames = { front:[3], back:[3], side:[2], blink } — ключи текстур
  function player(scene, frames, x, y) {
    const spr = scene.add.image(x, y, frames.front[0]).setOrigin(.5, 1);
    const keys = scene.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D");
    const p = { spr, frames, dir: "front", t: 0, frozen: false, speed: 62, blockers: [], blinkAt: 2.5, stepT: 0,
      setFrames(f) { this.frames = f; spr.setTexture(f[this.dir === "side" ? "side" : this.dir][0]); },
      face(dir, flip) { this.dir = dir; spr.setFlipX(!!flip); spr.setTexture(this.frames[dir][0]); },
      update(dt) {
        let vx = 0, vy = 0;
        if (!this.frozen && !UI.busy) {
          if (keys.LEFT.isDown || keys.A.isDown) vx -= 1; if (keys.RIGHT.isDown || keys.D.isDown) vx += 1;
          if (keys.UP.isDown || keys.W.isDown) vy -= 1; if (keys.DOWN.isDown || keys.S.isDown) vy += 1;
        }
        const moving = vx || vy;
        if (moving) {
          const len = Math.hypot(vx, vy), sp = this.speed * dt / 1000;
          const nx = spr.x + vx / len * sp, ny = spr.y + vy / len * sp;
          // ноги — прямоугольник 10×4 у основания спрайта; проверяем оси по отдельности, чтобы скользить вдоль стен
          if (!this.blockers.some(b => hit(nx - 5, spr.y - 4, 10, 4, b))) spr.x = nx;
          if (!this.blockers.some(b => hit(spr.x - 5, ny - 4, 10, 4, b))) spr.y = ny;
          if (Math.abs(vx) > Math.abs(vy) * 1.2) { this.dir = "side"; spr.setFlipX(vx < 0); } else { this.dir = vy < 0 ? "back" : "front"; spr.setFlipX(false); }
          this.t += dt;
          const list = this.frames[this.dir], f = Math.floor(this.t / 140) % 4;
          spr.setTexture(this.dir === "side" ? list[f % 2 ? 0 : 1] : list[[1, 0, 2, 0][f]]);
          this.stepT += dt; if (this.stepT > 280) { this.stepT = 0; Sound.sfx("step"); }
        } else {
          this.t = 0; const list = this.frames[this.dir];
          const s = scene.time.now / 1000, blink = this.dir === "front" && (s % 3.2) < .14;
          spr.setTexture(blink ? this.frames.blink : list[0]);
        }
        spr.setDepth(spr.y);
      }
    };
    return p;
  }
  // Неподвижный человек с морганием
  function npc(scene, idleKey, blinkKey, x, y, phase = 0) {
    const spr = scene.add.image(x, y, idleKey).setOrigin(.5, 1).setDepth(y);
    const o = { spr, idle: idleKey, blink: blinkKey, override: null,
      update() { if (this.override) { spr.setTexture(this.override); return; } const s = scene.time.now / 1000 + phase; spr.setTexture((s % 3.7) < .14 ? this.blink : this.idle); } };
    return o;
  }
  // Подсказка «E — …» рядом с тем, к кому подошёл; use() вызывается по пробелу/E
  function interactions(scene, playerObj, list) {
    let current = null;
    const key = e => { if (["Space", "KeyE", "Enter"].includes(e.code) && current && !UI.busy && !playerObj.frozen) { e.preventDefault(); const c = current; current = null; UI.hint(""); c.use(); } };
    window.addEventListener("keydown", key);
    scene.events.once("shutdown", () => { window.removeEventListener("keydown", key); UI.hint(""); });
    return {
      list,
      update() {
        if (UI.busy || playerObj.frozen) { if (current) { current = null; UI.hint(""); } return; }
        const px = playerObj.spr.x, py = playerObj.spr.y;
        let best = null, bd = 1e9;
        list.forEach(it => { if (it.enabled && !it.enabled()) return; const d = Math.hypot(px - it.x, py - it.y); if (d < (it.r || 20) && d < bd) { bd = d; best = it; } });
        if (best !== current) { current = best; UI.hint(best ? "Пробел — " + (typeof best.label === "function" ? best.label() : best.label) : ""); }
      }
    };
  }
  // Подойти куда-то по прямой (для катсцен)
  function walkTo(scene, p, x, y, speed = 50) {
    return new Promise(res => {
      p.frozen = true;
      const ev = (time, dt) => {
        const dx = x - p.spr.x, dy = y - p.spr.y, d = Math.hypot(dx, dy);
        if (d < 1) { scene.events.off("update", ev); p.spr.setPosition(x, y); p.face(p.dir === "side" ? "side" : p.dir, p.spr.flipX); res(); return; }
        const st = Math.min(d, speed * dt / 1000); p.spr.x += dx / d * st; p.spr.y += dy / d * st;
        if (Math.abs(dx) > Math.abs(dy)) { p.dir = "side"; p.spr.setFlipX(dx < 0); } else { p.dir = dy < 0 ? "back" : "front"; p.spr.setFlipX(false); }
        p.t += dt; const list = p.frames[p.dir], f = Math.floor(p.t / 140) % 4;
        p.spr.setTexture(p.dir === "side" ? list[f % 2 ? 0 : 1] : list[[1, 0, 2, 0][f]]); p.spr.setDepth(p.spr.y);
      };
      scene.events.on("update", ev);
    });
  }
  const wait = (scene, ms) => new Promise(r => scene.time.delayedCall(ms, r));
  // Кадры героя → ключи текстур
  function frameKeys(prefix) { return { front: [0, 1, 2].map(i => `${prefix}_front_${i}`), back: [0, 1, 2].map(i => `${prefix}_back_${i}`), side: [0, 1].map(i => `${prefix}_side_${i}`), blink: `${prefix}_blink` }; }
  return { backdrop, player, npc, interactions, walkTo, wait, frameKeys };
})();
