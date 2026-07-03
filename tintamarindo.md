# Tintamarindo — Documentación técnica y funcional

> Libros de colorear personalizados con foto, impresos y enviados a todo el país.
> Última actualización: julio 2026.

---

## 1. Descripción del producto

El cliente sube fotos de su hijo/a, elige la temática (aventura, princesas, dinosaurios, etc.), el estilo artístico (Realista, Pixar, Anime) y el tamaño (24 o 32 páginas). El sistema genera ilustraciones personalizadas con la cara del niño usando GPT-4o. El dueño revisa las imágenes, arma el PDF e imprime el libro. Se envía por Correo Argentino a cualquier punto del país.

**Precio de prueba actual:** $24 ARS (libro 24 pág) / $32 ARS (libro 32 pág). Actualizar en `lib/precios.ts` antes del lanzamiento.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| ORM | Prisma v7 (cliente generado en `lib/generated/prisma`) |
| Base de datos | PostgreSQL (panel.cordiatec.com:5560/colorear-kids) |
| Autenticación | next-auth v5 — Google OAuth únicamente |
| Almacenamiento | Cloudflare R2 — bucket privado, acceso solo por URLs firmadas |
| Generación de imágenes | GPT-4o (image generation nativa — NO DALL-E 3) |
| Pagos | MercadoPago Checkout Pro |
| Emails | Resend + react-email |
| Envíos | Correo Argentino MiCorreo (pendiente de integrar) |
| Deploy | Vercel (pendiente) |

---

## 3. Estructura de carpetas

```
colorear-kids/
├── web/                         ← aplicación Next.js
│   ├── app/
│   │   ├── page.tsx             ← Home / landing
│   │   ├── layout.tsx           ← Layout raíz (SEO, fuentes, footer)
│   │   ├── globals.css
│   │   ├── providers.tsx        ← SessionProvider de next-auth
│   │   ├── auth.ts              ← Configuración de next-auth
│   │   │
│   │   ├── crear/               ← Wizard de creación del libro
│   │   │   ├── page.tsx
│   │   │   └── Wizard.tsx       ← Componente principal (5 pasos + confirmación)
│   │   │
│   │   ├── admin/               ← Panel de administración (solo admin)
│   │   │   ├── page.tsx         ← Lista de pedidos con filtros
│   │   │   └── [id]/page.tsx    ← Detalle de pedido + generación de imágenes
│   │   │
│   │   ├── pedido/              ← Página de retorno post-pago MP
│   │   │   └── page.tsx         ← Muestra: aprobado / pendiente / rechazado
│   │   │
│   │   ├── (content)/           ← Páginas legales (layout con header/logo)
│   │   │   ├── layout.tsx
│   │   │   ├── faq/page.tsx
│   │   │   ├── terminos/page.tsx
│   │   │   ├── privacidad/page.tsx
│   │   │   └── arrepentimiento/page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   ← Handler de next-auth
│   │   │   ├── generate/route.ts             ← Generación gratuita (home)
│   │   │   ├── upload/route.ts               ← Subida de fotos a R2
│   │   │   ├── preview/route.ts              ← Imagen de prueba (1 por usuario)
│   │   │   ├── pedidos/route.ts              ← Crear pedido + preferencia MP
│   │   │   ├── webhooks/
│   │   │   │   └── mercadopago/route.ts      ← Confirmación de pago
│   │   │   └── admin/pedidos/[id]/
│   │   │       ├── generar/route.ts          ← Generar imagen por imagen
│   │   │       ├── pdf/route.ts              ← Subir PDF al pedido
│   │   │       ├── tracking/route.ts         ← Cargar número de despacho
│   │   │       └── imagenes/[imgId]/route.ts ← Aprobar/regenerar imagen
│   │   │
│   │   ├── sitemap.ts           ← Genera /sitemap.xml
│   │   └── robots.ts            ← Genera /robots.txt
│   │
│   ├── lib/
│   │   ├── prisma.ts            ← Cliente Prisma singleton
│   │   ├── r2.ts                ← Funciones: subir, descargar, URL firmada
│   │   ├── admin.ts             ← requireAdmin() — verifica sesión de admin
│   │   ├── mp.ts                ← Clientes MP: mpPreference, mpPayment
│   │   ├── precios.ts           ← Precios del libro (actualizar antes de lanzar)
│   │   ├── prompts.ts           ← Prompts de GPT-4o por estilo y temática
│   │   └── generarImagen.ts     ← Función generarImagenLibro()
│   │
│   ├── components/
│   │   └── Footer.tsx           ← Footer global (FAQ, arrepentimiento, privacidad, términos)
│   │
│   ├── prisma/
│   │   └── schema.prisma        ← Esquema de la base de datos
│   │
│   ├── public/
│   │   └── (vacío — falta og-image.jpg 1200×630 para Open Graph)
│   │
│   ├── .env.local               ← Variables de entorno locales (NO commitear)
│   ├── .env.example             ← Plantilla de variables (sí commitear)
│   └── .gitignore
│
├── TODO.md                      ← Lista de tareas del proyecto
├── PRODUCTO.md                  ← Spec completa: precios, flujos, legales
├── home-copy.md                 ← Textos de la home para edición de marketing
├── tintamarindo.md              ← Este archivo
└── colorear-kids-precios.xlsx   ← Planilla de precios (pendiente de cerrar)
```

