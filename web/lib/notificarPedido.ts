import { formatoARS, precioFinalLibro } from './precios'

type PedidoParaNotificar = {
  id: string
  nombreCompleto: string
  tamano: string
  medioPago: string
  cuponDescuentoPorcentaje: number | null
  cuponCodigo: string | null
  tematicas: string[]
  telefono: string
  emailEnvio: string
}

// Avisa a un workflow de n8n (nuevo, sin relación con otros workflows existentes)
// cuando un pedido pasa a "pagado", para que n8n dispare la notificación de WhatsApp.
// Si no hay N8N_PEDIDO_WEBHOOK_URL configurada, no hace nada — no bloquea ni rompe
// el flujo de confirmación de pago si n8n no está disponible.
export async function notificarPedidoPagado(pedido: PedidoParaNotificar): Promise<void> {
  const url = process.env.N8N_PEDIDO_WEBHOOK_URL
  if (!url) return

  const monto = precioFinalLibro(pedido.tamano, pedido.medioPago, pedido.cuponDescuentoPorcentaje)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.tintamarindo.com'

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pedidoId: pedido.id,
        codigo: pedido.id.slice(-8).toUpperCase(),
        nombreCompleto: pedido.nombreCompleto,
        tamano: pedido.tamano === 'CHICO' ? '24 páginas' : '32 páginas',
        tematicas: pedido.tematicas,
        medioPago: pedido.medioPago,
        cuponCodigo: pedido.cuponCodigo,
        montoARS: monto,
        montoFormateado: formatoARS(monto),
        telefonoCliente: pedido.telefono,
        emailCliente: pedido.emailEnvio,
        linkAdmin: `${siteUrl}/admin/${pedido.id}`,
      }),
    })
  } catch (err) {
    console.error('[notificarPedido] Error al notificar a n8n:', err)
  }
}
