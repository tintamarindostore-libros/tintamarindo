import Link from 'next/link'
import { redirect } from 'next/navigation'
import { checkAdminAccess } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { formatoFechaHora, diasDesde, inicioDiaBuenosAires } from '@/lib/fecha'
import { formatoARS, precioFinalLibro } from '@/lib/precios'
import { AccesoDenegado } from './AccesoDenegado'
import { CopiarCodigo } from './CopiarCodigo'

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
  const dias = diasDesde(pdfSubidoAt)
  const restantes = 5 - dias
  const [bg, text] =
    restantes > 2 ? ['bg-green-500/15', 'text-green-400'] :
    restantes > 0 ? ['bg-amber-500/15', 'text-amber-400'] :
                    ['bg-red-500/15', 'text-red-400']
  const label = restantes > 0 ? `${restantes}d para aprobar` : 'Vencido — se aprueba hoy'
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${text} mt-1 block`}>
      ⏱ {label}
    </span>
  )
}

// Antigüedad general del pedido — para detectar los que llevan mucho tiempo sin moverse,
// más allá de la ventana específica de aprobación (que ya cubre BadgeAprobacion).
function BadgeAntiguedad({ createdAt, estado }: { createdAt: Date; estado: string }) {
  if (estado === 'ENVIADO') return null
  const dias = diasDesde(createdAt)
  if (dias < 4) return null
  const [bg, text] = dias >= 10 ? ['bg-red-500/15', 'text-red-400'] : ['bg-amber-500/15', 'text-amber-400']
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${text} mt-1 block`}>
      {dias >= 10 ? `⚠ ${dias}d — revisar` : `${dias}d desde el pedido`}
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

  const camposResumen = { tamano: true, medioPago: true, cuponDescuentoPorcentaje: true, createdAt: true } as const
  const [pedidosHoy, pedidosSemana] = await Promise.all([
    prisma.pedido.findMany({ where: { createdAt: { gte: inicioDiaBuenosAires(0) } }, select: camposResumen }),
    prisma.pedido.findMany({ where: { createdAt: { gte: inicioDiaBuenosAires(6) } }, select: camposResumen }),
  ])
  const totalFacturado = (lista: typeof pedidosHoy) =>
    lista.reduce((acc, p) => acc + precioFinalLibro(p.tamano, p.medioPago, p.cuponDescuentoPorcentaje), 0)

  return (
    <div className="min-h-screen bg-stone-950 px-6 py-12" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Panel de administración
          </h1>
          <div className="flex gap-2">
            <Link
              href="/admin/cupones"
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800 hover:border-brand-500"
            >
              🎟 Cupones
            </Link>
            <Link
              href="/admin/mensajes"
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800 hover:border-brand-500"
            >
              💬 Mensajes
            </Link>
            <Link
              href="/salir"
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800 hover:border-red-500"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Hoy</p>
            <p className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {pedidosHoy.length} {pedidosHoy.length === 1 ? 'pedido' : 'pedidos'}
            </p>
            <p className="text-sm text-brand-400 font-bold mt-0.5">{formatoARS(totalFacturado(pedidosHoy))}</p>
          </div>
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Últimos 7 días</p>
            <p className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {pedidosSemana.length} {pedidosSemana.length === 1 ? 'pedido' : 'pedidos'}
            </p>
            <p className="text-sm text-brand-400 font-bold mt-0.5">{formatoARS(totalFacturado(pedidosSemana))}</p>
          </div>
        </div>

        <form action="/admin" className="flex gap-2 mb-4">
          {estado && <input type="hidden" name="estado" value={estado} />}
          <input
            type="text"
            name="q"
            defaultValue={busqueda ?? ''}
            placeholder="Buscar por nombre, email o código de pedido…"
            className="flex-1 text-sm rounded-full border border-stone-800 bg-stone-900 text-white px-4 py-2 focus:border-brand-500 focus:outline-none placeholder:text-stone-600"
          />
          <button type="submit" className="text-xs font-bold px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white">
            Buscar
          </button>
          {busqueda && (
            <Link
              href={estado ? `/admin?estado=${estado}` : '/admin'}
              className="text-xs font-bold px-4 py-2 rounded-full bg-stone-900 text-stone-300 border border-stone-800"
            >
              Limpiar
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={busqueda ? `/admin?q=${encodeURIComponent(busqueda)}` : '/admin'}
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${!estado ? 'bg-brand-500 text-white' : 'bg-stone-900 text-stone-300 border border-stone-800'}`}
          >
            Todos
          </Link>
          {ESTADOS.map((e) => (
            <Link
              key={e}
              href={`/admin?estado=${e}${busqueda ? `&q=${encodeURIComponent(busqueda)}` : ''}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${estado === e ? 'bg-brand-500 text-white' : 'bg-stone-900 text-stone-300 border border-stone-800'}`}
            >
              {ESTADO_LABEL[e]}
            </Link>
          ))}
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          {pedidos.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">No hay pedidos que coincidan.</p>
          ) : (
            pedidos.map((p, i) => {
              const aprobadas = p.imagenes.filter((i) => i.aprobada).length
              return (
                <Link
                  key={p.id}
                  href={`/admin/${p.id}`}
                  className={[
                    'flex items-center justify-between px-6 py-4 border-b border-stone-800/60 last:border-0 hover:bg-stone-800 transition-colors',
                    i % 2 === 1 ? 'bg-stone-800/50' : '',
                  ].join(' ')}
                >
                  <div>
                    <p className="font-bold text-white text-sm">{p.nombreCompleto}</p>
                    <p className="text-xs text-stone-500">
                      {p.user.email} · {p.tematicas[0]} · {p.estilos[0]} · {p.tamano === 'CHICO' ? '24 pág' : '32 pág'}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      <CopiarCodigo codigo={p.id.slice(-8).toUpperCase()} /> · {formatoFechaHora(p.createdAt)}
                    </p>
                    {p.cuponCodigo && (
                      <p className="text-[10px] font-bold text-green-400 bg-green-500/15 rounded-full px-2 py-0.5 mt-1 inline-block">
                        🎟 {p.cuponCodigo} ({p.cuponDescuentoPorcentaje}% off)
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full">
                      {ESTADO_LABEL[p.estado]}
                    </span>
                    <p className="text-xs font-bold text-stone-300 mt-1">
                      {formatoARS(precioFinalLibro(p.tamano, p.medioPago, p.cuponDescuentoPorcentaje))}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {aprobadas}/{p.imagenes.length} aprobadas
                    </p>
                    {p.estado === 'ESPERANDO_APROBACION' && <BadgeAprobacion pdfSubidoAt={p.pdfSubidoAt} />}
                    {p.estado !== 'ESPERANDO_APROBACION' && <BadgeAntiguedad createdAt={p.createdAt} estado={p.estado} />}
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
