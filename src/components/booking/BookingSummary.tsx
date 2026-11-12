import type { Artist, Package } from '../../types';
import { PLATFORM } from '../../config/platform';
import { getCategory } from '../../data/categories';
import { formatDateLong, formatDuration, formatMXN, formatTime } from '../../utils/format';
import { calculatePrice, percent } from '../../utils/pricing';
import { ArtistCover } from '../artist/ArtistCover';

export function BookingSummary({ artist, pkg, extraHours, date, startTime }: { artist: Artist; pkg: Package; extraHours: number; date?: string; startTime?: string }) {
  const p = calculatePrice(artist, pkg, extraHours);
  const row = 'flex items-baseline justify-between gap-3 text-[15px]';
  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <ArtistCover artist={artist} className="size-16 shrink-0 rounded-xl" showMonogram={false} />
        <div className="min-w-0">
          <p className="truncate font-bold">{artist.name}</p>
          <p className="text-sm text-mute">{getCategory(artist.category)?.name} · {pkg.name}</p>
        </div>
      </div>
      <div className="grid gap-1 rounded-xl bg-lavender p-3 text-sm">
        <p><span className="text-mute">Fecha: </span><b>{date ? formatDateLong(date) : 'Por elegir'}</b></p>
        <p><span className="text-mute">Horario: </span><b>{startTime ? formatTime(startTime) : 'Por elegir'}</b> · {formatDuration(pkg.durationHours + extraHours)}</p>
      </div>
      <dl className="grid gap-2">
        <div className={row}><dt className="text-ink-600">{pkg.name}</dt><dd className="tabular">{formatMXN(p.packagePrice)}</dd></div>
        {extraHours > 0 && (
          <div className={row}><dt className="text-ink-600">{formatDuration(extraHours)} extra × {formatMXN(artist.extraHourPrice)}</dt><dd className="tabular">{formatMXN(p.extraHoursPrice)}</dd></div>
        )}
        <div className={row}>
          <dt className="text-ink-600">Comisión de plataforma</dt>
          <dd className="font-semibold text-ok">{p.customerFee ? formatMXN(p.customerFee) : 'Gratis'}</dd>
        </div>
        <div className={`${row} border-t border-line pt-3`}>
          <dt className="font-bold">Total</dt>
          <dd className="font-display text-xl font-extrabold tabular">{formatMXN(p.total)}</dd>
        </div>
        <div className={`${row} rounded-xl bg-brand-50 px-3 py-2`}>
          <dt className="font-semibold text-brand-700">Anticipo hoy ({percent(PLATFORM.depositRate)})</dt>
          <dd className="font-bold text-brand-700 tabular">{formatMXN(p.deposit)}</dd>
        </div>
        <div className={row}><dt className="text-mute">Resto el día del evento</dt><dd className="text-mute tabular">{formatMXN(p.remaining)}</dd></div>
      </dl>
    </div>
  );
}
