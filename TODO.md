# TINTAMARINDO — Lista de tareas

Cómo usar este archivo:

- Tildá cada tarea con `- [x]` cuando la completás
- Al arrancar una sesión nueva en Claude Code, decí: **"leé el TODO.md y continuá desde donde quedé"**

---

## ✅ FASE 1 — El generador (COMPLETA)

- [x] Crear estructura de carpetas del proyecto
- [x] Instalar dependencias (TypeScript, pnpm)
- [x] Probar DALL-E 3 → descartado (no respeta rasgos faciales)
- [x] Reescribir script con GPT-4o image generation nativo
- [x] Validar que GPT-4o preserva rasgos faciales del niño
- [x] Script funcional: `npm run generate -- samples/foto.jpg`
- [x] Crear `.env.example` con variables necesarias
- [x] Crear `CLAUDE.md` inicial del proyecto

---

## 🔲 FASE 2 — Interfaz web del cliente + panel de admin

> **Flujo actualizado: el cliente ahora pasa por 5 pantallas (antes 8).** Configuración primero (tamaño + temática + estilo + papel), después login + fotos + términos, imagen de prueba, y checkout unificado (envío + pago). El detalle de cada pantalla se reorganizó más abajo — revisar contra la versión anterior de este archivo si venías de la numeración vieja (Pantalla 0 a 6).
>
> **Spec de producto completa (copy, reglas de negocio, flujos, precios, legal): ver `PRODUCTO.md`.**

### Configuración inicial del proyecto web

- [x] Inicializar Next.js 15 con TypeScript y Tailwind v4
- [x] Configurar next-auth con Google OAuth
- [x] Definir estructura de base de datos (esquema de pedidos, usuarios, imágenes)
- [x] Configurar almacenamiento de imágenes (S3 o similar) → Cloudflare R2
- [x] Página de bienvenida / landing con CTA "Crear mi libro"
- [x] Redirigir al flujo de creación después del login
- [x] Configurar variables de entorno para producción → `.env.example` creado con todas las variables
- [x] Agregar componente de footer fijo (FAQ, botón de arrepentimiento, términos y condiciones)
- [x] Repositorio en GitHub → `github.com/tintamarindostore-libros/tintamarindo`
- [x] Base de datos migrada a Supabase (São Paulo) — `DATABASE_URL` transaction pooler, `DIRECT_URL` session pooler

### Pantalla 1 — Configuración (solapas: Interior / Tapa)

> **Nota:** La solapa "Regalo" fue eliminada del producto. Los campos de tarjeta y opción regalo fueron removidos del schema y del código.

**Solapa Interior**

- [x] Cards visuales: 24 páginas vs 32 páginas
- [ ] Mostrar diferencia de precio entre opciones *(falta cargar precio final)*
- [x] Indicar qué incluye cada tamaño
- [x] Selector de temática con preview visual (aventura, princesas, dinosaurios, espacio, animales)
- [ ] **Al seleccionar una temática, mostrar imagen de ejemplo real** — el dueño debe proveer imágenes de muestra por cada temática
- [x] Limitar selección de temáticas según tamaño: hasta 3 en 24 páginas, hasta 5 en 32 páginas
- [x] Si el libro es de 32 páginas, habilitar campo de **temática personalizada**
- [x] Selector de estilo artístico (realista, Pixar, anime)
- [x] Limitar selección de estilos según tamaño: hasta 2 en 24 páginas, hasta 3 en 32 páginas
- [x] Selector de tipo de papel: blanco / ahuesado / combinado
- [x] Si el libro es de 32 páginas, habilitar opción de **imagen familiar**

**Solapa Tapa** *(título e imagen son obligatorios — el resto es opcional)*

- [x] Campo: Título *(obligatorio)*
- [x] Campo: Subtítulo *(opcional)*
- [x] Campo: Observaciones *(opcional)*
- [x] Campo: Imagen de tapa *(obligatoria)*
- [x] Validación: no se puede avanzar sin título e imagen de tapa
- [x] Tabs Interior/Tapa repetidos al pie del paso 2 para que el cliente no se pierda
- [ ] Vista previa de cómo queda la tapa con los datos cargados

### Pantalla 2 — Login + Upload de fotos + Términos

- [x] Flujo de login con Google (next-auth)
- [x] Guardar en DB: Google ID, nombre, email, foto de perfil
- [x] Componente de upload de fotos (drag & drop + botón — mobile first)
- [x] Multi-selección de fotos (Ctrl/Shift para seleccionar varias a la vez)
- [x] Validación: cantidad de fotos entre 2 y 5
- [x] Validación: tipo de archivo (jpg, png, heic), tamaño máximo 15MB
- [x] Preview de fotos subidas con opción de eliminar
- [x] Popup de política de privacidad con scroll obligatorio
- [x] Checkbox de aceptación obligatorio antes de continuar
- [x] Guardar fotos en almacenamiento temporal (Cloudflare R2)
- [ ] **Fix pendiente:** agregar `http://localhost:3000/api/auth/callback/google` en Google Cloud Console para que el login funcione en desarrollo

### Pantalla 3 — Imagen de prueba

- [x] Botón "Generar mi imagen de prueba"
- [x] Spinner / estado de carga mientras se genera (~30 seg)
- [x] Mostrar imagen generada con marca de agua
- [x] Botón para descargar la imagen de prueba
- [x] Límite de una imagen de prueba por cuenta de Google
- [x] Si ya tiene prueba generada: mostrar imagen anterior + invitar a completar el pedido
- [x] Fix: imagen de prueba recarga correctamente si falla la primera vez

