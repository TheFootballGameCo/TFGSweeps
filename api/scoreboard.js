// ---------------------------------------------------------------------------
// Vercel serverless function: /api/scoreboard
// Forwards the request to ESPN's public Premier League scoreboard and returns
// the JSON. Running it server-side avoids browser cross-origin (CORS) issues
// and keeps the upstream host out of the client. No API key involved.
//
// Local dev doesn't use this file — Vite proxies the same path (see
// vite.config.ts). On Vercel, any file in /api becomes an endpoint automatically.
// ---------------------------------------------------------------------------

const ESPN_BASE =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard';

export default async function handler(req, res) {
  try {
    // Pass through the `dates` range (e.g. 20260801-20260831) if provided.
    const dates = typeof req.query?.dates === 'string' ? req.query.dates : '';
    const params = new URLSearchParams();
    if (dates) params.set('dates', dates);
    params.set('limit', '400');
    const url = `${ESPN_BASE}?${params.toString()}`;

    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'tfg-sweeps/1.0' },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `ESPN responded ${upstream.status}` });
      return;
    }

    const data = await upstream.json();

    // Cache at the edge for 30s so repeated viewers don't hammer ESPN.
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach ESPN feed', detail: String(err) });
  }
}
