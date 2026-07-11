'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PRECIO_LIBRO, precioTransferencia, formatoARS } from '@/lib/precios'
import { estimarEnvio, type TipoEntrega } from '@/lib/envio'
import { DATOS_BANCARIOS } from '@/lib/datosBancarios'
import { TARJETAS_DEDICATORIA } from '@/lib/tarjetasDedicatoria'
import '../landing.css'
import {
  IconCamera, IconCheck, IconCircleDot, IconDownload,
  IconPen, IconBlob, IconSparkle, IconLeaf, IconFamily, IconImage, IconGift, IconBook,
} from './icons'

type Tamano = 'CHICO' | 'GRANDE'
type Estilo = 'REALISTA' | 'PIXAR' | 'ANIME' | 'GHIBLI'
type TipoPapel = 'BLANCO' | 'AHUESADO' | 'COMBINADO'
type Solapa = 'interior' | 'tapa'

type Foto = { key: string; previewUrl: string; nombre: string }

type Config = {
  tamano: Tamano | null
  tematicas: string[]
  tematicasPersonalizadas: string[]
  estilos: Estilo[]
  tipoPapel: TipoPapel
  fotoFamiliarKey: string | null
}

const MAX_TEMATICAS_PERSONALIZADAS = 3

type DatosTapa = {
  tituloTapa: string
  subtituloTapa: string
  observacionesTapa: string
  imagenTapaKey: string | null
  dedicatoria: string
  estiloTapa: Estilo | null
}

type DatosEnvio = {
  nombreCompleto: string
  direccion: string
  codigoPostal: string
  localidad: string
  provincia: string
  telefono: string
  emailEnvio: string
  tipoEntrega: TipoEntrega
}

const TEMATICAS: { id: string }[] = [
  { id: 'Aventura' },
  { id: 'Princesas' },
  { id: 'Dinosaurios' },
  { id: 'Espacio' },
  { id: 'Animales' },
  { id: 'Letras y números' },
  { id: 'Con un perrito' },
  { id: 'Con un gatito' },
  { id: 'Selección argentina' },
  { id: 'Unicornios' },
  { id: 'Sirenas' },
  { id: 'Piratas' },
  { id: 'Bomberos' },
  { id: 'Policías' },
  { id: 'Caballos' },
  { id: 'Hadas' },
  { id: 'Fútbol' },
  { id: 'Circo' },
  { id: 'Fondo del mar' },
  { id: 'Robots' },
  { id: 'Halloween' },
  { id: 'Navidad' },
]

const ESTILOS: { id: Estilo; label: string; sub: string; Icon: (p: { className?: string }) => React.JSX.Element }[] = [
  { id: 'REALISTA', label: 'Realista', sub: 'Rasgos detallados, estilo cómic', Icon: IconPen },
  { id: 'PIXAR', label: 'Pixar', sub: 'Redondeado, tierno y expresivo', Icon: IconBlob },
  { id: 'ANIME', label: 'Anime', sub: 'Ojos grandes, estética japonesa', Icon: IconSparkle },
  { id: 'GHIBLI', label: 'Ghibli', sub: 'Pintado a mano, cálido y fantástico', Icon: IconLeaf },
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

// Guardamos el progreso del wizard en sessionStorage: al pagar con MercadoPago
// se navega a un sitio externo, y si el cliente vuelve con el botón "atrás" del
// navegador, React perdió todo el estado en memoria — sin esto, volvía a
// empezar desde el paso 1 en vez de retomar donde había quedado.
const WIZARD_STORAGE_KEY = 'tintamarindo_wizard_v1'
const WIZARD_STORAGE_MAX_EDAD_MS = 2 * 60 * 60 * 1000 // 2 horas

type WizardSnapshot = {
  paso: number
  fotos: { key: string; nombre: string }[]
  aceptoPrivacidad: boolean
  config: Config
  datosTapa: DatosTapa
  envio: DatosEnvio
  medioPago: 'MERCADOPAGO' | 'TRANSFERENCIA'
  cuponAplicado: { codigo: string; descuentoPorcentaje: number } | null
  guardadoEn: number
}

function leerSnapshotGuardado(): WizardSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(WIZARD_STORAGE_KEY)
    if (!raw) return null
    const datos = JSON.parse(raw) as WizardSnapshot
    if (Date.now() - datos.guardadoEn > WIZARD_STORAGE_MAX_EDAD_MS) return null
    return datos
  } catch {
    return null
  }
}

function borrarSnapshotGuardado() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(WIZARD_STORAGE_KEY)
}

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
        className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none"
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
              <Link href="/privacidad" target="_blank" className="text-brand-500 underline underline-offset-2 font-semibold hover:text-brand-600">
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
              puedeAceptar ? 'bg-brand-500 hover:bg-brand-600' : 'bg-stone-200 text-stone-400 cursor-not-allowed',
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

