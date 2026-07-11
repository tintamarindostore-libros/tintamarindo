# TINTAMARINDO — Detalle de producto

*Leer este archivo cuando se trabaje en UI, contenido de cara al cliente, flujo de compra o reglas de negocio. Para contexto técnico esencial, ver `CLAUDE.md`.*

## Tamaños del libro

| Tamaño | Páginas | Costo generación IA |
|---|---|---|
| Chico | 24 páginas | USD 4.80 |
| Grande | 32 páginas | USD 6.40 |

## Temáticas disponibles

Más de 20 temáticas predefinidas: Aventura, Princesas, Dinosaurios, Espacio, Animales, Letras y números, Con un perrito, Con un gatito, Selección argentina, Unicornios, Sirenas, Piratas, Bomberos, Policías, Caballos, Hadas, Fútbol, Circo, Fondo del mar, Robots, Halloween, Navidad.
*(Lista configurable — no hardcodear en lógica, usar config. Ver `web/app/crear/Wizard.tsx` para la lista completa y actualizada.)*

**Letras y números:** el niño o niña aparece apoyado/a en una letra o número gigante, corpóreo (como una escultura del tamaño de una construcción pequeña), con otras letras y números más chicos de fondo, a modo de escenario tipo "patio de juegos" del abecedario.

**Límites por tamaño:**

| | 24 páginas | 32 páginas |
|---|---|---|
| Temáticas elegibles | Hasta 8 | Hasta 15 |
| Estilos artísticos elegibles | Hasta 3 | Hasta 4 |
| Temáticas personalizadas | Hasta 3 (cualquier tamaño) | Hasta 3 (cualquier tamaño) |
| Imagen familiar | No | Sí |

**Temáticas personalizadas:** el cliente puede cargar hasta 3 temáticas que no están en la lista estándar (por ejemplo un deporte, un equipo de fútbol favorito, o una combinación como "Danza clásica y River Plate"). Se implementa como una lista de campos de texto libre, con botones para agregar/quitar entradas.

**Imagen familiar (solo 32 páginas):** el cliente puede subir una foto grupal (el niño con hermanos, abuelos, o quien quiera incluir) y se genera una ilustración con todo el grupo familiar dibujado como personajes dentro de la escena. Esta ilustración se integra como una página del libro junto con las demás.

Sugerencias de nuevas temáticas se reciben en sugerencias@gmail.com (mencionado en el FAQ).

**Al seleccionar cada temática, se muestra una imagen de ejemplo real (foto + ilustración en esa temática), provista por el dueño.** *(Pendiente: el dueño todavía tiene que proveer las imágenes de muestra por temática — no implementado.)*

## Estilos artísticos disponibles

- **Realista** — trazos detallados, proporciones naturales
- **Pixar** — formas redondeadas, expresivo, caricaturesco
- **Anime** — ojos grandes, líneas definidas, estética japonesa
- **Ghibli** — pintado a mano, cálido y fantástico, inspirado en el cine de animación japonés

El cliente puede elegir más de un estilo para el interior (hasta 3 en 24 páginas, hasta 4 en 32 páginas). Si se eligen varios estilos, se aplican de forma aleatoria entre las distintas ilustraciones del libro.

**Estilo de tapa:** selección aparte y obligatoria (uno solo de los cuatro), independiente de los estilos elegidos para el interior — ver sección "Tapa del libro".

## Tipos de páginas del libro

- **Tipo A:** El niño caricaturizado en la escena (rasgos respetados, cuerpo dibujado)
- **Tipo B:** Foto del niño convertida a line art directamente
- **Tipo C (solo 32 páginas):** Imagen familiar — foto grupal que el cliente sube (con hermanos, abuelos, o quien quiera incluir); la IA dibuja a todo el grupo como personajes dentro de la escena. Se integra como una página más del libro.
- Las páginas A/B/C son line art blanco y negro para colorear.
- **Tipo TAPA:** la tapa del libro — a diferencia de las páginas interiores, va **a color** y con **tipografía** (título y subtítulo renderizados sobre la ilustración). Ver sección "Tapa del libro".

## Fotos del cliente

El cliente sube entre 2 y 5 fotos del niño o niña. Cuantas más fotos claras de la cara, mejor referencia para mantener el parecido en todas las escenas.

## Tapa del libro

