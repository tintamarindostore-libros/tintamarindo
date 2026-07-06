// Estimación de envío por zona — interino mientras Correo Argentino no habilita
// el acceso a la API de MiCorreo (cuenta registrada, en trámite comercial).
// El costo real a domicilio en Interior y Patagonia no está definido todavía:
// se confirma por WhatsApp o email antes de despachar el pedido.

export type TipoEntrega = 'SUCURSAL' | 'DOMICILIO'

type Zona = 'CABA' | 'PATAGONIA' | 'INTERIOR'

const PROVINCIAS_PATAGONIA = ['Chubut', 'Neuquén', 'Río Negro', 'Santa Cruz', 'Tierra del Fuego']

function zonaDeProvincia(provincia: string): Zona {
  if (provincia === 'CABA') return 'CABA'
  if (PROVINCIAS_PATAGONIA.includes(provincia)) return 'PATAGONIA'
  return 'INTERIOR'
}

const PRECIO_ENVIO: Record<Zona, { sucursal: number; domicilio: number | null }> = {
  CABA: { sucursal: 5500, domicilio: 8500 },
  INTERIOR: { sucursal: 6600, domicilio: null },
  PATAGONIA: { sucursal: 7500, domicilio: null },
}

// Devuelve el costo estimado, o null si todavía no hay un precio de domicilio para esa zona
// (en ese caso se debe mostrar "a confirmar" en vez de un monto).
export function estimarEnvio(provincia: string, tipoEntrega: TipoEntrega): number | null {
  const zona = zonaDeProvincia(provincia)
  return PRECIO_ENVIO[zona][tipoEntrega === 'SUCURSAL' ? 'sucursal' : 'domicilio']
}
