// My leagues: switch between them, create a new one, or join with a code.
// Doubles as onboarding when the user has no leagues yet.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLeague } from '../context/LeagueContext';
import ThemeToggle from '../components/ThemeToggle';
import { cx } from '../lib/ui';

export default function Leagues() {
  const { profile, signOut } = useAuth();
  const { leagues, activeLeague, setActiveLeagueId, createLeague, joinLeague } = useLeague();
  const navigate = useNavigate();

  const [newName, setNewName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await createLeague(newName.trim());
    setBusy(false);
    if (err) setError(err);
    else navigate('/');
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await joinLeague(code.trim());
    setBusy(false);
    if (err) setError(err);
    else navigate('/');
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="pt-safe sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <span className="text-xl" aria-hidden>⚽️</span>
          <span className="font-bold tracking-tight">TFG Sweeps</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button onClick={signOut} className="text-xs font-medium text-muted hover:text-text">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-24 pt-6">
        <h1 className="text-xl font-extrabold tracking-tight">
          {leagues.length === 0 ? `Welcome, ${profile?.display_name ?? 'player'} 👋` : 'Your leagues'}
        </h1>
        {leagues.length === 0 && (
          <p className="mt-1 text-sm text-muted">
            Create a league and invite your mates, or join one with a code.
          </p>
        )}

        {/* Existing leagues */}
        {leagues.length > 0 && (
          <div className="mt-4 space-y-2">
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => {
                  setActiveLeagueId(league.id);
                  navigate('/');
                }}
                className={cx(
                  'card flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2',
                  league.id === activeLeague?.id && 'border-accent'
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm">
                  🏆
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{league.name}</span>
                  <span className="block text-xs text-muted">
                    {league.season_label} · code {league.join_code}
                  </span>
                </span>
                {league.id === activeLeague?.id && (
                  <span className="text-[10px] font-bold uppercase text-accent">Active</span>
                )}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-4 text-xs text-red-500">{error}</p>}

        {/* Create */}
        <form onSubmit={handleCreate} className="card mt-6 space-y-3 p-4">
          <h2 className="text-sm font-bold">Create a league</h2>
          <input
            className="input"
            placeholder="League name (e.g. Sunday Legends)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            minLength={2}
            maxLength={60}
          />
          <button className="btn-primary w-full" disabled={busy}>
            Create league
          </button>
        </form>

        {/* Join */}
        <form onSubmit={handleJoin} className="card mt-4 space-y-3 p-4">
          <h2 className="text-sm font-bold">Join with a code</h2>
          <input
            className="input uppercase tracking-widest"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            minLength={6}
            maxLength={6}
          />
          <button className="btn-secondary w-full" disabled={busy}>
            Join league
          </button>
        </form>

        {activeLeague && (
          <p className="mt-6 text-center text-xs text-muted">
            <Link to="/" className="font-medium text-accent">
              ← Back to {activeLeague.name}
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
