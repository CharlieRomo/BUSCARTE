import type { Artist, AvailabilityStatus, Booking } from '../types';
import { addDays, todayISO } from './format';

/** Fechas ocupadas: bloqueos manuales + reservas confirmadas o pendientes. */
export function busyDates(artist: Artist, bookings: Booking[]) {
  const set = new Set(artist.blockedDates);
  bookings
    .filter((b) => b.artistId === artist.id && (b.status === 'confirmed' || b.status === 'pending'))
    .forEach((b) => set.add(b.date));
  return set;
}

export function isDateAvailable(artist: Artist, bookings: Booking[], iso: string) {
  if (artist.paused || artist.status !== 'active') return false;
  return !busyDates(artist, bookings).has(iso);
}

export function nextAvailableDate(artist: Artist, bookings: Booking[], from = addDays(todayISO(), 1)) {
  const busy = busyDates(artist, bookings);
  for (let i = 0; i < 90; i++) {
    const d = addDays(from, i);
    if (!busy.has(d)) return d;
  }
  return null;
}

/**
 * Regla de producto: "Disponible ahora" solo si el artista lo activó explícitamente.
 * El orden de prioridad evita mostrar un estado más optimista que el real.
 */
export function availabilityOf(artist: Artist): AvailabilityStatus {
  if (artist.paused || artist.status !== 'active') return 'unavailable';
  if (artist.instantEnabled) return 'now';
  if (artist.bookingType === 'request') return 'on_request';
  return 'soon';
}

export const AVAILABILITY_LABEL: Record<AvailabilityStatus, string> = {
  now: 'Disponible ahora',
  soon: 'Disponible próximamente',
  on_request: 'Requiere confirmación',
  unavailable: 'No disponible',
};

export const AVAILABILITY_HELP: Record<AvailabilityStatus, string> = {
  now: 'Activó contratación inmediata y puede llegar hoy.',
  soon: 'Reserva directa en fechas libres de su calendario.',
  on_request: 'Envías una solicitud y el artista confirma.',
  unavailable: 'Pausó su agenda temporalmente.',
};
