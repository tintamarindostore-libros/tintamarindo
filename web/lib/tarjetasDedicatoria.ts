// Catálogo de tarjetas de dedicatoria prediseñadas — el cliente elige un diseño
// (no escribe el mensaje digitalmente, la tarjeta se imprime en blanco en la
// retiración de tapa para completar a mano). Se guarda el `id` en Pedido.dedicatoria.
export const TARJETAS_DEDICATORIA = [
  { id: 'vario00', label: 'Fiesta con globos', imagen: '/landing/tarjeta-dedicatoria-vario00.png' },
  { id: 'vario01', label: 'Para grandes aventuras', imagen: '/landing/tarjeta-dedicatoria-vario01.png' },
  { id: 'vario02', label: 'Un regalito para vos', imagen: '/landing/tarjeta-dedicatoria-vario02.png' },
  { id: 'vario03', label: 'Circo', imagen: '/landing/tarjeta-dedicatoria-vario03.png' },
  { id: 'pixar01', label: 'Un regalo especial (niño)', imagen: '/landing/tarjeta-dedicatoria-pixar01.png' },
  { id: 'pixar02', label: 'Un regalo especial (niña)', imagen: '/landing/tarjeta-dedicatoria-pixar02.png' },
  { id: 'gibli01', label: 'Ghibli — Totoro', imagen: '/landing/tarjeta-dedicatoria-gibli01.png' },
] as const

export function labelTarjetaDedicatoria(id: string | null): string {
  if (!id) return 'Sin tarjeta de dedicatoria'
  return TARJETAS_DEDICATORIA.find((t) => t.id === id)?.label ?? id
}
