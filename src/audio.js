/* Звук без файлов: музыка и эффекты синтезируются в браузере через Web Audio.
   Браузер разрешает звук только после первого нажатия, поэтому Audio.unlock() зовём из обработчика клавиши или клика. */
"use strict";
window.Sound = (() => {
  let ctx = null, master = null, musicBus = null, sfxBus = null, timer = null, track = null, muted = false;
  const NOTE = n => { if (!n || n === "-") return 0; const m = /^([A-G])(#?)(\d)$/.exec(n); const idx = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]] + (m[2] ? 1 : 0) + (+m[3] - 4) * 12; return 440 * Math.pow(2, idx / 12); };
  function unlock() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : .7; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = .32; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = .55; sfxBus.connect(master);
    if (track) play(track.name, true);
  }
  // Один тон с огибающей
  function tone(freq, t, dur, { type = "square", vol = .2, bus = sfxBus, slide = 0, attack = .005, release = .08, vib = 0 } = {}) {
    if (!ctx || !freq) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 6; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + release); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.setValueAtTime(vol, t + Math.max(attack, dur - release)); g.gain.exponentialRampToValueAtTime(.0001, t + dur + release);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + release + .05);
  }
  function noise(t, dur, { vol = .2, bus = sfxBus, hp = 800 } = {}) {
    if (!ctx) return;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur)), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = buf; f.type = "highpass"; f.frequency.value = hp; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(bus); s.start(t);
  }
  // ---------- музыка ----------
  // Мелодии: [нота, длительность в долях]. Свои мотивы, написаны для игры.
  const TRACKS = {
    winter: { bpm: 92, lead: "triangle", bell: true,
      mel: [["E5", 1], ["A4", 1], ["C5", 1], ["E5", 1], ["D5", 2], ["C5", 1], ["B4", 1], ["C5", 1], ["A4", 1], ["E4", 1], ["A4", 1], ["B4", 3], ["-", 1],
            ["E5", 1], ["A4", 1], ["C5", 1], ["E5", 1], ["G5", 2], ["F5", 1], ["E5", 1], ["D5", 1], ["C5", 1], ["B4", 1], ["G4", 1], ["A4", 3], ["-", 1]],
      bass: [["A2", 4], ["F2", 4], ["C3", 4], ["E2", 4], ["A2", 4], ["F2", 4], ["G2", 4], ["E2", 2], ["A2", 2]] },
    pack: { bpm: 120, lead: "square", bell: false,
      mel: [["C5", .5], ["E5", .5], ["G5", .5], ["E5", .5], ["F5", .5], ["A5", .5], ["G5", 1], ["E5", .5], ["C5", .5], ["D5", .5], ["E5", .5], ["C5", 2],
            ["A4", .5], ["C5", .5], ["E5", .5], ["C5", .5], ["D5", .5], ["F5", .5], ["E5", 1], ["D5", .5], ["B4", .5], ["G4", .5], ["B4", .5], ["C5", 2]],
      bass: [["C3", 2], ["F2", 2], ["G2", 2], ["C3", 2], ["A2", 2], ["D3", 2], ["G2", 2], ["C3", 2]] },
    train: { bpm: 100, lead: "triangle", bell: true, clack: true,
      mel: [["A4", 2], ["C5", 1], ["E5", 1], ["D5", 2], ["B4", 2], ["C5", 2], ["A4", 1], ["G4", 1], ["A4", 4],
            ["F4", 2], ["A4", 1], ["C5", 1], ["B4", 2], ["G4", 2], ["A4", 6], ["-", 2]],
      bass: [["A2", 4], ["G2", 4], ["F2", 4], ["E2", 4], ["F2", 4], ["G2", 4], ["A2", 8]] },
    summer: { bpm: 112, lead: "square", bell: true,
      mel: [["G4", .5], ["C5", .5], ["E5", 1], ["D5", .5], ["C5", .5], ["A4", 1], ["G4", .5], ["A4", .5], ["C5", 1], ["D5", 2],
            ["E5", .5], ["G5", .5], ["E5", 1], ["D5", .5], ["C5", .5], ["D5", 1], ["E5", .5], ["D5", .5], ["C5", 1], ["C5", 2]],
      bass: [["C3", 2], ["A2", 2], ["F2", 2], ["G2", 2], ["C3", 2], ["E2", 2], ["F2", 1], ["G2", 1], ["C3", 2]] }
  };
  function play(name, force) {
    if (track && track.name === name && !force) return;
    stopMusic(); track = { name };
    if (!ctx || !TRACKS[name]) return;
    const T = TRACKS[name], beat = 60 / T.bpm;
    const seq = (list) => { const out = []; let t = 0; list.forEach(([n, d]) => { out.push([t, n, d]); t += d; }); return { notes: out, len: t }; };
    const mel = seq(T.mel), bas = seq(T.bass), loop = Math.max(mel.len, bas.len);
    const start = ctx.currentTime + .1; let until = 0;   // until — до какой доли уже всё запланировано
    const at = (list, a, b, fn) => { for (let c = Math.floor(a / loop); c <= Math.floor(b / loop); c++) list.notes.forEach(([t, n, d]) => { const abs = c * loop + t; if (abs >= a && abs < b) fn(start + abs * beat, n, d); }); };
    const step = () => {
      const horizon = (ctx.currentTime - start) / beat + 1.5;
      while (until < horizon) {
        const a = until, b = until + 1;
        at(mel, a, b, (tt, n, d) => { const f = NOTE(n); tone(f, tt, d * beat * .9, { type: T.lead, vol: .11, bus: musicBus, release: .12 }); if (T.bell && f) tone(f * 2, tt, .25, { type: "sine", vol: .05, bus: musicBus, release: .35 }); });
        at(bas, a, b, (tt, n, d) => tone(NOTE(n), tt, d * beat * .85, { type: "triangle", vol: .14, bus: musicBus, release: .1 }));
        if (T.clack) { noise(start + a * beat, .04, { vol: .09, bus: musicBus, hp: 2000 }); noise(start + (a + .5) * beat, .04, { vol: .05, bus: musicBus, hp: 2000 }); }
        until = b;
      }
    };
    step(); timer = setInterval(step, 60);
  }
  function stopMusic() { if (timer) clearInterval(timer); timer = null; track = null; }
  // ---------- эффекты ----------
  const now = () => ctx ? ctx.currentTime : 0;
  const SFX = {
    blip: (p = 1) => tone(520 * p + Math.random() * 40, now(), .03, { type: "square", vol: .06, release: .02 }),
    select: () => { tone(660, now(), .05, { vol: .1 }); tone(990, now() + .05, .06, { vol: .1 }); },
    pick: () => tone(440, now(), .08, { type: "triangle", vol: .2, slide: 1.6 }),
    place: () => { tone(220, now(), .06, { type: "square", vol: .18, slide: .6 }); noise(now(), .05, { vol: .1, hp: 400 }); },
    wrong: () => { tone(180, now(), .12, { type: "sawtooth", vol: .12 }); tone(150, now() + .12, .16, { type: "sawtooth", vol: .12 }); },
    door: () => { noise(now(), .2, { vol: .2, hp: 200 }); tone(110, now(), .15, { type: "triangle", vol: .2 }); },
    step: () => noise(now(), .03, { vol: .05, hp: 1200 }),
    done: () => { ["C5", "E5", "G5", "C6"].forEach((n, i) => tone(NOTE(n), now() + i * .1, .14, { type: "square", vol: .12 })); },
    whistle: () => { const t = now(); tone(740, t, .9, { type: "sine", vol: .22, vib: 8, attack: .05 }); tone(587, t, .9, { type: "sine", vol: .14, vib: 8, attack: .05 }); },
    // «МО-СКОВ-СКИЙ СПАР-ТАК»: ритм стадиона, большой барабан на каждый слог
    chant: () => { const t = now(); [0, .32, .64, 1.08, 1.4].forEach((d, i) => { tone(70, t + d, .18, { type: "sine", vol: .5, slide: .5 }); noise(t + d, .12, { vol: .18, hp: 300 }); tone([392, 392, 392, 466, 392][i], t + d, .22, { type: "sawtooth", vol: .05 }); }); }
  };
  function sfx(name, arg) { if (ctx && SFX[name]) SFX[name](arg); }
  function toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : .7; return muted; }
  return { unlock, play, stopMusic, sfx, toggleMute, get muted() { return muted; } };
})();