---

## 4. Base de datos (Prisma schema)

### Modelos de next-auth (no tocar)
- `Account` — cuentas OAuth vinculadas al usuario
- `Session` — sesiones activas
- `VerificationToken` — tokens de verificación

### User
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| name | String? | Nombre de Google |
| email | String (unique) | Email de Google |
| image | String? | Foto de perfil |
| previewUsado | Boolean | Límite de 1 imagen de prueba gratuita |
| previewUrl | String? | Key en R2 de la imagen de prueba generada |
| createdAt | DateTime | |

### Pedido
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| tamano | Enum: CHICO / GRANDE | 24 o 32 páginas |
| tematicas | String[] | 1-3 en CHICO, 1-5 en GRANDE |
| tematicaPersonalizada | String? | Solo en GRANDE (texto libre) |
| estilos | Enum[] | REALISTA / PIXAR / ANIME |
| tipoPapel | Enum: BLANCO / AHUESADO / COMBINADO | |
| fotoFamiliarKey | String? | Key R2 — solo en GRANDE |
| tituloTapa | String? | |
| subtituloTapa | String? | |
| observacionesTapa | String? | |
| imagenTapaKey | String? | Key R2 de foto de tapa personalizada |
| esRegalo | Boolean | Activa opción regalo (+$6.000) |
| plantillaTarjeta | String? | |
| tituloTarjeta | String? | |
| nombreRecibe | String? | |
| nombreRegala | String? | |
| mensajeTarjeta | String? | |
| estado | Enum | Ver estados más abajo |
| nombreCompleto | String | Datos de envío |
| direccion | String | |
| codigoPostal | String | |
| localidad | String | |
| provincia | String | |
| telefono | String | |
| emailEnvio | String | |
| mpPreferenceId | String? | ID de preferencia MercadoPago |
| mpPaymentId | String? | ID de pago confirmado |
| pagadoAt | DateTime? | Momento del pago |
| pdfUrl | String? | Key R2 del PDF subido por admin |
| pdfSubidoAt | DateTime? | Usado para calcular días hasta auto-aprobación |
| clienteAprobo | Boolean | |
| aprobadoAt | DateTime? | |
| trackingNumero | String? | Número de seguimiento Correo Argentino |
| despachadoAt | DateTime? | |
| eliminarAt | DateTime? | Fecha de eliminación automática de imágenes (30 días) |
| createdAt / updatedAt | DateTime | |

### Estados del pedido (EstadoPedido)
```
ESPERANDO_PAGO → ESPERANDO_GENERACION → EN_REVISION → ESPERANDO_APROBACION → APROBADO → ENVIADO
```

| Estado | Cuándo ocurre |
|--------|--------------|
| ESPERANDO_PAGO | El pedido se crea pero aún no se pagó |
| ESPERANDO_GENERACION | El webhook de MP confirmó el pago |
| EN_REVISION | Admin terminó de generar todas las imágenes |
| ESPERANDO_APROBACION | Admin subió el PDF — cliente tiene 5 días para revisar |
| APROBADO | Cliente aprobó (o pasaron 5 días sin respuesta) |
| ENVIADO | Admin cargó el número de tracking |

