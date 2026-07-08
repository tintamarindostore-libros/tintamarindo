import Link from 'next/link'

export function AccesoDenegado({ email, volverA }: { email: string; volverA: string }) {
  return (
    <div className="min-h-screen bg-[#FEF9F0] flex items-center justify-center px-6" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-sm w-full bg-white rounded-3xl border border-stone-100 shadow-sm p-8 text-center">
        <p className="text-sm text-stone-400 mb-1">Estás logueado como</p>
        <p className="font-bold text-stone-800 mb-4 break-all">{email}</p>
        <p className="text-sm text-stone-500 mb-6">Esta cuenta no tiene permisos de administrador.</p>
        <Link
          href={`/salir?callbackUrl=${encodeURIComponent(volverA)}`}
          className="inline-block w-full py-3 rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Cerrar sesión y probar con otra cuenta
        </Link>
      </div>
    </div>
  )
}
