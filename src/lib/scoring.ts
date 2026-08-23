// ---------------------------------------------------------------------------
// Scoring engine.
// Pure functions: the baked-in config (ownership + scorer picks) plus live PL
// matches in, ranked sweepstake standings out. No fetching, no React here.
//
// Rules (see config/sweepstake.ts and config/app.ts):
//   - Owned club: Win = 3, Draw = 1, Loss = 0 (only counted once a match is FT)
//   - Goalscorer pick: +1 pt per PL goal (own goals don't count), windowed by
//     the one-change-per-season rule — each pick only earns while active.
// ---------------------------------------------------------------------------

import type { Match, PlayerStanding, OwnedTeamRecord, ScorerSummary, Club } from '../types';
import { SCORING } from '../config/app';
import {
  PLAYERS,
  OWNERSHIP,
  SCORER_PICKS,
  MAX_SCORER_CHANGES,
  type PlayerName,
  type ScorerPickEntry,
} from '../config/sweepstake';

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
 * Goals for one pick within its active window.
 * A pick is active from its `from` date (or the start of time for the
 * original) until the NEXT pick's `from` date. Own goals never count.
 */
function goalsForPick(pick: ScorerPickEntry, until: string | null, matches: Match[]): number {
  const fromKey = pick.from ?? '';
  const untilKey = until ?? '9999';
  let goals = 0;
  for (const m of matches) {
    const dayKey = m.date.slice(0, 10);
    if (dayKey < fromKey || dayKey >= untilKey) continue;
    for (const g of m.goals) {
      if (g.ownGoal) continue;
      const scorer = g.scorer.toLowerCase();
      if (pick.aliases.some((alias) => scorer.includes(alias))) goals++;
    }
  }
  return goals;
}

/** Scorer summary for a player: total windowed goals + change status. */
function summariseScorer(player: PlayerName, matches: Match[]): ScorerSummary {
  const history = SCORER_PICKS[player] ?? [];
  if (history.length === 0) {
    return { name: '—', goals: 0, points: 0, changeUsed: false, changedFrom: null };
  }
  let goals = 0;
  history.forEach((pick, i) => {
    const until = history[i + 1]?.from ?? null;
    goals += goalsForPick(pick, until, matches);
  });
  const current = history[history.length - 1];
  return {
    name: current.name,
    goals,
    points: goals * SCORING.pointsPerScorerGoal,
    changeUsed: history.length > MAX_SCORER_CHANGES,
    changedFrom: history.length > 1 ? history[0].name : null,
  };
}

/** Core computation: everything the leaderboard needs, fully ranked. */
export function computeStandings(matches: Match[], clubs: Club[]): PlayerStanding[] {
  const records = buildRecords(matches);
  const clubIndex = new Map(clubs.map((c) => [c.id, c]));

  const standings: PlayerStanding[] = PLAYERS.map((player) => {
    const ownedIds = Object.entries(OWNERSHIP)
      .filter(([, owner]) => owner === player)
      .map(([teamId]) => teamId);

    const teams: OwnedTeamRecord[] = ownedIds
      .map((teamId) => {
        const rec = records.get(teamId) ?? {
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        };
        return {
          teamId,
          name: clubIndex.get(teamId)?.name ?? teamId,
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
    const scorer = summariseScorer(player, matches);

    return {
      name: player,
      teams,
      teamPoints,
      scorer,
      totalPoints: teamPoints + scorer.points,
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

/** Display name of a club's owner, or null if (somehow) unowned. */
export function ownerFor(teamId: string): PlayerName | null {
  return OWNERSHIP[teamId] ?? null;
}
