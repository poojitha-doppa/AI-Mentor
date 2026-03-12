'use client'

import { notFound, useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User as UserIcon, BookOpen } from 'lucide-react'
import { mockCourses, mockJourneys } from '@/lib/data'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function CourseDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(true)
  
  const course = mockCourses.find((c) => c.slug === slug)

  if (!course) {
    notFound()
  }

  // Check enrollment status on mount
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!isAuthenticated || !user) {
        setCheckingEnrollment(false)
        return
      }

      try {
        const token = localStorage.getItem('careersync_token')
        const response = await axios.get(
          `${API_URL}/courses/${course.id}/enrollment/check`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (response.data.success && response.data.data.isEnrolled) {
          setEnrolled(true)
        }
      } catch (error) {
        console.error('Error checking enrollment:', error)
      } finally {
        setCheckingEnrollment(false)
      }
    }

    checkEnrollmentStatus()
  }, [isAuthenticated, user, course.id])

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('careersync_token')
      const response = await axios.post(
        `${API_URL}/courses/${course.id}/enroll`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data.success) {
        setEnrolled(true)
        alert(`Successfully enrolled in ${course.title}! You can now access all lessons.`)
      }
    } catch (error: any) {
      console.error('Enrollment error:', error)
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else {
        alert('Failed to enroll. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    alert('Added to wishlist!')
  }

  // Get parent journey if exists
  const parentJourney = course.journeyId
    ? mockJourneys.find((j) => j.id === course.journeyId)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container-custom">
          <Link
            href="/courses"
            className="inline-flex items-center space-x-2 text-blue-100 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Courses</span>
          </Link>

          {parentJourney && (
            <div className="mb-4">
              <Link
                href={`/learning-journeys/${parentJourney.slug}`}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Part of: {parentJourney.title}</span>
              </Link>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Published {format(new Date(course.publishedDate), 'do MMM, yyyy')}</span>
            </div>
            {course.creator && (
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>by {course.creator.name}</span>
              </div>
            )}
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-2 mt-6">
            {course.topics.map((topic) => (
              <span
                key={topic.id}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium backdrop-blur-sm"
              >
                {topic.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{course.description}</p>
            </div>

            {/* What You'll Learn */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-xl">✓</span>
                  <span className="text-gray-700">Master the fundamentals and advanced concepts</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-xl">✓</span>
                  <span className="text-gray-700">Build real-world projects from scratch</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-xl">✓</span>
                  <span className="text-gray-700">Learn industry best practices and patterns</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-xl">✓</span>
                  <span className="text-gray-700">Get hands-on experience with practical exercises</span>
                </li>
              </ul>
            </div>

            {/* Course Curriculum */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <h3 className="font-semibold text-gray-900">1. Introduction and Setup</h3>
                  <p className="text-sm text-gray-600 mt-1">5 lessons • 45 min</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <h3 className="font-semibold text-gray-900">2. Core Concepts</h3>
                  <p className="text-sm text-gray-600 mt-1">8 lessons • 2 hours</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <h3 className="font-semibold text-gray-900">3. Advanced Topics</h3>
                  <p className="text-sm text-gray-600 mt-1">10 lessons • 3 hours</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <h3 className="font-semibold text-gray-900">4. Real-World Projects</h3>
                  <p className="text-sm text-gray-600 mt-1">6 lessons • 4 hours</p>
                </div>
              </div>
            </div>

            {/* Instructor */}
            {course.creator && (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructor</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {course.creator.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{course.creator.name}</h3>
                    <p className="text-gray-600">Professional Educator</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Enroll in Course</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">10 hours</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lessons</span>
                  <span className="font-semibold">29</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold">All Levels</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Language</span>
                  <span className="font-semibold">English</span>
                </div>
              </div>

              <button 
                onClick={handleEnroll}
                disabled={enrolled || loading || checkingEnrollment}
                className="w-full btn-primary mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingEnrollment ? 'Checking...' : loading ? 'Enrolling...' : enrolled ? 'Enrolled ✓' : 'Enroll Now'}
              </button>
              
              <button 
                onClick={handleAddToWishlist}
                className="w-full btn-outline text-sm"
              >
                Add to Wishlist
              </button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">This course includes:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Lifetime access</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Downloadable resources</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
