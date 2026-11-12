import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Zap } from 'lucide-react';
import type { Artist, Booking } from '../../types';
import { getOccasion } from '../../data/categories';
import { formatDateShort, formatMXN, formatTime } from '../../utils/format';
import { getZone } from '../../utils/geo';
import { ArtistCover } from '../artist/ArtistCover';
import { BookingStatusBadge } from './BookingStatusBadge';

export function BookingListItem({ booking, artist, perspective = 'customer', actions, amount }: { booking: Booking; artist?: Artist; perspective?: 'customer' | 'artist'; actions?: ReactNode; amount?: number }) {
  const pkg = artist?.packages.find((p) => p.id === booking.packageId);
  const title = perspective === 'customer' ? artist?.name : booking.customerName;
  const body = (
    <>
      {perspective === 'customer' && artist ? (
        <ArtistCover artist={artist} className="size-16 shrink-0 rounded-xl" showMonogram={false} />
      ) : (
        <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-coral-50 font-display text-xl font-extrabold text-coral-600">{booking.customerName[0]}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate font-bold">{title}</span>
          <BookingStatusBadge status={booking.status} />
          {booking.mode === 'instant' && <span className="inline-flex items-center gap-1 rounded-full bg-ok-50 px-2 py-0.5 text-xs font-bold text-ok"><Zap size={12} /> Inmediata</span>}
        </span>
        <span className="mt-1 block text-sm text-mute">{pkg?.name ?? 'Paquete'} · {getOccasion(booking.eventType)?.name}</span>
        <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-600">
          <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {formatDateShort(booking.date)}, {formatTime(booking.startTime)}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={13} /> {getZone(booking.zoneId)?.name}</span>
          <span className="inline-flex items-center gap-1"><Users size={13} /> {booking.guests}</span>
        </span>
      </span>
      <span className="shrink-0 text-right font-display font-extrabold tabular">{formatMXN(amount ?? booking.total)}</span>
    </>
  );
  return (
    <li className="flex flex-col gap-3 rounded-[16px] border border-line bg-surface p-4">
      {perspective === 'customer' ? (
        <Link to={`/reserva/${booking.id}`} className="flex items-center gap-4 rounded-xl">{body}</Link>
      ) : (
        <div className="flex items-center gap-4">{body}</div>
      )}
      {booking.notes && perspective === 'artist' && <p className="rounded-xl bg-lavender px-3 py-2 text-sm text-ink-600">“{booking.notes}”</p>}
      {actions && <div className="flex flex-wrap justify-end gap-2">{actions}</div>}
    </li>
  );
}
