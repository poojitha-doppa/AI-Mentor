import styles from './StatsCard.module.css';

interface StatsCardProps {
  icon: React.ReactNode;
  number?: string;
  value?: string | string[];
  label: string;
  subtext?: string;
  subLabel?: string;
  status?: string;
  type: 'number' | 'value' | 'skill' | 'sources';
  isLive?: boolean;
}

export default function StatsCard({
  icon,
  number,
  value,
  label,
  subtext,
  subLabel,
  status,
  type,
  isLive,
}: StatsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>{icon}</div>

      {type === 'number' && (
        <>
          <div className={styles.number}>
            {number}
            {isLive && <span className={styles.liveIndicator}>● LIVE</span>}
          </div>
          <div className={styles.subtext}>{subtext}</div>
        </>
      )}

      {type === 'value' && (
        <>
          <div className={styles.value}>{value}</div>
          <div className={styles.subLabel}>{subLabel}</div>
        </>
      )}

      {type === 'skill' && (
        <>
          <div className={styles.skillName}>{value}</div>
          <div className={`${styles.badge} ${styles.orangeBadge}`}>{subLabel}</div>
        </>
      )}

      {type === 'sources' && (
        <>
          <div className={styles.sourcesList}>
            {Array.isArray(value) ? value.map((src: string) => (
              <span key={src} className={styles.sourceItem}>
                {src}
              </span>
            )) : (
              <span className={styles.sourceItem}>{value}</span>
            )}
          </div>
          <div className={`${styles.badge} ${styles.greenBadge}`}>{status}</div>
        </>
      )}

      <div className={styles.label}>{label}</div>
    </div>
  );
}
