# Soccer Chess

Planning documents for a web-first online multiplayer soccer-chess game.

## Included docs

- `docs/week-1-backlog.md`: a day-by-day execution plan for the first week of V1 development.
- `docs/starter-folder-structure-and-message-schema.md`: a starter monorepo layout plus shared WebSocket message contracts.

## Recommended V1 platform

- **Client:** Next.js + React + TypeScript
- **Game server:** Node.js + TypeScript + WebSockets
- **Database:** Postgres
- **Ephemeral state / queueing:** Redis
- **Shared packages:** game rules, message types, and configuration

This setup is optimized for browser-based play, fast iteration, and authoritative real-time multiplayer.
