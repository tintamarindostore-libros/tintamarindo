import Link from 'next/link'
import FaqAccordion from './components/FaqAccordion'
import EstiloFlipCard from './components/EstiloFlipCard'
import './landing.css'

const TEMATICAS = [
  { src: '/landing/tema-aventura.jpg', label: 'Aventura' },
  { src: '/landing/tema-princesas.jpg', label: 'Princesas' },
  { src: '/landing/tema-dinosaurios.jpg', label: 'Dinosaurios' },
  { src: '/landing/tema-espacio.jpg', label: 'Espacio' },
  { src: '/landing/tema-animales.jpg', label: 'Animales' },
  { src: '/landing/tema-letras-numeros.jpg', label: 'Letras y números' },
]

const FAQ_ITEMS = [
  {
    q: '¿Cuánto tarda todo el proceso?',
    a: 'Es un proceso artesanal: generación y revisión de las ilustraciones (7 días), tu aprobación del PDF (hasta 5 días), impresión (4 días) y el envío según tu zona. En total, entre 2 y 3 semanas.',
  },
  {
    q: '¿Hacen envíos? ¿Cuánto cuestan?',
    a: 'Enviamos a todo el país por Correo Argentino, con seguimiento. El costo depende de tu zona y se calcula al confirmar el pedido.',
  },
  {
    q: '¿Cuántas fotos tengo que subir?',
    a: 'Entre 2 y 5 fotos donde se vea bien la carita, con buena luz y sin lentes de sol. Cuantas más variedad de ángulos, mejor queda la ilustración.',
  },
  {
    q: '¿Cómo funciona la aprobación del PDF?',
    a: 'Antes de imprimir te mandamos el libro completo en PDF. Lo revisás con calma, pedís los ajustes que necesites y recién cuando lo aprobás pasa a imprenta.',
  },
  {
    q: '¿Puedo cancelar el pedido?',
    a: 'Sí. Tenés botón de arrepentimiento: cancelás dentro de las 48 hs de la compra y te devolvemos el pago completo.',
  },
  {
    q: '¿Qué formas de pago aceptan?',
    a: 'Tarjetas de crédito y débito, y transferencia bancaria con 10% de descuento. Todos los pagos son seguros.',
  },
]

function Crayon({ id, color }: { id: string; color: string }) {
  return (
    <svg className="crayon" viewBox="0 0 160 18" fill="none">
      <g filter={`url(#${id})`}>
        <path
          d="M5 9c18-3.5 42-5 78-4.5 30 .4 55 1.5 72 3.8 1.8.3 1.9 2.4.2 2.9-20 2.6-46 4-76 3.7-29-.3-52-1.4-72-3.2-2.3-.2-2.7-2.3-2.2-2.7z"
          fill={color}
          opacity="0.5"
        />
        <path
          d="M14 9.5c22-2.6 48-3.6 76-3.2 24 .3 42 1.2 56 2.6 1.4.2 1.4 1.9.1 2.2-18 1.9-40 2.9-64 2.7-24-.2-48-1.3-67-2.6-1.7-.1-2-1.5-1.1-1.7z"
          fill={color}
          opacity="0.55"
        />
      </g>
      <defs>
        <filter id={id} x="-10%" y="-60%" width="120%" height="220%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09 0.28" numOctaves={3} seed={id.slice(-1)} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={7} />
        </filter>
      </defs>
    </svg>
  )
}

