import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Fetch real progress from backend
    const response = await fetch(`${BACKEND_API}/profile/progress/course/${params.courseId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch progress')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching progress:', error)
    // Return default progress if backend fails
    return NextResponse.json({
      success: true,
      courseId: params.courseId,
      overallProgress: 0,
      totalTopics: 0,
      completedTopics: 0,
      topicProgress: [],
    })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await request.json()
    
    // Save progress to backend
    const response = await fetch(`${BACKEND_API}/profile/progress/course/${params.courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
