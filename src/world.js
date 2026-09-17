/* LINE JUMPER - world
   Scenery themes, parallax tile builders (sky/city/street/tunnel) and the
   train window frame + glass dressing. */

var SKY_STOPS = [
  [0.00, '#0a0817'], [0.30, '#191130'], [0.50, '#2b1640'], [0.62, '#4b2044'],
  [0.72, '#7a3543'], [0.80, '#a95243'], [0.855, '#cf7a4c'], [0.90, '#7c4038'],
  [0.95, '#33202e'], [1.00, '#161020']
];

function skyColorAt(t) {
  for (var i = 0; i < SKY_STOPS.length - 1; i++) {
    var a = SKY_STOPS[i], b = SKY_STOPS[i + 1];
    if (t >= a[0] && t <= b[0]) return lerpColor(a[1], b[1], (t - a[0]) / (b[0] - a[0]));
  }
  return SKY_STOPS[SKY_STOPS.length - 1][1];
}

function buildSky(rng) {
  var c = newCanvas(W, H), g = ctxOf(c);
  for (var y = 0; y < H; y++) {
    g.fillStyle = skyColorAt(y / H);
    g.fillRect(0, y, W, 1);
  }
  for (var y2 = 0; y2 < H; y2 += 8) {
    var col = skyColorAt(y2 / H);
    g.fillStyle = col;
    g.globalAlpha = 0.5;
    for (var x = 0; x < W; x++) if ((x + y2) % 2 === 0) g.fillRect(x, y2, 1, 1);
    g.globalAlpha = 1;
  }
  for (var st = 0; st < 46; st++) {
    var sx2 = rng.int(0, W), sy2 = rng.int(4, 108);
    g.globalAlpha = 0.18 + rng.next() * 0.5;
    g.fillStyle = rng.chance(0.7) ? '#dfe4ff' : '#ffd9c0';
    g.fillRect(sx2, sy2, 1, 1);
    g.globalAlpha = 1;
  }
  var mx = 306, my = 52;
  for (var mi = 4; mi >= 1; mi--) {
    g.globalAlpha = 0.035 * mi;
    g.fillStyle = '#cfd8f0';
    g.beginPath(); g.arc(mx, my, 9 + mi * 4, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
  g.fillStyle = '#d8d3c4';
  g.beginPath(); g.arc(mx, my, 10, 0, 7); g.fill();
  g.fillStyle = '#efe9da';
  g.beginPath(); g.arc(mx - 1, my - 1, 9, 0, 7); g.fill();
  g.fillStyle = '#c9c2b0';
  g.fillRect(mx - 5, my - 3, 3, 2);
  g.fillRect(mx + 1, my + 2, 4, 3);
  g.fillRect(mx - 2, my + 5, 3, 2);
  g.fillRect(mx + 4, my - 4, 2, 2);
  g.globalAlpha = 0.35;
  g.fillStyle = '#2a1a38';
  g.fillRect(mx - 12, my + 5, 26, 2);
  g.fillRect(mx - 4, my - 9, 20, 1);
  g.globalAlpha = 1;
  var sunX = 92, sunY = 152;
  for (var i = 3; i >= 1; i--) {
    g.globalAlpha = 0.045 * i;
    g.fillStyle = '#ff9a5c';
    g.beginPath(); g.arc(sunX, sunY, 13 * (0.55 + i * 0.35), 0, 7); g.fill();
  }
  g.globalAlpha = 1;
  g.fillStyle = '#e8a062';
  g.beginPath(); g.arc(sunX, sunY, 13, 0, 7); g.fill();
  g.fillStyle = '#f2bb84';
  g.beginPath(); g.arc(sunX, sunY, 9, 0, 7); g.fill();
  for (var s = 0; s < 6; s++) {
    var cy = rng.int(36, 132), cx = rng.int(0, W), cw = rng.int(40, 130);
    g.globalAlpha = 0.16;
    g.fillStyle = rng.chance(0.5) ? '#241636' : '#3a1e42';
    g.fillRect(cx, cy, cw, 2);
    g.fillRect(cx + rng.int(0, 20), cy + 2, Math.max(4, cw - 12), 1);
    g.globalAlpha = 1;
  }
  return c;
}

function buildFar(rng) {
  var TW = 1536, c = newCanvas(TW, H), g = ctxOf(c);
  var x = 0;
  while (x < TW) {
    var bw = rng.int(24, 62), bh = rng.int(16, 56);
    var top = 168 - bh;
    var base = rng.pick(['#1c1429', '#211734', '#181125', '#241a37', '#1e1630']);
    var grd = g.createLinearGradient(0, top, 0, 171);
    grd.addColorStop(0, base);
    grd.addColorStop(1, lerpColor(base, '#312044', 0.4));
    g.fillStyle = grd;
    g.fillRect(x, top, bw, bh);
    g.fillStyle = lerpColor(base, '#5c4270', 0.45);
    g.fillRect(x, top, bw, 1);
    for (var gy = top + 4; gy < 164; gy += 6) {
      for (var gx = x + 3; gx < x + bw - 2; gx += 5) {
        if (rng.chance(0.14)) {
          g.globalAlpha = 0.3 + rng.next() * 0.45;
          g.fillStyle = rng.chance(0.72) ? '#ffce8c' : '#8fe0f0';
          g.fillRect(gx, gy, 1, 2);
          g.globalAlpha = 1;
        }
      }
    }
    if (rng.chance(0.45)) {
      var tw = rng.int(4, 7);
      var tx = x + rng.int(1, Math.max(1, bw - tw - 1));
      g.fillStyle = base; g.fillRect(tx, top - 7, tw, 5);
      g.fillStyle = '#160f22'; g.fillRect(tx, top - 3, tw, 3);
    }
    if (rng.chance(0.55)) {
      var ax = x + rng.int(2, Math.max(2, bw - 3)), ah = rng.int(6, 20);
      g.fillStyle = '#160f22'; g.fillRect(ax, top - ah, 1, ah);
      g.fillStyle = '#ff5a4a'; g.fillRect(ax, top - ah - 1, 1, 1);
      if (rng.chance(0.4)) { g.fillRect(ax, top - ah + 6, 5, 1); }
    }
    if (rng.chance(0.2)) {
      g.fillStyle = '#33204a'; g.fillRect(x + 2, top + 6, Math.max(4, bw - 4), 9);
      g.globalAlpha = 0.75; g.fillStyle = rng.pick(['#ff4f9a', '#39c8e8', '#ffb545']); g.fillRect(x + 4, top + 8, Math.max(2, bw - 8), 5);
      g.globalAlpha = 1;
    }
    x += bw + rng.int(0, 6);
  }
  var deck = 150;
  g.fillStyle = '#1b1329';
  g.fillRect(0, deck, TW, 4);
  g.fillStyle = '#120d1e';
  g.fillRect(0, deck + 4, TW, 2);
  for (var cx = 10; cx < TW; cx += rng.int(70, 130)) {
    g.fillStyle = '#150f22';
    g.fillRect(cx, deck + 6, 3, 168 - deck);
    g.fillRect(cx, deck + 14, 9, 1);
  }
  var tx2 = rng.int(40, TW - 260);
  var tlen = rng.int(120, 240);
  g.fillStyle = '#160f24';
  g.fillRect(tx2, deck - 9, tlen, 9);
  g.fillStyle = '#0f0a1a';
  g.fillRect(tx2 + 4, deck - 11, tlen - 8, 2);
  for (var wx = tx2 + 6; wx < tx2 + tlen - 6; wx += 7) {
    g.globalAlpha = 0.55 + rng.next() * 0.3;
    g.fillStyle = '#ffd9a0';
    g.fillRect(wx, deck - 6, 4, 3);
    g.globalAlpha = 1;
  }
  g.fillStyle = '#231a36';
  g.fillRect(0, 168, TW, 3);
  for (var lx = 0; lx < TW; lx += 3) {
    if (rng.chance(0.55)) {
      g.fillStyle = rng.chance(0.6) ? '#ffd9a0' : '#ff8a6a';
      g.globalAlpha = 0.7;
      g.fillRect(lx, 169, 1, 1);
      g.globalAlpha = 1;
    }
  }
  for (var hx = 0; hx < TW; hx += 4) {
    g.globalAlpha = 0.04;
    g.fillStyle = '#ff9a5a';
    g.fillRect(hx, 171, 2, 4);
    g.globalAlpha = 1;
  }
  return c;
}

function neon(g, x, y, w, h, col, rng) {
  g.globalAlpha = 0.07; g.fillStyle = col; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  g.globalAlpha = 0.12; g.fillRect(x - 2, y - 2, w + 4, h + 4);
  g.globalAlpha = 0.22; g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.globalAlpha = 1;
  g.fillStyle = col; g.fillRect(x, y, w, h);
  var n = Math.max(2, Math.floor(h / 7));
  for (var i = 0; i < n; i++) {
    g.fillStyle = '#fff6e6';
    g.globalAlpha = 0.85;
    g.fillRect(x + 1 + rng.int(0, Math.max(0, w - 2)), y + 2 + i * Math.floor(h / n), 1, 1);
    g.globalAlpha = 1;
  }
}

function buildMid(rng) {
  var TW = 1152, c = newCanvas(TW, H), g = ctxOf(c);
  var vents = [];
  var tops = [];
  var x = 0;
  while (x < TW) {
    var bw = rng.int(28, 68), bh = rng.int(26, 76);
    var top = 194 - bh;
    var base = rng.pick(['#120c1e', '#0f0a1a', '#151022', '#100b1c']);
    g.fillStyle = base;
    g.fillRect(x, top, bw, bh + 6);
    g.fillStyle = lerpColor(base, '#5c3f70', 0.7);
    g.fillRect(x, top, bw, 1);
    g.fillStyle = '#060409';
    g.fillRect(x + bw - 1, top, 1, bh + 6);
    for (var gy = top + 4; gy < 190; gy += 5) {
      for (var gx = x + 2; gx < x + bw - 3; gx += 4) {
        if (rng.chance(0.1)) {
          g.globalAlpha = 0.3 + rng.next() * 0.5;
          g.fillStyle = rng.chance(0.7) ? '#e8b06a' : '#6fd2e8';
          g.fillRect(gx, gy, 2, 2);
          g.globalAlpha = 1;
        }
      }
    }
    if (rng.chance(0.4)) {
      var rw = rng.int(6, Math.max(6, Math.min(16, bw - 4)));
      var rx2 = x + rng.int(1, Math.max(1, bw - rw - 1));
      g.fillStyle = '#1b1428'; g.fillRect(rx2, top - 3, rw, 3);
      g.fillStyle = '#2c2140'; g.fillRect(rx2, top - 3, rw, 1);
      if (rng.chance(0.5)) { g.fillStyle = '#1b1428'; g.fillRect(rx2 + 2, top - 8, rw - 4, 5); }
    }
    if (rng.chance(0.35)) {
      var ax2 = x + rng.int(2, Math.max(2, bw - 3)), ah2 = rng.int(6, 18);
      g.fillStyle = '#0a0712'; g.fillRect(ax2, top - ah2, 1, ah2);
      g.fillRect(ax2 - 2, top - ah2 + 5, 5, 1);
      if (rng.chance(0.3)) { g.fillStyle = '#ff5a4a'; g.fillRect(ax2, top - ah2 - 1, 1, 1); }
    }
    if (rng.chance(0.62)) {
      var sw = rng.int(3, 7);
      var sx = x + rng.int(1, Math.max(1, bw - sw - 1)), sy = top + rng.int(2, 12);
      var sh = Math.min(rng.int(14, 34), Math.max(9, top + bh - 10 - sy));
      if (sh >= 9) neon(g, sx, sy, sw, sh, rng.pick(['#ff2f7e', '#22d3ff', '#ffb545', '#ff5a3c', '#a05cff']), rng);
    }
    if (rng.chance(0.42)) {
      var hw = rng.int(12, Math.max(12, Math.min(34, bw))), hh = rng.int(4, 6);
      var hx = x + rng.int(1, Math.max(1, bw - hw - 1)), hy = top + rng.int(10, Math.max(11, bh - 12));
      neon(g, hx, hy, hw, hh, rng.pick(['#ff2f7e', '#22d3ff', '#ffb545', '#4de0a0']), rng);
    }
    if (rng.chance(0.32)) {
      g.fillStyle = '#1d1630';
      g.fillRect(x + 2, top + 4, 1, bh - 6);
      for (var py = top + 6; py < 190; py += 7) g.fillRect(x + 1, py, 3, 1);
    }
    if (rng.chance(0.3)) {
      var aw = rng.int(3, 5), ay = top + rng.int(6, 26);
      g.fillStyle = '#1d1630'; g.fillRect(x + Math.max(1, bw - 5), ay, aw, 4);
      g.fillRect(x + Math.max(1, bw - 5) + 1, ay + 4, aw - 2, 2);
    }
    if (rng.chance(0.28)) vents.push({ x: x + bw / 2, y: top + 2 });
    tops.push({ x: x, w: bw, y: top });
    x += bw + rng.int(2, 12);
  }
  for (var i = 0; i < 22; i++) {
    var a = tops[Math.floor(rng.next() * tops.length)];
    var b = tops[Math.floor(rng.next() * tops.length)];
    if (Math.abs(a.x - b.x) < 30) continue;
    var x1 = a.x + a.w, x2 = b.x;
    if (x2 < x1) continue;
    var ly = Math.min(a.y, b.y) + rng.int(6, 26);
    g.fillStyle = '#2a1e38';
    g.fillRect(x1, ly, x2 - x1, 1);
    for (var k = 0; k < 3; k++) {
      g.fillStyle = rng.pick(['#c94f6d', '#4fd0c9', '#e0c26a', '#7f9ad0']);
      g.fillRect(x1 + rng.int(2, Math.max(2, x2 - x1 - 4)), ly + 1, 2, 3);
    }
  }
  for (var tt = 0; tt < 26; tt++) {
    var lx = rng.int(20, TW - 20), ly2 = rng.int(120, 186), lw = rng.int(24, 70);
    g.fillStyle = '#241a34';
    g.fillRect(lx, ly2, lw, 1);
    var n = rng.int(2, 5);
    for (var k2 = 0; k2 < n; k2++) {
      g.fillStyle = rng.pick(['#c94f6d', '#4fd0c9', '#e0c26a', '#7f9ad0']);
      g.fillRect(lx + 3 + k2 * Math.floor(lw / (n + 1)) + rng.int(-1, 1), ly2 + 1, 2, 3);
    }
  }
  return { c: c, vents: vents };
}

function buildNear(rng) {
  var TW = 768, c = newCanvas(TW, H), g = ctxOf(c);
  var x = 0;
  while (x < TW) {
    var bw = rng.int(40, 120);
    var top = rng.int(150, 182);
    g.fillStyle = '#080611';
    g.fillRect(x, top, bw, H - top);
    g.fillStyle = '#0f0a1a';
    g.fillRect(x, top, bw, 2);
    if (rng.chance(0.5)) {
      g.fillStyle = '#05040b';
      for (var dx = 0; dx < bw; dx += 2) g.fillRect(x + dx, top - 1, 1, 1);
    }
    if (rng.chance(0.6)) {
      var ax = x + rng.int(4, Math.max(4, bw - 6)), ah = rng.int(6, 20);
      g.fillStyle = '#04030a';
      g.fillRect(ax, top - ah, 1, ah);
      g.fillRect(ax - 2, top - ah + 4, 5, 1);
    }
    if (rng.chance(0.45)) {
      var tw = rng.int(6, 12);
      g.fillStyle = '#04030a';
      g.fillRect(x + rng.int(2, Math.max(2, bw - tw - 2)), top - 7, tw, 7);
    }
    if (rng.chance(0.32)) {
      g.globalAlpha = 0.34;
      g.fillStyle = rng.chance(0.6) ? '#c46a3c' : '#4fa8c4';
      g.fillRect(x + rng.int(4, Math.max(4, bw - 6)), top + rng.int(6, 24), 2, 2);
      g.globalAlpha = 1;
    }
    if (rng.chance(0.22)) {
      g.fillStyle = '#1a1230';
      g.fillRect(x + rng.int(2, Math.max(2, bw - 10)), top + rng.int(10, 30), rng.int(4, 9), 1);
    }
    if (rng.chance(0.4)) {
      var px2 = x + rng.int(8, Math.max(8, bw - 8));
      g.fillStyle = '#04030a';
      g.fillRect(px2, top, 2, H - top);
      g.fillRect(px2 - 4, top + 12, 10, 1);
      g.fillRect(px2 - 4, top + 26, 10, 1);
    }
    x += bw + rng.int(0, 14);
  }
  return c;
}

function buildStreet(rng) {
  var TW = 768, hgt = 30, c = newCanvas(TW, hgt), g = ctxOf(c);
  g.fillStyle = '#0b0913'; g.fillRect(0, 0, TW, hgt);
  g.fillStyle = '#151022'; g.fillRect(0, 0, TW, 4);
  g.fillStyle = '#241a33'; g.fillRect(0, 3, TW, 1);
  g.fillStyle = '#0d0b16'; g.fillRect(0, 12, TW, hgt - 12);
  for (var x = 0; x < TW; x += 2) {
    if (rng.chance(0.35)) {
      g.globalAlpha = 0.10 + rng.next() * 0.16;
      g.fillStyle = rng.pick(['#ff3d8a', '#22d3ff', '#ffb545', '#ff6a4a']);
      g.fillRect(x, 14 + rng.int(0, 6), rng.int(3, 12), 1);
      g.globalAlpha = 1;
    }
  }
  for (var dx = 0; dx < TW; dx += 46) {
    g.fillStyle = '#232034';
    g.fillRect(dx + rng.int(0, 6), 22, 8, 1);
  }
  for (var s = 0; s < 12; s++) {
    g.globalAlpha = 0.5;
    g.fillStyle = '#221a2e';
    g.fillRect(rng.int(0, TW), 6, rng.int(2, 5), 1);
    g.globalAlpha = 1;
  }
  return c;
}

function buildTunnel(rng) {
  var TW = 768, c = newCanvas(TW, H), g = ctxOf(c);
  g.fillStyle = '#171320'; g.fillRect(0, 0, TW, H);
  for (var y = 10; y < H; y += 9) {
    g.fillStyle = '#0d0a14';
    g.fillRect(0, y, TW, 1);
    for (var x = 0; x < TW; x += 14) g.fillRect(x + ((y / 9) % 2 ? 0 : 7), y + 1, 1, 8);
  }
  for (var p = 0; p < TW; p += 190) {
    g.fillStyle = '#0f0c17';
    g.fillRect(p, 0, 10, H);
    g.fillStyle = '#221c2c';
    g.fillRect(p + 10, 0, 2, H);
    for (var b = 6; b < H; b += 16) {
      g.fillStyle = '#2a2334';
      g.fillRect(p + 3, b, 3, 3);
      g.fillStyle = '#100d18';
      g.fillRect(p + 3, b + 1, 3, 1);
    }
  }
  for (var i = 0; i < 90; i++) {
    g.globalAlpha = 0.28;
    g.fillStyle = rng.chance(0.5) ? '#221c2e' : '#0a0712';
    g.fillRect(rng.int(0, TW), rng.int(0, H), rng.int(2, 10), rng.int(1, 5));
    g.globalAlpha = 1;
  }
  for (var s = 0; s < 26; s++) {
    g.globalAlpha = 0.11;
    g.fillStyle = rng.pick(['#ff9a5a', '#4fd0c9', '#ff4f9a']);
    g.fillRect(rng.int(0, TW - 20), rng.int(30, H - 10), rng.int(2, 12), 1);
    g.globalAlpha = 1;
  }
  g.fillStyle = '#241d2c'; g.fillRect(0, 0, TW, 4);
  g.fillStyle = '#0e0b16'; g.fillRect(0, 4, TW, 3);
  return c;
}

function buildFrame(rng) {
  var c = newCanvas(W, H), g = ctxOf(c);
  var L = 20, T = 16, Rr = 20, Bo = 26;
  g.fillStyle = '#14101a'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#1c1722';
  g.fillRect(0, 0, W, 2); g.fillRect(0, 0, 2, H);
  g.fillStyle = '#0b080f';
  g.fillRect(0, H - 2, W, 2); g.fillRect(W - 2, 0, 2, H);
  for (var i = 0; i < 90; i++) {
    g.globalAlpha = 0.05 + rng.next() * 0.05;
    g.fillStyle = rng.chance(0.5) ? '#000000' : '#3a3040';
    var gx = rng.next() < 0.5 ? rng.int(0, L + 4) : rng.int(W - Rr - 4, W);
    g.fillRect(gx, rng.int(0, H), rng.int(2, 9), rng.int(1, 4));
    g.globalAlpha = 1;
  }
  g.save();
  g.globalCompositeOperation = 'destination-out';
  roundRectPath(g, L, T, W - L - Rr, H - T - Bo, 10);
  g.fill();
  g.restore();
  g.strokeStyle = '#2e2736';
  g.lineWidth = 1;
  roundRectPath(g, L - 0.5, T - 0.5, W - L - Rr + 1, H - T - Bo + 1, 10);
  g.stroke();
  g.strokeStyle = '#070509';
  roundRectPath(g, L + 1.5, T + 1.5, W - L - Rr - 3, H - T - Bo - 3, 9);
  g.stroke();
  var rivets = [];
  for (var rx = L + 12; rx < W - Rr - 6; rx += 46) { rivets.push([rx, 7]); rivets.push([rx + 22, H - 13]); }
  for (var ry = T + 14; ry < H - Bo - 6; ry += 46) { rivets.push([9, ry]); rivets.push([W - 10, ry + 20]); }
  for (var r = 0; r < rivets.length; r++) {
    g.fillStyle = '#0a0710'; g.fillRect(rivets[r][0], rivets[r][1], 3, 3);
    g.fillStyle = '#3d3348'; g.fillRect(rivets[r][0], rivets[r][1], 2, 1);
  }
  g.fillStyle = '#241d2b'; g.fillRect(L - 4, H - Bo + 4, W - L - Rr + 8, 5);
  g.fillStyle = '#3a3145'; g.fillRect(L - 4, H - Bo + 4, W - L - Rr + 8, 1);
  g.fillStyle = '#0e0a14'; g.fillRect(0, H - Bo + 9, W, H);
  var cx = 66, cy = H - Bo + 2;
  g.fillStyle = '#2a2028'; g.fillRect(cx, cy - 9, 9, 9);
  g.fillStyle = '#e6dcc8'; g.fillRect(cx + 1, cy - 8, 7, 8);
  g.fillStyle = '#c9bda4'; g.fillRect(cx + 1, cy - 8, 2, 8);
  g.fillStyle = '#a8503a'; g.fillRect(cx + 1, cy - 11, 7, 3);
  g.fillStyle = '#c26a4c'; g.fillRect(cx + 1, cy - 11, 7, 1);
  g.globalAlpha = 0.5;
  g.fillStyle = '#cbbfae';
  g.fillRect(cx + 3, cy - 13, 1, 2);
  g.fillRect(cx + 5, cy - 15, 1, 2);
  g.globalAlpha = 1;
  dressWindow(g, rng);
  return c;
}

function buildGlass(rng) {
  var c = newCanvas(W, H), g = ctxOf(c);
  g.save();
  roundRectPath(g, 20, 16, W - 40, H - 42, 10);
  g.clip();
  var grd = g.createRadialGradient(W / 2, H / 2 - 10, 40, W / 2, H / 2, 220);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(0.6, 'rgba(4,2,10,0.16)');
  grd.addColorStop(1, 'rgba(3,2,8,0.5)');
  g.fillStyle = grd;
  g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(150,180,220,0.05)';
  g.fillRect(0, 0, W, H);
  for (var i = 0; i < 90; i++) {
    g.globalAlpha = 0.03 + rng.next() * 0.08;
    g.fillStyle = rng.chance(0.7) ? '#dfe8f5' : '#0a0712';
    var x = rng.int(22, W - 22), y = rng.int(18, H - 30);
    if (rng.chance(0.75)) g.fillRect(x, y, 1, 1);
    else g.fillRect(x, y, rng.int(2, 6), 1);
    g.globalAlpha = 1;
  }
  for (var s = 0; s < 22; s++) {
    g.globalAlpha = 0.02 + rng.next() * 0.03;
    g.fillStyle = '#ffffff';
    g.fillRect(rng.int(20, W - 60), rng.int(16, H - 30), rng.int(10, 40), 1);
    g.globalAlpha = 1;
  }
  g.restore();
  return c;
}

/* ============================ scenery themes ============================
   Every scenery is a module of the same shape: sky / far / mid / near /
   ground tile builders plus a few flags. The render pipeline, the parallax
   draw and the wire/pole layout are shared - a scenery only swaps the asset
   set and the palette, never the gameplay geometry.

   Art direction for the newer sets: soft painterly colour grading, warm
   natural light, lush and slightly idealised - gentle gradients, rounded
   organic masses and haze between layers instead of hard neon edges. */

function gradRows(g, y0, y1, w, stops) {
  for (var y = y0; y < y1; y++) {
    var t = (y - y0) / Math.max(1, y1 - y0 - 1);
    g.fillStyle = skyColorAt2(stops, t);
    g.fillRect(0, y, w, 1);
  }
}

function skyColorAt2(stops, t) {
  for (var i = 0; i < stops.length - 1; i++) {
    var a = stops[i], b = stops[i + 1];
    if (t >= a[0] && t <= b[0]) return lerpColor(a[1], b[1], (t - a[0]) / Math.max(0.0001, b[0] - a[0]));
  }
  return stops[stops.length - 1][1];
}

function softGlow(g, x, y, r, col, aMax) {
  for (var i = 4; i >= 1; i--) {
    g.globalAlpha = aMax * (i / 4);
    g.fillStyle = col;
    g.beginPath(); g.arc(x, y, r * (0.35 + i * 0.2), 0, 7); g.fill();
  }
  g.globalAlpha = 1;
}

function blob(g, x, y, w, h, col) {
  g.fillStyle = col;
  g.beginPath();
  g.ellipse(x, y, w / 2, h / 2, 0, 0, 7);
  g.fill();
}

function hill(g, x, baseY, w, h, col) {
  g.fillStyle = col;
  g.beginPath();
  g.moveTo(x - w / 2, baseY);
  g.quadraticCurveTo(x - w * 0.22, baseY - h, x, baseY - h);
  g.quadraticCurveTo(x + w * 0.22, baseY - h, x + w / 2, baseY);
  g.closePath();
  g.fill();
}

function hazeBand(g, y0, y1, col, aTop, aBot) {
  var grd = g.createLinearGradient(0, y0, 0, y1);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(0.5, col);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = aTop;
  g.fillStyle = grd;
  g.fillRect(0, y0, 2048, y1 - y0);
  g.globalAlpha = 1;
}

/* ---------------- scenery 2: farmland at golden hour ---------------- */

var FIELD_STOPS = [
  [0.00, '#7ea6c8'], [0.22, '#a8c4d4'], [0.42, '#d8d8bc'],
  [0.60, '#f0d8a0'], [0.74, '#e8b878'], [0.86, '#d89858'], [1.00, '#b87840']
];

function buildFieldSky(rng) {
  var c = newCanvas(W, H), g = ctxOf(c);
  gradRows(g, 0, H, W, FIELD_STOPS);
  softGlow(g, 108, 150, 40, '#ffe0a8', 0.5);
  g.fillStyle = '#fff0c8';
  g.beginPath(); g.arc(108, 150, 14, 0, 7); g.fill();
  for (var i = 0; i < 7; i++) {
    var cx = rng.int(-20, W), cy = rng.int(24, 118), cw = rng.int(50, 150);
    g.globalAlpha = 0.5;
    blob(g, cx, cy, cw, 10, '#fff4dc');
    blob(g, cx + cw * 0.3, cy - 5, cw * 0.7, 9, '#ffeccc');
    g.globalAlpha = 1;
  }
  for (var b = 0; b < 9; b++) {
    var bx = rng.int(0, W), by = rng.int(30, 90), s = rng.int(2, 4);
    g.fillStyle = '#6a5a48';
    g.fillRect(bx, by, s, 1);
    g.fillRect(bx + s, by - 1, s, 1);
    g.fillRect(bx, by - 2, s, 1);
  }
  return c;
}

function buildFieldFar(rng) {
  var TW = 1536, c = newCanvas(TW, H), g = ctxOf(c);
  var i;
  for (i = 0; i < 22; i++) {
    var hx = rng.int(-40, TW), hw = rng.int(140, 380), hh = rng.int(26, 62);
    hill(g, hx, 172, hw, hh, '#9ab0a4');
  }
  hill(g, rng.int(200, TW - 200), 172, rng.int(300, 520), rng.int(60, 96), '#8aa2a0');
  for (i = 0; i < 40; i++) {
    var tx = rng.int(0, TW), ty = rng.int(140, 170);
    blob(g, tx, ty, rng.int(10, 22), rng.int(8, 14), rng.pick(['#7d9a86', '#6f8e7c', '#88a68e']));
  }
  hazeBand(g, 120, 178, 'rgba(240,220,180,0.55)', 1, 1);
  return c;
}

function buildFieldMid(rng) {
  var TW = 1152, c = newCanvas(TW, H), g = ctxOf(c);
  var vents = [];
  var i;
  for (i = 0; i < 7; i++) {
    var px0 = rng.int(0, TW), pw = rng.int(120, 260), ph = rng.int(18, 34);
    var y = 176 + rng.int(0, 10);
    for (var b = 0; b < 4; b++) {
      g.fillStyle = ['#c8b878', '#b8a868', '#a89858', '#98884c'][b];
      g.fillRect(px0, y + b * 4, pw, 4);
    }
    for (var ry = 0; ry < 3; ry++) {
      g.globalAlpha = 0.35;
      g.fillStyle = '#e0d090';
      g.fillRect(px0 + rng.int(0, 20), y + ry * 4 + 2, pw - rng.int(0, 40), 1);
      g.globalAlpha = 1;
    }
    if (ph > 24) {
      for (var cr = px0 + 10; cr < px0 + pw - 10; cr += 7) {
        g.fillStyle = '#8a9a50';
        g.fillRect(cr, y + rng.int(0, 10), 3, 2);
      }
    }
  }
  for (i = 0; i < 5; i++) {
    var fx = rng.int(40, TW - 80), fy = rng.int(150, 166);
    var fw = rng.int(26, 44), fh = rng.int(12, 18);
    g.fillStyle = '#e8dcc0';
    g.fillRect(fx, fy, fw, fh);
    g.fillStyle = '#c8b898';
    g.fillRect(fx, fy + fh - 3, fw, 3);
    g.fillStyle = '#5a5a68';
    g.beginPath();
    g.moveTo(fx - 3, fy);
    g.lineTo(fx + fw / 2, fy - rng.int(6, 11));
    g.lineTo(fx + fw + 3, fy);
    g.closePath(); g.fill();
    g.fillStyle = '#ffe0a0';
    g.fillRect(fx + rng.int(3, fw - 8), fy + 4, 3, 3);
    if (rng.chance(0.6)) {
      g.fillStyle = '#8a7a68';
      g.fillRect(fx + fw - 8, fy - rng.int(10, 14), 3, 8);
      vents.push({ x: fx + fw - 7, y: fy - 12 });
    }
  }
  for (i = 0; i < 26; i++) {
    var tx2 = rng.int(0, TW), ty2 = rng.int(150, 180), s2 = rng.int(12, 26);
    g.fillStyle = '#6a5a3c';
    g.fillRect(tx2, ty2, 2, 10);
    blob(g, tx2, ty2 - 2, s2, s2 * 0.8, '#5f8250');
    blob(g, tx2 - s2 * 0.2, ty2 - 5, s2 * 0.7, s2 * 0.6, '#6f9258');
  }
  var cxx = rng.int(60, TW - 60), cyy = 168;
  g.fillStyle = '#7a6a4a';
  g.fillRect(cxx, cyy - 14, 2, 16);
  g.fillRect(cxx - 5, cyy - 11, 12, 2);
  g.fillStyle = '#c8a860';
  g.fillRect(cxx - 4, cyy - 12, 6, 6);
  g.fillStyle = '#8a5a3a';
  g.fillRect(cxx - 5, cyy - 16, 8, 4);
  var cowx = rng.int(80, TW - 80);
  g.fillStyle = '#6a5a58';
  blob(g, cowx, 172, 16, 9, '#6a5a58');
  g.fillRect(cowx - 6, 175, 2, 5);
  g.fillRect(cowx + 4, 175, 2, 5);
  blob(g, cowx + 9, 170, 6, 6, '#7a6a68');
  for (i = 0; i < 9; i++) {
    var wx = rng.int(0, TW), wy = rng.int(120, 160), ws = rng.int(30, 80);
    g.globalAlpha = 0.5;
    g.fillStyle = '#ffffff';
    g.fillRect(wx, wy, ws, 1);
    g.fillRect(wx + 4, wy + 1, 2, 1);
    g.globalAlpha = 1;
  }
  hazeBand(g, 140, 190, 'rgba(255,230,180,0.45)', 1, 1);
  return { c: c, vents: vents };
}

function buildFieldNear(rng) {
  var TW = 768, c = newCanvas(TW, H), g = ctxOf(c);
  var i;
  for (i = 0; i < 26; i++) {
    var x = rng.int(0, TW), w = rng.int(30, 90);
    g.fillStyle = rng.pick(['#5a7a48', '#4e6c40', '#66854e']);
    for (var b = 0; b < 3; b++) g.fillRect(x, 190 + b * 8, w, 8);
  }
  for (i = 0; i < 90; i++) {
    var gx = rng.int(0, TW), gy = rng.int(182, 214);
    g.fillStyle = rng.pick(['#6f8f52', '#7fa05c', '#54704a']);
    g.fillRect(gx, gy, 2, 6);
    g.fillRect(gx + rng.int(-2, 2), gy + 2, 1, 4);
  }
  for (i = 0; i < 5; i++) {
    var fx2 = rng.int(0, TW), fw2 = rng.int(40, 90);
    g.fillStyle = '#7a6a50';
    g.fillRect(fx2, 186, fw2, 3);
    g.fillRect(fx2 + 4, 189, 3, 12);
    g.fillRect(fx2 + fw2 - 8, 189, 3, 12);
  }
  return c;
}

function buildFieldGround(rng) {
  var TW = 768, hgt = 30, c = newCanvas(TW, hgt), g = ctxOf(c);
  for (var b = 0; b < 6; b++) {
    g.fillStyle = ['#a89660', '#9a8854', '#8c7c4c', '#7e7046', '#726642', '#665c3c'][b];
    g.fillRect(0, b * 5, TW, 5);
  }
  for (var x = 0; x < TW; x += 3) {
    g.globalAlpha = 0.25;
    g.fillStyle = '#c8b878';
    g.fillRect(x, rng.int(0, 6), 2, 1);
    g.globalAlpha = 1;
  }
  for (var i = 0; i < 40; i++) {
    var gx = rng.int(0, TW), gy = rng.int(2, 26);
    g.fillStyle = rng.pick(['#6f8f52', '#7fa05c', '#8fae64']);
    g.fillRect(gx, gy, 2, 4);
  }
  return c;
}

/* ---------------- scenery 3: lake and mountains ---------------- */

var LAKE_STOPS = [
  [0.00, '#1f3a5c'], [0.24, '#3a6288'], [0.46, '#6f98b4'],
  [0.64, '#a8c4d0'], [0.78, '#d0dcd8'], [1.00, '#b8c8c0']
];

function buildLakeSky(rng) {
  var c = newCanvas(W, H), g = ctxOf(c);
  gradRows(g, 0, H, W, LAKE_STOPS);
  softGlow(g, 300, 56, 30, '#e8f0f8', 0.45);
  g.fillStyle = '#f4f8f8';
  g.beginPath(); g.arc(300, 56, 11, 0, 7); g.fill();
  for (var i = 0; i < 46; i++) {
    g.globalAlpha = 0.25 + rng.next() * 0.4;
    g.fillStyle = '#eaf2f8';
    g.fillRect(rng.int(0, W), rng.int(4, 70), 1, 1);
    g.globalAlpha = 1;
  }
  for (var k = 0; k < 6; k++) {
    var cx = rng.int(-20, W), cy = rng.int(30, 100);
    g.globalAlpha = 0.42;
    blob(g, cx, cy, rng.int(60, 150), 9, '#ffffff');
    g.globalAlpha = 1;
  }
  for (var b = 0; b < 7; b++) {
    var bx = rng.int(0, W), by = rng.int(20, 80), s = rng.int(3, 5);
    g.fillStyle = '#3a4a5a';
    g.fillRect(bx, by, s, 1);
    g.fillRect(bx + s, by - 2, s, 1);
    g.fillRect(bx + s * 2, by, s, 1);
  }
  return c;
}

function buildLakeFar(rng) {
  var TW = 1536, c = newCanvas(TW, H), g = ctxOf(c);
  var i, x;
  for (x = 0; x < TW; x += 120) {
    hill(g, x + rng.int(-30, 30), 170, rng.int(220, 380), rng.int(40, 76), '#9fb4c0');
  }
  for (x = 0; x < TW; x += 150) {
    hill(g, x + rng.int(-40, 40), 172, rng.int(180, 320), rng.int(58, 104), '#7e98a8');
  }
  for (i = 0; i < 9; i++) {
    var mx = rng.int(60, TW - 60), mh = rng.int(80, 132), mw = rng.int(140, 240);
    hill(g, mx, 174, mw, mh, '#5e7888');
    g.fillStyle = '#e8f0f4';
    g.beginPath();
    g.moveTo(mx - mw * 0.09, 174 - mh * 0.84);
    g.lineTo(mx, 174 - mh - 4);
    g.lineTo(mx + mw * 0.09, 174 - mh * 0.84);
    g.closePath(); g.fill();
  }
  hazeBand(g, 120, 176, 'rgba(210,228,236,0.6)', 1, 1);
  return c;
}

function buildLakeMid(rng) {
  var TW = 1152, c = newCanvas(TW, H), g = ctxOf(c);
  var vents = [];
  var i;
  g.fillStyle = '#4e6a78';
  g.fillRect(0, 170, TW, 12);
  g.fillStyle = '#5e7a86';
  g.fillRect(0, 170, TW, 3);
  var lakeY = 182;
  var grd = g.createLinearGradient(0, lakeY, 0, 216);
  grd.addColorStop(0, '#6f94a4');
  grd.addColorStop(0.5, '#3e5e72');
  grd.addColorStop(1, '#2a4254');
  g.fillStyle = grd;
  g.fillRect(0, lakeY, TW, 216 - lakeY);
  for (i = 0; i < 90; i++) {
    var rx = rng.int(0, TW), ry = rng.int(lakeY + 2, 214);
    g.globalAlpha = 0.12 + rng.next() * 0.22;
    g.fillStyle = '#cfe4ec';
    g.fillRect(rx, ry, rng.int(6, 30), 1);
    g.globalAlpha = 1;
  }
  for (i = 0; i < 3; i++) {
    var sx = rng.int(80, TW - 80);
    g.globalAlpha = 0.22;
    g.fillStyle = '#e8f4f8';
    g.fillRect(sx, lakeY, rng.int(6, 16), 30);
    g.globalAlpha = 1;
  }
  for (i = 0; i < 30; i++) {
    var tx = rng.int(0, TW), s = rng.int(10, 22);
    g.fillStyle = '#3a4a42';
    g.fillRect(tx, 162, 2, 10);
    g.beginPath();
    g.moveTo(tx - s / 2, 164);
    g.lineTo(tx + 1, 164 - s);
    g.lineTo(tx + s / 2, 164);
    g.closePath(); g.fill();
    g.fillStyle = '#46604e';
    g.beginPath();
    g.moveTo(tx - s / 2.6, 166);
    g.lineTo(tx + 1, 166 - s * 0.8);
    g.lineTo(tx + s / 2.6, 166);
    g.closePath(); g.fill();
  }
  var torx = rng.int(200, TW - 200);
  g.fillStyle = '#a8503c';
  g.fillRect(torx - 12, 150, 3, 22);
  g.fillRect(torx + 9, 150, 3, 22);
  g.fillRect(torx - 20, 150, 40, 3);
  g.fillRect(torx - 16, 158, 32, 2);
  g.fillStyle = '#7e3a2c';
  g.fillRect(torx - 20, 152, 40, 1);
  var dockx = rng.int(120, TW - 120);
  g.fillStyle = '#5a4632';
  g.fillRect(dockx, 176, 54, 3);
  g.fillRect(dockx + 4, 179, 3, 10);
  g.fillRect(dockx + 46, 179, 3, 10);
  g.fillStyle = '#6d5540';
  for (var d = 0; d < 6; d++) g.fillRect(dockx + 2 + d * 9, 173, 3, 3);
  hazeBand(g, 140, 186, 'rgba(220,236,240,0.5)', 1, 1);
  return { c: c, vents: vents };
}

function buildLakeNear(rng) {
  var TW = 768, c = newCanvas(TW, H), g = ctxOf(c);
  var i;
  for (i = 0; i < 30; i++) {
    var x = rng.int(0, TW), s = rng.int(14, 30);
    g.fillStyle = '#2c3e3a';
    g.fillRect(x, 190, 2, 26);
    g.beginPath();
    g.moveTo(x - s / 2, 192);
    g.lineTo(x + 1, 192 - s);
    g.lineTo(x + s / 2, 192);
    g.closePath(); g.fill();
    g.fillStyle = '#354c42';
    g.beginPath();
    g.moveTo(x - s / 3, 196);
    g.lineTo(x + 1, 196 - s * 0.8);
    g.lineTo(x + s / 3, 196);
    g.closePath(); g.fill();
  }
  for (i = 0; i < 50; i++) {
    var gx = rng.int(0, TW), gy = rng.int(186, 214);
    g.fillStyle = rng.pick(['#3e5a48', '#31504a', '#4a6650']);
    g.fillRect(gx, gy, 1, rng.int(4, 10));
  }
  for (i = 0; i < 6; i++) {
    var bx = rng.int(0, TW), bw = rng.int(20, 46);
    blob(g, bx, 208, bw, 14, '#3a4448');
  }
  return c;
}

function buildLakeGround(rng) {
  var TW = 768, hgt = 30, c = newCanvas(TW, hgt), g = ctxOf(c);
  var grd = g.createLinearGradient(0, 0, 0, hgt);
  grd.addColorStop(0, '#3e5e72');
  grd.addColorStop(0.6, '#2e4a5e');
  grd.addColorStop(1, '#24384a');
  g.fillStyle = grd;
  g.fillRect(0, 0, TW, hgt);
  for (var i = 0; i < 90; i++) {
    g.globalAlpha = 0.1 + rng.next() * 0.2;
    g.fillStyle = '#cfe4ec';
    g.fillRect(rng.int(0, TW), rng.int(1, hgt - 1), rng.int(5, 26), 1);
    g.globalAlpha = 1;
  }
  return c;
}

/* ---------------------------- theme registry ---------------------------- */

var THEMES = {
  shitamachi: {
    name: 'SHITAMACHI DUSK', rain: 0.8, mist: 0, cars: true, poleGap: 1, poleStyle: 'concrete',
    wire: { main: '#333c58', mainHi: '#7d8cb5', deco: '#0d0c16', decoHi: '#2c3348' },
    sky: buildSky, far: buildFar, mid: buildMid, near: buildNear, ground: buildStreet
  },
  farmland: {
    name: 'FARMLAND GOLD', rain: 0, mist: 0.15, cars: false, poleGap: 1.42, poleStyle: 'wood',
    wire: { main: '#6a6046', mainHi: '#c8b888', deco: '#544c3a', decoHi: '#9a9070' },
    sky: buildFieldSky, far: buildFieldFar, mid: buildFieldMid, near: buildFieldNear, ground: buildFieldGround
  },
  lake: {
    name: 'LAKE AND MOUNTAINS', rain: 0, mist: 0.45, cars: false, poleGap: 1.25, poleStyle: 'steel',
    wire: { main: '#546a78', mainHi: '#b8d0d8', deco: '#3e4f5a', decoHi: '#8ba4b0' },
    sky: buildLakeSky, far: buildLakeFar, mid: buildLakeMid, near: buildLakeNear, ground: buildLakeGround
  }
};
var THEME_IDS = ['shitamachi', 'farmland', 'lake'];

/* ============================ window dressing ============================
   Decorative, non-interactive clutter baked into the window frame / glass
   layers: an invented mascot sticker, torn interior posters of a falling
   detective, a faded advertisement, a ticket stub and scuffs. Kept small and
   low-contrast so the gameplay area stays the focus. */

/* invented mascot: a wire sparrow in a little hat (sticker style) */
var MASCOT = [
'.....WWWW.......',
'...WWKKKKWW.....',
'..WKKHHHHKKW....',
'..WKHKHHKHKW....',
'..WWKKKKKKWW....',
'...WBBBBBBW.....',
'..WBBBBBBBBW....',
'.WBKBBBBBKBBW...',
'.WBBBBBBBBBBW...',
'.WBBYYYYYYBBW...',
'..WBYYYYYYBW....',
'...WWBBBBWW.....',
'.....WSSW.......',
'....WW..WW......',
'...W......W.....',
'................'
];

var FALLING_DET = [
'..KK..',
'.KHHK.',
'..KK..',
'.KCCK.',
'KCCCCK',
'KCcCcK',
'.KCCK.',
'.KPPK.',
'K.KK.K',
'.K..K.'
];

function tornEdge(g, x, y, w, h, rng, side) {
  g.fillStyle = '#0d0a12';
  for (var i = 0; i < h; i += 2) {
    var d = 1 + Math.floor(rng.next() * 3);
    if (side === 'right') g.fillRect(x + w - d, y + i, d, 2);
    else g.fillRect(x, y + i, d, 2);
  }
}

function drawPoster(g, x, y, w, h, bg, ink, mid, rng, withFigure) {
  g.fillStyle = bg;
  g.fillRect(x, y, w, h);
  g.globalAlpha = 0.25;
  g.fillStyle = '#000000';
  g.fillRect(x + 1, y + h - 4, w - 2, 3);
  g.globalAlpha = 1;
  g.fillStyle = mid;
  g.fillRect(x + 2, y + 2, w - 4, 1);
  if (withFigure) {
    var s = compile(FALLING_DET, { 'K': ink, 'H': mid, 'C': mid, 'c': ink, 'P': ink });
    g.save();
    g.translate(x + w * 0.5, y + h * 0.46);
    g.rotate(0.42);
    g.globalAlpha = 0.85;
    g.drawImage(s.c, -s.w / 2, -s.h / 2);
    g.restore();
    g.globalAlpha = 1;
    g.fillStyle = mid;
    g.fillRect(x + w - 4, y + 3, 2, 1);
    g.fillRect(x + w - 5, y + 6, 3, 1);
    g.fillRect(x + w - 4, y + 9, 2, 1);
  } else {
    for (var r = 0; r < 3; r++) {
      g.fillStyle = mid;
      g.fillRect(x + 3, y + 4 + r * 5, w - 8 - Math.floor(rng.next() * 4), 2);
      g.fillStyle = ink;
      g.fillRect(x + 4, y + 7 + r * 5, 2, 1);
    }
    g.globalAlpha = 0.7;
    g.fillStyle = ink;
    g.fillRect(x + 3, y + h - 9, 8, 3);
    g.globalAlpha = 1;
  }
  tornEdge(g, x, y, w, h, rng, rng.chance(0.5) ? 'right' : 'bottom');
}

function dressWindow(g, rng) {
  /* torn poster fragment on the left interior wall, figure falling */
  drawPoster(g, 2, 62, 17, 48, '#3a2830', '#191218', '#9a7a70', rng, true);
  /* weathered advert fragment on the right wall, invented branding */
  drawPoster(g, W - 19, 98, 17, 42, '#242c3c', '#12161f', '#8b9cb2', rng, false);
  g.globalAlpha = 0.62;
  drawText(g, 'HOSHI', W - 17, 102, '#cdd8e6', 1);
  drawText(g, 'COLA', W - 16, 109, '#cdd8e6', 1);
  g.globalAlpha = 1;
  g.fillStyle = '#5c6678';
  g.fillRect(W - 16, 116, 11, 1);
  g.fillRect(W - 16, 119, 8, 1);
  /* ticket stub tucked into the sill seal */
  g.fillStyle = '#1a1520';
  g.fillRect(136, 185, 26, 11);
  g.fillStyle = '#e8dcc4';
  g.fillRect(137, 186, 24, 9);
  g.fillStyle = '#b8484a';
  g.fillRect(137, 186, 24, 2);
  g.fillStyle = '#c9bda4';
  g.fillRect(140, 189, 18, 1);
  g.fillRect(140, 192, 12, 1);
  g.fillStyle = '#1a1520';
  g.fillRect(158, 189, 2, 2);
  /* mascot sticker on the glass */
  var m = compile(MASCOT, {
    'W': '#f2f5f8', 'B': '#3fb0c0', 'b': '#2a8898', 'Y': '#ffd98c',
    'K': '#20202c', 'H': '#3a3a4c', 'S': '#e8b48c'
  });
  g.globalAlpha = 0.62;
  g.drawImage(m.c, 40, 132);
  g.globalAlpha = 0.16;
  g.fillStyle = '#ffffff';
  g.fillRect(40, 132, m.w, 1);
  g.globalAlpha = 1;
  /* scuffs and wear on the frame */
  g.globalAlpha = 0.14;
  for (var i = 0; i < 26; i++) {
    g.fillStyle = rng.chance(0.5) ? '#000000' : '#6a6070';
    var sx = rng.chance(0.5) ? rng.int(2, 18) : rng.int(W - 20, W - 4);
    g.fillRect(sx, rng.int(20, 186), rng.int(3, 9), 1);
  }
  g.globalAlpha = 1;
}

function buildCity(seed, themeId) {
  var th = THEMES[themeId] || THEMES.shitamachi;
  var rng = makeRng(seed);
  var mid = th.mid(rng);
  return {
    theme: THEMES[themeId] ? themeId : 'shitamachi',
    def: th,
    sky: th.sky(rng),
    far: th.far(rng),
    mid: mid.c,
    vents: mid.vents || [],
    near: th.near(rng),
    street: th.ground(rng),
    tunnel: buildTunnel(rng)
  };
}
