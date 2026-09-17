/* LINE JUMPER - game
   Bootstrapping, wire/pole world generation, physics, scoring, state machine,
   HUD, menus and input. */

var cv = document.getElementById('c');
cv.width = W; cv.height = H;
var g = ctxOf(cv);
var qs = new URLSearchParams(location.search);
var MODE = qs.get('mode') || '';
var SHOT = MODE === 'shot';
var TEST = MODE === 'test';
var SEED = parseInt(qs.get('seed') || '1337', 10);
var ZOOM = parseFloat(qs.get('zoom') || '0');
var ZOX = parseFloat(qs.get('ox') || '192');
var ZOY = parseFloat(qs.get('oy') || '108');

function resize() {
  var s = Math.max(1, Math.floor(Math.min(window.innerWidth / W, window.innerHeight / H)));
  if (s > 7) s = 7;
  cv.style.width = (W * s) + 'px';
  cv.style.height = (H * s) + 'px';
}
window.addEventListener('resize', resize);
resize();

var sparkBank = 0, ownedOutfits = ['detective'], equippedOutfit = 'detective', wardrobe = false, wardrobeMsg = '', wardrobeMsgT = 0;

loadWardrobe();
if (qs.get('outfit')) equippedOutfit = OUTFITS[qs.get('outfit')] ? qs.get('outfit') : equippedOutfit;
if (qs.get('wardrobe')) wardrobe = true;
var scenery = lsGet('lj_scenery', 'shitamachi');
if (qs.get('scenery') && THEMES[qs.get('scenery')]) scenery = qs.get('scenery');
if (!THEMES[scenery]) scenery = 'shitamachi';
var art = buildArt(equippedOutfit);
var city = buildCity(20240, scenery);
var frameC = buildFrame(makeRng(9));
var glassC = buildGlass(makeRng(5));


var LEVELS = [70, 94, 118];
var STREET_Y = 191;
var WIN_L = 20, WIN_T = 16, WIN_R = 20, WIN_B = 26;
var SPEED0 = 82, SPEEDMAX = 148, ACCEL = 0.75;
var GRAV = 620, JUMPV = 172, HOLDG = 0.75, DROP_VY = 30, COYOTE = 0.09, JBUF = 0.13;
var UP_CLEAR = 5, UP_HOLD = 0.18;

var PX = 142;
var STEP = 1 / 120;

var state = 'title', paused = false, T = 0, acc = 0, last = 0;
var player, world, cam, sparks, stunts, ups, floats, parts, steamParts, crows, drops, cars;
var shakeT = 0, shakeA = 0, flashT = 0, overT = 0, deadMsg = '', finalScore = null;
var best = 0, newBest = false, poleScan = 0, nextTunnel = 0, tunnelNow = null, boltT = 0, rainOn = true, rainFade = 1;
var runSeed = SEED;
var ai = { jumps: 0, drops: 0 };

function loadBest() { try { return parseInt(localStorage.getItem('lj_best') || '0', 10) || 0; } catch (e) { return 0; } }
function saveBest(v) { try { localStorage.setItem('lj_best', String(v)); } catch (e) { } }
function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { } }


function loadWardrobe() {
  sparkBank = parseInt(lsGet('lj_sparks', '0'), 10) || 0;
  ownedOutfits = String(lsGet('lj_owned', 'detective')).split(',');
  ownedOutfits = ownedOutfits.filter(function (s) { return !!OUTFITS[s]; });
  if (ownedOutfits.indexOf('detective') < 0) ownedOutfits.unshift('detective');
  var eq = lsGet('lj_outfit', 'detective');
  equippedOutfit = OUTFITS[eq] ? eq : 'detective';
}
function saveWardrobe() {
  lsSet('lj_sparks', sparkBank);
  lsSet('lj_owned', ownedOutfits.join(','));
  lsSet('lj_outfit', equippedOutfit);
}
function equipOutfit(id) {
  var of = OUTFITS[id];
  if (!of) return;
  if (ownedOutfits.indexOf(id) < 0) {
    if (sparkBank < of.price) {
      wardrobeMsg = 'NEED ' + (of.price - sparkBank) + ' MORE SPARKS';
      wardrobeMsgT = 1.8;
      audio.ui();
      return;
    }
    sparkBank -= of.price;
    ownedOutfits.push(id);
    audio.stunt();
  } else audio.ui();
  equippedOutfit = id;
  art = buildArt(id);
  saveWardrobe();
}

function decoY(lvl, x) {
  var period = 118 + lvl * 21;
  var t = ((x + lvl * 37) % period) / period;
  if (t < 0) t += 1;
  return LEVELS[lvl] + (2.2 + lvl * 0.5) * Math.sin(Math.PI * t);
}

function spanY(sp, x) {
  var len = Math.max(1, sp.x1 - sp.x0);
  var t = clamp((x - sp.x0) / len, 0, 1);
  var y = LEVELS[sp.lvl] + sp.sag * Math.sin(Math.PI * t);
  if (sp.ramp > 0 && x < sp.x0 + sp.ramp) y = lerp(sp.rampFrom, y, clamp((x - sp.x0) / sp.ramp, 0, 1));
  var d = Math.min(x - sp.x0, sp.x1 - x);
  if (d < 4) y -= (4 - d) * 0.4;
  return y;
}

var _sc = null;
function mainSpanAt(x) {
  if (_sc !== null && x >= _sc.x0 && x <= _sc.x1) return _sc;
  var s = world.spans;
  for (var i = Math.max(0, world.idx - 3); i < s.length; i++) {
    if (x < s[i].x0) return null;
    if (x <= s[i].x1) { _sc = s[i]; return s[i]; }
  }
  return null;
}

function inGap(x, lvl) {
  var gp = world.gaps;
  for (var i = Math.max(0, world.idx - 3); i < gp.length; i++) {
    if (x < gp[i].x0) return false;
    if (x < gp[i].x1 && gp[i].lvl === lvl) return true;
  }
  return false;
}

function wireAt(x, lvl) {
  var sp = mainSpanAt(x);
  if (sp && sp.lvl === lvl) return spanY(sp, x);
  if (inGap(x, lvl)) return null;
  return decoY(lvl, x);
}

function landingY(x, fromY, toY, minY, minLvl, upLvl, apexY) {
  var bestW = null, lo = Math.max(fromY, minY) - 0.5;
  if (minLvl === undefined) minLvl = 0;
  if (upLvl === undefined) upLvl = -1;
  for (var lvl = minLvl; lvl < LEVELS.length; lvl++) {
    var y = wireAt(x, lvl);
    if (y === null) continue;
    if (y >= lo && y <= toY + 0.5) {
      if (upLvl >= 0 && lvl < upLvl) {
        if (apexY === undefined || y - apexY < UP_CLEAR) continue;
      }
      if (!bestW || y < bestW.y) {
        var sp = mainSpanAt(x);
        bestW = { y: y, lvl: lvl, onMain: !!(sp && sp.lvl === lvl) };
      }
    }
  }
  return bestW;
}

function groundWire(x, onMain, lvl) {
  var sp = mainSpanAt(x);
  if (sp) {
    if (onMain || sp.lvl === lvl) return { y: spanY(sp, x), lvl: sp.lvl, onMain: true };
  }
  if (!onMain) {
    if (inGap(x, lvl)) return null;
    return { y: decoY(lvl, x), lvl: lvl, onMain: false };
  }
  return null;
}

