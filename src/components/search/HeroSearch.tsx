import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, PartyPopper, Search, Music2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, OCCASIONS } from '../../data/categories';
import { ZONES } from '../../data/zones';
import { addDays, todayISO } from '../../utils/format';
import { EMPTY_FILTERS, filtersToParams } from '../../utils/search';
import type { CategoryId, OccasionId } from '../../types';

/** Buscador principal: tipo de artista, ubicación, fecha y tipo de evento. */
export function HeroSearch() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [zoneId, setZoneId] = useState(state.zoneId);
  const [date, setDate] = useState('');
  const [occasion, setOccasion] = useState<OccasionId | ''>('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (zoneId) actions.setZone(zoneId);
    const params = filtersToParams(
      { ...EMPTY_FILTERS, categories: category ? [category] : [], zoneId, date, occasion },
      'recommended',
    );
    navigate(`/buscar?${params.toString()}`);
  };

  const cell = 'flex min-w-0 flex-col gap-0.5 rounded-2xl px-4 py-2.5 transition-colors focus-within:bg-brand-50 hover:bg-lavender';
  const label = 'flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-600';
  const input = 'w-full bg-transparent text-[15px] font-semibold text-ink outline-none';

  return (
    <form onSubmit={submit} className="grid gap-1 rounded-[22px] border border-line bg-surface p-2 shadow-card md:grid-cols-[1.1fr_1.1fr_1fr_1.1fr_auto] md:items-center md:rounded-full">
      <label className={cell}>
        <span className={label}><Music2 size={13} className="text-brand-500" /> Artista</span>
        <select id="hero-categoria" className={input} value={category} onChange={(e) => setCategory(e.target.value as CategoryId | '')}>
          <option value="">Todos los artistas</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.plural}</option>
          ))}
        </select>
      </label>
      <label className={cell}>
        <span className={label}><MapPin size={13} className="text-coral-500" /> Ubicación</span>
        <select id="hero-zona" className={input} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
          <option value="">Toda la ciudad</option>
          {ZONES.map((z) => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </select>
      </label>
      <label className={cell}>
        <span className={label}><CalendarDays size={13} className="text-sun-700" /> Fecha</span>
        <input id="hero-fecha" type="date" className={input} value={date} min={addDays(todayISO(), 1)} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className={cell}>
        <span className={label}><PartyPopper size={13} className="text-brand-500" /> Evento</span>
        <select id="hero-evento" className={input} value={occasion} onChange={(e) => setOccasion(e.target.value as OccasionId | '')}>
          <option value="">Cualquier ocasión</option>
          {OCCASIONS.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-coral-500 px-6 font-bold text-white transition-colors hover:bg-coral-600 active:scale-[0.98] md:size-14 md:rounded-full md:px-0">
        <Search size={20} strokeWidth={2.5} />
        <span className="md:sr-only">Buscar artistas</span>
      </button>
    </form>
  );
}
