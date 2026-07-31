// Campaña "lámina gratis" de la Feria del Libro Infantil.

// Temáticas ofrecidas en el formulario (subconjunto simple de las del libro).
export const TEMATICAS_LAMINA = ['Aventura', 'Princesas', 'Dinosaurios', 'Espacio', 'Animales'] as const
export type TematicaLamina = (typeof TEMATICAS_LAMINA)[number]

// El regalo es válido hasta el 9 de agosto de 2026 inclusive (hora Buenos Aires,
// UTC-3). Pasada esa fecha el formulario se cierra y el endpoint rechaza nuevas
// solicitudes. Fin = arranque del 10/08 en Buenos Aires.
export const FERIA_FIN = new Date('2026-08-10T00:00:00-03:00')

export function feriaAbierta(ahora: Date = new Date()): boolean {
  return ahora < FERIA_FIN
}

// Normaliza un número que escribió el visitante a formato wa.me (Argentina):
// deja solo dígitos y antepone 549 si hace falta. No es infalible (el visitante
// puede escribir cualquier cosa), pero sirve para armar el link desde el admin.
export function whatsappAWaMe(numero: string): string {
  const soloDigitos = numero.replace(/\D/g, '')
  if (soloDigitos.startsWith('549')) return soloDigitos
  if (soloDigitos.startsWith('54')) return '549' + soloDigitos.slice(2)
  if (soloDigitos.startsWith('0')) return '549' + soloDigitos.slice(1)
  return '549' + soloDigitos
}