function genSpan() {
  var w = world, rng = w.rng;
  var safe = w.safeCounter-- > 0;
  var prev = w.spans.length ? w.spans[w.spans.length - 1].lvl : w.level;
  if (!safe && w.spans.length > 0 && rng.chance(0.24)) w.level = clamp(w.level + (rng.chance(0.5) ? 1 : -1), 0, LEVELS.length - 1);
  var lvl = w.level;
  var len = rng.range(104, 172) * (city && city.def ? city.def.poleGap : 1);
  var x0 = w.nextX, x1 = x0 + len;
  var ramp = (lvl !== prev && !safe) ? rng.range(24, 34) : 0;
  var sag = rng.chance(0.35) ? rng.range(3.5, 7) : rng.range(1.2, 2.8);
  var gap = (!safe && !ramp && rng.chance(0.3) && x0 > 300) ? rng.range(18, 36) : 0;
  var sp = { x0: x0, x1: x1, lvl: lvl, sag: sag, ramp: ramp, rampFrom: LEVELS[prev], gap: gap, obs: null, picks: [], crow: null, shoes: null };
  var obsMin = Math.max(74, ramp + 104);
  if (!safe && !gap && len > obsMin + 46 && rng.chance(0.74)) {
    sp.obs = { t: rng.chance(0.58) ? 'branch' : 'drum', x: x0 + rng.range(obsMin, len - 32) };
  }
  if (rng.chance(0.8)) {
    var n = rng.int(2, 4);
    for (var i = 0; i < n; i++) {
      var px = x0 + 24 + (len - 48) * ((i + 0.5) / n) + rng.range(-6, 6);
      if (px < x0 + ramp + 18) continue;
      sp.picks.push({ x: px, y: LEVELS[lvl] - 12, got: false });
    }
  }
  if (gap) {
    for (var k = 0; k < 3; k++) sp.picks.push({ x: x1 + (gap + 10) * (k + 1) / 4, y: LEVELS[lvl] - 15 - Math.sin((k + 1) / 4 * Math.PI) * 12, got: false });
  }
  if (!safe && rng.chance(0.3)) sp.crow = { x: x0 + rng.range(26, len - 26), t: 0, fly: false, vx: 0, vy: 0 };
  if (rng.chance(0.22)) sp.shoes = x0 + rng.range(20, len - 20);
  w.spans.push(sp);
  w.poles.push(x1);
  if (gap) w.gaps.push({ x0: x1, x1: x1 + gap + 10, lvl: lvl });
  w.nextX = gap ? x1 + gap + 10 : x1;
}

function reset(longSafe, seed) {
  var rng = makeRng(seed === undefined ? runSeed : seed);
  world = { rng: rng, spans: [], poles: [], gaps: [], nextX: -420, level: 1, idx: 0, safeCounter: longSafe ? 99999 : 6 };
  while (world.nextX < 1000) genSpan();
  world.poles.unshift(world.spans[0].x0);
  player = {
    x: 0, y: 0, vy: 0, lvl: 1, onMain: true, state: 'run', animT: rng.next(),
    flipT: 0, jumpBuf: 0, coyote: COYOTE, minY: 1e9, landT: 0, deadT: 0,
    speed: SPEED0, stats: { jumps: 0, lands: 0, gapFalls: 0, drops: 0, stunts: 0, ups: 0, picks: 0, maxLvl: 2 }
  };
  player.y = wireAt(0, 1);
  initTail(player.x - 4, player.y - 12);
  cam = { x: player.x - PX, sway: 0, sy: 0 };
  T = 0; sparks = 0; stunts = 0; ups = 0; floats = []; parts = []; steamParts = []; crows = []; drops = [];
  cars = [];
  for (var i = 0; i < 7; i++) cars.push({ x: rng.range(-400, 900), lane: rng.chance(0.5) ? 0 : 1, v: rng.range(18, 46), col: rng.pick(['#ffd9a0', '#ff6a4a', '#8ff0ff']) });
  _sc = null;
  shakeT = 0; shakeA = 0; flashT = 0; overT = 0; deadMsg = ''; finalScore = null; newBest = false;
  poleScan = 0; nextTunnel = 2600 + rng.range(0, 1400); tunnelNow = null; boltT = 6 + rng.range(0, 10);
  rainOn = rng.chance(0.75); rainFade = rainOn ? 1 : 0;
  ai = { jumps: 0, drops: 0 };
}

function distM() { return Math.max(0, Math.floor(player.x / 10)); }
function totalScore() { return distM() + sparks * 10 + stunts * 25 + ups * 40; }

function burst(x, y, col, n, spd) {
  for (var i = 0; i < n; i++) {
    var a = Math.random() * Math.PI * 2, s = spd * (0.35 + Math.random() * 0.65);
    parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: 0.4 + Math.random() * 0.5, max: 0.9, col: col, size: Math.random() < 0.3 ? 2 : 1, grav: 220 });
  }
}
function dust(x, y) {
  for (var i = 0; i < 5; i++) parts.push({ x: x + (Math.random() * 8 - 4), y: y, vx: (Math.random() - 0.5) * 30, vy: -Math.random() * 22, life: 0.3 + Math.random() * 0.3, max: 0.6, col: '#cbbfae', size: 1, grav: -10 });
}
function addFloat(x, y, txt, col) { floats.push({ x: x, y: y, txt: txt, col: col || '#ffe9a8', t: 0, life: 1.1 }); }

var input = { jump: false, jumpHeld: false, down: false, downHeld: false };

function startGame() {
  audio.init(); audio.resume();
  runSeed = (Math.random() * 1e9) | 0;
  reset(false);
  state = 'play'; paused = false;
  audio.musicStart(); audio.setRumble(0.13);
  audio.ui();
}

function gameOver(kind) {
  if (state !== 'play') return;
  state = 'over'; overT = 0;
  player.state = 'dead'; player.deadT = 0;
  player.vy = kind === 'hit' ? -120 : 20;
  deadMsg = kind === 'hit' ? 'STUMBLED ON THE LINE' : 'FELL TO THE STREET';
  audio.crash();
  shakeT = 0.5; shakeA = 3.5; flashT = 0.22;
  burst(player.x, player.y - 10, kind === 'hit' ? '#ffd27a' : '#ff7a5a', 16, 90);
  sparkBank += sparks;
  saveWardrobe();
  finalScore = { dist: distM(), sparks: sparks, stunts: stunts, ups: ups, total: totalScore() };
  var b = loadBest();
  if (finalScore.total > b) { saveBest(finalScore.total); best = finalScore.total; newBest = true; }
  else { best = b; newBest = false; }
  audio.musicStop(); audio.setRumble(0.05);
}

function doJump() {
  var p = player;
  p.state = 'air'; p.vy = -JUMPV; p.flipT = 0; p.jumpBuf = 0; p.coyote = 0;
  p.startLvl = p.lvl; p.minY = 1e9;
  p.apexY = p.y; p.holdT = 0; p.highJump = false;
  p.stats.jumps++;
  audio.jump();
  burst(p.x - 3, p.y, '#cbbfae', 3, 40);
}

function doDrop() {
  var p = player;
  p.state = 'drop'; p.vy = DROP_VY; p.minY = p.y + 5; p.startLvl = p.lvl; p.stats.drops++;
  audio.drop();
}

function landOn(w, fromState) {
  var p = player;
  p.y = w.y; p.lvl = w.lvl; p.onMain = w.onMain;
  p.state = 'land'; p.landT = LAND_T; p.vy = 0; p.flipT = 0;
  tailKick(fromState === 'air' ? 2.2 : 1.5);
  if (w.lvl > p.stats.maxLvl) p.stats.maxLvl = w.lvl;
  p.stats.lands++;
  if (w.lvl < p.startLvl) {
    ups++; p.stats.ups++;
    addFloat(p.x, p.y - 34, 'UP +40', '#b6ff8f');
    audio.stunt();
    burst(p.x, p.y + 2, '#b6ff8f', 6, 40);
  } else if (w.lvl > p.startLvl) {
    stunts++;
    addFloat(p.x, p.y - 30, 'STUNT +25', '#8ff0ff');
    audio.stunt();
  } else if (fromState === 'fall') addFloat(p.x, p.y - 28, 'SAVED', '#9fffa8');
  else if (fromState === 'air' && p.airTime > 0.5) addFloat(p.x, p.y - 30, 'NICE', '#ffe9a8');
  audio.land(); dust(p.x, p.y + 1);
}

