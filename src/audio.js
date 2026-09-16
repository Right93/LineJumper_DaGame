/* LINE JUMPER - audio
   Synthesised SFX plus the background music track (bgm.mp3 in dev, inlined as
   a data URI in the built dist). */

var audio = (function () {
  var ac = null, master, sfxG, musG, rumbleG, noiseBuf, muted = false;
  var nextNote = 0, stepN = 0, timer = null, musOn = false;

  function makeNoise(sec) {
    var n = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function init() {
    if (ac) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ac = new AC(); } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
    sfxG = ac.createGain(); sfxG.gain.value = 0.6; sfxG.connect(master);
    musG = ac.createGain(); musG.gain.value = 0; musG.connect(master);
    noiseBuf = makeNoise(2);
    var src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 120; lp.Q.value = 0.4;
    rumbleG = ac.createGain(); rumbleG.gain.value = 0;
    src.connect(lp); lp.connect(rumbleG); rumbleG.connect(master); src.start();
    nextNote = ac.currentTime + 0.1;
    timer = setInterval(sched, 60);
  }
  function tone(f0, f1, dur, type, vol, dest, atk) {
    if (!ac) return;
    var t = ac.currentTime, o = ac.createOscillator(), gn = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    var a = atk === undefined ? 0.005 : atk;
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(vol, t + a);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(dest || sfxG);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, f0, f1, q, dest) {
    if (!ac) return;
    var t = ac.currentTime, s = ac.createBufferSource(), gn = ac.createGain(), f = ac.createBiquadFilter();
    s.buffer = noiseBuf; s.loop = true;
    f.type = 'lowpass'; f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    f.Q.value = q || 1;
    gn.gain.setValueAtTime(vol, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(gn); gn.connect(dest || sfxG);
    s.start(t); s.stop(t + dur + 0.05);
  }
  var BASS = [55, 55, 65.41, 55, 49, 49, 58.27, 49, 65.41, 65.41, 82.41, 65.41, 43.65, 43.65, 49, 55];
  var PAD = [[220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66], [164.81, 207.65, 246.94]];
  function sched() {
    if (!ac || !musOn) return;
    while (nextNote < ac.currentTime + 0.2) {
      var t = nextNote, s = stepN % 32;
      var bn = BASS[Math.floor(s / 2) % 16];
      var o = ac.createOscillator(), lg = ac.createGain(), gn = ac.createGain(), f = ac.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = bn;
      f.type = 'lowpass'; f.frequency.value = 420;
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(s % 4 === 0 ? 0.5 : 0.3, t + 0.02);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      o.connect(f); f.connect(gn); gn.connect(musG);
      o.start(t); o.stop(t + 0.4);
      if (s % 4 === 2) {
        var hs = ac.createBufferSource(), hf = ac.createBiquadFilter(), hg = ac.createGain();
        hs.buffer = noiseBuf; hf.type = 'highpass'; hf.frequency.value = 6000;
        hg.gain.setValueAtTime(0.08, t);
        hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        hs.connect(hf); hf.connect(hg); hg.connect(musG);
        hs.start(t); hs.stop(t + 0.08);
      }
      if (s % 16 === 0) {
        var ch = PAD[Math.floor(stepN / 16) % 4];
        for (var i = 0; i < ch.length; i++) {
          var po = ac.createOscillator(), pg = ac.createGain();
          po.type = 'sine'; po.frequency.value = ch[i];
          pg.gain.setValueAtTime(0.0001, t);
          pg.gain.linearRampToValueAtTime(0.05, t + 0.9);
          pg.gain.linearRampToValueAtTime(0.0001, t + 3.4);
          po.connect(pg); pg.connect(musG);
          po.start(t); po.stop(t + 3.5);
        }
      }
      nextNote += 0.357;
      stepN++;
    }
  }
  return {
    init: init,
    ok: function () { return !!ac; },
    resume: function () { if (ac && ac.state === 'suspended') ac.resume(); },
    setMusic: function (on) {
      musOn = on;
      if (!ac) return;
      musG.gain.cancelScheduledValues(ac.currentTime);
      musG.gain.linearRampToValueAtTime(on ? 0.55 : 0, ac.currentTime + 0.8);
    },
    setRumble: function (v) {
      if (!ac) return;
      rumbleG.gain.linearRampToValueAtTime(v, ac.currentTime + 0.6);
    },
    toggleMute: function () {
      muted = !muted;
      if (ac) master.gain.linearRampToValueAtTime(muted ? 0 : 0.5, ac.currentTime + 0.1);
      return muted;
    },
    jump: function () { tone(320, 620, 0.16, 'triangle', 0.28); noise(0.18, 0.12, 1800, 300, 1); },
    land: function () { noise(0.12, 0.22, 900, 120, 1); tone(120, 70, 0.12, 'sine', 0.22); },
    drop: function () { tone(420, 140, 0.28, 'sawtooth', 0.16); },
    pickup: function (n) { tone(700 * Math.pow(1.06, Math.min(18, n)), 0, 0.09, 'sine', 0.22); tone(1400, 0, 0.06, 'sine', 0.08); },
    stunt: function () { tone(500, 900, 0.18, 'square', 0.12); tone(750, 1350, 0.2, 'sine', 0.1); },
    hit: function () { noise(0.3, 0.4, 1200, 90, 1); tone(180, 60, 0.3, 'square', 0.2); },
    crash: function () { noise(0.9, 0.5, 2400, 60, 1); tone(220, 40, 0.7, 'sawtooth', 0.22); },
    tick: function () { noise(0.04, 0.1, 2600, 800, 1); },
    ui: function () { tone(880, 1320, 0.07, 'square', 0.14); },
    thunder: function () { noise(1.6, 0.35, 200, 40, 0.8); }
  };
})();

