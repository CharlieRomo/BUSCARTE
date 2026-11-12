import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Clock, Inbox, Star, Wallet } from 'lucide-react';
import { useActiveArtist } from '../../hooks/useMarketplace';
import { useRequestActions } from '../../hooks/useRequestActions';
import { useCountdown, formatCountdown } from '../../hooks/useCountdown';
import { AvailabilityControls } from '../../components/artist/AvailabilityControls';
import { BookingListItem } from '../../components/booking/BookingListItem';
import { Calendar } from '../../components/booking/Calendar';
import { Button } from '../../components/ui/Button';
import { EmptyState, StatCard } from '../../components/ui/Primitives';
import { PLATFORM } from '../../config/platform';
import type { Booking } from '../../types';
import { formatMXN, todayISO } from '../../utils/format';
import { percent } from '../../utils/pricing';

const payout = (b: Booking) => b.subtotal - b.artistCommission;

function InstantTimer({ booking }: { booking: Booking }) {
  const left = useCountdown(booking.mode === 'instant' ? booking.expiresAt : undefined);
  if (left === null) return null;
  return <span className="inline-flex items-center gap-1 rounded-full bg-sun-100 px-2 py-1 text-xs font-bold text-sun-700 tabular"><Clock size={12} /> {formatCountdown(left)} para responder</span>;
}

export function ArtistDashboardPage() {
  const { artist, bookings } = useActiveArtist();
  const { accept, reject } = useRequestActions();
  const today = todayISO();

  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === 'completed');
    const confirmed = bookings.filter((b) => b.status === 'confirmed');
    return {
      earned: completed.reduce((s, b) => s + payout(b), 0),
      commission: completed.reduce((s, b) => s + b.artistCommission, 0),
      upcomingValue: confirmed.reduce((s, b) => s + payout(b), 0),
      pending: bookings.filter((b) => b.status === 'pending').sort((a, b) => (a.mode === 'instant' ? -1 : 0) - (b.mode === 'instant' ? -1 : 0) || a.date.localeCompare(b.date)),
      upcoming: confirmed.filter((b) => b.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
      confirmedCount: confirmed.length,
    };
  }, [bookings, today]);

  const marks = useMemo(() => {
    const m: Record<string, 'event' | 'pending' | 'blocked'> = {};
    artist?.blockedDates.forEach((d) => (m[d] = 'blocked'));
    bookings.forEach((b) => {
      if (b.status === 'confirmed') m[b.date] = 'event';
      else if (b.status === 'pending' && m[b.date] !== 'event') m[b.date] = 'pending';
    });
    return m;
  }, [artist, bookings]);

  if (!artist) {
    return <EmptyState icon={<Inbox size={26} />} title="No hay un perfil de artista activo" body="Crea tu perfil para empezar a recibir solicitudes." action={<Link to="/unete" className="font-bold text-brand-600">Registrarme como artista</Link>} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-mute">Hola,</p>
          <h1 className="text-[28px] font-extrabold leading-tight">{artist.name}</h1>
        </div>
        <Link to={`/artista/${artist.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">Ver mi perfil público <ArrowRight size={15} /></Link>
      </div>

      {artist.status === 'pending_review' && (
        <div className="rounded-[16px] border border-sun-400 bg-sun-50 p-4 text-sm text-sun-700">
          <b>Perfil en revisión.</b> El equipo de Buscarte valida identidad y material antes de publicarte (en la demo puedes aprobarlo desde la vista Admin).
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Ingresos totales" value={formatMXN(stats.earned)} hint={`Neto, después de ${percent(PLATFORM.artistCommissionRate)} (${formatMXN(stats.commission)})`} icon={<Wallet size={18} />} tone="ok" />
        <StatCard label="Por cobrar" value={formatMXN(stats.upcomingValue)} hint={`${stats.confirmedCount} reservas confirmadas`} icon={<CalendarCheck size={18} />} />
        <StatCard label="Solicitudes pendientes" value={String(stats.pending.length)} icon={<Inbox size={18} />} tone="sun" />
        <StatCard label="Calificación" value={artist.rating ? artist.rating.toFixed(2) : 'Nuevo'} hint={`${artist.reviewCount} reseñas`} icon={<Star size={18} />} tone="coral" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Solicitudes por responder</h2>
              <Link to="/panel/solicitudes" className="text-sm font-semibold text-brand-600 hover:underline">Ver todas</Link>
            </div>
            {stats.pending.length ? (
              <ul className="grid gap-3">
                {stats.pending.slice(0, 3).map((b) => (
                  <BookingListItem
                    key={b.id}
                    booking={b}
                    artist={artist}
                    perspective="artist"
                    amount={payout(b)}
                    actions={
                      <>
                        <InstantTimer booking={b} />
                        <Button size="sm" variant="danger" onClick={() => reject(b)}>Rechazar</Button>
                        <Button size="sm" onClick={() => accept(b)}>Aceptar</Button>
                      </>
                    }
                  />
                ))}
              </ul>
            ) : (
              <p className="rounded-[16px] border border-dashed border-line bg-surface p-5 text-[15px] text-mute">No tienes solicitudes pendientes. Activa “Disponible ahora” para recibir contrataciones de hoy.</p>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Próximos eventos</h2>
            {stats.upcoming.length ? (
              <ul className="grid gap-3">{stats.upcoming.slice(0, 4).map((b) => <BookingListItem key={b.id} booking={b} artist={artist} perspective="artist" amount={payout(b)} />)}</ul>
            ) : (
              <p className="rounded-[16px] border border-dashed border-line bg-surface p-5 text-[15px] text-mute">Aún no tienes eventos confirmados.</p>
            )}
            <p className="text-[13px] text-mute">Montos netos: lo que recibes después de la comisión de {percent(PLATFORM.artistCommissionRate)}.</p>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <AvailabilityControls artist={artist} />
          <div className="flex flex-col gap-3">
            <Calendar value="" marks={marks} readOnly />
            <div className="flex flex-wrap gap-3 text-[13px] text-mute">
              <span className="inline-flex items-center gap-1"><span className="size-3 rounded-full bg-ok-50 ring-1 ring-ok" /> Evento</span>
              <span className="inline-flex items-center gap-1"><span className="size-3 rounded-full bg-sun-50 ring-1 ring-sun-500" /> Pendiente</span>
              <span className="inline-flex items-center gap-1"><span className="size-3 rounded-full bg-line" /> Bloqueado</span>
              <Link to="/panel/calendario" className="ml-auto font-semibold text-brand-600">Administrar</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
