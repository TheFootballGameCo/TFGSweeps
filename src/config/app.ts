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
 */
export const SEASON = {
  label: '2026/27',
  /** ESPN's season year for standings requests. */
  year: 2026,
  startDate: '2026-08-01',
  endDate: '2027-06-06',
} as const;

/** Relative API paths — forwarded to ESPN by Vite (dev) or Vercel (prod). */
export const API = {
  scoreboardPath: '/api/scoreboard',
  standingsPath: '/api/standings',
} as const;

/** How often (ms) the app re-fetches live data. */
export const REFRESH_INTERVAL_MS = 60_000;
