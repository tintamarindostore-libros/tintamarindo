// Datos de contacto del negocio (para links de WhatsApp, emails, etc.).
export const CONTACTO = {
  // Número PÚBLICO: donde los clientes se comunican con el negocio.
  whatsappDisplay: '11 2366 8769',
  // Formato para wa.me: Argentina móvil = 54 9 + área + número (sin espacios ni +).
  whatsappNumero: '5491123668769',
  email: 'tintamarindo.store@gmail.com',

  // Número INTERNO: solo para notificaciones automáticas (aviso de pedido nuevo,
  // handoff a un humano). Lo usa el workflow de n8n, NO el sitio ni la atención al
  // cliente. No mostrar en la web ni en links de contacto.
  whatsappNotificaciones: '11 5949 3883',
  whatsappNotificacionesNumero: '5491159493883',
}

// Arma un link de WhatsApp (wa.me) al número público, con un mensaje opcional prellenado.
export function linkWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${CONTACTO.whatsappNumero}`
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base
}
