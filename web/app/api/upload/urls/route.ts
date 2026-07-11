import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { obtenerUrlFirmada } from '@/lib/r2'

// Para redibujar las miniaturas de fotos ya subidas cuando se retoma el wizard
// desde un progreso guardado (el blob: URL original no sobrevive a una
// recarga de página, pero el archivo sigue en R2 con la misma key).
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { keys } = await req.json()
  if (!Array.isArray(keys)) {
    return NextResponse.json({ error: 'Faltan claves' }, { status: 400 })
  }

  const propias = keys.filter(
    (k): k is string => typeof k === 'string' && k.startsWith(`temp/${session.user!.id}/`),
  )

  const entradas = await Promise.all(propias.map(async (key) => [key, await obtenerUrlFirmada(key)] as const))
  return NextResponse.json({ urls: Object.fromEntries(entradas) })
}
