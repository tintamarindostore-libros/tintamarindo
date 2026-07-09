'use client'

import { useRef, useState } from 'react'
import { formatoARS, precioFinalLibro } from '@/lib/precios'
import { renderPlantilla } from '@/lib/plantillas'

// La generación de imágenes puede tardar y, si se corta a mitad de camino
// (timeout del servidor), llega una respuesta vacía que rompe JSON.parse.
// Esto da un mensaje entendible en vez de ese error críptico.
async function parsearRespuesta(res: Response) {
  const texto = await res.text()
  if (!texto) {
    throw new Error('La generación tardó demasiado y se cortó. Probá de nuevo — a veces la segunda vez es más rápida.')
  }
  try {
    return JSON.parse(texto)
  } catch {
    throw new Error('Respuesta inesperada del servidor. Probá de nuevo.')
  }
}

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
  creadoEn: string
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
  medioPago: string
  cuponCodigo: string | null
  cuponDescuentoPorcentaje: number | null
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

type Plantilla = {
  id: string
  clave: string
  nombre: string
  cuerpo: string
  camposManuales: readonly string[]
}

function MensajePlantilla({ plantilla, variablesAuto }: { plantilla: Plantilla; variablesAuto: Record<string, string> }) {
  const [manuales, setManuales] = useState<Record<string, string>>({})
  const [copiado, setCopiado] = useState(false)

  const texto = renderPlantilla(plantilla.cuerpo, { ...variablesAuto, ...manuales })

  const copiar = () => {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  return (
    <div className="rounded-xl border border-stone-800 p-3">
      <p className="text-xs font-bold text-stone-400 mb-2">{plantilla.nombre}</p>
      {plantilla.camposManuales.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {plantilla.camposManuales.map((campo) => (
            <input
              key={campo}
              type="text"
              placeholder={`Completar: ${campo}`}
              value={manuales[campo] ?? ''}
              onChange={(e) => setManuales((prev) => ({ ...prev, [campo]: e.target.value }))}
              className="flex-1 min-w-[160px] rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 px-2 py-1 text-xs outline-none focus:border-amber-400 placeholder:text-amber-500/60"
            />
          ))}
        </div>
      )}
      <pre className="whitespace-pre-wrap text-xs text-stone-300 bg-stone-950 rounded-lg p-3 mb-2 font-sans">{texto}</pre>
      <button
        type="button"
        onClick={copiar}
        className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-800 text-stone-300 hover:bg-brand-500 hover:text-white transition-colors"
      >
        {copiado ? '✓ Copiado' : '📋 Copiar mensaje'}
      </button>
    </div>
  )
}

