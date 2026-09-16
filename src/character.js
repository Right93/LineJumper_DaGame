/* LINE JUMPER - character
   Outfit palettes, the composed sprite rig (BODY + LEG_SHAPES + RUN_LEGS),
   flip tuck, landing recovery, coat-tail physics and all player rendering. */

var PP = {
  'K': '#15101c', 'H': '#2a2433', 'h': '#3f3849',
  'R': '#a83e4f', 'r': '#7d2c3a',
  'C': '#f0e0bd', 'c': '#d8c296', 'd': '#b0976c',
  'S': '#e8b48c', 's': '#c68f66', 'E': '#221a28',
  'P': '#3a3854', 'p': '#26243a', 'B': '#141220',
  'W': '#6f4a2c', 'Q': '#a87c46', 'T': '#e6dcc8'
};

var BODY = [
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

function composeRun() {
  var out = [];
  for (var i = 0; i < RUN_LEGS.length; i++) {
    out.push(BODY.concat(mergeRows(LEG_SHAPES[RUN_LEGS[i][0]], LEG_SHAPES[RUN_LEGS[i][1]])));
  }
  return out;
}

function buildArt() {
  var art = {};
  var frames = composeRun();
  art.run = [];
  for (var f = 0; f < frames.length; f++) art.run.push(compile(frames[f], PP));
  art.recover = [compile(RECOVER0, PP), compile(RECOVER1, PP), compile(RECOVER2, PP)];
  art.tuck = [];
  for (var i = 0; i < 12; i++) art.tuck.push(rotateSprite(compile(TUCK, PP), i * 30));
  art.fall = [compile(FALL0, PP), compile(FALL1, PP)];
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
  return art;
}

