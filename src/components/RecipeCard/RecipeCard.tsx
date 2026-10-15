import { Link } from 'react-router-dom';

import { ClockIcon, KnifeIcon, PotIcon } from '../Icons/Icons';
import Logo from '../Logo/Logo';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
  title: string;
  description: string;
  /** Minutes. */
  prepTime: number;
  /** Minutes. */
  cookTime: number;
  image?: string;
  to: string;
}

export default function RecipeCard({
  title,
  description,
  prepTime,
  cookTime,
  image,
  to,
}: RecipeCardProps) {
  const times = [
    { label: 'Total time', minutes: prepTime + cookTime, icon: <ClockIcon /> },
    { label: 'Prep time', minutes: prepTime, icon: <KnifeIcon /> },
    { label: 'Cook time', minutes: cookTime, icon: <PotIcon /> },
  ];

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {image ? (
          // Empty alt: the title next to the image already names the recipe.
          <img className={styles.image} src={image} alt="" />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            <Logo centred className={styles.logo} />
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>
          {/* The ::after on this link stretches over the whole card, so the card is one click target. */}
          <Link to={to} className={styles.link}>
            {title}
          </Link>
        </h3>
        <p className={styles.description}>{description}</p>
        <ul className={styles.times} role="list">
          {times.map(({ label, minutes, icon }) => (
            <li key={label} className={styles.time}>
              {icon}
              <span className={styles.visuallyHidden}>{label}: </span>
              {minutes}min
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
