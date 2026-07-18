import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// Guarda las notas internas del admin para un pedido (privadas, no las ve el cliente).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { notasAdmin } = await req.json()
  if (typeof notasAdmin !== 'string') {
    return NextResponse.json({ error: 'Notas inválidas' }, { status: 400 })
  }

  const pedido = await prisma.pedido.findUnique({ where: { id }, select: { id: true } })
  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  await prisma.pedido.update({ where: { id }, data: { notasAdmin: notasAdmin.trim() || null } })
  return NextResponse.json({ ok: true })
}
