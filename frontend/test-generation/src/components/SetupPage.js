import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../utils/geminiApi';
import './SetupPage.css';

const SetupPage = () => {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = ['Python', 'Data Structures', 'Machine Learning', 'JavaScript', 'React', 'Java'];

  const handleSubmit = async () => {
    if (!courseName || !difficulty) {
      alert('Please select a topic and difficulty level');
      return;
    }

    try {
      setLoading(true);
      sessionStorage.setItem('courseName', courseName);
      sessionStorage.setItem('difficulty', difficulty);

      // Generate questions and store the result
      const result = await generateQuestions(courseName, difficulty);
      
      // Store the evaluation data for TestPage to use
      if (result && result.evaluationId) {
        sessionStorage.setItem('evaluationId', result.evaluationId);
        sessionStorage.setItem('generatedQuestions', JSON.stringify(result.questions || []));
      }

      const courseId = courseName.toLowerCase().replace(/\s+/g, '-');
      navigate(`/test/${courseId}`);
    } catch (error) {
      alert('Error generating questions: ' + error.message);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && courseName && difficulty && !loading) {
      handleSubmit();
    }
  };

  const goHome = () => {
    const landingUrl = window.getModuleUrls ? window.getModuleUrls().landing : (window.location.hostname.includes('onrender.com') ? 'https://careersync-landing-oldo.onrender.com' : 'http://localhost:4173');
    window.location.href = landingUrl;
  };

  return (
    <div className="unfold-container">
      {/* Shared Header injected by shared-header.js */}

      {/* Main Content */}
      <main className="unfold-main">
        <h1 className="main-heading">What do you wanna learn - your way?</h1>
        
        {loading && (
          <div className="loading-message">
            <p>Generating your personalized test questions...</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>This may take a few moments</p>
          </div>
        )}
        
        {/* Search Input */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Create a course for your topic from here..."
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button 
            className="search-btn" 
            onClick={handleSubmit}
            disabled={!courseName || !difficulty || loading}
          >
            {loading ? '⟳' : '→'}
          </button>
        </div>

        {/* Suggestions */}
        <div className="suggestions">
          {suggestions.map((topic) => (
            <button
              key={topic}
              className="suggestion-chip"
              onClick={() => setCourseName(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Difficulty Selection */}
        <div className="difficulty-selector">
          <p className="difficulty-label">Select difficulty level:</p>
          <div className="difficulty-chips">
            <button
              className={`difficulty-chip ${difficulty === 'beginner' ? 'active' : ''}`}
              onClick={() => setDifficulty('beginner')}
            >
              Beginner
            </button>
            <button
              className={`difficulty-chip ${difficulty === 'intermediate' ? 'active' : ''}`}
              onClick={() => setDifficulty('intermediate')}
            >
              Intermediate
            </button>
            <button
              className={`difficulty-chip ${difficulty === 'advanced' ? 'active' : ''}`}
              onClick={() => setDifficulty('advanced')}
            >
              Advanced
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SetupPage;
