-- ============================================================================
-- TFG Sweeps — Supabase schema
-- Run this once in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- Creates tables, Row Level Security policies, and the join-by-code function.
-- ============================================================================

-- ---------- Profiles (one per auth user) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Player',
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a user signs up (name from metadata or email).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Leagues ----------
create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  join_code text not null unique,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  season_label text not null default '2026/27',
  -- Stake each player puts in the pot. Purely informational: money is settled
  -- between players outside the app (keeps TFG clear of holding stakes).
  stake_per_player numeric(8,2) not null default 0 check (stake_per_player >= 0),
  created_at timestamptz not null default now()
);

-- ---------- Memberships ----------
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique (league_id, user_id)
);

-- ---------- Team picks (each club owned by exactly one member per league) ----------
create table if not exists public.team_picks (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  team_id text not null,      -- ESPN club id
  team_name text not null,    -- snapshot for display if the feed is down
  created_at timestamptz not null default now(),
  unique (league_id, team_id)
);

-- ---------- Scorer picks (one per member per league) ----------
create table if not exists public.scorer_picks (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  player_name text not null check (char_length(player_name) between 2 and 60),
  created_at timestamptz not null default now(),
  unique (league_id, user_id)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.leagues enable row level security;
alter table public.memberships enable row level security;
alter table public.team_picks enable row level security;
alter table public.scorer_picks enable row level security;

-- Helper: is the current user a member of a league? SECURITY DEFINER so the
-- check itself bypasses RLS (avoids infinite recursion in policies).
create or replace function public.is_league_member(league uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where league_id = league and user_id = auth.uid()
  );
$$;

create or replace function public.is_league_admin(league uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where league_id = league and user_id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles: readable by any signed-in user (needed to show member names);
-- only the owner can update their own.
create policy "profiles readable" on public.profiles
  for select to authenticated using (true);
create policy "own profile update" on public.profiles
  for update to authenticated using (id = auth.uid());

-- Leagues: members can read; anyone signed in can create (becoming owner);
-- only the owner can update/delete.
create policy "leagues readable by members" on public.leagues
  for select to authenticated using (public.is_league_member(id));
create policy "create league" on public.leagues
  for insert to authenticated with check (owner_id = auth.uid());
create policy "owner updates league" on public.leagues
  for update to authenticated using (owner_id = auth.uid());
create policy "owner deletes league" on public.leagues
  for delete to authenticated using (owner_id = auth.uid());

-- Memberships: members of a league can see its member list; users can insert
-- their own admin row when creating a league (joining happens via the
-- join_league function below); users can leave (delete own row); admins can
-- remove members.
create policy "memberships readable by members" on public.memberships
  for select to authenticated using (public.is_league_member(league_id));
create policy "insert own admin membership" on public.memberships
  for insert to authenticated
  with check (user_id = auth.uid() and role = 'admin' and
    exists (select 1 from public.leagues l where l.id = league_id and l.owner_id = auth.uid()));
create policy "leave league" on public.memberships
  for delete to authenticated using (user_id = auth.uid() or public.is_league_admin(league_id));

-- Team picks: members read. Clubs are PICKED by the players — any member can
-- claim an unowned club for THEMSELVES (the unique (league_id, team_id)
-- constraint stops double-claims) and release their own. Admins can also
-- assign/remove any club directly.
create policy "team picks readable" on public.team_picks
  for select to authenticated using (public.is_league_member(league_id));
create policy "claim or admin-assign team picks" on public.team_picks
  for insert to authenticated with check (
    public.is_league_admin(league_id)
    or (user_id = auth.uid() and public.is_league_member(league_id))
  );
create policy "release own or admin deletes team picks" on public.team_picks
  for delete to authenticated using (
    public.is_league_admin(league_id) or user_id = auth.uid()
  );

-- Scorer picks: members read; each member manages their OWN pick.
create policy "scorer picks readable" on public.scorer_picks
  for select to authenticated using (public.is_league_member(league_id));
create policy "own scorer pick insert" on public.scorer_picks
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_league_member(league_id));
create policy "own scorer pick update" on public.scorer_picks
  for update to authenticated using (user_id = auth.uid());
create policy "own scorer pick delete" on public.scorer_picks
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================================
-- Join a league by code.
-- SECURITY DEFINER so a non-member can look the code up and insert their
-- membership without needing read access to the league first.
-- ============================================================================
create or replace function public.join_league(code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  target_league uuid;
  member_count int;
begin
  select id into target_league
  from public.leagues
  where upper(join_code) = upper(trim(code));

  if target_league is null then
    raise exception 'No league found for that code';
  end if;

  select count(*) into member_count
  from public.memberships where league_id = target_league;

  -- The format works because each player combines multiple clubs; leagues cap
  -- at 5 players (4 clubs each). 4 players x 5 clubs is the sweet spot.
  if member_count >= 5 then
    raise exception 'This league is full (5 players max)';
  end if;

  insert into public.memberships (league_id, user_id, role)
  values (target_league, auth.uid(), 'member')
  on conflict (league_id, user_id) do nothing;

  return target_league;
end;
$$;
