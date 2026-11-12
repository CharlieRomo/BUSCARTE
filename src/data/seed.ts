import type { AppUser, Artist, Booking, BookingMode, BookingStatus, OccasionId } from '../types';
import { addDays, todayISO } from '../utils/format';
import { calculatePrice } from '../utils/pricing';

export const DEMO_CUSTOMER: AppUser = {
  id: 'cust-demo',
  name: 'Ximena Ortiz',
  email: 'ximena.ortiz@correo.mx',
  role: 'customer',
  zoneId: 'benito-juarez',
  joinedAt: '2026-06-14',
  status: 'active',
};

export const SEED_USERS: AppUser[] = [
  DEMO_CUSTOMER,
  { id: 'u2', name: 'Fernanda López', email: 'fer.lopez@correo.mx', role: 'customer', zoneId: 'coyoacan', joinedAt: '2026-03-02', status: 'active' },
  { id: 'u3', name: 'Óscar Mendoza', email: 'oscar.mdz@correo.mx', role: 'customer', zoneId: 'tlalpan', joinedAt: '2026-04-18', status: 'active' },
  { id: 'u4', name: 'Daniela Rangel', email: 'dani.rangel@correo.mx', role: 'customer', zoneId: 'cuauhtemoc', joinedAt: '2026-05-09', status: 'active' },
  { id: 'u5', name: 'Rodrigo Pérez', email: 'rodrigo.p@correo.mx', role: 'customer', zoneId: 'miguel-hidalgo', joinedAt: '2026-05-21', status: 'active' },
  { id: 'u6', name: 'Sofía Vargas', email: 'sofia.vargas@correo.mx', role: 'customer', zoneId: 'benito-juarez', joinedAt: '2026-06-03', status: 'active' },
  { id: 'u7', name: 'Héctor Juárez', email: 'hector.j@correo.mx', role: 'customer', zoneId: 'gam', joinedAt: '2026-07-11', status: 'suspended' },
  { id: 'u8', name: 'Alejandra Flores', email: 'ale.flores@correo.mx', role: 'customer', zoneId: 'iztapalapa', joinedAt: '2026-07-29', status: 'active' },
  { id: 'u9', name: 'Paco Ramírez', email: 'paco.rmz@correo.mx', role: 'customer', zoneId: 'tlalpan', joinedAt: '2026-08-15', status: 'active' },
  { id: 'u10', name: 'Silvia Rosales', email: 'silvia.r@correo.mx', role: 'customer', zoneId: 'venustiano-carranza', joinedAt: '2026-09-02', status: 'active' },
  { id: 'u11', name: 'Mónica Juárez', email: 'moni.jz@correo.mx', role: 'customer', zoneId: 'benito-juarez', joinedAt: '2026-09-27', status: 'active' },
  { id: 'u12', name: 'Lalo Fuentes', email: 'lalo.f@correo.mx', role: 'customer', zoneId: 'nezahualcoyotl', joinedAt: '2026-10-19', status: 'active' },
  { id: 'adm1', name: 'Equipo Buscarte', email: 'operaciones@buscarte.mx', role: 'admin', zoneId: 'cuauhtemoc', joinedAt: '2025-01-01', status: 'active' },
];

interface SeedSpec {
  artistId: string;
  pkgIndex: number;
  dayOffset: number;
  time: string;
  status: BookingStatus;
  customerId: string;
  customerName: string;
  eventType: OccasionId;
  zoneId: string;
  address: string;
  guests: number;
  notes?: string;
  mode?: BookingMode;
}

