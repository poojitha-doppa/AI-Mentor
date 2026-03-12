'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Map, BarChart3, Settings } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/studio', icon: Home },
  { name: 'Courses', href: '/studio/courses', icon: BookOpen },
  { name: 'Journeys', href: '/studio/journeys', icon: Map },
  { name: 'Analytics', href: '/studio/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/studio/settings', icon: Settings },
]

export default function StudioNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/home" className="text-2xl font-bold text-primary-600">
              Course Generation Studio
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <Link href="/home" className="btn-secondary text-sm py-2 px-4">
            Back to Platform
          </Link>
        </div>
      </div>
    </nav>
  )
}
