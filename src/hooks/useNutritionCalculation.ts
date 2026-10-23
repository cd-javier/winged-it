import { useEffect, useRef, useState } from 'react';

import { ApiError, calculateNutrition } from '../lib/api';
import { completeIngredients, nonEmptySteps, nutritionSignature, parseServings } from '../lib/recipeForm';
import type { FormValues, NutritionBaseline } from '../lib/recipeForm';

interface UseNutritionCalculationOptions {
  values: FormValues;
  /** What the last calculation (or the loaded recipe) was based on. Sent as `previous` when the form already has nutrition values. */
  baseline: NutritionBaseline | null;
  /** Gets the new baseline: the values it was calculated from, plus the result. */
  onResult: (baseline: NutritionBaseline) => void;
}

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError';
}

/** Runs the nutrition estimate: loading state, cancel, and a friendly error message. */
export function useNutritionCalculation({ values, baseline, onResult }: UseNutritionCalculationOptions) {
  const [calculating, setCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Aborts a request that is still running if the user leaves the page.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const start = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setErrorMessage(null);
    setCalculating(true);

    // Captured now, so the baseline matches what was sent even if the user edits while waiting.
    const ingredients = completeIngredients(values);
    const steps = nonEmptySteps(values);
    const servings = parseServings(values.servings) ?? 1;
    const signature = nutritionSignature(values);
    // Only a recalculation (the form already shows values) sends the previous recipe.
    const previous =
      values.nutritionalInfo && baseline
        ? {
            ingredients: baseline.ingredients,
            steps: baseline.steps,
            servings: baseline.servings,
            nutritionalInfo: baseline.nutritionalInfo,
          }
        : undefined;
    try {
      const info = await calculateNutrition(ingredients, servings, steps, {
        signal: controller.signal,
        previous,
      });
      if (controller.signal.aborted) return;
      setCalculating(false);
      onResult({ signature, ingredients, steps, servings, nutritionalInfo: info });
    } catch (err) {
      // A cancelled request is not an error.
      if (isAbortError(err) || controller.signal.aborted) return;
      setCalculating(false);
      setErrorMessage(err instanceof ApiError ? err.message : new ApiError('generic').message);
    }
  };

  /** Stops the request and closes the loading dialog. Nothing is lost, so there is nothing to confirm. */
  const cancel = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setCalculating(false);
  };

  const dismissError = () => setErrorMessage(null);

  return { calculating, errorMessage, start, cancel, dismissError };
}
