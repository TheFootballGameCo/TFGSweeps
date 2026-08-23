// Sticky top header: brand, desktop nav, refresh + theme toggle.
import { useData } from '../../context/DataContext';
import { DesktopNav } from './Navigation';
import ThemeToggle from '../ThemeToggle';
import { cx, formatRelative } from '../../lib/ui';
import { SEASON } from '../../config/app';

export default function Header() {
  const { data, refreshing, refresh } = useData();

  return (
    <header className="pt-safe sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xl" aria-hidden>⚽️</span>
          <span className="min-w-0">
            <span className="block truncate font-bold leading-tight tracking-tight">
              TFG Sweeps
            </span>
            <span className="block text-[10px] leading-tight text-muted">
              Premier League {SEASON.label}
            </span>
          </span>
        </div>

        <div className="mx-auto">
          <DesktopNav />
        </div>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {data && (
            <span className="hidden text-[11px] text-muted md:block">
              Updated {formatRelative(data.lastUpdated)}
            </span>
          )}
          <button
            onClick={refresh}
            aria-label="Refresh data"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-text"
          >
            <svg
              className={cx('h-4 w-4', refreshing && 'animate-spin')}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
