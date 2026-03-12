# Complete Resource Mapping Architecture

## 1. HOW RESOURCES ARE CURRENTLY FETCHED

### A. YouTube Video Search Flow
```
User generates course for topic (e.g., "Italian", "JavaScript")
    ↓
LLM generates module titles (e.g., "Italian Greetings and Basic Phrases")
    ↓  
For EACH module:
    - Extract module title
    - Call generateModuleVideoSearch() function
    - Function creates SPECIFIC search query
    - Search query sent to YouTube API v3
    - YouTube returns ~5-10 video results
    - First video selected + embedded
```

**Current Search Query Generation (Lines 25-70):**
```typescript
const generateModuleVideoSearch = (moduleTitle, moduleTopic, moduleNum, totalModules) => {
  // Extract concepts from title
  const concepts = moduleTopic.split(/[,&]/).map(c => c.trim())
  
  // Determine difficulty based on module position
  let difficultyKeyword = 'tutorial for beginners' // early modules
  
  // Build search query like: "Italian Greetings tutorial for beginners"
  return `${concepts[0]} ${concepts[1]} ${difficultyKeyword}`
}
```

### B. Reading Materials Mapping
```
For each module:
    ↓
Extract module topic (e.g., "Variables and Data Types")
    ↓
Check keywordResources lookup table (400+ keywords mapped)
    ↓
If match found: Return official docs + GeeksforGeeks + others
    ↓
If NO match: Generate fallback search URLs
    - MDN search
    - GeeksforGeeks
    - freeCodeCamp
    - Dev.to search
```

**Keywords Currently Mapped (Lines 75-230):**
- JavaScript: variables, data types, operators, functions, arrays, objects, promises, async, dom, events, etc.
- CSS: flexbox, grid, responsive, accessibility
- React: components, hooks, state, props, routing, context
- SQL: joins, queries, databases
- Python: pandas, numpy, oop
- ML: neural networks, tensorflow, deep learning, etc.

### C. Course-Level Resources
```
After modules are generated:
    ↓
Call generateCourseResources(topic, goal, experience, timeline, learningStyle)
    ↓
Check topicResourceMap with 500+ curated URLs
    ↓
Match by experience level (beginner/intermediate/advanced)
    ↓
Return 4-8 real, working resources
```

---

## 2. IDENTIFIED PROBLEMS

### Problem 1: YouTube API Returns 403 Forbidden
**Root Cause:** API key has HTTP referrer restrictions set
**Impact:** YouTube videos won't fetch on Render deployment
**Current Status:** Fixed in Render environment variables

**Fix Applied:**
- Updated `NEXT_PUBLIC_YOUTUBE_API_KEY` in Render
- Removed HTTP referrer restrictions OR added Render domain

---

### Problem 2: Search Queries Too Generic
**Example:**
- Generated: "Italian tutorial for beginners"
- Result: Gets basic tutorials, not "Greetings and Phrases"

- Generated: "Variables tutorial for beginners"  
- Result: Gets intro to ANY language, not JavaScript-specific

**Root Cause:** Search query doesn't include topic context

---

### Problem 3: Fallback URLs Are Search Links, Not Real Content
**Current Fallback (Lines 240-260):**
```typescript
return [
  {
    type: 'tutorial',
    title: `${cleanTopic} - GeeksforGeeks`,
    url: `https://www.geeksforgeeks.org/${cleanTopic.toLowerCase().replace(/\s+/g, '-')}/`,  // Search URL
  },
  {
    type: 'documentation',
    title: `${cleanTopic} - MDN Web Docs`,
    url: `https://developer.mozilla.org/en-US/search?q=${searchTerm}`,  // Search URL
  }
]
```

**Problem:** These are search result pages, not actual articles/tutorials
- User has to click and search again
- No direct learning resource

---

### Problem 4: Demo Links in Course Output
**Symptom:** Some resources show placeholder/example URLs like:
- `https://example.com/...`
- `https://youtube.com` (no video ID)
- Generic search URLs without actual content

**Root Cause:** Either:
1. LLM generated demo content (not actual URLs)
2. Course generation parsed incorrectly
3. Fallback resources don't update because course already has "resources" key

---

## 3. COMPLETE RESOURCE MAPPING FLOW

