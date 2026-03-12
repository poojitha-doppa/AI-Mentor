# Integration Guide: Testing the Refactored Course Generation System

## Prerequisites

### 1. Environment Variables (`.env.local` in Next.js frontend)

```env
# Required for LLM generation
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Required for video enrichment (optional but recommended)
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSy-your-key-here

# Required for embeddings (semantic deduplication)
OPENAI_API_KEY=sk-your-openai-key-here

# Required for async processing (optional - will fallback to in-memory if not set)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your-password (if protected)
```

### 2. Dependencies Installed

Already completed ✅:
```bash
cd backend/main-app
npm install bullmq ioredis openai
```

## Testing Steps

### Step 1: Test with Mock Data (No External APIs)

The system has fallbacks that work without external APIs:

1. **Test Similarity Functions** (pure JavaScript, no APIs):
   - Location: `backend/services/utils/similarity.ts`
   - Tests: Cosine similarity, clustering, vector averaging
   - No API keys needed ✅

2. **Test Schema Validation** (pure JavaScript):
   - Location: `backend/services/utils/schemaValidation.ts`
   - Validates module structure, sanitizes data
   - No API keys needed ✅

3. **Test Ranking Algorithm** (pure JavaScript):
   - Location: `backend/services/utils/ranking.ts`
   - 5-factor video scoring
   - No API keys needed ✅

### Step 2: Test Content Intelligence (No API needed)

```typescript
// This works without any API calls:
const queries = await generateSearchQueries(
  'JavaScript',
  'JavaScript Variables and Data Types',
  'beginner'
)
// Returns: { primary, secondary, tertiary } search queries
```

Location: `backend/services/contentIntelligence.ts`

### Step 3: Test Resource Resolver (No API needed)

```typescript
// This uses keyword matching and fallback URLs:
const resources = await resourceResolver.resolveResources(
  'JavaScript Variables',
  'JavaScript',
  'beginner'
)
// Returns: Array of resource links (MDN, GeeksforGeeks, etc.)
```

Location: `backend/services/resourceResolver.ts`

### Step 4: Test Full Generation (Requires OPENROUTER_API_KEY)

#### Option A: Using the Refactored Route

1. **Backup the old route** (if you want to keep it):
   ```bash
   cd frontend/course-generation/app/api/generate-course
   cp route.ts route-old.ts
   ```

2. **Replace with refactored version**:
   ```bash
   # Copy the new implementation
   cp route-refactored.ts route.ts
   ```

3. **Start Next.js dev server**:
   ```bash
   cd frontend/course-generation
   npm run dev
   ```

4. **Test the endpoint**:
   - Navigate to: `http://localhost:3000/generate/javascript`
   - Fill out the questionnaire
   - Submit answers
   - Watch console logs for progress

Expected flow:
```
🚀 REFACTORED COURSE GENERATION REQUEST
Topic: JavaScript

📊 Course parameters:
   Difficulty: intermediate
   Module count: 10
   Timeline: 1 month

🚀 Starting course generation for: JavaScript
📝 Step 1: Generating 10 module titles... (1-2s)
✅ Generated titles in XXXXms

🔍 Step 2: Validating curriculum... (2-3s)
✅ Curriculum validated in XXXXms

📚 Step 3: Expanding 10 modules... (5-8s)
✅ Modules expanded in XXXXms

✅ Base course generated in ~12s total
📌 Queuing background enrichment...
✅ Enrichment queued

🎉 Course generation complete!
```

#### Option B: Test with Curl

```bash
curl -X POST http://localhost:3000/api/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "JavaScript",
    "answers": {
      "1": "John",
      "2": "Build projects",
      "3": "Intermediate",
      "4": "2-3 hours",
      "5": "Mixed",
      "6": "1 month",
      "7": ["Projects", "Best practices"],
      "8": "Real-world projects",
      "9": "Quizzes",
      "10": "Focus on async patterns"
    }
  }'
```

### Step 5: Test Enrichment Polling (Optional - Requires Redis)

If you have Redis running:

```bash
# Start Redis (if not running)
docker run -d -p 6379:6379 redis:latest

# Or local Redis
redis-server
```

Then test enrichment polling:

```bash
# Get the enrichmentJobId from Step 4 response
curl http://localhost:3000/api/enrich/status/enrich-123-456789
```

Expected response:
```json
{
  "jobId": "enrich-123-456789",
  "status": "in-progress",
  "progress": {
    "totalModules": 10,
    "videosCompleted": 7,
    "resourcesCompleted": 8
  },
  "message": "Enrichment in progress: 75%"
}
```

## Testing Without Redis

If you don't have Redis, the system will still work:
- Base course generation: ✅ Works (returns course immediately)
- Enrichment queueing: ⚠️ Skipped (logs warning)
- Video/resource enrichment: ⚠️ Not async (would need manual trigger)

