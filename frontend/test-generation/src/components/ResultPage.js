import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultPage.css';

const ResultPage = () => {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [topicAnalysis, setTopicAnalysis] = useState({});
  const [weakAreas, setWeakAreas] = useState([]);

  const courseName = sessionStorage.getItem('courseName');
  const difficulty = sessionStorage.getItem('difficulty');

  useEffect(() => {
    const testResult = JSON.parse(sessionStorage.getItem('testResult') || 'null');
    const questions = JSON.parse(sessionStorage.getItem('testQuestions') || '[]');
    const userAnswers = JSON.parse(sessionStorage.getItem('userAnswers') || '{}');

    if (!testResult || !questions.length) {
      alert('No test data found. Redirecting to home.');
      navigate('/');
      return;
    }

    // Use backend-calculated results
    setScore(testResult.correctAnswers);
    
    // Build result data for display
    const resultData = questions.map((q) => {
      const userAnswerLetter = userAnswers[q.id];
      const userAnswerText = userAnswerLetter ? q.options[userAnswerLetter] : null;
      
      // Find correct answer letter
      let correctAnswerLetter = '';
      Object.entries(q.options).forEach(([letter, text]) => {
        if (text === q.correctAnswer || testResult.weakTopics) {
          // Match will be determined by backend
          correctAnswerLetter = letter;
        }
      });

      return {
        question: q.question,
        userAnswer: userAnswerLetter,
        userAnswerText,
        correctAnswer: correctAnswerLetter,
        isCorrect: userAnswerText === q.correctAnswer,
        topic: q.topic || q.mainTopic,
        options: q.options,
      };
    });

    setResults(resultData);
    setScore(testResult.correctAnswers);

    // Calculate topic-wise analysis
    const topics = {};
    resultData.forEach((result) => {
      if (!topics[result.topic]) {
        topics[result.topic] = { total: 0, correct: 0 };
      }
      topics[result.topic].total++;
      if (result.isCorrect) topics[result.topic].correct++;
    });

    setTopicAnalysis(topics);

    // Identify weak areas (< 50%)
    const weak = Object.entries(topics)
      .filter(([topic, stats]) => stats.correct / stats.total < 0.5)
      .map(([topic, stats]) => ({
        topic,
        percentage: Math.round((stats.correct / stats.total) * 100),
      }));

    setWeakAreas(weak);
  }, [navigate]);

  const totalQuestions = results.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const handleRetake = () => {
    sessionStorage.clear();
    const landingUrl = window.getModuleUrls ? window.getModuleUrls().landing : (window.location.hostname.includes('onrender.com') ? 'https://careersync-landing-oldo.onrender.com' : 'http://localhost:4173');
    window.location.href = landingUrl;
  };

  return (
    <div className="container-main">
      {/* Shared Header injected by shared-header.js */}

      <div className="results-section">
        {/* Score Card */}
        <div className="score-card-section">
          <div className="score-circle">
            <div className="score-value">{score}/{totalQuestions}</div>
            <div className="score-percentage">{percentage}%</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="results-details">
          <h3 className="section-title">Detailed Results</h3>
          {results.map((result, idx) => (
            <div key={idx} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-number">Question {idx + 1}</div>
              <div className="result-question">{result.question}</div>
              
              <div className="result-answer user">
                <strong>Your answer:</strong>{' '}
                {result.userAnswer ? (
                  <>
                    {result.userAnswer}. {result.options[result.userAnswer]}
                  </>
                ) : (
                  'Not answered'
                )}
              </div>

              {!result.isCorrect && (
                <div className="result-answer correct-ans">
                  <strong>Correct answer:</strong> {result.correctAnswer}. {result.options[result.correctAnswer]}
                </div>
              )}

              <span className={`result-status ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>
          ))}
        </div>

        {/* Topic Analysis */}
        <div className="analysis-section">
          <h3 className="section-title">📈 Performance Analysis</h3>

          <div className="topic-breakdown">
            {Object.entries(topicAnalysis).map(([topic, stats]) => {
              const topicPercentage = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={topic} className="topic-item">
                  <div className="topic-name">📌 {topic}</div>
                  <div className="topic-score">
                    Score: {stats.correct}/{stats.total} ({topicPercentage}%)
                  </div>
                  <div className="progress-bar-custom">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${topicPercentage}%`,
                        background: topicPercentage >= 50 ? '#10b981' : '#ef4444',
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weak Areas */}
          {weakAreas.length > 0 ? (
            <div className="weak-areas">
              <h4>⚠️ Areas for Improvement</h4>
              <p className="weak-desc">Focus on these topics to enhance your knowledge:</p>
              <ul>
                {weakAreas.map(({ topic, percentage }) => (
                  <li key={topic}>
                    <strong>{topic}</strong> - Current score: {percentage}%
                    <br />
                    <em>Suggestion: Review core concepts and practice more problems</em>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="excellent-performance">
              <h4>🎉 Excellent Performance!</h4>
              <p>You've demonstrated strong understanding across all topics. Keep up the great work!</p>
            </div>
          )}
        </div>

        {/* Retake Button */}
        <button className="btn primary-btn retake-btn" onClick={handleRetake}>
          Take Another Test
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
