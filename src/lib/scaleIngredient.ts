import type { Ingredient, IngredientUnit } from '../types/recipe';

const WHOLE_UNITS: IngredientUnit[] = ['g', 'ml'];
const QUARTER_UNITS: IngredientUnit[] = ['tsp', 'tbsp', 'whole', 'clove', 'slice', 'sprig', 'pinch'];

/**
 * Scales an ingredient from the recipe's servings to the servings on screen. The result is
 * rounded to something formatIngredient can show, and a non-zero quantity never rounds to 0.
 * At the original servings the ingredient is returned untouched.
 */
export function scaleIngredient(
  ingredient: Ingredient,
  originalServings: number,
  currentServings: number,
): Ingredient {
  // 0 means "to taste", so it stays 0.
  if (ingredient.quantity === 0 || currentServings === originalServings) {
    return ingredient;
  }

  const scaled = (ingredient.quantity * currentServings) / originalServings;
  const { unit } = ingredient;

  let quantity: number;
  if (WHOLE_UNITS.includes(unit)) {
    quantity = Math.max(1, Math.round(scaled));
  } else if (QUARTER_UNITS.includes(unit)) {
    quantity = Math.max(0.25, Math.round(scaled * 4) / 4);
  } else {
    // kg and l: two decimals, because formatIngredient only turns quarters into fractions.
    quantity = Math.max(0.01, Math.round(scaled * 100) / 100);
  }

  return { ...ingredient, quantity };
}
