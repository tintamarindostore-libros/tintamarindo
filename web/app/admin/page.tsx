import Link from 'next/link'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { formatoFechaHora } from '@/lib/fecha'
import { formatoARS, precioFinalLibro } from '@/lib/precios'
import { AccesoDenegado } from './AccesoDenegado'

const ESTADOS = ['ESPERANDO_PAGO', 'ESPERANDO_GENERACION', 'EN_REVISION', 'ESPERANDO_APROBACION', 'APROBADO', 'ENVIADO']

const ESTADO_LABEL: Record<string, string> = {
  ESPERANDO_PAGO: 'Esperando pago',
  ESPERANDO_GENERACION: 'Esperando generación',
  EN_REVISION: 'En revisión',
  ESPERANDO_APROBACION: 'Esperando aprobación',
  APROBADO: 'Aprobado',
  ENVIADO: 'Enviado',
}

function BadgeAprobacion({ pdfSubidoAt }: { pdfSubidoAt: Date | null }) {
  if (!pdfSubidoAt) return null
  const dias = Math.floor((Date.now() - pdfSubidoAt.getTime()) / 86_400_000)
  const restantes = 5 - dias
  const [bg, text] =
    restantes > 2 ? ['bg-green-100 text-green-700', ''] :
    restantes > 0 ? ['bg-amber-100 text-amber-700', ''] :
                    ['bg-red-100 text-red-700', '']
  const label = restantes > 0 ? `${restantes}d para aprobar` : 'Vencido — se aprueba hoy'
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${text} mt-1 block`}>
      ⏱ {label}
    </span>
  )
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>
}) {
  const access = await checkAdminAccess()
  if (access.status === 'no-session') redirect('/entrar?callbackUrl=/admin')
  if (access.status === 'wrong-email') return <AccesoDenegado email={access.email} volverA="/admin" />

  const { estado, q } = await searchParams
  const busqueda = q?.trim()
  const pedidos = await prisma.pedido.findMany({
    where: {
      ...(estado ? { estado: estado as never } : {}),
      ...(busqueda
        ? {
            OR: [
              { nombreCompleto: { contains: busqueda, mode: 'insensitive' } },
              { user: { email: { contains: busqueda, mode: 'insensitive' } } },
              { id: { contains: busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { user: true, imagenes: true },
  })

  return (
    <div className="min-h-screen bg-[#FEF9F0] px-6 py-12" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
            Panel de administración
          </h1>
          <div className="flex gap-2">
            <Link
              href="/admin/cupones"
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-white text-stone-500 border border-stone-200 hover:border-orange-300"
            >
              🎟 Cupones
            </Link>
            <Link
              href="/salir"
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-white text-stone-500 border border-stone-200 hover:border-red-300"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>

        <form action="/admin" className="flex gap-2 mb-4">
          {estado && <input type="hidden" name="estado" value={estado} />}
          <input
            type="text"
            name="q"
            defaultValue={busqueda ?? ''}
            placeholder="Buscar por nombre, email o código de pedido…"
            className="flex-1 text-sm rounded-full border border-stone-200 px-4 py-2 focus:border-orange-300 focus:outline-none"
          />
          <button type="submit" className="text-xs font-bold px-4 py-2 rounded-full bg-stone-800 text-white">
            Buscar
          </button>
          {busqueda && (
            <Link
              href={estado ? `/admin?estado=${estado}` : '/admin'}
              className="text-xs font-bold px-4 py-2 rounded-full bg-white text-stone-500 border border-stone-200"
            >
              Limpiar
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={busqueda ? `/admin?q=${encodeURIComponent(busqueda)}` : '/admin'}
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${!estado ? 'bg-orange-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}
          >
            Todos
          </Link>
          {ESTADOS.map((e) => (
            <Link
              key={e}
              href={`/admin?estado=${e}${busqueda ? `&q=${encodeURIComponent(busqueda)}` : ''}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${estado === e ? 'bg-orange-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}
            >
              {ESTADO_LABEL[e]}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          {pedidos.length === 0 ? (
            <p className="p-6 text-sm text-stone-400">No hay pedidos que coincidan.</p>
          ) : (
            pedidos.map((p) => {
              const aprobadas = p.imagenes.filter((i) => i.aprobada).length
              return (
                <Link
                  key={p.id}
                  href={`/admin/${p.id}`}
                  className="flex items-center justify-between px-6 py-4 border-b border-stone-50 last:border-0 hover:bg-orange-50/50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-stone-800 text-sm">{p.nombreCompleto}</p>
                    <p className="text-xs text-stone-400">
                      {p.user.email} · {p.tematicas[0]} · {p.estilos[0]} · {p.tamano === 'CHICO' ? '24 pág' : '32 pág'}
                    </p>
                    <p className="text-xs text-stone-400 font-mono mt-0.5">
                      #{p.id.slice(-8).toUpperCase()} · {formatoFechaHora(p.createdAt)}
                    </p>
                    {p.cuponCodigo && (
                      <p className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 rounded-full px-2 py-0.5 mt-1 inline-block">
                        🎟 {p.cuponCodigo} ({p.cuponDescuentoPorcentaje}% off)
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">
                      {ESTADO_LABEL[p.estado]}
                    </span>
                    <p className="text-xs font-bold text-stone-600 mt-1">
                      {formatoARS(precioFinalLibro(p.tamano, p.medioPago, p.cuponDescuentoPorcentaje))}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {aprobadas}/{p.imagenes.length} aprobadas
                    </p>
                    {p.estado === 'ESPERANDO_APROBACION' && (
                      <BadgeAprobacion pdfSubidoAt={p.pdfSubidoAt} />
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
