import styles from './SegmentedProgress.module.css';

interface SegmentedProgressProps {
  /** Current step, starting at 1. */
  current: number;
  total: number;
  label: string;
}

export default function SegmentedProgress({ current, total, label }: SegmentedProgressProps) {
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < current ? `${styles.segment} ${styles.filled}` : styles.segment} />
      ))}
    </div>
  );
}
