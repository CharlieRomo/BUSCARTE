import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICONS } from '../brand/Brand';

/** Mosaico de géneros inspirado en el descubrimiento musical de Spotify. */
export function CategoryTiles() {
  return (
    <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 lg:grid-cols-9">
      {CATEGORIES.map((c) => {
        const Icon = CATEGORY_ICONS[c.id];
        return (
          <Link
            key={c.id}
            to={`/buscar?cat=${c.id}`}
            className="group relative flex h-28 w-32 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[16px] p-3 text-white transition-transform hover:-translate-y-0.5 md:w-auto"
            style={{ background: c.color }}
          >
            <span className="relative z-10 text-[15px] font-bold leading-tight">{c.plural}</span>
            <Icon size={58} strokeWidth={1.6} className="absolute -bottom-2 -right-2 rotate-[18deg] text-white/35 transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-110" />
          </Link>
        );
      })}
    </div>
  );
}
