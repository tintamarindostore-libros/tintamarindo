import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { descargarArchivo, subirArchivo } from '@/lib/r2'
import { generarImagenLibro } from '@/lib/generarImagen'
import { calcularAsignacionPagina } from '@/lib/paginacion'

// Con Vercel Pro el límite de plan sube a 300s — la generación de imágenes con IA
// puede tardar bastante más que los 60s del plan gratuito, sobre todo la tapa a color.
export const maxDuration = 300

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; imgId: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id, imgId } = await params
  const { accion, promptExtra } = await req.json()

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

  if (accion === 'actualizarPrompt') {
    if (typeof promptExtra !== 'string') {
      return NextResponse.json({ error: 'promptExtra inválido' }, { status: 400 })
    }
    const actualizada = await prisma.imagenPedido.update({
      where: { id: imgId },
      data: { promptExtra: promptExtra.trim() || null },
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

    let fotoUrl: string
    let estilo: string
    let tematica: string | undefined
    let varianteIndex = 0
    let situacionesManuales: string[] | undefined

    if (imagen.tipo === 'TAPA') {
      if (!pedido.imagenTapaKey || !pedido.estiloTapa) {
        return NextResponse.json({ error: 'Falta la imagen o el estilo de tapa' }, { status: 400 })
      }
      fotoUrl = pedido.imagenTapaKey
      estilo = pedido.estiloTapa
    } else {
      const tematicasEfectivas = [...pedido.tematicas, ...pedido.tematicasPersonalizadas]
      const asignacion = calcularAsignacionPagina(imagen.orden, tematicasEfectivas, pedido.estilos)
      fotoUrl = pedido.fotos[imagen.orden % pedido.fotos.length].url
      estilo = asignacion.estilo
      tematica = asignacion.tematica
      varianteIndex = asignacion.varianteIndex
      const situaciones = pedido.situacionesPorTematica as Record<string, string[]> | null
      situacionesManuales = situaciones?.[tematica]
    }

    try {
      const { buffer, contentType } = await descargarArchivo(fotoUrl)

      const { base64, prompt } = await generarImagenLibro({
        fotoBase64: buffer.toString('base64'),
        fotoMime: contentType,
        estilo,
        tematica,
        varianteIndex,
        situacionesManuales,
        tipo: imagen.tipo,
        titulo: pedido.tituloTapa,
        subtitulo: pedido.subtituloTapa,
        observaciones: pedido.observacionesTapa,
        promptExtra: imagen.promptExtra,
      })

      const key = imagen.tipo === 'TAPA'
        ? `pedidos/${id}/tapa.png`
        : `pedidos/${id}/pagina-${String(imagen.orden + 1).padStart(2, '0')}.png`
      await subirArchivo(key, Buffer.from(base64, 'base64'), 'image/png')

      const actualizada = await prisma.imagenPedido.update({
        where: { id: imgId },
        data: { url: key, promptUsado: prompt, aprobada: false },
      })

      // Si esta era la última imagen pendiente, el pedido pasa a "En revisión"
      if (pedido.estado === 'ESPERANDO_GENERACION') {
        const pendientes = await prisma.imagenPedido.count({ where: { pedidoId: id, url: null } })
        if (pendientes === 0) {
          await prisma.pedido.update({ where: { id }, data: { estado: 'EN_REVISION' } })
        }
      }

      return NextResponse.json({ imagen: actualizada })
    } catch (err) {
      console.error('[imagenes/regenerar] Error al generar imagen:', err)
      const message = err instanceof Error ? err.message : 'Error inesperado al generar la imagen'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
}
