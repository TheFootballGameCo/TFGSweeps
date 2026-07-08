// Glue hook: combines league picks with live PL data into ranked standings,
// plus an owner lookup used all over the UI.
import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLeague } from '../context/LeagueContext';
import { computeStandings } from '../lib/scoring';
import type { MemberStanding } from '../types';

export function useStandings(): {
  standings: MemberStanding[];
  /** Display name of a club's owner in the active league, or null. */
  ownerFor: (teamId: string) => string | null;
} {
  const { data } = useData();
  const { members, teamPicks, scorerPicks } = useLeague();

  const standings = useMemo(
    () =>
      data
        ? computeStandings(members, teamPicks, scorerPicks, data.matches, data.clubs)
        : [],
    [data, members, teamPicks, scorerPicks]
  );

  const ownerNameById = useMemo(() => {
    const nameOf = new Map(members.map((m) => [m.user_id, m.profile?.display_name ?? 'Player']));
    const map = new Map<string, string>();
    for (const pick of teamPicks) {
      const name = nameOf.get(pick.user_id);
      if (name) map.set(pick.team_id, name);
    }
    return map;
  }, [members, teamPicks]);

  return {
    standings,
    ownerFor: (teamId: string) => ownerNameById.get(teamId) ?? null,
  };
}
