import { auth, signIn } from '@/auth'
import { prisma } from '@/lib/prisma'
import { obtenerUrlFirmada } from '@/lib/r2'
import { Wizard } from './Wizard'

export default async function CrearPage() {
  const session = await auth()

  if (!session?.user) {
    await signIn('google', { redirectTo: '/crear' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const previewUrlInicial = user?.previewUrl ? await obtenerUrlFirmada(user.previewUrl) : null

  return (
    <Wizard
      nombre={session.user.name?.split(' ')[0] ?? ''}
      email={session.user.email ?? ''}
      previewYaUsado={user?.previewUsado ?? false}
      previewUrlInicial={previewUrlInicial}
    />
  )
}
