# TINTAMORA — Contexto del proyecto para Claude Code

## Qué es este proyecto

App web donde el cliente sube fotos de un niño, elige temática, estilo artístico y tipo de papel, ve una imagen de prueba gratuita y paga. El dueño genera el libro completo en el back, lo revisa imagen por imagen, arma el PDF y lo manda al cliente con marca de agua para aprobación. Una vez aprobado, el dueño imprime el libro físico y lo envía por correo a cualquier punto de Argentina.

**Para el detalle completo de producto (flujo de pantallas, copy de cara al cliente, precios, política de privacidad, integración de envíos y pagos, etc.) ver `PRODUCTO.md`.** Leerlo cuando se trabaje en UI, contenido, flujo de compra o reglas de negocio — no hace falta para tareas puramente técnicas (setup, deploy, dependencias).

## Stack

- Next.js 15 + TypeScript + Tailwind CSS v4 + pnpm
- Autenticación: Google OAuth (next-auth)
- Pagos: MercadoPago + transferencia bancaria directa
- Envíos: API de MiCorreo (Correo Argentino)
- Almacenamiento de imágenes: Cloudflare R2 (bucket privado, URLs firmadas)
- Base de datos: Postgres
- Commits en español

## Modelo de IA

- **GPT-4o image generation nativo** — NO usar DALL-E 3
- DALL-E 3 no respeta rasgos faciales. GPT-4o nativo sí los preserva.
- Costo por imagen generada: USD 0.20
- Script base ya funciona en `src/generate-coloring-page.ts`
- **Importante (de cara al cliente):** en ningún texto orientado al usuario se menciona "inteligencia artificial" ni el nombre del modelo. Se usa "herramientas de última tecnología". Detalle completo del copy en `PRODUCTO.md`.

## Decisiones tomadas — no reabrir

| Decisión | Resolución |
|---|---|
| Modelo de IA | GPT-4o nativo (no DALL-E 3) |
| Preview del cliente | 1 imagen de prueba gratuita con marca de agua, ligada a Google ID |
| Generación del libro completo | La hace el dueño en el back, sin el cliente esperando |
| Autenticación | Google OAuth obligatorio antes de subir fotos |
| Producto final | Libro impreso físico enviado por correo — no PDF descargable |
| Aprobación final | Cliente aprueba PDF con marca de agua; 5 días de plazo, luego auto-aprobación |
| Producción | El dueño arma e imprime cada libro manualmente (escala después) |
| Quién puede comprar | No se restringe a padres/tutores — cualquiera con autorización de la familia |
| Envíos | Costo variable vía API de MiCorreo según peso/dimensiones y código postal |
| Pago | MercadoPago (precio de lista) o transferencia bancaria (con descuento) |
| Botón de arrepentimiento | Obligatorio por ley, pero el producto es personalizado (excepción art. 1116 CCCN) — solo aplica si se cancela dentro de 48hs y antes de iniciar la generación |
| Tapa y regalo | Solapas dentro de la pantalla de configuración, no pasos del checkout |
| Temáticas por tamaño | 24 pág: hasta 3. 32 pág: hasta 5 + opción de temática personalizada (texto libre) |
| Estilos por tamaño | 24 pág: hasta 2. 32 pág: hasta 3. Si hay varios, se aplican aleatoriamente |
| Imagen familiar | Solo en 32 pág. El cliente sube foto grupal; la IA dibuja a todo el grupo como personajes en la escena |

*(Justificación y detalle de cada una de estas decisiones en `PRODUCTO.md`)*

## Estructura de archivos

```
colorear-kids/
├── CLAUDE.md           ← este archivo (contexto técnico esencial)
├── PRODUCTO.md         ← detalle de producto, flujo, copy, precios, legal
├── TODO.md             ← seguimiento de tareas por fase
├── src/
│   └── generate-coloring-page.ts   ← script de generación standalone (Fase 1 ✅)
├── web/                ← app Next.js 15 (Fase 2+)
│   ├── app/
│   │   ├── page.tsx                ← landing + CTA "Crear mi libro"
│   │   ├── providers.tsx           ← SessionProvider para next-auth
│   │   ├── components/Footer.tsx   ← footer global (FAQ, arrepentimiento, términos)
│   │   ├── (content)/              ← páginas de contenido/legal (route group, no afecta URL)
│   │   │   ├── layout.tsx          ← header con "← Inicio" compartido
│   │   │   ├── faq/page.tsx        ← preguntas frecuentes
│   │   │   ├── arrepentimiento/page.tsx ← botón de arrepentimiento
│   │   │   └── terminos/page.tsx   ← términos y condiciones
│   │   ├── crear/Wizard.tsx        ← wizard de pedido (state machine, 6 pasos)
│   │   ├── admin/                  ← panel de administración (protegido por ADMIN_EMAIL)
│   │   │   ├── page.tsx            ← lista de pedidos con filtros
│   │   │   └── [id]/PedidoDetalle.tsx ← detalle, generación imagen por imagen
│   │   └── api/
│   │       ├── auth/[...nextauth]/ ← handler de NextAuth v5
│   │       ├── upload/             ← subida de fotos a R2
│   │       ├── preview/            ← generación de imagen de prueba con marca de agua
│   │       ├── pedidos/            ← crear pedido, listar pedidos
│   │       ├── generate/           ← generación de páginas del libro (uso admin)
│   │       └── admin/pedidos/[id]/ ← generar, PDF, tracking, aprobar imagen
│   ├── lib/
│   │   ├── prisma.ts               ← cliente Prisma
│   │   ├── r2.ts                   ← cliente Cloudflare R2 + URLs firmadas
│   │   ├── generarImagen.ts        ← wrapper GPT-4o image generation
│   │   ├── prompts.ts              ← prompts de generación
│   │   └── admin.ts                ← helpers del panel admin
│   ├── prisma/schema.prisma        ← esquema DB (User, Pedido, FotoCliente, ImagenPedido)
│   ├── auth.ts                     ← config NextAuth v5 (Google OAuth + Prisma adapter)
│   ├── .env.local                  ← vars de entorno local (no commitear)
│   └── .env.local.example          ← plantilla de variables
├── docs/               ← documentos de producto (FAQ, arrepentimiento, términos — fuente de verdad)
│   ├── tintamora-faq.docx
│   ├── tintamora-boton-arrepentimiento.docx
│   └── tintamora-terminos-y-condiciones.docx
├── output/             ← imágenes generadas (gitignored)
├── samples/            ← fotos de prueba
├── .env.example
└── package.json
```

## Cómo ejecutar

```bash
# Script de generación standalone (Fase 1)
npm run generate -- samples/foto.jpg
# Output: output/colorear_foto.png

# App web (Fase 2+) — desde la carpeta web/
cd web
npm run dev          # servidor de desarrollo en localhost:3000
npm run build        # verificar que compila sin errores
npx prisma studio    # editor visual de la base de datos
npx prisma migrate dev --name <nombre>  # aplicar cambios al esquema
```

## Skills disponibles en este workspace

- `nuevo-proyecto` — onboarding de proyecto nuevo
- `componente-nuevo` — construir secciones de UI
- `qa-visual` — verificación visual con Playwright
- `brief-cliente` — preparación de reunión con cliente
- `presupuesto-cliente` — generación de presupuesto
- **Pendiente crear:** `integracion-pagos` (Fase 3)
- **Pendiente crear:** `agente-whatsapp` (Fase futura, n8n + Evolution API)
