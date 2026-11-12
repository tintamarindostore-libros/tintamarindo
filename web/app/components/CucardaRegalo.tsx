'use client'

import { useRef } from 'react'
import Link from 'next/link'

// Cucarda "¡Nuevo! Regalo" que va montada sobre la esquina de cada tarjeta de precio.
// Todas las instancias abren el mismo contenido: las láminas digitales de regalo.
function IconoRegalo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

export default function CucardaRegalo() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const abrir = () => dialogRef.current?.showModal()
  const cerrar = () => dialogRef.current?.close()

  return (
    <>
      <button type="button" className="cucarda" onClick={abrir} aria-haspopup="dialog" aria-label="Novedad: regalo incluido. Ver detalle">
        <svg className="cucarda-fondo" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M50 2l7.3 8.6 10.8-3.4 2.4 11.1 11.1 2.4-3.4 10.8L86.8 39 98 50l-8.6 7.3 3.4 10.8-11.1 2.4-2.4 11.1-10.8-3.4L61 86.8 50 98l-7.3-8.6-10.8 3.4-2.4-11.1-11.1-2.4 3.4-10.8L13.2 61 2 50l8.6-7.3-3.4-10.8 11.1-2.4 2.4-11.1 10.8 3.4L39 13.2z" />
          <circle cx="50" cy="50" r="36" />
        </svg>
        <span className="cucarda-texto">
          <span className="cucarda-kicker">¡Nuevo!</span>
          <IconoRegalo className="cucarda-icono" />
          <span className="cucarda-label">Regalo</span>
        </span>
        <span className="cucarda-brillo" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        className="regalo-dialog"
        aria-labelledby="regalo-dialog-titulo"
        onClick={(e) => {
          // Clic en el fondo oscuro (fuera de la caja) cierra el pop-up
          if (e.target === e.currentTarget) cerrar()
        }}
      >
        <div className="regalo-dialog-caja">
          <button type="button" className="regalo-dialog-cerrar" onClick={cerrar} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <div className="regalo-dialog-icono">
            <IconoRegalo />
          </div>
          <span className="regalo-dialog-kicker">Novedad · Incluido en el precio</span>
          <h3 id="regalo-dialog-titulo">De regalo: las láminas listas para imprimir y volver a pintar</h3>
          <p>
            Junto con el libro impreso te enviamos todas las láminas para colorear en formato digital, para que las
            imprimas y las pinten cuantas veces quieran.
          </p>
          <p className="regalo-dialog-nota">
            Te llegan por email o WhatsApp cuando despachamos el libro. Las podés imprimir en casa o en cualquier
            fotocopiadora. No incluye la tapa a color.
          </p>
          <div className="regalo-dialog-acciones">
            <Link className="btn btn-primary" href="/crear">Crear un regalo personalizado →</Link>
            <button type="button" className="btn btn-secondary" onClick={cerrar}>Seguir mirando</button>
          </div>
        </div>
      </dialog>
    </>
  )
}
