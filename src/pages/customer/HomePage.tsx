import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarCheck, ReceiptText, Search, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useSimulatedLoad } from '../../hooks/useSimulatedLoad';
import { ArtistCard, ArtistCardSkeleton } from '../../components/artist/ArtistCard';
import { ArtistCover } from '../../components/artist/ArtistCover';
import { EqBars } from '../../components/brand/Brand';
import { CategoryTiles } from '../../components/search/CategoryTiles';
import { HeroSearch } from '../../components/search/HeroSearch';
import { OCCASION_ICONS } from '../../components/search/OccasionIcon';
import { Rating, SectionHeader } from '../../components/ui/Primitives';
import { getCategory, OCCASIONS } from '../../data/categories';
import { PLATFORM } from '../../config/platform';
import { availabilityOf } from '../../utils/availability';
import { formatMXN } from '../../utils/format';
import { artistDistance, coversZone, getZone } from '../../utils/geo';
import { percent, startingPrice } from '../../utils/pricing';
import { sortArtists } from '../../utils/search';

function Rail({ children }: { children: ReactNode }) {
  return <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 md:-mx-6 md:px-6">{children}</div>;
}

export function HomePage() {
  const { state } = useApp();
  const { publicArtists } = useMarketplace();
  const loading = useSimulatedLoad('home');
  const zone = getZone(state.zoneId);

  const availableNow = useMemo(
    () =>
      publicArtists
        .filter((a) => availabilityOf(a) === 'now' && coversZone(a, state.zoneId))
        .sort((a, b) => (artistDistance(a, state.zoneId) ?? 0) - (artistDistance(b, state.zoneId) ?? 0)),
    [publicArtists, state.zoneId],
  );
  const popular = useMemo(() => sortArtists(publicArtists, 'popular').slice(0, 8), [publicArtists]);
  const featured = useMemo(
    () => sortArtists(publicArtists.filter((a) => a.verified && !a.paused && a.rating >= 4.85), 'rating').slice(0, 3),
    [publicArtists],
  );

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-32 size-[420px] rounded-full bg-brand-200/50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-24 top-40 size-[300px] rounded-full bg-coral-100/70 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-8 md:px-6 md:pb-14 md:pt-14">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm">
            <EqBars className="text-coral-500" /> {publicArtists.length} artistas en {PLATFORM.market.split(' y ')[0]}
          </p>
          <h1 className="max-w-3xl text-[38px] font-extrabold leading-[1.02] tracking-[-0.035em] md:text-[64px]">
            Contrata música en vivo <span className="text-brand-500">para tu evento</span>, con precio claro desde el inicio.
          </h1>
          <p className="mt-4 max-w-xl text-[17px] text-ink-600">
            Mariachis, DJs, bandas, tríos y más. Compara perfiles, escucha sus presentaciones y reserva en minutos.
          </p>
          <div className="mt-7">
            <HeroSearch />
          </div>

          <Link
            to="/ahora"
            className="group mt-4 flex items-center gap-4 rounded-[20px] bg-ink p-4 text-white transition-transform hover:-translate-y-0.5 md:max-w-xl"
          >
            <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-ok animate-pulse-ring">
              <Zap size={22} className="fill-white" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[17px] font-bold">Encuentra artistas disponibles ahora</span>
              <span className="block text-sm text-white/70">
                {availableNow.length > 0
                  ? `${availableNow.length} pueden llegar hoy a ${zone?.name ?? 'tu zona'}`
                  : `Nadie activo en ${zone?.name ?? 'tu zona'} en este momento`}
              </span>
            </span>
            <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pb-16 md:px-6">
        {/* CATEGORÍAS */}
        <section className="flex flex-col gap-5">
          <SectionHeader eyebrow="Explora por sonido" title="¿Qué música buscas?" />
          <CategoryTiles />
        </section>

        {/* DISPONIBLES AHORA */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            eyebrow="Contratación inmediata"
            title={`Disponibles ahora cerca de ${zone?.name ?? 'ti'}`}
            action={<Link to="/ahora" className="shrink-0 text-sm font-bold text-brand-600 hover:underline">Ver todos</Link>}
          />
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <ArtistCardSkeleton key={i} />)}</div>
          ) : availableNow.length ? (
            <Rail>{availableNow.map((a) => <ArtistCard key={a.id} artist={a} zoneId={state.zoneId} layout="rail" />)}</Rail>
          ) : (
            <p className="rounded-2xl border border-dashed border-line bg-surface p-6 text-[15px] text-mute">
              Ningún artista con disponibilidad inmediata cubre {zone?.name} ahora. Prueba otra zona o agenda para otro día.
            </p>
          )}
        </section>

        {/* OCASIONES */}
        <section className="flex flex-col gap-5">
          <SectionHeader eyebrow="Para cada momento" title="Recomendados por ocasión" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {OCCASIONS.map((o) => {
              const Icon = OCCASION_ICONS[o.id];
              return (
                <Link
                  key={o.id}
                  to={`/buscar?ocasion=${o.id}`}
                  className="group flex flex-col gap-3 rounded-[16px] border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-coral-50 text-coral-500 transition-colors group-hover:bg-coral-500 group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <span>
                    <span className="block font-bold">{o.name}</span>
                    <span className="block text-[13px] text-mute">{o.categories.slice(0, 2).map((c) => getCategory(c)?.plural).join(' · ')}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* POPULARES */}
        <section className="flex flex-col gap-5">
          <SectionHeader
            eyebrow="Lo más contratado"
            title="Artistas populares este mes"
            action={<Link to="/buscar?orden=popular" className="shrink-0 text-sm font-bold text-brand-600 hover:underline">Ver todos</Link>}
          />
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <ArtistCardSkeleton key={i} />)}</div>
          ) : (
            <Rail>{popular.map((a) => <ArtistCard key={a.id} artist={a} zoneId={state.zoneId} layout="rail" />)}</Rail>
          )}
        </section>

        {/* DESTACADOS */}
        <section className="flex flex-col gap-5">
          <SectionHeader eyebrow="Mejor calificados" title="Artistas destacados" />
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((a, i) => (
              <Link
                key={a.id}
                to={`/artista/${a.id}`}
                className={`group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[18px] p-5 text-white shadow-card ${i === 0 ? 'md:col-span-2 md:min-h-[380px]' : ''}`}
              >
                <ArtistCover artist={a} variant={1} showMonogram={false} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
                <div className="relative flex flex-col gap-1.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-white/80">
                    {getCategory(a.category)?.name} <BadgeCheck size={15} className="text-sun-500" />
                  </span>
                  <h3 className="text-2xl font-extrabold md:text-[28px]">{a.name}</h3>
                  <p className="max-w-md text-[15px] text-white/80">{a.tagline}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm">
                    <span className="rounded-full bg-white px-2 py-0.5 text-ink"><Rating value={a.rating} count={a.reviewCount} /></span>
                    <span>Desde <b className="tabular">{formatMXN(startingPrice(a))}</b></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="grid gap-6 rounded-[22px] bg-surface p-6 md:grid-cols-[1fr_2fr] md:p-10">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-coral-500">Cómo funciona</p>
            <h2 className="text-[26px] font-extrabold leading-tight">De la búsqueda al primer acorde en tres pasos</h2>
          </div>
          <ol className="grid gap-5 sm:grid-cols-3">
            {[
              { Icon: Search, t: 'Compara', d: 'Filtra por zona, fecha y presupuesto. Escucha videos y lee reseñas.' },
              { Icon: ReceiptText, t: 'Elige un paquete', d: 'Precio total visible antes de reservar. Sin comisión para ti.' },
              { Icon: CalendarCheck, t: 'Aparta con anticipo', d: `Pagas ${percent(PLATFORM.depositRate)} para apartar y el resto el día del evento.` },
            ].map((s, i) => (
              <li key={s.t} className="flex flex-col gap-2">
                <span className="flex items-center gap-2">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-500 text-white"><s.Icon size={19} /></span>
                  <span className="font-display text-sm font-extrabold text-brand-300">Paso {i + 1}</span>
                </span>
                <h3 className="text-lg font-bold">{s.t}</h3>
                <p className="text-[15px] text-mute">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA ARTISTAS */}
        <section className="relative overflow-hidden rounded-[22px] bg-brand-500 p-6 text-white md:p-10">
          <div aria-hidden className="absolute -right-10 -top-10 size-56 rounded-full border-[28px] border-white/10" />
          <div aria-hidden className="absolute -bottom-16 right-28 size-40 rounded-full bg-coral-500/60 blur-2xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-sun-400"><ShieldCheck size={16} /> Para artistas</p>
              <h2 className="text-[26px] font-extrabold leading-tight md:text-[32px]">Publica tu perfil gratis. Solo pagas {percent(PLATFORM.artistCommissionRate)} cuando te contratan.</h2>
              <p className="mt-2 text-white/80">Recibe solicitudes, controla tu disponibilidad y activa “Disponible ahora” cuando tengas la noche libre.</p>
            </div>
            <Link to="/unete" className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-white px-6 font-bold text-brand-700 transition-transform hover:-translate-y-0.5">
              Registrarme como artista <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
