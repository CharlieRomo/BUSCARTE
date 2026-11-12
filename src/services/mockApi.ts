/**
 * Capa de servicios simulada.
 * Hoy solo agrega latencia realista para mostrar estados de carga.
 * Cuando exista backend, cada función se reemplaza por una llamada HTTP
 * sin tocar las páginas, que ya manejan loading / error / success.
 */
import type { Booking } from '../types';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class ApiError extends Error {}

export const mockApi = {
  async load<T>(fn: () => T, ms = 450): Promise<T> {
    await wait(ms);
    return fn();
  },

  /** Simula la autorización del anticipo. No se cobra nada real. */
  async authorizeDeposit(booking: Pick<Booking, 'deposit'>, method: string): Promise<{ reference: string }> {
    await wait(1100);
    if (booking.deposit <= 0) throw new ApiError('El anticipo debe ser mayor a cero.');
    if (method === 'unavailable') throw new ApiError('Este método de pago aún no está disponible.');
    return { reference: `SIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}` };
  },

  async sendMessage(): Promise<void> {
    await wait(700);
  },

  async save(): Promise<void> {
    await wait(500);
  },
};
