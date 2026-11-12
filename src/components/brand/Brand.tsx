import type { ComponentType } from 'react';
import { AudioLines, Disc3, Drum, Guitar, Headphones, MicVocal, Music, Music2, Music3, Speaker } from 'lucide-react';
import type { AvailabilityStatus, CategoryId } from '../../types';
import { AVAILABILITY_LABEL } from '../../utils/availability';
import { cn } from '../../utils/cn';

type IconType = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

export const CATEGORY_ICONS: Record<CategoryId, IconType> = {
  mariachi: Music2,
  dj: Disc3,
  banda: Drum,
  norteno: Music3,
  cantante: MicVocal,
  trio: Guitar,
  saxofonista: Music,
  sonidero: Speaker,
  independiente: Headphones,
};

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative grid size-9 place-items-center rounded-[11px] bg-brand-500 text-white shadow-[0_6px_16px_-6px_rgb(108_59_255/0.9)]">
        <AudioLines size={20} strokeWidth={2.4} />
        <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-lavender bg-coral-500" />
      </span>
      {!compact && <span className="font-display text-[21px] font-extrabold tracking-[-0.03em] text-ink">buscarte</span>}
    </span>
  );
}

/** Ecualizador animado: el detalle "Spotify" que señala disponibilidad inmediata. */
export function EqBars({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('inline-flex h-3 items-end gap-[2px]', className)}>
      {[0, 180, 360].map((d) => (
        <span key={d} className="w-[3px] origin-bottom animate-eq rounded-full bg-current" style={{ height: '100%', animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}

const STATUS_STYLE: Record<AvailabilityStatus, string> = {
  now: 'bg-ok text-white',
  soon: 'bg-sun-100 text-sun-700',
  on_request: 'bg-brand-50 text-brand-700',
  unavailable: 'bg-line text-ink-600',
};

export function AvailabilityBadge({ status, className, short }: { status: AvailabilityStatus; className?: string; short?: boolean }) {
  const label = short && status === 'soon' ? 'Reserva directa' : AVAILABILITY_LABEL[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold', STATUS_STYLE[status], className)}>
      {status === 'now' ? <EqBars /> : <span className={cn('size-1.5 rounded-full', status === 'unavailable' ? 'bg-ink-600' : 'bg-current')} />}
      {label}
    </span>
  );
}
