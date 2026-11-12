import type { ReactNode } from 'react';
import type { SearchFilters } from '../../types';
import { CATEGORIES, OCCASIONS } from '../../data/categories';
import { ZONES } from '../../data/zones';
import { cn } from '../../utils/cn';
import { addDays, todayISO } from '../../utils/format';
import { Star, Zap } from 'lucide-react';

const chip = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
    active ? 'border-brand-500 bg-brand-500 text-white' : 'border-line bg-surface text-ink-600 hover:border-brand-300',
  );

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 border-b border-line pb-5 last:border-0">
      <legend className="mb-3 text-sm font-bold text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

const PRICE_PRESETS = [
  { label: 'Hasta $5,000', min: null, max: 5000 },
  { label: '$5,000 – $10,000', min: 5000, max: 10000 },
  { label: '$10,000 – $20,000', min: 10000, max: 20000 },
  { label: 'Más de $20,000', min: 20000, max: null },
];

export function FilterPanel({ filters, onChange }: { filters: SearchFilters; onChange: (f: SearchFilters) => void }) {
  const set = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });
  const toggleCat = (id: (typeof CATEGORIES)[number]['id']) =>
    set({ categories: filters.categories.includes(id) ? filters.categories.filter((c) => c !== id) : [...filters.categories, id] });
  const numberOrNull = (v: string) => (v === '' ? null : Math.max(0, Number(v)));

  return (
    <div className="flex flex-col gap-5">
      <Group title="Disponibilidad">
        <div className="flex flex-wrap gap-2">
          <button className={chip(filters.availability === 'any')} onClick={() => set({ availability: 'any' })}>Todos</button>
          <button className={chip(filters.availability === 'now')} onClick={() => set({ availability: 'now' })}>
            <span className="inline-flex items-center gap-1"><Zap size={13} /> Disponible ahora</span>
          </button>
          <button className={chip(filters.availability === 'bookable')} onClick={() => set({ availability: 'bookable' })}>Ocultar pausados</button>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-ink-600">Fecha del evento</span>
          <input
            id="filtro-fecha"
            type="date"
            min={addDays(todayISO(), 1)}
            value={filters.date}
            onChange={(e) => set({ date: e.target.value })}
            className="h-11 rounded-xl border border-line bg-surface px-3 focus:border-brand-500 focus:outline-none"
          />
        </label>
      </Group>

      <Group title="Tipo de artista">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} className={chip(filters.categories.includes(c.id))} aria-pressed={filters.categories.includes(c.id)} onClick={() => toggleCat(c.id)}>
              {c.plural}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Ubicación del evento">
        <select
          id="filtro-zona"
          aria-label="Zona"
          value={filters.zoneId}
          onChange={(e) => set({ zoneId: e.target.value })}
          className="h-11 rounded-xl border border-line bg-surface px-3 text-[15px] focus:border-brand-500 focus:outline-none"
        >
          <option value="">Toda la ciudad</option>
          {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        <p className="text-[13px] text-mute">Solo verás artistas cuyo radio de cobertura incluye esta zona.</p>
      </Group>

      <Group title="Precio inicial (MXN)">
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => (
            <button key={p.label} className={chip(filters.priceMin === p.min && filters.priceMax === p.max)} onClick={() => set({ priceMin: p.min, priceMax: p.max })}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-ink-600">
            Mínimo
            <input id="filtro-min" inputMode="numeric" type="number" min={0} step={500} placeholder="$0" value={filters.priceMin ?? ''} onChange={(e) => set({ priceMin: numberOrNull(e.target.value) })} className="h-11 rounded-xl border border-line px-3 text-[15px] focus:border-brand-500 focus:outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-ink-600">
            Máximo
            <input id="filtro-max" inputMode="numeric" type="number" min={0} step={500} placeholder="Sin límite" value={filters.priceMax ?? ''} onChange={(e) => set({ priceMax: numberOrNull(e.target.value) })} className="h-11 rounded-xl border border-line px-3 text-[15px] focus:border-brand-500 focus:outline-none" />
          </label>
        </div>
        {filters.priceMin !== null && filters.priceMax !== null && filters.priceMin > filters.priceMax && (
          <p className="text-[13px] font-medium text-danger">El mínimo es mayor que el máximo.</p>
        )}
      </Group>

      <Group title="Calificación">
        <div className="flex flex-wrap gap-2">
          {[0, 4.5, 4.8].map((r) => (
            <button key={r} className={chip(filters.minRating === r)} onClick={() => set({ minRating: r })}>
              {r ? <span className="inline-flex items-center gap-1"><Star size={13} className="fill-current" /> {r}+</span> : 'Cualquiera'}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Modalidad de contratación">
        <div className="flex flex-wrap gap-2">
          <button className={chip(filters.bookingType === 'any')} onClick={() => set({ bookingType: 'any' })}>Todas</button>
          <button className={chip(filters.bookingType === 'direct')} onClick={() => set({ bookingType: 'direct' })}>Reserva directa</button>
          <button className={chip(filters.bookingType === 'request')} onClick={() => set({ bookingType: 'request' })}>Requiere confirmación</button>
        </div>
      </Group>

      <Group title="Ocasión">
        <div className="flex flex-wrap gap-2">
          <button className={chip(!filters.occasion)} onClick={() => set({ occasion: '' })}>Todas</button>
          {OCCASIONS.map((o) => (
            <button key={o.id} className={chip(filters.occasion === o.id)} onClick={() => set({ occasion: o.id })}>{o.name}</button>
          ))}
        </div>
      </Group>
    </div>
  );
}
