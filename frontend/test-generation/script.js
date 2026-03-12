// Global State
let selectedDifficulty = null;
let currentTest = null;
let userAnswers = [];

// DOM Elements
const courseInput = document.getElementById('courseInput');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const generateBtn = document.getElementById('generateBtn');
const attemptTestBtn = document.getElementById('attemptTestBtn');
const submitTestBtn = document.getElementById('submitTestBtn');
const retakeTestBtn = document.getElementById('retakeTestBtn');

// Sections
const setupSection = document.getElementById('setupSection');
const loadingSection = document.getElementById('loadingSection');
const testSection = document.getElementById('testSection');
const resultsSection = document.getElementById('resultsSection');

// Backend API base (local vs production)
const API_BASE_URL = (typeof window.getModuleUrls === 'function')
    ? window.getModuleUrls().backend
    : (window.location.hostname.includes('localhost')
        ? 'http://localhost:5000'
        : 'https://careersync-backend-oldo.onrender.com');

// Initialize Event Listeners
function init() {
    console.log('Initializing app...');
    console.log('Found', difficultyButtons.length, 'difficulty buttons');
    
    courseInput.addEventListener('input', validateForm);
    
    difficultyButtons.forEach((btn, index) => {
        console.log(`Attaching listener to button ${index}:`, btn.getAttribute('data-level'));
        btn.addEventListener('click', function(e) {
            console.log('Button clicked:', this.getAttribute('data-level'));
            selectDifficulty(this);
        });
    });
    
    attemptTestBtn.addEventListener('click', startTest);
    submitTestBtn.addEventListener('click', submitTest);
    retakeTestBtn.addEventListener('click', resetTest);
    
    console.log('App initialized successfully');
}

// Validate form to enable/disable attempt button
function validateForm() {
    const courseName = courseInput.value.trim();
    const isValid = courseName && selectedDifficulty;
    attemptTestBtn.disabled = !isValid;
}

// Handle difficulty selection
function selectDifficulty(button) {
    console.log('selectDifficulty called with:', button.getAttribute('data-level'));
    difficultyButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    selectedDifficulty = button.getAttribute('data-level');
    console.log('selectedDifficulty set to:', selectedDifficulty);
    validateForm();
}

