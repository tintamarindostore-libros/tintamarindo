import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { descargarArchivo, subirArchivo } from '@/lib/r2'
import { generarImagenLibro } from '@/lib/generarImagen'

export const maxDuration = 60

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; imgId: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id, imgId } = await params
  const { accion } = await req.json()

  const imagen = await prisma.imagenPedido.findUnique({ where: { id: imgId } })
  if (!imagen || imagen.pedidoId !== id) {
    return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
  }

  if (accion === 'aprobar' || accion === 'desaprobar') {
    const actualizada = await prisma.imagenPedido.update({
      where: { id: imgId },
      data: { aprobada: accion === 'aprobar' },
    })
    return NextResponse.json({ imagen: actualizada })
  }

  if (accion === 'regenerar') {
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: { fotos: { orderBy: { orden: 'asc' } } },
    })
    if (!pedido || pedido.fotos.length === 0) {
      return NextResponse.json({ error: 'El pedido no tiene fotos' }, { status: 400 })
    }

    const foto = pedido.fotos[imagen.orden % pedido.fotos.length]
    const { buffer, contentType } = await descargarArchivo(foto.url)

    const tematicasEfectivas = pedido.tematicaPersonalizada
      ? [...pedido.tematicas, pedido.tematicaPersonalizada]
      : pedido.tematicas

    const { base64, prompt } = await generarImagenLibro({
      fotoBase64: buffer.toString('base64'),
      fotoMime: contentType,
      estilo: pedido.estilos[imagen.orden % pedido.estilos.length] ?? pedido.estilos[0],
      tematica: tematicasEfectivas[imagen.orden % tematicasEfectivas.length] ?? tematicasEfectivas[0],
      tipo: imagen.tipo,
    })

    const key = `pedidos/${id}/pagina-${String(imagen.orden + 1).padStart(2, '0')}.png`
    await subirArchivo(key, Buffer.from(base64, 'base64'), 'image/png')

    const actualizada = await prisma.imagenPedido.update({
      where: { id: imgId },
      data: { url: key, promptUsado: prompt, aprobada: false },
    })
    return NextResponse.json({ imagen: actualizada })
  }

  return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
}