**Fallback behavior:**
```typescript
// In generationOrchestrator.ts
if (!redisUrl) {
  console.warn('⚠️  REDIS_URL not configured, enrichment skipped')
  // Returns base course with youtubeSearch queries and resource URLs
}
```

## Verification Checklist

### ✅ Services Work Independently

- [ ] Similarity functions calculate cosine similarity correctly
- [ ] Schema validation catches invalid modules
- [ ] Ranking algorithm scores videos by 5 factors
- [ ] Content intelligence generates 3 query types
- [ ] Resource resolver returns curated links

### ✅ Integration Works

- [ ] Title generation calls OpenRouter LLM
- [ ] Curriculum validator deduplicates semantically similar titles
- [ ] Module expander creates full module structures
- [ ] Generation orchestrator coordinates all services
- [ ] API route returns base course in <15s

### ✅ Enrichment Works (If Redis available)

- [ ] Enrichment job queued successfully
- [ ] Video worker fetches YouTube videos
- [ ] Resource worker resolves learning materials
- [ ] Progress polling returns real-time status
- [ ] Final enriched data cached in Redis

## Common Issues & Solutions

### Issue 1: "OPENROUTER_API_KEY not configured"
**Solution:** Add to `.env.local` in `frontend/course-generation/`

### Issue 2: "Module 'similarity' not found"
**Solution:** Services are TypeScript, Next.js compiles them automatically. No manual compilation needed.

### Issue 3: "Redis connection failed"
**Solution:** Either:
1. Install and start Redis
2. Or continue without Redis (enrichment will be skipped)

### Issue 4: "YouTube API quota exceeded"
**Solution:** System will use mock videos as fallback. Check console for fallback message.

### Issue 5: "OpenAI embeddings failed"
**Solution:** System will use deterministic mock embeddings (slower but works).

## File Locations Reference

### Backend Services
```
backend/main-app/backend/
├── services/
│   ├── utils/
│   │   ├── embeddings.ts          ✅ Ready
│   │   ├── similarity.ts          ✅ Ready
│   │   ├── ranking.ts             ✅ Ready
│   │   └── schemaValidation.ts   ✅ Ready
│   ├── titleGenerator.ts          ✅ Ready
│   ├── curriculumValidator.ts     ✅ Ready
│   ├── moduleExpander.ts          ✅ Ready
│   ├── contentIntelligence.ts     ✅ Ready
│   ├── resourceResolver.ts        ✅ Ready
│   └── generationOrchestrator.ts  ✅ Ready
├── queues/
│   └── enrichmentQueue.ts         ✅ Ready
└── workers/
    ├── videoWorker.ts              ✅ Ready
    ├── resourceWorker.ts           ✅ Ready
    └── enrichmentOrchestrator.ts   ✅ Ready
```

### Frontend API Routes
```
frontend/course-generation/app/api/
├── generate-course/
│   ├── route.ts             ⚠️  (old monolithic - BACKUP THIS)
│   └── route-refactored.ts  ✅ (new modular - REPLACE route.ts with this)
└── enrich/
    └── status/[jobId]/
        └── route.ts          ✅ Ready
```

### Frontend Hooks
```
frontend/course-generation/lib/hooks/
└── useEnrichmentPolling.ts   ✅ Ready
```

## Next Steps After Testing

1. **If everything works:**
   - Commit changes to git
   - Update documentation
   - Deploy to production

2. **If issues found:**
   - Check console logs for error messages
   - Verify environment variables are set
   - Check Redis connection (if using enrichment)
   - Review [PRODUCTION_REFACTORING_DOCUMENTATION.md](../PRODUCTION_REFACTORING_DOCUMENTATION.md)

3. **Performance monitoring:**
   - Track base generation time (target: <15s)
   - Monitor enrichment completion rate (target: 95%+ modules)
   - Check YouTube API quota usage
   - Monitor Redis memory usage

## Quick Start Commands

```bash
# 1. Install dependencies (already done)
cd backend/main-app
npm install

# 2. Start Redis (optional)
docker run -d -p 6379:6379 redis:latest

# 3. Start Next.js dev server
cd frontend/course-generation
npm run dev

# 4. Test in browser
# Navigate to: http://localhost:3000/generate/javascript
```

## Success Criteria

✅ **Base generation completes in <15 seconds**
✅ **All modules have learning objectives**
✅ **All modules have youtube search queries**
✅ **All modules have reading materials**
✅ **No duplicate modules (semantic dedup working)**
✅ **Course structure is valid JSON**
✅ **Enrichment jobs queue successfully (if Redis available)**

---

**Ready to test!** Start with Step 1 above and work through each phase. The system is designed with fallbacks at every layer, so you can test incrementally.
