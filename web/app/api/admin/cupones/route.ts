import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const cupones = await prisma.cupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ cupones })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await req.json()
  const codigo = typeof body.codigo === 'string' ? body.codigo.trim().toUpperCase() : ''
  const descuentoPorcentaje = Number(body.descuentoPorcentaje)
  const usosMaximos = body.usosMaximos === '' || body.usosMaximos == null ? null : Number(body.usosMaximos)
  const nota = typeof body.nota === 'string' && body.nota.trim() ? body.nota.trim() : null

  if (!codigo) return NextResponse.json({ error: 'Falta el código' }, { status: 400 })
  if (!Number.isInteger(descuentoPorcentaje) || descuentoPorcentaje < 1 || descuentoPorcentaje > 100) {
    return NextResponse.json({ error: 'El descuento debe ser un % entre 1 y 100' }, { status: 400 })
  }
  if (usosMaximos !== null && (!Number.isInteger(usosMaximos) || usosMaximos < 1)) {
    return NextResponse.json({ error: 'Usos máximos inválido' }, { status: 400 })
  }

  const existente = await prisma.cupon.findUnique({ where: { codigo } })
  if (existente) return NextResponse.json({ error: 'Ya existe un cupón con ese código' }, { status: 400 })

  const cupon = await prisma.cupon.create({
    data: { codigo, descuentoPorcentaje, usosMaximos, nota },
  })
  return NextResponse.json({ cupon })
}
