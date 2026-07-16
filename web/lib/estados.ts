// Orden en que se muestran los estados en los desplegables del admin. Refleja el
// flujo real del proceso: se revisan las imágenes, se arma la imposición, se sube
// el PDF (queda esperando aprobación del cliente), se aprueba, se imprime y se envía.
// (Esta lista, no el orden del enum en la base, es la fuente de verdad del orden.)
export const ESTADOS_PEDIDO = [
  'ESPERANDO_PAGO',
  'ESPERANDO_GENERACION',
  'EN_REVISION',
  'EN_IMPOSICION',
  'ESPERANDO_APROBACION',
  'APROBADO',
  'IMPRIMIENDO',
  'ENVIADO',
] as const

export const ESTADO_LABEL: Record<string, string> = {
  ESPERANDO_PAGO: 'Esperando pago',
  ESPERANDO_GENERACION: 'Esperando generación',
  EN_REVISION: 'En revisión',
  EN_IMPOSICION: 'Armando imposición',
  ESPERANDO_APROBACION: 'Esperando aprobación',
  APROBADO: 'Aprobado',
  IMPRIMIENDO: 'Imprimiendo',
  ENVIADO: 'Enviado',
}
