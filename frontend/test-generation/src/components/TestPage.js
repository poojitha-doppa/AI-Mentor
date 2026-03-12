import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitTest as submitTestApi } from '../utils/geminiApi';
import './TestPage.css';

const TestPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const courseName = sessionStorage.getItem('courseName');
  const difficulty = sessionStorage.getItem('difficulty');

  // ✅ Fetch Questions on Load
  useEffect(() => {
    if (!courseName || !difficulty) {
      alert('Missing configuration. Redirecting to setup.');
      navigate('/');
      return;
    }

    const initializeTest = async () => {
      try {
        setLoading(true);
        
        // Get the evaluation ID and questions from sessionStorage (set by SetupPage)
        const evaluationId = sessionStorage.getItem('evaluationId');
        const storedQuestions = sessionStorage.getItem('generatedQuestions');
        
        if (!evaluationId || !storedQuestions) {
          throw new Error('Test data not found. Please start from the setup page.');
        }
        
        const questions = JSON.parse(storedQuestions);
        setQuestions(questions);
        sessionStorage.setItem('attemptId', evaluationId);
        setLoading(false);
      } catch (error) {
        alert('Error loading test questions: ' + error.message);
        navigate('/');
      }
    };

    initializeTest();
  }, [courseName, difficulty, navigate]);

  // ✅ Handle Submit (defined early to avoid hoisting issues)
  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    
    if (Object.keys(answers).length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    setSubmitted(true);

    try {
      const evaluationId = sessionStorage.getItem('attemptId');
      
      // Format answers as an array indexed by question position
      const formattedAnswers = {};
      questions.forEach((q, index) => {
        if (answers[index] !== undefined) {
          // answers[index] contains the selected option text
          formattedAnswers[index] = answers[index];
        }
      });

      // Submit to backend
      const result = await submitTestApi(evaluationId, formattedAnswers);
      
      // Store result data
      sessionStorage.setItem('testResult', JSON.stringify(result));
      sessionStorage.setItem('testQuestions', JSON.stringify(questions));
      sessionStorage.setItem('userAnswers', JSON.stringify(answers));

      // Navigate to results
      navigate(`/result/${courseId}`);
    } catch (error) {
      alert('Error submitting test: ' + error.message);
      setSubmitted(false);
    }
  }, [submitted, questions, answers, courseId, navigate]);

  // 🕒 Timer Countdown
  useEffect(() => {
    if (loading || submitted) return;

    if (timeLeft <= 0) {
      alert('⏰ Time\'s up! Submitting your test automatically.');
      handleSubmit();
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, submitted, handleSubmit]);

  // ⏱ Format Time MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ✅ Handle Option Selection
  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  // Calculate Progress
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const goHome = () => {
    const landingUrl = window.getModuleUrls ? window.getModuleUrls().landing : (window.location.hostname.includes('onrender.com') ? 'https://careersync-landing-oldo.onrender.com' : 'http://localhost:4173');
    window.location.href = landingUrl;
  };

  if (loading) {
    return (
      <div className="container-main">
        {/* Shared Header injected by shared-header.js */}
        <div className="loading-section">
          <div className="loader"></div>
          <p className="loading-text">Generating your personalized test questions...</p>
          <p className="loading-subtext">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="skilltest-container position-relative">
      {/* 🕒 Floating Timer */}
      <div className="timer-floating">
        ⏰ Time Left: {formatTime(timeLeft)}
      </div>

      {/* 🧠 Test Header */}
      <h3 className="text-center fw-bold mb-4">
        {courseName} Test - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </h3>

      {/* Progress Bar */}
      <div className="progress-section mb-4">
        <div className="progress-bar-custom">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">Answered: {answeredCount}/{questions.length}</p>
      </div>

      {/* 📋 Questions */}
      {questions.map((q, idx) => {
        const optionLetters = ['A', 'B', 'C', 'D'];
        return (
          <div key={idx} className="question-card">
            <p className="question-text">
              <strong>{idx + 1}. {q.question}</strong>
            </p>
            {(q.options || []).map((option, optIdx) => {
              const letter = optionLetters[optIdx];
              return (
                <div className="form-check mb-2" key={optIdx}>
                  <input
                    type="radio"
                    id={`q${idx}-${letter}`}
                    name={`question-${idx}`}
                    value={option}
                    checked={answers[idx] === option}
                    onChange={() => handleSelect(idx, option)}
                    className="form-check-input"
                  />
                  <label htmlFor={`q${idx}-${letter}`} className="form-check-label">
                    <strong>{letter}.</strong> {option}
                  </label>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* ✅ Submit Button */}
      <button 
        className="btn btn-submit" 
        onClick={handleSubmit}
        disabled={submitted || answeredCount === 0}
      >
        {submitted ? 'Submitting...' : 'Submit Test'}
      </button>
    </div>
  );
};

export default TestPage;
