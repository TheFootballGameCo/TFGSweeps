// Shown when Supabase env vars are missing — points at the README instead of
// crashing or silently failing.
export default function SetupNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-text">
      <span className="text-3xl" aria-hidden>🔧</span>
      <h1 className="text-lg font-bold">TFG Sweeps needs a backend</h1>
      <p className="max-w-md text-sm text-muted">
        Supabase credentials are missing. Copy <code className="rounded bg-surface-2 px-1">.env.example</code> to{' '}
        <code className="rounded bg-surface-2 px-1">.env</code>, add your project URL and anon key,
        then restart the dev server. Full setup steps are in the README.
      </p>
    </div>
  );
}
