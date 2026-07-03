import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { subirArchivo } from '@/lib/r2'

const TIPOS_VALIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_BYTES = 15 * 1024 * 1024 // 15MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
  }

  if (!TIPOS_VALIDOS.includes(file.type)) {
    return NextResponse.json({ error: 'Formato no soportado. Usá JPG, PNG, WEBP o HEIC' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'La foto pesa demasiado (máximo 15MB)' }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'jpg'
  const key = `temp/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  await subirArchivo(key, bytes, file.type)

  return NextResponse.json({ key })
}
