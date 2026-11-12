# Buscarte — MVP frontend

Marketplace para contratar música en vivo en CDMX y área metropolitana.
Experiencia tipo Airbnb, identidad **Electric Pop**, contratación inmediata tipo Uber.

> Todo es frontend con datos simulados. No hay pagos, autenticación, GPS ni chat reales.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción
```

Requiere Node 20+.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 (`@tailwindcss/vite`) · React Router 7 · Lucide.
Sin librerías extra: calendario, sheets, toasts y estado están hechos a mano para no inflar el bundle.

## Estructura

```
src/
  config/platform.ts     Reglas de negocio: comisión 8%, anticipo 30%, minutos de respuesta inmediata
  types/                 Modelo de dominio (Artist, Booking, Package, SearchFilters…)
  data/                  Mock: 14 artistas publicados + 2 en revisión, zonas, categorías, ocasiones, reservas semilla
  services/              Costura para el backend: mockApi (latencia), bookingService, storage (localStorage seguro)
  context/               AppContext (reducer + persistencia), ToastContext
  hooks/                 Selectores, countdown, acciones de solicitudes, carga simulada
  utils/                 Precios, disponibilidad, búsqueda/filtros, geo, formato es-MX, compresión de imágenes
  components/            ui/ (Button, Field, Sheet, Primitives) · brand/ · artist/ · search/ · booking/ · layout/
  layouts/               CustomerLayout (header + bottom nav móvil) · PanelLayout (artista y admin)
  pages/                 customer/ · artist/ · admin/
```

**Para conectar el backend:** reemplazar `services/*` y el reducer de `AppContext` por llamadas HTTP
(p. ej. con TanStack Query). Las páginas ya manejan estados de carga, error y éxito.
Los precios se calculan solo en `utils/pricing.ts`; en producción ese cálculo debe vivir en el servidor.

## Rutas

| Cliente | Artista | Admin |
|---|---|---|
| `/` Home / Discover | `/unete` Onboarding | `/admin` Resumen |
| `/buscar` Resultados + filtros + orden (en la URL) | `/panel` Dashboard | `/admin/revision` Artistas pendientes |
| `/artista/:id` Perfil | `/panel/solicitudes` Aceptar / rechazar | `/admin/usuarios` Suspender / reactivar |
| `/reservar/:id` Flujo de reserva (3 pasos) | `/panel/calendario` Bloquear días | `/admin/reservaciones` Gestión |
| `/reserva/:bookingId` Estado / confirmación | `/panel/perfil` Fotos, info y paquetes | |
| `/ahora` Contratación inmediata | | |
| `/mis-eventos`, `/favoritos` Dashboard cliente | | |

El cambio de rol (Cliente / Artista / Admin) está en el menú del avatar. Ahí mismo se restablecen los datos de la demo.

## Qué es real y qué es simulado

| Funciona de verdad (en el navegador) | Simulado |
|---|---|
| Búsqueda, 8 filtros, 4 ordenamientos, filtros en URL | Pago del anticipo (no se pide tarjeta, no se cobra) |
| Disponibilidad por fecha (bloqueos + reservas) | Distancia: centroides de alcaldía, no GPS |
| Reserva directa vs. por solicitud | Videos: reproductor de vista previa |
| Solicitudes inmediatas que caducan a los 10 min | Mensajes al artista (no hay chat) |
| Aceptar/rechazar con detección de choques de agenda | Fotos de artistas: portadas generativas hasta que suban fotos |
| Onboarding → revisión admin → publicación | Autenticación (la contraseña no se guarda) |
| Subida de fotos (comprimidas a JPEG) | |
| Persistencia en `localStorage` | |

## Estado por sprint

- **Sprint 1 — Design system:** tokens Electric Pop en `index.css` (`@theme`), Manrope + Inter, botones con estados, campos con validación accesible, sheet móvil/modal, toasts, layouts responsive. ✅
- **Sprint 2 — Marketplace:** Home (buscador de 4 campos, categorías, disponibles ahora, ocasiones, populares, destacados), resultados, perfil completo. ✅
- **Sprint 3 — Contratación:** flujo de 3 pasos con calendario, resumen de precios, confirmación, modo inmediato con cuenta regresiva, dashboard de cliente. ✅
- **Sprint 4 — Artista:** onboarding de 3 pasos, dashboard de ingresos, solicitudes, calendario, editor de perfil y paquetes, toggles de disponibilidad. ✅
- **Sprint 5 — Admin y pulido:** KPIs, volumen por categoría, revisión, usuarios, reservaciones. Pruebas e2e en 390 px y 1280 px sin overflow ni errores de consola. ✅

### Pendiente / siguiente iteración

- Backend, autenticación y roles reales (hoy el cambio de rol es libre, por ser demo).
- Pasarela de pagos con retención del anticipo (Stripe Connect / Mercado Pago marketplace / Conekta).
- Chat cliente–artista y notificaciones push/WhatsApp para solicitudes inmediatas.
- Geolocalización real (Google Places / Mapbox) y tiempo de llegada por tráfico.
- Reseñas creadas solo por clientes con evento realizado.
- Expiración automática de "Disponible ahora" (ver recomendaciones).
- Tests automatizados en el repo (Vitest + Playwright) y analítica de embudo.

## Recomendaciones de producto

1. **Fuga fuera de la plataforma es el riesgo #1 con un 8%.** Si cliente y artista se conocen en Buscarte y cierran por WhatsApp, la comisión se pierde. Ya implementado: el teléfono del artista solo se muestra con reserva confirmada y el formulario de contacto bloquea teléfonos/correos. Siguiente paso: que el valor de quedarse sea claro (anticipo protegido, reembolso si el artista no llega, reseñas verificadas).
2. **Cobrar la comisión del anticipo.** Con anticipo de 30% y comisión de 8% del total, la comisión cabe siempre dentro de lo que la plataforma retiene. Así no dependes de que el resto se pague dentro de la app.
3. **"Disponible ahora" debe caducar.** Un artista que activa la opción a las 6 p. m. y se olvida genera solicitudes que no responde, y eso rompe la confianza en el modo inmediato. Propuesta: expiración a las 4 horas con recordatorio para renovar, y bajar en el ranking a quien deja caducar solicitudes.
4. **Lanzar el modo inmediato acotado.** Con pocos artistas activos, la pantalla vacía es la peor primera impresión. Recomiendo arrancar con mariachis y norteños (el caso natural de "lo necesito hoy") en 3–4 alcaldías centrales y medir tasa de aceptación antes de abrir todo.
5. **Precio de banda sinaloense.** Las bandas grandes ($18k–$52k) distorsionan el filtro "desde"; conviene mostrar también precio por hora o por músico en esa categoría.

## Riesgos técnicos

- `localStorage` tiene ~5 MB: las fotos se comprimen a ~900 px, pero muchas fotos pueden llenar la cuota (el guardado falla en silencio sin romper la app).
- Distancias por centroide de alcaldía: alcaldías grandes (Iztapalapa, Tlalpan) pueden variar varios km.
- Las versiones de `package.json` no se pudieron instalar en el entorno donde se escribió el código (sin red). El código se verificó con TypeScript estricto y un bundle de prueba; si `npm install` resuelve versiones más nuevas con cambios, revisar primero `react-router-dom` y `lucide-react`.
