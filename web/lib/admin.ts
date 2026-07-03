import { auth } from '@/auth'

export async function requireAdmin() {
  const session = await auth()
  // En desarrollo cualquier sesión activa puede acceder al admin
  if (process.env.NODE_ENV !== 'production') return session ?? null
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) return null
  return session
}
