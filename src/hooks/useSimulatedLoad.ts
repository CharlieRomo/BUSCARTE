import { useEffect, useState } from 'react';

/** Muestra un estado de carga breve, como lo haría una llamada real a la API. */
export function useSimulatedLoad(key: unknown, ms = 420) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(id);
  }, [key, ms]);
  return loading;
}
