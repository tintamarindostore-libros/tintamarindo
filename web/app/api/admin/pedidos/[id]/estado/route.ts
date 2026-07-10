import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { ESTADOS_PEDIDO } from '@/lib/estados'

// Override manual del estado del pedido — para saltar entre etapas del flujo
// sin depender de que se cumplan las condiciones automáticas (útil para
// pruebas, o para corregir un pedido que quedó mal encasillado).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { estado } = await req.json()
  if (!(ESTADOS_PEDIDO as readonly string[]).includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const actualizado = await prisma.pedido.update({ where: { id }, data: { estado } })
  return NextResponse.json({ estado: actualizado.estado })
}
