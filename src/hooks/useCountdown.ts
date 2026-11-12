import { useEffect, useState } from 'react';

/** Segundos restantes hasta una fecha ISO; null si no hay fecha. */
export function useCountdown(isoTarget?: string) {
  const calc = () => (isoTarget ? Math.max(0, Math.round((new Date(isoTarget).getTime() - Date.now()) / 1000)) : null);
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    if (!isoTarget) return;
    const id = window.setInterval(() => setLeft(calc()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isoTarget]);
  return left;
}

export const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
