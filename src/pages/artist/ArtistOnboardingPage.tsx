import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Logo } from '../../components/brand/Brand';
import { CATEGORIES } from '../../data/categories';
import { ZONES } from '../../data/zones';
import { PLATFORM } from '../../config/platform';
import { mockApi } from '../../services/mockApi';
import type { AppUser, Artist, BookingType, CategoryId } from '../../types';
import { cn } from '../../utils/cn';
import { todayISO } from '../../utils/format';
import { percent } from '../../utils/pricing';

const STEPS = ['Tu cuenta', 'Tu propuesta', 'Primer paquete'];
const PALETTES: [string, string][] = [['#6C3BFF', '#FF5C7A'], ['#FF5C7A', '#FFB547'], ['#171421', '#6C3BFF'], ['#0f9d6b', '#FFB547']];

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function ArtistOnboardingPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const { state, actions } = useApp();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [f, setF] = useState({
    name: '', email: '', phone: '', password: '', category: '' as CategoryId | '', zoneId: '',
    stageName: '', bio: '', coverageKm: 20, bookingType: 'request' as BookingType, members: 1,
    pkgName: 'Presentación básica', pkgPrice: '', pkgHours: 1,
  });
  const set = (patch: Partial<typeof f>) => {
    setF((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      const n = { ...e };
      Object.keys(patch).forEach((k) => delete n[k]);
      return n;
    });
  };

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (f.name.trim().length < 3) e.name = 'Escribe tu nombre completo.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) e.email = 'Correo no válido (ej. nombre@correo.mx).';
      else if (state.users.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) e.email = 'Ya existe una cuenta con este correo.';
      if (!/^\d{10}$/.test(f.phone.replace(/\D/g, ''))) e.phone = 'Debe tener 10 dígitos (ej. 55 1234 5678).';
      if (f.password.length < 8 || !/\d/.test(f.password)) e.password = 'Mínimo 8 caracteres e incluir un número.';
      if (!f.category) e.category = 'Elige el tipo de artista.';
      if (!f.zoneId) e.zoneId = 'Elige tu zona base.';
    }
    if (s === 1) {
      if (f.stageName.trim().length < 3) e.stageName = 'Escribe tu nombre artístico.';
      else if (state.artists.some((a) => a.name.toLowerCase() === f.stageName.trim().toLowerCase())) e.stageName = 'Ya hay un artista con ese nombre.';
      if (f.bio.trim().length < 40) e.bio = `Cuéntale más a tus clientes (faltan ${40 - f.bio.trim().length} caracteres).`;
      if (f.coverageKm < 5 || f.coverageKm > 80) e.coverageKm = 'Entre 5 y 80 km.';
      if (f.members < 1 || f.members > 40) e.members = 'Entre 1 y 40 integrantes.';
    }
    if (s === 2) {
      const price = Number(f.pkgPrice);
      if (f.pkgName.trim().length < 3) e.pkgName = 'Ponle nombre al paquete.';
      if (!price || price < 500) e.pkgPrice = 'El precio mínimo es $500 MXN.';
      else if (price > 500000) e.pkgPrice = 'Revisa el precio.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validate(step) && setStep(step + 1);

  const finish = async () => {
    if (!validate(2) || !f.category) return;
    setSaving(true);
    await mockApi.save();
    const base = slugify(f.stageName);
    const id = state.artists.some((a) => a.id === base) ? `${base}-${Date.now().toString(36)}` : base;
    const artist: Artist = {
      id,
      name: f.stageName.trim(),
      category: f.category,
      tagline: f.bio.trim().split(/[.!?]/)[0].slice(0, 90),
      bio: f.bio.trim(),
      zoneId: f.zoneId,
      coverageKm: f.coverageKm,
      yearsExperience: 1,
      eventsCompleted: 0,
      members: f.members,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      packages: [{ id: `${id}-p1`, tier: 'basic', name: f.pkgName.trim(), price: Number(f.pkgPrice), durationHours: f.pkgHours, description: 'Paquete inicial.', includes: [] }],
      services: [],
      genres: [],
      occasions: ['fiesta', 'cumpleanos'],
      bookingType: f.bookingType,
      responseTimeMin: 30,
      instantEnabled: false,
      paused: false,
      blockedDates: [],
      extraHourPrice: Math.round(Number(f.pkgPrice) * 0.6),
      palette: PALETTES[state.artists.length % PALETTES.length],
      photos: [],
      videos: [],
      verified: false,
      status: 'pending_review',
      popularity: 0,
      joinedAt: todayISO(),
      contactEmail: f.email.trim(),
      contactPhone: f.phone.replace(/\D/g, '').replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3'),
    };
    // La contraseña no se guarda: la autenticación real vivirá en el backend.
    const user: AppUser = { id: `usr-${id}`, name: f.name.trim(), email: f.email.trim(), role: 'artist', zoneId: f.zoneId, joinedAt: todayISO(), status: 'active' };
    actions.addArtist(artist, user);
    actions.setRole('artist');
    setSaving(false);
    notify('¡Perfil creado! Queda en revisión antes de publicarse.');
    navigate('/panel');
  };

  return (
    <div className="min-h-dvh bg-lavender">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
        <Link to="/" aria-label="Buscarte, inicio"><Logo /></Link>
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-600 hover:text-brand-600"><ArrowLeft size={16} /> Volver</Link>
      </header>
      <div className="mx-auto grid max-w-5xl gap-10 px-4 pb-16 pt-4 md:grid-cols-[1fr_1.2fr] md:px-6 md:pt-10">
        <section className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-coral-500">Para artistas</p>
          <h1 className="text-[32px] font-extrabold leading-tight md:text-[42px]">Consigue más fechas sin pagar por anunciarte</h1>
          <ul className="grid gap-3 text-[15px]">
            {['Registro y perfil gratis', `Solo ${percent(PLATFORM.artistCommissionRate)} de comisión por contratación exitosa`, 'Tú decides precios, cobertura y si aceptas cada solicitud', 'Activa “Disponible ahora” cuando tengas la noche libre'].map((t) => (
              <li key={t} className="flex items-start gap-2"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ok text-white"><Check size={13} strokeWidth={3} /></span>{t}</li>
            ))}
          </ul>
          <div className="rounded-[16px] bg-surface p-4 text-sm">
            <p className="font-semibold">Ejemplo de pago</p>
            <p className="mt-1 text-ink-600">Si cobras $3,000, Buscarte retiene $240 y tú recibes <b>$2,760</b>.</p>
          </div>
        </section>

        <section className="rounded-[20px] border border-line bg-surface p-5 shadow-card md:p-7">
          <ol className="mb-6 grid grid-cols-3 gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-col gap-1.5">
                <span className={cn('h-1.5 rounded-full', i <= step ? 'bg-brand-500' : 'bg-line')} />
                <span className={cn('text-xs font-semibold', i === step ? 'text-ink' : 'text-mute')}>{s}</span>
              </li>
            ))}
          </ol>

          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="ob-nombre" wrapperClassName="sm:col-span-2" label="Nombre completo" value={f.name} onChange={(e) => set({ name: e.target.value })} error={errors.name} autoComplete="name" />
              <Input id="ob-correo" label="Correo" type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} error={errors.email} autoComplete="email" />
              <Input id="ob-telefono" label="Teléfono" type="tel" inputMode="tel" placeholder="55 1234 5678" value={f.phone} onChange={(e) => set({ phone: e.target.value })} error={errors.phone} autoComplete="tel" />
              <Input id="ob-password" wrapperClassName="sm:col-span-2" label="Contraseña" type="password" value={f.password} onChange={(e) => set({ password: e.target.value })} error={errors.password} hint="En la demo no se guarda." autoComplete="new-password" icon={<Lock size={16} />} />
              <Select id="ob-tipo" label="Tipo de artista" value={f.category} onChange={(e) => set({ category: e.target.value as CategoryId })} error={errors.category}>
                <option value="">Elige uno</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select id="ob-zona" label="Ubicación base" value={f.zoneId} onChange={(e) => set({ zoneId: e.target.value })} error={errors.zoneId}>
                <option value="">Elige tu zona</option>
                {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </Select>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="ob-artistico" wrapperClassName="sm:col-span-2" label="Nombre artístico" placeholder="Ej. Mariachi Luna de Tlalpan" value={f.stageName} onChange={(e) => set({ stageName: e.target.value })} error={errors.stageName} />
              <Textarea id="ob-bio" wrapperClassName="sm:col-span-2" label="Descripción" rows={4} placeholder="Quiénes son, qué tocan y para qué eventos los contratan." value={f.bio} onChange={(e) => set({ bio: e.target.value })} error={errors.bio} hint={`${f.bio.trim().length} caracteres (mínimo 40)`} />
              <Input id="ob-cobertura" label="Radio de cobertura (km)" type="number" min={5} max={80} value={f.coverageKm} onChange={(e) => set({ coverageKm: Number(e.target.value) })} error={errors.coverageKm} />
              <Input id="ob-integrantes" label="Integrantes" type="number" min={1} max={40} value={f.members} onChange={(e) => set({ members: Number(e.target.value) })} error={errors.members} />
              <fieldset className="sm:col-span-2">
                <legend className="mb-2 text-sm font-semibold">¿Cómo quieres recibir reservas?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {([['request', 'Reviso cada solicitud', 'Aceptas o rechazas antes de confirmar.'], ['direct', 'Reserva directa', 'Se confirma si la fecha está libre.']] as const).map(([v, t, d]) => (
                    <label key={v} className={cn('flex cursor-pointer gap-3 rounded-[14px] border-2 p-3', f.bookingType === v ? 'border-brand-500 bg-brand-50/50' : 'border-line')}>
                      <input type="radio" name="ob-modo" className="mt-1 accent-[#6C3BFF]" checked={f.bookingType === v} onChange={() => set({ bookingType: v })} />
                      <span><span className="block text-sm font-semibold">{t}</span><span className="block text-[13px] text-mute">{d}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="ob-paquete" wrapperClassName="sm:col-span-2" label="Nombre del paquete" value={f.pkgName} onChange={(e) => set({ pkgName: e.target.value })} error={errors.pkgName} />
              <Input id="ob-precio" label="Precio (MXN)" type="number" inputMode="numeric" min={500} step={100} placeholder="3500" value={f.pkgPrice} onChange={(e) => set({ pkgPrice: e.target.value })} error={errors.pkgPrice}
                hint={Number(f.pkgPrice) >= 500 ? `Recibirías ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(f.pkgPrice) * (1 - PLATFORM.artistCommissionRate))} después de comisión.` : undefined} />
              <Select id="ob-horas" label="Duración" value={f.pkgHours} onChange={(e) => set({ pkgHours: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5, 6].map((h) => <option key={h} value={h}>{h} {h === 1 ? 'hora' : 'horas'}</option>)}
              </Select>
              <p className="rounded-xl bg-lavender p-3 text-sm text-ink-600 sm:col-span-2">Después podrás subir fotos, videos, más paquetes y activar disponibilidad inmediata desde tu panel.</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 0 ? <Button variant="ghost" onClick={() => setStep(step - 1)}>Atrás</Button> : <span />}
            {step < 2 ? <Button onClick={next}>Continuar</Button> : <Button variant="coral" loading={saving} onClick={finish}>Crear mi perfil</Button>}
          </div>
        </section>
      </div>
    </div>
  );
}
