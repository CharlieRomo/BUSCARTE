import { useState } from 'react';
import { Check, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ZONES } from '../../data/zones';
import { getZone } from '../../utils/geo';
import { cn } from '../../utils/cn';
import { Sheet } from '../ui/Sheet';

export function ZonePicker({ className }: { className?: string }) {
  const { state, actions } = useApp();
  const [open, setOpen] = useState(false);
  const zone = getZone(state.zoneId);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn('flex min-w-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-ink hover:bg-brand-50', className)}
        aria-label={`Ubicación: ${zone?.name ?? 'elige zona'}. Cambiar`}
      >
        <MapPin size={16} className="shrink-0 text-coral-500" />
        <span className="truncate">{zone?.name ?? 'Elige tu zona'}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="¿Dónde es tu evento?">
        <p className="mb-4 text-sm text-mute">Usamos tu zona para calcular distancia y mostrar artistas que cubren esa área. En esta versión la ubicación es por alcaldía o municipio, sin GPS.</p>
        <div className="grid grid-cols-2 gap-2">
          {ZONES.map((z) => (
            <button
              key={z.id}
              onClick={() => {
                actions.setZone(z.id);
                setOpen(false);
              }}
              className={cn(
                'flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors',
                z.id === state.zoneId ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line hover:border-brand-300',
              )}
            >
              {z.name}
              {z.id === state.zoneId && <Check size={16} />}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
