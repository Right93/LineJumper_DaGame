/* LINE JUMPER - audio
   Synthesised SFX plus the background music track (bgm.mp3 in the project
   root; build.js inlines it as a data URI in dist/index.html).

   Why the old music was silent: it was a scheduled WebAudio pad whose gain sat
   under the master chain and only started if init() had run inside a user
   gesture, so in practice nothing was ever heard. Music is now a real media
   element, and its state is reported by audio.bgmDebug() so the audio check
   mode can prove playback (currentTime advancing) instead of assuming it. */
'use strict';

var BGM_SRC = 'bgm.mp3';
var BGM_FALLBACKS = ['bgm.ogg', 'bgm.wav'];
var BGM_OVERRIDE = (function () {
  try { return new URLSearchParams(location.search).get('bgm'); } catch (e) { return null; }
})();

var audio = (function () {
  var ac = null, master, sfxG, musG, rumbleG, noiseBuf, muted = false, rumbleValue = 0.13;

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

  /* ---- background music (media element) ---- */
  var bgmEl = null, bgmIdx = 0, bgmLastErr = '';

  function bgmList() { return BGM_OVERRIDE ? [BGM_OVERRIDE] : [BGM_SRC].concat(BGM_FALLBACKS); }

  function bgmInit() {
    if (bgmEl || typeof Audio === 'undefined') return;
    var list = bgmList();
    bgmEl = new Audio();
    bgmEl.loop = true;
    bgmEl.preload = 'auto';
    bgmEl.volume = 0.45;
    bgmEl.muted = muted;
    bgmEl.addEventListener('error', function () {
      var l = bgmList();
      bgmLastErr = 'error loading ' + l[Math.min(bgmIdx, l.length - 1)];
      bgmIdx++;
      if (bgmIdx < l.length) {
        bgmEl.src = l[bgmIdx];
        if (bgmWanted) bgmTry();
      }
    });
    bgmEl.src = list[0];
  }

  var bgmWanted = false;
  function bgmTry() {
    if (!bgmEl) return;
    var pr = bgmEl.play();
    if (pr && pr.catch) {
      pr.catch(function (err) { bgmLastErr = 'play blocked: ' + (err && err.message ? err.message : err); });
    }
  }

  return {
    init: init,
    ok: function () { return !!ac; },
    resume: function () { if (ac && ac.state === 'suspended') ac.resume(); },

    musicStart: function () {
      bgmInit();
      bgmWanted = true;
      if (!bgmEl) return;
      if (bgmEl.currentTime > 0.05) bgmEl.currentTime = 0;
      bgmEl.muted = muted;
      bgmTry();
    },
    musicPlay: function () {
      bgmInit();
      bgmWanted = true;
      if (!bgmEl) return;
      bgmEl.muted = muted;
      bgmTry();
    },
    musicPause: function () { if (bgmEl && !bgmEl.paused) bgmEl.pause(); },
    musicStop: function () {
      if (!bgmEl) return;
      bgmWanted = false;
      if (!bgmEl.paused) bgmEl.pause();
      try { bgmEl.currentTime = 0; } catch (e) { }
    },
    bgmDebug: function () {
      if (!bgmEl) return 'no element';
      var src = String(bgmEl.src || '');
      var name = src.slice(0, 5) === 'data:' ? 'embedded(' + Math.round(src.length / 1024) + 'kb)' : src.split('/').pop();
      var dur = isFinite(bgmEl.duration) ? bgmEl.duration.toFixed(1) + 's' : '?';
      return name + ' rdy' + bgmEl.readyState + ' dur' + dur + ' t' + bgmEl.currentTime.toFixed(2) + (bgmEl.paused ? ' PAUSED' : ' PLAYING') + (bgmLastErr ? ' [' + bgmLastErr + ']' : '');
    },

    setRumble: function (v) {
      rumbleValue = v;
      if (!ac) return;
      rumbleG.gain.linearRampToValueAtTime(v, ac.currentTime + 0.6);
    },
    toggleMute: function () {
      muted = !muted;
      if (ac) master.gain.linearRampToValueAtTime(muted ? 0 : 0.5, ac.currentTime + 0.1);
      if (bgmEl) bgmEl.muted = muted;
      return muted;
    },
    isMuted: function () { return muted; },

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
