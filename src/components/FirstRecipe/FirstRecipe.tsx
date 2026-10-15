import IconCircle from '../IconCircle/IconCircle';
import { PlusIcon } from '../Icons/Icons';
import styles from './FirstRecipe.module.css';

interface FirstRecipeProps {
  onClick: () => void;
}

export default function FirstRecipe({ onClick }: FirstRecipeProps) {
  return (
    <button type="button" className={styles.row} onClick={onClick}>
      <IconCircle icon={<PlusIcon />} />
      <span>add your first recipe</span>
    </button>
  );
}
