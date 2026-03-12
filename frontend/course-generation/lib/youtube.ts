// YouTube API Service - Dynamic Video Fetching Only
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  url: string
  duration?: string
  channelTitle?: string
  viewCount?: string
}

// Light cache for very recent identical searches only (1-minute expiry)
const videoCache = new Map<string, { videos: YouTubeVideo[], timestamp: number }>()
const CACHE_EXPIRY_MS = 60000 // 1 minute

// Clear expired cache entries
const clearExpiredCache = () => {
  const now = Date.now()
  for (const [key, value] of videoCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRY_MS) {
      videoCache.delete(key)
    }
  }
}

// Premium educational YouTube channels for quality filtering
const EDUCATIONAL_CHANNELS = {
  'freeCodeCamp.org': 'UC8butISFwT-Wl7EV0hUK0BQ',
  'Traversy Media': 'UC29ju8bIPH5as8OGnQzwJyA',
  'Programming with Mosh': 'UCWv7vMbMWH4-V0ZXdmDpPBA',
  'Academind': 'UCSJbGtTlrDami-tDGPUV9-w',
  'The Net Ninja': 'UCW5YeuERMmlnqo4oq8vwUpg',
  'CS Dojo': 'UCxX9wt5FWQUAAz4UrysqK9A',
  'Corey Schafer': 'UCCezIgC97PvUuR4_gbFUs5g',
  'Web Dev Simplified': 'UCFbNIlppjREEEM2I-UtNTow',
  'Fireship': 'UCsBjURrPoezykLs9EqgamOA',
  'Kevin Powell': 'UCJZV4d49DLaatr_39WNyoo',
  'Tech With Tim': 'UCBJycsmduvVTj7vLKQi6eQg',
  'sentdex': 'UCfV36TX5AejfAGIbtwTc8Zw',
  'Real Python': 'UCWiUlWVzBro0tzAaVklKBtQ',
}

// Helper function to extract core concepts from module title
export function extractCoreConceptsFromModule(moduleTitle: string): string[] {
  // Remove "Module X:" prefix
  let cleanTitle = moduleTitle.replace(/^Module\s+\d+[:\s]+/i, '').trim()
  
  // Split by common separators and filter
  const concepts = cleanTitle
    .split(/[,&]/i)
    .map(c => c.trim())
    .filter(c => c.length > 0)
  
  return concepts
}

// Build smart search query based on module topic and difficulty
function buildSearchQuery(topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): string {
  // Remove "Module X:" prefix if present
  let cleanTopic = topic.replace(/^Module\s+\d+[:\s]+/i, '').trim()
  const topicLower = cleanTopic.toLowerCase()
  
  // Extract ALL specific concepts from module title (split by commas, 'and', '&')
  const concepts = topicLower
    .split(/[,;&]/)
    .map(s => s.replace(/\band\b/gi, '').trim())
    .filter(s => s.length > 3) // Filter out very short words
  
  // Difficulty-based keywords
  const difficultyKeywords = {
    beginner: ['tutorial', 'introduction', 'for beginners', 'basics', 'fundamentals'],
    intermediate: ['complete guide', 'course', 'explained', 'practical'],
    advanced: ['advanced', 'deep dive', 'expert', 'masterclass', 'production']
  }
  
  // Pick a keyword based on difficulty
  const keywords = difficultyKeywords[difficulty]
  const keyword = keywords[Math.floor(Math.random() * keywords.length)]
  
  // Build highly specific query:
  // Use first 2 concepts if available for better specificity
  if (concepts.length >= 2) {
    return `${concepts[0]} ${concepts[1]} ${keyword}`
  } else if (concepts.length === 1) {
    return `${concepts[0]} ${keyword} tutorial`
  } else {
    return `${cleanTopic} ${keyword}`
  }
}