function updatePlayer(dt) {
  var p = player;
  p.animT += dt;
  if (p.jumpBuf > 0) p.jumpBuf -= dt;
  if (p.coyote > 0) p.coyote -= dt;
  p.speed = Math.min(SPEEDMAX, SPEED0 + T * ACCEL);
  p.x += p.speed * dt;

  if (p.state === 'run') {
    var gw = groundWire(p.x, p.onMain, p.lvl);
    if (gw === null) {
      p.state = 'fall'; p.vy = 24; p.minY = p.y + 5; p.startLvl = p.lvl; p.flipT = 0;
      p.stats.gapFalls++;
      addFloat(p.x, p.y - 26, 'GAP!', '#ff8a6a');
      audio.drop();
    } else {
      p.lvl = gw.lvl; p.onMain = gw.onMain;
      p.y = lerp(p.y, gw.y, 1 - Math.pow(0.000001, dt));
      p.coyote = COYOTE;
      if (p.jumpBuf > 0) doJump();
    }
  } else if (p.state === 'land') {
    p.landT -= dt;
    var gw2 = groundWire(p.x, p.onMain, p.lvl);
    if (gw2 !== null) { p.y = gw2.y; p.lvl = gw2.lvl; p.onMain = gw2.onMain; }
    if (p.landT <= 0) p.state = 'run';
    if (p.jumpBuf > 0 && (LAND_T - p.landT) > 0.08) doJump();
  } else if (p.state === 'air') {
    p.flipT += dt;
    if (input.jumpHeld && p.vy < 0) {
      p.holdT += dt;
      if (p.holdT >= UP_HOLD) p.highJump = true;
    }
    var gr = (input.jumpHeld && p.vy < 0) ? GRAV * HOLDG : GRAV;
    p.vy += gr * dt;
    var py = p.y;
    p.y += p.vy * dt;
    if (p.y < p.apexY) p.apexY = p.y;
    if (p.vy > 0) {
      var upLvl = p.highJump ? p.startLvl : -1;
      var minLvl = p.highJump ? p.startLvl - 1 : p.startLvl;
      var w1 = landingY(p.x, py, p.y, -1e9, minLvl, upLvl, p.apexY);
      if (w1) { p.airTime = p.flipT; landOn(w1, 'air'); }
    }
    if (p.y >= STREET_Y) { p.y = STREET_Y; gameOver('street'); }
  } else if (p.state === 'drop' || p.state === 'fall') {
    p.vy += GRAV * dt;
    var py2 = p.y;
    p.y += p.vy * dt;
    var w2 = landingY(p.x, py2, p.y, p.minY, p.startLvl + 1);
    if (w2) landOn(w2, p.state === 'fall' ? 'fall' : 'drop');
    else if (p.y >= STREET_Y) { p.y = STREET_Y; gameOver('street'); }
  } else if (p.state === 'dead') {
    p.deadT += dt;
    p.vy += 420 * dt;
    p.y += p.vy * dt;
    p.x += 26 * dt;
  }

  if (p.state !== 'dead') {
    var s = world.spans;
    for (var i = Math.max(0, world.idx - 2); i < s.length; i++) {
      if (s[i].x0 > p.x + 24) break;
      var o = s[i].obs;
      if (!o) continue;
      var oy = spanY(s[i], o.x), h = o.t === 'drum' ? 9 : 6;
      if (Math.abs(p.x - o.x) < 5 && p.y >= oy - h - 1 && p.y <= oy + 4) { gameOver('hit'); break; }
    }
  }
}

function updateWorld(dt) {
  while (world.nextX < cam.x + W * 3) genSpan();
  var s = world.spans;
  while (world.idx < s.length - 1 && player.x > s[world.idx].x1) world.idx++;
  while (s.length > 14 && s[0].x1 < player.x - 700) {
    s.shift(); world.poles.shift();
    if (world.idx > 0) world.idx--;
    if (poleScan > 0) poleScan--;
    if (_sc === null || _sc === undefined || !s.length || _sc.x1 < s[0].x0) _sc = null;
  }
  while (world.gaps.length && world.gaps[0].x1 < player.x - 700) world.gaps.shift();
  if (world.nextX > nextTunnel) {
    var len = world.rng.range(900, 1500);
    tunnelNow = { x0: world.nextX, x1: world.nextX + len };
    nextTunnel = world.nextX + len + world.rng.range(2800, 5200);
  }
  if (tunnelNow && player.x > tunnelNow.x1 + 60) tunnelNow = null;
  audio.setRumble(tunnelAmt() > 0.5 ? 0.32 : 0.13);
  if (tunnelAmt() < 0.5 && city.def.rain > 0) {
    boltT -= dt;
    if (boltT <= 0) {
      boltT = 9 + world.rng.range(0, 14);
      flashT = 0.3;
      audio.thunder();
    }
  }
  if (MODE === '' || TEST) { }
}

function updateEntities(dt) {
  var i, p = player;
  for (i = 0; i < world.spans.length; i++) {
    var sp = world.spans[i];
    if (sp.x1 < cam.x - 60) continue;
    if (sp.x0 > cam.x + W + 60) break;
    if (sp.crow) {
      var cr = sp.crow;
      var wy = spanY(sp, cr.x);
      if (!cr.fly && Math.abs(p.x - cr.x) < 58 && state === 'play') { cr.fly = true; cr.vx = -18 - Math.random() * 20; cr.vy = -52 - Math.random() * 22; audio.tick(); }
      if (cr.fly) {
        cr.t += dt;
        cr.x += cr.vx * dt; cr.y = (cr.y === undefined ? wy : cr.y) + cr.vy * dt;
        cr.vy += 26 * dt;
        if (cr.t > 1.6) sp.crow = null;
      } else cr.y = wy;
    }
    if (state === 'play') {
      for (var k = 0; k < sp.picks.length; k++) {
        var pk = sp.picks[k];
        if (pk.got) continue;
        if (Math.abs(pk.x - p.x) < 8 && Math.abs(pk.y - (p.y - 15)) < 17) {
          pk.got = true; sparks++; p.stats.picks++;
          audio.pickup(sparks);
          burst(pk.x, pk.y, '#8ff0ff', 5, 45);
        }
      }
    }
  }
  if (Math.random() < dt * 1.6 && city.vents.length) {
    var v = city.vents[Math.floor(Math.random() * city.vents.length)];
    var tw = city.mid.width;
    var baseWorld = Math.floor((cam.x * 0.2 + v.x) / tw) * tw;
    var sx = baseWorld + v.x - cam.x * 0.2;
    if (sx > -20 && sx < W + 20) steamParts.push({ x: sx, y: v.y, vx: (Math.random() - 0.5) * 4, vy: -6 - Math.random() * 10, life: 2.6, max: 2.6, size: 2 + Math.random() * 3 });
  }
  for (i = steamParts.length - 1; i >= 0; i--) {
    var st = steamParts[i];
    st.life -= dt; st.x += st.vx * dt; st.y += st.vy * dt; st.vy *= 0.99;
    if (st.life <= 0) steamParts.splice(i, 1);
  }
  for (i = crows.length - 1; i >= 0; i--) {
    var cc = crows[i];
    cc.t += dt; cc.x += cc.vx * dt; cc.y += cc.vy * dt; cc.vy += 24 * dt;
    if (cc.t > 2) crows.splice(i, 1);
  }
  for (i = cars.length - 1; i >= 0; i--) {
    var car = cars[i];
    car.x += (p.speed * 0.62 + (car.lane === 0 ? -car.v : car.v)) * dt;
    if (car.x < cam.x * 0.62 - 200) car.x += 1500;
    if (car.x > cam.x * 0.62 + 900) car.x -= 1500;
  }
  var rTar = (rainOn && city.def.rain > 0) ? city.def.rain : 0;
  rainFade += (rTar - rainFade) * Math.min(1, dt * 0.4);
  if (rainFade > 0.02) {
    while (drops.length < 46 * rainFade) drops.push({ x: Math.random() * (W + 120), y: Math.random() * H, l: 4 + Math.random() * 8 });
    for (i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      d.x -= (p.speed * 0.98 + 30) * dt;
      d.y += 150 * dt;
      if (d.x < -80 || d.y > H + 10) { d.x += W + 120 + Math.random() * 60; d.y = -20 - Math.random() * 60; }
    }
  }
  if (T > 22 && Math.random() < dt / 34) { rainOn = !rainOn; }
  for (i = parts.length - 1; i >= 0; i--) {
    var pt = parts[i];
    pt.life -= dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += pt.grav * dt;
    if (pt.life <= 0) parts.splice(i, 1);
  }
  for (i = floats.length - 1; i >= 0; i--) {
    var fl = floats[i];
    fl.t += dt; fl.y -= 16 * dt;
    if (fl.t > fl.life) floats.splice(i, 1);
  }
  if (flashT > 0) flashT -= dt;
  if (shakeT > 0) shakeT -= dt;
  var pl = world.poles;
  while (poleScan < pl.length && player.x > pl[poleScan] + 2) {
    cam.sy += 0.7; audio.tick(); poleScan++;
  }
}