```
┌─────────────────────────────────────────────────────────────┐
│  USER SUBMITS: Topic + Answers                              │
│  Example: "Italian" + experience level, timeline, etc.      │
└──────────────┬──────────────────────────────────────────────┘

┌──────────────┴──────────────────────────────────────────────┐
│  TOPIC CLASSIFICATION                                        │
│  - Is language? → Italian, Spanish, French, etc.            │
│  - Is programming? → JavaScript, Python, React, etc.        │
│  - Is web? → HTML, CSS, responsive design                   │
│  - Otherwise → Generic topic                                │
└──────────────┬──────────────────────────────────────────────┘

┌──────────────┴──────────────────────────────────────────────┐
│  CALCULATE MODULE COUNT                                      │
│  Formula: (weeks * 1.2 + 2) + adjustments                   │
│  Result: 5-18 modules based on timeline & depth             │
└──────────────┬──────────────────────────────────────────────┘

┌──────────────┴──────────────────────────────────────────────┐
│  GENERATE COURSE WITH LLM                                    │
│  Model: Mistral Mixtral 8x7B                                │
│  Input: Topic + example module titles + user profile        │
│  Output: JSON with modules + resources                       │
└──────────────┬──────────────────────────────────────────────┘

┌──────────────┴──────────────────────────────────────────────┐
│  ENRICH WITH YOUTUBE VIDEOS (Per Module)                    │
│                                                              │
│  For each module:                                           │
│  1. Extract module title                                    │
│  2. Generate specific search query                          │
│     - "Italian Greetings tutorial for beginners"            │
│  3. Call YouTube API v3 search endpoint                     │
│  4. Parse response: extract videoId                         │
│  5. Embed video link: youtube.com/embed/{videoId}           │
│                                                              │
│  ⚠️ FAILS IF API KEY MISSING/RESTRICTED                     │
│  → Falls back to: No video, just module continues           │
└──────────────┬──────────────────────────────────────────────┘

┌──────────────┴──────────────────────────────────────────────┐
│  GENERATE READING MATERIALS (Per Module)                    │
│                                                              │
│  For each module title:                                     │
│  1. Extract keywords (e.g., "Greetings", "Phrases")         │
│  2. Lookup in keywordResources mapping table                │
│  3. If exact match: Return 4-6 curated links                │
│  4. If partial match: Return topical resources              │
│  5. If no match: Generate fallback search URLs              │
│                                                              │
│  Returns per module:                                        │
│  [                                                          │
│    { type: 'official', url: 'https://mdn.org/...' },       │
│    { type: 'tutorial', url: 'https://geeksforgeeks...' },  │
│    { type: 'article', url: 'https://dev.to/...' }          │
│  ]                                                          │
└──────────────┬──────────────────────────────────────────────┘

┌──────────────┴──────────────────────────────────────────────┐
│  GENERATE COURSE-LEVEL RESOURCES                            │
│                                                              │
│  1. Match topic against topicResourceMap                    │
│  2. Filter by user experience level                         │
│  3. Return 4-8 complete courses/docs                        │
│     - Official documentation                               │
│     - Video courses (YouTube, Udemy, freeCodeCamp)          │
│     - Interactive platforms (Scrimba, LeetCode)             │
│     - Practice platforms                                    │
│                                                              │
│  Example for React + Beginner:                              │
│  [                                                          │
│    { title: 'React Official Docs', url: '...' },            │
│    { title: 'React freeCodeCamp 7hr', url: '...' },         │
│    { title: 'Scrimba React Interactive', url: '...' }       │
│  ]                                                          │
└──────────────┬──────────────────────────────────────────────┘

┌──────────────┴──────────────────────────────────────────────┐
│  FINAL COURSE OBJECT SENT TO FRONTEND                       │
│                                                              │
│  {                                                          │
│    title: "Italian Language Mastery",                       │
│    description: "...",                                      │
│    modules: [                                               │
│      {                                                      │
│        id: 1,                                               │
│        title: "Italian Greetings and Phrases",              │
│        youtubeSearch: "Italian Greetings tutorial...",      │
│        youtubeVideo: {                                      │
│          id: "abc123",  ← Video ID fetched from YT API      │
│          title: "...",                                      │
│          url: "https://youtube.com/embed/abc123"            │
│        },                                                   │
│        readingMaterials: [                                  │
│          { title: "...", url: "https://..." },              │
│          ...                                                │
│        ]                                                    │
│      },                                                     │
│      ...                                                    │
│    ],                                                       │
│    resources: [                                             │
│      { title: "...", url: "..." },  ← Course level          │
│      ...                                                    │
│    ]                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. WHY SOME RESOURCES AREN'T WORKING

### Scenario 1: YouTube Videos Return 403
```
module.youtubeSearch = "Italian Greetings..." ✓
YouTube API Key = restricted/missing ✗
→ API returns 403 Forbidden
→ No video retrieved
→ Module displays without video
```

**Fix:** Already done - Updated Render env var

---

### Scenario 2: Reading Materials Are Generic
```
module.title = "Advanced Italian Grammar"
keywords extracted = ["Advanced", "Italian", "Grammar"]
keywordResources lookup = NO MATCH found
→ Falls back to: https://www.geeksforgeeks.org/advanced-italian-grammar/
→ Page doesn't exist on GeeksforGeeks (not a programming topic!)
```

**Fix:** Need better fallback strategy for non-tech topics

---

### Scenario 3: Demo/Placeholder URLs in Output
```
LLM generates: { url: "https://example-course.com/italian" }
→ Placeholder URL, not real
OR
Course parsing fails → uses generic URLs
→ https://developer.mozilla.org/en-US/search?q=Italian ← Not a real course
```

**Fix:** Validate all URLs before returning to frontend

---

## 5. CURRENT RESOURCE SOURCES

### Official Docs (Mapped)
- MDN Web Docs (JavaScript, CSS, HTML, Web APIs)
- React.dev (React)
- TensorFlow.org (Machine Learning)
- Python.org docs (Python)
- PostgreSQL docs (Database)

### Tutorial Sites (Mapped)
- GeeksforGeeks (400+ topics)
- freeCodeCamp (courses + articles)
- Dev.to (community articles)
- W3Schools (web fundamentals)

### Video Platforms
- YouTube API (live video search)
- freeCodeCamp videos (linked)
- Udemy courses (linked)
- Frontend Masters (linked)

### Interactive Platforms
- Scrimba (live coding)
- SQLiteOnline (SQL practice)
- LeetCode (problems)
- GitHub (practice repos)

---

## 6. WHAT NEEDS TO BE FIXED

### High Priority:
1. ✅ YouTube API 403 error → Fixed in Render env
2. ❌ Language topics don't have matching resources → Need language course database
3. ❌ Fallback URLs are search pages, not content → Need actual article/course URLs
4. ❌ Invalid URLs in course output → Need validation before response

### Medium Priority:
5. ❌ YouTube search queries too generic → Need topic-specific prefixes
6. ❌ No validation that resources actually exist → Check 404s
7. ❌ Metadata incomplete (no course duration, instructor) → Enrich data

### Low Priority:
8. ❌ No caching of videos/resources → Each request re-fetches
9. ❌ No fallback to alternative videos if first fails → Single point of failure

---

## 7. PROPOSED SOLUTIONS

### Solution 1: Enhance YouTube Search Quality
```typescript
// Current
const search = "Italian Greetings tutorial for beginners"

