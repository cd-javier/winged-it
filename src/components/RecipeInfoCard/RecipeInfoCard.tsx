import { ClockIcon, KnifeIcon, PotIcon } from '../Icons/Icons';
import ServingsStepper from '../ServingsStepper/ServingsStepper';
import styles from './RecipeInfoCard.module.css';

interface RecipeInfoCardProps {
  /** Minutes. */
  prepTime: number;
  /** Minutes. */
  cookTime: number;
  servings: number;
  onServingsChange: (servings: number) => void;
}

export default function RecipeInfoCard({
  prepTime,
  cookTime,
  servings,
  onServingsChange,
}: RecipeInfoCardProps) {
  const times = [
    { label: 'Total', minutes: prepTime + cookTime, icon: <ClockIcon /> },
    { label: 'Prep', minutes: prepTime, icon: <KnifeIcon /> },
    { label: 'Cook', minutes: cookTime, icon: <PotIcon /> },
  ];

  return (
    <div className={styles.card}>
      <ul className={styles.times} role="list">
        {times.map(({ label, minutes, icon }) => (
          <li key={label} className={styles.time}>
            {icon}
            {label}: {minutes} min
          </li>
        ))}
      </ul>
      <ServingsStepper servings={servings} onChange={onServingsChange} />
    </div>
  );
}