function updateCamera(dt) {
  var tx = player.x - PX;
  cam.x = lerp(cam.x, tx, 1 - Math.pow(0.0005, dt));
  if (state === 'over') cam.x = lerp(cam.x, tx - 30, 1 - Math.pow(0.02, dt));
  cam.sway = Math.sin(T * 1.15) * 1.5 + Math.sin(T * 0.47) * 0.8;
  cam.sy = cam.sy * 0.9 + (Math.sin(T * 1.9) * 0.6 + Math.sin(T * 0.31) * 0.5) * 0.1;
  if (shakeT > 0) {
    cam.sway += (Math.random() * 2 - 1) * shakeA;
    cam.sy += (Math.random() * 2 - 1) * shakeA;
  }
}

function stepSim(dt) {
  T += dt;
  if (state === 'play') {
    updateWorld(dt); updatePlayer(dt); updateEntities(dt);
  } else if (state === 'title') {
    var p = player;
    p.x += 40 * dt; p.animT += dt;
    var wy = wireAt(p.x, p.lvl);
    if (wy === null) { p.lvl = 1; wy = wireAt(p.x, p.lvl); }
    p.y = wy === null ? LEVELS[1] : wy;
    updateEntities(dt);
  } else if (state === 'over') {
    overT += dt;
    updatePlayer(dt); updateEntities(dt);
  }
  if (wardrobeMsgT > 0) wardrobeMsgT -= dt;
  updateTail(dt);
  updateCamera(dt);
  input.jump = false; input.down = false;
}

var errFlagged = false;
function frame(ts) {
  if (!last) last = ts;
  var dt = Math.min(0.06, (ts - last) / 1000);
  last = ts;
  acc += dt;
  var n = 0;
  while (acc >= STEP && n < 8) { if (!paused) stepSim(STEP); acc -= STEP; n++; }
  if (acc > STEP * 8) acc = 0;
  render();
  if (!errFlagged && (RUNTIME_ERRORS.length || ART_ERRORS.length)) {
    errFlagged = true;
    document.title = 'ERRORS ' + RUNTIME_ERRORS.concat(ART_ERRORS).join(' | ');
  }
  requestAnimationFrame(frame);
}

function drawPara(tile, para, y) {
  var tw = tile.width;
  var v = (cam.x * para + cam.sway * 0.6);
  var off = -((v % tw) + tw) % tw;
  for (var x = off - tw; x < W + tw; x += tw) g.drawImage(tile, Math.round(x), Math.round(y));
}

function drawWires() {
  var x0 = Math.floor(cam.x - 6), x1 = Math.ceil(cam.x + W + 6);
  var wc = (city && city.def && city.def.wire) ? city.def.wire : { main: '#333c58', mainHi: '#7d8cb5', deco: '#0d0c16', decoHi: '#2c3348' };
  var tag = 0, sp = mainSpanAt(cam.x + W * 0.5);
  if (sp) tag = sp.lvl;
  for (var lvl = 0; lvl < LEVELS.length; lvl++) {
    for (var x = x0; x <= x1; x++) {
      var y = wireAt(x, lvl);
      if (y === null) continue;
      var sx = Math.round(x - cam.x + cam.sway), sy = Math.round(y + cam.sy);
      if (sy < -4 || sy > H + 4) continue;
      var isMain = false;
      var msp = mainSpanAt(x);
      if (msp && msp.lvl === lvl) isMain = true;
      if (isMain) {
        g.fillStyle = wc.main;
        g.fillRect(sx, sy, 1, 1);
        if ((x & 7) === 0) { g.fillStyle = wc.mainHi; g.fillRect(sx, sy - 1, 1, 1); }
      } else {
        g.fillStyle = wc.deco;
        g.fillRect(sx, sy, 1, 1);
        if ((x % 22) === 0) { g.fillStyle = wc.decoHi; g.fillRect(sx, sy - 1, 1, 1); }
      }
    }
  }
  for (var i = 0; i < world.gaps.length; i++) {
    var gp = world.gaps[i];
    for (var s = 0; s < 2; s++) {
      var gx = s === 0 ? gp.x0 - 1 : gp.x1 + 1;
      var gy = LEVELS[gp.lvl] + (s === 0 ? -1 : 0);
      var sx2 = Math.round(gx - cam.x + cam.sway), sy2 = Math.round(gy + cam.sy);
      for (var k = 0; k < 6; k++) {
        g.fillStyle = k < 3 ? wc.main : wc.deco;
        g.fillRect(sx2 + (s === 0 ? -k : k) * 0.4, sy2 + k, 1, 1);
      }
    }
  }
}

function ins(g, x, y) {
  rect(g, x, y, 2, 1, '#9fb0bd');
  rect(g, x, y + 1, 2, 2, '#6c7a86');
  rect(g, x - 1, y + 3, 4, 1, '#55606a');
  rect(g, x, y + 4, 2, 1, '#3a4048');
}

function drawPoles() {
  var pl = world.poles;
  var pst = (city && city.def) ? city.def.poleStyle : 'concrete';
  var colA = pst === 'wood' ? '#4a3826' : (pst === 'steel' ? '#3a4450' : '#241c22');
  var colB = pst === 'wood' ? '#5e4a32' : (pst === 'steel' ? '#4e5a68' : '#332930');
  var colC = pst === 'wood' ? '#2c2116' : (pst === 'steel' ? '#242c36' : '#120d12');
  for (var i = 0; i < pl.length; i++) {
    var sx = Math.round(pl[i] - cam.x + cam.sway);
    if (sx < -40) continue;
    if (sx > W + 40) break;
    var oy = cam.sy;
    var topY = LEVELS[0] - 22 + oy;
    rect(g, sx - 1, topY, 3, H - topY + 6, colA);
    rect(g, sx - 1, topY, 1, H - topY + 6, colB);
    rect(g, sx + 1, topY, 1, H - topY + 6, colC);
    rect(g, sx - 2, topY - 3, 5, 3, colB);
    if (pst === 'wood') {
      rect(g, sx - 7, topY + 40, 14, 2, colC);
      rect(g, sx - 5, topY + 74, 11, 2, colC);
    } else if (pst === 'steel') {
      rect(g, sx - 4, topY + 30, 9, 1, colB);
      rect(g, sx - 4, topY + 58, 9, 1, colB);
      rect(g, sx - 4, topY + 86, 9, 1, colB);
    }
    for (var lvl = 0; lvl < LEVELS.length; lvl++) {
      var y = LEVELS[lvl] + 4 + oy;
      rect(g, sx - 8, y, 17, 2, '#2a2128');
      rect(g, sx - 8, y, 17, 1, '#3b3039');
      ins(g, sx - 6, LEVELS[lvl] - 1 + oy);
      ins(g, sx + 4, LEVELS[lvl] - 1 + oy);
    }
    rect(g, sx - 6, LEVELS[0] + 6 + oy, 13, 1, '#1e171d');
    rect(g, sx + 2, LEVELS[1] + 8 + oy, 6, 1, '#1e171d');
    if (i % 3 === 0) {
      g.globalAlpha = 0.5 + Math.sin(T * 2 + i) * 0.2;
      rect(g, sx - 1, topY - 5, 3, 3, '#ff4a4a');
      g.globalAlpha = 0.12;
      rect(g, sx - 3, topY - 7, 7, 7, '#ff4a4a');
      g.globalAlpha = 1;
    }
  }
}

