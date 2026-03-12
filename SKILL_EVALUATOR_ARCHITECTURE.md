# 🔍 Skill Evaluator - Complete Architecture Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Data Flow](#data-flow)
4. [API Endpoints](#api-endpoints)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Implementation](#backend-implementation)
7. [Database Schema](#database-schema)
8. [Error Handling](#error-handling)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

The Skill Evaluator is an AI-powered assessment platform that:
- Generates custom MCQ questions using Google's Gemini API
- Evaluates user knowledge across different skill levels (Easy/Medium/Hard)
- Provides detailed performance analytics
- Stores evaluation history in MongoDB

**Tech Stack:**
- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **AI:** Google Gemini API (gemini-1.5-flash model)
- **Port:** 3001 (Frontend), 5000 (Backend)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│                    (localhost:3001)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Setup Page   │→ │ Loading Page │→ │ Test Page    │→        │
│  │- Topic Input │  │- AI Generate │  │- Questions   │         │
│  │- Difficulty  │  │- Loading UI  │  │- Answer Input│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                              ↓                   │
│                                    ┌──────────────┐            │
│                                    │ Results Page │            │
│                                    │- Score       │            │
│                                    │- Analysis    │            │
│                                    └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTP Requests
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND API                         │
│                    (localhost:5000)                             │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ Routes: /api/skills/*                                │      │
│  │  - POST /evaluate  → Generate questions              │      │
│  │  - POST /submit    → Score evaluation                │      │
│  │  - GET  /          → List user evaluations           │      │
│  │  - GET  /:id       → Get single evaluation           │      │
│  └──────────────────────────────────────────────────────┘      │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────────┐      │
│  │        Google Gemini API Integration                 │      │
│  │  Model: gemini-1.5-flash                            │      │
│  │  Purpose: Generate MCQ questions                     │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Mongoose ODM
┌─────────────────────────────────────────────────────────────────┐
│                     MONGODB DATABASE                            │
│  Collection: skillevaluations                                   │
│  - Stores evaluation records                                    │
│  - Stores questions, answers, and scores                        │
│  - Indexed by user, userId, userEmail                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### **Phase 1: Test Initialization**

```
User enters topic and selects difficulty (Easy/Medium/Hard)
        ↓
Frontend maps difficulty:
  - Easy → beginner
  - Medium → intermediate  
  - Hard → advanced
        ↓
POST /api/skills/evaluate
{
  skillName: "Python",
  difficulty: "intermediate",
  questionCount: 20,
  userId: "guest" or actual userId,
  userEmail: optional
}
```

### **Phase 2: Question Generation**

```
Backend receives request
        ↓
Validates: skillName, GEMINI_API_KEY
        ↓
Initializes Google Gemini API
  - Model: gemini-1.5-flash
  - Constructs prompt for MCQ generation
        ↓
Gemini generates JSON response with questions
        ↓
Backend parses and validates JSON
  - Extracts question, options, correctAnswer
  - Ensures 4 options per question
  - Filters invalid questions
        ↓
Creates MongoDB document:
  - status: 'in-progress'
  - questions: Array of Q&A
  - Returns evaluationId
        ↓
Response sent to frontend:
{
  evaluationId: "ObjectId",
  skillName: "Python",
  difficulty: "intermediate",
  questions: [...20 questions...],
  totalQuestions: 20,
  evaluatedAt: "2026-02-20T..."
}
```

### **Phase 3: Test Taking**

```
Frontend displays questions
        ↓
User selects answers (A/B/C/D)
        ↓
Answers stored in local state array
        ↓
Progress bar updates (answered/total)
        ↓
Submit button enabled when all answered
```

### **Phase 4: Scoring & Results**

```
User clicks "Submit Test"
        ↓
Frontend calculates score locally
  - Compares userAnswer vs correctAnswer
  - Counts correct answers
        ↓
Displays results:
  - Score: X/20
  - Percentage: Y%
  - Question-by-question breakdown
  - Topic-wise analysis
  - Weak areas identification
```

**Note:** Currently scoring happens on frontend only. Backend has `/submit` endpoint ready for persistence.

---

## API Endpoints

### **1. POST /api/skills/evaluate**

**Purpose:** Generate AI-powered evaluation questions

**Request:**
```json
{
  "skillName": "Python",
  "difficulty": "intermediate",
  "questionCount": 20,
  "userId": "guest",
  "userEmail": "user@example.com"
}
```

**Response (Success - 200):**
```json
{
  "evaluationId": "65f8a9b2c3d4e5f6a7b8c9d0",
  "skillName": "Python",
  "difficulty": "intermediate",
  "questions": [
    {
      "question": "What is a decorator in Python?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ],
  "totalQuestions": 20,
  "evaluatedAt": "2026-02-20T12:00:00.000Z"
}
```

**Response (Error - 400/500):**
```json
{
  "error": "Skill name is required",
  "details": "Error stack (in development)"
}
```

**Backend Processing:**
1. Validates `skillName` parameter
2. Checks for `GEMINI_API_KEY` environment variable
3. Calls Gemini API with prompt template
4. Parses JSON response using regex: `/\[[\s\S]*\]/`
5. Validates each question structure
6. Creates MongoDB document with `status: 'in-progress'`
7. Returns questions + evaluationId

**Common Errors:**
- **400:** Missing skillName
- **404:** Invalid Gemini model (gemini-1.5-pro deprecated)
- **500:** GEMINI_API_KEY not configured
- **500:** JSON parsing failed from Gemini response

---

### **2. POST /api/skills/submit**

**Purpose:** Submit answers and calculate score

**Request:**
```json
{
  "evaluationId": "65f8a9b2c3d4e5f6a7b8c9d0",
  "answers": {
    "0": "A",
    "1": "B",
    "2": "C"
  }
}
```

**Response (Success - 200):**
```json
{
  "evaluationId": "65f8a9b2c3d4e5f6a7b8c9d0",
  "score": 85.5,
  "percentage": 86,
  "correct": 17,
  "total": 20,
  "status": "completed"
}
```

**Backend Processing:**
1. Finds evaluation by ID
2. Compares user answers with correct answers
3. Calculates score percentage
4. Updates MongoDB document:
   - `questions[].userAnswer`
   - `questions[].isCorrect`
   - `status: 'completed'`
   - `completedAt: Date`
5. Returns score summary

---

### **3. GET /api/skills/**

**Purpose:** List all evaluations for a user

**Query Parameters:**
- `userId`: User ID or "guest"
- `userEmail`: User email address

**Example:**
```
GET /api/skills/?userId=guest
GET /api/skills/?userEmail=user@example.com
```

**Response:**
```json
{
  "success": true,
  "evaluations": [
    {
      "_id": "65f8a9b2c3d4e5f6a7b8c9d0",
      "skillName": "Python",
      "difficulty": "intermediate",
      "score": 85,
      "percentage": 85,
      "status": "completed",
      "createdAt": "2026-02-20T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### **4. GET /api/skills/:id**

**Purpose:** Get single evaluation details

**Example:**
```
GET /api/skills/65f8a9b2c3d4e5f6a7b8c9d0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f8a9b2c3d4e5f6a7b8c9d0",
    "skillName": "Python",
    "questions": [...],
    "score": 85,
    "status": "completed"
  }
}
```

---

## Frontend Implementation

### **File Structure**
```
frontend/test-generation/
├── index.html          # Main UI structure
├── script.js           # Core logic & API calls
├── styles.css          # Styling
├── header.js           # Shared header component
└── shared/
    └── auth.js         # Authentication utilities
```

### **Key Components**

#### **1. State Management (script.js)**
```javascript
let selectedDifficulty = null;  // 'easy', 'medium', 'hard'
let currentTest = null;         // Array of questions
let userAnswers = [];           // User's selected answers
```

#### **2. API Configuration**
```javascript
const API_BASE_URL = (typeof window.getModuleUrls === 'function')
    ? window.getModuleUrls().backend
    : (window.location.hostname.includes('localhost')
        ? 'http://localhost:5000'
        : 'https://careersync-backend-oldo.onrender.com');
```

#### **3. Question Generation Flow**
```javascript
async function startTest() {
  // 1. Show loading screen
  setupSection.classList.add('hidden');
  loadingSection.classList.remove('hidden');
  
  // 2. Map frontend difficulty to backend
  const difficultyMap = {
    'easy': 'beginner',
    'medium': 'intermediate',
    'hard': 'advanced'
  };
  
  // 3. Call backend API
  const questions = await generateQuestions(courseName, backendDifficulty);
  
  // 4. Display questions
  displayQuestions(questions, courseName);
  
  // 5. Show test section
  testSection.classList.remove('hidden');
}
```

#### **4. API Call Implementation**
```javascript
async function generateQuestions(courseName, difficulty) {
  const response = await fetch(`${API_BASE_URL}/api/skills/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      skillName: courseName,
      difficulty,
      questionCount: 20
    })
  });
  
  if (!response.ok) {
    // Parse error response
    const errorData = await response.json();
    throw new Error(`Backend error: ${response.status} - ${errorData.error}`);
  }
  
  const data = await response.json();
  return data.questions;
}
```

#### **5. Answer Tracking**
```javascript
function handleAnswerChange(questionIndex, answer) {
  userAnswers[questionIndex] = answer;
  updateProgress();
  
  // Enable submit when all answered
  const allAnswered = userAnswers.every(a => a !== null);
  submitTestBtn.disabled = !allAnswered;
}
```

#### **6. Scoring Logic**
```javascript
function submitTest() {
  let correctCount = 0;
  
  const results = currentTest.map((q, index) => {
    const isCorrect = userAnswers[index] === q.correctAnswer;
    if (isCorrect) correctCount++;
    
    return {
      question: q.question,
      userAnswer: userAnswers[index],
      correctAnswer: q.correctAnswer,
      isCorrect: isCorrect
    };
  });
  
  displayResults(correctCount, results);
}
```

---

## Backend Implementation

### **File Structure**
```
backend/main-app/backend/
├── server.js                    # Express app setup
├── routes/
│   └── skillEval.js            # Skill evaluation routes
├── models/
│   └── SkillEvaluation.js      # MongoDB schema
└── .env                         # Environment variables
```

### **Route Handler: POST /evaluate**

```javascript
router.post('/evaluate', async (req, res) => {
  const { skillName, difficulty, questionCount, userId, userEmail } = req.body;
  
  // 1. Validation
  if (!skillName) {
    return res.status(400).json({ error: 'Skill name is required' });
  }
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }
  
  try {
    // 2. Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // 3. Construct prompt
    const prompt = `Generate ${qCount} multiple-choice questions for evaluating "${skillName}" at ${diff} level...`;
    
    // 4. Generate content
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 5. Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const questionsRaw = JSON.parse(jsonMatch[0]);
    
    // 6. Validate and normalize questions
    const questions = questionsRaw
      .map(q => {
        if (!q || !q.question || !q.options) return null;
        return {
          question: q.question,
          options: q.options.slice(0, 4),
          correctAnswer: q.correctAnswer
        };
      })
      .filter(Boolean);
    
    // 7. Save to MongoDB
    const evalDoc = await SkillEvaluation.create({
      userId: userId || 'guest',
      userEmail,
      skillName,
      difficulty: diff,
      questions,
      totalQuestions: questions.length,
      status: 'in-progress'
    });
    
    // 8. Return response
    res.json({ 
      evaluationId: evalDoc._id,
      questions,
      totalQuestions: questions.length
    });
    
  } catch (error) {
    console.error('Skill evaluation error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});
```

### **Gemini API Integration**

**Prompt Template:**
```javascript
const prompt = `Generate ${qCount} multiple-choice questions for evaluating "${skillName}" at ${diff} level. 

Each question should test practical knowledge and understanding.
Format your response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]

Return ONLY the JSON array, nothing else.`;
```

**Model Configuration:**
- **Model:** `gemini-1.5-flash` (formerly gemini-1.5-pro - DEPRECATED)
- **API Version:** v1beta
- **Response Format:** Text (parsed for JSON)

**Critical Fix Applied:**
❌ Old (causing 404 error):
```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

✅ New (working):
```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

---

## Database Schema

### **SkillEvaluation Model**

```javascript
{
  // User identification
  user: ObjectId,                    // Reference to User model (optional)
  userId: String,                     // User ID or "guest"
  userEmail: String,                  // Optional email
  
  // Evaluation details
  skillName: String (required),       // e.g., "Python"
  title: String,                      // e.g., "Python Evaluation"
  difficulty: String,                 // "beginner" | "intermediate" | "advanced"
  
  // Questions and answers
  questions: [
    {
      question: String,               // Question text
      options: [String],              // Array of 4 options
      correctAnswer: String,          // Correct option
      userAnswer: String,             // User's selected answer
      isCorrect: Boolean              // Scoring flag
    }
  ],
  
  // Scoring
  totalQuestions: Number,             // Total question count
  correctAnswers: Number,             // Correct answer count
  score: Number,                      // Raw score (0-100)
  percentage: Number,                 // Rounded percentage
  
  // Status tracking
  status: String,                     // "in-progress" | "completed"
  feedback: String,                   // Optional feedback
  completedAt: Date,                  // Completion timestamp
  
  // Metadata
  metadata: Mixed,                    // Additional data
  createdAt: Date,                    // Auto-generated
  updatedAt: Date                     // Auto-generated
}
```

**Indexes:**
```javascript
{ user: 1, skillName: 1, createdAt: -1 }  // User + skill queries
{ userId: 1, createdAt: -1 }              // Guest user queries
{ userEmail: 1, createdAt: -1 }           // Email-based queries
```

---

## Error Handling

### **Common Errors & Solutions**

#### **1. 404 Not Found - Gemini Model**

**Error:**
```
[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent: 
[404 Not Found] models/gemini-1.5-pro is not found for API version v1beta
```

**Cause:** Using deprecated model name `gemini-1.5-pro`

**Solution:**
```javascript
// Update in all route files (courses.js, roadmaps.js, skillEval.js)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

---

#### **2. 500 Internal Server Error - Missing API Key**

**Error:**
```json
{
  "error": "GEMINI_API_KEY is not configured"
}
```

**Cause:** Environment variable not set

**Solution:**
```bash
# In backend/main-app/backend/.env
GEMINI_API_KEY=your_actual_api_key_here
```

**Verify:**
```javascript
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not Set');
```

---

#### **3. CORS Error**

**Error:**
```
Access to fetch at 'http://localhost:5000/api/skills/evaluate' from origin 'http://localhost:3001' 
has been blocked by CORS policy
```

**Cause:** Frontend origin not in CORS whitelist

**Solution:** Add origin to server.js:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',  // ← Add this
    'http://localhost:4173',
    'http://localhost:5173',
    // ... other origins
  ],
  credentials: true
}));
```

---

#### **4. JSON Parsing Error**

**Error:**
```
Failed to parse questions from API response
```

**Cause:** Gemini returns text before/after JSON array

**Solution:** Regex extraction already implemented:
```javascript
const jsonMatch = responseText.match(/\[[\s\S]*\]/);
if (!jsonMatch) {
  throw new Error('Failed to parse questions from API response');
}
const questionsRaw = JSON.parse(jsonMatch[0]);
```

---

#### **5. MongoDB Connection Failed**

**Error:**
```
MongoNetworkError: failed to connect to server
```

**Cause:** Invalid MONGODB_URI or network issue

**Solution:**
1. Check `.env` file:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careersync
```

2. Verify MongoDB Atlas:
   - Network access whitelist
   - Database user credentials
   - Cluster is running

3. Test connection:
```javascript
// In server.js
connectMongo().then(connected => {
  if (connected) {
    console.log('✅ MongoDB: Connected');
  } else {
    console.log('⚠️ MongoDB: Connection failed');
  }
});
```

---

## Troubleshooting Guide

### **Debugging Flow**

```
1. Check Backend Logs
   └─→ Terminal running: npm start (backend)
       Look for: ❌ errors, 📊 requests, ✅ success

2. Check Browser Console
   └─→ F12 → Console tab
       Look for: API errors, network failures, JS errors

3. Check Network Tab
   └─→ F12 → Network tab
       Filter: Fetch/XHR
       Check: Request payload, response status, response body

4. Verify Environment Variables
   └─→ backend/.env file
       Required: GEMINI_API_KEY, MONGODB_URI, PORT

5. Test API Directly
   └─→ Use Postman/curl
       POST http://localhost:5000/api/skills/evaluate
```

### **Backend Debugging**

Add logging in `skillEval.js`:
```javascript
router.post('/evaluate', async (req, res) => {
  console.log('📊 Request received:', req.body);
  console.log('🔑 API Key present:', !!process.env.GEMINI_API_KEY);
  
  try {
    const result = await model.generateContent(prompt);
    console.log('✅ Gemini response length:', result.response.text().length);
    
    const questions = parseQuestions(result.response.text());
    console.log('✅ Parsed questions:', questions.length);
    
    // ... rest of code
  } catch (error) {
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      status: error.status
    });
  }
});
```

### **Frontend Debugging**

Add logging in `script.js`:
```javascript
async function startTest() {
  console.log('🚀 Starting test:', {
    courseName,
    difficulty: selectedDifficulty,
    apiUrl: API_BASE_URL
  });
  
  try {
    const questions = await generateQuestions(courseName, difficulty);
    console.log('✅ Questions received:', questions.length);
  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      response: error.response
    });
  }
}
```

### **Quick Fixes Checklist**

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3001
- [ ] `.env` file has valid GEMINI_API_KEY
- [ ] `.env` file has valid MONGODB_URI
- [ ] CORS origins include localhost:3001
- [ ] Gemini model set to `gemini-1.5-flash` (not gemini-1.5-pro)
- [ ] MongoDB Atlas network access allows your IP
- [ ] No firewall blocking ports 3001 or 5000

---

## Performance Considerations

### **Response Times**
- **Question Generation:** 5-15 seconds (Gemini API call)
- **Scoring:** < 100ms (local calculation)
- **Database Write:** 100-300ms (MongoDB)

### **Optimization Opportunities**
1. **Cache questions** for popular topics
2. **Pre-generate questions** in bulk
3. **Use Redis** for frequently-requested evaluations
4. **Implement rate limiting** on API endpoints
5. **Add request queue** for high traffic

---

## Security Considerations

### **Current Implementation**
- ✅ GEMINI_API_KEY stored in backend (not exposed to frontend)
- ✅ CORS configured with specific origins
- ✅ Request validation (skillName required)
- ✅ MongoDB injection prevention (Mongoose ODM)

### **Recommended Additions**
- [ ] Add authentication middleware
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add input sanitization
- [ ] Implement CSRF protection
- [ ] Add request logging (morgan)
- [ ] Set up API key rotation

---

## Summary

The Skill Evaluator follows a **3-tier architecture**:

1. **Frontend (Presentation Layer)**
   - Collects user input
   - Manages UI state
   - Makes API calls
   - Renders results

2. **Backend (Business Logic Layer)**
   - Validates requests
   - Integrates with Gemini API
   - Processes AI responses
   - Calculates scores
   - Manages database operations

3. **Database (Persistence Layer)**
   - Stores evaluation records
   - Tracks user history
   - Indexed for fast queries

**Critical Dependencies:**
- Google Gemini API (gemini-1.5-flash)
- MongoDB Atlas (cloud database)
- Express.js (REST API)
- Mongoose (ODM)

**Key Error:** The 404 error was caused by using deprecated `gemini-1.5-pro` model. Fixed by updating to `gemini-1.5-flash` in all route files.

---

**Document Version:** 1.0  
**Last Updated:** February 20, 2026  
**Author:** Career Sync Development Team
