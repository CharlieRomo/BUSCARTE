import { useMemo, useState } from 'react';
import { CalendarX, Lock, LockOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useActiveArtist } from '../../hooks/useMarketplace';
import { Calendar } from '../../components/booking/Calendar';
import { BookingListItem } from '../../components/booking/BookingListItem';
import { Button } from '../../components/ui/Button';
import { formatDateLong, todayISO } from '../../utils/format';

export function ArtistCalendarPage() {
  const { artist, bookings } = useActiveArtist();
  const { actions } = useApp();
  const notify = useToast();
  const [selected, setSelected] = useState(todayISO());

  const marks = useMemo(() => {
    const m: Record<string, 'event' | 'pending' | 'blocked'> = {};
    artist?.blockedDates.forEach((d) => (m[d] = 'blocked'));
    bookings.forEach((b) => {
      if (b.status === 'confirmed' || b.status === 'completed') m[b.date] = 'event';
      else if (b.status === 'pending' && m[b.date] !== 'event') m[b.date] = 'pending';
    });
    return m;
  }, [artist, bookings]);

  if (!artist) return null;
  const dayBookings = bookings.filter((b) => b.date === selected && b.status !== 'rejected' && b.status !== 'expired');
  const blocked = artist.blockedDates.includes(selected);
  const isPast = selected < todayISO();
  const hasEvent = dayBookings.some((b) => b.status === 'confirmed');

  const toggleBlock = () => {
    const blockedDates = blocked ? artist.blockedDates.filter((d) => d !== selected) : [...artist.blockedDates, selected].sort();
    actions.updateArtist(artist.id, { blockedDates });
    notify(blocked ? 'Fecha liberada' : 'Fecha bloqueada: nadie podrá reservarla');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-extrabold">Calendario</h1>
        <p className="text-[15px] text-mute">Toca un día para ver tus eventos o bloquearlo. Los clientes no pueden reservar fechas bloqueadas ni ocupadas.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <Calendar value={selected} onChange={setSelected} marks={marks} readOnly />
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">{formatDateLong(selected)}</h2>
            {!isPast && (
              <Button variant={blocked ? 'secondary' : 'outline'} size="sm" icon={blocked ? <LockOpen size={15} /> : <Lock size={15} />} disabled={hasEvent && !blocked} onClick={toggleBlock}>
                {blocked ? 'Desbloquear día' : 'Bloquear día'}
              </Button>
            )}
          </div>
          {hasEvent && !blocked && <p className="text-[13px] text-mute">No puedes bloquear un día con evento confirmado.</p>}
          {dayBookings.length ? (
            <ul className="grid gap-3">{dayBookings.map((b) => <BookingListItem key={b.id} booking={b} artist={artist} perspective="artist" amount={b.subtotal - b.artistCommission} />)}</ul>
          ) : (
            <div className="flex items-center gap-3 rounded-[16px] border border-dashed border-line bg-surface p-5 text-[15px] text-mute">
              <CalendarX size={20} /> {blocked ? 'Día bloqueado.' : 'Sin eventos este día.'}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
