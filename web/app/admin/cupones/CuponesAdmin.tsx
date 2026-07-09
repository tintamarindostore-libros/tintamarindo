'use client'

import { useState } from 'react'

type Cupon = {
  id: string
  codigo: string
  descuentoPorcentaje: number
  activo: boolean
  usosMaximos: number | null
  usosActuales: number
  nota: string | null
}

export function CuponesAdmin({ cuponesIniciales }: { cuponesIniciales: Cupon[] }) {
  const [cupones, setCupones] = useState(cuponesIniciales)
  const [codigo, setCodigo] = useState('')
  const [descuento, setDescuento] = useState('100')
  const [usosMaximos, setUsosMaximos] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)

  const crearCupon = async () => {
    setCreando(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/cupones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          descuentoPorcentaje: Number(descuento),
          usosMaximos: usosMaximos.trim() ? Number(usosMaximos) : null,
          nota,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear el cupón')
      setCupones((prev) => [data.cupon, ...prev])
      setCodigo('')
      setDescuento('100')
      setUsosMaximos('')
      setNota('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreando(false)
    }
  }

  const toggleActivo = async (c: Cupon) => {
    const res = await fetch(`/api/admin/cupones/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !c.activo }),
    })
    if (res.ok) {
      setCupones((prev) => prev.map((x) => (x.id === c.id ? { ...x, activo: !x.activo } : x)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-3">
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Nuevo cupón</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código (ej. INFLUENCER2026)"
            className="rounded-xl border-2 border-stone-800 bg-stone-800 text-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 uppercase col-span-2 placeholder:text-stone-600"
          />
          <input
            type="number"
            min={1}
            max={100}
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
            placeholder="% descuento"
            className="rounded-xl border-2 border-stone-800 bg-stone-800 text-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 placeholder:text-stone-600"
          />
          <input
            type="number"
            min={1}
            value={usosMaximos}
            onChange={(e) => setUsosMaximos(e.target.value)}
            placeholder="Usos máximos (vacío = sin límite)"
            className="rounded-xl border-2 border-stone-800 bg-stone-800 text-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 placeholder:text-stone-600"
          />
          <input
            type="text"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Nota interna (ej. Regalo influencer X)"
            className="rounded-xl border-2 border-stone-800 bg-stone-800 text-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 col-span-2 placeholder:text-stone-600"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={crearCupon}
          disabled={creando || !codigo.trim()}
          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {creando ? 'Creando…' : 'Crear cupón'}
        </button>
      </div>

      <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
        {cupones.length === 0 ? (
          <p className="p-6 text-sm text-stone-500">Todavía no creaste ningún cupón.</p>
        ) : (
          cupones.map((c, i) => (
            <div
              key={c.id}
              className={[
                'flex items-center justify-between px-6 py-4 border-b border-stone-800/60 last:border-0',
                i % 2 === 1 ? 'bg-stone-800/50' : '',
              ].join(' ')}
            >
              <div>
                <p className="font-bold text-white text-sm">
                  {c.codigo} <span className="text-brand-400">— {c.descuentoPorcentaje}% off</span>
                </p>
                <p className="text-xs text-stone-500">
                  {c.usosActuales} usos{c.usosMaximos !== null ? ` / ${c.usosMaximos} máx` : ' (sin límite)'}
                  {c.nota ? ` · ${c.nota}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleActivo(c)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  c.activo ? 'bg-green-500/15 text-green-400' : 'bg-stone-800 text-stone-500'
                }`}
              >
                {c.activo ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
