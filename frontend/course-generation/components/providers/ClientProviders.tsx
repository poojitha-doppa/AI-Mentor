'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import Footer from '@/components/layout/Footer'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="page-shell">
        {children}
        <Footer />
      </div>
    </AuthProvider>
  )
}
