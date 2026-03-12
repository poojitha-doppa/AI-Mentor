'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchBar from '@/components/search/SearchBar'
import CourseCard from '@/components/courses/CourseCard'
import JourneyCard from '@/components/journeys/JourneyCard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Course, LearningJourney } from '@/types'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState<{
    courses: Course[]
    journeys: LearningJourney[]
  }>({
    courses: [],
    journeys: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalResults = results.courses.length + results.journeys.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-12">
        <Link
          href="/home"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Search Results</h1>
          <SearchBar className="max-w-2xl" />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Searching...</p>
          </div>
        ) : query ? (
          <div>
            <p className="text-gray-600 mb-8">
              {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>

            {/* Learning Journeys */}
            {results.journeys.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Learning Journeys ({results.journeys.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.journeys.map((journey) => (
                    <JourneyCard key={journey.id} journey={journey} />
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {results.courses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Courses ({results.courses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">
                  No results found for "{query}"
                </p>
                <p className="text-gray-500">
                  Try adjusting your search or browse our course catalog
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Enter a search term to find courses and learning journeys
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