function drawObstacles() {
  var s = world.spans;
  for (var i = Math.max(0, world.idx - 2); i < s.length; i++) {
    var sp = s[i];
    if (sp.x1 < cam.x - 20) continue;
    if (sp.x0 > cam.x + W + 20) break;
    if (sp.obs) {
      var sx = Math.round(sp.obs.x - cam.x + cam.sway);
      var oy = Math.round(spanY(sp, sp.obs.x) + cam.sy);
      if (sp.obs.t === 'drum') blit(g, art.drum, sx - 4, oy - 9);
      else blit(g, art.branch, sx - 5, oy - 6);
    }
    if (sp.shoes !== null && sp.shoes !== undefined) {
      var shx = Math.round(sp.shoes - cam.x + cam.sway);
      var shy = Math.round(spanY(sp, sp.shoes) + cam.sy);
      blit(g, art.shoes, shx, shy + 1);
    }
    if (sp.crow && !sp.crow.fly) {
      var cxp = Math.round(sp.crow.x - cam.x + cam.sway);
      var cyp = Math.round(spanY(sp, sp.crow.x) + cam.sy);
      blit(g, art.crowSit, cxp - 2, cyp - 4);
    }
  }
  for (var c = 0; c < crows.length; c++) {
    var cc = crows[c];
    blit(g, Math.floor(T * 12) % 2 ? art.crowFly0 : art.crowFly1, cc.x - cam.x + cam.sway - 2, cc.y + cam.sy - 2);
  }
  var s2 = world.spans;
  for (var k = Math.max(0, world.idx - 2); k < s2.length; k++) {
    if (s2[k].crow && s2[k].crow.fly) {
      var cr = s2[k].crow;
      blit(g, Math.floor(T * 12) % 2 ? art.crowFly0 : art.crowFly1, cr.x - cam.x + cam.sway - 2, cr.y + cam.sy - 2);
    }
  }
}

function drawPicks() {
  var s = world.spans;
  for (var i = Math.max(0, world.idx - 2); i < s.length; i++) {
    var sp = s[i];
    if (sp.x1 < cam.x - 20) continue;
    if (sp.x0 > cam.x + W + 40) break;
    for (var k = 0; k < sp.picks.length; k++) {
      var pk = sp.picks[k];
      if (pk.got) continue;
      var sx = pk.x - cam.x + cam.sway, sy = pk.y + cam.sy + Math.sin(T * 3 + pk.x * 0.3) * 1.6;
      g.globalAlpha = 0.09 + 0.05 * Math.sin(T * 5 + pk.x);
      g.fillStyle = '#8ff0ff';
      g.beginPath(); g.arc(sx, sy, 5.5, 0, 7); g.fill();
      g.globalAlpha = 1;
      blit(g, art.spark, sx - 1, sy - 1);
    }
  }
}

function drawStreet() {
  var y = STREET_Y - 4 + cam.sy;
  drawPara(city.street, 0.62, y);
  if (!city.def.cars) return;
  for (var i = 0; i < cars.length; i++) {
    var c = cars[i];
    var sx = c.x - cam.x * 0.62 + cam.sway * 0.7;
    if (sx < -30 || sx > W + 30) continue;
    var cy = y + (c.lane === 0 ? 12 : 20);
    rect(g, sx - 5, cy, 11, 3, '#0d0b14');
    rect(g, sx - 4, cy - 1, 9, 1, '#1a1622');
    if (c.lane === 0) {
      rect(g, sx - 6, cy + 1, 2, 2, '#ffe9c0');
      rect(g, sx + 5, cy + 1, 2, 2, '#ffe9c0');
    } else {
      rect(g, sx - 6, cy + 1, 2, 2, c.col);
      rect(g, sx + 5, cy + 1, 2, 2, c.col);
    }
    g.globalAlpha = 0.16;
    rect(g, sx - 6, cy + 5, 13, 1, c.lane === 0 ? '#ffe9c0' : c.col);
    g.globalAlpha = 1;
  }
}

function drawMist() {
  var m = (city.def && city.def.mist) ? city.def.mist : 0;
  if (m <= 0) return;
  for (var i = 0; i < 3; i++) {
    var y = 118 + i * 26 + Math.sin(T * 0.18 + i * 1.7) * 3;
    var raw = cam.x * (0.1 + i * 0.06) + T * (1 + i * 0.4);
    var off = -(((raw % 520) + 520) % 520);
    g.globalAlpha = m * (0.17 - i * 0.035);
    g.fillStyle = '#e2f0f4';
    for (var x = off - 520; x < W + 520; x += 520) g.fillRect(x, y, 520, 9 + i * 4);
    g.globalAlpha = 1;
  }
}

function drawRain() {
  if (rainFade <= 0.02 || tunnelAmt() > 0.4) return;
  g.globalAlpha = 0.16 * rainFade;
  g.fillStyle = '#cfe0f0';
  for (var i = 0; i < drops.length; i++) {
    var d = drops[i];
    for (var k = 0; k < d.l; k++) g.fillRect(Math.round(d.x + k * 0.42), Math.round(d.y + k), 1, 1);
  }
  g.globalAlpha = 1;
}

function tunnelAmt() {
  if (!tunnelNow) return 0;
  var a = clamp((player.x - tunnelNow.x0 + 70) / 150, 0, 1) * clamp((tunnelNow.x1 + 40 - player.x) / 150, 0, 1);
  return Math.max(0, a);
}

function drawTunnelBack(a) {
  g.globalAlpha = 1;
  g.fillStyle = '#05040a';
  g.fillRect(0, 0, W, H);
  drawPara(city.tunnel, 1.35, cam.sy);
  if (a < 1) {
    g.globalAlpha = 1 - a;
    g.drawImage(city.sky, Math.round(cam.sway * 0.3), 0);
    drawPara(city.far, 0.08, cam.sy * 0.4);
    drawPara(city.mid, 0.2, cam.sy * 0.7);
    drawStreet();
    drawPara(city.near, 1.45, cam.sy);
    g.globalAlpha = 1;
  }
}

function drawTunnelFront(a) {
  g.globalAlpha = a * 0.33;
  g.fillStyle = '#07060f';
  g.fillRect(0, 0, W, H);
  g.globalAlpha = 1;
  var lampSpacing = 260;
  var lampBase = Math.floor((cam.x * 1.35 - 100) / lampSpacing) * lampSpacing;
  for (var i = -1; i < 4; i++) {
    var sx = lampBase + i * lampSpacing - cam.x * 1.35;
    if (sx < -60 || sx > W + 60) continue;
    var gl2 = clamp(1 - Math.abs(sx - W * 0.45) / 240, 0, 1);
    g.globalAlpha = a * (0.2 + gl2 * 0.8);
    rect(g, sx - 9, 12, 18, 2, '#fff0cc');
    rect(g, sx - 30, 10, 60, 7, '#d99a52');
    g.globalAlpha = a * 0.13;
    rect(g, sx - 70, 6, 140, 16, '#ffb45a');
    g.globalAlpha = a * 0.18;
    rect(g, sx - 46, 26, 92, 3, '#ffd9a0');
    g.globalAlpha = a * 0.08;
    rect(g, sx - 26, 40, 52, 2, '#ffcf8a');
  }
  g.globalAlpha = 1;
}

function drawAtmosphere() {
  if (flashT > 0) {
    var fa = Math.sin(clamp(flashT / 0.3, 0, 1) * Math.PI) * 0.22;
    g.globalAlpha = fa;
    g.fillStyle = '#c8d8ff';
    g.fillRect(0, 0, W, H);
    g.globalAlpha = 1;
  }
}

function drawGlassDyn() {
  g.save();
  roundRectPath(g, WIN_L, WIN_T, W - WIN_L - WIN_R, H - WIN_T - WIN_B, 10);
  g.clip();
  var bx = ((T * 14) % 620) - 240;
  g.save();
  g.translate(bx, -40);
  g.rotate(0.34);
  g.globalAlpha = 0.032;
  g.fillStyle = '#cfe4ff';
  g.fillRect(0, 0, 38, 420);
  g.globalAlpha = 0.02;
  g.fillRect(56, 0, 16, 420);
  g.restore();
  var bx2 = ((-T * 6) % 760 + 760) % 760 - 260;
  g.save();
  g.translate(bx2, -30);
  g.rotate(-0.26);
  g.globalAlpha = 0.022;
  g.fillStyle = '#ffd9c0';
  g.fillRect(0, 0, 26, 400);
  g.restore();
  var p = player;
  var cx2 = p.x - cam.x + cam.sway;
  g.globalAlpha = 0.055;
  if (p.state === 'run' || p.state === 'land') {
    var f = Math.floor(p.animT * 11) % 8;
    var spr = p.state === 'land' ? art.recover[0] : art.run[f];
    var mirrored = W - cx2 - spr.w / 2;
    blit(g, spr, mirrored, p.y + cam.sy - (spr.h - 1), false, 0.055);
    g.globalAlpha = 1;
  }
  g.globalAlpha = 1;
  g.restore();
}

