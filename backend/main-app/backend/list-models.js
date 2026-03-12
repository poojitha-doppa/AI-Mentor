import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    console.log('🔍 Checking available Gemini models...\n');
    console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}\n`);
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error(`❌ Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Available Models:\n');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model) => {
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`   ✓ ${model.name}`);
          console.log(`      Display: ${model.displayName}`);
          console.log(`      Methods: ${model.supportedGenerationMethods.join(', ')}\n`);
        }
      });
    } else {
      console.log('No models found!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
