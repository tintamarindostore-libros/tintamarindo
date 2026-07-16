import { redirect, notFound } from 'next/navigation'
import { checkAdminAccess } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { obtenerUrlFirmada } from '@/lib/r2'
import { formatoFechaHora, diasDesde } from '@/lib/fecha'
import { formatoARS, precioFinalLibro } from '@/lib/precios'
import { PLANTILLAS_CONFIG } from '@/lib/plantillas'
import { calcularAsignacionPagina, esTipoManual, compararPaginasLibro } from '@/lib/paginacion'
import { PedidoDetalle } from './PedidoDetalle'
import { AccesoDenegado } from '../AccesoDenegado'

export default async function AdminPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await checkAdminAccess()
  if (access.status === 'no-session') redirect('/entrar?callbackUrl=/admin')
  if (access.status === 'wrong-email') return <AccesoDenegado email={access.email} volverA="/admin" />

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
  const imagenTapaUrl = pedido.imagenTapaKey ? await obtenerUrlFirmada(pedido.imagenTapaKey) : null

  const plantillas = await prisma.plantillaMensaje.findMany({ orderBy: { clave: 'asc' } })
  const nombreDeClave = Object.fromEntries(PLANTILLAS_CONFIG.map((p) => [p.clave, p.nombre]))
  const camposManualesDeClave = Object.fromEntries(PLANTILLAS_CONFIG.map((p) => [p.clave, p.camposManuales]))

  const diasRestantesAprobacion = pedido.pdfSubidoAt ? Math.max(0, 5 - diasDesde(pedido.pdfSubidoAt)) : null
  const variablesAuto: Record<string, string> = {
    nombre: pedido.nombreCompleto.split(' ')[0],
    codigo: pedido.id.slice(-8).toUpperCase(),
    tamano: pedido.tamano === 'CHICO' ? '24 páginas' : '32 páginas',
    tematicas: [...pedido.tematicas, ...pedido.tematicasPersonalizadas].join(', '),
    monto: formatoARS(precioFinalLibro(pedido.tamano, pedido.medioPago, pedido.cuponDescuentoPorcentaje)),
    link: pdfUrlFirmada ?? '',
    localidad: `${pedido.localidad}, ${pedido.provincia}`,
    tracking: pedido.trackingNumero ?? '',
    diasRestantes: diasRestantesAprobacion !== null ? String(diasRestantesAprobacion) : '',
  }

  return (
    <PedidoDetalle
      pedido={{
        id: pedido.id,
        creadoEn: formatoFechaHora(pedido.createdAt),
        estado: pedido.estado,
        tamano: pedido.tamano,
        tematicas: pedido.tematicas,
        tematicasPersonalizadas: pedido.tematicasPersonalizadas,
        estilos: pedido.estilos,
        tipoPapel: pedido.tipoPapel,
        fotoFamiliarUrl,
        imagenTapaUrl,
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
        cuponCodigo: pedido.cuponCodigo,
        cuponDescuentoPorcentaje: pedido.cuponDescuentoPorcentaje,
        trackingNumero: pedido.trackingNumero,
        pdfUrlFirmada,
        tematicasEfectivas: [...pedido.tematicas, ...pedido.tematicasPersonalizadas],
        situacionesPorTematica: (pedido.situacionesPorTematica as Record<string, string[]> | null) ?? {},
      }}
      fotos={fotosConUrl.map((f) => ({ id: f.id, urlFirmada: f.urlFirmada, seleccionada: f.seleccionada }))}
      imagenesIniciales={[...imagenesConUrl].sort(compararPaginasLibro).map((i) => {
        const tematicasEfectivas = [...pedido.tematicas, ...pedido.tematicasPersonalizadas]
        const manual = esTipoManual(i.tipo)
        const asignacion =
          i.tipo === 'TAPA' || manual || tematicasEfectivas.length === 0
            ? null
            : calcularAsignacionPagina(i.orden, tematicasEfectivas, pedido.estilos)
        return {
          id: i.id,
          orden: i.orden,
          tipo: i.tipo,
          manual,
          tematica: i.tipo === 'TAPA' ? (pedido.estiloTapa ? 'Tapa' : null) : asignacion?.tematica ?? null,
          estilo: i.tipo === 'TAPA' ? pedido.estiloTapa : asignacion?.estilo ?? null,
          aprobada: i.aprobada,
          urlFirmada: i.urlFirmada,
          generada: Boolean(i.url),
          promptExtra: i.promptExtra,
        }
      })}
      plantillas={plantillas.map((p) => ({
        id: p.id,
        clave: p.clave,
        nombre: nombreDeClave[p.clave] ?? p.nombre,
        cuerpo: p.cuerpo,
        camposManuales: camposManualesDeClave[p.clave] ?? [],
      }))}
      variablesAuto={variablesAuto}
    />
  )
}
