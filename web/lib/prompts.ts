export const ESTILO_PROMPT: Record<string, string> = {
  REALISTA: `STYLE: Clean comic book / graphic novel line art — high-end personalized coloring book.
Variable line weight: thick bold outer contours, thin fine interior detail lines. Preserve the exact facial features and likeness of the child.`,
  PIXAR: `STYLE: Pixar-like 3D animated movie look redrawn as line art — rounded expressive shapes, big friendly eyes, soft simplified proportions, charming and warm. Keep the child's likeness recognizable but stylized.`,
  ANIME: `STYLE: Japanese anime line art — large expressive eyes, clean defined lines, dynamic hair shapes. Keep the child's likeness recognizable but stylized.`,
}

// Varias situaciones por temática — para que páginas repetidas con la misma
// temática (ej. dos páginas de "Princesas") no salgan casi idénticas.
export const TEMATICA_PROMPT: Record<string, string[]> = {
  Aventura: [
    'an adventurous jungle exploration scene with vines, a treasure map and ancient ruins in the background',
    'climbing a rocky mountain trail with a waterfall and lush cliffs in the background',
    'crossing a rope bridge over a canyon, with a distant ancient temple silhouette in the background',
    'paddling a small wooden boat down a jungle river, surrounded by exotic birds and giant leaves',
  ],
  Princesas: [
    'a fairy tale castle scene with towers and a grand staircase in the background, dressed as a princess/prince',
    'dancing at a grand ballroom, twirling under a golden chandelier, dressed in a beautiful gown',
    'sitting in a blooming enchanted garden with a fountain and rose bushes, wearing a royal outfit',
    'riding in a majestic horse-drawn carriage on the way to a royal ball',
  ],
  Dinosaurios: [
    'a prehistoric scene surrounded by friendly cartoon dinosaurs and tropical prehistoric plants',
    'discovering giant dinosaur eggs in a nest, with a gentle dinosaur family nearby',
    'riding on the back of a friendly long-necked dinosaur across a prehistoric valley',
    'exploring a volcano-rimmed prehistoric landscape with dinosaurs in the distance',
  ],
  Espacio: [
    'floating as an astronaut among planets, stars and a rocket ship in the background',
    'exploring the surface of the moon, planting a flag, with Earth visible in the sky',
    'piloting a friendly cartoon spaceship through a colorful asteroid field',
    'meeting a friendly cartoon alien on a distant colorful planet',
  ],
  Animales: [
    'surrounded by friendly cartoon animals (lion cub, rabbit, bird) in a cheerful forest scene',
    'having a picnic with friendly farm animals (a cow, chickens and a happy pig) in a sunny meadow',
    'swimming underwater with friendly dolphins, fish and a sea turtle',
    'having a tea party with woodland animals in a cozy treehouse',
  ],
  'Letras y números': [
    'leaning against or sitting on one giant, three-dimensional, corporeal-looking letter, sculpture-sized, with a few smaller decorative letters scattered in the background',
    'leaning against or sitting on one giant, three-dimensional, corporeal-looking number, sculpture-sized, with a few smaller decorative numbers scattered in the background',
    'climbing and playing among a row of giant colorful building-block letters like a playground',
    'sitting atop a giant number balanced like a seesaw, with smaller numbers scattered playfully around',
  ],
}

// Descripción genérica para temáticas personalizadas sin situaciones manuales
// cargadas (ver situacionesPorTematica del pedido) y sin entrada en el
// diccionario de arriba.
function escenaGenerica(tematica: string) {
  return `themed around: "${tematica}" — include clearly recognizable, iconic props, symbols and background elements strongly associated with this specific theme, so the theme is immediately identifiable, not a generic setting`
}

// Pose y ángulo rotan de forma independiente a la situación — así, aunque el
// libro repita mucho una misma temática (ej. 8 páginas de "Princesas" en un
// libro de 24 con 3 temáticas), el conjunto no se repite hasta pasadas varias
// decenas de páginas, sin depender de escribir a mano una variante por página.
const POSE_MODIFIERS = [
  'in a joyful, dynamic action pose, mid-movement',
  'in a calm, gentle pose, smiling softly at the viewer',
  'laughing with arms raised triumphantly',
  'in a curious pose, leaning in to look closely at something',
  'waving cheerfully with a big bright smile',
  'in a confident, heroic pose',
]

const ANGULO_MODIFIERS = [
  'shown in a close-up framing',
  'shown in a wide, full-body framing',
  'shown from a slightly low, heroic angle',
  'shown from a three-quarter view',
]

const BASE_PROMPT = `Transform this photo into a premium personalized coloring book page.

CRITICAL — THIS IS A COLORING PAGE:
- PURE WHITE background only. Zero gray, zero color, zero shading, zero fills.
- ALL lines are BLACK only.
- Portrait/vertical composition, open breathable areas between lines — satisfying to color.

FACES (most important): preserve individual likeness and expression of the child.`

// varianteIndex distingue páginas repetidas con la misma temática (ver
// generarImagen.ts: se calcula a partir de cuántas veces se repitió el ciclo
// de temáticas hasta esta página), para que no salgan casi idénticas.
//
// situacionesManuales: lista de situaciones puntuales cargadas por el admin
// para esta temática en ESTE pedido (ver campo situacionesPorTematica) — si
// están cargadas, se usan en vez de las predefinidas o la descripción genérica.
export function construirPromptEscena(
  estilo: string,
  tematica: string,
  varianteIndex = 0,
  situacionesManuales?: string[],
) {
  const variantes = situacionesManuales?.length ? situacionesManuales : TEMATICA_PROMPT[tematica]
  const situacion = variantes ? variantes[varianteIndex % variantes.length] : escenaGenerica(tematica)
  const pose = POSE_MODIFIERS[varianteIndex % POSE_MODIFIERS.length]
  const angulo = ANGULO_MODIFIERS[varianteIndex % ANGULO_MODIFIERS.length]
  const escena = `Place the child in this scene: ${situacion}. The child is ${pose}, ${angulo}.`
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
