import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { confirmarPagoAprobado } from '@/lib/confirmarPago'

export const metadata: Metadata = {
  title: 'Estado de tu pedido — Tintamarindo',
  robots: { index: false, follow: false },
}

const MENSAJES = {
  aprobado: {
    emoji: '🎉',
    titulo: '¡Pago confirmado!',
    texto: 'Tu pedido ingresó y ya está en proceso. Pronto recibirás un email de confirmación con los detalles.',
    color: 'text-green-600',
  },
  error: {
    emoji: '⚠️',
    titulo: 'No pudimos confirmar tu pago',
    texto: 'No se realizó ningún cobro. Podés intentar de nuevo o completar el pedido pagando por transferencia bancaria (con descuento).',
    color: 'text-red-500',
  },
} as const

type Status = keyof typeof MENSAJES

export default async function PedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ resultado?: string; pid?: string; payment_id?: string; collection_id?: string }>
}) {
  const params = await searchParams

  // Un pedido de MercadoPago solo "ingresa" cuando MP confirma el pago como
  // aprobado. No confiamos en "resultado" (nuestro hint en la URL): si hay un
  // payment_id/collection_id, verificamos de verdad contra la API de MP y
  // confirmamos el pedido acá mismo si el webhook todavía no lo hizo.
  const paymentId = params.payment_id ?? params.collection_id
  let confirmado = false
  let mpStatus: string | null = null
  let pedidoId: string | null = params.pid ?? null

  if (paymentId) {
    try {
      const r = await confirmarPagoAprobado(paymentId)
      confirmado = r.confirmado
      mpStatus = r.mpStatus
      pedidoId = r.pedidoId ?? pedidoId
    } catch (err) {
      console.error('[pedido] Error al verificar el pago:', err)
    }
  } else if (params.pid) {
    // Sin payment_id en la URL: el webhook pudo haberlo confirmado antes de que
    // cargue esta pantalla.
    const pedido = await prisma.pedido.findUnique({ where: { id: params.pid }, select: { estado: true } })
    confirmado = !!pedido && pedido.estado !== 'ESPERANDO_PAGO'
    if (params.resultado === 'rechazado') mpStatus = 'rejected'
  } else if (params.resultado === 'rechazado') {
    mpStatus = 'rejected'
  }

  // Si MercadoPago rechazó el pago, no debe quedar un pedido "fantasma" sin pagar:
  // se borra (solo si sigue ESPERANDO_PAGO + MERCADOPAGO, nunca uno ya pagado). No
  // se borra en otros estados no confirmados por si el pago todavía puede aprobarse.
  if (!confirmado && mpStatus === 'rejected' && pedidoId) {
    await prisma.pedido.deleteMany({
      where: { id: pedidoId, estado: 'ESPERANDO_PAGO', medioPago: 'MERCADOPAGO' },
    })
  }

  const status: Status = confirmado ? 'aprobado' : 'error'
  const msg = MENSAJES[status]

  return (
    <div className="min-h-screen bg-[#FEF9F0] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">{msg.emoji}</div>
        <h1
          className={`text-3xl font-black mb-4 ${msg.color}`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {msg.titulo}
        </h1>
        <p className="text-stone-500 mb-8 leading-relaxed">{msg.texto}</p>

        {status === 'error' ? (
          <div className="space-y-4">
            <Link
              href="/crear"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl transition-colors"
            >
              Volver e intentar de nuevo
            </Link>
            <p className="text-stone-400 text-sm">
              ¿Necesitás ayuda? Escribinos por WhatsApp o a{' '}
              <a href="mailto:tintamarindo.store@gmail.com" className="text-orange-500 underline">
                tintamarindo.store@gmail.com
              </a>
            </p>
          </div>
        ) : (
          <p className="text-stone-400 text-sm">
            ¿Dudas? Contactanos por WhatsApp o a{' '}
            <a href="mailto:tintamarindo.store@gmail.com" className="text-orange-500 underline">
              tintamarindo.store@gmail.com
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
