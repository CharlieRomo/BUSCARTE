import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { AppUser, Artist, Booking, BookingStatus, Role } from '../types';
import { DEMO_ARTIST_ID, SEED_ARTISTS } from '../data/artists';
import { buildSeedBookings, DEMO_CUSTOMER, SEED_USERS } from '../data/seed';
import { DEFAULT_ZONE_ID } from '../data/zones';
import { storage } from '../services/storage';

const STORAGE_KEY = 'buscarte:demo:v1';
const STATE_VERSION = 1;

export interface AppState {
  version: number;
  role: Role;
  artists: Artist[];
  bookings: Booking[];
  users: AppUser[];
  favorites: string[];
  customer: AppUser;
  activeArtistId: string;
  zoneId: string;
}

type Action =
  | { type: 'setRole'; role: Role }
  | { type: 'setZone'; zoneId: string }
  | { type: 'toggleFavorite'; artistId: string }
  | { type: 'addBooking'; booking: Booking }
  | { type: 'setBookingStatus'; id: string; status: BookingStatus }
  | { type: 'updateArtist'; id: string; patch: Partial<Artist> }
  | { type: 'addArtist'; artist: Artist; user: AppUser }
  | { type: 'setUserStatus'; id: string; status: AppUser['status'] }
  | { type: 'updateCustomer'; patch: Partial<AppUser> }
  | { type: 'expireInstant'; now: number }
  | { type: 'reset' };

function initialState(): AppState {
  return {
    version: STATE_VERSION,
    role: 'customer',
    artists: SEED_ARTISTS,
    bookings: buildSeedBookings(SEED_ARTISTS),
    users: SEED_USERS,
    favorites: ['trio-tres-faroles', 'renata-cruz-sax'],
    customer: DEMO_CUSTOMER,
    activeArtistId: DEMO_ARTIST_ID,
    zoneId: DEFAULT_ZONE_ID,
  };
}

function loadState(): AppState {
  const saved = storage.get<AppState>(STORAGE_KEY);
  if (saved && saved.version === STATE_VERSION && Array.isArray(saved.artists)) return saved;
  return initialState();
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setRole':
      return { ...state, role: action.role };
    case 'setZone':
      return { ...state, zoneId: action.zoneId };
    case 'toggleFavorite': {
      const has = state.favorites.includes(action.artistId);
      return {
        ...state,
        favorites: has ? state.favorites.filter((f) => f !== action.artistId) : [...state.favorites, action.artistId],
      };
    }
    case 'addBooking':
      return { ...state, bookings: [action.booking, ...state.bookings] };
    case 'setBookingStatus':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.id ? { ...b, status: action.status, respondedAt: new Date().toISOString() } : b,
        ),
      };
    case 'updateArtist':
      return { ...state, artists: state.artists.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)) };
    case 'addArtist':
      return {
        ...state,
        artists: [...state.artists, action.artist],
        users: [...state.users, action.user],
        activeArtistId: action.artist.id,
      };
    case 'setUserStatus':
      return { ...state, users: state.users.map((u) => (u.id === action.id ? { ...u, status: action.status } : u)) };
    case 'updateCustomer': {
      const customer = { ...state.customer, ...action.patch };
      return { ...state, customer, users: state.users.map((u) => (u.id === customer.id ? customer : u)) };
    }
    case 'expireInstant': {
      let changed = false;
      const bookings = state.bookings.map((b) => {
        if (b.mode === 'instant' && b.status === 'pending' && b.expiresAt && new Date(b.expiresAt).getTime() < action.now) {
          changed = true;
          return { ...b, status: 'expired' as const };
        }
        return b;
      });
      return changed ? { ...state, bookings } : state;
    }
    case 'reset':
      return initialState();
    default:
      return state;
  }
}

function useAppStore() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    storage.set(STORAGE_KEY, state);
  }, [state]);

  // Las solicitudes inmediatas sin respuesta caducan.
  useEffect(() => {
    const tick = () => dispatch({ type: 'expireInstant', now: Date.now() });
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, []);

  const setRole = useCallback((role: Role) => dispatch({ type: 'setRole', role }), []);
  const setZone = useCallback((zoneId: string) => dispatch({ type: 'setZone', zoneId }), []);
  const toggleFavorite = useCallback((artistId: string) => dispatch({ type: 'toggleFavorite', artistId }), []);
  const addBooking = useCallback((booking: Booking) => dispatch({ type: 'addBooking', booking }), []);
  const setBookingStatus = useCallback((id: string, status: BookingStatus) => dispatch({ type: 'setBookingStatus', id, status }), []);
  const updateArtist = useCallback((id: string, patch: Partial<Artist>) => dispatch({ type: 'updateArtist', id, patch }), []);
  const addArtist = useCallback((artist: Artist, user: AppUser) => dispatch({ type: 'addArtist', artist, user }), []);
  const setUserStatus = useCallback((id: string, status: AppUser['status']) => dispatch({ type: 'setUserStatus', id, status }), []);
  const updateCustomer = useCallback((patch: Partial<AppUser>) => dispatch({ type: 'updateCustomer', patch }), []);
  const resetDemo = useCallback(() => {
    storage.remove(STORAGE_KEY);
    dispatch({ type: 'reset' });
  }, []);

  const actions = useMemo(
    () => ({ setRole, setZone, toggleFavorite, addBooking, setBookingStatus, updateArtist, addArtist, setUserStatus, updateCustomer, resetDemo }),
    [setRole, setZone, toggleFavorite, addBooking, setBookingStatus, updateArtist, addArtist, setUserStatus, updateCustomer, resetDemo],
  );

  return { state, actions };
}

type Store = ReturnType<typeof useAppStore>;

const AppContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const store = useAppStore();
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
