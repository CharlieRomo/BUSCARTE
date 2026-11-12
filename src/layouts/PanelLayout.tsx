import { useEffect, type ComponentType } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, Inbox, LayoutDashboard, Store, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/brand/Brand';
import { RoleSwitcher } from '../components/layout/RoleSwitcher';
import type { Role } from '../types';
import { cn } from '../utils/cn';

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<{ size?: number }>;
  end?: boolean;
  badge?: number;
}

function PanelShell({ role, title, items }: { role: Role; title: string; items: NavItem[] }) {
  const { pathname } = useLocation();
  const { state, actions } = useApp();

  useEffect(() => {
    if (state.role !== role) actions.setRole(role);
  }, [role, state.role, actions]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface p-4 md:flex">
        <Link to="/" className="px-2 py-1" aria-label="Ir al marketplace">
          <Logo />
        </Link>
        <p className="mt-6 px-3 text-xs font-bold uppercase tracking-[0.12em] text-mute">{title}</p>
        <nav className="mt-2 grid gap-1" aria-label={title}>
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              end={i.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive ? 'bg-brand-500 text-white' : 'text-ink-600 hover:bg-brand-50 hover:text-brand-700',
                )
              }
            >
              <i.Icon size={18} />
              <span className="flex-1">{i.label}</span>
              {!!i.badge && <span className="rounded-full bg-coral-500 px-2 py-0.5 text-xs text-white">{i.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 hover:bg-lavender">
          <Store size={18} /> Ver marketplace
        </Link>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-lavender/90 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 md:px-8">
            <Link to="/" className="md:hidden" aria-label="Ir al marketplace">
              <Logo compact />
            </Link>
            <p className="font-display text-base font-bold md:text-lg">{title}</p>
            <div className="ml-auto">
              <RoleSwitcher />
            </div>
          </div>
          <nav className="scrollbar-none flex gap-1 overflow-x-auto px-4 pb-2 md:hidden" aria-label={title}>
            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                end={i.end}
                className={({ isActive }) =>
                  cn('flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold', isActive ? 'bg-ink text-white' : 'bg-surface text-ink-600 border border-line')
                }
              >
                <i.Icon size={15} />
                {i.label}
                {!!i.badge && <span className="rounded-full bg-coral-500 px-1.5 text-[11px] text-white">{i.badge}</span>}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ArtistLayout() {
  const { state } = useApp();
  const pending = state.bookings.filter((b) => b.artistId === state.activeArtistId && b.status === 'pending').length;
  return (
    <PanelShell
      role="artist"
      title="Panel de artista"
      items={[
        { to: '/panel', label: 'Resumen', Icon: LayoutDashboard, end: true },
        { to: '/panel/solicitudes', label: 'Solicitudes', Icon: Inbox, badge: pending },
        { to: '/panel/calendario', label: 'Calendario', Icon: CalendarDays },
        { to: '/panel/perfil', label: 'Mi perfil', Icon: UserRound },
      ]}
    />
  );
}

export function AdminLayout() {
  return (
    <PanelShell
      role="admin"
      title="Administración"
      items={[
        { to: '/admin', label: 'Resumen', Icon: LayoutDashboard, end: true },
        { to: '/admin/revision', label: 'Revisión', Icon: Inbox },
        { to: '/admin/usuarios', label: 'Usuarios', Icon: UserRound },
        { to: '/admin/reservaciones', label: 'Reservaciones', Icon: CalendarDays },
      ]}
    />
  );
}
