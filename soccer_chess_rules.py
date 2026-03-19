from __future__ import annotations

from dataclasses import dataclass, replace
from typing import Dict, Iterable, List, Optional, Tuple

Position = Tuple[int, int]
BOARD_SIZE = 6
GOAL_A: Position = (5, 2)
GOAL_B: Position = (0, 2)


@dataclass(frozen=True)
class Piece:
    team: str
    kind: str
    pos: Position


@dataclass(frozen=True)
class GameState:
    pieces: Tuple[Piece, ...]
    ball_pos: Position
    possession: Optional[str] = None
    score_a: int = 0
    score_b: int = 0


def _in_bounds(pos: Position) -> bool:
    r, c = pos
    return 0 <= r < BOARD_SIZE and 0 <= c < BOARD_SIZE


def _occupied_map(pieces: Iterable[Piece]) -> Dict[Position, Piece]:
    return {piece.pos: piece for piece in pieces}


def _line_path(start: Position, end: Position) -> List[Position]:
    sr, sc = start
    er, ec = end
    dr = (er - sr)
    dc = (ec - sc)
    step_r = 0 if dr == 0 else (1 if dr > 0 else -1)
    step_c = 0 if dc == 0 else (1 if dc > 0 else -1)
    if dr != 0 and dc != 0 and abs(dr) != abs(dc):
        return []
    path: List[Position] = []
    cr, cc = sr + step_r, sc + step_c
    while (cr, cc) != (er, ec):
        path.append((cr, cc))
        cr += step_r
        cc += step_c
    return path


def _valid_piece_move(piece: Piece, dest: Position) -> bool:
    sr, sc = piece.pos
    dr = dest[0] - sr
    dc = dest[1] - sc
    if piece.kind == "rook":
        return (dr == 0 or dc == 0) and (dr != 0 or dc != 0)
    if piece.kind == "bishop":
        return abs(dr) == abs(dc) and dr != 0
    if piece.kind == "knight":
        return sorted((abs(dr), abs(dc))) == [1, 2]
    if piece.kind == "king":
        return max(abs(dr), abs(dc)) == 1
    raise ValueError(f"Unsupported piece kind: {piece.kind}")


def generate_legal_moves(state: GameState, team: str) -> List[Tuple[Position, Position]]:
    occupied = _occupied_map(state.pieces)
    moves: List[Tuple[Position, Position]] = []

    for piece in state.pieces:
        if piece.team != team:
            continue
        for r in range(BOARD_SIZE):
            for c in range(BOARD_SIZE):
                dest = (r, c)
                if dest == piece.pos or not _in_bounds(dest):
                    continue
                if dest in occupied:
                    continue
                if not _valid_piece_move(piece, dest):
                    continue
                if piece.kind in {"rook", "bishop"}:
                    if any(square in occupied for square in _line_path(piece.pos, dest)):
                        continue
                moves.append((piece.pos, dest))

    return moves


def apply_move(state: GameState, team: str, src: Position, dest: Position) -> Tuple[GameState, Optional[str]]:
    legal_moves = generate_legal_moves(state, team)
    if (src, dest) not in legal_moves:
        raise ValueError("Illegal move")

    moved_piece: Optional[Piece] = None
    updated_pieces: List[Piece] = []
    for piece in state.pieces:
        if piece.pos == src and piece.team == team and moved_piece is None:
            moved_piece = replace(piece, pos=dest)
            updated_pieces.append(moved_piece)
        else:
            updated_pieces.append(piece)
    assert moved_piece is not None

    ball_pos = state.ball_pos
    possession = state.possession

    # Ball follows the current carrier.
    if state.possession == team and src == state.ball_pos:
        ball_pos = dest

    # Pick up loose ball when stepping on it.
    if possession is None and dest == state.ball_pos:
        possession = team
        ball_pos = dest

    score_a = state.score_a
    score_b = state.score_b
    event = None

    if possession == team and ball_pos == dest:
        target_goal = GOAL_B if team == "A" else GOAL_A
        if dest == target_goal:
            if team == "A":
                score_a += 1
            else:
                score_b += 1
            event = "goal"
            possession = None
            ball_pos = (BOARD_SIZE // 2, BOARD_SIZE // 2)

    new_state = GameState(
        pieces=tuple(updated_pieces),
        ball_pos=ball_pos,
        possession=possession,
        score_a=score_a,
        score_b=score_b,
    )
    return new_state, event


def is_repeated_state(history: Iterable[GameState], candidate: GameState) -> bool:
    return sum(1 for item in history if item == candidate) >= 2
