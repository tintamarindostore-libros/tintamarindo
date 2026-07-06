// Precios de lanzamiento — Día del Niño 2026 (ver CLAUDE.md / PRODUCTO.md)
export const PRECIO_LIBRO: Record<string, number> = {
  CHICO: 49900,
  GRANDE: 59900,
}

// Descuento por pago con transferencia bancaria directa (evita retención de fondos de MercadoPago)
export const DESCUENTO_TRANSFERENCIA = 0.1

export function precioTransferencia(tamano: string): number {
  return Math.round(PRECIO_LIBRO[tamano] * (1 - DESCUENTO_TRANSFERENCIA))
}

export function formatoARS(monto: number): string {
  return monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}
