import { formatIngredient } from '../../lib/formatIngredient';
import type { Ingredient } from '../../types/recipe';
import styles from './IngredientList.module.css';

interface IngredientListProps {
  ingredients: Ingredient[];
}

export default function IngredientList({ ingredients }: IngredientListProps) {
  return (
    // role="list" keeps list semantics in Safari, which drops them when list-style is none.
    <ul className={styles.list} role="list">
      {ingredients.map((ingredient, index) => (
        <li key={index} className={styles.row}>
          {formatIngredient(ingredient)}
        </li>
      ))}
    </ul>
  );
}
