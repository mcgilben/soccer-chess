export type BallStart =
  | { mode: 'center-spot'; owner: 'none' }
  | { mode: 'goalkeeper-possession'; owner: 'white' | 'black' };

export interface RuleProfile {
  id: string;
  label: string;
  sourcePage: string;
  description: string;
  kickoff: BallStart;
  passShotBehavior: {
    passesPerTurn: number;
    canShootAfterPass: boolean;
    canShootWithoutPass: boolean;
  };
  scoring: {
    goalPoints: number;
    ownGoalPenalty: number;
    winCondition: string;
  };
  movementRestrictions: string[];
}

export const RULE_PROFILES: RuleProfile[] = [
  {
    id: 'association-reference',
    label: 'Association Reference',
    sourcePage: 'https://example.com/source/association-rules',
    description:
      'Balanced profile based on association-style flow with central kickoff and deliberate build-up.',
    kickoff: { mode: 'center-spot', owner: 'none' },
    passShotBehavior: {
      passesPerTurn: 1,
      canShootAfterPass: true,
      canShootWithoutPass: false,
    },
    scoring: {
      goalPoints: 1,
      ownGoalPenalty: -1,
      winCondition: 'First to 3 goals or highest score after 12 full turns.',
    },
    movementRestrictions: [
      'King may not cross midfield while carrying the ball.',
      'Pawns can only advance one square while in possession.',
    ],
  },
  {
    id: 'futsal-reference',
    label: 'Futsal Reference',
    sourcePage: 'https://example.com/source/futsal-rules',
    description:
      'Faster profile inspired by futsal restart rhythm and quick finishing opportunities.',
    kickoff: { mode: 'goalkeeper-possession', owner: 'white' },
    passShotBehavior: {
      passesPerTurn: 2,
      canShootAfterPass: true,
      canShootWithoutPass: true,
    },
    scoring: {
      goalPoints: 1,
      ownGoalPenalty: 0,
      winCondition: 'Highest score after 8 full turns; ties resolved by sudden-death turn.',
    },
    movementRestrictions: [
      'Knights cannot shoot on the same turn as an L-move capture.',
      'Rooks are limited to 4 squares of movement when in possession.',
    ],
  },
];

export const DEFAULT_PROFILE_ID = RULE_PROFILES[0].id;
