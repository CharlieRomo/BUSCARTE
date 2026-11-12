import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import type { Booking } from '../types';
import { formatDateShort } from '../utils/format';

/** Aceptar / rechazar solicitudes con validación de choques de agenda. */
export function useRequestActions() {
  const { state, actions } = useApp();
  const notify = useToast();

  const conflictFor = (b: Booking) =>
    state.bookings.find((o) => o.id !== b.id && o.artistId === b.artistId && o.date === b.date && o.status === 'confirmed');

  const accept = (b: Booking) => {
    const conflict = conflictFor(b);
    if (conflict) {
      notify(`Ya tienes un evento confirmado el ${formatDateShort(b.date)} (${conflict.customerName}).`, 'error');
      return false;
    }
    actions.setBookingStatus(b.id, 'confirmed');
    notify(`Aceptaste el evento de ${b.customerName}`);
    return true;
  };

  const reject = (b: Booking) => {
    actions.setBookingStatus(b.id, 'rejected');
    notify(`Rechazaste la solicitud de ${b.customerName}`, 'info');
  };

  const complete = (b: Booking) => {
    actions.setBookingStatus(b.id, 'completed');
    notify('Evento marcado como realizado');
  };

  return { accept, reject, complete, conflictFor };
}
