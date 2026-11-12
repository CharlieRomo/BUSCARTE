import type { Category, Occasion } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'mariachi', name: 'Mariachi', plural: 'Mariachis', blurb: 'Serenatas y fiestas con trompeta y violín', color: '#FF5C7A' },
  { id: 'dj', name: 'DJ', plural: 'DJs', blurb: 'Pista llena toda la noche', color: '#6C3BFF' },
  { id: 'banda', name: 'Banda sinaloense', plural: 'Bandas', blurb: 'Tambora, metales y mucha potencia', color: '#FFB547' },
  { id: 'norteno', name: 'Grupo norteño', plural: 'Norteños', blurb: 'Acordeón y bajo sexto', color: '#2a1570' },
  { id: 'cantante', name: 'Cantante', plural: 'Cantantes', blurb: 'Voz en vivo para momentos clave', color: '#ec3b5d' },
  { id: 'trio', name: 'Trío', plural: 'Tríos', blurb: 'Boleros y requinto', color: '#4a1cc7' },
  { id: 'saxofonista', name: 'Saxofonista', plural: 'Saxofonistas', blurb: 'Elegancia para cócteles y bodas', color: '#a86400' },
  { id: 'sonidero', name: 'Sonidero', plural: 'Sonideros', blurb: 'Cumbia, salsa y saludos al micrófono', color: '#0f9d6b' },
  { id: 'independiente', name: 'Músico independiente', plural: 'Independientes', blurb: 'Propuestas originales y acústicas', color: '#171421' },
];

export const OCCASIONS: Occasion[] = [
  { id: 'cumpleanos', name: 'Cumpleaños', blurb: 'Las mañanitas y algo más', categories: ['mariachi', 'dj', 'norteno', 'sonidero'] },
  { id: 'boda', name: 'Bodas', blurb: 'Ceremonia, cóctel y fiesta', categories: ['saxofonista', 'dj', 'cantante', 'mariachi'] },
  { id: 'aniversario', name: 'Aniversarios', blurb: 'Música para recordar', categories: ['trio', 'cantante', 'saxofonista'] },
  { id: 'corporativo', name: 'Eventos corporativos', blurb: 'Ambientación profesional', categories: ['dj', 'saxofonista', 'independiente'] },
  { id: 'serenata', name: 'Serenatas', blurb: 'Llega a la puerta con música', categories: ['mariachi', 'trio', 'cantante'] },
  { id: 'fiesta', name: 'Fiestas privadas', blurb: 'Que nadie se quede sentado', categories: ['banda', 'norteno', 'sonidero', 'dj'] },
  { id: 'graduacion', name: 'Graduaciones', blurb: 'Celebra el logro en grande', categories: ['dj', 'banda', 'sonidero'] },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const getOccasion = (id: string) => OCCASIONS.find((o) => o.id === id);
