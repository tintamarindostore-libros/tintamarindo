import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { calcularAsignacionPagina, esTipoManual, compararPaginasLibro } from '@/lib/paginacion'
import { construirPromptEscena, construirPromptTapa } from '@/lib/prompts'

const SEPARADOR = '='.repeat(60)

// Arma un .txt con el prompt exacto de cada página del libro (el mismo texto
// que usaría el sistema al generar con IA), para que el admin pueda generar
// las imágenes a mano en otra herramienta si no quiere usar la API acá.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { fotos: { orderBy: { orden: 'asc' } }, imagenes: true },
  })
  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const tematicasEfectivas = [...pedido.tematicas, ...pedido.tematicasPersonalizadas]
  const situaciones = pedido.situacionesPorTematica as Record<string, string[]> | null

  const paginas = pedido.imagenes.filter((img) => !esTipoManual(img.tipo)).sort(compararPaginasLibro)

  const bloques = paginas.map((img) => {
    let prompt: string
    let fotoIndicada: string

    if (img.tipo === 'TAPA') {
      prompt = construirPromptTapa({
        estilo: pedido.estiloTapa ?? pedido.estilos[0] ?? 'REALISTA',
        titulo: pedido.tituloTapa,
        subtitulo: pedido.subtituloTapa,
        observaciones: pedido.observacionesTapa,
      })
      fotoIndicada = 'Foto: la que se subió específicamente para la tapa'
    } else {
      const asignacion = calcularAsignacionPagina(img.orden, tematicasEfectivas, pedido.estilos)
      const situacionesManuales = situaciones?.[asignacion.tematica]
      prompt = construirPromptEscena(asignacion.estilo, asignacion.tematica, img.orden, asignacion.varianteIndex, situacionesManuales)
      fotoIndicada =
        pedido.fotos.length > 0
          ? `Foto: la foto Nº ${(img.orden % pedido.fotos.length) + 1} de las ${pedido.fotos.length} que subió el cliente`
          : 'Foto: el pedido no tiene fotos cargadas'
    }

    if (img.promptExtra) prompt += `\n\nINSTRUCCIONES ADICIONALES PARA ESTA IMAGEN: ${img.promptExtra}`

    const titulo = img.tipo === 'TAPA' ? 'TAPA (color)' : `Página ${img.orden + 1}`
    return `${titulo}\n${fotoIndicada}\n${'-'.repeat(40)}\n${prompt}`
  })

  const encabezado = `PROMPTS DEL LIBRO — Pedido #${pedido.id.slice(-8).toUpperCase()} (${pedido.nombreCompleto})

Para usar cada prompt a mano: subí la foto indicada (junto con el texto del
prompt) a la herramienta de generación de imágenes que uses. La tapa va a
color; el resto de las páginas es line art en blanco y negro.

Las páginas que armás vos mismo (retiración de tapa, retiración de contratapa,
contratapa) no tienen prompt y no aparecen en este archivo.

${SEPARADOR}
`

  const contenido = encabezado + bloques.join(`\n\n${SEPARADOR}\n\n`)
  const codigo = pedido.id.slice(-8).toUpperCase()

  return new NextResponse(contenido, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="tintamarindo-${codigo}-prompts.txt"`,
    },
  })
}
