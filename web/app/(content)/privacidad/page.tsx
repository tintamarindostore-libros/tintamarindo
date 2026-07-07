import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad — Tintamarindo',
  description: 'Cómo Tintamarindo recopila, usa, almacena y elimina las fotos y los datos personales de sus clientes.',
  robots: { index: true, follow: true },
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="text-lg font-black text-stone-800 mb-4"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {num}. {title}
      </h2>
      <div className="space-y-4 text-stone-600 leading-relaxed text-sm">{children}</div>
    </section>
  )
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-stone-700 mb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export default function PrivacidadPage() {
  return (
    <>
      <h1
        className="text-4xl font-black text-stone-800 mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Política de privacidad
      </h1>
      <p className="text-stone-500 text-sm mb-2">
        Libros de colorear personalizados, impresos y enviados a todo el país
      </p>
      <p className="text-stone-400 text-xs mb-12">
        Última actualización: julio de 2026.
      </p>

      <div>

        <Section num="1" title="Quiénes somos y cómo contactarnos">
          <p>
            Tintamarindo es un servicio de libros de colorear personalizados con foto. El responsable del tratamiento de los datos personales es el titular del servicio, cuyo contacto está disponible a través de los canales indicados en el footer del sitio.
          </p>
          <p>
            Para cualquier consulta relacionada con esta Política de Privacidad, o para ejercer los derechos que se describen más abajo, podés contactarnos por WhatsApp o email. Respondemos dentro de las 48 horas hábiles.
          </p>
        </Section>

        <Section num="2" title="Qué datos recopilamos">
          <Sub title="Datos de cuenta">
            <p>
              Cuando iniciás sesión con Google, recibimos de forma automática tu nombre, dirección de email y foto de perfil. Estos datos se almacenan en nuestra base de datos para identificar tu cuenta y asociarla con tus pedidos.
            </p>
          </Sub>
          <Sub title="Fotos personales">
            <p>
              Para generar las ilustraciones del libro, subís entre 2 y 5 fotografías. Estas imágenes se almacenan en servidores privados con acceso restringido (Cloudflare R2, región EE.UU.). No son accesibles públicamente, no se indexan en buscadores y no pueden ser vistas por personas ajenas al equipo de Tintamarindo.
            </p>
          </Sub>
          <Sub title="Datos de envío y pago">
            <p>
              Para coordinar la entrega del libro físico, recopilamos nombre completo, dirección postal, código postal, localidad, provincia y teléfono. Estos datos se usan exclusivamente para gestionar el envío de tu pedido.
            </p>
            <p>
              Los pagos se procesan a través de plataformas de pago externas (MercadoPago o transferencia bancaria). Tintamarindo no almacena datos de tarjetas de crédito ni información bancaria sensible.
            </p>
          </Sub>
          <Sub title="Datos técnicos">
            <p>
              Como cualquier sitio web, registramos información técnica mínima necesaria para el funcionamiento del servicio, como el estado de los pedidos, errores de sistema y marcas de tiempo de las acciones.
            </p>
          </Sub>
        </Section>

        <Section num="3" title="Para qué usamos tus datos">
          <p>Las fotografías que subís se usan <strong>exclusivamente</strong> para generar las ilustraciones de tu libro de colorear. No tienen ningún otro uso. En particular:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>No se usan para entrenar, afinar ni mejorar modelos de inteligencia artificial de ningún tipo.</li>
            <li>No se usan con fines publicitarios ni de marketing, ni propios ni de terceros.</li>
            <li>No se comparten con terceros, salvo en los casos previstos en la sección 5 de esta política o por obligación legal expresa.</li>
          </ul>
          <p>
            Los datos de envío y de cuenta se usan para gestionar tu pedido, enviarte notificaciones sobre su estado y cumplir con nuestras obligaciones contractuales.
          </p>
        </Section>

        <Section num="4" title="Cuánto tiempo conservamos tus datos">
          <Sub title="Fotografías e imágenes generadas">
            <p>
              Las fotos que subís y todas las imágenes generadas a partir de ellas (incluyendo la imagen de prueba y las páginas del libro) se eliminan de forma <strong>permanente e irreversible</strong> a los 30 días corridos de la fecha del pedido.
            </p>
            <p>
              Podés solicitar la eliminación anticipada en cualquier momento contactándonos. Ejecutamos la eliminación dentro de las 48 horas hábiles de recibida la solicitud.
            </p>
          </Sub>
          <Sub title="Datos de cuenta y pedido">
            <p>
              Los datos de tu cuenta (nombre, email) y los datos de tu pedido (temática, tamaño, dirección de envío) se conservan durante el tiempo necesario para cumplir con obligaciones legales en materia de facturación y comercio electrónico (generalmente 5 a 10 años según la normativa argentina vigente).
            </p>
          </Sub>
        </Section>

        <Section num="5" title="Con quién compartimos tus datos">
          <p>Tintamarindo no vende ni cede datos personales a terceros. Sin embargo, para prestar el servicio usamos los siguientes proveedores externos, que actúan como encargados del tratamiento:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Google (autenticación):</strong> Gestionamos el inicio de sesión a través de Google OAuth. Google puede conservar datos de sesión de acuerdo con su propia política de privacidad.</li>
            <li><strong>Cloudflare R2 (almacenamiento de imágenes):</strong> Las fotos e imágenes se almacenan en servidores privados de Cloudflare. El acceso está limitado mediante URLs firmadas de corta duración.</li>
            <li><strong>OpenAI (generación de ilustraciones):</strong> Las fotografías se envían a la API de OpenAI para generar las ilustraciones. OpenAI procesa estos datos de acuerdo con sus términos de servicio para la API, que prohíben el entrenamiento con datos de clientes de la API sin consentimiento explícito.</li>
            <li><strong>MercadoPago (pagos):</strong> Si abonás con tarjeta o transferencia a través de MercadoPago, el procesamiento del pago queda sujeto a su política de privacidad.</li>
            <li><strong>Correo Argentino (envíos):</strong> Para gestionar el envío del libro físico, compartimos nombre y dirección de entrega con Correo Argentino.</li>
          </ul>
          <p>
            En todos los casos, solo compartimos la información mínima necesaria para prestar el servicio.
          </p>
        </Section>

        <Section num="6" title="Fotografías de menores de edad">
          <p>
            Muchos de nuestros libros incluyen imágenes de niños y niñas. Al subir fotografías de un menor de edad, el cliente declara y garantiza:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Ser padre, madre o tutor/a legal del menor fotografiado/a, <strong>o</strong> contar con autorización expresa de quien ejerce la responsabilidad parental.</li>
            <li>Tener derecho a usar esas imágenes en el contexto de este servicio y para la finalidad descripta en esta política.</li>
          </ul>
          <p>
            Tintamarindo no es responsable por el uso de imágenes subidas por personas que no cuenten con la autorización descripta. Si detectamos contenido ilegal o inapropiado, nos reservamos el derecho de cancelar el pedido sin reembolso y, de corresponder, notificar a las autoridades competentes.
          </p>
        </Section>

        <Section num="7" title="Tus derechos sobre tus datos">
          <p>
            De acuerdo con la Ley N.° 25.326 de Protección de los Datos Personales (Argentina) y sus modificatorias, tenés derecho a:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Acceso:</strong> Saber qué datos tenemos sobre vos.</li>
            <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos cuando ya no sean necesarios para la finalidad para la que fueron recopilados, o cuando revoques tu consentimiento.</li>
            <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos en determinadas circunstancias.</li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, contactanos por WhatsApp o email. Respondemos dentro de las 48 horas hábiles. La eliminación de imágenes se ejecuta dentro del mismo plazo.
          </p>
          <p>
            La Dirección Nacional de Protección de Datos Personales (DNPDP) es el organismo de control en Argentina. Si considerás que tus derechos no fueron respetados, podés presentar una denuncia en <strong>www.argentina.gob.ar/aaip/datospersonales</strong>.
          </p>
        </Section>

        <Section num="8" title="Seguridad">
          <p>
            Implementamos medidas técnicas y organizativas para proteger tus datos personales contra acceso no autorizado, pérdida o destrucción accidental. Las imágenes se almacenan en buckets privados sin acceso público; el acceso temporal se otorga mediante URLs firmadas con vencimiento corto. La comunicación entre tu navegador y nuestros servidores se realiza siempre a través de HTTPS.
          </p>
          <p>
            A pesar de estas medidas, ningún sistema de transmisión por internet es 100% seguro. Si detectamos una brecha de seguridad que afecte tus datos, te notificaremos en la forma y plazo que establece la normativa vigente.
          </p>
        </Section>

        <Section num="9" title="Cookies y rastreo">
          <p>
            Tintamarindo no usa cookies de rastreo ni herramientas de analítica de terceros que identifiquen a los usuarios. Usamos cookies de sesión estrictamente necesarias para mantener tu inicio de sesión con Google activo mientras navegás el sitio.
          </p>
        </Section>

        <Section num="10" title="Cambios a esta política">
          <p>
            Podemos actualizar esta Política de Privacidad cuando sea necesario. Los cambios relevantes serán comunicados por email a los clientes con pedidos activos. La versión vigente siempre estará disponible en esta página con su fecha de actualización.
          </p>
        </Section>

      </div>
    </>
  )
}
