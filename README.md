# HACK-O-LANTERN 2026 - Live Leaderboard

Official public display & mobile leaderboard for **HACK-O-LANTERN 2026** (31 Oct - 1 Nov 2026, Mirai Floor, hosted by Vulcan Club).

## Features
- **Projector & Mobile Ready**: Clean, high-contrast dark theme (`#080808`, `#ff7a1a`).
- **Privacy & Integrity**: Displays ONLY Rank, Team ID, and Team Name. Never displays marks, evaluator names, or internal statistics.
- **Real-Time Polling**: 5-second polling interval with 3-second server cache headers.
- **Dynamic Modes**: Controlled via the Admin app:
  - `live`: Real-time computed standings.
  - `frozen`: Point-in-time snapshot.
  - `hidden`: Leaderboard paused notice.
- **Scope Filters**: Switches between All 33 Teams (Rounds 1-3) and Finalists Only (Round 4).

## Setup & Running
```bash
cp .env.example .env.local
# Set DATABASE_URL
npm install
npm run build
npm start
```
