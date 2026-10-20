import { useId } from 'react';

import { countWords, MIN_WORDS } from '../../lib/wordCount';
import Button from '../Button/Button';
import Field from '../Form/Field/Field';
import TextArea from '../Form/TextArea/TextArea';
import styles from './RecipeInput.module.css';

interface RecipeInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function RecipeInput({ text, onTextChange, onBack, onContinue }: RecipeInputProps) {
  // useId gives the counter an id so the textarea can point at it.
  const counterId = useId();
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

      <Field label="What did you cook?" hideLabel describedBy={counterId} className={styles.field}>
        {(controlProps) => (
          <>
            <TextArea
              {...controlProps}
              className={styles.textarea}
              placeholder="I chopped the onions..."
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
            />
            <p
              id={counterId}
              className={enough ? `${styles.counter} ${styles.enough}` : styles.counter}
            >
              {words}/{MIN_WORDS} words
            </p>
          </>
        )}
      </Field>

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
