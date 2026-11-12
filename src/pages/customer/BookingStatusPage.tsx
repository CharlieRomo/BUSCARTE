import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarCheck, CircleCheck, CircleX, Clock, Hourglass, MapPin, PartyPopper, Ticket, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCountdown, useCountdown } from '../../hooks/useCountdown';
import { ArtistCover } from '../../components/artist/ArtistCover';
import { BookingStatusBadge } from '../../components/booking/BookingStatusBadge';
import { EqBars } from '../../components/brand/Brand';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Primitives';
import { getOccasion } from '../../data/categories';
import { cn } from '../../utils/cn';
import { formatDateLong, formatDuration, formatMXN, formatTime } from '../../utils/format';
import { getZone } from '../../utils/geo';
import { PLATFORM } from '../../config/platform';

export function BookingStatusPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { state, actions } = useApp();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const booking = state.bookings.find((b) => b.id === bookingId);
  const artist = state.artists.find((a) => a.id === booking?.artistId);
  const left = useCountdown(booking?.status === 'pending' && booking.mode === 'instant' ? booking.expiresAt : undefined);

  if (!booking || !artist) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState icon={<Ticket size={26} />} title="No encontramos esta reserva" body="Puede que se haya restablecido la demo." action={<Link to="/mis-eventos" className="font-bold text-brand-600">Ir a mis eventos</Link>} />
      </div>
    );
  }

  const pkg = artist.packages.find((p) => p.id === booking.packageId);
  const isMine = booking.customerId === state.customer.id;
  const hero = {
    confirmed: { Icon: PartyPopper, tone: 'bg-ok text-white', title: '¡Tu música está confirmada!', body: `${artist.name} te espera el ${formatDateLong(booking.date)}. Recibirás sus datos de contacto en "Mis eventos".` },
    pending: booking.mode === 'instant'
      ? { Icon: Hourglass, tone: 'bg-sun-500 text-ink', title: 'Esperando a que el artista acepte', body: `Tiene ${PLATFORM.instantResponseMinutes} minutos para responder. Si no responde, la solicitud caduca y no se cobra nada.` }
      : { Icon: Hourglass, tone: 'bg-sun-500 text-ink', title: 'Solicitud enviada', body: `${artist.name} suele responder en ~${artist.responseTimeMin} min. Te avisaremos aquí y en "Mis eventos".` },
    rejected: { Icon: CircleX, tone: 'bg-danger text-white', title: 'El artista no puede en esa fecha', body: 'El anticipo simulado se liberó. Te sugerimos artistas similares.' },
    expired: { Icon: Clock, tone: 'bg-ink-600 text-white', title: 'La solicitud caducó', body: 'El artista no respondió a tiempo. No se cobró nada.' },
    cancelled: { Icon: CircleX, tone: 'bg-ink-600 text-white', title: 'Reserva cancelada', body: 'Cancelaste esta reserva.' },
    completed: { Icon: CircleCheck, tone: 'bg-brand-500 text-white', title: 'Evento realizado', body: 'Gracias por contratar con Buscarte.' },
  }[booking.status];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <section className="flex flex-col items-center gap-4 text-center animate-fade-up">
        <span className={cn('grid size-20 place-items-center rounded-[24px] shadow-pop', hero.tone)}>
          <hero.Icon size={36} />
        </span>
        <BookingStatusBadge status={booking.status} />
        <h1 className="text-[28px] font-extrabold leading-tight md:text-[36px]">{hero.title}</h1>
        <p className="max-w-lg text-[16px] text-ink-600">{hero.body}</p>
        {left !== null && booking.status === 'pending' && (
          <p className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-display text-lg font-bold text-white tabular" aria-live="polite">
            <EqBars className="text-ok" /> {formatCountdown(left)}
          </p>
        )}
      </section>

      <section className="mt-8 overflow-hidden rounded-[20px] border border-line bg-surface">
        <div className="flex items-center gap-4 border-b border-line p-5">
          <ArtistCover artist={artist} className="size-16 shrink-0 rounded-xl" showMonogram={false} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{artist.name}</p>
            <p className="text-sm text-mute">{pkg?.name} · Código <b className="text-ink">{booking.code}</b></p>
          </div>
        </div>
        <dl className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex gap-3"><CalendarCheck size={18} className="mt-0.5 text-brand-500" /><div><dt className="text-sm text-mute">Fecha y hora</dt><dd className="font-semibold">{formatDateLong(booking.date)}, {formatTime(booking.startTime)}</dd></div></div>
          <div className="flex gap-3"><Clock size={18} className="mt-0.5 text-brand-500" /><div><dt className="text-sm text-mute">Duración</dt><dd className="font-semibold">{formatDuration(booking.durationHours)}</dd></div></div>
          <div className="flex gap-3"><MapPin size={18} className="mt-0.5 text-coral-500" /><div><dt className="text-sm text-mute">Lugar</dt><dd className="font-semibold">{booking.address}, {getZone(booking.zoneId)?.name}</dd></div></div>
          <div className="flex gap-3"><Users size={18} className="mt-0.5 text-brand-500" /><div><dt className="text-sm text-mute">Evento</dt><dd className="font-semibold">{getOccasion(booking.eventType)?.name} · {booking.guests} invitados</dd></div></div>
        </dl>
        <div className="grid gap-2 border-t border-line bg-lavender/60 p-5 text-[15px]">
          <div className="flex justify-between"><span className="text-ink-600">Total</span><b className="tabular">{formatMXN(booking.total)}</b></div>
          <div className="flex justify-between"><span className="text-ink-600">Anticipo {booking.status === 'confirmed' || booking.status === 'completed' ? 'apartado' : 'retenido'} (simulado)</span><span className="tabular">{formatMXN(booking.deposit)}</span></div>
          <div className="flex justify-between"><span className="text-ink-600">Comisión para ti</span><span className="font-semibold text-ok">Gratis</span></div>
          {booking.status === 'confirmed' && (
            <div className="mt-2 rounded-xl bg-surface p-3 text-sm">
              <p className="font-semibold">Contacto del artista</p>
              <p className="text-mute">{artist.contactPhone ?? '55 •••• •••• (se muestra completo 48 h antes del evento)'}</p>
            </div>
          )}
        </div>
      </section>

      {booking.status === 'pending' && (
        <section className="mt-4 rounded-[18px] border border-dashed border-brand-300 bg-brand-50/60 p-5">
          <p className="text-sm font-bold text-brand-700">Modo demostración</p>
          <p className="mt-1 text-sm text-ink-600">En producción el artista responde desde su panel. Aquí puedes simular su respuesta para probar el flujo completo.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { actions.setBookingStatus(booking.id, 'confirmed'); notify(`${artist.name} aceptó tu solicitud`); }}>Simular: el artista acepta</Button>
            <Button size="sm" variant="danger" onClick={() => { actions.setBookingStatus(booking.id, 'rejected'); notify(`${artist.name} rechazó la solicitud`, 'info'); }}>Simular: el artista rechaza</Button>
            {artist.id === state.activeArtistId && (
              <Button size="sm" variant="outline" onClick={() => navigate('/panel/solicitudes')}>Responder desde el panel del artista</Button>
            )}
          </div>
        </section>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button block onClick={() => navigate('/mis-eventos')}>Ver mis eventos</Button>
        {(booking.status === 'rejected' || booking.status === 'expired') && (
          <Button block variant="outline" onClick={() => navigate(`/buscar?cat=${artist.category}`)}>Ver artistas similares</Button>
        )}
        {isMine && (booking.status === 'confirmed' || booking.status === 'pending') && (
          confirmCancel ? (
            <div className="flex w-full items-center gap-2 rounded-[12px] bg-danger-50 p-2">
              <span className="flex-1 px-2 text-sm font-medium text-danger">¿Cancelar la reserva?</span>
              <Button size="sm" variant="danger" onClick={() => { actions.setBookingStatus(booking.id, 'cancelled'); setConfirmCancel(false); notify('Reserva cancelada', 'info'); }}>Sí, cancelar</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(false)}>No</Button>
            </div>
          ) : (
            <Button block variant="ghost" onClick={() => setConfirmCancel(true)}>Cancelar reserva</Button>
          )
        )}
      </div>
    </div>
  );
}
