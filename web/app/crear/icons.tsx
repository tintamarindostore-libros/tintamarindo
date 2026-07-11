// Set de íconos lineales propio de Tintamarindo, en el mismo estilo que los
// badges de confianza del hero de la landing (stroke, sin relleno, currentColor).

type IconProps = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconCamera({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M9 4h6l1.5 2.5H19a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V8a1.5 1.5 0 0 1 1.5-1.5h2.5L9 4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconCircleDot({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}

export function IconUpload({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 15V4M12 4 8 8M12 4l4 4" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 4v11M12 15l-4-4M12 15l4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

export function IconCompass({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconCrown({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4.5 17h15l-1-8-4 3.2-2.5-5-2.5 5-4-3.2-1 8Z" />
      <path d="M4.5 17h15" />
    </svg>
  )
}

export function IconEgg({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3.5C8.5 3.5 5.5 9.2 5.5 14a6.5 6.5 0 0 0 13 0c0-4.8-3-10.5-6.5-10.5Z" />
      <path d="M9.5 11.5 11 13l-1.3 1.8 2.1 1.7" />
    </svg>
  )
}

export function IconRocket({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 2.5c2.3 2 3.7 5.2 3.7 8.5 0 1.9-.4 3.3-.9 4.2l-2.8 2.6-2.8-2.6c-.5-.9-.9-2.3-.9-4.2 0-3.3 1.4-6.5 3.7-8.5Z" />
      <circle cx="12" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M9.2 14.5 6.5 16.3l.8-3.6M14.8 14.5l2.7 1.8-.8-3.6" />
      <path d="M10.3 17.8 12 21.5l1.7-3.7" />
    </svg>
  )
}

export function IconPaw({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <ellipse cx="12" cy="15.5" rx="4" ry="3.3" />
      <circle cx="6.5" cy="10.5" r="1.6" />
      <circle cx="10" cy="7.8" r="1.6" />
      <circle cx="14" cy="7.8" r="1.6" />
      <circle cx="17.5" cy="10.5" r="1.6" />
    </svg>
  )
}

export function IconPen({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 20l.8-3.8L15.6 5.4a1.5 1.5 0 0 1 2.1 0l.9.9a1.5 1.5 0 0 1 0 2.1L7.8 19.2 4 20Z" />
      <path d="M13.8 7.2l2.9 2.9" />
    </svg>
  )
}

export function IconBlob({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <path d="M8.5 14.2c1 1.1 2.2 1.7 3.5 1.7s2.5-.6 3.5-1.7" />
    </svg>
  )
}

export function IconSparkle({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3l1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3Z" />
    </svg>
  )
}

export function IconLeaf({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 19c-1-6 2-13 14-14 1 9-4 14-14 14Z" />
      <path d="M6 18c3-4 6-7 12-11" />
    </svg>
  )
}

export function IconFamily({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="9" cy="8.5" r="2.5" />
      <circle cx="16" cy="9.5" r="2" />
      <path d="M4 19v-1.5A4.5 4.5 0 0 1 8.5 13h1A4.5 4.5 0 0 1 14 17.5V19" />
      <path d="M15 13.3a3.5 3.5 0 0 1 5 3.2V19" />
    </svg>
  )
}

export function IconImage({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M20.5 15 16 10.5l-4 4-2.5-2.5-6 5.5" />
    </svg>
  )
}

export function IconHeart({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 20s-7-4.3-9.3-8.7C.9 7.9 2.4 4.5 5.8 4.5c2 0 3.4 1.2 4.4 2.9C11.2 5.7 12.6 4.5 14.6 4.5c3.4 0 4.9 3.4 3.1 6.8C15.4 15.7 12 20 12 20Z" />
    </svg>
  )
}

export function IconGift({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M4 14h16" />
      <path d="M12 10v10" />
      <path d="M12 10C9 10 7.5 8.7 7.5 7A2 2 0 0 1 11.5 6c.5.8.5 2.5.5 4Z" />
      <path d="M12 10c3 0 4.5-1.3 4.5-3A2 2 0 0 0 12.5 6c-.5.8-.5 2.5-.5 4Z" />
    </svg>
  )
}

export function IconBook({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 6.5c-1.5-1.2-3.6-2-6.5-2-.6 0-1 .4-1 1v11c0 .6.4 1 1 1 2.9 0 5 .8 6.5 2 1.5-1.2 3.6-2 6.5-2 .6 0 1-.4 1-1v-11c0-.6-.4-1-1-1-2.9 0-5 .8-6.5 2Z" />
      <path d="M12 6.5v12" />
    </svg>
  )
}
