import { Check, Clock, Crown } from 'lucide-react';
import type { Package } from '../../types';
import { cn } from '../../utils/cn';
import { formatDuration, formatMXN } from '../../utils/format';

const TIER_LABEL = { basic: 'Básico', standard: 'Estándar', premium: 'Premium' } as const;

export function PackageCard({ pkg, selected, onSelect, name }: { pkg: Package; selected: boolean; onSelect: () => void; name: string }) {
  return (
    <label
      className={cn(
        'relative flex cursor-pointer flex-col gap-3 rounded-[16px] border-2 bg-surface p-4 transition-all',
        selected ? 'border-brand-500 shadow-[0_10px_30px_-16px_rgb(108_59_255/0.7)]' : 'border-line hover:border-brand-200',
      )}
    >
      <input type="radio" name={name} className="sr-only" checked={selected} onChange={onSelect} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={cn('inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em]', pkg.tier === 'premium' ? 'text-sun-700' : 'text-brand-600')}>
            {pkg.tier === 'premium' && <Crown size={13} />} {TIER_LABEL[pkg.tier]}
          </span>
          <h4 className="mt-0.5 text-[17px] font-bold">{pkg.name}</h4>
        </div>
        <span className={cn('grid size-6 shrink-0 place-items-center rounded-full border-2', selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-line')}>
          {selected && <Check size={14} strokeWidth={3} />}
        </span>
      </div>
      <p className="text-sm text-mute">{pkg.description}</p>
      <ul className="grid gap-1.5 text-sm">
        {pkg.includes.map((i) => (
          <li key={i} className="flex items-start gap-2">
            <Check size={15} className="mt-0.5 shrink-0 text-ok" /> {i}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-end justify-between gap-2 border-t border-line pt-3">
        <span className="inline-flex items-center gap-1 text-sm text-mute"><Clock size={14} /> {formatDuration(pkg.durationHours)}</span>
        <span className="font-display text-xl font-extrabold tabular">{formatMXN(pkg.price)}</span>
      </div>
    </label>
  );
}
