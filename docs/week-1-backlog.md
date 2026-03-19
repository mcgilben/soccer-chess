# Week 1 Backlog: Foundations + Local Play Loop

## Week 1 objective

Build the first playable local prototype with a deterministic game engine, a browser board UI, and enough tooling to support multiplayer work in Week 2.

## Definition of done for Week 1

By the end of the week, the repo should contain:

- A monorepo skeleton for web, game server, and shared packages.
- A deterministic `game-core` package that can validate and apply moves.
- A basic browser UI that renders the board and supports hot-seat play.
- Tests covering core rules, turn order, and win/draw detection.
- Seed documentation for the event schema and state model.

---

## Day 1 — Repository bootstrap and architecture alignment

### Goals

- Create the monorepo scaffolding.
- Align on domain language and source-of-truth packages.
- Set up formatting, linting, and TypeScript project references.

### Tasks

- Initialize package management (`pnpm` recommended).
- Create top-level folders:
  - `apps/web`
  - `apps/game-server`
  - `packages/game-core`
  - `packages/types`
  - `packages/config`
- Add root config files:
  - `package.json`
  - `pnpm-workspace.yaml`
  - `tsconfig.base.json`
  - `.editorconfig`
  - `.gitignore`
  - optional lint/format config
- Document core vocabulary:
  - board coordinates
  - piece types
  - ball state
  - possession rules
  - turn semantics
- Decide the canonical shape of `GameState`, `MoveIntent`, and `MoveResult`.

### Deliverables

- Empty workspace boots successfully.
- Shared TypeScript config resolves imports across packages.
- Initial architecture docs committed.

### Exit criteria

- `pnpm install` succeeds.
- TypeScript can build at least the empty workspace packages.

---

## Day 2 — Core state model and serialization

### Goals

- Define the state model before writing move logic.
- Ensure state is deterministic and serializable.

### Tasks

- Implement `GameState` and related enums/types.
- Define board representation strategy:
  - coordinate map or 2D array
  - immutable update approach
- Add serialization helpers:
  - `serializeState(state)`
  - `deserializeState(payload)`
  - `hashState(state)`
- Add initial-state factory:
  - `createInitialState(config?)`
- Define result and metadata fields:
  - active side
  - move number / ply
  - clocks placeholder
  - winner / draw reason placeholder

### Deliverables

- Shared state types in `packages/types`.
- Initial state helpers in `packages/game-core`.
- Snapshot fixtures for sample starting states.

### Exit criteria

- Same starting state always hashes to the same value.
- Serialization round-trip produces identical state.

---

## Day 3 — Rules engine: validation path

### Goals

- Reject illegal actions consistently and explain why.
- Separate validation from state mutation.

### Tasks

- Implement `validateMove(state, intent)`.
- Add explicit reason codes for rejected moves, such as:
  - `NOT_YOUR_TURN`
  - `OUT_OF_BOUNDS`
  - `INVALID_PIECE`
  - `ILLEGAL_TARGET`
  - `BALL_CONTROL_REQUIRED`
  - `MATCH_FINISHED`
- Add helper validators:
  - coordinate checks
  - piece ownership checks
  - pathing checks
  - ball interaction checks
- Write unit tests for legal and illegal move scenarios.

### Deliverables

- First pass move validation.
- Error taxonomy shared with frontend/server.
- Tests for invalid move reasons.

### Exit criteria

- Illegal moves are rejected with stable, predictable error codes.
- Validation logic has no UI dependencies.

---

## Day 4 — Rules engine: apply path and game progression

### Goals

- Turn valid intents into new immutable states.
- Progress the game through turns and terminal states.

### Tasks

- Implement `applyMove(state, intent)`.
- Update board, ball position, active side, and ply count.
- Record move history entries with before/after metadata.
- Implement end-condition checks:
  - win condition
  - draw condition
  - stalemate or dead-position equivalent if relevant
- Add `applyValidatedMove` or equivalent helper for server use later.

### Deliverables

- Full state transition pipeline.
- Move log structure suitable for replay support.
- Tests for terminal-state handling.

### Exit criteria

- Given the same state and move, `applyMove` always returns the same result.
- Terminal games reject further moves.

---

## Day 5 — Web board UI and hot-seat loop

### Goals

- Render the game in the browser.
- Make the game playable locally without networking.

### Tasks

- Scaffold `apps/web` with Next.js.
- Build a board component with:
  - grid rendering
  - piece rendering
  - selected-piece state
  - legal-target highlighting
- Add a local game page that wires UI to `game-core`.
- Show status panel:
  - current side to move
  - last move
  - validation error messages
  - game-over banner
- Support reset-to-initial-state.

### Deliverables

- Local hot-seat mode in browser.
- Playable basic interface using shared rules logic.

### Exit criteria

- Two people can play from one browser session.
- Illegal moves never mutate displayed state.

---

## Day 6 — Tests, fixtures, and developer ergonomics

### Goals

- Stabilize the engine with better coverage.
- Make development loop fast for Week 2.

### Tasks

- Expand unit tests around edge cases.
- Add fixture-driven tests for complete move sequences.
- Add smoke test for web rendering.
- Add package scripts:
  - `dev`
  - `build`
  - `test`
  - `lint`
  - `typecheck`
- Add README setup instructions.

### Deliverables

- Repeatable local development scripts.
- Test coverage for the most failure-prone rule paths.

### Exit criteria

- Core packages pass tests consistently.
- New contributors can boot the project from README steps.

---

## Day 7 — Buffer, review, and Week 2 handoff

### Goals

- Fix rough edges.
- Prepare the codebase for real-time multiplayer work.

### Tasks

- Review package boundaries and remove accidental coupling.
- Refactor ambiguous type names.
- Fill documentation gaps in state and move lifecycle.
- Write a Week 2 kickoff note covering:
  - authoritative server flow
  - reconnect expectations
  - clock authority
  - room lifecycle
- Triage deferred rules issues into a backlog.

### Deliverables

- Clean baseline branch ready for multiplayer integration.
- Updated docs for server/client event flow.

### Exit criteria

- Team can start WebSocket integration without redesigning the game engine.
- Known open questions are documented rather than implicit.

---

## Suggested owner split for Week 1

### Engineer A — Game Core

- State model
- Validation logic
- Apply logic
- Unit tests

### Engineer B — Frontend

- Next.js setup
- Board rendering
- Local interaction loop
- Status and error UI

### Engineer C — Platform / Shared DX

- Monorepo bootstrap
- Tooling and configs
- Shared types package
- README and architecture docs

---

## Week 1 risks to watch

- Designing UI before the rules model is stable.
- Letting client-specific assumptions leak into `game-core`.
- Encoding rules in components instead of shared packages.
- Not versioning or hashing state early enough for Week 2 sync work.
- Delaying move rejection reason codes until after UI integration.

## Recommended daily checkpoint questions

At the end of each day, answer:

1. Can the current state model support an authoritative server without redesign?
2. Are move validation and move application still deterministic?
3. Did any web-only assumptions leak into shared packages?
4. What exact artifact is ready for the next day’s work?
