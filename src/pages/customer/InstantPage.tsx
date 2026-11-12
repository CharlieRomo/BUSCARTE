import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BadgeCheck, Car, Info, MapPin, Navigation, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useSimulatedLoad } from '../../hooks/useSimulatedLoad';
import { ArtistCover } from '../../components/artist/ArtistCover';
import { AvailabilityBadge, EqBars } from '../../components/brand/Brand';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { EmptyState, Rating, Skeleton } from '../../components/ui/Primitives';
import { Sheet } from '../../components/ui/Sheet';
import { CATEGORIES, getCategory, OCCASIONS } from '../../data/categories';
import { ZONES } from '../../data/zones';
import { PLATFORM } from '../../config/platform';
import { buildBooking } from '../../services/bookingService';
import { mockApi } from '../../services/mockApi';
import type { Artist, CategoryId, OccasionId, Package } from '../../types';
import { availabilityOf } from '../../utils/availability';
import { cn } from '../../utils/cn';
import { formatMXN, formatTime, toISODate } from '../../utils/format';
import { artistDistance, coversZone, etaMinutes, getZone } from '../../utils/geo';
import { calculatePrice } from '../../utils/pricing';

const LEADS = [1, 2, 3];
const DURATIONS = [1, 2, 3, 4];

/** Paquete que mejor cubre la duración pedida (y horas extra si hace falta). */
function quoteFor(artist: Artist, hours: number): { pkg: Package; extra: number } {
  const sorted = [...artist.packages].sort((a, b) => a.durationHours - b.durationHours || a.price - b.price);
  const fit = sorted.find((p) => p.durationHours >= hours);
  if (fit) return { pkg: fit, extra: 0 };
  const longest = sorted[sorted.length - 1];
  return { pkg: longest, extra: hours - longest.durationHours };
}

