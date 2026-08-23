# TFG Sweeps

Private Premier League 2026/27 sweepstake for **Jack, Sam, Jamie & Simon**.
Five clubs each, one goalscorer each, £25 a head, winner takes £100.

No accounts, no backend — the draw is baked in and live scores come from
ESPN's free public feed via a small Vercel proxy.

## How scoring works

- Each owned club: **3 pts a win, 1 a draw** (counted at full-time).
- Goalscorer pick: **+1 pt per PL goal** (own goals don't count).
- Leaderboard ties break on goal difference, then wins.

## The goalscorer change rule

One change each per season. To use it, edit `src/config/sweepstake.ts` —
append a new entry to that player's list with a `from` date:

```ts
Jack: [
  { name: 'Alexander Isak', aliases: ['isak'] },
  { name: 'Mohamed Salah', aliases: ['salah'], from: '2027-01-15' },
],
```

Old goals stay banked; the new player earns from the `from` date. Redeploy
(git push) and it's live.

## Everything editable lives in two files

- `src/config/sweepstake.ts` — players, the draw, scorers, pot, rule text
- `src/config/app.ts` — season window, scoring values, refresh cadence

## Run locally

```bash
npm install && npm run dev
```

No env vars needed. If the feed can't be reached (e.g. the standalone
`TFG-Sweeps-Demo.html` build) the app shows a clearly-labelled simulated
season instead.

## Deploy (Vercel)

1. Push this folder to a new GitHub repo.
2. Import it in Vercel — it auto-detects Vite. No env vars.
3. Done. `/api/scoreboard` + `/api/standings` proxy ESPN at the edge.

Add it to your phone's home screen for the full-app feel (PWA manifest and
icons are set up).
