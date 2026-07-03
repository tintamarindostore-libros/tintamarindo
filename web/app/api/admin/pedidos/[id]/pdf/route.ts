import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { subirArchivo } from '@/lib/r2'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const formData = await req.formData()
  const file = formData.get('pdf') as File | null
  if (!file || file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Subí un archivo PDF válido' }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const key = `pedidos/${id}/libro.pdf`
  await subirArchivo(key, bytes, 'application/pdf')

  await prisma.pedido.update({
    where: { id },
    data: { pdfUrl: key, pdfSubidoAt: new Date(), estado: 'ESPERANDO_APROBACION' },
  })

  return NextResponse.json({ ok: true })
}
