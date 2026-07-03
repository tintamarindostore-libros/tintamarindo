import OpenAI from 'openai'
import { construirPromptEscena, construirPromptDirecto } from './prompts'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generarImagenLibro({
  fotoBase64,
  fotoMime,
  estilo,
  tematica,
  tipo,
}: {
  fotoBase64: string
  fotoMime: string
  estilo: string
  tematica: string
  tipo: 'A' | 'B' | 'C'
}): Promise<{ base64: string; prompt: string }> {
  const prompt = tipo === 'A' || tipo === 'C' ? construirPromptEscena(estilo, tematica) : construirPromptDirecto(estilo)

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
