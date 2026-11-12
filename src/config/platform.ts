/**
 * Reglas de negocio centralizadas. Cuando exista backend, estos valores
 * deben venir de una API de configuración para poder cambiarlos sin deploy.
 */
export const PLATFORM = {
  name: 'Buscarte',
  market: 'Ciudad de México y área metropolitana',
  currency: 'MXN',
  locale: 'es-MX',
  /** Comisión que se descuenta al artista por contratación exitosa. */
  artistCommissionRate: 0.08,
  /** Comisión que paga el cliente. 0% en el modelo inicial. */
  customerFeeRate: 0,
  /** Anticipo simulado que el cliente aparta al reservar. */
  depositRate: 0.3,
  /** Minutos que un artista tiene para responder una solicitud inmediata. */
  instantResponseMinutes: 10,
  /** Anticipación mínima (horas) para una contratación inmediata. */
  instantMinLeadHours: 1,
} as const;
