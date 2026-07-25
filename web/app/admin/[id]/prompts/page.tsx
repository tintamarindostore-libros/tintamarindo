import { redirect, notFound } from 'next/navigation'
import { checkAdminAccess } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { calcularAsignacionPagina, esTipoManual } from '@/lib/paginacion'
import { POSE_MODIFIERS, ANGULO_MODIFIERS } from '@/lib/prompts'
import { ArmadorPrompts } from './ArmadorPrompts'
import { AccesoDenegado } from '../../AccesoDenegado'

export default async function ArmadorPromptsPage({ params }: { params: Promise<{ id: string }> }) {
  const access = await checkAdminAccess()
  if (access.status === 'no-session') redirect('/entrar?callbackUrl=/admin')
  if (access.status === 'wrong-email') return <AccesoDenegado email={access.email} volverA="/admin" />

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { imagenes: { orderBy: { orden: 'asc' } } },
  })
  if (!pedido) notFound()

  const tematicasEfectivas = [...pedido.tematicas, ...pedido.tematicasPersonalizadas]
  const situacionesPorTematica = (pedido.situacionesPorTematica as Record<string, string[]> | null) ?? {}

  // Una tarjeta por cada página interior (A/B/C), con el estilo, temática, pose y
  // ángulo que usaría el generador real — respetando los overrides del pedido.
  const paginas = pedido.imagenes
    .filter((img) => img.tipo !== 'TAPA' && !esTipoManual(img.tipo))
    .map((img) => {
      const asignacion =
        tematicasEfectivas.length > 0
          ? calcularAsignacionPagina(img.orden, tematicasEfectivas, pedido.estilos)
          : null
      return {
        key: img.id,
        orden: img.orden,
        etiqueta: `Página ${img.orden + 1}`,
        estilo: img.estilo ?? asignacion?.estilo ?? pedido.estilos[0] ?? 'REALISTA',
        tematica: img.tematica ?? asignacion?.tematica ?? tematicasEfectivas[0] ?? '',
        varianteIndex: asignacion?.varianteIndex ?? 0,
        pose: POSE_MODIFIERS[img.orden % POSE_MODIFIERS.length],
        angulo: ANGULO_MODIFIERS[img.orden % ANGULO_MODIFIERS.length],
        promptExtra: img.promptExtra ?? '',
      }
    })

  const tapaImg = pedido.imagenes.find((img) => img.tipo === 'TAPA')
  const tapa = tapaImg
    ? {
        key: tapaImg.id,
        estilo: tapaImg.estilo ?? pedido.estiloTapa ?? 'REALISTA',
        titulo: pedido.tituloTapa ?? '',
        subtitulo: pedido.subtituloTapa ?? '',
        observaciones: pedido.observacionesTapa ?? '',
        promptExtra: tapaImg.promptExtra ?? '',
      }
    : null

  return (
    <ArmadorPrompts
      pedidoId={pedido.id}
      codigo={pedido.id.slice(-8).toUpperCase()}
      nombre={pedido.nombreCompleto}
      tematicasEfectivas={tematicasEfectivas}
      situacionesPorTematica={situacionesPorTematica}
      paginas={paginas}
      tapa={tapa}
    />
  )
}
