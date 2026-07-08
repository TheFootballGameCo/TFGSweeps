// Shared domain types for TFG Sweeps.

// --- Live football data (parsed from ESPN's eng.1 feed) ---

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface GoalEvent {
  /** Scorer display name (lower-cased for matching happens in scoring.ts). */
  scorer: string;
  /** ESPN team id of the scoring side. */
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

/** A PL club (derived from the standings feed, so it tracks promotions). */
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
}

// --- League / multiplayer (stored in Supabase) ---

export interface Profile {
  id: string;
  display_name: string;
}

export interface League {
  id: string;
  name: string;
  join_code: string;
  owner_id: string;
  season_label: string;
  created_at: string;
}

export interface Membership {
  id: string;
  league_id: string;
  user_id: string;
  role: 'admin' | 'member';
  /** Joined-in profile for display. */
  profile?: Profile;
}

export interface TeamPick {
  id: string;
  league_id: string;
  user_id: string;
  team_id: string;
  team_name: string;
}

export interface ScorerPick {
  id: string;
  league_id: string;
  user_id: string;
  player_name: string;
}

// --- Derived sweepstake standings (computed client-side) ---

export interface OwnedTeamRecord {
  teamId: string;
  name: string;
  logo: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalDifference: number;
  points: number; // sweepstake points this team has earned its owner
}

export interface MemberStanding {
  userId: string;
  name: string;
  teams: OwnedTeamRecord[];
  teamPoints: number;
  scorerName: string | null;
  scorerGoals: number;
  scorerPoints: number;
  totalPoints: number;
  wins: number;
  draws: number;
  losses: number;
  goalDifference: number;
  position: number;
}
