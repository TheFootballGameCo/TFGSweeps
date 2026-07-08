# TFG Sweeps

A Premier League season sweepstake by **The Football Game Co.** Sign up, create a
private league, invite your mates, own clubs, pick a goalscorer, and track the
leaderboard live all season.

Built with Vite + React + TypeScript + Tailwind. Live PL data comes from ESPN's
free public feed (no API key). Accounts and leagues live in Supabase.

## How it works

- **Clubs**: each league's admin assigns the 20 PL clubs to members (or hits
  Randomise). A club earns its owner **3 pts per win, 1 per draw** — computed
  live from real results.
- **Goalscorer**: every member picks one player; **+1 pt per PL goal**.
- **Leaderboard**: club points + scorer points, ranked with GD then wins as
  tiebreakers. Nothing to update by hand — it all derives from the live feed.
- **League size**: 3–5 players. The format works because each player combines
  multiple clubs — 4 players x 5 clubs is the sweet spot; 3 players get 6 each
  (2 clubs sit out); 5 players get 4 each.
- **Picking clubs**: players claim their own clubs (capped at their fair
  share). Admins can also assign directly; Quick fill (random) exists as a
  testing shortcut only.
- **Prize pot**: the admin sets a stake per player; the app shows the total up
  for grabs and who it's currently heading to. Money is settled between
  players outside the app — TFG never holds stakes.
- **Business model**: free to sign up and join. Creating a league costs £5
  (payment not wired up yet — free during beta). Keeps the app ad-free.
- **Joining**: invite link (`/#/join/CODE`) or the 6-character code typed in-app.

## Demo mode (no setup needed)

**Easiest**: double-click `dist/index.html` — the built app opens in your
browser, no terminal, no server. Without a live connection to the feed it uses
a generated sample season (full 380 fixtures, scorers, table) so every screen
is populated.

Or run `npm install && npm run dev` with **no .env file** and you get the same
sample league backed by real 2025/26 results via the dev proxy. Either way:
4 players, 5 clubs each, picks work in-memory (reset on refresh).

> The season window is currently pointed at 2025/26 for the beta so there's a
> full season of data on screen. Flip it in `src/config/app.ts` before launch.

## Setup

### 1. Supabase (one-off, ~5 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, paste and run `supabase/schema.sql`.
3. (Optional) Auth -> Providers -> enable **Google** for one-tap sign-in.
   Email/password works out of the box.
4. Settings -> API: copy the **Project URL** and **anon key**.

### 2. Local dev

```bash
cp .env.example .env   # paste your Supabase URL + anon key
npm install
npm run dev
```

### 3. Deploy (Vercel)

1. Push this folder to a **new** GitHub repo.
2. Import it in Vercel (framework auto-detects as Vite).
3. Add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. In Supabase: Auth -> URL Configuration -> set your Vercel URL as the Site URL
   (so OAuth and email links redirect properly).

The `/api/scoreboard` and `/api/standings` serverless functions proxy ESPN's
public feed — no keys, cached at the edge.

## Config

Season window, scoring values and refresh cadence live in `src/config/app.ts`.

## Project structure

```
api/            Vercel serverless proxies to ESPN (eng.1)
supabase/       schema.sql — tables, RLS policies, join_league() function
src/
  config/       scoring + season settings
  lib/          espn parser, scoring engine, supabase client
  context/      Auth, League (members/picks), Data (live PL), Theme
  hooks/        useStandings (picks + live data -> leaderboard)
  pages/        Auth, Leagues, Join, Dashboard, Leaderboard, Matches, Table, Teams
  components/   layout, cards, states
```
