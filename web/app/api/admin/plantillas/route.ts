import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const plantillas = await prisma.plantillaMensaje.findMany({ orderBy: { clave: 'asc' } })
  return NextResponse.json({ plantillas })
}
