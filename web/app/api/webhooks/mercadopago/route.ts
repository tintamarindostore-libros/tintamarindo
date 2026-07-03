import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { mpPayment } from '@/lib/mp'
import { prisma } from '@/lib/prisma'

function verificarFirma(req: NextRequest, body: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return true // En desarrollo, sin secret configurado aceptamos todo

  const xSignature = req.headers.get('x-signature') ?? ''
  const url = new URL(req.url)
  const dataId = url.searchParams.get('data.id') ?? ''

  const ts = xSignature.split(',').find((p) => p.startsWith('ts='))?.slice(3) ?? ''
  const v1 = xSignature.split(',').find((p) => p.startsWith('v1='))?.slice(3) ?? ''

  const template = `id:${dataId};request-date:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(template).digest('hex')

  return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'))
}

export async function POST(req: NextRequest) {
  let body: string
  let event: Record<string, unknown>

  try {
    body = await req.text()
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!verificarFirma(req, body)) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  // Solo procesamos eventos de pago
  if (event.type !== 'payment') {
    return NextResponse.json({ ok: true })
  }

  const paymentId = (event.data as Record<string, unknown>)?.id
  if (!paymentId) return NextResponse.json({ ok: true })

  try {
    const payment = await mpPayment.get({ id: Number(paymentId) })

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    // external_reference contiene el pedido.id que seteamos al crear la preferencia
    const pedidoId = payment.external_reference
    if (!pedidoId) return NextResponse.json({ ok: true })

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    })

    if (!pedido || pedido.estado !== 'ESPERANDO_PAGO') {
      return NextResponse.json({ ok: true })
    }

    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        mpPaymentId: String(paymentId),
        pagadoAt: new Date(),
        estado: 'ESPERANDO_GENERACION',
      },
    })

    // TODO Fase 3: enviar email de confirmación al cliente
  } catch (err) {
    console.error('[webhook/mp] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
