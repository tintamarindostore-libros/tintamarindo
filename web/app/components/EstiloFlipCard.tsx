'use client'

import { useState } from 'react'

export default function EstiloFlipCard({
  foto,
  linea,
  label,
}: {
  foto: string
  linea: string
  label: string
}) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className={`card card-hover style-card${flipped ? ' flipped' : ''}`}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="style-flip">
        <img src={foto} alt="Foto real" />
        <img className="line" src={linea} alt={`Versión ilustrada estilo ${label}`} />
      </div>
      <div className="style-label">
        <strong>Estilo {label}</strong>
        <span className="style-hint">foto → dibujo</span>
      </div>
    </div>
  )
}
