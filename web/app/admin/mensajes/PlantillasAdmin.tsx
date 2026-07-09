'use client'

import { useState } from 'react'

type Plantilla = {
  id: string
  clave: string
  nombre: string
  asunto: string | null
  cuerpo: string
}

function FilaPlantilla({ plantilla }: { plantilla: Plantilla }) {
  const [asunto, setAsunto] = useState(plantilla.asunto ?? '')
  const [cuerpo, setCuerpo] = useState(plantilla.cuerpo)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const guardar = async () => {
    setGuardando(true)
    setGuardado(false)
    try {
      const res = await fetch(`/api/admin/plantillas/${plantilla.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asunto, cuerpo }),
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
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-2">
      <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">{plantilla.nombre}</p>
      <input
        type="text"
        value={asunto}
        onChange={(e) => setAsunto(e.target.value)}
        placeholder="Asunto (para cuando se mande por email)"
        className="w-full rounded-lg border border-stone-800 bg-stone-800 text-white px-3 py-2 text-sm outline-none focus:border-brand-500 placeholder:text-stone-600"
      />
      <textarea
        value={cuerpo}
        onChange={(e) => setCuerpo(e.target.value)}
        rows={8}
        className="w-full rounded-lg border border-stone-800 bg-stone-800 text-stone-200 px-3 py-2 text-sm outline-none focus:border-brand-500 font-mono"
      />
      <button
        type="button"
        onClick={guardar}
        disabled={guardando}
        className="rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 text-xs disabled:opacity-50"
      >
        {guardando ? 'Guardando…' : guardado ? '✓ Guardado' : 'Guardar'}
      </button>
    </div>
  )
}

export function PlantillasAdmin({ plantillasIniciales }: { plantillasIniciales: Plantilla[] }) {
  return (
    <div className="space-y-4">
      {plantillasIniciales.map((p) => (
        <FilaPlantilla key={p.id} plantilla={p} />
      ))}
    </div>
  )
}
