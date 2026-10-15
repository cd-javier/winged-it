import type { ReactNode } from 'react';

import styles from './IconCircle.module.css';

interface IconCircleProps {
  icon: ReactNode;
  className?: string;
}

/** Decorative accent circle with an icon. Not interactive: wrap it in a button or link if needed. */
export default function IconCircle({ icon, className }: IconCircleProps) {
  return (
    <span
      className={className ? `${styles.circle} ${className}` : styles.circle}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
