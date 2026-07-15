import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { descargarArchivo, subirArchivo, obtenerUrlFirmada } from '@/lib/r2'
import sharp from 'sharp'

// Recorta una foto del cliente a partir de un rectángulo elegido en el admin (x, y, w, h
// como fracciones 0–1 del tamaño original) y reemplaza la foto por la versión recortada.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; fotoId: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id, fotoId } = await params
  const { x, y, w, h } = await req.json()
  if ([x, y, w, h].some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
    return NextResponse.json({ error: 'Recorte inválido' }, { status: 400 })
  }
  if (w <= 0 || h <= 0) {
    return NextResponse.json({ error: 'El recorte no puede tener ancho o alto cero' }, { status: 400 })
  }

  const foto = await prisma.fotoCliente.findUnique({ where: { id: fotoId } })
  if (!foto || foto.pedidoId !== id) {
    return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 })
  }

  const { buffer } = await descargarArchivo(foto.url)
  const imagen = sharp(buffer).rotate() // aplica la orientación EXIF antes de recortar (fotos de celular)
  const metadata = await imagen.metadata()
  const anchoOriginal = metadata.width ?? 0
  const altoOriginal = metadata.height ?? 0
  if (!anchoOriginal || !altoOriginal) {
    return NextResponse.json({ error: 'No se pudo leer la imagen original' }, { status: 500 })
  }

  const left = Math.max(0, Math.min(anchoOriginal - 1, Math.round(x * anchoOriginal)))
  const top = Math.max(0, Math.min(altoOriginal - 1, Math.round(y * altoOriginal)))
  const width = Math.max(1, Math.min(anchoOriginal - left, Math.round(w * anchoOriginal)))
  const height = Math.max(1, Math.min(altoOriginal - top, Math.round(h * altoOriginal)))

  const recortada = await imagen.extract({ left, top, width, height }).jpeg({ quality: 92 }).toBuffer()

  const key = `pedidos/${id}/fotos/${fotoId}-${Date.now()}.jpg`
  await subirArchivo(key, recortada, 'image/jpeg')

  const actualizada = await prisma.fotoCliente.update({ where: { id: fotoId }, data: { url: key } })
  const urlFirmada = await obtenerUrlFirmada(actualizada.url)

  return NextResponse.json({ foto: { id: actualizada.id, urlFirmada } })
}
