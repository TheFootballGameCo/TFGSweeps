// App shell: header, scrollable content area, mobile bottom nav.
import type { ReactNode } from 'react';
import Header from './Header';
import { MobileNav } from './Navigation';
import { useData } from '../../context/DataContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { error, data } = useData();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />

      {/* Sample-data notice: the live feed couldn't be reached. */}
      {data?.usingSampleData && (
        <div className="border-b border-[#DEAA5E]/30 bg-[#DEAA5E]/15 px-4 py-1.5 text-center text-[11px] text-[#8A6320] dark:text-[#DEAA5E]">
          Live feed unreachable — showing simulated results for now.
        </div>
      )}

      {/* Data-status notice when a refresh fails but we still have data. */}
      {error && data && !data.usingSampleData && (
        <div className="border-b border-[#DEAA5E]/30 bg-[#DEAA5E]/15 px-4 py-1.5 text-center text-[11px] text-[#8A6320] dark:text-[#DEAA5E]">
          Live data refresh failed — showing the last good update.
        </div>
      )}

      {/* Content. Bottom padding leaves room for the mobile tab bar. */}
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:pb-10">{children}</main>

      <MobileNav />
    </div>
  );
}
