import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { eliminarArchivos } from '@/lib/r2'
import { precioFinalLibro } from '@/lib/precios'

// Borra un pedido de prueba: guarda antes un snapshot de los datos del comprador
// en CompradorHistorial, borra todos los archivos en R2 (fotos, imágenes generadas,
// PDFs) y por último el pedido — Prisma cascadea el borrado de FotoCliente/ImagenPedido.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { fotos: true, imagenes: true },
  })
  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  await prisma.compradorHistorial.create({
    data: {
      pedidoIdOriginal: pedido.id,
      nombreCompleto: pedido.nombreCompleto,
      email: pedido.emailEnvio,
      telefono: pedido.telefono,
      direccion: pedido.direccion,
      codigoPostal: pedido.codigoPostal,
      localidad: pedido.localidad,
      provincia: pedido.provincia,
      tamano: pedido.tamano,
      tematicas: [...pedido.tematicas, ...pedido.tematicasPersonalizadas],
      medioPago: pedido.medioPago,
      montoARS: precioFinalLibro(pedido.tamano, pedido.medioPago, pedido.cuponDescuentoPorcentaje),
      pedidoCreadoEn: pedido.createdAt,
    },
  })

  const keys: string[] = [
    ...pedido.fotos.map((f) => f.url),
    ...pedido.imagenes.filter((i): i is typeof i & { url: string } => Boolean(i.url)).map((i) => i.url),
  ]
  if (pedido.imagenTapaKey) keys.push(pedido.imagenTapaKey)
  if (pedido.fotoFamiliarKey) keys.push(pedido.fotoFamiliarKey)
  if (pedido.pdfUrl) {
    keys.push(pedido.pdfUrl)
    keys.push(pedido.pdfUrl.replace(/\/libro\.pdf$/, '/libro-muestra.pdf'))
  }

  await eliminarArchivos(keys)
  await prisma.pedido.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
