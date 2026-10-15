import { useId } from 'react';
import type { ReactNode } from 'react';

import styles from './RecipeSection.module.css';

interface RecipeSectionProps {
  title: string;
  children: ReactNode;
}

export default function RecipeSection({ title, children }: RecipeSectionProps) {
  // useId gives a unique id so the section is named by its heading for screen readers.
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}
