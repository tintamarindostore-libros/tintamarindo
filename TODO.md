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
- [x] Agregar componente de footer fijo (FAQ, botón de arrepentimiento, términos y condiciones) — `web/app/components/Footer.tsx`, incluido en `layout.tsx`

### Pantalla 1 — Configuración (solapas: Interior / Tapa / Regalo)

**Solapa Interior**

- [x] Cards visuales: 24 páginas vs 32 páginas
- [ ] Mostrar diferencia de precio entre opciones *(ya hay precio de referencia — ver planilla `colorear-kids-precios.xlsx` — falta cargar precio final)*
- [x] Indicar qué incluye cada tamaño
- [x] Selector de temática con preview visual (aventura, princesas, dinosaurios, espacio, animales)
- [ ] **Al seleccionar una temática, mostrar imagen de ejemplo real (foto + ilustración en esa temática)** — el dueño debe proveer estas imágenes de muestra por cada temática
- [x] Limitar la selección de temáticas según el tamaño: hasta 3 en 24 páginas, hasta 5 en 32 páginas
- [x] Si el libro es de 32 páginas, habilitar campo de **temática personalizada** (texto libre, ej. "fútbol — River Plate")
- [x] Selector de estilo artístico con ejemplo visual (realista, Pixar, anime)
- [x] Limitar la selección de estilos según el tamaño: hasta 2 en 24 páginas, hasta 3 en 32 páginas
- [x] Si se eligen varios estilos, aplicarlos de forma aleatoria entre las ilustraciones
- [x] Selector de tipo de papel: blanco / ahuesado / combinado (no cambia el precio, pero debe guardarse en el pedido)
- [x] Si el libro es de 32 páginas, habilitar opción de **imagen familiar**: el cliente sube una foto grupal y la IA genera una ilustración con todo el grupo familiar como personajes en la escena (se integra como una página más del libro)

**Solapa Tapa**

- [x] Campo: Título
- [x] Campo: Subtítulo
- [x] Campo: Observaciones (texto libre para pedidos particulares)
- [x] Campo de carga de imagen específica para la tapa (upload separado de las fotos del interior)
- [ ] Vista previa de cómo queda la tapa a color con los datos cargados

**Solapa Regalo (opcional)**

- [x] Toggle/checkbox para activar la opción regalo
- [x] Selector de plantilla de tarjeta (14 x 10 cm)
- [x] Campo: Título
- [x] Campo: Nombre de quien recibe
- [x] Campo: Nombre de quien regala
- [x] Campo: Mensaje
- [x] Mostrar aclaración de costo adicional fijo de $6.000 al activar la opción

### Pantalla 2 — Login + Upload de fotos + Términos

- [x] Flujo de login con Google (next-auth)
- [x] Guardar en DB: Google ID, nombre, email, foto de perfil
- [x] Componente de upload de fotos (drag & drop + botón — mobile first)
- [x] Validación: cantidad de fotos entre 2 y 5
- [x] Validación: tipo de archivo (jpg, png, heic), tamaño máximo
- [x] Preview de fotos subidas con opción de eliminar
- [x] Popup / pantalla de política de privacidad de imágenes
- [x] Ajustar formato: debe ser específicamente un **popup** con scroll obligatorio (antes podía ser popup o pantalla completa)
- [x] Checkbox de aceptación obligatorio antes de continuar
- [x] Guardar fotos en almacenamiento temporal

### Pantalla 3 — Imagen de prueba

- [x] Botón "Generar mi imagen de prueba"
- [x] Spinner / estado de carga mientras se genera (puede tardar ~30 seg)
- [x] Mostrar imagen generada con marca de agua
- [x] Botón para descargar la imagen de prueba con marca de agua
- [x] Lógica: verificar que el Google ID no haya generado una prueba antes
- [x] Si ya tiene una prueba generada: mostrar la imagen anterior + invitar a completar el pedido

### Pantalla 4 — Checkout (envío + resumen + pago, unificado)

- [x] Campo: Nombre completo
- [x] Campo: Dirección (calle, número, piso/depto)
- [x] Campo: Código postal
- [x] Campo: Localidad / Barrio
- [x] Campo: Provincia (selector desplegable — todas las provincias AR)
- [x] Campo: Teléfono
- [x] Campo: Email (pre-completado desde Google, editable)
- [x] Validaciones de todos los campos
- [x] Resumen del pedido: tamaño, temática(s), estilo(s), tipo de papel, tapa, opción regalo (si se eligió), datos de envío
- [ ] Cotización de envío en tiempo real — integración API MiCorreo (Correo Argentino), por peso/dimensiones + código postal. Incluir opción de retiro en sucursal.
- [x] Desglose de precio: libro + envío *(UI ya construida — falta cargar el monto final, ya definido en `colorear-kids-precios.xlsx`)*
- [x] Sumar al desglose el costo fijo de $6.000 si se activó la opción regalo en la Pantalla 1
- [ ] Mostrar precio con descuento si paga por transferencia bancaria
- [ ] Integración MercadoPago (básica — se completa en Fase 3)
- [ ] Integración pago por transferencia bancaria directa (con descuento)
- [x] Pantalla de confirmación post-pago
- [x] Guardar pedido completo en DB con estado "esperando generación"

### Panel de administración

