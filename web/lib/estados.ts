export const ESTADOS_PEDIDO = [
  'ESPERANDO_PAGO',
  'ESPERANDO_GENERACION',
  'EN_REVISION',
  'ESPERANDO_APROBACION',
  'APROBADO',
  'EN_IMPOSICION',
  'IMPRIMIENDO',
  'ENVIADO',
] as const

export const ESTADO_LABEL: Record<string, string> = {
  ESPERANDO_PAGO: 'Esperando pago',
  ESPERANDO_GENERACION: 'Esperando generación',
  EN_REVISION: 'En revisión',
  ESPERANDO_APROBACION: 'Esperando aprobación',
  APROBADO: 'Aprobado',
  EN_IMPOSICION: 'Armando imposición',
  IMPRIMIENDO: 'Imprimiendo',
  ENVIADO: 'Enviado',
}
