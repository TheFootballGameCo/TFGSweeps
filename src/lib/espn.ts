// ---------------------------------------------------------------------------
// ESPN public feed client for the Premier League (eng.1).
// Free, public, no API key — the same data that powers ESPN's site/app.
//
// The season is fetched month-by-month (parallel requests) so each response
// stays small and edge-caches well, then merged into one Match[].
//
// NOTE: ESPN's feed is unofficial/undocumented. This parser is defensive so a
// small format change degrades gracefully rather than crashing.
// ---------------------------------------------------------------------------

import type { Match, MatchStatus, GoalEvent, TableRow, Club } from '../types';
import { API, SEASON } from '../config/app';
import { FALLBACK_CLUBS } from './clubs';

// --- Minimal typings for the slice of ESPN's response we use ---
interface EspnCompetitor {
  homeAway?: 'home' | 'away';
  score?: string;
  team?: {
    id?: string;
    displayName?: string;
    shortDisplayName?: string;
    abbreviation?: string;
    logo?: string;
    logos?: Array<{ href?: string }>;
  };
}
interface EspnDetail {
  scoringPlay?: boolean;
  ownGoal?: boolean;
  clock?: { displayValue?: string };
  team?: { id?: string };
  athletesInvolved?: Array<{ displayName?: string; shortName?: string }>;
}
interface EspnStatus {
  displayClock?: string;
  type?: { state?: string; completed?: boolean; shortDetail?: string };
}
interface EspnEvent {
  id?: string;
  date?: string;
  status?: EspnStatus;
  competitions?: Array<{
    competitors?: EspnCompetitor[];
    details?: EspnDetail[];
    status?: EspnStatus;
  }>;
}

function mapStatus(status?: EspnStatus): { status: MatchStatus; detail: string } {
  const state = status?.type?.state ?? 'pre';
  const detail = status?.type?.shortDetail ?? status?.displayClock ?? '';
  if (state === 'post' || status?.type?.completed) return { status: 'finished', detail: detail || 'FT' };
  if (state === 'in') return { status: 'live', detail: status?.displayClock ?? detail ?? 'LIVE' };
  return { status: 'scheduled', detail };
}

function parseEvent(event: EspnEvent): Match | null {
  const comp = event.competitions?.[0];
  const competitors = comp?.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === 'home');
  const away = competitors.find((c) => c.homeAway === 'away');
  if (!home?.team || !away?.team) return null;

  const { status, detail } = mapStatus(comp?.status ?? event.status);

  const parseScore = (raw?: string): number | null => {
    if (raw === undefined || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const goals: GoalEvent[] = (comp?.details ?? [])
    .filter((d) => d.scoringPlay)
    .map((d) => ({
      scorer: d.athletesInvolved?.[0]?.displayName ?? '',
      teamId: d.team?.id ?? '',
      ownGoal: Boolean(d.ownGoal),
      clock: d.clock?.displayValue ?? '',
    }))
    .filter((g) => g.scorer);

  const logoOf = (c: EspnCompetitor) => c.team?.logo ?? c.team?.logos?.[0]?.href ?? '';

  return {
    id: event.id ?? `${home.team.id}-${away.team.id}-${event.date}`,
    date: event.date ?? '',
    status,
    statusDetail: detail,
    homeTeamId: home.team.id ?? '',
    awayTeamId: away.team.id ?? '',
    homeTeam: home.team.shortDisplayName ?? home.team.displayName ?? '',
    awayTeam: away.team.shortDisplayName ?? away.team.displayName ?? '',
    homeLogo: logoOf(home),
    awayLogo: logoOf(away),
    homeScore: status === 'scheduled' ? null : parseScore(home.score),
    awayScore: status === 'scheduled' ? null : parseScore(away.score),
    goals,
  };
}

/** Month buckets ("YYYYMMDD-YYYYMMDD") covering the season window. */
function monthRanges(start: string, end: string): string[] {
  const ranges: string[] = [];
  const endDate = new Date(end + 'T00:00:00Z');
  let cursor = new Date(start + 'T00:00:00Z');
  while (cursor <= endDate) {
    const from = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));
    const to = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
    const clampFrom = from < new Date(start + 'T00:00:00Z') ? new Date(start + 'T00:00:00Z') : from;
    const clampTo = to > endDate ? endDate : to;
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
    ranges.push(`${fmt(clampFrom)}-${fmt(clampTo)}`);
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return ranges;
}

