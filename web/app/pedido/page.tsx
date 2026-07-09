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
    titulo: '¡Pago recibido!',
    texto: 'Tu pedido está registrado y en proceso. Pronto recibirás un email de confirmación con los detalles.',
    color: 'text-green-600',
  },
  pendiente: {
    emoji: '⏳',
    titulo: 'Pago en proceso',
    texto: 'Tu pago está siendo verificado. Cuando se confirme te avisamos por email y empezamos a preparar tu libro.',
    color: 'text-orange-500',
  },
  rechazado: {
    emoji: '❌',
    titulo: 'El pago no fue aprobado',
    texto: 'Podés intentarlo de nuevo o contactarnos si el problema persiste.',
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
  let status: Status = 'pendiente'

  // No confiamos en "resultado" (nuestro propio hint en la URL) como fuente de verdad:
  // si MercadoPago nos dio un payment_id/collection_id, siempre lo verificamos de
  // verdad contra su API y confirmamos el pedido acá mismo si todavía no estaba
  // confirmado (el webhook puede llegar tarde o fallar) — así sea que la vuelta haya
  // sido "success", "pending" o "failure".
  const paymentId = params.payment_id ?? params.collection_id
  if (paymentId) {
    try {
      const { confirmado, mpStatus } = await confirmarPagoAprobado(paymentId)
      status = confirmado ? 'aprobado' : mpStatus === 'rejected' ? 'rechazado' : 'pendiente'
    } catch (err) {
      console.error('[pedido] Error al verificar el pago:', err)
      status = 'pendiente'
    }
  } else if (params.pid) {
    // Sin payment_id en la URL: chequeamos el estado ya guardado (puede haberlo
    // confirmado el webhook antes de que cargue esta pantalla).
    const pedido = await prisma.pedido.findUnique({ where: { id: params.pid }, select: { estado: true } })
    if (pedido && pedido.estado !== 'ESPERANDO_PAGO') status = 'aprobado'
    else if (params.resultado === 'rechazado') status = 'rechazado'
  } else if (params.resultado === 'rechazado') {
    status = 'rechazado'
  }

  const msg = MENSAJES[status] ?? MENSAJES.rechazado

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

        {status === 'rechazado' ? (
          <Link
            href="/crear"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl transition-colors"
          >
            Volver e intentar de nuevo
          </Link>
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
