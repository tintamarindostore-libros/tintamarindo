import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { formatoFechaHora } from '@/lib/fecha'
import { formatoARS } from '@/lib/precios'
import { AccesoDenegado } from '../AccesoDenegado'

export default async function AdminCompradoresPage() {
  const access = await checkAdminAccess()
  if (access.status === 'no-session') redirect('/entrar?callbackUrl=/admin/compradores')
  if (access.status === 'wrong-email') return <AccesoDenegado email={access.email} volverA="/admin/compradores" />

  const registros = await prisma.compradorHistorial.findMany({ orderBy: { eliminadoEn: 'desc' } })

  return (
    <div className="min-h-screen bg-stone-950 px-6 py-12" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-5xl mx-auto">
        <a href="/admin" className="text-sm text-stone-500 hover:text-stone-300">← Volver al panel</a>
        <h1 className="text-3xl font-black text-white mt-2 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Compradores
        </h1>
        <p className="text-sm text-stone-500 mb-6">
          Datos de compradores cuyo pedido fue eliminado del panel (pruebas, etc.) — se guardan acá para no perder el registro del contacto.
        </p>

        {registros.length === 0 ? (
          <p className="text-sm text-stone-500">Todavía no hay registros.</p>
        ) : (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-500 uppercase tracking-widest border-b border-stone-800">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Dirección</th>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Eliminado</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r, i) => (
                  <tr key={r.id} className={['border-b border-stone-800 last:border-0', i % 2 === 1 ? 'bg-stone-800/50' : ''].join(' ')}>
                    <td className="px-4 py-3 text-white font-medium">{r.nombreCompleto}</td>
                    <td className="px-4 py-3 text-stone-300">{r.telefono}<br />{r.email}</td>
                    <td className="px-4 py-3 text-stone-300">{r.direccion}, {r.localidad}, {r.provincia} ({r.codigoPostal})</td>
                    <td className="px-4 py-3 text-stone-300">
                      {r.tamano === 'CHICO' ? '24 pág.' : '32 pág.'} · {r.tematicas.join(', ')}
                      <br />
                      <span className="text-xs text-stone-500 font-mono">#{r.pedidoIdOriginal.slice(-8).toUpperCase()} · {formatoFechaHora(r.pedidoCreadoEn)}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-300">{r.montoARS !== null ? formatoARS(r.montoARS) : '—'}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{formatoFechaHora(r.eliminadoEn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
