import { NextResponse } from 'next/server'
import { mockCourses, mockJourneys, generateMockCourses } from '@/lib/data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all' // 'all', 'courses', 'journeys'
  
  const results = {
    courses: [] as any[],
    journeys: [] as any[],
  }

  if (query) {
    const searchQuery = query.toLowerCase()

    // Search courses
    if (type === 'all' || type === 'courses') {
      const allCourses = [...mockCourses, ...generateMockCourses(50)]
      results.courses = allCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery) ||
          course.description.toLowerCase().includes(searchQuery) ||
          course.topics.some((topic) => topic.name.toLowerCase().includes(searchQuery))
      )
    }

    // Search journeys
    if (type === 'all' || type === 'journeys') {
      results.journeys = mockJourneys.filter(
        (journey) =>
          journey.title.toLowerCase().includes(searchQuery) ||
          journey.description.toLowerCase().includes(searchQuery)
      )
    }
  } else {
    // Return all if no query
    if (type === 'all' || type === 'courses') {
      results.courses = [...mockCourses, ...generateMockCourses(20)]
    }
    if (type === 'all' || type === 'journeys') {
      results.journeys = mockJourneys
    }
  }

  return NextResponse.json(results)
}
