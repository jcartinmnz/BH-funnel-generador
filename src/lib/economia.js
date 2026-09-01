/**
 * TODA la matemática del generador vive acá. Determinista, sin IA.
 * El modelo escribe texto; los números salen de estas funciones.
 * Ver docs/estrategia-funnels.md
 */

export const crc = (v) => "₡" + Math.round(v || 0).toLocaleString("es-CR");

/** Semana ISO del año — usada para versionar códigos y campañas. */
export function semanaISO(fecha = new Date()) {
  const t = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y0) / 86400000 + 1) / 7);
}

/**
 * Economía de una promoción.
 * @param {Array} articulos  [{ precio, costo, cantidad }]
 * @param {number|null} precioPromo  precio de paquete; null = suma de carta
 * @param {number} pauta
 * @param {number} costoContenido
 */
export function calcularEconomia(articulos, precioPromo, pauta, costoContenido) {
  const sumaCarta = articulos.reduce(
    (s, a) => s + Number(a.precio) * Number(a.cantidad || 1), 0);
  const costoTotal = articulos.reduce(
    (s, a) => s + Number(a.costo) * Number(a.cantidad || 1), 0);

  const precioEfectivo = precioPromo == null ? sumaCarta : Number(precioPromo);
  const gpPromo = precioEfectivo - costoTotal;
  const descuento = sumaCarta - precioEfectivo;
  const descuentoPct = sumaCarta > 0 ? (descuento / sumaCarta) * 100 : 0;
  const foodCost = precioEfectivo > 0 ? (costoTotal / precioEfectivo) * 100 : 0;

  const inversion = Number(pauta) + Number(costoContenido);
  const breakEven = gpPromo > 0 ? Math.ceil(inversion / gpPromo) : null;

  const escenarios = !breakEven ? [] : [
    { nombre: "Piso", conv: breakEven },
    { nombre: "Meta", conv: breakEven * 2 },
    { nombre: "Techo", conv: Math.ceil(breakEven * 3.5) },
  ].map((e) => ({
    ...e,
    ingreso: e.conv * precioEfectivo,
    gp: e.conv * gpPromo,
    roi: ((e.conv * gpPromo - inversion) / inversion) * 100,
  }));

  return { sumaCarta, costoTotal, precioEfectivo, gpPromo, descuento,
           descuentoPct, foodCost, inversion, breakEven, escenarios };
}

/** Alerta financiera. null = todo bien. */
export function evaluarRiesgo(eco) {
  if (eco.gpPromo <= 0)
    return "El precio de promoción no cubre el costo. Vas a perder plata por cada venta.";
  if (eco.foodCost > 45)
    return `Food cost en ${eco.foodCost.toFixed(0)}%. Arriba de 45% la promo deja de tener sentido financiero.`;
  return null;
}

/** Métricas reales de un funnel ya ejecutado. */
export function metricasReales(registro) {
  const conv = Number(registro.conversiones) || 0;
  const conversaciones = Number(registro.conversaciones) || 0;
  const margen = conv * Number(registro.gpPromo || 0);
  const inversion = Number(registro.inversion) || 0;
  return {
    conv, conversaciones, margen,
    roi: inversion > 0 ? ((margen - inversion) / inversion) * 100 : 0,
    cpConversacion: conversaciones > 0 ? Number(registro.pauta) / conversaciones : null,
    cpConversion: conv > 0 ? inversion / conv : null,
    tasa: conversaciones > 0 ? (conv / conversaciones) * 100 : null,
    medido: conv > 0 || conversaciones > 0,
  };
}

/** Código de redención único por promo y semana. Ej: BIRRIA34 */
export function generarCodigo(nombre, fecha = new Date()) {
  const base = (nombre || "PROMO")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) || "PROMO";
  return `${base}${semanaISO(fecha)}`;
}

export function generarUTM(objetivo, codigo, fecha = new Date()) {
  return `?utm_source=ig&utm_medium=manychat&utm_campaign=${objetivo}-s${semanaISO(fecha)}&utm_content=${codigo.toLowerCase()}`;
}