### FotoCliente
Fotos subidas por el cliente. `url` es un key de R2 (`temp/{userId}/{timestamp}.jpg`).

### ImagenPedido
Una fila por cada página del libro (24 o 32 según el tamaño). `url` es null hasta que el admin genera la imagen. `tipo`: A, B o C (variantes de prompt).

---

## 5. Páginas del frontend

### `/` — Home / Landing
- Hero en naranja con CTA "Crear mi libro →"
- Sección "Tres pasos" (subís foto → elegís estilo → descargás)
- Sección de estilos disponibles
- **Herramienta gratuita** de generación de una página individual (sin login)
- Header con botón de login Google / logout
- No requiere autenticación para ver

### `/crear` — Wizard de creación
Flujo de 5 pasos + pantalla de confirmación:

| Paso | Contenido |
|------|-----------|
| 0 | Configuración: tamaño, temáticas, estilos, papel, foto familiar (solo GRANDE), tapa, regalo |
| 1 | Upload de fotos (2-5 fotos, JPG/PNG/HEIC, máx 15MB c/u) + popup de privacidad con scroll obligatorio |
| 2 | Generación de imagen de prueba con marca de agua (1 gratuita por usuario) |
| 3 | Checkout: datos de envío + resumen del pedido |
| 4 | Redirige a MercadoPago Checkout Pro |
| — | Pantalla de fallback (si MP no redirigió) |

### `/pedido` — Retorno de MercadoPago
Recibe `?status=aprobado|pendiente|rechazado&pid={id}` y muestra el mensaje correspondiente.

### `/admin` — Panel de administración
- Solo accesible con la cuenta `ADMIN_EMAIL` (cordiatec@gmail.com)
- Lista de todos los pedidos, filtrables por estado
- Badge de días restantes para auto-aprobación en pedidos en estado ESPERANDO_APROBACION

### `/admin/[id]` — Detalle de pedido
- Datos completos del pedido (configuración + envío)
- Fotos del cliente (URLs firmadas de R2)
- Botón "Generar siguiente imagen" (llama a la API de a una por vez)
- Visor de imágenes generadas con botón de aprobar/regenerar
- Botón de subir PDF
- Campo de número de tracking

### `/faq` — Preguntas frecuentes
Documento HTML con acordeón de preguntas y respuestas.

### `/terminos` — Términos y condiciones
Documento legal completo (10 secciones).

### `/privacidad` — Política de privacidad
Documento legal completo (10 secciones, ley 25.326/DNPDP).

### `/arrepentimiento` — Botón de arrepentimiento
Política de cancelación según Ley 24.240.

---

## 6. API Endpoints

### Públicos (sin autenticación)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/generate` | Genera una página de colorear individual (home). Recibe `image` (File) + `style` (realista/infantil). Devuelve PNG en base64. Timeout: 120s. |

### Autenticados (requieren sesión Google)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/upload` | Sube foto a R2 en `temp/{userId}/...`. Valida tipo (JPG/PNG/WEBP/HEIC) y tamaño (máx 15MB). Devuelve `key`. |
| POST | `/api/preview` | Genera la imagen de prueba del libro (1 por usuario). Si ya usó el cupo, devuelve la imagen guardada. Timeout: 180s. |
| POST | `/api/pedidos` | Crea el pedido en DB + crea preferencia en MercadoPago. Devuelve `{ id, mpInitPoint }`. El wizard redirige a `mpInitPoint`. |

### Webhook
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/webhooks/mercadopago` | Recibe notificación de pago de MP. Verifica firma HMAC-SHA256 (si MERCADOPAGO_WEBHOOK_SECRET está configurado). Al recibir `status: approved`, actualiza el pedido a ESPERANDO_GENERACION. |

### Admin (requieren ADMIN_EMAIL)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/admin/pedidos/[id]/generar` | Genera la siguiente imagen sin URL del pedido. Llama a GPT-4o. Timeout: 60s. Al terminar todas, cambia estado a EN_REVISION. |
| PUT | `/api/admin/pedidos/[id]/imagenes/[imgId]` | Marca imagen como aprobada o la regenera. |
| POST | `/api/admin/pedidos/[id]/pdf` | Sube el PDF armado a R2. Guarda key + fecha. Cambia estado a ESPERANDO_APROBACION. |
| POST | `/api/admin/pedidos/[id]/tracking` | Carga el número de tracking. Cambia estado a ENVIADO. |

