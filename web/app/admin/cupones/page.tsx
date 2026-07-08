import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { CuponesAdmin } from './CuponesAdmin'
import { AccesoDenegado } from '../AccesoDenegado'

export default async function AdminCuponesPage() {
  const access = await checkAdminAccess()
  if (access.status === 'no-session') redirect('/entrar?callbackUrl=/admin/cupones')
  if (access.status === 'wrong-email') return <AccesoDenegado email={access.email} volverA="/admin/cupones" />

  const cupones = await prisma.cupon.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="min-h-screen bg-[#FEF9F0] px-6 py-12" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-stone-800 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Cupones de descuento
        </h1>
        <CuponesAdmin
          cuponesIniciales={cupones.map((c) => ({
            id: c.id,
            codigo: c.codigo,
            descuentoPorcentaje: c.descuentoPorcentaje,
            activo: c.activo,
            usosMaximos: c.usosMaximos,
            usosActuales: c.usosActuales,
            nota: c.nota,
          }))}
        />
      </div>
    </div>
  )
}
