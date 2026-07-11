# TINTAMARINDO — Contexto del proyecto para Claude Code

## Qué es este proyecto

App web donde el cliente sube fotos de un niño, elige temática, estilo artístico y tipo de papel, ve una imagen de prueba gratuita y paga. El dueño genera el libro completo en el back, lo revisa imagen por imagen, arma el PDF y lo manda al cliente con marca de agua para aprobación. Una vez aprobado, el dueño imprime el libro físico y lo envía por correo a cualquier punto de Argentina.

**Para el detalle completo de producto (flujo de pantallas, copy de cara al cliente, precios, política de privacidad, integración de envíos y pagos, etc.) ver `PRODUCTO.md`.** Leerlo cuando se trabaje en UI, contenido, flujo de compra o reglas de negocio — no hace falta para tareas puramente técnicas (setup, deploy, dependencias).

## Stack

- Next.js 15 + TypeScript + Tailwind CSS v4
- Autenticación: Google OAuth (next-auth v5, sesiones en DB)
- Pagos: MercadoPago (desactivado en localhost) + transferencia bancaria directa (con descuento) — Fase 3, en desarrollo
- Envíos: costo "a confirmar" (no se cobra en el checkout) en `web/lib/envio.ts` — mientras Correo Argentino no habilita el acceso a la API de MiCorreo (cuenta registrada, en trámite comercial), se confirma por WhatsApp/email antes de despachar
- Almacenamiento de imágenes: Cloudflare R2 (bucket privado, URLs firmadas)
- Base de datos: PostgreSQL en Supabase (São Paulo) — `DATABASE_URL` transaction pooler, `DIRECT_URL` session pooler
- Commits en español

## Modelo de IA

- **GPT-4o image generation nativo** — NO usar DALL-E 3
- DALL-E 3 no respeta rasgos faciales. GPT-4o nativo sí los preserva.
- Costo por imagen generada: USD 0.20
- Se generan dos tipos de imagen con prompts distintos (`web/lib/prompts.ts`):
  - **Páginas interiores** (tipo A/B/C): blanco y negro, line art, para colorear.
  - **Tapa** (tipo TAPA): a color, con tipografía del título/subtítulo renderizada sobre la ilustración — usa `estiloTapa` + `observacionesTapa` del pedido como guía del prompt.
- Cada imagen (`ImagenPedido`) tiene un campo `promptExtra` editable desde el admin para instrucciones puntuales antes de generar/regenerar esa imagen en particular.
- El admin puede generar todas las imágenes faltantes en secuencia, o generar/regenerar una imagen puntual desde su propia card (para no gastar créditos de más y poder ajustar el proceso de a una).
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
| Envíos | Costo "a confirmar" (no se cobra en el checkout) hasta tener acceso a la API de MiCorreo — se confirma por WhatsApp/email antes de despachar |
| Pago | MercadoPago (precio de lista) o transferencia bancaria (10% descuento) |
| Botón de arrepentimiento | Obligatorio por ley, pero el producto es personalizado (excepción art. 1116 CCCN) — solo aplica si se cancela dentro de 48hs y antes de iniciar la generación |
| Tapa | Solapa dentro de la pantalla de configuración, no un paso del checkout. La opción "Regalo" (tarjeta personalizada) se evaluó y se **eliminó** del producto — no reabrir sin pedido explícito |
| Tarjeta de dedicatoria | El cliente elige entre diseños prediseñados en miniatura (o "Sin tarjeta"), no escribe un mensaje digital. Se imprime en blanco en la retiración de tapa para completar a mano. Catálogo en `web/lib/tarjetasDedicatoria.ts` |
| Estados del pedido | `ESPERANDO_PAGO → ESPERANDO_GENERACION → EN_REVISION → ESPERANDO_APROBACION → APROBADO → EN_IMPOSICION → IMPRIMIENDO → ENVIADO`. Se puede mover manualmente con un desplegable en el admin (lista y detalle) — ver `web/lib/estados.ts` |
| Temáticas por tamaño | 24 pág: hasta 8. 32 pág: hasta 15 + hasta 3 temáticas personalizadas (texto libre) |
| Estilos por tamaño | 24 pág: hasta 3. 32 pág: hasta 4. Si hay varios, se aplican aleatoriamente |
| Estilo de tapa | Selector obligatorio (Realista/Pixar/Anime/Ghibli), independiente de los estilos del interior |
| Imagen familiar | Solo en 32 pág. El cliente sube foto grupal; la IA dibuja a todo el grupo como personajes en la escena |
| Tipo de entrega | Sucursal (dirección opcional, se coordina después) o domicilio |

*(Justificación y detalle de cada una de estas decisiones en `PRODUCTO.md`)*

## Estructura de archivos

