import type { Ingredient, IngredientUnit, NutritionalInfo, NutritionPrevious, Recipe } from '../types/recipe';

/** The units offered in the unit picker, in display order. The check below fails to compile if one is missing from the IngredientUnit union. */
export const INGREDIENT_UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'tsp',
  'tbsp',
  'pinch',
  'clove',
  'slice',
  'sprig',
  'whole',
] as const satisfies readonly IngredientUnit[];

type MissingUnit = Exclude<IngredientUnit, (typeof INGREDIENT_UNITS)[number]>;
const allUnitsListed: MissingUnit extends never ? true : never = true;
void allUnitsListed;

export interface IngredientRowValue {
  key: string;
  item: string;
  /** As typed, so a comma or a half-typed number is kept. */
  quantity: string;
  unit: IngredientUnit | '';
}

export interface StepRowValue {
  key: string;
  text: string;
}

/** Numbers stay strings while editing and are parsed on save. */
export interface FormValues {
  /** A resized photo as a data URL. */
  image?: string;
  title: string;
  description: string;
  servings: string;
  prepTime: string;
  cookTime: string;
  ingredients: IngredientRowValue[];
  steps: StepRowValue[];
  nutritionalInfo?: NutritionalInfo;
}

/** Which controls of an ingredient row are invalid. */
export interface RowErrors {
  item: boolean;
  quantity: boolean;
  unit: boolean;
}

export interface FormErrors {
  title?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  /** Message under the Ingredients heading. */
  ingredients?: string;
  /** Invalid ingredient rows by row key. */
  ingredientRows: Record<string, RowErrors>;
  /** Message under the Steps heading. */
  steps?: string;
  /** Invalid step rows by row key. */
  stepRows: Record<string, true>;
}

export const NO_ERRORS: FormErrors = { ingredientRows: {}, stepRows: {} };

// A plain counter, not crypto.randomUUID(), which throws on a non-secure origin such as a phone on the local network.
let lastRowKey = 0;
export function newRowKey(): string {
  lastRowKey += 1;
  return `row-${lastRowKey}`;
}

export function emptyIngredientRow(): IngredientRowValue {
  return { key: newRowKey(), item: '', quantity: '', unit: '' };
}

export function emptyStepRow(): StepRowValue {
  return { key: newRowKey(), text: '' };
}

export function emptyFormValues(): FormValues {
  return {
    title: '',
    description: '',
    servings: '1',
    prepTime: '0',
    cookTime: '0',
    ingredients: [emptyIngredientRow()],
    steps: [emptyStepRow()],
  };
}

export function valuesFromRecipe(recipe: Recipe): FormValues {
  return {
    image: recipe.image,
    title: recipe.title,
    description: recipe.description,
    servings: String(recipe.servings),
    prepTime: String(recipe.summary.prepTime),
    cookTime: String(recipe.summary.cookTime),
    ingredients: recipe.ingredients.map(({ item, quantity, unit }) => ({
      key: newRowKey(),
      item,
      quantity: String(quantity),
      unit,
    })),
    steps: recipe.steps.map((text) => ({ key: newRowKey(), text })),
    nutritionalInfo: recipe.summary.nutritionalInfo,
  };
}

function parseInteger(text: string, min: number, max: number): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value >= min && value <= max ? value : null;
}

/** Non-numeric and negative quantities are invalid. Blank counts as 0, and 0 means "to taste". A comma works as the decimal separator. */
export function parseQuantity(text: string): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed === '') return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function parseServings(text: string): number | null {
  return parseInteger(text, 1, 99);
}

function isEmptyIngredientRow(row: IngredientRowValue): boolean {
  return row.item.trim() === '' && row.quantity.trim() === '' && row.unit === '';
}

function isCompleteIngredientRow(row: IngredientRowValue): boolean {
  return row.item.trim() !== '' && parseQuantity(row.quantity) !== null && row.unit !== '';
}

/** The complete rows only, parsed. Empty and partly filled rows are left out. */
export function completeIngredients(values: FormValues): Ingredient[] {
  return values.ingredients.flatMap((row) => {
    const quantity = parseQuantity(row.quantity);
    if (row.item.trim() === '' || quantity === null || row.unit === '') return [];
    return [{ item: row.item.trim(), quantity, unit: row.unit }];
  });
}

export function nonEmptySteps(values: FormValues): string[] {
  return values.steps.map((step) => step.text.trim()).filter(Boolean);
}

