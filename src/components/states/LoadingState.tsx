// Full-page loading skeleton for the first data fetch.
export default function LoadingState({ label = 'Loading live data…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg text-text">
      <span className="text-3xl animate-pulse-live" aria-hidden>⚽️</span>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
