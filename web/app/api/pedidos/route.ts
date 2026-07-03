import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { mpPreference } from '@/lib/mp'
import { PRECIO_LIBRO } from '@/lib/precios'

const PAGINAS_POR_TAMANO: Record<string, number> = { CHICO: 24, GRANDE: 32 }
const ESTILOS_VALIDOS = ['REALISTA', 'PIXAR', 'ANIME']
const PAPELES_VALIDOS = ['BLANCO', 'AHUESADO', 'COMBINADO']

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const {
      fotos,
      tamano,
      tematicas,
      tematicaPersonalizada,
      estilos,
      tipoPapel,
      fotoFamiliarKey,
      tituloTapa,
      subtituloTapa,
      observacionesTapa,
      imagenTapaKey,
      dedicatoria,
      nombreCompleto,
      direccion,
      codigoPostal,
      localidad,
      provincia,
      telefono,
      emailEnvio,
    } = body

    if (!Array.isArray(fotos) || fotos.length < 2) {
      return NextResponse.json({ error: 'Se requieren al menos 2 fotos' }, { status: 400 })
    }
    if (!PAGINAS_POR_TAMANO[tamano]) {
      return NextResponse.json({ error: 'Tamaño inválido' }, { status: 400 })
    }
    if (!Array.isArray(tematicas) || tematicas.length === 0) {
      return NextResponse.json({ error: 'Falta al menos una temática' }, { status: 400 })
    }
    if (!Array.isArray(estilos) || estilos.length === 0) {
      return NextResponse.json({ error: 'Falta al menos un estilo' }, { status: 400 })
    }
    if (!estilos.every((e: string) => ESTILOS_VALIDOS.includes(e))) {
      return NextResponse.json({ error: 'Estilo inválido' }, { status: 400 })
    }
    if (tipoPapel && !PAPELES_VALIDOS.includes(tipoPapel)) {
      return NextResponse.json({ error: 'Tipo de papel inválido' }, { status: 400 })
    }
    for (const campo of [nombreCompleto, direccion, codigoPostal, localidad, provincia, telefono, emailEnvio]) {
      if (!campo || typeof campo !== 'string' || !campo.trim()) {
        return NextResponse.json({ error: 'Faltan datos de envío' }, { status: 400 })
      }
    }

    const userId = session.user.id
    for (const key of fotos) {
      if (typeof key !== 'string' || !key.startsWith(`temp/${userId}/`)) {
        return NextResponse.json({ error: 'Foto inválida' }, { status: 403 })
      }
    }
    if (fotoFamiliarKey && (typeof fotoFamiliarKey !== 'string' || !fotoFamiliarKey.startsWith(`temp/${userId}/`))) {
      return NextResponse.json({ error: 'Imagen familiar inválida' }, { status: 403 })
    }
    if (imagenTapaKey && (typeof imagenTapaKey !== 'string' || !imagenTapaKey.startsWith(`temp/${userId}/`))) {
      return NextResponse.json({ error: 'Imagen de tapa inválida' }, { status: 403 })
    }

    const cantidadPaginas = PAGINAS_POR_TAMANO[tamano]

    const pedido = await prisma.pedido.create({
      data: {
        userId,
        tamano,
        tematicas,
        tematicaPersonalizada: tematicaPersonalizada || null,
        estilos,
        tipoPapel: tipoPapel || 'BLANCO',
        fotoFamiliarKey: fotoFamiliarKey || null,
        tituloTapa: tituloTapa || null,
        subtituloTapa: subtituloTapa || null,
        observacionesTapa: observacionesTapa || null,
        imagenTapaKey: imagenTapaKey || null,
        dedicatoria: dedicatoria || null,
        estado: 'ESPERANDO_PAGO',
        nombreCompleto,
        direccion,
        codigoPostal,
        localidad,
        provincia,
        telefono,
        emailEnvio,
        fotos: {
          create: fotos.map((url: string, i: number) => ({ url, orden: i })),
        },
        imagenes: {
          create: Array.from({ length: cantidadPaginas }, (_, i) => ({
            orden: i,
            tipo: i % 2 === 0 ? 'A' : 'B',
          })),
        },
      },
    })

    // En desarrollo se omite MercadoPago para poder probar el flujo completo sin conexión
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ id: pedido.id, mpInitPoint: null })
    }

    // Crear preferencia de MercadoPago (solo en producción)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const items = [
      {
        id: `LIBRO-${pedido.id}`,
        title: `Libro de colorear Tintamarindo — ${tamano === 'CHICO' ? '24 páginas' : '32 páginas'}`,
        quantity: 1,
        currency_id: 'ARS',
        unit_price: PRECIO_LIBRO[tamano],
      },
    ]

    try {
      const preference = await mpPreference.create({
        body: {
          items,
          external_reference: pedido.id,
          back_urls: {
            success: `${siteUrl}/pedido?status=aprobado&pid=${pedido.id}`,
            failure: `${siteUrl}/pedido?status=rechazado&pid=${pedido.id}`,
            pending: `${siteUrl}/pedido?status=pendiente&pid=${pedido.id}`,
          },
          auto_return: 'approved',
          notification_url: `${siteUrl}/api/webhooks/mercadopago`,
        },
      })

      await prisma.pedido.update({
        where: { id: pedido.id },
        data: { mpPreferenceId: preference.id ?? null },
      })

      return NextResponse.json({ id: pedido.id, mpInitPoint: preference.init_point })
    } catch (mpErr) {
      console.error('[pedidos] Error al crear preferencia MP:', mpErr)
      return NextResponse.json({ id: pedido.id, mpInitPoint: null })
    }
  } catch (err) {
    console.error('[pedidos] Error inesperado:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
