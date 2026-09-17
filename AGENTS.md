# AGENTS.md — LINE JUMPER, current spec

Quick orientation for any agent or person picking this up. Read this first, then
`CODEBASE.md` for how everything works, then `.opencode/skills/pixel-runner/SKILL.md`
for the locked art/gameplay rules.

## What this is

A 2D pixel-art endless runner rendered entirely in code (Canvas 2D, no sprite
files). An 80s-noir detective in a cream trench coat and dark bowler runs along
power lines strung between poles, watched from inside a moving train car. You
sit in the carriage: walls, luggage rack, hanging straps and a passenger's arm
frame a window that the game is seen through.

## Run it

```
open dist/index.html            # the game (single self-contained file)
open index.html                 # dev shell (loads src/*.js) - needs a local server? no, file:// is fine
open preview.html               # character preview harness (animation review)

node build.js                   # rebuild dist/index.html from src/ (zero deps)
node build.js --no-bgm          # fast build, skip embedding the music
```

There is no test runner to install. Verification is headless Chrome +
Node DOM-stub harnesses (see `CODEBASE.md` → Verification).

## Hard constraints — do not break these

- `dist/index.html` is a **generated single file**: no external assets, no CDN,
  no npm deps, no ES modules. Only `bgm.mp3` is optional and is embedded at
  build time. Never hand-edit `dist/`.
- Sources live in `src/` and share one global scope; load order is
  core → character → world → audio → game.
- Internal resolution: the game view is **384×216**; the visible canvas is the
  carriage at **520×360** with the view composited into a framed window at
  **(44, 58)** scaled **1.125×** to **432×243**, so the detailed interior
  stays visible all around the glass.
- Runtime errors must stay at zero: `window.onerror` collects into
  `RUNTIME_ERRORS`, which is drawn on-canvas. A build with entries there is
  broken.
- No comments in game code, no dead code, keep the ES5-ish style (the file must
  run from `file://`).
- Wire/pole geometry and jump/landing rules are shared across all sceneries;
  a scenery may only change art, palette and pole spacing.

## Game feel, locked

- Auto-run. Speed starts at 82 px/s, accelerates 0.75 px/s², caps at 148 px/s
  (reached around 90 s).
- **Space/↑** jump with a flip (rotation is eased, never linear). Holding jump
  for ≥0.18 s makes it a high jump and also clears ≥5 px above the wire one
  level up, so a *held* jump can land you one line higher — tapping never does.
  That pair of conditions is what keeps the old accidental-snag bug dead.
- **↓** deliberately drops to the next wire down (+25); there is no wire below
  the bottom line, so it also doubles as an intentional run-ender.
- Three wires (`LEVELS = [70, 94, 118]`, 24 px apart). Hitting an obstacle or
  the street ends the run.
- Score = distance (m) + sparks ×10 + stunts ×25 + ups ×40.
- Sparks also bank into a **persistent currency** (`lj_sparks`) that buys
  outfits; it saves during the run, survives refresh, and is spent in the
  customise screen.

## Current feature set

- Train-car interior with a window onto the world (rack, bags, straps, seat
  back, passenger arm, wall clutter — all outside the glass).
- Character: lean noir rig, 8-frame composed run cycle, eased flip, 3-pose
  landing recovery, cane. No procedural coat tail (removed on purpose).
- Four outfits (detective, nightwatch, verdant, ninja; palette + hat swap on
  the same rig) bought with sparks.
- Three sceneries (ditch the city, farmland at golden hour, lake and
  mountains) selectable in the customise screen; the farmland is deliberately
  sparser (wider pole spacing).
- Background music + synthesised SFX; music pauses with the game and stops on
  game over.
- Customise screen from the title screen or the pause menu, with live previews.
- Debug modes: `?mode=test` self test, `?mode=sheet`, `?mode=audio`,
  `?mode=shot&pose=…`, `?play=1`, `?tun=1`, plus `?outfit=`, `?scenery=`,
  `?wardrobe=11`.

## Working rules

- Commit after every verified change, one focused commit, imperative subject
  plus a body saying what changed and how it was verified. Push to
  `origin main` (`https://github.com/Right93/LineJumper_DaGame.git`); auth is
  Git Credential Manager, never put tokens in files.
- Always `node build.js` before testing, then run: the syntax/sprite check, the
  3-minute auto-run harness on 5 seeds (expect 0 gap falls, at most the odd
  obstacle trip), and the in-browser self test (`?mode=test` must print
  `STATUS: PASS` with 0 runtime/art errors).
- Update this file, `CODEBASE.md` and the skill file whenever a decision is
  locked in.

## Music

- The soundtrack is committed as `bgm.mp3` in the project root (Pixabay,
  192 s dream-pop lofi) and embedded as a base64 data URI by `node build.js`;
  without it the build reports `no bgm file found` and music 404s in dev.
