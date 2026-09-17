/* LINE JUMPER - character
   Outfit palettes, the composed sprite rig (BODY + LEG_SHAPES + RUN_LEGS),
   flip tuck, landing recovery, coat-tail physics and all player rendering. */

var LAND_T = 0.3, FLIP_T = 0.66;

var PP = {
  'A': '#15101c', 'K': '#15101c', 'H': '#2a2433', 'h': '#3f3849',
  'R': '#a83e4f', 'r': '#7d2c3a',
  'C': '#f0e0bd', 'c': '#d8c296', 'd': '#b0976c',
  'S': '#e8b48c', 's': '#c68f66', 'E': '#221a28',
  'P': '#3a3854', 'p': '#26243a', 'B': '#141220',
  'W': '#6f4a2c', 'Q': '#a87c46', 'T': '#e6dcc8'
};

var HATS = {
  bowler: [
    '....KKKK......',
    '....KHHK......',
    '....KHHK......',
    '..KKKKKKKK....'
  ],
  trilby: [
    '....KHHK......',
    '....KHHK......',
    '..KKKKKKKKKK..'
  ],
  flatcap: [
    '...KHHHK......',
    '..KHHHHHK.....',
    '..KKKKKKK.....'
  ]
};

/* Outfits are palette swaps plus a hat accessory on the same rig. No outfit
   gets its own animation frames: the legs, tuck, recovery and fall poses are
   shared and only HATS + the palette change. */
var OUTFITS = {
  detective: {
    name: 'DETECTIVE', price: 0, hat: 'bowler',
    pal: { 'A': '#15101c' }
  },
  nightwatch: {
    name: 'NIGHTWATCH', price: 300, hat: 'trilby',
    pal: {
      'A': '#7fd4d8', 'H': '#4a2230', 'h': '#6b3242',
      'C': '#cdd6e4', 'c': '#a9b4c6', 'd': '#828da2',
      'P': '#2a2c3a', 'p': '#1d1f28', 'W': '#33333d', 'Q': '#5f5f70'
    }
  },
  verdant: {
    name: 'VERDANT', price: 750, hat: 'flatcap',
    pal: {
      'A': '#d8a03c', 'H': '#4a3524', 'h': '#6b503a',
      'C': '#8d9a62', 'c': '#717d50', 'd': '#58623d',
      'P': '#3a3a2c', 'p': '#28281e', 'W': '#5a4030', 'Q': '#8a6a44'
    }
  }
};
var OUTFIT_IDS = ['detective', 'nightwatch', 'verdant'];

var BODY_REST = [
  '....KSsSK.....',
  '....KSsEK.....',
  '.....KSK......',
  '....AAAA......',
  '...KcCdCK.....',
  '...KcCdCK.....',
  '...KcCdCKK....',
  '...KcCdCKcK...',
  '...KcCdCKcK...',
  '..cKcCdCKcK...',
  '..cKcCdCKcK...',
  '.ccKcCdCKSK...',
  '.ccKcCdCK.....',
  '..cKcCdCK.....',
  '...KcCdCK.....',
  '...KdcdcK.....',
  '...KPPPPK.....',
  '....KPPPK.....'
];

var LEG_SHAPES = {
  plantF: [
    '.....KPPK.....',
    '.....KPPK.....',
    '......KPPK....',
    '......KPPK....',
    '......KPPK....',
    '......KPPK....',
    '......KBBK....',
    '......KBBK....'
  ],
  plant: [
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KBBK.....',
    '.....KBBK.....'
  ],
  plantB: [
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '....KPPK......',
    '....KPPK......',
    '....KPPK......',
    '....KBBK......',
    '....KBBK......'
  ],
  toe: [
    '.....KPPK.....',
    '.....KPPK.....',
    '....KPPK......',
    '....KPPK......',
    '...KPPK.......',
    '...KPPK.......',
    '..KBBK........',
    '...KK.........'
  ],
  lift: [
    '.....KPPK.....',
    '.....KPPK.....',
    '....KPPK......',
    '...KPPK.......',
    '...KBBK.......',
    '..............',
    '..............',
    '..............'
  ],
  pass: [
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KBBK.....',
    '..............',
    '..............'
  ],
  reach: [
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '......KPPK....',
    '......KBBK....',
    '..............',
    '..............'
  ],
  reachLo: [
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '.....KPPK.....',
    '......KPPK....',
    '......KPPK....',
    '......KBBK....',
    '..............'
  ]
};

var RUN_LEGS = [
  ['lift', 'plantF'],
  ['pass', 'plant'],
  ['reach', 'plantB'],
  ['reachLo', 'toe'],
  ['plantF', 'lift'],
  ['plant', 'pass'],
  ['plantB', 'reach'],
  ['toe', 'reachLo']
];

