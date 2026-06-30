# CLAUDE.md — kids-games

Guidance for working in this repo. Read this before making changes.

> **Why we build the way we do:** [`game-principles.md`](./game-principles.md) is
> the product north star — the child-psychology and behaviour-analysis reasoning
> behind the conventions below. Read it before designing a game or a UX change;
> `CLAUDE.md` is *how*, `game-principles.md` is *why*.

## Product

Open-access (**no login**) browser games that help **kids aged 5–10** build four
kinds of skills:

- **Aptitude** — general problem-solving / reasoning readiness.
- **Memory** — recognition, working, and sequential memory.
- **Analytic** — planning, logic, pattern/odd-one-out, sorting.
- **Typing** — letter recognition and keyboard fluency.

Each game should be a recognised, evidence-based cognitive task adapted for kids
(we claim it trains/measures the named skill — not broad IQ "transfer").

### Platforms — must work everywhere, touch **and** keyboard

Ship for **any modern browser**, and design every game for **both input modes**:

- **Touch devices** — iPad/Safari and phones. Big tap targets, generous spacing
  between targets (small fingers mistap), no hover-only interactions, layouts that
  work in portrait and landscape.
- **Keyboard devices** — laptops/desktops, and a **monitor/TV with a keyboard**
  (e.g. a child practising typing). Typing games are driven by real `keydown`;
  other games should stay fully playable with pointer input.

Practically: never assume one input. Canvas shapes emit taps (`shape:click`)
which also fire for mouse; keyboard games listen on `window` `keydown` and ignore
non-character keys. Avtoid tiny controls; keep hit targets large.

### Audience (5–10) UX rules

- **Minimal reading.** Convey meaning with **emoji + colour + voice** (Web Speech),
  not paragraphs. Short words are decoration, not the carrier.
- **Lots of positive feedback.** Cheer on every correct answer (a quick spoken
  "Yay!" + visual), celebrate wins. On a wrong answer, be **gentle and
  encouraging** — "Try again, good luck!" — never punishing (no harsh red flashes
  beyond a clear indicator).
- **Buddy** — a friendly mascot **assistant** in a side panel (game on the other
  side) that reacts (cheer / try-again) with a speech bubble + voice. Position
  (right/left/off) is a setting.
- **Accessibility settings**: sound on/off, reduced motion, high-contrast palette,
  Buddy side, and **light/dark/system theme**. All persisted locally.
- **Generous spacing & big targets** everywhere.

## Architecture

Turborepo + pnpm monorepo. Games render on the author's own **`@invana/canvas`**
(WebGPU/pixi) engine; UI uses the Invana design kit (`@invana/ui`, `@invana/forms`).

```
apps/web/                # @kids/web — Vite + React app: routing + per-game screens
packages/
  game-core/             # pure game rules (no React/DOM), unit-tested, seedable RNG
  gamification/          # levels, star scoring, progression, stickers, content pools
  storage/               # zustand + localStorage progress & settings (NO auth)
  game-engine/           # React <GameCanvas> + GameBoard facade over @invana/canvas; sound + speech
  ui/                    # design-kit screens: AppShell, GameLayout, GameHud, Buddy, ResultDialog, JsonForm, ...
  typescript-config/     # shared tsconfig
```

### Key conventions (follow these)

- **Use `@invana/canvas` core, NOT `@invana/canvas-react`.** The React bindings are
  graph-oriented (pull in `@invana/graph` + d3-force). Games are shape grids.
- **Games never touch pixi.** They go through `@kids/game-engine`:
  - `<GameCanvas onReady={board => …}>` mounts the canvas + one `WorldLayer`
    (`BoardLayer`) owning a `PrimitivesRenderer`, and hands over a `GameBoard`.
  - `GameBoard`: `addTile`/`addCircle` (centre-anchored), `update`/`remove`/`clear`,
    `onTap`/`onHover`, `gridCells`, `fit`, animations (`flip`/`pulse`/`shake`),
    and border highlights (`setBorder`, `breatheBorder`). Emoji/letters/numbers
    render via the engine's native `glyph` fill layer — **no image assets**.
- **Pure logic in `game-core`**, scored/levelled in `gamification`, persisted in
  `storage`. Keep game rules pure and unit-tested (inject RNG for determinism).
