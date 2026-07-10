import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { descargarArchivo } from '@/lib/r2'
import { compararPaginasLibro, LABEL_TIPO_MANUAL } from '@/lib/paginacion'

export const maxDuration = 120

function nombreArchivo(tipo: string, orden: number, extension: string): string {
  if (tipo === 'TAPA') return `tapa${extension}`
  if (tipo in LABEL_TIPO_MANUAL) {
    // Sin tildes en el nombre del archivo — evita problemas con extractores de zip viejos.
    const base = LABEL_TIPO_MANUAL[tipo]
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
    return `${base}${extension}`
  }
  return `pagina-${String(orden + 1).padStart(2, '0')}${extension}`
}

// Junta todas las imágenes del pedido (tapa, retiración de tapa/contratapa,
// contratapa y páginas interiores) en un .zip, numeradas en el orden físico
// real del libro, para armar el PDF final a mano fuera del sistema.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { imagenes: { where: { url: { not: null } } } },
  })
  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  if (pedido.imagenes.length === 0) {
    return NextResponse.json({ error: 'Todavía no hay imágenes subidas ni generadas' }, { status: 400 })
  }

  const ordenadas = [...pedido.imagenes].sort(compararPaginasLibro)

  const zip = new JSZip()
  for (let i = 0; i < ordenadas.length; i++) {
    const img = ordenadas[i]
    const { buffer, contentType } = await descargarArchivo(img.url!)
    const extension = contentType === 'image/png' ? '.png' : contentType === 'image/jpeg' ? '.jpg' : ''
    const nombre = `${String(i + 1).padStart(2, '0')}-${nombreArchivo(img.tipo, img.orden, extension)}`
    zip.file(nombre, buffer)
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
  const codigo = pedido.id.slice(-8).toUpperCase()

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="tintamarindo-${codigo}-imagenes.zip"`,
    },
  })
}
