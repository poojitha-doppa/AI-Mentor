import { useState } from 'react';
import { SimulationResult } from './types/index';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import './styles/globals.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'results'>('home');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleSimulationComplete = (result: SimulationResult) => {
    setSimulationResult(result);
    setCurrentPage('results');
  };

  return (
    <>
      {currentPage === 'home' ? (
        <HomePage onSimulationComplete={handleSimulationComplete} />
      ) : simulationResult ? (
        <ResultsPage result={simulationResult} />
      ) : null}
    </>
  );
}