var TUCK = [
'..KKKK....',
'..KHHK....',
'.KKKKKK...',
'..KSsK....',
'..KsEK....',
'..KKKK....',
'.KCCCK....',
'.KCcdK....',
'KCcCdCKK..',
'KcCCcdK...',
'.KCCCCK...',
'.KPPPPK...',
'KPPKBBK...',
'.KKK.KK...'
];

var RECOVER0 = [
'....KKKK......',
'....KHHK......',
'..KKKKKKKK....',
'....KSsSK.....',
'....KSsEK.....',
'....KKKK......',
'...KcCdCK.....',
'cccKcCdCKK....',
'ccKcCdCKSK....',
'.ccKcCdCK.....',
'..cKcCdCK.....',
'...KdcdcK.....',
'...KPPPPK.....',
'..KPPKKPPK....',
'..KPPK..KPPK..',
'..KPPK..KPPK..',
'..KBBK..KBBK..'
];

var RECOVER1 = [
'....KKKK......',
'....KHHK......',
'....KHHK......',
'..KKKKKKKK....',
'....KSsSK.....',
'....KSsEK.....',
'.....KSK......',
'....KKKK......',
'...KcCdCK.....',
'..cKcCdCKK....',
'.ccKcCdCKSK...',
'..cKcCdCK.....',
'...KcCdCK.....',
'...KcCdCK.....',
'...KdcdcK.....',
'...KPPPPK.....',
'...KPPKKPPK...',
'..KPPK.KPPK...',
'..KPPK..KPPK..',
'..KBBK..KBBK..'
];

var RECOVER2 = [
'....KKKK......',
'....KHHK......',
'....KHHK......',
'..KKKKKKKK....',
'....KSsSK.....',
'....KSsEK.....',
'.....KSK......',
'....KKKK......',
'...KcCdCK.....',
'...KcCdCK.....',
'...KcCdCKK....',
'...KcCdCKcK...',
'..cKcCdCKcK...',
'..cKcCdCKSK...',
'.ccKcCdCK.....',
'.ccKcCdCK.....',
'..cKcCdCK.....',
'...KcCdCK.....',
'...KdcdcK.....',
'...KPPPPK.....',
'....KPPPKK....',
'....KPPK.KPPK.',
'....KPPK..KBBK',
'...KBBK.......'
];

var FALL0 = [
'....KKKK......',
'....KHHK......',
'....KHHK......',
'..KKKKKKKK....',
'....KSsSK.....',
'....KSsEK.....',
'.....KSK......',
'....KKKK......',
'..cKcCdCK.....',
'.ccKcCdCKK....',
'.ccKcCdCKcK...',
'.cKcCdCKSK....',
'..cKcCdCK.....',
'..cKcCdCK.....',
'...KcCdCK.....',
'...KcCdCK.....',
'...KdcdcK.....',
'...KPPPPK.....',
'....KPPKK.....',
'....KPPKPK....',
'....KPPK.KPK..',
'....KPPK.KPK..',
'....KBBK.KBBK.'
];

var FALL1 = [
'....KKKK......',
'....KHHK......',
'....KHHK......',
'..KKKKKKKK....',
'....KSsSK.....',
'....KSsEK.....',
'.....KSK......',
'....KKKK......',
'...KcCdCK.....',
'..cKcCdCKK....',
'.ccKcCdCKcK...',
'.ccKcCdCKSK...',
'..cKcCdCK.....',
'..cKcCdCK.....',
'...KcCdCK.....',
'...KcCdCK.....',
'...KdcdcK.....',
'...KPPPPK.....',
'....KPPKK.....',
'....KPPKPK....',
'....KPPK.KPK..',
'...KPPK..KBBK.',
'...KBBK.......'
];

function compile(rows, pal) {
  var w = 0, h = rows.length, i;
  for (i = 0; i < h; i++) if (rows[i].length > w) w = rows[i].length;
  var c = newCanvas(w, h), g = ctxOf(c);
  for (var y = 0; y < h; y++) {
    var row = rows[y];
    for (var x = 0; x < row.length; x++) {
      var col = pal[row[x]];
      if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
    }
  }
  return { c: c, w: w, h: h };
}

function blit(g, s, x, y, flip, alpha) {
  x = Math.round(x); y = Math.round(y);
  var a = alpha === undefined ? 1 : alpha;
  if (a !== 1) g.globalAlpha = a;
  if (flip) {
    g.save(); g.translate(x + s.w, y); g.scale(-1, 1); g.drawImage(s.c, 0, 0); g.restore();
  } else g.drawImage(s.c, x, y);
  if (a !== 1) g.globalAlpha = 1;
}

