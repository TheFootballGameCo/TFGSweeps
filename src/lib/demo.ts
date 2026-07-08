// ---------------------------------------------------------------------------
// Demo mode data. Active whenever Supabase env vars are missing, so the app is
// fully explorable (with real PL results) before any backend is set up.
// Four players, five clubs each — the tried-and-tested format.
// ---------------------------------------------------------------------------

import type { League, Membership, TeamPick, ScorerPick } from '../types';

export const DEMO_USER_ID = 'demo-jack';

export const DEMO_LEAGUE: League = {
  id: 'demo-league',
  name: 'The Originals',
  join_code: 'DEMO26',
  owner_id: DEMO_USER_ID,
  season_label: '2025/26',
  stake_per_player: 10,
  created_at: '2025-08-01T00:00:00Z',
};

const names: Array<[string, string]> = [
  [DEMO_USER_ID, 'Jack'],
  ['demo-simon', 'Simon'],
  ['demo-sam', 'Sam'],
  ['demo-jamie', 'Jamie'],
];

export const DEMO_MEMBERS: Membership[] = names.map(([id, display_name], i) => ({
  id: `demo-m-${i}`,
  league_id: DEMO_LEAGUE.id,
  user_id: id,
  role: id === DEMO_USER_ID ? 'admin' : 'member',
  profile: { id, display_name },
}));

/** Snake-draft allocation (5 clubs each) so the demo feels balanced. */
const allocation: Record<string, Array<[string, string]>> = {
  [DEMO_USER_ID]: [
    ['359', 'Arsenal'],
    ['331', 'Brighton'],
    ['337', 'Brentford'],
    ['393', 'Nottm Forest'],
    ['367', 'Tottenham'],
  ],
  'demo-simon': [
    ['382', 'Man City'],
    ['366', 'Sunderland'],
    ['363', 'Chelsea'],
    ['384', 'Crystal Palace'],
    ['371', 'West Ham'],
  ],
  'demo-sam': [
    ['360', 'Man United'],
    ['349', 'Bournemouth'],
    ['370', 'Fulham'],
    ['357', 'Leeds United'],
    ['379', 'Burnley'],
  ],
  'demo-jamie': [
    ['362', 'Aston Villa'],
    ['364', 'Liverpool'],
    ['361', 'Newcastle'],
    ['368', 'Everton'],
    ['380', 'Wolves'],
  ],
};

export const DEMO_TEAM_PICKS: TeamPick[] = Object.entries(allocation).flatMap(
  ([userId, clubs]) =>
    clubs.map(([team_id, team_name]) => ({
      id: `demo-t-${team_id}`,
      league_id: DEMO_LEAGUE.id,
      user_id: userId,
      team_id,
      team_name,
    }))
);

// Jack (you) has no pick yet so the "lock it in" flow can be tried in the
// demo — it resets on refresh. The others are locked, as they would be.
export const DEMO_SCORER_PICKS: ScorerPick[] = [
  { id: 'demo-s-2', league_id: DEMO_LEAGUE.id, user_id: 'demo-simon', player_name: 'Salah' },
  { id: 'demo-s-3', league_id: DEMO_LEAGUE.id, user_id: 'demo-sam', player_name: 'Isak' },
  { id: 'demo-s-4', league_id: DEMO_LEAGUE.id, user_id: 'demo-jamie', player_name: 'Palmer' },
];
