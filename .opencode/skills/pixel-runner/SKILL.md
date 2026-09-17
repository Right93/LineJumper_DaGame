---
name: pixel-runner
description: Durable spec and rules for the LINE JUMPER game in D:\Fake desktop\LineJumper (index.html). Use when editing gameplay, physics, wire levels, character sprite art, or committing — covers the single-file constraint, constants, wire-level rules, and art direction.
---

# LINE JUMPER — project spec

**Where the documentation lives (all inside this repository):**

| file | purpose |
| --- | --- |
| `AGENTS.md` (project root) | the current spec: constraints, live constants, feature set, working rules |
| `CODEBASE.md` (project root) | full codebase guide: modules, render pipeline, data structures, extension guides, verification |
| this file | the auto-loaded skill: locked art/gameplay rules and gotchas |

This skill lives in the project at `.opencode/skills/pixel-runner/SKILL.md`
because that is the only path opencode auto-discovers; the durable documents
are the two root `.md` files above, which anyone can find without knowing
opencode. **Update all three whenever a decision is locked in.**

## Layout and build

Development happens in the split sources; the single file is a **generated
artifact**, never hand-edited:

```
index.html          dev shell: loads the sources with <script src="src/...">
src/core.js         constants, math/rng, canvas primitives, pixel font
src/character.js    outfit palettes, sprite rig, tail physics, player render
src/world.js        scenery themes + parallax tiles + window dressing
src/audio.js        synthesised SFX + background music track
src/game.js         boot, wire/pole generation, physics, scoring, HUD, input
preview.html        character preview harness (states, frame stepping)
build.js            `node build.js` -> dist/index.html (single file, no deps)
dist/index.html     built distributable (committed so the repo stays playable)
```

- `src/*.js` are plain scripts sharing one global scope; load order is
  core → character → world → audio → game. No ES modules (must run from
  `file://`).
- `node build.js` concatenates the sources into one inline `<script>` and
  embeds `bgm.mp3` as a base64 data URI. `--no-bgm` skips the embed.
- **All tests run against `dist/index.html`**, plus one smoke check of the dev
  shell. Always run `node build.js` before testing after a source edit.
- No external assets other than the optional `bgm.mp3` (embedded at build), no
  CDN links, no npm dependencies. Everything else is drawn procedurally with
  Canvas 2D from string-array sprites and `fillRect`.
- Internal resolution is 384×216, upscaled with `image-rendering: pixelated`
  (integer CSS scale, max 7×). The view is composited into a framed carriage
  window at `VOX,VOY = 44,58`, scaled a uniform 1.125× to `VW×VH` = 432×243,
  so the interior stays visible all around the glass.
- Keep runtime errors at zero. The page captures `window.onerror` into
  `RUNTIME_ERRORS` and draws them on-canvas in red. Never ship with entries in
  `RUNTIME_ERRORS` or `ART_ERRORS`.
- No comments in the game code unless the user asks for them.

## Physics constants (locked)

```js
SPEED0 = 82      // starting forward speed, px/s
ACCEL  = 0.75    // px/s gained per second of run time (82 -> 148 in ~90 s)
SPEEDMAX = 148   // hard speed cap
GRAV   = 620     // px/s^2
JUMPV  = 172     // initial jump velocity, px/s (up)
HOLDG  = 0.75    // gravity multiplier while jump is held and rising
DROP_VY = 30     // downward speed when dropping off a wire
COYOTE = 0.09    // s of grace after leaving a wire
JBUF   = 0.13    // s of jump input buffering
UP_CLEAR = 5     // px of clearance needed above a higher wire to land on it
UP_HOLD  = 0.18  // s the jump must be held while rising to allow an up-landing
STEP   = 1/120   // fixed simulation step
```

Derived: tap jump ≈ 24 px apex, held jump ≈ 32 px apex, airtime ≈ 0.7 s
(one full flip). Level spacing is 18 px, so a held jump clears exactly one
level up.

## Wire-level rules

- `LEVELS = [70, 94, 118]` — **three cables only** (screen y of each wire,
  level 0 = highest). Fewer cables keeps the window readable; do not add levels
  back without a visual reason. Spacing is 24 px, chosen so a held jump
  (32 px apex) still clears exactly one level with `UP_CLEAR` margin.
  `STREET_Y = 191` — reaching it is game over.
- The starting level is the middle one (`lvl = 1`).
- Two kinds of wire:
  - **main line** — generated spans with sag, ramps between levels, gaps,
    obstacles and pickups. The player tracks it with `player.onMain`.
  - **deco wires** — the analytic `decoY(lvl, x)` catenary at every level,
    except where the main line replaces them or a gap punches a hole.
