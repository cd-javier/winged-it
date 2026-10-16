import type { ReactNode } from 'react';

import Logo from '../Logo/Logo';
import styles from './RecipeHero.module.css';

interface RecipeHeroProps {
  image?: string;
  /** The back button, shown top left. */
  start: ReactNode;
  /** The options button, shown top right. */
  end: ReactNode;
}

export default function RecipeHero({ image, start, end }: RecipeHeroProps) {
  return (
    <div className={styles.hero}>
      {image ? (
        // Empty alt: the title below the image already names the recipe.
        <img className={styles.image} src={image} alt="" />
      ) : (
        <div className={styles.placeholder} aria-hidden="true">
          <Logo centred className={styles.logo} />
        </div>
      )}
      <div className={`${styles.control} ${styles.start}`}>{start}</div>
      <div className={`${styles.control} ${styles.end}`}>{end}</div>
    </div>
  );
}
