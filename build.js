#!/usr/bin/env node
/* LINE JUMPER build: inline src/*.js into a single distributable file and
   embed the background music track, so dist/index.html is fully self-contained.

   Usage:  node build.js            -> writes dist/index.html
           node build.js --no-bgm   -> skip embedding audio (fast dev build)

   No external dependencies. */
'use strict';
const fs = require('fs');
const path = require('path');

const root = __dirname;
const shellPath = path.join(root, 'index.html');
const outDir = path.join(root, 'dist');
const outPath = path.join(outDir, 'index.html');
const BGM_CANDIDATES = ['bgm.mp3', 'bgm.ogg', 'bgm.m4a', 'bgm.wav'];
const MIME = { '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.wav': 'audio/wav' };

const noBgm = process.argv.includes('--no-bgm');

let shell = fs.readFileSync(shellPath, 'utf8');
const scriptTag = /<script src="([^"]+)"><\/script>[ \t]*\r?\n?/g;
const parts = [];
let m;
while ((m = scriptTag.exec(shell)) !== null) {
  const rel = m[1];
  parts.push({ rel, body: fs.readFileSync(path.join(root, rel), 'utf8') });
}
if (!parts.length) { console.error('build: no <script src="..."> tags found in index.html'); process.exit(1); }

let out = shell.replace(scriptTag, '');
const combined = parts.map(p => p.body.trimEnd()).join('\n\n');
out = out.replace('</body>', '<script>\n' + combined + '\n</script>\n</body>');
const inlined = parts.length;

// embed the music track (replaces the file reference used in dev)
let bgmNote = 'no bgm file found - music will 404 until bgm.mp3 is added';
if (!noBgm) {
  for (const name of BGM_CANDIDATES) {
    const full = path.join(root, name);
    if (!fs.existsSync(full)) continue;
    const bytes = fs.readFileSync(full);
    const ext = path.extname(name).toLowerCase();
    const dataUri = 'data:' + (MIME[ext] || 'audio/mpeg') + ';base64,' + bytes.toString('base64');
    const before = out;
    out = out.replace(/var BGM_SRC = '[^']*';/, "var BGM_SRC = '" + dataUri + "';");
    if (out !== before) {
      bgmNote = name + ' embedded (' + (bytes.length / 1024).toFixed(0) + ' KB -> ' + (dataUri.length / 1024).toFixed(0) + ' KB base64)';
    } else {
      bgmNote = 'BGM_SRC marker not found in sources; nothing embedded';
    }
    break;
  }
} else {
  bgmNote = 'skipped (--no-bgm)';
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, out);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log('build: ' + inlined + ' source file(s) inlined');
for (const p of parts) console.log('  + ' + p.rel + '  ' + kb(Buffer.byteLength(p.body)));
console.log('bgm:   ' + bgmNote);
console.log('out:   dist/index.html  ' + kb(Buffer.byteLength(out)));
