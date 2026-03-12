'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { Course, LearningJourney } from '@/types'

interface SearchBarProps {
  className?: string
}

export default function SearchBar({ className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<{
    courses: Course[]
    journeys: LearningJourney[]
  }>({
    courses: [],
    journeys: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (query.length > 2) {
        performSearch()
      } else {
        setResults({ courses: [], journeys: [] })
      }
    }, 300)

    return () => clearTimeout(searchDebounce)
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
      setIsOpen(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults({ courses: [], journeys: [] })
    setIsOpen(false)
  }

  const hasResults = results.courses.length > 0 || results.journeys.length > 0

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setIsOpen(true)}
          placeholder="Search courses, journeys, or topics..."
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-600">Searching...</div>
          ) : hasResults ? (
            <div className="p-2">
              {/* Journeys */}
              {results.journeys.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Learning Journeys
                  </h3>
                  {results.journeys.slice(0, 3).map((journey) => (
                    <Link
                      key={journey.id}
                      href={`/learning-journeys/${journey.slug}`}
                      onClick={clearSearch}
                      className="block px-3 py-2 hover:bg-gray-50 rounded-lg"
                    >
                      <p className="font-semibold text-gray-900 line-clamp-1">{journey.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{journey.description}</p>
                    </Link>
                  ))}
                </div>
              )}

              {/* Courses */}
              {results.courses.length > 0 && (
                <div>
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Courses
                  </h3>
                  {results.courses.slice(0, 5).map((course) => (
                    <Link
                      key={course.id}
                      href={`/course/${course.slug}`}
                      onClick={clearSearch}
                      className="block px-3 py-2 hover:bg-gray-50 rounded-lg"
                    >
                      <p className="font-semibold text-gray-900 line-clamp-1">{course.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
                    </Link>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={clearSearch}
                  className="block px-3 py-2 text-center text-primary-600 hover:bg-primary-50 rounded-lg font-semibold"
                >
                  View all results
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-600">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