```
tintamarindo/
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
│   │   ├── crear/Wizard.tsx        ← wizard de pedido (state machine, 5 pasos + confirmación; progreso persistido en sessionStorage para volver atrás sin recargar)
│   │   ├── admin/                  ← panel de administración (protegido por ADMIN_EMAIL)
│   │   │   ├── page.tsx            ← lista de pedidos con filtros + EstadoSelector (desplegable de estado)
│   │   │   ├── EstadoSelector.tsx  ← desplegable para mover el estado de un pedido manualmente
│   │   │   ├── cupones/            ← alta/edición de cupones de descuento
│   │   │   ├── mensajes/           ← edición de plantillas de mensajes (PlantillaMensaje)
│   │   │   ├── compradores/        ← listado de compradores
│   │   │   └── [id]/PedidoDetalle.tsx ← detalle, generación imagen por imagen (tapa + páginas), desplegable de estado, descarga .zip de todas las imágenes, exportar prompts .txt
│   │   └── api/
│   │       ├── auth/[...nextauth]/ ← handler de NextAuth v5
│   │       ├── upload/             ← subida de fotos a R2 (+ upload/urls: firma URLs para fotos ya subidas, usado al restaurar el wizard)
│   │       ├── preview/            ← generación de imagen de prueba con marca de agua (requiere sesión, 1 por usuario)
│   │       ├── pedidos/            ← crear pedido, listar pedidos
│   │       ├── cupones/validar/    ← valida un cupón cargado por el cliente en el checkout
│   │       ├── webhooks/mercadopago/ ← recibe confirmación de pago (firma HMAC verificada)
│   │       └── admin/pedidos/[id]/ ← generar (secuencial), imagenes/[imgId] (generar/regenerar/aprobar/subir manual/prompt puntual), estado (mover manualmente), PDF, tracking, descargar-imagenes (.zip), descargar-prompts (.txt), verificar-pago, confirmar-transferencia
│   ├── lib/
│   │   ├── prisma.ts               ← cliente Prisma
│   │   ├── r2.ts                   ← cliente Cloudflare R2 + URLs firmadas
│   │   ├── generarImagen.ts        ← wrapper GPT-4o image generation (interior y tapa)
│   │   ├── prompts.ts              ← prompts de generación (line art interior + color/tipografía tapa, por temática y estilo)
│   │   ├── precios.ts              ← precios de lanzamiento del libro + descuento transferencia
│   │   ├── envio.ts                ← costo de envío "a confirmar" (interino, sin API de MiCorreo)
│   │   ├── estados.ts              ← lista de estados del pedido + labels, usado en admin y API
│   │   ├── tarjetasDedicatoria.ts  ← catálogo de diseños de tarjeta de dedicatoria
│   │   ├── cupones.ts              ← validación de cupones de descuento
│   │   ├── confirmarPago.ts        ← reconfirma un pago contra la API de MercadoPago (webhook y pantalla de retorno)
│   │   ├── notificarPedido.ts      ← aviso al dueño por WhatsApp vía webhook a n8n
│   │   ├── datosBancarios.ts       ← datos para pago por transferencia
│   │   ├── paginacion.ts           ← asignación de temática/estilo por página del libro
│   │   ├── plantillas.ts           ← config de plantillas de mensajes
│   │   └── admin.ts                ← helpers del panel admin (checkAdminAccess / requireAdmin)
│   ├── prisma/schema.prisma        ← esquema DB (User, Pedido, FotoCliente, ImagenPedido)
│   ├── auth.ts                     ← config NextAuth v5 (Google OAuth + Prisma adapter)
│   ├── .env.local                  ← vars de entorno local (no commitear)
│   └── .env.example                ← plantilla de variables
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
npx prisma db push   # aplicar cambios al esquema (no se usan migrations, ver nota abajo)
```

**Nota sobre el esquema de base de datos:** este proyecto usa `prisma db push` en vez de `prisma migrate` (no hay carpeta `prisma/migrations`). Cada cambio de schema requiere `npx prisma db push` seguido de `npx prisma generate`, y **reiniciar el servidor de desarrollo** — el proceso de `next dev` ya corriendo se queda con el cliente Prisma viejo en memoria y tira `Unknown argument` hasta reiniciarlo.

## Seguridad

Auditoría completa realizada el 2026-07-11 (código estático, autenticación/IDOR + validación de inputs/pagos). El hallazgo crítico (`/api/generate`, endpoint de generación de imágenes sin autenticación y sin uso real) se eliminó ese mismo día. Quedan pendientes, de riesgo medio, sin resolver todavía:

- Webhook de MercadoPago (`app/api/webhooks/mercadopago/route.ts`) acepta avisos sin firma si falta `MERCADOPAGO_WEBHOOK_SECRET` en producción — debería fallar cerrado en vez de dejar pasar. Mitigado porque el pago igual se reconfirma contra la API de MercadoPago antes de aprobar un pedido.
- `/api/preview` tiene una condición de carrera: dos pedidos simultáneos del mismo usuario podrían generar más de 1 vista previa gratis.
- `/api/cupones/validar` no tiene límite de intentos — se podría probar códigos por fuerza bruta.

No reabrir la revisión completa sin necesidad — son mejoras puntuales, no hay nada explotable hoy que comprometa datos, pagos o pedidos ajenos.

## Skills disponibles en este workspace

- `integracion-pagos` — guía de implementación de Fase 3 (MercadoPago, transferencia bancaria, emails Resend, cotización MiCorreo, cron de auto-aprobación)
- `nuevo-proyecto` — onboarding de proyecto nuevo
- `componente-nuevo` — construir secciones de UI
- `qa-visual` — verificación visual con Playwright
- `brief-cliente` — preparación de reunión con cliente
- `presupuesto-cliente` — generación de presupuesto
- **Pendiente crear:** `agente-whatsapp` (Fase futura, n8n + Evolution API)