function drawSparkIcon(g, x, y) {
  g.fillStyle = '#3fd6f0';
  g.fillRect(x + 3, y, 3, 1); g.fillRect(x + 3, y + 6, 3, 1);
  g.fillRect(x + 2, y + 1, 5, 1); g.fillRect(x + 2, y + 5, 5, 1);
  g.fillRect(x + 1, y + 2, 7, 1); g.fillRect(x + 1, y + 4, 7, 1);
  g.fillRect(x, y + 3, 9, 1);
  g.fillStyle = '#c8f8ff';
  g.fillRect(x + 3, y + 2, 3, 3);
  g.fillStyle = '#ffffff';
  g.fillRect(x + 4, y + 3, 1, 1);
}

function drawHUD() {
  if (state === 'title') return;
  var dist = distM();
  drawTextOutline(g, dist + ' M', 30, 24, '#f2e8d4', '#150f1e', 2);
  var spStr = 'BEST ' + best;
  drawTextOutline(g, spStr, W - 30 - textW(spStr, 1), 26, '#c8b9a6', '#150f1e', 1);
  drawSparkIcon(g, 31, 41);
  drawTextOutline(g, ' ' + sparks, 38, 41, '#8ff0ff', '#150f1e', 1);
  drawTextOutline(g, (player.speed / 10).toFixed(1) + ' M/S', 30, 53, '#8fa0b8', '#150f1e', 1);
  for (var i = 0; i < floats.length; i++) {
    var fl = floats[i];
    var a = clamp(1 - fl.t / fl.life, 0, 1);
    g.globalAlpha = a;
    drawText(g, fl.txt, fl.x - cam.x - textW(fl.txt, 1) / 2, fl.y, fl.col, 1);
    g.globalAlpha = 1;
  }
}

function drawTitle() {
  var grd = g.createLinearGradient(0, 88, 0, 186);
  grd.addColorStop(0, 'rgba(10,7,20,0.5)');
  grd.addColorStop(0.3, 'rgba(10,7,20,0.74)');
  grd.addColorStop(1, 'rgba(10,7,20,0.42)');
  g.fillStyle = grd;
  g.fillRect(WIN_L, 88, W - WIN_L - WIN_R, 100);
  var cy = 92;
  drawTextCenter(g, 'LINE', W / 2 - 2, cy, '#ff4f9a', 5);
  drawTextCenter(g, 'LINE', W / 2 + 2, cy, '#22d3ff', 5);
  drawTextCenter(g, 'LINE', W / 2, cy, '#f6efe2', 5);
  drawTextCenter(g, 'JUMPER', W / 2 - 2, cy + 27, '#ff4f9a', 5);
  drawTextCenter(g, 'JUMPER', W / 2 + 2, cy + 27, '#22d3ff', 5);
  drawTextCenter(g, 'JUMPER', W / 2, cy + 27, '#f6efe2', 5);
  drawTextCenter(g, 'TOKYO EXPRESS - CAR 3 - WINDOW SEAT', W / 2, cy + 56, '#b9a7c4', 1);
  drawTextCenter(g, 'SPACE JUMP   DOWN DROP   M MUTE   R RESTART', W / 2, cy + 68, '#7f7098', 1);
  drawTextCenter(g, 'HOLD JUMP TO REACH THE LINE ABOVE', W / 2, cy + 79, '#9fb6d8', 1);
  if (Math.floor(T * 2) % 2) drawTextCenter(g, 'PRESS SPACE OR TAP TO RIDE', W / 2, cy + 92, '#ffe9a8', 1);
  var ow = OUTFITS[equippedOutfit];
  drawText(g, 'SCENERY ' + (city.def ? city.def.name : '?'), 30, 24, '#8f86a8', 1);
  drawText(g, '[V] CHANGE', 30, 76, '#6f6480', 1);
  drawSparkIcon(g, 30, 34);
  drawText(g, '' + sparkBank, 41, 34, '#8ff0ff', 1);
  drawText(g, 'OUTFIT ' + (ow ? ow.name : '?'), 30, 46, '#8f86a8', 1);
  drawText(g, '[C] WARDROBE', 30, 56, '#6f6480', 1);
  if (wardrobe) drawWardrobe();
  if (wardrobeMsgT > 0) drawTextCenter(g, wardrobeMsg, W / 2, 154, '#ffb0b0', 1);
}

function drawWardrobe() {
  g.globalAlpha = 0.97;
  g.fillStyle = '#0b0816';
  g.fillRect(36, 44, W - 72, 104);
  g.globalAlpha = 1;
  rect(g, 36, 44, W - 72, 1, '#4a3f5e');
  rect(g, 36, 147, W - 72, 1, '#4a3f5e');
  drawTextCenter(g, 'WARDROBE', W / 2, 50, '#ffe9a8', 1);
  drawSparkIcon(g, 150, 50);
  drawText(g, '' + sparkBank, 161, 50, '#8ff0ff', 1);
  for (var i = 0; i < OUTFIT_IDS.length; i++) {
    var id = OUTFIT_IDS[i], of = OUTFITS[id];
    var y = 64 + i * 22;
    var owned = ownedOutfits.indexOf(id) >= 0;
    var eq = equippedOutfit === id;
    g.globalAlpha = eq ? 0.22 : 0.12;
    g.fillStyle = eq ? '#8ff0ff' : '#4a4060';
    g.fillRect(42, y - 2, W - 84, 20);
    g.globalAlpha = 1;
    drawText(g, (i + 1) + '  ' + of.name, 48, y + 2, eq ? '#ffffff' : '#cfe0f0', 1);
    var sw = of.pal && of.pal.C ? of.pal.C : '#f0e0bd';
    rect(g, 168, y, 14, 14, sw);
    rect(g, 168, y, 14, 1, '#0b0816');
    rect(g, 182, y, 1, 14, '#0b0816');
    var state = eq ? 'EQUIPPED' : (owned ? 'OWNED - PRESS ' + (i + 1) : of.price + ' SPARKS');
    drawText(g, state, 190, y + 4, eq ? '#9fffa8' : (owned ? '#cfe0f0' : '#ffd27a'), 1);
    var hat = HATS[of.hat], hpal = outfitPalette(id);
    for (var r = 0; r < hat.length; r++) {
      for (var c = 0; c < hat[r].length; c++) {
        var ch = hat[r][c];
        if (ch === '.') continue;
        var col = hpal[ch];
        if (col) { g.fillStyle = col; g.fillRect(228 + c * 4, y + r * 5, 4, 5); }
      }
    }
  }
  drawTextCenter(g, '1-3 BUY / EQUIP      C  CLOSE', W / 2, 138, '#8f86a8', 1);
}

function drawOver() {
  var a = clamp((overT - 0.45) * 1.4, 0, 1);
  if (a <= 0) return;
  g.globalAlpha = a * 0.72;
  g.fillStyle = '#07050c';
  g.fillRect(WIN_L, WIN_T, W - WIN_L - WIN_R, H - WIN_T - WIN_B);
  g.globalAlpha = a;
  drawTextCenterOutline(g, 'GAME OVER', W / 2, 58, '#ff6a6a', '#140d18', 4);
  drawTextCenter(g, deadMsg, W / 2, 88, '#e6d8c2', 1);
  drawTextCenter(g, 'DISTANCE ' + finalScore.dist + ' M', W / 2, 106, '#f2e8d4', 2);
  drawTextCenter(g, 'SPARKS X' + finalScore.sparks + '  STUNTS X' + finalScore.stunts + '  UPS X' + finalScore.ups, W / 2, 126, '#8ff0ff', 1);
  drawTextCenter(g, 'TOTAL ' + finalScore.total, W / 2, 136, '#ffd27a', 1);
  if (newBest) drawTextCenter(g, 'NEW BEST!', W / 2, 146, '#9fffa8', 1);
  else drawTextCenter(g, 'BEST ' + best, W / 2, 146, '#c8b9a6', 1);
  if (overT > 0.9 && Math.floor(T * 2) % 2) drawTextCenter(g, 'PRESS SPACE TO RIDE AGAIN', W / 2, 166, '#ffe9a8', 1);
  g.globalAlpha = 1;
}