- [x] Ruta protegida — solo accesible con cuenta de admin
- [x] Lista de pedidos con estado y fecha
- [x] Filtro por estado: esperando generación / en revisión / esperando aprobación / aprobado / enviado
- [x] Vista de detalle de pedido: fotos del cliente, temática(s), estilo(s), tamaño, dirección
- [x] Mostrar en el detalle del pedido: tipo de papel, temática personalizada (si se ingresó) e imagen familiar (si se subió) — datos operativos para generar las ilustraciones correctamente
- [x] Botón para disparar generación de imágenes del pedido
- [x] Visor de imágenes generadas una por una
- [x] Botón de regenerar por imagen individual
- [x] Indicador de cuántas imágenes están aprobadas vs pendientes
- [x] Botón para subir PDF armado → dispara email al cliente para aprobación *(subida funciona; el envío de email queda para Fase 3)*
- [x] Campo para cargar número de tracking → dispara email de despacho al cliente *(campo funciona; el envío de email queda para Fase 3)*
- [x] Cambio de estado del pedido en cada paso
- [x] Indicador visual de pedidos "esperando aprobación" con días restantes antes de la aprobación automática (5 días)

---

## 🔲 FASE 3 — Pagos y notificaciones

- [x] Integración completa MercadoPago (webhook de confirmación de pago)
- [ ] Integración pago por transferencia bancaria (conciliación manual o automática a definir)
- [x] Crear skill `integracion-pagos` en Claude Code antes de arrancar
- [ ] Integración API MiCorreo para cotización y generación de etiquetas de envío
- [ ] Email 1: Confirmación de pedido (inmediato al pago)
- [ ] Email 2: PDF con marca de agua para aprobación del cliente
- [ ] Aviso por WhatsApp cuando se envía el Email 2 (avisando que el mail fue enviado)
- [ ] Recordatorio automático diario (mail + WhatsApp) mientras el pedido espera aprobación
- [ ] Job/cron de aprobación automática a los 5 días si el cliente no respondió
- [ ] Email 3: Despacho con número de tracking
- [ ] Lógica de eliminación automática de imágenes a los 30 días
- [ ] Testing de flujo completo de pago

---

## 🔲 FASE 4 — Pulido final

- [x] Redactar documento legal completo de política de privacidad de imágenes
- [x] Integrar texto legal en la app (popup de aceptación)
- [x] Redactar texto de Botón de Arrepentimiento (ver `docs/tintamora-boton-arrepentimiento.docx`) → integrado en `web/app/(content)/arrepentimiento/page.tsx`, linkeado desde el footer
- [x] Redactar FAQ orientado al cliente (ver `docs/tintamora-faq.docx`) → integrado en `web/app/(content)/faq/page.tsx`, linkeado desde el footer
- [x] Redactar Términos y Condiciones (ver `docs/tintamora-terminos-y-condiciones.docx`) → integrado en `web/app/(content)/terminos/page.tsx`, linkeado desde el footer
- [ ] Branding final — nombre, logo, colores
- [ ] Dominio propio
- [x] SEO básico
- [ ] Testing en mobile (la mayoría de clientes entran por celular)
- [ ] Testing de flujo completo end-to-end
- [ ] Deploy a producción

---

## 🔲 FASE 5 — Canal de WhatsApp con agente IA (futuro)

*A construir más adelante con Claude Code + n8n. No bloquea el MVP.*

- [ ] Conectar Evolution API
- [ ] Botón flotante de WhatsApp en la web
- [ ] Agente conversacional con base de conocimiento (RAG o el FAQ en Word)
- [ ] Acceso de solo lectura a Postgres (tiempos de proceso y estado de pedido — sin modificar datos)
- [ ] Definir criterio de escalamiento a humano cuando el agente no resuelve la consulta
- [ ] Definir cómo se notifica al dueño cuando hay un escalamiento
- [ ] Migrar las notificaciones automáticas de Fase 3 (confirmación, aprobación, despacho) para que también salgan por este canal
- [ ] Crear skill `agente-whatsapp` en Claude Code antes de arrancar

---

## 📣 Campaña Día del Niño 2026

- [ ] Día del Niño: domingo 9 de agosto de 2026
- [ ] Fecha límite de pedido para entrega garantizada: antes del 15 de julio (a confirmar según tiempos reales de envío)
- [ ] Definir precio de lanzamiento para esta campaña (ver planilla `colorear-kids-precios.xlsx`, sección "Precio de lanzamiento")
- [ ] Diseñar y difundir la campaña

---

## 📝 Decisiones pendientes (no bloquean el MVP)

> Las decisiones ya tomadas están documentadas también en `PRODUCTO.md` (precios, pagos, envíos, flujo, legal).

- [x] Definir precio de venta del libro (24 pág y 32 pág) en ARS → marco de referencia definido en `colorear-kids-precios.xlsx` (precio objetivo y precio de lanzamiento). Falta cargar costo real de impresión (interior, tapa láser, encuadernado) y volante con QR para cerrar el número final.
- [x] Definir costo de envío por provincia (o precio fijo nacional) → se eligió variable, calculado por la API de MiCorreo según código postal
- [x] Definir precio de la opción regalo (tarjeta 14x10cm + envoltorio) → $6.000 fijo, independiente del tamaño del libro
- [x] Elegir operador logístico: Correo Argentino / OCA / Andreani → se eligió Correo Argentino (MiCorreo). Evaluar Andreani como alternativa/complemento más adelante.
- [x] Elegir servicio de almacenamiento de imágenes (S3, Cloudflare R2, etc.) → se eligió Cloudflare R2 (bucket privado, URLs firmadas)
- [x] Elegir servicio de emails transaccionales → **Resend** (`resend` + `react-email` instalados; falta `RESEND_API_KEY` del dashboard de resend.com)
- [ ] Definir precio del plus de regeneraciones extra (si se implementa)
- [ ] Confirmar el plazo real de retención de fondos de MercadoPago en la cuenta del negocio, para comunicar con precisión el beneficio de pagar por transferencia
- [ ] Definir peso y dimensiones reales del libro armado (24 y 32 páginas) — necesario para que cotice bien la API de MiCorreo
- [ ] Definir costo del volante insert con QR para reseñas en Google Places
