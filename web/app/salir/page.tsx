'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'

function SalirContenido() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    // signOut() del lado del cliente para poder cerrar la sesión actual y
    // volver a elegir cuenta de Google (el proveedor ya pide select_account).
    signOut({ callbackUrl })
  }, [callbackUrl])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF9F0]" style={{ fontFamily: 'var(--font-body)' }}>
      <p className="text-sm text-stone-400">Cerrando sesión…</p>
    </div>
  )
}

export default function SalirPage() {
  return (
    <Suspense>
      <SalirContenido />
    </Suspense>
  )
}
