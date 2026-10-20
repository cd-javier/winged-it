// Dev only: loaded by src/lib/api.ts when VITE_MOCK_API is 'true'. Never part of the production bundle.
import type {
  GenerateQuestionsResult,
  Ingredient,
  NutritionalInfo,
  QuestionAnswer,
  Recipe,
} from '../types/recipe';
import { ApiError } from './api';

const MOCK_DELAY_MS = 6000;

type Scenario = 'success' | 'unusable' | 'rateLimit' | 'network' | 'generic' | 'recipeError';

interface RequestOptions {
  signal?: AbortSignal;
}

// Read on every call, so it can be changed from the console without reloading.
function getScenario(): Scenario {
  return (localStorage.getItem('mockScenario') as Scenario | null) ?? 'success';
}

function wait(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => new DOMException('The operation was aborted.', 'AbortError');
    if (signal?.aborted) {
      reject(abort());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abort());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, MOCK_DELAY_MS);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export async function generateQuestions(
  _text: string,
  { signal }: RequestOptions = {},
): Promise<GenerateQuestionsResult> {
  await wait(signal);
  const scenario = getScenario();

  if (scenario === 'rateLimit' || scenario === 'network' || scenario === 'generic') {
    throw new ApiError(scenario);
  }
  if (scenario === 'unusable') {
    return {
      usable: false,
      reason: "This doesn't describe any cooking steps yet, just a list of ingredients.",
      questions: [],
    };
  }

  return {
    usable: true,
    reason: '',
    questions: [
      { id: 'q1', category: 'quantity', question: 'How many chicken breasts did you use?' },
      { id: 'q2', category: 'quantity', question: 'Roughly how much oil did you fry the onion in?' },
      { id: 'q3', category: 'timing', question: 'How long did the sauce simmer for?' },
      { id: 'q4', category: 'servings', question: 'How many people did it serve?' },
    ],
  };
}

export async function generateRecipe(
  _text: string,
  _answers: QuestionAnswer[],
  { signal }: RequestOptions = {},
): Promise<Omit<Recipe, 'id'>> {
  await wait(signal);
  if (getScenario() === 'recipeError') {
    throw new ApiError('generic');
  }

  return {
    title: 'Slow-simmered garlic and tomato chicken with fresh basil and a splash of cream',
    description:
      'A comforting one-pan chicken dish with soft onions, plenty of garlic and a rich tomato sauce that thickens as it simmers. Finished with cream and torn basil, and best served with rice or crusty bread to mop up every last bit of the sauce.',
    servings: 4,
    summary: {
      prepTime: 15,
      cookTime: 45,
      nutritionalInfo: { calories: 420, protein: 38, carbs: 14, fat: 24, fiber: 3 },
    },
    ingredients: [
      { item: 'chicken breast', quantity: 4, unit: 'whole' },
      { item: 'onion, finely chopped', quantity: 1, unit: 'whole' },
      { item: 'garlic, crushed', quantity: 4, unit: 'clove' },
      { item: 'olive oil', quantity: 2, unit: 'tbsp' },
      { item: 'chopped tomatoes', quantity: 400, unit: 'g' },
      { item: 'chicken stock', quantity: 250, unit: 'ml' },
      { item: 'double cream', quantity: 100, unit: 'ml' },
      { item: 'smoked paprika', quantity: 1, unit: 'tsp' },
      { item: 'fresh basil', quantity: 1, unit: 'sprig' },
      { item: 'salt and black pepper', quantity: 0, unit: 'pinch' },
    ],
    steps: [
      'Preheat the oven to 180°C.',
      'Season the chicken with salt, pepper and the smoked paprika.',
      'Heat the oil in a large ovenproof pan and brown the chicken for 3 minutes on each side. Set aside.',
      'Fry the onion in the same pan for 8 minutes until soft, then add the garlic and cook for 1 minute.',
      'Add the tomatoes and stock, then bring to a simmer and cook for 10 minutes.',
      'Return the chicken to the pan, cover and bake for 20 minutes.',
      'Stir in the cream, taste for salt and scatter over the torn basil before serving.',
    ],
  };
}

export async function calculateNutrition(
  ingredients: Ingredient[],
  _servings: number,
  _steps: string[],
  { signal }: RequestOptions = {},
): Promise<NutritionalInfo> {
  await wait(signal);
  const scenario = getScenario();
  if (scenario === 'rateLimit' || scenario === 'network' || scenario === 'generic') {
    throw new ApiError(scenario);
  }

  // Already rounded (calories to a multiple of 5, whole grams), and varying with the ingredient count so a recalculation visibly changes.
  const count = ingredients.length;
  return {
    calories: 150 + count * 30,
    protein: 8 + count * 2,
    carbs: 20 + count * 3,
    fat: 6 + count * 2,
    fiber: 2 + count,
  };
}
