'use client'

import { useState, useEffect } from 'react'
import CourseCard from '@/components/courses/CourseCard'
import { generateMockCourses } from '@/lib/data'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useInView } from 'react-intersection-observer'

export default function CoursesPage() {
  const [courses, setCourses] = useState(generateMockCourses(30))
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const loadMoreCourses = () => {
    if (loading || !hasMore) return
    setLoading(true)
    
    setTimeout(() => {
      const newCourses = generateMockCourses(30)
      setCourses((prev) => [...prev, ...newCourses])
      setLoading(false)
      
      // Stop after reaching ~2000+ courses
      if (courses.length >= 2000) {
        setHasMore(false)
      }
    }, 1000)
  }

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreCourses()
    }
  }, [inView])

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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">All Courses</h1>
          <p className="text-xl text-gray-600">
            Explore 2000+ courses created by educators and community members
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <div ref={ref} className="py-8 text-center">
            {loading && (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading more courses...</span>
              </div>
            )}
          </div>
        )}

        {!hasMore && (
          <div className="py-8 text-center text-gray-600">
            You've reached the end of all courses!
          </div>
        )}
      </div>
    </div>
  )
}
