import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { trackingNumero } = await req.json()
  if (!trackingNumero || typeof trackingNumero !== 'string' || !trackingNumero.trim()) {
    return NextResponse.json({ error: 'Falta el número de tracking' }, { status: 400 })
  }

  await prisma.pedido.update({
    where: { id },
    data: { trackingNumero: trackingNumero.trim(), despachadoAt: new Date(), estado: 'ENVIADO' },
  })

  return NextResponse.json({ ok: true })
}
