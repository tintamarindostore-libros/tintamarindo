'use client'

import { useRef, useState } from 'react'
import { TEMATICAS_LAMINA } from '@/lib/feria'

const MAX_BYTES = 15 * 1024 * 1024

export function FormularioFeria() {
  const [nombre, setNombre] = useState('')
  const [tematica, setTematica] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [autoriza, setAutoriza] = useState(false)
  const [fotoNombre, setFotoNombre] = useState('')
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)
  const fotoRef = useRef<HTMLInputElement>(null)

  const elegirFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)
    if (!file) {
      setFotoNombre('')
      setFotoPreview(null)
      return
    }
    if (file.size > MAX_BYTES) {
      setError('La foto pesa demasiado (máximo 15MB).')
      if (fotoRef.current) fotoRef.current.value = ''
      return
    }
    setFotoNombre(file.name)
    setFotoPreview(URL.createObjectURL(file))
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fotoRef.current?.files?.[0]
    if (!file) return setError('Subí una foto de tu peque.')
    if (!nombre.trim()) return setError('Contanos cómo se llama.')
    if (!tematica) return setError('Elegí qué le gusta.')
    if (!whatsapp.trim()) return setError('Dejanos tu WhatsApp.')
    if (!autoriza) return setError('Necesitamos tu autorización para usar la foto.')

    setEnviando(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('foto', file)
      fd.append('nombre', nombre.trim())
      fd.append('tematica', tematica)
      fd.append('whatsapp', whatsapp.trim())
      fd.append('autoriza', 'true')
      const res = await fetch('/api/feria', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No pudimos enviar tu pedido. Probá de nuevo.')
      setListo(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  if (listo) {
    return (
      <div className="bg-white rounded-3xl border border-green-200 shadow-sm p-8 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-black text-stone-800" style={{ fontFamily: 'var(--font-display)' }}>
          ¡Listo, recibimos la foto de {nombre}!
        </h2>
        <p className="text-stone-600 mt-3 leading-relaxed">
          La dibujamos a mano y te la mandamos por WhatsApp, en general en menos de 48 horas. Cualquier cosa, te escribimos
          a ese número. ¡Gracias por pasar por la Feria! 💛
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-5">
      {/* Foto */}
      <div>
        <label className="block text-sm font-bold text-stone-800 mb-1">Foto de tu peque</label>
        <p className="text-xs text-stone-500 mb-2">Que se le vea bien la cara, de frente y con buena luz.</p>
        <input ref={fotoRef} type="file" accept="image/*" onChange={elegirFoto} className="hidden" />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fotoRef.current?.click()}
            className="shrink-0 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            📷 {fotoNombre ? 'Cambiar foto' : 'Elegir foto'}
          </button>
          {fotoPreview ? (
            <img src={fotoPreview} alt="Vista previa" className="w-14 h-14 rounded-xl object-cover border border-stone-200" />
          ) : (
            <span className="text-xs text-stone-400 truncate">Ninguna foto elegida</span>
          )}
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-bold text-stone-800 mb-1">¿Cómo se llama?</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del peque"
          className="w-full rounded-xl border border-stone-300 bg-white text-stone-800 px-4 py-2.5 text-sm outline-none focus:border-orange-400 placeholder:text-stone-400"
        />
      </div>

      {/* Temática */}
      <div>
        <label className="block text-sm font-bold text-stone-800 mb-1">¿Qué le gusta?</label>
        <select
          value={tematica}
          onChange={(e) => setTematica(e.target.value)}
          className={`w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 ${tematica ? 'text-stone-800' : 'text-stone-400'}`}
        >
          <option value="">Elegí una opción…</option>
          {TEMATICAS_LAMINA.map((t) => (
            <option key={t} value={t} className="text-stone-800">{t}</option>
          ))}
        </select>
      </div>

      {/* WhatsApp */}
      <div>
        <label className="block text-sm font-bold text-stone-800 mb-1">Tu WhatsApp</label>
        <p className="text-xs text-stone-500 mb-2">Te mandamos la lámina por acá.</p>
        <input
          type="tel"
          inputMode="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Ej: 11 2366 8769"
          className="w-full rounded-xl border border-stone-300 bg-white text-stone-800 px-4 py-2.5 text-sm outline-none focus:border-orange-400 placeholder:text-stone-400"
        />
      </div>

      {/* Autorización */}
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={autoriza}
          onChange={(e) => setAutoriza(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-orange-500 shrink-0"
        />
        <span className="text-sm text-stone-600 leading-snug">
          Soy la madre, el padre o quien tiene a cargo a este peque y autorizo el uso de la foto para hacer esta lámina.
        </span>
      </label>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black text-base py-3.5 rounded-2xl transition-colors"
      >
        {enviando ? 'Enviando…' : 'Quiero mi lámina'}
      </button>

      <p className="text-[11px] text-stone-400 text-center">
        Una lámina por peque, válida hasta el 9 de agosto.
      </p>
    </form>
  )
}
