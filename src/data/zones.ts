import type { Zone } from '../types';

/** Alcaldías y municipios conurbados con centroides aproximados. */
export const ZONES: Zone[] = [
  { id: 'cuauhtemoc', name: 'Cuauhtémoc', lat: 19.4326, lng: -99.1332 },
  { id: 'benito-juarez', name: 'Benito Juárez', lat: 19.3727, lng: -99.1564 },
  { id: 'coyoacan', name: 'Coyoacán', lat: 19.3467, lng: -99.1617 },
  { id: 'miguel-hidalgo', name: 'Miguel Hidalgo', lat: 19.4253, lng: -99.2027 },
  { id: 'alvaro-obregon', name: 'Álvaro Obregón', lat: 19.3587, lng: -99.2033 },
  { id: 'tlalpan', name: 'Tlalpan', lat: 19.2944, lng: -99.1627 },
  { id: 'iztapalapa', name: 'Iztapalapa', lat: 19.3574, lng: -99.0671 },
  { id: 'gam', name: 'Gustavo A. Madero', lat: 19.4848, lng: -99.1112 },
  { id: 'azcapotzalco', name: 'Azcapotzalco', lat: 19.4869, lng: -99.1838 },
  { id: 'xochimilco', name: 'Xochimilco', lat: 19.2572, lng: -99.1029 },
  { id: 'venustiano-carranza', name: 'Venustiano Carranza', lat: 19.4307, lng: -99.0992 },
  { id: 'naucalpan', name: 'Naucalpan', lat: 19.4785, lng: -99.2396 },
  { id: 'huixquilucan', name: 'Huixquilucan', lat: 19.3609, lng: -99.3507 },
  { id: 'tlalnepantla', name: 'Tlalnepantla', lat: 19.5405, lng: -99.1951 },
  { id: 'nezahualcoyotl', name: 'Nezahualcóyotl', lat: 19.4006, lng: -99.0148 },
  { id: 'ecatepec', name: 'Ecatepec', lat: 19.6018, lng: -99.0507 },
];

export const DEFAULT_ZONE_ID = 'benito-juarez';