### Pantalla 4 — Checkout (envío + resumen + pago, unificado)

- [x] Campos de envío completos (nombre, dirección, CP, localidad, provincia, teléfono, email)
- [x] Validaciones de todos los campos
- [x] Campo: Dedicatoria (opcional)
- [x] Resumen del pedido
- [ ] Cotización de envío en tiempo real — API MiCorreo (Correo Argentino)
- [x] Desglose de precio *(falta cargar el monto final real)*
- [ ] Mostrar precio con descuento si paga por transferencia bancaria
- [ ] Integración MercadoPago *(en desarrollo, desactivado en localhost)*
- [ ] Integración pago por transferencia bancaria directa (con descuento)
- [x] Pantalla de confirmación post-pedido
- [x] Guardar pedido completo en DB con estado "esperando generación"

### Panel de administración

- [x] Ruta protegida `/admin` — acceso solo para admin
- [x] Fix: panel de admin funcionando correctamente (Prisma client regenerado, migrado a Supabase)
- [x] Lista de pedidos con estado y fecha
- [x] Filtro por estado
- [x] Vista de detalle de pedido con fotos del cliente, temática, estilo, tamaño, dirección
- [x] Botón para disparar generación de imágenes
- [x] Visor de imágenes generadas con botones de aprobar / regenerar por imagen
- [x] Indicador de imágenes aprobadas vs pendientes
- [x] Botón para subir PDF
- [x] Campo para número de tracking
- [x] Indicador de días restantes para aprobación automática (5 días)
- [ ] **Verificar:** que se guarden correctamente las 5 fotos al hacer un pedido nuevo (testear con pedido nuevo)

---

## 🔲 FASE 3 — Pagos y notificaciones

- [x] Integración MercadoPago base (webhook de confirmación) — *desactivado en dev, activo en producción*
- [ ] Integración pago por transferencia bancaria (conciliación manual o automática a definir)
- [ ] Integración API MiCorreo para cotización y generación de etiquetas de envío
- [ ] Email 1: Confirmación de pedido (inmediato al pago)
- [ ] Email 2: PDF con marca de agua para aprobación del cliente
- [ ] Aviso por WhatsApp cuando se envía el Email 2
- [ ] Recordatorio automático diario mientras el pedido espera aprobación
- [ ] Job/cron de aprobación automática a los 5 días
- [ ] Email 3: Despacho con número de tracking
- [ ] Lógica de eliminación automática de imágenes a los 30 días
- [ ] Testing de flujo completo de pago

---

## 🔲 FASE 4 — Pulido final y deploy

- [x] Texto legal: política de privacidad, botón de arrepentimiento, FAQ, términos y condiciones
- [x] SEO básico (metadata, og:image, sitemap, robots.txt)
- [x] Repositorio GitHub configurado con .gitignore correcto
- [x] Base de datos en Supabase (listo para producción)
- [ ] Actualizar precios reales en `web/lib/precios.ts` *(actualmente tiene valores de prueba)*
- [ ] Branding final — logo para el header y favicon
- [ ] Crear OG image `/public/og-image.jpg` (1200×630 px)
- [ ] Dominio: registrar `tintamarindo.com` (o `.store` / `.ar`)
- [ ] Verificar dominio en Resend para envío de emails
- [ ] Deploy a Vercel: conectar repo GitHub → configurar Root Directory `web` → cargar env vars
- [ ] Configurar variables de entorno en Vercel (todas las de `.env.local`)
- [ ] Activar MercadoPago en producción y configurar webhook `POST /api/webhooks/mercadopago`
- [ ] Testing en mobile — la mayoría de clientes entran por celular
- [ ] Testing de flujo completo end-to-end en producción
- [ ] Google OAuth en producción: agregar URL de Vercel en Google Cloud Console como redirect autorizado

---

## 🔲 FASE 5 — Canal de WhatsApp con agente IA (futuro)

*A construir más adelante con Claude Code + n8n. No bloquea el MVP.*

- [ ] Conectar Evolution API
- [ ] Botón flotante de WhatsApp en la web
- [ ] Agente conversacional con base de conocimiento (RAG o FAQ en Word)
- [ ] Acceso de solo lectura a Postgres (estado de pedidos — sin modificar datos)
- [ ] Definir criterio de escalamiento a humano
- [ ] Migrar notificaciones automáticas de Fase 3 a este canal
- [ ] Crear skill `agente-whatsapp` en Claude Code antes de arrancar

---

## 📣 Campaña Día del Niño 2026

- [ ] Día del Niño: domingo 9 de agosto de 2026
- [ ] Fecha límite de pedido para entrega garantizada: antes del 15 de julio (a confirmar según tiempos reales de envío)
- [ ] Definir precio de lanzamiento para esta campaña
- [ ] Diseñar y difundir la campaña

---

## 📝 Decisiones pendientes

- [ ] Cargar precio final real del libro (24 y 32 páginas) en `web/lib/precios.ts`
- [ ] Definir precio del plus de regeneraciones extra (si se implementa)
- [ ] Confirmar plazo real de retención de fondos de MercadoPago (para comunicar beneficio del pago por transferencia)
- [ ] Definir peso y dimensiones reales del libro armado (necesario para cotización MiCorreo)
- [ ] Definir costo del volante insert con QR para reseñas en Google Places
- [ ] Proveer imágenes de ejemplo por temática (aventura, princesas, dinosaurios, espacio, animales) para mostrar en el selector
