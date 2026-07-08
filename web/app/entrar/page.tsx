'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function EntrarContenido() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    // signIn() del lado del cliente salta la pantalla intermedia de NextAuth
    // ("Sign in with Google") y va directo al selector de cuentas de Google.
    signIn('google', { callbackUrl })
  }, [callbackUrl])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEF9F0]" style={{ fontFamily: 'var(--font-body)' }}>
      <p className="text-sm text-stone-400">Redirigiendo a Google…</p>
    </div>
  )
}

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarContenido />
    </Suspense>
  )
}
