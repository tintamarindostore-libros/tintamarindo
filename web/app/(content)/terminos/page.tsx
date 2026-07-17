import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos y condiciones — Tintamarindo',
  description: 'Términos y condiciones de uso del servicio Tintamarindo.',
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

export default function TerminosPage() {
  return (
    <>
      <h1
        className="text-4xl font-black text-stone-800 mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Términos y condiciones de uso
      </h1>
      <p className="text-stone-500 text-sm mb-12">
        Libros de colorear personalizados, impresos y enviados a todo el país
      </p>
      <div>

        <Section num="1" title="Partes y aceptación de los términos">
          <p>
            Estos Términos y Condiciones regulan la relación entre Tintamarindo (en adelante "el servicio" o "nosotros") y cualquier persona que acceda, navegue o contrate a través de nuestro sitio web (en adelante "el cliente" o "vos").
          </p>
          <p>
            Al acceder al sitio o completar una compra, el cliente acepta en forma plena y sin reservas estos Términos y Condiciones, incluyendo la Política de Privacidad de Imágenes descripta en la sección 6. Si no estás de acuerdo con alguno de estos términos, no debés usar el servicio.
          </p>
        </Section>

        <Section num="2" title="Descripción del servicio">
          <p>
            Tintamarindo es un servicio de creación de libros de colorear personalizados. El cliente sube fotos de un niño o niña, elige una temática, estilo artístico y tipo de papel, y nuestro equipo genera un libro completo donde el protagonista de cada ilustración es el niño o la niña de las fotos. El libro se imprime en formato físico y se envía por correo a la dirección indicada en el pedido.
          </p>
          <p>El servicio incluye:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Generación de una imagen de prueba gratuita con marca de agua, previa al pago.</li>
            <li>Generación completa del libro por nuestro equipo una vez confirmado el pago.</li>
            <li>Revisión interna imagen por imagen antes de armar el libro final.</li>
            <li>Envío al cliente de un PDF con marca de agua del libro completo para su aprobación antes de imprimir.</li>
            <li>Impresión y envío del libro físico una vez aprobado por el cliente.</li>
          </ul>
        </Section>

        <Section num="3" title="Proceso de compra y flujo del pedido">
          <Sub title="3.1 Registro e identificación">
            <p>
              Para generar la imagen de prueba y realizar una compra, el cliente debe identificarse mediante su cuenta de Google (Google OAuth). Al ingresar, el sistema registra su nombre, dirección de email y Google ID. Este dato se usa para asociar el pedido, pre-completar los datos de contacto y limitar el uso del servicio de imagen de prueba gratuita a una por cuenta.
            </p>
          </Sub>
          <Sub title="3.2 Imagen de prueba gratuita">
            <p>
              Antes de pagar, el cliente puede generar una imagen de muestra gratuita con marca de agua para evaluar el resultado. Esta imagen queda asociada a su cuenta de Google y no puede generarse una segunda imagen de prueba con la misma cuenta. Si el cliente ya generó una imagen de prueba anteriormente, se le mostrará esa imagen y se lo invitará a completar el pedido.
            </p>
          </Sub>
          <Sub title="3.3 Pago y confirmación del pedido">
            <p>
              El pago se realiza antes de que se genere el libro completo. Una vez confirmado el pago, el pedido queda registrado con estado "esperando generación". El cliente recibe un email de confirmación inmediato al pago.
            </p>
            <p>Se aceptan los siguientes medios de pago:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Tarjeta de crédito, débito o dinero en cuenta a través de MercadoPago, al precio de lista.</li>
              <li>Transferencia bancaria directa, con un precio menor al de lista. El monto con descuento se muestra al momento de pagar.</li>
            </ul>
          </Sub>
          <Sub title="3.4 Generación y revisión del libro">
            <p>
              Una vez recibido el pago, nuestro equipo genera las ilustraciones del libro completo y las revisa una por una. Aquellas ilustraciones que no cumplan nuestro estándar de calidad son regeneradas antes de armar el libro final. Este proceso tiene un plazo de hasta 7 días hábiles desde la confirmación del pago.
            </p>
          </Sub>
          <Sub title="3.5 Aprobación del cliente">
            <p>
              Una vez armado el libro, se envía al cliente por email un PDF completo con marca de agua para su revisión y aprobación. También se envía un aviso por WhatsApp recordando que el email fue enviado.
            </p>
            <p>
              El cliente tiene hasta 5 días corridos para aprobar el PDF. Durante ese plazo, se enviarán recordatorios automáticos diarios por email y WhatsApp. Si el cliente no responde dentro del plazo, el pedido se considerará automáticamente aprobado con la versión del PDF enviada, y se procederá a la impresión.
            </p>
          </Sub>
          <Sub title="3.6 Impresión y envío">
            <p>
              Una vez aprobado el libro, nuestro equipo procede a la impresión y armado del libro físico, proceso que toma hasta 4 días hábiles. El envío se realiza por Correo Argentino a la dirección indicada en el pedido. El cliente recibe por email el número de seguimiento del envío una vez despachado.
            </p>
            <p>
              Los tiempos de entrega una vez despachado el libro dependen del Correo Argentino y varían según el código postal de destino.
            </p>
          </Sub>
          <Sub title="3.7 Características del papel y uso de marcadores">
            <p>
              El interior del libro se imprime en papel apto para colorear, optimizado para lápices de colores y crayones. Por la naturaleza de este papel, el uso de fibras, marcadores, fibrones o cualquier tinta líquida puede provocar que el color traspase o se transparente hacia el reverso de la hoja. Esto constituye una característica propia de este tipo de papel y no representa un defecto de fabricación, ni motivo de reclamo, cambio o devolución. Recomendamos colorear con lápices o crayones; para quienes prefieran marcadores, sugerimos fotocopiar la página y colorear sobre la copia.
            </p>
          </Sub>
        </Section>

        <Section num="4" title="Precios, costos adicionales y envío">
          <Sub title="4.1 Precio del libro">
            <p>
              El precio del libro se muestra en el sitio al momento de la compra y puede variar según el medio de pago elegido (MercadoPago o transferencia bancaria). Los precios están expresados en pesos argentinos e incluyen el IVA correspondiente.
            </p>
          </Sub>
          <Sub title="4.2 Costo de envío">
            <p>
              El costo de envío se calcula en tiempo real al momento del checkout, según el código postal de destino y el peso y dimensiones del libro. El costo se muestra antes de confirmar el pago. Se ofrece también la opción de retiro en sucursal del Correo Argentino a menor costo.
            </p>
          </Sub>
          <Sub title="4.3 Opción regalo">
            <p>
              El cliente puede optar por el envío con presentación de regalo, que incluye papel de regalo y una tarjeta personalizada de 14 x 10 cm con diseño elegido por el cliente. Esta opción tiene un costo adicional fijo de $6.000 (pesos argentinos), que se suma al precio del libro y se muestra en el resumen del pedido antes del pago.
            </p>
          </Sub>
        </Section>

        <Section num="5" title="Cancelaciones y derecho de arrepentimiento">
          <Sub title="5.1 Derecho de arrepentimiento">
            <p>
              En cumplimiento del Art. 34 de la Ley N° 24.240 de Defensa del Consumidor y el Art. 1.110 del Código Civil y Comercial de la Nación, reglamentados por la Disposición N° 954/2025 de la Subsecretaría de Defensa del Consumidor y Lealtad Comercial, el cliente tiene derecho de arrepentimiento en compras a distancia.
            </p>
          </Sub>
          <Sub title="5.2 Excepción por producto personalizado">
            <p>
              En virtud del Art. 1.116 del Código Civil y Comercial de la Nación, el derecho de arrepentimiento no aplica a productos confeccionados conforme a las especificaciones del consumidor o claramente personalizados. El libro de Tintamarindo es un producto a medida, generado específicamente con las fotos, temática y estilo elegidos por el cliente, y no puede revenderse ni reutilizarse para otro pedido.
            </p>
          </Sub>
          <Sub title="5.3 Plazo y condiciones de cancelación">
            <p>
              No obstante lo anterior, y como política comercial propia, aceptamos la cancelación del pedido en las siguientes condiciones:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>La solicitud debe realizarse dentro de las 48 horas posteriores a la confirmación del pago.</li>
              <li>La generación de las ilustraciones del libro no debe haber comenzado al momento de la solicitud.</li>
            </ul>
            <p>
              Si se cumplen ambas condiciones, se reintegra el monto total abonado. Pasadas las 48 horas o iniciada la generación del libro (lo que ocurra primero), el pedido no admite cancelación ni reintegro, por tratarse de un producto personalizado en curso de fabricación.
            </p>
          </Sub>
          <Sub title="5.4 Cómo solicitar la cancelación">
            <p>
              La solicitud de cancelación puede realizarse por WhatsApp o email con los siguientes datos: nombre completo, email de la compra, teléfono y número de pedido. Responderemos dentro de las 24 horas con el número de identificación de la solicitud. El envío de la solicitud no implica la cancelación automática del pedido.
            </p>
            <p>
              Ver también: <Link href="/arrepentimiento" className="text-orange-500 hover:text-orange-600 underline">Botón de arrepentimiento</Link>.
            </p>
          </Sub>
        </Section>

        <Section num="6" title="Política de privacidad y uso de imágenes">
          <Sub title="6.1 Alcance y propósito">
            <p>
              Las fotos subidas por el cliente (del niño o niña protagonista del libro, de familiares u otras personas) se usan exclusivamente para generar las ilustraciones del pedido correspondiente. No se utilizan para ningún otro fin.
            </p>
          </Sub>
          <Sub title="6.2 Almacenamiento y seguridad">
            <p>
              Las imágenes se almacenan en servidores privados con acceso restringido. No son accesibles públicamente ni se comparten con terceros, salvo obligación legal expresa.
            </p>
          </Sub>
          <Sub title="6.3 Retención y eliminación">
            <p>
              Las fotos originales subidas por el cliente se conservan durante 30 días corridos desde la fecha del pedido y luego se eliminan de forma permanente e irreversible. Las ilustraciones generadas por IA y el PDF final del libro se conservan por más tiempo, para poder ofrecer reimpresiones o resolver reclamos. El cliente puede solicitar la eliminación anticipada de cualquiera de estos archivos escribiendo a nuestro contacto de privacidad en cualquier momento.
            </p>
          </Sub>
          <Sub title="6.4 Declaración del cliente sobre las imágenes subidas">
            <p>Al aceptar estos Términos y Condiciones, el cliente declara que:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Tiene autorización de los padres o tutores legales del menor fotografiado para usar esas imágenes en el contexto de este servicio.</li>
              <li>Las imágenes subidas no contienen material ilegal ni violatorio de derechos de terceros.</li>
            </ul>
            <p>
              Tintamarindo no se responsabiliza por el uso de imágenes subidas por personas que no cuenten con la autorización descripta.
            </p>
          </Sub>
        </Section>

        <Section num="7" title="Propiedad intelectual e ilustraciones generadas">
          <Sub title="7.1 Naturaleza de las ilustraciones">
            <p>
              Las ilustraciones de cada libro se generan mediante herramientas de última tecnología de creación de imágenes. De acuerdo con la normativa argentina vigente sobre propiedad intelectual y el criterio predominante en la materia, las obras generadas por sistemas automatizados sin intervención creativa humana suficiente no son susceptibles de protección por derechos de autor. Por lo tanto, las ilustraciones generadas no tienen un titular de derechos de autor identificable.
            </p>
          </Sub>
          <Sub title="7.2 Uso por parte del cliente">
            <p>
              El cliente puede usar el libro impreso y las ilustraciones que contiene para fines personales y familiares de forma libre y sin restricciones: puede fotografiarlo, compartirlo en redes sociales, regalarlo o reproducirlo para uso propio.
            </p>
          </Sub>
          <Sub title="7.3 Exclusividad y similitud">
            <p>
              No se garantiza exclusividad sobre los diseños, composiciones o estilos visuales de las ilustraciones generadas. El sistema puede producir ilustraciones visualmente similares en pedidos distintos cuando se combinan los mismos parámetros de temática y estilo. El libro impreso no lleva aviso de copyright ni ninguna restricción de uso.
            </p>
          </Sub>
          <Sub title="7.4 Marca y contenido del sitio">
            <p>
              El nombre "Tintamarindo", el diseño del sitio web, los textos y los materiales gráficos propios del servicio (distintos de las ilustraciones generadas para cada pedido) son propiedad de Tintamarindo y no pueden reproducirse ni usarse sin autorización.
            </p>
          </Sub>
        </Section>

        <Section num="8" title="Responsabilidades y limitaciones">
          <Sub title="8.1 Responsabilidad de Tintamarindo">
            <p>Tintamarindo se compromete a:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Generar y revisar las ilustraciones del pedido dentro del plazo indicado.</li>
              <li>Enviar el PDF para aprobación del cliente antes de imprimir.</li>
              <li>Imprimir y enviar el libro una vez recibida la aprobación (o transcurrido el plazo de aprobación automática).</li>
              <li>Custodiar las imágenes del cliente de forma segura y eliminarlas al vencimiento del plazo de retención.</li>
            </ul>
            <p>
              No nos responsabilizamos por demoras en la entrega causadas por el Correo Argentino, por dirección de envío incorrecta provista por el cliente, ni por fuerza mayor.
            </p>
          </Sub>
          <Sub title="8.2 Responsabilidad del cliente">
            <p>El cliente es responsable de:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Proveer fotos de buena calidad y con buena iluminación del rostro del niño o niña, para obtener el mejor resultado posible.</li>
              <li>Verificar que los datos de envío ingresados sean correctos antes de confirmar el pago.</li>
              <li>Revisar el PDF de aprobación dentro del plazo de 5 días corridos y notificarnos si detecta algún problema.</li>
              <li>Contar con autorización para subir las imágenes de los menores fotografiados (ver sección 6).</li>
            </ul>
          </Sub>
        </Section>

        <Section num="9" title="Modificaciones a los términos">
          <p>
            Tintamarindo se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entran en vigencia desde su publicación en el sitio. El uso continuado del servicio después de la publicación de cambios implica la aceptación de los nuevos términos. Los pedidos ya realizados se rigen por los términos vigentes al momento del pago.
          </p>
        </Section>

        <Section num="10" title="Ley aplicable y jurisdicción">
          <p>
            Estos Términos y Condiciones se rigen por las leyes de la República Argentina, incluyendo la Ley N° 24.240 de Defensa del Consumidor y sus modificatorias. Ante cualquier conflicto, las partes se someten a la jurisdicción de los tribunales ordinarios competentes de la República Argentina.
          </p>
        </Section>

        <Section num="11" title="Contacto">
          <p>
            Para consultas, solicitudes de cancelación, ejercicio de derechos de privacidad o cualquier otro reclamo, podés comunicarte con nosotros por:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Email: <em>[EMAIL DE CONTACTO — completar antes de publicar]</em></li>
            <li>WhatsApp: <em>[NÚMERO DE WHATSAPP — completar antes de publicar]</em></li>
          </ul>
        </Section>

      </div>
    </>
  )
}
