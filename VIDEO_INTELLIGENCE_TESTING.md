# Video Intelligence System - Quick Testing Guide

## ⚡ Quick Start

### 1. Check Server Status
```powershell
# Frontend should be on port 3002
http://localhost:3002

# Backend should be on port 5000
# Check with netstat:
netstat -ano | findstr ":3002\|:5000"
```

### 2. Generate a Test Course

**For Language Learning (Italian):**
- Topic: "Italian"
- Timeline: "3 months"
- Experience Level: "Beginner"
- Learning Style: "Visual + Interactive"

**For Programming (JavaScript):**
- Topic: "JavaScript"
- Timeline: "3 months"
- Experience Level: "Intermediate"
- Learning Style: "Hands-on"

### 3. Monitor Video Selection

Open **Browser Dev Console** (F12) and look for logs:

```
[VIDEO INTELLIGENCE] Starting video selection process...
[MODULE] "Italian Greetings" (Module 1/10)
[QUERY] Italian Greetings Italian tutorial beginner
[VIDEO FETCHED] Retrieved 15 videos
[FILTERED VIDEOS] 12/15 passed hard filters
[SCORING COMPLETE]
[1] Channel: Easy Italian, Score: 95.2%
[2] Channel: Duolingo, Score: 88.7%
[3] Channel: Easy Languages, Score: 84.1%
```

## 🎯 What to Verify

### ✅ Check 1: Video Relevance
- Module: "Italian Greetings"
- Expected: Videos about Italian greetings
- Not: Random Italian videos

### ✅ Check 2: Trusted Channels
- Look for channels like:
  - Easy Languages
  - Easy Italian
  - freeCodeCamp
  - Traversy Media
  - Academind

### ✅ Check 3: Video Quality
- All videos should be > 4 minutes
- No "shorts" or "clips" in titles
- Proper video titles (not spammy)

### ✅ Check 4: Scoring Data
- Each module should show:
  - `videoIntelligence.relevanceScore`
  - `videoIntelligence.engagementScore`
  - `videoIntelligence.educationalScore`
  - `videoIntelligence.finalScore`

## 📊 Analyzing Results

### In Browser Console:
```javascript
// Copy-paste this in console to inspect a course
fetch('http://localhost:3002/api/courses/[courseId]')
  .then(r => r.json())
  .then(course => {
    course.modules.forEach((m, i) => {
      console.log(`Module ${i+1}: ${m.title}`);
      console.log(`  Video: ${m.youtubeSearch}`);
      console.log(`  Channel: ${m.videoIntelligence?.channel}`);
      console.log(`  Score: ${(m.videoIntelligence?.finalScore * 100).toFixed(1)}%`);
    });
  });
```

### Expected Output:
```
Module 1: Italian Greetings
  Video: Simple Italian Greetings for Beginners
  Channel: Easy Italian
  Score: 94.2%

Module 2: Italian Grammar Basics
  Video: Italian Grammar Explained Step by Step
  Channel: Easy Languages
  Score: 91.8%
```

## 🔍 Detailed Debugging

### Check Video Metrics
The system fetches these for each video:
- `thumbCount` - How many times video appears in search results
- `likeCount` - Likes on the video
- `commentCount` - Comments/discussion
- `viewCount` - Total views
- `duration` - Video length in seconds

### Check Scoring Breakdown
Each video gets scored on:
1. **Relevance** (0.30 × score)
   - Is video semantically about the module?
   
2. **Engagement** (0.25 × score)
   - Are people liking and commenting?
   
3. **Educational** (0.20 × score)
   - Does it have "tutorial", "beginner", "explained"?
   
4. **Channel Trust** (0.15 × score)
   - Is creator in trusted list?
   
5. **Recency** (0.10 × score)
   - Published within 6 months?

## ⚙️ If Something Goes Wrong

### Problem: No Videos Found
```
[VIDEO INTELLIGENCE] No videos found
```
**Fix:** Check YouTube API key in `.env`

### Problem: All Videos Filtered Out
```
[FILTERED VIDEOS] 0/15 passed hard filters
```
**Cause:** All videos < 4 minutes or spam
**Fix:** Usually okay, system falls back to search query

### Problem: Error in get BestVideo
```
[VIDEO INTELLIGENCE] Failed for module X, using fallback search
```
**Cause:** YouTube API timeout or error
**Fix:** Normal fallback behavior, course still generates

### Problem: Scores All Zero
```
finalScore: 0
relevanceScore: 0
```
**Cause:** Embedding calculation failed
**Fix:** Using deterministic embedding (still works, slightly lower accuracy)

## 📈 Performance Metrics

### Expected Timings (per module)
- Query generation: <100ms
- YouTube search API: 1-2s
- Hard filtering: <100ms
- Metrics fetch (15 videos): 2-4s
- Scoring: <100ms
- **Total per module: 3-6 seconds**

### Full Course Timing (10 modules)
- Expected: 30-60 seconds
- With fallback: 15-30 seconds
- Maximum: 2 minutes

## 🧪 Test Scenarios

### Scenario 1: Language Course
**Input:** Italian course
**Expected:**
- Videos from Easy Languages
- Italian-specific content
- Educational keywords

### Scenario 2: Programming Course
**Input:** JavaScript course
**Expected:**
- Videos from freeCodeCamp, Traversy Media
- Technical concepts covered
- Trusted channels ranked high

### Scenario 3: Niche Topic
**Input:** Web3 or AI course
**Expected:**
- May not find trusted channel videos
- Falls back to search query
- Still completes successfully

## 📝 Logging Checklist

- ✅ System starts with "Starting video selection process"
- ✅ Module info logged with title and number
- ✅ Query shows course context included
- ✅ Video fetch count shows (e.g., "Retrieved 15 videos")
- ✅ Filtered count shows reduction (e.g., "12/15 passed")
- ✅ Top videos show title, channel, score
- ✅ All scores between 0-100%

## 🎓 Example Outputs

Let's say you generate a **Python course**, Module 3: "Classes and Objects"

**Good Output:**
```
[VIDEO INTELLIGENCE] Starting video selection process...
[MODULE] "Python Classes and Objects" (Module 3/10)
[QUERY] Python Classes and Objects tutorial intermediate
[VIDEO FETCHED] Retrieved 15 videos
[FILTERED VIDEOS] 14/15 passed hard filters
[SCORING COMPLETE]
[1] Python Classes Explained (Score: 96.2%) - Traversy Media
[2] OOP in Python Full (Score: 92.1%) - freeCodeCamp
[3] Python Classes Tutorial (Score: 88.7%) - Programming with Mosh
```

**Good Score Distribution:**
- Top video: 90-98%
- Second video: 85-92%
- Third video: 80-88%

## 🚨 Red Flags

❌ All videos from unknown channels
❌ Scores all above 99% (probably not calculated correctly)
❌ Scores all below 50% (poor matching)
❌ Same video for multiple modules (unlikely)
❌ Video durations < 4 minutes
❌ Consistent API errors

## ✨ Success Indicators

✅ Different videos per module
✅ Scores between 80-98%
✅ Mix of trusted channels
✅ Educational keywords in titles
✅ No errors in logs
✅ All modules complete quickly

---

**Ready to test?** Generate a course and check the browser console! 🎉
