import Link from 'next/link'

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FEF9F0]">
      <header className="bg-white border-b border-stone-100 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-black text-xl text-stone-800 hover:text-orange-500 transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tintamarindo
          </Link>
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  )
}