---

## 7. Librerías internas (`lib/`)

### `lib/prisma.ts`
Cliente Prisma singleton. Evita múltiples conexiones en desarrollo con hot-reload.

### `lib/r2.ts`
Tres funciones para interactuar con Cloudflare R2:
- `subirArchivo(key, buffer, contentType)` — sube un archivo
- `descargarArchivo(key)` — devuelve `{ buffer, contentType }`
- `obtenerUrlFirmada(key, expiresIn?)` — genera URL temporal firmada (privada por defecto, expira en 1h)

**Regla crítica:** El bucket es PRIVADO. Nunca usar URLs públicas directas.

### `lib/admin.ts`
`requireAdmin()` — verifica que la sesión activa corresponda al email en `ADMIN_EMAIL`. Devuelve la sesión o null.

### `lib/prompts.ts`
Diccionarios de prompts de GPT-4o:
- `ESTILO_PROMPT` — instrucciones visuales por estilo (REALISTA, PIXAR, ANIME)
- `TEMATICA_PROMPT` — instrucciones de escena por temática (aventura, princesas, dinosaurios, espacio, animales)
- `construirPromptEscena(estilo, tematica)` — combina ambos en el prompt final

### `lib/generarImagen.ts`
`generarImagenLibro({ fotoBase64, fotoMime, estilo, tematica, tipo })` — llama a GPT-4o con la foto del cliente y devuelve `{ base64, prompt }`.

### `lib/mp.ts`
Clientes de MercadoPago SDK v3:
- `mpPreference` — para crear preferencias de pago
- `mpPayment` — para consultar datos de un pago (usado en el webhook)

### `lib/precios.ts`
```ts
PRECIO_LIBRO = { CHICO: 24, GRANDE: 32 }  // PRUEBA — cambiar antes de lanzar
PRECIO_REGALO = 6000
```

---

## 8. Servicios externos integrados

### Google OAuth (next-auth v5)
- Variables: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`
- Callback URL: `{SITE_URL}/api/auth/callback/google`
- Para desarrollo: agregar `http://localhost:3000/api/auth/callback/google` en Google Cloud Console

### Cloudflare R2
- Bucket: `colorear-kids` (privado)
- Estructura de keys:
  - `temp/{userId}/{timestamp}.ext` — fotos temporales del cliente
  - `previews/{userId}.png` — imagen de prueba generada
  - `pedidos/{pedidoId}/pagina-01.png` ... — imágenes del libro
  - `pedidos/{pedidoId}/libro.pdf` — PDF final
