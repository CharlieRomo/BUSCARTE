import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, Check, CreditCard, Lock, Minus, Plus, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useMarketplace } from '../../hooks/useMarketplace';
import { Calendar } from '../../components/booking/Calendar';
import { BookingSummary } from '../../components/booking/BookingSummary';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/Primitives';
import { OCCASIONS } from '../../data/categories';
import { ZONES } from '../../data/zones';
import { buildBooking, type BookingDraft } from '../../services/bookingService';
import { ApiError, mockApi } from '../../services/mockApi';
import { busyDates } from '../../utils/availability';
import { cn } from '../../utils/cn';
import { addDays, formatMXN, todayISO } from '../../utils/format';
import { artistDistance } from '../../utils/geo';
import { calculatePrice } from '../../utils/pricing';
import type { OccasionId } from '../../types';

const STEPS = ['Fecha y paquete', 'Detalles del evento', 'Anticipo'];
const TIMES = Array.from({ length: 36 }, (_, i) => {
  const h = 6 + Math.floor(i / 2);
  return `${String(h).padStart(2, '0')}:${i % 2 ? '30' : '00'}`;
});

const PAYMENT_METHODS = [
  { id: 'card', label: 'Tarjeta de crédito o débito', hint: 'Simulado: no se pide número de tarjeta', Icon: CreditCard },
  { id: 'spei', label: 'Transferencia SPEI', hint: 'Simulado: referencia generada al confirmar', Icon: Building2 },
  { id: 'unavailable', label: 'Pago en tienda', hint: 'Próximamente', Icon: Store, disabled: true },
];

type Errors = Partial<Record<keyof BookingDraft | 'payment', string>>;

