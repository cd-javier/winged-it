import { useId } from 'react';

import Button from '../Button/Button';
import SegmentedProgress from '../SegmentedProgress/SegmentedProgress';
import styles from './RecipeQuestions.module.css';

interface RecipeQuestionsProps {
  question: string;
  /** Position of the current question, starting at 0. */
  index: number;
  total: number;
  answer: string;
  onAnswerChange: (answer: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
}

export default function RecipeQuestions({
  question,
  index,
  total,
  answer,
  onAnswerChange,
  onBack,
  onSkip,
  onContinue,
}: RecipeQuestionsProps) {
  // useId links the question heading to the textarea.
  const questionId = useId();

  return (
    <section className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>Let's clarify</h1>
        <p className={styles.subtitle}>
          Answer these few questions to help us create the most accurate recipe
        </p>
      </header>

      <SegmentedProgress
        current={index + 1}
        total={total}
        label={`Question ${index + 1} of ${total}`}
      />

      <h2 id={questionId} className={styles.question}>
        {question}
      </h2>

      <textarea
        className={styles.textarea}
        placeholder="Type your answer here"
        value={answer}
        onChange={(event) => onAnswerChange(event.target.value)}
        aria-labelledby={questionId}
      />

      <div className={styles.actions}>
        <div className={styles.row}>
          <Button variant="outline" onClick={onBack}>
            back
          </Button>
          <Button variant="outline" onClick={onSkip}>
            skip
          </Button>
        </div>
        <Button variant="primary" fullWidth onClick={onContinue}>
          continue
        </Button>
      </div>
    </section>
  );
}