- Movement rules:
  - **Jump** (Space/↑): flips, lands on the same wire, across a gap, **or up
    onto the wire one level higher**. Going up is a *deliberate* move: it only
    happens when the player **holds the jump** while rising for at least
    `UP_HOLD` (0.18 s) *and* the arc genuinely clears the higher wire by
    `UP_CLEAR` (5 px). Tapping never takes you up a level. +40 score, counted
    as an "up".
  - **Drop** (↓): deliberate stunt to the next wire below; +25 score. On the
    bottom level there is no wire below — you fall to the street (game over),
    so it doubles as an intentional run-ender.
  - Landing is only allowed on a wire that is crossed **while descending**
    (`vy > 0`).
  - The hold + clearance pair is what separates an intentional jump-up from the
    historical accidental-snag bug (the arc grazing a higher wire by 1–2 px and
    snapping the runner onto it). Never relax both conditions at once: with
    clearance alone, a normal held obstacle hop would snag a wire above; with
    the hold alone, snags would return. Only one level up is ever allowed
    (`minLvl = startLvl - 1` when `highJump`, else `startLvl`).
  - Falling/dropping can only land on wires **below** the take-off level
    (`minLvl = startLvl + 1`, no up option).
- Level-generation guards learned the hard way:
  - Never place an obstacle closer than `max(74, ramp + 104)` px from a span
    start. Jumping out of a level-change ramp puts the runner on a descending
    arc with only ~7 px of clearance, which reads as an unfair trip.
  - A gap and a level-change ramp never coexist on the same span.
- Game over: hitting a branch/transformer obstacle, or reaching the street.
  There is no health or respawn — the run restarts from the title.
- Scoring: `distance(m) + sparks*10 + stunts*25 + ups*40`; best score in
  `localStorage` under `lj_best`.

## Art direction (locked)

- Palette is dusk/neon: warm smog horizon, violet sky, dark neon-lit low-rise
  Tokyo, no skyscrapers. Character art uses the `PP` palette in the script.
- **Character: lean noir silhouette, not a heavy build.** This was got wrong
  twice (a bell-shaped coat both times) — the fix is width, not detail:
  - Sprite is **14×30**. The coat body is only 5–6 px wide; anything wider
    reads as a fat man at this scale, no matter how it is shaded.
  - Cream/tan trench coat with a darker back edge (`c`), a lapel line (`d`)
    and a narrow tail wedge behind the hips, plus a short procedural flutter.
  - Dark bowler: small 4-px crown, 8-px brim, shadowed face, single eye pixel.
  - Long legs (10 px, a third of total height), thin, in mid-blue trousers so
    they read against the dark city.
  - **Animation is a composed pose system, not hand-drawn keyframes.** Do not
    reintroduce the old 4-frame full-body frames (they were patched from an
    early heavier rig and read as a shuffle):
    - `BODY` (22 rows) is constant: hat, face, collar, coat, hips.
    - `LEG_SHAPES` is a dict of 8 eight-row leg poses (`plantF`, `plant`,
      `plantB`, `toe`, `lift`, `pass`, `reach`, `reachLo`).
    - `RUN_LEGS` is the 8-step cycle table `[leftShape, rightShape]`;
      `composeRun()` merges them over `BODY`, the right (near) leg winning
      overlaps. Add or retune poses by editing the table, not by redrawing
      whole frames.
  - Legs: **narrow stance, feet within x3–10 of the 14-px sprite** (centreline
    ≈ x6). No wide splay — he is running a wire. The stance foot still travels
    ~4 px (forward contact → under → behind → toe-off) and the swing foot
    lifts 2–3 rows with a bent knee, which is what makes the cycle read.
  - Arms stay contained: the sleeve is baked into `BODY`; only the cane angle
    moves (`0.42 ± 0.16` rad). No flailing.
  - Body bob per step is `[0, +1, 0, -1]`, i.e. `[0,1,0,-1][frame % 4]` over
    the 8 frames (two bounces per cycle).
  - **Run animation rate is coupled to speed**:
    `fps = clamp(speed / 6.6, 11, 17)` over 8 frames. A fixed rate makes the
    feet slide as the game speeds up.
  - **Coat flows, it is not static colouring.** A 7-point verlet chain (`tailPts`,
    `TAIL_SEG = 3.0`) hangs from the coat's back hem and is drawn *behind* the
    body: damping 0.9, small gravity, plus `wind = -speed * dt * 0.55` so it
    streams backwards when running and whips during flips/falls. `tailKick()`
    adds a settling impulse on landing.
  - **Flip/roll**: tighter 10×14 tuck (`TUCK`, 12 prerendered 30° rotations)
    with the cane spinning along. Rotation is **eased, never linear**:
    `rot = smoothstep(prog) * 360` where `prog = flipT / FLIP_T` (0.66 s), so
    it starts and ends slow.
  - **Landing is a 3-pose recovery, not a snap back to idle**: `RECOVER0`
    (impact crouch, coat flying) → `RECOVER1` (crouch, coat settling) →
    `RECOVER2` (rise), played over `LAND_T = 0.3 s`; jumping is allowed again
    after 0.08 s so it still feels responsive.
