import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export async function requireAuth(requiredRole?: 'learner' | 'educator' | 'admin') {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (requiredRole && (session.user as any).role !== requiredRole) {
    if (requiredRole === 'educator' && (session.user as any).role !== 'admin') {
      redirect('/educators')
    }
  }

  return session
}

export async function getSession() {
  return await getServerSession(authOptions)
}
