// One fixture/result row. Shows owners beside owned clubs, a pulsing badge
// while live, and goalscorers with minutes once there are goals.
import type { Match, GoalEvent } from '../../types';
import { cx, formatKickOff, formatMatchDate } from '../../lib/ui';
import ClubCrest from '../ClubCrest';

interface OwnerLookup {
  (teamId: string): string | null;
}

/** Aggregate one side's goals: "E. Haaland 23', 67'" (grouped per scorer). */
function scorerLines(goals: GoalEvent[]): string[] {
  const byScorer = new Map<string, { label: string; minutes: string[] }>();
  for (const g of goals) {
    const key = g.scorerShort + (g.ownGoal ? ' (og)' : '');
    const entry = byScorer.get(key) ?? { label: key, minutes: [] };
    if (g.clock) entry.minutes.push(g.clock);
    byScorer.set(key, entry);
  }
  return [...byScorer.values()].map((e) =>
    e.minutes.length ? `${e.label} ${e.minutes.join(', ')}` : e.label
  );
}

/** Scorer summary under the score: home left, away right, wraps — never clips. */
function Scorers({ match }: { match: Match }) {
  const home = scorerLines(match.goals.filter((g) => g.teamId === match.homeTeamId));
  const away = scorerLines(match.goals.filter((g) => g.teamId === match.awayTeamId));
  if (home.length === 0 && away.length === 0) return null;

  return (
    <div className="mt-2 grid grid-cols-2 gap-x-4 border-t border-border/60 pt-2 text-[10px] leading-relaxed text-muted">
      <div className="min-w-0 break-words">
        {home.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </div>
      <div className="min-w-0 break-words text-right">
        {away.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

function TeamSide({
  teamId,
  name,
  owner,
  align,
}: {
  teamId: string;
  name: string;
  owner: string | null;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={cx(
        'flex min-w-0 flex-1 items-center gap-2',
        align === 'right' && 'flex-row-reverse text-right'
      )}
    >
      <ClubCrest teamId={teamId} name={name} size={22} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{name}</span>
        {owner && <span className="block truncate text-[10px] text-muted">{owner}</span>}
      </span>
    </div>
  );
}

export default function MatchCard({
  match,
  ownerFor,
}: {
  match: Match;
  ownerFor: OwnerLookup;
}) {
  const live = match.status === 'live';
  const finished = match.status === 'finished';

  return (
    <div className="card px-4 py-3 animate-fade-in">
      <div className="flex items-center gap-3">
      <TeamSide
        teamId={match.homeTeamId}
        name={match.homeTeam}
        owner={ownerFor(match.homeTeamId)}
        align="left"
      />

      {/* Centre: score or kick-off */}
      <div className="flex w-20 shrink-0 flex-col items-center">
        {match.status === 'scheduled' ? (
          <>
            <span className="text-sm font-semibold">{formatKickOff(match.date)}</span>
            <span className="text-[10px] text-muted">{formatMatchDate(match.date)}</span>
          </>
        ) : (
          <>
            <span className="text-base font-bold tabular-nums">
              {match.homeScore ?? '–'} : {match.awayScore ?? '–'}
            </span>
            <span
              className={cx(
                'text-[10px] font-semibold',
                live ? 'text-accent animate-pulse-live' : 'text-muted'
              )}
            >
              {live ? match.statusDetail || 'LIVE' : finished ? 'FT' : ''}
            </span>
          </>
        )}
      </div>

      <TeamSide
        teamId={match.awayTeamId}
        name={match.awayTeam}
        owner={ownerFor(match.awayTeamId)}
        align="right"
      />
      </div>

      {match.status !== 'scheduled' && <Scorers match={match} />}
    </div>
  );
}
