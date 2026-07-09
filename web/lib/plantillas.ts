// Instancias del proceso para las que hay un mensaje predefinido al cliente.
// `camposManuales` son variables que el admin tiene que completar a mano al
// copiar el mensaje (no se pueden autocompletar desde los datos del pedido).
export const PLANTILLAS_CONFIG = [
  { clave: 'CONFIRMACION_PEDIDO', nombre: 'Confirmación de pedido', camposManuales: [] as string[] },
  { clave: 'PDF_LISTO_APROBACION', nombre: 'PDF listo para aprobar', camposManuales: [] as string[] },
  { clave: 'RECORDATORIO_APROBACION', nombre: 'Recordatorio de aprobación', camposManuales: [] as string[] },
  { clave: 'APROBADO_EN_PRODUCCION', nombre: 'Aprobado — en producción', camposManuales: [] as string[] },
  { clave: 'DESPACHO', nombre: 'Despacho / tracking', camposManuales: ['costoEnvio'] as string[] },
  { clave: 'RECORDATORIO_TRANSFERENCIA', nombre: 'Recordatorio de transferencia', camposManuales: [] as string[] },
] as const

export type ClavePlantilla = (typeof PLANTILLAS_CONFIG)[number]['clave']

// Reemplaza {{variable}} por su valor. Las variables sin valor quedan tal cual
// (así se nota en el texto copiado que faltó completar algo).
export function renderPlantilla(cuerpo: string, variables: Record<string, string>): string {
  return cuerpo.replace(/\{\{(\w+)\}\}/g, (match, clave) => variables[clave] ?? match)
}
