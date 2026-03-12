/**
 * Video Intelligence System
 * Selects best educational videos from YouTube for each course module
 * Uses multi-factor ranking: relevance, engagement, educational value, channel trust, and recency
 */

import { generateVideoEmbedding, computeCosineSimilarity } from '../utils/videoEmbeddings';

// Trusted educational channels (high-quality content creators)
const TRUSTED_CHANNELS = [
  'freeCodeCamp',
  'Traversy Media',
  'Codevolution',
  'Academind',
  'The Net Ninja',
  'Fireship',
  'Programming with Mosh',
  'Easy Languages',
  'Easy German',
  'Easy Italian',
  'Easy French',
  'Easy Spanish',
  'Easy Portuguese',
  'Easy Chinese',
  'Easy Japanese',
  'Easy Korean'
];

// Keywords that indicate educational content
const EDUCATIONAL_KEYWORDS = [
  'tutorial',
  'full course',
  'explained',
  'beginner',
  'step by step',
  'project',
  'complete',
  'for beginners',
  'crash course',
  'learn',
  'masterclass',
  'workshop',
  'guide'
];

// Keywords that indicate low-quality content (hard filters)
const REJECTED_KEYWORDS = [
  'shorts',
  'reaction',
  'vlog',
  'gaming',
  'remix',
  'clip',
  'music',
  'meme',
  'funny',
  'challenge'
];

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

interface ScoredVideo extends YouTubeVideo {
  relevanceScore: number;
  engagementScore: number;
  educationalScore: number;
  channelTrustScore: number;
  recencyScore: number;
  finalScore: number;
}

/**
 * Step 1: Generate optimized YouTube search query
 */
function generateVideoQuery(moduleTitle: string, courseTopic: string, moduleNum: number, totalModules: number): string {
  // Determine difficulty level
  const difficultyPercentage = (moduleNum / totalModules) * 100;
  let difficultyLevel = 'beginner';
  if (difficultyPercentage > 70) difficultyLevel = 'advanced';
  else if (difficultyPercentage > 30) difficultyLevel = 'intermediate';

  // Build query with course context and difficulty
  return `${moduleTitle} ${courseTopic} tutorial ${difficultyLevel}`;
}

/**
 * Step 2: Fetch videos from YouTube API
 */
