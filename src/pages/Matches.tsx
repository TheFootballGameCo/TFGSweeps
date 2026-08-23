// All fixtures & results, grouped by day. Filters: all / results / upcoming /
// per player (matches involving their clubs).
import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useStandings } from '../hooks/useStandings';
import MatchCard from '../components/cards/MatchCard';
import { cx, formatMatchDate } from '../lib/ui';
import { PLAYERS, OWNERSHIP, type PlayerName } from '../config/sweepstake';
import type { Match } from '../types';

type Filter = 'all' | 'live' | 'results' | 'upcoming' | PlayerName;

export default function Matches() {
  const { data } = useData();
  const { ownerFor } = useStandings();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const matches = data?.matches ?? [];
    switch (filter) {
      case 'all':
        return matches;
      case 'live':
        return matches.filter((m) => m.status === 'live');
      case 'results':
        return matches.filter((m) => m.status === 'finished').reverse();
      case 'upcoming':
        return matches.filter((m) => m.status !== 'finished');
      default: {
        // Player filter: matches involving any of their clubs.
        const theirs = new Set(
          Object.entries(OWNERSHIP)
            .filter(([, owner]) => owner === filter)
            .map(([teamId]) => teamId)
        );
        return matches.filter((m) => theirs.has(m.homeTeamId) || theirs.has(m.awayTeamId));
      }
    }
  }, [data, filter]);

  // Group by calendar day.
  const groups = useMemo(() => {
    const byDay = new Map<string, Match[]>();
    for (const m of filtered) {
      const key = m.date.slice(0, 10);
      (byDay.get(key) ?? byDay.set(key, []).get(key)!).push(m);
    }
    return [...byDay.entries()];
  }, [filtered]);

  const liveCount = useMemo(
    () => (data?.matches ?? []).filter((m) => m.status === 'live').length,
    [data]
  );

  const filters: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'live', label: liveCount > 0 ? `Live (${liveCount})` : 'Live' },
    { id: 'results', label: 'Results' },
    { id: 'upcoming', label: 'Upcoming' },
    ...PLAYERS.map((p) => ({ id: p as Filter, label: p })),
  ];

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cx(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filter === f.id
                ? 'bg-accent text-white'
                : 'border border-border bg-surface text-muted hover:text-text'
            )}
          >
            {f.id === 'live' && liveCount > 0 && (
              <span
                className={cx(
                  'h-1.5 w-1.5 rounded-full animate-pulse-live',
                  filter === 'live' ? 'bg-white' : 'bg-accent'
                )}
              />
            )}
            {f.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="card px-4 py-8 text-center text-sm text-muted">
          {filter === 'live'
            ? 'No games in play right now — scores appear here the moment one kicks off.'
            : 'No matches for this filter yet.'}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, matches]) => (
            <section key={day}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                {formatMatchDate(matches[0].date)}
              </h3>
              <div className="space-y-2">
                {matches.map((m) => (
                  <MatchCard key={m.id} match={m} ownerFor={ownerFor} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
