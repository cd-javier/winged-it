import styles from './StepBadge.module.css';

interface StepBadgeProps {
  /** The step number, starting at 1. */
  number: number;
}

function badgeClass(number: number): string {
  const digits = String(number).length;
  if (digits === 1) return styles.badge;
  return `${styles.badge} ${digits === 2 ? styles.badgeTwoDigits : styles.badgeManyDigits}`;
}

/** The numbered grey circle shown next to a step. */
export default function StepBadge({ number }: StepBadgeProps) {
  return (
    <span className={badgeClass(number)} aria-hidden="true">
      {number}
    </span>
  );
}