- Se genera **a color** con IA (a diferencia del interior, que es blanco y negro para colorear), incluyendo el título/subtítulo como tipografía sobre la ilustración.
- Vive como una **solapa** dentro de la Pantalla 1 (configuración), no es una pantalla aparte.
- Campos: Título *(obligatorio)*, Subtítulo *(opcional)*, Observaciones *(opcional — se usan como instrucción adicional para el prompt de generación de la tapa)*, Tarjeta de dedicatoria *(opcional)*.
- **Tarjeta de dedicatoria:** el cliente no escribe un mensaje digital — elige entre varios diseños prediseñados en miniatura (o "Sin tarjeta"), con opción de ampliar cada uno antes de elegir. La tarjeta elegida se imprime en blanco en la retiración de tapa, para completar a mano. Catálogo en `web/lib/tarjetasDedicatoria.ts` (imágenes en `web/public/landing/tarjeta-dedicatoria-*.png`); se guarda el `id` del diseño en `Pedido.dedicatoria`.
- Campo especial para subir una imagen de referencia para la tapa *(obligatorio)*, separado de las fotos del interior del libro.
- **Estilo de tapa** *(obligatorio)*: Realista / Pixar / Anime / Ghibli — igual paleta de estilos que el interior, pero elegido aparte.
- El admin puede cargar, por cada pedido, un "prompt extra" puntual para la generación de la tapa (por ejemplo indicaciones de color de letra o composición) antes de generarla o regenerarla.

## Tipo de papel

Blanco, ahuesado o combinado. No cambia el precio. Se elige junto con tamaño/temática/estilo en la solapa Interior, pero debe quedar visible en el detalle del pedido del panel de admin (dato operativo para imprimir).

## Flujo del cliente (5 pantallas)

1. **Configuración** — pantalla con dos solapas: **Interior** (tamaño 24/32 páginas; hasta 8 temáticas en 24 pág / hasta 15 en 32 pág, más hasta 3 temáticas personalizadas; hasta 3 estilos en 24 pág / hasta 4 en 32 pág; tipo de papel; opción de imagen familiar en 32 pág) y **Tapa** (título, subtítulo, observaciones, imagen específica, estilo de tapa, tarjeta de dedicatoria). Si el cliente sale a pagar y vuelve atrás, el progreso de estos pasos se conserva (no tiene que cargar todo de nuevo).
2. **Login con Google + subida de fotos + popup de términos** — login obligatorio, sube 2-5 fotos, acepta política de privacidad de imágenes mediante popup con scroll obligatorio y checkbox.
3. **Imagen de prueba** — se genera 1 imagen gratuita con marca de agua, ligada al Google ID. Botón de descarga. Si ya generó una prueba antes, se le muestra esa misma y se lo invita a completar el pedido.
4. **Checkout** — formulario de datos de envío (incluye tipo de entrega: a domicilio o retiro en sucursal) + resumen del pedido con desglose de precio (libro + envío "a confirmar" + total a pagar ahora) + pago (MercadoPago o transferencia con descuento), todo en una sola pantalla. Navegación con botones "Atrás" y "Siguiente" uno al lado del otro en todos los pasos.

*Posterior al pago:*

5. Recibe email con el PDF del libro con marca de agua para aprobarlo, con aviso adicional por WhatsApp *(pendiente de implementar — hoy no hay emails automáticos)*. Tiene 5 días para aprobar; si no responde, se aprueba automáticamente *(cron pendiente de implementar)*. Una vez aprobado, el dueño imprime y envía con tracking.

**Footer fijo en toda la web:** FAQ, botón de arrepentimiento (link a página propia), términos y condiciones — siempre accesibles, fuera del flujo de compra.

## Flujo del dueño (panel de admin)

1. Recibe notificación de pedido nuevo *(pendiente — hoy no hay notificación automática, hay que revisar el panel)*
2. Ve las fotos, temática(s), estilo(s), tamaño, tipo de papel, datos de tapa (título/subtítulo/estilo/observaciones/tarjeta de dedicatoria) y datos de envío (tipo de entrega, estimado de costo) en el panel
3. Genera las imágenes desde el panel — puede generar todas las faltantes en secuencia, o de a una por vez desde su propia card (para controlar el gasto de créditos y ajustar el resultado). La tapa se genera junto con las páginas interiores, a color y con tipografía. También puede subir páginas manualmente (sin IA) cuando haga falta
4. Revisa cada imagen — puede regenerar las que no le gusten, y agregar un "prompt extra" puntual antes de regenerar. Puede descargar todas las imágenes juntas en un .zip, o exportar los prompts en .txt para generarlas por afuera de la API si hiciera falta
5. Arma el PDF completo
6. Sube el PDF → *(pendiente: el cliente debería recibir email + WhatsApp con marca de agua para aprobarlo — hoy no hay envío de emails)*
7. Cliente aprueba (o se aprueba automáticamente a los 5 días — cron pendiente) → el pedido pasa por **Armando imposición** e **Imprimiendo** antes de enviarse. El estado de cada pedido (`ESPERANDO_PAGO` → `ESPERANDO_GENERACION` → `EN_REVISION` → `ESPERANDO_APROBACION` → `APROBADO` → `EN_IMPOSICION` → `IMPRIMIENDO` → `ENVIADO`) se puede mover manualmente con un desplegable al lado de cada pedido, tanto en el listado como en el detalle (`web/lib/estados.ts`)
8. Carga el tracking → *(pendiente: el cliente debería recibir email de despacho — hoy no hay envío de emails)*

