'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

type Tamano = 'CHICO' | 'GRANDE'
type Estilo = 'REALISTA' | 'PIXAR' | 'ANIME'
type TipoPapel = 'BLANCO' | 'AHUESADO' | 'COMBINADO'
type Solapa = 'interior' | 'tapa'

type Foto = { key: string; previewUrl: string; nombre: string }

type Config = {
  tamano: Tamano | null
  tematicas: string[]
  tematicaPersonalizada: string
  estilos: Estilo[]
  tipoPapel: TipoPapel
  fotoFamiliarKey: string | null
}

type DatosTapa = {
  tituloTapa: string
  subtituloTapa: string
  observacionesTapa: string
  imagenTapaKey: string | null
  dedicatoria: string
}

type DatosEnvio = {
  nombreCompleto: string
  direccion: string
  codigoPostal: string
  localidad: string
  provincia: string
  telefono: string
  emailEnvio: string
}

const TEMATICAS = [
  { id: 'Aventura', emoji: '🗺️' },
  { id: 'Princesas', emoji: '👑' },
  { id: 'Dinosaurios', emoji: '🦕' },
  { id: 'Espacio', emoji: '🚀' },
  { id: 'Animales', emoji: '🦁' },
]

const ESTILOS: { id: Estilo; label: string; sub: string; emoji: string }[] = [
  { id: 'REALISTA', label: 'Realista', sub: 'Rasgos detallados, estilo cómic', emoji: '🖋️' },
  { id: 'PIXAR', label: 'Pixar', sub: 'Redondeado, tierno y expresivo', emoji: '🎬' },
  { id: 'ANIME', label: 'Anime', sub: 'Ojos grandes, estética japonesa', emoji: '✨' },
]

const TIPOS_PAPEL: { id: TipoPapel; label: string; sub: string }[] = [
  { id: 'BLANCO', label: 'Blanco', sub: 'Clásico y luminoso' },
  { id: 'AHUESADO', label: 'Ahuesado', sub: 'Cálido, reduce el cansancio visual' },
  { id: 'COMBINADO', label: 'Combinado', sub: 'Algunas páginas en blanco, otras en ahuesado' },
]


const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

const TIPOS_ACEPTADOS = 'image/jpeg,image/png,image/webp,image/heic,image/heif'

function CampoEnvio({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-orange-300 focus:outline-none"
      />
    </div>
  )
}

