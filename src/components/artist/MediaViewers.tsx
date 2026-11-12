import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { Artist, VideoClip } from '../../types';
import { Sheet } from '../ui/Sheet';
import { ArtistCover } from './ArtistCover';
import { EqBars } from '../brand/Brand';

const toSeconds = (mmss: string) => {
  const [m, s] = mmss.split(':').map(Number);
  return (m ?? 0) * 60 + (s ?? 0);
};
const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

/** Reproductor simulado: en producción aquí se integra el video real del artista. */
export function VideoPreview({ artist, clip, onClose }: { artist: Artist; clip: VideoClip | null; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const total = clip ? toSeconds(clip.duration) : 0;

  useEffect(() => {
    setT(0);
    setPlaying(false);
  }, [clip]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setT((v) => Math.min(v + 1, total)), 1000);
    return () => window.clearInterval(id);
  }, [playing, total]);

  useEffect(() => {
    if (total && t >= total) setPlaying(false);
  }, [t, total]);

  return (
    <Sheet open={!!clip} onClose={onClose} title={clip?.title ?? ''} size="lg">
      {clip && (
        <div className="flex flex-col gap-4">
          <div className="relative aspect-video max-w-full overflow-hidden rounded-2xl">
            <ArtistCover artist={artist} variant={2} showMonogram={false} className="absolute inset-0" />
            <div className="absolute inset-0 grid place-items-center bg-ink/30">
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pausar' : 'Reproducir'}
                className="grid size-16 place-items-center rounded-full bg-white text-ink shadow-pop transition-transform hover:scale-105"
              >
                {playing ? <Pause size={26} className="fill-ink" /> : <Play size={26} className="ml-1 fill-ink" />}
              </button>
            </div>
            {playing && <EqBars className="absolute bottom-4 left-4 h-5 text-white" />}
          </div>
          <div className="flex items-center gap-3 text-sm tabular text-mute">
            <span>{fmt(t)}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand-500 transition-[width] duration-1000 ease-linear" style={{ width: `${total ? (t / total) * 100 : 0}%` }} />
            </div>
            <span>{clip.duration}</span>
          </div>
          <p className="rounded-xl bg-sun-50 px-3 py-2 text-[13px] text-sun-700">
            Vista previa simulada. En producción aquí se reproduce el video que sube el artista.
          </p>
        </div>
      )}
    </Sheet>
  );
}

export function GalleryViewer({ artist, open, onClose }: { artist: Artist; open: boolean; onClose: () => void }) {
  const count = Math.max(5, artist.photos.length);
  return (
    <Sheet open={open} onClose={onClose} title={`Galería de ${artist.name}`} size="lg">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: count }, (_, i) => (
          <ArtistCover key={i} artist={artist} variant={i} className={i === 0 ? 'col-span-2 aspect-[16/9] rounded-2xl' : 'aspect-square rounded-2xl'} />
        ))}
      </div>
      {artist.photos.length === 0 && <p className="mt-3 text-[13px] text-mute">Este artista aún no sube fotografías; mostramos portadas generadas con su identidad.</p>}
    </Sheet>
  );
}
