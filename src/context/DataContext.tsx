// ---------------------------------------------------------------------------
// Live PL data context: fixtures/results + the real table, refreshed on an
// interval. Pages read from here; fetching/parsing lives in lib/espn.ts.
// ---------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { PlData } from '../types';
import { fetchSeasonMatches, fetchTable } from '../lib/espn';
import { REFRESH_INTERVAL_MS } from '../config/app';

interface DataContextValue {
  data: PlData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      const [matches, standings] = await Promise.all([fetchSeasonMatches(), fetchTable()]);
      setData({
        matches,
        table: standings.table,
        clubs: standings.clubs,
        lastUpdated: new Date().toISOString(),
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load live data');
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  return (
    <DataContext.Provider value={{ data, loading, refreshing, error, refresh: load }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
