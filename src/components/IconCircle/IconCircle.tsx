import type { ReactNode } from 'react';

import styles from './IconCircle.module.css';

export type IconCircleVariant = 'accent' | 'warning' | 'error';

interface IconCircleProps {
  icon: ReactNode;
  variant?: IconCircleVariant;
  className?: string;
}

/** Decorative accent circle with an icon. Not interactive: wrap it in a button or link if needed. */
export default function IconCircle({ icon, variant = 'accent', className }: IconCircleProps) {
  const classes = [styles.circle, styles[variant], className].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
