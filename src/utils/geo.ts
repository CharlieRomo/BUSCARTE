import { ZONES } from '../data/zones';
import type { Artist, Zone } from '../types';

export const getZone = (id: string): Zone | undefined => ZONES.find((z) => z.id === id);

/** Distancia en km (Haversine). En producción vendrá de un servicio de geolocalización. */
export function distanceKm(a: Pick<Zone, 'lat' | 'lng'>, b: Pick<Zone, 'lat' | 'lng'>) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function artistDistance(artist: Artist, zoneId: string) {
  const from = getZone(artist.zoneId);
  const to = getZone(zoneId);
  if (!from || !to) return null;
  return distanceKm(from, to);
}

export function coversZone(artist: Artist, zoneId: string) {
  if (!zoneId) return true;
  const d = artistDistance(artist, zoneId);
  return d === null ? true : d <= artist.coverageKm;
}

/** Estimación de llegada simulada: 25 km/h promedio en ciudad + 15 min de preparación. */
export const etaMinutes = (km: number) => Math.round((km / 25) * 60 + 15);
