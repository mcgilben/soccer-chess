# Starter Folder Structure + Message Schema

This document is designed to be copied directly into the repo as the initial architecture reference for V1.

## Recommended monorepo layout

```text
soccer-chess/
├─ apps/
│  ├─ web/
│  │  ├─ app/
│  │  │  ├─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ play/
│  │  │  │  └─ [matchId]/page.tsx
│  │  │  └─ local/page.tsx
│  │  ├─ components/
│  │  │  ├─ board/
│  │  │  │  ├─ board.tsx
│  │  │  │  ├─ square.tsx
│  │  │  │  ├─ piece.tsx
│  │  │  │  └─ legal-move-overlay.tsx
│  │  │  ├─ lobby/
│  │  │  │  ├─ find-match-card.tsx
│  │  │  │  └─ private-match-card.tsx
│  │  │  └─ game/
│  │  │     ├─ game-status.tsx
│  │  │     ├─ move-list.tsx
│  │  │     └─ clock-panel.tsx
│  │  ├─ lib/
│  │  │  ├─ api-client.ts
│  │  │  ├─ socket-client.ts
│  │  │  └─ local-game-controller.ts
│  │  ├─ public/
│  │  └─ package.json
│  └─ game-server/
│     ├─ src/
│     │  ├─ index.ts
│     │  ├─ server.ts
│     │  ├─ ws/
│     │  │  ├─ gateway.ts
│     │  │  ├─ event-router.ts
│     │  │  └─ session-registry.ts
│     │  ├─ matches/
│     │  │  ├─ match-service.ts
│     │  │  ├─ match-repository.ts
│     │  │  └─ room-manager.ts
│     │  ├─ matchmaking/
│     │  │  ├─ queue-service.ts
│     │  │  └─ rating-bucket.ts
│     │  ├─ clocks/
│     │  │  └─ clock-service.ts
│     │  └─ persistence/
│     │     ├─ prisma-client.ts
│     │     └─ redis-client.ts
│     └─ package.json
├─ packages/
│  ├─ game-core/
│  │  ├─ src/
│  │  │  ├─ index.ts
│  │  │  ├─ create-initial-state.ts
│  │  │  ├─ validate-move.ts
│  │  │  ├─ apply-move.ts
│  │  │  ├─ get-legal-moves.ts
│  │  │  ├─ hash-state.ts
│  │  │  ├─ rules/
│  │  │  │  ├─ piece-rules.ts
│  │  │  │  ├─ ball-rules.ts
│  │  │  │  └─ end-conditions.ts
│  │  │  └─ __tests__/
│  │  │     ├─ validate-move.test.ts
│  │  │     ├─ apply-move.test.ts
│  │  │     └─ fixtures/
│  │  └─ package.json
│  ├─ types/
│  │  ├─ src/
│  │  │  ├─ domain.ts
│  │  │  ├─ state.ts
│  │  │  ├─ moves.ts
│  │  │  ├─ events.ts
│  │  │  ├─ errors.ts
│  │  │  └─ index.ts
│  │  └─ package.json
│  └─ config/
│     ├─ eslint/
│     ├─ typescript/
│     └─ package.json
├─ prisma/
│  └─ schema.prisma
├─ docs/
│  ├─ week-1-backlog.md
│  └─ starter-folder-structure-and-message-schema.md
├─ package.json
├─ pnpm-workspace.yaml
└─ tsconfig.base.json
```

## Why this layout works

- `apps/web` owns user-facing routes and UI composition.
- `apps/game-server` owns authoritative match flow, clocks, and WebSocket orchestration.
- `packages/game-core` keeps rules deterministic and reusable across frontend tests and backend validation.
- `packages/types` keeps events, state, and error contracts consistent across the stack.
- `packages/config` centralizes linting and TypeScript conventions.

---

## Domain model starter types

Use these as the first shared types to keep the stack aligned.

