import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { eliminarArchivos } from '@/lib/r2'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { enviada } = await req.json()
  if (typeof enviada !== 'boolean') {
    return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
  }

  const actualizada = await prisma.solicitudLamina.update({
    where: { id },
    data: { enviada },
  })
  return NextResponse.json({ ok: true, enviada: actualizada.enviada })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const solicitud = await prisma.solicitudLamina.findUnique({ where: { id } })
  if (!solicitud) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  await eliminarArchivos([solicitud.fotoKey])
  await prisma.solicitudLamina.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
