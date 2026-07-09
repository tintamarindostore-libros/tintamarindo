import { mpPayment } from './mp'
import { prisma } from './prisma'

type ResultadoConfirmacion = { pedidoId: string | null; confirmado: boolean }

// Marca un pedido como pagado si MercadoPago confirma el pago como aprobado.
// Se usa tanto desde el webhook (aviso async de MercadoPago) como desde la
// pantalla de confirmación (chequeo síncrono al volver del checkout), para
// no depender de un solo camino si el webhook no está bien configurado.
export async function confirmarPagoAprobado(paymentId: string | number): Promise<ResultadoConfirmacion> {
  const payment = await mpPayment.get({ id: Number(paymentId) })
  if (payment.status !== 'approved') {
    return { pedidoId: payment.external_reference ?? null, confirmado: false }
  }

  const pedidoId = payment.external_reference
  if (!pedidoId) return { pedidoId: null, confirmado: false }

  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
  if (!pedido) return { pedidoId, confirmado: false }

  // Ya estaba confirmado (por el webhook, o por una visita anterior a esta pantalla)
  if (pedido.estado !== 'ESPERANDO_PAGO') return { pedidoId, confirmado: true }

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { mpPaymentId: String(paymentId), pagadoAt: new Date(), estado: 'ESPERANDO_GENERACION' },
  })

  return { pedidoId, confirmado: true }
}
