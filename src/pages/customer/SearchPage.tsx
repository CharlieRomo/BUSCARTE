import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useSimulatedLoad } from '../../hooks/useSimulatedLoad';
import { ArtistCard, ArtistCardSkeleton } from '../../components/artist/ArtistCard';
import { FilterPanel } from '../../components/search/FilterPanel';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Primitives';
import { Sheet } from '../../components/ui/Sheet';
import { getCategory, getOccasion } from '../../data/categories';
import type { SearchFilters, SortKey } from '../../types';
import { formatDateShort, formatMXN, pluralize } from '../../utils/format';
import { getZone } from '../../utils/geo';
import { activeFilterCount, EMPTY_FILTERS, filterArtists, filtersToParams, paramsToFilters, sortArtists, SORT_LABELS } from '../../utils/search';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { filters, sort } = useMemo(() => paramsToFilters(params), [params]);
  const { publicArtists, bookings, zoneId } = useMarketplace();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<SearchFilters>(filters);
  const [query, setQuery] = useState(filters.q);
  const loading = useSimulatedLoad(params.toString(), 350);

  const apply = (f: SearchFilters, s: SortKey = sort) => setParams(filtersToParams(f, s), { replace: true });

  const results = useMemo(() => sortArtists(filterArtists(publicArtists, bookings, filters), sort), [publicArtists, bookings, filters, sort]);
  const draftCount = useMemo(() => filterArtists(publicArtists, bookings, draft).length, [publicArtists, bookings, draft]);
  const count = activeFilterCount(filters);
  const distanceFrom = filters.zoneId || zoneId;

  const chips: { label: string; clear: Partial<SearchFilters> }[] = [
    ...filters.categories.map((c) => ({ label: getCategory(c)?.plural ?? c, clear: { categories: filters.categories.filter((x) => x !== c) } })),
    ...(filters.zoneId ? [{ label: getZone(filters.zoneId)?.name ?? '', clear: { zoneId: '' } }] : []),
    ...(filters.date ? [{ label: formatDateShort(filters.date), clear: { date: '' } }] : []),
    ...(filters.occasion ? [{ label: getOccasion(filters.occasion)?.name ?? '', clear: { occasion: '' as const } }] : []),
    ...(filters.priceMin !== null || filters.priceMax !== null
      ? [{ label: `${filters.priceMin !== null ? formatMXN(filters.priceMin) : '$0'} – ${filters.priceMax !== null ? formatMXN(filters.priceMax) : 'sin límite'}`, clear: { priceMin: null, priceMax: null } }]
      : []),
    ...(filters.minRating ? [{ label: `${filters.minRating}+ estrellas`, clear: { minRating: 0 } }] : []),
    ...(filters.availability === 'now' ? [{ label: 'Disponible ahora', clear: { availability: 'any' as const } }] : []),
    ...(filters.availability === 'bookable' ? [{ label: 'Sin pausados', clear: { availability: 'any' as const } }] : []),
    ...(filters.bookingType !== 'any' ? [{ label: filters.bookingType === 'direct' ? 'Reserva directa' : 'Requiere confirmación', clear: { bookingType: 'any' as const } }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="flex flex-col gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply({ ...filters, q: query.trim() });
          }}
          className="flex items-center gap-2"
          role="search"
        >
          <label className="relative flex-1">
            <span className="sr-only">Buscar por nombre, género o servicio</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
            <input
              id="busqueda-texto"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mariachi, cumbia, boda, saxofón…"
              className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-[15px] shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <Button type="submit" className="rounded-full">Buscar</Button>
          <Button
            variant="outline"
            className="relative rounded-full lg:hidden"
            icon={<SlidersHorizontal size={17} />}
            onClick={() => {
              setDraft(filters);
              setSheetOpen(true);
            }}
            aria-label="Abrir filtros"
          >
            <span className="hidden sm:inline">Filtros</span>
            {count > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-coral-500 text-[11px] text-white">{count}</span>}
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold md:text-2xl" aria-live="polite">
            {loading ? 'Buscando artistas…' : `${pluralize(results.length, 'artista encontrado', 'artistas encontrados')}`}
          </h1>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-600">
            Ordenar por
            <select
              id="orden"
              value={sort}
              onChange={(e) => apply(filters, e.target.value as SortKey)}
              className="h-10 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-ink focus:border-brand-500 focus:outline-none"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => <option key={k} value={k}>{SORT_LABELS[k]}</option>)}
            </select>
          </label>
        </div>

        {(chips.length > 0 || filters.q) && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.q && (
              <button onClick={() => { setQuery(''); apply({ ...filters, q: '' }); }} className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-white">
                “{filters.q}” <X size={14} />
              </button>
            )}
            {chips.map((c) => (
              <button key={c.label} onClick={() => apply({ ...filters, ...c.clear })} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100">
                {c.label} <X size={14} />
              </button>
            ))}
            <button onClick={() => { setQuery(''); apply(EMPTY_FILTERS, 'recommended'); }} className="text-sm font-semibold text-ink-600 underline underline-offset-4">Limpiar todo</button>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-[16px] border border-line bg-surface p-5">
            <FilterPanel filters={filters} onChange={(f) => apply(f)} />
          </div>
        </aside>

        <section aria-label="Resultados" className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <ArtistCardSkeleton key={i} />)}</div>
          ) : results.length ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((a) => <ArtistCard key={a.id} artist={a} zoneId={distanceFrom} className="animate-fade-up" />)}
            </div>
          ) : (
            <EmptyState
              icon={<SearchX size={26} />}
              title="Sin artistas con esos filtros"
              body={filters.date ? 'Puede que la fecha esté ocupada para los artistas que buscas. Quita la fecha o prueba otra zona.' : 'Quita algún filtro o amplía el rango de precio para ver más opciones.'}
              action={<Button variant="secondary" onClick={() => { setQuery(''); apply(EMPTY_FILTERS, sort); }}>Quitar filtros</Button>}
            />
          )}
        </section>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtros"
        footer={
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setDraft({ ...EMPTY_FILTERS, q: filters.q })}>Limpiar</Button>
            <Button
              block
              onClick={() => {
                apply(draft);
                setSheetOpen(false);
              }}
            >
              Mostrar {pluralize(draftCount, 'artista', 'artistas')}
            </Button>
          </div>
        }
      >
        <FilterPanel filters={draft} onChange={setDraft} />
      </Sheet>
    </div>
  );
}
