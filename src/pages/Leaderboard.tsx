// Full sweepstake standings, expandable per player to show their clubs,
// plus The Match Report: the weekly AI write-up.
import { useState } from 'react';
import { useStandings } from '../hooks/useStandings';
import MemberAvatar from '../components/MemberAvatar';
import SectionHeading from '../components/SectionHeading';
import ClubCrest from '../components/ClubCrest';
import { cx } from '../lib/ui';
import { MATCH_REPORTS } from '../config/matchReport';

/** The Match Report: latest expanded, older ones collapsible. */
function MatchReportSection() {
  const [openId, setOpenId] = useState<string | null>(MATCH_REPORTS[0]?.id ?? null);
  if (MATCH_REPORTS.length === 0) {
    return (
      <section className="mt-10">
        <SectionHeading title="The Match Report" />
        <div className="card px-4 py-6 text-center text-sm text-muted">
          The first report lands after the opening gameweek.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <SectionHeading title="The Match Report" />
      <div className="space-y-3">
        {MATCH_REPORTS.map((report) => {
          const expanded = openId === report.id;
          return (
            <div key={report.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenId(expanded ? null : report.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm" aria-hidden>
                  📰
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{report.label}</span>
                  <span className="block text-[11px] text-muted">
                    {new Date(report.publishedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </span>
                <span className="text-xs text-muted">{expanded ? 'Hide' : 'Read'}</span>
              </button>

              {expanded && (
                <div className="border-t border-border px-4 py-4">
                  <div className="space-y-3 text-sm leading-relaxed">
                    {report.intro.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="mt-5 space-y-4">
                    {report.players.map((entry) => (
                      <div
                        key={entry.player}
                        className="rounded-xl bg-surface-2/60 p-3.5"
                      >
                        <div className="mb-1.5 flex items-center gap-2.5">
                          <MemberAvatar id={entry.player} name={entry.player} size={28} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-tight">{entry.player}</p>
                            <p className="text-[11px] italic text-muted leading-tight">
                              {entry.heading}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed">{entry.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Leaderboard() {
  const { standings } = useStandings();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <SectionHeading title="Season standings" />

      <div className="space-y-2">
        {standings.map((s) => {
          const expanded = open === s.name;
          return (
            <div key={s.name} className="card overflow-hidden animate-fade-in">
              <button
                onClick={() => setOpen(expanded ? null : s.name)}
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
                <MemberAvatar id={s.name} name={s.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{s.name}</span>
                  <span className="block text-xs text-muted">
                    {s.wins}W {s.draws}D {s.losses}L · {s.scorer.name}: {s.scorer.goals}⚽
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
                        {s.scorer.name}: {s.scorer.points} pts
                        {s.scorer.changedFrom ? ` (was ${s.scorer.changedFrom})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <MatchReportSection />
    </div>
  );
}
