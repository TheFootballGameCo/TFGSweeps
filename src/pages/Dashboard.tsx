// League snapshot: leaderboard, prize pot, live matches, next fixtures.
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useStandings } from '../hooks/useStandings';
import SectionHeading from '../components/SectionHeading';
import MemberAvatar from '../components/MemberAvatar';
import MatchCard from '../components/cards/MatchCard';
import { PRIZE } from '../config/sweepstake';

export default function Dashboard() {
  const { data } = useData();
  const { standings, ownerFor } = useStandings();

  const live = useMemo(
    () => (data?.matches ?? []).filter((m) => m.status === 'live'),
    [data]
  );
  const upcoming = useMemo(
    () => (data?.matches ?? []).filter((m) => m.status === 'scheduled').slice(0, 5),
    [data]
  );
  const leader = standings[0];

  return (
    <div className="space-y-8">
      {/* Leaderboard */}
      <section>
        <SectionHeading
          title="Leaderboard"
          action={
            <Link to="/leaderboard" className="text-xs font-medium text-accent">
              Full table →
            </Link>
          }
        />
        <div className="card divide-y divide-border">
          {standings.map((s) => (
            <div key={s.name} className="flex items-center gap-3 px-4 py-3">
              <span className="w-5 text-center text-sm font-bold text-muted">{s.position}</span>
              <MemberAvatar id={s.name} name={s.name} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{s.name}</span>
                <span className="block truncate text-[11px] text-muted">
                  {s.scorer.goals} goal{s.scorer.goals === 1 ? '' : 's'} from {s.scorer.name}
                </span>
              </span>
              <span className="text-sm font-bold tabular-nums">{s.totalPoints} pts</span>
            </div>
          ))}
        </div>
      </section>

      {/* Prize pot */}
      <section>
        <SectionHeading title="Prize pot" />
        <div className="card flex items-center gap-4 p-4">
          <span className="text-3xl font-extrabold tracking-tight text-accent">
            {PRIZE.currency}{PRIZE.pot}
          </span>
          <div className="min-w-0 text-xs text-muted">
            <p>
              {PRIZE.currency}{PRIZE.stakePerPlayer} a head · {PRIZE.label.toLowerCase()}
            </p>
            {leader && leader.totalPoints > 0 && (
              <p className="mt-0.5 truncate">
                Currently heading to <span className="font-semibold text-text">{leader.name}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Live now */}
      {live.length > 0 && (
        <section>
          <SectionHeading title="Live now" />
          <div className="space-y-2">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} ownerFor={ownerFor} />
            ))}
          </div>
        </section>
      )}

      {/* Up next */}
      <section>
        <SectionHeading
          title="Up next"
          action={
            <Link to="/matches" className="text-xs font-medium text-accent">
              All matches →
            </Link>
          }
        />
        {upcoming.length === 0 ? (
          <div className="card px-4 py-6 text-center text-sm text-muted">
            No upcoming fixtures in the feed yet.
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} ownerFor={ownerFor} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
