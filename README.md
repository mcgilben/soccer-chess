# Soccer Chess Rules Engine

This repository contains a lightweight rules engine and focused automated tests for a soccer-chess hybrid.

## Run locally

```bash
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
