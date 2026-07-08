// The real Premier League table, with each club's sweepstake owner alongside.
import { useData } from '../context/DataContext';
import { useStandings } from '../hooks/useStandings';
import SectionHeading from '../components/SectionHeading';
import ClubCrest from '../components/ClubCrest';
import { cx } from '../lib/ui';

export default function Table() {
  const { data } = useData();
  const { ownerFor } = useStandings();
  const table = data?.table ?? [];

  return (
    <div>
      <SectionHeading title="Premier League table" />

      {table.length === 0 ? (
        <div className="card px-4 py-8 text-center text-sm text-muted">
          The table isn't available yet — check back once the season is underway.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-3 py-2.5 font-semibold">#</th>
                <th className="px-2 py-2.5 font-semibold">Club</th>
                <th className="px-2 py-2.5 font-semibold">Owner</th>
                <th className="px-2 py-2.5 text-center font-semibold">P</th>
                <th className="px-2 py-2.5 text-center font-semibold">W</th>
                <th className="px-2 py-2.5 text-center font-semibold">D</th>
                <th className="px-2 py-2.5 text-center font-semibold">L</th>
                <th className="px-2 py-2.5 text-center font-semibold">GD</th>
                <th className="px-3 py-2.5 text-center font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => {
                const owner = ownerFor(row.teamId);
                return (
                  <tr key={row.teamId} className="border-b border-border/60 last:border-0">
                    <td
                      className={cx(
                        'px-3 py-2.5 font-semibold tabular-nums',
                        row.rank <= 4 && 'text-accent',
                        row.rank >= 18 && 'text-red-500'
                      )}
                    >
                      {row.rank}
                    </td>
                    <td className="px-2 py-2.5">
                      <span className="flex items-center gap-2">
                        <ClubCrest teamId={row.teamId} name={row.name} size={18} />
                        <span className="font-medium">{row.name}</span>
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-xs text-muted">{owner ?? '—'}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums">{row.played}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums">{row.wins}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums">{row.draws}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums">{row.losses}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums">
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold tabular-nums">{row.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-center text-[11px] text-muted">
        Top 4 = Champions League · bottom 3 = relegation
      </p>
    </div>
  );
}
