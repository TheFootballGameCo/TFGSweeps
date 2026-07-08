// Root component: providers + routing + auth/league gating.
// - Not signed in            -> /auth (join links survive the round-trip)
// - Signed in, no leagues    -> /leagues (create or join)
// - Signed in with a league  -> the app proper
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeagueProvider, useLeague } from './context/LeagueContext';
import { DataProvider, useData } from './context/DataContext';
import AppLayout from './components/layout/AppLayout';
import LoadingState from './components/states/LoadingState';
import ErrorState from './components/states/ErrorState';
import Auth from './pages/Auth';
import Leagues from './pages/Leagues';
import Join from './pages/Join';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Matches from './pages/Matches';
import Table from './pages/Table';
import Teams from './pages/Teams';

function AppContent() {
  const { session, initialising, configured } = useAuth();
  const { leagues, loadingLeagues, activeLeague } = useLeague();
  const { data, loading, error, refresh } = useData();
  const location = useLocation();

  // Demo mode (no Supabase configured): skip auth entirely and serve the
  // sample league so the whole app is explorable.
  if (!configured) {
    if (loading && !data) return <LoadingState />;
    if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  }

  if (configured && initialising) return <LoadingState label="Checking your session…" />;

  // Signed out: everything routes to /auth. Join links keep their target so
  // the user lands back on /join/CODE after signing in.
  if (configured && !session) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="*"
          element={<Navigate to="/auth" state={{ from: location.pathname }} replace />}
        />
      </Routes>
    );
  }

  if (configured && loadingLeagues) return <LoadingState label="Loading your leagues…" />;

  // Signed in but no league yet: onboarding.
  const needsLeague = leagues.length === 0;

  // First live-data load / hard failure.
  if (configured && !needsLeague) {
    if (loading && !data) return <LoadingState />;
    if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <Routes>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/join/:code" element={<Join />} />
      <Route path="/leagues" element={<Leagues />} />
      {needsLeague || !activeLeague ? (
        <Route path="*" element={<Navigate to="/leagues" replace />} />
      ) : (
        <>
          <Route
            path="/"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <AppLayout>
                <Leaderboard />
              </AppLayout>
            }
          />
          <Route
            path="/matches"
            element={
              <AppLayout>
                <Matches />
              </AppLayout>
            }
          />
          <Route
            path="/table"
            element={
              <AppLayout>
                <Table />
              </AppLayout>
            }
          />
          <Route
            path="/teams"
            element={
              <AppLayout>
                <Teams />
              </AppLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LeagueProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </LeagueProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