const NOMBRES_PASOS = ['Fotos', 'Diseño', 'Prueba', 'Envío', 'Pago']

function PasoHeader({ paso, total, titulo }: { paso: number; total: number; titulo: string }) {
  const cols = { gridTemplateColumns: `repeat(${total}, 1fr)` }
  // Círculo N queda centrado en su columna en (N - 0.5) / total del ancho total.
  // La línea de fondo va de centro-a-centro entre el primer y el último círculo.
  const mitadColumna = 50 / total
  return (
    <div className="mb-8">
      <div className="relative grid mb-1.5" style={cols}>
        <div
          className="absolute top-3 h-0.5 bg-stone-100"
          style={{ left: `${mitadColumna}%`, right: `${mitadColumna}%` }}
        />
        <div
          className="absolute top-3 h-0.5 bg-brand-500 transition-all"
          style={{ left: `${mitadColumna}%`, width: `${((paso - 1) * 100) / total}%` }}
        />
        {NOMBRES_PASOS.slice(0, total).map((_, i) => {
          const n = i + 1
          const hecho = n < paso
          const activo = n === paso
          return (
            <div key={n} className="flex justify-center">
              <div
                className={[
                  'relative w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-colors',
                  hecho ? 'bg-brand-500 text-white' : activo ? 'border-2 border-brand-500 text-brand-500 bg-white' : 'bg-stone-100 text-stone-400',
                ].join(' ')}
              >
                {hecho ? <IconCheck className="w-3 h-3" /> : n}
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid mb-4" style={cols}>
        {NOMBRES_PASOS.slice(0, total).map((label, i) => {
          const n = i + 1
          const activo = n === paso
          const hecho = n < paso
          return (
            <div key={label} className="text-center">
              <span
                className={[
                  'text-[9px] font-bold uppercase tracking-wide',
                  activo ? 'text-brand-500' : hecho ? 'text-stone-500' : 'text-stone-300',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <h1 className="text-2xl font-black text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
        {titulo}
      </h1>
    </div>
  )
}

function WizardHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/">
          <img src="/landing/logo.png" alt="Tintamarindo" />
        </Link>
        <Link
          href="/"
          onClick={borrarSnapshotGuardado}
          className="text-sm font-bold text-stone-500 hover:text-stone-700 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </header>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="tm-landing" style={{ fontFamily: 'var(--font-body)' }}>
      <WizardHeader />
      <div className="px-6 py-10 min-h-[65vh]" style={{ background: 'var(--papel)' }}>
        <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

function PasoNav({
  onAtras,
  disabled,
  onSiguiente,
  children = 'Siguiente →',
}: {
  onAtras?: () => void
  disabled?: boolean
  onSiguiente: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex gap-3 mt-8">
      {onAtras && (
        <button
          onClick={onAtras}
          className="shrink-0 px-6 py-4 rounded-2xl font-black text-base border-2 border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-all"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ← Atrás
        </button>
      )}
      <button
        onClick={onSiguiente}
        disabled={disabled}
        className={[
          'flex-1 py-4 rounded-2xl font-black text-base transition-all',
          disabled
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
            : 'bg-brand-500 hover:bg-brand-600 text-white active:scale-[0.98] shadow-lg shadow-brand-200',
        ].join(' ')}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {children}
      </button>
    </div>
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
  // Se lee una sola vez al montar — si volvió de MercadoPago (o recargó la
  // página sin querer) con un progreso guardado reciente, lo retoma en vez de
  // mandarlo de nuevo al paso 1.
  const [snapshotInicial] = useState(() => leerSnapshotGuardado())

  const [paso, setPaso] = useState(() => snapshotInicial?.paso ?? 1)

  // Paso 1 — Fotos
  const [fotos, setFotos] = useState<Foto[]>(() =>
    (snapshotInicial?.fotos ?? []).map((f) => ({ ...f, previewUrl: '' })),
  )
  const [subiendo, setSubiendo] = useState(false)
  const [errorFoto, setErrorFoto] = useState<string | null>(null)
  const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false)
  const [aceptoPrivacidad, setAceptoPrivacidad] = useState(() => snapshotInicial?.aceptoPrivacidad ?? false)

  // Paso 2 — Configuración
  const [solapa, setSolapa] = useState<Solapa>('interior')
  const [config, setConfig] = useState<Config>(
    () =>
      snapshotInicial?.config ?? {
        tamano: null,
        tematicas: [],
        tematicasPersonalizadas: [],
        estilos: [],
        tipoPapel: 'BLANCO',
        fotoFamiliarKey: null,
      },
  )
  const [datosTapa, setDatosTapa] = useState<DatosTapa>(
    () =>
      snapshotInicial?.datosTapa ?? {
        tituloTapa: '',
        subtituloTapa: '',
        observacionesTapa: '',
        imagenTapaKey: null,
        dedicatoria: '',
        estiloTapa: null,
      },
  )
  const [subiendoFamiliar, setSubiendoFamiliar] = useState(false)
  const [errorFamiliar, setErrorFamiliar] = useState<string | null>(null)
  const [subiendoImagenTapa, setSubiendoImagenTapa] = useState(false)
  const [errorImagenTapa, setErrorImagenTapa] = useState<string | null>(null)
  const [tarjetaAmpliada, setTarjetaAmpliada] = useState<string | null>(null)

  // Paso 3 — Preview
  const [generandoPreview, setGenerandoPreview] = useState(false)
  const [etapaPreview, setEtapaPreview] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(previewUrlInicial)
  const [previewUsado, setPreviewUsado] = useState(previewYaUsado)
  const [errorPreview, setErrorPreview] = useState<string | null>(null)
  const [previewCargaError, setPreviewCargaError] = useState(false)

  // Paso 4 — Envío
  const [envio, setEnvio] = useState<DatosEnvio>(
    () =>
      snapshotInicial?.envio ?? {
        nombreCompleto: nombre,
        direccion: '',
        codigoPostal: '',
        localidad: '',
        provincia: '',
        telefono: '',
        emailEnvio: email,
        tipoEntrega: 'DOMICILIO',
      },
  )

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
  const [medioPago, setMedioPago] = useState<'MERCADOPAGO' | 'TRANSFERENCIA'>(
    () => snapshotInicial?.medioPago ?? 'MERCADOPAGO',
  )
  const [cuponInput, setCuponInput] = useState('')
  const [cuponAplicado, setCuponAplicado] = useState<{ codigo: string; descuentoPorcentaje: number } | null>(
    () => snapshotInicial?.cuponAplicado ?? null,
  )
  const [cuponError, setCuponError] = useState<string | null>(null)
  const [validandoCupon, setValidandoCupon] = useState(false)
  const [enviandoPedido, setEnviandoPedido] = useState(false)
  const [errorPedido, setErrorPedido] = useState<string | null>(null)
  const [pedidoId, setPedidoId] = useState<string | null>(null)

  const inputFotosRef = useRef<HTMLInputElement>(null)
  const inputFamiliarRef = useRef<HTMLInputElement>(null)
  const inputTapaRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Si veníamos de un progreso guardado, las fotos se restauraron sin
  // previewUrl (el blob: de la sesión anterior ya no sirve) — pedimos URLs
  // firmadas nuevas para esas mismas fotos, que siguen en R2 sin tocar.
  useEffect(() => {
    const faltantes = fotos.filter((f) => !f.previewUrl)
    if (faltantes.length === 0) return
    fetch('/api/upload/urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: faltantes.map((f) => f.key) }),
    })
      .then((res) => res.json())
      .then((data: { urls?: Record<string, string> }) => {
        if (!data.urls) return
        setFotos((prev) => prev.map((f) => (data.urls?.[f.key] ? { ...f, previewUrl: data.urls[f.key] } : f)))
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Guarda el progreso en cada cambio relevante — así, si el pago con
  // MercadoPago lleva a un sitio externo y el cliente vuelve para atrás, lo
  // retoma en el mismo paso en vez de perder todo lo que ya cargó.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const snapshot: WizardSnapshot = {
      paso,
      fotos: fotos.map((f) => ({ key: f.key, nombre: f.nombre })),
      aceptoPrivacidad,
      config,
      datosTapa,
      envio,
      medioPago,
      cuponAplicado,
      guardadoEn: Date.now(),
    }
    sessionStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(snapshot))
  }, [paso, fotos, aceptoPrivacidad, config, datosTapa, envio, medioPago, cuponAplicado])

  // El pedido ya quedó confirmado sin salir del sitio (transferencia o cupón
  // 100%) — no hace falta retomar nada más, se limpia el progreso guardado.
  useEffect(() => {
    if (paso === 6) borrarSnapshotGuardado()
  }, [paso])

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

  const maxTematicas = config.tamano === 'GRANDE' ? 15 : 8
  const maxEstilos = config.tamano === 'GRANDE' ? 4 : 3

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
      tematicas: prev.tematicas.slice(0, t === 'GRANDE' ? 15 : 8),
      estilos: prev.estilos.slice(0, t === 'GRANDE' ? 4 : 3),
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

  const aplicarCupon = async () => {
    if (!cuponInput.trim()) return
    setValidandoCupon(true)
    setCuponError(null)
    try {
      const res = await fetch('/api/cupones/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: cuponInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cupón inválido')
      setCuponAplicado({ codigo: cuponInput.trim().toUpperCase(), descuentoPorcentaje: data.descuentoPorcentaje })
    } catch (err) {
      setCuponAplicado(null)
      setCuponError((err as Error).message)
    } finally {
      setValidandoCupon(false)
    }
  }

  const quitarCupon = () => {
    setCuponAplicado(null)
    setCuponInput('')
    setCuponError(null)
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
        medioPago,
        ...envio,
      }
      const tematicasPersonalizadas = config.tematicasPersonalizadas.map((t) => t.trim()).filter(Boolean)
      if (tematicasPersonalizadas.length > 0) body.tematicasPersonalizadas = tematicasPersonalizadas
      if (config.fotoFamiliarKey) body.fotoFamiliarKey = config.fotoFamiliarKey
      if (datosTapa.tituloTapa) body.tituloTapa = datosTapa.tituloTapa
      if (datosTapa.subtituloTapa) body.subtituloTapa = datosTapa.subtituloTapa
      if (datosTapa.observacionesTapa) body.observacionesTapa = datosTapa.observacionesTapa
      if (datosTapa.imagenTapaKey) body.imagenTapaKey = datosTapa.imagenTapaKey
      if (datosTapa.dedicatoria) body.dedicatoria = datosTapa.dedicatoria
      if (datosTapa.estiloTapa) body.estiloTapa = datosTapa.estiloTapa
      if (cuponAplicado) body.cuponCodigo = cuponAplicado.codigo
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* respuesta vacía */ }
      if (!res.ok) throw new Error((data.error as string) || 'Error al guardar el pedido')
      if (typeof data.mpInitPoint === 'string') {
        window.location.href = data.mpInitPoint
      } else {
        setPedidoId(typeof data.id === 'string' ? data.id : null)
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
            className="rounded-2xl border-2 border-dashed border-stone-200 hover:border-brand-300 transition-all cursor-pointer h-32 flex flex-col items-center justify-center gap-1.5 text-stone-400"
          >
            {subiendo ? (
              <span className="text-sm font-medium animate-pulse">Subiendo…</span>
            ) : (
              <>
                <IconCamera className="w-7 h-7 text-stone-300" />
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

        <PasoNav disabled={fotos.length < 2 || !aceptoPrivacidad} onSiguiente={() => setPaso(2)} />
      </Shell>
    )
  }

  // ── Paso 2 — Configuración ───────────────────────────
  if (paso === 2) {
    const tieneAlgunaTematica =
      config.tematicas.length >= 1 || config.tematicasPersonalizadas.some((t) => t.trim().length > 0)
    const configInteriorValida = config.tamano !== null && tieneAlgunaTematica && config.estilos.length >= 1
    const configTapaValida =
      datosTapa.tituloTapa.trim().length > 0 && datosTapa.imagenTapaKey !== null && datosTapa.estiloTapa !== null

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
                solapa === id ? 'bg-brand-500 text-white' : 'text-stone-500 hover:text-stone-700',
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
                      config.tamano === t.id ? 'border-brand-400 bg-brand-50' : 'border-stone-100 hover:border-brand-200',
                    ].join(' ')}
                  >
                    <IconBook className="w-6 h-6 text-brand-500 mb-1" />
                    <div className="font-black text-stone-800 text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                      {t.paginas} páginas
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">{t.desc}</div>
                    <div className="text-xs font-bold text-brand-400 mt-2">{formatoARS(PRECIO_LIBRO[t.id])}</div>
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
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEMATICAS.map((t) => {
                      const sel = config.tematicas.includes(t.id)
                      const lleno = !sel && config.tematicas.length >= maxTematicas
                      return (
                        <label
                          key={t.id}
                          className={[
                            'flex items-center gap-2 rounded-lg border px-3 py-2 transition-all',
                            sel ? 'border-brand-400 bg-brand-50'
                              : lleno ? 'border-stone-100 opacity-40 cursor-not-allowed'
                              : 'border-stone-200 hover:border-brand-200 cursor-pointer',
                          ].join(' ')}
                        >
                          <input
                            type="checkbox"
                            checked={sel}
                            disabled={lleno}
                            onChange={() => toggleTematica(t.id)}
                            className="w-4 h-4 accent-brand-500 shrink-0"
                          />
                          <span className="text-sm text-stone-700">{t.id}</span>
                        </label>
                      )
                    })}
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Hasta {maxTematicas} temáticas (opcional si cargás una temática personalizada abajo)</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 block">
                    ¿Tenés algo especial en mente?{' '}
                    <span className="font-normal normal-case">(opcional, hasta {MAX_TEMATICAS_PERSONALIZADAS} — podés usar solo esto, sin elegir de las de arriba)</span>
                  </label>
                  <div className="space-y-2">
                    {config.tematicasPersonalizadas.map((valor, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={valor}
                          onChange={(e) => setConfig((prev) => ({
                            ...prev,
                            tematicasPersonalizadas: prev.tematicasPersonalizadas.map((v, j) => (j === i ? e.target.value : v)),
                          }))}
                          placeholder='Ej: "Fútbol — River Plate", "Karate", "Dinosaurios en el espacio"'
                          className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setConfig((prev) => ({
                            ...prev,
                            tematicasPersonalizadas: prev.tematicasPersonalizadas.filter((_, j) => j !== i),
                          }))}
                          className="text-xs text-stone-400 hover:text-red-500 px-2"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                  {config.tematicasPersonalizadas.length < MAX_TEMATICAS_PERSONALIZADAS && (
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, tematicasPersonalizadas: [...prev.tematicasPersonalizadas, ''] }))}
                      className="text-xs font-bold text-brand-500 hover:text-brand-600 mt-2"
                    >
                      + Agregar otra
                    </button>
                  )}
                  <p className="text-xs text-stone-400 mt-1.5">
                    {config.tematicas.length > 0
                      ? 'Se van a intercalar con las temáticas que elegiste arriba'
                      : 'Podés usar solo temáticas personalizadas, sin elegir ninguna de las de arriba'}
                  </p>
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
                            sel ? 'border-brand-400 bg-brand-50'
                              : lleno ? 'border-stone-100 opacity-40 cursor-not-allowed'
                              : 'border-stone-100 hover:border-brand-200',
                          ].join(' ')}
                        >
                          <s.Icon className="w-6 h-6 mx-auto text-brand-500" />
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
                          config.tipoPapel === t.id ? 'border-brand-400 bg-brand-50' : 'border-stone-100 hover:border-brand-200',
                        ].join(' ')}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${config.tipoPapel === t.id ? 'border-brand-400 bg-brand-400' : 'border-stone-300'}`} />
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
                        <IconCheck className="w-4 h-4 text-green-600" />
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
                        className="rounded-xl border-2 border-dashed border-stone-200 hover:border-brand-300 transition-all cursor-pointer h-20 flex items-center justify-center gap-2 text-stone-400"
                      >
                        {subiendoFamiliar
                          ? <span className="text-sm animate-pulse">Subiendo…</span>
                          : <><IconFamily className="w-5 h-5" /><span className="text-sm">Subir foto familiar</span></>
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
                Título <span className="text-brand-400">*</span>
              </label>
              <input
                type="text"
                value={datosTapa.tituloTapa}
                onChange={(e) => setDatosTapa((prev) => ({ ...prev, tituloTapa: e.target.value }))}
                placeholder='Ej: "El libro de Sofía"'
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">Subtítulo</label>
              <input
                type="text"
                value={datosTapa.subtituloTapa}
                onChange={(e) => setDatosTapa((prev) => ({ ...prev, subtituloTapa: e.target.value }))}
                placeholder='Ej: "Con mucho amor, mamá y papá"'
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">Observaciones</label>
              <textarea
                value={datosTapa.observacionesTapa}
                onChange={(e) => setDatosTapa((prev) => ({ ...prev, observacionesTapa: e.target.value }))}
                placeholder="Indicaciones especiales para el diseño de la tapa..."
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none"
                rows={3}
              />
            </div>

            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                Imagen de tapa <span className="text-brand-400">*</span>
              </p>
              {datosTapa.imagenTapaKey ? (
                <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 border border-green-200">
                  <IconCheck className="w-4 h-4 text-green-600" />
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
                  className="rounded-xl border-2 border-dashed border-stone-200 hover:border-brand-300 transition-all cursor-pointer h-20 flex items-center justify-center gap-2 text-stone-400"
                >
                  {subiendoImagenTapa
                    ? <span className="text-sm animate-pulse">Subiendo…</span>
                    : <><IconImage className="w-5 h-5" /><span className="text-sm">Subir imagen para la tapa</span></>
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
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                Estilo de la tapa <span className="text-brand-400">*</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ESTILOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDatosTapa((prev) => ({ ...prev, estiloTapa: s.id }))}
                    className={[
                      'rounded-xl border-2 p-3 text-center transition-all',
                      datosTapa.estiloTapa === s.id ? 'border-brand-400 bg-brand-50' : 'border-stone-100 hover:border-brand-200',
                    ].join(' ')}
                  >
                    <s.Icon className="w-6 h-6 mx-auto text-brand-500" />
                    <div className="text-xs font-bold text-stone-700 mt-1">{s.label}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 block">
                Tarjeta de dedicatoria <span className="font-normal normal-case">(opcional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDatosTapa((prev) => ({ ...prev, dedicatoria: '' }))}
                  className={[
                    'aspect-[4/5] rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-center p-2 transition-all',
                    datosTapa.dedicatoria === '' ? 'border-brand-400 bg-brand-50' : 'border-stone-100 hover:border-brand-200',
                  ].join(' ')}
                >
                  <span className="text-xl">🚫</span>
                  <span className="text-[10px] font-bold text-stone-600">Sin tarjeta</span>
                </button>
                {TARJETAS_DEDICATORIA.map((t) => (
                  <div key={t.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setDatosTapa((prev) => ({ ...prev, dedicatoria: t.id }))}
                      className={[
                        'w-full aspect-[4/5] rounded-xl border-2 overflow-hidden transition-all',
                        datosTapa.dedicatoria === t.id ? 'border-brand-400' : 'border-stone-100 hover:border-brand-200',
                      ].join(' ')}
                    >
                      <img src={t.imagen} alt={t.label} className="w-full h-full object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTarjetaAmpliada(t.imagen)}
                      className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                      title="Ver en grande"
                    >
                      🔍
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-2">Esta tarjeta de dedicatoria se imprime en la retiración de tapa</p>
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
                solapa === id ? 'bg-brand-500 text-white' : 'text-stone-500 hover:text-stone-700',
              ].join(' ')}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {id === 'interior' ? 'Interior' : 'Tapa'}
            </button>
          ))}
        </div>
        {!configInteriorValida && solapa === 'tapa' && (
          <p className="text-xs text-brand-500 text-center mt-2">
            Antes de continuar completá la pestaña Interior
          </p>
        )}
        {!configTapaValida && solapa === 'interior' && (
          <p className="text-xs text-brand-500 text-center mt-2">
            Antes de continuar completá la pestaña Tapa (título, imagen y estilo)
          </p>
        )}
        <PasoNav disabled={!configInteriorValida || !configTapaValida} onAtras={() => setPaso(1)} onSiguiente={() => setPaso(3)}>
          {!configInteriorValida
            ? 'Completá Interior para continuar'
            : !configTapaValida
            ? 'Completá Tapa para continuar'
            : 'Siguiente →'}
        </PasoNav>

        {tarjetaAmpliada && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
            onClick={() => setTarjetaAmpliada(null)}
          >
            <img
              src={tarjetaAmpliada}
              alt="Tarjeta de dedicatoria ampliada"
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setTarjetaAmpliada(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold text-stone-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}
      </Shell>
    )
  }

  // ── Paso 3 — Imagen de prueba ───────────────────────
  if (paso === 3) {
    const estiloLabel = ESTILOS.find((e) => e.id === config.estilos[0])?.label ?? config.estilos[0]
    const tienePreviewDisponible = config.tematicas.length > 0
    return (
      <Shell>
        <PasoHeader paso={3} total={5} titulo="Tu imagen de prueba gratis" />
        <p className="text-xs text-stone-400 -mt-6 mb-6">Este paso es opcional — podés continuar sin generarla.</p>
        <canvas ref={canvasRef} className="hidden" />

        {!tienePreviewDisponible && !(previewUsado && previewUrl) ? (
          <div className="text-center py-6 text-sm text-stone-500">
            <p>Como elegiste una temática personalizada, no podemos generar la vista previa automática todavía.</p>
            <p className="mt-1">No hay problema: podés continuar con tu pedido igual.</p>
          </div>
        ) : previewUsado && previewUrl ? (
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
                    className="text-xs text-brand-500 underline underline-offset-2"
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
                  <span key={i} className="text-brand-500/40 font-black text-lg whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                    VISTA PREVIA — TINTAMARINDO · VISTA PREVIA — TINTAMARINDO
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={descargarConMarca}
              className="w-full py-3 rounded-2xl font-black text-white bg-brand-500 hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <IconDownload className="w-4 h-4" /> Descargar con marca de agua
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
                    i < etapaPreview ? 'text-green-600' : i === etapaPreview ? 'text-brand-500 font-medium' : 'text-stone-300',
                  ].join(' ')}>
                    <span className="shrink-0">
                      {i < etapaPreview ? <IconCheck className="w-4 h-4" /> : i === etapaPreview ? <IconPen className="w-4 h-4" /> : <IconCircleDot className="w-4 h-4" />}
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
                  className="py-4 px-8 rounded-2xl font-black text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-lg shadow-brand-200 inline-flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <IconSparkle className="w-4 h-4" /> Generar mi imagen de prueba
                </button>
              </>
            )}
            {errorPreview && <p className="text-sm text-red-500 mt-3">{errorPreview}</p>}
          </div>
        )}

        <PasoNav onAtras={() => setPaso(2)} onSiguiente={() => setPaso(4)}>
          {previewUsado ? 'Continuar con mi pedido →' : 'Continuar sin generar →'}
        </PasoNav>
      </Shell>
    )
  }

  // ── Paso 4 — Datos de envío ─────────────────────────
  if (paso === 4) {
    const campoValido = (v: string) => v.trim().length > 0
    const formularioValido =
      campoValido(envio.nombreCompleto) &&
      (envio.tipoEntrega === 'SUCURSAL' || campoValido(envio.direccion)) &&
      campoValido(envio.codigoPostal) &&
      campoValido(envio.localidad) &&
      campoValido(envio.provincia) &&
      campoValido(envio.telefono) &&
      campoValido(envio.emailEnvio)

    return (
      <Shell>
        <PasoHeader paso={4} total={5} titulo="Datos de envío" />
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-4 text-xs text-stone-600">
          Dejanos tu dirección y el costo de envío te lo confirmamos por WhatsApp o email después de tu pedido, según tu zona.
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">Tipo de entrega</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'DOMICILIO' as const, label: 'A domicilio' },
                { id: 'SUCURSAL' as const, label: 'Retiro en sucursal' },
              ]).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEnvio((p) => ({ ...p, tipoEntrega: t.id }))}
                  className={[
                    'rounded-xl border-2 py-2.5 text-sm font-bold transition-all',
                    envio.tipoEntrega === t.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-stone-100 text-stone-500 hover:border-brand-200',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <CampoEnvio label="Nombre completo" value={envio.nombreCompleto} onChange={(v) => setEnvio((p) => ({ ...p, nombreCompleto: v }))} />
          <CampoEnvio
            label={
              envio.tipoEntrega === 'SUCURSAL'
                ? 'Sucursal de retiro (opcional — si no la sabés, te ayudamos a elegirla)'
                : 'Dirección (calle, número, piso/depto)'
            }
            value={envio.direccion}
            onChange={(v) => setEnvio((p) => ({ ...p, direccion: v }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <CampoEnvio label="Código postal" value={envio.codigoPostal} onChange={(v) => setEnvio((p) => ({ ...p, codigoPostal: v }))} />
            <CampoEnvio label="Localidad / Barrio" value={envio.localidad} onChange={(v) => setEnvio((p) => ({ ...p, localidad: v }))} />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 block">Provincia</label>
            <select
              value={envio.provincia}
              onChange={(e) => setEnvio((prev) => ({ ...prev, provincia: e.target.value }))}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none bg-white"
            >
              <option value="">Seleccioná tu provincia</option>
              {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <CampoEnvio label="Teléfono" value={envio.telefono} onChange={(v) => setEnvio((p) => ({ ...p, telefono: v }))} type="tel" />
          <CampoEnvio label="Email" value={envio.emailEnvio} onChange={(v) => setEnvio((p) => ({ ...p, emailEnvio: v }))} type="email" />
        </div>
        <PasoNav disabled={!formularioValido} onAtras={() => setPaso(3)} onSiguiente={() => setPaso(5)} />
      </Shell>
    )
  }

  // ── Paso 5 — Resumen y pago ─────────────────────────
  if (paso === 5) {
    const etiquetaEstilo = (id: Estilo) => ESTILOS.find((e) => e.id === id)?.label ?? id
    const costoEnvioEstimado = estimarEnvio(envio.provincia, envio.tipoEntrega)
    const esCuponTotal = cuponAplicado?.descuentoPorcentaje === 100
    const precioLibroBase = config.tamano
      ? (medioPago === 'TRANSFERENCIA' ? precioTransferencia(config.tamano) : PRECIO_LIBRO[config.tamano])
      : null
    const precioLibroFinal =
      precioLibroBase !== null && cuponAplicado
        ? Math.round(precioLibroBase * (1 - cuponAplicado.descuentoPorcentaje / 100))
        : precioLibroBase
    const totalEstimado = esCuponTotal ? 0 : (precioLibroFinal ?? 0) + (costoEnvioEstimado ?? 0)

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
          {config.tematicasPersonalizadas.filter((t) => t.trim()).length > 0 && (
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-400">Personalizada</span>
              <span className="font-bold text-stone-700 text-right max-w-[55%]">
                {config.tematicasPersonalizadas.filter((t) => t.trim()).join(' · ')}
              </span>
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
          {datosTapa.estiloTapa && (
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-400">Estilo de tapa</span>
              <span className="font-bold text-stone-700">{etiquetaEstilo(datosTapa.estiloTapa)}</span>
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
            <span className="font-bold text-stone-700">
              {config.tamano ? (
                cuponAplicado ? (
                  <>
                    <span className="line-through text-stone-300 mr-2 font-normal">
                      {formatoARS(medioPago === 'TRANSFERENCIA' ? precioTransferencia(config.tamano) : PRECIO_LIBRO[config.tamano])}
                    </span>
                    {formatoARS(precioLibroFinal ?? 0)}
                  </>
                ) : (
                  formatoARS(medioPago === 'TRANSFERENCIA' ? precioTransferencia(config.tamano) : PRECIO_LIBRO[config.tamano])
                )
              ) : (
                'A definir'
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Envío ({envio.tipoEntrega === 'SUCURSAL' ? 'sucursal' : 'domicilio'})</span>
            <span className="font-bold text-stone-700">
              {esCuponTotal ? 'Gratis (cupón)' : costoEnvioEstimado !== null ? formatoARS(costoEnvioEstimado) : 'A confirmar'}
            </span>
          </div>
          {!esCuponTotal && (
            <p className="text-xs text-stone-400 -mt-1">
              El costo de envío no se cobra ahora — te lo confirmamos por WhatsApp o email antes de despachar.
            </p>
          )}
          {config.tamano && (
            <div className="flex justify-between border-t border-stone-200 pt-2">
              <span className="text-stone-500 font-bold">{esCuponTotal ? 'Total' : 'Total a pagar ahora'}</span>
              <span className="font-black text-stone-800">{formatoARS(totalEstimado)}</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">¿Tenés un cupón?</p>
          {cuponAplicado ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm">
              <span className="font-bold text-green-700">
                {cuponAplicado.codigo} aplicado — {cuponAplicado.descuentoPorcentaje}% off
              </span>
              <button type="button" onClick={quitarCupon} className="text-xs font-bold text-stone-400 hover:text-stone-600">
                Quitar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={cuponInput}
                onChange={(e) => setCuponInput(e.target.value)}
                placeholder="Código de cupón"
                className="flex-1 rounded-xl border-2 border-stone-100 px-4 py-2.5 text-sm focus:border-brand-300 outline-none uppercase"
              />
              <button
                type="button"
                onClick={aplicarCupon}
                disabled={validandoCupon || !cuponInput.trim()}
                className="rounded-xl border-2 border-brand-300 text-brand-600 font-bold px-4 py-2.5 text-sm disabled:opacity-50"
              >
                {validandoCupon ? 'Validando…' : 'Aplicar'}
              </button>
            </div>
          )}
          {cuponError && <p className="text-xs text-red-500 mt-2">{cuponError}</p>}
        </div>

        {esCuponTotal ? (
          <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 text-sm">
            <p className="font-bold text-green-700 flex items-center gap-2"><IconGift className="w-4 h-4" /> Este pedido está 100% bonificado</p>
            <p className="text-stone-500 mt-1">No necesitás pagar nada. Al confirmar, arrancamos directo con tu libro.</p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Medio de pago</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'MERCADOPAGO' as const, label: 'MercadoPago' },
                  { id: 'TRANSFERENCIA' as const, label: 'Transferencia (10% off)' },
                ]).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMedioPago(m.id)}
                    className={[
                      'rounded-xl border-2 py-2.5 text-sm font-bold transition-all',
                      medioPago === m.id ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-stone-100 text-stone-500 hover:border-brand-200',
                    ].join(' ')}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {medioPago === 'TRANSFERENCIA' && (
              <div className="mt-4 bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm space-y-1">
                <p className="font-bold text-stone-700 mb-2">Datos para transferir</p>
                <p className="text-stone-600">Banco: <b>{DATOS_BANCARIOS.banco}</b></p>
                <p className="text-stone-600">Alias: <b>{DATOS_BANCARIOS.alias}</b></p>
                <p className="text-stone-600">CBU: <b>{DATOS_BANCARIOS.cbu}</b></p>
                <p className="text-stone-600">Titular: <b>{DATOS_BANCARIOS.titular}</b> (CUIT {DATOS_BANCARIOS.cuit})</p>
                <p className="text-xs text-stone-400 mt-2">
                  Al confirmar, tu pedido queda registrado como "esperando pago". Hacé la transferencia por el monto total y avisanos por WhatsApp o email — apenas la acreditemos, arrancamos con tu libro.
                </p>
              </div>
            )}

            {config.tamano && (
              <p className="text-xs text-stone-400 mt-3">
                Precio especial de lanzamiento. Pagando por transferencia bancaria tenés un 10% de descuento sobre el libro.
              </p>
            )}
          </>
        )}

        {errorPedido && <p className="text-sm text-red-500 mt-3">{errorPedido}</p>}

        <PasoNav disabled={enviandoPedido} onAtras={() => setPaso(4)} onSiguiente={confirmarPedido}>
          {enviandoPedido ? 'Procesando…' : esCuponTotal ? 'Confirmar pedido gratuito →' : medioPago === 'TRANSFERENCIA' ? 'Confirmar pedido →' : 'Ir a pagar →'}
        </PasoNav>
      </Shell>
    )
  }

  // ── Confirmación ─────────────────────────────────────
  return (
    <Shell>
      <div className="text-center py-6">
        <IconGift className="w-14 h-14 mx-auto mb-4 text-brand-500" />
        <h1 className="text-2xl font-black text-stone-800 mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          ¡Pedido recibido!
        </h1>
        <p className="text-stone-500 text-sm">
          Tu pedido <span className="font-mono text-stone-700">#{pedidoId?.slice(-8)}</span> quedó registrado.
          Te vamos a contactar a {envio.emailEnvio} para coordinar el pago y los siguientes pasos.
        </p>
        <p className="text-stone-500 text-sm mt-3">
          ¡Gracias por confiar en nosotros para este regalo tan especial! 💛
        </p>
        <Link
          href="/"
          className="inline-block mt-8 w-full py-4 rounded-2xl font-black text-base bg-brand-500 hover:bg-brand-600 text-white active:scale-[0.98] shadow-lg shadow-brand-200 transition-all"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Volver al inicio
        </Link>
      </div>
    </Shell>
  )
}
