import Link from 'next/link'
import type { Metadata } from 'next'
import { FormularioFeria } from './FormularioFeria'
import { feriaAbierta } from '@/lib/feria'

export const metadata: Metadata = {
  title: 'Tu lámina personalizada, gratis — Tintamarindo',
  description:
    'Subí una foto de tu peque y te mandamos un dibujo suyo para colorear. Regalo para quienes nos visitaron en la Feria del Libro Infantil.',
}

// Dinámica para que el cierre automático (después del 9/8) se refleje siempre,
// sin depender de un redeploy — la página no hace consultas pesadas.
export const dynamic = 'force-dynamic'

function Header() {
  return (
    <header className="bg-white border-b border-stone-100 py-4 px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/landing/logo.png" alt="Tintamarindo" className="h-9 w-auto" />
        </Link>
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
          ← Volver al inicio
        </Link>
      </div>
    </header>
  )
}

function EjemploLamina() {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4">
      <div className="grid grid-cols-2 gap-3">
        <figure>
          <img src="/landing/estilo-realista-foto.jpg" alt="Foto de ejemplo" className="w-full aspect-square object-cover rounded-2xl" />
          <figcaption className="text-center text-xs font-bold text-stone-400 mt-1.5">Tu foto</figcaption>
        </figure>
        <figure>
          <img src="/landing/estilo-realista-linea.jpg" alt="Lámina para colorear de ejemplo" className="w-full aspect-square object-cover rounded-2xl border border-stone-100" />
          <figcaption className="text-center text-xs font-bold text-orange-500 mt-1.5">Tu lámina</figcaption>
        </figure>
      </div>
    </div>
  )
}

export default function FeriaPage() {
  const abierta = feriaAbierta()

  return (
    <div className="min-h-screen bg-[#FEF9F0]">
      <Header />

      <main className="max-w-5xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
        {/* Encabezado + formulario arriba de todo */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          <div className="space-y-5">
            <div>
              <span className="inline-block text-xs font-black uppercase tracking-widest text-orange-500 bg-orange-100 rounded-full px-3 py-1 mb-3">
                🎪 Regalo de la Feria
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-800 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Tu lámina personalizada, gratis
              </h1>
              <p className="text-stone-600 mt-3 leading-relaxed">
                Subí una foto de tu peque y te mandamos un dibujo suyo para colorear. Sin cargo y sin compromiso.
              </p>
              <p className="text-stone-500 mt-2 text-sm">
                Regalo para quienes nos visitaron en la Feria del Libro Infantil.
              </p>
            </div>
            <EjemploLamina />
          </div>

          <div className="lg:pt-2">
            {abierta ? (
              <FormularioFeria />
            ) : (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 text-center">
                <div className="text-5xl mb-3">🙌</div>
                <h2 className="text-2xl font-black text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
                  El regalo de la Feria ya terminó
                </h2>
                <p className="text-stone-600 mt-3 leading-relaxed">
                  ¡Gracias a todos los que participaron! Si te quedaste con ganas, mirá el libro completo con tu peque de
                  protagonista.
                </p>
                <Link href="/" className="inline-block mt-5 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-7 rounded-2xl transition-colors">
                  Ver cómo funciona →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Cómo sigue */}
        <section className="mt-14">
          <h2 className="text-2xl font-black text-stone-800 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Cómo sigue
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { n: '1', t: 'Recibimos tu foto.' },
              { n: '2', t: 'Dibujamos a tu peque como personaje.' },
              { n: '3', t: 'Te llega la lámina por WhatsApp para imprimir y pintar.' },
            ].map((p) => (
              <div key={p.n} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-black flex items-center justify-center mb-3">{p.n}</div>
                <p className="text-stone-700 text-sm leading-relaxed">{p.t}</p>
              </div>
            ))}
          </div>
          <p className="text-stone-500 text-sm mt-4">
            Suele estar lista en menos de 48 horas. La hacemos a mano, de a una.
          </p>
        </section>

        {/* Tranquilidad sobre la foto */}
        <section className="mt-12">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7">
            <h2 className="text-xl font-black text-stone-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Qué hacemos con la foto
            </h2>
            <p className="text-stone-600 leading-relaxed">
              La usamos <b>solo</b> para dibujar esta lámina. No la publicamos, no la compartimos con nadie y la borramos a
              los 30 días. Si querés que la borremos antes, escribinos y listo.
            </p>
          </div>
        </section>

        {/* Recién acá, el producto */}
        <section className="mt-12">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Y si te gusta cómo queda…</p>
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl border border-orange-200 p-6 sm:p-8">
            <h2 className="text-2xl font-black text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
              El libro completo
            </h2>
            <p className="text-stone-600 mt-2 leading-relaxed">
              Tiene 24 o 32 páginas con tu peque de protagonista en cada una. Elegís las temáticas y el estilo, lo imprimimos
              y te lo mandamos a tu casa.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-orange-500 text-white font-black text-sm rounded-full px-4 py-2">
                🎟 Código FERIA — 15% de descuento
              </span>
              <span className="text-sm text-stone-500">hasta el 9 de agosto</span>
            </div>
            <Link href="/" className="inline-block mt-5 font-bold text-orange-600 hover:text-orange-700">
              Ver cómo funciona →
            </Link>
          </div>
        </section>

        {/* Día del Niño */}
        <section className="mt-6">
          <div className="bg-stone-100 rounded-3xl border border-stone-200 p-6 sm:p-7">
            <h3 className="text-lg font-black text-stone-800 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              ¿Lo querés para el Día del Niño?
            </h3>
            <p className="text-stone-600 leading-relaxed">
              El libro no llega a tiempo si lo pedís ahora, pero te mandamos un <b>vale imprimible con la tapa de su libro</b> para
              que lo abra el 9. El libro llega después.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
