import StepBadge from '../StepBadge/StepBadge';
import styles from './StepList.module.css';

interface StepListProps {
  steps: string[];
}

export default function StepList({ steps }: StepListProps) {
  return (
    // role="list" keeps list semantics in Safari, which drops them when list-style is none.
    <ol className={styles.list} role="list">
      {steps.map((step, index) => (
        <li key={index} className={styles.row}>
          <StepBadge number={index + 1} />
          <span className={styles.text}>{step}</span>
        </li>
      ))}
    </ol>
  );
}
