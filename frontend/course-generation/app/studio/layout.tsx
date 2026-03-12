'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import StudioNav from '@/components/studio/StudioNav'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'educator' && user?.role !== 'admin') {
      router.push('/educators')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || (user?.role !== 'educator' && user?.role !== 'admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav />
      <main>{children}</main>
    </div>
  )
}
