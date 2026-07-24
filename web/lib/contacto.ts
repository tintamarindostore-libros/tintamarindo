// Datos de contacto del negocio (para links de WhatsApp, emails, etc.).
export const CONTACTO = {
  whatsappDisplay: '11 3953 2951',
  // Formato para wa.me: Argentina móvil = 54 9 + área + número (sin espacios ni +).
  whatsappNumero: '5491139532951',
  email: 'tintamarindo.store@gmail.com',
}

// Arma un link de WhatsApp (wa.me) con un mensaje opcional prellenado.
export function linkWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${CONTACTO.whatsappNumero}`
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base
}
