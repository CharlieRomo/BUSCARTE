import { PLATFORM } from '../config/platform';

const mxn = new Intl.NumberFormat(PLATFORM.locale, {
  style: 'currency',
  currency: PLATFORM.currency,
  maximumFractionDigits: 0,
});

export const formatMXN = (value: number) => mxn.format(Math.round(value));

export const formatNumber = (value: number) => new Intl.NumberFormat(PLATFORM.locale).format(value);

/** Convierte YYYY-MM-DD a Date local sin desfase de zona horaria. */
export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const toISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const todayISO = () => toISODate(new Date());

export const addDays = (iso: string, days: number) => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatDateLong = (iso: string) =>
  capFirst(parseISODate(iso).toLocaleDateString(PLATFORM.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

export const formatDateShort = (iso: string) =>
  capFirst(parseISODate(iso).toLocaleDateString(PLATFORM.locale, { weekday: 'short', day: 'numeric', month: 'short' }));

export const formatMonthYear = (iso: string) =>
  capFirst(parseISODate(iso).toLocaleDateString(PLATFORM.locale, { month: 'long', year: 'numeric' }));

/** "18:30" → "6:30 p. m." */
export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.toLocaleTimeString(PLATFORM.locale, { hour: 'numeric', minute: '2-digit' });
};

export const formatDuration = (hours: number) => (hours === 1 ? '1 hora' : `${hours} horas`);

export const relativeFromNow = (isoDateTime: string) => {
  const diffMin = Math.round((new Date(isoDateTime).getTime() - Date.now()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(PLATFORM.locale, { numeric: 'auto' });
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  const diffH = Math.round(diffMin / 60);
  if (Math.abs(diffH) < 24) return rtf.format(diffH, 'hour');
  return rtf.format(Math.round(diffH / 24), 'day');
};

export const initials = (name: string) =>
  name
    .replace(/^(DJ|Mariachi|Banda|Trío|Sonido|Los|Las)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

export const pluralize = (n: number, one: string, many: string) => `${formatNumber(n)} ${n === 1 ? one : many}`;
