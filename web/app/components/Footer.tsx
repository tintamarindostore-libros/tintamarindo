import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white py-10 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center md:items-start">
          <Image src="/landing/logo-blanco.png" alt="Tintamarindo" width={180} height={48} className="h-10 w-auto" />
          <p className="text-stone-400 text-sm mt-2">
            Libros de colorear personalizados · Enviamos a todo el país
          </p>
        </div>

        <a
          href="https://instagram.com/tintamarindo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
          </svg>
          <span className="text-sm">@tintamarindo</span>
        </a>

        <nav className="flex flex-col items-center gap-2 text-sm text-stone-400 md:items-end">
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
