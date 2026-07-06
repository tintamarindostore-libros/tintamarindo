'use client'

import { useRef, useState } from 'react'
import { formatoARS } from '@/lib/precios'

type Imagen = {
  id: string
  orden: number
  tipo: string
  aprobada: boolean
  urlFirmada: string | null
  generada: boolean
  promptExtra: string | null
}

type Pedido = {
  id: string
  estado: string
  tamano: string
  tematicas: string[]
  tematicasPersonalizadas: string[]
  estilos: string[]
  tipoPapel: string
  fotoFamiliarUrl: string | null
  tituloTapa: string | null
  subtituloTapa: string | null
  observacionesTapa: string | null
  dedicatoria: string | null
  estiloTapa: string | null
  nombreCompleto: string
  direccion: string
  codigoPostal: string
  localidad: string
  provincia: string
  telefono: string
  emailEnvio: string
  tipoEntrega: string
  costoEnvioEstimado: number | null
  trackingNumero: string | null
  pdfUrlFirmada: string | null
}

const ESTADO_LABEL: Record<string, string> = {
  ESPERANDO_PAGO: 'Esperando pago',
  ESPERANDO_GENERACION: 'Esperando generación',
  EN_REVISION: 'En revisión',
  ESPERANDO_APROBACION: 'Esperando aprobación',
  APROBADO: 'Aprobado',
  ENVIADO: 'Enviado',
}

