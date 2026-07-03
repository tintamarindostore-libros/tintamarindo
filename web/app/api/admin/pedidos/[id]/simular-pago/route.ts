import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// Solo disponible en desarrollo — simula la confirmación de pago para testear sin MP
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 })
  }

  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({ where: { id } })

  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  if (pedido.estado !== 'ESPERANDO_PAGO') {
    return NextResponse.json({ error: `El pedido ya está en estado ${pedido.estado}` }, { status: 400 })
  }

  await prisma.pedido.update({
    where: { id },
    data: {
      estado: 'ESPERANDO_GENERACION',
      mpPaymentId: 'TEST-SIMULADO',
      pagadoAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true, estado: 'ESPERANDO_GENERACION' })
}