function startFromLead(leadHours: number) {
  const d = new Date(Date.now() + leadHours * 3600_000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return d;
}

export function InstantPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { state, actions } = useApp();
  const { publicArtists } = useMarketplace();

  const preselected = params.get('artista');
  const preArtist = publicArtists.find((a) => a.id === preselected);
  const [zoneId, setZoneId] = useState(state.zoneId);
  const [category, setCategory] = useState<CategoryId | ''>(preArtist?.category ?? '');
  const [lead, setLead] = useState<number>(PLATFORM.instantMinLeadHours);
  const [hours, setHours] = useState(2);
  const [chosen, setChosen] = useState<Artist | null>(null);
  const [address, setAddress] = useState('');
  const [eventType, setEventType] = useState<OccasionId>('fiesta');
  const [guests, setGuests] = useState('30');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const loading = useSimulatedLoad(`${zoneId}-${category}`, 500);

  const start = useMemo(() => startFromLead(lead), [lead]);
  const startTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;

  const results = useMemo(
    () =>
      publicArtists
        .filter((a) => availabilityOf(a) === 'now')
        .filter((a) => !category || a.category === category)
        .filter((a) => coversZone(a, zoneId))
        .map((a) => ({ artist: a, km: artistDistance(a, zoneId) ?? 0, quote: quoteFor(a, hours) }))
        .sort((x, y) => x.km - y.km),
    [publicArtists, category, zoneId, hours],
  );
  const outOfRange = useMemo(
    () => publicArtists.filter((a) => availabilityOf(a) === 'now' && (!category || a.category === category) && !coversZone(a, zoneId)).length,
    [publicArtists, category, zoneId],
  );

  useEffect(() => {
    if (preArtist && availabilityOf(preArtist) === 'now' && coversZone(preArtist, zoneId)) setChosen(preArtist);
    // Solo al entrar con ?artista=
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async () => {
    if (!chosen) return;
    const e: Record<string, string> = {};
    if (address.trim().length < 8) e.address = 'Escribe calle, número y colonia.';
    const g = Number(guests);
    if (!g || g < 1) e.guests = 'Indica al menos 1 invitado.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const { pkg, extra } = quoteFor(chosen, hours);
    setSending(true);
    const booking = buildBooking(
      chosen,
      state.customer,
      { packageId: pkg.id, date: toISODate(start), startTime, extraHours: extra, zoneId, address, eventType, guests: g, notes: `Contratación inmediata · ${hours} h` },
      'instant',
    );
    try {
      await mockApi.authorizeDeposit(booking, 'card');
      actions.addBooking(booking);
      actions.setZone(zoneId);
      notify(`Solicitud enviada a ${chosen.name}`);
      navigate(`/reserva/${booking.id}`);
    } catch {
      notify('No pudimos enviar la solicitud. Intenta de nuevo.', 'error');
    } finally {
      setSending(false);
    }
  };

  const chip = (active: boolean) =>
    cn('rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors', active ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-ink-600 hover:border-ink-600');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <header className="flex flex-col gap-2">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-ok px-3 py-1.5 text-xs font-bold text-white"><EqBars /> Contratación inmediata</p>
        <h1 className="text-[30px] font-extrabold leading-tight md:text-[40px]">Encuentra artistas disponibles ahora</h1>
        <p className="max-w-2xl text-[16px] text-ink-600">Solo aparecen artistas que activaron “Disponible ahora” y cubren tu zona. Envías la solicitud, el artista tiene {PLATFORM.instantResponseMinutes} minutos para aceptar y no se cobra nada si no responde.</p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[340px_1fr]">
        <section aria-label="Datos del evento" className="flex flex-col gap-5 rounded-[18px] border border-line bg-surface p-5 lg:sticky lg:top-24 lg:self-start">
          <Select id="ahora-zona" label="1. ¿Dónde es?" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </Select>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink-800">2. Tipo de artista</span>
            <div className="flex flex-wrap gap-2">
              <button className={chip(!category)} onClick={() => setCategory('')}>Todos</button>
              {CATEGORIES.map((c) => <button key={c.id} className={chip(category === c.id)} onClick={() => setCategory(c.id)}>{c.plural}</button>)}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink-800">3. ¿A qué hora empieza?</span>
            <div className="flex flex-wrap gap-2">
              {LEADS.map((l) => <button key={l} className={chip(lead === l)} onClick={() => setLead(l)}>En {l} h</button>)}
            </div>
            <p className="text-[13px] text-mute">Inicio aprox. {formatTime(startTime)}{toISODate(start) !== toISODate(new Date()) ? ' (mañana)' : ''}</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-ink-800">4. Duración</span>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => <button key={d} className={chip(hours === d)} onClick={() => setHours(d)}>{d} h</button>)}
            </div>
          </div>
        </section>

        <section aria-label="Artistas disponibles" className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold" aria-live="polite">
              {loading ? 'Buscando cerca de ti…' : `${results.length} disponible${results.length === 1 ? '' : 's'} cerca de ${getZone(zoneId)?.name}`}
            </h2>
          </div>

          {loading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : results.length === 0 ? (
            <EmptyState
              icon={<Zap size={26} />}
              title="Nadie disponible ahora con esos filtros"
              body={outOfRange ? `Hay ${outOfRange} artista${outOfRange > 1 ? 's' : ''} disponible${outOfRange > 1 ? 's' : ''} pero fuera de la cobertura de ${getZone(zoneId)?.name}. Prueba otra zona o agenda con anticipación.` : 'Prueba con “Todos” los tipos de artista o agenda para otro día.'}
              action={<div className="flex flex-wrap justify-center gap-2"><Button variant="secondary" onClick={() => setCategory('')}>Ver todos los tipos</Button><Link to="/buscar" className="inline-flex h-11 items-center rounded-[12px] px-4 font-semibold text-brand-600 hover:bg-brand-50">Agendar otro día</Link></div>}
            />
          ) : (
            <ul className="grid gap-3">
              {results.map(({ artist, km, quote }) => {
                const price = calculatePrice(artist, quote.pkg, quote.extra);
                return (
                  <li key={artist.id} className={cn('flex flex-col gap-4 rounded-[18px] border-2 bg-surface p-4 transition-colors sm:flex-row sm:items-center', chosen?.id === artist.id ? 'border-ok' : 'border-line')}>
                    <Link to={`/artista/${artist.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                      <ArtistCover artist={artist} className="size-20 shrink-0 rounded-2xl" showMonogram={false} />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 font-bold"><span className="truncate">{artist.name}</span>{artist.verified && <BadgeCheck size={15} className="shrink-0 text-brand-500" />}</span>
                        <span className="block text-sm text-mute">{getCategory(artist.category)?.name} · <Rating value={artist.rating} count={artist.reviewCount} /></span>
                        <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-600">
                          <span className="inline-flex items-center gap-1"><Navigation size={13} /> {km < 1 ? '< 1' : Math.round(km)} km</span>
                          <span className="inline-flex items-center gap-1"><Car size={13} /> llega en ~{etaMinutes(km)} min</span>
                          <span className="inline-flex items-center gap-1"><MapPin size={13} /> {getZone(artist.zoneId)?.name}</span>
                        </span>
                      </span>
                    </Link>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <span className="text-right">
                        <span className="block font-display text-xl font-extrabold tabular">{formatMXN(price.total)}</span>
                        <span className="block text-xs text-mute">{hours} h · {quote.pkg.name}{quote.extra ? ` + ${quote.extra} h` : ''}</span>
                      </span>
                      <Button variant={chosen?.id === artist.id ? 'dark' : 'primary'} size="sm" icon={<Zap size={15} />} onClick={() => setChosen(artist)}>Solicitar</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="flex items-start gap-2 text-[13px] text-mute"><Info size={14} className="mt-0.5 shrink-0" /> Distancia y tiempo de llegada estimados por zona; en esta versión no se usa GPS.</p>
        </section>
      </div>

      <Sheet
        open={!!chosen}
        onClose={() => setChosen(null)}
        title="Confirma tu solicitud inmediata"
        footer={chosen && <Button block size="lg" variant="coral" loading={sending} onClick={send} icon={<Zap size={18} />}>Enviar solicitud a {chosen.name}</Button>}
      >
        {chosen && (() => {
          const q = quoteFor(chosen, hours);
          const p = calculatePrice(chosen, q.pkg, q.extra);
          return (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-lavender p-3">
                <ArtistCover artist={chosen} className="size-14 shrink-0 rounded-xl" showMonogram={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{chosen.name}</p>
                  <AvailabilityBadge status="now" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="rounded-xl border border-line p-3"><span className="block text-mute">Inicio</span><b>{formatTime(startTime)}</b></p>
                <p className="rounded-xl border border-line p-3"><span className="block text-mute">Duración</span><b>{hours} h</b></p>
              </div>
              <Input id="ahora-direccion" label="Dirección" placeholder="Calle, número, colonia" value={address} onChange={(e) => setAddress(e.target.value)} error={errors.address} />
              <div className="grid grid-cols-2 gap-3">
                <Select id="ahora-evento" label="Evento" value={eventType} onChange={(e) => setEventType(e.target.value as OccasionId)}>
                  {OCCASIONS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </Select>
                <Input id="ahora-invitados" label="Invitados" type="number" inputMode="numeric" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} error={errors.guests} />
              </div>
              <div className="grid gap-1 rounded-xl bg-brand-50 p-3 text-[15px]">
                <div className="flex justify-between"><span>Total</span><b className="tabular">{formatMXN(p.total)}</b></div>
                <div className="flex justify-between text-brand-700"><span>Anticipo retenido (simulado)</span><span className="tabular">{formatMXN(p.deposit)}</span></div>
              </div>
              <p className="text-[13px] text-mute">Si {chosen.name} no acepta en {PLATFORM.instantResponseMinutes} minutos, la solicitud caduca y el anticipo se libera.</p>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}
