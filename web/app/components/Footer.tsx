import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white py-10 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div>
          <p
            className="font-black text-2xl text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tintamarindo
          </p>
          <p className="text-stone-400 text-sm mt-1">
            Libros de colorear personalizados · Enviamos a todo el país
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-400 md:justify-end">
          <Link href="/faq" className="hover:text-white transition-colors">
            Preguntas frecuentes
          </Link>
          <Link href="/arrepentimiento" className="hover:text-white transition-colors">
            Botón de arrepentimiento
          </Link>
          <Link href="/privacidad" className="hover:text-white transition-colors">
            Política de privacidad
          </Link>
          <Link href="/terminos" className="hover:text-white transition-colors">
            Términos y condiciones
          </Link>
        </nav>
      </div>
    </footer>
  )
}
