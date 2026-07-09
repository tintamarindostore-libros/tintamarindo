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
          <a href="mailto:tintamarindo.store@gmail.com" className="text-stone-400 hover:text-white transition-colors text-sm mt-1">
            tintamarindo.store@gmail.com
          </a>
        </div>

        <div className="flex flex-col items-center gap-3 md:items-start">
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

          <a
            href="https://wa.me/5491139532951"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.4-4.2A8.5 8.5 0 1 1 8 19.6L3 21Z" />
              <path d="M8.5 8.5c0 4 3 7 7 7 .8 0 1.2-.9.7-1.6l-1.2-1.6c-.3-.4-.9-.5-1.3-.2l-.6.4c-1-.6-1.9-1.5-2.5-2.5l.4-.6c.3-.4.2-1-.2-1.3L9.6 7.3c-.7-.5-1.6-.1-1.6.7v.5Z" />
            </svg>
            <span className="text-sm">11 3953 2951</span>
          </a>
        </div>

        <nav className="flex flex-col items-center gap-2 text-sm text-stone-400 md:items-end">
          <Link href="/faq" target="_blank" className="hover:text-white transition-colors">
            Preguntas frecuentes
          </Link>
          <Link href="/arrepentimiento" target="_blank" className="hover:text-white transition-colors">
            Botón de arrepentimiento
          </Link>
          <Link href="/privacidad" target="_blank" className="hover:text-white transition-colors">
            Política de privacidad
          </Link>
          <Link href="/terminos" target="_blank" className="hover:text-white transition-colors">
            Términos y condiciones
          </Link>
        </nav>
      </div>
    </footer>
  )
}
