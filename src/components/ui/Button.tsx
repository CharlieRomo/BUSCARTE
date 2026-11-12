import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'coral' | 'dark' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-[0_8px_20px_-10px_rgb(108_59_255/0.8)]',
  coral: 'bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-600 shadow-[0_8px_20px_-10px_rgb(255_92_122/0.9)]',
  dark: 'bg-ink text-white hover:bg-ink-800 active:bg-ink-600',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200',
  outline: 'border border-line bg-surface text-ink hover:border-ink-600 active:bg-lavender',
  ghost: 'text-ink-600 hover:bg-brand-50 hover:text-brand-700 active:bg-brand-100',
  danger: 'bg-danger-50 text-danger hover:bg-danger hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-[15px] gap-2',
  lg: 'h-13 px-6 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, iconRight, block, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[12px] font-semibold transition-all duration-150 select-none',
        'active:scale-[0.98] disabled:opacity-45 disabled:shadow-none disabled:active:scale-100',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle size={18} className="animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
});
