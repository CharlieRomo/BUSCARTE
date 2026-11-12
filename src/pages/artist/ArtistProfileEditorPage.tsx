import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useActiveArtist } from '../../hooks/useMarketplace';
import { ArtistCover } from '../../components/artist/ArtistCover';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { ZONES } from '../../data/zones';
import { PLATFORM } from '../../config/platform';
import { mockApi } from '../../services/mockApi';
import type { Artist, Package, PackageTier } from '../../types';
import { formatMXN } from '../../utils/format';
import { fileToCompressedDataUrl } from '../../utils/images';

const MAX_PHOTOS = 6;
const MAX_PACKAGES = 4;
const TIERS: PackageTier[] = ['basic', 'standard', 'premium', 'premium'];

interface PkgForm extends Omit<Package, 'price' | 'includes'> {
  price: string;
  includes: string;
}

const toForm = (p: Package): PkgForm => ({ ...p, price: String(p.price), includes: p.includes.join('\n') });

export function ArtistProfileEditorPage() {
  const { artist } = useActiveArtist();
  const { actions } = useApp();
  const notify = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [info, setInfo] = useState(() => (artist ? {
    name: artist.name, tagline: artist.tagline, bio: artist.bio, zoneId: artist.zoneId,
    coverageKm: String(artist.coverageKm), members: String(artist.members), yearsExperience: String(artist.yearsExperience),
    genres: artist.genres.join(', '), services: artist.services.join(', '), extraHourPrice: String(artist.extraHourPrice),
  } : null));
  const [packages, setPackages] = useState<PkgForm[]>(() => artist?.packages.map(toForm) ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!artist || !info) return null;

  const setI = (patch: Partial<typeof info>) => {
    setInfo({ ...info, ...patch });
    setDirty(true);
  };
  const setP = (i: number, patch: Partial<PkgForm>) => {
    setPackages((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
    setDirty(true);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PHOTOS - artist.photos.length;
    if (room <= 0) return notify(`Máximo ${MAX_PHOTOS} fotos`, 'error');
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).slice(0, room).map((f) => fileToCompressedDataUrl(f)));
      actions.updateArtist(artist.id, { photos: [...artist.photos, ...urls] });
      notify(urls.length === 1 ? 'Foto agregada' : `${urls.length} fotos agregadas`);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No pudimos subir la imagen', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (info.name.trim().length < 3) e.name = 'Mínimo 3 caracteres.';
    if (info.tagline.trim().length < 10) e.tagline = 'Una frase de al menos 10 caracteres.';
    if (info.bio.trim().length < 40) e.bio = 'Mínimo 40 caracteres.';
    const cov = Number(info.coverageKm);
    if (!cov || cov < 5 || cov > 80) e.coverageKm = 'Entre 5 y 80 km.';
    if (!Number(info.members) || Number(info.members) < 1) e.members = 'Al menos 1.';
    if (Number(info.yearsExperience) < 0 || Number.isNaN(Number(info.yearsExperience))) e.yearsExperience = 'Número no válido.';
    if (Number(info.extraHourPrice) < 0 || Number.isNaN(Number(info.extraHourPrice))) e.extraHourPrice = 'Número no válido.';
    packages.forEach((p, i) => {
      if (p.name.trim().length < 3) e[`p${i}name`] = 'Nombre muy corto.';
      if (!Number(p.price) || Number(p.price) < 500) e[`p${i}price`] = 'Mínimo $500.';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) {
      notify('Revisa los campos marcados', 'error');
      return;
    }
    setSaving(true);
    await mockApi.save();
    const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
    const patch: Partial<Artist> = {
      name: info.name.trim(),
      tagline: info.tagline.trim(),
      bio: info.bio.trim(),
      zoneId: info.zoneId,
      coverageKm: Number(info.coverageKm),
      members: Number(info.members),
      yearsExperience: Number(info.yearsExperience),
      genres: list(info.genres),
      services: list(info.services),
      extraHourPrice: Number(info.extraHourPrice),
      packages: packages.map((p) => ({
        ...p,
        name: p.name.trim(),
        price: Math.round(Number(p.price)),
        description: p.description.trim(),
        includes: p.includes.split('\n').map((x) => x.trim()).filter(Boolean),
      })),
    };
    actions.updateArtist(artist.id, patch);
    setSaving(false);
    setDirty(false);
    notify('Perfil guardado');
  };

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div>
        <h1 className="text-[26px] font-extrabold">Mi perfil</h1>
        <p className="text-[15px] text-mute">Lo que ven los clientes antes de contratarte.</p>
      </div>

      <section className="flex flex-col gap-4 rounded-[18px] border border-line bg-surface p-5">
        <h2 className="text-lg font-bold">Fotografías</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {artist.photos.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl">
              <img src={src} alt={`Foto ${i + 1}`} className="size-full object-cover" />
              <button
                aria-label={`Quitar foto ${i + 1}`}
                onClick={() => { actions.updateArtist(artist.id, { photos: artist.photos.filter((_, j) => j !== i) }); notify('Foto eliminada', 'info'); }}
                className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-full bg-ink/70 text-white hover:bg-danger"
              >
                <X size={15} />
              </button>
              {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-bold">Portada</span>}
            </div>
          ))}
          {artist.photos.length < MAX_PHOTOS && (
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-200 text-sm font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50">
              <ImagePlus size={22} /> {uploading ? 'Procesando…' : 'Agregar'}
            </button>
          )}
          <input ref={fileRef} id="fotos" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
        </div>
        {artist.photos.length === 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-lavender p-3 text-sm text-ink-600">
            <ArtistCover artist={artist} className="size-14 shrink-0 rounded-lg" showMonogram={false} />
            Sin fotos, mostramos una portada generada con tu identidad. Los perfiles con fotos reciben más solicitudes.
          </div>
        )}
        <p className="text-[13px] text-mute">Se comprimen y guardan solo en este navegador. Hasta {MAX_PHOTOS} fotos.</p>
      </section>

      <section className="grid gap-4 rounded-[18px] border border-line bg-surface p-5 md:grid-cols-2">
        <h2 className="text-lg font-bold md:col-span-2">Información</h2>
        <Input id="ed-nombre" label="Nombre artístico" value={info.name} onChange={(e) => setI({ name: e.target.value })} error={errors.name} />
        <Input id="ed-frase" label="Frase de presentación" value={info.tagline} onChange={(e) => setI({ tagline: e.target.value })} error={errors.tagline} />
        <Textarea id="ed-bio" wrapperClassName="md:col-span-2" label="Descripción" rows={4} value={info.bio} onChange={(e) => setI({ bio: e.target.value })} error={errors.bio} />
        <Select id="ed-zona" label="Zona base" value={info.zoneId} onChange={(e) => setI({ zoneId: e.target.value })}>
          {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </Select>
        <Input id="ed-cobertura" label="Radio de cobertura (km)" type="number" value={info.coverageKm} onChange={(e) => setI({ coverageKm: e.target.value })} error={errors.coverageKm} />
        <Input id="ed-integrantes" label="Integrantes" type="number" value={info.members} onChange={(e) => setI({ members: e.target.value })} error={errors.members} />
        <Input id="ed-experiencia" label="Años de experiencia" type="number" value={info.yearsExperience} onChange={(e) => setI({ yearsExperience: e.target.value })} error={errors.yearsExperience} />
        <Input id="ed-generos" label="Géneros" hint="Separados por coma" value={info.genres} onChange={(e) => setI({ genres: e.target.value })} />
        <Input id="ed-servicios" label="Servicios" hint="Separados por coma" value={info.services} onChange={(e) => setI({ services: e.target.value })} />
        <Input id="ed-hora-extra" label="Precio por hora extra (MXN)" type="number" value={info.extraHourPrice} onChange={(e) => setI({ extraHourPrice: e.target.value })} error={errors.extraHourPrice} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Paquetes y precios</h2>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={15} />}
            disabled={packages.length >= MAX_PACKAGES}
            onClick={() => {
              setPackages((ps) => [...ps, { id: `${artist.id}-p${Date.now().toString(36)}`, tier: TIERS[ps.length] ?? 'premium', name: '', price: '', durationHours: 2, description: '', includes: '' }]);
              setDirty(true);
            }}
          >
            Nuevo paquete
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {packages.map((p, i) => (
            <div key={p.id} className="grid gap-3 rounded-[18px] border border-line bg-surface p-5 sm:grid-cols-2">
              <div className="flex items-center justify-between sm:col-span-2">
                <Select id={`pk-tier-${i}`} label="Nivel" wrapperClassName="w-40" value={p.tier} onChange={(e) => setP(i, { tier: e.target.value as PackageTier })}>
                  <option value="basic">Básico</option>
                  <option value="standard">Estándar</option>
                  <option value="premium">Premium</option>
                </Select>
                <Button size="sm" variant="ghost" icon={<Trash2 size={15} />} disabled={packages.length === 1} onClick={() => { setPackages((ps) => ps.filter((_, j) => j !== i)); setDirty(true); }} aria-label={`Eliminar paquete ${p.name || i + 1}`}>
                  Eliminar
                </Button>
              </div>
              <Input id={`pk-nombre-${i}`} wrapperClassName="sm:col-span-2" label="Nombre" value={p.name} onChange={(e) => setP(i, { name: e.target.value })} error={errors[`p${i}name`]} />
              <Input id={`pk-precio-${i}`} label="Precio (MXN)" type="number" min={500} step={100} value={p.price} onChange={(e) => setP(i, { price: e.target.value })} error={errors[`p${i}price`]}
                hint={Number(p.price) >= 500 ? `Recibes ${formatMXN(Number(p.price) * (1 - PLATFORM.artistCommissionRate))}` : undefined} />
              <Select id={`pk-horas-${i}`} label="Duración" value={p.durationHours} onChange={(e) => setP(i, { durationHours: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => <option key={h} value={h}>{h} h</option>)}
              </Select>
              <Input id={`pk-desc-${i}`} wrapperClassName="sm:col-span-2" label="Descripción" value={p.description} onChange={(e) => setP(i, { description: e.target.value })} />
              <Textarea id={`pk-incluye-${i}`} wrapperClassName="sm:col-span-2" label="Incluye" hint="Un elemento por línea" rows={3} value={p.includes} onChange={(e) => setP(i, { includes: e.target.value })} />
            </div>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur md:left-[248px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 md:px-4">
          <span className="text-sm text-mute">{dirty ? 'Tienes cambios sin guardar' : 'Todo guardado'}</span>
          <Button loading={saving} disabled={!dirty} onClick={save}>Guardar cambios</Button>
        </div>
      </div>
    </div>
  );
}
