import styles from './StepList.module.css';

interface StepListProps {
  steps: string[];
}

function badgeClass(number: number): string {
  const digits = String(number).length;
  if (digits === 1) return styles.badge;
  return `${styles.badge} ${digits === 2 ? styles.badgeTwoDigits : styles.badgeManyDigits}`;
}

export default function StepList({ steps }: StepListProps) {
  return (
    // role="list" keeps list semantics in Safari, which drops them when list-style is none.
    <ol className={styles.list} role="list">
      {steps.map((step, index) => (
        <li key={index} className={styles.row}>
          <span className={badgeClass(index + 1)} aria-hidden="true">
            {index + 1}
          </span>
          <span className={styles.text}>{step}</span>
        </li>
      ))}
    </ol>
  );
}