- Variables: `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

### OpenAI GPT-4o
- Se usa la API de Responses con `image_generation` tool nativa
- Modelo: `gpt-4o` — preserva rasgos faciales del niño (DALL-E 3 fue descartado)
- Tamaño de imagen: 1024×1536 (vertical, formato libro), calidad high
- Timeout en Vercel: 120s (generate) y 180s (preview)
- Variable: `OPENAI_API_KEY`
- **Nunca mencionar "IA", "inteligencia artificial" o "GPT-4o" al usuario** — usar "herramientas de última tecnología"

### MercadoPago
- SDK: `mercadopago` v3.2.0
- Flujo: Checkout Pro (redirect)
- Credenciales de **prueba** activas en `.env.local`
- Credenciales de **producción** comentadas en `.env.local` (activar al deployar)
- Variables: `NEXT_PUBLIC_MP_PUBLIC_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` (pendiente)
- Back URLs: `/pedido?status=aprobado|pendiente|rechazado&pid={pedidoId}`
- `notification_url` al webhook solo se activa si `NEXT_PUBLIC_SITE_URL` empieza con `https`
- Webhook: usa `external_reference` (= pedidoId) para identificar el pedido

### Resend
- Para emails transaccionales (aún sin implementar los templates)
- Variables: `RESEND_API_KEY`, `RESEND_FROM=Tintamarindo <no-reply@tintamarindo.com>`
- Dominio pendiente de verificar en resend.com cuando esté activo `tintamarindo.com`

### Correo Argentino (MiCorreo)
- Pendiente: registrar cuenta en micorreo.correoargentino.com.ar
- Variables reservadas: `MICORREO_USER`, `MICORREO_PASSWORD`
- Uso futuro: cotización de envío en tiempo real + generación de etiquetas

---

## 9. Variables de entorno

| Variable | Dónde se usa | Estado |
|----------|-------------|--------|
| `DATABASE_URL` | Prisma | ⏳ falta en `.env.local` |
| `AUTH_SECRET` | next-auth | ✅ |
| `AUTH_URL` | next-auth | ⏳ falta (solo necesaria en producción) |
| `AUTH_GOOGLE_ID` | next-auth | ✅ |
| `AUTH_GOOGLE_SECRET` | next-auth | ✅ |
| `R2_ACCOUNT_ID` | lib/r2.ts | ✅ |
| `R2_ENDPOINT` | lib/r2.ts | ✅ |
| `R2_ACCESS_KEY_ID` | lib/r2.ts | ✅ |
| `R2_SECRET_ACCESS_KEY` | lib/r2.ts | ✅ |
| `R2_BUCKET_NAME` | lib/r2.ts | ✅ |
| `OPENAI_API_KEY` | generate, preview, generar | ✅ |
| `RESEND_API_KEY` | emails (Fase 3) | ✅ |
| `RESEND_FROM` | emails (Fase 3) | ✅ (dominio pendiente) |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | frontend SDK | ✅ (prueba) |
| `MERCADOPAGO_ACCESS_TOKEN` | lib/mp.ts | ✅ (prueba) |
| `MERCADOPAGO_WEBHOOK_SECRET` | webhook | ⏳ pendiente (configurar al deployar) |
| `MICORREO_USER` | MiCorreo (Fase 3) | ⏳ pendiente |
| `MICORREO_PASSWORD` | MiCorreo (Fase 3) | ⏳ pendiente |
| `NEXT_PUBLIC_SITE_URL` | SEO, MP back_urls, webhook | ⏳ pendiente (necesita dominio) |
| `ADMIN_EMAIL` | lib/admin.ts | ✅ (cordiatec@gmail.com) |

---

## 10. Flujo completo del usuario

```
1. Usuario llega a tintamarindo.com (home)
   ├── Puede probar la herramienta gratuita (genera 1 página sin login)
   └── Hace clic en "Crear mi libro →"

2. Login con Google (si no está autenticado)

3. Wizard — Paso 0: Configuración
   ├── Elige tamaño: 24 páginas (hasta 3 temáticas, 2 estilos)
   │             o 32 páginas (hasta 5 temáticas, 3 estilos + imagen familiar)
   ├── Elige temáticas: aventura, princesas, dinosaurios, espacio, animales
   │                   + temática personalizada (solo GRANDE)
   ├── Elige estilos: Realista, Pixar, Anime
   ├── Elige tipo de papel: blanco, ahuesado, combinado
   ├── Completa datos de tapa: título, subtítulo, observaciones, foto de tapa
   └── Activa opción regalo (opcional, +$6.000): plantilla, nombres, mensaje

4. Wizard — Paso 1: Fotos
   ├── Acepta la política de privacidad (popup con scroll obligatorio)
   └── Sube 2 a 5 fotos (JPG/PNG/HEIC, máx 15MB c/u)
       → Las fotos se guardan en R2 en temp/{userId}/...

5. Wizard — Paso 2: Imagen de prueba
   ├── Genera una ilustración de muestra con marca de agua (GPT-4o)
   ├── Si ya generó una antes: se muestra la anterior
   └── Puede descargar la imagen de prueba

6. Wizard — Paso 3: Checkout
   ├── Completa datos de envío
   └── Ve el resumen del pedido con precios

7. Clic en "Ir a pagar →"
   ├── POST /api/pedidos → crea pedido en DB (estado: ESPERANDO_PAGO)
   │                    → crea preferencia en MercadoPago
   └── Redirige a mercadopago.com

8. Pago en MercadoPago
   ├── Con tarjetas de prueba en desarrollo
   └── Con tarjeta real en producción

9. Retorno a /pedido?status=aprobado&pid={id}
   → El usuario ve la pantalla de confirmación

