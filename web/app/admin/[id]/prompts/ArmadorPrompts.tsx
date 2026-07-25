'use client'

import { useMemo, useState } from 'react'
import {
  ensamblarPromptEscena,
  escenaGenerica,
  construirPromptTapa,
  TEMATICA_PROMPT,
  POSE_MODIFIERS,
  ANGULO_MODIFIERS,
} from '@/lib/prompts'

const ESTILOS = [
  { id: 'REALISTA', label: 'Realista' },
  { id: 'PIXAR', label: 'Pixar' },
  { id: 'ANIME', label: 'Anime' },
  { id: 'GHIBLI', label: 'Ghibli' },
]

type PaginaInicial = {
  key: string
  orden: number
  etiqueta: string
  estilo: string
  tematica: string
  varianteIndex: number
  pose: string
  angulo: string
  promptExtra: string
}
type TapaInicial = {
  key: string
  estilo: string
  titulo: string
  subtitulo: string
  observaciones: string
  promptExtra: string
} | null

type CfgPagina = {
  estilo: string
  tematica: string
  situacion: string
  pose: string
  angulo: string
  ref: string
  promptExtra: string
}
type CfgTapa = {
  estilo: string
  titulo: string
  subtitulo: string
  observaciones: string
  ref: string
  promptExtra: string
}
type CfgLibre = {
  estilo: string
  situacion: string
  pose: string
  angulo: string
  ref: string
  promptExtra: string
}

const LINEA_REF = (detalle: string) =>
  `REFERENCE: use the attached reference image(s) as the exact reference for ${detalle.trim()} — replicate them faithfully.`
const LINEA_EXTRA = (extra: string) => `INSTRUCCIONES ADICIONALES PARA ESTA IMAGEN: ${extra.trim()}`

function armarInterior(c: { estilo: string; situacion: string; pose: string; angulo: string; ref: string; promptExtra: string }) {
  let p = ensamblarPromptEscena(c.estilo, c.situacion, c.pose, c.angulo)
  if (c.ref.trim()) p += `\n\n${LINEA_REF(c.ref)}`
  if (c.promptExtra.trim()) p += `\n\n${LINEA_EXTRA(c.promptExtra)}`
  return p
}
function armarTapa(c: CfgTapa) {
  let p = construirPromptTapa({ estilo: c.estilo, titulo: c.titulo, subtitulo: c.subtitulo, observaciones: c.observaciones })
  if (c.ref.trim()) p += `\n\n${LINEA_REF(c.ref)}`
  if (c.promptExtra.trim()) p += `\n\n${LINEA_EXTRA(c.promptExtra)}`
  return p
}

function BotonCopiar({ texto, className }: { texto: string; className?: string }) {
  const [copiado, setCopiado] = useState(false)
  const copiar = () => {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={copiar}
      className={
        className ??
        'text-xs font-black px-4 py-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white transition-colors'
      }
    >
      {copiado ? '✓ Copiado' : '📋 Copiar prompt'}
    </button>
  )
}

const selectClass =
  'w-full rounded-lg border border-stone-700 bg-stone-800 text-stone-200 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none cursor-pointer'
const inputClass =
  'w-full rounded-lg border border-stone-700 bg-stone-800 text-stone-200 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none placeholder:text-stone-600'

