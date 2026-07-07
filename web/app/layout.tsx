import type { Metadata } from 'next'
import { Fredoka, Inter } from 'next/font/google'
import { Providers } from './providers'
import Footer from './components/Footer'
import './globals.css'

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const TITLE = 'Tintamarindo — Libros de colorear personalizados con tu foto'
const DESCRIPTION =
  'Subís las fotos de tu hijo o hija, elegís la temática y el estilo, y te enviamos un libro impreso a cualquier punto de Argentina.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s — Tintamarindo',
  },
  description: DESCRIPTION,
  keywords: [
    'libro para colorear personalizado',
    'libro de colorear con foto',
    'regalo personalizado niños',
    'libro colorear cara',
    'Día del Niño Argentina',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    siteName: 'Tintamarindo',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Tintamarindo — Libro de colorear personalizado' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${fredoka.variable} ${inter.variable}`}>
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  )
}
