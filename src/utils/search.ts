import type { Artist, Booking, CategoryId, OccasionId, SearchFilters, SortKey } from '../types';
import { getCategory } from '../data/categories';
import { availabilityOf, isDateAvailable } from './availability';
import { coversZone } from './geo';
import { startingPrice } from './pricing';

export const EMPTY_FILTERS: SearchFilters = {
  q: '',
  categories: [],
  zoneId: '',
  date: '',
  occasion: '',
  priceMin: null,
  priceMax: null,
  minRating: 0,
  availability: 'any',
  bookingType: 'any',
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function matchesQuery(artist: Artist, q: string) {
  if (!q.trim()) return true;
  const hay = normalize(
    [artist.name, artist.tagline, getCategory(artist.category)?.name ?? '', ...artist.genres, ...artist.services].join(' '),
  );
  return normalize(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

export function filterArtists(artists: Artist[], bookings: Booking[], f: SearchFilters) {
  return artists.filter((a) => {
    if (a.status !== 'active') return false;
    if (!matchesQuery(a, f.q)) return false;
    if (f.categories.length && !f.categories.includes(a.category)) return false;
    if (f.occasion && !a.occasions.includes(f.occasion)) return false;
    if (!coversZone(a, f.zoneId)) return false;
    const price = startingPrice(a);
    if (f.priceMin !== null && price < f.priceMin) return false;
    if (f.priceMax !== null && price > f.priceMax) return false;
    if (f.minRating && a.rating < f.minRating) return false;
    const status = availabilityOf(a);
    if (f.availability === 'now' && status !== 'now') return false;
    if (f.availability === 'bookable' && status === 'unavailable') return false;
    if (f.bookingType !== 'any' && a.bookingType !== f.bookingType) return false;
    if (f.date && !isDateAvailable(a, bookings, f.date)) return false;
    return true;
  });
}

/** "Recomendados": calidad + demanda, penalizando perfiles pausados. */
const recommendedScore = (a: Artist) =>
  a.rating * 20 + Math.log10(a.reviewCount + 1) * 8 + a.popularity * 0.3 + (a.verified ? 4 : 0) - (a.paused ? 100 : 0);

export function sortArtists(list: Artist[], sort: SortKey) {
  const copy = [...list];
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => startingPrice(a) - startingPrice(b));
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'popular':
      return copy.sort((a, b) => b.popularity - a.popularity);
    default:
      return copy.sort((a, b) => recommendedScore(b) - recommendedScore(a));
  }
}

export const SORT_LABELS: Record<SortKey, string> = {
  recommended: 'Recomendados',
  price_asc: 'Menor precio',
  rating: 'Mayor calificación',
  popular: 'Más populares',
};

/** Serialización de filtros en la URL para poder compartir búsquedas. */
export function filtersToParams(f: SearchFilters, sort: SortKey) {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.categories.length) p.set('cat', f.categories.join(','));
  if (f.zoneId) p.set('zona', f.zoneId);
  if (f.date) p.set('fecha', f.date);
  if (f.occasion) p.set('ocasion', f.occasion);
  if (f.priceMin !== null) p.set('min', String(f.priceMin));
  if (f.priceMax !== null) p.set('max', String(f.priceMax));
  if (f.minRating) p.set('cal', String(f.minRating));
  if (f.availability !== 'any') p.set('disp', f.availability);
  if (f.bookingType !== 'any') p.set('modo', f.bookingType);
  if (sort !== 'recommended') p.set('orden', sort);
  return p;
}

export function paramsToFilters(p: URLSearchParams): { filters: SearchFilters; sort: SortKey } {
  const num = (k: string) => {
    const v = p.get(k);
    return v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v);
  };
  return {
    filters: {
      q: p.get('q') ?? '',
      categories: (p.get('cat')?.split(',').filter(Boolean) ?? []) as CategoryId[],
      zoneId: p.get('zona') ?? '',
      date: p.get('fecha') ?? '',
      occasion: (p.get('ocasion') ?? '') as OccasionId | '',
      priceMin: num('min'),
      priceMax: num('max'),
      minRating: Number(p.get('cal') ?? 0) || 0,
      availability: (p.get('disp') as SearchFilters['availability']) ?? 'any',
      bookingType: (p.get('modo') as SearchFilters['bookingType']) ?? 'any',
    },
    sort: (p.get('orden') as SortKey) ?? 'recommended',
  };
}

export const activeFilterCount = (f: SearchFilters) =>
  [
    f.categories.length > 0,
    !!f.zoneId,
    !!f.date,
    !!f.occasion,
    f.priceMin !== null || f.priceMax !== null,
    f.minRating > 0,
    f.availability !== 'any',
    f.bookingType !== 'any',
  ].filter(Boolean).length;
