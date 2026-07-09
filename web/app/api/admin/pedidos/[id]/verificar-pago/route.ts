import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { confirmarPagoAprobado } from '@/lib/confirmarPago'

// Herramienta de recuperación: por si el webhook de MercadoPago no llegó y el
// cliente no volvió a pasar por la pantalla de confirmación, el admin puede
// pegar acá el ID del pago (aparece en el detalle de la operación en MercadoPago)
// y se verifica/confirma manualmente contra la API real de MP.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { paymentId } = await req.json()
  if (!paymentId || typeof paymentId !== 'string') {
    return NextResponse.json({ error: 'Falta el ID del pago' }, { status: 400 })
  }

  const resultado = await confirmarPagoAprobado(paymentId)

  if (resultado.pedidoId !== id) {
    return NextResponse.json(
      { error: `Ese pago corresponde a otro pedido (${resultado.pedidoId ?? 'desconocido'}), no a este.` },
      { status: 400 },
    )
  }
  if (!resultado.confirmado) {
    return NextResponse.json(
      { error: `MercadoPago dice que este pago está "${resultado.mpStatus ?? 'desconocido'}", no aprobado.` },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true })
}