async function fetchYouTubeVideos(query: string, maxResults: number = 15): Promise<YouTubeVideo[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error('[VIDEO INTELLIGENCE] YouTube API key not found');
      return [];
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(query)}&` +
      `type=video&` +
      `maxResults=${maxResults}&` +
      `order=relevance&` +
      `key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      console.error(`[VIDEO INTELLIGENCE] YouTube API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`[VIDEO FETCHED] Retrieved ${data.items?.length || 0} videos for query: "${query}"`);

    return data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    })) || [];
  } catch (error) {
    console.error('[VIDEO INTELLIGENCE] Fetch error:', error);
    return [];
  }
}

/**
 * Step 3: Get video statistics (views, likes, comments, duration)
 */
async function fetchVideoMetrics(videoId: string): Promise<Partial<YouTubeVideo>> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
    if (!apiKey) return {};

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics,contentDetails&` +
      `id=${videoId}&` +
      `key=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) return {};

    const data = await response.json();
    const video = data.items?.[0];

    if (!video) return {};

    // Parse duration (ISO 8601 format) to seconds
    const durationMatch = video.contentDetails?.duration?.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    let durationSeconds = 0;
    if (durationMatch) {
      if (durationMatch[1]) durationSeconds += parseInt(durationMatch[1]) * 3600;
      if (durationMatch[2]) durationSeconds += parseInt(durationMatch[2]) * 60;
      if (durationMatch[3]) durationSeconds += parseInt(durationMatch[3]);
    }

    return {
      duration: durationSeconds,
      viewCount: parseInt(video.statistics?.viewCount || '0'),
      likeCount: parseInt(video.statistics?.likeCount || '0'),
      commentCount: parseInt(video.statistics?.commentCount || '0')
    };
  } catch (error) {
    console.error('[VIDEO INTELLIGENCE] Metrics fetch error:', error);
    return {};
  }
}

/**
 * Step 4: Hard filter - reject low-quality videos
 */
function applyHardFilters(videos: YouTubeVideo[]): YouTubeVideo[] {
  const filtered = videos.filter(video => {
    const titleLower = video.title.toLowerCase();
    const descriptionLower = video.description.toLowerCase();

    // Filter 1: Minimum duration (4 minutes = 240 seconds)
    if (video.duration && video.duration < 240) {
      return false;
    }

    // Filter 2: Reject videos with low-quality keywords
    for (const keyword of REJECTED_KEYWORDS) {
      if (titleLower.includes(keyword) || descriptionLower.includes(keyword)) {
        return false;
      }
    }

    return true;
  });

  console.log(`[FILTERED VIDEOS] ${filtered.length}/${videos.length} passed hard filters`);
  return filtered;
}

/**
 * Step 5: Calculate engagement rate
 */
function calculateEngagementRate(video: YouTubeVideo): number {
  if (!video.viewCount || video.viewCount === 0) return 0;
  
  const engagement = (
    (video.likeCount || 0) +
    (video.commentCount || 0)
  ) / video.viewCount;

  return Math.min(engagement, 1); // Cap at 1 (100%)
}

/**
 * Step 6: Calculate educational score
 */
function calculateEducationalScore(video: YouTubeVideo): number {
  const titleLower = video.title.toLowerCase();
  const descriptionLower = video.description.toLowerCase();

  let score = 0;

  // Check for educational keywords
  for (const keyword of EDUCATIONAL_KEYWORDS) {
    if (titleLower.includes(keyword)) {
      score += 0.3; // Title weight: 30%
    } else if (descriptionLower.includes(keyword)) {
      score += 0.15; // Description weight: 15%
    }
  }

  return Math.min(score, 1); // Cap at 1 (100%)
}

/**
 * Step 7: Calculate channel trust score
 */
function calculateChannelTrustScore(video: YouTubeVideo): number {
  if (TRUSTED_CHANNELS.some(channel => video.channelTitle.toLowerCase().includes(channel.toLowerCase()))) {
    return 1.0; // 100% trust
  }
  return 0.0;
}

/**
 * Step 8: Calculate recency score
 */
function calculateRecencyScore(video: YouTubeVideo): number {
  const publishDate = new Date(video.publishedAt);
  const now = new Date();
  const ageInDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);

  // Videos from last 6 months = 1.0, older videos lower score
  const recencyScore = Math.max(0, 1 - (ageInDays / 180));
  return recencyScore;
}

/**
 * Step 9: Score all videos using multi-factor ranking
 */
async function scoreVideos(
  videos: YouTubeVideo[],
  moduleTitle: string
): Promise<ScoredVideo[]> {
  const scored: ScoredVideo[] = [];

  for (const video of videos) {
    // Get video metrics
    const metrics = await fetchVideoMetrics(video.videoId);
    const enhancedVideo = { ...video, ...metrics };

    // Calculate individual scores
    const engagementRate = calculateEngagementRate(enhancedVideo);
    const educationalScore = calculateEducationalScore(enhancedVideo);
    const channelTrustScore = calculateChannelTrustScore(enhancedVideo);
    const recencyScore = calculateRecencyScore(enhancedVideo);

    // AI-based relevance score using embeddings
    let relevanceScore = 0.8; // Default high score
    try {
      const moduleEmbedding = await generateVideoEmbedding(moduleTitle);
      const videoEmbedding = await generateVideoEmbedding(
        `${enhancedVideo.title} ${enhancedVideo.description}`
      );
      relevanceScore = computeCosineSimilarity(moduleEmbedding, videoEmbedding);
    } catch (error) {
      console.log('[VIDEO INTELLIGENCE] Embedding calculation skipped, using default relevance');
    }

    // Normalize engagement rate (0-1 scale, typical engagement is 0.001-0.05)
    const normalizedEngagement = Math.min(engagementRate * 50, 1);

    // Final weighted score
    const finalScore =
      (relevanceScore * 0.30) +
      (normalizedEngagement * 0.25) +
      (educationalScore * 0.20) +
      (channelTrustScore * 0.15) +
      (recencyScore * 0.10);

    scored.push({
      ...enhancedVideo,
      relevanceScore,
      engagementScore: normalizedEngagement,
      educationalScore,
      channelTrustScore,
      recencyScore,
      finalScore
    });
  }

  return scored;
}

/**
 * Main function: Get best videos for a module
 */
export async function getBestVideos(
  moduleTitle: string,
  courseTopic: string,
  moduleNum: number,
  totalModules: number,
  maxResults: number = 3
): Promise<YouTubeVideo[]> {
  console.log('[VIDEO INTELLIGENCE] Starting video selection process...');
  console.log(`[MODULE] "${moduleTitle}" (Module ${moduleNum}/${totalModules})`);

  try {
    // Step 1: Generate optimized query
    const query = generateVideoQuery(moduleTitle, courseTopic, moduleNum, totalModules);
    console.log(`[QUERY] ${query}`);

    // Step 2: Fetch videos from YouTube
    const videos = await fetchYouTubeVideos(query);
    if (videos.length === 0) {
      console.log('[VIDEO INTELLIGENCE] No videos found');
      return [];
    }

    // Step 3: Apply hard filters
    const filtered = applyHardFilters(videos);
    if (filtered.length === 0) {
      console.log('[VIDEO INTELLIGENCE] All videos filtered out, returning raw results');
      return videos.slice(0, maxResults);
    }

    // Step 4: Score all videos
    const scored = await scoreVideos(filtered, moduleTitle);

    // Step 5: Sort by final score and return top results
    const ranked = scored.sort((a, b) => b.finalScore - a.finalScore);
    const top = ranked.slice(0, maxResults);

    console.log(`[TOP VIDEOS SELECTED] ${top.length} videos selected`);
    console.log('[SCORING COMPLETE]');

    top.forEach((video, index) => {
      console.log(
        `[${index + 1}] ${video.title} (Score: ${(video.finalScore * 100).toFixed(1)}%) ` +
        `- ${video.channelTitle}`
      );
    });

    return top;
  } catch (error) {
    console.error('[VIDEO INTELLIGENCE] Error:', error);
    return [];
  }
}

/**
 * Get a single best video for a module (returns just one video)
 */
export async function getBestVideo(
  moduleTitle: string,
  courseTopic: string,
  moduleNum: number,
  totalModules: number
): Promise<YouTubeVideo | null> {
  const videos = await getBestVideos(moduleTitle, courseTopic, moduleNum, totalModules, 1);
  return videos.length > 0 ? videos[0] : null;
}
