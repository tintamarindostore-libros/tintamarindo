import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { PLANTILLAS_CONFIG } from '@/lib/plantillas'
import { AccesoDenegado } from '../AccesoDenegado'
import { PlantillasAdmin } from './PlantillasAdmin'

export default async function AdminMensajesPage() {
  const access = await checkAdminAccess()
  if (access.status === 'no-session') redirect('/entrar?callbackUrl=/admin/mensajes')
  if (access.status === 'wrong-email') return <AccesoDenegado email={access.email} volverA="/admin/mensajes" />

  const plantillas = await prisma.plantillaMensaje.findMany({ orderBy: { clave: 'asc' } })
  const nombreDeClave = Object.fromEntries(PLANTILLAS_CONFIG.map((p) => [p.clave, p.nombre]))

  return (
    <div className="min-h-screen bg-stone-950 px-6 py-12" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-3xl mx-auto">
        <a href="/admin" className="text-sm text-stone-500 hover:text-stone-300">← Volver al panel</a>
        <h1 className="text-3xl font-black text-white mt-2 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Mensajes al cliente
        </h1>
        <p className="text-sm text-stone-500 mb-6">
          Estos textos se usan para copiar y pegar (o mandar automáticamente más adelante) en cada etapa del proceso.
          Variables entre llaves dobles, ej. <code className="text-brand-400">{'{{nombre}}'}</code>, se completan solas con los datos de cada pedido.
        </p>
        <PlantillasAdmin
          plantillasIniciales={plantillas.map((p) => ({
            id: p.id,
            clave: p.clave,
            nombre: nombreDeClave[p.clave] ?? p.nombre,
            asunto: p.asunto,
            cuerpo: p.cuerpo,
          }))}
        />
      </div>
    </div>
  )
}
