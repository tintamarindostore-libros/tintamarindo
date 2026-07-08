import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

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
  searchParams: Promise<{ estado?: string }>
}) {
  const session = await requireAdmin()
  if (!session) redirect('/')

  const { estado } = await searchParams
  const pedidos = await prisma.pedido.findMany({
    where: estado ? { estado: estado as never } : undefined,
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
          <Link
            href="/admin/cupones"
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-white text-stone-500 border border-stone-200 hover:border-orange-300"
          >
            🎟 Cupones
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/admin"
            className={`text-xs font-bold px-3 py-1.5 rounded-full ${!estado ? 'bg-orange-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}
          >
            Todos
          </Link>
          {ESTADOS.map((e) => (
            <Link
              key={e}
              href={`/admin?estado=${e}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${estado === e ? 'bg-orange-500 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}
            >
              {ESTADO_LABEL[e]}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          {pedidos.length === 0 ? (
            <p className="p-6 text-sm text-stone-400">No hay pedidos en este estado.</p>
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
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">
                      {ESTADO_LABEL[p.estado]}
                    </span>
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
