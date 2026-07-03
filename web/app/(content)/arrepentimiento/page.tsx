import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Botón de arrepentimiento — Tintamarindo',
  description: 'Política de cancelación y ejercicio del derecho de arrepentimiento en compras de Tintamarindo.',
}

export default function ArrepentimientoPage() {
  return (
    <>
      <h1
        className="text-4xl font-black text-stone-800 mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Botón de arrepentimiento
      </h1>
      <p className="text-stone-500 text-sm mb-12">
        Solicitud de cancelación de compra — información para el cliente
      </p>

      <div className="space-y-10 text-stone-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-black text-stone-800 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            ¿Qué es el derecho de arrepentimiento?
          </h2>
          <p>
            Si realizaste una compra a distancia (como esta, hecha a través de nuestra web), la ley argentina te da derecho a arrepentirte de la compra y solicitar su cancelación, sin necesidad de dar explicaciones. Este derecho está regulado por el Art. 34 de la Ley N° 24.240 de Defensa del Consumidor, el Art. 1.110 del Código Civil y Comercial de la Nación, y reglamentado en su forma de ejercicio por la Disposición N° 954/2025 de la Subsecretaría de Defensa del Consumidor y Lealtad Comercial.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-800 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Una salvedad importante: tu libro es un producto personalizado
          </h2>
          <p>
            El Art. 1.116 del Código Civil y Comercial establece una excepción a este derecho para los productos «confeccionados conforme a las especificaciones suministradas por el consumidor o claramente personalizados». Tu libro de colorear entra exactamente en esa categoría: se genera específicamente con las fotos, la temática y el estilo que vos elegiste, y no puede revenderse ni reutilizarse para otro pedido.
          </p>
          <p className="mt-3">
            Esto significa que, una vez que comenzamos a generar las imágenes de tu libro, el producto deja de ser un bien estándar y pasa a ser un trabajo a medida — por eso, a partir de ese momento, no podemos aceptar la cancelación de la compra.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-800 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            ¿Hasta cuándo puedo arrepentirme?
          </h2>
          <p>Para que esto sea justo para ambas partes, definimos una ventana clara:</p>
          <ul className="mt-3 space-y-3 list-none ml-0">
            <li className="flex gap-3">
              <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
              <span>Podés solicitar la cancelación de tu compra <strong>dentro de las 48 horas posteriores a la confirmación del pago</strong>, siempre que todavía no hayamos comenzado a generar las imágenes de tu pedido. En ese caso, te reintegramos el pago en su totalidad.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 font-bold shrink-0 mt-0.5">✗</span>
              <span>Pasadas las 48 horas, o si ya comenzamos la generación de tu libro (lo que ocurra primero), tu pedido se considera un producto personalizado en curso de fabricación, y no aplica el derecho de arrepentimiento conforme al Art. 1.116 del Código Civil y Comercial.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-800 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            ¿Cómo solicito la cancelación?
          </h2>
          <p>Para solicitar la cancelación de tu compra dentro del plazo habilitado, necesitamos los siguientes datos:</p>
          <ul className="mt-3 list-disc list-inside space-y-1 ml-1">
            <li>Nombre completo</li>
            <li>Email con el que realizaste la compra</li>
            <li>Número de teléfono de contacto</li>
            <li>Número de pedido</li>
          </ul>
          <p className="mt-4">
            Podés enviarnos la solicitud por WhatsApp o por email. Vamos a confirmarte la recepción dentro de las 24 horas, junto con un número de código de identificación de tu solicitud de arrepentimiento.
          </p>
          <p className="mt-3 text-sm text-stone-500">
            Importante: el envío de la solicitud no cancela tu pedido de forma automática. Si tu solicitud está dentro del plazo y las condiciones de esta política, procedemos a confirmar la cancelación y a reintegrar el pago.
          </p>
        </section>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
          <h3 className="font-black text-stone-800 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Resumen rápido
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-orange-500">→</span> Tenés <strong>48 horas</strong> desde el pago para arrepentirte, mientras no hayamos empezado a generar tu libro.</li>
            <li className="flex gap-2"><span className="text-orange-500">→</span> Una vez iniciada la generación de las imágenes, tu libro es un producto personalizado y no admite cancelación.</li>
            <li className="flex gap-2"><span className="text-orange-500">→</span> Si tu solicitud está dentro de plazo, te reintegramos el pago completo.</li>
          </ul>
        </div>

        <p className="text-sm text-stone-500">
          Para más información sobre tus derechos como consumidor, podés consultar los{' '}
          <Link href="/terminos" className="text-orange-500 hover:text-orange-600 underline">
            Términos y condiciones
          </Link>{' '}
          del servicio.
        </p>

      </div>
    </>
  )
}
