import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatMonthYear, parseISODate, toISODate, todayISO } from '../../utils/format';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export interface CalendarProps {
  value: string;
  onChange?: (iso: string) => void;
  /** Devuelve un motivo si la fecha no se puede elegir. */
  disabledReason?: (iso: string) => 'past' | 'busy' | 'blocked' | null;
  /** Marcas informativas (p. ej. eventos en el panel del artista). */
  marks?: Record<string, 'event' | 'pending' | 'blocked'>;
  readOnly?: boolean;
}

export function Calendar({ value, onChange, disabledReason, marks, readOnly }: CalendarProps) {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const d = parseISODate(value || today);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const cells = useMemo(() => {
    const first = new Date(cursor);
    const offset = (first.getDay() + 6) % 7; // lunes primero
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: days }, (_, i) => toISODate(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))),
    ];
  }, [cursor]);

  const isCurrentMonth = cursor.getFullYear() === parseISODate(today).getFullYear() && cursor.getMonth() === parseISODate(today).getMonth();
  const move = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));

  return (
    <div className="rounded-[16px] border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <button aria-label="Mes anterior" disabled={isCurrentMonth && !readOnly} onClick={() => move(-1)} className="grid size-9 place-items-center rounded-full hover:bg-brand-50 disabled:opacity-30">
          <ChevronLeft size={18} />
        </button>
        <p className="font-display font-bold" aria-live="polite">{formatMonthYear(toISODate(cursor))}</p>
        <button aria-label="Mes siguiente" onClick={() => move(1)} className="grid size-9 place-items-center rounded-full hover:bg-brand-50">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 text-xs font-bold text-mute">{d}</span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`e${i}`} />;
          const reason = disabledReason?.(iso) ?? null;
          const mark = marks?.[iso];
          const selected = iso === value;
          const day = Number(iso.slice(-2));
          return (
            <button
              key={iso}
              role="gridcell"
              aria-selected={selected}
              aria-label={`${iso}${reason === 'busy' ? ', ocupado' : reason === 'blocked' ? ', bloqueado' : ''}`}
              disabled={!!reason && !readOnly}
              onClick={() => onChange?.(iso)}
              className={cn(
                'relative mx-auto grid aspect-square w-full max-w-11 place-items-center rounded-full text-sm font-semibold tabular transition-colors',
                selected && 'bg-brand-500 text-white',
                !selected && !reason && !readOnly && 'hover:bg-brand-50',
                reason === 'past' && 'text-line',
                (reason === 'busy' || reason === 'blocked') && !selected && 'text-mute line-through decoration-coral-400',
                iso === today && !selected && 'ring-1 ring-brand-300',
                mark === 'event' && !selected && 'bg-ok-50 text-ok',
                mark === 'pending' && !selected && 'bg-sun-50 text-sun-700',
                mark === 'blocked' && !selected && 'bg-line text-ink-600',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
