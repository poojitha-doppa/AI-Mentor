/**
 * Production Course Generation Endpoint
 * POST /api/generate-course-v2
 * 
 * This endpoint uses the refactored modular services:
 * - Title Generator
 * - Curriculum Validator (semantic deduplication)
 * - Module Expander
 * - Content Intelligence
 * - Resource Resolver
 * - Enrichment Queue (async)
 */

import express from 'express'

const router = express.Router()

// Import services
import { generateCourse } from '../services/generationOrchestrator.ts'

/**
 * Extract difficulty level from user answers
 */
function extractDifficulty(experienceAnswer) {
  if (!experienceAnswer) return 'intermediate'

  const lower = experienceAnswer.toLowerCase()
  if (lower.includes('beginner') || lower.includes('novice') || lower.includes('new'))
    return 'beginner'
  if (lower.includes('advanced') || lower.includes('expert') || lower.includes('professional'))
    return 'advanced'
  return 'intermediate'
}

/**
 * Calculate module count based on timeline and difficulty
 */
function calculateModuleCount(timeline, difficulty) {
  if (!timeline) return 10

  const lower = timeline.toLowerCase()

  // Extract number from timeline (e.g., "2 weeks" → 2)
  const match = lower.match(/(\d+)\s*(week|month|day|hour)?/)
  const amount = match ? parseInt(match[1], 10) : 4

  // Map timeline to module count
  if (lower.includes('week')) {
    if (difficulty === 'beginner') return Math.max(5, amount * 2)
    if (difficulty === 'advanced') return amount * 3
    return Math.max(8, amount * 2 + 2)
  }

  if (lower.includes('month')) {
    if (difficulty === 'beginner') return Math.max(5, amount * 6)
    if (difficulty === 'advanced') return Math.max(15, amount * 7)
    return Math.max(10, amount * 6 + 2)
  }

  if (lower.includes('day')) {
    if (difficulty === 'beginner') return Math.min(5, Math.ceil(amount / 1.5))
    if (difficulty === 'advanced') return Math.ceil(amount * 2)
    return Math.ceil(amount * 1.5)
  }

  // Default based on difficulty
  return difficulty === 'beginner' ? 8 : difficulty === 'advanced' ? 15 : 10
}

/**
 * POST /api/generate-course-v2
 * Generate course using refactored modular services
 */
router.post('/generate-course-v2', async (req, res) => {
  try {
    const { topic, answers } = req.body

    console.log('🚀 PRODUCTION COURSE GENERATION REQUEST')
    console.log('Topic:', topic)
    console.log('Answers:', Object.keys(answers || {}).length, 'provided')

    // Validate required parameters
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        error: 'Topic is required',
      })
    }

    // Validate API keys
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const youtubeKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY
    const redisUrl = process.env.REDIS_URL

    if (!openrouterKey) {
      console.error('❌ OPENROUTER_API_KEY not configured')
      return res.status(500).json({
        error: 'OpenRouter API key is required for course generation',
      })
    }

    if (!youtubeKey) {
      console.warn('⚠️  YOUTUBE_API_KEY not configured, video enrichment will use fallbacks')
    }

    if (!redisUrl) {
      console.warn('⚠️  REDIS_URL not configured, enrichment will run synchronously')
    }

    // Extract user preferences from answers
    const experience = extractDifficulty(answers?.[3])
    const timelineText = answers?.[6] || '1 month'
    const numModules = calculateModuleCount(timelineText, experience)

    console.log(`📊 Course parameters:`)
    console.log(`   Difficulty: ${experience}`)
    console.log(`   Module count: ${numModules}`)
    console.log(`   Timeline: ${timelineText}`)

    // Generate course using orchestrator
    const startTime = Date.now()
    const generatedCourse = await generateCourse({
      topic,
      numModules,
      difficulty: experience,
    })
    const generationTime = Date.now() - startTime

    console.log(`✅ Course generated in ${(generationTime / 1000).toFixed(1)}s`)
    console.log(`   Course ID: ${generatedCourse.id}`)
    console.log(`   Enrichment Job: ${generatedCourse.enrichmentJobId}`)
    console.log(`   Status: ${generatedCourse.status}`)

    // Return base course immediately
    res.json({
      success: true,
      course: generatedCourse,
      meta: {
        topic,
        userName: answers?.[1] || 'Student',
        generationTimeMs: generationTime,
        enrichmentJobId: generatedCourse.enrichmentJobId,
        enrichmentStatus: generatedCourse.enrichmentJobId 
          ? `Poll /api/enrich/status/${generatedCourse.enrichmentJobId} for progress`
          : 'Enrichment not available (no Redis)',
      },
    })
  } catch (error) {
    console.error('❌ Course generation failed:', error)
    res.status(500).json({
      error: 'Course generation failed',
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
})

/**
 * GET /api/enrich/status/:jobId
 * Check enrichment progress
 */
router.get('/enrich/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params

    if (!jobId) {
      return res.status(400).json({
        error: 'Job ID is required',
      })
    }

    console.log(`📊 Checking enrichment status for job: ${jobId}`)

    // Import getEnrichmentProgress dynamically to avoid loading queue dependencies at startup
    const { getEnrichmentProgress } = await import(
      '../workers/enrichmentOrchestrator.js'
    )

    const progress = await getEnrichmentProgress(jobId)

    res.json({
      jobId,
      ...progress,
    })
  } catch (error) {
    console.error('Error fetching enrichment status:', error)
    res.status(500).json({
      error: 'Failed to fetch enrichment status',
      details: error.message || 'Unknown error',
    })
  }
})

export default router
