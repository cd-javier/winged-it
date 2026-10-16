// Without the trailing dots: the typewriter adds them.
export const FIRST_PHRASE = 'Sourcing ingredients';

export const LOADING_PHRASES = [
  'Sourcing ingredients',
  'Crushing garlic',
  'Preheating the oven',
  'Chopping onions',
  'Checking the pantry',
  'Warming the pan',
  'Peeling potatoes',
  'Zesting a lemon',
  'Sharpening the knives',
  'Stirring the pot',
  'Tasting for salt',
  'Reducing the sauce',
  'Finding the good spoon',
  'Tidying the kitchen',
  'Guessing the heat',
  'Wiping down the counter',
  'Boiling the kettle',
  'Salting the water',
  'Toasting the spices',
  'Whisking the eggs',
  'Rinsing the rice',
  'Grating the cheese',
  'Chopping the herbs',
  'Setting the timer',
  'Plating up',
  'Filling in the gaps',
];

// Fisher-Yates shuffle on a copy.
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Returns a function that gives the next phrase each call. The first is always
 * FIRST_PHRASE, then a shuffled order with no repeats until the list is used up,
 * then a new shuffle.
 */
export function createPhraseSequence(): () => string {
  let queue: string[] = [];
  let started = false;
  let last = '';

  return () => {
    if (!started) {
      started = true;
      queue = shuffle(LOADING_PHRASES.filter((phrase) => phrase !== FIRST_PHRASE));
      last = FIRST_PHRASE;
      return last;
    }
    if (queue.length === 0) {
      queue = shuffle(LOADING_PHRASES);
      // Avoid showing the same phrase twice in a row across a reshuffle.
      if (queue[0] === last) queue.push(queue.shift()!);
    }
    last = queue.shift()!;
    return last;
  };
}
