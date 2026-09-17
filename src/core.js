/* LINE JUMPER - core
   Shared constants, math/rng helpers, canvas primitives and the pixel font. */


'use strict';

var ART_ERRORS = [], RUNTIME_ERRORS = [];
window.onerror = function (msg, src, line, col) {
  RUNTIME_ERRORS.push(String(msg) + ' @' + line + ':' + col);
  return false;
};

var W = 384, H = 216;
var SW = 520, SH = 360, VOX = 68, VOY = 96;
var VH = 216;

function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function makeRng(seed) {
  var r = mulberry32(seed >>> 0);
  return {
    next: r,
    range: function (a, b) { return a + r() * (b - a); },
    int: function (a, b) { return Math.floor(a + r() * (b - a + 1)); },
    pick: function (arr) { return arr[Math.floor(r() * arr.length)]; },
    chance: function (p) { return r() < p; }
  };
}

function newCanvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function ctxOf(c) { var x = c.getContext('2d'); x.imageSmoothingEnabled = false; return x; }

function rect(g, x, y, w, h, col) {
  g.fillStyle = col;
  g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}
function pixel(g, x, y, col) { g.fillStyle = col; g.fillRect(x | 0, y | 0, 1, 1); }

function roundRectPath(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.lineTo(x + w - r, y);
  g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}

function lerpColor(a, b, t) {
  function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)]; }
  var A = hex(a), B = hex(b);
  return 'rgb(' + Math.round(lerp(A[0], B[0], t)) + ',' + Math.round(lerp(A[1], B[1], t)) + ',' + Math.round(lerp(A[2], B[2], t)) + ')';
}

var FONT = {
  'A': ['.##.', '#..#', '####', '#..#', '#..#'],
  'B': ['###.', '#..#', '###.', '#..#', '###.'],
  'C': ['.###', '#...', '#...', '#...', '.###'],
  'D': ['###.', '#..#', '#..#', '#..#', '###.'],
  'E': ['####', '#...', '###.', '#...', '####'],
  'F': ['####', '#...', '###.', '#...', '#...'],
  'G': ['.###', '#...', '#.##', '#..#', '.##.'],
  'H': ['#..#', '#..#', '####', '#..#', '#..#'],
  'I': ['###', '.#.', '.#.', '.#.', '###'],
  'J': ['..##', '...#', '...#', '#..#', '.##.'],
  'K': ['#..#', '#.#.', '##..', '#.#.', '#..#'],
  'L': ['#...', '#...', '#...', '#...', '####'],
  'M': ['#..#', '####', '####', '#..#', '#..#'],
  'N': ['#..#', '####', '####', '####', '#..#'],
  'O': ['.##.', '#..#', '#..#', '#..#', '.##.'],
  'P': ['###.', '#..#', '###.', '#...', '#...'],
  'Q': ['.##.', '#..#', '#..#', '#.##', '.###'],
  'R': ['###.', '#..#', '###.', '#.#.', '#..#'],
  'S': ['.###', '#...', '.##.', '...#', '###.'],
  'T': ['####', '.##.', '.##.', '.##.', '.##.'],
  'U': ['#..#', '#..#', '#..#', '#..#', '.##.'],
  'V': ['#..#', '#..#', '#..#', '.##.', '.##.'],
  'W': ['#..#', '#..#', '####', '####', '#..#'],
  'X': ['#..#', '#..#', '.##.', '#..#', '#..#'],
  'Y': ['#..#', '#..#', '.##.', '.##.', '.##.'],
  'Z': ['####', '..#.', '.##.', '#...', '####'],
  '0': ['####', '#..#', '#..#', '#..#', '####'],
  '1': ['.##.', '..#.', '..#.', '..#.', '####'],
  '2': ['###.', '...#', '.##.', '#...', '####'],
  '3': ['###.', '...#', '.##.', '...#', '###.'],
  '4': ['#..#', '#..#', '####', '...#', '...#'],
  '5': ['####', '#...', '###.', '...#', '###.'],
  '6': ['.###', '#...', '###.', '#..#', '.##.'],
  '7': ['####', '...#', '..#.', '.#..', '.#..'],
  '8': ['.##.', '#..#', '.##.', '#..#', '.##.'],
  '9': ['.##.', '#..#', '.###', '...#', '###.'],
  ' ': ['....', '....', '....', '....', '....'],
  '.': ['....', '....', '....', '....', '.#..'],
  ',': ['....', '....', '....', '.#..', '#...'],
  ':': ['....', '.#..', '....', '.#..', '....'],
  '-': ['....', '....', '####', '....', '....'],
  '+': ['....', '.#..', '###.', '.#..', '....'],
  '/': ['...#', '..#.', '.#..', '#...', '#...'],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '?': ['###.', '...#', '.##.', '....', '.##.'],
  '*': ['#.#', '.#.', '#.#', '...', '...'],
  '>': ['#...', '.#..', '..#.', '.#..', '#...'],
  '<': ['..#.', '.#..', '#...', '.#..', '..#.'],
  '(': ['..#', '.#.', '.#.', '.#.', '..#'],
  ')': ['#..', '.#.', '.#.', '.#.', '#..'],
  "'": ['.#.', '.#.', '...', '...', '...'],
  '%': ['#..#', '...#', '.##.', '#...', '#..#'],
  'x': ['....', '#..#', '.##.', '.##.', '#..#']
};

function glyphW(ch) { var gl = FONT[ch]; return gl ? gl[0].length : 4; }

function textW(str, scale, spacing) {
  scale = scale || 1; spacing = spacing === undefined ? 1 : spacing;
  var w = 0;
  for (var i = 0; i < str.length; i++) w += glyphW(str[i]) * scale + spacing * scale;
  return w - spacing * scale;
}

function drawText(g, str, x, y, col, scale, spacing) {
  scale = scale || 1; spacing = spacing === undefined ? 1 : spacing;
  str = String(str).toUpperCase();
  var cx = x;
  g.fillStyle = col;
  for (var i = 0; i < str.length; i++) {
    var gl = FONT[str[i]];
    if (gl) {
      for (var ry = 0; ry < gl.length; ry++) {
        var row = gl[ry];
        for (var rx = 0; rx < row.length; rx++) {
          if (row[rx] !== '.' && row[rx] !== ' ') g.fillRect(cx + rx * scale, y + ry * scale, scale, scale);
        }
      }
      cx += (glyphW(str[i]) + spacing) * scale;
    } else cx += 4 * scale;
  }
  return cx;
}

function drawTextOutline(g, str, x, y, col, outline, scale, spacing) {
  spacing = spacing === undefined ? 1 : spacing;
  for (var dx = -1; dx <= 1; dx++)
    for (var dy = -1; dy <= 1; dy++)
      if (dx || dy) drawText(g, str, x + dx * scale, y + dy * scale, outline, scale, spacing);
  drawText(g, str, x, y, col, scale, spacing);
}

function drawTextCenter(g, str, cx, y, col, scale, spacing) {
  drawText(g, str, cx - textW(str, scale, spacing) / 2, y, col, scale, spacing);
}

function drawTextCenterOutline(g, str, cx, y, col, outline, scale, spacing) {
  drawTextOutline(g, str, cx - textW(str, scale, spacing) / 2, y, col, outline, scale, spacing);
}

