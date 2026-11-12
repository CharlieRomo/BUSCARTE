import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, Compass, Heart, Search, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/brand/Brand';
import { RoleSwitcher } from '../components/layout/RoleSwitcher';
import { ZonePicker } from '../components/layout/ZonePicker';
import { CATEGORIES } from '../data/categories';
import { cn } from '../utils/cn';

const TABS = [
  { to: '/', label: 'Explorar', Icon: Compass, end: true },
  { to: '/buscar', label: 'Buscar', Icon: Search },
  { to: '/ahora', label: 'Ahora', Icon: Zap },
  { to: '/favoritos', label: 'Favoritos', Icon: Heart },
  { to: '/mis-eventos', label: 'Mis eventos', Icon: CalendarDays },
];

export function CustomerLayout() {
  const { pathname } = useLocation();
  const { state, actions } = useApp();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Navegar a páginas de cliente devuelve el rol a "cliente" en la demo.
  useEffect(() => {
    if (state.role !== 'customer' && !pathname.startsWith('/unete')) actions.setRole('customer');
  }, [pathname, state.role, actions]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-lavender/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
          <Link to="/" aria-label="Buscarte, inicio">
            <span className="hidden sm:block"><Logo /></span>
            <span className="sm:hidden"><Logo compact /></span>
          </Link>
          <ZonePicker className="max-w-[44vw] md:ml-2" />
          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Principal">
            {TABS.slice(1).map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-ink text-white' : 'text-ink-600 hover:bg-brand-50 hover:text-brand-700',
                    t.to === '/ahora' && 'text-ok',
                  )
                }
              >
                <t.Icon size={16} />
                {t.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto md:ml-2">
            <RoleSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>

      <footer className="hidden border-t border-line bg-surface md:block">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-mute">Contrata música en vivo en CDMX con precios claros y artistas verificados.</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold">Categorías</h3>
            <ul className="grid gap-2 text-sm text-ink-600">
              {CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link className="hover:text-brand-600" to={`/buscar?cat=${c.id}`}>
                    {c.plural}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold">Contrata</h3>
            <ul className="grid gap-2 text-sm text-ink-600">
              <li><Link className="hover:text-brand-600" to="/ahora">Disponible ahora</Link></li>
              <li><Link className="hover:text-brand-600" to="/buscar">Explorar artistas</Link></li>
              <li><Link className="hover:text-brand-600" to="/mis-eventos">Mis eventos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold">Para artistas</h3>
            <ul className="grid gap-2 text-sm text-ink-600">
              <li><Link className="hover:text-brand-600" to="/unete">Registra tu perfil gratis</Link></li>
              <li className="text-mute">Comisión del 8% solo por contratación exitosa</li>
            </ul>
          </div>
        </div>
        <p className="border-t border-line py-5 text-center text-xs text-mute">Versión de demostración · pagos, ubicación y mensajes son simulados · © 2026 Buscarte</p>
      </footer>

      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-safe backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {TABS.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  cn('flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold', isActive ? 'text-brand-600' : 'text-mute')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', isActive && 'bg-brand-50', t.to === '/ahora' && !isActive && 'text-ok')}>
                      <t.Icon size={20} />
                    </span>
                    {t.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
