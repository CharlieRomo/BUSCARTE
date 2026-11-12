import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui/Primitives';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <EmptyState
        icon={<Compass size={26} />}
        title="Esta página no existe"
        body="Puede que el enlace esté incompleto. Vuelve al inicio para seguir buscando artistas."
        action={<Link to="/" className="font-bold text-brand-600 hover:underline">Ir al inicio</Link>}
      />
    </div>
  );
}
