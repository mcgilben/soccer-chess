const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const VARIANTS = {
  standard: {
    name: 'standard',
    maxPliesWithoutGoal: 100,
    goalFiles: ['d', 'e', 'f'],
    goalsToWin: 1,
  },
  extended: {
    name: 'extended',
    maxPliesWithoutGoal: 150,
    goalFiles: ['c', 'd', 'e', 'f'],
    goalsToWin: 2,
  },
};

function toCoord(fileIdx, rankIdx) {
  return `${FILES[fileIdx]}${RANKS[rankIdx]}`;
}

function fromCoord(coord) {
  const fileIdx = FILES.indexOf(coord[0]);
  const rankIdx = RANKS.indexOf(coord[1]);
  if (fileIdx === -1 || rankIdx === -1 || coord.length !== 2) {
    throw new Error(`Invalid coordinate: ${coord}`);
  }
  return { fileIdx, rankIdx };
}

function insideBoard(fileIdx, rankIdx) {
  return fileIdx >= 0 && fileIdx < 8 && rankIdx >= 0 && rankIdx < 8;
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function createInitialState(variantName = 'standard') {
  const variant = resolveVariant(variantName);

  const pieces = [
    ...backRank('white', '1'),
    ...pawnRank('white', '2'),
    ...pawnRank('black', '7'),
    ...backRank('black', '8'),
  ];

  const whiteKing = pieces.find((piece) => piece.team === 'white' && piece.type === 'king');

  return {
    board: { files: FILES.slice(), ranks: RANKS.slice() },
    pieces,
    ball: {
      holderPieceId: whiteKing.id,
      lastTouchedBy: 'white',
      goals: { white: 0, black: 0 },
    },
    turn: 'white',
    plyCountWithoutGoal: 0,
    moveNumber: 1,
    variant,
    history: [],
  };
}

function backRank(team, rank) {
  const order = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  return order.map((type, idx) => ({
    id: `${team}-${type}-${idx + 1}`,
    team,
    type,
    position: `${FILES[idx]}${rank}`,
  }));
}

function pawnRank(team, rank) {
  return FILES.map((file, idx) => ({
    id: `${team}-pawn-${idx + 1}`,
    team,
    type: 'pawn',
    position: `${file}${rank}`,
  }));
}

function resolveVariant(variantOrName) {
  if (!variantOrName) return VARIANTS.standard;
  if (typeof variantOrName === 'string') {
    const variant = VARIANTS[variantOrName];
    if (!variant) throw new Error(`Unknown variant: ${variantOrName}`);
    return variant;
  }
  return variantOrName;
}

function getPieceById(state, id) {
  return state.pieces.find((piece) => piece.id === id);
}

function pieceAt(state, coord) {
  return state.pieces.find((piece) => piece.position === coord);
}

function getLegalMoves(state) {
  if (getGameStatus(state).status !== 'ongoing') return [];

  const moves = [];
  for (const piece of state.pieces) {
    if (piece.team !== state.turn) continue;

    const pieceMoves = getPieceMovementMoves(state, piece);
    moves.push(...pieceMoves);

    const hasBall = state.ball.holderPieceId === piece.id;
    if (hasBall) {
      moves.push(...getPassMoves(state, piece));
      moves.push(...getShotMoves(state, piece));
    }
  }
  return moves;
}

function getPieceMovementMoves(state, piece) {
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(state, piece);
    case 'knight':
      return getKnightMoves(state, piece);
    case 'bishop':
      return getSlidingMoves(state, piece, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    case 'rook':
      return getSlidingMoves(state, piece, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
    case 'queen':
      return getSlidingMoves(state, piece, [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    case 'king':
      return getKingMoves(state, piece);
    default:
      return [];
  }
}

function getPawnMoves(state, piece) {
  const { fileIdx, rankIdx } = fromCoord(piece.position);
  const dir = piece.team === 'white' ? 1 : -1;
  const startRank = piece.team === 'white' ? 1 : 6;
  const moves = [];

  const forwardOne = [fileIdx, rankIdx + dir];
  if (insideBoard(...forwardOne) && !pieceAt(state, toCoord(...forwardOne))) {
    moves.push(moveAction(piece, toCoord(...forwardOne)));

    const forwardTwo = [fileIdx, rankIdx + dir * 2];
    if (rankIdx === startRank && !pieceAt(state, toCoord(...forwardTwo))) {
      moves.push(moveAction(piece, toCoord(...forwardTwo)));
    }
  }

  for (const offset of [-1, 1]) {
    const target = [fileIdx + offset, rankIdx + dir];
    if (!insideBoard(...target)) continue;
    const coord = toCoord(...target);
    const occupant = pieceAt(state, coord);
    if (occupant && occupant.team !== piece.team) {
      moves.push(moveAction(piece, coord, occupant.id));
    }
  }

  return moves;
}

function getKnightMoves(state, piece) {
  const { fileIdx, rankIdx } = fromCoord(piece.position);
  const offsets = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
  const moves = [];
  for (const [dx, dy] of offsets) {
    const target = [fileIdx + dx, rankIdx + dy];
    if (!insideBoard(...target)) continue;
    const coord = toCoord(...target);
    const occupant = pieceAt(state, coord);
    if (!occupant || occupant.team !== piece.team) {
      moves.push(moveAction(piece, coord, occupant?.id));
    }
  }
  return moves;
}

function getKingMoves(state, piece) {
  const { fileIdx, rankIdx } = fromCoord(piece.position);
  const moves = [];
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      if (!dx && !dy) continue;
      const target = [fileIdx + dx, rankIdx + dy];
      if (!insideBoard(...target)) continue;
      const coord = toCoord(...target);
      const occupant = pieceAt(state, coord);
      if (!occupant || occupant.team !== piece.team) {
        moves.push(moveAction(piece, coord, occupant?.id));
      }
    }
  }
  return moves;
}

function getSlidingMoves(state, piece, directions) {
  const { fileIdx, rankIdx } = fromCoord(piece.position);
  const moves = [];
  for (const [dx, dy] of directions) {
    let x = fileIdx + dx;
    let y = rankIdx + dy;
    while (insideBoard(x, y)) {
      const coord = toCoord(x, y);
      const occupant = pieceAt(state, coord);
      if (!occupant) {
        moves.push(moveAction(piece, coord));
      } else {
        if (occupant.team !== piece.team) {
          moves.push(moveAction(piece, coord, occupant.id));
        }
        break;
      }
      x += dx;
      y += dy;
    }
  }
  return moves;
}

function getPassMoves(state, piece) {
  const from = fromCoord(piece.position);
  const teammateTargets = state.pieces.filter((target) => target.team === piece.team && target.id !== piece.id);
  const moves = [];

  for (const target of teammateTargets) {
    const to = fromCoord(target.position);
    const direction = normalizeDirection(to.fileIdx - from.fileIdx, to.rankIdx - from.rankIdx);
    if (!direction) continue;
    if (!isPathClear(state, piece.position, target.position, direction, true)) continue;

    moves.push({
      type: 'pass',
      pieceId: piece.id,
      from: piece.position,
      to: target.position,
      targetPieceId: target.id,
    });
  }

  return moves;
}

function getShotMoves(state, piece) {
  const { goalFiles } = resolveVariant(state.variant);
  const goalRank = piece.team === 'white' ? '8' : '1';
  const moves = [];

  for (const goalFile of goalFiles) {
    const target = `${goalFile}${goalRank}`;
    const from = fromCoord(piece.position);
    const to = fromCoord(target);
    const direction = normalizeDirection(to.fileIdx - from.fileIdx, to.rankIdx - from.rankIdx);
    if (!direction) continue;
    if (!isPathClear(state, piece.position, target, direction, false)) continue;

    moves.push({
      type: 'shot',
      pieceId: piece.id,
      from: piece.position,
      to: target,
    });
  }

  return moves;
}

function normalizeDirection(dx, dy) {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (dx === 0 && dy === 0) return null;

  if (dx === 0) return [0, dy / absY];
  if (dy === 0) return [dx / absX, 0];
  if (absX === absY) return [dx / absX, dy / absY];
  return null;
}

function isPathClear(state, fromCoordStr, toCoordStr, [dx, dy], allowTargetOccupant) {
  const from = fromCoord(fromCoordStr);
  const to = fromCoord(toCoordStr);
  let x = from.fileIdx + dx;
  let y = from.rankIdx + dy;

  while (insideBoard(x, y)) {
    const coord = toCoord(x, y);
    if (coord === toCoordStr) {
      if (allowTargetOccupant) return true;
      return !pieceAt(state, coord);
    }
    if (pieceAt(state, coord)) return false;
    x += dx;
    y += dy;
  }

  return false;
}

function moveAction(piece, to, capturedPieceId = null) {
  return {
    type: 'move',
    pieceId: piece.id,
    from: piece.position,
    to,
    capturedPieceId,
  };
}

function movesEqual(candidate, move) {
  if (!candidate || !move || candidate.type !== move.type) return false;
  if (candidate.pieceId !== move.pieceId || candidate.from !== move.from || candidate.to !== move.to) {
    return false;
  }

  if (candidate.type === 'move') {
    return (candidate.capturedPieceId ?? null) === (move.capturedPieceId ?? null);
  }

  if (candidate.type === 'pass') {
    return candidate.targetPieceId === move.targetPieceId;
  }

  return candidate.type === 'shot';
}

function applyMove(state, move) {
  const legal = getLegalMoves(state);
  if (!legal.some((candidate) => movesEqual(candidate, move))) {
    throw new Error('Illegal move');
  }

  const next = cloneState(state);
  next.variant = resolveVariant(next.variant);

  const piece = getPieceById(next, move.pieceId);
  if (!piece) throw new Error(`Unknown piece: ${move.pieceId}`);

  if (move.type === 'move') {
    if (move.capturedPieceId) {
      const idx = next.pieces.findIndex((p) => p.id === move.capturedPieceId);
      if (idx !== -1) {
        const captured = next.pieces[idx];
        next.pieces.splice(idx, 1);
        if (next.ball.holderPieceId === captured.id) {
          next.ball.holderPieceId = piece.id;
        }
      }
    }
    piece.position = move.to;
    if (next.ball.holderPieceId === piece.id) {
      next.ball.lastTouchedBy = piece.team;
    }
    next.plyCountWithoutGoal += 1;
  }

  if (move.type === 'pass') {
    next.ball.holderPieceId = move.targetPieceId;
    next.ball.lastTouchedBy = piece.team;
    next.plyCountWithoutGoal += 1;
  }

  if (move.type === 'shot') {
    next.ball.goals[piece.team] += 1;
    next.ball.lastTouchedBy = piece.team;
    next.plyCountWithoutGoal = 0;
    const keeper = next.pieces.find((p) => p.type === 'king' && p.team === piece.team);
    if (keeper) next.ball.holderPieceId = keeper.id;
  }

  next.turn = next.turn === 'white' ? 'black' : 'white';
  next.moveNumber += 1;
  next.history.push(move);

  return next;
}

function getGameStatus(state) {
  const variant = resolveVariant(state.variant);
  if (state.ball.goals.white >= variant.goalsToWin) {
    return { status: 'win', winner: 'white', reason: 'goal-target-reached' };
  }
  if (state.ball.goals.black >= variant.goalsToWin) {
    return { status: 'win', winner: 'black', reason: 'goal-target-reached' };
  }

  if (state.plyCountWithoutGoal >= variant.maxPliesWithoutGoal) {
    return { status: 'draw', winner: null, reason: 'no-goal-limit' };
  }

  const sideHasPieces = state.pieces.some((p) => p.team === state.turn);
  if (!sideHasPieces) {
    return { status: 'win', winner: state.turn === 'white' ? 'black' : 'white', reason: 'elimination' };
  }

  const moves = internalGetTurnMoves(state);
  if (moves.length === 0) {
    return { status: 'draw', winner: null, reason: 'stalemate' };
  }

  return { status: 'ongoing', winner: null, reason: null };
}

function internalGetTurnMoves(state) {
  const moves = [];
  for (const piece of state.pieces) {
    if (piece.team !== state.turn) continue;
    moves.push(...getPieceMovementMoves(state, piece));
    if (state.ball.holderPieceId === piece.id) {
      moves.push(...getPassMoves(state, piece));
      moves.push(...getShotMoves(state, piece));
    }
  }
  return moves;
}

module.exports = {
  FILES,
  RANKS,
  VARIANTS,
  createInitialState,
  getLegalMoves,
  applyMove,
  getGameStatus,
  fromCoord,
  toCoord,
};