- Train-window framing is mandatory: riveted frame, sill and coffee cup,
  glass reflections, scene sway. The player runs *inside* the window.
- Debug helpers that must keep working: `?mode=shot&pose=run|air|drop|fall|up|land|over|title|pause&shot=<seconds>&seed=<n>&zoom=<n>&ox=&oy=`, `?mode=test` (on-canvas self test), `?mode=sheet` (all 8 run frames at 2x plus the recovery, fall and flip poses), `?mode=audio` (audible-path check; `?bgm=<url>` overrides the track for tests), `?play=1`, `?tun=1`, `?outfit=<id>`, `?scenery=<id>`, `?wardrobe=1`. `pose=up` drives a held jump and stops right after the up-landing; `pose=land` stops on the touchdown frame.
- Music: `bgm.mp3` belongs in the project root. Dev references it directly; `node build.js` embeds it as a data URI in the dist and warns loudly when the file is missing. Music starts with a run, pauses (position kept) on pause/blur, and stops+rewinds on game over. Chrome's virtual time does not advance media clocks, so the audio check asserts source/readyState/duration/play-state, not `currentTime`.
- When zooming for a close-up, aim the crop at the wire the runner is on: `oy = wireY - 14` (wireY comes from `LEVELS`), otherwise the crop misses him.
- `?mode=test` phases: 20 s pure auto-run, 30 s with forced drops, 40 s with scripted **held up-jumps** (only triggered on clear stretches). It must report `UP JUMPS OK n/n` with n > 0 or the status is CHECK.

## Extension points

- **Outfits** (`src/character.js`): add an entry to `OUTFITS` (name, price,
  `hat` key from `HATS`, and a partial palette override) and to `OUTFIT_IDS`.
  Never add animation frames for an outfit — the rig is shared. The collar row
  of `BODY_REST` uses palette key `A`, which is how a "scarf colour" changes.
  Sparks are earned in a run and banked at game over (`lj_sparks`), outfits
  and the equipped one persist as `lj_owned` / `lj_outfit`. The wardrobe is on
  the title screen and the pause menu (C mid-run auto-pauses); digits map 1-4
  to outfits and 5-7 to backgrounds.
- **Sceneries** (`src/world.js`): add an entry to `THEMES` with sky/far/mid/
  near/ground builders (each returns a canvas, mid returns `{c, vents}`) plus
  `rain`, `mist`, `cars`, `poleGap`, `poleStyle` and a `wire` palette. The
  parallax pipeline, wire/pole generation and physics are shared and must not
  be forked per scenery. `poleGap` only widens spans (farmland is sparse on
  purpose); jump/landing rules must stay identical across sceneries.
  Selection: V on the title screen, persisted as `lj_scenery`.
- **Window dressing** (`src/world.js`, `dressWindow`): mascot sticker, torn
  posters, faded advert, ticket stub and scuffs are baked into the frame/glass
  canvases once — decorative only, never interactive, and kept low-contrast so
  they do not compete with the action.
- **Character preview** (`preview.html` + `src/preview.js`): open it directly
  to review states frame by frame with the same render code the game uses
  (1-7 state, left/right step, space play, [ ] rate, T tail debug, O outfit).

## Verification workflow

- Headless Chrome screenshots are the visual check:
  `chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1280,720 --virtual-time-budget=9000 --screenshot=out.png "file:///D:/Fake%20desktop/LineJumper/index.html?mode=shot&pose=run&shot=14&seed=1337"`
  Add `&zoom=5&ox=142&oy=100` to inspect the character up close.
- `?mode=test` must print `STATUS: PASS` with zero runtime/art errors, jumps
  performed = jumps issued, and no gap-fall deaths.
- Node DOM-stub harness (`ljsim.js`, `ljlong.js` in the temp dir) runs
  3-minute auto-play across several seeds; expect 0 gap failures and at most
  the occasional obstacle trip.
- `node --check` equivalent: extract the inline script and compile it with
  `new Function(src)`.

## Git rules

- Commit after **every verified milestone or fix** — one focused commit each,
  not one giant commit.
- Commit messages: imperative subject line describing the behaviour change
  (e.g. "Rebuild runner sprite as lean noir silhouette"), plus a body that
  says in plain language what changed and how it was verified.
- Remote: `https://github.com/Right93/LineJumper_DaGame.git`, branch `main`.
  Push every commit. Auth is handled by Git Credential Manager; never put
  tokens in files, config, or commit messages.
