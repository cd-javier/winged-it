import { useEffect, useRef, useState } from 'react';

import { ApiError, calculateNutrition } from '../lib/api';
import { completeIngredients, nonEmptySteps, nutritionSignature, parseServings } from '../lib/recipeForm';
import type { FormValues } from '../lib/recipeForm';
import type { NutritionalInfo } from '../types/recipe';

interface UseNutritionCalculationOptions {
  values: FormValues;
  /** Gets the result and the signature of the values it was calculated from. */
  onResult: (info: NutritionalInfo, signature: string) => void;
}

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError';
}

/** Runs the nutrition estimate: loading state, cancel, and a friendly error message. */
export function useNutritionCalculation({ values, onResult }: UseNutritionCalculationOptions) {
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

    const signature = nutritionSignature(values);
    try {
      const info = await calculateNutrition(
        completeIngredients(values),
        parseServings(values.servings) ?? 1,
        nonEmptySteps(values),
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      setCalculating(false);
      onResult(info, signature);
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
