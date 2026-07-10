'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ESTADOS_PEDIDO, ESTADO_LABEL } from '@/lib/estados'

export function EstadoSelector({ pedidoId, estadoInicial }: { pedidoId: string; estadoInicial: string }) {
  const [estado, setEstado] = useState(estadoInicial)
  const [guardando, setGuardando] = useState(false)
  const router = useRouter()

  const cambiar = async (nuevo: string) => {
    const anterior = estado
    setEstado(nuevo)
    setGuardando(true)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevo }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setEstado(anterior)
      alert('No se pudo cambiar el estado')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <select
      value={estado}
      disabled={guardando}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation()
        cambiar(e.target.value)
      }}
      className="text-xs font-bold bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full border border-stone-700 focus:outline-none focus:border-brand-500 cursor-pointer disabled:opacity-50"
    >
      {ESTADOS_PEDIDO.map((e) => (
        <option key={e} value={e}>
          {ESTADO_LABEL[e]}
        </option>
      ))}
    </select>
  )
}
