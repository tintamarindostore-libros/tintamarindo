import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// Activa/desactiva un cupón (no se borra, para conservar el historial de pedidos que lo usaron)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { activo } = await req.json()
  if (typeof activo !== 'boolean') {
    return NextResponse.json({ error: 'Falta el estado activo' }, { status: 400 })
  }

  const cupon = await prisma.cupon.update({ where: { id }, data: { activo } })
  return NextResponse.json({ cupon })
}
