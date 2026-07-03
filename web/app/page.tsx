'use client'

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'

type Style = 'realista' | 'infantil'
type Status = 'idle' | 'generating' | 'done' | 'error'

const LOADING_STEPS = [
  { msg: 'Analizando tu foto…', ms: 8000 },
  { msg: 'Trazando los contornos…', ms: 16000 },
  { msg: 'Agregando los detalles…', ms: 20000 },
  { msg: 'Casi lista la página…', ms: 10000 },
]

const STYLES: { id: Style; label: string; sub: string; emoji: string; tag: string }[] = [
  {
    id: 'realista',
    label: 'Realista',
    sub: 'Rasgos faciales detallados, estilo cómic adulto. Las caras quedan reconocibles.',
    emoji: '🖋️',
    tag: 'Para adolescentes y adultos',
  },
  {
    id: 'infantil',
    label: 'Infantil',
    sub: 'Cartoon divertido con ojos grandes y líneas gruesas. Fácil de colorear.',
    emoji: '🎠',
    tag: 'Para niños de 3 a 10 años',
  },
]

const STEPS = [
  {
    n: '01',
    emoji: '📷',
    title: 'Subís una foto',
    desc: 'JPG, PNG o WEBP. Fotos de familia, cumpleaños, vacaciones — cualquier imagen con personas.',
  },
  {
    n: '02',
    emoji: '🎨',
    title: 'Elegís el estilo',
    desc: 'Realista para rasgos detallados o Infantil para un resultado más cartoon y divertido.',
  },
  {
    n: '03',
    emoji: '⬇️',
    title: 'Descargás',
    desc: 'Página lista para imprimir y colorear con crayones, lápices de colores o marcadores.',
  },
]

// ── FadeIn on scroll ─────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── Wavy section divider ─────────────────────────────
function Wave({ fill }: { fill: string }) {
  return (
    <svg
      viewBox="0 0 1440 72"
      className="w-full block"
      preserveAspectRatio="none"
      style={{ display: 'block', marginBottom: '-2px' }}
    >
      <path
        d="M0,36 C180,72 360,0 540,36 C720,72 900,0 1080,36 C1260,72 1350,18 1440,36 L1440,72 L0,72 Z"
        fill={fill}
      />
    </svg>
  )
}