// Handle difficulty button click (inline onclick handler)
function handleDifficultyClick(level) {
    console.log('handleDifficultyClick called with:', level);
    selectedDifficulty = level;
    
    // Update button styling
    difficultyButtons.forEach(btn => {
        if (btn.getAttribute('data-level') === level) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    
    console.log('selectedDifficulty set to:', selectedDifficulty);
    validateForm();
}

// Start test - Generate questions via Gemini API
async function startTest() {
    const courseName = courseInput.value.trim();
    
    // Show loading screen
    setupSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    
    try {
        // Map frontend difficulty levels to backend levels
        const difficultyMap = {
            'easy': 'beginner',
            'medium': 'intermediate',
            'hard': 'advanced'
        };
        const backendDifficulty = difficultyMap[selectedDifficulty] || selectedDifficulty;
        
        console.log(`Starting test generation for ${courseName} at ${selectedDifficulty} level (backend: ${backendDifficulty})...`);
        
        // Call Gemini API to generate questions
        const questions = await generateQuestions(courseName, backendDifficulty);
        
        console.log(`Generated ${questions.length} questions`);
        
        currentTest = questions;
        userAnswers = new Array(questions.length).fill(null);
        
        // Display questions
        displayQuestions(questions, courseName);
        
        // Show test section
        loadingSection.classList.add('hidden');
        testSection.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating questions: ' + error.message);
        loadingSection.classList.add('hidden');
        setupSection.classList.remove('hidden');
    }
}

// Generate questions using backend (keeps API keys off the client)
async function generateQuestions(courseName, difficulty) {
    const response = await fetch(`${API_BASE_URL}/api/skills/evaluate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            skillName: courseName,
            difficulty,
            questionCount: 20
        })
    });

    if (!response.ok) {
        const raw = await response.text();
        let msg = response.statusText;
        let errorDetails = '';
        try {
            const errJson = JSON.parse(raw);
            msg = errJson.error || errJson.message || msg;
            errorDetails = errJson.details || '';
        } catch (_) {
            // Response wasn't JSON
            errorDetails = raw.substring(0, 200);
        }
        
        console.error('❌ Backend error:', {
            status: response.status,
            message: msg,
            details: errorDetails
        });
        
        throw new Error(`Backend error: ${response.status} - ${msg}`);
    }

    const data = await response.json();
    console.log('✅ Received data from backend:', { 
        questionCount: data.questions?.length,
        evaluationId: data.evaluationId 
    });
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('No questions received from backend');
    }

    const letters = ['A', 'B', 'C', 'D'];
    const normalized = data.questions
        .map((q, index) => {
            if (!q || !q.question || !q.options) return null;

            const optionsArray = Array.isArray(q.options)
                ? q.options
                : Object.values(q.options || {});

            if (!optionsArray || optionsArray.length < 4) return null;

            const options = {};
            letters.forEach((letter, idx) => {
                if (optionsArray[idx]) {
                    options[letter] = optionsArray[idx];
                }
            });

            let correctAnswer = q.correctAnswer || q.answer || 'A';
            if (correctAnswer && correctAnswer.length > 1) {
                const matchIndex = optionsArray.findIndex((opt) => opt === correctAnswer);
                if (matchIndex >= 0 && letters[matchIndex]) {
                    correctAnswer = letters[matchIndex];
                }
            }

            if (!options.A || !options.B || !options.C || !options.D) return null;

            return {
                id: q.id || index + 1,
                question: q.question,
                options,
                correctAnswer,
                topic: q.topic || courseName
            };
        })
        .filter(Boolean);

    if (normalized.length === 0) {
        throw new Error('Backend returned invalid question format');
    }

    return normalized;
}

// Display questions in the UI
function displayQuestions(questions, courseName) {
    const container = document.getElementById('questionsContainer');
    const testTitle = document.getElementById('testTitle');
    const totalQuestions = questions.length;
    
    testTitle.textContent = `${courseName} - ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Level Test`;
    container.innerHTML = '';
    
    questions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.innerHTML = `
            <div class="question-number">Question ${index + 1} of ${totalQuestions}</div>
            <div class="question-text">${q.question}</div>
            <div class="options-container">
                ${Object.entries(q.options).map(([key, value]) => `
                    <label class="option-label">
                        <input type="radio" name="question${index}" value="${key}" onchange="handleAnswerChange(${index}, '${key}')">
                        <span class="option-text"><strong>${key}.</strong> ${value}</span>
                    </label>
                `).join('')}
            </div>
        `;
        container.appendChild(questionCard);
    });
}

// Handle answer selection
function handleAnswerChange(questionIndex, answer) {
    userAnswers[questionIndex] = answer;
    updateProgress();
    
    // Enable submit button if all questions answered
    const allAnswered = userAnswers.every(answer => answer !== null);
    submitTestBtn.disabled = !allAnswered;
}

// Update progress bar
function updateProgress() {
    const answered = userAnswers.filter(a => a !== null).length;
    const total = currentTest.length;
    const percentage = (answered / total) * 100;
    
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressText').textContent = `Answered: ${answered}/${total}`;
}

// Submit test and show results
function submitTest() {
    // Calculate score
    let correctCount = 0;
    const results = currentTest.map((q, index) => {
        const isCorrect = userAnswers[index] === q.correctAnswer;
        if (isCorrect) correctCount++;
        
        return {
            question: q.question,
            userAnswer: userAnswers[index],
            correctAnswer: q.correctAnswer,
            isCorrect: isCorrect,
            topic: q.topic,
            options: q.options
        };
    });
    
    // Display results
    displayResults(correctCount, results);
    
    // Show results section
    testSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
}

// Display results with analysis
function displayResults(correctCount, results) {
    const totalQuestions = results.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Update score display
    document.getElementById('scoreValue').textContent = `${correctCount}/${totalQuestions}`;
    document.getElementById('scorePercentage').textContent = `${percentage}%`;
    
    // Display detailed results
    const resultsDetails = document.getElementById('resultsDetails');
    resultsDetails.innerHTML = '<h3 style="color: #333; margin-bottom: 20px;">Detailed Results</h3>';
    
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
        
        const userAnswerText = result.userAnswer ? result.options[result.userAnswer] : 'Not answered';
        const correctAnswerText = result.options[result.correctAnswer];
        
        resultItem.innerHTML = `
            <div class="question-number">Question ${index + 1}</div>
            <div class="result-question">${result.question}</div>
            <div class="result-answer user"><strong>Your answer:</strong> ${result.userAnswer}. ${userAnswerText}</div>
            ${!result.isCorrect ? `<div class="result-answer correct"><strong>Correct answer:</strong> ${result.correctAnswer}. ${correctAnswerText}</div>` : ''}
            <span class="result-status ${result.isCorrect ? 'correct' : 'incorrect'}">
                ${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
        `;
        
        resultsDetails.appendChild(resultItem);
    });
    
    // Display topic-wise analysis
    displayAnalysis(results, correctCount, totalQuestions);
}

// Display topic-wise analysis and weak areas
function displayAnalysis(results, correctCount, totalQuestions) {
    const analysisSection = document.getElementById('analysisSection');
    
    // Group results by topic
    const topicStats = {};
    results.forEach(result => {
        if (!topicStats[result.topic]) {
            topicStats[result.topic] = {
                total: 0,
                correct: 0
            };
        }
        topicStats[result.topic].total++;
        if (result.isCorrect) {
            topicStats[result.topic].correct++;
        }
    });
    
    // Identify weak areas (less than 50% correct)
    const weakTopics = Object.entries(topicStats)
        .filter(([topic, stats]) => (stats.correct / stats.total) < 0.5)
        .map(([topic, stats]) => ({
            topic,
            percentage: Math.round((stats.correct / stats.total) * 100)
        }));
    
    // Build analysis HTML
    let analysisHTML = '<h3>📈 Performance Analysis</h3>';
    
    // Topic-wise breakdown
    analysisHTML += '<div style="margin-top: 20px;">';
    Object.entries(topicStats).forEach(([topic, stats]) => {
        const percentage = Math.round((stats.correct / stats.total) * 100);
        analysisHTML += `
            <div class="topic-analysis">
                <div class="topic-name">📌 ${topic}</div>
                <div class="topic-score">Score: ${stats.correct}/${stats.total} (${percentage}%)</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background: ${percentage >= 50 ? '#10b981' : '#ef4444'}"></div>
                </div>
            </div>
        `;
    });
    analysisHTML += '</div>';
    
    // Weak areas and suggestions
    if (weakTopics.length > 0) {
        analysisHTML += `
            <div class="weak-areas">
                <h4>⚠️ Areas for Improvement</h4>
                <p style="margin-bottom: 15px; color: #856404;">Focus on these topics to enhance your knowledge:</p>
                <ul>
                    ${weakTopics.map(({ topic, percentage }) => 
                        `<li><strong>${topic}</strong> - Current score: ${percentage}%
                        <br><em style="font-size: 0.9rem;">Suggestion: Review core concepts and practice more problems</em></li>`
                    ).join('')}
                </ul>
            </div>
        `;
    } else {
        analysisHTML += `
            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h4 style="color: #065f46; margin-bottom: 10px;">🎉 Excellent Performance!</h4>
                <p style="color: #065f46;">You've demonstrated strong understanding across all topics. Keep up the great work!</p>
            </div>
        `;
    }
    
    analysisSection.innerHTML = analysisHTML;
}

// Reset test to take another one
function resetTest() {
    selectedDifficulty = null;
    currentTest = null;
    userAnswers = [];
    
    courseInput.value = '';
    difficultyButtons.forEach(btn => btn.classList.remove('selected'));
    attemptTestBtn.disabled = true;
    
    resultsSection.classList.add('hidden');
    setupSection.classList.remove('hidden');
}


// Make functions globally accessible
window.handleAnswerChange = handleAnswerChange;
window.handleDifficultyClick = handleDifficultyClick;

// Initialize app
init();
