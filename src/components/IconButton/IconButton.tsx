import type { ButtonHTMLAttributes, ReactNode } from 'react';

import IconCircle from '../IconCircle/IconCircle';
import type { IconCircleSize, IconCircleVariant } from '../IconCircle/IconCircle';
import styles from './IconButton.module.css';

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  icon: ReactNode;
  /** Accessible name, since the button has no visible text. */
  label: string;
  variant?: IconCircleVariant;
  size?: IconCircleSize;
}

export default function IconButton({
  icon,
  label,
  variant,
  size,
  type = 'button',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={className ? `${styles.button} ${className}` : styles.button}
      {...props}
    >
      <IconCircle icon={icon} variant={variant} size={size} />
    </button>
  );
}
