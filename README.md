# Soccer Chess

Minimal runnable scaffold for a Soccer Chess game with a clean split between UI and shared game contracts.

## Project structure

- `frontend/`
  - `main.js`: board-rendering entrypoint
  - `game-state.js`: state container + square/piece helpers
  - `styles.css`: minimal styling
- `shared/`
  - `types.js`: shared enums-like constants
  - `pieces.js`: initial piece definitions + symbols
  - `moves.js`: move shape contract and stub validator
- `index.html`: app shell

## Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - build production bundle
- `npm run preview` - preview production build

## Gameplay rules summary (current)

This scaffold intentionally implements only the basics:

- Renders an 8x8 board.
- Places two kings and one ball as placeholder pieces.
- Allows selecting a piece to show state wiring.
- Does **not** yet implement move legality, turns, scoring, or soccer-specific victory logic.

The `shared/` contracts and `frontend/game-state.js` are designed so complete rule logic can be added without changing the module boundaries.
