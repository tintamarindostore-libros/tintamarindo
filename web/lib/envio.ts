// Costo de envío — interino mientras Correo Argentino no habilita el acceso a
// la API de MiCorreo (cuenta registrada, en trámite comercial, todavía sin
// resolución). Hasta tener tarifas reales no se cobra ningún monto de envío
// en el checkout: se confirma el costo real por WhatsApp o email antes de
// despachar el pedido, y se cobra aparte en ese momento.
//
// Los precios de abajo quedan comentados como referencia para cuando se pueda
// reactivar la cotización automática por zona.
//
// const PRECIO_ENVIO: Record<Zona, { sucursal: number; domicilio: number | null }> = {
//   CABA: { sucursal: 5500, domicilio: 8500 },
//   INTERIOR: { sucursal: 6600, domicilio: null },
//   PATAGONIA: { sucursal: 7500, domicilio: null },
// }

export type TipoEntrega = 'SUCURSAL' | 'DOMICILIO'

// Devuelve siempre null (costo "a confirmar") hasta tener acceso a la API de MiCorreo.
export function estimarEnvio(_provincia: string, _tipoEntrega: TipoEntrega): number | null {
  return null
}
