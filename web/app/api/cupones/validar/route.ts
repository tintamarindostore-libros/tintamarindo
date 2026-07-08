import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { validarCupon } from '@/lib/cupones'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { codigo } = await req.json()
  if (typeof codigo !== 'string') {
    return NextResponse.json({ error: 'Falta el código' }, { status: 400 })
  }

  const resultado = await validarCupon(codigo)
  if (!resultado.valido) {
    return NextResponse.json({ error: resultado.error }, { status: 400 })
  }

  return NextResponse.json({ descuentoPorcentaje: resultado.descuentoPorcentaje })
}
