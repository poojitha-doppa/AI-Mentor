/**
 * Enrichment Queue Setup
 * Uses BullMQ + Redis for async video and resource enrichment
 */

import { Queue, Worker, QueueEvents } from 'bullmq'
import Redis from 'ioredis'

const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10)
const REDIS_PASSWORD = process.env.REDIS_PASSWORD

// Redis connection options
const redisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: false,
}

// Create Redis connection
let redisConnection: Redis | null = null

export function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis(redisOptions)
    redisConnection.on('connect', () => console.log('✅ Redis connected'))
    redisConnection.on('error', err => console.error('❌ Redis error:', err))
  }
  return redisConnection
}

// Define job data interfaces
export interface EnrichmentJobData {
  courseId: string
  modules: Array<{
    id: number
    title: string
    youtubeSearch: string
  }>
  topic: string
  difficulty: string
}

export interface VideoJobData {
  moduleId: number
  moduleTitle: string
  youtubeSearch: string
  topic: string
  difficulty: string
}

export interface ResourceJobData {
  moduleId: number
  moduleTitle: string
  topic: string
  difficulty: string
}

// Create queues
export const enrichmentQueue = new Queue<EnrichmentJobData>('enrichment', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

export const videoQueue = new Queue<VideoJobData>('videos', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})

export const resourceQueue = new Queue<ResourceJobData>('resources', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

// Queue events
const enrichmentEvents = new QueueEvents('enrichment', { connection: getRedisConnection() })
const videoEvents = new QueueEvents('videos', { connection: getRedisConnection() })
const resourceEvents = new QueueEvents('resources', { connection: getRedisConnection() })

enrichmentEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Enrichment job ${jobId} completed`)
})

enrichmentEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Enrichment job ${jobId} failed: ${failedReason}`)
})

videoEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Video job ${jobId} completed`)
})

videoEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Video job ${jobId} failed: ${failedReason}`)
})

/**
 * Add enrichment job to queue
 */
export async function queueEnrichmentJob(data: EnrichmentJobData): Promise<string> {
  try {
    const job = await enrichmentQueue.add(
      'enrich-course',
      data,
      {
        jobId: `enrich-${data.courseId}-${Date.now()}`,
        priority: 10,
      }
    )

    console.log(`📌 Queued enrichment job: ${job.id}`)
    return job.id
  } catch (error) {
    console.error('Failed to queue enrichment job:', error)
    throw error
  }
}

/**
 * Add video fetching job to queue
 */
export async function queueVideoJob(data: VideoJobData): Promise<string> {
  try {
    const job = await videoQueue.add(
      'fetch-videos',
      data,
      {
        jobId: `video-${data.moduleId}-${Date.now()}`,
      }
    )

    console.log(`🎬 Queued video job: ${job.id}`)
    return job.id
  } catch (error) {
    console.error('Failed to queue video job:', error)
    throw error
  }
}

/**
 * Add resource resolution job to queue
 */
export async function queueResourceJob(data: ResourceJobData): Promise<string> {
  try {
    const job = await resourceQueue.add(
      'resolve-resources',
      data,
      {
        jobId: `resource-${data.moduleId}-${Date.now()}`,
      }
    )

    console.log(`📚 Queued resource job: ${job.id}`)
    return job.id
  } catch (error) {
    console.error('Failed to queue resource job:', error)
    throw error
  }
}

/**
 * Get job status
 */
export async function getJobStatus(queueName: string, jobId: string) {
  const queue =
    queueName === 'enrichment'
      ? enrichmentQueue
      : queueName === 'videos'
      ? videoQueue
      : resourceQueue

  const job = await queue.getJob(jobId)
  if (!job) return null

  return {
    id: job.id,
    status: await job.getState(),
    progress: job.progress(),
    attempts: job.attemptsMade,
    maxAttempts: job.opts.attempts,
  }
}

/**
 * Initialize queue listeners (call on app startup)
 */
export async function initializeQueues() {
  console.log('🚀 Initializing enrichment queues...')

  try {
    // Check Redis connection
    const redis = getRedisConnection()
    await redis.ping()
    console.log('✅ Redis connection verified')

    // Get queue stats
    const enrichCount = await enrichmentQueue.count()
    const videoCount = await videoQueue.count()
    const resourceCount = await resourceQueue.count()

    console.log(`📊 Queue stats:`)
    console.log(`   Enrichment: ${enrichCount}`)
    console.log(`   Videos: ${videoCount}`)
    console.log(`   Resources: ${resourceCount}`)
  } catch (error) {
    console.error('Failed to initialize queues:', error)
    throw error
  }
}

/**
 * Graceful shutdown
 */
export async function closeQueues() {
  console.log('🛑 Closing queue connections...')
  try {
    await enrichmentQueue.close()
    await videoQueue.close()
    await resourceQueue.close()
    if (redisConnection) {
      await redisConnection.quit()
    }
    console.log('✅ Queues closed')
  } catch (error) {
    console.error('Error closing queues:', error)
  }
}
