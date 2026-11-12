import { PLATFORM } from '../config/platform';
import type { AppUser, Artist, Booking, BookingMode, OccasionId } from '../types';
import { calculatePrice } from '../utils/pricing';

export interface BookingDraft {
  packageId: string;
  date: string;
  startTime: string;
  extraHours: number;
  zoneId: string;
  address: string;
  eventType: OccasionId;
  guests: number;
  notes: string;
}

const randomCode = () => `BK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/** Construye la reserva con precios calculados en un solo lugar. En backend, esto lo haría el servidor. */
export function buildBooking(artist: Artist, customer: AppUser, draft: BookingDraft, mode: BookingMode): Booking {
  const pkg = artist.packages.find((p) => p.id === draft.packageId) ?? artist.packages[0];
  const price = calculatePrice(artist, pkg, draft.extraHours);
  const now = new Date();
  // Las inmediatas siempre requieren aceptación del artista; las agendadas dependen de su modalidad.
  const status = mode === 'instant' || artist.bookingType === 'request' ? 'pending' : 'confirmed';
  return {
    id: `bk-${now.getTime().toString(36)}`,
    code: randomCode(),
    artistId: artist.id,
    packageId: pkg.id,
    mode,
    date: draft.date,
    startTime: draft.startTime,
    durationHours: pkg.durationHours + draft.extraHours,
    extraHours: draft.extraHours,
    zoneId: draft.zoneId,
    address: draft.address.trim(),
    eventType: draft.eventType,
    guests: draft.guests,
    notes: draft.notes.trim(),
    customerId: customer.id,
    customerName: customer.name,
    subtotal: price.subtotal,
    customerFee: price.customerFee,
    artistCommission: price.artistCommission,
    deposit: price.deposit,
    total: price.total,
    status,
    createdAt: now.toISOString(),
    expiresAt: mode === 'instant' ? new Date(now.getTime() + PLATFORM.instantResponseMinutes * 60_000).toISOString() : undefined,
  };
}

export const STATUS_LABEL: Record<Booking['status'], string> = {
  pending: 'Esperando respuesta',
  confirmed: 'Confirmada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  completed: 'Realizada',
  expired: 'Sin respuesta',
};

export const STATUS_TONE: Record<Booking['status'], 'sun' | 'ok' | 'danger' | 'neutral' | 'brand'> = {
  pending: 'sun',
  confirmed: 'ok',
  rejected: 'danger',
  cancelled: 'neutral',
  completed: 'brand',
  expired: 'neutral',
};
