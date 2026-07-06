import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas frecuentes — Tintamarindo',
  description: 'Todo lo que necesitás saber sobre los libros de colorear personalizados de Tintamarindo.',
}

type QA = { q: string; a: React.ReactNode }

function Section({ title, items }: { title: string; items: QA[] }) {
  return (
    <section className="mb-12">
      <h2
        className="text-xl font-black text-orange-500 uppercase tracking-wide mb-6"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
      <div className="space-y-0 divide-y divide-stone-200">
        {items.map(({ q, a }) => (
          <details key={q} className="group py-5">
            <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
              <span className="font-bold text-stone-800 leading-snug">{q}</span>
              <span className="text-orange-400 mt-0.5 shrink-0 text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 text-stone-600 leading-relaxed text-sm space-y-2">{a}</div>
          </details>
        ))}
      </div>
    </section>
  )
}

export default function FAQPage() {
  return (
    <>
      <h1
        className="text-4xl font-black text-stone-800 mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Preguntas frecuentes
      </h1>
      <p className="text-stone-500 text-sm mb-12">
        Libros de colorear personalizados, impresos y enviados a todo el país
      </p>

      <Section
        title="Sobre Tintamarindo y qué nos hace diferentes"
        items={[
          {
            q: '¿Qué es Tintamarindo?',
            a: <p>Es un libro de colorear personalizado: subís fotos de tu hijo o hija, elegís una temática y un estilo artístico, y nosotros generamos un libro completo donde el protagonista de cada ilustración es el chico o la chica de las fotos. Lo imprimimos y te lo enviamos por correo a cualquier punto de Argentina.</p>,
          },
          {
            q: '¿En qué se diferencia de otros libros para colorear personalizados que venden en Argentina?',
            a: <p>La mayoría de los emprendimientos personalizan solo el nombre en la tapa, o convierten una foto en trazos de línea sin más. Nosotros usamos herramientas de última tecnología para lograr una verdadera similitud con el rostro del chico o la chica dentro de cada escena de la temática elegida, en el estilo artístico que vos elijas. Esto brinda una experiencia única, distinta a cualquier otro libro personalizado del mercado. Además, antes de imprimir nada, nuestro equipo revisa imagen por imagen para asegurar la calidad.</p>,
          },
          {
            q: '¿Puedo ver una imagen de prueba antes de pagar el libro completo?',
            a: <p>Sí. Generás una imagen de muestra gratuita con marca de agua antes de continuar con tu libro personalizado, para que puedas evaluar el resultado con la cara de tu hijo/a, la temática y el estilo elegidos. Si te convence, avanzás con el pedido completo.</p>,
          },
          {
            q: '¿Alguien revisa las imágenes antes de imprimir el libro?',
            a: <p>Sí, ese es un paso clave de nuestro proceso. Una vez que generamos las imágenes del libro completo, las revisamos una por una y regeneramos las que no cumplen el estándar de calidad antes de armar el libro final. No imprimimos nada que no hayamos aprobado nosotros mismos.</p>,
          },
          {
            q: '¿Yo también apruebo el libro antes de que lo impriman?',
            a: <p>Sí. Te enviamos por email un PDF del libro completo con marca de agua para que lo revises y lo apruebes, y además te avisamos por WhatsApp que te enviamos ese mail, para que no se te pase. Recién después de tu aprobación, imprimimos el libro físico y lo despachamos.</p>,
          },
          {
            q: '¿Qué pasa si no llego a aprobar el PDF a tiempo?',
            a: <p>Tenés hasta 5 días para aprobarlo. Mientras esperamos tu respuesta, te mandamos un recordatorio automático todos los días por mail y por WhatsApp. Si pasados los 5 días no nos contestás, el libro se aprueba automáticamente con la versión que te enviamos y lo imprimimos igual, para que el envío no se demore.</p>,
          },
        ]}
      />

      <Section
        title="Cómo armar tu libro personalizado"
        items={[
          {
            q: '¿Qué temáticas puedo elegir?',
            a: (
              <>
                <p>Por ahora ofrecemos seis temáticas: Aventura, Princesas, Dinosaurios, Espacio, Animales y Letras y números.</p>
                <p>Si elegís el libro de 24 páginas, podés combinar hasta 3 temáticas distintas. Si elegís el libro de 32 páginas, podés combinar hasta 5. Además, en cualquiera de los dos tamaños podés agregar hasta 3 temáticas personalizadas: por ejemplo, podés pedir una temática de fútbol con el equipo favorito de tu hijo, un deporte en particular, u otras ideas. Vamos a ir sumando temáticas nuevas con el tiempo.</p>
              </>
            ),
          },
          {
            q: '¿El libro de 32 páginas puede incluir una imagen con toda la familia?',
            a: <p>Sí. En el libro de 32 páginas podés subir una foto grupal — con hermanos, abuelos, o quien quieras incluir — y generamos una ilustración con todo el grupo familiar dibujado como personajes dentro de la escena. Esa ilustración se integra como una página más del libro.</p>,
          },
          {
            q: '¿Qué estilos artísticos puedo elegir?',
            a: (
              <>
                <p>Tenés tres estilos disponibles:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li><strong>Realista</strong> — trazos detallados, proporciones naturales, sombreado suave.</li>
                  <li><strong>Pixar</strong> — formas redondeadas, expresivo, fiel a los rasgos faciales.</li>
                  <li><strong>Anime</strong> — ojos grandes, líneas definidas, estética japonesa.</li>
                </ul>
                <p>En el libro de 24 páginas podés elegir hasta 2 estilos, y en el de 32 páginas hasta 3. Si elegís más de uno, los estilos seleccionados se aplican de forma aleatoria entre las distintas ilustraciones del libro.</p>
              </>
            ),
          },
          {
            q: '¿Qué tamaños de libro hay y en qué se diferencian?',
            a: <p>Hay dos tamaños: 24 páginas y 32 páginas. La diferencia es la cantidad de ilustraciones únicas que tiene tu libro; ambos incluyen tapa personalizada.</p>,
          },
          {
            q: '¿Cuántas fotos tengo que subir?',
            a: <p>Podés subir entre 2 y 5 fotos de tu hijo o hija. Cuantas más fotos claras de la cara nos compartas, mejor referencia tenemos para mantener el parecido en todas las escenas del libro.</p>,
          },
          {
            q: '¿Puedo pedir un libro para más de un chico, o con varios chicos juntos en las escenas?',
            a: <p>Hoy el flujo está pensado para un protagonista por libro. Si tenés una necesidad puntual con más de un chico, escribinos antes de comprar y vemos cómo ayudarte.</p>,
          },
          {
            q: '¿Puedo pedir que el libro tenga el nombre de mi hijo/a en la tapa?',
            a: <p>Sí. La tapa se imprime a color, y tenés campos para escribir un título y un subtítulo (por ejemplo, el nombre del chico o la chica), además de un campo de observaciones por si querés pedir algo particular. También vas a tener un campo especial para subir una imagen específica para la tapa.</p>,
          },
        ]}
      />

      <Section
        title="Privacidad y cuidado de las fotos de los chicos"
        items={[
          {
            q: '¿Por qué tengo que loguearme con Google para generar la imagen de prueba?',
            a: <p>Porque trabajamos con fotos de menores, y pedir una cuenta verificada de Google nos permite tener trazabilidad de quién sube cada foto. Es una decisión pensada para la protección del chico y la seguridad del servicio, no solo un trámite técnico.</p>,
          },
          {
            q: '¿Qué pasa con las fotos que subo? ¿Dónde se guardan?',
            a: <p>Las fotos se almacenan en servidores privados, no accesibles públicamente, y se usan exclusivamente para generar el libro de tu pedido. No se utilizan para ningún otro fin ni se comparten con terceros.</p>,
          },
          {
            q: '¿Durante cuánto tiempo guardan las fotos de mi hijo/a?',
            a: <p>Las conservamos 30 días desde la fecha del pedido y después se eliminan de forma permanente. Si querés pedir la eliminación anticipada, podés solicitarlo a nuestro contacto de privacidad.</p>,
          },
          {
            q: '¿Quién puede comprar un libro: solo los padres del chico?',
            a: <p>No hace falta ser necesariamente el padre, la madre o el tutor legal. Tíos, tías, abuelos, padrinos o cualquier persona con el consentimiento de la familia pueden hacer el pedido, por ejemplo para un regalo de cumpleaños. También trabajamos con instituciones. Lo que sí pedimos es que quien sube las fotos cuente con la autorización de los padres o tutores del menor, algo que se declara al aceptar la política de privacidad.</p>,
          },
          {
            q: '¿Puedo generar más de una imagen de prueba gratis con la misma cuenta?',
            a: <p>No, el límite es una imagen de prueba por cuenta de Google. Esto es para evitar el uso abusivo del servicio gratuito. Si ya generaste una prueba, la vas a poder ver de nuevo e invitarte a completar el pedido.</p>,
          },
        ]}
      />

      <Section
        title="Pago y precios"
        items={[
          {
            q: '¿Cuándo pago, antes o después de ver el libro completo?',
            a: <p>Pagás después de ver la imagen de prueba gratuita (que te da una idea fiel del resultado) y antes de que generemos el libro completo. El libro completo se procesa una vez confirmado el pago.</p>,
          },
          {
            q: '¿Qué medios de pago aceptan?',
            a: <p>Pagás a través de MercadoPago, lo que te permite usar tarjeta de crédito, débito, dinero en cuenta o cuotas según las promociones vigentes de MercadoPago en el momento de tu compra.</p>,
          },
          {
            q: '¿Hay algún medio de pago más económico?',
            a: <p>Sí. Si pagás por transferencia bancaria directa, te ofrecemos un precio menor que pagando con tarjeta a través de MercadoPago. Esto es porque los pagos con tarjeta quedan retenidos por MercadoPago durante un plazo antes de estar disponibles para nosotros, mientras que la transferencia se acredita de forma directa. Vas a ver ambos precios (transferencia y otros medios) al momento de pagar.</p>,
          },
          {
            q: 'Si no me convence la imagen de prueba, ¿pierdo plata?',
            a: <p>No. La imagen de prueba es gratuita; si decidís no continuar con el pedido, no se te cobra nada.</p>,
          },
          {
            q: '¿Tengo derecho a arrepentirme de la compra después de pagar?',
            a: <p>Sí, como en toda compra online en Argentina, tenés derecho a arrepentimiento según la normativa de Defensa del Consumidor. Te contamos el procedimiento puntual en la <a href="/arrepentimiento" className="text-orange-500 underline hover:text-orange-600">página de botón de arrepentimiento</a>.</p>,
          },
        ]}
      />

      <Section
        title="Envíos y tiempos de entrega"
        items={[
          {
            q: '¿A qué partes de Argentina envían?',
            a: <p>Enviamos el libro impreso a cualquier punto de Argentina.</p>,
          },
          {
            q: '¿Cuánto tarda todo el proceso, desde que pago hasta que recibo el libro?',
            a: <p>El proceso tiene etapas con tiempos definidos: generamos y revisamos las imágenes en 7 días, después tenés hasta 5 días para aprobar el PDF (te mandamos recordatorios automáticos por mail y WhatsApp para que no se te pase), la impresión del libro tarda 4 días, y por último el envío depende del Correo según tu código postal. Te avisamos por email en cada paso, incluido el número de seguimiento cuando lo despachamos.</p>,
          },
          {
            q: '¿Puedo hacer seguimiento (tracking) de mi pedido?',
            a: <p>Sí. Cuando despachamos tu libro, te enviamos por email el número de tracking del envío.</p>,
          },
          {
            q: '¿El libro es un PDF descargable o es un libro físico?',
            a: <p>El producto final es un libro impreso físico que te enviamos por correo. El PDF con marca de agua que recibís antes es solo para que lo apruebes; no es el producto que te queda.</p>,
          },
          {
            q: 'Es para un regalo, ¿pueden enviarlo directamente a otra dirección?',
            a: <p>Sí. En el formulario de envío podés indicar la dirección de entrega que quieras. Además, si elegís la opción regalo, el libro se envía envuelto en papel de regalo junto con una tarjeta personalizada de 14 x 10 cm. Podés elegir entre varias plantillas de diseño y completarla con un título, el nombre de quien recibe el regalo, el nombre de quien lo regala y un mensaje. Esta opción tiene un costo adicional de $6.000.</p>,
          },
        ]}
      />

      <Section
        title="Cuenta y proceso de compra"
        items={[
          {
            q: '¿Necesito crear una cuenta para comprar?',
            a: <p>Necesitás loguearte con tu cuenta de Google. No hace falta crear un usuario y contraseña nuevos: usamos tu cuenta de Google para identificarte y para pre-completar tu email en las notificaciones del pedido.</p>,
          },
          {
            q: 'Subí mis fotos y elegí todo, pero no terminé la compra. ¿Pierdo lo que hice?',
            a: <p>Tu imagen de prueba queda asociada a tu cuenta de Google, así que si volvés podés retomar desde ahí y completar el pedido sin tener que generar la prueba de nuevo.</p>,
          },
          {
            q: '¿Cómo me entero del estado de mi pedido?',
            a: <p>Te vamos a avisar por email en cada etapa importante: confirmación del pedido apenas pagás, aviso para aprobar el PDF del libro cuando esté listo, y aviso de despacho con el número de seguimiento.</p>,
          },
          {
            q: 'Tengo una urgencia o una consulta puntual, ¿con quién hablo?',
            a: <p>Podés escribirnos por nuestros canales de contacto (WhatsApp o email) y te respondemos directamente; no hace falta esperar a que avance el pedido automáticamente.</p>,
          },
        ]}
      />
    </>
  )
}
