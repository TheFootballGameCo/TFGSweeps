// The draw: each player's five clubs and their goalscorer, plus the
// scorer-change rule. Read-only — everything lives in config/sweepstake.ts.
import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useStandings } from '../hooks/useStandings';
import SectionHeading from '../components/SectionHeading';
import MemberAvatar from '../components/MemberAvatar';
import ClubCrest from '../components/ClubCrest';
import { SCORER_RULE, MAX_SCORER_CHANGES, SCORER_PICKS } from '../config/sweepstake';

export default function Teams() {
  const { data } = useData();
  const { standings } = useStandings();

  // Keep draw order stable (config order) rather than league order.
  const players = useMemo(
    () => [...standings].sort((a, b) => a.name.localeCompare(b.name)),
    [standings]
  );

  return (
    <div className="space-y-8">
      <section>
        <SectionHeading title="The draw" />
        <div className="space-y-3">
          {players.map((p) => {
            const changesLeft = MAX_SCORER_CHANGES - ((SCORER_PICKS[p.name as keyof typeof SCORER_PICKS]?.length ?? 1) - 1);
            return (
              <div key={p.name} className="card p-4 animate-fade-in">
                <div className="mb-3 flex items-center gap-3">
                  <MemberAvatar id={p.name} name={p.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted">
                      ⚽ {p.scorer.name}
                      {p.scorer.changedFrom ? ` (was ${p.scorer.changedFrom})` : ''} ·{' '}
                      {changesLeft > 0 ? `${changesLeft} change left` : 'change used — locked'}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{p.totalPoints} pts</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {p.teams.map((t) => (
                    <div
                      key={t.teamId}
                      className="flex items-center gap-2 rounded-xl bg-surface-2/60 px-2.5 py-1.5 text-sm"
                    >
                      <ClubCrest teamId={t.teamId} name={t.name} size={20} />
                      <span className="min-w-0 flex-1 truncate">{t.name}</span>
                      <span className="text-xs font-semibold tabular-nums text-muted">
                        {t.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scorer change rule */}
      <section>
        <SectionHeading title="Goalscorer change rule" />
        <div className="card space-y-2 p-4 text-sm text-muted">
          {SCORER_RULE.map((line, i) => (
            <p key={i} className="flex gap-2">
              <span className="text-accent" aria-hidden>·</span>
              <span>{line}</span>
            </p>
          ))}
          <p className="pt-1 text-[11px]">
            To use your change, tell Jack — it's a one-line edit and the app picks it up
            from the next refresh.
          </p>
        </div>
      </section>

      {/* Club count sanity line */}
      {data && (
        <p className="text-center text-[11px] text-muted">
          {Object.keys(data.clubs).length ? `${data.clubs.length} clubs tracked` : ''} ·{' '}
          {data.matches.length} fixtures this season
        </p>
      )}
    </div>
  );
}
