'use client'

import { useState } from 'react'
import { whatsappAWaMe } from '@/lib/feria'

type Solicitud = {
  id: string
  nombre: string
  tematica: string
  whatsapp: string
  enviada: boolean
  creadoEn: string
  fotoUrl: string
}

export function SolicitudesFeria({ solicitudesIniciales }: { solicitudesIniciales: Solicitud[] }) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(solicitudesIniciales)

  const toggleEnviada = async (s: Solicitud) => {
    const nuevo = !s.enviada
    setSolicitudes((prev) => prev.map((x) => (x.id === s.id ? { ...x, enviada: nuevo } : x)))
    try {
      const res = await fetch(`/api/admin/feria/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enviada: nuevo }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setSolicitudes((prev) => prev.map((x) => (x.id === s.id ? { ...x, enviada: !nuevo } : x)))
    }
  }

  const borrar = async (s: Solicitud) => {
    if (!confirm(`¿Borrar la solicitud de ${s.nombre}? Se elimina también la foto.`)) return
    const backup = solicitudes
    setSolicitudes((prev) => prev.filter((x) => x.id !== s.id))
    try {
      const res = await fetch(`/api/admin/feria/${s.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    } catch {
      setSolicitudes(backup)
      alert('No se pudo borrar')
    }
  }

  if (solicitudes.length === 0) {
    return <p className="text-stone-500 text-sm">Todavía no llegó ninguna solicitud.</p>
  }

  return (
    <div className="space-y-3">
      {solicitudes.map((s) => {
        const mensaje = `¡Hola! Te mandamos la lámina de ${s.nombre} de Tintamarindo 🎨`
        const linkWa = `https://wa.me/${whatsappAWaMe(s.whatsapp)}?text=${encodeURIComponent(mensaje)}`
        return (
          <div
            key={s.id}
            className={`bg-stone-900 rounded-2xl border p-4 flex gap-4 ${s.enviada ? 'border-stone-800 opacity-60' : 'border-stone-800'}`}
          >
            <a href={s.fotoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <img src={s.fotoUrl} alt={`Foto de ${s.nombre}`} className="w-20 h-20 rounded-xl object-cover border border-stone-700" />
            </a>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-black text-white">{s.nombre}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400">{s.tematica}</span>
                {s.enviada && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">✓ Enviada</span>}
              </div>
              <p className="text-xs text-stone-500 mt-1">{s.whatsapp} · {s.creadoEn}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href={linkWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  💬 Escribir por WhatsApp
                </a>
                <button
                  onClick={() => toggleEnviada(s)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
                >
                  {s.enviada ? 'Marcar pendiente' : '✓ Marcar enviada'}
                </button>
                <button
                  onClick={() => borrar(s)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
