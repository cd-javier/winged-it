import IconButton from '../IconButton/IconButton';
import { CutleryIcon, MinusIcon, PlusIcon } from '../Icons/Icons';
import styles from './ServingsStepper.module.css';

export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 99;

interface ServingsStepperProps {
  servings: number;
  onChange: (servings: number) => void;
}

export default function ServingsStepper({ servings, onChange }: ServingsStepperProps) {
  return (
    <div role="group" aria-label="Servings" className={styles.stepper}>
      <IconButton
        icon={<MinusIcon />}
        label="decrease servings"
        variant="muted"
        size="sm"
        disabled={servings <= MIN_SERVINGS}
        onClick={() => onChange(servings - 1)}
      />
      <span className={styles.value} aria-live="polite">
        <CutleryIcon className={styles.icon} />
        Servings: {servings}
      </span>
      <IconButton
        icon={<PlusIcon />}
        label="increase servings"
        variant="muted"
        size="sm"
        disabled={servings >= MAX_SERVINGS}
        onClick={() => onChange(servings + 1)}
      />
    </div>
  );
}