// ── Page ─────────────────────────────────────────────
export default function Page() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [style, setStyle] = useState<Style>('realista')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_STEPS[0].msg)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const toolRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (status !== 'generating') return
    setLoadingMsg(LOADING_STEPS[0].msg)
    let elapsed = 0
    const timers = LOADING_STEPS.map((step) => {
      const t = setTimeout(() => setLoadingMsg(step.msg), elapsed)
      elapsed += step.ms
      return t
    })
    return () => timers.forEach(clearTimeout)
  }, [status])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setPhoto(file)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setResult(null)
    setStatus('idle')
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const generate = async () => {
    if (!photo) return
    setStatus('generating')
    setErrorMsg(null)
    const fd = new FormData()
    fd.append('image', photo)
    fd.append('style', style)
    try {
      const res = await fetch('/api/generate', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar')
      setResult(data.image)
      setStatus('done')
    } catch (err) {
      setErrorMsg((err as Error).message)
      setStatus('error')
    }
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${result}`
    a.download = `colorear_${style}.png`
    a.click()
  }

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setErrorMsg(null)
  }

  const handleCrearLibro = () => {
    if (sessionStatus === 'authenticated') {
      router.push('/crear')
    } else {
      signIn('google', { callbackUrl: '/crear' })
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative bg-orange-500 overflow-hidden pt-20 pb-0 px-6">

        {/* Login bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
          {sessionStatus === 'authenticated' && session?.user ? (
            <>
              <span className="text-white text-sm font-semibold hidden sm:inline">
                {session.user.name}
              </span>
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? 'Usuario'}
                  className="w-8 h-8 rounded-full border-2 border-white/50"
                />
              )}
              <button
                onClick={() => signOut()}
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-full backdrop-blur-sm transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="bg-white text-orange-500 text-xs font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform"
            >
              Iniciar sesión con Google
            </button>
          )}
        </div>

        {/* Floating decorative emojis */}
        {[
          { e: '✏️', top: '10%', left: '5%',  delay: '0s',    dur: '3s'   },
          { e: '⭐', top: '15%', right: '8%',  delay: '0.4s',  dur: '4s'   },
          { e: '🎨', top: '55%', left: '10%', delay: '0.8s',  dur: '3.5s' },
          { e: '✨', top: '20%', right: '22%', delay: '0.2s',  dur: '2.8s' },
          { e: '🖍️', top: '65%', right: '6%',  delay: '0.6s',  dur: '3.2s' },
        ].map(({ e, top, left, right, delay, dur }) => (
          <span
            key={e}
            className="absolute text-3xl select-none pointer-events-none hidden md:block"
            style={{ top, left, right, animation: `float ${dur} ease-in-out ${delay} infinite` }}
          >
            {e}
          </span>
        ))}

        <div className="max-w-3xl mx-auto text-center pb-20 relative z-10">
          <div
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full mb-8"
            style={{ animation: 'fadeInUp 0.5s ease both' }}
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Herramientas de última tecnología · Sin registro · Gratis para probar
          </div>

          <h1
            className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6"
            style={{ fontFamily: 'var(--font-display)', animation: 'fadeInUp 0.6s ease 0.1s both' }}
          >
            Tu foto,
            <br />
            <span className="text-amber-200">tu página</span>
            <br />
            para colorear
          </h1>

          <p
            className="text-white/75 text-lg mb-10 max-w-lg mx-auto"
            style={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}
          >
            Subís una foto familiar, elegís el estilo y en segundos tenés una página imprimible y personalizada lista para colorear.
          </p>

          <div
            className="flex flex-col items-center gap-4"
            style={{ animation: 'fadeInUp 0.6s ease 0.3s both' }}
          >
            <button
              onClick={handleCrearLibro}
              className="bg-white text-orange-500 font-black text-lg px-10 py-4 rounded-2xl hover:scale-105 hover:shadow-2xl transition-all"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Crear mi libro →
            </button>
            <button
              onClick={() => toolRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white/80 text-sm font-semibold underline underline-offset-4 hover:text-white transition-colors"
            >
              o probá gratis sin compromiso
            </button>
          </div>
        </div>

        <Wave fill="#FEF9F0" />
      </section>

      {/* ════════════════ STEPS ════════════════ */}
      <section className="bg-[#FEF9F0] py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-3">El proceso</p>
            <h2
              className="text-4xl font-black text-stone-800"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tres pasos, un resultado único
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <FadeIn key={step.n} delay={i * 100}>
                <div className="bg-white rounded-3xl p-7 border border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
                  <div
                    className="text-xs font-black text-orange-300 mb-3 group-hover:text-orange-400 transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {step.n}
                  </div>
                  <div className="text-4xl mb-4">{step.emoji}</div>
                  <h3
                    className="font-black text-stone-800 text-lg mb-2"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ STYLES ════════════════ */}
      <div className="bg-[#FEF9F0]">
        <Wave fill="#CCFBF1" />
      </div>
      <section className="bg-[#CCFBF1] py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs font-black text-teal-500 uppercase tracking-widest mb-3">Estilos disponibles</p>
            <h2
              className="text-4xl font-black text-stone-800"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              El resultado se adapta a quien lo va a colorear
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {STYLES.map((s, i) => (
              <FadeIn key={s.id} delay={i * 120}>
                <div className="bg-white rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                  {/* Placeholder — se reemplaza con imagen real del ejemplo */}
                  <div className="h-64 bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center gap-3">
                    <span className="text-7xl" style={{ animation: `floatSlow ${3 + i}s ease-in-out infinite` }}>
                      {s.emoji}
                    </span>
                    <span className="text-xs font-semibold text-stone-400">Imagen de ejemplo próximamente</span>
                  </div>
                  <div className="p-6">
                    <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                      {s.tag}
                    </span>
                    <h3
                      className="font-black text-stone-800 text-2xl mb-2"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {s.label}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{s.sub}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TOOL ════════════════ */}
      <div className="bg-[#CCFBF1]">
        <Wave fill="white" />
      </div>
      <section ref={toolRef} className="bg-white py-20 px-6">
        <div className="max-w-lg mx-auto">
          <FadeIn className="text-center mb-10">
            <p className="text-xs font-black text-orange-400 uppercase tracking-widest mb-3">Probalo</p>
            <h2
              className="text-4xl font-black text-stone-800"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ✨ Generá tu página ahora
            </h2>
            <p className="text-stone-500 mt-2 text-sm">Subí una foto y elegí el estilo</p>
          </FadeIn>

          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 space-y-5">
            {/* Upload */}
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                Paso 1 — Foto
              </p>
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                className={[
                  'relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden',
                  isDragging
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-stone-200 hover:border-orange-300',
                  preview ? 'h-52' : 'h-36',
                ].join(' ')}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 hover:bg-black/25 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                      <span className="bg-white/90 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        Cambiar foto
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-1.5 text-stone-400">
                    <span className="text-3xl">📷</span>
                    <span className="text-sm font-medium">Arrastrá o tocá para elegir</span>
                    <span className="text-xs">JPG · PNG · WEBP</span>
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>

            {/* Style */}
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                Paso 2 — Estilo
              </p>
              <div className="grid grid-cols-2 gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={[
                      'rounded-2xl border-2 p-4 text-left transition-all',
                      style === s.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-stone-100 hover:border-orange-200',
                    ].join(' ')}
                  >
                    <div className="text-2xl mb-1">{s.emoji}</div>
                    <div
                      className="font-black text-stone-800 text-sm"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {s.label}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5 leading-tight">{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            {status !== 'done' && (
              <button
                onClick={generate}
                disabled={!photo || status === 'generating'}
                className={[
                  'w-full py-4 rounded-2xl font-black text-white text-base transition-all',
                  !photo || status === 'generating'
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.98] shadow-lg shadow-orange-200',
                ].join(' ')}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {status === 'generating' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block animate-spin">✏️</span>
                    {loadingMsg}
                  </span>
                ) : (
                  '✨ Generar página para colorear'
                )}
              </button>
            )}

            {status === 'error' && (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
                <p className="text-sm text-red-600">{errorMsg}</p>
                <button onClick={reset} className="mt-2 text-xs text-red-400 underline">
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>

          {/* Result */}
          {status === 'done' && result && (
            <div className="mt-6 bg-white rounded-3xl shadow-sm border border-stone-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3
                  className="font-black text-stone-800 text-lg"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  🎉 ¡Lista para colorear!
                </h3>
                <button onClick={reset} className="text-xs text-stone-400 hover:text-stone-600 underline">
                  Generar otra
                </button>
              </div>
              <img
                src={`data:image/png;base64,${result}`}
                alt="Página para colorear generada"
                className="w-full rounded-2xl border border-stone-100"
              />
              <button
                onClick={download}
                className="w-full py-3.5 rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ⬇️ Descargar PNG
              </button>
            </div>
          )}
        </div>
      </section>


    </div>
  )
}
