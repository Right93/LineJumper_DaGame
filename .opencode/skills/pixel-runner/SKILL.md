---
name: pixel-runner
description: Durable spec and rules for the LINE JUMPER game in D:\Fake desktop\LineJumper (index.html). Use when editing gameplay, physics, wire levels, character sprite art, or committing — covers the single-file constraint, constants, wire-level rules, and art direction.
---

# LINE JUMPER — project spec

Persistent spec for this project. **Update this file whenever a design or
physics decision is locked in.** It is the source of truth for future sessions.

## Hard constraints

- The game is exactly one self-contained file: `index.html`.
  - No external assets, no image/audio files, no CDN links, no build step, no
    bundler, no npm dependencies. Everything is drawn procedurally with
    Canvas 2D from string-array sprites and `fillRect`.
  - Vanilla ES5-style JS in a single inline `<script>`. No modules (the file
    must run from `file://`).
  - Internal resolution is 384×216, upscaled with `image-rendering: pixelated`
    (integer CSS scale, max 7×).
- Keep runtime errors at zero. The page captures `window.onerror` into
  `RUNTIME_ERRORS` and draws them on-canvas in red. Never ship with entries in
  `RUNTIME_ERRORS` or `ART_ERRORS`.
- No comments in the game code unless the user asks for them.

## Physics constants (locked)

```js
SPEED0 = 84      // starting forward speed, px/s
ACCEL  = 0.36    // px/s gained per second of run time
SPEEDMAX = 132   // hard speed cap
GRAV   = 620     // px/s^2
JUMPV  = 172     // initial jump velocity, px/s (up)
HOLDG  = 0.75    // gravity multiplier while jump is held and rising
DROP_VY = 30     // downward speed when dropping off a wire
COYOTE = 0.09    // s of grace after leaving a wire
JBUF   = 0.13    // s of jump input buffering
STEP   = 1/120   // fixed simulation step
```

Derived: tap jump ≈ 24 px apex, held jump ≈ 32 px apex, airtime ≈ 0.7 s
(one full flip). Level spacing is 18 px, so a held jump clears exactly one
level up.

## Wire-level rules

- `LEVELS = [58, 76, 94, 112, 130]` (screen y of each wire, level 0 = highest).
  `STREET_Y = 191` — reaching it is game over.
- Two kinds of wire:
  - **main line** — generated spans with sag, ramps between levels, gaps,
    obstacles and pickups. The player tracks it with `player.onMain`.
  - **deco wires** — the analytic `decoY(lvl, x)` catenary at every level,
    except where the main line replaces them or a gap punches a hole.
- Movement rules:
  - **Jump** (Space/↑): flips, lands on the same wire, across a gap, **or up
    onto a wire one level higher** if the arc genuinely clears it.
  - **Drop** (↓): deliberate stunt to the next wire below; +25 score. On the
    bottom level there is no wire below — you fall to the street (game over),
    so it doubles as an intentional run-ender.
  - Landing is only allowed on a wire that is crossed **while descending**
    (`vy > 0`).
  - Upward landings (target level < take-off level) require a genuine
    clearance: `apexY <= wireY - UP_CLEAR` (`UP_CLEAR = 6`). This is what
    separates an *intentional* jump-up from the old accidental-snag bug where
    the arc grazed a higher wire by 1–2 px. Only one level up is ever allowed
    (`minLvl = startLvl - 1`).
  - Falling/dropping can only land on wires **below** the take-off level
    (`minLvl = startLvl + 1`).
- Game over: hitting a branch/transformer obstacle, or reaching the street.
  There is no health or respawn — the run restarts from the title.
- Scoring: `distance(m) + sparks*10 + stunts*25`; best score in `localStorage`
  under `lj_best`.

## Art direction (locked)

- Palette is dusk/neon: warm smog horizon, violet sky, dark neon-lit low-rise
  Tokyo, no skyscrapers. Character art uses the `PP` palette in the script.
- **Character: lean noir silhouette, not a heavy build.**
  - Slim trench coat in cream/tan, visible lapels and a flowing tail that
    trails behind from momentum.
  - Dark bowler/fedora-style hat (rounded small crown, short brim) — **not** a
    top hat.
  - Narrow torso (6–8 px), long legs (≈10 px, one third of total height),
    small head. Total ≈ 30 px tall on a 384×216 canvas.
  - Run cycle: dynamic mid-stride, one leg kicked back and bent at the knee,
    arms swinging; front hand carries the cane.
  - Jump = tucked body rotated in 30° steps (12 prerendered rotations) with
    the cane spinning along.
- Train-window framing is mandatory: riveted frame, sill and coffee cup,
  glass reflections, scene sway. The player runs *inside* the window.
- Debug helpers that must keep working: `?mode=shot&pose=run|air|drop|fall|over|title|pause&shot=<seconds>&seed=<n>&zoom=<n>&ox=&oy=`, `?mode=test` (on-canvas self test), `?play=1`, `?tun=1`.

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
