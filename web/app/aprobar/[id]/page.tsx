import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { obtenerUrlFirmada } from '@/lib/r2'
import { linkWhatsApp } from '@/lib/contacto'

export const metadata: Metadata = {
  title: 'Tu libro para revisar — Tintamarindo',
  robots: { index: false, follow: false },
}

// Página pública y estable para que el cliente vea el PDF de su libro y lo apruebe.
// El link (tintamarindo.store/aprobar/<id>) no expira: genera una URL firmada nueva
// del PDF en cada visita. Es el link que el admin le pasa al cliente por WhatsApp.
// El id del pedido es un cuid aleatorio (no enumerable) y el PDF es la versión de
// baja resolución con marca de agua, pensada justamente para mostrársela al cliente.
export default async function AprobarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: { id: true, nombreCompleto: true, pdfUrl: true },
  })
  if (!pedido) notFound()

  const codigo = pedido.id.slice(-8).toUpperCase()
  const pdfUrl = pedido.pdfUrl ? await obtenerUrlFirmada(pedido.pdfUrl, 3600) : null
  const primerNombre = pedido.nombreCompleto.split(' ')[0]

  const mensajeAprobar = `¡Hola! Soy ${primerNombre}. Vi el PDF de mi libro (pedido ${codigo}) y quiero APROBARLO ✅`
  const mensajeCambios = `¡Hola! Soy ${primerNombre}. Sobre el PDF de mi libro (pedido ${codigo}), quería pedir un cambio:`

  return (
    <div className="min-h-screen bg-[#FEF9F0] px-5 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-6">
          <p className="text-2xl font-black text-orange-500" style={{ fontFamily: 'var(--font-display)' }}>
            Tintamarindo
          </p>
          <h1 className="text-2xl font-black text-stone-800 mt-3" style={{ fontFamily: 'var(--font-display)' }}>
            Tu libro está listo para revisar
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            Pedido <span className="font-mono font-bold">#{codigo}</span>
          </p>
        </header>

        {pdfUrl ? (
          <>
            <p className="text-stone-600 text-center mb-5 leading-relaxed">
              Mirá con atención cada página. La versión final se imprime tal cual la ves acá, pero <b>sin la marca de agua</b> y
              en alta calidad. Cuando estés seguro/a, aprobalo. Si querés algún cambio, escribinos y lo ajustamos.
            </p>

            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white mb-4">
              <iframe src={pdfUrl} title="PDF del libro" className="w-full h-[70vh]" />
            </div>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-orange-600 underline text-sm mb-8"
            >
              ¿No se ve bien? Abrir / descargar el PDF
            </a>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={linkWhatsApp(mensajeAprobar)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-green-500 hover:bg-green-600 text-white font-black py-3 px-6 rounded-2xl transition-colors"
              >
                ✅ Aprobar por WhatsApp
              </a>
              <a
                href={linkWhatsApp(mensajeCambios)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-white hover:bg-stone-50 text-stone-700 font-bold py-3 px-6 rounded-2xl border border-stone-300 transition-colors"
              >
                ✏️ Pedir un cambio
              </a>
            </div>
          </>
        ) : (
          <div className="text-center bg-white rounded-2xl border border-stone-200 p-8">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-stone-600 leading-relaxed">
              El PDF de tu libro todavía no está listo. Apenas lo tengamos preparado te avisamos por WhatsApp para que lo
              revises y lo apruebes. ¡Gracias por tu paciencia!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
