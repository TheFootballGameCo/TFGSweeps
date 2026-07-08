// Shared navigation definition so Header (desktop) and bottom bar (mobile)
// stay in sync. Icons are inline SVG paths kept tiny for performance.
export interface NavItem {
  to: string;
  label: string;
  /** SVG path(s) for a 24x24 stroked icon. */
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'M4 21V9m6 12V3m6 18v-7' },
  { to: '/matches', label: 'Matches', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 0v6l4 2' },
  { to: '/table', label: 'PL Table', icon: 'M3 3v18h18M9 17V9m4 8V5m4 12v-6' },
  { to: '/teams', label: 'Teams', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
];
