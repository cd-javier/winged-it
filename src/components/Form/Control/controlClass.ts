import styles from './Control.module.css';

export type ControlVariant = 'box' | 'underline';

/** Class names for the shared control look, plus an optional extra class from the caller. */
export function controlClass(variant: ControlVariant, className?: string) {
  return [styles.control, styles[variant], className].filter(Boolean).join(' ');
}
