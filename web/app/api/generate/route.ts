import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 120

const PROMPTS: Record<string, string> = {
  realista: `Transform this photo into a professional premium coloring book page.

STYLE: Clean comic book / graphic novel line art — high-end personalized coloring book
- Variable line weight: thick bold outer contours, thin fine interior detail lines
- NO cross-hatching, NO gray fills, NO shading — pure black lines on white only
- Open breathable areas between lines — satisfying to color with crayons or markers
- Portrait/vertical composition

FACES (most important):
- Preserve the exact facial features, expressions, and individual likeness of every person
- Detailed eyes, nose, mouth, eyebrows — not generic cartoon faces
- Hair: clean flowing outline lines, not dense scribbles

CLOTHING:
- Outline main shapes + key details (drawstrings, zippers, prints)
- Keep fabric areas open for coloring

BACKGROUND:
- Preserve all scene elements with simplified clean outlines
- Recognizable but not cluttered

Pure white background. All lines strictly black. No color, no gray.`,

  infantil: `Transform this photo into a children's coloring book page in cute cartoon style.

CRITICAL — THIS IS A COLORING PAGE:
- PURE WHITE background only. Zero gray, zero color, zero shading, zero fills of any kind.
- ALL lines are BLACK only. Nothing else exists in the image.
- Every area must be completely white and empty — ready to be colored by a child with crayons.

STYLE: Fun cheerful cartoon — like pages from a children's illustrated coloring book
- Bold thick black outlines throughout, simple rounded shapes
- Cute cartoon faces: big expressive eyes (just outlines), small round nose, wide smile
- Do NOT make realistic portraits — reimagine everyone as lovable cartoon characters
- Keep general likeness (hair shape, clothing type) but fully cartoonify

CHARACTERS:
- Outline only — no fills, no gray inside shapes
- Clothing: simple cartoon outline shapes with fun details
- Hair: simple outline shapes, not realistic strands

BACKGROUND:
- Fun cartoon version of the scene — outlined shapes only, no fills
- Add fun outline decorations (stars, hearts, waves, clouds) in empty spaces

RESULT: A completely white page with only black outlines — identical format to a printed coloring book.`,
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'API key no configurada en el servidor' }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File | null
    const style = formData.get('style') as string | null

    if (!file || !style) {
      return NextResponse.json({ error: 'Faltan parámetros: image y style son requeridos' }, { status: 400 })
    }

    if (!PROMPTS[style]) {
      return NextResponse.json({ error: 'Estilo inválido. Usar: realista | infantil' }, { status: 400 })
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp']
    const mimeType = file.type || 'image/jpeg'
    if (!validMimes.includes(mimeType)) {
      return NextResponse.json({ error: 'Formato de imagen no soportado' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString('base64')

    const response = await client.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_image',
              image_url: `data:${mimeType};base64,${base64Image}`,
              detail: 'high',
            },
            {
              type: 'input_text',
              text: PROMPTS[style],
            },
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

    return NextResponse.json({ image: imageBlock.result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
