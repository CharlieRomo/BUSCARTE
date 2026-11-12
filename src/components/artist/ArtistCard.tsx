import { Link } from 'react-router-dom';
import { BadgeCheck, Heart, MapPin, Navigation } from 'lucide-react';
import type { Artist } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { getCategory } from '../../data/categories';
import { availabilityOf } from '../../utils/availability';
import { cn } from '../../utils/cn';
import { formatMXN } from '../../utils/format';
import { artistDistance, getZone } from '../../utils/geo';
import { startingPrice } from '../../utils/pricing';
import { AvailabilityBadge } from '../brand/Brand';
import { Rating } from '../ui/Primitives';
import { ArtistCover } from './ArtistCover';

export function FavoriteButton({ artistId, className }: { artistId: string; className?: string }) {
  const { state, actions } = useApp();
  const notify = useToast();
  const active = state.favorites.includes(artistId);
  return (
    <button
      aria-label={active ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        actions.toggleFavorite(artistId);
        notify(active ? 'Quitado de favoritos' : 'Guardado en favoritos');
      }}
      className={cn('grid size-10 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95', className)}
    >
      <Heart size={19} className={cn('transition-colors', active ? 'fill-coral-500 text-coral-500' : 'text-ink')} />
    </button>
  );
}

export function ArtistCard({ artist, zoneId, layout = 'grid', className }: { artist: Artist; zoneId?: string; layout?: 'grid' | 'rail'; className?: string }) {
  const status = availabilityOf(artist);
  const zone = getZone(artist.zoneId);
  const km = zoneId ? artistDistance(artist, zoneId) : null;
  return (
    <Link
      to={`/artista/${artist.id}`}
      className={cn(
        'group flex flex-col gap-3 rounded-[18px] outline-offset-4 transition-transform duration-200',
        layout === 'rail' && 'w-[264px] shrink-0 snap-start md:w-[280px]',
        status === 'unavailable' && 'opacity-75',
        className,
      )}
    >
      <div className="relative aspect-[4/3] max-w-full overflow-hidden rounded-[16px] shadow-card">
        <ArtistCover artist={artist} className="size-full transition-transform duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <AvailabilityBadge status={status} short />
          <FavoriteButton artistId={artist.id} />
        </div>
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex min-w-0 items-center gap-1 text-[16px] font-bold leading-snug">
            <span className="truncate">{artist.name}</span>
            {artist.verified && <BadgeCheck size={16} className="shrink-0 text-brand-500" aria-label="Verificado" />}
          </h3>
          <Rating value={artist.rating} count={artist.reviewCount} />
        </div>
        <p className="text-sm text-mute">
          {getCategory(artist.category)?.name} · {artist.genres.slice(0, 2).join(', ')}
        </p>
        <p className="flex items-center gap-1 text-sm text-mute">
          {km !== null ? (
            <>
              <Navigation size={13} /> a {km < 1 ? 'menos de 1' : Math.round(km)} km
              {km > artist.coverageKm && <span className="text-danger"> · fuera de cobertura</span>}
            </>
          ) : (
            <>
              <MapPin size={13} /> {zone?.name}
            </>
          )}
        </p>
        <p className="mt-0.5 text-[15px]">
          <span className="text-mute">Desde </span>
          <span className="font-bold tabular">{formatMXN(startingPrice(artist))}</span>
          <span className="text-mute"> MXN</span>
        </p>
        <span className="mt-1 inline-flex w-fit items-center rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink-600 transition-colors group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
          Ver perfil
        </span>
      </div>
    </Link>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/3] animate-pulse rounded-[16px] bg-brand-100/60" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-brand-100/60" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-brand-100/60" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-brand-100/60" />
    </div>
  );
}