- **Internal `@kids/*` packages export `src/index.ts` directly** (no per-package
  build); Vite/vitest/tsc compile the source. Lib `build`/`check-types` are
  `tsc --noEmit`.
- **Feedback** runs through Buddy via `useFeedback()` (`cheer()` / `retry()`),
  spoken text (`speakYay` per correct, `speakCheer` win, `speakRetry` wrong) **and**
  non-verbal SFX (`playSuccess` correct, `playError` wrong, `playWin` round-win) —
  all from `@kids/game-engine`, gated on `settings.sound`. Call `stopSpeech()` on
  unmount. **Buddy is a cute astronaut** (`BuddyPanel` = starfield + floating
  astronaut, Clippy-style) in a side panel via `GameLayout`.
- **Ask Buddy for help**: pass `onHelp` to `GameLayout` → shows Buddy's "Help me!"
  button → a per-game hint (peek a pair / replay the moves / say the letter).
- **Turn-based games** (the game acts, then the child acts — e.g. Simon): show a
  `TurnBanner` (`👀 Watch!` / `👆 Your turn!`), update Buddy's `idleMessage`, and
  use `speakWatch` / `speakYourTurn` so kids know whose turn it is.
- **Message log**: `useFeedback()` keeps a history; `MessageFeed` renders it as a
  terminal-style, left-aligned, icon+colour log (✅ success / 🔁 try-again / 🚀
  idle) with a "Tries" count. `GameLayout` is one continuous space scene
  (`Starfield` bg + transparent canvas) with Buddy beside the board (~70/30); call
  `clear()` in each game's `setup()` to reset the log per round.
- **Parent analytics**: every round is appended as a `SessionRecord` (in
  `@kids/storage` `recordRound`); the `/parent` dashboard renders
  `computeStats(sessions, now)` from `@kids/gamification` (focus time, games,
  win rate, avg speed, retries, per-game + last-7-days + recent). `computeStats`
  is pure (pass `now`) and unit-tested.
- **Theming**: class-based dark mode. `useApplyTheme()` (app) toggles `.dark` on
  `<html>`; design-kit components switch automatically; custom surfaces use
  `dark:` variants. Canvas backgrounds pick a colour from the resolved theme.
- **No `<StrictMode>`** (it would double-init the pixi canvas).
- **Settings are a JSON-driven form**: a `FieldConfig[]` schema → `@invana/forms`
  `ObjectField` via `@kids/ui`'s `JsonForm`.
- **TypeScript**: `verbatimModuleSyntax` is on — use `import type` for types;
  `noImplicitOverride` — mark `override`.

### Adding a new game

1. Pure rules + types in `packages/game-core/src/games/<game>.ts` (+ tests).
2. A difficulty curve in `packages/gamification/src/levels.ts` and any content in
   `content.ts`; scoring metrics in `scoring.ts`.
3. A screen in `apps/web/src/games/<game>/index.tsx` that wires
   `game-core` ↔ `GameBoard` ↔ `gamification` ↔ `storage`, wrapped in
   `<AppShell><GameLayout hud={<GameHud/>} side={settings.buddyPosition} …>`.
4. Register it in `apps/web/src/games/registry.ts` and the `GameRoute` switch.
5. Wire feedback (`cheer`/`retry` + speech) and per-game `idleMessage` for Buddy.
6. Big targets + generous `gridCells` gaps; ensure both touch and keyboard work.

The deferred games to grow into (beyond the Match / Simon / Keyboard pilot):
Spatial Span (Corsi), Tower of Hanoi (analytic), Schulte (attention) — and more
across the four skill categories.

## Commands

```bash
pnpm install
pnpm dev          # → http://localhost:5173
pnpm test         # unit tests (game-core, gamification, storage)
pnpm check-types  # type-check every package
pnpm build        # production build of the app
```

## Source of truth

`@invana/canvas` lives at `/Users/ravi.merugu/Projects/invana/canvas` (published:
`@invana/canvas@0.0.7`, `@invana/ui|forms|styling@0.0.12`). Inspect its `dist`
type definitions for the exact engine API.

## Git

Don't commit or push unless explicitly asked in the current message.
