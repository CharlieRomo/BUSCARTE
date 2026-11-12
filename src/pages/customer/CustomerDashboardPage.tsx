import { useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CalendarDays, Heart, History, Inbox, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ArtistCard } from '../../components/artist/ArtistCard';
import { BookingListItem } from '../../components/booking/BookingListItem';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { EmptyState, StatCard } from '../../components/ui/Primitives';
import { ZONES } from '../../data/zones';
import { mockApi } from '../../services/mockApi';
import { cn } from '../../utils/cn';
import { formatMXN, todayISO } from '../../utils/format';

type Tab = 'proximos' | 'solicitudes' | 'anteriores' | 'favoritos' | 'perfil';

const TABS: { id: Tab; label: string; Icon: typeof Heart }[] = [
  { id: 'proximos', label: 'Próximos', Icon: CalendarDays },
  { id: 'solicitudes', label: 'Solicitudes', Icon: Inbox },
  { id: 'anteriores', label: 'Anteriores', Icon: History },
  { id: 'favoritos', label: 'Favoritos', Icon: Heart },
  { id: 'perfil', label: 'Perfil', Icon: Settings },
];

function ProfileForm() {
  const { state, actions } = useApp();
  const notify = useToast();
  const [name, setName] = useState(state.customer.name);
  const [email, setEmail] = useState(state.customer.email);
  const [zoneId, setZoneId] = useState(state.customer.zoneId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e.name = 'Escribe tu nombre completo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Revisa el formato del correo (ej. nombre@correo.mx).';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    await mockApi.save();
    actions.updateCustomer({ name: name.trim(), email: email.trim(), zoneId });
    actions.setZone(zoneId);
    setSaving(false);
    notify('Perfil actualizado');
  };

  return (
    <div className="grid max-w-xl gap-4">
      <Input id="perfil-nombre" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" />
      <Input id="perfil-correo" label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
      <Select id="perfil-zona" label="Zona habitual" value={zoneId} onChange={(e) => setZoneId(e.target.value)} hint="La usamos para calcular distancias por defecto.">
        {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
      </Select>
      <Button className="w-fit" loading={saving} onClick={save}>Guardar cambios</Button>
      <p className="text-[13px] text-mute">Inicio de sesión y notificaciones llegarán con el backend; hoy el perfil se guarda solo en este navegador.</p>
    </div>
  );
}

export function CustomerDashboardPage() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const { state } = useApp();
  const tab: Tab = pathname === '/favoritos' ? 'favoritos' : ((params.get('tab') as Tab) || 'proximos');
  const today = todayISO();

  const mine = useMemo(() => state.bookings.filter((b) => b.customerId === state.customer.id), [state.bookings, state.customer.id]);
  const upcoming = mine.filter((b) => b.status === 'confirmed' && b.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const pending = mine.filter((b) => b.status === 'pending').sort((a, b) => a.date.localeCompare(b.date));
  const past = mine.filter((b) => !upcoming.includes(b) && !pending.includes(b)).sort((a, b) => b.date.localeCompare(a.date));
  const favorites = state.artists.filter((a) => state.favorites.includes(a.id) && a.status === 'active');
  const spent = mine.filter((b) => b.status === 'completed' || b.status === 'confirmed').reduce((s, b) => s + b.total, 0);
  const artistOf = (id: string) => state.artists.find((a) => a.id === id);

  const list = { proximos: upcoming, solicitudes: pending, anteriores: past }[tab as 'proximos' | 'solicitudes' | 'anteriores'];
  const empty = {
    proximos: { title: 'Aún no tienes eventos confirmados', body: 'Cuando reserves a un artista, aquí verás fecha, lugar y su contacto.' },
    solicitudes: { title: 'Sin solicitudes pendientes', body: 'Las solicitudes que esperan respuesta del artista aparecen aquí.' },
    anteriores: { title: 'Sin historial todavía', body: 'Tus eventos pasados, cancelados o rechazados aparecerán aquí.' },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="text-[28px] font-extrabold md:text-[34px]">Hola, {state.customer.name.split(' ')[0]}</h1>
      <p className="text-[15px] text-mute">Tus eventos, solicitudes y artistas guardados.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Próximos eventos" value={String(upcoming.length)} icon={<CalendarDays size={18} />} />
        <StatCard label="Esperando respuesta" value={String(pending.length)} icon={<Inbox size={18} />} tone="sun" />
        <StatCard label="Favoritos" value={String(favorites.length)} icon={<Heart size={18} />} tone="coral" />
        <StatCard label="Invertido en música" value={formatMXN(spent)} icon={<History size={18} />} tone="ok" hint="Confirmados y realizados" />
      </div>

      <div className="scrollbar-none -mx-4 mt-8 flex gap-1 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0" role="tablist">
        {TABS.map((t) => (
          <Link
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            to={t.id === 'favoritos' ? '/favoritos' : `/mis-eventos?tab=${t.id}`}
            className={cn('flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-3 pt-1 text-sm font-semibold transition-colors', tab === t.id ? 'border-brand-500 text-brand-700' : 'border-transparent text-mute hover:text-ink')}
          >
            <t.Icon size={16} /> {t.label}
            {t.id === 'solicitudes' && pending.length > 0 && <span className="rounded-full bg-sun-500 px-1.5 text-xs text-ink">{pending.length}</span>}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'perfil' ? (
          <ProfileForm />
        ) : tab === 'favoritos' ? (
          favorites.length ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {favorites.map((a) => <ArtistCard key={a.id} artist={a} zoneId={state.zoneId} />)}
            </div>
          ) : (
            <EmptyState icon={<Heart size={26} />} title="Guarda artistas para compararlos" body="Toca el corazón en cualquier perfil y los encontrarás aquí." action={<Link to="/buscar" className="font-bold text-brand-600">Explorar artistas</Link>} />
          )
        ) : list && list.length ? (
          <ul className="grid gap-3">{list.map((b) => <BookingListItem key={b.id} booking={b} artist={artistOf(b.artistId)} />)}</ul>
        ) : (
          <EmptyState icon={<CalendarDays size={26} />} title={empty[tab as 'proximos'].title} body={empty[tab as 'proximos'].body} action={<Link to="/buscar" className="font-bold text-brand-600">Buscar artistas</Link>} />
        )}
      </div>
    </div>
  );
}
