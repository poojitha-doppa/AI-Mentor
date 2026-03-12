const API_BASE_URL = (typeof window.getModuleUrls === 'function')
    ? window.getModuleUrls().backend + '/api'
    : (typeof window !== 'undefined' && window.location?.hostname?.includes('onrender.com')
        ? 'https://careersync-backend-oldo.onrender.com/api'
        : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api'));

/**
 * Generate and store questions using backend API
 * @param {string} skillName - Name of the skill/course
 * @param {string} difficulty - Difficulty level (beginner/intermediate/advanced)
 * @returns {Promise<Object>} Generation result with questions
 */
export async function generateQuestions(skillName, difficulty) {
  try {
    console.log(`Generating questions for ${skillName} at ${difficulty} level...`);
    console.log(`API URL: ${API_BASE_URL}`);
    
    // Call backend API to generate questions
    const response = await fetch(`${API_BASE_URL}/skills/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skillName,
        difficulty: difficulty || 'intermediate',
        questionCount: 20,
        userId: sessionStorage.getItem('guestUserId') || 'guest-' + Date.now(),
        userEmail: sessionStorage.getItem('userEmail') || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error:', errorData);
      throw new Error(errorData.error || errorData.message || `Failed to generate questions (${response.status})`);
    }

    const data = await response.json();
    console.log(`Generated ${data.totalQuestions} questions`);
    return data;

  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

/**
 * Submit test answers and get score
 */
export async function submitTest(evaluationId, answers) {
  try {
    const response = await fetch(`${API_BASE_URL}/skills/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        evaluationId, 
        answers,
        userId: sessionStorage.getItem('guestUserId') || 'guest',
        userEmail: sessionStorage.getItem('userEmail') || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to submit test');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting test:', error);
    throw error;
  }
}

/**
 * Get evaluation details by ID
 */
export async function getAttemptById(evaluationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/skills/${evaluationId}`);
    if (!response.ok) throw new Error('Failed to fetch evaluation');
    return await response.json();
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    throw error;
  }
}

/**
 * Get all skills
 */
export async function getSkills() {
  try {
    const response = await fetch(`${API_BASE_URL}/skills`);
    if (!response.ok) throw new Error('Failed to fetch skills');
    return await response.json();
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
}

/**
 * Get user test history
 */
export async function getUserTests(userId, skillId) {
  try {
    const response = await fetch(`${API_BASE_URL}/skills/${skillId}`);
    if (!response.ok) throw new Error('Failed to fetch test history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching test history:', error);
    throw error;
  }
}