// Proposed
const search = topic + " " + moduleTitle + " " + difficultyLevel
// "Italian Italian Greetings and Basic Phrases tutorial for beginners"
```

### Solution 2: Add Language Learning Resource Database
```typescript
const languageCourses = {
  italian: [
    { type: 'course', title: 'Duolingo Italian', url: 'https://www.duolingo.com/course/it/en/Learn-Italian' },
    { type: 'course', title: 'Babbel Italian', url: 'https://www.babbel.com/en/learn-italian' },
    { type: 'video', title: 'Easy Italian YouTube Channel', url: 'https://www.youtube.com/@EasyItalian' },
    { type: 'app', title: 'Memrise Italian', url: 'https://www.memrise.com/course/1013/italian/' },
  ],
  spanish: [
    // ... 
  ]
}
```

### Solution 3: Validate URLs Before Returning
```typescript
// Check each URL exists before including in response
const validateUrl = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 })
    return response.ok
  } catch {
    return false
  }
}
```

### Solution 4: Specific Resource URLs (Not Search Pages)
```typescript
// Bad: search URL
url: 'https://developer.mozilla.org/en-US/search?q=variables'

// Good: specific article
url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#declarations'
```

---

## 8. SUMMARY TABLE

| Component | Current Status | Quality | Issue |
|-----------|---|---|---|
| YouTube Video Fetch | ✅ Working | 7/10 | 403 error if API restricted |
| Reading Materials (Tech) | ✅ Working | 8/10 | Some fallback URLs generic |
| Reading Materials (Language) | ❌ fails | 3/10 | No language course mapping |
| Course Resources | ✅ Partial | 6/10 | Some demo URLs included |
| Module Title Specificity | ✅ Good | 8/10 | Could be more targeted |
| Resource Validation | ❌ Missing | 0/10 | No 404 checking |
| Fallback Strategy | ⚠️ Basic | 4/10 | Uses search pages instead of articles |

