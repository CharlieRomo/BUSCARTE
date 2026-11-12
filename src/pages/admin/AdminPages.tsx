import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarCheck, CircleDollarSign, Inbox, Search, TrendingUp, UserRound, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ArtistCover } from '../../components/artist/ArtistCover';
import { BookingStatusBadge } from '../../components/booking/BookingStatusBadge';
import { Button } from '../../components/ui/Button';
import { Badge, EmptyState, StatCard } from '../../components/ui/Primitives';
import { CATEGORIES, getCategory } from '../../data/categories';
import { PLATFORM } from '../../config/platform';
import { STATUS_LABEL } from '../../services/bookingService';
import type { BookingStatus } from '../../types';
import { formatDateShort, formatMXN, formatNumber } from '../../utils/format';
import { getZone } from '../../utils/geo';
import { percent } from '../../utils/pricing';

const COUNTS_AS_VOLUME: BookingStatus[] = ['confirmed', 'completed'];

export function AdminDashboardPage() {
  const { state } = useApp();
  const m = useMemo(() => {
    const valid = state.bookings.filter((b) => COUNTS_AS_VOLUME.includes(b.status));
    const gmv = valid.reduce((s, b) => s + b.subtotal, 0);
    const commission = valid.reduce((s, b) => s + b.artistCommission, 0);
    const byCategory = CATEGORIES.map((c) => ({
      cat: c,
      value: valid.filter((b) => state.artists.find((a) => a.id === b.artistId)?.category === c.id).reduce((s, b) => s + b.subtotal, 0),
    }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
    const byStatus = (Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => ({ s, n: state.bookings.filter((b) => b.status === s).length }));
    const responded = state.bookings.filter((b) => ['confirmed', 'completed', 'rejected'].includes(b.status));
    const acceptance = responded.length ? responded.filter((b) => b.status !== 'rejected').length / responded.length : 0;
    return { gmv, commission, byCategory, byStatus, acceptance, validCount: valid.length };
  }, [state.bookings, state.artists]);

  const active = state.artists.filter((a) => a.status === 'active');
  const pendingReview = state.artists.filter((a) => a.status === 'pending_review');
  const customers = state.users.filter((u) => u.role === 'customer');
  const max = Math.max(1, ...m.byCategory.map((x) => x.value));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[26px] font-extrabold">Resumen de la plataforma</h1>
        <p className="text-[15px] text-mute">Datos de demostración. Comisión vigente: {percent(PLATFORM.artistCommissionRate)} al artista, {percent(PLATFORM.customerFeeRate)} al cliente (editable en <code className="rounded bg-brand-50 px-1 text-[13px]">config/platform.ts</code>).</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Usuarios" value={formatNumber(state.users.length)} hint={`${customers.length} clientes`} icon={<Users size={18} />} />
        <StatCard label="Artistas publicados" value={formatNumber(active.length)} hint={`${pendingReview.length} en revisión`} icon={<UserRound size={18} />} tone="coral" />
        <StatCard label="Volumen contratado" value={formatMXN(m.gmv)} hint={`${m.validCount} reservas confirmadas o realizadas`} icon={<TrendingUp size={18} />} tone="sun" />
        <StatCard label="Comisiones generadas" value={formatMXN(m.commission)} hint={`Tasa de aceptación ${Math.round(m.acceptance * 100)}%`} icon={<CircleDollarSign size={18} />} tone="ok" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-[18px] border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">Volumen por categoría</h2>
          {m.byCategory.length ? (
            <ul className="grid gap-3">
              {m.byCategory.map(({ cat, value }) => (
                <li key={cat.id} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
                  <span className="truncate font-semibold">{cat.plural}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-lavender">
                    <span className="block h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: cat.color }} />
                  </span>
                  <span className="tabular text-ink-600">{formatMXN(value)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mute">Sin volumen todavía.</p>
          )}
        </section>
        <section className="flex flex-col gap-4 rounded-[18px] border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">Reservaciones por estado</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {m.byStatus.map(({ s, n }) => (
              <li key={s} className="flex flex-col gap-2 rounded-xl bg-lavender p-3">
                <BookingStatusBadge status={s} />
                <span className="font-display text-2xl font-extrabold tabular">{n}</span>
              </li>
            ))}
          </ul>
          <Link to="/admin/reservaciones" className="text-sm font-semibold text-brand-600 hover:underline">Gestionar reservaciones</Link>
        </section>
      </div>

      {pendingReview.length > 0 && (
        <Link to="/admin/revision" className="flex items-center justify-between gap-3 rounded-[16px] bg-ink p-4 text-white">
          <span className="flex items-center gap-3"><Inbox size={20} className="text-sun-500" /> {pendingReview.length} artista{pendingReview.length > 1 ? 's' : ''} esperando revisión</span>
          <span className="text-sm font-semibold">Revisar →</span>
        </Link>
      )}
    </div>
  );
}

export function AdminReviewPage() {
  const { state, actions } = useApp();
  const notify = useToast();
  const pending = state.artists.filter((a) => a.status === 'pending_review');
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-extrabold">Artistas pendientes de revisión</h1>
        <p className="text-[15px] text-mute">Al aprobar, el perfil aparece en búsquedas y recibe la insignia de verificado.</p>
      </div>
      {pending.length === 0 ? (
        <EmptyState icon={<BadgeCheck size={26} />} title="Nada pendiente" body="Los nuevos registros de artistas aparecerán aquí." />
      ) : (
        <ul className="grid gap-3">
          {pending.map((a) => (
            <li key={a.id} className="flex flex-col gap-4 rounded-[16px] border border-line bg-surface p-4 sm:flex-row sm:items-center">
              <ArtistCover artist={a} className="size-16 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{a.name}</p>
                <p className="text-sm text-mute">{getCategory(a.category)?.name} · {getZone(a.zoneId)?.name} · registrado {formatDateShort(a.joinedAt)}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-600">{a.bio}</p>
                <p className="mt-1 text-sm">Desde <b className="tabular">{formatMXN(Math.min(...a.packages.map((p) => p.price)))}</b> · {a.photos.length} fotos · {a.packages.length} paquete(s)</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" onClick={() => { actions.updateArtist(a.id, { status: 'rejected' }); notify(`${a.name} rechazado`, 'info'); }}>Rechazar</Button>
                <Button size="sm" onClick={() => { actions.updateArtist(a.id, { status: 'active', verified: true }); notify(`${a.name} ya está publicado`); }}>Aprobar</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminUsersPage() {
  const { state, actions } = useApp();
  const notify = useToast();
  const [q, setQ] = useState('');
  const users = state.users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  const roleLabel = { customer: 'Cliente', artist: 'Artista', admin: 'Admin' };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[26px] font-extrabold">Usuarios</h1>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Buscar usuario</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input id="admin-buscar-usuario" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o correo" className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-3 focus:border-brand-500 focus:outline-none" />
        </label>
      </div>
      <div className="overflow-x-auto rounded-[16px] border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-lavender text-xs uppercase tracking-[0.08em] text-mute">
            <tr><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Zona</th><th className="px-4 py-3">Alta</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acción</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3"><p className="font-semibold">{u.name}</p><p className="text-mute">{u.email}</p></td>
                <td className="px-4 py-3">{roleLabel[u.role]}</td>
                <td className="px-4 py-3">{getZone(u.zoneId)?.name}</td>
                <td className="px-4 py-3 tabular">{formatDateShort(u.joinedAt)}</td>
                <td className="px-4 py-3"><Badge tone={u.status === 'active' ? 'ok' : 'danger'}>{u.status === 'active' ? 'Activo' : 'Suspendido'}</Badge></td>
                <td className="px-4 py-3 text-right">
                  {u.role !== 'admin' && (
                    <Button size="sm" variant={u.status === 'active' ? 'outline' : 'secondary'} onClick={() => { const s = u.status === 'active' ? 'suspended' : 'active'; actions.setUserStatus(u.id, s); notify(s === 'active' ? `${u.name} reactivado` : `${u.name} suspendido`, 'info'); }}>
                      {u.status === 'active' ? 'Suspender' : 'Reactivar'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-center text-sm text-mute">Ningún usuario coincide con “{q}”.</p>}
      </div>
    </div>
  );
}

export function AdminBookingsPage() {
  const { state, actions } = useApp();
  const notify = useToast();
  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const list = state.bookings.filter((b) => status === 'all' || b.status === status).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[26px] font-extrabold">Reservaciones</h1>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-600">
          Estado
          <select id="admin-estado" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | 'all')} className="h-10 rounded-xl border border-line bg-surface px-3 focus:border-brand-500 focus:outline-none">
            <option value="all">Todos</option>
            {(Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto rounded-[16px] border border-line bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-lavender text-xs uppercase tracking-[0.08em] text-mute">
            <tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Artista / cliente</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Comisión</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acción</th></tr>
          </thead>
          <tbody>
            {list.map((b) => {
              const a = state.artists.find((x) => x.id === b.artistId);
              return (
                <tr key={b.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-[13px]">{b.code}</td>
                  <td className="px-4 py-3"><p className="font-semibold">{a?.name}</p><p className="text-mute">{b.customerName}</p></td>
                  <td className="px-4 py-3 tabular">{formatDateShort(b.date)}</td>
                  <td className="px-4 py-3 text-right tabular">{formatMXN(b.total)}</td>
                  <td className="px-4 py-3 text-right tabular text-ok">{formatMXN(b.artistCommission)}</td>
                  <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <Button size="sm" variant="ghost" onClick={() => { actions.setBookingStatus(b.id, 'cancelled'); notify(`Reserva ${b.code} cancelada`, 'info'); }}>Cancelar</Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-center text-sm text-mute">No hay reservaciones con ese estado.</p>}
      </div>
      <p className="flex items-center gap-2 text-[13px] text-mute"><CalendarCheck size={14} /> La comisión cuenta como ingreso solo en reservas confirmadas o realizadas.</p>
    </div>
  );
}