export function BookingPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { state, actions } = useApp();
  const { getArtist, bookings } = useMarketplace();
  const artist = getArtist(id);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>(() => ({
    packageId: params.get('paquete') ?? artist?.packages[0]?.id ?? '',
    date: '',
    startTime: '19:00',
    extraHours: 0,
    zoneId: state.zoneId,
    address: '',
    eventType: (artist?.occasions[0] ?? 'fiesta') as OccasionId,
    guests: 50,
    notes: '',
  }));
  const [payment, setPayment] = useState('card');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const busy = useMemo(() => (artist ? busyDates(artist, bookings) : new Set<string>()), [artist, bookings]);

  if (!artist || artist.status !== 'active') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState icon={<Store size={26} />} title="Este artista no está disponible" body="No pudimos cargar el perfil para reservar." action={<Link to="/buscar" className="font-bold text-brand-600">Volver a buscar</Link>} />
      </div>
    );
  }
  if (artist.paused) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState icon={<Lock size={26} />} title={`${artist.name} pausó su agenda`} body="Guárdalo en favoritos o envíale un mensaje desde su perfil para saber cuándo vuelve." action={<Link to={`/artista/${artist.id}`} className="font-bold text-brand-600">Ver perfil</Link>} />
      </div>
    );
  }

  const pkg = artist.packages.find((p) => p.id === draft.packageId) ?? artist.packages[0];
  const set = (patch: Partial<BookingDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      (Object.keys(patch) as (keyof BookingDraft)[]).forEach((k) => delete next[k]);
      return next;
    });
  };

  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 0) {
      if (!draft.date) e.date = 'Elige la fecha del evento.';
      else if (busy.has(draft.date)) e.date = 'Esa fecha ya está ocupada.';
      if (!draft.startTime) e.startTime = 'Elige la hora de inicio.';
    }
    if (s === 1) {
      const km = artistDistance(artist, draft.zoneId);
      if (!draft.zoneId) e.zoneId = 'Elige la zona del evento.';
      else if (km !== null && km > artist.coverageKm) e.zoneId = `Esta zona está a ${Math.round(km)} km, fuera de su cobertura de ${artist.coverageKm} km.`;
      if (draft.address.trim().length < 8) e.address = 'Escribe calle, número y colonia (mínimo 8 caracteres).';
      if (!Number.isFinite(draft.guests) || draft.guests < 1) e.guests = 'Indica al menos 1 invitado.';
      else if (draft.guests > 3000) e.guests = 'Para más de 3,000 personas contacta al artista.';
      if (draft.notes.length > 500) e.notes = 'Máximo 500 caracteres.';
    }
    if (s === 2 && !payment) e.payment = 'Elige un método de pago.';
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    const e = { ...validate(0), ...validate(1), ...validate(2) };
    setErrors(e);
    if (Object.keys(e).length) {
      setStep(e.date || e.startTime ? 0 : 1);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    const booking = buildBooking(artist, state.customer, draft, 'scheduled');
    try {
      await mockApi.authorizeDeposit(booking, payment);
      actions.addBooking(booking);
      notify(booking.status === 'confirmed' ? '¡Reserva confirmada!' : 'Solicitud enviada al artista');
      navigate(`/reserva/${booking.id}`, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'No pudimos procesar el anticipo. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const price = calculatePrice(artist, pkg, draft.extraHours);
  const minDate = addDays(todayISO(), 1);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:px-6 md:pb-16">
      <button onClick={() => (step ? setStep(step - 1) : navigate(`/artista/${artist.id}`))} className="mb-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-ink-600 hover:bg-brand-50">
        <ArrowLeft size={17} /> {step ? 'Paso anterior' : 'Volver al perfil'}
      </button>

      <h1 className="text-[28px] font-extrabold md:text-[34px]">{artist.bookingType === 'direct' ? 'Reserva' : 'Solicita'} a {artist.name}</h1>
      <p className="mt-1 text-[15px] text-mute">
        {artist.bookingType === 'direct' ? 'Reserva directa: queda confirmada al apartar con anticipo.' : `Solicitud: el artista confirma en ~${artist.responseTimeMin} min. Si rechaza, el anticipo simulado se libera.`}
      </p>

      <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Pasos">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-col gap-2">
            <span className={cn('h-1.5 rounded-full transition-colors', i <= step ? 'bg-brand-500' : 'bg-line')} />
            <span className={cn('flex items-center gap-1 text-xs font-semibold md:text-sm', i === step ? 'text-ink' : 'text-mute')} aria-current={i === step ? 'step' : undefined}>
              {i < step && <Check size={14} className="text-ok" />} {s}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          {step === 0 && (
            <>
              <section className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">Paquete</h2>
                <div className="grid gap-2">
                  {artist.packages.map((p) => (
                    <label key={p.id} className={cn('flex cursor-pointer items-center gap-3 rounded-[14px] border-2 bg-surface p-3.5 transition-colors', p.id === pkg.id ? 'border-brand-500' : 'border-line hover:border-brand-200')}>
                      <input type="radio" name="pkg" className="size-4 accent-[#6C3BFF]" checked={p.id === pkg.id} onChange={() => set({ packageId: p.id })} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{p.name}</span>
                        <span className="block text-sm text-mute">{p.durationHours} h · {p.includes.slice(0, 2).join(' · ')}</span>
                      </span>
                      <span className="font-bold tabular">{formatMXN(p.price)}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">Fecha</h2>
                <Calendar
                  value={draft.date}
                  onChange={(d) => set({ date: d })}
                  disabledReason={(iso) => (iso < minDate ? 'past' : busy.has(iso) ? 'busy' : null)}
                />
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-mute">
                  <span><span className="mr-1 inline-block size-2.5 rounded-full bg-brand-500" />Seleccionada</span>
                  <span className="line-through decoration-coral-400">15</span> Ocupada
                  <span>Para hoy usa “Disponible ahora”.</span>
                </p>
                {errors.date && <p className="text-[13px] font-medium text-danger">{errors.date}</p>}
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <Select id="hora" label="Hora de inicio" value={draft.startTime} onChange={(e) => set({ startTime: e.target.value })} error={errors.startTime}>
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-ink-800">Duración</span>
                  <div className="flex h-12 items-center justify-between rounded-[12px] border border-line bg-surface px-2">
                    <button aria-label="Quitar hora extra" disabled={draft.extraHours === 0} onClick={() => set({ extraHours: draft.extraHours - 1 })} className="grid size-9 place-items-center rounded-full hover:bg-brand-50 disabled:opacity-30"><Minus size={16} /></button>
                    <span className="text-[15px] font-semibold tabular">{pkg.durationHours + draft.extraHours} h{draft.extraHours ? ` (+${draft.extraHours} extra)` : ''}</span>
                    <button aria-label="Agregar hora extra" disabled={draft.extraHours >= 4} onClick={() => set({ extraHours: draft.extraHours + 1 })} className="grid size-9 place-items-center rounded-full hover:bg-brand-50 disabled:opacity-30"><Plus size={16} /></button>
                  </div>
                  <span className="text-[13px] text-mute">Hora extra: {formatMXN(artist.extraHourPrice)}</span>
                </div>
              </section>
            </>
          )}

          {step === 1 && (
            <section className="grid gap-4 sm:grid-cols-2">
              <Select id="zona" label="Alcaldía o municipio" value={draft.zoneId} onChange={(e) => set({ zoneId: e.target.value })} error={errors.zoneId}>
                <option value="">Elige una zona</option>
                {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </Select>
              <Select id="tipo-evento" label="Tipo de evento" value={draft.eventType} onChange={(e) => set({ eventType: e.target.value as OccasionId })}>
                {OCCASIONS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
              <Input id="direccion" wrapperClassName="sm:col-span-2" label="Dirección del evento" placeholder="Calle, número, colonia" value={draft.address} onChange={(e) => set({ address: e.target.value })} error={errors.address} autoComplete="street-address" />
              <Input id="invitados" label="Invitados aproximados" type="number" inputMode="numeric" min={1} value={Number.isFinite(draft.guests) ? draft.guests : ''} onChange={(e) => set({ guests: e.target.value === '' ? NaN : Number(e.target.value) })} error={errors.guests} />
              <Textarea id="comentarios" wrapperClassName="sm:col-span-2" label="Comentarios para el artista (opcional)" placeholder="Canciones especiales, acceso al lugar, si es sorpresa…" value={draft.notes} onChange={(e) => set({ notes: e.target.value })} error={errors.notes} hint={`${draft.notes.length}/500`} />
            </section>
          )}

          {step === 2 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold">Método para el anticipo</h2>
              <div role="radiogroup" className="grid gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={cn('flex items-center gap-3 rounded-[14px] border-2 bg-surface p-4', m.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', payment === m.id ? 'border-brand-500' : 'border-line')}>
                    <input type="radio" name="pago" disabled={m.disabled} className="size-4 accent-[#6C3BFF]" checked={payment === m.id} onChange={() => setPayment(m.id)} />
                    <m.Icon size={20} className="text-brand-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{m.label}</span>
                      <span className="block text-sm text-mute">{m.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex items-start gap-3 rounded-[14px] bg-sun-50 p-4 text-sm text-sun-700">
                <Lock size={18} className="mt-0.5 shrink-0" />
                <p>Pago simulado: no se realiza ningún cobro. En producción el anticipo de <b className="tabular">{formatMXN(price.deposit)}</b> se retiene en la plataforma y se libera al artista después del evento.</p>
              </div>
              <p className="text-[13px] text-mute">Cancelación gratuita hasta 72 horas antes (política de ejemplo para la demo).</p>
              {submitError && <p role="alert" className="rounded-xl bg-danger-50 p-3 text-sm font-medium text-danger">{submitError}</p>}
            </section>
          )}

          <div className="hidden md:block">
            {step < 2 ? (
              <Button size="lg" onClick={next}>Continuar</Button>
            ) : (
              <Button size="lg" variant="coral" loading={submitting} onClick={submit}>
                {artist.bookingType === 'direct' ? `Apartar con ${formatMXN(price.deposit)}` : `Enviar solicitud`}
              </Button>
            )}
          </div>
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <BookingSummary artist={artist} pkg={pkg} extraHours={draft.extraHours} date={draft.date} startTime={draft.startTime} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-[68px] z-20 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-mute">Total</p>
            <p className="font-display text-lg font-extrabold tabular">{formatMXN(price.total)}</p>
          </div>
          {step < 2 ? (
            <Button onClick={next}>Continuar</Button>
          ) : (
            <Button variant="coral" loading={submitting} onClick={submit}>{artist.bookingType === 'direct' ? 'Apartar' : 'Enviar solicitud'}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
