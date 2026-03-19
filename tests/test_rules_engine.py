import unittest

from soccer_chess_rules import (
    GameState,
    Piece,
    apply_move,
    generate_legal_moves,
    is_repeated_state,
)


class RulesEngineTests(unittest.TestCase):
    def test_legal_and_illegal_move_generation(self):
        state = GameState(
            pieces=(
                Piece("A", "rook", (2, 0)),
                Piece("A", "king", (5, 5)),
                Piece("B", "bishop", (0, 5)),
            ),
            ball_pos=(3, 3),
        )
        moves = generate_legal_moves(state, "A")
        self.assertIn(((2, 0), (2, 5)), moves)
        self.assertNotIn(((2, 0), (3, 1)), moves)

    def test_blocked_path_prevents_rook_move(self):
        state = GameState(
            pieces=(
                Piece("A", "rook", (2, 0)),
                Piece("A", "king", (2, 2)),
                Piece("B", "king", (5, 5)),
            ),
            ball_pos=(3, 3),
        )
        moves = generate_legal_moves(state, "A")
        self.assertNotIn(((2, 0), (2, 5)), moves)

    def test_possession_changes_on_loose_ball_pickup(self):
        state = GameState(
            pieces=(
                Piece("A", "king", (2, 1)),
                Piece("B", "king", (5, 5)),
            ),
            ball_pos=(2, 2),
            possession=None,
        )
        next_state, event = apply_move(state, "A", (2, 1), (2, 2))
        self.assertIsNone(event)
        self.assertEqual(next_state.possession, "A")
        self.assertEqual(next_state.ball_pos, (2, 2))

    def test_scoring_event_resets_ball_and_possession(self):
        state = GameState(
            pieces=(
                Piece("A", "king", (1, 2)),
                Piece("B", "king", (5, 5)),
            ),
            ball_pos=(1, 2),
            possession="A",
        )
        next_state, event = apply_move(state, "A", (1, 2), (0, 2))
        self.assertEqual(event, "goal")
        self.assertEqual(next_state.score_a, 1)
        self.assertEqual(next_state.possession, None)
        self.assertEqual(next_state.ball_pos, (3, 3))

    def test_no_legal_moves_for_fully_blocked_king(self):
        state = GameState(
            pieces=(
                Piece("A", "king", (1, 1)),
                Piece("B", "rook", (0, 0)),
                Piece("B", "rook", (0, 1)),
                Piece("B", "rook", (0, 2)),
                Piece("B", "rook", (1, 0)),
                Piece("B", "rook", (1, 2)),
                Piece("B", "rook", (2, 0)),
                Piece("B", "rook", (2, 1)),
                Piece("B", "rook", (2, 2)),
            ),
            ball_pos=(5, 5),
        )
        self.assertEqual(generate_legal_moves(state, "A"), [])

    def test_repeated_state_detected_on_third_occurrence(self):
        state = GameState(
            pieces=(
                Piece("A", "king", (0, 0)),
                Piece("B", "king", (5, 5)),
            ),
            ball_pos=(3, 3),
        )
        history = [state, state]
        self.assertTrue(is_repeated_state(history, state))


if __name__ == "__main__":
    unittest.main()
