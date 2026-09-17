/* LINE JUMPER - character preview harness (dev only, not part of the build)

   Opens as preview.html. Renders the character with the exact same code paths
   the game uses (drawTail + drawPlayer) so anything approved here is what
   ships. Cycle states, step frame by frame, toggle the tail debug view.

   Controls
     1-7 / Up,Down   pick state (idle, run, jump, drop, fall, land, death)
     Left,Right      step one frame
     Space           play / pause
     [ ]             animation speed down / up
     T               toggle tail physics debug points
     O               cycle outfit palette
*/
'use strict';

var RUNTIME_ERRORS = [];
window.onerror = function (msg, src, line, col) {
  RUNTIME_ERRORS.push(String(msg) + ' @' + line + ':' + col);
  return false;
};

var cv = document.getElementById('c');
cv.width = W; cv.height = H;
var g = ctxOf(cv);
var cam = { x: 0, sway: 0, sy: 0 };
var T = 0;
var art = buildArt();

var player = {
  x: 120, y: 150, vy: 0, lvl: 1, onMain: true, state: 'run', animT: 0,
  flipT: 0, jumpBuf: 0, coyote: 0, minY: 0, landT: LAND_T, deadT: 0,
  speed: 100, inv: 0, startLvl: 1, apexY: 0, holdT: 0, highJump: false,
  stats: { jumps: 0, lands: 0, gapFalls: 0, drops: 0, stunts: 0, ups: 0, picks: 0, maxLvl: 1 }
};

var P = {
  states: [
    { id: 'idle', label: 'IDLE', frames: 1 },
    { id: 'run', label: 'RUN', frames: 8 },
    { id: 'jump', label: 'JUMP / FLIP', frames: 16 },
    { id: 'drop', label: 'DROP', frames: 2 },
    { id: 'fall', label: 'FALL', frames: 2 },
    { id: 'land', label: 'LAND / RECOVER', frames: 3 },
    { id: 'death', label: 'DEATH', frames: 12 }
  ],
  si: 1, frame: 0, playing: true, speed: 1, acc: 0, showTail: false, outfit: 0
};

function applyFrame() {
  var p = player;
  var st = P.states[P.si].id;
  p.inv = 0;
  p.vy = 0;
  if (st === 'run') {
    var fps = clamp(p.speed / 6.6, 11, 17);
    p.animT = P.frame / fps;
    p.state = 'run';
  } else if (st === 'idle') {
    p.state = 'idle';
  } else if (st === 'jump') {
    p.state = 'air';
    p.flipT = (P.frame / (P.states[P.si].frames - 1)) * FLIP_T;
  } else if (st === 'drop' || st === 'fall') {
    p.state = st;
    p.animT = P.frame * 0.11;
  } else if (st === 'land') {
    p.state = 'land';
    p.landT = LAND_T - (P.frame / (P.states[P.si].frames - 1)) * (LAND_T - 0.001);
  } else if (st === 'death') {
    p.state = 'dead';
    p.deadT = (P.frame / P.states[P.si].frames) * 1.2;
  }
}

function step(dir) {
  var n = P.states[P.si].frames;
  P.frame = (P.frame + dir + n) % n;
  applyFrame();
}

function setState(i) {
  P.si = (i + P.states.length) % P.states.length;
  P.frame = 0;
  applyFrame();
}

function renderPreview() {
  g.clearRect(0, 0, W, H);
  var grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#20203a');
  grd.addColorStop(0.62, '#2c2440');
  grd.addColorStop(1, '#191426');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#3a3450';
  g.fillRect(0, 178, W, 1);
  for (var x = 0; x < W; x += 16) {
    g.fillStyle = 'rgba(255,255,255,0.03)';
    g.fillRect(x, 0, 1, H);
  }
  try {
    cam.sway = 0; cam.sy = 0;
    T = P.frame * 0.1;
    updateTail(1 / 60);
    drawTail();
    if (P.showTail) {
      for (var i = 0; i < tailPts.length; i++) {
        g.fillStyle = i === 0 ? '#ff5a8a' : '#8ff0ff';
        g.fillRect(Math.round(tailPts[i].x), Math.round(tailPts[i].y), 1, 1);
      }
    }
    drawPlayer();
    drawPreviewUI();
  } catch (err) {
    RUNTIME_ERRORS.push(String(err && err.message ? err.message : err));
  }
  for (var e = 0; e < RUNTIME_ERRORS.length; e++) {
    drawText(g, RUNTIME_ERRORS[e].slice(0, 60), 4, 4 + e * 8, '#ff8a8a', 1);
  }
}

