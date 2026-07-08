// ---------------------------------------------------------------------------
// League context. Everything multiplayer lives here:
//   - the user's leagues + the "active" one (persisted per device)
//   - members, team picks and scorer picks for the active league
//   - actions: create / join / switch league, assign teams, set scorer pick
// ---------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { League, Membership, TeamPick, ScorerPick } from '../types';
import { SEASON } from '../config/app';

const ACTIVE_KEY = 'tfg-sweeps-active-league';

/** Readable join code: no ambiguous characters (0/O, 1/I/L). */
function generateJoinCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

interface LeagueContextValue {
  leagues: League[];
  activeLeague: League | null;
  members: Membership[];
  teamPicks: TeamPick[];
  scorerPicks: ScorerPick[];
  loadingLeagues: boolean;
  isAdmin: boolean;
  setActiveLeagueId: (id: string) => void;
  createLeague: (name: string) => Promise<{ error: string | null; league?: League }>;
  joinLeague: (code: string) => Promise<{ error: string | null; leagueId?: string }>;
  leaveLeague: (leagueId: string) => Promise<string | null>;
  assignTeam: (teamId: string, teamName: string, userId: string | null) => Promise<string | null>;
  randomiseTeams: (clubIds: Array<{ id: string; name: string }>) => Promise<string | null>;
  setScorerPick: (playerName: string) => Promise<string | null>;
  refreshLeagueData: () => Promise<void>;
}

const LeagueContext = createContext<LeagueContextValue | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeagueId, setActiveId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_KEY)
  );
  const [members, setMembers] = useState<Membership[]>([]);
  const [teamPicks, setTeamPicks] = useState<TeamPick[]>([]);
  const [scorerPicks, setScorerPicks] = useState<ScorerPick[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);

  const activeLeague = leagues.find((l) => l.id === activeLeagueId) ?? null;
  const isAdmin = members.some((m) => m.user_id === userId && m.role === 'admin');

  const setActiveLeagueId = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_KEY, id);
    setActiveId(id);
  }, []);

  // --- Load my leagues ---
  const loadLeagues = useCallback(async () => {
    if (!userId) {
      setLeagues([]);
      setLoadingLeagues(false);
      return;
    }
    setLoadingLeagues(true);
    const { data } = await supabase
      .from('memberships')
      .select('league_id, leagues (id, name, join_code, owner_id, season_label, created_at)')
      .eq('user_id', userId);
    const list = (data ?? [])
      .map((row) => row.leagues as unknown as League)
      .filter(Boolean)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    setLeagues(list);
    setLoadingLeagues(false);
  }, [userId]);

  useEffect(() => {
    loadLeagues();
  }, [loadLeagues]);

  // Default the active league to the first one if none is set / it vanished.
  useEffect(() => {
    if (loadingLeagues) return;
    if (leagues.length === 0) return;
    if (!activeLeagueId || !leagues.some((l) => l.id === activeLeagueId)) {
      setActiveLeagueId(leagues[0].id);
    }
  }, [leagues, activeLeagueId, loadingLeagues, setActiveLeagueId]);

  // --- Load the active league's members + picks ---
  const refreshLeagueData = useCallback(async () => {
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
  }, [activeLeagueId, userId]);

  useEffect(() => {
    refreshLeagueData();
  }, [refreshLeagueData]);

  // --- Actions ---

  const createLeague = useCallback(
    async (name: string) => {
      if (!userId) return { error: 'Not signed in' };
      const join_code = generateJoinCode();
      const { data, error } = await supabase
        .from('leagues')
        .insert({ name, join_code, owner_id: userId, season_label: SEASON.label })
        .select()
        .single();
      if (error) return { error: error.message };
      const league = data as League;
      // Owner becomes admin member.
      const { error: memberError } = await supabase
        .from('memberships')
        .insert({ league_id: league.id, user_id: userId, role: 'admin' });
      if (memberError) return { error: memberError.message };
      await loadLeagues();
      setActiveLeagueId(league.id);
      return { error: null, league };
    },
    [userId, loadLeagues, setActiveLeagueId]
  );

  const joinLeague = useCallback(
    async (code: string) => {
      if (!userId) return { error: 'Not signed in' };
      const { data, error } = await supabase.rpc('join_league', { code });
      if (error) return { error: error.message };
      await loadLeagues();
      const leagueId = data as string;
      setActiveLeagueId(leagueId);
      return { error: null, leagueId };
    },
    [userId, loadLeagues, setActiveLeagueId]
  );

  const leaveLeague = useCallback(
    async (leagueId: string) => {
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
    [userId, activeLeagueId, loadLeagues]
  );

  /** Admin: give a club to a member (or unassign with null). */
  const assignTeam = useCallback(
    async (teamId: string, teamName: string, assignTo: string | null) => {
      if (!activeLeagueId) return 'No active league';
      // Remove any existing ownership of this club in this league.
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
    [activeLeagueId, refreshLeagueData]
  );

  /** Admin: shuffle every club across members as evenly as possible. */
  const randomiseTeams = useCallback(
    async (clubs: Array<{ id: string; name: string }>) => {
      if (!activeLeagueId) return 'No active league';
      if (members.length === 0) return 'No members to assign to';

      const shuffled = [...clubs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const memberIds = members.map((m) => m.user_id);
      const rows = shuffled.map((club, i) => ({
        league_id: activeLeagueId,
        user_id: memberIds[i % memberIds.length],
        team_id: club.id,
        team_name: club.name,
      }));

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
    [activeLeagueId, members, refreshLeagueData]
  );

  /** Member: set (or change) my goalscorer pick. */
  const setScorerPick = useCallback(
    async (playerName: string) => {
      if (!activeLeagueId || !userId) return 'No active league';
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
    [activeLeagueId, userId, refreshLeagueData]
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
        setActiveLeagueId,
        createLeague,
        joinLeague,
        leaveLeague,
        assignTeam,
        randomiseTeams,
        setScorerPick,
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