export function ArmadorPrompts({
  pedidoId,
  codigo,
  nombre,
  tematicasEfectivas,
  situacionesPorTematica,
  paginas,
  tapa,
}: {
  pedidoId: string
  codigo: string
  nombre: string
  tematicasEfectivas: string[]
  situacionesPorTematica: Record<string, string[]>
  paginas: PaginaInicial[]
  tapa: TapaInicial
}) {
  // Situaciones disponibles para una temática: las cargadas a mano en el pedido,
  // si no las predefinidas del diccionario, si no una descripción genérica.
  const situacionesDe = useMemo(
    () => (tematica: string): string[] => {
      const manual = situacionesPorTematica[tematica]
      if (manual?.length) return manual
      if (TEMATICA_PROMPT[tematica]?.length) return TEMATICA_PROMPT[tematica]
      return [escenaGenerica(tematica)]
    },
    [situacionesPorTematica],
  )

  const [cfgPaginas, setCfgPaginas] = useState<Record<string, CfgPagina>>(() =>
    Object.fromEntries(
      paginas.map((p) => {
        const lista = situacionesDe(p.tematica)
        return [
          p.key,
          {
            estilo: p.estilo,
            tematica: p.tematica,
            situacion: lista[p.varianteIndex % lista.length] ?? lista[0] ?? '',
            pose: p.pose,
            angulo: p.angulo,
            ref: '',
            promptExtra: p.promptExtra,
          } as CfgPagina,
        ]
      }),
    ),
  )

  const [cfgTapa, setCfgTapa] = useState<CfgTapa | null>(
    tapa
      ? { estilo: tapa.estilo, titulo: tapa.titulo, subtitulo: tapa.subtitulo, observaciones: tapa.observaciones, ref: '', promptExtra: tapa.promptExtra }
      : null,
  )

  const setPagina = (key: string, campo: keyof CfgPagina, valor: string) =>
    setCfgPaginas((prev) => {
      const actual: CfgPagina = { ...prev[key], [campo]: valor }
      // Al cambiar la temática, recargamos la situación por defecto de la nueva.
      if (campo === 'tematica') {
        const lista = situacionesDe(valor)
        actual.situacion = lista[0] ?? ''
      }
      return { ...prev, [key]: actual }
    })

  const setTapa = (campo: keyof CfgTapa, valor: string) =>
    setCfgTapa((prev) => (prev ? { ...prev, [campo]: valor } : prev))

  const copiarTodos = () => {
    const partes: string[] = []
    if (cfgTapa) partes.push(`===== TAPA (color) =====\n\n${armarTapa(cfgTapa)}`)
    paginas.forEach((p) => partes.push(`===== ${p.etiqueta} =====\n\n${armarInterior(cfgPaginas[p.key])}`))
    navigator.clipboard.writeText(partes.join('\n\n\n'))
  }
  const [copiadosTodos, setCopiadosTodos] = useState(false)

  return (
    <div className="min-h-screen bg-stone-950 px-6 py-12" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <a href={`/admin/${pedidoId}`} className="text-sm text-stone-500 hover:text-stone-300">← Volver al pedido</a>
          <h1 className="text-2xl font-black text-white mt-2" style={{ fontFamily: 'var(--font-display)' }}>
            Armador de prompts
          </h1>
          <p className="text-xs text-stone-500 mt-0.5 font-mono">#{codigo} · {nombre}</p>
          <p className="text-sm text-stone-400 mt-3">
            Cada página del libro ya viene con su prompt armado, igual que lo generaría el sistema. Ajustá las variables que
            quieras y el prompt se rearma solo. Copialo, adjuntá afuera la foto del nene (y una imagen de referencia si hace
            falta) y generá la imagen.
          </p>
        </div>

        <div className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-2xl px-5 py-3">
          <p className="text-xs text-stone-400">
            {paginas.length} página{paginas.length === 1 ? '' : 's'} interior{paginas.length === 1 ? '' : 'es'}
            {cfgTapa ? ' + tapa' : ''}
          </p>
          <button
            type="button"
            onClick={() => { copiarTodos(); setCopiadosTodos(true); setTimeout(() => setCopiadosTodos(false), 1500) }}
            className="text-xs font-black px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
          >
            {copiadosTodos ? '✓ Copiados' : '📋 Copiar todos'}
          </button>
        </div>

        {cfgTapa && (
          <div className="bg-stone-900 rounded-2xl border border-brand-500/30 p-5 space-y-3">
            <p className="text-xs font-black text-brand-400 uppercase tracking-widest">Tapa (a color)</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-bold text-stone-500">Estilo</span>
                <select value={cfgTapa.estilo} onChange={(e) => setTapa('estilo', e.target.value)} className={selectClass}>
                  {ESTILOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-stone-500">Título</span>
                <input value={cfgTapa.titulo} onChange={(e) => setTapa('titulo', e.target.value)} className={inputClass} placeholder="Título de la tapa" />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-stone-500">Subtítulo</span>
                <input value={cfgTapa.subtitulo} onChange={(e) => setTapa('subtitulo', e.target.value)} className={inputClass} placeholder="Subtítulo (opcional)" />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold text-stone-500">Indicaciones de tapa</span>
                <input value={cfgTapa.observaciones} onChange={(e) => setTapa('observaciones', e.target.value)} className={inputClass} placeholder="Indicaciones del cliente (opcional)" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold text-stone-500">Imagen de referencia (opcional)</span>
                <input value={cfgTapa.ref} onChange={(e) => setTapa('ref', e.target.value)} className={inputClass} placeholder="Qué copiar de la referencia, ej: los colores y el escudo de la camiseta del Quilmes" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[11px] font-bold text-stone-500">Instrucciones extra</span>
                <input value={cfgTapa.promptExtra} onChange={(e) => setTapa('promptExtra', e.target.value)} className={inputClass} placeholder="Ajuste puntual para esta imagen (opcional)" />
              </label>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] text-stone-300 bg-stone-950 rounded-xl p-3 font-mono max-h-64 overflow-auto">{armarTapa(cfgTapa)}</pre>
            <BotonCopiar texto={armarTapa(cfgTapa)} />
          </div>
        )}

        {paginas.map((p) => {
          const c = cfgPaginas[p.key]
          const situaciones = situacionesDe(c.tematica)
          const prompt = armarInterior(c)
          return (
            <div key={p.key} className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-3">
              <p className="text-xs font-black text-stone-400 uppercase tracking-widest">{p.etiqueta}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[11px] font-bold text-stone-500">Temática</span>
                  <select value={c.tematica} onChange={(e) => setPagina(p.key, 'tematica', e.target.value)} className={selectClass}>
                    {tematicasEfectivas.length === 0 && <option value="">(sin temática)</option>}
                    {tematicasEfectivas.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-stone-500">Estilo</span>
                  <select value={c.estilo} onChange={(e) => setPagina(p.key, 'estilo', e.target.value)} className={selectClass}>
                    {ESTILOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-stone-500">Pose</span>
                  <select value={c.pose} onChange={(e) => setPagina(p.key, 'pose', e.target.value)} className={selectClass}>
                    {POSE_MODIFIERS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-stone-500">Ángulo</span>
                  <select value={c.angulo} onChange={(e) => setPagina(p.key, 'angulo', e.target.value)} className={selectClass}>
                    {ANGULO_MODIFIERS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-[11px] font-bold text-stone-500">Situación (mini-prompt de la escena)</span>
                {situaciones.length > 1 && (
                  <select
                    value=""
                    onChange={(e) => { if (e.target.value) setPagina(p.key, 'situacion', e.target.value) }}
                    className={`${selectClass} mb-1.5`}
                  >
                    <option value="">Cargar una situación sugerida…</option>
                    {situaciones.map((s, i) => <option key={i} value={s}>{s.length > 90 ? s.slice(0, 90) + '…' : s}</option>)}
                  </select>
                )}
                <textarea
                  value={c.situacion}
                  onChange={(e) => setPagina(p.key, 'situacion', e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[11px] font-bold text-stone-500">Imagen de referencia (opcional)</span>
                  <input value={c.ref} onChange={(e) => setPagina(p.key, 'ref', e.target.value)} className={inputClass} placeholder="Ej: los colores y el escudo de la camiseta del Quilmes" />
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold text-stone-500">Instrucciones extra</span>
                  <input value={c.promptExtra} onChange={(e) => setPagina(p.key, 'promptExtra', e.target.value)} className={inputClass} placeholder="Ajuste puntual (opcional)" />
                </label>
              </div>
              <pre className="whitespace-pre-wrap text-[11px] text-stone-300 bg-stone-950 rounded-xl p-3 font-mono max-h-64 overflow-auto">{prompt}</pre>
              <BotonCopiar texto={prompt} />
            </div>
          )
        })}

        <SeccionLibre tematicasEfectivas={tematicasEfectivas} situacionesDe={situacionesDe} />
      </div>
    </div>
  )
}

function SeccionLibre({
  tematicasEfectivas,
  situacionesDe,
}: {
  tematicasEfectivas: string[]
  situacionesDe: (tematica: string) => string[]
}) {
  const [c, setC] = useState<CfgLibre>({
    estilo: 'REALISTA',
    situacion: '',
    pose: POSE_MODIFIERS[0],
    angulo: ANGULO_MODIFIERS[0],
    ref: '',
    promptExtra: '',
  })
  const set = (campo: keyof CfgLibre, valor: string) => setC((prev) => ({ ...prev, [campo]: valor }))
  const prompt = armarInterior(c)

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-3">
      <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Armar uno libre</p>
      <p className="text-xs text-stone-500">
        Combiná lo que quieras, sin depender de una página del pedido. Escribí la situación a mano o cargá una sugerida de una temática.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[11px] font-bold text-stone-500">Estilo</span>
          <select value={c.estilo} onChange={(e) => set('estilo', e.target.value)} className={selectClass}>
            {ESTILOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </label>
        {tematicasEfectivas.length > 0 && (
          <label className="block">
            <span className="text-[11px] font-bold text-stone-500">Cargar situación de una temática</span>
            <select
              value=""
              onChange={(e) => { if (e.target.value) set('situacion', e.target.value) }}
              className={selectClass}
            >
              <option value="">Elegir…</option>
              {tematicasEfectivas.flatMap((t) =>
                situacionesDe(t).map((s, i) => (
                  <option key={`${t}-${i}`} value={s}>{t}: {s.length > 70 ? s.slice(0, 70) + '…' : s}</option>
                )),
              )}
            </select>
          </label>
        )}
        <label className="block">
          <span className="text-[11px] font-bold text-stone-500">Pose</span>
          <select value={c.pose} onChange={(e) => set('pose', e.target.value)} className={selectClass}>
            {POSE_MODIFIERS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-stone-500">Ángulo</span>
          <select value={c.angulo} onChange={(e) => set('angulo', e.target.value)} className={selectClass}>
            {ANGULO_MODIFIERS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-[11px] font-bold text-stone-500">Situación (mini-prompt de la escena)</span>
        <textarea value={c.situacion} onChange={(e) => set('situacion', e.target.value)} rows={2} className={inputClass} placeholder="Ej: La nena, con la camiseta a rayas blancas y azules del Quilmes, patea al arco mientras la pelota pasa junto al arquero" />
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[11px] font-bold text-stone-500">Imagen de referencia (opcional)</span>
          <input value={c.ref} onChange={(e) => set('ref', e.target.value)} className={inputClass} placeholder="Qué copiar de la referencia" />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold text-stone-500">Instrucciones extra</span>
          <input value={c.promptExtra} onChange={(e) => set('promptExtra', e.target.value)} className={inputClass} placeholder="Ajuste puntual (opcional)" />
        </label>
      </div>
      <pre className="whitespace-pre-wrap text-[11px] text-stone-300 bg-stone-950 rounded-xl p-3 font-mono max-h-64 overflow-auto">{prompt}</pre>
      <BotonCopiar texto={prompt} />
    </div>
  )
}
