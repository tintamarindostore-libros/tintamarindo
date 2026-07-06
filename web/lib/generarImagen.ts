import OpenAI from 'openai'
import { construirPromptEscena, construirPromptDirecto, construirPromptTapa } from './prompts'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generarImagenLibro({
  fotoBase64,
  fotoMime,
  estilo,
  tematica,
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
  tipo: 'A' | 'B' | 'C' | 'TAPA'
  titulo?: string | null
  subtitulo?: string | null
  observaciones?: string | null
  promptExtra?: string | null
}): Promise<{ base64: string; prompt: string }> {
  let prompt =
    tipo === 'TAPA'
      ? construirPromptTapa({ estilo, titulo, subtitulo, observaciones })
      : tipo === 'A' || tipo === 'C'
      ? construirPromptEscena(estilo, tematica!)
      : construirPromptDirecto(estilo)

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
    tools: [{ type: 'image_generation', quality: 'high', size: '1024x1536' } as never],
  })

  const imageBlock = response.output.find(
    (item) => item.type === 'image_generation_call',
  ) as { type: string; result?: string } | undefined

  if (!imageBlock?.result) throw new Error('GPT-4o no generó ninguna imagen')

  return { base64: imageBlock.result, prompt }
}