function drawPreviewUI() {
  var st = P.states[P.si];
  var lines = [
    'STATE   ' + st.label,
    'FRAME   ' + (P.frame + 1) + '/' + st.frames,
    'RUNSPD  ' + player.speed.toFixed(0) + ' PX/S',
    'ANIM    ' + (P.playing ? 'PLAY' : 'HOLD') + ' X' + P.speed.toFixed(1),
    '',
    '1-7/UP/DN  STATE',
    'LEFT/RIGHT STEP',
    'SPACE      PLAY',
    '[ ]        RATE',
    'T          TAIL',
    'O          OUTFIT'
  ];
  g.globalAlpha = 0.55;
  g.fillStyle = '#0d0a18';
  g.fillRect(196, 8, 180, 200);
  g.globalAlpha = 1;
  drawText(g, 'CHARACTER PREVIEW', 202, 14, '#ffe9a8', 1);
  for (var i = 0; i < lines.length; i++) drawText(g, lines[i], 202, 30 + i * 10, i < 4 ? '#cfe0f0' : '#8f86a8', 1);
  var fps = clamp(player.speed / 6.6, 11, 17);
  var sy = 148;
  if (st.id === 'run') {
    drawText(g, 'ANIM FPS ' + fps.toFixed(1), 202, sy, '#9fffa8', 1);
    drawText(g, 'BOB ' + ([0, 1, 0, -1][P.frame % 4]), 202, sy + 10, '#9fffa8', 1);
  }
  if (st.id === 'jump') {
    var prog = clamp(player.flipT / FLIP_T, 0, 1);
    var rot = Math.round(prog * prog * (3 - 2 * prog) * 360);
    drawText(g, 'ROT ' + rot + ' DEG', 202, sy, '#9fffa8', 1);
    drawText(g, 'SMOOTHSTEP EASED', 202, sy + 10, '#9fffa8', 1);
  }
  if (st.id === 'land') drawText(g, 'RECOVERY ' + (P.frame + 1) + '/3', 202, sy, '#9fffa8', 1);
  drawText(g, st.label, 60 - textW(st.label, 2) / 2, 196, '#ffe9a8', 2);
}

function onKey(e) {
  var code = e.code;
  if (code === 'ArrowDown' || code === 'ArrowUp') {
    e.preventDefault();
    setState(P.si + (code === 'ArrowDown' ? 1 : -1));
  } else if (code === 'ArrowRight') { e.preventDefault(); step(1); P.playing = false; }
  else if (code === 'ArrowLeft') { e.preventDefault(); step(-1); P.playing = false; }
  else if (code === 'Space') { e.preventDefault(); P.playing = !P.playing; }
  else if (code === 'BracketLeft') P.speed = Math.max(20, P.speed - 20);
  else if (code === 'BracketRight') P.speed = Math.min(300, P.speed + 20);
  else if (code === 'KeyT') P.showTail = !P.showTail;
  else if (code === 'KeyO') {
    P.outfit = (P.outfit + 1) % OUTFIT_IDS.length;
    art = buildArt(OUTFIT_IDS[P.outfit]);
  }
  else if (code === 'Digit1') setState(0);
  else if (code === 'Digit2') setState(1);
  else if (code === 'Digit3') setState(2);
  else if (code === 'Digit4') setState(3);
  else if (code === 'Digit5') setState(4);
  else if (code === 'Digit6') setState(5);
  else if (code === 'Digit7') setState(6);
}
document.addEventListener('keydown', onKey);

function resize() {
  var s = Math.max(1, Math.floor(Math.min(window.innerWidth / W, window.innerHeight / H)));
  cv.style.width = (W * s) + 'px';
  cv.style.height = (H * s) + 'px';
}
window.addEventListener('resize', resize);
resize();

var last = 0;
function frame(ts) {
  var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
  last = ts;
  if (P.playing) {
    P.acc += dt;
    var stepT = 1 / (12 * P.speed / 100);
    while (P.acc >= stepT) {
      P.acc -= stepT;
      step(1);
    }
  }
  renderPreview();
  requestAnimationFrame(frame);
}

if (location.search.indexOf('outfit=') >= 0) {
  P.outfit = Math.min(OUTFIT_IDS.length - 1, parseInt(location.search.split('outfit=')[1], 10) || 0);
  art = buildArt(OUTFIT_IDS[P.outfit]);
}
applyFrame();
document.title = 'CHARACTER PREVIEW';
requestAnimationFrame(frame);
