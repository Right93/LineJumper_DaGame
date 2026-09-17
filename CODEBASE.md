# CODEBASE.md — how LINE JUMPER works

Everything you need to read, change or extend the game. Pairs with `AGENTS.md`
(what the spec is) and `.opencode/skills/pixel-runner/SKILL.md` (locked rules).

---

## 1. Layout

```
index.html          dev shell: <script src="src/..."> in load order
preview.html        character preview harness (dev only, not built)
build.js            zero-dependency build: src/*.js -> dist/index.html
dist/index.html     generated single-file game (committed, playable)
src/core.js         constants, math/rng, canvas helpers, pixel font
src/character.js    outfits, sprite rig, player rendering, flip, recovery
src/world.js        scenery themes, parallax tiles, train cabin + window
src/audio.js        synthesised SFX + background music element
src/game.js         boot, world generation, physics, scoring, HUD, input
src/preview.js      preview harness driver
```

`node build.js` concatenates the five `src` files into one `<script>` block
inside `dist/index.html` and, if `bgm.mp3` exists, replaces
`var BGM_SRC = 'bgm.mp3';` with a base64 data URI. Sources are plain scripts in
one global scope — no modules, no bundler. Order matters only for load-time
code, which all lives in `game.js` (last).

### Geometry

| constant | meaning |
| --- | --- |
| `W,H = 384,216` | the game view (the glass) |
| `SW,SH = 520,360` | the visible canvas: the whole carriage |
| `VW,VH = 432,243` | the glass: view composited at (VOX,VOY), scaled 1.125× |
| `VOX,VOY = 44,58` | top-left of the framed window in the carriage |

The canvas is upscaled with `image-rendering: pixelated` at an integer scale
(max 6×), recomputed on resize. The glass upscales the view by a uniform
1.125× into a framed window at (44,58)-(476,301), leaving the carriage
interior visible in the side columns and in the ceiling/rack band on top and
seat/sill band at the bottom.

---

## 2. Render pipeline

`render()` in `game.js` draws into the **view** context (`viewG`), then
composites the carriage:

```
viewG.clear
  sky -> far -> mid -> street -> near -> mist      (parallax bands)
  wires, poles, obstacles, pickups, player
  rain, tunnel front, glass dynamics, glass overlay
  HUD / title / game-over / pause / errors
composite on sceneG:
  cabinC   carriage interior, luggage, clutter      (behind the glass)
  viewC    the frame we just drew                   (at VOX,VOY, scaled VW×VH)
  sashC    window frame, seal, sill, straps         (in front of the glass)
```

Parallax helper: `drawPara(tile, para, y)` tiles a canvas horizontally with a
parallax factor and wraps it; all scenery layers are pre-rendered canvases
built once per theme in `world.js`.

Zoom debug (`?zoom=n&ox=&oy=`) magnifies the view before compositing, so
close-ups of the character are unaffected by the carriage.

---

## 3. Modules

### core.js
`W,H,SW,SH,VOX,VOY` · `clamp, lerp, mulberry32, makeRng` · `newCanvas, ctxOf,
rect, pixel, roundRectPath, lerpColor` · the 3×5 pixel font (`FONT`,
`drawText*`, `textW`). No side effects.

### character.js
- `PP` base palette, `HATS` (bowler/trilby/flatcap), `OUTFITS` + `OUTFIT_IDS`,
  `outfitPalette(id)`.
- Sprite rig: `BODY_REST` (constant torso/head rows) + `LEG_SHAPES` (8 leg
  poses) + `RUN_LEGS` (8-step cycle table) merged by `composeRun(body)` and
  compiled by `compile(rows, pal)` into canvases; `mergeRows(a,b)` overlays.
- `TUCK` (flip), `RECOVER0..2` (landing), `FALL0/1`.
- `buildArt(outfitId)` composes and caches everything per outfit.
- `drawPlayer()` picks the sprite from `player.state` — run cycle rate is
  `clamp(speed/6.6, 11, 17)` fps over 8 frames with bob `[0,1,0,-1]`, flip
  rotation is `smoothstep(flipT/FLIP_T)*360`, landing plays the 3 recovery
  poses. `drawCane()` draws the cane from the hand anchor.
- `blit`, `blitScaled`, `rotateSprite`, `runSheet` (the `?mode=sheet` view).

### world.js
- Shared painters: `gradRows`, `softGlow`, `blob`, `hill`, `hazeBand`,
  `skyColorAt2`, `neon`, `drawPoster`, `strapHanger`.
- Scenery builders per theme: `buildSky/buildFar/buildMid/buildNear/
  buildStreet` (shitamachi), `buildField*` (farmland), `buildLake*` (lake);
  `buildTunnel`; `buildCity(seed, themeId)` returns the tile set for a theme.
- `THEMES` registry + `THEME_IDS`: each theme declares `swatch`, `rain`,
  `mist`, `cars`, `poleGap`, `poleStyle`, `wire` colours and its five builders.
- Carriage: `buildCabin(rng)` (interior + clutter) and `buildSash(rng)`
  (window frame/sill/straps) — both are full `SW×SH` canvases; the view is
  punched out of the sash with `destination-out`.
- `buildThemePreview(id)` renders a 96×54 thumbnail from a theme's own tiles
  for the customise screen.

