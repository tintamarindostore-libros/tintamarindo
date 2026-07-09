'use client'

import { useState } from 'react'

export function CopiarCodigo({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        navigator.clipboard.writeText(codigo)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 1500)
      }}
      title="Copiar código de pedido"
      className="font-mono hover:text-brand-400 transition-colors"
    >
      {copiado ? '✓ copiado' : `#${codigo}`}
    </button>
  )
}
