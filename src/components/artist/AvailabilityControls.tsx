import type { Artist } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { availabilityOf } from '../../utils/availability';
import { AvailabilityBadge } from '../brand/Brand';
import { Toggle } from '../ui/Primitives';

/** Controles de disponibilidad: el artista decide cuándo aparece en "Disponible ahora". */
export function AvailabilityControls({ artist }: { artist: Artist }) {
  const { actions } = useApp();
  const notify = useToast();
  const status = availabilityOf(artist);
  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Disponibilidad</h2>
        <AvailabilityBadge status={status} />
      </div>
      <Toggle
        id="toggle-ahora"
        label="Disponible ahora"
        description="Apareces en contratación inmediata y te llegan solicitudes para hoy."
        checked={artist.instantEnabled}
        onChange={(v) => {
          actions.updateArtist(artist.id, { instantEnabled: v, paused: v ? false : artist.paused });
          notify(v ? 'Ya apareces en “Disponible ahora”' : 'Ya no apareces en “Disponible ahora”');
        }}
      />
      <Toggle
        id="toggle-pausa"
        label="Pausar agenda"
        description="Tu perfil sigue visible, pero nadie puede reservarte."
        checked={artist.paused}
        onChange={(v) => {
          actions.updateArtist(artist.id, { paused: v, instantEnabled: v ? false : artist.instantEnabled });
          notify(v ? 'Agenda en pausa' : 'Agenda reactivada');
        }}
      />
      <Toggle
        id="toggle-directa"
        label="Reserva directa"
        description="Si está apagado, cada solicitud requiere tu confirmación."
        checked={artist.bookingType === 'direct'}
        onChange={(v) => {
          actions.updateArtist(artist.id, { bookingType: v ? 'direct' : 'request' });
          notify(v ? 'Reserva directa activada' : 'Ahora revisas cada solicitud');
        }}
      />
      {artist.status === 'pending_review' && (
        <p className="rounded-xl bg-sun-50 px-3 py-2 text-[13px] text-sun-700">Tu perfil está en revisión: estos ajustes se aplicarán en cuanto se publique.</p>
      )}
    </div>
  );
}
