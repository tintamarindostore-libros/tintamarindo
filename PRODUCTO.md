# COLOREAR KIDS — Detalle de producto

*Leer este archivo cuando se trabaje en UI, contenido de cara al cliente, flujo de compra o reglas de negocio. Para contexto técnico esencial, ver `CLAUDE.md`.*

## Tamaños del libro

| Tamaño | Páginas | Costo generación IA |
|---|---|---|
| Chico | 24 páginas | USD 4.80 |
| Grande | 32 páginas | USD 6.40 |

## Temáticas disponibles

Aventura / Princesas / Dinosaurios / Espacio / Animales
*(Lista configurable — no hardcodear en lógica, usar config)*

**Límites por tamaño:**

| | 24 páginas | 32 páginas |
|---|---|---|
| Temáticas elegibles | Hasta 3 | Hasta 5 |
| Estilos artísticos elegibles | Hasta 2 | Hasta 3 |
| Temática personalizada | No | Sí |
| Imagen familiar | No | Sí |

**Temática personalizada (solo 32 páginas):** el cliente puede especificar una temática que no está en la lista estándar, por ejemplo un deporte en particular o el equipo de fútbol favorito. Se implementa como un campo de texto libre asociado a una de las temáticas elegidas.

**Imagen familiar (solo 32 páginas):** el cliente puede subir una foto grupal (el niño con hermanos, abuelos, o quien quiera incluir) y se genera una ilustración con todo el grupo familiar dibujado como personajes dentro de la escena. Esta ilustración se integra como una página del libro junto con las demás.

Sugerencias de nuevas temáticas se reciben en sugerencias@gmail.com (mencionado en el FAQ).

**Al seleccionar cada temática, se muestra una imagen de ejemplo real (foto + ilustración en esa temática), provista por el dueño.** Esto reemplaza a una galería de ejemplos genérica en la landing — todavía no hay pedidos reales para mostrar, así que se prioriza este ejemplo puntual por temática en el momento de la elección, que es donde más impacta en la decisión de compra.

## Estilos artísticos disponibles

- **Realista** — trazos detallados, proporciones naturales
- **Pixar** — formas redondeadas, expresivo, caricaturesco
- **Anime** — ojos grandes, líneas definidas, estética japonesa

El cliente puede elegir más de un estilo (hasta 2 en 24 páginas, hasta 3 en 32 páginas). Si se eligen varios estilos, se aplican de forma aleatoria entre las distintas ilustraciones del libro.

## Tipos de páginas del libro

- **Tipo A:** El niño caricaturizado en la escena (rasgos respetados, cuerpo dibujado)
- **Tipo B:** Foto del niño convertida a line art directamente
- **Tipo C (solo 32 páginas):** Imagen familiar — foto grupal que el cliente sube (con hermanos, abuelos, o quien quiera incluir); la IA dibuja a todo el grupo como personajes dentro de la escena. Se integra como una página más del libro.
- Todas las páginas son line art blanco y negro para colorear

## Fotos del cliente

El cliente sube entre 2 y 5 fotos del niño o niña. Cuantas más fotos claras de la cara, mejor referencia para mantener el parecido en todas las escenas.

## Tapa del libro

- Se imprime a color (a diferencia del interior, que es blanco y negro para colorear).
- Vive como una **solapa** dentro de la Pantalla 1 (configuración), no es una pantalla aparte.
- Campos: Título, Subtítulo, Observaciones (texto libre para pedidos particulares).
- Campo especial para subir una imagen específica para la tapa (separado de las fotos del interior del libro).

## Opción regalo — tarjeta personalizada

- Vive como otra **solapa** dentro de la Pantalla 1 (configuración), junto a Interior y Tapa — no es parte del checkout.
- El libro se envía envuelto en papel de regalo + una tarjeta personalizada de **14 x 10 cm**.
- El cliente elige entre varias plantillas de diseño de tarjeta.
- Campos de la tarjeta: título, nombre de quien recibe, nombre de quien regala, mensaje.
- **Costo adicional fijo: $6.000** (no varía por tamaño de libro). Se suma al precio final mostrado en el checkout.

