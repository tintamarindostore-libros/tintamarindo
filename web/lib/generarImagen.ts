import OpenAI from 'openai'
import { construirPromptEscena, construirPromptTapa } from './prompts'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generarImagenLibro({
  fotoBase64,
  fotoMime,
  estilo,
  tematica,
  varianteIndex,
  situacionesManuales,
  tipo,
  titulo,
  subtitulo,
  observaciones,
  promptExtra,
}: {
  fotoBase64: string
  fotoMime: string
  estilo: string
  tematica?: string
  varianteIndex?: number
  situacionesManuales?: string[]
  tipo: string
  titulo?: string | null
  subtitulo?: string | null
  observaciones?: string | null
  promptExtra?: string | null
}): Promise<{ base64: string; prompt: string }> {
  // Todas las páginas interiores (A/B/C) llevan escena temática — antes el Tipo B
  // convertía la foto "tal cual" sin tema, y por una coincidencia de módulos esto
  // hacía que las temáticas personalizadas nunca se usaran cuando había 1 predefinida
  // + 1 personalizada (ambas rotaciones usan %2 y quedaban siempre sincronizadas).
  let prompt =
    tipo === 'TAPA'
      ? construirPromptTapa({ estilo, titulo, subtitulo, observaciones })
      : construirPromptEscena(estilo, tematica!, varianteIndex, situacionesManuales)

  if (promptExtra) prompt += `\n\nINSTRUCCIONES ADICIONALES PARA ESTA IMAGEN: ${promptExtra}`

  const response = await client.responses.create({
    model: 'gpt-4o',
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_image', image_url: `data:${fotoMime};base64,${fotoBase64}`, detail: 'high' },
          { type: 'input_text', text: prompt },
        ],
      },
    ],
    // Subido de 'medium' a 'high' para probar si mejora el detalle del line art —
    // más lento y más caro por imagen, pero con Vercel Pro (maxDuration 300s) hay margen.
    tools: [{ type: 'image_generation', quality: 'high', size: '1024x1536' } as never],
  })

  const imageBlock = response.output.find(
    (item) => item.type === 'image_generation_call',
  ) as { type: string; result?: string } | undefined

  if (!imageBlock?.result) throw new Error('GPT-4o no generó ninguna imagen')

  return { base64: imageBlock.result, prompt }
}
