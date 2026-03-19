# Soccer Chess Game Logic

Pure game-logic module with no UI dependencies.

## API

- `createInitialState(variantName?)`
- `getLegalMoves(state)`
- `applyMove(state, move)`
- `getGameStatus(state)`

## Variant support

Built-in variants:

- `standard`: first goal wins, draw after 100 plies without a goal.
- `extended`: first to 2 goals wins, draw after 150 plies without a goal.

## Move types

`getLegalMoves` returns move objects:

- Piece movement: `{ type: 'move', pieceId, from, to, capturedPieceId? }`
- Ball pass: `{ type: 'pass', pieceId, from, to, targetPieceId }`
- Shot: `{ type: 'shot', pieceId, from, to }`
