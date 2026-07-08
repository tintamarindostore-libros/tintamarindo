import { prisma } from '@/lib/prisma'

export type ResultadoCupon =
  | { valido: true; codigo: string; descuentoPorcentaje: number }
  | { valido: false; error: string }

// Valida un código de cupón (formato, existencia, vigencia y usos disponibles).
// Se usa tanto al mostrarle el descuento al cliente como al confirmar el pedido.
export async function validarCupon(codigoIngresado: string): Promise<ResultadoCupon> {
  const codigo = codigoIngresado.trim().toUpperCase()
  if (!codigo) return { valido: false, error: 'Ingresá un código' }

  const cupon = await prisma.cupon.findUnique({ where: { codigo } })
  if (!cupon || !cupon.activo) return { valido: false, error: 'Cupón inválido o inactivo' }
  if (cupon.usosMaximos !== null && cupon.usosActuales >= cupon.usosMaximos) {
    return { valido: false, error: 'Este cupón ya alcanzó su límite de usos' }
  }

  return { valido: true, codigo: cupon.codigo, descuentoPorcentaje: cupon.descuentoPorcentaje }
}
