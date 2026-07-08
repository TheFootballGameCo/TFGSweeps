// ---------------------------------------------------------------------------
// Central, human-editable configuration for TFG Sweeps.
// Edit THIS file (not the components) to change scoring, the season window,
// or refresh cadence.
// ---------------------------------------------------------------------------

/**
 * Scoring rules (fixed for v1; per-league customisation is a v2 feature).
 *  - Owned club: Win = 3, Draw = 1, Loss = 0 (counted once a match is FT)
 *  - Goalscorer pick: +1 point per PL goal the chosen player scores
 */
export const SCORING = {
  win: 3,
  draw: 1,
  loss: 0,
  pointsPerScorerGoal: 1,
} as const;

/**
 * Season window. Used to pull every fixture (fetched month-by-month so
 * responses stay small and cache well at the edge).
 *
 * BETA: currently pointed at the completed 2025/26 season so every screen has
 * real results, tables and goalscorers to look at. Before launch, flip to:
 *   label: '2026/27', year: 2026, startDate: '2026-08-01', endDate: '2027-06-05'
 */
export const SEASON = {
  label: '2025/26',
  /** ESPN's season year for standings requests. */
  year: 2025,
  startDate: '2025-08-01',
  endDate: '2026-06-01',
} as const;

/** Relative API paths — forwarded to ESPN by Vite (dev) or Vercel (prod). */
export const API = {
  scoreboardPath: '/api/scoreboard',
  standingsPath: '/api/standings',
} as const;

/** How often (ms) the app re-fetches live data. */
export const REFRESH_INTERVAL_MS = 60_000;

/**
 * League size. The format works because each player combines MULTIPLE clubs —
 * 4 players x 5 clubs is the sweet spot. 3 players = 6 clubs each (2 left
 * out); 5 players = 4 each. Beyond 5 the points system falls apart, so the
 * cap is hard.
 */
export const MIN_LEAGUE_SIZE = 3;
export const MAX_LEAGUE_SIZE = 5;
