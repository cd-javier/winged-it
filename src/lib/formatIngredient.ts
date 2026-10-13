import type { Ingredient, IngredientUnit } from '../types/recipe';

const ATTACHED_UNITS: IngredientUnit[] = ['g', 'kg', 'ml', 'l'];
const SPACED_UNITS: IngredientUnit[] = ['tsp', 'tbsp'];

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const FRACTIONS: Record<number, string> = {
  0.25: '¼',
  0.5: '½',
  0.75: '¾',
};

function formatQuantity(quantity: number): string {
  const whole = Math.floor(quantity);
  const fraction = FRACTIONS[Math.round((quantity - whole) * 100) / 100];
  if (!fraction) {
    return `${quantity}`;
  }
  return whole === 0 ? fraction : `${whole}${fraction}`;
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

  const formattedQuantity = formatQuantity(quantity);

  if (unit === 'whole') {
    return `${capitalize(name)}, ${formattedQuantity} (whole)`;
  }

  if (ATTACHED_UNITS.includes(unit)) {
    return `${capitalize(name)}, ${formattedQuantity}${unit}`;
  }

  if (SPACED_UNITS.includes(unit)) {
    return `${capitalize(name)}, ${formattedQuantity} ${unit}`;
  }

  // pinch / clove / slice / sprig
  const countUnit = quantity === 1 ? unit : `${unit}s`;
  return `${formattedQuantity} ${countUnit} ${name}`;
}
