// Shared domain types for TFG Sweeps.

// --- Live football data (parsed from ESPN's eng.1 feed) ---

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface GoalEvent {
  /** Scorer full display name (used for scorer-pick matching). */
  scorer: string;
  /** Short display name for the UI, e.g. "E. Haaland". */
  scorerShort: string;
  /** ESPN team id of the side credited with the goal. */
  teamId: string;
  ownGoal: boolean;
  clock: string;
}

export interface Match {
  id: string;
  date: string; // ISO
  status: MatchStatus;
  statusDetail: string; // e.g. "FT", "45'+2", "Sat 15:00"
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number | null;
  awayScore: number | null;
  goals: GoalEvent[];
}

/** One row of the real PL table (from ESPN standings). */
export interface TableRow {
  teamId: string;
  name: string;
  abbreviation: string;
  logo: string;
  rank: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

/** A PL club (from the standings feed or the static fallback list). */
export interface Club {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
}

export interface PlData {
  matches: Match[];
  table: TableRow[];
  clubs: Club[];
  lastUpdated: string;
  /** True when showing the generated sample season (live feed unreachable). */
  usingSampleData: boolean;
}

// --- Derived sweepstake standings (computed client-side from config) ---

export interface OwnedTeamRecord {
  teamId: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalDifference: number;
  points: number; // sweepstake points this club has earned its owner
}

export interface ScorerSummary {
  /** Current (active) pick's display name. */
  name: string;
  /** Total scorer points across the pick history (windowed by change dates). */
  goals: number;
  points: number;
  /** True once the one allowed change has been used. */
  changeUsed: boolean;
  /** Name of the original pick if a change was made. */
  changedFrom: string | null;
}

export interface PlayerStanding {
  name: string;
  teams: OwnedTeamRecord[];
  teamPoints: number;
  scorer: ScorerSummary;
  totalPoints: number;
  wins: number;
  draws: number;
  losses: number;
  goalDifference: number;
  position: number;
}
