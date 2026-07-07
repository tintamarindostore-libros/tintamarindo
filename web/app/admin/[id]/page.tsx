import { redirect, notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { obtenerUrlFirmada } from '@/lib/r2'
import { PedidoDetalle } from './PedidoDetalle'

export default async function AdminPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) redirect('/')

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      user: true,
      fotos: { orderBy: { orden: 'asc' } },
      imagenes: { orderBy: { orden: 'asc' } },
    },
  })
  if (!pedido) notFound()

  const fotosConUrl = await Promise.all(
    pedido.fotos.map(async (f) => ({ ...f, urlFirmada: await obtenerUrlFirmada(f.url) })),
  )
  const imagenesConUrl = await Promise.all(
    pedido.imagenes.map(async (img) => ({
      ...img,
      urlFirmada: img.url ? await obtenerUrlFirmada(img.url) : null,
    })),
  )
  const pdfUrlFirmada = pedido.pdfUrl ? await obtenerUrlFirmada(pedido.pdfUrl) : null

  const fotoFamiliarUrl = pedido.fotoFamiliarKey ? await obtenerUrlFirmada(pedido.fotoFamiliarKey) : null

  return (
    <PedidoDetalle
      pedido={{
        id: pedido.id,
        estado: pedido.estado,
        tamano: pedido.tamano,
        tematicas: pedido.tematicas,
        tematicasPersonalizadas: pedido.tematicasPersonalizadas,
        estilos: pedido.estilos,
        tipoPapel: pedido.tipoPapel,
        fotoFamiliarUrl,
        tituloTapa: pedido.tituloTapa,
        subtituloTapa: pedido.subtituloTapa,
        observacionesTapa: pedido.observacionesTapa,
        dedicatoria: pedido.dedicatoria,
        estiloTapa: pedido.estiloTapa,
        nombreCompleto: pedido.nombreCompleto,
        direccion: pedido.direccion,
        codigoPostal: pedido.codigoPostal,
        localidad: pedido.localidad,
        provincia: pedido.provincia,
        telefono: pedido.telefono,
        emailEnvio: pedido.emailEnvio,
        tipoEntrega: pedido.tipoEntrega,
        costoEnvioEstimado: pedido.costoEnvioEstimado,
        medioPago: pedido.medioPago,
        trackingNumero: pedido.trackingNumero,
        pdfUrlFirmada,
      }}
      fotos={fotosConUrl.map((f) => ({ id: f.id, urlFirmada: f.urlFirmada }))}
      imagenesIniciales={imagenesConUrl.map((i) => ({
        id: i.id,
        orden: i.orden,
        tipo: i.tipo,
        aprobada: i.aprobada,
        urlFirmada: i.urlFirmada,
        generada: Boolean(i.url),
        promptExtra: i.promptExtra,
      }))}
    />
  )
}
