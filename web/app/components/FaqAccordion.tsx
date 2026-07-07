'use client'

import { useState } from 'react'

export default function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div key={item.q} className={`faq-item${open ? ' open' : ''}`}>
            <button className="faq-q" onClick={() => setOpenIndex(open ? null : i)}>
              {item.q}
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
            <div className="faq-a" style={{ maxHeight: open ? '400px' : '0px' }}>
              <p>{item.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
