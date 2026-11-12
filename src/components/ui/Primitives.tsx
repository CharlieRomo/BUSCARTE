import type { ReactNode } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatNumber } from '../../utils/format';

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'coral' | 'sun' | 'ok' | 'danger' | 'dark'; className?: string }) {
  const tones = {
    neutral: 'bg-lavender text-ink-600 border border-line',
    brand: 'bg-brand-50 text-brand-700',
    coral: 'bg-coral-50 text-coral-600',
    sun: 'bg-sun-50 text-sun-700',
    ok: 'bg-ok-50 text-ok',
    danger: 'bg-danger-50 text-danger',
    dark: 'bg-ink text-white',
  };
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>;
}

export function Rating({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  if (!value) return <span className="text-sm font-medium text-mute">Nuevo</span>;
  return (
    <span className={cn('inline-flex items-center gap-1 font-semibold text-ink tabular', size === 'md' ? 'text-base' : 'text-sm')}>
      <Star size={size === 'md' ? 17 : 14} className="fill-sun-500 text-sun-500" />
      {value.toFixed(value % 1 ? 2 : 1).replace(/0$/, '')}
      {count !== undefined && <span className="font-normal text-mute">({formatNumber(count)})</span>}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-brand-100/60', className)} />;
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[16px] border border-dashed border-brand-200 bg-surface px-6 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="max-w-sm text-[15px] text-mute">{body}</p>
      {action}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, action, className }: { eyebrow?: string; title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-coral-500">{eyebrow}</p>}
        <h2 className="text-[22px] font-extrabold leading-tight md:text-[26px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; id: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        {description && <span className="block text-sm text-mute">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-ok peer-focus-visible:ring-4 peer-focus-visible:ring-brand-200" />
        <span className="absolute left-1 top-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function Segmented<T extends string>({ value, options, onChange, ariaLabel }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; ariaLabel: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-[12px] bg-brand-50 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-[9px] px-3 py-1.5 text-sm font-semibold transition-all',
            value === o.value ? 'bg-surface text-brand-700 shadow-sm' : 'text-ink-600 hover:text-brand-700',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, tone = 'brand' }: { label: string; value: string; hint?: string; icon: ReactNode; tone?: 'brand' | 'coral' | 'sun' | 'ok' }) {
  const tones = { brand: 'bg-brand-50 text-brand-600', coral: 'bg-coral-50 text-coral-600', sun: 'bg-sun-50 text-sun-700', ok: 'bg-ok-50 text-ok' };
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-mute">{label}</span>
        <span className={cn('grid size-9 place-items-center rounded-xl', tones[tone])}>{icon}</span>
      </div>
      <div>
        <p className="font-display text-2xl font-extrabold tabular">{value}</p>
        {hint && <p className="mt-0.5 text-[13px] text-mute">{hint}</p>}
      </div>
    </div>
  );
}
