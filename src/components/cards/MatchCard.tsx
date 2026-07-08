// One fixture/result row. Shows owners' initials beside owned clubs and a
// pulsing badge while live.
import type { Match } from '../../types';
import { cx, formatKickOff, formatMatchDate } from '../../lib/ui';

interface OwnerLookup {
  (teamId: string): string | null;
}

function TeamSide({
  name,
  logo,
  owner,
  align,
}: {
  name: string;
  logo: string;
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
      {logo ? (
        <img src={logo} alt="" className="h-6 w-6 shrink-0 object-contain" loading="lazy" />
      ) : (
        <span className="h-6 w-6 shrink-0 rounded-full bg-surface-2" />
      )}
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
    <div className="card flex items-center gap-3 px-4 py-3 animate-fade-in">
      <TeamSide
        name={match.homeTeam}
        logo={match.homeLogo}
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
        name={match.awayTeam}
        logo={match.awayLogo}
        owner={ownerFor(match.awayTeamId)}
        align="right"
      />
    </div>
  );
}
