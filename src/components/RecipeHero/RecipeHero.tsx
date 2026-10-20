import type { ReactNode } from 'react';

import Logo from '../Logo/Logo';
import styles from './RecipeHero.module.css';

interface RecipeHeroProps {
  image?: string;
  /** The back button, shown top left. */
  start?: ReactNode;
  /** The options button, shown top right. */
  end?: ReactNode;
  /** Controls centred over the image, as in the photo field of the recipe form. */
  centre?: ReactNode;
}

export default function RecipeHero({ image, start, end, centre }: RecipeHeroProps) {
  return (
    <div
      className={[styles.hero, start || end ? styles.shaded : '', centre ? styles.dimmed : '']
        .filter(Boolean)
        .join(' ')}
    >
      {image ? (
        // Empty alt: the title below the image already names the recipe.
        <img className={styles.image} src={image} alt="" />
      ) : (
        <div className={styles.placeholder} aria-hidden="true">
          <Logo centred className={styles.logo} />
        </div>
      )}
      {start && <div className={`${styles.control} ${styles.start}`}>{start}</div>}
      {end && <div className={`${styles.control} ${styles.end}`}>{end}</div>}
      {centre && <div className={styles.centre}>{centre}</div>}
    </div>
  );
}
