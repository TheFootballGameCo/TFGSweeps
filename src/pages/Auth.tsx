// Sign in / sign up: email+password and Google OAuth.
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

type Mode = 'signin' | 'signup';

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === 'signup') {
      const err = await signUp(email.trim(), password, name.trim() || 'Player');
      if (err) setError(err);
      else setNotice('Account created. If email confirmation is on, check your inbox — then sign in.');
    } else {
      const err = await signIn(email.trim(), password);
      if (err) setError(err);
      else navigate(from, { replace: true });
    }
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <div className="pt-safe flex justify-end px-4 pt-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 text-center">
            <span className="text-4xl" aria-hidden>⚽️</span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">TFG Sweeps</h1>
            <p className="mt-1 text-sm text-muted">
              Premier League sweepstakes with your mates, all season long.
            </p>
          </div>

          <div className="card p-5">
            {/* Mode toggle */}
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
              {(['signin', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={
                    mode === m
                      ? 'rounded-lg bg-surface py-1.5 text-sm font-semibold shadow-card'
                      : 'rounded-lg py-1.5 text-sm font-medium text-muted'
                  }
                >
                  {m === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <input
                  className="input"
                  placeholder="Your name (shown to your league)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={40}
                />
              )}
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />

              {error && <p className="text-xs text-red-500">{error}</p>}
              {notice && <p className="text-xs text-accent">{notice}</p>}

              <button className="btn-primary w-full" disabled={busy}>
                {busy ? 'One sec…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-[11px] text-muted">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              onClick={() => signInWithGoogle().then((err) => err && setError(err))}
              className="btn-secondary flex w-full items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted">
            By The Football Game Co.
          </p>
        </div>
      </div>
    </div>
  );
}
