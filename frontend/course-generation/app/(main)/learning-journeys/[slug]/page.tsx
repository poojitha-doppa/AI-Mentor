'use client'

import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, User as UserIcon } from 'lucide-react'
import { mockJourneys, mockCourses } from '@/lib/data'
import { format } from 'date-fns'

export default function JourneyDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const journey = mockJourneys.find((j) => j.slug === slug)

  if (!journey) {
    notFound()
  }

  // Get courses that belong to this journey
  const journeyCourses = mockCourses.filter((c) => c.journeyId === journey.id)
  // Get the first course's first topic for the "Start Learning" button
  const firstCourseFirstTopic = journeyCourses[0]?.topics?.[0]?.slug

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom">
          <Link
            href="/learning-journeys"
            className="inline-flex items-center space-x-2 text-primary-100 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Journeys</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{journey.title}</h1>
          {journey.subtitle && (
            <p className="text-xl text-primary-100 mb-6">{journey.subtitle}</p>
          )}


        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom py-12">
        <div className="space-y-8">
          {/* Description */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Journey</h2>
            <p className="text-gray-700 leading-relaxed">{journey.description}</p>
          </div>

          {/* Who is for / Who is not for */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journey.whoIsFor && (
              <div className="card bg-green-50 border-2 border-green-200">
                <h3 className="text-xl font-bold text-green-900 mb-3">✓ Who is this for?</h3>
                <p className="text-gray-700 leading-relaxed">{journey.whoIsFor}</p>
              </div>
            )}
            {journey.whoIsNotFor && (
              <div className="card bg-red-50 border-2 border-red-200">
                <h3 className="text-xl font-bold text-red-900 mb-3">✗ Who is this NOT for?</h3>
                <p className="text-gray-700 leading-relaxed">{journey.whoIsNotFor}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Start Learning Button - Bottom Section */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="container-custom">
          {firstCourseFirstTopic ? (
            <Link
              href={`/generate/${firstCourseFirstTopic}`}
              className="inline-block w-full sm:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-colors text-center"
            >
              Start Learning
            </Link>
          ) : (
            <button disabled className="w-full sm:w-auto px-12 py-4 bg-gray-400 text-white font-semibold text-lg rounded-lg cursor-not-allowed opacity-50">
              Start Learning
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
