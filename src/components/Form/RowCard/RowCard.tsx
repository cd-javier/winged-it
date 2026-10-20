import type { ReactNode } from 'react';

import styles from './RowCard.module.css';

interface RowCardProps {
  /** Shows the error outline (the card carries the error for the controls inside it). */
  invalid?: boolean;
  children: ReactNode;
}

/** The white card behind an ingredient or step row. Shows focus while any control inside it has focus. */
export default function RowCard({ invalid, children }: RowCardProps) {
  return <div className={invalid ? `${styles.card} ${styles.invalid}` : styles.card}>{children}</div>;
}
