# Soccer Chess

This prototype adds a profile-driven rules configuration system and a pre-game selector.
# Soccer Chess Rules Engine

This repository contains a lightweight rules engine and focused automated tests for a soccer-chess hybrid.

## Run locally

```bash
python3 -m http.server 4173
```

Then visit <http://localhost:4173>.
python -m unittest discover -s tests -p "test_*.py"
```

## Ruleset interpretation

The implementation uses the following concrete interpretation:

- **Board and pieces**: 6x6 board with chess-like pieces (`king`, `rook`, `bishop`, `knight`).
- **Move generation**: each piece uses its chess movement constraints. Rook and bishop cannot move through occupied squares. Moves into occupied destination squares are illegal (no captures).
- **Ball and possession**:
  - A team gains possession by moving onto the loose ball square.
  - If a team already has possession and moves the ball-carrying piece, the ball moves with that piece.
- **Scoring**:
  - Team A scores by moving the carrier to `(0, 2)`.
  - Team B scores by moving the carrier to `(5, 2)`.
  - On a goal, score increments, possession clears, and the ball resets to `(3, 3)`.
- **Repeated states**: a state is considered repeated when the same full state appears for at least the third time (candidate appears at least twice in history).

## Known deviations from source descriptions

Because no canonical upstream soccer-chess specification is included in this repository, the engine intentionally adopts a minimal deterministic subset suitable for testing:

- No captures, tackles, passing, fouls, or check/checkmate semantics.
- Turn management and referee logic are outside the scope of this rules-engine module.
- Repetition handling is exposed as a helper (`is_repeated_state`) and does not auto-end the game.
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
Planning documents for a web-first online multiplayer soccer-chess game.

## Included docs

- `docs/week-1-backlog.md`: a day-by-day execution plan for the first week of V1 development.
- `docs/starter-folder-structure-and-message-schema.md`: a starter monorepo layout plus shared WebSocket message contracts.

## Recommended V1 platform

- **Client:** Next.js + React + TypeScript
- **Game server:** Node.js + TypeScript + WebSockets
- **Database:** Postgres
- **Ephemeral state / queueing:** Redis
- **Shared packages:** game rules, message types, and configuration

This setup is optimized for browser-based play, fast iteration, and authoritative real-time multiplayer.