// Main search function - relies entirely on YouTube API
export async function searchYouTubeVideos(
  topic: string,
  maxResults: number = 3,
  searchType: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<YouTubeVideo[]> {
  // Clear expired cache entries
  clearExpiredCache()
  
  // Check cache first (only if recent)
  const cacheKey = `${topic}_${maxResults}_${searchType}`
  const cached = videoCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
    console.log('📦 Using cached videos (fresh) for:', topic)
    return cached.videos
  }

  // Check if API key is configured
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
    const errorMsg = '❌ YouTube API key not configured. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in .env.local'
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
  
  console.log('🔍 Fetching FRESH videos from YouTube API for:', topic)

  try {
    console.log('🔍 Fetching from YouTube API for:', topic)
    const searchQuery = buildSearchQuery(topic, searchType)
    console.log('🔎 Search query:', searchQuery)

    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(
        searchQuery
      )}&maxResults=${maxResults * 3}&type=video&videoDuration=medium&videoEmbeddable=true&order=relevance&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const statusText = response.statusText
      const errorMsg = `YouTube API error: ${response.status} ${statusText}`
      console.error('❌', errorMsg)
      throw new Error(errorMsg)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      throw new Error('No videos found for: ' + topic)
    }

    // Filter videos for quality and relevance
    const filteredVideos: YouTubeVideo[] = data.items
      .filter((item: any) => {
        const title = item.snippet.title.toLowerCase()
        const description = (item.snippet.description || '').toLowerCase()
        const topicKeywords = extractCoreConceptsFromModule(topic).map(c => c.toLowerCase())
        
        // EXCLUDE low-quality content patterns
        const excludePatterns = ['shorts', 'highlight', 'clip', 'reaction', 'vlog', 'gaming', 'music', 'remix', 'live stream', 'compilation', 'funny']
        const shouldExclude = excludePatterns.some(pattern => title.includes(pattern))
        
        if (shouldExclude) return false
        
        // Check if video is related to the module topic
        const hasTopicMatch = topicKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        )
        
        // PREFER quality indicators
        const qualityIndicators = ['tutorial', 'complete', 'full course', 'lesson', 'learn', 'guide', 'course', 'programming']
        const hasQualityIndicator = qualityIndicators.some(indicator => 
          title.includes(indicator) || description.includes(indicator)
        )
        
        // Accept if: has topic match AND has quality indicator
        return hasTopicMatch && hasQualityIndicator
      })
      .slice(0, maxResults)
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/embed/${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle,
      }))

    if (filteredVideos.length > 0) {
      console.log(`✅ Found ${filteredVideos.length} unique videos for: "${topic}"`)
      console.log(`📹 Videos:`, filteredVideos.map(v => v.title.substring(0, 50)).join(', '))
      videoCache.set(cacheKey, { videos: filteredVideos, timestamp: Date.now() })
      return filteredVideos
    }

    // Fallback: use results without strict filtering but still avoid obvious low-quality
    const relaxedResults: YouTubeVideo[] = data.items
      .filter((item: any) => {
        const title = item.snippet.title.toLowerCase()
        const excludePatterns = ['shorts', 'clip', 'reaction']
        return !excludePatterns.some(pattern => title.includes(pattern))
      })
      .slice(0, maxResults)
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/embed/${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle,
      }))

    if (relaxedResults.length > 0) {
      console.log(`✅ Found ${relaxedResults.length} videos (relaxed filtering) for: "${topic}"`)
      console.log(`📹 Videos:`, relaxedResults.map(v => v.title.substring(0, 50)).join(', '))
      videoCache.set(cacheKey, { videos: relaxedResults, timestamp: Date.now() })
      return relaxedResults
    }

    throw new Error('No suitable videos found after filtering')
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ YouTube API error:', errorMsg)
    throw error
  }
}

// Get first video for a topic
export async function getYouTubeVideoForTopic(
  topic: string, 
  moduleNum: number = 1,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<YouTubeVideo | null> {
  try {
    const videos = await searchYouTubeVideos(topic, 1, difficulty)
    return videos.length > 0 ? videos[0] : null
  } catch (error) {
    console.error('Error getting YouTube video for topic:', error)
    return null
  }
}

// Get multiple videos for a specific module topic
export async function getYouTubeVideosForModule(
  moduleTopic: string,
  courseTitle?: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<YouTubeVideo[]> {
  // Search for module-specific topic (more accurate than course + module)
  return searchYouTubeVideos(moduleTopic, 3, difficulty)
}
