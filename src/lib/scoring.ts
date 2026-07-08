// ---------------------------------------------------------------------------
// Scoring engine.
// Pure functions: league members + their picks + live PL matches in, ranked
// sweepstake standings out. No fetching, no React here.
//
// Rules (see config/app.ts):
//   - Owned club: Win = 3, Draw = 1, Loss = 0 (only counted once a match is FT)
//   - Goalscorer pick: +1 point per PL goal (own goals don't count)
// ---------------------------------------------------------------------------

import type {
  Match,
  Membership,
  TeamPick,
  ScorerPick,
  MemberStanding,
  OwnedTeamRecord,
  Club,
} from '../types';
import { SCORING } from '../config/app';

interface TeamRecord {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

/** W/D/L record per team id from finished matches. */
function buildRecords(matches: Match[]): Map<string, TeamRecord> {
  const records = new Map<string, TeamRecord>();
  const ensure = (id: string): TeamRecord => {
    let r = records.get(id);
    if (!r) {
      r = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
      records.set(id, r);
    }
    return r;
  };

  for (const m of matches) {
    if (m.status !== 'finished' || m.homeScore === null || m.awayScore === null) continue;
    const home = ensure(m.homeTeamId);
    const away = ensure(m.awayTeamId);
    home.played++;
    away.played++;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.wins++;
      away.losses++;
    } else if (m.homeScore < m.awayScore) {
      away.wins++;
      home.losses++;
    } else {
      home.draws++;
      away.draws++;
    }
  }
  return records;
}

/**
 * Tally goals per scorer pick. Matching is a case-insensitive substring test
 * against the scorer names in ESPN's goal events, so "haaland" matches
 * "Erling Haaland". Own goals never count.
 */
function scorerGoals(pick: string, matches: Match[]): number {
  const needle = pick.trim().toLowerCase();
  if (!needle) return 0;
  let goals = 0;
  for (const m of matches) {
    for (const g of m.goals) {
      if (g.ownGoal) continue;
      if (g.scorer.toLowerCase().includes(needle)) goals++;
    }
  }
  return goals;
}

/** Core computation: everything the leaderboard needs, fully ranked. */
export function computeStandings(
  members: Membership[],
  teamPicks: TeamPick[],
  scorerPicks: ScorerPick[],
  matches: Match[],
  clubs: Club[]
): MemberStanding[] {
  const records = buildRecords(matches);
  const clubIndex = new Map(clubs.map((c) => [c.id, c]));

  const standings: MemberStanding[] = members.map((member) => {
    const owned = teamPicks.filter((p) => p.user_id === member.user_id);

    const teams: OwnedTeamRecord[] = owned
      .map((pick) => {
        const rec = records.get(pick.team_id) ?? {
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        };
        const club = clubIndex.get(pick.team_id);
        return {
          teamId: pick.team_id,
          name: club?.name ?? pick.team_name,
          logo: club?.logo ?? '',
          played: rec.played,
          wins: rec.wins,
          draws: rec.draws,
          losses: rec.losses,
          goalDifference: rec.goalsFor - rec.goalsAgainst,
          points: rec.wins * SCORING.win + rec.draws * SCORING.draw,
        };
      })
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

    const teamPoints = teams.reduce((s, t) => s + t.points, 0);
    const scorerPick = scorerPicks.find((p) => p.user_id === member.user_id) ?? null;
    const goals = scorerPick ? scorerGoals(scorerPick.player_name, matches) : 0;
    const scorerPoints = goals * SCORING.pointsPerScorerGoal;

    return {
      userId: member.user_id,
      name: member.profile?.display_name ?? 'Player',
      teams,
      teamPoints,
      scorerName: scorerPick?.player_name ?? null,
      scorerGoals: goals,
      scorerPoints,
      totalPoints: teamPoints + scorerPoints,
      wins: teams.reduce((s, t) => s + t.wins, 0),
      draws: teams.reduce((s, t) => s + t.draws, 0),
      losses: teams.reduce((s, t) => s + t.losses, 0),
      goalDifference: teams.reduce((s, t) => s + t.goalDifference, 0),
      position: 0,
    };
  });

  // Rank: points, then goal difference, then wins, then name. Ties share a position.
  standings.sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.goalDifference - a.goalDifference ||
      b.wins - a.wins ||
      a.name.localeCompare(b.name)
  );
  let position = 0;
  let lastKey = '';
  standings.forEach((s, i) => {
    const key = `${s.totalPoints}|${s.goalDifference}|${s.wins}`;
    if (key !== lastKey) {
      position = i + 1;
      lastKey = key;
    }
    s.position = position;
  });

  return standings;
}
