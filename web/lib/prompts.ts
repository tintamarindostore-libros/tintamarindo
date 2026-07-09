export const ESTILO_PROMPT: Record<string, string> = {
  REALISTA: `STYLE: Clean comic book / graphic novel line art — high-end personalized coloring book.
Variable line weight: thick bold outer contours, thin fine interior detail lines. Preserve the exact facial features and likeness of the child.`,
  PIXAR: `STYLE: Pixar-like 3D animated movie look redrawn as line art — rounded expressive shapes, big friendly eyes, soft simplified proportions, charming and warm. Keep the child's likeness recognizable but stylized.`,
  ANIME: `STYLE: Japanese anime line art — large expressive eyes, clean defined lines, dynamic hair shapes. Keep the child's likeness recognizable but stylized.`,
}

export const TEMATICA_PROMPT: Record<string, string> = {
  Aventura: 'Place the child in an adventurous jungle exploration scene with vines, a treasure map and ancient ruins in the background.',
  Princesas: 'Place the child as a princess/prince in a fairy tale castle scene with towers and a grand staircase in the background.',
  Dinosaurios: 'Place the child in a prehistoric scene surrounded by friendly cartoon dinosaurs and tropical prehistoric plants.',
  Espacio: 'Place the child as an astronaut floating among planets, stars and a rocket ship in the background.',
  Animales: 'Place the child surrounded by friendly cartoon animals (lion cub, rabbit, bird) in a cheerful forest scene.',
  'Letras y números': 'Place the child leaning against or sitting on one giant, three-dimensional, corporeal-looking letter or number (like a big walk-in sculpture the size of a small building), with a few smaller decorative letters and numbers playfully scattered in the background — a whimsical alphabet/numbers playground scene.',
}

const BASE_PROMPT = `Transform this photo into a premium personalized coloring book page.

CRITICAL — THIS IS A COLORING PAGE:
- PURE WHITE background only. Zero gray, zero color, zero shading, zero fills.
- ALL lines are BLACK only.
- Portrait/vertical composition, open breathable areas between lines — satisfying to color.

FACES (most important): preserve individual likeness and expression of the child.`

export function construirPromptEscena(estilo: string, tematica: string) {
  const escena = TEMATICA_PROMPT[tematica]
    ?? `Place the child in a scene themed around: "${tematica}". Include clearly recognizable, iconic props, symbols and background elements strongly associated with this specific theme, so the theme is immediately identifiable — not a generic setting.`
  return `${BASE_PROMPT}\n\n${ESTILO_PROMPT[estilo]}\n\nSCENE: ${escena}\n\nPure white background. All lines strictly black. No color, no gray.`
}

// Tapa — a diferencia de las páginas interiores, va a color y con tipografía (título/subtítulo)
export const ESTILO_PROMPT_TAPA: Record<string, string> = {
  REALISTA: `STYLE: Vibrant, fully-colored children's book cover illustration, semi-realistic style with soft painterly shading and warm lighting. Preserve the exact facial features and likeness of the child.`,
  PIXAR: `STYLE: Pixar-like 3D animated movie look, fully rendered in vivid color — rounded expressive shapes, big friendly eyes, soft simplified proportions, warm lighting and shading. Keep the child's likeness recognizable but stylized.`,
  ANIME: `STYLE: Japanese anime illustration, fully rendered in vivid color — large expressive eyes, clean defined lines, dynamic hair shapes, vibrant color palette. Keep the child's likeness recognizable but stylized.`,
}

const BASE_PROMPT_TAPA = `Design a premium, full-color children's book COVER illustration featuring this child as the main character.

CRITICAL — THIS IS A BOOK COVER, NOT A COLORING PAGE:
- FULL COLOR, richly illustrated, print-ready book cover quality.
- Portrait/vertical composition (book cover proportions).
- Leave a clear, uncluttered area for the title typography to stand out.

FACES (most important): preserve individual likeness and expression of the child.

TYPOGRAPHY: Render the following text directly on the cover as attractive, legible book-title typography, like a real children's book cover:`

export function construirPromptTapa({
  estilo,
  titulo,
  subtitulo,
  observaciones,
}: {
  estilo: string
  titulo?: string | null
  subtitulo?: string | null
  observaciones?: string | null
}) {
  const lineaTitulo = titulo ? `Title: "${titulo}"` : ''
  const lineaSubtitulo = subtitulo ? `Subtitle (smaller, below the title): "${subtitulo}"` : ''
  const lineaObservaciones = observaciones ? `\n\nADDITIONAL INSTRUCTIONS FROM THE CUSTOMER: ${observaciones}` : ''
  return `${BASE_PROMPT_TAPA}\n${lineaTitulo}\n${lineaSubtitulo}\n\n${ESTILO_PROMPT_TAPA[estilo]}${lineaObservaciones}`
}
