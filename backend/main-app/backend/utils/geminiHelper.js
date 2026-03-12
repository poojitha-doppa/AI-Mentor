import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Get a working Gemini model by trying multiple model names
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<{success: boolean, model?: any, modelName?: string, error?: string}>}
 */
export async function getWorkingGeminiModel(apiKey) {
  if (!apiKey) {
    return { success: false, error: 'API key is required' };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try models in order of preference
  const modelsToTry = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-pro',
    'gemini-1.5-pro-latest'
  ];
  
  console.log('🔍 Finding working Gemini model...');
  
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      console.log(`🧪 Testing: ${modelName}`);
      
      // Quick validation test
      const testResult = await model.generateContent('Test');
      await testResult.response.text();
      
      console.log(`✅ Working model found: ${modelName}`);
      return { success: true, model, modelName, genAI };
    } catch (error) {
      console.log(`❌ ${modelName}: ${error.message.substring(0, 80)}...`);
    }
  }
  
  console.error('❌ No working Gemini models available');
  return { 
    success: false, 
    error: 'Unable to find a working Gemini model. Please check API key and quota.' 
  };
}

/**
 * Initialize Gemini API and get a working model
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<{genAI: GoogleGenerativeAI, model: any, modelName: string} | null>}
 */
export async function initGemini(apiKey) {
  const result = await getWorkingGeminiModel(apiKey);
  if (!result.success) {
    throw new Error(result.error);
  }
  return { genAI: result.genAI, model: result.model, modelName: result.modelName };
}