function drawPause() {
  g.globalAlpha = 0.5;
  g.fillStyle = '#07050c';
  g.fillRect(WIN_L, WIN_T, W - WIN_L - WIN_R, H - WIN_T - WIN_B);
  g.globalAlpha = 1;
  drawTextCenterOutline(g, 'PAUSED', W / 2, 96, '#f2e8d4', '#140d18', 3);
  drawTextCenter(g, 'ESC TO RESUME', W / 2, 126, '#b9a7c4', 1);
}

function drawErrors() {
  var errs = RUNTIME_ERRORS.concat(ART_ERRORS);
  if (!errs.length) return;
  g.globalAlpha = 0.8;
  g.fillStyle = '#3a0000';
  g.fillRect(0, 0, W, 12 + errs.length * 8);
  g.globalAlpha = 1;
  drawText(g, 'ERRORS ' + errs.length, 2, 2, '#ff8a8a', 1);
  for (var i = 0; i < Math.min(4, errs.length); i++) drawText(g, errs[i].slice(0, 60), 2, 10 + i * 8, '#ffb0b0', 1);
}

function render() {
  g.clearRect(0, 0, W, H);
  var tunA = tunnelAmt();
  if (tunA > 0.01) drawTunnelBack(tunA);
  else {
    g.drawImage(city.sky, Math.round(cam.sway * 0.3), 0);
    drawPara(city.far, 0.08, cam.sy * 0.4);
    drawPara(city.mid, 0.2, cam.sy * 0.7);
    drawStreet();
    drawPara(city.near, 1.45, cam.sy);
    drawMist();
  }
  for (var i = 0; i < steamParts.length; i++) {
    var st = steamParts[i];
    g.globalAlpha = clamp(st.life / st.max, 0, 1) * 0.14;
    g.fillStyle = '#cfd8e8';
    g.fillRect(Math.round(st.x), Math.round(st.y), Math.round(st.size), Math.round(st.size));
    g.globalAlpha = 1;
  }
  drawWires();
  drawPoles();
  drawObstacles();
  drawPicks();
  drawTail();
  drawPlayer();
  for (var p2 = 0; p2 < parts.length; p2++) {
    var pt = parts[p2];
    g.globalAlpha = clamp(pt.life / pt.max, 0, 1);
    g.fillStyle = pt.col;
    g.fillRect(Math.round(pt.x - cam.x + cam.sway), Math.round(pt.y + cam.sy), pt.size, pt.size);
    g.globalAlpha = 1;
  }
  drawRain();
  if (tunA > 0.01) drawTunnelFront(tunA);
  drawAtmosphere();
  drawGlassDyn();
  g.drawImage(glassC, 0, 0);
  g.drawImage(frameC, 0, 0);
  drawHUD();
  if (state === 'title') drawTitle();
  if (state === 'over') drawOver();
  if (paused) drawPause();
  drawErrors();
  if (ZOOM > 1) g.drawImage(cv, ZOX - W / (2 * ZOOM), ZOY - H / (2 * ZOOM), W / ZOOM, H / ZOOM, 0, 0, W, H);
}

function scriptedInput() {
  var p = player;
  input.jumpHeld = (p.state === 'air' && p.flipT < 0.16) || (ai.holdUntil !== undefined && T < ai.holdUntil);
  if (p.state !== 'run' && p.state !== 'land') return;
  var lvl = p.lvl;
  for (var i = 0; i < world.gaps.length; i++) {
    var gp = world.gaps[i];
    if (gp.lvl === lvl) {
      var d = gp.x0 - p.x;
      if (d > p.speed * 0.02 && d < p.speed * 0.12) { input.jump = true; input.jumpHeld = true; p.jumpBuf = JBUF; ai.jumps++; return; }
    }
  }
  var s = world.spans;
  for (var j = Math.max(0, world.idx - 1); j < s.length; j++) {
    var sp = s[j];
    if (sp.x0 > p.x + 120) break;
    if (sp.lvl === lvl && sp.obs && p.x > sp.x0 + sp.ramp + 4) {
      var d2 = sp.obs.x - p.x;
      if (d2 > p.speed * 0.16 && d2 < p.speed * 0.4) { input.jump = true; input.jumpHeld = true; p.jumpBuf = JBUF; ai.jumps++; return; }
    }
  }
}

function simulate(secs, opt) {
  opt = opt || {};
  var t = 0, maxN = Math.ceil(secs / STEP);
  for (var n = 0; n < maxN; n++) {
    if (state === 'play') scriptedInput();
    if (opt.onStep) opt.onStep(t);
    stepSim(STEP);
    t += STEP;
    if (opt.stopWhen && opt.stopWhen(t)) break;
  }
  return t;
}

function drawTestReport(info) {
  g.globalAlpha = 0.88;
  g.fillStyle = '#080611';
  g.fillRect(0, 0, W, H);
  g.globalAlpha = 1;
  var errs = RUNTIME_ERRORS.concat(ART_ERRORS);
  var ok = errs.length === 0 && info.lands > 4 && info.jumps > 4 && info.upOK > 0;
  drawText(g, 'LINE JUMPER - SELF TEST', 8, 8, '#f2e8d4', 1);
  drawText(g, ok ? 'STATUS: PASS' : 'STATUS: CHECK', 8, 20, ok ? '#9fffa8' : '#ffb0b0', 2);
  var lines = [
    'TOTAL SIM     ' + info.t.toFixed(0) + ' S   ' + info.dist + ' M',
    'RUNNER STATE  ' + info.state,
    'JUMPS/ISSUED  ' + info.jumps + '/' + info.jumpsIssued,
    'LANDINGS      ' + info.lands,
    'GAP FALLS     ' + info.gapFalls,
    'DROPS TRIED   ' + info.drops,
    'UP JUMPS OK   ' + info.upOK + '/' + info.upTry,
    'STUNTS/UPS    ' + info.stunts + '/' + info.ups,
    'SPARKS        ' + info.picks,
    'MAX LEVEL     ' + info.maxLvl,
    'PHASE1        ' + info.deaths,
    'STREET DEATHS ' + info.street,
    'SCORE         ' + info.score,
    'SCENERY       ' + city.def.name,
    'RUNTIME ERRS  ' + RUNTIME_ERRORS.length,
    'ART ERRS      ' + ART_ERRORS.length
  ];
  for (var i = 0; i < lines.length; i++) drawText(g, lines[i], 8, 42 + i * 9, '#cfe0f0', 1);
  for (var e = 0; e < Math.min(5, errs.length); e++) drawText(g, errs[e].slice(0, 58), 8, 42 + (lines.length + e) * 9, '#ff8a8a', 1);
  drawText(g, 'PRESS SPACE OR TAP TO PLAY', W / 2 - 78, H - 14, '#ffe9a8', 1);
}

function runSelfTest() {
  reset(false); state = 'play';
  var p1 = simulate(45);
  var r1 = {
    dist: distM(), jumps: player.stats.jumps, lands: player.stats.lands, gaps: player.stats.gapFalls,
    picks: player.stats.picks, st: state, deaths: (state !== 'play' ? 1 : 0)
  };
  if (state !== 'play') { reset(false); state = 'play'; }
  var attempted = 0, landed = 0, deaths = 0, lastDrop = -99;
  simulate(30, {
    onStep: function (t) {
      if (t - lastDrop > 7 && player.state === 'run' && player.lvl < LEVELS.length - 1) {
        lastDrop = t; attempted++;
        var from = player.lvl;
        doDrop();
        if (player.startLvl === from) { }
      }
    }
  });
  var dropsNow = player.stats.drops;
  reset(false); state = 'play';
  var upTry = 0, upOK = 0, pendingFrom = -1, lastUpT = -99, prevSt = player.state;
  simulate(40, {
    onStep: function (t) {
      var p = player;
      if (pendingFrom >= 0 && prevSt !== 'land' && p.state === 'land') {
        if (p.lvl < pendingFrom) upOK++;
        pendingFrom = -1;
      }
      prevSt = p.state;
      if (p.state === 'run' && t - lastUpT > 4.5) {
        var clear = true, i;
        for (i = 0; i < world.gaps.length; i++) {
          var d = world.gaps[i].x0 - p.x;
          if (d > 0 && d < 170) clear = false;
        }
        var sp = mainSpanAt(p.x);
        if (sp && sp.obs && sp.obs.x - p.x > -20 && sp.obs.x - p.x < 170) clear = false;
        if (sp && p.x < sp.x0 + sp.ramp + 30) clear = false;
        if (clear && p.lvl > 0) {
          lastUpT = t; pendingFrom = p.lvl; upTry++;
          p.jumpBuf = JBUF;
          ai.holdUntil = T + 0.42;
        }
      }
    }
  });
  var upsNow = player.stats.ups;
  render();
  var errs = RUNTIME_ERRORS.length + ART_ERRORS.length;
  drawTestReport({
    t: p1 + 70, state: state, dist: distM(), score: totalScore(),
    jumps: r1.jumps, jumpsIssued: ai.jumps, lands: r1.lands, gapFalls: r1.gaps,
    drops: dropsNow, stunts: stunts, ups: upsNow, picks: r1.picks, maxLvl: player.stats.maxLvl,
    street: (state === 'over' && deadMsg.indexOf('STREET') >= 0) ? 1 : 0,
    deaths: 'P1 ' + r1.dist + 'M  DROPS ' + attempted,
    upTry: upTry, upOK: upOK, errs: errs
  });
  document.title = errs === 0 ? 'TEST PASS' : 'TEST ERRORS ' + errs;
}

