import type { ComponentPropsWithRef } from 'react';

import { ChevronDownIcon } from '../../Icons/Icons';
import { controlClass } from '../Control/controlClass';
import type { ControlVariant } from '../Control/controlClass';
import styles from './Select.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  variant?: ControlVariant;
  options: SelectOption[];
  /** Shown while no option is chosen. Not selectable. */
  placeholder: string;
}

export default function Select({
  variant = 'box',
  options,
  placeholder,
  className,
  value,
  ...props
}: SelectProps) {
  const empty = value === '';
  const classes = controlClass(variant, `${styles.select} ${empty ? styles.empty : ''} ${className ?? ''}`);

  return (
    <span className={`${styles.wrapper} ${styles[variant]}`}>
      <select className={classes} value={value} {...props}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className={styles.chevron} />
    </span>
  );
}
