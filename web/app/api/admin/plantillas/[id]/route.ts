import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { asunto, cuerpo } = await req.json()
  if (typeof cuerpo !== 'string' || !cuerpo.trim()) {
    return NextResponse.json({ error: 'El texto del mensaje no puede estar vacío' }, { status: 400 })
  }

  const plantilla = await prisma.plantillaMensaje.update({
    where: { id },
    data: { cuerpo, asunto: typeof asunto === 'string' ? asunto : null },
  })
  return NextResponse.json({ plantilla })
}
