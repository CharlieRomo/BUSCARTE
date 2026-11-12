import { useMemo, useState } from 'react';
import { CalendarCheck, History, Inbox } from 'lucide-react';
import { useActiveArtist } from '../../hooks/useMarketplace';
import { useRequestActions } from '../../hooks/useRequestActions';
import { BookingListItem } from '../../components/booking/BookingListItem';
import { Button } from '../../components/ui/Button';
import { EmptyState, Segmented } from '../../components/ui/Primitives';
import type { Booking } from '../../types';
import { formatMXN, todayISO } from '../../utils/format';

type View = 'pendientes' | 'confirmadas' | 'historial';

function RejectButton({ onConfirm }: { onConfirm: () => void }) {
  const [ask, setAsk] = useState(false);
  return ask ? (
    <span className="flex items-center gap-1 rounded-[12px] bg-danger-50 p-1">
      <span className="px-2 text-sm font-medium text-danger">¿Rechazar?</span>
      <Button size="sm" variant="danger" onClick={onConfirm}>Sí</Button>
      <Button size="sm" variant="ghost" onClick={() => setAsk(false)}>No</Button>
    </span>
  ) : (
    <Button size="sm" variant="outline" onClick={() => setAsk(true)}>Rechazar</Button>
  );
}

export function ArtistRequestsPage() {
  const { artist, bookings } = useActiveArtist();
  const { accept, reject, complete, conflictFor } = useRequestActions();
  const [view, setView] = useState<View>('pendientes');
  const today = todayISO();
  const payout = (b: Booking) => b.subtotal - b.artistCommission;

  const lists = useMemo(
    () => ({
      pendientes: bookings.filter((b) => b.status === 'pending').sort((a, b) => a.date.localeCompare(b.date)),
      confirmadas: bookings.filter((b) => b.status === 'confirmed').sort((a, b) => a.date.localeCompare(b.date)),
      historial: bookings.filter((b) => ['completed', 'rejected', 'cancelled', 'expired'].includes(b.status)).sort((a, b) => b.date.localeCompare(a.date)),
    }),
    [bookings],
  );

  if (!artist) return null;
  const list = lists[view];
  const historyTotal = lists.historial.filter((b) => b.status === 'completed').reduce((s, b) => s + payout(b), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-extrabold">Solicitudes y reservas</h1>
        <Segmented<View>
          ariaLabel="Filtrar solicitudes"
          value={view}
          onChange={setView}
          options={[
            { value: 'pendientes', label: `Pendientes (${lists.pendientes.length})` },
            { value: 'confirmadas', label: `Confirmadas (${lists.confirmadas.length})` },
            { value: 'historial', label: 'Historial' },
          ]}
        />
      </div>

      {view === 'historial' && lists.historial.length > 0 && (
        <p className="rounded-xl bg-surface px-4 py-3 text-[15px]">Cobrado en eventos realizados: <b className="tabular">{formatMXN(historyTotal)}</b> netos.</p>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={view === 'pendientes' ? <Inbox size={26} /> : view === 'confirmadas' ? <CalendarCheck size={26} /> : <History size={26} />}
          title={view === 'pendientes' ? 'Todo al día' : view === 'confirmadas' ? 'Sin reservas confirmadas' : 'Sin historial'}
          body={view === 'pendientes' ? 'Las nuevas solicitudes aparecerán aquí. Responder rápido mejora tu posición en los resultados.' : 'Aquí verás tus eventos conforme avancen.'}
        />
      ) : (
        <ul className="grid gap-3">
          {list.map((b) => {
            const conflict = b.status === 'pending' ? conflictFor(b) : undefined;
            return (
              <BookingListItem
                key={b.id}
                booking={b}
                artist={artist}
                perspective="artist"
                amount={payout(b)}
                actions={
                  b.status === 'pending' ? (
                    <>
                      {conflict && <span className="mr-auto self-center text-[13px] font-medium text-danger">Choca con el evento de {conflict.customerName}</span>}
                      <RejectButton onConfirm={() => reject(b)} />
                      <Button size="sm" disabled={!!conflict} onClick={() => accept(b)}>Aceptar</Button>
                    </>
                  ) : b.status === 'confirmed' && b.date < today ? (
                    <Button size="sm" variant="secondary" onClick={() => complete(b)}>Marcar como realizado</Button>
                  ) : undefined
                }
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
