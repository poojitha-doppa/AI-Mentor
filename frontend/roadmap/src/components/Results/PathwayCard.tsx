import { useState } from 'react';
import { Pathway } from '../../types/index';
import styles from './PathwayCard.module.css';

interface PathwayCardProps {
  pathway: Pathway;
}

export default function PathwayCard({ pathway }: PathwayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty: 'MEDIUM' | 'HIGH') => {
    return difficulty === 'HIGH' ? styles.highDifficulty : styles.mediumDifficulty;
  };

  const handleApplyNow = () => {
    // Use real job URL if available, otherwise fallback to LinkedIn search
    const jobUrl = pathway.jobUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(pathway.role)}`;
    window.open(jobUrl, '_blank');
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${getDifficultyColor(pathway.difficulty)}`}>
              {pathway.difficulty}
            </span>
          </div>
          <div className={styles.dataSourceRow}>
            <a href="#" className={styles.dataSource}>
              📍 {pathway.dataSource}
            </a>
          </div>
        </div>
        <button
          className={`${styles.expandBtn} ${isExpanded ? styles.expanded : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          ▼
        </button>
      </div>

      <div className={`${styles.cardTitle} ${isExpanded ? styles.expanded : ''}`}>
        {pathway.company} - {pathway.role}
      </div>

      <div className={styles.cardDetails}>
        <div className={styles.detail}>
          <span className={styles.label}>Salary</span>
          <span className={styles.value}>{pathway.salary}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Timeline</span>
          <span className={styles.value}>{pathway.timeline}</span>
        </div>
      </div>

      <p className={styles.description}>{pathway.description}</p>

      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Real-Time Market Signals</h4>
            <div className={styles.marketSignals}>
              <div>
                <span className={styles.label}>Active Listings</span>
                <div className={styles.value}>{pathway.activeListings} jobs found</div>
              </div>
              <div>
                <span className={styles.label}>Demand Level</span>
                <div className={styles.value}>{pathway.demandLevel}</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Execution Roadmap</h4>
            <div className={styles.roadmap}>
              {pathway.roadmap.map((step, index) => (
                <div key={step.id} className={styles.step}>
                  <div className={styles.stepCircle}>{index + 1}</div>
                  <div className={styles.stepContent}>
                    <h5 className={styles.stepTitle}>{step.title}</h5>
                    <p className={styles.stepDescription}>{step.description}</p>
                    <div className={styles.stepMeta}>
                      <span className={styles.duration}>⏱ {step.duration}</span>
                      <span className={`${styles.badge} ${styles.typeBadge}`}>
                        {step.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className={styles.applyBtn} onClick={handleApplyNow}>
            Apply Now ↗
          </button>
        </div>
      )}
    </div>
  );
}