function rotateSprite(s, deg, pad) {
  var d = Math.ceil(Math.sqrt(s.w * s.w + s.h * s.h)) + (pad === undefined ? 2 : pad);
  var c = newCanvas(d, d), g = ctxOf(c);
  g.translate(d / 2, d / 2);
  g.rotate(deg * Math.PI / 180);
  g.drawImage(s.c, -Math.round(s.w / 2), -Math.round(s.h / 2));
  return { c: c, w: d, h: d };
}

function mergeRows(a, b) {
  var out = [], i, x, ra, rb, ca, cb, s, w;
  for (i = 0; i < a.length; i++) {
    ra = a[i]; rb = b[i] || '';
    w = Math.max(ra.length, rb.length);
    s = '';
    for (x = 0; x < w; x++) {
      ca = x < ra.length ? ra[x] : '.';
      cb = x < rb.length ? rb[x] : '.';
      s += (cb !== '.' ? cb : ca);
    }
    out.push(s);
  }
  return out;
}

function composeRun(body) {
  var out = [];
  for (var i = 0; i < RUN_LEGS.length; i++) {
    out.push(body.concat(mergeRows(LEG_SHAPES[RUN_LEGS[i][0]], LEG_SHAPES[RUN_LEGS[i][1]])));
  }
  return out;
}

function outfitPalette(id) {
  var of = OUTFITS[id] || OUTFITS.detective;
  var pal = {};
  for (var k in PP) pal[k] = PP[k];
  if (of.pal) for (var k2 in of.pal) pal[k2] = of.pal[k2];
  return pal;
}

var artCache = {};

function buildArt(outfitId) {
  if (!OUTFITS[outfitId]) outfitId = 'detective';
  if (artCache[outfitId]) return artCache[outfitId];
  var pal = outfitPalette(outfitId);
  var BODY = HATS[OUTFITS[outfitId].hat].concat(BODY_REST);
  var art = {};
  var frames = composeRun(BODY);
  art.run = [];
  for (var f = 0; f < frames.length; f++) art.run.push(compile(frames[f], pal));
  art.idle = compile(BODY.concat(mergeRows(LEG_SHAPES.plant, LEG_SHAPES.plant)), pal);
  art.recover = [compile(RECOVER0, pal), compile(RECOVER1, pal), compile(RECOVER2, pal)];
  art.tuck = [];
  for (var i = 0; i < 12; i++) art.tuck.push(rotateSprite(compile(TUCK, pal), i * 30));
  art.fall = [compile(FALL0, pal), compile(FALL1, pal)];
  art.branch = compile([
    '..K....KK.',
    '.KbK..KbK.',
    'KbbK.KbK..',
    '.KbKKbbK..',
    '..KbbbbK..',
    '...KKKK...'
  ], { 'K': '#1b1420', 'b': '#54402f' });
  art.drum = compile([
    '.KKKKKKK.',
    'KgggggggK',
    'KgGgGgGgK',
    'KgggggggK',
    'KgggggggK',
    'KGGGGGGGK',
    'KgggggggK',
    '.KKKKKKK.',
    '..KKKKK..'
  ], { 'K': '#161220', 'g': '#464654', 'G': '#646478' });
  art.spark = compile(['.W.', 'WOW', '.W.'], { 'W': '#8ff0ff', 'O': '#ffffff' });
  art.crowSit = compile(['.KK..', 'KKKK.', 'KKKKK', '.KeK.'], { 'K': '#191420', 'e': '#ff6a4a' });
  art.crowFly0 = compile(['K...K', 'KK.KK', '.KKK.', '.KeK.'], { 'K': '#191420', 'e': '#ff6a4a' });
  art.crowFly1 = compile(['.KKK.', 'KKKKK', '.KeK.', '.....'], { 'K': '#191420', 'e': '#ff6a4a' });
  art.shoes = compile(['..K..', '..K..', '..K..', '.K.K.', '.KKK.', '.K.K.'], { 'K': '#221a26' });
  artCache[outfitId] = art;
  return art;
}

/* ---- player rendering (same code paths the game and the preview use) ---- */

