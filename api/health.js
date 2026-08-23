// Diagnostic endpoint: reports whether this deployment can reach ESPN.
// Visit /api/health on the live site to see what the serverless side sees.
export default async function handler(req, res) {
  const out = { ok: false, upstreamStatus: null, error: null, node: process.version };
  try {
    const upstream = await fetch(
      'https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings?season=2026',
      { headers: { 'User-Agent': 'tfg-sweeps/1.0' } }
    );
    out.upstreamStatus = upstream.status;
    out.ok = upstream.ok;
  } catch (err) {
    out.error = String(err);
  }
  res.status(200).json(out);
}
