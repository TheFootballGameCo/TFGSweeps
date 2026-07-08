// Invite-link landing: /join/:code — joins automatically once signed in.
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLeague } from '../context/LeagueContext';
import LoadingState from '../components/states/LoadingState';

export default function Join() {
  const { code } = useParams<{ code: string }>();
  const { joinLeague } = useLeague();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (!code || attempted.current) return;
    attempted.current = true;
    joinLeague(code).then(({ error: err }) => {
      if (err) setError(err);
      else navigate('/', { replace: true });
    });
  }, [code, joinLeague, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-text">
        <span className="text-3xl" aria-hidden>🙈</span>
        <p className="max-w-sm text-sm text-muted">{error}</p>
        <button onClick={() => navigate('/leagues')} className="btn-primary">
          Go to my leagues
        </button>
      </div>
    );
  }

  return <LoadingState label="Joining the league…" />;
}
