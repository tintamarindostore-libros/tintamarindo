const TIMEZONE_AR = 'America/Argentina/Buenos_Aires'

export function formatoFechaHora(fecha: Date): string {
  return fecha.toLocaleString('es-AR', {
    timeZone: TIMEZONE_AR,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Días corridos desde una fecha hasta ahora (para mostrar "hace X días" en el admin)
export function diasDesde(fecha: Date): number {
  return Math.floor((Date.now() - fecha.getTime()) / 86_400_000)
}

const AR_OFFSET_MS = 3 * 3600_000 // Argentina es UTC-3 fijo, sin horario de verano

// Instante UTC real que corresponde a la medianoche de Buenos Aires, N días atrás.
export function inicioDiaBuenosAires(diasAtras = 0): Date {
  const naiveBA = new Date(Date.now() - AR_OFFSET_MS)
  const medianocheNaive = Date.UTC(naiveBA.getUTCFullYear(), naiveBA.getUTCMonth(), naiveBA.getUTCDate() - diasAtras)
  return new Date(medianocheNaive + AR_OFFSET_MS)
}
