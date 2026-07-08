// ---------------------------------------------------------------------------
// Vercel serverless function: /api/standings
// Forwards to ESPN's public Premier League standings endpoint (the real PL
// table) and returns the JSON. Same pattern as api/scoreboard.js — no API key,
// runs server-side to avoid browser cross-origin issues.
// ---------------------------------------------------------------------------

const ESPN_BASE = 'https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings';

export default async function handler(req, res) {
  try {
    const season = typeof req.query?.season === 'string' ? req.query.season : '';
    const url = season ? `${ESPN_BASE}?season=${encodeURIComponent(season)}` : ESPN_BASE;

    const upstream = await fetch(url, { headers: { 'User-Agent': 'tfg-sweeps/1.0' } });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `ESPN responded ${upstream.status}` });
      return;
    }

    const data = await upstream.json();
    // The table changes slowly; cache a little longer than live scores.
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach ESPN standings', detail: String(err) });
  }
}
