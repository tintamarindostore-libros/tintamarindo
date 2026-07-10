import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { subirArchivo } from '@/lib/r2'
import { esTipoManual } from '@/lib/paginacion'

// Sube directamente una imagen ya terminada (retiración de tapa/contratapa, contratapa)
// armada por el admin fuera del sistema — no pasa por generación con IA.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; imgId: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id, imgId } = await params
  const imagen = await prisma.imagenPedido.findUnique({ where: { id: imgId } })
  if (!imagen || imagen.pedidoId !== id) {
    return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
  }
  if (!esTipoManual(imagen.tipo)) {
    return NextResponse.json({ error: 'Esta página se genera automáticamente, no se sube a mano' }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('imagen') as File | null
  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Subí un archivo de imagen válido' }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const extension = file.type === 'image/png' ? 'png' : 'jpg'
  const key = `pedidos/${id}/${imagen.tipo.toLowerCase()}.${extension}`
  await subirArchivo(key, bytes, file.type)

  const actualizada = await prisma.imagenPedido.update({
    where: { id: imgId },
    data: { url: key, aprobada: false },
  })

  // Si esta era la última imagen pendiente (generada o subida a mano), el pedido pasa a "En revisión"
  const pedido = await prisma.pedido.findUnique({ where: { id } })
  if (pedido?.estado === 'ESPERANDO_GENERACION') {
    const pendientes = await prisma.imagenPedido.count({ where: { pedidoId: id, url: null } })
    if (pendientes === 0) {
      await prisma.pedido.update({ where: { id }, data: { estado: 'EN_REVISION' } })
    }
  }

  return NextResponse.json({ imagen: actualizada })
}