export function validate(values: FormValues): FormErrors {
  const errors: FormErrors = { ingredientRows: {}, stepRows: {} };

  if (values.title.trim() === '') errors.title = 'Add a title';
  if (parseServings(values.servings) === null) {
    errors.servings = 'Enter a whole number from 1 to 99';
  }
  if (parseInteger(values.prepTime, 0, 999) === null) {
    errors.prepTime = 'Enter a whole number from 0 to 999';
  }
  if (parseInteger(values.cookTime, 0, 999) === null) {
    errors.cookTime = 'Enter a whole number from 0 to 999';
  }

  // Ingredients: empty rows are ignored, partly filled rows are errors on the controls that are blank or invalid.
  let hasPartialRow = false;
  for (const row of values.ingredients) {
    if (isEmptyIngredientRow(row) || isCompleteIngredientRow(row)) continue;
    hasPartialRow = true;
    errors.ingredientRows[row.key] = {
      item: row.item.trim() === '',
      quantity: parseQuantity(row.quantity) === null,
      unit: row.unit === '',
    };
  }
  if (hasPartialRow) {
    errors.ingredients = 'Complete each ingredient or remove it';
  } else if (completeIngredients(values).length === 0) {
    errors.ingredients = 'Add at least one ingredient';
    // Every row is empty, so mark the first one to give focus somewhere to land.
    const first = values.ingredients[0];
    if (first) errors.ingredientRows[first.key] = { item: true, quantity: false, unit: false };
  }

  if (nonEmptySteps(values).length === 0) {
    errors.steps = 'Add at least one step';
    const first = values.steps[0];
    if (first) errors.stepRows[first.key] = true;
  }

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Boolean(
    errors.title ||
      errors.servings ||
      errors.prepTime ||
      errors.cookTime ||
      errors.ingredients ||
      errors.steps,
  );
}

/** Builds the recipe to save. Only call it when `validate` found no errors. */
export function toRecipeData(values: FormValues): Omit<Recipe, 'id'> {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    servings: parseServings(values.servings) ?? 1,
    summary: {
      prepTime: parseInteger(values.prepTime, 0, 999) ?? 0,
      cookTime: parseInteger(values.cookTime, 0, 999) ?? 0,
      ...(values.nutritionalInfo && { nutritionalInfo: values.nutritionalInfo }),
    },
    ingredients: completeIngredients(values),
    steps: nonEmptySteps(values),
    ...(values.image && { image: values.image }),
  };
}

/** What the nutrition estimate depends on. Compared as a string to tell whether anything changed. */
export function nutritionSignature(values: FormValues): string {
  return JSON.stringify({
    ingredients: completeIngredients(values),
    steps: nonEmptySteps(values),
    servings: parseServings(values.servings),
  });
}

/** Everything the user can change, without the row keys, as typed. Compared as a string to tell whether the form is dirty. */
export function formSnapshot(values: FormValues): string {
  return JSON.stringify({
    image: values.image,
    title: values.title,
    description: values.description,
    servings: values.servings,
    prepTime: values.prepTime,
    cookTime: values.cookTime,
    ingredients: values.ingredients.map(({ item, quantity, unit }) => ({ item, quantity, unit })),
    steps: values.steps.map(({ text }) => text),
    nutritionalInfo: values.nutritionalInfo,
  });
}

/** The recipe and nutrition values at load or at the last calculation, plus their signature. */
export interface NutritionBaseline extends NutritionPrevious {
  signature: string;
}

/** The baseline for values that already have nutrition, or null when they have none (or the servings do not parse). */
export function nutritionBaseline(values: FormValues): NutritionBaseline | null {
  const servings = parseServings(values.servings);
  if (!values.nutritionalInfo || servings === null) return null;
  return {
    signature: nutritionSignature(values),
    ingredients: completeIngredients(values),
    steps: nonEmptySteps(values),
    servings,
    nutritionalInfo: values.nutritionalInfo,
  };
}

/**
 * Whether "calculate" is enabled. The recipe needs a complete ingredient, a step and valid servings. When nutrition values already exist, something the estimate depends on must also differ from the baseline (the values at load or at the last calculation).
 */
export function canCalculateNutrition(values: FormValues, baseline: NutritionBaseline | null): boolean {
  const ready =
    completeIngredients(values).length > 0 &&
    nonEmptySteps(values).length > 0 &&
    parseServings(values.servings) !== null;
  if (!ready) return false;
  if (!values.nutritionalInfo) return true;
  return nutritionSignature(values) !== baseline?.signature;
}