## Formulario de datos de envío

Tipo de entrega (a domicilio / retiro en sucursal) / Nombre completo / Dirección *(obligatoria a domicilio, opcional en sucursal — el cliente puede no saber cuál es, se coordina después por WhatsApp o email)* / Código postal / Localidad / Provincia (selector AR) / Teléfono / Email (pre-completado).

## Envíos — costo "a confirmar", sin API de MiCorreo

- Se planea usar la API de **MiCorreo** (Correo Argentino), no Paq.Ar (que requiere acuerdo comercial y no tiene cotización en tiempo real).
- Registro ya realizado, gratuito y sin volumen mínimo — **pendiente que Correo Argentino se contacte** para habilitar el acceso a la API (requiere una charla comercial previa).
- **Mientras tanto, decisión de lanzamiento:** no se cobra ningún monto de envío en el checkout (`estimarEnvio()` en `web/lib/envio.ts` devuelve siempre `null`). El cliente ve un aviso de que el costo se confirma por WhatsApp o email antes de despachar, y se cobra aparte en ese momento. Así el checkout no depende de tener tarifas reales para poder lanzar.
- Los precios por zona investigados antes (CABA $5.500 sucursal/$8.500 domicilio, Interior $6.600 sucursal, Patagonia $7.500 sucursal) quedaron comentados en `web/lib/envio.ts` como referencia para cuando se reactive la cotización automática.
- **Pendiente:** definir peso y dimensiones reales del libro ya armado (24 y 32 páginas pesan distinto) — necesario para la cotización real vía API cuando esté disponible.
- Evaluar más adelante la API de Andreani como alternativa/complemento.

## Pagos

- **MercadoPago:** tarjeta de crédito/débito, dinero en cuenta, cuotas según promociones vigentes. Precio de lista. *(Integración en desarrollo, desactivada en localhost.)*
- **Transferencia bancaria directa:** 10% de descuento, porque evita el plazo de retención de fondos que aplica MercadoPago a los pagos con tarjeta. Verificar el plazo real en la cuenta de MercadoPago del negocio antes de comunicarlo con un número exacto al cliente. *(Integración de conciliación pendiente de implementar.)*

## Botón de arrepentimiento

- Obligación legal: Disposición 954/2025 (reemplaza a la derogada Resolución 424/2020).
- Excepción aplicable: art. 1116 CCCN — productos personalizados/a medida.
- Política definida: cancelación válida solo si se solicita dentro de las 48 horas del pago y antes de iniciar la generación de imágenes. Pasado ese momento, no aplica por tratarse de un producto en curso de fabricación a medida.
- Página propia con el texto orientado al cliente, accesible desde el footer (documento ya redactado, ver `docs/tintamora-boton-arrepentimiento.docx`).
- Reintegro completo si la solicitud está dentro de plazo.

## Emails y WhatsApp automáticos del sistema

*(Ninguno de estos está implementado todavía — es el próximo bloque grande de trabajo, Fase 3)*

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
- Eliminación permanente a los 30 días del pedido *(lógica automática pendiente de implementar)*
- No se usan para fines comerciales ni entrenamiento de IA (esto se documenta acá para uso interno/legal — en el copy orientado al cliente no se menciona IA explícitamente, ver nota en `CLAUDE.md` sección "Modelo de IA")
- No se comparten con terceros
- Quién puede subir fotos: no se restringe a padres/tutores legales — debe declarar tener autorización de los padres/tutores del menor

## Precios

**Precio de lanzamiento (Día del Niño 2026), ya cargado en `web/lib/precios.ts`:**

| Tamaño | MercadoPago (lista) | Transferencia (10% desc.) |
|---|---|---|
| 24 páginas | $49.900 | $44.910 |
| 32 páginas | $59.900 | $53.910 |

- Envío aparte (ver sección "Envíos" arriba).
- Estrategia: precio de lanzamiento agresivo para entrar al mercado y juntar reseñas (impresión sin costo por ahora, impresora propia). Precio objetivo a futuro en línea con la competencia (Bookinest, ~$74.700–$95.000).
- Planilla de referencia con fórmulas de costos/tipo de cambio (fuera del repo, en la máquina del dueño): `colorear-kids-precios.xlsx`.
- Insert con QR dentro del libro para pedir reseña en Google Places — costo a definir cuando esté impreso.

## Campaña Día del Niño 2026

- Fecha: domingo 9 de agosto de 2026.
- Tiempo total de proceso: hasta 16 días (7 generación/revisión + 5 aprobación + 4 impresión) + envío.
- Fecha límite sugerida para pedidos con entrega garantizada: antes del 15 de julio.

## Tiempos de proceso (resumen)

7 días generación/revisión + hasta 5 días aprobación cliente + 4 días impresión + envío según Correo/CP.
