import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, CalendarDays, Clock, Images, MapPin, MessageCircle, Navigation, Play, Share2, Star, Timer, Users, Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useSimulatedLoad } from '../../hooks/useSimulatedLoad';
import { ArtistCover } from '../../components/artist/ArtistCover';
import { FavoriteButton } from '../../components/artist/ArtistCard';
import { ContactSheet } from '../../components/artist/ContactSheet';
import { GalleryViewer, VideoPreview } from '../../components/artist/MediaViewers';
import { PackageCard } from '../../components/artist/PackageCard';
import { AvailabilityBadge } from '../../components/brand/Brand';
import { Button } from '../../components/ui/Button';
import { EmptyState, Rating, Skeleton } from '../../components/ui/Primitives';
import { getCategory, getOccasion } from '../../data/categories';
import type { VideoClip } from '../../types';
import { AVAILABILITY_HELP, availabilityOf, nextAvailableDate } from '../../utils/availability';
import { formatDateLong, formatDateShort, formatMXN, formatNumber } from '../../utils/format';
import { artistDistance, getZone } from '../../utils/geo';
import { startingPrice } from '../../utils/pricing';

export function ArtistProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { state } = useApp();
  const { getArtist, bookings } = useMarketplace();
  const artist = getArtist(id);
  const loading = useSimulatedLoad(id, 380);
  const [pkgId, setPkgId] = useState<string | null>(null);
  const [gallery, setGallery] = useState(false);
  const [contact, setContact] = useState(false);
  const [clip, setClip] = useState<VideoClip | null>(null);
  const [allReviews, setAllReviews] = useState(false);

  const selected = artist?.packages.find((p) => p.id === pkgId) ?? artist?.packages[Math.min(1, (artist?.packages.length ?? 1) - 1)];
  const nextDate = useMemo(() => (artist ? nextAvailableDate(artist, bookings) : null), [artist, bookings]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <Skeleton className="aspect-[16/9] w-full md:aspect-[21/9]" />
        <Skeleton className="mt-6 h-8 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/3" />
      </div>
    );
  }

  if (!artist || artist.status !== 'active') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={<Users size={26} />}
          title="No encontramos este perfil"
          body="Puede que el artista haya cambiado su enlace o que su perfil aún esté en revisión."
          action={<Link to="/buscar" className="font-bold text-brand-600 hover:underline">Explorar artistas</Link>}
        />
      </div>
    );
  }

  const status = availabilityOf(artist);
  const category = getCategory(artist.category);
  const zone = getZone(artist.zoneId);
  const km = artistDistance(artist, state.zoneId);
  const outOfRange = km !== null && km > artist.coverageKm;
  const canBook = status !== 'unavailable';
  const reviews = allReviews ? artist.reviews : artist.reviews.slice(0, 2);
  const book = () => selected && navigate(`/reservar/${artist.id}?paquete=${selected.id}`);

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      notify('Enlace copiado');
    } catch {
      notify('No pudimos copiar el enlace en este navegador', 'error');
    }
  };

  const facts = [
    { Icon: CalendarDays, label: 'Experiencia', value: `${artist.yearsExperience} años` },
    { Icon: Star, label: 'Eventos', value: formatNumber(artist.eventsCompleted) },
    { Icon: Users, label: 'Integrantes', value: String(artist.members) },
    { Icon: Timer, label: 'Responde en', value: `~${artist.responseTimeMin} min` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-4 md:px-6 md:pb-16">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-ink-600 hover:bg-brand-50">
          <ArrowLeft size={17} /> Volver
        </button>
        <div className="flex items-center gap-2">
          <button onClick={share} aria-label="Copiar enlace del perfil" className="grid size-10 place-items-center rounded-full bg-surface shadow-sm hover:bg-brand-50">
            <Share2 size={18} />
          </button>
          <FavoriteButton artistId={artist.id} className="bg-surface" />
        </div>
      </div>

      {/* GALERÍA */}
      <div className="relative grid gap-2 overflow-hidden rounded-[20px] md:grid-cols-4 md:grid-rows-2">
        <ArtistCover artist={artist} variant={0} className="aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[400px]" />
        {[1, 2, 3, 4].map((v) => (
          <ArtistCover key={v} artist={artist} variant={v} showMonogram={false} className="hidden aspect-[4/3] md:block" />
        ))}
        <button onClick={() => setGallery(true)} className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold shadow-card hover:bg-lavender">
          <Images size={16} /> Ver galería
        </button>
      </div>

      <div className="mt-6 grid gap-10 md:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-10">
          {/* ENCABEZADO */}
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <AvailabilityBadge status={status} />
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-ink-600 border border-line">{category?.name}</span>
              {artist.verified && <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700"><BadgeCheck size={13} /> Verificado</span>}
            </div>
            <h1 className="text-[32px] font-extrabold leading-tight md:text-[42px]">{artist.name}</h1>
            <p className="text-[17px] text-ink-600">{artist.tagline}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px]">
              <Rating value={artist.rating} count={artist.reviewCount} size="md" />
              <span className="inline-flex items-center gap-1 text-ink-600"><MapPin size={16} className="text-coral-500" /> {zone?.name}</span>
              {km !== null && <span className="inline-flex items-center gap-1 text-ink-600"><Navigation size={15} /> {Math.round(km)} km de {getZone(state.zoneId)?.name}</span>}
            </div>
            <p className="text-sm text-mute">{AVAILABILITY_HELP[status]}{status !== 'unavailable' && nextDate && status !== 'now' ? ` Próxima fecha libre: ${formatDateShort(nextDate)}.` : ''}</p>
          </header>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-[14px] border border-line bg-surface p-3">
                <dt className="flex items-center gap-1.5 text-[13px] text-mute"><f.Icon size={14} /> {f.label}</dt>
                <dd className="mt-1 font-display text-lg font-extrabold tabular">{f.value}</dd>
              </div>
            ))}
          </dl>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-extrabold">Sobre {artist.members > 1 ? 'nosotros' : 'mí'}</h2>
            <p className="max-w-[65ch] text-[16px] leading-relaxed text-ink-600">{artist.bio}</p>
            <div className="flex flex-wrap gap-2">
              {artist.genres.map((g) => <span key={g} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">{g}</span>)}
            </div>
            <h3 className="mt-2 text-sm font-bold">Servicios</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {artist.services.map((s) => (
                <li key={s} className="flex items-center gap-2 text-[15px]"><span className="size-1.5 rounded-full bg-coral-500" /> {s}</li>
              ))}
            </ul>
          </section>

          {artist.videos.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xl font-extrabold">Presentaciones en video</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {artist.videos.map((v, i) => (
                  <button key={v.id} onClick={() => setClip(v)} className="group relative aspect-video max-w-full overflow-hidden rounded-[16px] text-left">
                    <ArtistCover artist={artist} variant={i + 2} showMonogram={false} className="absolute inset-0" />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                    <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 transition-transform group-hover:scale-110">
                      <Play size={22} className="ml-0.5 fill-ink text-ink" />
                    </span>
                    <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white">
                      <span className="text-sm font-semibold">{v.title}</span>
                      <span className="rounded-md bg-ink/60 px-1.5 py-0.5 text-xs tabular">{v.duration}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section id="paquetes" className="flex flex-col gap-3">
            <h2 className="text-xl font-extrabold">Paquetes</h2>
            <p className="text-sm text-mute">Precio total por evento. Hora adicional: {formatMXN(artist.extraHourPrice)}. Sin comisión para el cliente.</p>
            <div className="grid gap-3 lg:grid-cols-3">
              {artist.packages.map((p) => (
                <PackageCard key={p.id} pkg={p} name="paquete" selected={selected?.id === p.id} onSelect={() => setPkgId(p.id)} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-xl font-extrabold">Reseñas</h2>
              <Rating value={artist.rating} count={artist.reviewCount} size="md" />
            </div>
            {artist.reviews.length === 0 ? (
              <p className="text-[15px] text-mute">Aún no hay reseñas. Este artista es nuevo en Buscarte.</p>
            ) : (
              <ul className="grid gap-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-[16px] border border-line bg-surface p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="grid size-9 place-items-center rounded-full bg-coral-50 font-bold text-coral-600">{r.author[0]}</span>
                        <span>
                          <span className="block text-sm font-bold">{r.author}</span>
                          <span className="block text-xs text-mute">{getOccasion(r.occasion)?.name} · {formatDateShort(r.date)}</span>
                        </span>
                      </span>
                      <span className="flex" aria-label={`${r.rating} de 5 estrellas`}>
                        {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} className={i < r.rating ? 'fill-sun-500 text-sun-500' : 'text-line'} />)}
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{r.text}</p>
                  </li>
                ))}
              </ul>
            )}
            {artist.reviews.length > 2 && (
              <Button variant="outline" onClick={() => setAllReviews((v) => !v)} className="w-fit">
                {allReviews ? 'Ver menos' : `Ver ${artist.reviews.length - 2} reseñas más`}
              </Button>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-extrabold">Cobertura</h2>
            <div className="flex items-center gap-4 rounded-[16px] border border-line bg-surface p-4">
              <div className="relative grid size-20 shrink-0 place-items-center rounded-full bg-brand-50">
                <div className="absolute inset-3 rounded-full border-2 border-dashed border-brand-300" />
                <MapPin size={22} className="text-coral-500" />
              </div>
              <div className="text-[15px]">
                <p className="font-bold">Radio de {artist.coverageKm} km desde {zone?.name}</p>
                <p className={outOfRange ? 'text-danger' : 'text-mute'}>
                  {km === null
                    ? 'Elige tu zona para saber si te cubre.'
                    : outOfRange
                      ? `${getZone(state.zoneId)?.name} queda fuera de su cobertura (${Math.round(km)} km). Puedes enviar mensaje para pedir excepción.`
                      : `Cubre ${getZone(state.zoneId)?.name} (${Math.round(km)} km).`}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* TARJETA DE RESERVA */}
        <aside className="hidden md:block">
          <div className="sticky top-24 flex flex-col gap-4 rounded-[18px] border border-line bg-surface p-5 shadow-card">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-mute">{selected?.name}</span>
              <span className="font-display text-[26px] font-extrabold tabular">{formatMXN(selected?.price ?? startingPrice(artist))}</span>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-mute"><Clock size={14} /> {selected?.durationHours} h · {artist.bookingType === 'direct' ? 'Reserva directa' : 'El artista confirma tu solicitud'}</p>
            {nextDate && canBook && <p className="rounded-xl bg-lavender px-3 py-2 text-sm">Próxima fecha libre: <b>{formatDateLong(nextDate)}</b></p>}
            <Button block size="lg" disabled={!canBook} onClick={book}>{canBook ? 'Contratar' : 'Agenda en pausa'}</Button>
            {status === 'now' && (
              <Button block variant="dark" icon={<Zap size={17} />} onClick={() => navigate(`/ahora?artista=${artist.id}`)}>Contratar para hoy</Button>
            )}
            <Button block variant="outline" icon={<MessageCircle size={17} />} onClick={() => setContact(true)}>Contactar</Button>
            <p className="text-center text-xs text-mute">No se cobra nada hasta confirmar. Pago simulado en esta demo.</p>
          </div>
        </aside>
      </div>

      {/* BARRA MÓVIL */}
      <div className="fixed inset-x-0 bottom-[68px] z-20 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-extrabold leading-tight tabular">{formatMXN(selected?.price ?? 0)}</p>
            <button onClick={() => document.getElementById('paquetes')?.scrollIntoView({ behavior: 'smooth' })} className="block max-w-full truncate text-left text-[13px] font-medium text-brand-600 underline underline-offset-2">{selected?.name} · cambiar</button>
          </div>
          <Button variant="outline" aria-label="Contactar" onClick={() => setContact(true)} className="px-3"><MessageCircle size={18} /></Button>
          {status === 'now' && <Button variant="dark" aria-label="Contratar para hoy" onClick={() => navigate(`/ahora?artista=${artist.id}`)} className="px-3"><Zap size={18} /></Button>}
          <Button disabled={!canBook} onClick={book}>{canBook ? 'Contratar' : 'En pausa'}</Button>
        </div>
      </div>

      <GalleryViewer artist={artist} open={gallery} onClose={() => setGallery(false)} />
      <VideoPreview artist={artist} clip={clip} onClose={() => setClip(null)} />
      <ContactSheet artist={artist} open={contact} onClose={() => setContact(false)} />
    </div>
  );
}
