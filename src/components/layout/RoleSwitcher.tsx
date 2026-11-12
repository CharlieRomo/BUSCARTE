import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, LayoutDashboard, RotateCcw, ShieldCheck, UserRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import type { Role } from '../../types';
import { cn } from '../../utils/cn';

const ROLES: { role: Role; label: string; desc: string; path: string; Icon: typeof UserRound }[] = [
  { role: 'customer', label: 'Cliente', desc: 'Buscar y contratar artistas', path: '/', Icon: UserRound },
  { role: 'artist', label: 'Artista', desc: 'Panel, solicitudes y perfil', path: '/panel', Icon: LayoutDashboard },
  { role: 'admin', label: 'Admin', desc: 'Operación de la plataforma', path: '/admin', Icon: ShieldCheck },
];

export function RoleSwitcher({ align = 'right' }: { align?: 'left' | 'right' }) {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const notify = useToast();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = ROLES.find((r) => r.role === state.role) ?? ROLES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (r: (typeof ROLES)[number]) => {
    actions.setRole(r.role);
    setOpen(false);
    navigate(r.path);
    notify(`Ahora ves Buscarte como ${r.label.toLowerCase()}`, 'info');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface pl-1.5 pr-3 text-sm font-semibold transition-colors hover:border-brand-300"
      >
        <span className="grid size-7 place-items-center rounded-full bg-brand-500 text-white">
          <current.Icon size={15} />
        </span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={15} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div role="menu" className={cn('absolute top-12 z-40 w-72 animate-fade-up rounded-2xl border border-line bg-surface p-2 shadow-pop', align === 'right' ? 'right-0' : 'left-0')}>
          <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-[0.12em] text-mute">Modo demo · cambiar de rol</p>
          {ROLES.map((r) => (
            <button
              key={r.role}
              role="menuitemradio"
              aria-checked={r.role === state.role}
              onClick={() => pick(r)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-lavender"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <r.Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{r.label}</span>
                <span className="block text-xs text-mute">{r.desc}</span>
              </span>
              {r.role === state.role && <Check size={16} className="text-brand-500" />}
            </button>
          ))}
          <div className="mt-1 border-t border-line pt-1">
            {confirmReset ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="flex-1 text-xs text-ink-600">¿Borrar reservas y cambios de la demo?</span>
                <button
                  className="rounded-lg bg-danger px-2.5 py-1.5 text-xs font-semibold text-white"
                  onClick={() => {
                    actions.resetDemo();
                    setConfirmReset(false);
                    setOpen(false);
                    navigate('/');
                    notify('Datos de demostración restablecidos');
                  }}
                >
                  Restablecer
                </button>
                <button className="rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-600 hover:bg-lavender" onClick={() => setConfirmReset(false)}>
                  No
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-lavender">
                <RotateCcw size={15} /> Restablecer datos de la demo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
