'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface HeroSectionProps {
  onSearch?: (query: string) => void
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/generate/${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <section className="bg-white pt-24 pb-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-10 text-gray-900">
            What do you wanna learn - your way?
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Create a course for your topic from here..."
              className="w-full px-8 py-5 pr-20 rounded-full text-gray-700 text-base border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 bg-gray-50"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-gray-800 text-white p-3.5 rounded-full transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