## Tipo de papel

Blanco, ahuesado o combinado. No cambia el precio. Se elige junto con tamaño/temática/estilo en la solapa Interior, pero debe quedar visible en el detalle del pedido del panel de admin (dato operativo para imprimir).

## Flujo del cliente (5 pantallas)

1. **Configuración** — pantalla con tres solapas: **Interior** (tamaño 24/32 páginas; hasta 3 temáticas en 24 pág / hasta 5 en 32 pág, con opción de temática personalizada en 32 pág; hasta 2 estilos en 24 pág / hasta 3 en 32 pág; tipo de papel; opción de imagen familiar en 32 pág), **Tapa** (título, subtítulo, observaciones, imagen específica) y **Regalo** (opcional — tarjeta personalizada de 14x10cm, costo adicional fijo de $6.000).
2. **Login con Google + subida de fotos + popup de términos** — login obligatorio, sube 2-5 fotos, acepta política de privacidad de imágenes mediante popup con scroll obligatorio y checkbox.
3. **Imagen de prueba** — se genera 1 imagen gratuita con marca de agua, ligada al Google ID. Botón de descarga. Si ya generó una prueba antes, se le muestra esa misma y se lo invita a completar el pedido.
4. **Checkout** — formulario de datos de envío + resumen del pedido (incluye lo elegido en las solapas de Tapa y Regalo) + cotización de envío en tiempo real (API MiCorreo) + pago (MercadoPago o transferencia con descuento), todo en una sola pantalla.

*Posterior al pago:*

5. Recibe email con el PDF del libro con marca de agua para aprobarlo, con aviso adicional por WhatsApp. Tiene 5 días para aprobar (recordatorio diario por mail y WhatsApp); si no responde, se aprueba automáticamente. Una vez aprobado, el dueño imprime y envía con tracking.

**Footer fijo en toda la web:** FAQ, botón de arrepentimiento (link a página propia), términos y condiciones — siempre accesibles, fuera del flujo de compra.

## Flujo del dueño (panel de admin)

1. Recibe notificación de pedido nuevo
2. Ve las fotos, temática(s), estilo(s), tamaño y tipo de papel en el panel
3. Genera las imágenes desde el panel (o con el script)
4. Revisa cada imagen — puede regenerar las que no le gusten
5. Arma el PDF completo
6. Sube el PDF → el cliente recibe email + WhatsApp con marca de agua para aprobarlo
7. Cliente aprueba (o se aprueba automáticamente a los 5 días) → dueño imprime, arma y envía
8. Carga el tracking → cliente recibe email de despacho

## Formulario de datos de envío

Nombre completo / Dirección / Código postal / Localidad / Provincia (selector AR) / Teléfono / Email (pre-completado). *(La opción de regalo no se elige acá — vive en la solapa "Regalo" de la Pantalla 1.)*

## Envíos — integración con MiCorreo

- Se usa la API de **MiCorreo** (Correo Argentino), no Paq.Ar (que requiere acuerdo comercial y no tiene cotización en tiempo real).
- Registro gratuito, sin volumen mínimo.
- Cotiza por peso real/volumétrico (el mayor de los dos) + código postal de origen/destino + tipo de servicio (domicilio o sucursal).
- **Pendiente:** definir peso y dimensiones reales del libro ya armado (24 y 32 páginas pesan distinto) para que la cotización funcione.
- Evaluar más adelante la API de Andreani como alternativa/complemento.

## Pagos

