import { useMemo, useState } from 'react';

import {
  canCalculateNutrition,
  emptyIngredientRow,
  emptyStepRow,
  formSnapshot,
  hasErrors,
  nutritionBaseline,
  NO_ERRORS,
  toRecipeData,
  validate,
} from '../lib/recipeForm';
import type { FormValues, IngredientRowValue, NutritionBaseline } from '../lib/recipeForm';
import type { Recipe } from '../types/recipe';

type TextField = 'title' | 'description' | 'servings' | 'prepTime' | 'cookTime';

/** Values, validation, errors and dirty state of the recipe form. Used by both the edit and the add screens. */
export function useRecipeForm(initial: FormValues) {
  // The values the form started with: what "dirty" is measured against.
  const [initialValues] = useState(initial);
  const [values, setValues] = useState(initial);
  // Errors only show after the first failed save, then stay live as the user types.
  const [submitted, setSubmitted] = useState(false);
  // The recipe and nutrition values at load (when values exist) or at the last calculation. A recalculation starts from these.
  const [calcBaseline, setCalcBaseline] = useState<NutritionBaseline | null>(() =>
    nutritionBaseline(initial),
  );

  const errors = useMemo(() => (submitted ? validate(values) : NO_ERRORS), [submitted, values]);
  const dirty = useMemo(
    () => formSnapshot(values) !== formSnapshot(initialValues),
    [values, initialValues],
  );
  const canCalculate = useMemo(
    () => canCalculateNutrition(values, calcBaseline),
    [values, calcBaseline],
  );

  const setText = (field: TextField, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const setImage = (image: string | undefined) => setValues((current) => ({ ...current, image }));

  const updateIngredient = (key: string, patch: Partial<Omit<IngredientRowValue, 'key'>>) =>
    setValues((current) => ({
      ...current,
      ingredients: current.ingredients.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    }));

  /** Returns the key of the new row, so the caller can focus it. */
  const addIngredient = (): string => {
    const row = emptyIngredientRow();
    setValues((current) => ({ ...current, ingredients: [...current.ingredients, row] }));
    return row.key;
  };

  const removeIngredient = (key: string) =>
    setValues((current) => ({
      ...current,
      ingredients: current.ingredients.filter((row) => row.key !== key),
    }));

  const updateStep = (key: string, text: string) =>
    setValues((current) => ({
      ...current,
      steps: current.steps.map((step) => (step.key === key ? { ...step, text } : step)),
    }));

  const addStep = (): string => {
    const step = emptyStepRow();
    setValues((current) => ({ ...current, steps: [...current.steps, step] }));
    return step.key;
  };

  const removeStep = (key: string) =>
    setValues((current) => ({ ...current, steps: current.steps.filter((step) => step.key !== key) }));

  /** Stores a calculation result. It counts as a change, and the baseline becomes the values it was calculated from. */
  const setNutrition = (baseline: NutritionBaseline) => {
    setValues((current) => ({ ...current, nutritionalInfo: baseline.nutritionalInfo }));
    setCalcBaseline(baseline);
  };

  /** Turns on live validation. Returns the recipe to save, or null when something is invalid. */
  const submit = (): Omit<Recipe, 'id'> | null => {
    setSubmitted(true);
    if (hasErrors(validate(values))) return null;
    return toRecipeData(values);
  };

  return {
    values,
    errors,
    submitted,
    dirty,
    canCalculate,
    baseline: calcBaseline,
    setText,
    setImage,
    updateIngredient,
    addIngredient,
    removeIngredient,
    updateStep,
    addStep,
    removeStep,
    setNutrition,
    submit,
  };
}
