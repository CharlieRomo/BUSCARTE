import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

/** Selectores de lectura usados por varias páginas. */
export function useMarketplace() {
  const { state } = useApp();
  const publicArtists = useMemo(() => state.artists.filter((a) => a.status === 'active'), [state.artists]);
  const getArtist = (id?: string) => state.artists.find((a) => a.id === id);
  const isFavorite = (id: string) => state.favorites.includes(id);
  return { publicArtists, getArtist, isFavorite, bookings: state.bookings, zoneId: state.zoneId };
}

export function useActiveArtist() {
  const { state } = useApp();
  const artist = state.artists.find((a) => a.id === state.activeArtistId);
  const bookings = useMemo(
    () => state.bookings.filter((b) => b.artistId === state.activeArtistId),
    [state.bookings, state.activeArtistId],
  );
  return { artist, bookings };
}
