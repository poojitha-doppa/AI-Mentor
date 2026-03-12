import { NextRequest, NextResponse } from 'next/server'
import { saveGeneratedCourse } from '@/lib/db-queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== SAVE COURSE REQUEST ===')
    console.log('Body:', JSON.stringify(body, null, 2))

    const course = body.course || body
    const userId = body.userId || null
    const userEmail = body.userEmail || null

    if (!course?.title) {
      console.error('Missing course title')
      return NextResponse.json({ error: 'Missing course title' }, { status: 400 })
    }

    console.log('Attempting to save course:', course.title)
    console.log('With userId:', userId, 'userEmail:', userEmail)
    const { courseId } = await saveGeneratedCourse(course, userId)
    
    console.log('Course saved successfully:', courseId)
    return NextResponse.json({ success: true, courseId })
  } catch (error) {
    console.error('Save course error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to save course'
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    )
  }
}
