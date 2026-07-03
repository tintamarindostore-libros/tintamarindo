import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const SUPPORTED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

type Style = 'realista' | 'infantil';

const PROMPTS: Record<Style, string> = {
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
- If any area has gray, color, or fill → it is WRONG. The child needs to color it themselves.

STYLE: Fun cheerful cartoon — like pages from a children's illustrated coloring book
- Bold thick black outlines throughout, simple rounded shapes
- Cute cartoon faces: big expressive eyes (just outlines), small round nose, wide smile
- Do NOT make realistic portraits — reimagine everyone as lovable cartoon characters
- Keep general likeness (hair shape, clothing type) but fully cartoonify
- Cartoon proportions: slightly big heads, simple expressive features

CHARACTERS:
- Outline only — no fills, no gray inside shapes
- Clothing: simple cartoon outline shapes with fun details (stars, stripes, logos as outlines)
- Hair: simple outline shapes, not realistic strands

BACKGROUND:
- Fun cartoon version of the scene — outlined shapes only, no fills
- Add fun outline decorations (stars, hearts, waves, clouds, swirls) in empty spaces

RESULT: A completely white page with only black outlines — identical format to a printed coloring book.`,
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getMimeType(filePath: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

async function generateColoringPage(imagePath: string, style: Style): Promise<Buffer> {
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  const mimeType = getMimeType(imagePath);

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
  });

  const imageBlock = response.output.find(
    (item) => item.type === 'image_generation_call'
  ) as { type: string; result?: string } | undefined;

  if (!imageBlock?.result) {
    const textOutput = response.output_text ?? JSON.stringify(response.output);
    throw new Error(`GPT-4o no devolvió imagen. Respuesta: ${textOutput}`);
  }

  return Buffer.from(imageBlock.result, 'base64');
}

async function main() {
  const inputPath = process.argv[2];
  const styleArg = process.argv[3] ?? 'realista';

  if (!inputPath) {
    console.error('Uso: npm run generate -- <foto.jpg> [realista|infantil]');
    console.error('Estilos disponibles: realista (default), infantil');
    process.exit(1);
  }

  if (styleArg !== 'realista' && styleArg !== 'infantil') {
    console.error(`Estilo inválido: "${styleArg}". Usar: realista | infantil`);
    process.exit(1);
  }

  const style = styleArg as Style;
  const ext = path.extname(inputPath).toLowerCase();

  if (!SUPPORTED_EXTS.includes(ext)) {
    console.error(`Formato no soportado: ${ext}. Usar: ${SUPPORTED_EXTS.join(', ')}`);
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`No se encontró el archivo: ${inputPath}`);
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('Falta la variable de entorno OPENAI_API_KEY');
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const baseName = path.basename(inputPath, ext);
  const outputImage = path.join(OUTPUT_DIR, `colorear_${baseName}_${style}.png`);

  console.log(`\nFoto:   ${inputPath}`);
  console.log(`Estilo: ${style}`);
  console.log('━'.repeat(50));
  console.log('\nGenerando con GPT-4o image generation nativo...');
  console.log('Puede tardar 30-60 segundos...\n');

  const imageBuffer = await generateColoringPage(inputPath, style);
  fs.writeFileSync(outputImage, imageBuffer);

  console.log(`\n━`.repeat(50));
  console.log(`Página guardada: ${outputImage}`);
}

main().catch((err: Error) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
