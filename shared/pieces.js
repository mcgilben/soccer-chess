import { PieceKind, Team } from "./types.js";

/**
 * Minimal starting set. This is intentionally tiny so custom rules
 * can be expanded without refactoring module boundaries.
 */
export const INITIAL_PIECES = [
  { id: "w-king", kind: PieceKind.KING, team: Team.WHITE, position: "e1" },
  { id: "b-king", kind: PieceKind.KING, team: Team.BLACK, position: "e8" },
  { id: "ball", kind: PieceKind.BALL, team: null, position: "e4" }
];

export const PIECE_SYMBOL = {
  [PieceKind.KING]: "♔",
  [PieceKind.QUEEN]: "♕",
  [PieceKind.ROOK]: "♖",
  [PieceKind.BISHOP]: "♗",
  [PieceKind.KNIGHT]: "♘",
  [PieceKind.PAWN]: "♙",
  [PieceKind.BALL]: "⚽"
};
