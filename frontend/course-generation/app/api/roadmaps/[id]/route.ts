import { NextRequest, NextResponse } from 'next/server'
import { getRoadmapDeep } from '@/lib/db-queries'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await getRoadmapDeep(id)
    return NextResponse.json({ success: true, roadmap: data })
  } catch (error) {
    console.error('Fetch roadmap error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch roadmap' },
      { status: 500 }
    )
  }
}
