// ---------------------------------------------------------------------------
// League context. Everything multiplayer lives here:
//   - the user's leagues + the "active" one (persisted per device)
//   - members, team picks and scorer picks for the active league
//   - actions: create / join / switch league, assign teams, set scorer pick
//
// DEMO MODE: when Supabase isn't configured, a sample league (4 players,
// 5 clubs each) is served from memory. Assignments and scorer picks still
// work — they just don't persist. Creating/joining real leagues needs the
// backend.
// ---------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { League, Membership, TeamPick, ScorerPick } from '../types';
import { SEASON, MAX_LEAGUE_SIZE } from '../config/app';
import {
  DEMO_LEAGUE,
  DEMO_MEMBERS,
  DEMO_TEAM_PICKS,
  DEMO_SCORER_PICKS,
} from '../lib/demo';

const ACTIVE_KEY = 'tfg-sweeps-active-league';
const DEMO_ERROR = 'Demo mode — connect Supabase (see README) to use real leagues.';

/** Readable join code: no ambiguous characters (0/O, 1/I/L). */
function generateJoinCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** Fisher–Yates shuffle (copy). */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Even allocation: every member gets exactly floor(clubs / members) clubs and
 * any remainder stays unassigned (e.g. 3 players -> 6 each, 2 left out).
 */
function buildAllocation(
  clubs: Array<{ id: string; name: string }>,
  memberIds: string[],
  leagueId: string
): Array<Omit<TeamPick, 'id'>> {
  const perMember = Math.floor(clubs.length / memberIds.length);
  const shuffled = shuffle(clubs).slice(0, perMember * memberIds.length);
  return shuffled.map((club, i) => ({
    league_id: leagueId,
    user_id: memberIds[i % memberIds.length],
    team_id: club.id,
    team_name: club.name,
  }));
}

interface LeagueContextValue {
  leagues: League[];
  activeLeague: League | null;
  members: Membership[];
  teamPicks: TeamPick[];
  scorerPicks: ScorerPick[];
  loadingLeagues: boolean;
  isAdmin: boolean;
  isDemo: boolean;
  setActiveLeagueId: (id: string) => void;
  createLeague: (
    name: string,
    stakePerPlayer: number
  ) => Promise<{ error: string | null; league?: League }>;
  joinLeague: (code: string) => Promise<{ error: string | null; leagueId?: string }>;
  leaveLeague: (leagueId: string) => Promise<string | null>;
  assignTeam: (teamId: string, teamName: string, userId: string | null) => Promise<string | null>;
  /** Member: claim an unowned club for yourself. */
  claimTeam: (teamId: string, teamName: string) => Promise<string | null>;
  /** Member: give up one of your own clubs. */
  releaseTeam: (teamId: string) => Promise<string | null>;
  randomiseTeams: (clubs: Array<{ id: string; name: string }>) => Promise<string | null>;
  setScorerPick: (playerName: string) => Promise<string | null>;
  /** Admin: change the per-player stake shown in the prize pot. */
  updateStake: (amount: number) => Promise<string | null>;
  refreshLeagueData: () => Promise<void>;
}

