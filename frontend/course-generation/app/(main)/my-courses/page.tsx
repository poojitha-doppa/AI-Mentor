'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { BookOpen, Calendar, Clock } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Enrollment {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string | null
  enrolled_at: string
  progress: number
  completed_at: string | null
  creator_name: string
}

export default function MyCoursesPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem('careersync_token')
        const response = await axios.get(`${API_URL}/courses/enrollments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          setEnrollments(response.data.data)
        }
      } catch (error: any) {
        console.error('Error fetching enrollments:', error)
        setError('Failed to load your courses')
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Courses</h1>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Courses</h1>
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Track your learning progress and continue where you left off</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No courses yet</h2>
            <p className="text-gray-600 mb-6">Start learning by enrolling in a course</p>
            <Link href="/courses" className="btn-primary inline-block">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/course/${enrollment.slug}`}
                className="card hover:shadow-lg transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {enrollment.thumbnail_url ? (
                    <img
                      src={enrollment.thumbnail_url}
                      alt={enrollment.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-white/80" />
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {enrollment.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {enrollment.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-primary-600">
                      {enrollment.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {enrollment.completed_at && (
                    <span className="text-green-600 font-semibold">✓ Completed</span>
                  )}
                </div>

                {enrollment.creator_name && (
                  <div className="mt-2 text-sm text-gray-600">
                    by {enrollment.creator_name}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
