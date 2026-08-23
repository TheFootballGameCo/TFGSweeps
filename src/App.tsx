// Root component: providers + routing. No accounts, no backend — the league
// is baked into config/sweepstake.ts. Loading/error handled once here.
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider, useData } from './context/DataContext';
import AppLayout from './components/layout/AppLayout';
import LoadingState from './components/states/LoadingState';
import ErrorState from './components/states/ErrorState';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Matches from './pages/Matches';
import Table from './pages/Table';
import Teams from './pages/Teams';

function AppContent() {
  const { data, loading, error, refresh } = useData();

  if (loading && !data) return <LoadingState />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/table" element={<Table />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  );
}
