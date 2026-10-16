import type { ReactNode } from 'react';

import IconCircle from '../IconCircle/IconCircle';
import styles from './MenuItem.module.css';

interface MenuItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export default function MenuItem({ icon, title, description, onClick }: MenuItemProps) {
  return (
    <button type="button" className={styles.item} onClick={onClick}>
      <IconCircle icon={icon} />
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
      </span>
    </button>
  );
}
