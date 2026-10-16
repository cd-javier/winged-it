import { useEffect, useState } from 'react';

import { createPhraseSequence } from '../lib/loadingPhrases';

export const TYPING_INTERVAL_MS = 50;
export const HOLD_MS = 2000;

const DOTS = '...';

/**
 * Types each loading phrase one character at a time (dots included), holds it,
 * then moves to the next. With reduced motion the full phrase appears at once.
 * `full` is the whole phrase with dots, used to reserve space and avoid layout shift.
 */
export function useTypewriter() {
  const [full, setFull] = useState('');
  const [typed, setTyped] = useState('');

  useEffect(() => {
    const nextPhrase = createPhraseSequence();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer: number | undefined;

    const showPhrase = () => {
      const phrase = nextPhrase() + DOTS;
      setFull(phrase);

      if (reducedMotion) {
        setTyped(phrase);
        timer = window.setTimeout(showPhrase, HOLD_MS);
        return;
      }

      setTyped('');
      let length = 0;
      const typeNext = () => {
        length += 1;
        setTyped(phrase.slice(0, length));
        timer = window.setTimeout(length < phrase.length ? typeNext : showPhrase, length < phrase.length ? TYPING_INTERVAL_MS : HOLD_MS);
      };
      timer = window.setTimeout(typeNext, TYPING_INTERVAL_MS);
    };

    showPhrase();

    // Runs on unmount, which is when the call finishes, is cancelled or is discarded.
    return () => window.clearTimeout(timer);
  }, []);

  return { typed, full };
}
