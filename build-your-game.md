# Build your game

Thanks for helping out! **Kids Games** is a set of open-access (no login),
self-hosted browser games for **kids aged 5–10** that train four kinds of skills —
**aptitude**, **memory**, **analytic**, and **typing** — with a parent analytics
dashboard to help track focus, practise and repeat.

This guide covers the **code structure**, **setup**, **how to add a new game (with
Claude Code)**, and the **PR standards** to follow before raising a pull request.

> The deeper engineering conventions live in [`CLAUDE.md`](./CLAUDE.md) — please read
> it before changing anything. This file is the friendly on-ramp; `CLAUDE.md` is the
> source of truth for the architecture; and [`game-principles.md`](./game-principles.md)
> explains *why* we design games the way we do (child psychology + behaviour
> analysis). Read it before designing a new game.

---

## Code structure

This is a [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/) monorepo.
Games render on the author's own [`@invana/canvas`](https://www.npmjs.com/package/@invana/canvas)
(WebGPU/pixi) engine; UI uses the Invana design kit (`@invana/ui`, `@invana/forms`).

```
apps/
  web/                 # @kids/web        — Vite + React app: routing + per-game screens
packages/
  game-core/           # @kids/game-core   — pure game rules (no React/DOM), unit-tested, seedable RNG
  gamification/        # @kids/gamification — levels, star scoring, progression, stickers, stats
  storage/             # @kids/storage     — zustand + localStorage progress & settings (NO auth)
  game-engine/         # @kids/game-engine — React <GameCanvas> + GameBoard facade over @invana/canvas; sound + speech
  ui/                  # @kids/ui          — design-kit screens: AppShell, GameLayout, GameHud, Buddy, ...
  typescript-config/   # @repo/typescript-config — shared tsconfig
```

A few conventions worth knowing up front:

- **Pure logic lives in `game-core`**, gets scored/levelled in `gamification`, and is
  persisted in `storage`. Keep game rules pure and unit-tested — inject the RNG so
  tests are deterministic.
- **Games never touch pixi directly.** They go through `@kids/game-engine`'s
  `<GameCanvas>` / `GameBoard` facade (`addTile` / `addCircle` / `onTap` / animations).
  Emoji, letters and numbers render via the engine's native glyph layer — **no image
  assets**.
- **Internal `@kids/*` packages export `src/index.ts` directly** (no per-package build
  step); Vite / vitest / tsc compile the source.
- **Everything must work on both touch and keyboard**, in light/dark, with sound and
  reduced-motion toggles. Big tap targets, generous spacing, minimal reading
  (emoji + colour + voice carry the meaning).

---

## Setup

Requirements: **Node ≥ 18** and **pnpm 9** (the repo pins `pnpm@9.0.0`).

```bash
pnpm install
pnpm dev          # → http://localhost:5173
```

Useful checks (all are run in CI — run them locally before you push):

```bash
pnpm test         # unit tests (game-core, gamification, storage)
pnpm check-types  # type-check every package
pnpm build        # production build of the app
pnpm lint         # lint every package
```

---

## Creating a new game (with Claude Code)

The fastest path is to let [Claude Code](https://claude.com/claude-code) do the wiring
while you steer. The repo ships a [`CLAUDE.md`](./CLAUDE.md) that Claude reads
automatically, so it already knows the conventions.

A good prompt describes the **game, the skill it trains, and the inputs**, e.g.:

> "Add a **Spatial Span (Corsi)** game to the analytic category: the board flashes a
> sequence of tiles, then the child taps them back in order. Follow the existing Simon
> (`colors`) game for structure. Make sure it works with both touch and keyboard."

Whether you (or Claude) build it, a new game touches the same six places — follow the
existing **Match / Simon / Keyboard** games as templates:

1. **Pure rules + types** in `packages/game-core/src/games/<game>.ts` (+ a `*.test.ts`
   beside it; inject the RNG for determinism).
2. **A difficulty curve** in `packages/gamification/src/levels.ts`, any content in
   `content.ts`, and scoring metrics in `scoring.ts`.
3. **A screen** in `apps/web/src/games/<game>/index.tsx` that wires
   `game-core` ↔ `GameBoard` ↔ `gamification` ↔ `storage`, wrapped in
   `<AppShell><GameLayout hud={<GameHud/>} side={settings.buddyPosition} …>`.
4. **Register it** in `apps/web/src/games/registry.ts` and the `GameRoute` switch.
5. **Wire feedback** — Buddy's `cheer()` / `retry()` via `useFeedback()`, plus speech
   (`speakYay` / `speakCheer` / `speakRetry`) and SFX, all gated on `settings.sound`.
   Give Buddy a per-game `idleMessage`.
6. **Big targets + generous `gridCells` gaps**; verify **both touch and keyboard** work.

Then prove it out:

```bash
pnpm test && pnpm check-types && pnpm build
```

---

## Raising a PR

1. **Fork** the repo (or branch, if you have access) and create a topic branch off
   `main`:

   ```bash
   git checkout -b feat/spatial-span
   ```

2. Make your change, keeping commits small and focused. Run the full local check
   suite (below) — CI runs the same checks, so green locally means green in CI.

3. **Push** and open a PR against `rrmerugu/kids-games` `main`. In the description,
   include:
   - **What** changed and **why** (link any related issue).
   - The **skill category** if it's a new/changed game (aptitude / memory / analytic / typing).
   - **Screenshots or a short clip** of the game on both a touch and a keyboard view
     when there's a visible/UX change.
   - A note that you tested **both input modes** and **light + dark** themes.

---

## PR standards (check before raising)

Please tick these off before requesting review:

- [ ] **All checks pass locally:** `pnpm test`, `pnpm check-types`, `pnpm build`, `pnpm lint`.
- [ ] **Tests included** for any new/changed `game-core` or `gamification` logic
      (pure functions, deterministic via injected RNG — no flakiness).
- [ ] **Both input modes work** — touch (big tap targets, no hover-only interactions)
      **and** keyboard. Layouts hold in portrait and landscape.
- [ ] **Accessibility respected** — sound on/off, reduced motion, high-contrast,
      Buddy side, and light/dark/system theme all behave; nothing relies on reading.
- [ ] **No new image assets** — emoji/letters/numbers go through the engine glyph layer.
- [ ] **Architecture boundaries kept** — pure rules in `game-core`, scoring in
      `gamification`, persistence in `storage`, rendering only via `@kids/game-engine`.
      No direct pixi usage; no `@invana/canvas-react`.
- [ ] **TypeScript hygiene** — `import type` for types (`verbatimModuleSyntax` is on),
      `override` marked where required; no `any` escapes or `@ts-ignore` without a reason.
- [ ] **No auth / no tracking of children** — storage stays local (zustand +
      localStorage). Parent analytics stay on-device.
- [ ] **Scoped, readable diff** — matches the surrounding code's style, naming, and
      comment density; no unrelated reformatting.

Small fixes (typos, copy, a single-file tweak) don't need the full ceremony — just keep
the checks green and describe the change clearly.

Thanks for contributing! 🚀
