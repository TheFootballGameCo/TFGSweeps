// Full sweepstake standings, expandable per member to show their clubs.
import { useState } from 'react';
import { useStandings } from '../hooks/useStandings';
import MemberAvatar from '../components/MemberAvatar';
import SectionHeading from '../components/SectionHeading';
import ClubCrest from '../components/ClubCrest';
import { cx } from '../lib/ui';

export default function Leaderboard() {
  const { standings } = useStandings();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <SectionHeading title="Season standings" />

      {standings.length === 0 ? (
        <div className="card px-4 py-8 text-center text-sm text-muted">
          Nothing to rank yet — assign clubs to members on the Teams page.
        </div>
      ) : (
        <div className="space-y-2">
          {standings.map((s) => {
            const expanded = open === s.userId;
            return (
              <div key={s.userId} className="card overflow-hidden animate-fade-in">
                <button
                  onClick={() => setOpen(expanded ? null : s.userId)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    className={cx(
                      'w-6 text-center text-sm font-bold',
                      s.position === 1 ? 'text-accent' : 'text-muted'
                    )}
                  >
                    {s.position}
                  </span>
                  <MemberAvatar id={s.userId} name={s.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.name}</span>
                    <span className="block text-xs text-muted">
                      {s.wins}W {s.draws}D {s.losses}L
                      {s.scorerName ? ` · ${s.scorerName}: ${s.scorerGoals}⚽` : ''}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-lg font-extrabold tabular-nums">
                      {s.totalPoints}
                    </span>
                    <span className="block text-[10px] uppercase text-muted">pts</span>
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-border bg-surface-2/50 px-4 py-3">
                    {s.teams.length === 0 ? (
                      <p className="text-xs text-muted">No clubs assigned yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {s.teams.map((t) => (
                          <div key={t.teamId} className="flex items-center gap-2 text-sm">
                            <ClubCrest teamId={t.teamId} name={t.name} size={18} />
                            <span className="min-w-0 flex-1 truncate">{t.name}</span>
                            <span className="text-xs text-muted">
                              {t.wins}W {t.draws}D {t.losses}L
                            </span>
                            <span className="w-12 text-right font-semibold tabular-nums">
                              {t.points} pts
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted">
                          <span>Clubs: {s.teamPoints} pts</span>
                          <span>
                            Scorer: {s.scorerPoints} pts
                            {s.scorerName ? ` (${s.scorerName})` : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