function PrivacidadPopup({ onClose }: { onClose: () => void }) {
  const [puedeAceptar, setPuedeAceptar] = useState(false)
  const contenidoRef = useRef<HTMLDivElement>(null)

  const onScroll = () => {
    const el = contenidoRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setPuedeAceptar(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col" style={{ maxHeight: '85vh' }}>
        <div className="p-8 pb-4 shrink-0">
          <h3 className="text-xl font-black text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
            Política de privacidad de imágenes
          </h3>
          <p className="text-stone-400 text-xs mt-1">Scrolleá hasta el final para aceptar</p>
        </div>
        <div ref={contenidoRef} onScroll={onScroll} className="overflow-y-auto px-8 flex-1 min-h-0">
          <div className="space-y-4 text-sm text-stone-600 pb-4">
            <p className="font-semibold text-stone-700">¿Qué hacemos con tus fotos?</p>
            <ul className="space-y-3 list-disc pl-5">
              <li>Las fotos se usan <strong>exclusivamente</strong> para generar las ilustraciones del libro de tu pedido. No tienen ningún otro uso.</li>
              <li>Se almacenan en servidores privados con acceso restringido. No son accesibles públicamente, no se indexan y no pueden ser vistas por personas ajenas al equipo de Tintamarindo.</li>
              <li>Se eliminan de forma <strong>permanente e irreversible</strong> a los 30 días corridos de la fecha del pedido. Podés solicitar la eliminación anticipada en cualquier momento escribiéndonos.</li>
              <li>No se usan para entrenar modelos de inteligencia artificial ni para ningún fin comercial más allá de la generación de tu libro.</li>
              <li>No se comparten con terceros, salvo obligación legal expresa.</li>
            </ul>
            <p className="font-semibold text-stone-700 pt-2">¿Quién puede subir fotos?</p>
            <p>Al subir fotos de una persona, el cliente declara ser el protagonista, su padre, madre o tutor legal, o contar con autorización expresa de quien corresponda para usar esas imágenes en el contexto de este servicio.</p>
            <p className="font-semibold text-stone-700 pt-2">¿Qué pasa con la imagen de prueba?</p>
            <p>La imagen de prueba generada con marca de agua queda asociada a tu cuenta de Google. Se almacena con las mismas restricciones de privacidad que las fotos originales y se elimina junto con el resto de las imágenes del pedido a los 30 días.</p>
            <p className="font-semibold text-stone-700 pt-2">Responsabilidad sobre el contenido</p>
            <p>Tintamarindo no es responsable por el uso de imágenes subidas por personas que no cuenten con la autorización descripta anteriormente. Si detectamos contenido ilegal o inapropiado, nos reservamos el derecho de cancelar el pedido y, de corresponder, notificar a las autoridades competentes.</p>
            <p className="font-semibold text-stone-700 pt-2">¿Tenés preguntas?</p>
            <p>Para consultas sobre privacidad, eliminación de imágenes o cualquier otro tema, podés contactarnos por WhatsApp o email. Los datos de contacto están en el footer del sitio.</p>
            <p className="pt-2">
              <Link href="/privacidad" target="_blank" className="text-orange-500 underline underline-offset-2 font-semibold hover:text-orange-600">
                Ver política de privacidad completa →
              </Link>
            </p>
          </div>
        </div>
        <div className="p-8 pt-4 shrink-0">
          {!puedeAceptar && (
            <p className="text-xs text-stone-400 text-center mb-3">↓ Llegá hasta el final para continuar</p>
          )}
          <button
            onClick={onClose}
            disabled={!puedeAceptar}
            className={[
              'w-full py-3 rounded-2xl font-black text-white transition-colors',
              puedeAceptar ? 'bg-orange-500 hover:bg-orange-600' : 'bg-stone-200 text-stone-400 cursor-not-allowed',
            ].join(' ')}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

function PasoHeader({ paso, total, titulo }: { paso: number; total: number; titulo: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-2">
        Paso {paso} de {total}
      </p>
      <h1 className="text-2xl font-black text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
        {titulo}
      </h1>
      <div className="flex gap-1.5 mt-4">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < paso ? 'bg-orange-400' : 'bg-stone-100'}`} />
        ))}
      </div>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FEF9F0] px-6 py-16" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
        {children}
      </div>
    </div>
  )
}

function BotonSiguiente({
  disabled,
  onClick,
  children = 'Siguiente →',
}: {
  disabled?: boolean
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-full py-4 rounded-2xl font-black text-base transition-all mt-8',
        disabled
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
          : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-[0.98] shadow-lg shadow-orange-200',
      ].join(' ')}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {children}
    </button>
  )
}

function BotonAtras({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-stone-400 hover:text-stone-600 text-sm font-semibold mt-3 w-full text-center">
      ← Atrás
    </button>
  )
}

async function subirImagenUnica(
  file: File,
  onDone: (key: string) => void,
  onError: (msg: string | null) => void,
  setSub: (v: boolean) => void,
) {
  onError(null)
  const tiposValidos = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  if (!tiposValidos.includes(file.type)) { onError('Formato no soportado. Usá JPG, PNG, WEBP o HEIC'); return }
  if (file.size > 15 * 1024 * 1024) { onError('La imagen pesa demasiado (máximo 15MB)'); return }
  setSub(true)
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al subir la imagen')
    onDone(data.key)
  } catch (err) {
    onError((err as Error).message)
  } finally {
    setSub(false)
  }
}

export function Wizard({
  nombre,
  email,
  previewYaUsado,
  previewUrlInicial,
}: {
  nombre: string
  email: string
  previewYaUsado: boolean
  previewUrlInicial: string | null
}) {
  const [paso, setPaso] = useState(1)

  // Paso 1 — Fotos
  const [fotos, setFotos] = useState<Foto[]>([])
  const [subiendo, setSubiendo] = useState(false)
  const [errorFoto, setErrorFoto] = useState<string | null>(null)
  const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false)
  const [aceptoPrivacidad, setAceptoPrivacidad] = useState(false)

  // Paso 2 — Configuración
  const [solapa, setSolapa] = useState<Solapa>('interior')
  const [config, setConfig] = useState<Config>({
    tamano: null,
    tematicas: [],
    tematicaPersonalizada: '',
    estilos: [],
    tipoPapel: 'BLANCO',
    fotoFamiliarKey: null,
  })
  const [datosTapa, setDatosTapa] = useState<DatosTapa>({
    tituloTapa: '',
    subtituloTapa: '',
    observacionesTapa: '',
    imagenTapaKey: null,
    dedicatoria: '',
  })
  const [subiendoFamiliar, setSubiendoFamiliar] = useState(false)
  const [errorFamiliar, setErrorFamiliar] = useState<string | null>(null)
  const [subiendoImagenTapa, setSubiendoImagenTapa] = useState(false)
  const [errorImagenTapa, setErrorImagenTapa] = useState<string | null>(null)

  // Paso 3 — Preview
  const [generandoPreview, setGenerandoPreview] = useState(false)
  const [etapaPreview, setEtapaPreview] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(previewUrlInicial)
  const [previewUsado, setPreviewUsado] = useState(previewYaUsado)
  const [errorPreview, setErrorPreview] = useState<string | null>(null)
  const [previewCargaError, setPreviewCargaError] = useState(false)

  // Paso 4 — Envío
  const [envio, setEnvio] = useState<DatosEnvio>({
    nombreCompleto: nombre,
    direccion: '',
    codigoPostal: '',
    localidad: '',
    provincia: '',
    telefono: '',
    emailEnvio: email,
  })

  // Avanza etapas mientras genera la preview
  useEffect(() => {
    if (!generandoPreview) { setEtapaPreview(0); return }
    const intervalos = [0, 30000, 75000, 110000]
    const timers = intervalos.map((delay, i) =>
      setTimeout(() => setEtapaPreview(i), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [generandoPreview])

  // Paso 5 — Confirmar
  const [enviandoPedido, setEnviandoPedido] = useState(false)
  const [errorPedido, setErrorPedido] = useState<string | null>(null)
  const [pedidoId, setPedidoId] = useState<string | null>(null)

  const inputFotosRef = useRef<HTMLInputElement>(null)
  const inputFamiliarRef = useRef<HTMLInputElement>(null)
  const inputTapaRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const subirFoto = useCallback(async (file: File) => {
    setErrorFoto(null)
    const tiposValidos = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!tiposValidos.includes(file.type)) {
      setErrorFoto('Formato no soportado. Usá JPG, PNG, WEBP o HEIC')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorFoto('La foto pesa demasiado (máximo 15MB)')
      return
    }
    setSubiendo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir la foto')
      setFotos((prev) => [...prev, { key: data.key, previewUrl: URL.createObjectURL(file), nombre: file.name }])
    } catch (err) {
      setErrorFoto((err as Error).message)
    } finally {
      setSubiendo(false)
    }
  }, [])

  const eliminarFoto = (key: string) => setFotos((prev) => prev.filter((f) => f.key !== key))

  const maxTematicas = config.tamano === 'GRANDE' ? 5 : 3
  const maxEstilos = config.tamano === 'GRANDE' ? 3 : 2

  const toggleTematica = (id: string) => {
    setConfig((prev) => {
      if (prev.tematicas.includes(id)) return { ...prev, tematicas: prev.tematicas.filter((t) => t !== id) }
      if (prev.tematicas.length >= maxTematicas) return prev
      return { ...prev, tematicas: [...prev.tematicas, id] }
    })
  }

  const toggleEstilo = (id: Estilo) => {
    setConfig((prev) => {
      if (prev.estilos.includes(id)) return { ...prev, estilos: prev.estilos.filter((e) => e !== id) }
      if (prev.estilos.length >= maxEstilos) return prev
      return { ...prev, estilos: [...prev.estilos, id] }
    })
  }

  const cambiarTamano = (t: Tamano) => {
    setConfig((prev) => ({
      ...prev,
      tamano: t,
      tematicas: prev.tematicas.slice(0, t === 'GRANDE' ? 5 : 3),
      estilos: prev.estilos.slice(0, t === 'GRANDE' ? 3 : 2),
      tematicaPersonalizada: prev.tematicaPersonalizada,
      fotoFamiliarKey: t === 'CHICO' ? null : prev.fotoFamiliarKey,
    }))
  }

  const generarPreview = async () => {
    if (!fotos[0] || config.tematicas.length === 0 || config.estilos.length === 0) return
    setGenerandoPreview(true)
    setErrorPreview(null)
    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fotoKey: fotos[0].key,
          tematica: config.tematicas[0],
          estilo: config.estilos[0],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar la imagen de prueba')
      setPreviewUrl(data.imageUrl)
      setPreviewUsado(true)
    } catch (err) {
      setErrorPreview((err as Error).message)
    } finally {
      setGenerandoPreview(false)
    }
  }

  const refrescarUrlPreview = async () => {
    setPreviewCargaError(false)
    try {
      // El servidor devuelve una URL firmada fresca si previewUsado=true (ignora el body)
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fotoKey: fotos[0]?.key ?? '', tematica: config.tematicas[0] ?? '', estilo: config.estilos[0] ?? '' }),
      })
      const data = await res.json()
      if (data.imageUrl) setPreviewUrl(data.imageUrl)
      else setPreviewCargaError(true)
    } catch {
      setPreviewCargaError(true)
    }
  }

  const descargarConMarca = () => {
    if (!previewUrl) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(-Math.PI / 6)
      ctx.fillStyle = 'rgba(249, 115, 22, 0.35)'
      ctx.font = `bold ${Math.floor(canvas.width / 10)}px sans-serif`
      ctx.textAlign = 'center'
      for (let y = -canvas.height; y < canvas.height; y += canvas.width / 4) {
        ctx.fillText('VISTA PREVIA — TINTAMARINDO', 0, y)
      }
      ctx.restore()
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = 'vista-previa-tintamarindo.png'
      a.click()
    }
    img.src = previewUrl
  }

  const confirmarPedido = async () => {
    setEnviandoPedido(true)
    setErrorPedido(null)
    try {
      const body: Record<string, unknown> = {
        fotos: fotos.map((f) => f.key),
        tamano: config.tamano,
        tematicas: config.tematicas,
        estilos: config.estilos,
        tipoPapel: config.tipoPapel,
        ...envio,
      }
      if (config.tematicaPersonalizada) body.tematicaPersonalizada = config.tematicaPersonalizada
      if (config.fotoFamiliarKey) body.fotoFamiliarKey = config.fotoFamiliarKey
      if (datosTapa.tituloTapa) body.tituloTapa = datosTapa.tituloTapa
      if (datosTapa.subtituloTapa) body.subtituloTapa = datosTapa.subtituloTapa
      if (datosTapa.observacionesTapa) body.observacionesTapa = datosTapa.observacionesTapa
      if (datosTapa.imagenTapaKey) body.imagenTapaKey = datosTapa.imagenTapaKey
      if (datosTapa.dedicatoria) body.dedicatoria = datosTapa.dedicatoria
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* respuesta vacía */ }
      if (!res.ok) throw new Error((data.error as string) || 'Error al guardar el pedido')
      if (data.mpInitPoint) {
        window.location.href = data.mpInitPoint
      } else {
        setPedidoId(data.id)
        setPaso(6)
      }
    } catch (err) {
      setErrorPedido((err as Error).message)
    } finally {
      setEnviandoPedido(false)
    }
  }

  // ── Paso 1 — Fotos ──────────────────────────────────
  if (paso === 1) {
    return (
      <Shell>
        <PasoHeader paso={1} total={5} titulo="Subí las fotos de la persona protagonista" />
        {mostrarPrivacidad && <PrivacidadPopup onClose={() => setMostrarPrivacidad(false)} />}

        {fotos.length < 5 && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputFotosRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault()
              const remaining = 5 - fotos.length
              Array.from(e.dataTransfer.files).slice(0, remaining).forEach((f) => subirFoto(f))
            }}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-2xl border-2 border-dashed border-stone-200 hover:border-orange-300 transition-all cursor-pointer h-32 flex flex-col items-center justify-center gap-1.5 text-stone-400"
          >
            {subiendo ? (
              <span className="text-sm font-medium animate-pulse">Subiendo…</span>
            ) : (
              <>
                <span className="text-2xl">📷</span>
                <span className="text-sm font-medium">Arrastrá o tocá para agregar fotos (podés seleccionar varias)</span>
                <span className="text-xs">JPG · PNG · WEBP · HEIC</span>
              </>
            )}
          </div>
        )}
        <input
          ref={inputFotosRef}
          type="file"
          accept={TIPOS_ACEPTADOS}
          multiple
          className="hidden"
          onChange={async (e) => {
            const input = e.target
            const files = Array.from(input.files ?? [])
            const remaining = 5 - fotos.length
            for (const file of files.slice(0, remaining)) {
              await subirFoto(file)
            }
            input.value = ''
          }}
        />
        {errorFoto && <p className="text-sm text-red-500 mt-2">{errorFoto}</p>}

        {fotos.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {fotos.map((f) => (
                <div key={f.key} className="relative rounded-xl overflow-hidden h-24 border border-stone-100">
                  <img src={f.previewUrl} alt={f.nombre} className="w-full h-full object-cover" />
                  <button
                    onClick={() => eliminarFoto(f.key)}
                    className="absolute top-1 right-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2 text-center">
              {fotos.length} de 5 · {fotos.length < 2 ? 'Necesitás al menos 2 fotos' : fotos.length < 5 ? 'Podés agregar más (opcional)' : 'Máximo alcanzado'}
            </p>
          </>
        )}

        <button
          onClick={() => setMostrarPrivacidad(true)}
          className="text-xs text-stone-400 underline mt-6 block"
        >
          Leer política de privacidad de imágenes
        </button>
        <label className="flex items-start gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={aceptoPrivacidad}
            onChange={(e) => setAceptoPrivacidad(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-stone-600">
            Acepto la política de privacidad de imágenes y declaro ser el protagonista, su padre, madre o tutor legal, o contar con autorización expresa para usar las fotos cargadas.
          </span>
        </label>

        <BotonSiguiente disabled={fotos.length < 2 || !aceptoPrivacidad} onClick={() => setPaso(2)} />
      </Shell>
    )
  }

  // ── Paso 2 — Configuración ───────────────────────────
  if (paso === 2) {
    const configInteriorValida = config.tamano !== null && config.tematicas.length >= 1 && config.estilos.length >= 1
    const configTapaValida = datosTapa.tituloTapa.trim().length > 0 && datosTapa.imagenTapaKey !== null

    return (
      <Shell>
        <PasoHeader paso={2} total={5} titulo="Configurá tu libro" />

        {/* Solapas */}
        <div className="flex gap-1 bg-stone-100 rounded-2xl p-1 mb-6">
          {(['interior', 'tapa'] as const).map((id) => (
            <button
              key={id}
              onClick={() => setSolapa(id)}
              className={[
                'flex-1 py-2.5 text-sm font-black rounded-xl transition-all capitalize',
                solapa === id ? 'bg-orange-500 text-white' : 'text-stone-500 hover:text-stone-700',
              ].join(' ')}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {id === 'interior' ? 'Interior' : id === 'tapa' ? 'Tapa' : 'Regalo'}
            </button>
          ))}
        </div>

        {/* ── Solapa Interior */}
        {solapa === 'interior' && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Tamaño del libro</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'CHICO' as const, paginas: 24, desc: 'Ideal para regalo rápido' },
                  { id: 'GRANDE' as const, paginas: 32, desc: 'Más páginas para colorear' },
                ]).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => cambiarTamano(t.id)}
                    className={[
                      'rounded-2xl border-2 p-4 text-left transition-all',
                      config.tamano === t.id ? 'border-orange-400 bg-orange-50' : 'border-stone-100 hover:border-orange-200',
                    ].join(' ')}
                  >
                    <div className="text-2xl mb-1">{t.id === 'CHICO' ? '📕' : '📗'}</div>
                    <div className="font-black text-stone-800 text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                      {t.paginas} páginas
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">{t.desc}</div>
                    <div className="text-xs font-bold text-orange-400 mt-2">Precio a definir</div>
                  </button>
                ))}
              </div>
            </div>

            {config.tamano && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Temática</p>
                    <span className="text-xs text-stone-400">{config.tematicas.length}/{maxTematicas}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TEMATICAS.map((t) => {
                      const sel = config.tematicas.includes(t.id)
                      const lleno = !sel && config.tematicas.length >= maxTematicas
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggleTematica(t.id)}
                          disabled={lleno}
                          className={[
                            'rounded-xl border-2 p-3 text-center transition-all',
                            sel ? 'border-orange-400 bg-orange-50'
                              : lleno ? 'border-stone-100 opacity-40 cursor-not-allowed'
                              : 'border-stone-100 hover:border-orange-200',
                          ].join(' ')}
                        >
                          <div className="text-2xl">{t.emoji}</div>
                          <div className="text-xs font-bold text-stone-700 mt-1">{t.id}</div>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Hasta {maxTematicas} temáticas</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 block">
                    ¿Tenés algo especial en mente?{' '}
                    <span className="font-normal normal-case">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={config.tematicaPersonalizada}
                    onChange={(e) => setConfig((prev) => ({ ...prev, tematicaPersonalizada: e.target.value }))}
                    placeholder='Ej: "Fútbol — River Plate", "Karate", "Dinosaurios en el espacio"'
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-orange-300 focus:outline-none"
                  />
                  <p className="text-xs text-stone-400 mt-1.5">Se va a intercalar con las temáticas que elegiste arriba</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Estilo artístico</p>
                    <span className="text-xs text-stone-400">{config.estilos.length}/{maxEstilos}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {ESTILOS.map((s) => {
                      const sel = config.estilos.includes(s.id)
                      const lleno = !sel && config.estilos.length >= maxEstilos
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleEstilo(s.id)}
                          disabled={lleno}
                          className={[
                            'rounded-xl border-2 p-3 text-center transition-all',
                            sel ? 'border-orange-400 bg-orange-50'
                              : lleno ? 'border-stone-100 opacity-40 cursor-not-allowed'
                              : 'border-stone-100 hover:border-orange-200',
                          ].join(' ')}
                        >
                          <div className="text-2xl">{s.emoji}</div>
                          <div className="text-xs font-bold text-stone-700 mt-1">{s.label}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5">{s.sub}</div>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-stone-400 mt-2">
                    Hasta {maxEstilos} estilos — se alternan entre las páginas
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Tipo de papel</p>
                  <div className="space-y-2">
                    {TIPOS_PAPEL.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setConfig((prev) => ({ ...prev, tipoPapel: t.id }))}
                        className={[
                          'w-full rounded-xl border-2 px-4 py-3 text-left transition-all flex items-center gap-3',
                          config.tipoPapel === t.id ? 'border-orange-400 bg-orange-50' : 'border-stone-100 hover:border-orange-200',
                        ].join(' ')}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${config.tipoPapel === t.id ? 'border-orange-400 bg-orange-400' : 'border-stone-300'}`} />
                        <div>
                          <div className="text-sm font-bold text-stone-700">{t.label}</div>
                          <div className="text-xs text-stone-400">{t.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {config.tamano === 'GRANDE' && (
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                      Imagen familiar <span className="font-normal normal-case">(opcional)</span>
                    </p>
                    <p className="text-xs text-stone-400 mb-3">
                      Subí una foto grupal y la IA dibujará a toda la familia como personajes en la escena
                    </p>
                    {config.fotoFamiliarKey ? (
                      <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 border border-green-200">
                        <span className="text-green-600 text-lg">✓</span>
                        <span className="text-sm text-green-700 font-medium">Imagen cargada</span>
                        <button
                          onClick={() => setConfig((prev) => ({ ...prev, fotoFamiliarKey: null }))}
                          className="ml-auto text-xs text-stone-400 hover:text-red-500"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => inputFamiliarRef.current?.click()}
                        className="rounded-xl border-2 border-dashed border-stone-200 hover:border-orange-300 transition-all cursor-pointer h-20 flex items-center justify-center text-stone-400"
                      >
                        {subiendoFamiliar
                          ? <span className="text-sm animate-pulse">Subiendo…</span>
                          : <span className="text-sm">📸 Subir foto familiar</span>
                        }
                      </div>
                    )}
                    <input
                      ref={inputFamiliarRef}
                      type="file"
                      accept={TIPOS_ACEPTADOS}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) subirImagenUnica(
                          f,
                          (key) => setConfig((prev) => ({ ...prev, fotoFamiliarKey: key })),
                          setErrorFamiliar,
                          setSubiendoFamiliar,
                        )
                      }}
                    />
                    {errorFamiliar && <p className="text-xs text-red-500 mt-1">{errorFamiliar}</p>}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Solapa Tapa */}
        {solapa === 'tapa' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">
                Título <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                value={datosTapa.tituloTapa}
                onChange={(e) => setDatosTapa((prev) => ({ ...prev, tituloTapa: e.target.value }))}
                placeholder='Ej: "El libro de Sofía"'
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-orange-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">Subtítulo</label>
              <input
                type="text"
                value={datosTapa.subtituloTapa}
                onChange={(e) => setDatosTapa((prev) => ({ ...prev, subtituloTapa: e.target.value }))}
                placeholder='Ej: "Con mucho amor, mamá y papá"'
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-orange-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">Observaciones</label>
              <textarea
                value={datosTapa.observacionesTapa}
                onChange={(e) => setDatosTapa((prev) => ({ ...prev, observacionesTapa: e.target.value }))}
                placeholder="Indicaciones especiales para el diseño de la tapa..."
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-orange-300 focus:outline-none"
                rows={3}
              />
            </div>

            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                Imagen de tapa <span className="text-orange-400">*</span>
              </p>
              {datosTapa.imagenTapaKey ? (
                <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 border border-green-200">
                  <span className="text-green-600 text-lg">✓</span>
                  <span className="text-sm text-green-700 font-medium">Imagen cargada</span>
                  <button
                    onClick={() => setDatosTapa((prev) => ({ ...prev, imagenTapaKey: null }))}
                    className="ml-auto text-xs text-stone-400 hover:text-red-500"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => inputTapaRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-stone-200 hover:border-orange-300 transition-all cursor-pointer h-20 flex items-center justify-center text-stone-400"
                >
                  {subiendoImagenTapa
                    ? <span className="text-sm animate-pulse">Subiendo…</span>
                    : <span className="text-sm">🖼️ Subir imagen para la tapa</span>
                  }
                </div>
              )}
              <input
                ref={inputTapaRef}
                type="file"
                accept={TIPOS_ACEPTADOS}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) subirImagenUnica(
                    f,
                    (key) => setDatosTapa((prev) => ({ ...prev, imagenTapaKey: key })),
                    setErrorImagenTapa,
                    setSubiendoImagenTapa,
                  )
                }}
              />
              {errorImagenTapa && <p className="text-xs text-red-500 mt-1">{errorImagenTapa}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">
                Dedicatoria <span className="font-normal normal-case">(opcional)</span>
              </label>
              <textarea
                value={datosTapa.dedicatoria}
                onChange={(e) => setDatosTapa((prev) => ({ ...prev, dedicatoria: e.target.value }))}
                placeholder='Ej: "Con todo el amor del mundo, mamá y papá 💛"'
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-orange-300 focus:outline-none"
                rows={3}
              />
              <p className="text-xs text-stone-400 mt-1.5">Se imprime en la contratapa o en una página especial del libro</p>
            </div>
          </div>
        )}

        <div className="flex gap-1 bg-stone-100 rounded-2xl p-1 mt-8">
          {(['interior', 'tapa'] as const).map((id) => (
            <button
              key={id}
              onClick={() => setSolapa(id)}
              className={[
                'flex-1 py-2.5 text-sm font-black rounded-xl transition-all',
                solapa === id ? 'bg-orange-500 text-white' : 'text-stone-500 hover:text-stone-700',
              ].join(' ')}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {id === 'interior' ? 'Interior' : 'Tapa'}
            </button>
          ))}
        </div>
        {!configInteriorValida && solapa === 'tapa' && (
          <p className="text-xs text-orange-500 text-center mt-2">
            Antes de continuar completá la pestaña Interior
          </p>
        )}
        {!configTapaValida && solapa === 'interior' && (
          <p className="text-xs text-orange-500 text-center mt-2">
            Antes de continuar completá la pestaña Tapa (título e imagen)
          </p>
        )}
        <BotonSiguiente disabled={!configInteriorValida || !configTapaValida} onClick={() => setPaso(3)}>
          {!configInteriorValida
            ? 'Completá Interior para continuar'
            : !configTapaValida
            ? 'Completá Tapa para continuar'
            : 'Siguiente →'}
        </BotonSiguiente>
        <BotonAtras onClick={() => setPaso(1)} />
      </Shell>
    )
  }

  // ── Paso 3 — Imagen de prueba ───────────────────────
  if (paso === 3) {
    const estiloLabel = ESTILOS.find((e) => e.id === config.estilos[0])?.label ?? config.estilos[0]
    return (
      <Shell>
        <PasoHeader paso={3} total={5} titulo="Tu imagen de prueba gratis" />
        <canvas ref={canvasRef} className="hidden" />

        {previewUsado && previewUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-stone-500">
              Ya generaste tu imagen de prueba con esta cuenta. Esta es la que tenés guardada:
            </p>
            <div className="relative rounded-2xl overflow-hidden border border-stone-100">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full block"
                onError={() => setPreviewCargaError(true)}
              />
              {previewCargaError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50">
                  <p className="text-xs text-stone-400 mb-2">No se pudo cargar la imagen</p>
                  <button
                    onClick={refrescarUrlPreview}
                    className="text-xs text-orange-500 underline underline-offset-2"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              <div
                className="absolute inset-0 flex flex-col items-center justify-around pointer-events-none select-none"
                style={{ transform: 'rotate(-20deg)', scale: '1.3' }}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} className="text-orange-500/40 font-black text-lg whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                    VISTA PREVIA — TINTAMARINDO · VISTA PREVIA — TINTAMARINDO
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={descargarConMarca}
              className="w-full py-3 rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-600 transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ⬇️ Descargar con marca de agua
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            {generandoPreview ? (
              <div className="py-4 space-y-3">
                {[
                  'Analizando la foto…',
                  'Preparando los rasgos principales…',
                  'Creando la ilustración…',
                  'Dejando todo listo para pintar…',
                ].map((etapa, i) => (
                  <div key={i} className={[
                    'flex items-center gap-3 text-sm transition-all duration-500',
                    i < etapaPreview ? 'text-green-600' : i === etapaPreview ? 'text-orange-500 font-medium' : 'text-stone-300',
                  ].join(' ')}>
                    <span className="text-base shrink-0">
                      {i < etapaPreview ? '✓' : i === etapaPreview ? '✏️' : '○'}
                    </span>
                    <span className={i === etapaPreview ? 'animate-pulse' : ''}>{etapa}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-stone-500 mb-4 text-sm">
                  Vamos a generar una imagen de prueba con marca de agua usando tu primera foto, la temática &ldquo;{config.tematicas[0]}&rdquo; y el estilo &ldquo;{estiloLabel}&rdquo;.
                </p>
                <button
                  onClick={generarPreview}
                  className="py-4 px-8 rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  ✨ Generar mi imagen de prueba
                </button>
              </>
            )}
            {errorPreview && <p className="text-sm text-red-500 mt-3">{errorPreview}</p>}
          </div>
        )}

        <BotonSiguiente disabled={!previewUsado} onClick={() => setPaso(4)}>
          Continuar con mi pedido →
        </BotonSiguiente>
        <BotonAtras onClick={() => setPaso(2)} />
      </Shell>
    )
  }

  // ── Paso 4 — Datos de envío ─────────────────────────
  if (paso === 4) {
    const campoValido = (v: string) => v.trim().length > 0
    const formularioValido =
      campoValido(envio.nombreCompleto) &&
      campoValido(envio.direccion) &&
      campoValido(envio.codigoPostal) &&
      campoValido(envio.localidad) &&
      campoValido(envio.provincia) &&
      campoValido(envio.telefono) &&
      campoValido(envio.emailEnvio)

    return (
      <Shell>
        <PasoHeader paso={4} total={5} titulo="Datos de envío" />
        <div className="space-y-3">
          <CampoEnvio label="Nombre completo" value={envio.nombreCompleto} onChange={(v) => setEnvio((p) => ({ ...p, nombreCompleto: v }))} />
          <CampoEnvio label="Dirección (calle, número, piso/depto)" value={envio.direccion} onChange={(v) => setEnvio((p) => ({ ...p, direccion: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <CampoEnvio label="Código postal" value={envio.codigoPostal} onChange={(v) => setEnvio((p) => ({ ...p, codigoPostal: v }))} />
            <CampoEnvio label="Localidad / Barrio" value={envio.localidad} onChange={(v) => setEnvio((p) => ({ ...p, localidad: v }))} />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">Provincia</label>
            <select
              value={envio.provincia}
              onChange={(e) => setEnvio((prev) => ({ ...prev, provincia: e.target.value }))}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-orange-300 focus:outline-none bg-white"
            >
              <option value="">Seleccioná tu provincia</option>
              {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <CampoEnvio label="Teléfono" value={envio.telefono} onChange={(v) => setEnvio((p) => ({ ...p, telefono: v }))} type="tel" />
          <CampoEnvio label="Email" value={envio.emailEnvio} onChange={(v) => setEnvio((p) => ({ ...p, emailEnvio: v }))} type="email" />
        </div>
        <BotonSiguiente disabled={!formularioValido} onClick={() => setPaso(5)} />
        <BotonAtras onClick={() => setPaso(3)} />
      </Shell>
    )
  }

  // ── Paso 5 — Resumen y pago ─────────────────────────
  if (paso === 5) {
    const etiquetaEstilo = (id: Estilo) => ESTILOS.find((e) => e.id === id)?.label ?? id

    return (
      <Shell>
        <PasoHeader paso={5} total={5} titulo="Resumen de tu pedido" />
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-stone-100 pb-2">
            <span className="text-stone-400">Tamaño</span>
            <span className="font-bold text-stone-700">{config.tamano === 'CHICO' ? '24 páginas' : '32 páginas'}</span>
          </div>
          <div className="flex justify-between border-b border-stone-100 pb-2">
            <span className="text-stone-400">Temáticas</span>
            <span className="font-bold text-stone-700 text-right">{config.tematicas.join(' · ')}</span>
          </div>
          {config.tematicaPersonalizada && (
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-400">Personalizada</span>
              <span className="font-bold text-stone-700 text-right max-w-[55%]">{config.tematicaPersonalizada}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-stone-100 pb-2">
            <span className="text-stone-400">Estilos</span>
            <span className="font-bold text-stone-700">{config.estilos.map(etiquetaEstilo).join(' · ')}</span>
          </div>
          <div className="flex justify-between border-b border-stone-100 pb-2">
            <span className="text-stone-400">Papel</span>
            <span className="font-bold text-stone-700">{TIPOS_PAPEL.find((t) => t.id === config.tipoPapel)?.label}</span>
          </div>
          {config.fotoFamiliarKey && (
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-400">Imagen familiar</span>
              <span className="font-bold text-stone-700">Incluida</span>
            </div>
          )}
          {datosTapa.tituloTapa && (
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-400">Tapa</span>
              <span className="font-bold text-stone-700 text-right max-w-[55%]">{datosTapa.tituloTapa}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-stone-100 pb-2">
            <span className="text-stone-400">Envío a</span>
            <span className="font-bold text-stone-700 text-right">
              {envio.nombreCompleto}<br />{envio.localidad}, {envio.provincia}
            </span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-stone-400">Libro</span>
            <span className="font-bold text-stone-700">A definir</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Envío</span>
            <span className="font-bold text-stone-700">A definir</span>
          </div>
        </div>

        {errorPedido && <p className="text-sm text-red-500 mt-3">{errorPedido}</p>}

        <BotonSiguiente disabled={enviandoPedido} onClick={confirmarPedido}>
          {enviandoPedido ? 'Procesando…' : 'Ir a pagar →'}
        </BotonSiguiente>
        <BotonAtras onClick={() => setPaso(4)} />
      </Shell>
    )
  }

  // ── Confirmación ─────────────────────────────────────
  return (
    <Shell>
      <div className="text-center py-6">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-stone-800 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          ¡Pedido recibido!
        </h1>
        <p className="text-stone-500 text-sm">
          Tu pedido <span className="font-mono text-stone-700">#{pedidoId?.slice(-8)}</span> quedó registrado.
          Te vamos a contactar a {envio.emailEnvio} para coordinar el pago y los siguientes pasos.
        </p>
      </div>
    </Shell>
  )
}
