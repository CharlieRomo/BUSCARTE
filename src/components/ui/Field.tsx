import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  children: (id: string, describedBy: string | undefined) => ReactNode;
  className?: string;
}

function FieldShell({ label, error, hint, children, className }: FieldShellProps) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-800">
        {label}
      </label>
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-err`} className="text-[13px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const control = (error?: string, withIcon?: boolean) =>
  cn(
    'w-full rounded-[12px] border bg-surface px-3.5 text-[15px] text-ink placeholder:text-mute/70 transition-colors',
    'focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none disabled:bg-lavender disabled:text-mute',
    error ? 'border-danger' : 'border-line hover:border-brand-300',
    withIcon && 'pl-10',
  );

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; icon?: ReactNode; wrapperClassName?: string };

export function Input({ label, error, hint, icon, wrapperClassName, className, ...rest }: InputProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={wrapperClassName}>
      {(id, describedBy) => (
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute">{icon}</span>}
          <input id={id} aria-invalid={!!error} aria-describedby={describedBy} className={cn(control(error, !!icon), 'h-12', className)} {...rest} />
        </div>
      )}
    </FieldShell>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string; wrapperClassName?: string };

export function Select({ label, error, hint, wrapperClassName, className, children, ...rest }: SelectProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={wrapperClassName}>
      {(id, describedBy) => (
        <select id={id} aria-invalid={!!error} aria-describedby={describedBy} className={cn(control(error), 'h-12 appearance-auto', className)} {...rest}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string; wrapperClassName?: string };

export function Textarea({ label, error, hint, wrapperClassName, className, ...rest }: TextareaProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={wrapperClassName}>
      {(id, describedBy) => (
        <textarea id={id} aria-invalid={!!error} aria-describedby={describedBy} className={cn(control(error), 'min-h-24 py-3', className)} {...rest} />
      )}
    </FieldShell>
  );
}