```ts
export type Side = 'home' | 'away';

export type Coordinate = {
  x: number;
  y: number;
};

export type PieceType = 'keeper' | 'defender' | 'midfielder' | 'striker';

export type Piece = {
  id: string;
  side: Side;
  type: PieceType;
  position: Coordinate;
  hasBall: boolean;
};

export type BallState = {
  position: Coordinate;
  controllerPieceId: string | null;
};

export type GameStatus = 'waiting' | 'active' | 'finished';

export type GameResult =
  | { type: 'win'; winner: Side; reason: 'goal' | 'resign' | 'timeout' }
  | { type: 'draw'; reason: 'agreement' | 'repetition' | 'stalemate' }
  | null;

export type GameState = {
  matchId: string;
  status: GameStatus;
  boardWidth: number;
  boardHeight: number;
  sideToMove: Side;
  ply: number;
  pieces: Piece[];
  ball: BallState;
  stateVersion: number;
  stateHash: string;
  result: GameResult;
  lastMove: MoveRecord | null;
};

export type MoveIntent = {
  actorPieceId: string;
  from: Coordinate;
  to: Coordinate;
  action?: 'move' | 'pass' | 'shoot' | 'tackle';
  promotion?: null;
};

export type MoveRecord = {
  moveNumber: number;
  side: Side;
  intent: MoveIntent;
  notation: string;
  createdAt: string;
  previousStateHash: string;
  nextStateHash: string;
};
```

---

## Error taxonomy starter types

Keep rejection reasons stable so the frontend can map them to clear player messages.

```ts
export type MoveRejectionCode =
  | 'MATCH_NOT_FOUND'
  | 'MATCH_NOT_ACTIVE'
  | 'MATCH_FINISHED'
  | 'NOT_YOUR_TURN'
  | 'PIECE_NOT_FOUND'
  | 'INVALID_PIECE_OWNER'
  | 'OUT_OF_BOUNDS'
  | 'ILLEGAL_TARGET'
  | 'PATH_BLOCKED'
  | 'BALL_CONTROL_REQUIRED'
  | 'INVALID_ACTION'
  | 'STATE_VERSION_MISMATCH';

export type MoveValidationResult =
  | { ok: true }
  | { ok: false; code: MoveRejectionCode; message: string };
```

---

## WebSocket event design principles

1. The client sends **intent**, not authority.
2. The server validates every move using `packages/game-core`.
3. The server broadcasts the canonical updated state.
4. Every state-changing event carries `stateVersion` and `stateHash`.
5. Resync should always be possible from a full snapshot.

---

## Client → server message schema

```ts
export type ClientToServerEvent =
  | {
      type: 'connection/identify';
      payload: {
        sessionToken: string;
      };
    }
  | {
      type: 'match/join';
      payload: {
        matchId: string;
      };
    }
  | {
      type: 'match/leave';
      payload: {
        matchId: string;
      };
    }
  | {
      type: 'match/create-private';
      payload: {
        preferredSide?: Side;
        timeControl: {
          initialMs: number;
          incrementMs: number;
        };
      };
    }
  | {
      type: 'matchmaking/enqueue';
      payload: {
        queue: 'casual' | 'ranked';
        timeControl: {
          initialMs: number;
          incrementMs: number;
        };
      };
    }
  | {
      type: 'matchmaking/dequeue';
      payload: {
        queue: 'casual' | 'ranked';
      };
    }
  | {
      type: 'match/move-intent';
      payload: {
        matchId: string;
        stateVersion: number;
        intent: MoveIntent;
      };
    }
  | {
      type: 'match/resign';
      payload: {
        matchId: string;
      };
    }
  | {
      type: 'match/offer-draw';
      payload: {
        matchId: string;
      };
    }
  | {
      type: 'match/respond-draw';
      payload: {
        matchId: string;
        accept: boolean;
      };
    }
  | {
      type: 'match/request-resync';
      payload: {
        matchId: string;
        lastKnownStateVersion: number;
      };
    };
```

