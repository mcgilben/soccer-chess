const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createInitialState,
  getLegalMoves,
  applyMove,
  getGameStatus,
} = require('../src/gameLogic');

test('initial setup has standard chess formation and ball on white king', () => {
  const state = createInitialState();
  assert.equal(state.pieces.length, 32);
  const whiteKing = state.pieces.find((p) => p.team === 'white' && p.type === 'king');
  assert.equal(whiteKing.position, 'e1');
  assert.equal(state.ball.holderPieceId, whiteKing.id);
});

test('legal move generation includes normal moves and passes for ball holder', () => {
  const state = createInitialState();
  const legal = getLegalMoves(state);
  assert.ok(legal.some((m) => m.type === 'move' && m.to === 'a3'));
  assert.ok(legal.some((m) => m.type === 'pass'));
});

test('capturing ball holder transfers possession', () => {
  const state = {
    ...createInitialState(),
    pieces: [
      { id: 'white-queen', type: 'queen', team: 'white', position: 'd1' },
      { id: 'black-rook', type: 'rook', team: 'black', position: 'd8' },
    ],
    ball: { holderPieceId: 'white-queen', lastTouchedBy: 'white', goals: { white: 0, black: 0 } },
    turn: 'black',
    plyCountWithoutGoal: 0,
    moveNumber: 1,
    history: [],
  };

  const move = { type: 'move', pieceId: 'black-rook', from: 'd8', to: 'd1', capturedPieceId: 'white-queen' };
  const next = applyMove(state, move);
  assert.equal(next.ball.holderPieceId, 'black-rook');
});

test('shot updates score and can end game', () => {
  const state = {
    ...createInitialState(),
    pieces: [
      { id: 'white-queen', type: 'queen', team: 'white', position: 'e7' },
      { id: 'white-king-1', type: 'king', team: 'white', position: 'a1' },
      { id: 'black-king-1', type: 'king', team: 'black', position: 'h8' },
    ],
    ball: { holderPieceId: 'white-queen', lastTouchedBy: 'white', goals: { white: 0, black: 0 } },
    turn: 'white',
    plyCountWithoutGoal: 6,
    moveNumber: 10,
    history: [],
  };

  const shot = getLegalMoves(state).find((m) => m.type === 'shot' && m.to === 'e8');
  assert.ok(shot);
  const next = applyMove(state, shot);
  assert.equal(next.ball.goals.white, 1);
  assert.equal(getGameStatus(next).status, 'win');
});

test('draw is detected after no-goal ply limit', () => {
  const state = createInitialState();
  state.plyCountWithoutGoal = state.variant.maxPliesWithoutGoal;
  const status = getGameStatus(state);
  assert.equal(status.status, 'draw');
});
