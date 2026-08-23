// ---------------------------------------------------------------------------
// Sample season generator. Used ONLY when the live ESPN feed can't be reached
// (e.g. opening the built app directly from a file, or the proxy being down).
// Produces a deterministic, plausible 2025/26-style season: 380 fixtures,
// scores weighted by club strength, named goalscorers, and a computed table.
// Deterministic = same "season" every time, so the demo feels stable.
// ---------------------------------------------------------------------------

import type { Match, GoalEvent, TableRow, Club } from '../types';
import { FALLBACK_CLUBS } from './clubs';

/** Small, fast seeded RNG so results are stable across loads. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Club strength order (rough 2026/27 pecking order). Lower index = stronger. */
const STRENGTH_ORDER = [
  '364', '359', '382', '363', '361', '362', '367', '360', '331', '384',
  '393', '337', '349', '370', '368', '366', '357', '388', '373', '306',
];

/** 2-3 recognisable scorers per club, first name weighted heaviest. */
const SCORERS: Record<string, string[]> = {
  '359': ['Bukayo Saka', 'Viktor Gyökeres', 'Martin Ødegaard'],
  '382': ['Erling Haaland', 'Phil Foden', 'Omar Marmoush'],
  '360': ['Bryan Mbeumo', 'Bruno Fernandes', 'Matheus Cunha'],
  '362': ['Ollie Watkins', 'Morgan Rogers', 'Emiliano Buendía'],
  '364': ['Alexander Isak', 'Mohamed Salah', 'Hugo Ekitike'],
  '349': ['Antoine Semenyo', 'Justin Kluivert', 'Evanilson'],
  '366': ['Wilson Isidor', 'Eliezer Mayenda', 'Granit Xhaka'],
  '331': ['Danny Welbeck', 'Kaoru Mitoma', 'Georginio Rutter'],
  '337': ['Igor Thiago', 'Kevin Schade', 'Keane Lewis-Potter'],
  '363': ['Cole Palmer', 'João Pedro', 'Liam Delap'],
  '370': ['Raúl Jiménez', 'Alex Iwobi', 'Rodrigo Muniz'],
  '361': ['Anthony Gordon', 'Yoane Wissa', 'Harvey Barnes'],
  '368': ['Iliman Ndiaye', 'Beto', 'Dwight McNeil'],
  '357': ['Joël Piroe', 'Dominic Calvert-Lewin', 'Wilfried Gnonto'],
  '384': ['Jean-Philippe Mateta', 'Ismaïla Sarr', 'Daichi Kamada'],
  '393': ['Chris Wood', 'Morgan Gibbs-White', 'Callum Hudson-Odoi'],
  '367': ['Dominic Solanke', 'Richarlison', 'Brennan Johnson'],
  '388': ['Haji Wright', 'Brandon Thomas-Asante', 'Jack Rudoni'],
  '373': ['George Hirst', 'Jaden Philogene', 'Sammie Szmodics'],
  '306': ['Joe Gelhardt', 'Kyle Joseph', 'Regan Slater'],
};

function strengthOf(teamId: string): number {
  const idx = STRENGTH_ORDER.indexOf(teamId);
  return idx === -1 ? 10 : idx;
}

/** Sample a goal count from expected goals (crude but fine for a demo). */
function sampleGoals(rand: () => number, expected: number): number {
  let goals = 0;
  let p = Math.exp(-expected);
  let cumulative = p;
  const u = rand();
  while (u > cumulative && goals < 7) {
    goals++;
    p = (p * expected) / goals;
    cumulative += p;
  }
  return goals;
}

function pickScorer(rand: () => number, teamId: string): string {
  const pool = SCORERS[teamId] ?? ['Unknown Player'];
  const u = rand();
  // Spread goals: lead scorer ~35%, second ~30%, third ~20%, rest "others".
  if (u < 0.35 || pool.length === 1) return pool[0];
  if (u < 0.65 || pool.length === 2) return pool[1];
  if (u < 0.85) return pool[2];
  return 'Squad Player';
}