function drawPlayer() {
  var p = player;
  var sx = p.x - cam.x + cam.sway;
  var alpha = p.inv > 0 ? 0.5 : 1;
  if (p.state === 'run' || p.state === 'land') {
    var afps = clamp(p.speed / 6.6, 11, 17);
    var land = p.state === 'land';
    var f, spr;
    if (land) {
      f = Math.min(2, Math.floor((LAND_T - p.landT) / (LAND_T / 3)));
      spr = art.recover[f];
    } else {
      f = Math.floor(p.animT * afps) % 8;
      spr = art.run[f];
    }
    var bob = land ? 0 : [0, 1, 0, -1][f % 4];
    var top = p.y + cam.sy + bob - (spr.h - 1);
    blit(g, spr, sx - 7, top, false, alpha);
    var swing = land ? -0.08 : Math.sin(p.animT * afps * 0.5) * 0.16;
    drawCane(sx + 3, top + (land ? 12 : 16), 0.42 + swing, alpha);
  } else if (p.state === 'air') {
    var prog = clamp(p.flipT / FLIP_T, 0, 1);
    var rot = prog * prog * (3 - 2 * prog) * 360;
    var idx = Math.floor(rot / 30) % 12;
    var ts = art.tuck[idx];
    var cx2 = sx, cy2 = p.y + cam.sy - 16;
    g.globalAlpha = alpha;
    blit(g, ts, cx2 - ts.w / 2, cy2 - ts.h / 2);
    g.globalAlpha = 1;
    var ang = rot * Math.PI / 180;
    var ox = 4, oy = -5;
    var hx = cx2 + ox * Math.cos(ang) - oy * Math.sin(ang);
    var hy = cy2 + ox * Math.sin(ang) + oy * Math.cos(ang);
    drawCane(hx, hy, ang + 0.9, alpha);
    g.globalAlpha = 0.16;
    g.fillStyle = '#dfe8f5';
    for (var w = 0; w < 3; w++) g.fillRect(Math.round(sx - 14 - w * 7), Math.round(p.y - 10 - w * 3), 5, 1);
    g.globalAlpha = 1;
  } else if (p.state === 'drop' || p.state === 'fall') {
    var fs = Math.floor(p.animT * 9) % 2;
    var fspr = art.fall[fs];
    blit(g, fspr, sx - 7, p.y + cam.sy - (fspr.h - 1), false, alpha);
    drawCane(sx + 4, p.y + cam.sy - 15, 2.1, alpha);
  } else if (p.state === 'dead') {
    var idx2 = Math.floor(p.deadT * 9) % 12;
    var ts2 = art.tuck[idx2];
    blit(g, ts2, sx - ts2.w / 2, p.y + cam.sy - 16 - ts2.h / 2, false, Math.max(0, 1 - p.deadT * 0.5));
  }
}

function drawCane(x, y, theta, alpha) {
  g.globalAlpha = alpha === undefined ? 1 : alpha;
  var dx = Math.sin(theta), dy = Math.cos(theta);
  for (var i = 0; i < 8; i++) {
    g.fillStyle = i < 6 ? '#7c5230' : '#b8863f';
    g.fillRect(Math.round(x + dx * i), Math.round(y + dy * i), 1, 1);
  }
  g.fillStyle = '#efe6d8';
  g.fillRect(Math.round(x), Math.round(y), 1, 1);
  g.globalAlpha = 1;
}

function blitScaled(s, x, y, k, flip) {
  if (flip) { g.save(); g.translate(x + s.w * k, y); g.scale(-1, 1); g.drawImage(s.c, 0, 0, s.w * k, s.h * k); g.restore(); }
  else g.drawImage(s.c, Math.round(x), Math.round(y), s.w * k, s.h * k);
}

function runSheet() {
  g.fillStyle = '#161122';
  g.fillRect(0, 0, W, H);
  var i, s, k = 2;
  for (i = 0; i < 8; i++) {
    var row = i < 4 ? 0 : 1;
    var col = i % 4;
    var x = 8 + col * 94, footY = 78 + row * 72;
    s = art.run[i];
    var top = footY - (s.h - 1) * k;
    blitScaled(s, x, top, k, false);
    drawCane(x + 10 * k, top + 16 * k, 0.42, 1);
    rect(g, x, footY + 2, 60, 1, '#3a3450');
    drawText(g, 'F' + i + ' BOB' + ([0, 1, 0, -1][i % 4]), x, footY + 5, '#9fb6d8', 1);
  }
  drawText(g, 'RECOVER 1X', 6, 163, '#ffe9a8', 1);
  var ry = 208;
  for (i = 0; i < 3; i++) { s = art.recover[i]; blit(g, s, 8 + i * 26, ry - (s.h - 1), false); }
  drawText(g, 'IMPACT CROUCH RISE', 6, 210, '#9fb6d8', 1);
  drawText(g, 'FALL 1X', 92, 163, '#ffe9a8', 1);
  for (i = 0; i < 2; i++) { s = art.fall[i]; blit(g, s, 92 + i * 22, ry - (s.h - 1), false); }
  drawText(g, 'FLIP 1X', 148, 163, '#ffe9a8', 1);
  for (i = 0; i < 6; i++) { s = art.tuck[i * 2]; blit(g, s, 148 + i * 20, ry - s.h + 8, false); }
}