10. [Asíncrono] Webhook de MercadoPago llega a /api/webhooks/mercadopago
    → Actualiza pedido a ESPERANDO_GENERACION
    → TODO: enviar email de confirmación (Fase 3)
```

---

## 11. Flujo del administrador (panel `/admin`)

```
1. Admin ve lista de pedidos en /admin (filtrable por estado)

2. Abre un pedido en /admin/[id]
   ├── Ve la configuración completa
   ├── Ve las fotos del cliente (URLs firmadas)
   └── Hace clic en "Generar siguiente imagen" (N veces hasta completar el libro)
       → Cada click genera 1 ilustración con GPT-4o
       → Al terminar todas, estado pasa a EN_REVISION

3. Admin revisa cada imagen generada
   ├── Aprueba las que quedaron bien
   └── Regenera las que necesitan mejoras (una por una)

4. Admin arma el PDF con las imágenes aprobadas y lo sube
   → Estado pasa a ESPERANDO_APROBACION
   → TODO: enviar email al cliente con link para revisar (Fase 3)

5. Cliente revisa y aprueba (o pasan 5 días → aprobación automática)
   → Estado pasa a APROBADO

6. Admin imprime y envía el libro
   → Carga el número de tracking
   → Estado pasa a ENVIADO
   → TODO: enviar email de despacho al cliente (Fase 3)
```

---

## 12. SEO y metadatos

- `app/layout.tsx` — metadata global: título, descripción, keywords, Open Graph, Twitter Card
- `app/sitemap.ts` — genera `/sitemap.xml` con home, FAQ, términos, arrepentimiento
- `app/robots.ts` — genera `/robots.txt` (indexa todo excepto `/admin/` y `/api/`)
- `NEXT_PUBLIC_SITE_URL` — necesita estar configurada para que los URLs del sitemap sean correctos
- **Falta:** imagen `/public/og-image.jpg` (1200×630 px) para Open Graph

---

## 13. Pendientes antes del lanzamiento

### Crítico (bloquea el lanzamiento)
- [ ] **Precios reales** — actualizar `lib/precios.ts` con valores de `colorear-kids-precios.xlsx`
- [ ] **Dominio** — registrar `tintamarindo.com` (se hace pasado mañana)
- [ ] **Deploy en Vercel** — conectar repositorio + cargar variables de entorno
- [ ] **Credenciales MP producción** — reemplazar en Vercel (ya están guardadas)
- [ ] **Webhook MP** — configurar URL `https://tintamarindo.com/api/webhooks/mercadopago` en el dashboard de MP + copiar el secret a `MERCADOPAGO_WEBHOOK_SECRET`
- [ ] **Dominio en Resend** — verificar `tintamarindo.com` en resend.com para poder enviar emails
- [ ] **Cotización de envío** — integrar API MiCorreo (requiere credenciales de cuenta MiCorreo)
- [ ] **OG image** — crear imagen 1200×630 para redes sociales

### Funcionalidades pendientes (Fase 3)
- [ ] Email 1: Confirmación de pedido al pagar
- [ ] Email 2: PDF listo para revisión del cliente
- [ ] Email 3: Despacho con número de tracking
- [ ] Recordatorio automático mientras espera aprobación
- [ ] Aprobación automática a los 5 días (cron job)
- [ ] Eliminación automática de fotos a los 30 días
- [ ] Aviso por WhatsApp cuando se envía el Email 2
- [ ] Pago por transferencia bancaria (con descuento)
- [ ] Vista previa de tapa con datos cargados

### Datos faltantes del negocio
- [ ] Peso y dimensiones del libro (24 pág y 32 pág) — para API MiCorreo
- [ ] Precio final de venta (de la planilla)
- [ ] Credenciales MiCorreo (usuario y contraseña)

---

## 14. Campaña Día del Niño 2026

- **Día del Niño:** domingo 9 de agosto de 2026
- **Fecha límite de pedido:** ~15 de julio de 2026 (14 días antes aprox.)
- El sitio debe estar live con pagos funcionando antes del 15 de julio
- Precio de lanzamiento: definir en la planilla

---

## 15. Futuro — Fase 5 (no bloquea MVP)

- Canal de WhatsApp con agente IA (n8n + Evolution API)
- Bot con acceso de lectura a la DB para dar estado de pedidos
- Escalamiento automático a humano cuando el agente no resuelve
