import { PLATFORM } from '../config/platform';
import type { Artist, Package } from '../types';

export interface PriceBreakdown {
  packagePrice: number;
  extraHours: number;
  extraHoursPrice: number;
  subtotal: number;
  customerFee: number;
  total: number;
  deposit: number;
  remaining: number;
  artistCommission: number;
  artistPayout: number;
}

/**
 * Cálculo único de precios para cliente y artista.
 * El cliente no paga comisión (customerFeeRate = 0); al artista se le descuenta el 8%.
 */
export function calculatePrice(artist: Artist, pkg: Package, extraHours = 0): PriceBreakdown {
  const extraHoursPrice = Math.max(0, extraHours) * artist.extraHourPrice;
  const subtotal = pkg.price + extraHoursPrice;
  const customerFee = Math.round(subtotal * PLATFORM.customerFeeRate);
  const total = subtotal + customerFee;
  const deposit = Math.round(total * PLATFORM.depositRate);
  const artistCommission = Math.round(subtotal * PLATFORM.artistCommissionRate);
  return {
    packagePrice: pkg.price,
    extraHours,
    extraHoursPrice,
    subtotal,
    customerFee,
    total,
    deposit,
    remaining: total - deposit,
    artistCommission,
    artistPayout: subtotal - artistCommission,
  };
}

export const startingPrice = (artist: Artist) =>
  artist.packages.length ? Math.min(...artist.packages.map((p) => p.price)) : 0;

export const percent = (rate: number) => `${Math.round(rate * 100)}%`;
