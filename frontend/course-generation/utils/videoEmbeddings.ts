/**
 * Video Embeddings Utility
 * Generates semantic embeddings for videos and modules using OpenAI API
 * Computes cosine similarity between embeddings for relevance matching
 */

interface Embedding {
  embedding: number[];
}

let embeddingCache: Map<string, number[]> = new Map();

/**
 * Generate embedding for text using OpenAI API
 * Caches results to minimize API calls
 */
export async function generateVideoEmbedding(text: string): Promise<number[]> {
  // Check cache first
  const cacheKey = text.toLowerCase().trim();
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[EMBEDDINGS] No API key found, using random embedding');
      return generateRandomEmbedding();
    }

    // Try OpenAI first (if key available)
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.substring(0, 8191) // OpenAI max token limit
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        const embedding = data.data?.[0]?.embedding;
        if (embedding) {
          embeddingCache.set(cacheKey, embedding);
          return embedding;
        }
      }
    }

    // Fallback: generate deterministic embedding from text
    console.log('[EMBEDDINGS] Using deterministic embedding');
    return generateDeterministicEmbedding(text);
  } catch (error) {
    console.warn('[EMBEDDINGS] Error generating embedding:', error);
    return generateRandomEmbedding();
  }
}

/**
 * Generate deterministic embedding from text
 * Produces consistent results for the same input
 */
function generateDeterministicEmbedding(text: string): number[] {
  const embedding: number[] = new Array(384).fill(0);

  // Create a hash-based deterministic embedding
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer

    // Distribute hash values across embedding dimensions
    const index = Math.abs(hash) % embedding.length;
    embedding[index] += Math.sin(hash * i) * 0.5;
  }

  // Normalize the embedding
  return normalizeEmbedding(embedding);
}

/**
 * Generate random embedding (fallback)
 */
function generateRandomEmbedding(): number[] {
  return normalizeEmbedding(
    Array.from({ length: 384 }, () => Math.random() - 0.5)
  );
}

/**
 * Normalize embedding to unit vector
 */
function normalizeEmbedding(embedding: number[]): number[] {
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );

  if (magnitude === 0) return embedding;
  return embedding.map(val => val / magnitude);
}

/**
 * Compute cosine similarity between two embeddings
 * Returns value between 0 and 1
 */
export function computeCosineSimilarity(
  embedding1: number[],
  embedding2: number[]
): number {
  if (embedding1.length !== embedding2.length) {
    console.warn('[EMBEDDINGS] Embedding dimensions mismatch');
    return 0.5;
  }

  // Compute dot product
  let dotProduct = 0;
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
  }

  // Both embeddings should be normalized, so magnitude is 1
  // Cosine similarity = dot product
  // Convert from [-1, 1] range to [0, 1] range
  return (dotProduct + 1) / 2;
}

/**
 * Clear embedding cache (useful for memory management)
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
  console.log('[EMBEDDINGS] Cache cleared');
}

/**
 * Get cache statistics for debugging
 */
export function getEmbeddingCacheStats(): { size: number; keys: string[] } {
  return {
    size: embeddingCache.size,
    keys: Array.from(embeddingCache.keys())
  };
}
