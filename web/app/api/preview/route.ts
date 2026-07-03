import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { subirArchivo, descargarArchivo, obtenerUrlFirmada } from '@/lib/r2'
import { ESTILO_PROMPT, TEMATICA_PROMPT, construirPromptEscena } from '@/lib/prompts'

export const maxDuration = 180

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  if (user.previewUsado) {
    const imageUrl = user.previewUrl ? await obtenerUrlFirmada(user.previewUrl) : null
    return NextResponse.json({ yaUsado: true, imageUrl })
  }

  const { fotoKey, tematica, estilo } = await req.json()

  if (!fotoKey || !tematica || !estilo) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }
  if (!fotoKey.startsWith(`temp/${session.user.id}/`)) {
    return NextResponse.json({ error: 'Foto inválida' }, { status: 403 })
  }
  if (!ESTILO_PROMPT[estilo] || !TEMATICA_PROMPT[tematica]) {
    return NextResponse.json({ error: 'Estilo o temática inválidos' }, { status: 400 })
  }

  try {
    const { buffer, contentType } = await descargarArchivo(fotoKey)
    const base64Image = buffer.toString('base64')

    const response = await client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_image', image_url: `data:${contentType};base64,${base64Image}`, detail: 'high' },
            { type: 'input_text', text: construirPromptEscena(estilo, tematica) },
          ],
        },
      ],
      tools: [{ type: 'image_generation', quality: 'high', size: '1024x1536' } as never],
    })

    const imageBlock = response.output.find(
      (item) => item.type === 'image_generation_call',
    ) as { type: string; result?: string } | undefined

    if (!imageBlock?.result) {
      return NextResponse.json({ error: 'GPT-4o no generó ninguna imagen' }, { status: 500 })
    }

    const resultBuffer = Buffer.from(imageBlock.result, 'base64')
    const previewKey = `previews/${session.user.id}.png`
    await subirArchivo(previewKey, resultBuffer, 'image/png')

    await prisma.user.update({
      where: { id: session.user.id },
      data: { previewUsado: true, previewUrl: previewKey },
    })

    const imageUrl = await obtenerUrlFirmada(previewKey)
    return NextResponse.json({ yaUsado: false, imageUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
