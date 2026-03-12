import { NextRequest, NextResponse } from 'next/server'
import { createRoadmap } from '@/lib/db-queries'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const { roadmapId } = await createRoadmap(payload)
    return NextResponse.json({ success: true, roadmapId })
  } catch (error) {
    console.error('Create roadmap error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create roadmap' },
      { status: 500 }
    )
  }
}
