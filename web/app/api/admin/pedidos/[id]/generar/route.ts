import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { descargarArchivo, subirArchivo } from '@/lib/r2'
import { generarImagenLibro } from '@/lib/generarImagen'
import { calcularAsignacionPagina, esTipoManual } from '@/lib/paginacion'

// Con Vercel Pro el límite de plan sube a 300s — la generación de imágenes con IA
// puede tardar bastante más que los 60s del plan gratuito, sobre todo la tapa a color.
export const maxDuration = 300

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { fotos: { orderBy: { orden: 'asc' } }, imagenes: { orderBy: { orden: 'asc' } } },
  })
  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  if (pedido.fotos.length === 0) return NextResponse.json({ error: 'El pedido no tiene fotos' }, { status: 400 })

  const siguiente = pedido.imagenes.find((img) => !img.url && !esTipoManual(img.tipo))
  if (!siguiente) {
    const faltanManuales = pedido.imagenes.some((img) => !img.url && esTipoManual(img.tipo))
    let estadoFinal = pedido.estado
    if (pedido.estado === 'ESPERANDO_GENERACION' && !faltanManuales) {
      const actualizado = await prisma.pedido.update({ where: { id }, data: { estado: 'EN_REVISION' } })
      estadoFinal = actualizado.estado
    }
    return NextResponse.json({ done: true, estado: estadoFinal, faltanManuales })
  }

  let fotoUrl: string
  let estilo: string
  let tematica: string | undefined
  let varianteIndex = 0
  let situacionesManuales: string[] | undefined

  if (siguiente.tipo === 'TAPA') {
    if (!pedido.imagenTapaKey || !pedido.estiloTapa) {
      return NextResponse.json({ error: 'Falta la imagen o el estilo de tapa' }, { status: 400 })
    }
    fotoUrl = pedido.imagenTapaKey
    estilo = pedido.estiloTapa
  } else {
    const tematicasEfectivas = [...pedido.tematicas, ...pedido.tematicasPersonalizadas]
    const asignacion = calcularAsignacionPagina(siguiente.orden, tematicasEfectivas, pedido.estilos)
    fotoUrl = pedido.fotos[siguiente.orden % pedido.fotos.length].url
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
      tipo: siguiente.tipo,
      titulo: pedido.tituloTapa,
      subtitulo: pedido.subtituloTapa,
      observaciones: pedido.observacionesTapa,
      promptExtra: siguiente.promptExtra,
    })

    const key = siguiente.tipo === 'TAPA'
      ? `pedidos/${id}/tapa.png`
      : `pedidos/${id}/pagina-${String(siguiente.orden + 1).padStart(2, '0')}.png`
    await subirArchivo(key, Buffer.from(base64, 'base64'), 'image/png')

    const actualizada = await prisma.imagenPedido.update({
      where: { id: siguiente.id },
      data: { url: key, promptUsado: prompt },
    })

    return NextResponse.json({ done: false, imagen: { id: actualizada.id, orden: actualizada.orden } })
  } catch (err) {
    console.error('[generar] Error al generar imagen:', err)
    const message = err instanceof Error ? err.message : 'Error inesperado al generar la imagen'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
