# Error Analysis: "Backend error: 500"

**Branch Created:** `fix-question-generation-error`

## Problem Summary
The skill evaluation feature is showing: **"Error generating questions: Backend error: 500"**

## Root Cause
🔴 **The backend server is NOT running** on port 5000.

### Evidence
1. **Port Check:** No process is listening on port 5000
   ```
   Get-NetTCPConnection -LocalPort 5000 -State Listen
   Result: Empty (no server running)
   ```

2. **Connection Test:** Cannot connect to localhost:5000
   ```
   Test-NetConnection -ComputerName localhost -Port 5000
   Result: Failed (both IPv4 and IPv6)
   ```

## Why This Causes the Error

### Request Flow
1. **Frontend** (skill evaluator) makes a request to:
   ```
   POST http://localhost:5000/api/skills/evaluate
   ```

2. **Expected Response:** Backend should:
   - Validate the `skillName` parameter
   - Check if `GEMINI_API_KEY` is configured
   - Call Google Gemini API to generate questions
   - Store evaluation in MongoDB
   - Return generated questions

3. **Actual Result:** 
   - Connection fails because no server is listening
   - Frontend receives network error or 500 status
   - Error displayed: "Backend error: 500"

## Backend Configuration (Verified ✅)

### Environment Variables (`.env` file is properly configured)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=skillroute-ai-secret-key-2026-production
MONGODB_URI=mongodb+srv://harishbonu3_db_user:***@careeros.n1t9tw0.mongodb.net/CareerOs
GEMINI_API_KEY=AIzaSyAbxPvKqXnZhVpIaAV_EC3OnZHe3wtY22E ✅
```

### Backend Route (Located in `backend/main-app/backend/routes/skillEval.js`)
```javascript
router.post('/evaluate', async (req, res) => {
  const { skillName, difficulty, questionCount, userId, userEmail } = req.body;

  // Validation
  if (!skillName) {
    return res.status(400).json({ error: 'Skill name is required' });
  }

  // API Key check
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Generate questions
    const result = await model.generateContent(prompt);
    // ... process and save to database
    
    res.json({ evaluationId, questions, ... });
  } catch (error) {
    console.error('Skill evaluation error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## Solution Steps

### 1. Start the Backend Server
```powershell
# Navigate to backend directory
cd backend/main-app/backend

# Install dependencies (if needed)
npm install

# Start the server
npm start
# OR for development with auto-restart:
npm run dev
```

### 2. Verify Server is Running
```powershell
# Check if port 5000 is now listening
Get-NetTCPConnection -LocalPort 5000 -State Listen

# Test health endpoint
Invoke-WebRequest -Uri http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "SkillRoute Backend is running",
  "timestamp": "2026-02-18T..."
}
```

### 3. Test Question Generation
Once the server is running, the skill evaluator should work properly:
- Frontend sends: `POST /api/skills/evaluate`
- Backend validates input
- Gemini API generates questions
- Questions saved to MongoDB
- Frontend displays the test

## Possible Secondary Issues

If the backend starts but still shows errors, check:

### Issue 1: MongoDB Connection
**Symptom:** Server starts but crashes when accessing database
**Check:** Look for MongoDB connection errors in console
**Fix:** Verify `MONGODB_URI` is correct and MongoDB Atlas is accessible

### Issue 2: Gemini API Issues
**Symptom:** "Error generating questions" but server is running
**Possible causes:**
- API key invalid or expired
- API quota exceeded
- Network issues reaching Google's API
- Invalid prompt format

**Check logs for:**
```javascript
console.error('Skill evaluation error:', error);
```

### Issue 3: CORS Issues
**Symptom:** Frontend shows network error or CORS policy error
**Check:** Frontend origin is in the allowed CORS list:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3001', // test-generation app
    'http://localhost:5173', 
    // ... other origins
  ],
  credentials: true
}));
```

## File Locations

- **Backend Server:** `backend/main-app/backend/server.js`
- **Question Route:** `backend/main-app/backend/routes/skillEval.js`
- **Environment Config:** `backend/main-app/backend/.env`
- **Frontend API Call:** `frontend/test-generation/src/utils/geminiApi.js`
- **Frontend Script:** `frontend/test-generation/script.js`

## Summary

**Primary Issue:** ❌ Backend server not running  
**Environment Config:** ✅ Properly configured  
**API Keys:** ✅ Present  
**Database URI:** ✅ Configured  

**Immediate Fix:** Start the backend server on port 5000

**Command:**
```bash
cd backend/main-app/backend && npm start
```
