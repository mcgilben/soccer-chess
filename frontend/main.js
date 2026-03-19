import "./styles.css";
import { PIECE_SYMBOL } from "../shared/pieces.js";
import { createInitialState, getBoardSquares, getPieceAt, selectPiece } from "./game-state.js";

let state = createInitialState();

function isLightSquare(square) {
  const fileCode = square.charCodeAt(0) - 96;
  const rank = Number(square[1]);
  return (fileCode + rank) % 2 === 0;
}

function render() {
  const app = document.querySelector("#app");
  const squares = getBoardSquares();

  app.innerHTML = `
    <div class="layout">
      <h1>Soccer Chess (Project Skeleton)</h1>
      <div class="board" aria-label="game-board"></div>
      <p class="legend">Turn: ${state.turn}. Click a piece to mark selection (state-module demo).</p>
    </div>
  `;

  const boardEl = app.querySelector(".board");

  for (const square of squares) {
    const piece = getPieceAt(state, square);
    const cell = document.createElement("button");
    cell.className = `square ${isLightSquare(square) ? "light" : "dark"}`;
    cell.dataset.square = square;
    cell.title = square;

    if (piece) {
      cell.textContent = PIECE_SYMBOL[piece.kind] ?? "?";
      if (piece.id === state.selectedPieceId) {
        cell.classList.add("selected");
      }
    }

    cell.addEventListener("click", () => {
      if (!piece) return;
      state = selectPiece(state, piece.id);
      render();
    });

    boardEl.appendChild(cell);
  }
}

render();
