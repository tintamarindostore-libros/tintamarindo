import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// Tilda/destilda una foto del cliente como usable para generar ilustraciones.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; fotoId: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id, fotoId } = await params
  const { seleccionada } = await req.json()
  if (typeof seleccionada !== 'boolean') {
    return NextResponse.json({ error: 'Falta el valor de selección' }, { status: 400 })
  }

  const foto = await prisma.fotoCliente.findUnique({ where: { id: fotoId } })
  if (!foto || foto.pedidoId !== id) {
    return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 })
  }

  const actualizada = await prisma.fotoCliente.update({ where: { id: fotoId }, data: { seleccionada } })
  return NextResponse.json({ foto: { id: actualizada.id, seleccionada: actualizada.seleccionada } })
}
