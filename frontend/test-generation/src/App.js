import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupPage from './components/SetupPage';
import TestPage from './components/TestPage';
import ResultPage from './components/ResultPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/test/:courseId" element={<TestPage />} />
          <Route path="/result/:courseId" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
