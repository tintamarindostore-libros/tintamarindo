import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subirArchivo } from '@/lib/r2'
import { TEMATICAS_LAMINA, feriaAbierta } from '@/lib/feria'

const TIPOS_VALIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_BYTES = 15 * 1024 * 1024 // 15MB

// Endpoint público (sin login) de la campaña de la Feria. Recibe la foto + los
// datos, valida, guarda la foto en R2 y crea una SolicitudLamina para que el
// dueño la vea en /admin/feria y dibuje la lámina a mano.
export async function POST(req: NextRequest) {
  try {
    if (!feriaAbierta()) {
      return NextResponse.json({ error: 'La promoción de la Feria ya terminó. ¡Gracias por tu interés!' }, { status: 403 })
    }

    const formData = await req.formData()
    const foto = formData.get('foto') as File | null
    const nombre = (formData.get('nombre') as string | null)?.trim() ?? ''
    const tematica = (formData.get('tematica') as string | null)?.trim() ?? ''
    const whatsapp = (formData.get('whatsapp') as string | null)?.trim() ?? ''
    const autoriza = formData.get('autoriza') === 'true'

    if (!nombre) return NextResponse.json({ error: 'Falta el nombre del peque' }, { status: 400 })
    if (!(TEMATICAS_LAMINA as readonly string[]).includes(tematica)) {
      return NextResponse.json({ error: 'Elegí una temática' }, { status: 400 })
    }
    if (!whatsapp || whatsapp.replace(/\D/g, '').length < 8) {
      return NextResponse.json({ error: 'Dejanos un WhatsApp válido para mandarte la lámina' }, { status: 400 })
    }
    if (!autoriza) {
      return NextResponse.json({ error: 'Necesitamos tu autorización para usar la foto' }, { status: 400 })
    }
    if (!foto) return NextResponse.json({ error: 'Subí una foto de tu peque' }, { status: 400 })
    if (!TIPOS_VALIDOS.includes(foto.type)) {
      return NextResponse.json({ error: 'Formato no soportado. Usá JPG, PNG, WEBP o HEIC' }, { status: 400 })
    }
    if (foto.size > MAX_BYTES) {
      return NextResponse.json({ error: 'La foto pesa demasiado (máximo 15MB)' }, { status: 400 })
    }

    // Una lámina por peque: si ya hay una solicitud con el mismo WhatsApp y el
    // mismo nombre, no creamos otra (otro hijo con otro nombre sí se permite).
    const whatsappNorm = whatsapp.replace(/\D/g, '')
    const yaExiste = await prisma.solicitudLamina.findFirst({
      where: {
        whatsapp: { contains: whatsappNorm.slice(-8) },
        nombre: { equals: nombre, mode: 'insensitive' },
      },
    })
    if (yaExiste) {
      return NextResponse.json(
        { error: `Ya recibimos el pedido de ${nombre}. Te escribimos por WhatsApp con la lámina. 😊` },
        { status: 409 },
      )
    }

    const bytes = Buffer.from(await foto.arrayBuffer())
    const ext = foto.name.split('.').pop() || 'jpg'
    const key = `feria/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    await subirArchivo(key, bytes, foto.type)

    await prisma.solicitudLamina.create({
      data: { nombre, tematica, whatsapp, fotoKey: key },
    })

    // Aviso opcional al dueño por n8n (no-op si no está configurada la env var).
    const webhook = process.env.N8N_LAMINA_WEBHOOK_URL
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'lamina_feria', nombre, tematica, whatsapp }),
        })
      } catch (err) {
        console.error('[feria] Error al notificar a n8n:', err)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[feria] Error inesperado:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
