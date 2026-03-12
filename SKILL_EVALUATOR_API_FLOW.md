# 🔄 Skill Evaluator - API Call Flow Diagram

## Complete Request-Response Cycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ACTION                                 │
│  1. User enters "Python" as topic                                   │
│  2. Selects "Medium" difficulty                                     │
│  3. Clicks "Attempt Test" button                                    │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (script.js)                             │
│                                                                       │
│  startTest() function triggered                                     │
│    ├─ Show loading screen                                           │
│    ├─ Map difficulty: "medium" → "intermediate"                     │
│    └─ Call generateQuestions()                                      │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    HTTP POST REQUEST                                 │
│                                                                       │
│  URL: http://localhost:5000/api/skills/evaluate                     │
│  Method: POST                                                        │
│  Headers: { "Content-Type": "application/json" }                    │
│  Body: {                                                             │
│    "skillName": "Python",                                            │
│    "difficulty": "intermediate",                                     │
│    "questionCount": 20,                                              │
│    "userId": "guest"                                                 │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  EXPRESS MIDDLEWARE                                  │
│                                                                       │
│  1. CORS Middleware                                                  │
│     ├─ Check origin: localhost:3001                                 │
│     └─ Allow credentials                                             │
│                                                                       │
│  2. Body Parser                                                      │
│     └─ Parse JSON body                                               │
│                                                                       │
│  3. Route to: /api/skills/evaluate                                   │
│     └─ Handler: skillEval.js → router.post('/evaluate')             │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│            BACKEND ROUTE HANDLER (skillEval.js)                     │
│                                                                       │
│  Step 1: Extract request data                                        │
│    const { skillName, difficulty, questionCount } = req.body;       │
│                                                                       │
│  Step 2: Validate inputs                                             │
│    ├─ if (!skillName) → 400 Bad Request                             │
│    └─ if (!GEMINI_API_KEY) → 500 Internal Error                     │
│                                                                       │
│  Step 3: Initialize Gemini API                                       │
│    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)│
│    const model = genAI.getGenerativeModel({                          │
│      model: 'gemini-1.5-flash'                                       │
│    })                                                                 │
│                                                                       │
│  Step 4: Construct prompt                                            │
│    const prompt = `Generate 20 multiple-choice questions...`         │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│               EXTERNAL API: GOOGLE GEMINI                            │
│                                                                       │
│  URL: https://generativelanguage.googleapis.com/v1beta/models/      │
│       gemini-1.5-flash:generateContent                               │
│                                                                       │
│  Request: model.generateContent(prompt)                              │
│                                                                       │
│  Processing Time: ~5-15 seconds                                      │
│                                                                       │
│  Response: {                                                          │
│    response: {                                                        │
│      text: "[{\"question\":\"...\",\"options\":[...],...]"           │
│    }                                                                  │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│            BACKEND: PARSE GEMINI RESPONSE                            │
│                                                                       │
│  Step 5: Extract JSON from text                                      │
│    const responseText = result.response.text();                      │
│    const jsonMatch = responseText.match(/\[[\s\S]*\]/);             │
│    const questionsRaw = JSON.parse(jsonMatch[0]);                    │
│                                                                       │
│  Step 6: Validate & normalize questions                              │
│    const questions = questionsRaw                                    │
│      .map(q => {                                                      │
│        if (!q.question || !q.options) return null;                  │
│        return {                                                       │
│          question: q.question,                                        │
│          options: q.options.slice(0, 4),                             │
│          correctAnswer: q.correctAnswer                              │
│        };                                                             │
│      })                                                               │
│      .filter(Boolean);                                                │
│                                                                       │
│  Result: 20 validated question objects                               │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│            BACKEND: SAVE TO MONGODB                                  │
│                                                                       │
│  Step 7: Create evaluation document                                  │
│    const evalDoc = await SkillEvaluation.create({                   │
│      userId: "guest",                                                 │
│      skillName: "Python",                                            │
│      difficulty: "intermediate",                                     │
│      questions: [...20 questions...],                                │
│      totalQuestions: 20,                                             │
│      status: "in-progress",                                          │
│      createdAt: Date.now()                                           │
│    });                                                                │
│                                                                       │
│  MongoDB Response:                                                    │
│    ├─ _id: ObjectId("65f8a9b2c3d4e5f6a7b8c9d0")                    │
│    └─ Document saved successfully                                    │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│            BACKEND: SEND HTTP RESPONSE                               │
│                                                                       │
│  res.json({                                                           │
│    evaluationId: "65f8a9b2c3d4e5f6a7b8c9d0",                        │
│    skillName: "Python",                                              │
│    difficulty: "intermediate",                                       │
│    questions: [                                                       │
│      {                                                                │
│        question: "What is a list comprehension in Python?",          │
│        options: ["A", "B", "C", "D"],                                │
│        correctAnswer: "A"                                             │
│      },                                                               │
│      ... 19 more questions ...                                        │
│    ],                                                                 │
│    totalQuestions: 20,                                               │
│    evaluatedAt: "2026-02-20T12:00:00.000Z"                          │
│  })                                                                   │
│                                                                       │
│  Status: 200 OK                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│            FRONTEND: PROCESS RESPONSE                                │
│                                                                       │
│  async function generateQuestions() {                                │
│    const response = await fetch(...);                                │
│    const data = await response.json();                               │
│                                                                       │
│    // Normalize to frontend format                                   │
│    const normalized = data.questions.map((q, index) => ({            │
│      id: index + 1,                                                   │
│      question: q.question,                                            │
│      options: {                                                       │
│        A: q.options[0],                                               │
│        B: q.options[1],                                               │
│        C: q.options[2],                                               │
│        D: q.options[3]                                                │
│      },                                                               │
│      correctAnswer: q.correctAnswer,                                 │
│      topic: courseName                                                │
│    }));                                                               │
│                                                                       │
│    return normalized;                                                 │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│            FRONTEND: RENDER UI                                       │
│                                                                       │
│  displayQuestions(questions, courseName) {                           │
│    // Hide loading screen                                            │
│    loadingSection.classList.add('hidden');                           │
│                                                                       │
│    // Show test section                                              │
│    testSection.classList.remove('hidden');                           │
│                                                                       │
│    // Render each question                                           │
│    questions.forEach((q, index) => {                                 │
│      // Create question card HTML                                    │
│      // Add radio buttons for options                                │
│      // Attach event listeners                                       │
│    });                                                                │
│  }                                                                    │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    USER SEES TEST                                    │
│  ✅ 20 questions displayed                                           │
│  ✅ Multiple choice options (A, B, C, D)                             │
│  ✅ Progress bar at 0/20                                             │
│  ✅ Submit button (disabled until all answered)                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Timeline with Response Times

```
Time 0ms:    User clicks "Attempt Test"
Time 10ms:   Frontend sends POST request
Time 15ms:   Backend receives request
Time 20ms:   Validation passes
Time 25ms:   Gemini API call initiated
             
             ... WAITING FOR GEMINI ...
             (This takes 5-15 seconds)
             
Time 8000ms: Gemini returns response
Time 8010ms: Backend parses JSON
Time 8020ms: Questions validated (20 valid)
Time 8030ms: MongoDB create operation initiated
Time 8250ms: MongoDB document saved
Time 8260ms: Backend sends response
Time 8280ms: Frontend receives data
Time 8290ms: Questions normalized
Time 8350ms: UI renders 20 questions
Time 8400ms: User sees test screen

Total Time: ~8.4 seconds
```

---

## Error Scenarios & Response Codes

### **Scenario 1: Missing Skill Name**
```
Request:  { "difficulty": "medium" }
Response: Status 400
{
  "error": "Skill name is required"
}
Time: ~5ms
```

### **Scenario 2: Missing API Key**
```
Environment: GEMINI_API_KEY not set
Response: Status 500
{
  "error": "GEMINI_API_KEY is not configured"
}
Time: ~10ms
```

### **Scenario 3: Invalid Gemini Model**
```
Code: genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
Response: Status 500
{
  "error": "[GoogleGenerativeAI Error]: 
   [404 Not Found] models/gemini-1.5-pro is not found"
}
Time: ~2000ms (includes API call time)
```

### **Scenario 4: MongoDB Connection Failed**
```
Issue: Cannot connect to MongoDB Atlas
Response: Status 500
{
  "error": "MongoNetworkError: failed to connect"
}
Time: ~5000ms (timeout)
```

### **Scenario 5: Gemini JSON Parse Error**
```
Issue: Gemini returns invalid JSON format
Response: Status 500
{
  "error": "Failed to parse questions from API response"
}
Time: ~8000ms
```

### **Scenario 6: CORS Error (Client-side)**
```
Issue: Origin not in whitelist
Console: "Access to fetch... has been blocked by CORS policy"
Network: Request fails before reaching server
Time: ~50ms
```

---

## Network Inspector Breakdown

### **Successful Request in Browser DevTools**

#### **Request Headers:**
```
POST /api/skills/evaluate HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Origin: http://localhost:3001
Content-Length: 89
```

#### **Request Payload:**
```json
{
  "skillName": "Python",
  "difficulty": "intermediate",
  "questionCount": 20,
  "userId": "guest"
}
```

#### **Response Headers:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 5432
```

#### **Response Payload:** (Truncated)
```json
{
  "evaluationId": "65f8a9b2c3d4e5f6a7b8c9d0",
  "skillName": "Python",
  "difficulty": "intermediate",
  "questions": [
    {
      "question": "What is a decorator in Python?",
      "options": [
        "A function that modifies another function",
        "A variable declaration",
        "A class method",
        "A loop structure"
      ],
      "correctAnswer": "A function that modifies another function"
    }
    // ... 19 more questions
  ],
  "totalQuestions": 20,
  "evaluatedAt": "2026-02-20T12:00:00.000Z"
}
```

---

## Backend Console Logs (During Successful Request)

```bash
📊 Skill Evaluation Request: {
  skillName: 'Python',
  difficulty: 'intermediate',
  questionCount: 20,
  userId: 'guest'
}
🤖 Initializing Gemini API...
📝 Generating 20 questions for "Python" at intermediate level...
✅ Received response from Gemini API
✅ Successfully generated 20 valid questions
✅ Created evaluation document with ID: 65f8a9b2c3d4e5f6a7b8c9d0
```

---

## Frontend Console Logs (During Successful Request)

```javascript
🚀 Starting test: { courseName: 'Python', difficulty: 'medium', apiUrl: 'http://localhost:5000' }
Starting test generation for Python at medium level (backend: intermediate)...
✅ Received data from backend: { questionCount: 20, evaluationId: '65f8a9b2c3d4e5f6a7b8c9d0' }
Generated 20 questions
```

---

## Database Operations

### **MongoDB Operation Sequence:**

1. **Connection Check**
```javascript
mongoose.connection.readyState === 1  // 1 = connected
```

2. **Create Document**
```javascript
SkillEvaluation.create({
  userId: 'guest',
  skillName: 'Python',
  difficulty: 'intermediate',
  questions: [...],
  status: 'in-progress'
})
```

3. **Index Usage**
```javascript
// Uses index: { userId: 1, createdAt: -1 }
// For fast lookups when listing user evaluations
```

4. **Document Structure in MongoDB:**
```json
{
  "_id": ObjectId("65f8a9b2c3d4e5f6a7b8c9d0"),
  "userId": "guest",
  "userEmail": null,
  "skillName": "Python",
  "title": "Python Evaluation",
  "difficulty": "intermediate",
  "questions": [
    {
      "question": "What is a decorator?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "userAnswer": null,
      "isCorrect": null
    }
  ],
  "totalQuestions": 20,
  "status": "in-progress",
  "correctAnswers": null,
  "score": null,
  "percentage": null,
  "completedAt": null,
  "createdAt": ISODate("2026-02-20T12:00:00.000Z"),
  "updatedAt": ISODate("2026-02-20T12:00:00.000Z")
}
```

---

## API Call Stack Trace

```
User Browser (localhost:3001/index.html)
  └─ script.js
     └─ startTest()
        └─ generateQuestions("Python", "intermediate")
           └─ fetch("http://localhost:5000/api/skills/evaluate", {
                method: "POST",
                body: JSON.stringify({...})
              })
              
              ↓ HTTP Request over Network
              
Express Server (localhost:5000)
  └─ server.js
     └─ app.use('/api/skills', skillEvalRoutes)
        └─ routes/skillEval.js
           └─ router.post('/evaluate', async (req, res) => {
                
                ↓ External API Call
                
                Google Gemini API
                  └─ generativelanguage.googleapis.com
                     └─ /v1beta/models/gemini-1.5-flash:generateContent
                        
                        ↓ Returns JSON
                        
                Parse & Validate
                  ↓
                MongoDB (Atlas Cloud)
                  └─ Database: careersync
                     └─ Collection: skillevaluations
                        └─ Document.create()
                           
                           ↓ Success
                           
                res.json({ evaluationId, questions, ... })
              })
              
              ↓ HTTP Response over Network
              
User Browser
  └─ Promise resolves
     └─ data = await response.json()
        └─ displayQuestions(data.questions)
           └─ User sees test
```

---

## Key Takeaways

1. **Single API Call:** The entire question generation uses ONE POST request to `/api/skills/evaluate`

2. **Long Response Time:** Due to Gemini API processing (5-15 seconds)

3. **No Polling:** Frontend waits for complete response (not streaming)

4. **Database State:** Document created immediately with `status: 'in-progress'`

5. **Error Propagation:** Errors from Gemini → Backend → Frontend → User alert

6. **Model Version Critical:** Must use `gemini-1.5-flash` (not gemini-1.5-pro)

7. **CORS Required:** Frontend and backend on different ports need CORS configuration

---

**Last Updated:** February 20, 2026