/** Round-robin pairings via the circle method: 38 rounds of 10 games. */
function buildRounds(clubIds: string[]): Array<Array<[string, string]>> {
  const ids = [...clubIds];
  const n = ids.length;
  const half = n / 2;
  const rounds: Array<Array<[string, string]>> = [];
  const rotating = ids.slice(1);

  for (let r = 0; r < n - 1; r++) {
    const pairs: Array<[string, string]> = [];
    const lineup = [ids[0], ...rotating];
    for (let i = 0; i < half; i++) {
      const a = lineup[i];
      const b = lineup[n - 1 - i];
      // Alternate home/away by round for variety.
      pairs.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    rounds.push(pairs);
    rotating.unshift(rotating.pop()!);
  }
  // Second half of the season: reverse fixtures.
  const returns = rounds.map((pairs) => pairs.map(([h, a]) => [a, h] as [string, string]));
  return [...rounds, ...returns];
}

export interface SampleSeason {
  matches: Match[];
  table: TableRow[];
  clubs: Club[];
}

let cached: SampleSeason | null = null;

export function generateSampleSeason(): SampleSeason {
  if (cached) return cached;

  const clubs = FALLBACK_CLUBS;
  const clubIndex = new Map(clubs.map((c) => [c.id, c]));
  const rounds = buildRounds(clubs.map((c) => c.id));

  // Saturdays from 15 Aug 2026, one round a week.
  const firstKickOff = Date.UTC(2026, 7, 15, 14, 0, 0);
  const week = 7 * 24 * 60 * 60 * 1000;

  const matches: Match[] = [];
  rounds.forEach((pairs, round) => {
    pairs.forEach(([homeId, awayId], gameIdx) => {
      const home = clubIndex.get(homeId)!;
      const away = clubIndex.get(awayId)!;
      const rand = mulberry32(round * 1000 + Number(homeId) * 7 + Number(awayId));

      // Expected goals: stronger sides score more; home advantage baked in.
      const homeExp = Math.max(0.4, 1.75 - strengthOf(homeId) * 0.05 + 0.2);
      const awayExp = Math.max(0.35, 1.55 - strengthOf(awayId) * 0.05);
      const homeScore = sampleGoals(rand, homeExp);
      const awayScore = sampleGoals(rand, awayExp);

      const goals: GoalEvent[] = [];
      for (let g = 0; g < homeScore; g++) {
        goals.push({
          scorer: pickScorer(rand, homeId),
          teamId: homeId,
          ownGoal: false,
          clock: `${Math.floor(rand() * 90) + 1}'`,
        });
      }
      for (let g = 0; g < awayScore; g++) {
        goals.push({
          scorer: pickScorer(rand, awayId),
          teamId: awayId,
          ownGoal: false,
          clock: `${Math.floor(rand() * 90) + 1}'`,
        });
      }

      // Spread games across Sat/Sun and stagger kick-offs.
      const dayOffset = gameIdx < 6 ? 0 : 1;
      const hourOffset = (gameIdx % 3) * 2;
      const date = new Date(
        firstKickOff + round * week + dayOffset * 24 * 60 * 60 * 1000 + hourOffset * 3600_000
      ).toISOString();

      matches.push({
        id: `sample-${round}-${homeId}-${awayId}`,
        date,
        status: 'finished',
        statusDetail: 'FT',
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeTeam: home.name,
        awayTeam: away.name,
        homeLogo: home.logo,
        awayLogo: away.logo,
        homeScore,
        awayScore,
        goals,
      });
    });
  });

  matches.sort((a, b) => a.date.localeCompare(b.date));

  // --- Compute the table from the generated results ---
  interface Acc {
    played: number; wins: number; draws: number; losses: number;
    gf: number; ga: number; points: number;
  }
  const acc = new Map<string, Acc>(
    clubs.map((c) => [c.id, { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 }])
  );
  for (const m of matches) {
    const h = acc.get(m.homeTeamId)!;
    const a = acc.get(m.awayTeamId)!;
    h.played++; a.played++;
    h.gf += m.homeScore!; h.ga += m.awayScore!;
    a.gf += m.awayScore!; a.ga += m.homeScore!;
    if (m.homeScore! > m.awayScore!) { h.wins++; h.points += 3; a.losses++; }
    else if (m.homeScore! < m.awayScore!) { a.wins++; a.points += 3; h.losses++; }
    else { h.draws++; a.draws++; h.points++; a.points++; }
  }

  const table: TableRow[] = clubs
    .map((c) => {
      const r = acc.get(c.id)!;
      return {
        teamId: c.id,
        name: c.name,
        abbreviation: c.abbreviation,
        logo: c.logo,
        rank: 0,
        played: r.played,
        wins: r.wins,
        draws: r.draws,
        losses: r.losses,
        goalsFor: r.gf,
        goalsAgainst: r.ga,
        goalDifference: r.gf - r.ga,
        points: r.points,
      };
    })
    .sort((x, y) => y.points - x.points || y.goalDifference - x.goalDifference)
    .map((row, i) => ({ ...row, rank: i + 1 }));

  cached = { matches, table, clubs };
  return cached;
}
