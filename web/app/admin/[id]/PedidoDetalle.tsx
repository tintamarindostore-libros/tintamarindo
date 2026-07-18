'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { formatoARS, precioFinalLibro } from '@/lib/precios'
import { renderPlantilla } from '@/lib/plantillas'
import { ESTADOS_PEDIDO, ESTADO_LABEL } from '@/lib/estados'
import { TARJETAS_DEDICATORIA } from '@/lib/tarjetasDedicatoria'

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
  manual: boolean
  tematica: string | null
  estilo: string | null
  aprobada: boolean
  urlFirmada: string | null
  generada: boolean
  promptExtra: string | null
}

const LABEL_TIPO_MANUAL: Record<string, string> = {
  RETIRACION_TAPA: 'Retiración de tapa',
  CONTRATAPA: 'Contratapa',
  RETIRACION_CONTRATAPA: 'Retiración de contratapa',
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
  imagenTapaUrl: string | null
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
  tematicasEfectivas: string[]
  situacionesPorTematica: Record<string, string[]>
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

function SituacionesPorTematica({
  pedidoId,
  tematicasEfectivas,
  situacionesIniciales,
}: {
  pedidoId: string
  tematicasEfectivas: string[]
  situacionesIniciales: Record<string, string[]>
}) {
  const [textos, setTextos] = useState<Record<string, string>>(
    Object.fromEntries(tematicasEfectivas.map((t) => [t, (situacionesIniciales[t] ?? []).join('\n')])),
  )
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const guardar = async () => {
    setGuardando(true)
    setGuardado(false)
    try {
      const situacionesPorTematica = Object.fromEntries(
        Object.entries(textos)
          .map(([tema, texto]) => [tema, texto.split('\n').map((l) => l.trim()).filter(Boolean)])
          .filter(([, lineas]) => (lineas as string[]).length > 0),
      )
      const res = await fetch(`/api/admin/pedidos/${pedidoId}/situaciones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situacionesPorTematica }),
      })
      if (res.ok) {
        setGuardado(true)
        setTimeout(() => setGuardado(false), 1500)
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
      <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Situaciones específicas por temática</p>
      <p className="text-xs text-stone-500 mb-3">
        Una idea por línea. El sistema va rotando entre ellas en las páginas que le toquen esa temática. Si lo dejás vacío, usa el sistema automático con variedad de poses y ángulos.
      </p>
      <div className="space-y-3">
        {tematicasEfectivas.map((tema) => (
          <div key={tema}>
            <label className="text-xs font-bold text-stone-400 mb-1 block">{tema}</label>
            <textarea
              value={textos[tema] ?? ''}
              onChange={(e) => setTextos((prev) => ({ ...prev, [tema]: e.target.value }))}
              placeholder={`Ej: el nene con la camiseta jugando dentro del estadio Monumental de River\nel nene con la camiseta en la tribuna, alentando con una bandera\nel nene con la camiseta y el estadio de River de fondo`}
              rows={3}
              className="w-full rounded-lg border border-stone-800 bg-stone-800 text-stone-200 px-3 py-2 text-xs outline-none focus:border-brand-500 placeholder:text-stone-600"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={guardar}
        disabled={guardando}
        className="mt-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 text-xs disabled:opacity-50"
      >
        {guardando ? 'Guardando…' : guardado ? '✓ Guardado' : 'Guardar situaciones'}
      </button>
    </div>
  )
}

type FotoClienteInfo = { id: string; urlFirmada: string; seleccionada: boolean }
type Recorte = { x: number; y: number; w: number; h: number }

const RECORTE_INICIAL: Recorte = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 }

function fracDesdeEvento(e: ReactPointerEvent, container: HTMLDivElement) {
  const rect = container.getBoundingClientRect()
  const fx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  const fy = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
  return { fx, fy }
}

function FotoClienteCard({
  pedidoId,
  foto,
  onUpdate,
}: {
  pedidoId: string
  foto: FotoClienteInfo
  onUpdate: (id: string, cambios: Partial<FotoClienteInfo>) => void
}) {
  const [editando, setEditando] = useState(false)
  const [sel, setSel] = useState<Recorte>(RECORTE_INICIAL)
  const [ratio, setRatio] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ modo: 'new' | 'move' | 'resize'; fx: number; fy: number; sel: Recorte } | null>(null)

  const toggleSeleccionada = async () => {
    const nuevo = !foto.seleccionada
    onUpdate(foto.id, { seleccionada: nuevo })
    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}/fotos/${foto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seleccionada: nuevo }),
      })
      if (!res.ok) throw new Error()
    } catch {
      onUpdate(foto.id, { seleccionada: !nuevo })
    }
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { fx, fy } = fracDesdeEvento(e, containerRef.current)
    const dentro = fx >= sel.x && fx <= sel.x + sel.w && fy >= sel.y && fy <= sel.y + sel.h
    dragRef.current = dentro ? { modo: 'move', fx, fy, sel } : { modo: 'new', fx, fy, sel: { x: fx, y: fy, w: 0, h: 0 } }
    if (!dentro) setSel({ x: fx, y: fy, w: 0, h: 0 })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleResizeDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!containerRef.current) return
    const { fx, fy } = fracDesdeEvento(e, containerRef.current)
    dragRef.current = { modo: 'resize', fx, fy, sel }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || !containerRef.current) return
    const { fx, fy } = fracDesdeEvento(e, containerRef.current)
    if (drag.modo === 'new') {
      setSel({ x: Math.min(drag.fx, fx), y: Math.min(drag.fy, fy), w: Math.abs(fx - drag.fx), h: Math.abs(fy - drag.fy) })
    } else if (drag.modo === 'move') {
      const x = Math.min(Math.max(0, drag.sel.x + (fx - drag.fx)), 1 - drag.sel.w)
      const y = Math.min(Math.max(0, drag.sel.y + (fy - drag.fy)), 1 - drag.sel.h)
      setSel({ ...drag.sel, x, y })
    } else {
      const w = Math.min(Math.max(0.05, fx - drag.sel.x), 1 - drag.sel.x)
      const h = Math.min(Math.max(0.05, fy - drag.sel.y), 1 - drag.sel.y)
      setSel({ ...drag.sel, w, h })
    }
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  const abrirEditor = () => {
    setSel(RECORTE_INICIAL)
    setError(null)
    setEditando(true)
  }

  const guardarRecorte = async () => {
    if (sel.w < 0.02 || sel.h < 0.02) {
      setError('Marcá un recuadro más grande antes de guardar')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}/fotos/${foto.id}/recorte`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sel),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar el recorte')
      onUpdate(foto.id, { urlFirmada: data.foto.urlFirmada })
      setEditando(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  if (!editando) {
    return (
      <div className="space-y-1.5">
        <img
          src={foto.urlFirmada}
          alt="Foto del cliente"
          className={`w-28 h-28 object-cover rounded-xl border border-stone-800 ${foto.seleccionada ? '' : 'opacity-35'}`}
        />
        <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer">
          <input type="checkbox" checked={foto.seleccionada} onChange={toggleSeleccionada} className="accent-brand-500" />
          Usar esta foto
        </label>
        <button type="button" onClick={abrirEditor} className="block text-xs font-bold text-brand-400 hover:text-brand-300">
          Ajustar encuadre
        </button>
      </div>
    )
  }

  return (
    <div className="w-60 space-y-2 bg-stone-950 border border-stone-800 rounded-xl p-2">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ aspectRatio: ratio }}
        className="relative w-full overflow-hidden rounded-lg touch-none select-none cursor-crosshair bg-stone-900"
      >
        <img
          src={foto.urlFirmada}
          alt="Foto del cliente"
          draggable={false}
          onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight || 1)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div
          className="absolute border-2 border-brand-500 bg-brand-500/20"
          style={{ left: `${sel.x * 100}%`, top: `${sel.y * 100}%`, width: `${sel.w * 100}%`, height: `${sel.h * 100}%` }}
        >
          <div
            onPointerDown={handleResizeDown}
            className="absolute -right-1.5 -bottom-1.5 w-4 h-4 rounded-full bg-brand-500 border-2 border-white cursor-nwse-resize"
          />
        </div>
      </div>
      <p className="text-[11px] text-stone-500">Arrastrá para marcar el recuadro que sirve. El punto de la esquina lo agranda o achica.</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={guardarRecorte}
          disabled={guardando}
          className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-full"
        >
          {guardando ? 'Guardando…' : 'Guardar recorte'}
        </button>
        <button type="button" onClick={() => setEditando(false)} className="text-xs font-bold text-stone-400 hover:text-stone-200 px-2">
          Cancelar
        </button>
      </div>
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
  fotos: FotoClienteInfo[]
  imagenesIniciales: Imagen[]
  plantillas: Plantilla[]
  variablesAuto: Record<string, string>
}) {
  const [imagenes, setImagenes] = useState<Imagen[]>(imagenesIniciales)
  const [fotosCliente, setFotosCliente] = useState<FotoClienteInfo[]>(fotos)
  const actualizarFotoCliente = (id: string, cambios: Partial<FotoClienteInfo>) =>
    setFotosCliente((prev) => prev.map((f) => (f.id === id ? { ...f, ...cambios } : f)))
  const [promptExtras, setPromptExtras] = useState<Record<string, string>>(
    Object.fromEntries(imagenesIniciales.map((i) => [i.id, i.promptExtra ?? ''])),
  )
  const [guardandoPrompt, setGuardandoPrompt] = useState<string | null>(null)
  const [generandoImg, setGenerandoImg] = useState<string | null>(null)
  const [estado, setEstado] = useState(pedido.estado)
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState({
    hechas: imagenesIniciales.filter((i) => i.generada && !i.manual).length,
    total: imagenesIniciales.filter((i) => !i.manual).length,
  })
  const [errorGen, setErrorGen] = useState<string | null>(null)
  const [avisoGen, setAvisoGen] = useState<string | null>(null)
  const [subiendoManual, setSubiendoManual] = useState<string | null>(null)
  const [archivoManualNombre, setArchivoManualNombre] = useState<Record<string, string>>({})
  const manualInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [trackingInput, setTrackingInput] = useState(pedido.trackingNumero ?? '')
  const [subiendoPdf, setSubiendoPdf] = useState(false)
  const [guardandoTracking, setGuardandoTracking] = useState(false)
  const [simulandoPago, setSimulandoPago] = useState(false)
  const [verificarPagoInput, setVerificarPagoInput] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [errorVerificar, setErrorVerificar] = useState<string | null>(null)
  const [mostrarEliminar, setMostrarEliminar] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState('')
  const [eliminando, setEliminando] = useState(false)
  const [confirmandoTransferencia, setConfirmandoTransferencia] = useState(false)
  const [codigoCopiado, setCodigoCopiado] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
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
    setAvisoGen(null)
    try {
      while (true) {
        const data = await refrescarImagen()
        if (data.error) throw new Error(data.error)
        if (data.done) {
          setEstado(data.estado ?? estado)
          if (data.faltanManuales) {
            setAvisoGen('Faltan subir las páginas manuales (tapa/contratapa) para pasar a revisión.')
          }
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

  const subirManual = async (img: Imagen) => {
    const file = manualInputRefs.current[img.id]?.files?.[0]
    if (!file) return
    setSubiendoManual(img.id)
    try {
      const fd = new FormData()
      fd.append('imagen', file)
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/imagenes/${img.id}/subir`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.reload()
    } catch (err) {
      setErrorGen((err as Error).message)
      setSubiendoManual(null)
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
      window.location.reload()
    } finally {
      setSubiendoPdf(false)
    }
  }

  const verificarPago = async () => {
    setVerificando(true)
    setErrorVerificar(null)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/verificar-pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: verificarPagoInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEstado('ESPERANDO_GENERACION')
    } catch (err) {
      setErrorVerificar((err as Error).message)
    } finally {
      setVerificando(false)
    }
  }

  const eliminarPedido = async () => {
    setEliminando(true)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = '/admin'
    } catch (err) {
      alert((err as Error).message)
      setEliminando(false)
    }
  }

  const cambiarEstado = async (nuevo: string) => {
    const anterior = estado
    setEstado(nuevo)
    setCambiandoEstado(true)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevo }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setEstado(anterior)
      alert('No se pudo cambiar el estado')
    } finally {
      setCambiandoEstado(false)
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
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
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
            {pedido.medioPago === 'MERCADOPAGO' && (
              <div className="pt-3 border-t border-amber-500/20">
                <p className="text-xs text-amber-300/80 mb-2">
                  Si el cliente ya pagó pero acá sigue "pendiente" (el aviso de MercadoPago no llegó), pegá el ID del pago —
                  lo ves en el detalle de la operación en tu app o cuenta de MercadoPago — para verificarlo y confirmarlo acá.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificarPagoInput}
                    onChange={(e) => setVerificarPagoInput(e.target.value)}
                    placeholder="ID del pago en MercadoPago"
                    className="flex-1 rounded-lg border border-amber-500/30 bg-stone-900 text-white px-3 py-1.5 text-xs outline-none focus:border-amber-400 placeholder:text-stone-600"
                  />
                  <button
                    onClick={verificarPago}
                    disabled={verificando || !verificarPagoInput.trim()}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:opacity-50 text-stone-900 text-xs font-black px-4 py-2 rounded-full transition-colors whitespace-nowrap"
                  >
                    {verificando ? 'Verificando…' : 'Verificar pago'}
                  </button>
                </div>
                {errorVerificar && <p className="text-xs text-red-400 mt-2">{errorVerificar}</p>}
              </div>
            )}
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
            <select
              value={estado}
              disabled={cambiandoEstado}
              onChange={(e) => cambiarEstado(e.target.value)}
              className="text-xs font-bold bg-stone-800 text-stone-300 px-3 py-1 rounded-full border border-stone-700 shrink-0 focus:outline-none focus:border-brand-500 cursor-pointer disabled:opacity-50"
            >
              {ESTADOS_PEDIDO.map((e) => (
                <option key={e} value={e}>
                  {ESTADO_LABEL[e]}
                </option>
              ))}
            </select>
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
                <p className="text-sm text-stone-300">
                  Observaciones / aclaración de tapa:{' '}
                  {pedido.observacionesTapa
                    ? <i className="text-white">{pedido.observacionesTapa}</i>
                    : <span className="text-stone-500 italic">— el cliente no dejó ninguna indicación —</span>}
                </p>
                {pedido.dedicatoria && (
                  <div className="mt-2 p-2 bg-brand-500/10 rounded-lg border border-brand-500/20">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Tarjeta de dedicatoria</p>
                    {(() => {
                      const tarjeta = TARJETAS_DEDICATORIA.find((t) => t.id === pedido.dedicatoria)
                      return tarjeta ? (
                        <div className="flex items-center gap-2">
                          <img src={tarjeta.imagen} alt={tarjeta.label} className="w-12 h-16 object-cover rounded border border-stone-700" />
                          <div>
                            <p className="text-sm text-white font-medium">{tarjeta.label}</p>
                            <a href={tarjeta.imagen} target="_blank" className="text-xs text-brand-400 underline">Ver / descargar para imprimir</a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-stone-200">{pedido.dedicatoria}</p>
                      )
                    })()}
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

          {pedido.imagenTapaUrl && (
            <div className="mb-4 pb-4 border-b border-stone-800">
              <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">📕 Foto de tapa</p>
              <img
                src={pedido.imagenTapaUrl}
                alt="Foto de tapa"
                className="w-28 h-28 object-cover rounded-xl border-2 border-brand-500/50"
              />
              <p className="text-xs text-stone-500 mt-1.5">Esta es la foto elegida para la tapa, no para las páginas del interior.</p>
            </div>
          )}

          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Fotos del interior</p>
          <p className="text-xs text-stone-500 mb-3">
            Destildá las que no sirven (por ejemplo, con más de una persona) — no se van a usar para generar ilustraciones. Con &quot;Ajustar encuadre&quot; podés recortar una foto que sirve pero está mal encuadrada.
          </p>
          {fotosCliente.every((f) => !f.seleccionada) && (
            <p className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/20 rounded-lg px-2.5 py-1.5 mb-3 inline-block">
              ⚠ No hay ninguna foto tildada — la generación va a fallar hasta que uses al menos una.
            </p>
          )}
          <div className="flex gap-3 flex-wrap">
            {fotosCliente.map((f) => (
              <FotoClienteCard key={f.id} pedidoId={pedido.id} foto={f} onUpdate={actualizarFotoCliente} />
            ))}
          </div>
        </div>

        <SituacionesPorTematica
          pedidoId={pedido.id}
          tematicasEfectivas={pedido.tematicasEfectivas}
          situacionesIniciales={pedido.situacionesPorTematica}
        />

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
          {avisoGen && <p className="text-sm text-amber-400 mb-3">{avisoGen}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {imagenes.map((img) => (
              <div key={img.id} className="rounded-xl border border-stone-800 overflow-hidden">
                <div className="h-32 bg-stone-800 flex items-center justify-center">
                  {img.urlFirmada ? (
                    <img src={img.urlFirmada} alt={img.tipo === 'TAPA' ? 'Tapa' : `Página ${img.orden + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-stone-600">
                      {generandoImg === img.id ? 'Generando…' : img.manual ? 'Sin subir' : 'Sin generar'}
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-[10px] text-stone-500 font-bold">
                    {img.manual ? LABEL_TIPO_MANUAL[img.tipo] : img.tipo === 'TAPA' ? 'Tapa (color)' : `Pág. ${img.orden + 1}`}
                    {img.tematica && img.tipo !== 'TAPA' ? ` · ${img.tematica}` : ''}
                    {img.estilo ? ` (${img.estilo})` : ''}
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
                    {!img.manual && (
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
                    )}
                  </div>
                  {img.manual ? (
                    <>
                      <input
                        ref={(el) => { manualInputRefs.current[img.id] = el }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          setArchivoManualNombre((prev) => ({ ...prev, [img.id]: e.target.files?.[0]?.name ?? '' }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => manualInputRefs.current[img.id]?.click()}
                        className="w-full text-[10px] font-bold py-1 rounded-full bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors truncate px-2"
                      >
                        {archivoManualNombre[img.id] || 'Elegir archivo…'}
                      </button>
                      <button
                        onClick={() => subirManual(img)}
                        disabled={subiendoManual === img.id}
                        className="w-full text-[10px] font-bold py-1 rounded-full bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50"
                      >
                        {subiendoManual === img.id ? 'Subiendo…' : img.urlFirmada ? 'Reemplazar' : 'Subir'}
                      </button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">PDF del libro</p>
            <p className="text-xs text-stone-500 mb-3">
              Subí el PDF ya armado por vos, en baja resolución y con la marca de agua incorporada. Es exactamente lo que el cliente va a ver para aprobar — no se procesa ni se genera ninguna otra versión.
            </p>
            {pedido.pdfUrlFirmada && (
              <a href={pedido.pdfUrlFirmada} target="_blank" className="text-sm text-brand-400 underline block mb-3">
                👁 Ver PDF (lo que recibe el cliente para aprobar)
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
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Descargar todo</p>
          <p className="text-xs text-stone-500 mb-3">
            Baja todas las imágenes del pedido (tapa, retiración de tapa/contratapa, contratapa y páginas interiores) juntas en un .zip, numeradas en el orden real del libro — para armar el PDF final a mano.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/admin/pedidos/${pedido.id}/descargar-imagenes`}
              className="inline-block bg-brand-500 hover:bg-brand-600 text-white text-xs font-black px-4 py-2 rounded-full transition-colors"
            >
              📦 Descargar todas las imágenes (.zip)
            </a>
            <a
              href={`/api/admin/pedidos/${pedido.id}/descargar-prompts`}
              className="inline-block bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-black px-4 py-2 rounded-full transition-colors"
            >
              📝 Descargar prompts (.txt)
            </a>
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

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Zona de peligro</p>
          <p className="text-xs text-stone-500 mb-3">
            Borra el pedido y todos sus archivos (fotos, imágenes generadas, PDFs) de forma permanente — pensado para pedidos de prueba. Los datos del comprador quedan guardados en un registro aparte (ver "Compradores"). Esta acción no se puede deshacer.
          </p>
          {!mostrarEliminar ? (
            <button
              onClick={() => setMostrarEliminar(true)}
              className="text-xs font-bold px-4 py-2 rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
            >
              Eliminar pedido
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-stone-400">
                Escribí <b className="text-white font-mono">{pedido.id.slice(-8).toUpperCase()}</b> para confirmar:
              </p>
              <input
                type="text"
                value={confirmEliminar}
                onChange={(e) => setConfirmEliminar(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-red-500/30 bg-stone-800 text-white px-3 py-2 text-sm outline-none focus:border-red-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={eliminarPedido}
                  disabled={confirmEliminar.trim().toUpperCase() !== pedido.id.slice(-8).toUpperCase() || eliminando}
                  className="text-xs font-black px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                >
                  {eliminando ? 'Eliminando…' : 'Confirmar borrado permanente'}
                </button>
                <button
                  onClick={() => { setMostrarEliminar(false); setConfirmEliminar('') }}
                  className="text-xs font-bold px-4 py-2 rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
