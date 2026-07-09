// Páginas que arma el admin a mano (no generadas por IA): tapa/contratapa del
// libro físico. No participan de la rotación de temáticas ni del flujo de
// "generar imágenes faltantes".
export const TIPOS_MANUALES = ['RETIRACION_TAPA', 'CONTRATAPA', 'RETIRACION_CONTRATAPA'] as const

export function esTipoManual(tipo: string): boolean {
  return (TIPOS_MANUALES as readonly string[]).includes(tipo)
}

export const LABEL_TIPO_MANUAL: Record<string, string> = {
  RETIRACION_TAPA: 'Retiración de tapa',
  CONTRATAPA: 'Contratapa',
  RETIRACION_CONTRATAPA: 'Retiración de contratapa',
}

// Orden físico del libro para mostrar en el admin. No se puede confiar solo en el
// campo `orden` porque pedidos viejos (previos a agregar estos tipos) ya tenían
// la tapa en -1 y el backfill no puede "insertar" un valor entre -1 y -1.
const PRIORIDAD_TIPO: Record<string, number> = {
  TAPA: 0,
  RETIRACION_TAPA: 1,
  A: 2,
  B: 2,
  C: 2,
  RETIRACION_CONTRATAPA: 3,
  CONTRATAPA: 4,
}

export function compararPaginasLibro(a: { tipo: string; orden: number }, b: { tipo: string; orden: number }): number {
  const pa = PRIORIDAD_TIPO[a.tipo] ?? 2
  const pb = PRIORIDAD_TIPO[b.tipo] ?? 2
  if (pa !== pb) return pa - pb
  return a.orden - b.orden
}

// Qué temática y estilo le toca a una página interior según su orden — misma
// fórmula usada tanto al generar como al mostrar la paginación en el admin
// antes de generar, para que sean siempre consistentes entre sí.
export function calcularAsignacionPagina(
  orden: number,
  tematicasEfectivas: string[],
  estilos: string[],
): { tematica: string; estilo: string; varianteIndex: number } {
  const tematica = tematicasEfectivas[orden % tematicasEfectivas.length] ?? tematicasEfectivas[0]
  const estilo = estilos[orden % estilos.length] ?? estilos[0]
  // Cuántas veces se repitió el ciclo de temáticas hasta esta página — así, cuando la
  // misma temática se repite en varias páginas, cada una pide una variante distinta.
  const varianteIndex = Math.floor(orden / tematicasEfectivas.length)
  return { tematica, estilo, varianteIndex }
}
