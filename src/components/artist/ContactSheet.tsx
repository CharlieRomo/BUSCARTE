import { useState } from 'react';
import { Lock } from 'lucide-react';
import type { Artist } from '../../types';
import { useToast } from '../../context/ToastContext';
import { mockApi } from '../../services/mockApi';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Field';
import { Sheet } from '../ui/Sheet';

/**
 * Decisión de producto: el teléfono del artista no se muestra antes de reservar.
 * Así se reduce que la contratación se cierre fuera de la plataforma (y se pierda el 8%).
 */
export function ContactSheet({ artist, open, onClose }: { artist: Artist; open: boolean; onClose: () => void }) {
  const notify = useToast();
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (msg.trim().length < 15) {
      setError('Escribe al menos 15 caracteres: fecha, tipo de evento y lo que necesitas.');
      return;
    }
    if (/\d{8,}|@\w+\./.test(msg.replace(/\s/g, ''))) {
      setError('Por seguridad, no compartas teléfonos ni correos antes de reservar.');
      return;
    }
    setError('');
    setSending(true);
    await mockApi.sendMessage();
    setSending(false);
    setMsg('');
    onClose();
    notify(`Mensaje enviado a ${artist.name}. Suele responder en ${artist.responseTimeMin} min.`);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Escribe a ${artist.name}`}
      footer={<Button block loading={sending} onClick={send}>Enviar mensaje</Button>}
    >
      <div className="flex flex-col gap-4">
        <Textarea
          id="contacto-mensaje"
          label="Tu mensaje"
          placeholder="Hola, busco música para una boda el 14 de febrero en Coyoacán, unas 120 personas…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          error={error}
          rows={5}
        />
        <p className="flex items-start gap-2 rounded-xl bg-lavender p-3 text-[13px] text-ink-600">
          <Lock size={15} className="mt-0.5 shrink-0 text-brand-500" />
          Los datos de contacto se comparten cuando la reserva está confirmada. El chat en tiempo real llegará en una próxima versión; hoy el envío es simulado.
        </p>
      </div>
    </Sheet>
  );
}