function runShot() {
  var pose = qs.get('pose') || 'run';
  var secs = parseFloat(qs.get('shot') || '4');
  if (pose === 'pause') {
    reset(false); state = 'play';
    simulate(secs);
    paused = true;
    render();
    paused = false;
    return;
  }
  if (pose === 'title') {
    reset(true); state = 'title';
    simulate(secs);
  } else {
    reset(false); state = 'play';
    if (qs.get('tun')) tunnelNow = { x0: 320, x1: 2600 };
    if (pose === 'air') simulate(secs, { stopWhen: function () { return player.state === 'air' && player.flipT > 0.26; } });
    else if (pose === 'drop') simulate(secs, { stopWhen: function () { return player.state === 'drop' && player.vy > 18; } });
    else if (pose === 'fall') simulate(secs, { stopWhen: function () { return player.state === 'fall' && player.vy > 10; } });
    else if (pose === 'over') { simulate(secs); if (state === 'play') gameOver('street'); simulate(1.6); }
    else if (pose === 'land') simulate(secs, { stopWhen: function () { return player.state === 'land'; } });
    else if (pose === 'up') {
      var launched = false, done = false;
      simulate(secs, {
        onStep: function () {
          if (done) return;
          if (!launched && player.state === 'run' && player.lvl > 0) {
            var clear = true, i;
            for (i = 0; i < world.gaps.length; i++) { var d = world.gaps[i].x0 - player.x; if (d > 0 && d < 200) clear = false; }
            var sp = mainSpanAt(player.x);
            if (sp && sp.obs && sp.obs.x - player.x > -40 && sp.obs.x - player.x < 200) clear = false;
            if (clear && player.x > 200) {
              launched = true; player.jumpBuf = JBUF; ai.holdUntil = T + 0.42;
            }
          } else if (launched && player.state === 'land') {
            done = true;
          }
        },
        stopWhen: function () { return done; }
      });
      simulate(0.3);
    }
    else simulate(secs);
  }
  render();
  document.title = 'SHOT ' + pose + ' ' + secs + (RUNTIME_ERRORS.length || ART_ERRORS.length ? ' ERRS ' + (RUNTIME_ERRORS.length + ART_ERRORS.length) : ' OK');
}

function drawAudioReport(lines) {
  g.globalAlpha = 0.9;
  g.fillStyle = '#080611';
  g.fillRect(0, 0, W, H);
  g.globalAlpha = 1;
  drawText(g, 'AUDIO CHECK', 8, 8, '#ffe9a8', 2);
  for (var i = 0; i < lines.length; i++) drawText(g, lines[i].slice(0, 62), 8, 32 + i * 10, '#cfe0f0', 1);
  drawText(g, 'SFX CTX ' + (audio.ok() ? 'READY' : 'UNAVAILABLE'), 8, 32 + lines.length * 10 + 8, '#9fffa8', 1);
}

function runAudioCheck() {
  reset(false);
  state = 'play';
  audio.init();
  audio.resume();
  audio.musicStart();
  var l0 = 't0  ' + audio.bgmDebug();
  setTimeout(function () {
    var l1 = 't1  ' + audio.bgmDebug();
    audio.musicPause();
    var l2 = 'pause ' + audio.bgmDebug();
    audio.musicPlay();
    var l3 = 'resume ' + audio.bgmDebug();
    audio.musicStop();
    var l4 = 'stop ' + audio.bgmDebug();
    render();
    drawAudioReport([l0, l1, l2, l3, l4]);
    document.title = 'AUDIO CHECK';
  }, 1800);
}

function onKey(e, down) {
  var code = e.code;
  if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW' || code === 'KeyZ') {
    e.preventDefault();
    if (down) {
      input.jump = true; input.jumpHeld = true;
      if (state === 'title') startGame();
      else if (state === 'over' && overT > 0.6) startGame();
      else if (state === 'play') player.jumpBuf = JBUF;
    } else input.jumpHeld = false;
    return;
  }
  if (code === 'ArrowDown' || code === 'KeyS') {
    e.preventDefault();
    if (down) {
      input.down = true;
      if (state === 'play' && (player.state === 'run' || player.state === 'land')) doDrop();
      else if (state === 'play' && player.state === 'air' && player.vy > -30) player.vy += 90;
    } else input.downHeld = false;
    return;
  }
  if (!down) return;
  if (wardrobe && state === 'title') {
    if (code === 'Digit1') { equipOutfit(OUTFIT_IDS[0]); return; }
    if (code === 'Digit2') { equipOutfit(OUTFIT_IDS[1]); return; }
    if (code === 'Digit3') { equipOutfit(OUTFIT_IDS[2]); return; }
    if (code === 'KeyC' || code === 'Escape') { wardrobe = false; audio.ui(); return; }
    return;
  }
  if (code === 'KeyM') { audio.init(); audio.toggleMute(); }
  if (code === 'KeyV' && state === 'title') {
    var idx = THEME_IDS.indexOf(scenery);
    scenery = THEME_IDS[(idx + 1) % THEME_IDS.length];
    city = buildCity(20240, scenery);
    lsSet('lj_scenery', scenery);
    audio.ui();
    return;
  }
  if (code === 'KeyC' && state === 'title') { wardrobe = !wardrobe; audio.ui(); return; }
  if (code === 'KeyR') startGame();
  if (code === 'Escape' || code === 'KeyP') {
    if (state === 'play') {
      paused = !paused;
      if (paused) audio.musicPause(); else audio.musicPlay();
    }
  }
}
document.addEventListener('keydown', function (e) { if (e.repeat) { if (e.code === 'Space' || e.code.indexOf('Arrow') === 0) e.preventDefault(); return; } onKey(e, true); });
document.addEventListener('keyup', function (e) { onKey(e, false); });
cv.addEventListener('pointerdown', function (e) {
  e.preventDefault();
  audio.init(); audio.resume();
  if (state === 'title' || (state === 'over' && overT > 0.6)) { startGame(); return; }
  var r = cv.getBoundingClientRect();
  var y = (e.clientY - r.top) / r.height;
  if (y < 0.62) { input.jump = true; input.jumpHeld = true; if (state === 'play') player.jumpBuf = JBUF; }
  else { input.down = true; if (state === 'play' && (player.state === 'run' || player.state === 'land')) doDrop(); }
});
cv.addEventListener('pointerup', function () { input.jumpHeld = false; });
document.addEventListener('visibilitychange', function () { if (document.hidden && state === 'play') { paused = true; audio.musicPause(); } });
window.addEventListener('blur', function () { if (state === 'play') { paused = true; audio.musicPause(); } });

best = loadBest();
if (MODE === 'audio') {
  runAudioCheck();
} else if (MODE === 'sheet') {
  reset(false);
  runSheet();
  document.title = 'SHEET';
} else if (qs.get('play')) {
  reset(false);
  state = 'play';
  if (qs.get('tun')) tunnelNow = { x0: 320, x1: 2200 };
  requestAnimationFrame(frame);
} else if (MODE === 'shot') {
  runShot();
} else if (MODE === 'test') {
  runSelfTest();
} else {
  reset(false);
  state = 'title';
  requestAnimationFrame(frame);
}

