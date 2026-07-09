import Link from 'next/link'

export function AccesoDenegado({ email, volverA }: { email: string; volverA: string }) {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-sm w-full bg-stone-900 rounded-3xl border border-stone-800 shadow-sm p-8 text-center">
        <p className="text-sm text-stone-500 mb-1">Estás logueado como</p>
        <p className="font-bold text-white mb-4 break-all">{email}</p>
        <p className="text-sm text-stone-400 mb-6">Esta cuenta no tiene permisos de administrador.</p>
        <Link
          href={`/salir?callbackUrl=${encodeURIComponent(volverA)}`}
          className="inline-block w-full py-3 rounded-2xl font-black text-white bg-brand-500 hover:bg-brand-600 transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Cerrar sesión y probar con otra cuenta
        </Link>
      </div>
    </div>
  )
}
