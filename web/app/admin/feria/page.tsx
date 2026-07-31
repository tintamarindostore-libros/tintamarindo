import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { obtenerUrlFirmada } from '@/lib/r2'
import { formatoFechaHora } from '@/lib/fecha'
import { AccesoDenegado } from '../AccesoDenegado'
import { SolicitudesFeria } from './SolicitudesFeria'

export default async function AdminFeriaPage() {
  const access = await checkAdminAccess()
  if (access.status === 'no-session') redirect('/entrar?callbackUrl=/admin/feria')
  if (access.status === 'wrong-email') return <AccesoDenegado email={access.email} volverA="/admin/feria" />

  const solicitudes = await prisma.solicitudLamina.findMany({ orderBy: { createdAt: 'desc' } })
  const conUrl = await Promise.all(
    solicitudes.map(async (s) => ({
      id: s.id,
      nombre: s.nombre,
      tematica: s.tematica,
      whatsapp: s.whatsapp,
      enviada: s.enviada,
      creadoEn: formatoFechaHora(s.createdAt),
      fotoUrl: await obtenerUrlFirmada(s.fotoKey),
    })),
  )

  const pendientes = conUrl.filter((s) => !s.enviada).length

  return (
    <div className="min-h-screen bg-stone-950 px-6 py-12" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-4xl mx-auto">
        <a href="/admin" className="text-sm text-stone-500 hover:text-stone-300">← Volver al panel</a>
        <h1 className="text-3xl font-black text-white mt-2 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Láminas de la Feria
        </h1>
        <p className="text-sm text-stone-500 mb-6">
          {conUrl.length} solicitud{conUrl.length === 1 ? '' : 'es'} · {pendientes} pendiente{pendientes === 1 ? '' : 's'} de enviar
        </p>
        <SolicitudesFeria solicitudesIniciales={conUrl} />
      </div>
    </div>
  )
}
