import type { Artist } from '../../types';
import { cn } from '../../utils/cn';
import { initials } from '../../utils/format';
import { CATEGORY_ICONS } from '../brand/Brand';

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Portada generativa estilo álbum. Se usa mientras el artista no sube fotos reales;
 * si existe `photos[variant]`, se muestra la foto.
 */
export function ArtistCover({ artist, variant = 0, className, showMonogram = true }: { artist: Pick<Artist, 'id' | 'name' | 'category' | 'palette' | 'photos'>; variant?: number; className?: string; showMonogram?: boolean }) {
  const photo = artist.photos[variant];
  const Icon = CATEGORY_ICONS[artist.category];
  const seed = hash(`${artist.id}-${variant}`);
  const [a, b] = variant % 2 ? [artist.palette[1], artist.palette[0]] : artist.palette;
  const gid = `g-${artist.id}-${variant}`;
  const pattern = (variant + (seed % 4)) % 4;
  const cx = 230 + (seed % 140);
  const cy = 60 + ((seed >>> 4) % 120);

  return (
    <div className={cn('relative overflow-hidden bg-ink', className)}>
      {photo ? (
        <img src={photo} alt={`Foto de ${artist.name}`} className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={a} />
                <stop offset="1" stopColor={b} />
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill={`url(#${gid})`} />
            {pattern === 0 &&
              [150, 120, 90, 60, 30].map((r, i) => (
                <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeOpacity={0.12 + i * 0.04} strokeWidth={i === 4 ? 14 : 1.5} />
              ))}
            {pattern === 1 &&
              Array.from({ length: 22 }, (_, i) => {
                const h = 30 + ((seed >>> (i % 16)) % 130);
                return <rect key={i} x={20 + i * 17} y={250 - h} width="9" height={h} rx="4.5" fill="#fff" fillOpacity={0.18} />;
              })}
            {pattern === 2 &&
              Array.from({ length: 12 * 9 }, (_, i) => {
                const x = (i % 12) * 34 + 14;
                const y = Math.floor(i / 12) * 34 + 12;
                const d = Math.hypot(x - cx, y - cy);
                return <circle key={i} cx={x} cy={y} r={Math.max(1, 9 - d / 32)} fill="#fff" fillOpacity={0.22} />;
              })}
            {pattern === 3 &&
              Array.from({ length: 12 }, (_, i) => (
                <path key={i} d={`M${-100 + i * 50} 300 L${100 + i * 50} 0`} stroke="#fff" strokeOpacity={0.1 + (i % 3) * 0.05} strokeWidth={i % 3 === 0 ? 18 : 6} />
              ))}
            <circle cx={cx} cy={cy} r="38" fill="#171421" fillOpacity="0.18" />
          </svg>
          <Icon size={30} strokeWidth={1.8} className="absolute right-4 top-4 text-white/85" />
          {showMonogram && (
            <span className="absolute bottom-3 left-4 font-display text-[44px] font-extrabold leading-none tracking-[-0.05em] text-white/90 drop-shadow-sm">
              {initials(artist.name)}
            </span>
          )}
        </>
      )}
    </div>
  );
}
