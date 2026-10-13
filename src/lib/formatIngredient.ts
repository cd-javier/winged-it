import type { Ingredient, IngredientUnit } from '../types/recipe';

const ATTACHED_UNITS: IngredientUnit[] = ['g', 'kg', 'ml', 'l'];
const SPACED_UNITS: IngredientUnit[] = ['tsp', 'tbsp'];

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Formats an ingredient for display, e.g.
 * "Basmati rice, 60g", "Olive oil, 1 tbsp", "Red onion, 1 (whole)",
 * "2 cloves garlic", "Salt (to taste)".
 */
export function formatIngredient({ item, quantity, unit }: Ingredient): string {
  const name = item.trim();

  if (quantity === 0) {
    return `${capitalize(name)} (to taste)`;
  }

  if (unit === 'whole') {
    return `${capitalize(name)}, ${quantity} (whole)`;
  }

  if (ATTACHED_UNITS.includes(unit)) {
    return `${capitalize(name)}, ${quantity}${unit}`;
  }

  if (SPACED_UNITS.includes(unit)) {
    return `${capitalize(name)}, ${quantity} ${unit}`;
  }

  // pinch / clove / slice / sprig
  const countUnit = quantity === 1 ? unit : `${unit}s`;
  return `${quantity} ${countUnit} ${name}`;
}