/**
 * Fetch and parse every fixture in the season window.
 * Falls back to the generated sample season when the feed is unreachable
 * (e.g. running the built app straight from a file with no proxy).
 */
export async function fetchSeasonMatches(): Promise<{ matches: Match[]; sample: boolean }> {
  try {
    const matches = await fetchSeasonMatchesLive();
    if (matches.length === 0) throw new Error('Feed returned no fixtures');
    return { matches, sample: false };
  } catch {
    const { generateSampleSeason } = await import('./sampleSeason');
    return { matches: generateSampleSeason().matches, sample: true };
  }
}

async function fetchSeasonMatchesLive(): Promise<Match[]> {
  const ranges = monthRanges(SEASON.startDate, SEASON.endDate);
  const responses = await Promise.all(
    ranges.map(async (dates) => {
      const res = await fetch(`${API.scoreboardPath}?dates=${dates}`);
      if (!res.ok) throw new Error(`Scoreboard request failed (${res.status})`);
      return (await res.json()) as { events?: EspnEvent[] };
    })
  );

  const seen = new Set<string>();
  const matches: Match[] = [];
  for (const body of responses) {
    for (const event of body.events ?? []) {
      const match = parseEvent(event);
      if (match && !seen.has(match.id)) {
        seen.add(match.id);
        matches.push(match);
      }
    }
  }
  matches.sort((a, b) => a.date.localeCompare(b.date));
  return matches;
}

// --- Standings (the real PL table) ---

interface EspnStandingEntry {
  team?: {
    id?: string;
    displayName?: string;
    shortDisplayName?: string;
    abbreviation?: string;
    logos?: Array<{ href?: string }>;
  };
  stats?: Array<{ name?: string; type?: string; value?: number }>;
}

function stat(entry: EspnStandingEntry, name: string): number {
  const s = entry.stats?.find((x) => x.name === name || x.type === name);
  return typeof s?.value === 'number' ? s.value : 0;
}

/**
 * Fetch and parse the live PL table. Also yields the club list.
 * Same fallback behaviour as fetchSeasonMatches.
 */
export async function fetchTable(): Promise<{
  table: TableRow[];
  clubs: Club[];
  sample: boolean;
}> {
  try {
    const live = await fetchTableLive();
    return { ...live, sample: false };
  } catch {
    const { generateSampleSeason } = await import('./sampleSeason');
    const sample = generateSampleSeason();
    return { table: sample.table, clubs: sample.clubs, sample: true };
  }
}

async function fetchTableLive(): Promise<{ table: TableRow[]; clubs: Club[] }> {
  const res = await fetch(`${API.standingsPath}?season=${SEASON.year}`);
  if (!res.ok) throw new Error(`Standings request failed (${res.status})`);
  const body = (await res.json()) as {
    children?: Array<{ standings?: { entries?: EspnStandingEntry[] } }>;
    standings?: { entries?: EspnStandingEntry[] };
  };

  const entries: EspnStandingEntry[] =
    body.children?.[0]?.standings?.entries ?? body.standings?.entries ?? [];

  const table: TableRow[] = entries
    .map((entry) => {
      const team = entry.team ?? {};
      return {
        teamId: team.id ?? '',
        name: team.shortDisplayName ?? team.displayName ?? '',
        abbreviation: team.abbreviation ?? '',
        logo: team.logos?.[0]?.href ?? '',
        rank: stat(entry, 'rank'),
        played: stat(entry, 'gamesPlayed'),
        wins: stat(entry, 'wins'),
        draws: stat(entry, 'ties'),
        losses: stat(entry, 'losses'),
        goalsFor: stat(entry, 'pointsFor'),
        goalsAgainst: stat(entry, 'pointsAgainst'),
        goalDifference: stat(entry, 'pointDifferential'),
        points: stat(entry, 'points'),
      };
    })
    .filter((row) => row.teamId)
    .sort((a, b) => a.rank - b.rank || b.points - a.points);

  // Before a new season's table exists, fall back to the static club list so
  // leagues can still draft clubs.
  const clubs: Club[] =
    table.length > 0
      ? table.map((row) => ({
          id: row.teamId,
          name: row.name,
          abbreviation: row.abbreviation,
          logo: row.logo,
        }))
      : FALLBACK_CLUBS;

  return { table, clubs };
}
