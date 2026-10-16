import { useTypewriter } from '../../hooks/useTypewriter';
import Button from '../Button/Button';
import Loader from '../Loader/Loader';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  onCancel: () => void;
}

export default function LoadingScreen({ onCancel }: LoadingScreenProps) {
  const { typed, full } = useTypewriter();

  return (
    <section className={styles.screen} role="status" aria-label="Loading">
      <div className={styles.centre}>
        <Loader className={styles.loader} />
        <p className={styles.message}>This might take a minute</p>
        {/* The hidden full phrase reserves the width and height, so typing never shifts the layout. */}
        <p className={styles.phrase} aria-hidden="true">
          <span className={styles.reserve}>{full}</span>
          <span className={styles.typed}>{typed}</span>
        </p>
      </div>
      <Button variant="outline" fullWidth onClick={onCancel}>
        cancel
      </Button>
    </section>
  );
}
