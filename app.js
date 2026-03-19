import {
  createInitialState,
  getBallState,
  getBoardSize,
  getLegalDestinations,
  getMoveHistory,
  getPieceAt,
  getTurn,
  tryMove,
} from './rules-engine.js';

const boardElement = document.getElementById('board');
const turnIndicatorElement = document.getElementById('turn-indicator');
const historyElement = document.getElementById('move-history');
const feedbackElement = document.getElementById('feedback');

let state = createInitialState();
let selectedSquare = null;
let legalDestinations = [];

render();

function render() {
  renderTurnIndicator();
  renderBoard();
  renderMoveHistory();
}

function renderTurnIndicator() {
  const turn = getTurn(state);
  turnIndicatorElement.textContent = `${capitalize(turn)} team's turn`;
}

function renderBoard() {
  const boardSize = getBoardSize(state);
  boardElement.innerHTML = '';

  for (let y = 0; y < boardSize; y += 1) {
    for (let x = 0; x < boardSize; x += 1) {
      const square = { x, y };
      const squareElement = document.createElement('button');
      squareElement.type = 'button';
      squareElement.className = `square ${(x + y) % 2 === 0 ? 'light' : 'dark'}`;
      squareElement.setAttribute('role', 'gridcell');
      squareElement.dataset.x = String(x);
      squareElement.dataset.y = String(y);

      if (isSelected(square)) {
        squareElement.classList.add('selected');
      }

      if (isLegalDestination(square)) {
        squareElement.classList.add('legal');
      }

      squareElement.addEventListener('click', () => handleSquareClick(square));

      const piece = getPieceAt(state, square);
      if (piece) {
        squareElement.appendChild(renderPiece(piece));
      } else {
        const ball = getBallState(state);
        if (ball.carrierId === null && ball.x === x && ball.y === y) {
          const marker = document.createElement('span');
          marker.className = 'ball-marker';
          marker.textContent = '⚽';
          squareElement.appendChild(marker);
        }
      }

      boardElement.appendChild(squareElement);
    }
  }
}

function renderPiece(piece) {
  const pieceElement = document.createElement('span');
  pieceElement.className = `piece ${piece.team}`;
  pieceElement.textContent = piece.label;

  const ball = getBallState(state);
  if (ball.carrierId === piece.id) {
    const badge = document.createElement('span');
    badge.className = 'carrier-badge';
    badge.textContent = '⚽';
    pieceElement.appendChild(badge);
  }

  return pieceElement;
}

function renderMoveHistory() {
  const history = getMoveHistory(state);
  historyElement.innerHTML = '';

  for (const entry of history) {
    const li = document.createElement('li');
    li.textContent = entry;
    historyElement.appendChild(li);
  }
}

function handleSquareClick(square) {
  if (selectedSquare && isLegalDestination(square)) {
    const result = tryMove(state, selectedSquare, square);
    if (!result.ok) {
      setFeedback(result.message, true);
      return;
    }

    state = result.state;
    selectedSquare = null;
    legalDestinations = [];
    setFeedback('');
    render();
    return;
  }

  const piece = getPieceAt(state, square);
  if (!piece) {
    selectedSquare = null;
    legalDestinations = [];
    setFeedback('Choose one of your players to move.', true);
    render();
    return;
  }

  if (piece.team !== getTurn(state)) {
    setFeedback(`It's ${capitalize(getTurn(state))} team's turn.`, true);
    return;
  }

  selectedSquare = square;
  legalDestinations = getLegalDestinations(state, square);
  setFeedback('');
  render();
}

function isSelected(square) {
  return selectedSquare && selectedSquare.x === square.x && selectedSquare.y === square.y;
}

function isLegalDestination(square) {
  return legalDestinations.some((destination) => destination.x === square.x && destination.y === square.y);
}

function setFeedback(message, isError = false) {
  feedbackElement.textContent = message;
  feedbackElement.classList.toggle('error', isError && message.length > 0);
}

function capitalize(value) {
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}