const SPECS: SeedSpec[] = [
  // Cliente demo
  { artistId: 'trio-tres-faroles', pkgIndex: 1, dayOffset: 9, time: '20:00', status: 'confirmed', customerId: DEMO_CUSTOMER.id, customerName: DEMO_CUSTOMER.name, eventType: 'aniversario', zoneId: 'benito-juarez', address: 'Av. Universidad 1200, Xoco', guests: 30, notes: 'Aniversario 35 de mis papás. Incluir "Sabor a mí".' },
  { artistId: 'dj-kalo-beats', pkgIndex: 1, dayOffset: 23, time: '19:00', status: 'pending', customerId: DEMO_CUSTOMER.id, customerName: DEMO_CUSTOMER.name, eventType: 'graduacion', zoneId: 'coyoacan', address: 'Salón Jardín Las Flores, Copilco', guests: 120 },
  { artistId: 'dj-mara-lux', pkgIndex: 0, dayOffset: -40, time: '21:00', status: 'completed', customerId: DEMO_CUSTOMER.id, customerName: DEMO_CUSTOMER.name, eventType: 'cumpleanos', zoneId: 'cuauhtemoc', address: 'Terraza en Colima 220, Roma Norte', guests: 45 },
  { artistId: 'mariachi-sol-coyoacan', pkgIndex: 0, dayOffset: -95, time: '08:00', status: 'completed', customerId: DEMO_CUSTOMER.id, customerName: DEMO_CUSTOMER.name, eventType: 'serenata', zoneId: 'benito-juarez', address: 'Calle Pilares 410, Del Valle', guests: 12, notes: 'Las Mañanitas para mi abuela.' },
  // Agenda del artista demo (Mariachi Sol de Coyoacán)
  { artistId: 'mariachi-sol-coyoacan', pkgIndex: 2, dayOffset: 18, time: '17:00', status: 'pending', customerId: 'u3', customerName: 'Óscar Mendoza', eventType: 'boda', zoneId: 'tlalpan', address: 'Jardín Xochitla, Tlalpan centro', guests: 180, notes: 'Entrada de novios con "Hermoso cariño".' },
  { artistId: 'mariachi-sol-coyoacan', pkgIndex: 0, dayOffset: 6, time: '22:30', status: 'pending', customerId: 'u11', customerName: 'Mónica Juárez', eventType: 'serenata', zoneId: 'benito-juarez', address: 'Calle Tlacoquemécatl 88, Del Valle', guests: 8, notes: 'Es sorpresa, por favor no tocar el timbre antes de las 22:30.' },
  { artistId: 'mariachi-sol-coyoacan', pkgIndex: 1, dayOffset: 12, time: '15:00', status: 'confirmed', customerId: 'u2', customerName: 'Fernanda López', eventType: 'cumpleanos', zoneId: 'coyoacan', address: 'Francisco Sosa 150, Coyoacán', guests: 60 },
  { artistId: 'mariachi-sol-coyoacan', pkgIndex: 0, dayOffset: 2, time: '07:00', status: 'confirmed', customerId: 'u6', customerName: 'Sofía Vargas', eventType: 'cumpleanos', zoneId: 'benito-juarez', address: 'Av. Coyoacán 1435, Del Valle', guests: 15 },
  { artistId: 'mariachi-sol-coyoacan', pkgIndex: 1, dayOffset: -12, time: '16:00', status: 'completed', customerId: 'u4', customerName: 'Daniela Rangel', eventType: 'cumpleanos', zoneId: 'cuauhtemoc', address: 'Durango 199, Roma Norte', guests: 50 },
  { artistId: 'mariachi-sol-coyoacan', pkgIndex: 2, dayOffset: -30, time: '18:00', status: 'completed', customerId: 'u3', customerName: 'Óscar Mendoza', eventType: 'boda', zoneId: 'miguel-hidalgo', address: 'Hacienda de los Morales, Polanco', guests: 220 },
  { artistId: 'mariachi-sol-coyoacan', pkgIndex: 0, dayOffset: -5, time: '23:00', status: 'rejected', customerId: 'u12', customerName: 'Lalo Fuentes', eventType: 'serenata', zoneId: 'ecatepec', address: 'Ecatepec, fuera de cobertura', guests: 10 },
  // Otros movimientos de la plataforma (para Admin)
  { artistId: 'renata-cruz-sax', pkgIndex: 2, dayOffset: 15, time: '13:00', status: 'confirmed', customerId: 'u5', customerName: 'Rodrigo Pérez', eventType: 'boda', zoneId: 'miguel-hidalgo', address: 'Casa Lamm, Roma Norte', guests: 150 },
  { artistId: 'banda-sierra-dorada', pkgIndex: 1, dayOffset: -8, time: '20:00', status: 'completed', customerId: 'u7', customerName: 'Héctor Juárez', eventType: 'fiesta', zoneId: 'gam', address: 'Salón Los Arcos, Lindavista', guests: 200 },
  { artistId: 'coyotes-del-ajusco', pkgIndex: 1, dayOffset: -3, time: '23:00', status: 'completed', customerId: 'u9', customerName: 'Paco Ramírez', eventType: 'cumpleanos', zoneId: 'tlalpan', address: 'Pedregal de San Nicolás', guests: 40, mode: 'instant' },
  { artistId: 'sonido-tlaloc', pkgIndex: 0, dayOffset: -2, time: '18:00', status: 'completed', customerId: 'u12', customerName: 'Lalo Fuentes', eventType: 'fiesta', zoneId: 'nezahualcoyotl', address: 'Calle 7, Benito Juárez, Neza', guests: 150 },
  { artistId: 'valeria-montiel', pkgIndex: 2, dayOffset: 27, time: '12:00', status: 'pending', customerId: 'u10', customerName: 'Silvia Rosales', eventType: 'boda', zoneId: 'coyoacan', address: 'Registro civil Coyoacán y jardín', guests: 90 },
  { artistId: 'banda-herradura-fina', pkgIndex: 1, dayOffset: -20, time: '17:00', status: 'cancelled', customerId: 'u8', customerName: 'Alejandra Flores', eventType: 'cumpleanos', zoneId: 'iztapalapa', address: 'San Lorenzo Tezonco', guests: 70 },
];

export function buildSeedBookings(artists: Artist[]): Booking[] {
  const today = todayISO();
  return SPECS.flatMap((s, i) => {
    const artist = artists.find((a) => a.id === s.artistId);
    const pkg = artist?.packages[s.pkgIndex];
    if (!artist || !pkg) return [];
    const price = calculatePrice(artist, pkg, 0);
    const created = new Date();
    created.setDate(created.getDate() - Math.max(1, -s.dayOffset + 7));
    const booking: Booking = {
      id: `seed-${i + 1}`,
      code: `BK-${(4120 + i * 37).toString(36).toUpperCase()}`,
      artistId: artist.id,
      packageId: pkg.id,
      mode: s.mode ?? 'scheduled',
      date: addDays(today, s.dayOffset),
      startTime: s.time,
      durationHours: pkg.durationHours,
      extraHours: 0,
      zoneId: s.zoneId,
      address: s.address,
      eventType: s.eventType,
      guests: s.guests,
      notes: s.notes ?? '',
      customerId: s.customerId,
      customerName: s.customerName,
      subtotal: price.subtotal,
      customerFee: price.customerFee,
      artistCommission: price.artistCommission,
      deposit: price.deposit,
      total: price.total,
      status: s.status,
      createdAt: created.toISOString(),
    };
    return [booking];
  });
}