export function PedidoDetalle({
  pedido,
  fotos,
  imagenesIniciales,
}: {
  pedido: Pedido
  fotos: { id: string; urlFirmada: string }[]
  imagenesIniciales: Imagen[]
}) {
  const [imagenes, setImagenes] = useState<Imagen[]>(imagenesIniciales)
  const [promptExtras, setPromptExtras] = useState<Record<string, string>>(
    Object.fromEntries(imagenesIniciales.map((i) => [i.id, i.promptExtra ?? ''])),
  )
  const [guardandoPrompt, setGuardandoPrompt] = useState<string | null>(null)
  const [generandoImg, setGenerandoImg] = useState<string | null>(null)
  const [estado, setEstado] = useState(pedido.estado)
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState({ hechas: imagenesIniciales.filter((i) => i.generada).length, total: imagenesIniciales.length })
  const [errorGen, setErrorGen] = useState<string | null>(null)
  const [trackingInput, setTrackingInput] = useState(pedido.trackingNumero ?? '')
  const [subiendoPdf, setSubiendoPdf] = useState(false)
  const [guardandoTracking, setGuardandoTracking] = useState(false)
  const [simulandoPago, setSimulandoPago] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const aprobadas = imagenes.filter((i) => i.aprobada).length

  const simularPago = async () => {
    setSimulandoPago(true)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/simular-pago`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEstado('ESPERANDO_GENERACION')
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSimulandoPago(false)
    }
  }

  const refrescarImagen = async () => {
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/generar`, { method: 'POST' })
    return res.json()
  }

  const generarTodas = async () => {
    setGenerando(true)
    setErrorGen(null)
    try {
      while (true) {
        const data = await refrescarImagen()
        if (data.error) throw new Error(data.error)
        if (data.done) {
          setEstado('EN_REVISION')
          break
        }
        setProgreso((p) => ({ ...p, hechas: p.hechas + 1 }))
        // recargar la imagen puntual desde la lista actual no es trivial sin nueva consulta;
        // forzamos refresco completo de la página tras terminar el lote
      }
      window.location.reload()
    } catch (err) {
      setErrorGen((err as Error).message)
    } finally {
      setGenerando(false)
    }
  }

  const toggleAprobar = async (img: Imagen) => {
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/imagenes/${img.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: img.aprobada ? 'desaprobar' : 'aprobar' }),
    })
    const data = await res.json()
    if (data.imagen) {
      setImagenes((prev) => prev.map((i) => (i.id === img.id ? { ...i, aprobada: data.imagen.aprobada } : i)))
    }
  }

  const guardarPrompt = async (img: Imagen) => {
    setGuardandoPrompt(img.id)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/imagenes/${img.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'actualizarPrompt', promptExtra: promptExtras[img.id] ?? '' }),
      })
      const data = await res.json()
      if (data.imagen) {
        setImagenes((prev) => prev.map((i) => (i.id === img.id ? { ...i, promptExtra: data.imagen.promptExtra } : i)))
      }
    } finally {
      setGuardandoPrompt(null)
    }
  }

  const regenerar = async (img: Imagen) => {
    setGenerandoImg(img.id)
    setErrorGen(null)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/imagenes/${img.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'regenerar' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al generar la imagen')
      window.location.reload()
    } catch (err) {
      setErrorGen((err as Error).message)
      setGenerandoImg(null)
    }
  }

  const subirPdf = async () => {
    const file = pdfInputRef.current?.files?.[0]
    if (!file) return
    setSubiendoPdf(true)
    try {
      const fd = new FormData()
      fd.append('pdf', file)
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/pdf`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEstado('ESPERANDO_APROBACION')
    } finally {
      setSubiendoPdf(false)
    }
  }

  const guardarTracking = async () => {
    setGuardandoTracking(true)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumero: trackingInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEstado('ENVIADO')
    } finally {
      setGuardandoTracking(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FEF9F0] px-6 py-12" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {estado === 'ESPERANDO_PAGO' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-sm text-yellow-800 font-medium">
              🔒 Pago pendiente — el cliente aún no pagó
            </p>
            <button
              onClick={simularPago}
              disabled={simulandoPago}
              className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-stone-200 text-yellow-900 text-xs font-black px-4 py-2 rounded-full transition-colors"
            >
              {simulandoPago ? 'Simulando…' : '🧪 Simular pago (dev)'}
            </button>
          </div>
        )}

        <div>
          <a href="/admin" className="text-sm text-stone-400 hover:text-stone-600">← Volver al panel</a>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-black text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
              {pedido.nombreCompleto}
            </h1>
            <span className="text-xs font-bold bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
              {ESTADO_LABEL[estado] ?? estado}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Pedido</p>
            <p className="text-sm text-stone-600">Tamaño: <b>{pedido.tamano === 'CHICO' ? '24 páginas' : '32 páginas'}</b></p>
            <p className="text-sm text-stone-600">Temáticas: <b>{pedido.tematicas.join(', ')}</b></p>
            {pedido.tematicasPersonalizadas.length > 0 && (
              <p className="text-sm text-stone-600">Personalizadas: <b>{pedido.tematicasPersonalizadas.join(', ')}</b></p>
            )}
            <p className="text-sm text-stone-600">Estilos: <b>{pedido.estilos.join(', ')}</b></p>
            <p className="text-sm text-stone-600">Papel: <b>{pedido.tipoPapel}</b></p>
            {pedido.fotoFamiliarUrl && (
              <div className="mt-2">
                <p className="text-xs text-stone-400 mb-1">Imagen familiar:</p>
                <img src={pedido.fotoFamiliarUrl} alt="Imagen familiar" className="w-24 h-24 object-cover rounded-xl border border-stone-100" />
              </div>
            )}
            {(pedido.tituloTapa || pedido.subtituloTapa || pedido.observacionesTapa || pedido.dedicatoria || pedido.estiloTapa) && (
              <div className="mt-3 pt-3 border-t border-stone-100">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Tapa</p>
                {pedido.tituloTapa && <p className="text-sm text-stone-600">Título: <b>{pedido.tituloTapa}</b></p>}
                {pedido.subtituloTapa && <p className="text-sm text-stone-600">Subtítulo: <b>{pedido.subtituloTapa}</b></p>}
                {pedido.estiloTapa && <p className="text-sm text-stone-600">Estilo: <b>{pedido.estiloTapa}</b></p>}
                {pedido.observacionesTapa && <p className="text-sm text-stone-600">Observaciones: <i>{pedido.observacionesTapa}</i></p>}
                {pedido.dedicatoria && (
                  <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-0.5">Dedicatoria</p>
                    <p className="text-sm text-stone-700 italic">"{pedido.dedicatoria}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Envío</p>
            <p className="text-sm text-stone-600">{pedido.tipoEntrega === 'SUCURSAL' ? 'Retiro en sucursal' : 'A domicilio'}</p>
            <p className="text-sm text-stone-600">{pedido.direccion}</p>
            <p className="text-sm text-stone-600">{pedido.localidad}, {pedido.provincia} ({pedido.codigoPostal})</p>
            <p className="text-sm text-stone-600">{pedido.telefono} · {pedido.emailEnvio}</p>
            <p className="text-sm text-stone-600 mt-2">
              Estimado mostrado al cliente: {pedido.costoEnvioEstimado !== null ? formatoARS(pedido.costoEnvioEstimado) : 'a confirmar (sin MiCorreo API todavía)'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Fotos del cliente</p>
          <div className="flex gap-3 flex-wrap">
            {fotos.map((f) => (
              <img key={f.id} src={f.urlFirmada} alt="Foto del cliente" className="w-24 h-24 object-cover rounded-xl border border-stone-100" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Páginas del libro — {aprobadas}/{imagenes.length} aprobadas
            </p>
            <button
              onClick={generarTodas}
              disabled={generando}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 text-white text-xs font-black px-4 py-2 rounded-full transition-colors"
            >
              {generando ? `Generando ${progreso.hechas}/${progreso.total}…` : 'Generar imágenes faltantes'}
            </button>
          </div>
          {errorGen && <p className="text-sm text-red-500 mb-3">{errorGen}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {imagenes.map((img) => (
              <div key={img.id} className="rounded-xl border border-stone-100 overflow-hidden">
                <div className="h-32 bg-stone-50 flex items-center justify-center">
                  {img.urlFirmada ? (
                    <img src={img.urlFirmada} alt={img.tipo === 'TAPA' ? 'Tapa' : `Página ${img.orden + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-stone-300">
                      {generandoImg === img.id ? 'Generando…' : 'Sin generar'}
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-[10px] text-stone-400 font-bold">
                    {img.tipo === 'TAPA' ? 'Tapa (color)' : `Pág. ${img.orden + 1} · Tipo ${img.tipo}`}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleAprobar(img)}
                      disabled={!img.urlFirmada}
                      className={[
                        'flex-1 text-[10px] font-bold py-1 rounded-full',
                        img.aprobada ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500',
                      ].join(' ')}
                    >
                      {img.aprobada ? '✓ Aprobada' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => regenerar(img)}
                      disabled={generandoImg === img.id}
                      className={[
                        'flex-1 text-[10px] font-bold py-1 rounded-full disabled:opacity-50',
                        img.urlFirmada ? 'bg-stone-100 text-stone-500' : 'bg-orange-500 text-white',
                      ].join(' ')}
                    >
                      {generandoImg === img.id ? 'Generando…' : img.urlFirmada ? 'Regenerar' : 'Generar'}
                    </button>
                  </div>
                  <textarea
                    value={promptExtras[img.id] ?? ''}
                    onChange={(e) => setPromptExtras((prev) => ({ ...prev, [img.id]: e.target.value }))}
                    placeholder="Instrucciones extra para el prompt de esta imagen (opcional)..."
                    rows={2}
                    className="w-full rounded-lg border border-stone-200 px-2 py-1 text-[10px] focus:border-orange-300 focus:outline-none"
                  />
                  <button
                    onClick={() => guardarPrompt(img)}
                    disabled={guardandoPrompt === img.id}
                    className="w-full text-[10px] font-bold py-1 rounded-full bg-stone-100 text-stone-500"
                  >
                    {guardandoPrompt === img.id ? 'Guardando…' : 'Guardar prompt'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">PDF del libro</p>
            {pedido.pdfUrlFirmada && (
              <a href={pedido.pdfUrlFirmada} target="_blank" className="text-sm text-orange-500 underline block mb-3">
                Ver PDF actual
              </a>
            )}
            <input ref={pdfInputRef} type="file" accept="application/pdf" className="text-xs mb-2" />
            <button
              onClick={subirPdf}
              disabled={subiendoPdf}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 text-white text-xs font-black px-4 py-2 rounded-full transition-colors"
            >
              {subiendoPdf ? 'Subiendo…' : 'Subir PDF'}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Despacho</p>
            <input
              type="text"
              placeholder="Número de tracking"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm mb-2"
            />
            <button
              onClick={guardarTracking}
              disabled={guardandoTracking || !trackingInput.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 text-white text-xs font-black px-4 py-2 rounded-full transition-colors"
            >
              {guardandoTracking ? 'Guardando…' : 'Marcar como enviado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
