import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { mpPreference } from '@/lib/mp'
import { PRECIO_LIBRO } from '@/lib/precios'
import { estimarEnvio } from '@/lib/envio'
import { validarCupon } from '@/lib/cupones'
import { notificarPedidoPagado } from '@/lib/notificarPedido'

const PAGINAS_POR_TAMANO: Record<string, number> = { CHICO: 24, GRANDE: 32 }
const ESTILOS_VALIDOS = ['REALISTA', 'PIXAR', 'ANIME']
const PAPELES_VALIDOS = ['BLANCO', 'AHUESADO', 'COMBINADO']
const TIPOS_ENTREGA_VALIDOS = ['SUCURSAL', 'DOMICILIO']
const MEDIOS_PAGO_VALIDOS = ['MERCADOPAGO', 'TRANSFERENCIA']
const MAX_TEMATICAS_PERSONALIZADAS = 3

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
      tematicasPersonalizadas,
      estilos,
      tipoPapel,
      fotoFamiliarKey,
      tituloTapa,
      subtituloTapa,
      observacionesTapa,
      imagenTapaKey,
      dedicatoria,
      estiloTapa,
      nombreCompleto,
      direccion,
      codigoPostal,
      localidad,
      provincia,
      telefono,
      emailEnvio,
      tipoEntrega,
      medioPago,
      cuponCodigo,
    } = body

    if (!Array.isArray(fotos) || fotos.length < 2) {
      return NextResponse.json({ error: 'Se requieren al menos 2 fotos' }, { status: 400 })
    }
    if (!PAGINAS_POR_TAMANO[tamano]) {
      return NextResponse.json({ error: 'Tamaño inválido' }, { status: 400 })
    }
    if (!Array.isArray(tematicas)) {
      return NextResponse.json({ error: 'Temáticas inválidas' }, { status: 400 })
    }
    if (
      tematicasPersonalizadas !== undefined &&
      (!Array.isArray(tematicasPersonalizadas) ||
        tematicasPersonalizadas.length > MAX_TEMATICAS_PERSONALIZADAS ||
        !tematicasPersonalizadas.every((t: unknown) => typeof t === 'string' && t.trim()))
    ) {
      return NextResponse.json({ error: 'Temáticas personalizadas inválidas' }, { status: 400 })
    }
    const hayTematicaPersonalizada = Array.isArray(tematicasPersonalizadas) && tematicasPersonalizadas.some((t: string) => t.trim())
    if (tematicas.length === 0 && !hayTematicaPersonalizada) {
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
    if (estiloTapa && !ESTILOS_VALIDOS.includes(estiloTapa)) {
      return NextResponse.json({ error: 'Estilo de tapa inválido' }, { status: 400 })
    }
    if (tipoEntrega && !TIPOS_ENTREGA_VALIDOS.includes(tipoEntrega)) {
      return NextResponse.json({ error: 'Tipo de entrega inválido' }, { status: 400 })
    }
    if (medioPago && !MEDIOS_PAGO_VALIDOS.includes(medioPago)) {
      return NextResponse.json({ error: 'Medio de pago inválido' }, { status: 400 })
    }

    let cuponInfo: { codigo: string; descuentoPorcentaje: number } | null = null
    if (typeof cuponCodigo === 'string' && cuponCodigo.trim()) {
      const resultadoCupon = await validarCupon(cuponCodigo)
      if (!resultadoCupon.valido) {
        return NextResponse.json({ error: resultadoCupon.error }, { status: 400 })
      }
      cuponInfo = { codigo: resultadoCupon.codigo, descuentoPorcentaje: resultadoCupon.descuentoPorcentaje }
    }
    // La dirección es opcional cuando se retira en sucursal (el cliente puede no saber cuál es)
    const camposEnvioObligatorios =
      tipoEntrega === 'SUCURSAL'
        ? [nombreCompleto, codigoPostal, localidad, provincia, telefono, emailEnvio]
        : [nombreCompleto, direccion, codigoPostal, localidad, provincia, telefono, emailEnvio]
    for (const campo of camposEnvioObligatorios) {
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
    const tipoEntregaFinal = tipoEntrega || 'DOMICILIO'
    const medioPagoFinal = medioPago || 'MERCADOPAGO'
    const costoEnvioEstimado = estimarEnvio(provincia, tipoEntregaFinal)

    const pedido = await prisma.pedido.create({
      data: {
        userId,
        tamano,
        tematicas,
        tematicasPersonalizadas: tematicasPersonalizadas || [],
        estilos,
        tipoPapel: tipoPapel || 'BLANCO',
        fotoFamiliarKey: fotoFamiliarKey || null,
        tituloTapa: tituloTapa || null,
        subtituloTapa: subtituloTapa || null,
        observacionesTapa: observacionesTapa || null,
        imagenTapaKey: imagenTapaKey || null,
        dedicatoria: dedicatoria || null,
        estiloTapa: estiloTapa || null,
        estado: 'ESPERANDO_PAGO',
        nombreCompleto,
        direccion,
        codigoPostal,
        localidad,
        provincia,
        telefono,
        emailEnvio,
        tipoEntrega: tipoEntregaFinal,
        costoEnvioEstimado,
        medioPago: medioPagoFinal,
        cuponCodigo: cuponInfo?.codigo ?? null,
        cuponDescuentoPorcentaje: cuponInfo?.descuentoPorcentaje ?? null,
        fotos: {
          create: fotos.map((url: string, i: number) => ({ url, orden: i })),
        },
        imagenes: {
          create: [
            ...(imagenTapaKey ? [{ orden: -2, tipo: 'TAPA' as const }] : []),
            { orden: -1, tipo: 'RETIRACION_TAPA' as const },
            ...Array.from({ length: cantidadPaginas }, (_, i) => ({
              orden: i,
              tipo: i % 2 === 0 ? ('A' as const) : ('B' as const),
            })),
            { orden: cantidadPaginas, tipo: 'RETIRACION_CONTRATAPA' as const },
            { orden: cantidadPaginas + 1, tipo: 'CONTRATAPA' as const },
          ],
        },
      },
    })

    if (cuponInfo) {
      await prisma.cupon.update({
        where: { codigo: cuponInfo.codigo },
        data: { usosActuales: { increment: 1 } },
      })
    }

    // Cupón 100% bonificado (regalos a influencers / marketing): el pedido queda pagado
    // al instante, sin pasar por MercadoPago ni transferencia.
    if (cuponInfo?.descuentoPorcentaje === 100) {
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: { estado: 'ESPERANDO_GENERACION', pagadoAt: new Date() },
      })
      await notificarPedidoPagado({
        id: pedido.id,
        nombreCompleto,
        tamano,
        medioPago: medioPagoFinal,
        cuponDescuentoPorcentaje: cuponInfo.descuentoPorcentaje,
        cuponCodigo: cuponInfo.codigo,
        tematicas,
        telefono,
        emailEnvio,
      })
      return NextResponse.json({ id: pedido.id, mpInitPoint: null })
    }

    // Transferencia: no hay pago online, el pedido queda "esperando pago" hasta que el
    // admin confirme la acreditación a mano. En desarrollo también se omite MercadoPago
    // para poder probar el flujo completo sin conexión.
    if (medioPagoFinal === 'TRANSFERENCIA' || process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ id: pedido.id, mpInitPoint: null })
    }

    // Crear preferencia de MercadoPago (solo en producción)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const precioLibroConCupon = cuponInfo
      ? Math.round(PRECIO_LIBRO[tamano] * (1 - cuponInfo.descuentoPorcentaje / 100))
      : PRECIO_LIBRO[tamano]
    const items = [
      {
        id: `LIBRO-${pedido.id}`,
        title: `Libro de colorear Tintamarindo — ${tamano === 'CHICO' ? '24 páginas' : '32 páginas'}`,
        quantity: 1,
        currency_id: 'ARS',
        unit_price: precioLibroConCupon,
      },
      // Si el envío todavía no tiene un costo confirmado para la zona (interior/Patagonia a
      // domicilio, sin API de MiCorreo), no se cobra acá — se coordina por WhatsApp/email.
      ...(costoEnvioEstimado !== null
        ? [
            {
              id: `ENVIO-${pedido.id}`,
              title: `Envío (${tipoEntregaFinal === 'SUCURSAL' ? 'retiro en sucursal' : 'a domicilio'})`,
              quantity: 1,
              currency_id: 'ARS',
              unit_price: costoEnvioEstimado,
            },
          ]
        : []),
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
