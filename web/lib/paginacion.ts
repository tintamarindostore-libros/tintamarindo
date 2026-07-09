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
