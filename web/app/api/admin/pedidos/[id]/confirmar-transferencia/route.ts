import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { notificarPedidoPagado } from '@/lib/notificarPedido'

// El admin confirma a mano que la transferencia bancaria se acreditó
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({ where: { id } })

  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  if (pedido.medioPago !== 'TRANSFERENCIA') {
    return NextResponse.json({ error: 'Este pedido no es por transferencia' }, { status: 400 })
  }
  if (pedido.estado !== 'ESPERANDO_PAGO') {
    return NextResponse.json({ error: `El pedido ya está en estado ${pedido.estado}` }, { status: 400 })
  }

  await prisma.pedido.update({
    where: { id },
    data: {
      estado: 'ESPERANDO_GENERACION',
      pagadoAt: new Date(),
    },
  })

  await notificarPedidoPagado(pedido)

  return NextResponse.json({ ok: true, estado: 'ESPERANDO_GENERACION' })
}