export function PedidoDetalle({
  pedido,
  fotos,
  imagenesIniciales,
  plantillas,
  variablesAuto,
}: {
  pedido: Pedido
  fotos: { id: string; urlFirmada: string }[]
  imagenesIniciales: Imagen[]
  plantillas: Plantilla[]
  variablesAuto: Record<string, string>
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
  const [confirmandoTransferencia, setConfirmandoTransferencia] = useState(false)
  const [codigoCopiado, setCodigoCopiado] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const aprobadas = imagenes.filter((i) => i.aprobada).length

  const copiarCodigo = () => {
    navigator.clipboard.writeText(pedido.id.slice(-8).toUpperCase())
    setCodigoCopiado(true)
    setTimeout(() => setCodigoCopiado(false), 1500)
  }

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

  const confirmarTransferencia = async () => {
    setConfirmandoTransferencia(true)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/confirmar-transferencia`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEstado('ESPERANDO_GENERACION')
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setConfirmandoTransferencia(false)
    }
  }

  const refrescarImagen = async () => {
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/generar`, { method: 'POST' })
    return parsearRespuesta(res)
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
      const data = await parsearRespuesta(res)
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
    <div className="min-h-screen bg-stone-950 px-6 py-12" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {estado === 'ESPERANDO_PAGO' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-sm text-amber-300 font-medium">
              🔒 Pago pendiente ({pedido.medioPago === 'TRANSFERENCIA' ? 'transferencia' : 'MercadoPago'}) — el cliente aún no pagó
            </p>
            <div className="flex gap-2">
              {pedido.medioPago === 'TRANSFERENCIA' && (
                <button
                  onClick={confirmarTransferencia}
                  disabled={confirmandoTransferencia}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-stone-700 text-white text-xs font-black px-4 py-2 rounded-full transition-colors"
                >
                  {confirmandoTransferencia ? 'Confirmando…' : '✓ Confirmar transferencia recibida'}
                </button>
              )}
              <button
                onClick={simularPago}
                disabled={simulandoPago}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 text-stone-900 text-xs font-black px-4 py-2 rounded-full transition-colors"
              >
                {simulandoPago ? 'Simulando…' : '🧪 Simular pago (dev)'}
              </button>
            </div>
          </div>
        )}

        <div>
          <a href="/admin" className="text-sm text-stone-500 hover:text-stone-300">← Volver al panel</a>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {pedido.nombreCompleto}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5 font-mono">
                <button onClick={copiarCodigo} className="hover:text-brand-400 transition-colors" title="Copiar código">
                  {codigoCopiado ? '✓ copiado' : `#${pedido.id.slice(-8).toUpperCase()}`}
                </button>
                {' · '}{pedido.creadoEn}
              </p>
            </div>
            <span className="text-xs font-bold bg-stone-800 text-stone-300 px-3 py-1 rounded-full shrink-0">
              {ESTADO_LABEL[estado] ?? estado}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Pedido</p>
            <p className="text-sm text-stone-300">Tamaño: <b className="text-white">{pedido.tamano === 'CHICO' ? '24 páginas' : '32 páginas'}</b></p>
            <p className="text-sm text-stone-300">Temáticas: <b className="text-white">{pedido.tematicas.join(', ')}</b></p>
            {pedido.tematicasPersonalizadas.length > 0 && (
              <p className="text-sm text-stone-300">Personalizadas: <b className="text-white">{pedido.tematicasPersonalizadas.join(', ')}</b></p>
            )}
            <p className="text-sm text-stone-300">Estilos: <b className="text-white">{pedido.estilos.join(', ')}</b></p>
            <p className="text-sm text-stone-300">Papel: <b className="text-white">{pedido.tipoPapel}</b></p>
            {pedido.fotoFamiliarUrl && (
              <div className="mt-2">
                <p className="text-xs text-stone-500 mb-1">Imagen familiar:</p>
                <img src={pedido.fotoFamiliarUrl} alt="Imagen familiar" className="w-24 h-24 object-cover rounded-xl border border-stone-800" />
              </div>
            )}
            {(pedido.tituloTapa || pedido.subtituloTapa || pedido.observacionesTapa || pedido.dedicatoria || pedido.estiloTapa) && (
              <div className="mt-3 pt-3 border-t border-stone-800">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Tapa</p>
                {pedido.tituloTapa && <p className="text-sm text-stone-300">Título: <b className="text-white">{pedido.tituloTapa}</b></p>}
                {pedido.subtituloTapa && <p className="text-sm text-stone-300">Subtítulo: <b className="text-white">{pedido.subtituloTapa}</b></p>}
                {pedido.estiloTapa && <p className="text-sm text-stone-300">Estilo: <b className="text-white">{pedido.estiloTapa}</b></p>}
                {pedido.observacionesTapa && <p className="text-sm text-stone-300">Observaciones: <i>{pedido.observacionesTapa}</i></p>}
                {pedido.dedicatoria && (
                  <div className="mt-2 p-2 bg-brand-500/10 rounded-lg border border-brand-500/20">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-0.5">Dedicatoria</p>
                    <p className="text-sm text-stone-200 italic">"{pedido.dedicatoria}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Envío</p>
            <p className="text-sm text-stone-300">{pedido.tipoEntrega === 'SUCURSAL' ? 'Retiro en sucursal' : 'A domicilio'}</p>
            <p className="text-sm text-stone-300">{pedido.direccion}</p>
            <p className="text-sm text-stone-300">{pedido.localidad}, {pedido.provincia} ({pedido.codigoPostal})</p>
            <p className="text-sm text-stone-300">{pedido.telefono} · {pedido.emailEnvio}</p>
            <p className="text-sm text-stone-300 mt-2">
              Estimado mostrado al cliente: {pedido.costoEnvioEstimado !== null ? formatoARS(pedido.costoEnvioEstimado) : 'a confirmar (sin MiCorreo API todavía)'}
            </p>
            <p className="text-sm text-stone-300 mt-2 pt-2 border-t border-stone-800">
              Pago: <b className="text-white">{pedido.cuponDescuentoPorcentaje === 100 ? 'Bonificado (cupón)' : pedido.medioPago === 'TRANSFERENCIA' ? 'Transferencia bancaria' : 'MercadoPago'}</b>
              {' · Libro: '}
              <b className="text-white">{formatoARS(precioFinalLibro(pedido.tamano, pedido.medioPago, pedido.cuponDescuentoPorcentaje))}</b>
            </p>
            {pedido.cuponCodigo && (
              <p className="text-xs font-bold text-green-400 bg-green-500/15 border border-green-500/20 rounded-lg px-2.5 py-1 mt-2 inline-block">
                🎟 PROMO: {pedido.cuponCodigo} ({pedido.cuponDescuentoPorcentaje}% off)
              </p>
            )}
          </div>
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Fotos del cliente</p>
          <div className="flex gap-3 flex-wrap">
            {fotos.map((f) => (
              <img key={f.id} src={f.urlFirmada} alt="Foto del cliente" className="w-24 h-24 object-cover rounded-xl border border-stone-800" />
            ))}
          </div>
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Páginas del libro — {aprobadas}/{imagenes.length} aprobadas
            </p>
            <button
              onClick={generarTodas}
              disabled={generando}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-stone-700 text-white text-xs font-black px-4 py-2 rounded-full transition-colors"
            >
              {generando ? `Generando ${progreso.hechas}/${progreso.total}…` : 'Generar imágenes faltantes'}
            </button>
          </div>
          {errorGen && <p className="text-sm text-red-400 mb-3">{errorGen}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {imagenes.map((img) => (
              <div key={img.id} className="rounded-xl border border-stone-800 overflow-hidden">
                <div className="h-32 bg-stone-800 flex items-center justify-center">
                  {img.urlFirmada ? (
                    <img src={img.urlFirmada} alt={img.tipo === 'TAPA' ? 'Tapa' : `Página ${img.orden + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-stone-600">
                      {generandoImg === img.id ? 'Generando…' : 'Sin generar'}
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-[10px] text-stone-500 font-bold">
                    {img.tipo === 'TAPA' ? 'Tapa (color)' : `Pág. ${img.orden + 1} · Tipo ${img.tipo}`}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleAprobar(img)}
                      disabled={!img.urlFirmada}
                      className={[
                        'flex-1 text-[10px] font-bold py-1 rounded-full',
                        img.aprobada ? 'bg-green-500/15 text-green-400' : 'bg-stone-800 text-stone-400',
                      ].join(' ')}
                    >
                      {img.aprobada ? '✓ Aprobada' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => regenerar(img)}
                      disabled={generandoImg === img.id}
                      className={[
                        'flex-1 text-[10px] font-bold py-1 rounded-full disabled:opacity-50',
                        img.urlFirmada ? 'bg-stone-800 text-stone-400' : 'bg-brand-500 text-white',
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
                    className="w-full rounded-lg border border-stone-700 bg-stone-800 text-stone-200 px-2 py-1 text-[10px] focus:border-brand-500 focus:outline-none placeholder:text-stone-600"
                  />
                  <button
                    onClick={() => guardarPrompt(img)}
                    disabled={guardandoPrompt === img.id}
                    className="w-full text-[10px] font-bold py-1 rounded-full bg-stone-800 text-stone-400"
                  >
                    {guardandoPrompt === img.id ? 'Guardando…' : 'Guardar prompt'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">PDF del libro</p>
            {pedido.pdfUrlFirmada && (
              <a href={pedido.pdfUrlFirmada} target="_blank" className="text-sm text-brand-400 underline block mb-3">
                Ver PDF actual
              </a>
            )}
            <input ref={pdfInputRef} type="file" accept="application/pdf" className="text-xs text-stone-400 mb-2" />
            <button
              onClick={subirPdf}
              disabled={subiendoPdf}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-stone-700 text-white text-xs font-black px-4 py-2 rounded-full transition-colors"
            >
              {subiendoPdf ? 'Subiendo…' : 'Subir PDF'}
            </button>
          </div>

          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Despacho</p>
            <input
              type="text"
              placeholder="Número de tracking"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-800 text-white px-3 py-2 text-sm mb-2 focus:border-brand-500 focus:outline-none placeholder:text-stone-600"
            />
            <button
              onClick={guardarTracking}
              disabled={guardandoTracking || !trackingInput.trim()}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-stone-700 text-white text-xs font-black px-4 py-2 rounded-full transition-colors"
            >
              {guardandoTracking ? 'Guardando…' : 'Marcar como enviado'}
            </button>
          </div>
        </div>

        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Mensajes para el cliente</p>
            <a href="/admin/mensajes" className="text-xs text-brand-400 hover:text-brand-300">Editar textos →</a>
          </div>
          <div className="space-y-3">
            {plantillas.map((p) => (
              <MensajePlantilla key={p.id} plantilla={p} variablesAuto={variablesAuto} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
