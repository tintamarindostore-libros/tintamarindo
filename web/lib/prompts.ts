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
}

const BASE_PROMPT = `Transform this photo into a premium personalized coloring book page.

CRITICAL — THIS IS A COLORING PAGE:
- PURE WHITE background only. Zero gray, zero color, zero shading, zero fills.
- ALL lines are BLACK only.
- Portrait/vertical composition, open breathable areas between lines — satisfying to color.

FACES (most important): preserve individual likeness and expression of the child.`

export function construirPromptEscena(estilo: string, tematica: string) {
  const escena = TEMATICA_PROMPT[tematica]
    ?? `Place the child in a scene related to: ${tematica}. Design a vivid, imaginative setting with relevant props and background elements.`
  return `${BASE_PROMPT}\n\n${ESTILO_PROMPT[estilo]}\n\nSCENE: ${escena}\n\nPure white background. All lines strictly black. No color, no gray.`
}

// Tipo B — convierte la foto directamente a line art, sin escena temática agregada
export function construirPromptDirecto(estilo: string) {
  return `${BASE_PROMPT}\n\n${ESTILO_PROMPT[estilo]}\n\nDo not add any background scene — keep the original setting simplified to clean outlines.\n\nPure white background. All lines strictly black. No color, no gray.`
}
