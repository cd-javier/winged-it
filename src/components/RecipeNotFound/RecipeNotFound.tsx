import { Link } from 'react-router-dom';

import styles from './RecipeNotFound.module.css';

export default function RecipeNotFound() {
  return (
    <section className={styles.notFound}>
      <p>Recipe not found</p>
      <Link to="/">Back to home</Link>
    </section>
  );
}
