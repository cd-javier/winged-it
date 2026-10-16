import { useId } from 'react';

import { countWords, MIN_WORDS } from '../../lib/wordCount';
import Button from '../Button/Button';
import styles from './RecipeInput.module.css';

interface RecipeInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function RecipeInput({ text, onTextChange, onBack, onContinue }: RecipeInputProps) {
  // useId links the label and the counter to the textarea.
  const id = useId();
  const counterId = `${id}-counter`;
  const words = countWords(text);
  const enough = words >= MIN_WORDS;

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Wing it</h1>
        <p className={styles.subtitle}>
          Type what you did using your own words in as much detail as possible.
        </p>
      </header>

      <div className={styles.field}>
        <label htmlFor={id} className="visually-hidden">
          What did you cook?
        </label>
        <textarea
          id={id}
          className={styles.textarea}
          placeholder="I chopped the onions..."
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          aria-describedby={counterId}
        />
        <p id={counterId} className={enough ? `${styles.counter} ${styles.enough}` : styles.counter}>
          {words}/{MIN_WORDS} words
        </p>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={onBack}>
          back
        </Button>
        <Button variant="primary" onClick={onContinue} disabled={!enough}>
          continue
        </Button>
      </div>
    </section>
  );
}
