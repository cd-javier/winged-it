import { useId } from 'react';
import type { ReactNode } from 'react';

import styles from './Field.module.css';

/** What a control needs from its Field so the label, hint and error are linked to it. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

interface FieldProps {
  label: string;
  /** Keeps the label for screen readers only. */
  hideLabel?: boolean;
  /** `small` is the 12px label with a 4px gap used by the number fields. */
  size?: 'default' | 'small';
  hint?: string;
  /** Message shown between the label and the control. */
  error?: string;
  /** Marks the control invalid without a message of its own (for example a row that shows its error on the card). */
  invalid?: boolean;
  /** Ids of other elements that describe the control, such as a section error. */
  describedBy?: string;
  className?: string;
  children: (controlProps: FieldControlProps) => ReactNode;
}

export default function Field({
  label,
  hideLabel,
  size = 'default',
  hint,
  error,
  invalid,
  describedBy,
  className,
  children,
}: FieldProps) {
  // useId gives each field unique ids to link the label, hint and error to the control.
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedByIds = [hint ? hintId : '', error ? errorId : '', describedBy ?? '']
    .filter(Boolean)
    .join(' ');

  const rootClasses = [styles.field, size === 'small' ? styles.small : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
      {children({
        id,
        'aria-describedby': describedByIds || undefined,
        'aria-invalid': error || invalid ? true : undefined,
      })}
    </div>
  );
}
