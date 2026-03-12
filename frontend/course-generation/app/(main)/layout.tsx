'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  )
}
