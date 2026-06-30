# Kids Brain Games

Open-access (no login) brain games for young kids, rendered with
[`@invana/canvas`](https://www.npmjs.com/package/@invana/canvas) and styled with the
Invana design kit (`@invana/ui`, `@invana/forms`). Tuned for a pre-reader (~age 6):
big tap targets, no required reading, colour + sound feedback, stars and level progress.

## Pilot games

| Game | Skill it exercises |
|---|---|
| **Match** (Memory Match / pairs) | Visual recognition memory |
| **Colors** (Simon) | Sequential / working memory |
| **Letters** (Keyboard Trainer) | Letter recognition + keyboard/motor skills |

> These are established cognitive *tasks*; they train/measure the named skill (broad
> "brain-training transfer" is debated in the literature).

More games (Spatial Span / Corsi, Tower of Hanoi, Schulte) can drop into the same
structure later — see `docs`/the plan.

## Getting started

```bash
pnpm install
pnpm dev        # → http://localhost:5173
```

```bash
pnpm test         # unit tests (game-core, gamification, storage)
pnpm check-types  # type-check every package
pnpm build        # production build of the app
```

## Structure (Turborepo + pnpm)

```
apps/
  web/                 # @kids/web — Vite + React app: routing + per-game screens
packages/
  game-core/           # @kids/game-core   — pure game rules (no React/DOM), unit-tested
  gamification/        # @kids/gamification — levels, star scoring, progression, stickers
  storage/             # @kids/storage     — localStorage progress (zustand), no login
  game-engine/         # @kids/game-engine — React <GameCanvas> + GameBoard over @invana/canvas
  ui/                  # @kids/ui          — shared screens on @invana/ui + @invana/forms
  typescript-config/   # @repo/typescript-config
```

Internal `@kids/*` packages export TypeScript source directly (no per-package build
step) — the app's Vite/vitest/tsc compile them.

## How it's wired to @invana/canvas

The games are shape grids, not graphs, so they use the **core engine** (not the
graph-oriented `@invana/canvas-react`). `@kids/game-engine` wraps it:

- `<GameCanvas onReady={board => …}>` creates a `Canvas`, attaches one `WorldLayer`
  (`BoardLayer`) that owns a `PrimitivesRenderer`, and hands the game a `GameBoard`.
- `GameBoard` is the game-facing facade: `addTile` / `addCircle` (centre-anchored),
  `update` / `remove` / `clear`, `onTap` / `onHover`, `gridCells`, `fit`, and canned
  `flip` / `pulse` / `shake` animations. Emoji/letters render via the engine's native
  `glyph` fill layer — no image assets.

Settings (sound / reduced-motion / palette) are a **JSON-driven form**: a
`FieldConfig[]` schema fed to `@invana/forms`' `ObjectField` via `@kids/ui`'s `JsonForm`.
