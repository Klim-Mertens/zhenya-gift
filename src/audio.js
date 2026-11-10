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
  // Гул стадиона: шум через полосовой фильтр с плавным нарастанием + «голоса» толпы
  function crowd(t, dur, vol = .3) {
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b = 0; for (let i = 0; i < len; i++) { b = b * .6 + (Math.random() * 2 - 1) * .4; d[i] = b; }
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = buf; f.type = "bandpass"; f.frequency.value = 700; f.Q.value = .6;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * .25); g.gain.setValueAtTime(vol, t + dur * .7); g.gain.linearRampToValueAtTime(0, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t);
    for (let k = 0; k < 14; k++) { const f0 = 220 + Math.random() * 260, st = t + Math.random() * dur * .3; tone(f0, st, dur * .6, { type: "sawtooth", vol: .012, vib: 6 + Math.random() * 10, attack: .4, release: .6 }); }
  }
  // Хлопок
  function clap(t, vol = .25) { for (let k = 0; k < 3; k++) noise(t + k * .012, .05, { vol: vol * (1 - k * .25), hp: 1400 }); }
  // ---------- музыка ----------
  // Мелодии: [нота, длительность в долях]. Свои мотивы, написаны для игры.
  // Бас «умпа»: аккорд на 4 доли → корень, квинта, корень, квинта
  const ROOTS = { C: ["C3", "G2"], F: ["F2", "C3"], G: ["G2", "D3"], D: ["D3", "A2"], A: ["A2", "E3"], Am: ["A2", "E3"], Dm: ["D3", "A2"], E: ["E2", "B2"], Em: ["E2", "B2"] };
  const oompa = (chords, per = 4) => chords.flatMap(c => Array.from({ length: per }, (_, i) => [ROOTS[c][i % 2], 1]));
  // «Jingle Bells» (Джеймс Пьерпонт, 1857, общественное достояние), переложение для чиптюна
  const JB_VERSE = [["G4", 1], ["E5", 1], ["D5", 1], ["C5", 1], ["G4", 3], ["G4", .5], ["G4", .5], ["G4", 1], ["E5", 1], ["D5", 1], ["C5", 1], ["A4", 4],
    ["A4", 1], ["F5", 1], ["E5", 1], ["D5", 1], ["B4", 4], ["G5", 1], ["G5", 1], ["F5", 1], ["D5", 1], ["E5", 4]];
  const JB_CHORUS = [["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["G5", 1], ["C5", 1.5], ["D5", .5], ["E5", 4],
    ["F5", 1], ["F5", 1], ["F5", 1.5], ["F5", .5], ["F5", 1], ["E5", 1], ["E5", 1], ["E5", .5], ["E5", .5], ["E5", 1], ["D5", 1], ["D5", 1], ["E5", 1], ["D5", 2], ["G5", 2],
    ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["G5", 1], ["C5", 1.5], ["D5", .5], ["E5", 4],
    ["F5", 1], ["F5", 1], ["F5", 1.5], ["F5", .5], ["F5", 1], ["E5", 1], ["E5", 1], ["E5", .5], ["E5", .5], ["G5", 1], ["G5", 1], ["F5", 1], ["D5", 1], ["C5", 4]];
  const TRACKS = {
    // титул и квартира: весёлые «Бубенцы» с барабанами и бубенчиками
    winter: { bpm: 138, lead: "square", bell: true, drums: true, sleigh: true,
      mel: JB_VERSE.concat(JB_CHORUS),
      bass: oompa(["C", "C", "F", "G", "G", "G", "C", "C"]).concat(oompa(["C", "C", "C", "C", "F", "C", "D", "G", "C", "C", "C", "C", "F", "C", "G", "C"])) },
    // сборы: бодрая полька (своя мелодия)
    pack: { bpm: 150, lead: "square", bell: false, drums: true,
      mel: [["C5", .5], ["E5", .5], ["G5", .5], ["E5", .5], ["F5", .5], ["A5", .5], ["G5", 1], ["E5", .5], ["C5", .5], ["D5", .5], ["E5", .5], ["C5", 2],
            ["A4", .5], ["C5", .5], ["E5", .5], ["C5", .5], ["D5", .5], ["F5", .5], ["E5", 1], ["D5", .5], ["B4", .5], ["G4", .5], ["B4", .5], ["C5", 2]],
      bass: oompa(["C", "F", "G", "C", "Am", "Dm", "G", "C"], 2) },
    // вокзал: та же новогодняя тема, но с другим тембром, как музыкальная шкатулка с барабаном
    station: { bpm: 126, lead: "triangle", bell: true, drums: true, sleigh: true,
      mel: JB_CHORUS,
      bass: oompa(["C", "C", "C", "C", "F", "C", "D", "G", "C", "C", "C", "C", "F", "C", "G", "C"]) },
    train: { bpm: 108, lead: "triangle", bell: true, clack: true,
      mel: [["C5", 1], ["E5", 1], ["G5", 1], ["E5", 1], ["F5", 2], ["D5", 2], ["E5", 1], ["C5", 1], ["D5", 1], ["B4", 1], ["C5", 4],
            ["A4", 1], ["C5", 1], ["F5", 1], ["E5", 1], ["D5", 2], ["G4", 2], ["C5", 6], ["-", 2]],
      bass: oompa(["C", "F", "C", "G", "F", "G", "C", "C"]) },
    summer: { bpm: 126, lead: "square", bell: true, drums: true,
      mel: [["G4", .5], ["C5", .5], ["E5", 1], ["D5", .5], ["C5", .5], ["A4", 1], ["G4", .5], ["A4", .5], ["C5", 1], ["D5", 2],
            ["E5", .5], ["G5", .5], ["E5", 1], ["D5", .5], ["C5", .5], ["D5", 1], ["E5", .5], ["D5", .5], ["C5", 1], ["C5", 2]],
      bass: oompa(["C", "F", "G", "C", "Am", "F", "G", "C"], 2) }
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
        at(mel, a, b, (tt, n, d) => { const f = NOTE(n); tone(f, tt, d * beat * .9, { type: T.lead, vol: T.lead === "square" ? .08 : .12, bus: musicBus, release: .12 }); if (T.bell && f) tone(f * 2, tt, .25, { type: "sine", vol: .05, bus: musicBus, release: .35 }); });
        at(bas, a, b, (tt, n, d) => tone(NOTE(n), tt, d * beat * .85, { type: "triangle", vol: .14, bus: musicBus, release: .1 }));
        if (T.drums) {                                            // бочка на сильные доли, хэт на слабые
          const kick = start + a * beat; if (a % 2 === 0) tone(90, kick, .12, { type: "sine", vol: .3, bus: musicBus, slide: .4 }); else noise(kick, .08, { vol: .12, bus: musicBus, hp: 1500 });
          noise(start + (a + .5) * beat, .03, { vol: .05, bus: musicBus, hp: 6000 });
        }
        if (T.sleigh) for (let k = 0; k < 4; k++) noise(start + (a + k * .25) * beat, .035, { vol: k % 2 ? .025 : .045, bus: musicBus, hp: 7000 });
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
    chant: () => {
      const t = now(), D = [0, .32, .64, 1.08, 1.4], NOTES = [196, 196, 196, 233, 196];
      crowd(t - .2, 3.6, .28);
      D.forEach((d, i) => {
        tone(70, t + d, .18, { type: "sine", vol: .5, slide: .5 }); noise(t + d, .12, { vol: .16, hp: 300 });   // большой барабан
        // папин голос: низкий «крик» с вибрато, слышен поверх толпы
        tone(NOTES[i], t + d, i === 4 ? .5 : .24, { type: "sawtooth", vol: .1, vib: 5, attack: .02, slide: i === 4 ? .8 : 1 });
        tone(NOTES[i] * 2, t + d, i === 4 ? .5 : .24, { type: "square", vol: .03, vib: 5, attack: .02 });
        clap(t + d + .16, .18);                                                                                    // толпа хлопает в ответ
      });
      [2.0, 2.3, 2.6].forEach(d => clap(t + d, .22));
    },
    // Папа стучит ложкой по крышке кастрюли — «обряд на удачу»
    bong: () => { const t = now(); tone(880, t, .5, { type: "triangle", vol: .16, slide: .98, release: .4 }); tone(1320, t, .3, { type: "sine", vol: .08, release: .3 }); noise(t, .04, { vol: .12, hp: 2000 }); }
  };
  function sfx(name, arg) { if (ctx && SFX[name]) SFX[name](arg); }
  function toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : .7; return muted; }
  return { unlock, play, stopMusic, sfx, toggleMute, get muted() { return muted; } };
})();
