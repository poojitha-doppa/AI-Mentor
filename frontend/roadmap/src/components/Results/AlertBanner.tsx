import { useState, useEffect } from 'react';
import styles from './AlertBanner.module.css';

interface AlertBannerProps {
  alerts: string[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const [displayText, setDisplayText] = useState('');

  const fullText = alerts.join(' | ');

  useEffect(() => {
    setDisplayText(fullText + ' | ');
  }, [fullText]);

  return (
    <div className={styles.banner}>
      <div className={styles.sparkle}>✨</div>
      <div className={styles.scrollContainer}>
        <div
          className={styles.scrollText}
          style={{
            animation: `scroll ${Math.max(20, fullText.length / 5)}s linear infinite`,
          }}
        >
          {displayText}
          {displayText}
        </div>
      </div>
    </div>
  );
}
