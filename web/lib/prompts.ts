export const ESTILO_PROMPT: Record<string, string> = {
  REALISTA: `STYLE: Clean comic book / graphic novel line art — high-end personalized coloring book.
Variable line weight: thick bold outer contours, thin fine interior detail lines. Preserve the exact facial features and likeness of the child.`,
  PIXAR: `STYLE: Pixar-like 3D animated movie look redrawn as line art — rounded expressive shapes, big friendly eyes, soft simplified proportions, charming and warm. Keep the child's likeness recognizable but stylized.`,
  ANIME: `STYLE: Japanese anime line art — large expressive eyes, clean defined lines, dynamic hair shapes. Keep the child's likeness recognizable but stylized.`,
  GHIBLI: `STYLE: Studio Ghibli-inspired hand-painted anime line art — soft rounded features, warm expressive eyes, gentle whimsical linework reminiscent of Miyazaki films. Keep the child's likeness recognizable but stylized.`,
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
  'Con un perrito': [
    'playing fetch with a happy puppy in a sunny park, throwing a ball',
    'cuddling a fluffy puppy on a cozy blanket, surrounded by little paw prints',
    'walking a happy dog on a leash through a tree-lined path',
    'giving a puppy a bubble bath in a bucket, both covered in soap foam',
  ],
  'Con un gatito': [
    'playing with a curious kitten and a ball of yarn on the floor',
    'cuddling a fluffy kitten on a soft cushion, both looking cozy',
    'feeding a kitten from a little bowl in a cheerful kitchen scene',
    'a kitten perched on their shoulder while they smile, surrounded by paw print decorations',
  ],
  'Selección argentina': [
    'wearing a light blue and white striped soccer jersey like the Argentina national team, celebrating a goal on a soccer field with confetti falling',
    'wearing a light blue and white striped soccer jersey, holding a trophy up high like a champion, stadium lights in the background',
    'wearing a light blue and white striped soccer jersey, dribbling a soccer ball on the field with the crowd cheering in the stands',
    'wearing a light blue and white striped soccer jersey, wrapped in a flag, celebrating with teammates silhouettes in the background',
  ],
  Unicornios: [
    'riding a magical unicorn with a flowing rainbow mane through a sparkling meadow',
    'surrounded by friendly cartoon unicorns in an enchanted forest with rainbows and stars',
    'braiding the rainbow mane of a gentle unicorn in a field of flowers',
    'flying through a starry sky on the back of a majestic winged unicorn',
  ],
  Sirenas: [
    'swimming through a colorful coral reef as a mermaid/merman, surrounded by tropical fish',
    'sitting on a rock by the ocean under a starry sky, tail glimmering, waves below',
    'exploring a sunken treasure chest with pearls and seashells scattered on the ocean floor',
    'riding a friendly dolphin through crystal-clear underwater currents with sunlight beams',
  ],
  Piratas: [
    'standing on the deck of a pirate ship, holding a spyglass, sails and waves in the background',
    'digging for buried treasure on a tropical island with a treasure map and palm trees',
    'steering the wheel of a pirate ship during an adventurous storm at sea',
    'discovering a treasure chest overflowing with gold coins and jewels in a hidden cave',
  ],
  Bomberos: [
    'riding on a fire truck with sirens and ladders, ready for action',
    'wearing a firefighter helmet and uniform, holding a hose in front of a fire station',
    'climbing a tall ladder on a fire truck, city buildings in the background',
    'standing heroically next to a fire truck with hoses and rescue equipment nearby',
  ],
  Policías: [
    'wearing a police uniform and badge, standing next to a police car with lights flashing',
    'riding a police bike through a city street scene',
    'wearing a police uniform, directing traffic at a busy intersection with a whistle',
    'standing heroically in front of a police station with a badge shining',
  ],
  Caballos: [
    'riding a majestic horse through an open meadow with mountains in the background',
    'brushing and caring for a gentle horse in a cozy wooden stable',
    'jumping over a fence on horseback at an equestrian show',
    'standing beside a horse in a flower-filled pasture at sunset',
  ],
  Hadas: [
    'flying through an enchanted forest with sparkling fairy dust trailing behind, tiny wings glowing',
    'sitting on a giant mushroom in a magical garden, surrounded by fireflies and flowers',
    'casting sparkling magic with a wand in a moonlit clearing full of fairy lights',
    'perched on a flower petal alongside tiny fairy friends in an enchanted meadow',
  ],
  Fútbol: [
    'kicking a soccer ball on the field, mid-action, stadium crowd cheering in the background',
    'celebrating a goal with arms raised, confetti falling on the soccer field',
    'wearing a soccer uniform, dribbling the ball past cones during practice',
    'holding a soccer trophy up high, teammates cheering in the background',
  ],
  Circo: [
    'walking a tightrope high above a circus ring, balancing pole in hand, spotlight shining',
    'juggling colorful balls under the big top tent, circus audience cheering',
    'riding a friendly circus elephant in a colorful parade under the big top',
    'as a ringmaster in a circus ring, top hat and confetti falling, colorful tent in background',
  ],
  'Fondo del mar': [
    'swimming among friendly sea turtles and colorful fish in a vibrant coral reef',
    'exploring a sunken shipwreck surrounded by a curious octopus and schools of fish',
    'meeting a gentle giant whale underwater, sunlight streaming from the surface above',
    'discovering a hidden underwater cave full of glowing jellyfish and seashells',
  ],
  Robots: [
    'piloting a giant friendly robot through a futuristic city skyline',
    'building and tinkering with a cheerful robot friend in a workshop full of gears and gadgets',
    'riding alongside a cute robot companion through a sci-fi laboratory full of blinking lights',
    'exploring a futuristic space station with a friendly robot sidekick floating nearby',
  ],
  Halloween: [
    'trick-or-treating in a cute costume through a spooky-but-friendly neighborhood with jack-o-lanterns',
    'sitting in a pumpkin patch surrounded by friendly ghosts and carved pumpkins',
    'wearing a fun costume at a Halloween party with bats, spider webs and candy decorations',
    'walking through a friendly haunted house scene with cartoonish ghosts and cobwebs',
  ],
  Navidad: [
    'decorating a Christmas tree with ornaments and lights next to a cozy fireplace',
    'opening presents on Christmas morning surrounded by wrapped gifts and a decorated tree',
    'building a snowman outside with a scarf and hat, snowflakes falling',
    'sitting with Santa Claus by the Christmas tree, stockings hanging on the fireplace',
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
// Pose y ángulo, en cambio, rotan según `orden` (la página global del libro),
// NO según varianteIndex: cuando la cantidad de temáticas coincide con el
// "tamaño de bloque" de la rotación de variantes (ej. 3 temáticas → varianteIndex
// se mantiene igual durante 3 páginas seguidas), usar varianteIndex acá hacía que
// varias páginas consecutivas con temáticas distintas compartieran la misma pose.
//
// situacionesManuales: lista de situaciones puntuales cargadas por el admin
// para esta temática en ESTE pedido (ver campo situacionesPorTematica) — si
// están cargadas, se usan en vez de las predefinidas o la descripción genérica.
export function construirPromptEscena(
  estilo: string,
  tematica: string,
  orden: number,
  varianteIndex = 0,
  situacionesManuales?: string[],
) {
  const variantes = situacionesManuales?.length ? situacionesManuales : TEMATICA_PROMPT[tematica]
  const situacion = variantes ? variantes[varianteIndex % variantes.length] : escenaGenerica(tematica)
  const pose = POSE_MODIFIERS[orden % POSE_MODIFIERS.length]
  const angulo = ANGULO_MODIFIERS[orden % ANGULO_MODIFIERS.length]
  const escena = `Place the child in this scene: ${situacion}. The child is ${pose}, ${angulo}.`
  return `${BASE_PROMPT}\n\n${ESTILO_PROMPT[estilo]}\n\nSCENE: ${escena}\n\nPure white background. All lines strictly black. No color, no gray.`
}

// Tapa — a diferencia de las páginas interiores, va a color y con tipografía (título/subtítulo)
export const ESTILO_PROMPT_TAPA: Record<string, string> = {
  REALISTA: `STYLE: Vibrant, fully-colored children's book cover illustration, semi-realistic style with soft painterly shading and warm lighting. Preserve the exact facial features and likeness of the child.`,
  PIXAR: `STYLE: Pixar-like 3D animated movie look, fully rendered in vivid color — rounded expressive shapes, big friendly eyes, soft simplified proportions, warm lighting and shading. Keep the child's likeness recognizable but stylized.`,
  ANIME: `STYLE: Japanese anime illustration, fully rendered in vivid color — large expressive eyes, clean defined lines, dynamic hair shapes, vibrant color palette. Keep the child's likeness recognizable but stylized.`,
  GHIBLI: `STYLE: Studio Ghibli-inspired illustration, fully rendered in soft vivid color — warm painterly backgrounds, gentle whimsical characters, lush nature details reminiscent of Miyazaki films. Keep the child's likeness recognizable but stylized.`,
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
