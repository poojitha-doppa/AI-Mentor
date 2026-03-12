import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SkillEvaluation from '../models/SkillEvaluation.js';
import { getWorkingGeminiModel } from '../utils/geminiHelper.js';

const router = express.Router();

// Save/Create a skill evaluation
router.post('/', async (req, res) => {
  try {
    const { user, userId, userEmail, skillName, title, difficulty, questions, score, percentage, feedback, status, completedAt } = req.body;

    if (!skillName && !title) {
      return res.status(400).json({ error: 'Skill name or title is required' });
    }

    // Handle user field properly
    let userObjectId = null;
    if (user && user !== 'guest' && mongoose.Types.ObjectId.isValid(user)) {
      userObjectId = user;
    }

    const evaluation = await SkillEvaluation.create({
      user: userObjectId,
      userId: userId || (user === 'guest' ? 'guest' : user),
      userEmail: userEmail || null,
      skillName: skillName || title || '',
      title: title || skillName || '',
      difficulty: difficulty || 'intermediate',
      questions: questions || [],
      totalQuestions: questions ? questions.length : 0,
      score: score || 0,
      percentage: percentage || 0,
      feedback: feedback || '',
      status: status || 'completed',
      completedAt: completedAt || (status === 'completed' ? new Date() : null)
    });

    res.status(201).json({ success: true, evaluationId: evaluation._id, data: evaluation });
  } catch (error) {
    console.error('Evaluation creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper: Parse and validate Gemini response
function parseGeminiResponse(responseText, skillName, expectedCount) {
  console.log(`📦 Gemini response length: ${responseText.length} chars`);
  console.log(`📄 First 300 chars: ${responseText.substring(0, 300)}`);

  // Extract JSON array from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('❌ No JSON array found in response');
    return { success: false, error: 'No JSON array in response' };
  }

  let questionsRaw;
  try {
    questionsRaw = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('❌ JSON parse error:', parseError.message);
    return { success: false, error: 'Invalid JSON format' };
  }

  if (!Array.isArray(questionsRaw)) {
    console.error('❌ Response is not an array');
    return { success: false, error: 'Response is not an array' };
  }

  if (questionsRaw.length === 0) {
    console.error('❌ Empty questions array');
    return { success: false, error: 'No questions generated' };
  }

  // Validate and normalize each question
  const questions = questionsRaw
    .map((q, idx) => {
      if (!q || typeof q !== 'object') {
        console.warn(`⚠️ Question ${idx + 1}: Not an object`);
        return null;
      }

      if (!q.question || typeof q.question !== 'string') {
        console.warn(`⚠️ Question ${idx + 1}: Missing or invalid question text`);
        return null;
      }

      let opts = q.options;
      if (!Array.isArray(opts)) {
        if (typeof opts === 'object') {
          opts = Object.values(opts);
        } else {
          console.warn(`⚠️ Question ${idx + 1}: Invalid options format`);
          return null;
        }
      }

      if (opts.length < 4) {
        console.warn(`⚠️ Question ${idx + 1}: Less than 4 options (${opts.length})`);
        return null;
      }

      const correctAnswer = q.correctAnswer || q.answer || opts[0];
      
      // Ensure correctAnswer matches one of the options
      if (!opts.includes(correctAnswer)) {
        console.warn(`⚠️ Question ${idx + 1}: correctAnswer not in options, using first option`);
      }

      return {
        question: q.question.trim(),
        options: opts.slice(0, 4).map(opt => String(opt).trim()),
        correctAnswer: opts.includes(correctAnswer) ? correctAnswer : opts[0]
      };
    })
    .filter(Boolean);

  console.log(`✅ Validated ${questions.length}/${questionsRaw.length} questions`);

  if (questions.length === 0) {
    return { success: false, error: 'All questions failed validation' };
  }

  return { success: true, questions };
}

// Helper: Generate questions with retry logic
async function generateQuestionsWithRetry(apiKey, skillName, difficulty, questionCount, maxRetries = 1) {
  // Get a working Gemini model
  const modelResult = await getWorkingGeminiModel(apiKey);
  
  if (!modelResult.success) {
    console.error('❌ Failed to initialize Gemini:', modelResult.error);
    return { success: false, error: modelResult.error };
  }
  
  const { model, modelName } = modelResult;
  console.log(`🚀 Using model: ${modelName}`);
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const isRetry = attempt > 0;
    
    if (isRetry) {
      console.log(`🔄 Retry attempt ${attempt}/${maxRetries}...`);
    }

    // Construct strict prompt
    const prompt = isRetry
      ? `You must respond with ONLY a valid JSON array. No explanations, no markdown, no code blocks.

Generate exactly ${questionCount} multiple-choice questions about "${skillName}" at ${difficulty} level.

Response format (STRICT):
[{"question":"Question text?","options":["Option 1","Option 2","Option 3","Option 4"],"correctAnswer":"Option 1"}]

Each question must have:
- "question": String (the question text)
- "options": Array of exactly 4 strings
- "correctAnswer": String that matches one of the options exactly

Generate ${questionCount} questions now as a JSON array:`
      : `Generate ${questionCount} multiple-choice questions for evaluating "${skillName}" at ${difficulty} level.

CRITICAL: Your response must be ONLY a valid JSON array. Do not include markdown, explanations, or any other text.

Required format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]

Each question must have exactly 4 options, and correctAnswer must match one option exactly.
Return ONLY the JSON array with ${questionCount} questions:`;

    try {
      console.log(`📝 Generating ${questionCount} questions for "${skillName}" at ${difficulty} level...`);
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      console.log('✅ Received response from Gemini API');
      
      const parseResult = parseGeminiResponse(responseText, skillName, questionCount);
      
      if (parseResult.success) {
        return { success: true, questions: parseResult.questions };
      }
      
      console.error(`❌ Attempt ${attempt + 1} failed: ${parseResult.error}`);
      
      if (attempt === maxRetries) {
        return { success: false, error: parseResult.error };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (apiError) {
      console.error(`❌ Gemini API error on attempt ${attempt + 1}:`, apiError.message);
      
      if (attempt === maxRetries) {
        return { success: false, error: `Gemini API error: ${apiError.message}` };
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

// Generate skill evaluation questions and persist
router.post('/evaluate', async (req, res) => {
  const { skillName, difficulty, questionCount, userId, userEmail } = req.body;

  console.log('📊 Skill Evaluation Request:', { skillName, difficulty, questionCount, userId: userId || 'guest' });

  // Validation
  if (!skillName) {
    console.error('❌ Missing skillName parameter');
    return res.status(400).json({ error: 'Skill name is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not configured in environment');
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured. Please contact administrator.' });
  }

  const qCount = questionCount || 20;
  const diff = difficulty || 'intermediate';

  try {
    console.log('🤖 Initializing Gemini API...');
    
    // Generate questions with retry logic
    const result = await generateQuestionsWithRetry(process.env.GEMINI_API_KEY, skillName, diff, qCount, 1);
    
    if (!result.success) {
      console.error('❌ Question generation failed after retries:', result.error);
      return res.status(502).json({ 
        error: 'Failed to generate questions from AI service',
        message: 'The AI service returned an invalid response. Please try again.',
        details: result.error
      });
    }

    const questions = result.questions;

    if (questions.length < Math.floor(qCount / 2)) {
      console.warn(`⚠️ Generated only ${questions.length}/${qCount} questions`);
      return res.status(502).json({
        error: 'Insufficient questions generated',
        message: `Only ${questions.length} valid questions generated. Expected ${qCount}.`,
        details: 'AI service did not generate enough valid questions'
      });
    }

    console.log(`✅ Successfully generated ${questions.length} valid questions`);

    // Handle user field properly for MongoDB
    let userObjectId = null;
    if (userId && userId !== 'guest' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = userId;
    }

    // Save to database
    const evalDoc = await SkillEvaluation.create({
      user: userObjectId,
      userId: userId || 'guest',
      userEmail: userEmail || null,
      skillName,
      title: `${skillName} Evaluation`,
      difficulty: diff,
      questions,
      totalQuestions: questions.length,
      status: 'in-progress'
    });

    console.log(`✅ Created evaluation document with ID: ${evalDoc._id}`);

    // Return clean response
    res.json({ 
      evaluationId: evalDoc._id,
      skillName,
      difficulty: diff,
      questions,
      totalQuestions: questions.length,
      evaluatedAt: new Date()
    });

  } catch (error) {
    // Catch-all for unexpected errors (database, network, etc.)
    console.error('❌ Unexpected error in /evaluate endpoint:', error);
    console.error('Error stack:', error.stack);
    
    // Don't expose internal errors to client
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Submit evaluation answers and score
router.post('/submit', async (req, res) => {
  const { evaluationId, answers } = req.body;

  if (!evaluationId || !answers) {
    return res.status(400).json({ error: 'evaluationId and answers are required' });
  }

  try {
    const evalDoc = await SkillEvaluation.findById(evaluationId);
    if (!evalDoc) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    let correct = 0;
    const updatedQuestions = evalDoc.questions.map((q, idx) => {
      const userAnswer = answers[idx] || answers[q.question];
      const isCorrect = userAnswer && userAnswer === q.correctAnswer;
      if (isCorrect) correct += 1;
      return { ...q.toObject(), userAnswer, isCorrect };
    });

    const totalQuestions = updatedQuestions.length || 1;
    const score = (correct / totalQuestions) * 100;
    const percentage = Math.round(score);

    evalDoc.questions = updatedQuestions;
    evalDoc.score = score;
    evalDoc.percentage = percentage;
    evalDoc.correctAnswers = correct;
    evalDoc.status = 'completed';
    evalDoc.completedAt = new Date();
    await evalDoc.save();

    res.json({
      evaluationId,
      score,
      percentage,
      correct,
      total: totalQuestions,
      status: 'completed'
    });
  } catch (error) {
    console.error('Evaluation submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List evaluations for a user
router.get('/', async (req, res) => {
  try {
    const { userId, userEmail } = req.query;
    
    let filter = {};
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId) && userId !== 'guest') {
        filter = { user: userId };
      } else {
        filter = { userId: userId };
      }
    } else if (userEmail) {
      filter = { userEmail: userEmail };
    }
    
    const evaluations = await SkillEvaluation.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, evaluations, count: evaluations.length });
  } catch (error) {
    console.error('Evaluations fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single evaluation by ID
router.get('/:id', async (req, res) => {
  try {
    const evaluation = await SkillEvaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    res.json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Evaluation fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
