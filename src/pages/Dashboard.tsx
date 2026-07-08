// League snapshot: mini leaderboard, prize pot, live matches, next fixtures,
// invite card.
import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLeague } from '../context/LeagueContext';
import { useStandings } from '../hooks/useStandings';
import SectionHeading from '../components/SectionHeading';
import MemberAvatar from '../components/MemberAvatar';
import MatchCard from '../components/cards/MatchCard';

/** Prize pot: stake per player x members = what's up for grabs. */
function PrizePot() {
  const { activeLeague, members, isAdmin, updateStake } = useLeague();
  const { standings } = useStandings();
  const [editing, setEditing] = useState(false);
  const [stakeInput, setStakeInput] = useState('');

  if (!activeLeague) return null;
  const stake = activeLeague.stake_per_player;
  const pot = stake * members.length;
  const leader = standings[0];

  async function saveStake(e: FormEvent) {
    e.preventDefault();
    const amount = Number(stakeInput);
    if (!Number.isFinite(amount) || amount < 0) return;
    await updateStake(Math.round(amount * 100) / 100);
    setEditing(false);
  }

  return (
    <section>
      <SectionHeading
        title="Prize pot"
        action={
          isAdmin ? (
            <button
              onClick={() => {
                setStakeInput(String(stake || ''));
                setEditing(!editing);
              }}
              className="text-xs font-medium text-accent"
            >
              {editing ? 'Cancel' : 'Edit stake'}
            </button>
          ) : undefined
        }
      />
      <div className="card p-4">
        {editing ? (
          <form onSubmit={saveStake} className="flex items-center gap-2">
            <span className="text-sm font-semibold">£</span>
            <input
              className="input"
              type="number"
              min="0"
              step="0.5"
              placeholder="Stake per player"
              value={stakeInput}
              onChange={(e) => setStakeInput(e.target.value)}
              autoFocus
            />
            <button className="btn-primary shrink-0">Save</button>
          </form>
        ) : pot > 0 ? (
          <div className="flex items-center gap-4">
            <span className="text-3xl font-extrabold tracking-tight text-accent">
              £{pot % 1 === 0 ? pot : pot.toFixed(2)}
            </span>
            <div className="min-w-0 text-xs text-muted">
              <p>
                £{stake % 1 === 0 ? stake : stake.toFixed(2)} a head · {members.length} player
                {members.length === 1 ? '' : 's'} · winner takes the pot
              </p>
              {leader && leader.totalPoints > 0 && (
                <p className="mt-0.5 truncate">
                  Currently heading to <span className="font-semibold text-text">{leader.name}</span>
                </p>
              )}
              <p className="mt-0.5">Money is sorted between you outside the app.</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            No stake set yet{isAdmin ? ' — tap Edit stake to set how much each player puts in.' : '.'}
          </p>
        )}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { data } = useData();
  const { activeLeague, members } = useLeague();
  const { standings, ownerFor } = useStandings();
  const [copied, setCopied] = useState(false);

  const live = useMemo(
    () => (data?.matches ?? []).filter((m) => m.status === 'live'),
    [data]
  );
  const upcoming = useMemo(
    () => (data?.matches ?? []).filter((m) => m.status === 'scheduled').slice(0, 5),
    [data]
  );

  const inviteLink = activeLeague
    ? `${window.location.origin}/join/${activeLeague.join_code}`
    : '';

  async function copyInvite() {
    await navigator.clipboard.writeText(
      `Join my TFG Sweeps league "${activeLeague?.name}": ${inviteLink} (code ${activeLeague?.join_code})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Leaderboard snapshot */}
      <section>
        <SectionHeading
          title="Leaderboard"
          action={
            <Link to="/leaderboard" className="text-xs font-medium text-accent">
              Full table →
            </Link>
          }
        />
        {standings.length === 0 ? (
          <div className="card px-4 py-6 text-center text-sm text-muted">
            No points yet — assign clubs on the{' '}
            <Link to="/teams" className="font-medium text-accent">
              Teams
            </Link>{' '}
            page to get going.
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {standings.slice(0, 5).map((s) => (
              <div key={s.userId} className="flex items-center gap-3 px-4 py-3">
                <span className="w-5 text-center text-sm font-bold text-muted">{s.position}</span>
                <MemberAvatar id={s.userId} name={s.name} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{s.name}</span>
                  <span className="block truncate text-[11px] text-muted">
                    {s.scorerName
                      ? `${s.scorerGoals} goal${s.scorerGoals === 1 ? '' : 's'} from ${s.scorerName}`
                      : 'No scorer picked yet'}
                  </span>
                </span>
                <span className="text-sm font-bold tabular-nums">{s.totalPoints} pts</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <PrizePot />

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

      {/* Invite */}
      {activeLeague && (
        <section>
          <SectionHeading title="Invite mates" />
          <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {members.length} member{members.length === 1 ? '' : 's'} · code{' '}
                <span className="font-mono tracking-widest text-accent">
                  {activeLeague.join_code}
                </span>
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">{inviteLink}</p>
            </div>
            <button onClick={copyInvite} className="btn-primary shrink-0">
              {copied ? 'Copied ✓' : 'Copy invite'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
