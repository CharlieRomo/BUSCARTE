export type Role = 'customer' | 'artist' | 'admin';

export type CategoryId =
  | 'mariachi'
  | 'dj'
  | 'banda'
  | 'norteno'
  | 'cantante'
  | 'trio'
  | 'saxofonista'
  | 'sonidero'
  | 'independiente';

export type OccasionId =
  | 'cumpleanos'
  | 'boda'
  | 'aniversario'
  | 'corporativo'
  | 'serenata'
  | 'fiesta'
  | 'graduacion';

/** Estado visible de disponibilidad. Se deriva, nunca se guarda directamente. */
export type AvailabilityStatus = 'now' | 'soon' | 'on_request' | 'unavailable';

/** direct = el cliente reserva y queda confirmado; request = el artista debe aceptar. */
export type BookingType = 'direct' | 'request';

export type PackageTier = 'basic' | 'standard' | 'premium';

export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Category {
  id: CategoryId;
  name: string;
  plural: string;
  blurb: string;
  color: string;
}

export interface Occasion {
  id: OccasionId;
  name: string;
  blurb: string;
  categories: CategoryId[];
}

export interface Package {
  id: string;
  tier: PackageTier;
  name: string;
  price: number;
  durationHours: number;
  description: string;
  includes: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string; // YYYY-MM-DD
  occasion: OccasionId;
  text: string;
}

export interface VideoClip {
  id: string;
  title: string;
  duration: string; // mm:ss
}

export interface Artist {
  id: string;
  name: string;
  category: CategoryId;
  tagline: string;
  bio: string;
  zoneId: string;
  coverageKm: number;
  yearsExperience: number;
  eventsCompleted: number;
  members: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  packages: Package[];
  services: string[];
  genres: string[];
  occasions: OccasionId[];
  bookingType: BookingType;
  responseTimeMin: number;
  /** El artista activó "Disponible ahora". Solo así aparece en contratación inmediata. */
  instantEnabled: boolean;
  /** Pausa manual del perfil: no aparece como contratable. */
  paused: boolean;
  blockedDates: string[]; // YYYY-MM-DD
  extraHourPrice: number;
  palette: [string, string];
  photos: string[]; // URLs o data URLs subidas en la demo
  videos: VideoClip[];
  verified: boolean;
  status: 'active' | 'pending_review' | 'rejected';
  popularity: number; // contrataciones últimos 90 días
  joinedAt: string;
  contactEmail?: string;
  contactPhone?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'expired';

export type BookingMode = 'scheduled' | 'instant';

export interface Booking {
  id: string;
  code: string;
  artistId: string;
  packageId: string;
  mode: BookingMode;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationHours: number;
  extraHours: number;
  zoneId: string;
  address: string;
  eventType: OccasionId;
  guests: number;
  notes: string;
  customerId: string;
  customerName: string;
  subtotal: number;
  customerFee: number;
  artistCommission: number;
  deposit: number;
  total: number;
  status: BookingStatus;
  createdAt: string; // ISO
  respondedAt?: string;
  expiresAt?: string; // ISO, solo para instantáneas
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  zoneId: string;
  joinedAt: string;
  status: 'active' | 'suspended';
}

export interface SearchFilters {
  q: string;
  categories: CategoryId[];
  zoneId: string;
  date: string;
  occasion: OccasionId | '';
  priceMin: number | null;
  priceMax: number | null;
  minRating: number;
  availability: 'any' | 'now' | 'bookable';
  bookingType: BookingType | 'any';
}

export type SortKey = 'recommended' | 'price_asc' | 'rating' | 'popular';
