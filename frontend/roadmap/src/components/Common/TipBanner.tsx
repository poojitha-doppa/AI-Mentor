import styles from './TipBanner.module.css';

export default function TipBanner() {
  return (
    <div className={styles.banner}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <p>Tip: Configure API keys in settings for real-time data.</p>
    </div>
  );
}