---

## Server → client message schema

```ts
export type ServerToClientEvent =
  | {
      type: 'connection/identified';
      payload: {
        userId: string;
      };
    }
  | {
      type: 'match/joined';
      payload: {
        matchId: string;
        side: Side;
        gameState: GameState;
      };
    }
  | {
      type: 'match/waiting-for-opponent';
      payload: {
        matchId: string;
      };
    }
  | {
      type: 'match/started';
      payload: {
        matchId: string;
        gameState: GameState;
        startedAt: string;
      };
    }
  | {
      type: 'match/move-accepted';
      payload: {
        matchId: string;
        stateVersion: number;
        stateHash: string;
        move: MoveRecord;
        gameState: GameState;
        serverTime: string;
      };
    }
  | {
      type: 'match/move-rejected';
      payload: {
        matchId: string;
        stateVersion: number;
        code: MoveRejectionCode;
        message: string;
      };
    }
  | {
      type: 'match/clock-updated';
      payload: {
        matchId: string;
        activeSide: Side;
        remainingMs: Record<Side, number>;
        serverTime: string;
      };
    }
  | {
      type: 'match/draw-offered';
      payload: {
        matchId: string;
        offeredBy: Side;
      };
    }
  | {
      type: 'match/resync-state';
      payload: {
        matchId: string;
        gameState: GameState;
        reason: 'reconnect' | 'version-mismatch' | 'manual-request';
      };
    }
  | {
      type: 'match/finished';
      payload: {
        matchId: string;
        result: NonNullable<GameResult>;
        gameState: GameState;
        finishedAt: string;
      };
    }
  | {
      type: 'matchmaking/queued';
      payload: {
        queue: 'casual' | 'ranked';
        enqueuedAt: string;
      };
    }
  | {
      type: 'matchmaking/matched';
      payload: {
        matchId: string;
      };
    }
  | {
      type: 'system/error';
      payload: {
        code: string;
        message: string;
      };
    };
```

---

## Server handler starter flow for move intents

```ts
async function handleMoveIntent(event: Extract<ClientToServerEvent, { type: 'match/move-intent' }>) {
  const { matchId, stateVersion, intent } = event.payload;

  const state = await matchService.getState(matchId);
  if (!state) {
    return emit({
      type: 'match/move-rejected',
      payload: {
        matchId,
        stateVersion,
        code: 'MATCH_NOT_FOUND',
        message: 'The requested match does not exist.',
      },
    });
  }

  if (state.stateVersion !== stateVersion) {
    emit({
      type: 'match/move-rejected',
      payload: {
        matchId,
        stateVersion: state.stateVersion,
        code: 'STATE_VERSION_MISMATCH',
        message: 'Your client is out of date. Requesting resync.',
      },
    });

    return emit({
      type: 'match/resync-state',
      payload: {
        matchId,
        gameState: state,
        reason: 'version-mismatch',
      },
    });
  }

  const validation = validateMove(state, intent);
  if (!validation.ok) {
    return emit({
      type: 'match/move-rejected',
      payload: {
        matchId,
        stateVersion: state.stateVersion,
        code: validation.code,
        message: validation.message,
      },
    });
  }

  const next = applyMove(state, intent);
  await matchService.saveState(matchId, next);

  broadcastToMatch(matchId, {
    type: 'match/move-accepted',
    payload: {
      matchId,
      stateVersion: next.stateVersion,
      stateHash: next.stateHash,
      move: next.lastMove!,
      gameState: next,
      serverTime: new Date().toISOString(),
    },
  });
}
```

---

## Suggested first implementation order

1. Define `packages/types` and freeze names early.
2. Implement `packages/game-core` with deterministic tests.
3. Build the local-play page in `apps/web` using the same shared types.
4. Add `apps/game-server` once the move engine is stable enough to be authoritative.
5. Introduce persistence only after in-memory game flow works reliably.
