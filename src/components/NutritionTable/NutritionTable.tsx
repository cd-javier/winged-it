import type { NutritionalInfo } from '../../types/recipe';
import styles from './NutritionTable.module.css';

interface NutritionTableProps {
  nutritionalInfo: NutritionalInfo;
  /** The "calculated approximately" caption. The edit form shows its own note instead. */
  showCaption?: boolean;
}

export default function NutritionTable({
  nutritionalInfo,
  showCaption = true,
}: NutritionTableProps) {
  const rows = [
    { label: 'Energy', value: `${nutritionalInfo.calories}kcal` },
    { label: 'Protein', value: `${nutritionalInfo.protein}g` },
    { label: 'Carbs', value: `${nutritionalInfo.carbs}g` },
    { label: 'Fat', value: `${nutritionalInfo.fat}g` },
    { label: 'Fibre', value: `${nutritionalInfo.fiber}g` },
  ];

  return (
    <table className={styles.table}>
      {showCaption && (
        <caption className={styles.note}>
          All the nutritional information is calculated approximately per serving
        </caption>
      )}
      <tbody>
        {rows.map(({ label, value }) => (
          <tr key={label} className={styles.row}>
            <th scope="row" className={styles.label}>
              {label}
            </th>
            <td className={styles.value}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