- **MercadoPago:** tarjeta de crédito/débito, dinero en cuenta, cuotas según promociones vigentes. Precio de lista.
- **Transferencia bancaria directa:** precio con descuento (referencia inicial 10%), porque evita el plazo de retención de fondos que aplica MercadoPago a los pagos con tarjeta. Verificar el plazo real en la cuenta de MercadoPago del negocio antes de comunicarlo con un número exacto al cliente.

## Botón de arrepentimiento

- Obligación legal: Disposición 954/2025 (reemplaza a la derogada Resolución 424/2020).
- Excepción aplicable: art. 1116 CCCN — productos personalizados/a medida.
- Política definida: cancelación válida solo si se solicita dentro de las 48 horas del pago y antes de iniciar la generación de imágenes. Pasado ese momento, no aplica por tratarse de un producto en curso de fabricación a medida.
- Página propia con el texto orientado al cliente, accesible desde el footer (documento ya redactado, ver `colorear-kids-boton-arrepentimiento.docx`).
- Reintegro completo si la solicitud está dentro de plazo.

## Emails y WhatsApp automáticos del sistema

1. Confirmación de pedido (inmediato al pago)
2. PDF con marca de agua para aprobación del cliente — por email, con aviso duplicado por WhatsApp
3. Recordatorio diario (mail + WhatsApp) mientras el pedido espera aprobación, hasta el día 5
4. Aprobación automática a los 5 días si el cliente no respondió (requiere job/cron que chequee pedidos vencidos)
5. Despacho con número de tracking

## Canal de WhatsApp — Fase futura (con Claude Code + n8n)

No es parte del MVP actual — queda registrado como decisión de arquitectura para una fase posterior:

- Botón flotante en la web + canal de notificaciones automáticas del pedido (duplica las notificaciones que hoy son solo por email).
- Conexión vía **Evolution API**.
- Agente conversacional con base de conocimiento (RAG o el documento de FAQ en Word) para responder preguntas generales.
- Acceso de **solo lectura** a Postgres, acotado a tiempos de proceso y estado del pedido — no modifica datos ni dispara acciones.
- Escalamiento a un humano cuando el agente no puede resolver la consulta (falta definir el criterio exacto de cuándo escala y cómo se notifica al dueño).
- A construir más adelante con Claude Code + n8n.

## Política de privacidad de imágenes — puntos clave

*(Documento legal completo se redacta en Fase 4)*

- Uso exclusivo para generar el libro del pedido
- Almacenamiento privado — no acceso público
- Eliminación permanente a los 30 días del pedido
- No se usan para fines comerciales ni entrenamiento de IA (esto se documenta acá para uso interno/legal — en el copy orientado al cliente no se menciona IA explícitamente, ver nota en `CLAUDE.md` sección "Modelo de IA")
- No se comparten con terceros
- Quién puede subir fotos: no se restringe a padres/tutores legales — debe declarar tener autorización de los padres/tutores del menor

## Precios

- Definidos en planilla aparte: `colorear-kids-precios.xlsx` (costo de producción, precio objetivo de mercado, precio de lanzamiento, transferencia vs. MercadoPago — todo con fórmulas, actualizar tipo de cambio y costos de impresión ahí).
- Estrategia: precio de lanzamiento agresivo para entrar al mercado y juntar reseñas (impresión sin costo por ahora, impresora propia). Precio objetivo a futuro en línea con la competencia (Bookinest, ~$74.700–$95.000).
- Insert con QR dentro del libro para pedir reseña en Google Places — costo a definir cuando esté impreso.
- Opción regalo: $6.000 fijo (ver sección "Opción regalo" arriba).

## Campaña Día del Niño 2026

- Fecha: domingo 9 de agosto de 2026.
- Tiempo total de proceso: hasta 16 días (7 generación/revisión + 5 aprobación + 4 impresión) + envío.
- Fecha límite sugerida para pedidos con entrega garantizada: antes del 15 de julio.

## Tiempos de proceso (resumen)

7 días generación/revisión + hasta 5 días aprobación cliente + 4 días impresión + envío según Correo/CP.
