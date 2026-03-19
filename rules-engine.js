const BOARD_SIZE = 8;

const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const INITIAL_PIECES = [
  { id: "H1", team: "home", label: "H1", x: 1, y: 7 },
  { id: "H2", team: "home", label: "H2", x: 3, y: 7 },
  { id: "H3", team: "home", label: "H3", x: 5, y: 7 },
  { id: "H4", team: "home", label: "H4", x: 2, y: 6 },
  { id: "H5", team: "home", label: "H5", x: 4, y: 6 },
  { id: "A1", team: "away", label: "A1", x: 2, y: 0 },
  { id: "A2", team: "away", label: "A2", x: 4, y: 0 },
  { id: "A3", team: "away", label: "A3", x: 6, y: 0 },
  { id: "A4", team: "away", label: "A4", x: 3, y: 1 },
  { id: "A5", team: "away", label: "A5", x: 5, y: 1 },
];

const INITIAL_STATE = {
  boardSize: BOARD_SIZE,
  turn: "home",
  pieces: INITIAL_PIECES,
  ball: {
    carrierId: "H3",
    x: 5,
    y: 7,
  },
  history: [],
};

export function createInitialState() {
  return structuredClone(INITIAL_STATE);
}

export function getBoardSize(state) {
  return state.boardSize;
}

export function getPieces(state) {
  return state.pieces;
}

export function getTurn(state) {
  return state.turn;
}

export function getMoveHistory(state) {
  return state.history;
}

export function getBallState(state) {
  return state.ball;
}

export function getPieceAt(state, square) {
  return state.pieces.find((piece) => piece.x === square.x && piece.y === square.y) ?? null;
}

export function getLegalDestinations(state, fromSquare) {
  const selectedPiece = getPieceAt(state, fromSquare);
  if (!selectedPiece || selectedPiece.team !== state.turn) {
    return [];
  }

  const moves = [];
  for (const [dx, dy] of DIRECTIONS) {
    const x = selectedPiece.x + dx;
    const y = selectedPiece.y + dy;
    if (!inBounds(x, y, state.boardSize)) {
      continue;
    }

    const blocker = getPieceAt(state, { x, y });
    if (!blocker) {
      moves.push({ x, y });
    }
  }

  return moves;
}

export function tryMove(state, fromSquare, toSquare) {
  const selectedPiece = getPieceAt(state, fromSquare);
  if (!selectedPiece) {
    return invalidResult(state, "Select one of your players first.");
  }

  if (selectedPiece.team !== state.turn) {
    return invalidResult(state, `It's ${capitalize(state.turn)} team's turn.`);
  }

  const legalDestinations = getLegalDestinations(state, fromSquare);
  const isLegal = legalDestinations.some((destination) => {
    return destination.x === toSquare.x && destination.y === toSquare.y;
  });

  if (!isLegal) {
    return invalidResult(state, 'That move is not legal. Choose a highlighted square.');
  }

  const nextState = structuredClone(state);
  const movingPiece = nextState.pieces.find((piece) => piece.id === selectedPiece.id);
  movingPiece.x = toSquare.x;
  movingPiece.y = toSquare.y;

  if (nextState.ball.carrierId === movingPiece.id) {
    nextState.ball.x = movingPiece.x;
    nextState.ball.y = movingPiece.y;
  } else if (nextState.ball.carrierId === null && nextState.ball.x === movingPiece.x && nextState.ball.y === movingPiece.y) {
    nextState.ball.carrierId = movingPiece.id;
  }

  nextState.turn = nextState.turn === 'home' ? 'away' : 'home';
  nextState.history.push(formatMove(selectedPiece, fromSquare, toSquare));

  return {
    ok: true,
    state: nextState,
    message: '',
  };
}

function formatMove(piece, fromSquare, toSquare) {
  return `${piece.label}: ${toNotation(fromSquare)} → ${toNotation(toSquare)}`;
}

function toNotation(square) {
  return `${String.fromCharCode(65 + square.x)}${BOARD_SIZE - square.y}`;
}

function invalidResult(state, message) {
  return {
    ok: false,
    state,
    message,
  };
}

function inBounds(x, y, boardSize) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}
