import { useState, useEffect } from 'react';
import styles from './APIConfigurationModal.module.css';

interface APIConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function APIConfigurationModal({ isOpen, onClose }: APIConfigurationModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('jsearchApiKey');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('jsearchApiKey', apiKey);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24" />
            </svg>
            API Configuration
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.infoBox}>
            To fetch real-time job data from LinkedIn, Indeed, and Naukri, you need a JSearch API Key (via RapidAPI).
          </div>

          <a
            href="https://rapidapi.com/api-sports/api/jsearch"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Get a free key here →
          </a>

          <div className={styles.inputGroup}>
            <label htmlFor="apiKey" className={styles.label}>
              RapidAPI Key (JSearch)
            </label>
            <input
              id="apiKey"
              type="password"
              placeholder="e.g. 9a8b7c6d5e..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={styles.input}
            />
          </div>

          <button
            className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
            onClick={handleSave}
          >
            {isSaved ? '✓ Saved' : 'Save Configuration'}
          </button>

          <p className={styles.footer}>
            Your key is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
