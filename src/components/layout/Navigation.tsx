// Responsive navigation.
// - Desktop (sm+): inline pill nav, rendered inside the Header.
// - Mobile: fixed bottom tab bar (rendered by AppLayout).
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import { cx } from '../../lib/ui';

function Icon({ path }: { path: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

/** Desktop horizontal nav (hidden on mobile). */
export function DesktopNav() {
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cx(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              isActive ? 'bg-surface-2 text-text' : 'text-muted hover:text-text'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Mobile bottom tab bar (hidden on desktop). */
export function MobileNav() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-5xl items-stretch justify-around px-2 pt-1.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cx(
                'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-accent' : 'text-muted'
              )
            }
          >
            <Icon path={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