### audio.js
One IIFE returning an API. WebAudio for SFX (noise buffer, `tone`, `noise`,
`jump/land/drop/pickup/stunt/hit/crash/tick/ui/thunder`) plus `setRumble`
(train rumble, raised in tunnels). Music is a plain `Audio` element:
`musicStart` (restart from 0), `musicPlay`, `musicPause` (position kept),
`musicStop` (pause + rewind), `toggleMute`, `bgmDebug()` (source, readyState,
duration, currentTime, paused). `BGM_SRC` is `bgm.mp3` in dev and a data URI in
the built file; `?bgm=<url>` overrides it for tests.

### game.js
- Constants: `LEVELS = [70,94,118]`, `STREET_Y = 191`, speed/jump physics,
  `UP_CLEAR = 5`, `UP_HOLD = 0.18`, `LAND_T`, `FLIP_T`.
- World generation: `genSpan()` (length × theme `poleGap`, sag, ramp between
  levels, gaps, obstacles, pickups, crows, shoes), `mainSpanAt/inGap/wireAt/
  decoY/spanY`, `groundWire`, `landingY` (with the up-jump clearance rule),
  `reset(seed)`.
- Player: `doJump`, `doDrop`, `landOn`, `updatePlayer` (states run/air/drop/
  fall/land/dead + obstacle collision), `gameOver`.
- Simulation: fixed `STEP = 1/120`, `stepSim(dt)`, `frame(ts)` accumulator.
- Rendering: `render` (above), `drawWires/drawPoles/drawObstacles/drawPicks/
  drawPlayer/drawRain/drawMist/drawTunnel*`, HUD, title, game over, pause,
  `drawCustomise`, `drawErrors`.
- Screens/economy: `loadWardrobe/saveWardrobe/equipOutfit` (outfits + spark
  bank), `setScenery`, `drawCustomise`, the `wardrobe` flag.
- Debug modes + harnesses: `runShot` (`?mode=shot&pose=…`), `runSelfTest`
  (`?mode=test`), `runAudioCheck` (`?mode=audio`), `runSheet` (`?mode=sheet`),
  `scriptedInput` (auto-play AI), `simulate`.
- Input: `onKey` (jump/drop/pause/mute/restart/wardrobe/scenery), pointer
  down/up mapped into view space, visibility + blur auto-pause.

---

## 4. Key data structures

```js
world = { rng, spans[], poles[], gaps[], nextX, level, idx, safeCounter }
span  = { x0, x1, lvl, sag, ramp, rampFrom, gap, obs:{t,x}|null,
          picks[{x,y,got}], crow, shoes }
player = { x, y, vy, lvl, onMain, state, animT, flipT, jumpBuf, coyote,
           minY, landT, deadT, speed, inv, startLvl, apexY, holdT,
           highJump, stats{...} }
```

`wireAt(x,lvl)` is the single source of truth for "is there a wire here": the
main line replaces the decorative line at its level, and gaps punch holes.
Landing only happens while descending; a wire one level *up* is landable only
if the jump was held (`highJump`) and cleared it by `UP_CLEAR`.

---

## 5. Persistence (localStorage)

| key | meaning |
| --- | --- |
| `lj_best` | best total score |
| `lj_sparks` | persistent spark currency (see `AGENTS.md`) |
| `lj_owned` | comma list of purchased outfit ids |
| `lj_outfit` | equipped outfit id |
| `lj_scenery` | selected scenery id |

---

## 6. Extension guides

**Add an animation pose**: add an 8-row string array to `LEG_SHAPES` and
reference it from the `RUN_LEGS` table; nothing else changes.

**Add an outfit**: add an `OUTFITS` entry (name, price, `hat`, partial palette
override) and append its id to `OUTFIT_IDS`. Do not add frames.

**Add a scenery**: add a `THEMES` entry with the five builders plus flags and
append its id to `THEME_IDS`. Builders return canvases (`mid` returns
`{c, vents}`). Do not fork the render pipeline or the wire rules.

**Tune the cabin**: `buildCabin`/`buildSash` in `world.js`; the glass overlays
are `buildGlass` (static) and `drawGlassDyn` (moving bands + player reflection).

---

## 7. Verification

No test framework; verification is scripts plus headless Chrome:

1. `node build.js`
2. syntax + sprite-width check (Node, `new Function` + regex over the sprite
   arrays) on `dist/index.html`
3. auto-play harness: DOM stubs, boots the built file, runs the scripted AI for
   3 minutes across seeds 1337/7/99/2024/555 — expect 0 gap falls and at most
   an occasional obstacle trip
4. in-browser self test: `dist/index.html?mode=test` must print
   `STATUS: PASS` with 0 runtime/art errors
5. screenshots: `?mode=shot&pose=run|air|drop|fall|up|land|over|title|pause`
   optionally `&zoom=6&ox=&oy=` to inspect the character, `&scenery=`/`&outfit=`
   to check sets, `?mode=sheet` for the sprite sheet, `?mode=audio` for the
   music path

Harness notes: Chrome's `--virtual-time-budget` does not advance media clocks,
so the audio check asserts `readyState`/`duration`/play-state instead of
`currentTime`; aim zoom crops at the wire the runner is on (`oy = wireY - 14`).

---

## 8. Known gaps

- The soundtrack `bgm.mp3` lives in the project root (committed; Pixabay
  dream-pop lofi, 192 s) and is embedded as a base64 data URI by the build.
  The loader also tries `bgm.ogg`/`bgm.wav` and `?bgm=`; the build warns when
  nothing is embedded. `--no-bgm` skips the embed for fast dev builds; the dev
  shell then 404s `bgm.mp3`.
- The preview harness only covers the character; world/scenery previews live in
  the in-game customise screen.
