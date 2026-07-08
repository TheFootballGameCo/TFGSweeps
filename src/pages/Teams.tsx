// Club ownership + goalscorer picks for the active league.
// Admins can assign each club to a member (or randomise the lot); every member
// sets their own goalscorer pick here too.
import { useMemo, useState, type FormEvent } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLeague } from '../context/LeagueContext';
import SectionHeading from '../components/SectionHeading';
import MemberAvatar from '../components/MemberAvatar';

export default function Teams() {
  const { data } = useData();
  const { userId } = useAuth();
  const {
    members,
    teamPicks,
    scorerPicks,
    isAdmin,
    assignTeam,
    randomiseTeams,
    setScorerPick,
  } = useLeague();

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [scorerInput, setScorerInput] = useState('');

  const clubs = data?.clubs ?? [];
  const ownerByTeam = useMemo(
    () => new Map(teamPicks.map((p) => [p.team_id, p.user_id])),
    [teamPicks]
  );
  const myScorer = scorerPicks.find((p) => p.user_id === userId) ?? null;

  async function handleAssign(teamId: string, teamName: string, userId: string) {
    setBusy(true);
    setError(null);
    const err = await assignTeam(teamId, teamName, userId === '' ? null : userId);
    if (err) setError(err);
    setBusy(false);
  }

  async function handleRandomise() {
    if (!window.confirm('Shuffle ALL clubs randomly across members? This replaces the current allocation.')) return;
    setBusy(true);
    setError(null);
    const err = await randomiseTeams(clubs.map((c) => ({ id: c.id, name: c.name })));
    if (err) setError(err);
    setBusy(false);
  }

  async function handleScorer(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await setScorerPick(scorerInput.trim());
    if (err) setError(err);
    else setScorerInput('');
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      {/* My goalscorer pick */}
      <section>
        <SectionHeading title="My goalscorer" />
        <div className="card p-4">
          {myScorer && (
            <p className="mb-3 text-sm">
              Current pick: <span className="font-semibold">{myScorer.player_name}</span>{' '}
              <span className="text-xs text-muted">(+1 pt per PL goal)</span>
            </p>
          )}
          <form onSubmit={handleScorer} className="flex gap-2">
            <input
              className="input"
              placeholder={myScorer ? 'Change your pick…' : 'e.g. Erling Haaland'}
              value={scorerInput}
              onChange={(e) => setScorerInput(e.target.value)}
              required
              minLength={2}
              maxLength={60}
            />
            <button className="btn-primary shrink-0" disabled={busy}>
              Save
            </button>
          </form>
          <p className="mt-2 text-[11px] text-muted">
            Goals are matched automatically from live data — use the player's name as it
            appears on ESPN (surname alone usually works).
          </p>
        </div>
      </section>

      {/* Club allocation */}
      <section>
        <SectionHeading
          title="Club ownership"
          action={
            isAdmin && clubs.length > 0 ? (
              <button
                onClick={handleRandomise}
                disabled={busy}
                className="text-xs font-semibold text-accent disabled:opacity-50"
              >
                🎲 Randomise all
              </button>
            ) : undefined
          }
        />

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        {clubs.length === 0 ? (
          <div className="card px-4 py-8 text-center text-sm text-muted">
            Club list loads from the live PL table — check back shortly.
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {clubs.map((club) => {
              const ownerId = ownerByTeam.get(club.id) ?? '';
              const owner = members.find((m) => m.user_id === ownerId);
              return (
                <div key={club.id} className="flex items-center gap-3 px-4 py-2.5">
                  {club.logo ? (
                    <img src={club.logo} alt="" className="h-6 w-6 object-contain" loading="lazy" />
                  ) : (
                    <span className="h-6 w-6 rounded-full bg-surface-2" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{club.name}</span>

                  {isAdmin ? (
                    <select
                      value={ownerId}
                      disabled={busy}
                      onChange={(e) => handleAssign(club.id, club.name, e.target.value)}
                      className="input w-40 shrink-0 py-1.5 text-xs"
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.profile?.display_name ?? 'Player'}
                        </option>
                      ))}
                    </select>
                  ) : owner ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <MemberAvatar
                        id={owner.user_id}
                        name={owner.profile?.display_name ?? 'Player'}
                        size={20}
                      />
                      {owner.profile?.display_name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Unassigned</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isAdmin && (
          <p className="mt-2 text-[11px] text-muted">
            Only the league admin can change club ownership.
          </p>
        )}
      </section>

      {/* Members */}
      <section>
        <SectionHeading title="Members" />
        <div className="card divide-y divide-border">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
              <MemberAvatar id={m.user_id} name={m.profile?.display_name ?? 'Player'} size={28} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {m.profile?.display_name ?? 'Player'}
              </span>
              {m.role === 'admin' && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                  Admin
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
