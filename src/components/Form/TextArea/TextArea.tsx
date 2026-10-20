import type { ComponentPropsWithoutRef } from 'react';

import { controlClass } from '../Control/controlClass';
import type { ControlVariant } from '../Control/controlClass';
import styles from './TextArea.module.css';

interface TextAreaProps extends ComponentPropsWithoutRef<'textarea'> {
  variant?: ControlVariant;
  /** Grows with its content instead of scrolling. Needs a string `value`. The `className` then goes on the wrapper, so size limits can be set on it. */
  autoGrow?: boolean;
}

export default function TextArea({
  variant = 'box',
  autoGrow,
  className,
  ...props
}: TextAreaProps) {
  if (!autoGrow) {
    return <textarea className={controlClass(variant, `${styles.fixed} ${className ?? ''}`)} {...props} />;
  }

  // The wrapper's ::after repeats the text invisibly in the same grid cell, so the cell is as tall as the text and the textarea stretches to fill it. This grows the textarea without measuring or inline styles.
  return (
    <div
      className={[
        styles.grow,
        variant === 'underline' ? styles.growUnderline : styles.growBox,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-value={String(props.value ?? '')}
    >
      <textarea
        rows={1}
        className={controlClass(variant, styles.growing)}
        {...props}
      />
    </div>
  );
}
