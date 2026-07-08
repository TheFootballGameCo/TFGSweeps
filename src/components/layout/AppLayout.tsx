// App shell: header, scrollable content area, mobile bottom nav.
import type { ReactNode } from 'react';
import Header from './Header';
import { MobileNav } from './Navigation';
import { useData } from '../../context/DataContext';
import { useLeague } from '../../context/LeagueContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { error, data } = useData();
  const { isDemo } = useLeague();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />

      {/* Demo banner: no backend connected, sample league in play. */}
      {isDemo && (
        <div className="border-b border-accent/20 bg-accent/10 px-4 py-1.5 text-center text-[11px] text-accent">
          Demo mode — sample league{data?.usingSampleData ? ' with simulated results' : ' with real 2025/26 results'}. Connect Supabase for live leagues.
        </div>
      )}

      {/* Data-status notice when live data can't be refreshed. */}
      {error && data && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-center text-[11px] text-amber-600 dark:text-amber-400">
          Live data refresh failed — showing the last good update.
        </div>
      )}

      {/* Content. Bottom padding leaves room for the mobile tab bar. */}
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:pb-10">{children}</main>

      <MobileNav />
    </div>
  );
}
