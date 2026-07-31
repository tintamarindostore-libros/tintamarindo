// Precios del libro. Subidos 15% el 2026-07-28 al terminar la etapa de
// lanzamiento (antes: 49.900 / 59.900). Ver CLAUDE.md / PRODUCTO.md.
export const PRECIO_LIBRO: Record<string, number> = {
  CHICO: 57900,
  GRANDE: 68900,
}

// Descuento por pago con transferencia bancaria directa (evita retención de fondos de MercadoPago)
export const DESCUENTO_TRANSFERENCIA = 0.1

export function precioTransferencia(tamano: string): number {
  return Math.round(PRECIO_LIBRO[tamano] * (1 - DESCUENTO_TRANSFERENCIA))
}

export function formatoARS(monto: number): string {
  return monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

// Precio final del libro para un pedido puntual: aplica el descuento por
// transferencia y, si corresponde, el descuento del cupón sobre ese monto.
export function precioFinalLibro(
  tamano: string,
  medioPago: string,
  cuponDescuentoPorcentaje: number | null,
): number {
  const base = medioPago === 'TRANSFERENCIA' ? precioTransferencia(tamano) : PRECIO_LIBRO[tamano]
  if (!cuponDescuentoPorcentaje) return base
  return Math.round(base * (1 - cuponDescuentoPorcentaje / 100))
}
