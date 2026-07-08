import type { Session } from 'next-auth'
import { auth } from '@/auth'

export type AdminAccess =
  | { status: 'ok'; session: Session }
  | { status: 'no-session' }
  | { status: 'wrong-email'; email: string }

// ADMIN_EMAIL admite una lista separada por comas (ej. "a@x.com,b@x.com")
// para permitir más de una cuenta con acceso de administrador.
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

// A diferencia de requireAdmin(), distingue "no logueado" de "logueado con la
// cuenta equivocada" para que las páginas de admin puedan mostrar un mensaje
// claro (y un botón para cerrar sesión) en vez de un redirect silencioso.
export async function checkAdminAccess(): Promise<AdminAccess> {
  const session = await auth()
  if (!session?.user?.email) return { status: 'no-session' }
  // En desarrollo cualquier sesión activa puede acceder al admin
  if (process.env.NODE_ENV !== 'production') return { status: 'ok', session }
  if (!adminEmails().includes(session.user.email.toLowerCase())) return { status: 'wrong-email', email: session.user.email }
  return { status: 'ok', session }
}

export async function requireAdmin() {
  const access = await checkAdminAccess()
  return access.status === 'ok' ? access.session : null
}
