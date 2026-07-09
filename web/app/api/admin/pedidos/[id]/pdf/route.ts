import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { subirArchivo } from '@/lib/r2'
import { generarPdfConMarcaDeAgua } from '@/lib/watermark'

// El plan gratuito de Vercel tiene 60s de límite — armar la marca de agua sobre
// un PDF de 20-30 páginas es rápido, pero dejamos margen por si el archivo es grande.
export const maxDuration = 60

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

  try {
    const bytesConMarca = await generarPdfConMarcaDeAgua(bytes)
    const keyMuestra = `pedidos/${id}/libro-muestra.pdf`
    await subirArchivo(keyMuestra, bytesConMarca, 'application/pdf')
  } catch (err) {
    console.error('[pdf] Error al generar la marca de agua:', err)
    return NextResponse.json({ error: 'El PDF se subió pero no se pudo generar la muestra con marca de agua. Probá con otro archivo.' }, { status: 500 })
  }

  await prisma.pedido.update({
    where: { id },
    data: { pdfUrl: key, pdfSubidoAt: new Date(), estado: 'ESPERANDO_APROBACION' },
  })

  return NextResponse.json({ ok: true })
}
