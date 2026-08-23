// Glue hook: live PL data + baked-in config -> ranked standings.
import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { computeStandings, ownerFor } from '../lib/scoring';
import type { PlayerStanding } from '../types';

export function useStandings(): {
  standings: PlayerStanding[];
  ownerFor: (teamId: string) => string | null;
} {
  const { data } = useData();

  const standings = useMemo(
    () => (data ? computeStandings(data.matches, data.clubs) : []),
    [data]
  );

  return { standings, ownerFor };
}
