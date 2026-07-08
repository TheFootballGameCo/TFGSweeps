// Full-page error with retry, used when the first fetch fails outright.
export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-text">
      <span className="text-3xl" aria-hidden>😵</span>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      <button onClick={onRetry} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