export default function Page() {
  return (
    <div className="tm-landing">
      <header className="site-header">
        <div className="wrap">
          <img src="/landing/logo.png" alt="Tintamarindo" />
          <nav className="site-nav">
            <a href="#proceso">Cómo funciona</a>
            <a href="#tematicas">Temáticas</a>
            <a href="#estilos">Estilos</a>
            <a href="#precios">Precios</a>
            <a href="#faq">Preguntas</a>
          </nav>
          <Link className="btn btn-primary btn-sm cta-head" href="/crear">
            Crear un regalo personalizado →
          </Link>
        </div>
      </header>

      {/* 1. Hero */}
      <section className="hero section">
        <div className="wrap">
          <div>
            <h1>
              No te limites a dar un regalo. <span className="hl" style={{ fontSize: '45px' }}>Regalá un recuerdo.</span>
            </h1>
            <p className="hero-sub">
              Un libro para colorear con su propia cara<br />como protagonista de cada página.
            </p>
            <Link className="btn btn-primary" href="/crear">Crear un regalo personalizado →</Link>
            <div className="trust">
              <span>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Pago seguro
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Imagen de prueba gratis
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Aprobás antes de imprimir
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 18H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h11v12h-4" />
                  <path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-2" />
                  <circle cx="7.5" cy="18" r="2" />
                  <circle cx="17.5" cy="18" r="2" />
                </svg>
                Envíos a todo el país
              </span>
            </div>
          </div>
          <div className="hero-media">
            <video autoPlay muted loop playsInline poster="/landing/hero-poster.jpg">
              <source src="/landing/hero.mp4" type="video/mp4" />
            </video>
            <img className="hero-mobile" src="/landing/hero-poster.jpg" alt="Niña sorprendida mirando su libro de colorear personalizado" />
          </div>
        </div>
      </section>

      {/* 2. Diferencial */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="sec-head">
            <Crayon id="wc-1" color="#E24C2E" />
            <h2>Un regalo que no se parece a ningún otro</h2>
          </div>
          <div className="diff-grid">
            <div className="diff">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                <path d="M17 3.5c1.5 1 2.5 2.6 2.5 4.5" />
              </svg>
              <h3>Su cara real, ilustrada</h3>
              <p>Cada escena del libro tiene su carita como protagonista, dibujada a partir de las fotos que subís.</p>
            </div>
            <div className="diff">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7a4.95 4.95 0 1 0-7-7l-7 7v7h7Z" />
                <path d="m16 8 2 2" />
                <path d="M5 19l3-3" />
              </svg>
              <h3>Hecho y revisado a mano</h3>
              <p>Cada libro se arma y se revisa página por página en Argentina, con proceso artesanal.</p>
            </div>
            <div className="diff">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12a8 8 0 1 1-8-8" />
                <path d="M20 4 12 12" />
                <path d="M15 4h5v5" />
              </svg>
              <h3>Probás gratis antes de pagar</h3>
              <p>Te mandamos una imagen de prueba con su cara ilustrada, sin costo y sin compromiso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Proceso */}
      <section className="section" id="proceso">
        <div className="wrap">
          <div className="sec-head">
            <Crayon id="wc-6" color="#E9A94A" />
            <h2>Así de simple</h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">PASO 1</div>
              <h3>Subís 2 a 5 fotos</h3>
              <p>Fotos claras donde se vea bien su carita. Con eso alcanza.</p>
              <div className="step-media">
                <img src="/landing/paso1-fotos.jpg" alt="Foto real de la nena que se convierte en protagonista" style={{ objectPosition: 'center 22%' }} />
              </div>
            </div>
            <div className="step step-magic">
              <div className="step-num">PASO 2</div>
              <h3>Elegís mundos y estilos</h3>
              <p>Aventura, espacio, princesas… y el estilo de dibujo que más le va.</p>
              <div className="magic-stage" aria-hidden="true">
                <svg viewBox="0 0 240 240" fill="none">
                  <circle className="magic-glow" cx="120" cy="104" r="44" fill="#E9A94A" opacity="0.14" />
                  <g className="magic-box">
                    <g className="magic-rays" stroke="#E9A94A" strokeWidth="2.6" strokeLinecap="round">
                      <path className="ray" d="M98 112V88" />
                      <path className="ray r2" d="M120 108V78" />
                      <path className="ray r3" d="M142 112V88" />
                    </g>
                    <rect x="80" y="128" width="80" height="58" rx="8" stroke="#111111" strokeWidth="2.4" />
                    <path d="M72 128h96" stroke="#111111" strokeWidth="2.4" strokeLinecap="round" />
                    <rect x="70" y="98" width="92" height="16" rx="6" transform="rotate(-12 116 106)" stroke="#111111" strokeWidth="2.4" />
                    <path d="M120 128v58" stroke="#111111" strokeWidth="1.6" opacity="0.4" />
                  </g>
                  <g className="magic-sparks">
                    <path className="spark" d="M62 66l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4z" fill="#E9A94A" />
                    <path className="spark s3" d="M180 56l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4z" fill="#E24C2E" />
                    <path className="spark s2" d="M192 130l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#E9A94A" />
                    <path className="spark s4" d="M46 138l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#E24C2E" />
                    <path className="spark s2" d="M120 34l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#E9A94A" />
                    <path className="spark s3" d="M216 168l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#E9A94A" />
                    <path className="spark s4" d="M28 176l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#E24C2E" />
                    <circle className="spark s2" cx="88" cy="52" r="2.6" fill="#E24C2E" />
                    <circle className="spark s4" cx="156" cy="84" r="2.4" fill="#E9A94A" />
                    <circle className="spark s3" cx="64" cy="104" r="2" fill="#E9A94A" />
                    <circle className="spark" cx="176" cy="104" r="2.2" fill="#E24C2E" />
                    <circle className="spark s3" cx="108" cy="70" r="1.8" fill="#E9A94A" />
                    <circle className="spark s2" cx="200" cy="196" r="2.4" fill="#E24C2E" />
                    <circle className="spark s4" cx="52" cy="206" r="2" fill="#E9A94A" />
                    <g className="spark" stroke="#E9A94A" strokeWidth="1.6" strokeLinecap="round"><path d="M206 96v10M201 101h10" /></g>
                    <g className="spark s2" stroke="#E24C2E" strokeWidth="1.6" strokeLinecap="round"><path d="M34 96v10M29 101h10" /></g>
                    <g className="spark s4" stroke="#E9A94A" strokeWidth="1.6" strokeLinecap="round"><path d="M150 200v10M145 205h10" /></g>
                    <g className="spark s3" stroke="#E24C2E" strokeWidth="1.6" strokeLinecap="round"><path d="M84 204v10M79 209h10" /></g>
                    <g className="spark s2" stroke="#E9A94A" strokeWidth="1.6" strokeLinecap="round"><path d="M150 44v10M145 49h10" /></g>
                    <g className="spark s3" stroke="#E24C2E" strokeWidth="1.6" strokeLinecap="round"><path d="M70 40v10M65 45h10" /></g>
                  </g>
                </svg>
              </div>
            </div>
            <div className="step">
              <div className="step-num">PASO 3</div>
              <h3>Recibís el libro impreso en casa</h3>
              <p>Impreso, encuadernado y enviado a todo el país.</p>
              <div className="step-media mobile-swap">
                <img className="desktop-img" src="/landing/paso3-libro-desktop.jpg" alt="Libro de colorear personalizado impreso" />
                <img className="mobile-img" src="/landing/paso3-libro-mobile.jpg" alt="Libro de colorear personalizado impreso" />
              </div>
            </div>
          </div>
          <p className="process-note">Proceso artesanal: generación y revisión (5 días) + tu aprobación (hasta 5) + impresión (4) + envío.</p>
        </div>
      </section>

      {/* 4. Temáticas */}
      <section className="section section-alt" id="tematicas">
        <div className="wrap">
          <div className="sec-head">
            <Crayon id="wc-2" color="#E24C2E" />
            <h2>Mundos para explorar</h2>
            <p>Elegís las temáticas y cada página lo lleva a un mundo distinto.</p>
          </div>
          <div className="themes-grid">
            {TEMATICAS.map((t) => (
              <div key={t.label} className="card card-hover theme-card">
                <div className="theme-img">
                  <img src={t.src} alt={`Muestra temática ${t.label.toLowerCase()}: foto real y página para colorear`} />
                </div>
                <div className="theme-label">{t.label}</div>
              </div>
            ))}
          </div>
          <div className="banner-dia-grid">
            <div className="banner-dia" style={{ backgroundColor: '#FDE6D5' }}>
              <h3 style={{ fontSize: '22px', textAlign: 'center' }}>¡Hay muchas más!</h3>
              <p style={{ color: '#111111B3' }}>Estas son solo algunas — al armar tu libro vas a poder elegir entre muchas más temáticas.</p>
            </div>
            <div className="banner-dia" style={{ backgroundColor: '#FDE6D5' }}>
              <h3 style={{ fontSize: '22px', textAlign: 'center' }}>¿Otra idea?</h3>
              <p style={{ color: '#111111B3' }}>También podés sumar temáticas propias. Por ejemplo: &ldquo;Danza clásica, automóviles o su equipo de fútbol&rdquo;.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Estilos */}
      <section className="section" id="estilos">
        <div className="wrap">
          <div className="sec-head">
            <Crayon id="wc-7" color="#E9A94A" />
            <h2>De la foto al dibujo</h2>
            <p>Pasá el mouse (o tocá la card) y mirá cómo su foto se convierte en una página para colorear.</p>
          </div>
          <div className="styles-grid">
            <EstiloFlipCard foto="/landing/estilo-realista-foto.jpg" linea="/landing/estilo-realista-linea.jpg" label="Realista" />
            <EstiloFlipCard foto="/landing/paso1-fotos.jpg" linea="/landing/estilo-pixar-linea.jpg" label="Pixar" />
            <EstiloFlipCard foto="/landing/estilo-anime-foto.jpg" linea="/landing/estilo-anime-linea.jpg" label="Anime" />
          </div>
          <p className="styles-note">Combinables: hasta 3 estilos en 24 páginas, hasta 4 en 32.</p>
        </div>
      </section>

      {/* 6. Precios */}
      <section className="section section-alt" id="precios">
        <div className="wrap">
          <div className="sec-head">
            <Crayon id="wc-3" color="#E24C2E" />
            <h2>Dos tamaños, un mismo cuidado</h2>
          </div>
          <div className="pricing">
            <div className="card price-card">
              <span className="badge-especial">🎁 Precio especial Día del Niño</span>
              <h3>24 páginas</h3>
              <div className="price">$49.900</div>
              <div className="price-transfer-box">
                <span className="price-alt"><b>$44.910</b></span>
                <span className="price-alt-note">10% de descuento pagando por transferencia bancaria</span>
              </div>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Hasta 8 temáticas</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Hasta 3 estilos</li>
              </ul>
              <Link className="btn btn-primary" href="/crear">Crear un regalo personalizado →</Link>
            </div>
            <div className="card price-card">
              <span className="badge-especial">🎁 Precio especial Día del Niño</span>
              <h3>32 páginas</h3>
              <div className="price">$59.900</div>
              <div className="price-transfer-box">
                <span className="price-alt"><b>$53.910</b></span>
                <span className="price-alt-note">10% de descuento pagando por transferencia bancaria</span>
              </div>
              <ul>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Hasta 15 temáticas</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Hasta 4 estilos</li>
                <li><span className="badge-ocre">+ Ilustración familiar</span></li>
                <li>Subís una foto grupal y toda la familia queda dibujada en una página.</li>
              </ul>
              <Link className="btn btn-primary" href="/crear">Crear un regalo personalizado →</Link>
            </div>
          </div>
          <div className="price-photo"><img src="/landing/precios-papel.jpg" alt="Hojas de papel blanco y ahuesado con crayones sobre una mesa de madera" /></div>
          <p className="price-common">Elegí el papel que más te guste: blanco, ahuesado o combinado. Podés usar un solo tipo en todo el libro o mezclar ambos, sin costo extra.</p>
        </div>
      </section>

      {/* 7. Dedicatoria */}
      <section className="section dedic">
        <div className="wrap">
          <div className="dedic-media mobile-swap">
            <img className="desktop-img" src="/landing/dedicatoria-desktop.jpg" alt="Abuela y nieto mirando juntos el libro personalizado" />
            <img className="mobile-img" src="/landing/dedicatoria-mobile.jpg" alt="Abuela y nieto mirando juntos el libro personalizado" />
          </div>
          <div>
            <svg className="crayon left" viewBox="0 0 160 8" fill="none">
              <path d="M4 4.5C28 6.5 56 3 84 5c25 1.8 48-2 72 .5" stroke="#E9A94A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h2>El momento de abrir el regalo</h2>
            <p>La tapa lleva su nombre, a color. Adentro, una dedicatoria impresa escrita por vos: unas palabras que van a quedar guardadas junto con cada página que pinten.</p>
            <p>Porque el libro se colorea una vez, pero se abre muchas más.</p>
          </div>
        </div>
      </section>

      {/* 8. Prueba gratis */}
      <section className="section section-alt free">
        <div className="wrap">
          <Crayon id="wc-4" color="#E24C2E" />
          <h2>Miralo antes de decidir</h2>
          <p>Generamos una imagen de prueba gratuita con la foto real, con marca de agua. Si te emociona verla, imaginate el libro completo.</p>
          <Link className="btn btn-secondary" href="/crear">Probá gratis →</Link>
        </div>
      </section>

      {/* 9. Comparación */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Crayon id="wc-8" color="#E9A94A" />
            <h2>Por qué este regalo le gana a cualquier otro</h2>
          </div>
          <div className="compare-grid">
            <div className="card compare-card">
              <h3>Juguetes</h3>
              <p className="good">Emocionante por un momento.</p>
              <p className="bad">Se olvida en una semana.</p>
            </div>
            <div className="card compare-card">
              <h3>Ropa</h3>
              <p className="good">Práctica, sin duda.</p>
              <p className="bad">En unos meses ya no le entra.</p>
            </div>
            <div className="card compare-card">
              <h3>Tarjetas de regalo</h3>
              <p className="good">Fácil de dar.</p>
              <p className="bad">Se siente impersonal.</p>
            </div>
            <div className="card compare-card compare-winner">
              <span className="badge-win">El que se guarda</span>
              <h3>Este libro</h3>
              <p className="good">Su propia cara en cada página.</p>
              <p className="bad">Se guarda y se atesora para siempre.</p>
            </div>
          </div>
          <p className="compare-quote">&ldquo;Dentro de unos años no van a recordar qué juguete les tocó. Pero sí van a recordar el libro donde ellos eran los protagonistas.&rdquo;</p>
          <div className="compare-photo mobile-swap">
            <img className="desktop-img" src="/landing/comparacion-desktop.jpg" alt="Nena abriendo su libro personalizado en su cumpleaños" />
            <img className="mobile-img" src="/landing/comparacion-mobile.jpg" alt="Nena abriendo su libro personalizado en su cumpleaños" />
          </div>
        </div>
      </section>

      {/* 10. Confianza + urgencia */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="sec-head">
            <Crayon id="wc-5" color="#E24C2E" />
            <h2>Comprá con tranquilidad</h2>
          </div>
          <div className="trust-grid">
            <div className="trust-item">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="m9 15 2 2 4-4" />
              </svg>
              <h3>Aprobás el PDF antes de que se imprima</h3>
              <p>Nada va a imprenta sin tu visto bueno, página por página.</p>
            </div>
            <div className="trust-item">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 18H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h11v12h-4" />
                <path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-2" />
                <circle cx="7.5" cy="18" r="2" />
                <circle cx="17.5" cy="18" r="2" />
              </svg>
              <h3>Envío con seguimiento</h3>
              <p>Por Correo Argentino, con código de seguimiento a todo el país.</p>
            </div>
            <div className="trust-item">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9" />
                <path d="M3 4v5h5" />
                <path d="M3 4l3.6 3.6" />
                <path d="M12 7v5l3 3" />
              </svg>
              <h3>Botón de arrepentimiento</h3>
              <p>Cancelás dentro de las 48 hs y te devolvemos el pago completo.</p>
            </div>
          </div>
          <div className="banner-dia">Día del Niño: pedilo antes del 15 de julio para que llegue garantizado el 9 de agosto.</div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="section" id="faq">
        <div className="wrap">
          <div className="sec-head">
            <Crayon id="wc-9" color="#E9A94A" />
            <h2>Preguntas frecuentes</h2>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* 12. CTA final */}
      <section className="section section-alt final" id="final">
        <div className="wrap">
          <div className="final-photo mobile-swap">
            <img className="desktop-img" src="/landing/final-desktop.jpg" alt="Nene coloreando su libro personalizado en el suelo" />
            <img className="mobile-img" src="/landing/final-mobile.jpg" alt="Nene coloreando su libro personalizado en el suelo" />
          </div>
          <h2>Un libro que <span className="hl">nunca se olvida</span></h2>
          <Link className="btn btn-primary" href="/crear">Crear un regalo personalizado →</Link>
        </div>
      </section>
    </div>
  )
}