const LeagueContext = createContext<LeagueContextValue | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const isDemo = !isSupabaseConfigured;

  const [leagues, setLeagues] = useState<League[]>(isDemo ? [DEMO_LEAGUE] : []);
  const [activeLeagueId, setActiveId] = useState<string | null>(() =>
    isDemo ? DEMO_LEAGUE.id : localStorage.getItem(ACTIVE_KEY)
  );
  const [members, setMembers] = useState<Membership[]>(isDemo ? DEMO_MEMBERS : []);
  const [teamPicks, setTeamPicks] = useState<TeamPick[]>(isDemo ? DEMO_TEAM_PICKS : []);
  const [scorerPicks, setScorerPicks] = useState<ScorerPick[]>(
    isDemo ? DEMO_SCORER_PICKS : []
  );
  const [loadingLeagues, setLoadingLeagues] = useState(!isDemo);

  const activeLeague = leagues.find((l) => l.id === activeLeagueId) ?? null;
  const isAdmin = members.some((m) => m.user_id === userId && m.role === 'admin');

  const setActiveLeagueId = useCallback(
    (id: string) => {
      if (!isDemo) localStorage.setItem(ACTIVE_KEY, id);
      setActiveId(id);
    },
    [isDemo]
  );

  // --- Load my leagues (real mode only) ---
  const loadLeagues = useCallback(async () => {
    if (isDemo) return;
    if (!userId) {
      setLeagues([]);
      setLoadingLeagues(false);
      return;
    }
    setLoadingLeagues(true);
    const { data } = await supabase
      .from('memberships')
      .select(
        'league_id, leagues (id, name, join_code, owner_id, season_label, stake_per_player, created_at)'
      )
      .eq('user_id', userId);
    const list = (data ?? [])
      .map((row) => row.leagues as unknown as League)
      .filter(Boolean)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    setLeagues(list);
    setLoadingLeagues(false);
  }, [userId, isDemo]);

  useEffect(() => {
    loadLeagues();
  }, [loadLeagues]);

  // Default the active league to the first one if none is set / it vanished.
  useEffect(() => {
    if (isDemo || loadingLeagues || leagues.length === 0) return;
    if (!activeLeagueId || !leagues.some((l) => l.id === activeLeagueId)) {
      setActiveLeagueId(leagues[0].id);
    }
  }, [leagues, activeLeagueId, loadingLeagues, setActiveLeagueId, isDemo]);

  // --- Load the active league's members + picks (real mode only) ---
  const refreshLeagueData = useCallback(async () => {
    if (isDemo) return;
    if (!activeLeagueId || !userId) {
      setMembers([]);
      setTeamPicks([]);
      setScorerPicks([]);
      return;
    }
    const [membersRes, teamsRes, scorersRes] = await Promise.all([
      supabase
        .from('memberships')
        .select('id, league_id, user_id, role, profiles (id, display_name)')
        .eq('league_id', activeLeagueId),
      supabase.from('team_picks').select('*').eq('league_id', activeLeagueId),
      supabase.from('scorer_picks').select('*').eq('league_id', activeLeagueId),
    ]);
    setMembers(
      (membersRes.data ?? []).map((row) => ({
        id: row.id,
        league_id: row.league_id,
        user_id: row.user_id,
        role: row.role,
        profile: (row as { profiles?: unknown }).profiles as Membership['profile'],
      }))
    );
    setTeamPicks((teamsRes.data ?? []) as TeamPick[]);
    setScorerPicks((scorersRes.data ?? []) as ScorerPick[]);
  }, [activeLeagueId, userId, isDemo]);

  useEffect(() => {
    refreshLeagueData();
  }, [refreshLeagueData]);

  // --- Actions ---

  const createLeague = useCallback(
    async (name: string, stakePerPlayer: number) => {
      if (isDemo) return { error: DEMO_ERROR };
      if (!userId) return { error: 'Not signed in' };
      const join_code = generateJoinCode();
      const { data, error } = await supabase
        .from('leagues')
        .insert({
          name,
          join_code,
          owner_id: userId,
          season_label: SEASON.label,
          stake_per_player: stakePerPlayer,
        })
        .select()
        .single();
      if (error) return { error: error.message };
      const league = data as League;
      const { error: memberError } = await supabase
        .from('memberships')
        .insert({ league_id: league.id, user_id: userId, role: 'admin' });
      if (memberError) return { error: memberError.message };
      await loadLeagues();
      setActiveLeagueId(league.id);
      return { error: null, league };
    },
    [userId, loadLeagues, setActiveLeagueId, isDemo]
  );

  const joinLeague = useCallback(
    async (code: string) => {
      if (isDemo) return { error: DEMO_ERROR };
      if (!userId) return { error: 'Not signed in' };
      const { data, error } = await supabase.rpc('join_league', { code });
      if (error) return { error: error.message };
      await loadLeagues();
      const leagueId = data as string;
      setActiveLeagueId(leagueId);
      return { error: null, leagueId };
    },
    [userId, loadLeagues, setActiveLeagueId, isDemo]
  );

  const leaveLeague = useCallback(
    async (leagueId: string) => {
      if (isDemo) return DEMO_ERROR;
      if (!userId) return 'Not signed in';
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', userId);
      if (error) return error.message;
      if (activeLeagueId === leagueId) localStorage.removeItem(ACTIVE_KEY);
      await loadLeagues();
      return null;
    },
    [userId, activeLeagueId, loadLeagues, isDemo]
  );

  /** Admin: give a club to a member (or unassign with null). */
  const assignTeam = useCallback(
    async (teamId: string, teamName: string, assignTo: string | null) => {
      if (!activeLeagueId) return 'No active league';

      if (isDemo) {
        setTeamPicks((picks) => {
          const without = picks.filter((p) => p.team_id !== teamId);
          if (!assignTo) return without;
          return [
            ...without,
            {
              id: `demo-t-${teamId}`,
              league_id: activeLeagueId,
              user_id: assignTo,
              team_id: teamId,
              team_name: teamName,
            },
          ];
        });
        return null;
      }

      const { error: delError } = await supabase
        .from('team_picks')
        .delete()
        .eq('league_id', activeLeagueId)
        .eq('team_id', teamId);
      if (delError) return delError.message;
      if (assignTo) {
        const { error } = await supabase.from('team_picks').insert({
          league_id: activeLeagueId,
          user_id: assignTo,
          team_id: teamId,
          team_name: teamName,
        });
        if (error) return error.message;
      }
      await refreshLeagueData();
      return null;
    },
    [activeLeagueId, refreshLeagueData, isDemo]
  );

  /** Admin: shuffle clubs evenly across members; remainder stays unassigned. */
  const randomiseTeams = useCallback(
    async (clubs: Array<{ id: string; name: string }>) => {
      if (!activeLeagueId) return 'No active league';
      if (members.length === 0) return 'No members to assign to';

      const rows = buildAllocation(
        clubs,
        members.map((m) => m.user_id),
        activeLeagueId
      );

      if (isDemo) {
        setTeamPicks(rows.map((r, i) => ({ ...r, id: `demo-t-${i}` })));
        return null;
      }

      const { error: delError } = await supabase
        .from('team_picks')
        .delete()
        .eq('league_id', activeLeagueId);
      if (delError) return delError.message;
      const { error } = await supabase.from('team_picks').insert(rows);
      if (error) return error.message;
      await refreshLeagueData();
      return null;
    },
    [activeLeagueId, members, refreshLeagueData, isDemo]
  );

  /** Member: claim an unowned club for yourself. */
  const claimTeam = useCallback(
    async (teamId: string, teamName: string) => {
      if (!activeLeagueId || !userId) return 'No active league';
      if (teamPicks.some((p) => p.team_id === teamId)) return 'That club is already taken';

      if (isDemo) {
        setTeamPicks((picks) => [
          ...picks.filter((p) => p.team_id !== teamId),
          {
            id: `demo-t-${teamId}`,
            league_id: activeLeagueId,
            user_id: userId,
            team_id: teamId,
            team_name: teamName,
          },
        ]);
        return null;
      }

      const { error } = await supabase.from('team_picks').insert({
        league_id: activeLeagueId,
        user_id: userId,
        team_id: teamId,
        team_name: teamName,
      });
      if (error)
        return error.code === '23505' ? 'That club was just taken by someone else' : error.message;
      await refreshLeagueData();
      return null;
    },
    [activeLeagueId, userId, teamPicks, refreshLeagueData, isDemo]
  );

  /** Member: give up one of your own clubs. */
  const releaseTeam = useCallback(
    async (teamId: string) => {
      if (!activeLeagueId || !userId) return 'No active league';

      if (isDemo) {
        setTeamPicks((picks) =>
          picks.filter((p) => !(p.team_id === teamId && p.user_id === userId))
        );
        return null;
      }

      const { error } = await supabase
        .from('team_picks')
        .delete()
        .eq('league_id', activeLeagueId)
        .eq('team_id', teamId)
        .eq('user_id', userId);
      if (error) return error.message;
      await refreshLeagueData();
      return null;
    },
    [activeLeagueId, userId, refreshLeagueData, isDemo]
  );

  /** Admin: change the per-player stake shown in the prize pot. */
  const updateStake = useCallback(
    async (amount: number) => {
      if (!activeLeagueId) return 'No active league';

      if (isDemo) {
        setLeagues((list) =>
          list.map((l) =>
            l.id === activeLeagueId ? { ...l, stake_per_player: amount } : l
          )
        );
        return null;
      }

      const { error } = await supabase
        .from('leagues')
        .update({ stake_per_player: amount })
        .eq('id', activeLeagueId);
      if (error) return error.message;
      await loadLeagues();
      return null;
    },
    [activeLeagueId, loadLeagues, isDemo]
  );

  /** Member: set (or change) my goalscorer pick. */
  const setScorerPick = useCallback(
    async (playerName: string) => {
      if (!activeLeagueId || !userId) return 'No active league';

      if (isDemo) {
        setScorerPicks((picks) => [
          ...picks.filter((p) => p.user_id !== userId),
          {
            id: `demo-s-${userId}`,
            league_id: activeLeagueId,
            user_id: userId,
            player_name: playerName,
          },
        ]);
        return null;
      }

      const { error } = await supabase
        .from('scorer_picks')
        .upsert(
          { league_id: activeLeagueId, user_id: userId, player_name: playerName },
          { onConflict: 'league_id,user_id' }
        );
      if (error) return error.message;
      await refreshLeagueData();
      return null;
    },
    [activeLeagueId, userId, refreshLeagueData, isDemo]
  );

  return (
    <LeagueContext.Provider
      value={{
        leagues,
        activeLeague,
        members,
        teamPicks,
        scorerPicks,
        loadingLeagues,
        isAdmin,
        isDemo,
        setActiveLeagueId,
        createLeague,
        joinLeague,
        leaveLeague,
        assignTeam,
        claimTeam,
        releaseTeam,
        randomiseTeams,
        setScorerPick,
        updateStake,
        refreshLeagueData,
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague(): LeagueContextValue {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error('useLeague must be used within LeagueProvider');
  return ctx;
}

export { MAX_LEAGUE_SIZE };
