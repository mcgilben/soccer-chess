import { INITIAL_PIECES } from "../shared/pieces.js";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function createInitialState() {
  return {
    turn: "white",
    pieces: structuredClone(INITIAL_PIECES),
    selectedPieceId: null
  };
}

export function getBoardSquares() {
  const squares = [];
  for (let rank = 8; rank >= 1; rank -= 1) {
    for (const file of files) {
      squares.push(`${file}${rank}`);
    }
  }
  return squares;
}

export function getPieceAt(state, square) {
  return state.pieces.find((piece) => piece.position === square) ?? null;
}

export function selectPiece(state, pieceId) {
  return {
    ...state,
    selectedPieceId: pieceId
  };
}
