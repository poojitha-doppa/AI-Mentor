import { useState } from 'react';
import { SimulationResult } from '../types/index';
// Header removed in favor of shared header injection
import Footer from '../components/Layout/Footer';
import SimulationResults from '../components/Results/SimulationResults';
import APIConfigurationModal from '../components/Modals/APIConfigurationModal';

interface ResultsPageProps {
  result: SimulationResult;
}

export default function ResultsPage({ result }: ResultsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Shared header injected via /shared-header.js; new simulation controls remain in page body */}

      <main style={{ flex: 1 }}>
        <SimulationResults result={result} />
      </main>

      <Footer />

      <APIConfigurationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
