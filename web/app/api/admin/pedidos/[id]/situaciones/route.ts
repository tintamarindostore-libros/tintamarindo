import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// Guarda las situaciones puntuales por temática que el admin carga para un
// pedido en particular (ver lib/prompts.ts — se usan en vez del sistema
// automático/genérico cuando están cargadas).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { situacionesPorTematica } = await req.json()

  if (typeof situacionesPorTematica !== 'object' || situacionesPorTematica === null || Array.isArray(situacionesPorTematica)) {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }
  for (const valor of Object.values(situacionesPorTematica)) {
    if (!Array.isArray(valor) || !valor.every((s) => typeof s === 'string')) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data: { situacionesPorTematica },
  })
  return NextResponse.json({ situacionesPorTematica: pedido.situacionesPorTematica })
}
