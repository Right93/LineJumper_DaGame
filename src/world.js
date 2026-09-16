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

function buildCity(seed) {
  var rng = makeRng(seed);
  var mid = buildMid(rng);
  return {
    sky: buildSky(rng),
    far: buildFar(rng),
    mid: mid.c,
    vents: mid.vents,
    near: buildNear(rng),
    street: buildStreet(rng),
    tunnel: buildTunnel(rng)
  };
}

