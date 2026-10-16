import type { ReactNode } from 'react';

import styles from './IconCircle.module.css';

export type IconCircleVariant = 'accent' | 'warning' | 'error' | 'overlay' | 'muted';
export type IconCircleSize = 'md' | 'compact' | 'sm';

interface IconCircleProps {
  icon: ReactNode;
  variant?: IconCircleVariant;
  size?: IconCircleSize;
  className?: string;
}

/** Decorative accent circle with an icon. Not interactive: wrap it in a button or link if needed. */
export default function IconCircle({
  icon,
  variant = 'accent',
  size = 'md',
  className,
}: IconCircleProps) {
  const classes = [styles.circle, styles[variant], size === 'md' ? '' : styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classes}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
