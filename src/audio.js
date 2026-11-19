/* Звук без файлов: музыка и эффекты синтезируются в браузере через Web Audio.
   Браузер разрешает звук только после первого нажатия, поэтому Audio.unlock() зовём из обработчика клавиши или клика. */
"use strict";
window.Sound = (() => {
  let ctx = null, master = null, musicBus = null, sfxBus = null, ambBus = null, timer = null, track = null, muted = false;
  // громкость музыки и звуков отдельно (0..1), запоминается в браузере
  const VOL_KEY = "zhenya-gift-vol";
  const vol = (() => { try { const v = JSON.parse(localStorage.getItem(VOL_KEY) || "null"); if (v && typeof v.music === "number" && typeof v.sfx === "number") return v; } catch (e) {} return { music: .8, sfx: .8 }; })();
  const applyVol = () => { if (!ctx) return; musicBus.gain.value = .4 * vol.music; sfxBus.gain.value = .68 * vol.sfx; };
  function setVolume(kind, v) { vol[kind] = Math.max(0, Math.min(1, v)); applyVol(); try { localStorage.setItem(VOL_KEY, JSON.stringify(vol)); } catch (e) {} }
  const NOTE = n => { if (!n || n === "-") return 0; const m = /^([A-G])(#?)(\d)$/.exec(n); const idx = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]] + (m[2] ? 1 : 0) + (+m[3] - 4) * 12; return 440 * Math.pow(2, idx / 12); };
  function unlock() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : .7; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = .32; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = .55; sfxBus.connect(master);
    ambBus = ctx.createGain(); ambBus.gain.value = 1; ambBus.connect(sfxBus);
    applyVol();
    if (track) play(track.name, true);
    if (amb.name) { const n = amb.name; amb.name = null; ambient(n); }
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
  const ROOTS = { C: ["C3", "G2"], F: ["F2", "C3"], G: ["G2", "D3"], D: ["D3", "A2"], A: ["A2", "E3"], Am: ["A2", "E3"], Dm: ["D3", "A2"], E: ["E2", "B2"], Em: ["E2", "B2"], Bb: ["A#2", "F2"], B: ["B2", "F#3"] };
  // «пульс»: бас восьмыми, корень-квинта, для быстрых треков
  const pulse = (chords, per = 4) => chords.flatMap(c => Array.from({ length: per * 2 }, (_, i) => [ROOTS[c][i % 2], .5]));
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
      bass: oompa(["C", "F", "G", "C", "Am", "F", "G", "C"], 2) },
    // Бег за Лерой: быстрый драйв (свой мотив)
    sprint: { bpm: 172, lead: "square", fast: true, bell: false,
      mel: [["E5", .5], ["E5", .5], ["G5", .5], ["E5", .5], ["B5", 1], ["A5", .5], ["G5", .5], ["F#5", .5], ["G5", .5], ["A5", .5], ["F#5", .5], ["E5", 2],
            ["D5", .5], ["D5", .5], ["F#5", .5], ["D5", .5], ["A5", 1], ["G5", .5], ["F#5", .5], ["E5", .5], ["F#5", .5], ["G5", .5], ["A5", .5], ["B5", 2],
            ["E5", .5], ["E5", .5], ["G5", .5], ["E5", .5], ["B5", 1], ["A5", .5], ["G5", .5], ["C6", .5], ["B5", .5], ["A5", .5], ["G5", .5], ["A5", 2],
            ["B5", .5], ["A5", .5], ["G5", .5], ["F#5", .5], ["G5", .5], ["F#5", .5], ["E5", .5], ["D#5", .5], ["E5", 2], ["B4", 1], ["E5", 1]],
      bass: pulse(["Em", "Em", "D", "Em", "Em", "Am", "B", "Em"], 4) },
    // Вокзал Милано Централе: неаполитанская серенада на мандолине (свой мотив)
    centrale: { bpm: 100, lead: "triangle", mandolin: true, tamb: true, bell: false,
      mel: [["D5", 1], ["B4", .5], ["C5", .5], ["D5", 1], ["G5", 1], ["F#5", .5], ["E5", .5], ["D5", 1], ["B4", 2],
            ["C5", 1], ["E5", .5], ["D5", .5], ["C5", 1], ["A4", 1], ["B4", .5], ["C5", .5], ["D5", 1], ["G4", 2],
            ["E5", 1], ["E5", .5], ["F#5", .5], ["G5", 1], ["E5", 1], ["D5", .5], ["C5", .5], ["B4", 1], ["D5", 2],
            ["C5", .5], ["B4", .5], ["A4", 1], ["F#5", .5], ["E5", .5], ["D5", 1], ["A4", .5], ["B4", .5], ["F#4", 1], ["G4", 2]],
      bass: oompa(["G", "G", "D", "G", "C", "Am", "D", "G", "C", "C", "G", "G", "Am", "D", "D", "G"], 2) },
    // Площадь Дуомо: быстрая «тарантелла» (свой мотив)
    piazza: { bpm: 168, lead: "square", accordion: true, tamb: true, bell: false, drums: true,
      mel: [["E5", .5], ["A5", .5], ["G5", .5], ["F5", .5], ["E5", .5], ["D5", .5], ["E5", 1], ["C5", .5], ["D5", .5], ["E5", 3],
            ["D5", .5], ["F5", .5], ["E5", .5], ["D5", .5], ["C5", .5], ["B4", .5], ["C5", 1], ["A4", .5], ["B4", .5], ["C5", 3],
            ["E5", .5], ["A5", .5], ["G5", .5], ["F5", .5], ["E5", .5], ["D5", .5], ["E5", 1], ["G5", .5], ["F5", .5], ["E5", 3],
            ["D5", .5], ["C5", .5], ["B4", .5], ["C5", .5], ["D5", .5], ["B4", .5], ["A4", 1], ["E4", .5], ["G#4", .5], ["A4", 3]],
      bass: oompa(["Am", "Am", "G", "C", "Dm", "Am", "E", "Am"], 4) },
    // Студия Даны: house 120 bpm (свой мотив), бочка на каждую долю; после 64-й доли добавляются шестнадцатые хэты
    studio: { bpm: 120, lead: "square", house: true, bell: false,
      mel: [["A4", .5], ["C5", .5], ["E5", .5], ["A5", .5], ["G5", 1], ["E5", 1], ["C5", .5], ["D5", .5], ["E5", 1], ["-", 2],
            ["F5", .5], ["E5", .5], ["C5", .5], ["A4", .5], ["C5", 1], ["F5", 1], ["E5", .5], ["D5", .5], ["C5", 1], ["-", 2],
            ["E5", .5], ["G5", .5], ["C6", .5], ["G5", .5], ["E5", 1], ["G5", 1], ["A5", .5], ["G5", .5], ["E5", 1], ["-", 2],
            ["D5", .5], ["G5", .5], ["B5", .5], ["D6", .5], ["B5", 1], ["A5", 1], ["G5", .5], ["A5", .5], ["B5", 1], ["-", 2]],
      bass: pulse(["Am", "F", "C", "G"], 8) },
    // Титры: «по мотиву» In the End — своя мелодия в том же настроении (минор, ~105 bpm, «фортепианное» арпеджио восьмыми, бит).
    // Ноты оригинала НЕ используются: репозиторий публичный, поэтому только настроение, гармония i–VI–III–VII и темп.
    credits: { bpm: 105, lead: "triangle", bell: true, drums: true,
      mel: [["E5", .5], ["B4", .5], ["G4", .5], ["B4", .5], ["E5", .5], ["B4", .5], ["G5", .5], ["F#5", .5],
            ["E5", .5], ["C5", .5], ["G4", .5], ["C5", .5], ["E5", .5], ["C5", .5], ["D5", .5], ["E5", .5],
            ["D5", .5], ["B4", .5], ["G4", .5], ["B4", .5], ["D5", .5], ["B4", .5], ["G4", .5], ["B4", .5],
            ["F#5", .5], ["D5", .5], ["A4", .5], ["D5", .5], ["F#5", .5], ["E5", .5], ["D5", .5], ["A4", .5],
            ["E5", .5], ["B4", .5], ["G4", .5], ["B4", .5], ["E5", .5], ["B4", .5], ["G5", .5], ["A5", .5],
            ["G5", 1], ["E5", .5], ["C5", .5], ["E5", 1], ["G5", 1],
            ["F#5", 1], ["D5", .5], ["B4", .5], ["D5", 1], ["G5", .5], ["F#5", .5],
            ["E5", 1.5], ["D5", .5], ["F#5", 1], ["-", 1]],
      bass: oompa(["Em", "C", "G", "D", "Em", "C", "G", "D"]) },
    // Воспоминание: тихая «музыкальная шкатулка» (свой мотив)
    memory: { bpm: 84, lead: "sine", bell: true, drums: false,
      mel: [["E5", 1], ["G5", .5], ["A5", .5], ["G5", 1], ["E5", 1], ["D5", 1], ["E5", .5], ["G5", .5], ["C5", 2],
            ["A4", 1], ["C5", .5], ["E5", .5], ["D5", 1], ["C5", 1], ["B4", 1], ["C5", .5], ["D5", .5], ["G4", 2]],
      bass: oompa(["C", "Am", "F", "G"], 4) },
    // Кухня Нарины: тёплый мандолинный вальсок (свой мотив)
    cucina: { bpm: 132, lead: "triangle", mandolin: true, tamb: false, bell: false, drums: false,
      mel: [["C5", 1], ["F5", .5], ["A5", .5], ["G5", 1], ["F5", 1], ["E5", .5], ["F5", .5], ["G5", 1], ["C5", 2],
            ["D5", 1], ["G5", .5], ["A#5", .5], ["A5", 1], ["G5", 1], ["F5", .5], ["E5", .5], ["F5", 1], ["F5", 2]],
      bass: oompa(["F", "C", "C", "F", "Bb", "F", "C", "F"], 2) }
  };
  function play(name, force) {
    if (track && track.name === name && !force) return;
    stopMusic(); track = { name };
    if (!ctx || !TRACKS[name]) return;
    const T = TRACKS[name], beat = 60 / T.bpm;
    const seq = (list) => { const out = []; let t = 0; list.forEach(([n, d]) => { out.push([t, n, d]); t += d; }); return { notes: out, len: t }; };
    const mel = seq(T.mel), bas = seq(T.bass), loop = Math.max(mel.len, bas.len);
    const start = ctx.currentTime + .1; let until = 0; track.start = start; track.beat = beat;   // until — до какой доли уже всё запланировано
    const at = (list, a, b, fn) => { for (let c = Math.floor(a / loop); c <= Math.floor(b / loop); c++) list.notes.forEach(([t, n, d]) => { const abs = c * loop + t; if (abs >= a && abs < b) fn(start + abs * beat, n, d); }); };
    const step = () => {
      const horizon = (ctx.currentTime - start) / beat + 1.5;
      while (until < horizon) {
        const a = until, b = until + 1;
        at(mel, a, b, (tt, n, d) => { const f = NOTE(n), len = d * beat * .9; if (!f) return;
          if (T.mandolin) {                                       // мандолина: быстрое «тремоло» одной нотой
            const n = Math.max(1, Math.floor(len / .075)); for (let k = 0; k < n; k++) tone(f, tt + k * .075, .07, { type: "triangle", vol: k ? .075 : .12, bus: musicBus, release: .04 });
            tone(f * 2, tt, .08, { type: "square", vol: .025, bus: musicBus, release: .05 });
          } else if (T.accordion) {                               // аккордеон: два чуть расстроенных голоса с вибрато
            tone(f, tt, len, { type: "square", vol: .05, bus: musicBus, vib: 3, attack: .02, release: .08 });
            tone(f * 1.006, tt, len, { type: "sawtooth", vol: .035, bus: musicBus, vib: 3, attack: .02, release: .08 });
            tone(f / 2, tt, len, { type: "triangle", vol: .04, bus: musicBus, attack: .02 });
          } else tone(f, tt, len, { type: T.lead, vol: T.lead === "square" ? .08 : .12, bus: musicBus, release: .12 });
          if (T.bell) tone(f * 2, tt, .25, { type: "sine", vol: .05, bus: musicBus, release: .35 }); });
        if (T.tamb) for (let k = 0; k < 2; k++) { const tt = start + (a + k * .5) * beat; noise(tt, .05, { vol: k ? .03 : .06, bus: musicBus, hp: 6500 }); noise(tt + .02, .04, { vol: .02, bus: musicBus, hp: 8000 }); }
        at(bas, a, b, (tt, n, d) => tone(NOTE(n), tt, d * beat * .85, { type: "triangle", vol: .14, bus: musicBus, release: .1 }));
        if (T.drums) {                                            // бочка на сильные доли, хэт на слабые
          const kick = start + a * beat; if (a % 2 === 0) tone(90, kick, .12, { type: "sine", vol: .3, bus: musicBus, slide: .4 }); else noise(kick, .08, { vol: .12, bus: musicBus, hp: 1500 });
          noise(start + (a + .5) * beat, .03, { vol: .05, bus: musicBus, hp: 6000 });
        }
        if (T.fast) {                                             // быстрые барабаны: бочка на каждую долю, малый на 2 и 4, хэт шестнадцатыми
          const tt = start + a * beat; tone(85, tt, .1, { type: "sine", vol: .32, bus: musicBus, slide: .4 });
          if (a % 2 === 1) noise(tt, .1, { vol: .16, bus: musicBus, hp: 1200 });
          for (let k = 0; k < 4; k++) noise(tt + k * beat / 4, .025, { vol: k === 2 ? .06 : .035, bus: musicBus, hp: 7000 });
        }
        if (T.house) {                                            // house: бочка каждую долю, хлопок на 2 и 4, открытый хэт между долями
          const tt = start + a * beat; tone(60, tt, .16, { type: "sine", vol: .36, bus: musicBus, slide: .5 });
          if (a % 2 === 1) { noise(tt, .09, { vol: .13, bus: musicBus, hp: 1500 }); noise(tt + .012, .07, { vol: .09, bus: musicBus, hp: 2500 }); }
          noise(tt + beat / 2, .07, { vol: .06, bus: musicBus, hp: 7500 });
          if (a >= 64) for (let k = 1; k < 4; k += 2) noise(tt + k * beat / 4, .02, { vol: .03, bus: musicBus, hp: 9000 });
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
    // один слог кричалки для «Красный свет, зелёный свет»: барабан + папин голос; на «ТАК» — громче и с толпой
    syl: (i = 0) => { const t = now(), N = [196, 196, 196, 233, 196][i] || 196, last = i === 4;
      tone(70, t, .18, { type: "sine", vol: .5, slide: .5 }); noise(t, .12, { vol: .16, hp: 300 });
      tone(N, t, last ? .5 : .24, { type: "sawtooth", vol: .1, vib: 5, attack: .02, slide: last ? .8 : 1 }); tone(N * 2, t, last ? .5 : .24, { type: "square", vol: .03, vib: 5, attack: .02 });
      if (last) { clap(t + .16, .22); crowd(t, 1.2, .18); } },
    // смешной «пук» для воспоминания про видео
    fart: () => { const t = now(); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(95, t); o.frequency.linearRampToValueAtTime(60, t + .45);
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 28; lg.gain.value = 22; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + .5);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + .03); g.gain.linearRampToValueAtTime(.16, t + .3); g.gain.linearRampToValueAtTime(0, t + .5); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .55);
      noise(t, .4, { vol: .06, hp: 200 }); },
    // смех: короткие «ха-ха» с понижением
    laugh: () => { const t = now(); for (let k = 0; k < 7; k++) { tone(420 - k * 18 + (k % 2) * 60, t + k * .16, .1, { type: "sawtooth", vol: .05, vib: 12, attack: .01 }); tone(620 - k * 20, t + .05 + k * .17, .08, { type: "square", vol: .025 }); } },
    // папино горловое пение: низкий гул с «обертонами» + удары палкой по металлической тарелке
    throat: () => { const t = now(), dur = 3.4;
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = "sawtooth"; o.frequency.value = 98; f.type = "bandpass"; f.Q.value = 9;
      f.frequency.setValueAtTime(700, t); [900, 1300, 800, 1600, 1100, 700].forEach((v, i) => f.frequency.linearRampToValueAtTime(v, t + .5 + i * .5));
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.32, t + .2); g.gain.setValueAtTime(.32, t + dur - .3); g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dur + .05);
      tone(98, t, dur, { type: "triangle", vol: .12, attack: .2, release: .3 });
      for (let k = 0; k < 15; k++) { const tt = t + k * .22; tone(1250, tt, .25, { type: "triangle", vol: .07, slide: .97, release: .3 }); noise(tt, .03, { vol: .08, hp: 2500 }); } },
    shutter: () => { const t = now(); noise(t, .04, { vol: .3, hp: 2500 }); noise(t + .07, .05, { vol: .25, hp: 1800 }); },
    sparkle: () => { const t = now(); [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, t + i * .06, .1, { type: "sine", vol: .08 })); },
    flap: () => { const t = now(); for (let k = 0; k < 6; k++) noise(t + k * .05, .04, { vol: .12, hp: 900 }); },
    pour: () => { const t = now(); for (let k = 0; k < 8; k++) tone(500 + k * 60, t + k * .06, .06, { type: "sine", vol: .06 }); },
    gulp: () => { const t = now(); tone(180, t, .12, { type: "sine", vol: .25, slide: .6 }); tone(160, t + .25, .12, { type: "sine", vol: .25, slide: .6 }); },
    cheers: () => { const t = now(); tone(2637, t, .3, { type: "sine", vol: .1, release: .3 }); tone(3520, t + .02, .3, { type: "sine", vol: .06, release: .3 }); },
    // Папа стучит ложкой по крышке кастрюли — «обряд на удачу»
    bong: () => { const t = now(); tone(880, t, .5, { type: "triangle", vol: .16, slide: .98, release: .4 }); tone(1320, t, .3, { type: "sine", vol: .08, release: .3 }); noise(t, .04, { vol: .12, hp: 2000 }); }
  };

  // ---------- звуки окружения (фон сцены) ----------
  // Каждая сцена включает свой фон: тихий шум-«подложка» и случайные события (голуби, колокол, птицы, сверчки…)
  const amb = { name: null, bed: null, timers: [] };
  function bedNoise(type, freq, v, q = .7) {
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b = 0; for (let i = 0; i < len; i++) { b = b * .97 + (Math.random() * 2 - 1) * .03; d[i] = b * 6 + (Math.random() * 2 - 1) * .15; }
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = buf; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(v, ctx.currentTime + 1.2);
    s.connect(f); f.connect(g); g.connect(ambBus); s.start(); return { s, g };
  }
  const A = {
    coo: () => { const t = now(); [0, .35].forEach((d, i) => tone(i ? 260 : 300, t + d, .28, { type: "sine", vol: .05, bus: ambBus, vib: 18, slide: .85, attack: .05 })); },
    chirp: () => { const t = now(), n = 2 + Math.floor(Math.random() * 4), f = 2800 + Math.random() * 1400; for (let k = 0; k < n; k++) tone(f, t + k * .09, .05, { type: "sine", vol: .03, bus: ambBus, slide: 1.3, release: .03 }); },
    cricket: () => { const t = now(); for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) tone(4400, t + k * .25 + j * .03, .015, { type: "square", vol: .006, bus: ambBus, release: .01 }); },
    bell: () => { const t = now(); [523, 1046, 1568].forEach((f, i) => tone(f, t, 1.6, { type: "sine", vol: [.035, .015, .008][i], bus: ambBus, release: 1.4 })); },
    horn: () => { const t = now(), f = 380 + Math.random() * 120; tone(f, t, .18, { type: "square", vol: .012, bus: ambBus }); if (Math.random() < .5) tone(f, t + .25, .25, { type: "square", vol: .012, bus: ambBus }); },
    vespa: () => { const t = now(); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(110, t); o.frequency.linearRampToValueAtTime(170, t + 1.4); o.frequency.linearRampToValueAtTime(130, t + 2.6);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.018, t + 1.2); g.gain.linearRampToValueAtTime(0, t + 2.6); o.connect(g); g.connect(ambBus); o.start(t); o.stop(t + 2.7); },
    voices: () => { const t = now(); for (let k = 0; k < 3; k++) tone(170 + Math.random() * 160, t + k * .18, .22, { type: "sawtooth", vol: .006, bus: ambBus, vib: 9, attack: .05, slide: .9 + Math.random() * .3 }); },
    clink: () => { const t = now(); tone(2700, t, .12, { type: "sine", vol: .03, bus: ambBus, release: .2 }); tone(3200, t + .06, .1, { type: "sine", vol: .02, bus: ambBus, release: .2 }); },
    sizzle: () => { const t = now(); for (let k = 0; k < 6; k++) noise(t + Math.random() * .5, .02, { vol: .03, bus: ambBus, hp: 4000 }); },
    bubble: () => { const t = now(); for (let k = 0; k < 3; k++) tone(220 + Math.random() * 200, t + k * .12, .05, { type: "sine", vol: .03, bus: ambBus, slide: 2.4, release: .03 }); },
    tick: () => { noise(now(), .015, { vol: .03, bus: ambBus, hp: 3500 }); },
    ding: () => { const t = now(); ["E5", "C5", "G4"].forEach((n, i) => tone(NOTE(n), t + i * .45, .5, { type: "sine", vol: .03, bus: ambBus, release: .5 })); },
    bleat: () => { const t = now(); tone(420, t, .45, { type: "sawtooth", vol: .012, bus: ambBus, vib: 22, slide: .85, attack: .03 }); },
    plop: () => { tone(900, now(), .08, { type: "sine", vol: .025, bus: ambBus, slide: .35, release: .05 }); },
    tram: () => { const t = now(); tone(1046, t, .12, { type: "triangle", vol: .02, bus: ambBus }); tone(1046, t + .2, .12, { type: "triangle", vol: .02, bus: ambBus }); },
    ball: () => { const t = now(); noise(t, .04, { vol: .03, bus: ambBus, hp: 600 }); }
  };
  // name → [подложка [тип фильтра, частота, громкость], события [[звук, раз в мин..макс секунд]]]
  const AMB = {
    home:    [["lowpass", 260, .05], [["tick", 1, 1]]],
    station: [["lowpass", 500, .12], [["ding", 14, 22], ["voices", 2, 5]]],
    milan:   [["lowpass", 420, .1], [["ding", 15, 24], ["voices", 1.5, 4], ["horn", 8, 16]]],
    duomo:   [["lowpass", 520, .08], [["coo", 2, 5], ["voices", 2, 4], ["bell", 18, 30], ["vespa", 12, 22]]],
    kitchen: [["highpass", 3500, .015], [["sizzle", .8, 2], ["bubble", 2, 5], ["clink", 6, 12]]],
    park:    [["lowpass", 350, .05], [["chirp", 1.2, 3.5], ["coo", 8, 16]]],
    stadium: [["bandpass", 700, .06], [["chirp", 3, 7], ["ball", 4, 9], ["voices", 3, 6]]],
    street:  [["lowpass", 450, .08], [["plop", 2, 5], ["voices", 2, 4], ["clink", 3, 7], ["tram", 14, 24]]],
    hills:   [["lowpass", 300, .06], [["chirp", 1.5, 4], ["bleat", 9, 18]]],
    sunset:  [["lowpass", 250, .05], [["cricket", .8, 2], ["bell", 16, 28], ["chirp", 6, 12]]]
  };
  function ambient(name) {
    if (amb.name === name) return;
    // гасим прежний фон
    if (ctx && amb.bed) { const { s, g } = amb.bed; g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(g.gain.value, ctx.currentTime); g.gain.linearRampToValueAtTime(0, ctx.currentTime + .8); s.stop(ctx.currentTime + .9); }
    amb.bed = null; amb.timers.forEach(clearTimeout); amb.timers = []; amb.name = name;
    if (!ctx || !name || !AMB[name]) return;
    const [bed, evs] = AMB[name]; amb.bed = bedNoise(...bed);
    evs.forEach(([ev, a, b]) => { const loop = () => { if (amb.name !== name) return; if (A[ev]) A[ev](); amb.timers.push(setTimeout(loop, (a + Math.random() * (b - a)) * 1000)); };
      amb.timers.push(setTimeout(loop, (a + Math.random() * (b - a)) * 500)); });
  }
  function sfx(name, arg) { if (ctx && SFX[name]) SFX[name](arg); }
  function toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : .7; return muted; }
  // сколько долей прошло с начала текущей музыки (для ритм-игры); null — если звука нет
  const beatNow = () => (ctx && track && track.start != null ? (ctx.currentTime - track.start) / track.beat : null);
  return { beatNow, unlock, play, stopMusic, sfx, toggleMute, ambient, setVolume, get trackName() { return track && track.name; }, get ambName() { return amb.name; }, get volume() { return { ...vol }; }, get muted() { return muted; } };
})();
